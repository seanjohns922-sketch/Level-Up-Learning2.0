"use client";

import { StaticDotRow } from "@/components/StaticDots";

export default function TwoStepGrouping({
  groups,
  perGroup,
  broken,
  itemLabel,
  containerLabel,
  options,
  answer,
  onCorrect,
  onWrong,
}: {
  groups: number;
  perGroup: number;
  broken: number;
  itemLabel: string;
  containerLabel: string;
  options: string[];
  answer: string;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const total = groups * perGroup;

  function choose(opt: string) {
    if (opt === answer) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-lg font-extrabold text-gray-900 mb-3">
        {groups} {containerLabel}. {perGroup} {itemLabel} in each. {broken} {itemLabel} break. How many left?
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
        <div className="mt-3 text-xs font-bold text-rose-600 mb-2">
          Broken {itemLabel}: {broken}
        </div>
        <StaticDotRow
          count={broken}
          dotSize={18}
          gap={6}
          activeClassName="bg-rose-500"
          borderClassName="border border-rose-400"
        />
        <div className="mt-2 text-xs text-gray-500">
          Total: {total}
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
