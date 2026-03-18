"use client";

import { useState } from "react";
import type { FactFamilyQuestion } from "@/data/activities/year2/lessonEngine";
import ReadAloudBtn from "@/components/ReadAloudBtn";

function normalize(s: string) {
  return s.replace(/\s+/g, "").toLowerCase();
}

export default function FactFamilyWrite({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: FactFamilyQuestion;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [inputs, setInputs] = useState(["", "", "", ""]);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  const [a, b, total] = questionData.family;

  const correctSentences = [
    `${a}+${b}=${total}`,
    `${b}+${a}=${total}`,
    `${total}-${a}=${b}`,
    `${total}-${b}=${a}`,
  ];

  function updateInput(index: number, value: string) {
    if (submitted) return;
    setInputs((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function check() {
    if (submitted) return;
    setSubmitted(true);

    const normalizedInputs = inputs.map(normalize);
    const remaining = [...correctSentences];
    const matchResults: boolean[] = [];

    for (const input of normalizedInputs) {
      const idx = remaining.findIndex((c) => c === input);
      if (idx !== -1) {
        matchResults.push(true);
        remaining.splice(idx, 1);
      } else {
        matchResults.push(false);
      }
    }

    setResults(matchResults);
    if (matchResults.every(Boolean) && remaining.length === 0) onCorrect?.();
    else onWrong?.();
  }

  const labels = ["Addition 1", "Addition 2", "Subtraction 1", "Subtraction 2"];
  const allFilled = inputs.every((v) => v.trim().length > 0);

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
          Fact Family — Write Sentences
        </div>
        <div className="flex items-center gap-2 mt-2">
          <h2 className="text-2xl font-black text-gray-900">
            Write 4 number sentences for this fact family
          </h2>
          <ReadAloudBtn text="Write 4 number sentences for this fact family" />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Write 2 addition and 2 subtraction sentences using these numbers.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50 p-4">
        <div className="text-xs font-bold uppercase tracking-wide text-teal-700">
          Family numbers
        </div>
        <div className="mt-2 flex flex-wrap gap-3">
          {[a, b, total].map((value, i) => (
            <div
              key={`${value}-${i}`}
              className="rounded-xl bg-white px-5 py-3 text-3xl font-black text-teal-900 shadow-sm"
            >
              {value}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {labels.map((label, i) => {
          const isCorrect = results[i];
          let borderCls = "border-gray-200";
          if (submitted) {
            borderCls = isCorrect ? "border-emerald-400 bg-emerald-50" : "border-red-400 bg-red-50";
          }

          return (
            <div key={label}>
              <label className="text-xs font-bold uppercase tracking-wide text-gray-500">
                {label}
              </label>
              <input
                value={inputs[i]}
                onChange={(e) => updateInput(i, e.target.value)}
                placeholder={i < 2 ? "e.g. 5 + 13 = 18" : "e.g. 18 - 5 = 13"}
                disabled={submitted}
                className={`mt-1 w-full rounded-xl border px-4 py-3 text-lg font-bold text-gray-900 outline-none focus:border-teal-500 ${borderCls}`}
              />
              {submitted && !isCorrect && (
                <p className="mt-1 text-sm text-red-600">
                  Try: {correctSentences[i].replace(/([+\-=])/g, " $1 ")}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && allFilled && (
        <button
          type="button"
          onClick={check}
          className="mt-4 w-full rounded-2xl bg-teal-600 px-5 py-4 text-lg font-black text-white hover:bg-teal-700 transition"
        >
          Check answers
        </button>
      )}
    </div>
  );
}
