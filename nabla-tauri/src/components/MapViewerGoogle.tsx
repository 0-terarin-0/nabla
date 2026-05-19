"use client";

import { useEffect, useMemo, useRef, Fragment, useState } from "react";
import { APIProvider, Map, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { kml } from "@tmcw/togeojson";
import type { FeatureCollection } from "geojson";
import { Layers } from "lucide-react";

export interface MapViewerProps {
  kmlData: Record<string, string>;
  launchPos?: [number, number] | null;
  safetyArea?: [number, number][];
  apiKey: string;
}

type LegendItem = {
  speedNum: number;
  speedStr: string;
  trajColor: string;
  paraColor: string;
};

function GeoJsonLoader({
  geoJsonData,
  safetyArea,
  showTrajectory,
  showParachute,
  showSafetyArea,
}: {
  geoJsonData: FeatureCollection[];
  safetyArea?: [number, number][];
  showTrajectory: boolean;
  showParachute: boolean;
  showSafetyArea: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (
      !map ||
      typeof window === "undefined" ||
      !window.google ||
      !window.google.maps
    )
      return;

    map.data.forEach((feature) => map.data.remove(feature));

    if (geoJsonData.length === 0 && (!safetyArea || safetyArea.length === 0))
      return;

    const bounds = new window.google.maps.LatLngBounds();
    let hasData = false;

    // 1. Add Safety Area FIRST (Bottom layer)
    if (showSafetyArea && safetyArea && safetyArea.length > 0) {
      const safetyPoly = new window.google.maps.Data.Polygon([
        safetyArea.map(
          (coord) => new window.google.maps.LatLng(coord[0], coord[1]),
        ),
      ]);
      const safetyFeature = new window.google.maps.Data.Feature({
        geometry: safetyPoly,
        properties: {
          isSafetyArea: true,
          name: "Safety Area",
        },
      });
      map.data.add(safetyFeature);
      safetyArea.forEach((c) => {
        bounds.extend(new window.google.maps.LatLng(c[0], c[1]));
        hasData = true;
      });
    }

    // 2. Add Trajectory & Parachute GeoJSON on TOP
    geoJsonData.forEach((fc) => {
      const filteredFc = {
        ...fc,
        features: fc.features.filter((f) => {
          const sourceFile = f.properties?.sourceFile || "";
          const isPara = sourceFile.includes("parachute");
          if (isPara && !showParachute) return false;
          if (!isPara && !showTrajectory) return false;
          return true;
        }),
      };

      if (filteredFc.features.length > 0) {
        const features = map.data.addGeoJson(filteredFc);
        features.forEach((feature) => {
          const geom = feature.getGeometry();
          if (geom) {
            geom.forEachLatLng((latLng) => {
              bounds.extend(latLng);
              hasData = true;
            });
          }
        });
      }
    });

    // 3. Style the data layer
    map.data.setStyle((feature) => {
      if (feature.getProperty("isSafetyArea")) {
        return {
          fillColor: "#000000",
          fillOpacity: 0.35,
          strokeColor: "#000000",
          strokeWeight: 2,
          strokeOpacity: 0.8,
        };
      }

      const sourceFile = feature.getProperty("sourceFile") || "";
      const isParachute = String(sourceFile).includes("parachute");

      const rawColor = feature.getProperty("stroke");
      let color: string =
        typeof rawColor === "string"
          ? rawColor
          : isParachute
            ? "#ff4500"
            : "#00bfff";

      const rawOpacity = feature.getProperty("stroke-opacity");
      let opacity: number = typeof rawOpacity === "number" ? rawOpacity : 1.0;

      const rawWeight = feature.getProperty("stroke-width");
      let weight: number = typeof rawWeight === "number" ? rawWeight : 2;

      return {
        fillColor: color,
        fillOpacity: 0,
        strokeColor: color,
        strokeOpacity: opacity,
        strokeWeight: weight,
      };
    });

    const infoWindow = new window.google.maps.InfoWindow();
    map.data.addListener("mouseover", (event: any) => {
      const name = event.feature.getProperty("name");
      const desc = event.feature.getProperty("description");
      if (name || desc) {
        let content = `<div style="font-family: system-ui, -apple-system, sans-serif; padding: 4px;">`;
        if (name)
          content += `<strong style="font-size: 14px; color: #111;">${name}</strong>`;
        if (desc)
          content += `<br/><span style="color: #4b5563; font-size: 12px; margin-top: 4px; display: inline-block;">${desc}</span>`;
        content += `</div>`;

        infoWindow.setContent(content);
        infoWindow.setPosition(event.latLng);
        infoWindow.open(map);
      }
    });
    map.data.addListener("mouseout", () => {
      infoWindow.close();
    });

    if (hasData) {
      map.fitBounds(bounds, { bottom: 20, left: 20, right: 20, top: 20 });
    }
  }, [map, geoJsonData, safetyArea, showTrajectory, showParachute, showSafetyArea]);

  return null;
}

function LaunchMarker({ launchPos }: { launchPos: [number, number] }) {
  const map = useMap();
  const markerLib = useMapsLibrary("marker");

  useEffect(() => {
    if (!map || !markerLib) return;

    const pin = new markerLib.PinElement({
      background: "#dc2626",
      borderColor: "#ffffff",
      glyphColor: "#dc2626",
      scale: 0.8,
    });

    const newMarker = new markerLib.AdvancedMarkerElement({
      map,
      position: { lat: launchPos[0], lng: launchPos[1] },
      title: "Launch Point",
      content: pin.element,
    });

    return () => {
      newMarker.map = null;
    };
  }, [map, markerLib, launchPos]);

  return null;
}

function InnerMap({
  geoJsonFeatures,
  launchPos,
  safetyArea,
  showTrajectory,
  showParachute,
  showSafetyArea,
}: {
  geoJsonFeatures: FeatureCollection[];
  launchPos?: [number, number] | null;
  safetyArea?: [number, number][];
  showTrajectory: boolean;
  showParachute: boolean;
  showSafetyArea: boolean;
}) {
  const defaultCenter = { lat: 34.2852, lng: 135.09059 };

  return (
    <Map
      defaultCenter={defaultCenter}
      defaultZoom={13}
      mapTypeId="satellite"
      disableDefaultUI={false}
      className="w-full h-full"
      mapId="DEMO_MAP_ID"
    >
      <GeoJsonLoader
        geoJsonData={geoJsonFeatures}
        safetyArea={safetyArea}
        showTrajectory={showTrajectory}
        showParachute={showParachute}
        showSafetyArea={showSafetyArea}
      />
      {launchPos && <LaunchMarker launchPos={launchPos} />}
    </Map>
  );
}

export default function MapViewerGoogle({
  kmlData,
  launchPos,
  safetyArea,
  apiKey,
}: MapViewerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [showLayersMenu, setShowLayersMenu] = useState(false);
  
  const [showTrajectory, setShowTrajectory] = useState(true);
  const [showParachute, setShowParachute] = useState(true);
  const [showSafetyArea, setShowSafetyArea] = useState(true);

  const { allFeatures, legendData } = useMemo(() => {
    const all: FeatureCollection[] = [];
    const legendMap = new globalThis.Map<number, LegendItem>();

    if (typeof window === "undefined") {
      return { allFeatures: all, legendData: [] };
    }

    const parser = new DOMParser();

    for (const [filename, kmlString] of Object.entries(kmlData)) {
      if (!kmlString) continue;

      try {
        const doc = parser.parseFromString(kmlString, "text/xml");
        const converted = kml(doc) as FeatureCollection;
        const isParachute = String(filename).toLowerCase().includes("parachute");

        converted.features.forEach((f) => {
          if (!f.properties) f.properties = {};
          f.properties.sourceFile = filename;

          const rawColor = f.properties.stroke;
          const color =
            typeof rawColor === "string"
              ? rawColor
              : isParachute
                ? "#ff4500"
                : "#00bfff";
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
            if (isParachute) entry.paraColor = color;
            else entry.trajColor = color;
          }
        });

        converted.features.reverse();
        all.push(converted);
      } catch (err) {
        console.error(`Failed to parse KML`, err);
      }
    }

    const sortedLegendData = Array.from(legendMap.values()).sort(
      (a, b) => a.speedNum - b.speedNum,
    );
    return { allFeatures: all, legendData: sortedLegendData };
  }, [kmlData]);

  if (!apiKey) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-400">
        Please provide a valid Google Maps API Key in settings.
      </div>
    );
  }

  return (
    <div
      className="w-full h-full relative bg-slate-900"
      style={{ zIndex: 0 }}
      ref={mapContainerRef}
    >
      <div className="absolute inset-0 pointer-events-none z-[1000] flex flex-col justify-between">
        <div className="flex justify-end p-4">
          <div className="relative pointer-events-auto">
            <button
              onClick={() => setShowLayersMenu(!showLayersMenu)}
              className="bg-white hover:bg-slate-50 text-slate-700 w-10 h-10 rounded shadow-[0_1px_4px_rgba(0,0,0,0.3)] border border-black/10 flex items-center justify-center transition-colors"
              title="Layers"
            >
              <Layers className="w-5 h-5" />
            </button>

            {showLayersMenu && (
              <div className="absolute top-12 right-0 bg-white p-3 rounded-md shadow-lg border border-slate-200 text-sm font-sans w-48 text-slate-800">
                <div className="font-bold mb-2 pb-1 border-b border-slate-100">
                  Map Layers
                </div>
                <label className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={showTrajectory}
                    onChange={(e) => setShowTrajectory(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Trajectory Phase</span>
                </label>
                <label className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={showParachute}
                    onChange={(e) => setShowParachute(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Parachute Phase</span>
                </label>
                {safetyArea && safetyArea.length > 0 && (
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={showSafetyArea}
                      onChange={(e) => setShowSafetyArea(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Safety Area</span>
                  </label>
                )}
              </div>
            )}
          </div>
        </div>

        {legendData.length > 0 && (
          <div className="flex justify-start pb-6 pl-4">
            <div className="pointer-events-auto bg-white/95 p-4 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.2)] text-slate-800 font-sans border border-slate-200/60">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3.5 h-3.5 rounded-full bg-red-600 shadow-sm border border-red-700"></div>
                <span className="font-bold text-[15px] tracking-tight">
                  Launch point
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
                      <div
                        className="h-[2px] flex-1"
                        style={{ backgroundColor: item.trajColor }}
                      ></div>
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.trajColor }}
                      ></div>
                      <div
                        className="h-[2px] flex-1"
                        style={{ backgroundColor: item.trajColor }}
                      ></div>
                    </div>
                    <div className="flex items-center w-8" title="Parachute">
                      <div
                        className="h-[2px] flex-1"
                        style={{ backgroundColor: item.paraColor }}
                      ></div>
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.paraColor }}
                      ></div>
                      <div
                        className="h-[2px] flex-1"
                        style={{ backgroundColor: item.paraColor }}
                      ></div>
                    </div>
                    <div className="text-[14px] font-medium ml-1 tabular-nums">
                      {item.speedStr}
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <APIProvider apiKey={apiKey}>
        <InnerMap
          geoJsonFeatures={allFeatures}
          launchPos={launchPos}
          safetyArea={safetyArea}
          showTrajectory={showTrajectory}
          showParachute={showParachute}
          showSafetyArea={showSafetyArea}
        />
      </APIProvider>
    </div>
  );
}
