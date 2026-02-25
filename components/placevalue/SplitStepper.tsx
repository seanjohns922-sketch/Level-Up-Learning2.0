"use client";

import { useMemo, useState } from "react";

export default function SplitStepper({
  target,
  max,
  onCorrect,
}: {
  target: number;
  max: number;
  onCorrect?: () => void;
}) {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");

  const sum = useMemo(() => a + b, [a, b]);

  function check() {
    if (sum === target) {
      setStatus("correct");
      onCorrect?.();
    } else {
      setStatus("wrong");
      setTimeout(() => setStatus("idle"), 500);
    }
  }

  function clamp(n: number) {
    return Math.max(0, Math.min(max, n));
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-sm text-gray-600 mb-2">Split</div>
      <div className="text-2xl font-extrabold text-gray-900 mb-4">
        Make {target}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {[{ label: "A", value: a, set: setA }, { label: "B", value: b, set: setB }].map(
          (item) => (
            <div key={item.label} className="rounded-xl border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-2">{item.label}</div>
              <div className="text-3xl font-extrabold text-gray-900 mb-3">
                {item.value}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => item.set((v: number) => clamp(v - 1))}
                  className="rounded-lg bg-gray-100 px-3 py-2 font-bold"
                >
                  −1
                </button>
                <button
                  onClick={() => item.set((v: number) => clamp(v + 1))}
                  className="rounded-lg bg-indigo-600 text-white px-3 py-2 font-bold"
                >
                  +1
                </button>
              </div>
            </div>
          )
        )}
      </div>

      <div className="text-sm text-gray-600 mb-3">
        {a} + {b} = <span className="font-bold text-gray-900">{sum}</span>
      </div>

      <button
        onClick={check}
        className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-extrabold"
      >
        Check
      </button>

      <div className="mt-3 text-sm font-bold">
        {status === "correct" ? (
          <span className="text-green-700">✅ Correct!</span>
        ) : status === "wrong" ? (
          <span className="text-red-700">Not quite — try again.</span>
        ) : (
          <span className="text-gray-500">Adjust and check.</span>
        )}
      </div>
    </div>
  );
}
