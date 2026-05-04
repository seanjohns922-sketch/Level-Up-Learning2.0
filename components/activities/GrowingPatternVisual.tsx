"use client";

import type { GrowingPatternVisualData } from "@/data/activities/year2/lessonEngine";

function StageMarks({ count, style = "dots" }: { count: number; style?: "dots" | "tiles" }) {
  const tileClass =
    style === "tiles"
      ? "h-5 w-5 rounded-[6px] bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.25)]"
      : "h-4 w-4 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.25)]";

  return (
    <div className="mt-3 flex flex-wrap justify-center gap-2">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={tileClass} />
      ))}
    </div>
  );
}

export default function GrowingPatternVisual({
  visual,
}: {
  visual: GrowingPatternVisualData;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">
        {visual.title}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {visual.stages.map((stage, index) => (
          <div
            key={`${stage.label}-${stage.count}-${index}`}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-4 text-center shadow-sm"
          >
            <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
              {stage.label}
            </div>
            <StageMarks count={stage.count} style={stage.style} />
            <div className="mt-3 text-lg font-black text-slate-900">{stage.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
