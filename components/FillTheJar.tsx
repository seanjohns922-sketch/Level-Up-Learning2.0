"use client";

import { useMemo, useState } from "react";

type FillJarConfig = {
  minTarget?: number;
  maxTarget?: number;
  rounds?: number;
  increments?: number[];
};

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeLayout(count: number) {
  if (count <= 15) return { cols: 5, dotSize: 18, gap: 10 };
  if (count <= 30) return { cols: 6, dotSize: 16, gap: 10 };
  return { cols: 8, dotSize: 14, gap: 9 };
}

export default function FillTheJar({
  config,
  onComplete,
}: {
  config?: FillJarConfig;
  onComplete?: (summary: { roundsCompleted: number; successes: number; attempts: number }) => void;
}) {
  const minTarget = config?.minTarget ?? 10;
  const maxTarget = config?.maxTarget ?? 50;
  const rounds = config?.rounds ?? 8;
  const increments = config?.increments ?? [1, 2, 5, 10];

  const [round, setRound] = useState(1);
  const [target, setTarget] = useState(() => randInt(minTarget, maxTarget));
  const [current, setCurrent] = useState(0);

  const [attempts, setAttempts] = useState(0);
  const [successes, setSuccesses] = useState(0);
  const [status, setStatus] = useState<"idle" | "correct" | "tooHigh">("idle");

  const layout = useMemo(() => makeLayout(Math.max(target, current)), [target, current]);

  function newRound(nextRound: number) {
    setRound(nextRound);
    setTarget(randInt(minTarget, maxTarget));
    setCurrent(0);
    setStatus("idle");
  }

  function finishIfDone(isSuccess: boolean) {
    const next = round + 1;
    if (next > rounds) {
      onComplete?.({
        roundsCompleted: rounds,
        successes,
        attempts,
      });
      return;
    }
    setTimeout(() => newRound(next), isSuccess ? 500 : 700);
  }

  function add(n: number) {
    setAttempts((a) => a + 1);

    setCurrent((prev) => {
      const next = prev + n;

      if (next === target) {
        setStatus("correct");
        setSuccesses((s) => s + 1);
        finishIfDone(true);
        return next;
      }

      if (next > target) {
        setStatus("tooHigh");
        setTimeout(() => {
          setCurrent(0);
          setStatus("idle");
        }, 650);
        return next;
      }

      setStatus("idle");
      return next;
    });
  }

  const dots = useMemo(() => Array.from({ length: current }, (_, i) => i), [current]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-500">
          Fill the Jar • Round {round}/{rounds}
        </div>
        <div className="text-sm font-semibold text-gray-700">
          Success: {successes}/{rounds}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 mb-4">
        <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          Fill the jar to <span className="text-teal-600">{target}</span>
        </div>
        <div className="text-sm text-gray-500 mt-1">
          Tap buttons to add counters. Don’t go over!
        </div>

        <div className="mt-3 flex items-center gap-3">
          <div className="text-sm font-bold text-gray-700">
            Current: <span className="text-gray-900">{current}</span>
          </div>

          {status === "correct" ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-green-100 text-green-800 px-3 py-1 text-sm font-bold">
              ✅ Perfect!
            </div>
          ) : status === "tooHigh" ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-red-100 text-red-800 px-3 py-1 text-sm font-bold">
              ❌ Too high — reset!
            </div>
          ) : (
            <div className="text-sm text-gray-400"> </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 mb-4">
        <div className="mx-auto max-w-[520px]">
          <div className="rounded-2xl border-2 border-gray-200 bg-gray-50 p-4">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))`,
                gap: layout.gap,
              }}
            >
              {dots.map((i) => (
                <div
                  key={i}
                  className="rounded-full bg-teal-600"
                  style={{ width: layout.dotSize, height: layout.dotSize }}
                />
              ))}
            </div>

            {current === 0 && (
              <div className="text-sm text-gray-500 font-semibold text-center py-6">
                Jar is empty — start filling!
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {increments.map((inc) => (
          <button
            key={inc}
            onClick={() => add(inc)}
            className="rounded-2xl bg-indigo-600 text-white px-4 py-4 text-xl font-extrabold hover:bg-indigo-700 transition active:scale-[0.98]"
          >
            +{inc}
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <button
          onClick={() => {
            setCurrent(0);
            setStatus("idle");
          }}
          className="px-4 py-3 rounded-xl bg-gray-100 text-gray-800 font-bold hover:bg-gray-200 transition"
        >
          Reset
        </button>

        <button
          onClick={() => newRound(round)}
          className="px-4 py-3 rounded-xl bg-gray-100 text-gray-800 font-bold hover:bg-gray-200 transition"
          title="New target (testing)"
        >
          New target 🔁
        </button>

        <button
          onClick={() => newRound(Math.min(round + 1, rounds))}
          className="px-4 py-3 rounded-xl bg-gray-100 text-gray-800 font-bold hover:bg-gray-200 transition"
          title="Skip (testing)"
        >
          Skip →
        </button>
      </div>
    </div>
  );
}
