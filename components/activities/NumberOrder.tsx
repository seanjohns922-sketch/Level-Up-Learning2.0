"use client";

import { useMemo, useState } from "react";
import type { NumberOrderQuestion } from "@/data/activities/year2/lessonEngine";

export default function NumberOrder({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: NumberOrderQuestion;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [selected, setSelected] = useState<number[]>([]);

  const correctOrder = useMemo(
    () =>
      [...questionData.numbers].sort((a, b) =>
        questionData.ascending ? a - b : b - a
      ),
    [questionData.ascending, questionData.numbers]
  );

  function selectNumber(n: number) {
    if (selected.includes(n)) return;
    const next = [...selected, n];
    setSelected(next);
    if (next.length === correctOrder.length) {
      const isCorrect = next.every((value, index) => value === correctOrder[index]);
      if (isCorrect) onCorrect?.();
      else onWrong?.();
    }
  }

  function removeLast() {
    setSelected((current) => current.slice(0, -1));
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
            Number Order
          </div>
          <h2 className="mt-2 text-2xl font-black text-gray-900">
            {questionData.prompt}
          </h2>
        </div>
        <button
          type="button"
          onClick={removeLast}
          className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
        >
          Undo
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {questionData.numbers.map((n, idx) => (
          <button
            key={`${n}-${idx}`}
            type="button"
            onClick={() => selectNumber(n)}
            disabled={selected.includes(n)}
            className={[
              "rounded-2xl border p-6 text-xl font-black transition",
              selected.includes(n)
                ? "border-gray-200 bg-gray-100 text-gray-400"
                : "border-gray-200 bg-white text-gray-900 hover:bg-emerald-50",
            ].join(" ")}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <h3 className="text-sm font-bold uppercase tracking-wide text-indigo-700">
          Your order
        </h3>
        <div className="mt-4 flex flex-wrap gap-3">
          {selected.length > 0 ? (
            selected.map((n, i) => (
              <div
                key={`${n}-${i}`}
                className="rounded-xl bg-white px-4 py-3 text-xl font-black text-indigo-900 shadow-sm"
              >
                {n}
              </div>
            ))
          ) : (
            <div className="text-sm font-bold text-indigo-700">
              Tap the cards in order.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
