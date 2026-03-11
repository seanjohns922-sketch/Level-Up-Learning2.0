"use client";

import { useState } from "react";

export default function BarModelBuilder({
  total,
  part,
  missing,
  options,
  answer,
  onCorrect,
  onWrong,
}: {
  total: number;
  part: number;
  missing: number;
  options: string[];
  answer: number;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [typed, setTyped] = useState("");

  function choose(opt: string) {
    if (Number(opt) === answer) onCorrect?.();
    else onWrong?.();
  }

  function checkTyped() {
    if (Number(typed) === answer) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-lg font-extrabold text-gray-900 mb-3">
        Build the bar model.
      </div>
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <div className="text-sm font-bold text-gray-600 mb-2">
          {part} + ? = {total}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-8 rounded-lg bg-teal-200" style={{ flexGrow: part }} />
          <div className="flex-1 h-8 rounded-lg bg-teal-400" style={{ flexGrow: missing }} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value.replace(/[^\d]/g, ""))}
          inputMode="numeric"
          placeholder="Type missing part"
          className="w-full max-w-xs px-4 py-3 rounded-xl border border-gray-300 text-lg font-bold"
        />
        <button
          onClick={checkTyped}
          className="px-5 py-3 rounded-xl bg-teal-600 text-white font-extrabold hover:bg-teal-700 transition"
          type="button"
        >
          Check
        </button>
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
