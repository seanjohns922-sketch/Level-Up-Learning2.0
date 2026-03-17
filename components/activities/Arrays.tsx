"use client";

import { useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import type { ArraysQuestion } from "@/data/activities/year2/lessonEngine";

export default function Arrays({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: ArraysQuestion;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [picked, setPicked] = useState<number | string | null>(null);

  function choose(option: number | string) {
    setPicked(option);
    if (
      (questionData.mode === "repeated_addition" && option === questionData.repeatedAddition) ||
      (questionData.mode !== "repeated_addition" && option === questionData.answer)
    ) {
      onCorrect?.();
    }
    else onWrong?.();
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
          Arrays
        </div>
        <div className="mt-2 flex items-center gap-2">
          <h2 className="text-2xl font-black text-gray-900">{questionData.prompt}</h2>
          <ReadAloudBtn text={questionData.prompt} />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50 p-4">
        <div className="text-xs font-bold uppercase tracking-wide text-teal-700">
          Array model
        </div>
        <div className="mt-4 inline-flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm">
          {Array.from({ length: questionData.rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-2">
              {Array.from({ length: questionData.columns }).map((__, columnIndex) => (
                <div
                  key={`${rowIndex}-${columnIndex}`}
                  className="h-5 w-5 rounded-full bg-teal-600"
                />
              ))}
            </div>
          ))}
        </div>

        <div className="mt-4 text-sm text-teal-800">
          {questionData.mode === "repeated_addition"
            ? `${questionData.rows} rows of ${questionData.columns}`
            : `${questionData.rows} rows × ${questionData.columns} columns`}
        </div>
        {questionData.mode === "repeated_addition" && questionData.repeatedAddition ? (
          <div className="mt-2 text-sm text-teal-900">
            Think: {questionData.columns} added {questionData.rows} times.
          </div>
        ) : null}
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
                ? "border-teal-300 bg-teal-50 text-teal-900"
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
