"use client";

import { useMemo, useState } from "react";

export default function GroupBoxesBuilder({
  groups,
  perGroup,
  onCorrect,
}: {
  groups: number;
  perGroup: number;
  onCorrect?: () => void;
}) {
  const total = useMemo(() => groups * perGroup, [groups, perGroup]);
  const [counts, setCounts] = useState<number[]>(
    () => Array(groups).fill(0)
  );
  const [status, setStatus] = useState<"idle" | "wrong" | "correct">("idle");

  const used = counts.reduce((a, b) => a + b, 0);
  const remaining = total - used;

  function addTo(i: number) {
    if (remaining <= 0) return;
    setCounts((prev) => {
      const next = [...prev];
      next[i] += 1;
      return next;
    });
    setStatus("idle");
  }

  function removeFrom(i: number) {
    setCounts((prev) => {
      if (prev[i] <= 0) return prev;
      const next = [...prev];
      next[i] -= 1;
      return next;
    });
    setStatus("idle");
  }

  function check() {
    const ok = counts.every((c) => c === perGroup) && remaining === 0;
    setStatus(ok ? "correct" : "wrong");
    if (ok) onCorrect?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-sm text-gray-600 mb-2">Build by grouping</div>
      <div className="text-2xl font-extrabold text-gray-900 mb-2">
        Make {groups} groups of {perGroup}
      </div>
      <div className="text-sm text-gray-500 mb-4">
        Remaining counters: <span className="font-bold">{remaining}</span>
      </div>

      <div className="grid gap-3">
        {counts.map((count, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 bg-gray-50 p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold">Group {i + 1}</div>
              <div className="text-sm font-bold">{count}</div>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {Array.from({ length: count }).map((_, di) => (
                <span
                  key={di}
                  className="inline-block h-6 w-6 rounded-full bg-teal-600"
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => removeFrom(i)}
                className="px-3 py-2 rounded-xl bg-white border border-gray-200 font-bold"
                type="button"
              >
                −
              </button>
              <button
                onClick={() => addTo(i)}
                className="px-3 py-2 rounded-xl bg-teal-600 text-white font-bold"
                type="button"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={check}
          className="px-5 py-3 rounded-xl bg-teal-600 text-white font-extrabold hover:bg-teal-700"
          type="button"
        >
          Check
        </button>
        <div className="text-sm font-bold">
          {status === "correct" ? (
            <span className="text-green-700">✅ Correct!</span>
          ) : status === "wrong" ? (
            <span className="text-red-700">Try again.</span>
          ) : (
            <span className="text-gray-500">Fill every group equally.</span>
          )}
        </div>
      </div>
    </div>
  );
}
