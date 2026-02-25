"use client";

import { useState } from "react";

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

export default function StrategySelect({
  total,
  remove,
  options,
  answer,
  onCorrect,
  onWrong,
}: {
  total: number;
  remove: number;
  options: string[];
  answer: number;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [strategy, setStrategy] = useState<"make10" | "countUp" | "takeAway" | null>(null);
  const prompt = `Choose a strategy for ${total} − ${remove}.`;

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

      <div className="grid md:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setStrategy("make10")}
          className={[
            "px-4 py-3 rounded-xl border font-bold",
            strategy === "make10" ? "border-indigo-600 bg-indigo-50" : "border-gray-200 hover:bg-gray-50",
          ].join(" ")}
        >
          Jump back to 10
        </button>
        <button
          type="button"
          onClick={() => setStrategy("countUp")}
          className={[
            "px-4 py-3 rounded-xl border font-bold",
            strategy === "countUp" ? "border-indigo-600 bg-indigo-50" : "border-gray-200 hover:bg-gray-50",
          ].join(" ")}
        >
          Count up
        </button>
        <button
          type="button"
          onClick={() => setStrategy("takeAway")}
          className={[
            "px-4 py-3 rounded-xl border font-bold",
            strategy === "takeAway" ? "border-indigo-600 bg-indigo-50" : "border-gray-200 hover:bg-gray-50",
          ].join(" ")}
        >
          Take away one by one
        </button>
      </div>

      {strategy ? (
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold text-gray-700">
          Strategy: {strategy === "make10" ? "Jump back to 10" : strategy === "countUp" ? "Count up" : "Take away"}
        </div>
      ) : null}

      <div className="mt-4 grid gap-2">
        {options.map((opt, i) => (
          <button
            key={`${opt}-${i}`}
            onClick={() => choose(opt)}
            className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-bold"
            type="button"
            disabled={!strategy}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
