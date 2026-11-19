"use client";

import { Fragment } from "react";
import { COLORS, formatDeclination, triangleSvg, type LegendItem } from "@/lib/dispersion";

function LineDot({ color }: { color: string }) {
  return (
    <div className="flex items-center w-8">
      <div className="h-[2px] flex-1" style={{ backgroundColor: color }} />
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
      <div className="h-[2px] flex-1" style={{ backgroundColor: color }} />
    </div>
  );
}

function Triangle({ fill }: { fill: string }) {
  return <span className="inline-block w-4 h-4" dangerouslySetInnerHTML={{ __html: triangleSvg(fill) }} />;
}

export interface DispersionLegendProps {
  legend: LegendItem[];
  speedStep: number | null;
  directionCount: number | null;
  magDec?: number | null;
  hasNorthTraj: boolean;
  hasNorthPara: boolean;
  totalImpulse?: number | null;
}

/** Legend for the landing dispersion map. */
export function DispersionLegend({
  legend,
  speedStep,
  directionCount,
  magDec,
  hasNorthTraj,
  hasNorthPara,
  totalImpulse,
}: DispersionLegendProps) {
  const header =
    "text-[10px] font-bold text-slate-500 uppercase tracking-widest pb-1 border-b border-slate-200";

  return (
    <div className="bg-white/95 p-4 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.2)] text-slate-800 font-sans border border-slate-200/60 max-w-[18rem]">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-3.5 h-3.5 rounded-full border border-white shadow-sm" style={{ backgroundColor: COLORS.launch }} />
        <span className="font-bold text-[14px]">Launch point</span>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-3.5 h-3.5 rounded-full border border-white shadow-sm" style={{ backgroundColor: COLORS.ignition }} />
        <span className="font-bold text-[14px]">Ignition point</span>
      </div>

      <div className="grid grid-cols-[auto_auto_1fr] gap-x-4 gap-y-1.5 items-center">
        <div className={`${header} text-center`}>Trajectory</div>
        <div className={`${header} text-center`}>Parachute</div>
        <div className={`${header} text-left`}>Wind speed</div>
        {legend.map((item) => (
          <Fragment key={item.speedStr}>
            <div className="flex justify-center"><LineDot color={item.trajColor} /></div>
            <div className="flex justify-center"><LineDot color={item.paraColor} /></div>
            <div className="text-[14px] font-semibold tabular-nums">{item.speedStr}</div>
          </Fragment>
        ))}
      </div>

      {(speedStep !== null || directionCount !== null) && (
        <div className="mt-2 text-[11px] leading-snug text-slate-600">
          Each ring = one wind speed
          {speedStep !== null && <> (every <b>{speedStep} m/s</b>)</>}
          {directionCount !== null && <>, {directionCount} wind directions</>}.
        </div>
      )}

      {(magDec != null || hasNorthTraj || hasNorthPara) && (
        <div className="mt-3 pt-2 border-t border-slate-200 space-y-1.5 text-[12px]">
          {magDec != null && (
            <div className="flex items-center gap-2">
              <svg width="32" height="6" className="shrink-0">
                <line x1="0" y1="3" x2="32" y2="3" stroke={COLORS.magneticNorth} strokeWidth="3" strokeDasharray="6 4" />
              </svg>
              <span>
                Magnetic north <span className="text-slate-500">({formatDeclination(magDec)})</span>
              </span>
            </div>
          )}
          {hasNorthTraj && (
            <div className="flex items-center gap-2">
              <span className="w-8 flex justify-center"><Triangle fill={COLORS.northWindTraj} /></span>
              <span>Wind from magnetic N (trajectory)</span>
            </div>
          )}
          {hasNorthPara && (
            <div className="flex items-center gap-2">
              <span className="w-8 flex justify-center"><Triangle fill={COLORS.northWindPara} /></span>
              <span>Wind from magnetic N (parachute)</span>
            </div>
          )}
        </div>
      )}

      {totalImpulse != null && totalImpulse > 0 && (
        <div className="mt-3 pt-2 border-t border-slate-200 text-[12px]">
          Total impulse: <b className="tabular-nums">{totalImpulse.toFixed(1)} N·s</b>
        </div>
      )}
    </div>
  );
}

/** Compass showing true north (map up) and magnetic north. */
export function NorthIndicator({ magDec }: { magDec: number }) {
  return (
    <div className="bg-white/95 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.2)] border border-slate-200/60 p-2 flex flex-col items-center font-sans text-slate-800">
      <svg width="72" height="72" viewBox="-36 -36 72 72">
        <circle r="33" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
        {/* True north */}
        <line x1="0" y1="24" x2="0" y2="-26" stroke="#334155" strokeWidth="2" />
        <polygon points="0,-30 -5,-20 5,-20" fill="#334155" />
        {/* Magnetic north */}
        <g transform={`rotate(${magDec})`}>
          <line x1="0" y1="24" x2="0" y2="-26" stroke={COLORS.magneticNorth} strokeWidth="3" strokeDasharray="5 3" />
          <polygon points="0,-32 -6,-20 6,-20" fill={COLORS.magneticNorth} stroke="#713f12" strokeWidth="1" />
        </g>
      </svg>
      <div className="text-[11px] leading-tight text-center mt-1">
        <div><b className="text-slate-700">N</b> true north (map up)</div>
        <div><b style={{ color: "#a16207" }}>MN</b> magnetic north</div>
        <div className="text-slate-500">Decl. {formatDeclination(magDec)}</div>
      </div>
    </div>
  );
}
