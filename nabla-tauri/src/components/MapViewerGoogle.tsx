"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { APIProvider, Map, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import type { FeatureCollection } from "geojson";
import { Layers } from "lucide-react";
import {
  COLORS,
  formatDeclination,
  magneticNorthLine,
  parseDispersionKml,
  triangleSvg,
  type LandingPoint,
  type LatLng,
  type NorthWindPoint,
} from "@/lib/dispersion";
import { DispersionLegend, NorthIndicator } from "@/components/DispersionLegend";

export interface MapViewerProps {
  kmlData: Record<string, string>;
  launchPos?: [number, number] | null;
  launchRadius?: number;
  safetyArea?: [number, number][];
  ignitionPos?: [number, number] | null;
  ignitionRadius?: number;
  northWindPoints?: NorthWindPoint[];
  northWindPointsTraj?: NorthWindPoint[];
  magDec?: number | null;
  totalImpulse?: number | null;
  apiKey: string;
}

// Custom hook to load GeoJSON onto the Google Map
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
          const isPara = String(sourceFile).includes("parachute");
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

function IgnitionMarker({ pos }: { pos: [number, number] }) {
  const map = useMap();
  const markerLib = useMapsLibrary("marker");

  useEffect(() => {
    if (!map || !markerLib) return;
    const pin = new markerLib.PinElement({
      background: "#3b82f6",
      borderColor: "#ffffff",
      glyphColor: "#3b82f6",
      scale: 0.8,
    });
    const newMarker = new markerLib.AdvancedMarkerElement({
      map,
      position: { lat: pos[0], lng: pos[1] },
      title: "Ignition Point",
      content: pin.element,
    });
    return () => { newMarker.map = null; };
  }, [map, markerLib, pos]);
  return null;
}

function NorthWindMarkers({
  pointsPara,
  pointsTraj,
  showParachute,
  showTrajectory,
}: {
  pointsPara?: NorthWindPoint[];
  pointsTraj?: NorthWindPoint[];
  showParachute: boolean;
  showTrajectory: boolean;
}) {
  const map = useMap();
  const markerLib = useMapsLibrary("marker");

  useEffect(() => {
    if (!map || !markerLib) return;
    const markers: google.maps.marker.AdvancedMarkerElement[] = [];

    const add = (points: NorthWindPoint[] | undefined, fill: string, phase: string) => {
      for (const p of points ?? []) {
        const el = document.createElement("div");
        el.innerHTML = triangleSvg(fill, 18);
        el.style.transform = "translateY(2px)";
        markers.push(
          new markerLib.AdvancedMarkerElement({
            map,
            position: { lat: p.lat, lng: p.lon },
            title: `Wind from magnetic N, ${p.wind_speed.toFixed(1)} m/s (${phase})`,
            content: el,
            zIndex: 500,
          }),
        );
      }
    };
    if (showParachute) add(pointsPara, COLORS.northWindPara, "parachute");
    if (showTrajectory) add(pointsTraj, COLORS.northWindTraj, "trajectory");

    return () => {
      markers.forEach((m) => (m.map = null));
    };
  }, [map, markerLib, pointsPara, pointsTraj, showParachute, showTrajectory]);
  return null;
}

function LandingDots({
  points,
  showParachute,
  showTrajectory,
}: {
  points: LandingPoint[];
  showParachute: boolean;
  showTrajectory: boolean;
}) {
  const map = useMap();
  useEffect(() => {
    if (!map || !window.google) return;
    const markers = points
      .filter((p) => (p.isParachute ? showParachute : showTrajectory))
      .map(
        (p) =>
          new window.google.maps.Marker({
            map,
            position: { lat: p.pos[0], lng: p.pos[1] },
            title: `${p.isParachute ? "Parachute" : "Trajectory"} landing — wind ${p.speed.toFixed(1)} m/s`,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 3.5,
              fillColor: p.color,
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 1,
            },
          }),
      );
    return () => markers.forEach((m) => m.setMap(null));
  }, [map, points, showParachute, showTrajectory]);
  return null;
}

function MagneticNorthLine({ line, magDec }: { line: [LatLng, LatLng]; magDec: number }) {
  const map = useMap();
  const markerLib = useMapsLibrary("marker");
  useEffect(() => {
    if (!map || !window.google || !markerLib) return;
    const path = line.map(([lat, lng]) => ({ lat, lng }));
    const polyline = new window.google.maps.Polyline({
      map,
      path,
      strokeOpacity: 0,
      icons: [
        {
          icon: { path: "M 0,-1 0,1", strokeOpacity: 1, strokeColor: COLORS.magneticNorth, strokeWeight: 3, scale: 3 },
          offset: "0",
          repeat: "16px",
        },
      ],
    });
    const label = document.createElement("div");
    label.textContent = "MN";
    label.title = `Magnetic north (${formatDeclination(magDec)})`;
    Object.assign(label.style, {
      font: "700 13px system-ui, sans-serif",
      color: "#111827",
      background: COLORS.magneticNorth,
      padding: "2px 6px",
      borderRadius: "4px",
      boxShadow: "0 1px 3px rgba(0,0,0,.4)",
    });
    const marker = new markerLib.AdvancedMarkerElement({ map, position: path[1], content: label });
    return () => {
      polyline.setMap(null);
      marker.map = null;
    };
  }, [map, markerLib, line, magDec]);
  return null;
}

function LaunchCircle({ center, radius }: { center: [number, number]; radius: number }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !window.google) return;
    if (radius <= 0) return;
    const circle = new window.google.maps.Circle({
      strokeColor: "#f97316",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#f97316",
      fillOpacity: 0.15,
      map,
      center: { lat: center[0], lng: center[1] },
      radius: radius,
    });
    return () => { circle.setMap(null); };
  }, [map, center, radius]);
  return null;
}

function IgnitionCircle({ center, radius }: { center: [number, number]; radius: number }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !window.google) return;
    if (radius <= 0) return;
    const circle = new window.google.maps.Circle({
      strokeColor: "#ef4444",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#ef4444",
      fillOpacity: 0.15,
      map,
      center: { lat: center[0], lng: center[1] },
      radius: radius,
    });
    return () => { circle.setMap(null); };
  }, [map, center, radius]);
  return null;
}

function InnerMap({
  geoJsonFeatures,
  launchPos,
  launchRadius,
  safetyArea,
  ignitionPos,
  ignitionRadius,
  northWindPoints,
  northWindPointsTraj,
  landingPoints,
  mnLine,
  magDec,
  showTrajectory,
  showParachute,
  showSafetyArea,
}: {
  geoJsonFeatures: FeatureCollection[];
  landingPoints: LandingPoint[];
  mnLine: [LatLng, LatLng] | null;
  magDec?: number | null;
  launchPos?: [number, number] | null;
  launchRadius?: number;
  safetyArea?: [number, number][];
  ignitionPos?: [number, number] | null;
  ignitionRadius?: number;
  northWindPoints?: NorthWindPoint[];
  northWindPointsTraj?: NorthWindPoint[];
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
      {launchPos && launchRadius && launchRadius > 0 && <LaunchCircle center={launchPos} radius={launchRadius} />}
      {ignitionPos && <IgnitionMarker pos={ignitionPos} />}
      {ignitionPos && ignitionRadius && ignitionRadius > 0 && <IgnitionCircle center={ignitionPos} radius={ignitionRadius} />}
      <LandingDots points={landingPoints} showParachute={showParachute} showTrajectory={showTrajectory} />
      {mnLine && magDec != null && <MagneticNorthLine line={mnLine} magDec={magDec} />}
      <NorthWindMarkers 
        pointsPara={northWindPoints} 
        pointsTraj={northWindPointsTraj} 
        showParachute={showParachute}
        showTrajectory={showTrajectory}
      />
    </Map>
  );
}

export default function MapViewerGoogle({
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
  apiKey,
}: MapViewerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [showLayersMenu, setShowLayersMenu] = useState(false);
  
  const [showTrajectory, setShowTrajectory] = useState(true);
  const [showParachute, setShowParachute] = useState(true);
  const [showSafetyArea, setShowSafetyArea] = useState(true);

  const dispersion = useMemo(() => parseDispersionKml(kmlData), [kmlData]);
  const { all: allFeatures, legend: legendData, landingPoints } = dispersion;

  const mnLine = useMemo(() => {
    if (!launchPos || magDec == null || legendData.length === 0) return null;
    return magneticNorthLine(launchPos, magDec, landingPoints.map((p) => p.pos));
  }, [launchPos, magDec, landingPoints, legendData.length]);

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
        
        {/* Top: Layers Control (No screenshot button for Google Maps to avoid CORS taint) */}
        <div className="flex justify-end p-4 pt-14 px-4 w-full">
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
                <div className="font-bold mb-2 pb-1 border-b border-slate-100">Map Layers</div>
                <label className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                  <input type="checkbox" checked={showTrajectory} onChange={(e) => setShowTrajectory(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                  <span>Trajectory Phase</span>
                </label>
                <label className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                  <input type="checkbox" checked={showParachute} onChange={(e) => setShowParachute(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                  <span>Parachute Phase</span>
                </label>
                {safetyArea && safetyArea.length > 0 && (
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                    <input type="checkbox" checked={showSafetyArea} onChange={(e) => setShowSafetyArea(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                    <span>Safety Area</span>
                  </label>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom: Legend (left) and north indicator (right) */}
        <div className="flex justify-between items-end pb-6 px-4">
          {legendData.length > 0 ? (
            <div className="pointer-events-auto">
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
          ) : (
            <div />
          )}
          {magDec != null && (
            <div className="mb-8 mr-12">
              <NorthIndicator magDec={magDec} />
            </div>
          )}
        </div>
      </div>

      <APIProvider apiKey={apiKey}>
        <InnerMap
          geoJsonFeatures={allFeatures}
          launchPos={launchPos}
          launchRadius={launchRadius}
          safetyArea={safetyArea}
          ignitionPos={ignitionPos}
          ignitionRadius={ignitionRadius}
          northWindPoints={northWindPoints}
          northWindPointsTraj={northWindPointsTraj}
          landingPoints={landingPoints}
          mnLine={mnLine}
          magDec={magDec}
          showTrajectory={showTrajectory}
          showParachute={showParachute}
          showSafetyArea={showSafetyArea}
        />
      </APIProvider>
    </div>
  );
}
