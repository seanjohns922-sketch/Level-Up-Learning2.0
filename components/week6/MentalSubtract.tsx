"use client";

import { useState } from "react";

export default function MentalSubtract({
  strategy,
  total,
  remove,
  options,
  answer,
  onCorrect,
  onWrong,
}: {
  strategy: "make10" | "factFamily" | "countUp";
  total: number;
  remove: number;
  options: string[];
  answer: number;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);

  function choose(opt: string) {
    setPicked(opt);
    if (opt === String(answer)) onCorrect?.();
    else onWrong?.();
  }

  function renderVisual() {
    if (strategy === "make10") {
      const jumpToTen = total - 10;
      const rest = remove - jumpToTen;
      return (
        <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50 p-4">
          <div className="text-xs font-bold text-teal-700 mb-2">
            Make 10 first
          </div>
          <div className="text-sm font-bold text-gray-700">
            1) Take away {jumpToTen} to get to 10
          </div>
          <div className="text-sm font-bold text-gray-700">
            2) Take away the rest ({rest})
          </div>
          <div className="mt-2 text-sm font-bold text-gray-700">
            10 − {rest} = ?
          </div>
        </div>
      );
    }
    if (strategy === "factFamily") {
      return (
        <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <div className="text-xs font-bold text-emerald-700 mb-2">
            Think addition
          </div>
          <div className="text-sm font-bold text-gray-700">
            {remove} + ? = {total}
          </div>
        </div>
      );
    }
    const toTen = total > 10 && remove < 10 ? 10 - remove : Math.min(2, total - remove);
    const rest = total - (remove + toTen);
    return (
      <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-4">
        <div className="text-xs font-bold text-amber-700 mb-2">
          Count up to the number
        </div>
        <div className="text-sm font-bold text-gray-700">
          Start at {remove} and count up to {total}.
        </div>
        <div className="mt-1 text-sm font-bold text-gray-700">
          {remove} → {remove + toTen} (+{toTen})
        </div>
        <div className="text-sm font-bold text-gray-700">
          {remove + toTen} → {total} (+{rest})
        </div>
        <div className="mt-2 text-sm font-bold text-gray-700">
          {toTen} + {rest} = ?
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-3xl font-black text-gray-900 text-center mb-3">
        {total} - {remove}
      </div>
      {renderVisual()}

      <div className="mt-6 grid gap-3">
        {options.map((opt, i) => (
          <button
            key={`${opt}-${i}`}
            onClick={() => choose(opt)}
            className={[
              "w-full text-left px-5 py-4 rounded-2xl border text-2xl font-black transition",
              picked === opt
                ? "border-indigo-600 bg-indigo-50"
                : "border-gray-200 hover:bg-gray-50",
            ].join(" ")}
            type="button"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
