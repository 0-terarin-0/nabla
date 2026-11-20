"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  CircleMarker,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { FeatureCollection } from "geojson";
import { toBlob } from "html-to-image";
import { Camera, Loader2 } from "lucide-react";
import { saveFile } from "@/lib/backend";
import {
  COLORS,
  formatDeclination,
  magneticNorthLine,
  parseDispersionKml,
  triangleSvg,
  type LatLng,
  type NorthWindPoint,
} from "@/lib/dispersion";
import { DispersionLegend, NorthIndicator } from "@/components/DispersionLegend";

// Fix Leaflet's default icon path issues in React/Webpack environments
let blueDotIcon: L.DivIcon | undefined;
let redDotIcon: L.DivIcon | undefined;
let northTrajIcon: L.DivIcon | undefined;
let northParaIcon: L.DivIcon | undefined;
let mnLabelIcon: L.DivIcon | undefined;

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

  const triangleIcon = (fill: string) =>
    L.divIcon({
      className: "bg-transparent",
      html: triangleSvg(fill, 18),
      iconSize: [18, 18],
      iconAnchor: [9, 16],
    });
  northTrajIcon = triangleIcon(COLORS.northWindTraj);
  northParaIcon = triangleIcon(COLORS.northWindPara);

  mnLabelIcon = L.divIcon({
    className: "bg-transparent",
    html: `<div style="transform:translate(-50%,-100%);white-space:nowrap;font:700 13px system-ui,sans-serif;color:#111827;background:${COLORS.magneticNorth};padding:2px 6px;border-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,.4)">MN</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 4],
  });
}

const GSI_ATTRIBUTION =
  '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noreferrer">国土地理院</a>';

// Base maps. The first entry is selected by default.
// GSI tiles allow CORS, so screenshots via html-to-image work.
const BASE_LAYERS = [
  {
    name: "地理院 写真",
    url: "https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg",
    attribution: GSI_ATTRIBUTION,
    maxNativeZoom: 18,
  },
  {
    name: "地理院 標準地図",
    url: "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
    attribution: GSI_ATTRIBUTION,
    maxNativeZoom: 18,
  },
  {
    name: "地理院 淡色地図",
    url: "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",
    attribution: GSI_ATTRIBUTION,
    maxNativeZoom: 18,
  },
  {
    name: "Esri World Imagery",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri",
    maxNativeZoom: 19,
  },
] as const;

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

export interface MapViewerProps {
  kmlData: Record<string, string>;
  launchPos?: [number, number] | null;
  launchRadius?: number;
  safetyArea?: [number, number][];
  ignitionPos?: [number, number] | null;
  ignitionRadius?: number;
  northWindPoints?: NorthWindPoint[];
  northWindPointsTraj?: NorthWindPoint[];
  /** Magnetic declination [deg], negative = west. */
  magDec?: number | null;
  /** Total impulse of the thrust curve [N·s]. */
  totalImpulse?: number | null;
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
  magDec,
  totalImpulse,
}: MapViewerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const dispersion = useMemo(() => parseDispersionKml(kmlData), [kmlData]);
  const {
    trajectory: trajectoryFeatures,
    parachute: parachuteFeatures,
    all: allFeatures,
    legend: legendData,
    landingPoints,
  } = dispersion;

  const mnLine = useMemo(() => {
    if (!launchPos || magDec == null || legendData.length === 0) return null;
    return magneticNorthLine(launchPos, magDec, landingPoints.map((p) => p.pos));
  }, [launchPos, magDec, landingPoints, legendData.length]);

  const toLatLng = (p: NorthWindPoint): LatLng => [p.lat, p.lon];

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
        pixelRatio: Math.max(window.devicePixelRatio || 1, 3),
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
        <div className="absolute bottom-6 left-6 z-[1000] pointer-events-auto">
          <DispersionLegend
            legend={legendData}
            speedStep={dispersion.speedStep}
            directionCount={dispersion.directionCount}
            magDec={magDec}
            hasNorthTraj={(northWindPointsTraj?.length ?? 0) > 0}
            hasNorthPara={(northWindPoints?.length ?? 0) > 0}
            totalImpulse={totalImpulse}
          />
        </div>
      )}

      {magDec != null && (
        <div className="absolute bottom-6 right-6 z-[1000] pointer-events-none">
          <NorthIndicator magDec={magDec} />
        </div>
      )}

      <MapContainer
        center={ignitionPos || launchPos || defaultCenter}
        zoom={13}
        className="w-full h-full absolute inset-0"
        zoomControl={true}
      >
        <LayersControl position="topright">
          {BASE_LAYERS.map((b, idx) => (
            <LayersControl.BaseLayer key={b.name} name={b.name} checked={idx === 0}>
              <TileLayer
                attribution={b.attribution}
                url={b.url}
                maxNativeZoom={b.maxNativeZoom}
                maxZoom={19}
                crossOrigin="anonymous"
              />
            </LayersControl.BaseLayer>
          ))}

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
                {landingPoints
                  .filter((p) => !p.isParachute)
                  .map((p, idx) => (
                    <CircleMarker
                      key={`traj-pt-${idx}`}
                      center={p.pos}
                      radius={3}
                      pathOptions={{ color: "#ffffff", weight: 1, fillColor: p.color, fillOpacity: 1 }}
                    >
                      <Tooltip>Trajectory landing — wind {p.speed.toFixed(1)} m/s</Tooltip>
                    </CircleMarker>
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
                {landingPoints
                  .filter((p) => p.isParachute)
                  .map((p, idx) => (
                    <CircleMarker
                      key={`para-pt-${idx}`}
                      center={p.pos}
                      radius={3}
                      pathOptions={{ color: "#ffffff", weight: 1, fillColor: p.color, fillOpacity: 1 }}
                    >
                      <Tooltip>Parachute landing — wind {p.speed.toFixed(1)} m/s</Tooltip>
                    </CircleMarker>
                  ))}
              </FeatureGroup>
            </LayersControl.Overlay>
          )}
          
          {mnLine && (
            <LayersControl.Overlay checked name="Magnetic North">
              <FeatureGroup>
                <Polyline
                  positions={mnLine}
                  pathOptions={{ color: COLORS.magneticNorth, weight: 3, dashArray: "10, 6", opacity: 0.95 }}
                >
                  <Tooltip sticky className="font-sans font-bold text-slate-800 bg-white border-0 shadow-sm rounded-md px-2 py-1">
                    Magnetic north ({formatDeclination(magDec!)})
                  </Tooltip>
                </Polyline>
                {mnLabelIcon && <Marker position={mnLine[1]} icon={mnLabelIcon} interactive={false} />}
              </FeatureGroup>
            </LayersControl.Overlay>
          )}

          {northWindPointsTraj && northWindPointsTraj.length > 0 && (
            <LayersControl.Overlay checked name="Magnetic-N Wind (Trajectory)">
              <FeatureGroup>
                {northWindPointsTraj.map((p, idx) => (
                  <Marker key={idx} position={toLatLng(p)} icon={northTrajIcon} zIndexOffset={500}>
                    <Tooltip direction="top" opacity={0.9} className="font-sans font-bold text-slate-800 bg-white border-0 shadow-sm rounded-md px-2 py-1">
                      Wind from magnetic N, {p.wind_speed.toFixed(1)} m/s (trajectory)
                    </Tooltip>
                  </Marker>
                ))}
              </FeatureGroup>
            </LayersControl.Overlay>
          )}

          {northWindPoints && northWindPoints.length > 0 && (
            <LayersControl.Overlay checked name="Magnetic-N Wind (Parachute)">
              <FeatureGroup>
                {northWindPoints.map((p, idx) => (
                  <Marker key={idx} position={toLatLng(p)} icon={northParaIcon} zIndexOffset={500}>
                    <Tooltip direction="top" opacity={0.9} className="font-sans font-bold text-slate-800 bg-white border-0 shadow-sm rounded-md px-2 py-1">
                      Wind from magnetic N, {p.wind_speed.toFixed(1)} m/s (parachute)
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
