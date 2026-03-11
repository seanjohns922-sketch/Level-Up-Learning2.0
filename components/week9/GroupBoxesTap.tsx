"use client";

import { useState } from "react";
import { ClickableDotRow } from "@/components/ClickableDots";

export default function GroupBoxesTap({
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
  const used = counts.reduce((a, b) => a + b, 0);
  const remaining = Math.max(0, total - used);
  const perGroup = Math.floor(total / groups);
  const remainder = total % groups;

  function add(i: number) {
    if (remaining <= 0) return;
    setCounts((prev) => prev.map((v, idx) => (idx === i ? v + 1 : v)));
  }

  function check() {
    const equal = counts.every((c) => c === counts[0]);
    const ok = equal && counts[0] === perGroup && remaining === remainder;
    if (ok) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-lg font-extrabold text-gray-900 mb-2">
        Share {total} into {groups} groups (diagram).
      </div>
      <div className="text-xs text-gray-500 mb-3">Remaining: {remaining}</div>

      <div className="grid md:grid-cols-3 gap-4">
        {counts.map((count, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
            <div className="text-xs font-bold text-gray-600 mb-2">Group {i + 1}</div>
            <ClickableDotRow count={count} dotSize={16} gap={6} />
            <button
              type="button"
              onClick={() => add(i)}
              className="mt-2 px-3 py-2 rounded-lg bg-gray-100 font-bold"
            >
              Add dot
            </button>
          </div>
        ))}
      </div>

      {remainder > 0 ? (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <div className="text-xs font-bold text-amber-800 mb-1">Leftover</div>
          <ClickableDotRow
            count={remaining}
            dotSize={16}
            gap={6}
            activeClassName="bg-amber-500"
            borderClassName="border border-amber-300"
          />
        </div>
      ) : null}

      <div className="mt-4 flex items-center gap-3">
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
