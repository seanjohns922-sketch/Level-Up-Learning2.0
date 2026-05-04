"use client";

import { MathFormattedText } from "@/components/FractionText";
import type { RuleBuilderCardVisualData } from "@/data/activities/year2/lessonEngine";

export default function RuleBuilderCardVisual({
  visual,
}: {
  visual: RuleBuilderCardVisualData;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">
        {visual.title}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 md:gap-3">
        {visual.terms.map((term, index) => (
          <div key={`${term}-${index}`} className="flex items-center gap-2 md:gap-3">
            <div className="min-w-[64px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm">
              <div className="text-2xl font-black text-slate-900">
                <MathFormattedText text={term} />
              </div>
            </div>
            {index < visual.terms.length - 1 ? (
              <div className="text-2xl font-black text-cyan-700">→</div>
            ) : null}
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-dashed border-cyan-300 bg-white px-4 py-4 shadow-sm">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
          {visual.promptLabel ?? "Rule"}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-black text-cyan-200">?</div>
          <div className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-black text-slate-500">
            each time
          </div>
        </div>
      </div>
    </div>
  );
}
