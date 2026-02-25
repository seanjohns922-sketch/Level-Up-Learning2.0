"use client";

import { useState } from "react";
import { ClickableDotRow } from "@/components/ClickableDots";

export default function ShareDeal({
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
  const [dealt, setDealt] = useState(false);
  const [isEven, setIsEven] = useState<boolean | null>(null);

  function deal() {
    const next = Array.from({ length: groups }, () => 0);
    for (let i = 0; i < total; i += 1) {
      next[i % groups] += 1;
    }
    setCounts(next);
    setDealt(true);
    setIsEven(next.every((c) => c === next[0]));
  }

  function markFair() {
    if (isEven) onCorrect?.();
    else onWrong?.();
  }

  function markUnfair() {
    if (isEven === false) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-lg font-extrabold text-gray-900 mb-3">
        Tap “Deal” to share {total} counters among {groups} children.
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-4">
        {counts.map((count, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
            <div className="text-xs font-bold text-gray-600 mb-2">Child {i + 1}</div>
            <div className="min-h-[40px]">
              <ClickableDotRow count={count} dotSize={20} gap={6} />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={deal}
        className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-extrabold hover:bg-indigo-700 transition"
      >
        Deal
      </button>

      {dealt ? (
        <div className="mt-3 text-sm font-bold text-gray-700">
          {counts.every((c) => c === counts[0])
            ? `Fair share! Each child gets ${counts[0]}.`
            : "Not fair — choose the button."}
        </div>
      ) : null}

      {dealt ? (
        <div className="mt-3 flex items-center gap-3">
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
        </div>
      ) : null}
    </div>
  );
}
