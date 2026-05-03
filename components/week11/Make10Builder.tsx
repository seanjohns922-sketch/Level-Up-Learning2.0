"use client";

import { useMemo, useState } from "react";
import { speak } from "@/lib/speak";

type Prompt = { target: 10 | 20; a: number };

function buildPrompts(): Prompt[] {
  return [
    { target: 10, a: 7 },
    { target: 10, a: 6 },
    { target: 10, a: 9 },
    { target: 20, a: 14 },
    { target: 20, a: 12 },
  ];
}

function buildOptions(answer: number) {
  const set = new Set<number>([answer]);
  while (set.size < 4) {
    const n = Math.max(0, Math.min(20, answer + (Math.floor(Math.random() * 7) - 3)));
    set.add(n);
  }
  return Array.from(set).sort(() => Math.random() - 0.5);
}

export default function Make10Builder({
  onCorrect,
  onStepCorrect,
  onWrong,
}: {
  onCorrect?: () => void;
  onStepCorrect?: () => void;
  onWrong?: () => void;
}) {
  const prompts = useMemo(() => buildPrompts(), []);
  const [idx, setIdx] = useState(0);
  const p = prompts[idx];
  const answer = p.target - p.a;
  const options = useMemo(() => buildOptions(answer), [answer]);
  const promptText = `What makes ${p.target}? ${p.a} + ?`;

  function choose(opt: number) {
    if (opt === answer) {
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
        <div className="text-lg font-extrabold text-gray-900">Make 10 / 20 Builder</div>
        <button
          type="button"
          onClick={() => speak(promptText)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50"
        >
          🔊 Read
        </button>
      </div>

      <div className="text-2xl font-extrabold text-gray-900 mb-3 text-center">
        {p.a} + __ = {p.target}
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
