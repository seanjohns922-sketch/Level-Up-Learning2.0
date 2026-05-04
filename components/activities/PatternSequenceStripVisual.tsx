"use client";

import { MathFormattedText } from "@/components/FractionText";
import type { PatternSequenceStripVisualData } from "@/data/activities/year2/lessonEngine";

export default function PatternSequenceStripVisual({
  visual,
}: {
  visual: PatternSequenceStripVisualData;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">
        {visual.title}
      </div>
      <div className="mt-4 flex flex-wrap items-start gap-2 md:gap-3">
        {visual.terms.map((term, index) => (
          <div key={`${visual.title}-${term}-${index}`} className="flex items-start gap-2 md:gap-3">
            <div className="min-w-[64px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm">
              <div className="text-2xl font-black text-slate-900">
                <MathFormattedText text={term} />
              </div>
            </div>
            {index < visual.terms.length - 1 ? (
              <div className="flex flex-col items-center pt-1">
                {visual.arrowLabels?.[index] ? (
                  <div className="mb-1 rounded-full bg-slate-900 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                    <MathFormattedText text={visual.arrowLabels[index] ?? ""} />
                  </div>
                ) : (
                  <div className="mb-1 h-[22px]" />
                )}
                <div className="text-2xl font-black text-cyan-700">→</div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
