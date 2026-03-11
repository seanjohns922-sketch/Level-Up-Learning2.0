"use client";

import { useState } from "react";

export default function SubtractMoveToTaken({
  total,
  remove,
  onCorrect,
  onWrong,
}: {
  total: number;
  remove: number;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [taken, setTaken] = useState<boolean[]>(
    () => Array.from({ length: total }, () => false)
  );

  const takenCount = taken.filter(Boolean).length;
  const remaining = total - takenCount;

  function toggle(i: number) {
    setTaken((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  }

  function check() {
    if (takenCount === remove) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-3xl font-black text-gray-900 text-center mb-3">
        {total} - {remove}
      </div>
      <div className="text-sm font-bold text-gray-600 mb-2">
        Move {remove} dots into the “taken away” box.
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-xs font-bold text-gray-600 mb-3 text-center">
            Remaining
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {taken.map((isTaken, i) =>
              !isTaken ? (
                <button
                  key={i}
                  onClick={() => toggle(i)}
                  className="h-9 w-9 rounded-full border-2 border-teal-600 bg-teal-100"
                  type="button"
                />
              ) : null
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-xs font-bold text-gray-600 mb-3 text-center">
            Taken Away
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {taken.map((isTaken, i) =>
              isTaken ? (
                <button
                  key={i}
                  onClick={() => toggle(i)}
                  className="h-9 w-9 rounded-full border-2 border-rose-500 bg-rose-100"
                  type="button"
                />
              ) : null
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm font-bold text-gray-700">
          Remaining: <span className="text-gray-900">{remaining}</span>
        </div>
        <button
          onClick={check}
          className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-extrabold hover:bg-indigo-700 transition"
          type="button"
        >
          Check
        </button>
      </div>
    </div>
  );
}
