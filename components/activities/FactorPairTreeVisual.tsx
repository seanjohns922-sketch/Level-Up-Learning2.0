"use client";

import InlineMathAnswerInput, { type InlineMathInputMode } from "@/components/activities/InlineMathAnswerInput";
import type { FactorPairTreeVisualData } from "@/data/activities/year2/lessonEngine";

export default function FactorPairTreeVisual({
  visual,
  answerValue,
  onAnswerChange,
  answerInputMode,
}: {
  visual: FactorPairTreeVisualData;
  answerValue?: string;
  onAnswerChange?: (value: string) => void;
  answerInputMode?: InlineMathInputMode;
}) {
  function value(valueToRender: string, pairIndex: number, side: "left" | "right") {
    return valueToRender === "?" && onAnswerChange ? (
      <InlineMathAnswerInput
        value={answerValue ?? ""}
        onChange={onAnswerChange}
        inputMode={answerInputMode}
        tone="dark"
        ariaLabel={`Missing ${side} factor in pair ${pairIndex + 1}`}
      />
    ) : (
      <span>{valueToRender}</span>
    );
  }

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-emerald-50 via-white to-violet-50 p-5">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">{visual.title}</div>
      <div className="mt-5 flex flex-col items-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-emerald-300 bg-slate-950 text-4xl font-black text-white shadow-[0_12px_28px_rgba(15,118,110,0.22)]">
          {visual.product}
        </div>
        <div className="h-8 w-1 bg-gradient-to-b from-emerald-400 to-violet-400" aria-hidden="true" />
        <div className="rounded-full bg-violet-100 px-4 py-1 text-xs font-black uppercase tracking-[0.14em] text-violet-800">
          Factor pairs
        </div>
      </div>
      <div className="relative mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visual.pairs.map((pair, pairIndex) => (
          <div
            key={`${pair.left}-${pair.right}-${pairIndex}`}
            className="flex min-h-24 items-center justify-center gap-3 rounded-2xl border border-violet-200 bg-slate-950 px-4 py-4 text-2xl font-black text-white shadow-sm"
          >
            {value(pair.left, pairIndex, "left")}
            <span className="text-sky-300">×</span>
            {value(pair.right, pairIndex, "right")}
            <span className="text-emerald-300">=</span>
            <span>{visual.product}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
