"use client";

import { useState } from "react";

export default function SubtractMissingPart({
  total,
  part,
  options,
  onCorrect,
  onWrong,
}: {
  total: number;
  part: number;
  options: string[];
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const missing = total - part;

  function choose(opt: string) {
    setPicked(opt);
    if (opt === String(missing)) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-3xl font-black text-gray-900 text-center mb-3">
        {total} - {part} = ?
      </div>
      <div className="text-sm font-bold text-gray-600 mb-2">
        Find the missing part.
      </div>
      <div className="grid grid-cols-2 gap-4 max-w-xl">
        <div className="rounded-2xl border-2 border-gray-200 p-5 text-center">
          <div className="text-xs font-bold text-gray-500 mb-2">Part</div>
          <div className="text-4xl font-black text-gray-900">{part}</div>
        </div>
        <div className="rounded-2xl border-2 border-gray-200 p-5 text-center">
          <div className="text-xs font-bold text-gray-500 mb-2">Part</div>
          <div className="text-4xl font-black text-gray-900">?</div>
        </div>
        <div className="col-span-2 rounded-2xl border-2 border-teal-200 bg-teal-50 p-5 text-center">
          <div className="text-xs font-bold text-teal-700 mb-2">Whole</div>
          <div className="text-5xl font-black text-teal-900">{total}</div>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {options.map((opt, i) => (
          <button
            key={`${opt}-${i}`}
            onClick={() => choose(opt)}
            className={[
              "w-full text-left px-5 py-4 rounded-2xl border text-2xl font-black transition",
              picked === opt
                ? "border-teal-600 bg-teal-50"
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
