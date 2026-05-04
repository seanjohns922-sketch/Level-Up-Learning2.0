"use client";

import { MathFormattedText } from "@/components/FractionText";
import type { ReverseMachineCardVisualData } from "@/data/activities/year2/lessonEngine";

export default function ReverseMachineCardVisual({
  visual,
}: {
  visual: ReverseMachineCardVisualData;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50 p-4">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-orange-800">
        {visual.title}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center shadow-sm">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
            Input
          </div>
          <div className="mt-2 text-3xl font-black text-slate-900">?</div>
        </div>
        <div className="text-center text-2xl font-black text-orange-700 animate-pulse">→</div>
        <div className="rounded-2xl border border-orange-300 bg-slate-900 px-4 py-4 text-center shadow-sm shadow-orange-200/50">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-orange-200">
            Rule
          </div>
          <div className="mt-2 text-2xl font-black text-white">
            <MathFormattedText text={visual.rule} />
          </div>
        </div>
        <div className="text-center text-2xl font-black text-orange-700 animate-pulse">→</div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center shadow-sm">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
            Output
          </div>
          <div className="mt-2 text-3xl font-black text-slate-900">
            <MathFormattedText text={visual.output} />
          </div>
        </div>
      </div>
    </div>
  );
}
