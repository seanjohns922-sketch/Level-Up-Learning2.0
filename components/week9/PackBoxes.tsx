"use client";

import { useState } from "react";
import { ClickableDotRow } from "@/components/ClickableDots";

export default function PackBoxes({
  total,
  perBox,
  onCorrect,
  onWrong,
}: {
  total: number;
  perBox: number;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const boxes = Math.floor(total / perBox);
  const [counts, setCounts] = useState<number[]>(Array.from({ length: boxes }, () => 0));
  const used = counts.reduce((a, b) => a + b, 0);
  const remaining = total - used;

  function add(i: number) {
    if (remaining <= 0) return;
    if (counts[i] >= perBox) return;
    setCounts((prev) => prev.map((v, idx) => (idx === i ? v + 1 : v)));
  }

  function check() {
    const ok = counts.every((c) => c === perBox) && remaining === 0;
    if (ok) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-lg font-extrabold text-gray-900 mb-2">
        {total} apples. Pack into boxes of {perBox}.
      </div>
      <div className="text-xs text-gray-500 mb-3">Remaining: {remaining}</div>

      <div className="grid md:grid-cols-3 gap-4">
        {counts.map((count, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
            <div className="text-xs font-bold text-gray-600 mb-2">Box {i + 1}</div>
            <div className="min-h-[30px]">
              <ClickableDotRow count={count} dotSize={18} gap={6} />
            </div>
            <button
              type="button"
              onClick={() => add(i)}
              className="mt-2 px-3 py-2 rounded-lg bg-gray-100 font-bold"
            >
              Add apple
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <button
          onClick={check}
          className="px-5 py-3 rounded-xl bg-teal-600 text-white font-extrabold hover:bg-teal-700 transition"
          type="button"
        >
          Check
        </button>
      </div>
    </div>
  );
}
