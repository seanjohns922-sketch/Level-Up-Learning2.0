"use client";

import { useState } from "react";
import { speak } from "@/lib/speak";

type Prompt = { a: number; b: number; strategy: "Use double" | "Count on" | "Make 10" };

const prompts: Prompt[] = [
  { a: 6, b: 7, strategy: "Use double" },
  { a: 8, b: 2, strategy: "Make 10" },
  { a: 9, b: 1, strategy: "Make 10" },
  { a: 4, b: 7, strategy: "Count on" },
  { a: 8, b: 9, strategy: "Use double" },
];

const options = ["Use double", "Count on", "Make 10"] as const;

export default function DoubleDetective({
  onCorrect,
  onStepCorrect,
  onWrong,
}: {
  onCorrect?: () => void;
  onStepCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const p = prompts[idx % prompts.length];
  const prompt = `${p.a} + ${p.b}`;

  function choose(opt: (typeof options)[number]) {
    if (opt === p.strategy) {
      if (idx === prompts.length - 1) onCorrect?.();
      else {
        onStepCorrect?.();
        setIdx((v) => v + 1);
      }
    } else {
      onWrong?.();
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="text-lg font-extrabold text-gray-900">Double Detective</div>
        <button
          type="button"
          onClick={() => speak(prompt)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50"
        >
          🔊 Read
        </button>
      </div>

      <div className="text-2xl font-extrabold text-gray-900 mb-3 text-center">
        {prompt}
      </div>

      <div className="text-sm text-gray-600 mb-3">
        Choose the best strategy.
      </div>

      <div className="grid gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => choose(opt)}
            className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-bold"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
