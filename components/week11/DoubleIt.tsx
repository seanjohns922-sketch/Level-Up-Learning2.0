"use client";

import { useMemo, useState } from "react";
import { StaticDotGrid } from "@/components/StaticDots";
import { speak } from "@/lib/speak";

const doubles = [6, 8, 9, 7, 5];

function buildOptions(answer: number) {
  const set = new Set<number>([answer]);
  while (set.size < 4) {
    const n = Math.max(0, Math.min(20, answer + (Math.floor(Math.random() * 7) - 3)));
    set.add(n);
  }
  return Array.from(set).sort(() => Math.random() - 0.5);
}

export default function DoubleIt({
  onCorrect,
  onStepCorrect,
  onWrong,
}: {
  onCorrect?: () => void;
  onStepCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const a = doubles[idx % doubles.length];
  const answer = a + a;
  const options = useMemo(() => buildOptions(answer), [answer]);
  const prompt = `${a} + ${a} = ?`;

  function choose(opt: number) {
    if (opt === answer) {
      if (idx === doubles.length - 1) onCorrect?.();
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
        <div className="text-lg font-extrabold text-gray-900">Double It</div>
        <button
          type="button"
          onClick={() => speak(prompt)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50"
        >
          🔊 Read
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-3">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
          <div className="text-sm font-bold text-gray-700 mb-2">First group</div>
          <StaticDotGrid count={a} rows={1} cols={a} dotSize={18} gap={6} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
          <div className="text-sm font-bold text-gray-700 mb-2">Second group</div>
          <StaticDotGrid count={a} rows={1} cols={a} dotSize={18} gap={6} />
        </div>
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
