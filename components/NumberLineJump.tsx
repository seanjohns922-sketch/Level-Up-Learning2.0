"use client";

import { useState } from "react";

export default function NumberLineJump({
  min,
  max,
  start,
  target,
  steps,
  onComplete,
  onMove,
}: {
  min: number;
  max: number;
  start: number;
  target: number;
  steps: number[];
  onComplete: () => void;
  onMove?: (value: number) => void;
}) {
  const [pos, setPos] = useState(start);

  function move(step: number) {
    setPos((p) => {
      const next = Math.max(min, Math.min(max, p + step));
      onMove?.(next);
      if (next === target) setTimeout(() => onComplete(), 500);
      return next;
    });
  }

  return (
    <div className="w-full">
      <div className="text-sm text-gray-600 mb-3">
        Start at {start}. Land exactly on {target}.
      </div>

      <div className="rounded-2xl border bg-white p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">Current</div>
          <div className="text-3xl font-extrabold text-teal-700">{pos}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {steps.map((s) => (
          <button
            key={s}
            onClick={() => move(s)}
            className="rounded-xl bg-teal-600 text-white px-4 py-4 text-xl font-extrabold hover:bg-teal-700 transition"
          >
            {s > 0 ? `+${s}` : s}
          </button>
        ))}
      </div>
    </div>
  );
}
