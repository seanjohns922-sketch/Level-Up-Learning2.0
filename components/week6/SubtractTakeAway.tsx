"use client";

import { useState } from "react";

export default function SubtractTakeAway({
  total,
  remove,
  mode,
  onCorrect,
  onWrong,
}: {
  total: number;
  remove: number;
  mode: "equation" | "takeAway" | "startWith";
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [removed, setRemoved] = useState<boolean[]>(
    () => Array.from({ length: total }, () => false)
  );

  const removedCount = removed.filter(Boolean).length;
  const remaining = total - removedCount;

  function toggle(i: number) {
    setRemoved((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  }

  function check() {
    if (removedCount === remove) onCorrect?.();
    else onWrong?.();
  }

  const prompt =
    mode === "takeAway"
      ? `Take away ${remove}`
      : mode === "startWith"
      ? `Start with ${total}. Take away ${remove}.`
      : "";
  const cols = total <= 10 ? 5 : total <= 15 ? 6 : 7;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-4xl font-black text-gray-900 text-center mb-2">
        {total} - {remove}
      </div>
      {prompt ? (
        <div className="text-sm font-bold text-gray-600 mb-2">{prompt}</div>
      ) : null}
      <div
        className="grid gap-2 justify-center"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 36px))` }}
      >
        {removed.map((isRemoved, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className={[
              "h-9 w-9 rounded-full border-2 transition",
              isRemoved
                ? "border-gray-300 bg-gray-100 opacity-40"
                : "border-teal-600 bg-teal-100",
            ].join(" ")}
            type="button"
          />
        ))}
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
