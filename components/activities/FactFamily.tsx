"use client";

import { useState, useMemo } from "react";
import type { FactFamilyQuestion } from "@/data/activities/year2/lessonEngine";
import ReadAloudBtn from "@/components/ReadAloudBtn";

export default function FactFamily({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: FactFamilyQuestion;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const correctSet = useMemo(
    () => new Set(questionData.answers),
    [questionData.answers]
  );

  function toggle(option: string) {
    if (submitted) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(option)) next.delete(option);
      else next.add(option);
      return next;
    });
  }

  function submit() {
    if (submitted) return;
    setSubmitted(true);
    const allCorrectPicked = [...correctSet].every((a) => selected.has(a));
    const noWrongPicked = [...selected].every((s) => correctSet.has(s));
    if (allCorrectPicked && noWrongPicked) onCorrect?.();
    else onWrong?.();
  }

  const [a, b, total] = questionData.family;
  const visual = questionData.visual;

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
          Fact Family
        </div>
        <div className="flex items-center gap-2 mt-2">
          <h2 className="text-2xl font-black text-gray-900">
            {questionData.prompt}
          </h2>
          <ReadAloudBtn text={questionData.prompt} />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Tap all correct sentences, then press Check.
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
        {visual?.type === "array" ? (
          <div className="mt-4 inline-flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm">
            {Array.from({ length: visual.rows }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex gap-2">
                {Array.from({ length: visual.columns }).map((__, columnIndex) => (
                  <div key={`${rowIndex}-${columnIndex}`} className="h-5 w-5 rounded-full bg-teal-600" />
                ))}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid gap-3">
        {questionData.options.map((option) => {
          const isSelected = selected.has(option);
          const isCorrect = correctSet.has(option);
          let cls =
            "rounded-2xl border px-5 py-4 text-left text-xl font-black transition";

          if (submitted) {
            if (isCorrect && isSelected)
              cls += " border-emerald-300 bg-emerald-50 text-emerald-900";
            else if (!isCorrect && isSelected)
              cls += " border-red-300 bg-red-50 text-red-900";
            else if (isCorrect && !isSelected)
              cls += " border-amber-300 bg-amber-50 text-amber-900";
            else cls += " border-gray-200 bg-white text-gray-400";
          } else if (isSelected) {
            cls += " border-teal-300 bg-teal-50 text-teal-900 ring-2 ring-teal-200";
          } else {
            cls += " border-gray-200 bg-white text-gray-900 hover:bg-gray-50";
          }

          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={cls}
            >
              {option}
              {isSelected && !submitted && (
                <span className="ml-2 text-sm">✓</span>
              )}
            </button>
          );
        })}
      </div>

      {!submitted && selected.size > 0 && (
        <button
          type="button"
          onClick={submit}
          className="mt-4 w-full rounded-2xl bg-teal-600 px-5 py-4 text-lg font-black text-white hover:bg-teal-700 transition"
        >
          Check ({selected.size} selected)
        </button>
      )}
    </div>
  );
}
