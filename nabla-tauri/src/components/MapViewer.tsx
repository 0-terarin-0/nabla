"use client";

import { useEffect, useMemo, useRef, useState, Fragment } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
  LayersControl,
  FeatureGroup,
  Marker,
  Tooltip,
  Polygon,
  Circle,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { kml } from "@tmcw/togeojson";
import L from "leaflet";
import type { FeatureCollection } from "geojson";
import { toBlob } from "html-to-image";
import { Camera, Loader2 } from "lucide-react";
import { saveFile } from "@/lib/backend";

// Fix Leaflet's default icon path issues in React/Webpack environments
let blueDotIcon: L.DivIcon | undefined;
let redDotIcon: L.DivIcon | undefined;
let blueTriangleIcon: L.DivIcon | undefined;

let blackTriangleIcon: L.DivIcon | undefined;

if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });

  blueDotIcon = L.divIcon({
    className: "bg-transparent",
    html: `<div style="width: 12px; height: 12px; background-color: #3b82f6; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });

  redDotIcon = L.divIcon({
    className: "bg-transparent",
    html: `<div style="width: 12px; height: 12px; background-color: #ef4444; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });

  blueTriangleIcon = L.divIcon({
    className: "bg-transparent",
    html: `<div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 10px solid #22d3ee; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));"></div>`,
    iconSize: [12, 10],
    iconAnchor: [6, 10],
  });

  blackTriangleIcon = L.divIcon({
    className: "bg-transparent",
    html: `<div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 10px solid #000000; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));"></div>`,
    iconSize: [12, 10],
    iconAnchor: [6, 10],
  });
}

function MapBounds({ geoJsonData }: { geoJsonData: FeatureCollection[] }) {
  const map = useMap();

  useEffect(() => {
    if (geoJsonData.length === 0) return;

    try {
      const bounds = L.latLngBounds([]);
      geoJsonData.forEach((fc) => {
        const layer = L.geoJSON(fc);
        bounds.extend(layer.getBounds());
      });

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [30, 30] });
      }
    } catch (e) {
      console.error("Error setting map bounds", e);
    }
  }, [geoJsonData, map]);

  return null;
}

type LegendItem = {
  speedNum: number;
  speedStr: string;
  trajColor: string;
  paraColor: string;
};

export interface MapViewerProps {
  kmlData: Record<string, string>;
  launchPos?: [number, number] | null;
  launchRadius?: number;
  safetyArea?: [number, number][];
  ignitionPos?: [number, number] | null;
  ignitionRadius?: number;
  northWindPoints?: [number, number][];
  northWindPointsTraj?: [number, number][];
}

export default function MapViewer({
  kmlData,
  launchPos,
  launchRadius,
  safetyArea,
  ignitionPos,
  ignitionRadius,
  northWindPoints,
  northWindPointsTraj,
}: MapViewerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const { trajectoryFeatures, parachuteFeatures, allFeatures, legendData } =
    useMemo(() => {
      const trajectory: FeatureCollection[] = [];
      const parachute: FeatureCollection[] = [];
      const all: FeatureCollection[] = [];
      const legendMap = new Map<number, LegendItem>();

      if (typeof window === "undefined") {
        return {
          trajectoryFeatures: trajectory,
          parachuteFeatures: parachute,
          allFeatures: all,
          legendData: [],
        };
      }

      const parser = new DOMParser();

      for (const [filename, kmlString] of Object.entries(kmlData)) {
        if (!kmlString) continue;

        try {
          const doc = parser.parseFromString(kmlString, "text/xml");
          const converted = kml(doc) as FeatureCollection;
          const isParachute = filename.toLowerCase().includes("parachute");

          converted.features.forEach((f) => {
            if (!f.properties) f.properties = {};
            f.properties.sourceFile = filename;

            const color =
              f.properties.stroke || (isParachute ? "#ff4500" : "#00bfff");
            const name = f.properties.name || "";

            const match = name.match(/Wind\s+([\d\.]+)\s+m\/s/i);
            if (match) {
              const speedNum = parseFloat(match[1]);
              const speedStr = `${match[1]} m/s`;

              if (!legendMap.has(speedNum)) {
                legendMap.set(speedNum, {
                  speedNum,
                  speedStr,
                  trajColor: "#cccccc", 
                  paraColor: "#cccccc",
                });
              }

              const entry = legendMap.get(speedNum)!;
              if (isParachute) {
                entry.paraColor = color;
              } else {
                entry.trajColor = color;
              }
            }
          });

          converted.features.reverse();
          all.push(converted);

          if (isParachute) {
            parachute.push(converted);
          } else {
            trajectory.push(converted);
          }
        } catch (err) {
          console.error(`Failed to parse KML for ${filename}`, err);
        }
      }

      const sortedLegendData = Array.from(legendMap.values()).sort(
        (a, b) => a.speedNum - b.speedNum,
      );

      return {
        trajectoryFeatures: trajectory,
        parachuteFeatures: parachute,
        allFeatures: all,
        legendData: sortedLegendData,
      };
    }, [kmlData]);

  const defaultCenter: [number, number] = [34.2852, 135.09059];

  const onEachFeature = (feature: any, layer: L.Layer) => {
    if (feature.properties) {
      const name = feature.properties.name;
      const desc = feature.properties.description;
      if (name || desc) {
        let tooltipContent = `<div style="font-family: system-ui, -apple-system, sans-serif;">`;
        if (name)
          tooltipContent += `<strong style="font-size: 14px; color: #111;">${name}</strong>`;
        if (desc)
          tooltipContent += `<br/><span style="color: #4b5563; font-size: 12px; margin-top: 4px; display: inline-block;">${desc}</span>`;
        tooltipContent += `</div>`;
        layer.bindTooltip(tooltipContent, { sticky: true });
      }
    }
  };

  const getStyle = (feature: any) => {
    if (feature?.properties) {
      const isParachute = feature.properties.sourceFile?.includes("parachute");
      let color = feature.properties.stroke;

      if (!color) {
        color = isParachute ? "#ff4500" : "#00bfff";
      }

      return {
        color: color,
        weight: feature.properties["stroke-width"] || 2,
        opacity: feature.properties["stroke-opacity"] ?? 1.0,
        fill: false, 
      };
    }
    return { color: "#22d3ee", weight: 2, fill: false };
  };

  const [isCapturing, setIsCapturing] = useState(false);

  const handleScreenshot = async () => {
    const node = mapContainerRef.current;
    if (!node || isCapturing) return;
    setIsCapturing(true);
    try {
      const blob = await toBlob(node, {
        pixelRatio: Math.max(window.devicePixelRatio || 1, 2),
        backgroundColor: "#0f172a",
        // Return true to KEEP a node. Exclude UI controls from the image.
        filter: (n) =>
          !(
            n instanceof Element &&
            (n.classList.contains("no-screenshot") ||
              n.classList.contains("leaflet-control-zoom") ||
              n.classList.contains("leaflet-control-layers"))
          ),
      });
      if (!blob) throw new Error("Failed to render map image.");

      const ts = new Date().toISOString().replace(/[-:]/g, "").replace("T", "_").slice(0, 15);
      await saveFile(blob, `nabla_map_${ts}.png`, { name: "PNG Image", extensions: ["png"] });
    } catch (err) {
      console.error("Screenshot failed", err);
      alert(`Screenshot failed:\n${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div
      className="w-full h-full relative bg-slate-900"
      style={{ zIndex: 0 }}
      ref={mapContainerRef}
    >
      <div className="absolute top-4 left-14 z-[1000] no-screenshot">
        <button
          onClick={handleScreenshot}
          disabled={isCapturing}
          className="bg-white hover:bg-slate-50 text-slate-700 w-[34px] h-[34px] rounded-[4px] shadow-[0_1px_4px_rgba(0,0,0,0.3)] border-[2px] border-black/10 flex items-center justify-center transition-colors disabled:opacity-70 disabled:cursor-wait"
          title="Save Screenshot"
        >
          {isCapturing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
        </button>
      </div>

      {legendData.length > 0 && (
        <div className="absolute bottom-6 left-6 z-[1000] bg-white/95 p-4 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.2)] text-slate-800 font-sans pointer-events-auto border border-slate-200/60">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3.5 h-3.5 rounded-full bg-red-600 shadow-sm border border-red-700"></div>
            <span className="font-bold text-[15px] tracking-tight">
              Launch point
            </span>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-sm border border-blue-600"></div>
            <span className="font-bold text-[15px] tracking-tight">
              Ignition point
            </span>
          </div>

          <div className="grid grid-cols-[auto_auto_1fr] gap-x-4 gap-y-1.5 items-center">
            <div className="text-[10px] font-bold text-center text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-200">
              Traj.
            </div>
            <div className="text-[10px] font-bold text-center text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-200">
              Para.
            </div>
            <div className="text-[10px] font-bold text-left text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-200">
              Wind
            </div>

            {legendData.map((item) => (
              <Fragment key={item.speedStr}>
                <div className="flex items-center w-8" title="Trajectory">
                  <div className="h-[2px] flex-1" style={{ backgroundColor: item.trajColor }}></div>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.trajColor }}></div>
                  <div className="h-[2px] flex-1" style={{ backgroundColor: item.trajColor }}></div>
                </div>

                <div className="flex items-center w-8" title="Parachute">
                  <div className="h-[2px] flex-1" style={{ backgroundColor: item.paraColor }}></div>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.paraColor }}></div>
                  <div className="h-[2px] flex-1" style={{ backgroundColor: item.paraColor }}></div>
                </div>

                <div className="text-[14px] font-medium ml-1 tabular-nums">
                  {item.speedStr}
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      )}

      <MapContainer
        center={ignitionPos || launchPos || defaultCenter}
        zoom={13}
        className="w-full h-full absolute inset-0"
        zoomControl={true}
      >
        <TileLayer
          attribution="Tiles &copy; Esri &mdash; Source: Esri"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
          crossOrigin="anonymous"
        />

        <LayersControl position="topright">
          {safetyArea && safetyArea.length > 0 && (
            <LayersControl.Overlay checked name="Safety Area">
              <Polygon
                positions={safetyArea}
                pathOptions={{
                  color: "#000000",
                  fillColor: "#000000",
                  fillOpacity: 0.35,
                  weight: 2,
                  dashArray: "5, 5",
                }}
              >
                <Tooltip direction="top" opacity={0.9} sticky className="font-sans font-bold text-slate-800 bg-white border-0 shadow-sm rounded-md px-2 py-1">
                  Safety Area
                </Tooltip>
              </Polygon>
            </LayersControl.Overlay>
          )}

          {trajectoryFeatures.length > 0 && (
            <LayersControl.Overlay checked name="Trajectory Phase">
              <FeatureGroup>
                {trajectoryFeatures.map((data, idx) => (
                  <GeoJSON
                    key={`traj-${idx}`}
                    data={data}
                    onEachFeature={onEachFeature}
                    style={getStyle}
                  />
                ))}
              </FeatureGroup>
            </LayersControl.Overlay>
          )}

          {parachuteFeatures.length > 0 && (
            <LayersControl.Overlay checked name="Parachute Phase">
              <FeatureGroup>
                {parachuteFeatures.map((data, idx) => (
                  <GeoJSON
                    key={`para-${idx}`}
                    data={data}
                    onEachFeature={onEachFeature}
                    style={getStyle}
                  />
                ))}
              </FeatureGroup>
            </LayersControl.Overlay>
          )}
          
        {northWindPointsTraj && northWindPointsTraj.length > 0 && (
          <LayersControl.Overlay checked name="North Wind Points (Trajectory)">
            <FeatureGroup>
              {northWindPointsTraj.map((pos, idx) => (
                <Marker key={idx} position={pos} icon={blueTriangleIcon}>
                  <Tooltip direction="top" opacity={0.9} sticky className="font-sans font-bold text-slate-800 bg-white border-0 shadow-sm rounded-md px-2 py-1">
                    North Wind Landing (Parachute) (Trajectory)
                  </Tooltip>
                </Marker>
              ))}
            </FeatureGroup>
          </LayersControl.Overlay>
        )}

          {northWindPoints && northWindPoints.length > 0 && (
            <LayersControl.Overlay checked name="North Wind Points (Parachute)">
              <FeatureGroup>
                {northWindPoints.map((pos, idx) => (
                  <Marker key={idx} position={pos} icon={blackTriangleIcon}>
                    <Tooltip direction="top" opacity={0.9} sticky className="font-sans font-bold text-slate-800 bg-white border-0 shadow-sm rounded-md px-2 py-1">
                      North Wind Landing (Parachute)
                    </Tooltip>
                  </Marker>
                ))}
              </FeatureGroup>
            </LayersControl.Overlay>
          )}
        </LayersControl>

        <MapBounds geoJsonData={allFeatures} />

        {launchPos && launchRadius && launchRadius > 0 && (
          <Circle center={launchPos} radius={launchRadius} pathOptions={{ color: "#f97316", fillColor: "#f97316", fillOpacity: 0.15, weight: 2, dashArray: "4, 4" }}>
            <Tooltip direction="top" opacity={0.9} sticky className="font-sans font-bold text-orange-700 bg-white border-0 shadow-sm rounded-md px-2 py-1">
              Launch Area ({launchRadius}m)
            </Tooltip>
          </Circle>
        )}

        {ignitionPos && ignitionRadius && ignitionRadius > 0 && (
          <Circle center={ignitionPos} radius={ignitionRadius} pathOptions={{ color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.15, weight: 2, dashArray: "4, 4" }}>
            <Tooltip direction="top" opacity={0.9} sticky className="font-sans font-bold text-red-700 bg-white border-0 shadow-sm rounded-md px-2 py-1">
              Ignition Area ({ignitionRadius}m)
            </Tooltip>
          </Circle>
        )}

        {launchPos && redDotIcon && (
          <Marker position={launchPos} icon={redDotIcon}>
             <Tooltip direction="top" offset={[0, -8]} opacity={0.95} permanent className="font-sans font-bold text-slate-800 bg-white border-0 shadow-sm rounded-md px-2 py-1">
              Launch point
            </Tooltip>
          </Marker>
        )}
        
        {ignitionPos && blueDotIcon && (
          <Marker position={ignitionPos} icon={blueDotIcon}>
            <Tooltip direction="top" offset={[0, -8]} opacity={0.95} permanent className="font-sans font-bold text-slate-800 bg-white border-0 shadow-sm rounded-md px-2 py-1">
              Ignition point
            </Tooltip>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
