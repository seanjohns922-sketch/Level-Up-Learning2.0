"use client";

import { useState } from "react";
import type { FactFamilyQuestion } from "@/data/activities/year2/lessonEngine";

export default function FactFamily({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: FactFamilyQuestion;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);

  function choose(option: string) {
    setPicked(option);
    if (option === questionData.answer) onCorrect?.();
    else onWrong?.();
  }

  const [a, b, total] = questionData.family;

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
          Fact Family
        </div>
        <h2 className="mt-2 text-2xl font-black text-gray-900">
          {questionData.prompt}
        </h2>
      </div>

      <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
        <div className="text-xs font-bold uppercase tracking-wide text-indigo-700">
          Family numbers
        </div>
        <div className="mt-2 flex flex-wrap gap-3">
          {[a, b, total].map((value) => (
            <div
              key={value}
              className="rounded-xl bg-white px-5 py-3 text-3xl font-black text-indigo-900 shadow-sm"
            >
              {value}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {questionData.options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => choose(option)}
            className={[
              "rounded-2xl border px-5 py-4 text-left text-xl font-black transition",
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
