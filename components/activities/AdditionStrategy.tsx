"use client";

import { useState } from "react";
import type { AdditionStrategyQuestion } from "@/data/activities/year2/lessonEngine";

export default function AdditionStrategy({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: AdditionStrategyQuestion;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);

  function choose(option: number) {
    setPicked(option);
    if (option === questionData.answer) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
          Addition Strategy
        </div>
        <h2 className="mt-2 text-2xl font-black text-gray-900">
          {questionData.prompt}
        </h2>
        <p className="mt-2 text-sm text-gray-600">{questionData.hint}</p>
      </div>

      <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
        <div className="text-xs font-bold uppercase tracking-wide text-indigo-700">
          Strategy model
        </div>
        <div className="mt-2 text-3xl font-black text-indigo-900">
          {questionData.mode === "jump" &&
            `${questionData.a} -> ${questionData.answer}`}
          {questionData.mode === "split" &&
            `${questionData.a} + ${Math.floor(questionData.b / 10) * 10} + ${
              questionData.b % 10
            }`}
          {questionData.mode === "friendly_numbers" && (() => {
            const bridge = 10 - (questionData.a % 10 || 10);
            return `${questionData.a} + ${bridge} + ${questionData.b - bridge}`;
          })()}
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {questionData.options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => choose(option)}
            className={[
              "rounded-2xl border px-5 py-4 text-left text-2xl font-black transition",
              picked === option
                ? "border-indigo-300 bg-indigo-50 text-indigo-900"
                : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50",
            ].join(" ")}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
