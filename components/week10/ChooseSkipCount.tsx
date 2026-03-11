"use client";

import { useState } from "react";
import { StaticDotRows } from "@/components/StaticDots";

export default function ChooseSkipCount({
  groups,
  perGroup,
  options,
  answer,
  onCorrect,
  onWrong,
}: {
  groups: number;
  perGroup: number;
  options: string[];
  answer: string;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const sequence = Array.from({ length: groups }, (_, i) => (i + 1) * perGroup);

  function choose(opt: string) {
    setPicked(opt);
    if (opt === answer) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-lg font-extrabold text-gray-900 mb-3">
        Choose the skip count.
      </div>
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 mb-3">
        <StaticDotRows
          rows={Array.from({ length: groups }, () => perGroup)}
          dotSize={18}
          gap={6}
          rowGap={10}
          highlightAllRows={true}
          highlightRowClassName="border border-amber-300 rounded-xl px-2 py-1"
        />
      </div>

      <div className="grid gap-2">
        {options.map((opt, i) => (
          <button
            key={`${opt}-${i}`}
            type="button"
            onClick={() => choose(opt)}
            className={[
              "w-full text-left px-4 py-3 rounded-xl border font-bold",
              picked === opt ? "border-teal-500 bg-teal-50" : "border-gray-200 hover:bg-gray-50",
            ].join(" ")}
          >
            {opt}
          </button>
        ))}
      </div>

      {picked ? (
        <div className="mt-3 text-sm font-bold text-gray-700">
          Skip count: {sequence.join(" → ")}
        </div>
      ) : null}
    </div>
  );
}
