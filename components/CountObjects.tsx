"use client";

import { useMemo, useState } from "react";

type CountConfig = {
  min?: number;
  max?: number;
  rounds?: number;
  optionsCount?: number;
  showRangeLabel?: boolean;
};

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function uniqueOptions(correct: number, min: number, max: number, n: number) {
  const set = new Set<number>([correct]);
  while (set.size < n) {
    const delta = randInt(-8, 8);
    let v = correct + delta;
    if (v < min) v = min;
    if (v > max) v = max;
    set.add(v);
  }
  return shuffle(Array.from(set));
}

function makeLayout(max: number) {
  if (max <= 20) return { cols: 5, rows: 4, dotSize: 18, gap: 10 };
  if (max <= 30) return { cols: 6, rows: 5, dotSize: 16, gap: 10 };
  return { cols: 10, rows: 5, dotSize: 14, gap: 9 };
}

export default function CountObjects({
  config,
  onComplete,
}: {
  config?: CountConfig;
  onComplete?: (summary: { roundsCompleted: number; correct: number; attempts: number }) => void;
}) {
  const min = config?.min ?? 5;
  const max = config?.max ?? 50;
  const rounds = config?.rounds ?? 12;
  const optionsCount = config?.optionsCount ?? 4;

  const [round, setRound] = useState(1);
  const [count, setCount] = useState(() => randInt(min, max));
  const [picked, setPicked] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);

  const [attempts, setAttempts] = useState(0);
  const [correctTotal, setCorrectTotal] = useState(0);

  const options = useMemo(
    () => uniqueOptions(count, min, max, optionsCount),
    [count, min, max, optionsCount]
  );

  const layout = useMemo(() => makeLayout(max), [max]);

  function nextRound() {
    const next = round + 1;
    if (next > rounds) {
      onComplete?.({ roundsCompleted: rounds, correct: correctTotal, attempts });
      return;
    }
    setRound(next);
    setCount(randInt(min, max));
    setPicked(null);
    setLocked(false);
  }

  function choose(v: number) {
    if (locked) return;
    setAttempts((a) => a + 1);
    setPicked(v);
    setLocked(true);

    const isCorrect = v === count;
    if (isCorrect) setCorrectTotal((c) => c + 1);

    if (isCorrect) {
      setTimeout(() => {
        nextRound();
      }, 450);
    } else {
      setTimeout(() => {
        setPicked(null);
        setLocked(false);
      }, 650);
    }
  }

  const totalDots = layout.cols * layout.rows;
  const dots = useMemo(() => Array.from({ length: totalDots }, (_, i) => i), [totalDots]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-500">
          Count Objects • Round {round}/{rounds}
        </div>
        <div className="text-sm font-semibold text-gray-700">
          Score: {correctTotal}/{rounds}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 mb-4">
        <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          How many counters?
        </div>
        {config?.showRangeLabel !== false && (
          <div className="text-sm text-gray-500 mt-1">
            Counting within {min}-{max}
          </div>
        )}
      </div>

      <div className="rounded-2xl border bg-white p-5 mb-4">
        <div
          className="mx-auto"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))`,
            gap: layout.gap,
            maxWidth: 520,
          }}
        >
          {dots.map((i) => {
            const filled = i < count;
            return (
              <div
                key={i}
                className={[
                  "rounded-full border",
                  filled ? "bg-teal-600 border-teal-700" : "bg-white border-gray-200",
                ].join(" ")}
                style={{
                  width: layout.dotSize,
                  height: layout.dotSize,
                }}
                aria-hidden
              />
            );
          })}
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Tip: you can count by making groups (like 5s or 10s).
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {options.map((v) => {
          const isPicked = picked === v;
          const showWrong = locked && isPicked && v !== count;
          const showRight = locked && isPicked && v === count;

          return (
            <button
              key={v}
              onClick={() => choose(v)}
              disabled={locked}
              className={[
                "rounded-2xl border px-4 py-4 text-lg font-extrabold transition",
                "active:scale-[0.98]",
                locked ? "cursor-not-allowed" : "hover:bg-gray-50",
                showRight
                  ? "bg-green-50 border-green-300 text-green-900"
                  : "bg-white border-gray-200 text-gray-900",
                showWrong ? "bg-red-50 border-red-300 text-red-900" : "",
              ].join(" ")}
            >
              {v}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <button
          onClick={() => {
            setCount(randInt(min, max));
            setPicked(null);
            setLocked(false);
          }}
          className="px-4 py-3 rounded-xl bg-gray-100 text-gray-800 font-bold hover:bg-gray-200 transition"
        >
          New counters 🔁
        </button>

        <button
          onClick={() => nextRound()}
          className="px-4 py-3 rounded-xl bg-gray-100 text-gray-800 font-bold hover:bg-gray-200 transition"
        >
          Skip →
        </button>
      </div>
    </div>
  );
}
