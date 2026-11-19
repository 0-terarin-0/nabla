// Helpers for drawing landing dispersion maps that follow the competition
// guidelines: every point/line labeled with its wind speed, and magnetic north
// clearly indicated.

import { kml } from "@tmcw/togeojson";
import type { FeatureCollection } from "geojson";

export type LatLng = [number, number];

/** Landing point for wind blowing from magnetic north. */
export interface NorthWindPoint {
  lat: number;
  lon: number;
  wind_speed: number;
}

export interface LegendItem {
  speedNum: number;
  speedStr: string;
  trajColor: string;
  paraColor: string;
}

/** A single landing point (polygon vertex) with the wind speed it belongs to. */
export interface LandingPoint {
  pos: LatLng;
  color: string;
  speed: number;
  isParachute: boolean;
}

export interface ParsedDispersion {
  trajectory: FeatureCollection[];
  parachute: FeatureCollection[];
  all: FeatureCollection[];
  legend: LegendItem[];
  landingPoints: LandingPoint[];
  /** Wind-speed step [m/s] (null when only one speed). */
  speedStep: number | null;
  /** Number of wind directions per speed (null for nominal runs). */
  directionCount: number | null;
}

export const COLORS = {
  launch: "#dc2626",
  ignition: "#3b82f6",
  magneticNorth: "#facc15",
  northWindTraj: "#22d3ee",
  northWindPara: "#111827",
} as const;

const DEFAULT_TRAJ = "#00bfff";
const DEFAULT_PARA = "#ff4500";

export function parseDispersionKml(kmlData: Record<string, string>): ParsedDispersion {
  const result: ParsedDispersion = {
    trajectory: [],
    parachute: [],
    all: [],
    legend: [],
    landingPoints: [],
    speedStep: null,
    directionCount: null,
  };
  if (typeof window === "undefined") return result;

  const parser = new DOMParser();
  const legendMap = new Map<number, LegendItem>();

  for (const [filename, kmlString] of Object.entries(kmlData)) {
    if (!kmlString) continue;
    try {
      const converted = kml(parser.parseFromString(kmlString, "text/xml")) as FeatureCollection;
      const isParachute = filename.toLowerCase().includes("parachute");
      // Magnetic-north line / markers embedded in the KML are drawn natively by the viewers.
      converted.features = converted.features.filter((f) => !f.properties?.annotation);

      for (const f of converted.features) {
        f.properties ??= {};
        f.properties.sourceFile = filename;
        const rawColor = f.properties.stroke;
        const color = typeof rawColor === "string" ? rawColor : isParachute ? DEFAULT_PARA : DEFAULT_TRAJ;

        const match = String(f.properties.name || "").match(/Wind\s+([\d.]+)\s+m\/s/i);
        if (!match) continue;
        const speedNum = parseFloat(match[1]);

        if (!legendMap.has(speedNum)) {
          legendMap.set(speedNum, {
            speedNum,
            speedStr: `${match[1]} m/s`,
            trajColor: "#cccccc",
            paraColor: "#cccccc",
          });
        }
        const entry = legendMap.get(speedNum)!;
        if (isParachute) entry.paraColor = color;
        else entry.trajColor = color;

        if (f.geometry?.type === "Polygon") {
          // Closed ring: last vertex duplicates the first.
          const ring = f.geometry.coordinates[0].slice(0, -1);
          result.directionCount = ring.length;
          for (const [lon, lat] of ring) {
            result.landingPoints.push({ pos: [lat, lon], color, speed: speedNum, isParachute });
          }
        }
      }

      converted.features.reverse();
      result.all.push(converted);
      (isParachute ? result.parachute : result.trajectory).push(converted);
    } catch (err) {
      console.error(`Failed to parse KML for ${filename}`, err);
    }
  }

  result.legend = Array.from(legendMap.values()).sort((a, b) => a.speedNum - b.speedNum);
  if (result.legend.length > 1) {
    result.speedStep = +(result.legend[1].speedNum - result.legend[0].speedNum).toFixed(2);
  }
  return result;
}

const EARTH_R = 6371008.8;

/** Destination point from `origin` along `bearingDeg` (clockwise from true north). */
export function destinationPoint(origin: LatLng, bearingDeg: number, distanceM: number): LatLng {
  const φ1 = (origin[0] * Math.PI) / 180;
  const λ1 = (origin[1] * Math.PI) / 180;
  const θ = (bearingDeg * Math.PI) / 180;
  const δ = distanceM / EARTH_R;
  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
  const λ2 =
    λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));
  return [(φ2 * 180) / Math.PI, (λ2 * 180) / Math.PI];
}

export function distanceM(a: LatLng, b: LatLng): number {
  const φ1 = (a[0] * Math.PI) / 180;
  const φ2 = (b[0] * Math.PI) / 180;
  const dφ = φ2 - φ1;
  const dλ = ((b[1] - a[1]) * Math.PI) / 180;
  const h = Math.sin(dφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.sqrt(h));
}

/**
 * Magnetic-north line from the launch point, long enough to reach past the
 * farthest landing point so it reads clearly against the dispersion rings.
 */
export function magneticNorthLine(
  launchPos: LatLng,
  magDec: number,
  points: LatLng[],
): [LatLng, LatLng] {
  const farthest = points.reduce((m, p) => Math.max(m, distanceM(launchPos, p)), 0);
  const length = Math.max(farthest * 1.15, 200);
  return [launchPos, destinationPoint(launchPos, magDec, length)];
}

/** "7.4° W" / "3.0° E" */
export function formatDeclination(magDec: number): string {
  return `${Math.abs(magDec).toFixed(1)}° ${magDec < 0 ? "W" : "E"}`;
}

/** SVG markup for a downward triangle marker (magnetic-north wind landing). */
export function triangleSvg(fill: string, size = 16): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 16 16" style="display:block;filter:drop-shadow(0 1px 2px rgba(0,0,0,.6))"><polygon points="1.5,2 14.5,2 8,14" fill="${fill}" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
}
