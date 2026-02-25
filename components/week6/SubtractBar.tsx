"use client";

import { useState } from "react";

export default function SubtractBar({
  total,
  remove,
  options,
  onCorrect,
  onWrong,
}: {
  total: number;
  remove: number;
  options: string[];
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const answer = total - remove;
  const showFullLabels = total <= 12;

  function choose(opt: string) {
    setPicked(opt);
    if (opt === String(answer)) onCorrect?.();
    else onWrong?.();
  }

  const segments = Array.from({ length: total });

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-3xl font-black text-gray-900 text-center mb-3">
        {total} - {remove}
      </div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
        {segments.map((_, i) => (
          <div
            key={i}
            className={[
              "h-5 rounded-full border border-gray-200",
              i < remove ? "bg-rose-200" : "bg-gray-50",
            ].join(" ")}
          />
        ))}
      </div>
      <div className="mt-2 text-xs text-gray-500">
        Shaded part is taken away.
      </div>
      <div className="mt-3">
        {showFullLabels ? (
          <div
            className="grid text-[11px] text-gray-500"
            style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={[
                  "text-center",
                  i + 1 === answer ? "font-bold text-indigo-700" : "",
                ].join(" ")}
              >
                {i + 1}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-between text-[11px] text-gray-500">
            <span>0</span>
            <span>{Math.round(total / 2)}</span>
            <span>{total}</span>
          </div>
        )}
      </div>

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
