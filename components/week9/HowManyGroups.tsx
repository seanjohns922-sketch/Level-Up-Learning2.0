"use client";

import { useState } from "react";
import { ClickableDotRow } from "@/components/ClickableDots";

export default function HowManyGroups({
  total,
  size,
  onCorrect,
  onWrong,
}: {
  total: number;
  size: number;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [groupsMade, setGroupsMade] = useState(0);
  const remaining = total - groupsMade * size;

  function makeGroup() {
    if (remaining < size) return;
    setGroupsMade((g) => g + 1);
  }

  function answer() {
    const expected = total / size;
    if (groupsMade === expected) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-lg font-extrabold text-gray-900 mb-2">
        {total} counters. Group size = {size}.
      </div>

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 mb-4">
        <div className="text-xs font-bold text-gray-600 mb-2">Counters</div>
        <ClickableDotRow count={remaining} dotSize={18} gap={6} />
      </div>

      <div className="text-sm font-bold text-gray-700 mb-3">
        Groups made: {groupsMade}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={makeGroup}
          className="px-4 py-2 rounded-xl bg-teal-600 text-white font-extrabold hover:bg-teal-700 transition"
        >
          Make a group of {size}
        </button>
        <button
          type="button"
          onClick={answer}
          className="px-4 py-2 rounded-xl bg-gray-100 font-bold"
        >
          How many groups?
        </button>
      </div>
    </div>
  );
}
