"use client";

import { ClickableDotRow } from "@/components/ClickableDots";

export default function MissingGroupSize({
  total,
  groups,
  options,
  answer,
  onCorrect,
  onWrong,
}: {
  total: number;
  groups: number;
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
        {total} shared into {groups} groups (diagram).
      </div>
      <div className="text-sm font-bold text-gray-600 mb-3">
        Each group has ___
      </div>
      <div className="text-xs text-gray-500 mb-3">
        {total} ÷ {groups} = ?
      </div>
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 mb-4">
        <div className="text-xs font-bold text-gray-600 mb-2">Total counters</div>
        <ClickableDotRow count={total} dotSize={16} gap={6} />
        <div className="grid md:grid-cols-3 gap-3 mt-3">
          {Array.from({ length: groups }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-3 text-center">
              <div className="text-xs font-bold text-gray-500 mb-2">Group {i + 1}</div>
              <div className="text-xl font-black text-gray-700">?</div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-2">
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
