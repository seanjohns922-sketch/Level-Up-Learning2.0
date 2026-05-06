"use client";

import { useEffect, useRef, useState } from "react";

const MAX_MAB_TENS = 9;
const MAX_MAB_ONES = 9;

export default function MabBuild({
  target,
  maxTens = 10,
  maxOnes = 10,
  onCorrect,
}: {
  target: number;
  maxTens?: number;
  maxOnes?: number;
  onCorrect?: () => void;
}) {
  const safeMaxTens = Math.min(MAX_MAB_TENS, Math.max(0, maxTens));
  const safeMaxOnes = Math.min(MAX_MAB_ONES, Math.max(0, maxOnes));
  const [value, setValue] = useState<{ tens: number; ones: number }>({
    tens: 0,
    ones: 0,
  });
  const hasScoredRef = useRef(false);

  const total = value.tens * 10 + value.ones;

  useEffect(() => {
    if (total === target && !hasScoredRef.current) {
      hasScoredRef.current = true;
      onCorrect?.();
    }
  }, [onCorrect, target, total]);

  useEffect(() => {
    if (maxTens > MAX_MAB_TENS || maxOnes > MAX_MAB_ONES) {
      console.warn("[Level1LessonGuard] MAB builder limits exceeded; clamping applied.", {
        target,
        maxTens,
        maxOnes,
        safeMaxTens,
        safeMaxOnes,
      });
    }
  }, [maxOnes, maxTens, safeMaxOnes, safeMaxTens, target]);

  function toggleTens(idx: number) {
    const next = clampValue(idx < value.tens ? idx : idx + 1, safeMaxTens);
    setValue({ tens: next, ones: value.ones });
    hasScoredRef.current = false;
  }

  function toggleOnes(idx: number) {
    const next = clampValue(idx < value.ones ? idx : idx + 1, safeMaxOnes);
    setValue({ tens: value.tens, ones: next });
    hasScoredRef.current = false;
  }

  function clampValue(next: number, max: number) {
    return Math.min(max, Math.max(0, next));
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-sm text-gray-600 mb-2">Build the number</div>
      <div className="text-2xl font-extrabold text-gray-900 mb-4">
        Target: {target}
      </div>

      <div className="mb-5">
        <div className="text-sm font-bold text-gray-700 mb-2">Tens</div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: safeMaxTens }).map((_, i) => {
            const selected = i < value.tens;
            return (
              <button
                key={`t-${i}`}
                type="button"
                onClick={() => toggleTens(i)}
                className={[
                  "w-10 h-20 rounded-xl border-2 transition",
                  selected
                    ? "border-teal-600 bg-teal-50"
                    : "border-gray-200 bg-white hover:bg-gray-50",
                ].join(" ")}
              >
                <div className="h-full w-full flex flex-col justify-between p-2">
                  {Array.from({ length: 5 }).map((__, k) => (
                    <div
                      key={k}
                      className={[
                        "h-2 rounded",
                        selected ? "bg-teal-600/60" : "bg-gray-200",
                      ].join(" ")}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-sm font-bold text-gray-700 mb-2">Ones</div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: safeMaxOnes }).map((_, i) => {
            const selected = i < value.ones;
            return (
              <button
                key={`o-${i}`}
                type="button"
                onClick={() => toggleOnes(i)}
                className={[
                  "w-10 h-10 rounded-lg border-2 transition",
                  selected
                    ? "border-teal-600 bg-teal-50"
                    : "border-gray-200 bg-white hover:bg-gray-50",
                ].join(" ")}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        {value.tens} tens + {value.ones} ones ={" "}
        <span className="font-bold text-gray-900">{total}</span>
      </div>
    </div>
  );
}
