"use client";

import { useState } from "react";
import { ClickableDotRow } from "@/components/ClickableDots";

export default function GroupGrabBags({
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

  function check() {
    const ok = remaining === 0;
    if (ok) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-lg font-extrabold text-gray-900 mb-2">
        Make equal groups of {size} from {total} counters.
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
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-extrabold hover:bg-indigo-700 transition"
        >
          Make a group of {size}
        </button>
        <button
          type="button"
          onClick={check}
          className="px-4 py-2 rounded-xl bg-gray-100 font-bold"
        >
          Check
        </button>
      </div>

      {groupsMade > 0 ? (
        <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-xs font-bold text-gray-600 mb-3">Groups</div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: groupsMade }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-200 bg-white p-3"
              >
                <div className="text-xs font-semibold text-gray-500 mb-2">
                  Group {i + 1}
                </div>
                <ClickableDotRow count={size} dotSize={18} gap={6} />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
