"use client";

import { Volume2 } from "lucide-react";
import { renderCoins } from "@/components/week7/moneyAssets";
import { speak } from "@/lib/speak";

export default function MoneyCountUp({
  have,
  cost,
  options,
  answer,
  onCorrect,
  onWrong,
  prompt: customPrompt,
  haveLabel = "You have",
  costLabel = "Cost",
}: {
  have: number;
  cost: number;
  options: string[];
  answer: number;
  onCorrect?: () => void;
  onWrong?: () => void;
  prompt?: string;
  haveLabel?: string;
  costLabel?: string;
}) {
  const prompt = customPrompt ?? `You have $${have}. It costs $${cost}. How much more do you need?`;

  function choose(opt: string) {
    if (Number(opt) === answer) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="text-lg font-extrabold text-slate-900">{prompt}</div>
        <button
          type="button"
          onClick={() => speak(prompt)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          <span className="inline-flex items-center gap-1.5"><Volume2 className="h-4 w-4" /> Read</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-bold text-slate-600 mb-2">{haveLabel}</div>
          {renderCoins(have)}
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-bold text-slate-600 mb-2">{costLabel}</div>
          {renderCoins(cost)}
        </div>
      </div>

      <div className="mt-2 grid gap-2">
        {options.map((opt, i) => (
          <button
            key={`${opt}-${i}`}
            onClick={() => choose(opt)}
            className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold"
            type="button"
          >
            ${opt}
          </button>
        ))}
      </div>
    </div>
  );
}
