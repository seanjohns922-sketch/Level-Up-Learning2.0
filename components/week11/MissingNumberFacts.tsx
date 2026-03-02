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

type Prompt =
  | { type: "add"; a: number; b: number; sum: number }
  | { type: "sub"; total: number; part: number; diff: number };

function buildPrompts(): Prompt[] {
  const raw: Array<
    | { type: "add"; a: number; b: number; sum: number }
    | { type: "sub"; total: number; part: number; diff: number }
  > = [
    { type: "add" as const, a: 7, b: 0, sum: 15 },
    { type: "add" as const, a: 5, b: 0, sum: 12 },
    { type: "sub" as const, total: 14, part: 0, diff: 9 },
    { type: "sub" as const, total: 16, part: 0, diff: 7 },
    { type: "add" as const, a: 8, b: 0, sum: 13 },
  ];
  return raw.map((p): Prompt => {
    if (p.type === "add") {
      return { ...p, b: p.sum - p.a };
    }
    return { ...p, part: p.total - p.diff };
  });
}

function buildOptions(answer: number) {
  const set = new Set<number>([answer]);
  while (set.size < 4) {
    const n = Math.max(0, Math.min(20, answer + (Math.floor(Math.random() * 7) - 3)));
    set.add(n);
  }
  return Array.from(set).sort(() => Math.random() - 0.5);
}

export default function MissingNumberFacts({
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
  const answer = p.type === "add" ? p.b : p.part;
  const options = useMemo(() => buildOptions(answer), [answer]);

  const promptText =
    p.type === "add"
      ? `__ + ${p.a} = ${p.sum}`
      : `${p.total} - __ = ${p.diff}`;

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
        <div className="text-lg font-extrabold text-gray-900">Missing Number</div>
        <button
          type="button"
          onClick={() => speak(promptText)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50"
        >
          🔊 Read
        </button>
      </div>

      <div className="text-2xl font-extrabold text-gray-900 mb-3 text-center">
        {promptText}
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
