"use client";

import { useMemo, useState } from "react";

export default function NumberChartFill({
  min,
  max,
  missing,
  onComplete,
}: {
  min: number;
  max: number;
  missing: number[];
  onComplete: () => void;
}) {
  const [filled, setFilled] = useState<number[]>([]);
  const [active, setActive] = useState<number | null>(null);

  const total = max - min + 1;
  const cols = max >= 120 ? 10 : 10;

  const missingSet = useMemo(() => new Set(missing), [missing]);
  const filledSet = useMemo(() => new Set(filled), [filled]);

  function fill(n: number) {
    if (!missingSet.has(n)) return;
    if (filledSet.has(n)) return;
    if (active !== n) return;
    const next = [...filled, n];
    setFilled(next);
    setActive(null);
    if (next.length === missing.length) {
      setTimeout(() => onComplete(), 500);
    }
  }

  const numbers = useMemo(
    () => Array.from({ length: total }, (_, i) => min + i),
    [min, total]
  );

  return (
    <div className="w-full">
      <div className="text-sm text-slate-600 mb-3">
        Tap a number, then tap the matching blank in the chart.
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {missing.map((n) => {
          const isDone = filledSet.has(n);
          const isActive = active === n;
          return (
            <button
              key={`missing-${n}`}
              onClick={() => {
                if (isDone) return;
                setActive(n);
              }}
              className={[
                "px-3 py-2 rounded-lg border text-sm font-bold",
                isDone
                  ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                  : isActive
                  ? "bg-teal-100 text-teal-800 border-teal-300"
                  : "bg-white text-slate-800 border-slate-300 hover:bg-slate-50",
              ].join(" ")}
            >
              {n}
            </button>
          );
        })}
      </div>

      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {numbers.map((n) => {
          const isMissing = missingSet.has(n);
          const isFilled = filledSet.has(n);
          return (
            <button
              key={n}
              onClick={() => fill(n)}
              className={[
                "rounded-lg border text-sm font-bold py-2",
                isMissing
                  ? isFilled
                    ? "bg-teal-600 text-white border-teal-700"
                    : "bg-white border-slate-300 hover:bg-slate-50"
                  : "bg-slate-50 text-slate-600 border-slate-200",
              ].join(" ")}
            >
              {isMissing && !isFilled ? "?" : n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
