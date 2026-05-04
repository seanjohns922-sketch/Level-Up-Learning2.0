"use client";

import { MathFormattedText } from "@/components/FractionText";
import type { OrderedPairBuilderVisualData } from "@/data/activities/year2/lessonEngine";

export default function OrderedPairBuilderVisual({
  visual,
}: {
  visual: OrderedPairBuilderVisualData;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">
        {visual.title}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
            Input (x)
          </div>
          <div className="mt-2 text-3xl font-black text-slate-900">
            <MathFormattedText text={visual.xValue} />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
            Output (y)
          </div>
          <div className="mt-2 text-3xl font-black text-slate-900">
            <MathFormattedText text={visual.yValue} />
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center rounded-2xl border border-cyan-300 bg-slate-900 px-4 py-4 text-3xl font-black text-cyan-200 shadow-sm shadow-cyan-200/50">
        <span>(</span>
        <span className="mx-2 rounded-full bg-cyan-400/15 px-4 py-2 text-white">
          <MathFormattedText text={visual.xValue} />
        </span>
        <span>,</span>
        <span className="mx-2 rounded-full bg-cyan-400/15 px-4 py-2 text-white">
          <MathFormattedText text={visual.yValue} />
        </span>
        <span>)</span>
      </div>
    </div>
  );
}
