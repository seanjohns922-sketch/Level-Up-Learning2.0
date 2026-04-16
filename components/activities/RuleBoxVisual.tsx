"use client";

import type { RuleBoxVisualData } from "@/data/activities/year2/lessonEngine";

export default function RuleBoxVisual({
  visual,
  title = "Rule box",
}: {
  visual: RuleBoxVisualData;
  title?: string;
}) {
  return (
    <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
      <div className="text-xs font-bold uppercase tracking-wide text-indigo-700">{title}</div>
      <div className="mt-2 text-lg font-black text-slate-900">{visual.title}</div>
      <div className="mt-3 space-y-2">
        {visual.steps.map((step, index) => (
          <div
            key={`${visual.title}-${index}`}
            className="flex items-start gap-3 rounded-xl border border-white/80 bg-white px-3 py-2"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-black text-indigo-700">
              {index + 1}
            </div>
            <div className="pt-1 text-sm font-semibold text-slate-700">{step}</div>
          </div>
        ))}
      </div>
      {visual.decisionLabel ? (
        <div className="mt-3 rounded-xl border border-dashed border-indigo-200 bg-white/80 px-3 py-2 text-sm font-bold text-indigo-800">
          Decision: {visual.decisionLabel}
        </div>
      ) : null}
    </div>
  );
}
