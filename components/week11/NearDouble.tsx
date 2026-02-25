"use client";

import { useMemo, useState } from "react";

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

const problems = [
  { a: 7, b: 8 },
  { a: 9, b: 8 },
  { a: 6, b: 7 },
  { a: 8, b: 9 },
  { a: 5, b: 6 },
];

function buildOptions(answer: number) {
  const set = new Set<number>([answer]);
  while (set.size < 4) {
    const n = Math.max(0, Math.min(20, answer + (Math.floor(Math.random() * 7) - 3)));
    set.add(n);
  }
  return Array.from(set).sort(() => Math.random() - 0.5);
}

export default function NearDouble({
  onCorrect,
  onStepCorrect,
  onWrong,
}: {
  onCorrect?: () => void;
  onStepCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const p = problems[idx % problems.length];
  const answer = p.a + p.b;
  const options = useMemo(() => buildOptions(answer), [answer]);
  const prompt = `${p.a} + ${p.b} = ?`;

  function choose(opt: number) {
    if (opt === answer) {
      if (idx === problems.length - 1) onCorrect?.();
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
        <div className="text-lg font-extrabold text-gray-900">Near Double</div>
        <button
          type="button"
          onClick={() => speak(prompt)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50"
        >
          🔊 Read
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 mb-3 text-sm text-gray-700">
        Use a double, then add 1 more.
      </div>

      <div className="text-2xl font-extrabold text-gray-900 mb-3 text-center">
        {prompt}
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
