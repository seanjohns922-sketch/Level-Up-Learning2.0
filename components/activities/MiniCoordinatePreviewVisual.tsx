"use client";

import { MathFormattedText } from "@/components/FractionText";
import type { MiniCoordinatePreviewVisualData } from "@/data/activities/year2/lessonEngine";

export default function MiniCoordinatePreviewVisual({
  visual,
}: {
  visual: MiniCoordinatePreviewVisualData;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">
          {visual.title}
        </div>
        {visual.rule ? (
          <div className="rounded-full border border-cyan-300 bg-slate-900 px-3 py-1 text-xs font-black tracking-[0.14em] text-cyan-200">
            <MathFormattedText text={visual.rule} />
          </div>
        ) : null}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
            Table Row
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            x = <MathFormattedText text={visual.xValue} />
          </div>
          <div className="mt-1 text-2xl font-black text-slate-900">
            y = <MathFormattedText text={visual.yValue} />
          </div>
        </div>
        <div className="text-center text-2xl font-black text-cyan-700 animate-pulse">→</div>
        <div className="rounded-2xl border border-cyan-300 bg-slate-900 p-4 text-center shadow-sm shadow-cyan-200/50">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-cyan-200">
            Point
          </div>
          <div className="mt-2 text-3xl font-black text-white">
            (<MathFormattedText text={visual.xValue} />, <MathFormattedText text={visual.yValue} />)
          </div>
        </div>
      </div>
    </div>
  );
}
