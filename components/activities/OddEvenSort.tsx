"use client";

import { useEffect, useMemo, useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import type { OddEvenSortQuestion } from "@/data/activities/year2/lessonEngine";

type Bucket = "odd" | "even";

export default function OddEvenSort({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: OddEvenSortQuestion;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [placements, setPlacements] = useState<Record<string, Bucket | null>>({});
  const [pickedPattern, setPickedPattern] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const nextPlacements = Object.fromEntries(
      questionData.numbers.map((value, index) => [`${value}-${index}`, null])
    ) as Record<string, Bucket | null>;
    setPlacements(nextPlacements);
    setPickedPattern(null);
    setSubmitted(false);
  }, [questionData]);

  const allPlaced = useMemo(
    () => questionData.numbers.every((value, index) => placements[`${value}-${index}`] !== null),
    [placements, questionData.numbers]
  );

  useEffect(() => {
    if (!allPlaced) return;
    if (questionData.mode === "pattern" && !pickedPattern) return;
    if (submitted) return;

    const placedCorrectly = questionData.numbers.every((value, index) => {
      const expected: Bucket = value % 2 === 0 ? "even" : "odd";
      return placements[`${value}-${index}`] === expected;
    });
    const patternCorrect =
      questionData.mode !== "pattern" || pickedPattern === questionData.patternAnswer;

    setSubmitted(true);
    if (placedCorrectly && patternCorrect) onCorrect?.();
    else onWrong?.();
  }, [allPlaced, onCorrect, onWrong, pickedPattern, placements, questionData.mode, questionData.numbers, questionData.patternAnswer, submitted]);

  function assign(value: number, index: number, bucket: Bucket) {
    if (submitted) return;
    setPlacements((current) => ({
      ...current,
      [`${value}-${index}`]: bucket,
    }));
  }

  function bucketValues(bucket: Bucket) {
    return questionData.numbers
      .map((value, index) => ({ value, index }))
      .filter(({ value, index }) => placements[`${value}-${index}`] === bucket);
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
          Odd and Even
        </div>
        <div className="mt-2 flex items-center gap-2">
          <h2 className="text-2xl font-black text-gray-900">{questionData.prompt}</h2>
          <ReadAloudBtn text={questionData.prompt} />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50 p-4">
        <div className="text-xs font-bold uppercase tracking-wide text-teal-700">
          Sort these numbers
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          {questionData.numbers.map((value, index) => (
            <div
              key={`${value}-${index}`}
              className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm"
            >
              <div className="text-center text-3xl font-black text-teal-900">
                {questionData.labels?.[index] ?? value}
              </div>
              <div className="mt-3 flex gap-2">
                {(["odd", "even"] as Bucket[]).map((bucket) => (
                  <button
                    key={bucket}
                    type="button"
                    onClick={() => assign(value, index, bucket)}
                    className={[
                      "rounded-xl px-3 py-2 text-sm font-bold transition",
                      placements[`${value}-${index}`] === bucket
                        ? "bg-teal-700 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                    ].join(" ")}
                  >
                    {bucket === "odd" ? "Odd" : "Even"}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {(["odd", "even"] as Bucket[]).map((bucket) => (
          <div
            key={bucket}
            className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
          >
            <div className="text-xs font-bold uppercase tracking-wide text-gray-500">
              {bucket}
            </div>
            <div className="mt-3 flex min-h-16 flex-wrap gap-2">
              {bucketValues(bucket).length > 0 ? (
                bucketValues(bucket).map(({ value, index }) => (
                  <div
                    key={`${value}-${index}`}
                    className="rounded-xl bg-white px-4 py-2 text-2xl font-black text-gray-900 shadow-sm"
                  >
                    {questionData.labels?.[index] ?? value}
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-400">
                  No numbers placed yet
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {questionData.mode === "pattern" && questionData.patternOptions ? (
        <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50 p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-teal-700">
            What pattern do you notice?
          </div>
          <div className="mt-3 grid gap-2">
            {questionData.patternOptions.map((option) => (
              <button
                key={option}
                type="button"
                disabled={submitted}
                onClick={() => setPickedPattern(option)}
                className={[
                  "rounded-xl border px-4 py-3 text-left text-sm font-bold transition",
                  pickedPattern === option
                    ? "border-teal-300 bg-white text-teal-900"
                    : "border-transparent bg-white/70 text-gray-700 hover:bg-white",
                  submitted ? "opacity-60 cursor-not-allowed" : "",
                ].join(" ")}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
