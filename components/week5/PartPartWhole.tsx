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
                ? "border-teal-600 bg-teal-100"
                : "border-gray-300 bg-white hover:bg-gray-50",
            ].join(" ")}
            type="button"
          />
        );
      })}
    </div>
  );
}

export default function PartPartWhole({
  mode,
  a,
  b,
  whole,
  missing,
  onCorrect,
  onWrong,
}: {
  mode: "missingWhole" | "missingPart" | "build";
  a: number;
  b: number;
  whole: number;
  missing?: "a" | "b";
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [typed, setTyped] = useState("");
  const [leftSel, setLeftSel] = useState(0);
  const [rightSel, setRightSel] = useState(0);
  const [showDots, setShowDots] = useState(true);

  const showA = !(mode === "missingPart" && missing === "a");
  const showB = !(mode === "missingPart" && missing === "b");
  const showWhole = mode !== "missingWhole";

  function checkTyped() {
    const n = Number(typed);
    const ok =
      mode === "missingWhole"
        ? n === whole
        : missing === "a"
        ? n === a
        : n === b;
    if (ok) onCorrect?.();
    else onWrong?.();
  }

  function checkBuild() {
    if (leftSel === a && rightSel === b) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-sm text-gray-600 font-bold mb-2">
        {mode === "missingWhole"
          ? "What is the WHOLE?"
          : mode === "missingPart"
          ? "What is the missing PART?"
          : "Build the two parts with dots."}
      </div>
      <label className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={showDots}
          onChange={(e) => setShowDots(e.target.checked)}
        />
        Show dot markers
      </label>

      <div className="grid grid-cols-2 gap-4 max-w-xl">
        <div className="rounded-2xl border-2 border-gray-200 p-5 text-center">
          <div className="text-xs font-bold text-gray-500 mb-2">Part</div>
          <div className="text-4xl font-black text-gray-900">
            {mode === "missingPart" && missing === "a" ? "?" : a}
          </div>
          {showDots && showA ? (
            <div className="mt-3 flex flex-wrap gap-1 justify-center">
              {Array.from({ length: a }).map((_, i) => (
                <span
                  key={i}
                  className="inline-block h-4 w-4 rounded-full bg-teal-600"
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border-2 border-gray-200 p-5 text-center">
          <div className="text-xs font-bold text-gray-500 mb-2">Part</div>
          <div className="text-4xl font-black text-gray-900">
            {mode === "missingPart" && missing === "b" ? "?" : b}
          </div>
          {showDots && showB ? (
            <div className="mt-3 flex flex-wrap gap-1 justify-center">
              {Array.from({ length: b }).map((_, i) => (
                <span
                  key={i}
                  className="inline-block h-4 w-4 rounded-full bg-teal-600"
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="col-span-2 rounded-2xl border-2 border-teal-200 bg-teal-50 p-5 text-center">
          <div className="text-xs font-bold text-teal-700 mb-2">Whole</div>
          <div className="text-5xl font-black text-teal-900">
            {mode === "missingWhole" ? "?" : whole}
          </div>
          {showDots && showWhole ? (
            <div className="mt-3 flex flex-wrap gap-1 justify-center">
              {Array.from({ length: whole }).map((_, i) => (
                <span
                  key={i}
                  className="inline-block h-4 w-4 rounded-full bg-teal-700"
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {mode === "build" ? (
        <div className="mt-6 grid md:grid-cols-3 gap-4 items-center">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-xs font-bold text-gray-600 mb-3 text-center">
              Left dots (0–10)
            </div>
            <DotRow count={10} selectedCount={leftSel} setSelectedCount={setLeftSel} />
            <div className="mt-3 text-center font-extrabold text-gray-800">
              Selected: {leftSel}
            </div>
          </div>

          <div className="text-center text-5xl font-black text-gray-700">+</div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-xs font-bold text-gray-600 mb-3 text-center">
              Right dots (0–10)
            </div>
            <DotRow count={10} selectedCount={rightSel} setSelectedCount={setRightSel} />
            <div className="mt-3 text-center font-extrabold text-gray-800">
              Selected: {rightSel}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex items-center gap-3">
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value.replace(/[^\d]/g, ""))}
            inputMode="numeric"
            placeholder="Type the missing number"
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
      )}

      {mode === "build" ? (
        <div className="mt-6 flex items-center justify-end">
          <button
            onClick={checkBuild}
            className="px-5 py-3 rounded-xl bg-teal-600 text-white font-extrabold hover:bg-teal-700 transition"
            type="button"
          >
            Check
          </button>
        </div>
      ) : null}
    </div>
  );
}
