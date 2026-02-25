"use client";

import { useMemo, useState } from "react";
import { StaticDotRows } from "@/components/StaticDots";

export default function TapGroupsSkipCount({
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
  const [tapped, setTapped] = useState<boolean[]>(
    Array.from({ length: groups }, () => false)
  );
  const tappedCount = tapped.filter(Boolean).length;
  const sequence = useMemo(
    () => Array.from({ length: tappedCount }, (_, i) => (i + 1) * perGroup),
    [tappedCount, perGroup]
  );

  function toggle(i: number) {
    setTapped((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  }

  function choose(opt: string) {
    if (opt === answer) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-lg font-extrabold text-gray-900 mb-3">
        Tap each group to skip count.
      </div>
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 mb-3">
        <div className="grid" style={{ rowGap: 10 }}>
          {Array.from({ length: groups }).map((_, gi) => (
            <div
              key={gi}
              role="button"
              tabIndex={0}
              onClick={() => toggle(gi)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") toggle(gi);
              }}
              className={[
                "inline-flex rounded-xl px-2 py-1 border cursor-pointer",
                tapped[gi]
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 bg-white",
              ].join(" ")}
            >
              <StaticDotRows
                rows={[perGroup]}
                dotSize={18}
                gap={6}
                rowGap={0}
                highlightAllRows={true}
                highlightRowClassName="border border-transparent"
              />
            </div>
          ))}
        </div>
        <div className="mt-3 text-sm font-bold text-gray-700">
          Skip count: {sequence.length ? sequence.join(" → ") : "—"}
        </div>
      </div>

      <div className="text-sm font-bold text-gray-700 mb-2">
        How many altogether?
      </div>
      <div className="grid gap-2">
        {options.map((opt, i) => (
          <button
            key={`${opt}-${i}`}
            type="button"
            disabled={tappedCount !== groups}
            onClick={() => choose(opt)}
            className={[
              "w-full text-left px-4 py-3 rounded-xl border font-bold",
              tappedCount !== groups
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
