"use client";

import { StaticDotRow } from "@/components/StaticDots";

export default function CombineGroups({
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
        Combine the two groups. How many altogether?
      </div>
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 grid gap-3">
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <div className="text-xs font-bold text-gray-600 mb-2">Red dots</div>
          <StaticDotRow
            count={a}
            dotSize={20}
            gap={6}
            activeClassName="bg-rose-500"
            borderClassName="border border-rose-600"
          />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <div className="text-xs font-bold text-gray-600 mb-2">Blue dots</div>
          <StaticDotRow
            count={b}
            dotSize={20}
            gap={6}
            activeClassName="bg-sky-500"
            borderClassName="border border-sky-600"
          />
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
