"use client";

import { useMemo, useState } from "react";

type NumberLineConfig = {
  min?: number;
  max?: number;
  step?: number;
  mode?: "placement" | "rounding" | "estimate";
  targets?: number[];
};

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function roundToNearest(value: number, unit: number) {
  return Math.round(value / unit) * unit;
}

export default function NumberLineActivity({
  config,
}: {
  config?: Record<string, unknown>;
}) {
  const typedConfig = (config ?? {}) as NumberLineConfig;
  const min = typeof typedConfig.min === "number" ? typedConfig.min : 0;
  const max = typeof typedConfig.max === "number" ? typedConfig.max : 1000;
  const step = typeof typedConfig.step === "number" ? typedConfig.step : 10;
  const mode = typedConfig.mode ?? "placement";
  const targets =
    typedConfig.targets?.filter((value): value is number => typeof value === "number") ?? [];

  const [seed, setSeed] = useState(0);
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");

  const challenge = useMemo(() => {
    if (mode === "rounding") {
      const targetUnit = targets.length > 0 ? targets[randInt(0, targets.length - 1)] : 10;
      const value = randInt(min, max);
      return {
        prompt: `Round ${value} to the nearest ${targetUnit}.`,
        expected: roundToNearest(value, targetUnit),
        helper: `Think about the nearest multiple of ${targetUnit}.`,
      };
    }

    const value = randInt(min, max);
    return {
      prompt:
        mode === "estimate"
          ? `Estimate where ${value} belongs on the number line.`
          : `Place ${value} on the number line.`,
      expected: value,
      helper:
        mode === "estimate"
          ? `Use the markers every ${step}. Answers within ${step / 2} are accepted.`
          : `Use the markers every ${step}.`,
    };
  }, [max, min, mode, seed, step, targets]);

  const ticks = useMemo(() => {
    const values: number[] = [];
    for (let current = min; current <= max; current += step) {
      values.push(current);
    }
    if (values[values.length - 1] !== max) values.push(max);
    return values;
  }, [max, min, step]);

  function check() {
    const numeric = Number(answer);
    if (!Number.isFinite(numeric)) {
      setStatus("wrong");
      return;
    }

    const difference = Math.abs(numeric - challenge.expected);
    const allowed = mode === "estimate" ? Math.max(1, Math.floor(step / 2)) : 0;
    setStatus(difference <= allowed ? "correct" : "wrong");
  }

  function nextChallenge() {
    setSeed((current) => current + 1);
    setAnswer("");
    setStatus("idle");
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
            Number Line
          </div>
          <h2 className="mt-2 text-2xl font-black text-gray-900">
            {challenge.prompt}
          </h2>
          <p className="mt-2 text-sm text-gray-600">{challenge.helper}</p>
        </div>
        <button
          type="button"
          onClick={nextChallenge}
          className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
        >
          New challenge
        </button>
      </div>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-8">
        <div className="relative mx-auto h-14 max-w-3xl">
          <div className="absolute left-0 right-0 top-6 h-1 rounded-full bg-gray-300" />
          {ticks.map((tick) => {
            const left = ((tick - min) / (max - min || 1)) * 100;
            return (
              <div
                key={tick}
                className="absolute top-0 text-center"
                style={{ left: `${left}%`, transform: "translateX(-50%)" }}
              >
                <div className="mx-auto h-6 w-0.5 bg-gray-400" />
                <div className="mt-1 text-xs font-bold text-gray-600">{tick}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          value={answer}
          onChange={(event) => {
            setAnswer(event.target.value.replace(/[^\d]/g, ""));
            setStatus("idle");
          }}
          inputMode="numeric"
          placeholder="Type your answer"
          className="w-full max-w-xs rounded-xl border border-gray-300 px-4 py-3 text-lg font-bold text-gray-900 outline-none focus:border-indigo-500"
        />
        <button
          type="button"
          onClick={check}
          className="rounded-xl bg-indigo-600 px-5 py-3 font-black text-white hover:bg-indigo-700"
        >
          Check answer
        </button>
      </div>

      <div className="mt-4 text-sm font-bold">
        {status === "correct" ? (
          <span className="text-emerald-700">Correct.</span>
        ) : status === "wrong" ? (
          <span className="text-red-700">
            Not yet. Expected answer: {mode === "estimate" ? "close to " : ""}
            {challenge.expected}.
          </span>
        ) : null}
      </div>
    </div>
  );
}
