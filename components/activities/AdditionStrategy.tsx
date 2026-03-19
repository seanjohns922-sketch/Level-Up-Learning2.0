"use client";

import { useState } from "react";
import type { AdditionStrategyQuestion } from "@/data/activities/year2/lessonEngine";
import ReadAloudBtn from "@/components/ReadAloudBtn";

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
        <div className="flex items-center gap-2 mt-2">
          <h2 className="text-2xl font-black text-gray-900">{questionData.prompt}</h2>
          <ReadAloudBtn text={`${questionData.prompt}. Hint: ${questionData.hint}`} />
        </div>
        <p className="mt-2 text-sm text-gray-600">{questionData.hint}</p>
      </div>

      <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50 p-4">
        <div className="text-xs font-bold uppercase tracking-wide text-teal-700">
          Strategy model
        </div>
        <div className="mt-2 text-3xl font-black text-teal-900">
          {questionData.mode === "jump" &&
            `Start at ${questionData.a}, jump +${questionData.b} → ?`}
          {questionData.mode === "split" &&
            `${questionData.a} + ${Math.floor(questionData.b / 10) * 10} + ${
              questionData.b % 10
            } = ?`}
          {questionData.mode === "doubles" && (() => {
            const n = questionData.a;
            const tens = Math.floor(n / 10) * 10;
            const ones = n % 10;
            if (ones === 0) return `Double ${n} = ?`;
            return `Double ${tens} = ${tens * 2}, double ${ones} = ${ones * 2} → ${tens * 2} + ${ones * 2} = ?`;
          })()}
          {questionData.mode === "near_doubles" && (() => {
            const smaller = Math.min(questionData.a, questionData.b);
            const sTens = Math.floor(smaller / 10) * 10;
            const sOnes = smaller % 10;
            const difference = Math.abs(questionData.a - questionData.b);
            if (sOnes === 0) return `Double ${smaller} = ${smaller * 2}, then +${difference} = ?`;
            return `Double ${sTens} = ${sTens * 2}, double ${sOnes} = ${sOnes * 2} → ${sTens * 2} + ${sOnes * 2} = ${smaller * 2}, then +${difference} = ?`;
          })()}
          {questionData.mode === "friendly_numbers" && (() => {
            const bridge = 10 - (questionData.a % 10 || 10);
            return `${questionData.a} + ${bridge} = ${questionData.a + bridge}, then + ${questionData.b - bridge} = ?`;
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
