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

export default function MissingOperation({
  story,
  a,
  b,
  result,
  answer,
  onCorrect,
  onWrong,
}: {
  story?: string;
  a: number;
  b: number;
  result: number;
  answer: "+" | "-";
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [picked, setPicked] = useState<"+" | "-" | null>(null);

  function choose(v: "+" | "-") {
    setPicked(v);
    if (v === answer) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      {story ? (
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-gray-800">
            {story}
          </div>
          <button
            onClick={() => speak(story)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50"
            type="button"
          >
            🔊 Read
          </button>
        </div>
      ) : null}
      <div className="text-3xl font-black text-gray-900 text-center mb-4">
        {a} <span className="px-2">□</span> {b} = {result}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => choose("+")}
          className={[
            "px-5 py-4 rounded-2xl border text-2xl font-black transition",
            picked === "+"
              ? "border-emerald-500 bg-emerald-50"
              : "border-gray-200 hover:bg-gray-50",
          ].join(" ")}
          type="button"
        >
          +
        </button>
        <button
          onClick={() => choose("-")}
          className={[
            "px-5 py-4 rounded-2xl border text-2xl font-black transition",
            picked === "-"
              ? "border-rose-500 bg-rose-50"
              : "border-gray-200 hover:bg-gray-50",
          ].join(" ")}
          type="button"
        >
          −
        </button>
      </div>
    </div>
  );
}
