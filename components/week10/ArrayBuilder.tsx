"use client";

import { StaticDotGrid } from "@/components/StaticDots";

export default function ArrayBuilder({
  rows,
  cols,
  options,
  answer,
  onCorrect,
  onWrong,
}: {
  rows: number;
  cols: number;
  options: string[];
  answer: string;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const total = rows * cols;

  function choose(opt: string) {
    if (opt === answer) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-lg font-extrabold text-gray-900 mb-3">
        Array: {rows} rows and {cols} columns. How many dots?
      </div>
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 mb-3">
        <StaticDotGrid count={total} cols={cols} rows={rows} dotSize={18} gap={8} />
      </div>

      <div className="grid gap-2">
        {options.map((opt, i) => (
          <button
            key={`${opt}-${i}`}
            type="button"
            onClick={() => choose(opt)}
            className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-bold"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
