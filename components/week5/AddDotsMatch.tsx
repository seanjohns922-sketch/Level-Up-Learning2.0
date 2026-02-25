"use client";

import { useState } from "react";

function DotRow({
  count,
  selectedCount,
  setSelectedCount,
}: {
  count: number;
  selectedCount: number;
  setSelectedCount: (n: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {Array.from({ length: count }).map((_, i) => {
        const on = i < selectedCount;
        return (
          <button
            key={i}
            onClick={() => setSelectedCount(i + 1)}
            className={[
              "w-9 h-9 rounded-full border-2 transition",
              on
                ? "border-indigo-600 bg-indigo-100"
                : "border-gray-300 bg-white hover:bg-gray-50",
            ].join(" ")}
            aria-label={`dot ${i + 1}`}
            type="button"
          />
        );
      })}
    </div>
  );
}

export default function AddDotsMatch({
  a,
  b,
  maxDots = 10,
  onCorrect,
  onWrong,
}: {
  a: number;
  b: number;
  maxDots?: number;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [leftSel, setLeftSel] = useState(0);
  const [rightSel, setRightSel] = useState(0);
  const total = leftSel + rightSel;

  function check() {
    if (leftSel === a && rightSel === b) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-sm text-gray-500 font-bold">Make this addition:</div>
      <div className="mt-2 text-4xl font-extrabold text-gray-900 text-center">
        {a} + {b}
      </div>

      <div className="mt-6 grid md:grid-cols-3 gap-4 items-center">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-xs font-bold text-gray-600 mb-3 text-center">
            Left dots (0–{maxDots})
          </div>
          <DotRow
            count={maxDots}
            selectedCount={leftSel}
            setSelectedCount={setLeftSel}
          />
          <div className="mt-3 text-center font-extrabold text-gray-800">
            Selected: {leftSel}
          </div>
        </div>

        <div className="text-center text-5xl font-black text-gray-700">+</div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-xs font-bold text-gray-600 mb-3 text-center">
            Right dots (0–{maxDots})
          </div>
          <DotRow
            count={maxDots}
            selectedCount={rightSel}
            setSelectedCount={setRightSel}
          />
          <div className="mt-3 text-center font-extrabold text-gray-800">
            Selected: {rightSel}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-6">
        <div className="flex-1">
          <div className="text-lg font-bold text-gray-700">
            Total: <span className="text-gray-900">{total}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                className="inline-block h-6 w-6 rounded-full border-2 border-indigo-600 bg-indigo-100"
                aria-hidden
              />
            ))}
          </div>
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
