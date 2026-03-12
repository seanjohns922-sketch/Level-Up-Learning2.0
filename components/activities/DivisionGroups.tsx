"use client";

import { useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import type { DivisionGroupsQuestion } from "@/data/activities/year2/lessonEngine";

export default function DivisionGroups({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: DivisionGroupsQuestion;
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
          Division Groups
        </div>
        <div className="mt-2 flex items-center gap-2">
          <h2 className="text-2xl font-black text-gray-900">{questionData.prompt}</h2>
          <ReadAloudBtn text={questionData.prompt} />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50 p-4">
        <div className="text-xs font-bold uppercase tracking-wide text-teal-700">
          Group model
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="rounded-xl bg-white px-4 py-3 text-3xl font-black text-teal-900 shadow-sm">
            {questionData.total}
          </div>
          <div className="text-lg font-bold text-teal-800">shared into groups of</div>
          <div className="rounded-xl bg-white px-4 py-3 text-3xl font-black text-teal-900 shadow-sm">
            {questionData.groupSize}
          </div>
          <div className="text-lg font-bold text-teal-800">= ? groups</div>
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
