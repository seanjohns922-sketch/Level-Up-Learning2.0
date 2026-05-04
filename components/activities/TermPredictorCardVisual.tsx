"use client";

import { MathFormattedText } from "@/components/FractionText";
import type { TermPredictorCardVisualData } from "@/data/activities/year2/lessonEngine";

export default function TermPredictorCardVisual({
  visual,
}: {
  visual: TermPredictorCardVisualData;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">
        {visual.title}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center shadow-sm">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
            Start
          </div>
          <div className="mt-2 text-3xl font-black text-slate-900">
            <MathFormattedText text={visual.start} />
          </div>
        </div>
        <div className="rounded-2xl border border-cyan-200 bg-slate-900 px-4 py-4 text-center shadow-sm">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-cyan-200">
            Rule
          </div>
          <div className="mt-2 text-2xl font-black text-white">
            <MathFormattedText text={visual.rule} />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center shadow-sm">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
            Find
          </div>
          <div className="mt-2 text-3xl font-black text-slate-900">
            <MathFormattedText text={visual.target} />
          </div>
        </div>
      </div>
    </div>
  );
}
