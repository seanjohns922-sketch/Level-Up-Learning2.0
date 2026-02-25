"use client";

import { useEffect, useState } from "react";

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
  const [value, setValue] = useState<{ tens: number; ones: number }>({
    tens: 0,
    ones: 0,
  });

  const total = value.tens * 10 + value.ones;

  useEffect(() => {
    if (total === target) onCorrect?.();
  }, [total, target, onCorrect]);

  function toggleTens(idx: number) {
    const next = idx < value.tens ? idx : idx + 1;
    setValue({ tens: next, ones: value.ones });
  }

  function toggleOnes(idx: number) {
    const next = idx < value.ones ? idx : idx + 1;
    setValue({ tens: value.tens, ones: next });
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
          {Array.from({ length: maxTens }).map((_, i) => {
            const selected = i < value.tens;
            return (
              <button
                key={`t-${i}`}
                type="button"
                onClick={() => toggleTens(i)}
                className={[
                  "w-10 h-20 rounded-xl border-2 transition",
                  selected
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-200 bg-white hover:bg-gray-50",
                ].join(" ")}
              >
                <div className="h-full w-full flex flex-col justify-between p-2">
                  {Array.from({ length: 5 }).map((__, k) => (
                    <div
                      key={k}
                      className={[
                        "h-2 rounded",
                        selected ? "bg-indigo-600/60" : "bg-gray-200",
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
          {Array.from({ length: maxOnes }).map((_, i) => {
            const selected = i < value.ones;
            return (
              <button
                key={`o-${i}`}
                type="button"
                onClick={() => toggleOnes(i)}
                className={[
                  "w-10 h-10 rounded-lg border-2 transition",
                  selected
                    ? "border-indigo-600 bg-indigo-50"
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
