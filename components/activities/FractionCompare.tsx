"use client";

import { useState } from "react";
import type { FractionCompareQuestion } from "@/data/activities/year2/lessonEngine";
import ReadAloudBtn from "@/components/ReadAloudBtn";

function fractionValue(label: string) {
  const [numerator, denominator] = label.split("/").map(Number);
  return numerator / denominator;
}

export default function FractionCompare({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: FractionCompareQuestion;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);

  const options =
    questionData.mode === "symbol_compare"
      ? [">", "<", "="]
      : questionData.mode === "visual_compare"
      ? [questionData.leftFraction, questionData.rightFraction]
      : ["true", "false"];

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-black text-gray-900">{questionData.prompt}</h2>
        <ReadAloudBtn text={questionData.prompt} />
      </div>

      <div className="mt-6 grid gap-4 rounded-2xl border border-rose-100 bg-rose-50 p-4 sm:grid-cols-2">
        {[questionData.leftFraction, questionData.rightFraction].map((fraction) => (
          <div key={fraction} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="text-center text-3xl font-black text-rose-900">{fraction}</div>
            <div className="mt-4 grid h-16 grid-cols-4 gap-2">
              {Array.from({ length: Number(fraction.split("/")[1]) }).map((_, index) => (
                <div
                  key={index}
                  className={[
                    "rounded-lg border-2",
                    index < fractionValue(fraction) * Number(fraction.split("/")[1])
                      ? "border-rose-500 bg-rose-400"
                      : "border-slate-300 bg-slate-100",
                  ].join(" ")}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setPicked(option)}
            className={[
              "rounded-2xl border px-5 py-4 text-xl font-black transition",
              picked === option ? "border-rose-400 bg-rose-50 text-rose-900" : "border-gray-200 bg-white text-gray-900",
            ].join(" ")}
          >
            {option}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => (picked === questionData.answer ? onCorrect?.() : onWrong?.())}
        disabled={!picked}
        className="mt-4 w-full rounded-2xl bg-rose-600 px-5 py-3 font-black text-white hover:bg-rose-700 disabled:opacity-40"
      >
        Check comparison
      </button>
    </div>
  );
}
