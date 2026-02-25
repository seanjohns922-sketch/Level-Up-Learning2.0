"use client";

import { useState } from "react";
import { renderCoins } from "./moneyAssets";

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

export default function MoneyEnough({
  have,
  cost,
  answer,
  showExplanation = true,
  onCorrect,
  onWrong,
}: {
  have: number;
  cost: number;
  answer: "YES" | "NO";
  showExplanation?: boolean;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [picked, setPicked] = useState<"YES" | "NO" | null>(null);
  const prompt = `You have $${have}. The toy costs $${cost}. Do you have enough?`;

  function choose(v: "YES" | "NO") {
    setPicked(v);
    if (v === answer) onCorrect?.();
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
          <div className="text-xs font-bold text-gray-600 mb-2">You have</div>
          {renderCoins(have)}
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
          <div className="text-xs font-bold text-gray-600 mb-2">Cost</div>
          {renderCoins(cost)}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => choose("YES")}
          className={[
            "px-5 py-4 rounded-2xl border text-2xl font-black transition",
            picked === "YES"
              ? "border-emerald-500 bg-emerald-50"
              : "border-gray-200 hover:bg-gray-50",
          ].join(" ")}
          type="button"
        >
          YES
        </button>
        <button
          onClick={() => choose("NO")}
          className={[
            "px-5 py-4 rounded-2xl border text-2xl font-black transition",
            picked === "NO"
              ? "border-rose-500 bg-rose-50"
              : "border-gray-200 hover:bg-gray-50",
          ].join(" ")}
          type="button"
        >
          NO
        </button>
      </div>
      {picked && showExplanation ? (
        <div className="mt-3 text-sm font-bold text-gray-700">
          {answer === "YES"
            ? `Yes — $${have} is enough for $${cost}.`
            : `No — $${have} is not enough for $${cost}.`}
        </div>
      ) : null}
    </div>
  );
}
