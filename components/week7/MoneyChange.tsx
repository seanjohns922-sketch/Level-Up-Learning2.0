"use client";

import { useState } from "react";
import { renderCoins } from "./moneyAssets";
import { speak } from "@/lib/speak";

export default function MoneyChange({
  paid,
  cost,
  options,
  answer,
  onCorrect,
  onWrong,
}: {
  paid: number;
  cost: number;
  options: string[];
  answer: number;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const prompt = `You pay $${paid} for a $${cost} item. How much change?`;

  function choose(v: string) {
    setPicked(v);
    if (v === String(answer)) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="text-3xl font-black text-gray-900">{prompt}</div>
        <button
          onClick={() => speak(prompt)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50"
          type="button"
        >
          🔊 Read
        </button>
      </div>

      <div className="mt-3 grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
          <div className="text-xs font-bold text-gray-600 mb-2">You pay</div>
          {renderCoins(paid)}
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
          <div className="text-xs font-bold text-gray-600 mb-2">Cost</div>
          {renderCoins(cost)}
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {options.map((opt, i) => (
          <button
            key={`${opt}-${i}`}
            onClick={() => choose(opt)}
            className={[
              "w-full text-left px-5 py-4 rounded-2xl border text-2xl font-black transition flex items-center gap-3",
              picked === opt
                ? "border-teal-600 bg-teal-50"
                : "border-gray-200 hover:bg-gray-50",
            ].join(" ")}
            type="button"
          >
            {renderCoins(Number(opt))}
            <span className="ml-auto">${opt}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
