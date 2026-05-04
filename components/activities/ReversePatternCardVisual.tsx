"use client";

import { MathFormattedText } from "@/components/FractionText";
import type { ReversePatternCardVisualData } from "@/data/activities/year2/lessonEngine";

export default function ReversePatternCardVisual({
  visual,
}: {
  visual: ReversePatternCardVisualData;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50 p-4">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-orange-800">
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
              <div className="text-2xl font-black text-orange-700">→</div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
