"use client";

import { MathFormattedText } from "@/components/FractionText";
import type { RuleMatchCardsVisualData } from "@/data/activities/year2/lessonEngine";

export default function RuleMatchCardsVisual({
  visual,
}: {
  visual: RuleMatchCardsVisualData;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">
        {visual.title}
      </div>
      <div className="mt-4 rounded-2xl border border-cyan-300 bg-slate-900 px-4 py-4 text-center shadow-sm shadow-cyan-200/50">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-cyan-200">
          Rule
        </div>
        <div className="mt-2 text-3xl font-black text-white">
          <MathFormattedText text={visual.rule} />
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {visual.tables.map((table) => (
          <div key={table.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
              {table.label}
            </div>
            <div className="mt-3 space-y-2">
              {table.pairs.map((pair, index) => (
                <div
                  key={`${table.label}-${pair.input}-${pair.output}-${index}`}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm font-black text-slate-900"
                >
                  <MathFormattedText text={pair.input} />
                  <span className="text-cyan-700">→</span>
                  <MathFormattedText text={pair.output} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
