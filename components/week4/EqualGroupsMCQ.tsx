"use client";

import { useState } from "react";

type Option = { groups: number[] };

export default function EqualGroupsMCQ({
  prompt,
  options,
  correctIndex,
  onCorrect,
}: {
  prompt: string;
  options: Option[];
  correctIndex: number;
  onCorrect?: () => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "wrong" | "correct">("idle");

  function choose(idx: number) {
    setPicked(idx);
    const ok = idx === correctIndex;
    setStatus(ok ? "correct" : "wrong");
    if (ok) onCorrect?.();
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6">
      <div className="text-2xl font-extrabold text-gray-900 mb-2">
        {prompt}
      </div>
      <div className="text-sm text-gray-500 mb-5">
        Tap the picture that shows equal groups.
      </div>

      <div className="grid gap-3">
        {options.map((opt, idx) => {
          const selected = picked === idx;
          return (
            <button
              key={idx}
              onClick={() => choose(idx)}
              className={[
                "rounded-2xl border p-4 text-left transition",
                selected
                  ? status === "correct"
                    ? "border-green-400 bg-green-50"
                    : "border-red-300 bg-red-50"
                  : "border-gray-200 bg-white hover:bg-gray-50",
              ].join(" ")}
              type="button"
            >
              <div className="grid gap-2">
                {opt.groups.map((count, gi) => (
                  <div key={gi} className="flex items-center gap-1">
                    {Array.from({ length: count }).map((_, di) => (
                      <span
                        key={di}
                        className="h-3 w-3 rounded-full bg-indigo-600"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 text-sm font-bold">
        {status === "correct" ? (
          <span className="text-green-700">✅ Correct!</span>
        ) : status === "wrong" ? (
          <span className="text-red-700">Not quite — try again.</span>
        ) : (
          <span className="text-gray-500">Choose a picture.</span>
        )}
      </div>
    </div>
  );
}
