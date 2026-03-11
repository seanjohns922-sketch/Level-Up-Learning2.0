"use client";

import { useState } from "react";

export default function NumberLadder({
  start,
  target,
  onComplete,
}: {
  start: number;
  target: number;
  onComplete?: () => void;
}) {
  const [pos, setPos] = useState(start);
  const [status, setStatus] = useState<"idle" | "correct">("idle");

  function step(dir: 1 | -1) {
    if (status === "correct") return;
    setPos((p) => {
      const next = p + dir;
      if (next === target) {
        setStatus("correct");
        setTimeout(() => onComplete?.(), 600);
      }
      return next;
    });
  }

  const lower = Math.min(start, target);
  const upper = Math.max(start, target);
  const ladder = Array.from({ length: upper - lower + 1 }, (_, i) => lower + i);

  return (
    <div className="w-full">
      <div className="mb-4 text-sm text-gray-600">Number Ladder</div>

      <div className="text-2xl font-extrabold mb-2">
        Climb from <span className="text-gray-900">{start}</span> to{" "}
        <span className="text-teal-600">{target}</span>
      </div>

      <div className="flex justify-center my-6">
        <div className="flex flex-col gap-2">
          {ladder.map((n) => (
            <div
              key={n}
              className={[
                "w-24 h-10 flex items-center justify-center rounded-lg border font-bold",
                n === pos ? "bg-teal-600 text-white" : "bg-white",
              ].join(" ")}
            >
              {n}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => step(-1)}
          className="flex-1 py-4 bg-gray-200 rounded-xl font-extrabold"
          type="button"
        >
          −1
        </button>
        <button
          onClick={() => step(1)}
          className="flex-1 py-4 bg-teal-600 text-white rounded-xl font-extrabold"
          type="button"
        >
          +1
        </button>
      </div>

      {status === "correct" && (
        <div className="mt-3 text-green-600 font-bold">🏁 Finished!</div>
      )}
    </div>
  );
}
