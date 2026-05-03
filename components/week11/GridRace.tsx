"use client";

import { useMemo, useState } from "react";
import { speak } from "@/lib/speak";

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

type Eq = { a: number; b: number; op: "+" | "-"; answer: number };

function makeEq(): Eq {
  const op = Math.random() < 0.5 ? "+" : "-";
  if (op === "+") {
    const a = randInt(3, 12);
    const b = randInt(3, 8);
    if (a + b > 20) return makeEq();
    return { a, b, op, answer: a + b };
  }
  const a = randInt(6, 20);
  const b = randInt(2, 10);
  if (a - b < 0) return makeEq();
  return { a, b, op, answer: a - b };
}

function makeGrid(answer: number) {
  const set = new Set<number>([answer]);
  while (set.size < 16) set.add(randInt(0, 20));
  return Array.from(set).sort(() => Math.random() - 0.5);
}

export default function GridRace({
  onCorrect,
  onStepCorrect,
  onWrong,
}: {
  onCorrect?: () => void;
  onStepCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [eq, setEq] = useState<Eq>(() => makeEq());
  const [grid, setGrid] = useState<number[]>(() => makeGrid(eq.answer));
  const totalRounds = 6;
  const prompt = `${eq.a} ${eq.op} ${eq.b} = ?`;

  function next() {
    const ne = makeEq();
    setEq(ne);
    setGrid(makeGrid(ne.answer));
  }

  function choose(n: number) {
    if (n === eq.answer) {
      if (idx + 1 >= totalRounds) onCorrect?.();
      else {
        setIdx((v) => v + 1);
        onStepCorrect?.();
        next();
      }
    } else {
      onWrong?.();
    }
  }

  const gridItems = useMemo(() => grid, [grid]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-lg font-extrabold text-gray-900">Grid Race</div>
          <div className="text-sm text-gray-600">Tap the correct answer.</div>
        </div>
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

      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}
      >
        {gridItems.map((n, i) => (
          <button
            key={`${n}-${i}`}
            type="button"
            onClick={() => choose(n)}
            className="px-2 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-bold"
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
