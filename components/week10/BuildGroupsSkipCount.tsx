"use client";

import { useMemo, useState } from "react";
import { StaticDotRow } from "@/components/StaticDots";

export default function BuildGroupsSkipCount({
  total,
  perGroup,
  options,
  answer,
  onCorrect,
  onWrong,
}: {
  total: number;
  perGroup: number;
  options: string[];
  answer: string;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const groups = Math.floor(total / perGroup);
  const [groupsMade, setGroupsMade] = useState(0);
  const remaining = total - groupsMade * perGroup;
  const sequence = useMemo(
    () => Array.from({ length: groupsMade }, (_, i) => (i + 1) * perGroup),
    [groupsMade, perGroup]
  );

  function makeGroup() {
    if (groupsMade >= groups) return;
    setGroupsMade((g) => g + 1);
  }

  function choose(opt: string) {
    if (opt === answer) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-lg font-extrabold text-gray-900 mb-2">
        Make groups of {perGroup} using {total} counters.
      </div>
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 mb-3">
        <div className="text-xs font-bold text-gray-600 mb-2">Counters left</div>
        <StaticDotRow count={remaining} dotSize={18} gap={6} />
      </div>

      <div className="flex items-center gap-3 mb-3">
        <button
          type="button"
          onClick={makeGroup}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-extrabold hover:bg-indigo-700 transition"
        >
          Make a group of {perGroup}
        </button>
        <div className="text-sm font-bold text-gray-700">
          Groups made: {groupsMade}/{groups}
        </div>
      </div>

      {groupsMade > 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 mb-3">
          <div className="text-xs font-bold text-gray-600 mb-2">Groups</div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: groupsMade }).map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white p-3">
                <div className="text-xs font-semibold text-gray-500 mb-2">
                  Group {i + 1}
                </div>
                <StaticDotRow count={perGroup} dotSize={18} gap={6} />
              </div>
            ))}
          </div>
          <div className="mt-3 text-sm font-bold text-gray-700">
            Skip count: {sequence.join(" → ")}
          </div>
        </div>
      ) : null}

      <div className="text-sm font-bold text-gray-700 mb-2">
        How many altogether?
      </div>
      <div className="grid gap-2">
        {options.map((opt, i) => (
          <button
            key={`${opt}-${i}`}
            type="button"
            disabled={groupsMade !== groups}
            onClick={() => choose(opt)}
            className={[
              "w-full text-left px-4 py-3 rounded-xl border font-bold",
              groupsMade !== groups
                ? "border-gray-200 text-gray-400"
                : "border-gray-200 hover:bg-gray-50",
            ].join(" ")}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
