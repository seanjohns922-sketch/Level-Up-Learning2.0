"use client";

import { StaticDotRow } from "@/components/StaticDots";

export default function CompareGroups({
  a,
  b,
  options,
  answer,
  onCorrect,
  onWrong,
}: {
  a: number;
  b: number;
  options: string[];
  answer: number;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  function choose(opt: string) {
    if (Number(opt) === answer) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-lg font-extrabold text-gray-900 mb-3">
        How many more does the top row have?
      </div>
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 grid gap-3">
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <div className="text-xs font-bold text-gray-600 mb-2">Top</div>
          <StaticDotRow count={a} dotSize={20} gap={6} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <div className="text-xs font-bold text-gray-600 mb-2">Bottom</div>
          <StaticDotRow count={b} dotSize={20} gap={6} />
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {options.map((opt, i) => (
          <button
            key={`${opt}-${i}`}
            onClick={() => choose(opt)}
            className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-bold"
            type="button"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
