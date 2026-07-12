"use client";

import { LADDERS, fmt, type Measure } from "@/data/activities/year6Measurelands/metricLadders";

// The Metric Ladder — units as rungs (largest at the top). Step DOWN = ×, step UP
// = ÷, with the power of 10 shown on each step. Reusable conversion visual.
export function MeasurelandsMetricLadder({
  measure, fromU, toU, currentU, currentValue, size = 300,
}: {
  measure: Measure;
  fromU?: string;
  toU?: string;
  currentU?: string;
  currentValue?: number;
  size?: number;
}) {
  const rungs = LADDERS[measure];
  return (
    <div className="mx-auto flex flex-col items-stretch gap-0" style={{ maxWidth: size }}>
      {rungs.map((r, i) => {
        const isFrom = r.u === fromU, isTo = r.u === toU, isCur = r.u === currentU;
        const border = isCur ? "border-[#5b21b6]" : isTo ? "border-[#16a34a]" : isFrom ? "border-[#b45309]" : "border-[rgba(214,184,108,0.55)]";
        const bg = isCur ? "bg-[rgba(91,33,182,0.1)]" : isTo ? "bg-[rgba(22,163,74,0.08)]" : "bg-[#fffaf0]";
        return (
          <div key={r.u}>
            <div className={`flex items-center justify-between rounded-[16px] border-2 ${border} ${bg} px-4 py-2 shadow-sm`}>
              <span className="flex items-center gap-2">
                <span className="text-lg font-black text-[#2c1c07]">{r.u}</span>
                {isTo ? <span className="rounded-full bg-[#16a34a] px-2 py-0.5 text-[10px] font-black uppercase text-white">goal</span> : null}
              </span>
              {isCur && currentValue != null ? <span className="text-xl font-black tabular-nums text-[#5b21b6]">{fmt(currentValue)}</span> : null}
            </div>
            {i < rungs.length - 1 ? (
              <div className="flex items-center justify-center gap-6 py-0.5 text-[12px] font-black">
                <span className="text-[#0f766e]">↑ ÷{r.f}</span>
                <span className="text-[#b45309]">×{r.f} ↓</span>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
