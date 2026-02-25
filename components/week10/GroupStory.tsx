"use client";

import { StaticDotRow } from "@/components/StaticDots";

export default function GroupStory({
  groups,
  perGroup,
  itemLabel,
  containerLabel,
  options,
  answer,
  onCorrect,
  onWrong,
}: {
  groups: number;
  perGroup: number;
  itemLabel: string;
  containerLabel: string;
  options: string[];
  answer: string;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  function choose(opt: string) {
    if (opt === answer) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-lg font-extrabold text-gray-900 mb-3">
        {groups} {containerLabel}. Each has {perGroup} {itemLabel}. How many {itemLabel}?
      </div>
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 mb-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: groups }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-3">
              <div className="text-xs font-bold text-gray-600 mb-2">
                {containerLabel.slice(0, 1).toUpperCase() + containerLabel.slice(1)} {i + 1}
              </div>
              <StaticDotRow count={perGroup} dotSize={18} gap={6} />
            </div>
          ))}
        </div>
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
