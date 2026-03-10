"use client";

import { useMemo, useState } from "react";
import type { NumberLineQuestion } from "@/data/activities/year2/lessonEngine";

export default function NumberLineActivity({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: NumberLineQuestion;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [answer, setAnswer] = useState("");

  const ticks = useMemo(() => {
    const values: number[] = [];
    for (let current = questionData.min; current <= questionData.max; current += questionData.step) {
      values.push(current);
    }
    if (values[values.length - 1] !== questionData.max) values.push(questionData.max);
    return values;
  }, [questionData.max, questionData.min, questionData.step]);

  function check() {
    const numeric = Number(answer);
    if (!Number.isFinite(numeric)) {
      onWrong?.();
      return;
    }

    const difference = Math.abs(numeric - questionData.expected);
    const allowed =
      questionData.mode === "estimate"
        ? Math.max(1, Math.floor(questionData.step / 2))
        : 0;
    if (difference <= allowed) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
          Number Line
        </div>
        <h2 className="mt-2 text-2xl font-black text-gray-900">
          {questionData.prompt}
        </h2>
        <p className="mt-2 text-sm text-gray-600">{questionData.helper}</p>
      </div>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-8">
        <div className="relative mx-auto h-14 max-w-3xl">
          <div className="absolute left-0 right-0 top-6 h-1 rounded-full bg-gray-300" />
          {ticks.map((tick) => {
            const left =
              ((tick - questionData.min) /
                (questionData.max - questionData.min || 1)) *
              100;
            return (
              <div
                key={tick}
                className="absolute top-0 text-center"
                style={{ left: `${left}%`, transform: "translateX(-50%)" }}
              >
                <div className="mx-auto h-6 w-0.5 bg-gray-400" />
                <div className="mt-1 text-xs font-bold text-gray-600">{tick}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          value={answer}
          onChange={(event) => setAnswer(event.target.value.replace(/[^\d]/g, ""))}
          inputMode="numeric"
          placeholder="Type your answer"
          className="w-full max-w-xs rounded-xl border border-gray-300 px-4 py-3 text-lg font-bold text-gray-900 outline-none focus:border-indigo-500"
        />
        <button
          type="button"
          onClick={check}
          className="rounded-xl bg-indigo-600 px-5 py-3 font-black text-white hover:bg-indigo-700"
        >
          Check answer
        </button>
      </div>
    </div>
  );
}
