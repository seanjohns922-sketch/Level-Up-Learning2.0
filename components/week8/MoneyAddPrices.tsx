"use client";

import { renderCoins } from "@/components/week7/moneyAssets";

function speak(text: string) {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.9;
  u.pitch = 1.0;
  u.volume = 1.0;
  synth.speak(u);
}

export default function MoneyAddPrices({
  itemA,
  itemB,
  priceA,
  priceB,
  options,
  answer,
  onCorrect,
  onWrong,
}: {
  itemA: string;
  itemB: string;
  priceA: number;
  priceB: number;
  options: string[];
  answer: number;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const prompt = `You buy ${itemA} for $${priceA} and ${itemB} for $${priceB}. How much altogether?`;

  function choose(opt: string) {
    if (Number(opt) === answer) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="text-lg font-extrabold text-gray-900">{prompt}</div>
        <button
          type="button"
          onClick={() => speak(prompt)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50"
        >
          🔊 Read
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
          <div className="text-xs font-bold text-gray-600 mb-2">{itemA}</div>
          <div className="flex items-center gap-3">
            {renderCoins(priceA)}
            <span className="text-lg font-black">${priceA}</span>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
          <div className="text-xs font-bold text-gray-600 mb-2">{itemB}</div>
          <div className="flex items-center gap-3">
            {renderCoins(priceB)}
            <span className="text-lg font-black">${priceB}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {options.map((opt, i) => (
          <button
            key={`${opt}-${i}`}
            onClick={() => choose(opt)}
            className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-bold"
            type="button"
          >
            ${opt}
          </button>
        ))}
      </div>
    </div>
  );
}
