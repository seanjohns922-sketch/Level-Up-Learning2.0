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

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

type Eq = { a: number; b: number; op: "+" | "-"; answer: number };

function makeEq(): Eq {
  const op = Math.random() < 0.5 ? "+" : "-";
  if (op === "+") {
    const a = randInt(3, 12);
    const b = randInt(2, 8);
    if (a + b > 20) return makeEq();
    return { a, b, op, answer: a + b };
  }
  const a = randInt(6, 20);
  const b = randInt(2, 10);
  if (a - b < 0) return makeEq();
  return { a, b, op, answer: a - b };
}

function buildOptions(answer: number) {
  const set = new Set<number>([answer]);
  while (set.size < 4) {
    const n = Math.max(0, Math.min(20, answer + (Math.floor(Math.random() * 7) - 3)));
    set.add(n);
  }
  return Array.from(set).sort(() => Math.random() - 0.5);
}

export default function ClimbLadder({
  onCorrect,
  onStepCorrect,
  onWrong,
}: {
  onCorrect?: () => void;
  onStepCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [pos, setPos] = useState(0);
  const [eq, setEq] = useState<Eq>(() => makeEq());
  const options = useMemo(() => buildOptions(eq.answer), [eq.answer]);
  const prompt = `${eq.a} ${eq.op} ${eq.b} = ?`;

  function nextEq() {
    setEq(makeEq());
  }

  function choose(opt: number) {
    if (opt === eq.answer) {
      const nextPos = Math.min(20, pos + 2);
      setPos(nextPos);
      if (nextPos >= 20) onCorrect?.();
      else {
        onStepCorrect?.();
        nextEq();
      }
    } else {
      onWrong?.();
      setPos((p) => Math.max(0, p - 1));
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-lg font-extrabold text-gray-900">Climb the Ladder</div>
          <div className="text-sm text-gray-600">Correct = climb up!</div>
        </div>
        <button
          type="button"
          onClick={() => speak(prompt)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50"
        >
          🔊 Read
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {Array.from({ length: 21 }).map((_, i) => (
          <span
            key={i}
            className={[
              "inline-flex items-center justify-center rounded-full text-xs font-bold",
              i <= pos ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500",
            ].join(" ")}
            style={{ width: 26, height: 26 }}
          >
            {i}
          </span>
        ))}
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
