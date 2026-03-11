"use client";

import { useState } from "react";
import { ClickableDotRow } from "@/components/ClickableDots";

function Counter() {
  return <span className="h-6 w-6 rounded-full border border-teal-600 bg-teal-500 inline-block" />;
}

export default function ShareDrag({
  total,
  groups,
  onCorrect,
  onWrong,
}: {
  total: number;
  groups: number;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [counts, setCounts] = useState<number[]>(Array.from({ length: groups }, () => 0));
  const [remaining, setRemaining] = useState(total);

  function addToGroup(i: number) {
    if (remaining <= 0) return;
    setCounts((prev) => prev.map((v, idx) => (idx === i ? v + 1 : v)));
    setRemaining((r) => r - 1);
  }

  function removeFromGroup(i: number) {
    if (counts[i] <= 0) return;
    setCounts((prev) => prev.map((v, idx) => (idx === i ? v - 1 : v)));
    setRemaining((r) => r + 1);
  }

  const isEven = remaining === 0 && counts.every((c) => c === counts[0]);

  function markFair() {
    if (isEven) onCorrect?.();
    else onWrong?.();
  }

  function markUnfair() {
    if (!isEven) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-lg font-extrabold text-gray-900 mb-3">
        Share {total} counters between {groups} children.
      </div>

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 mb-4">
        <div className="text-xs font-bold text-gray-600 mb-2">Counters in the middle</div>
        <ClickableDotRow count={remaining} dotSize={20} gap={6} />
        <div className="mt-2 text-xs text-gray-500">Remaining: {remaining}</div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {counts.map((count, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
            <div className="text-xs font-bold text-gray-600 mb-2">Child {i + 1}</div>
            <div className="flex flex-wrap gap-2 min-h-[40px]">
              {Array.from({ length: count }).map((_, di) => (
                <button key={di} onClick={() => removeFromGroup(i)} type="button">
                  <Counter />
                </button>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => addToGroup(i)}
                className="px-3 py-2 rounded-lg bg-gray-100 font-bold"
              >
                Add
              </button>
              <span className="text-sm font-bold text-gray-700">{count}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={markFair}
          className="px-4 py-2 rounded-xl font-bold transition bg-emerald-600 text-white hover:bg-emerald-700"
          type="button"
        >
          This is fair
        </button>
        <button
          onClick={markUnfair}
          className="px-4 py-2 rounded-xl font-bold transition bg-rose-600 text-white hover:bg-rose-700"
          type="button"
        >
          This isn’t fair
        </button>
        {isEven ? (
          <div className="text-sm font-bold text-emerald-700">
            Each child gets {counts[0]}.
          </div>
        ) : null}
      </div>
    </div>
  );
}
