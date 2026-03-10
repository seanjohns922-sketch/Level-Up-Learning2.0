"use client";

import { useMemo, useState } from "react";

type AdditionStrategyConfig = {
  min?: number;
  max?: number;
  mode?: "jump" | "split" | "friendly_numbers";
};

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function uniqueOptions(answer: number) {
  const values = new Set<number>([answer]);
  while (values.size < 4) {
    const offset = randInt(-12, 12);
    values.add(Math.max(0, answer + offset));
  }
  return Array.from(values).sort(() => Math.random() - 0.5);
}

export default function AdditionStrategy({
  config,
}: {
  config?: Record<string, unknown>;
}) {
  const typedConfig = (config ?? {}) as AdditionStrategyConfig;
  const min = typeof typedConfig.min === "number" ? typedConfig.min : 0;
  const max = typeof typedConfig.max === "number" ? typedConfig.max : 100;
  const mode = typedConfig.mode ?? "jump";

  const [seed, setSeed] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");

  const challenge = useMemo(() => {
    let a = randInt(min, Math.max(min, max - 10));
    let b = randInt(2, 18);

    if (mode === "split") {
      a = randInt(10, 89);
      b = randInt(10, 19);
    }

    if (mode === "friendly_numbers") {
      a = randInt(20, 89);
      const jumpToTen = 10 - (a % 10 || 10);
      b = jumpToTen + randInt(1, 8);
    }

    const answer = a + b;
    const hint =
      mode === "jump"
        ? `Start at ${a}. Jump ${b} more on the number line.`
        : mode === "split"
        ? `Split ${b} into tens and ones, then add each part.`
        : `Make a friendly ten first, then add the rest.`;

    return { a, b, answer, hint, options: uniqueOptions(answer) };
  }, [max, min, mode, seed]);

  function choose(option: number) {
    setPicked(option);
    setStatus(option === challenge.answer ? "correct" : "wrong");
  }

  function nextChallenge() {
    setSeed((current) => current + 1);
    setPicked(null);
    setStatus("idle");
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
            Addition Strategy
          </div>
          <h2 className="mt-2 text-2xl font-black text-gray-900">
            Solve {challenge.a} + {challenge.b}
          </h2>
          <p className="mt-2 text-sm text-gray-600">{challenge.hint}</p>
        </div>
        <button
          type="button"
          onClick={nextChallenge}
          className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
        >
          New challenge
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
        <div className="text-xs font-bold uppercase tracking-wide text-indigo-700">
          Strategy model
        </div>
        <div className="mt-2 text-3xl font-black text-indigo-900">
          {mode === "jump" && `${challenge.a} -> ${challenge.a + challenge.b}`}
          {mode === "split" &&
            `${challenge.a} + ${Math.floor(challenge.b / 10) * 10} + ${challenge.b % 10}`}
          {mode === "friendly_numbers" && (() => {
            const bridge = 10 - (challenge.a % 10 || 10);
            return `${challenge.a} + ${bridge} + ${challenge.b - bridge}`;
          })()}
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {challenge.options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => choose(option)}
            className={[
              "rounded-2xl border px-5 py-4 text-left text-2xl font-black transition",
              picked === option
                ? status === "correct"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                  : "border-red-300 bg-red-50 text-red-900"
                : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50",
            ].join(" ")}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="mt-4 text-sm font-bold">
        {status === "correct" ? (
          <span className="text-emerald-700">Correct.</span>
        ) : status === "wrong" ? (
          <span className="text-red-700">Not yet. Try another strategy path.</span>
        ) : (
          <span className="text-gray-500">Choose the best answer.</span>
        )}
      </div>
    </div>
  );
}
