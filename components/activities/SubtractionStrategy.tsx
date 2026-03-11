"use client";

import { useState } from "react";
import type { SubtractionStrategyQuestion } from "@/data/activities/year2/lessonEngine";

export default function SubtractionStrategy({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: SubtractionStrategyQuestion;
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
          Subtraction Strategy
        </div>
        <h2 className="mt-2 text-2xl font-black text-gray-900">
          {questionData.prompt}
        </h2>
        <p className="mt-2 text-sm text-gray-600">{questionData.hint}</p>
      </div>

      {questionData.mode === "jump" && (() => {
        const tens = Math.floor(questionData.remove / 10) * 10;
        const ones = questionData.remove % 10;
        const afterTens = questionData.total - tens;
        return (
          <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50 p-4">
            <div className="text-xs font-bold uppercase tracking-wide text-teal-700">
              Jump back strategy
            </div>
            <div className="mt-2 text-sm font-bold text-gray-700">
              Start at {questionData.total} and jump back {questionData.remove}.
            </div>
            {tens > 0 && (
              <div className="mt-1 text-sm font-bold text-gray-700">
                {questionData.total} → {afterTens} (−{tens})
              </div>
            )}
            {ones > 0 && (
              <div className="text-sm font-bold text-gray-700">
                {afterTens} → ? (−{ones})
              </div>
            )}
            {tens === 0 && (
              <div className="mt-1 text-sm font-bold text-gray-700">
                {questionData.total} → ? (−{ones})
              </div>
            )}
          </div>
        );
      })()}

      {questionData.mode === "split" && (() => {
        const tens = Math.floor(questionData.remove / 10) * 10;
        const ones = questionData.remove % 10;
        return (
          <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50 p-4">
            <div className="text-xs font-bold uppercase tracking-wide text-teal-700">
              Split strategy
            </div>
            <div className="mt-2 text-sm font-bold text-gray-700">
              Split {questionData.remove} into {tens} and {ones}.
            </div>
            <div className="mt-1 text-sm font-bold text-gray-700">
              {questionData.total} − {tens} − {ones} = ?
            </div>
          </div>
        );
      })()}

      {questionData.mode === "fact_strategy" && (
        <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
            Think addition
          </div>
          <div className="mt-2 text-sm font-bold text-gray-700">
            {questionData.remove} + ? = {questionData.total}
          </div>
        </div>
      )}

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
