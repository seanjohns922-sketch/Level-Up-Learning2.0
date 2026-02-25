"use client";

import { ClickableDotRow } from "@/components/ClickableDots";

export default function ShareFair({
  total,
  groups,
  distribution,
  isFair,
  onCorrect,
  onWrong,
}: {
  total: number;
  groups: number;
  distribution: number[];
  isFair: boolean;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  function choose(v: boolean) {
    if (v === isFair) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-lg font-extrabold text-gray-900 mb-3">
        Is this shared equally?
      </div>
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        {Array.from({ length: groups }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
            <div className="text-xs font-bold text-gray-600 mb-2">Child {i + 1}</div>
            <div className="min-h-[40px]">
              <ClickableDotRow count={distribution[i] ?? 0} dotSize={20} gap={6} />
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-500 mb-3">
        Total: {total} counters
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => choose(true)}
          className="px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-extrabold"
        >
          YES
        </button>
        <button
          type="button"
          onClick={() => choose(false)}
          className="px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-extrabold"
        >
          NO
        </button>
      </div>
    </div>
  );
}
