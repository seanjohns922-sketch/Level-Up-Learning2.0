"use client";

import { useEffect, useMemo, useState } from "react";

type NumberHuntConfig = {
  min?: number;
  max?: number;
  tilesCount?: number;
  rounds?: number;
};

type HuntRound = {
  target: number;
  tiles: number[];
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

function buildRound(min: number, max: number, tilesCount: number): HuntRound {
  const target = randInt(min, max);
  const set = new Set<number>();
  set.add(target);
  while (set.size < tilesCount) {
    set.add(randInt(min, max));
  }
  const tiles = shuffle(Array.from(set));
  return { target, tiles };
}

export default function NumberHunt({
  config,
  onComplete,
}: {
  config?: NumberHuntConfig;
  onComplete?: (summary: { correct: number; total: number }) => void;
}) {
  const min = config?.min ?? 0;
  const max = config?.max ?? 50;
  const tilesCount = Math.max(20, Math.min(30, config?.tilesCount ?? 24));
  const rounds = config?.rounds ?? 12;

  const [roundIndex, setRoundIndex] = useState(0);
  const [round, setRound] = useState<HuntRound>(() =>
    buildRound(min, max, tilesCount)
  );

  const [selected, setSelected] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [score, setScore] = useState({ correct: 0, total: 0 });

  function nextRound() {
    setSelected(null);
    setStatus("idle");

    setRoundIndex((i) => {
      const next = i + 1;
      if (next >= rounds) {
        const summary = { correct: score.correct, total: score.total };
        onComplete?.(summary);
        return i;
      }
      return next;
    });

    setRound(buildRound(min, max, tilesCount));
  }

  function pick(n: number) {
    if (status !== "idle") return;
    setSelected(n);
    const isCorrect = n === round.target;
    setScore((s) => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      total: s.total + 1,
    }));
    setStatus(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      setTimeout(() => {
        nextRound();
      }, 450);
    } else {
      setTimeout(() => {
        setSelected(null);
        setStatus("idle");
      }, 450);
    }
  }

  const cols = useMemo(() => {
    return "grid grid-cols-5 sm:grid-cols-6 gap-2";
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-500">
          Number Hunt • Round {Math.min(roundIndex + 1, rounds)}/{rounds}
        </div>
        <div className="text-sm font-semibold text-gray-700">
          Score: {score.correct}/{score.total}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 mb-4">
        <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          Find <span className="text-teal-600">{round.target}</span>
        </div>
        <div className="text-sm text-gray-500 mt-1">
          Tap the correct number tile.
        </div>

        <div className="mt-3">
          {status === "correct" ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-green-100 text-green-800 px-3 py-1 text-sm font-bold">
              ✅ Correct!
            </div>
          ) : status === "wrong" ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-red-100 text-red-800 px-3 py-1 text-sm font-bold">
              ❌ Try again
            </div>
          ) : (
            <div className="text-sm text-gray-400"> </div>
          )}
        </div>
      </div>

      <div className={cols}>
        {round.tiles.map((n) => {
          const isSelected = selected === n;
          const tileClass = [
            "rounded-2xl border px-0 py-4 sm:py-5 text-center font-extrabold text-lg sm:text-xl",
            "transition active:scale-[0.98]",
            "bg-white hover:bg-gray-50",
            isSelected && status === "idle" ? "border-teal-500" : "border-gray-200",
            isSelected && status === "correct"
              ? "border-green-500 bg-green-50"
              : "",
            isSelected && status === "wrong" ? "border-red-500 bg-red-50" : "",
          ].join(" ");

          return (
            <button
              key={n}
              onClick={() => pick(n)}
              className={tileClass}
              aria-label={`Number ${n}`}
            >
              {n}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex justify-end">
        <button
          onClick={nextRound}
          className="px-4 py-3 rounded-xl bg-gray-100 text-gray-800 font-bold hover:bg-gray-200 transition"
          title="Skip to next round (testing)"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
