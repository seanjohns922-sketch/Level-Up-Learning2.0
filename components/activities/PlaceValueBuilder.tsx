"use client";

import { useEffect, useMemo, useState } from "react";
import type { PlaceValueBuilderQuestion, PlaceValueName } from "@/data/activities/year2/lessonEngine";
import ReadAloudBtn from "@/components/ReadAloudBtn";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function placeLabel(place: PlaceValueName) {
  if (place === "hundreds") return "Hundreds";
  if (place === "tens") return "Tens";
  return "Ones";
}

function unitValue(place: PlaceValueName) {
  if (place === "hundreds") return 100;
  if (place === "tens") return 10;
  return 1;
}

function placeCount(questionData: PlaceValueBuilderQuestion, place: PlaceValueName) {
  if (place === "hundreds") return questionData.hundreds;
  if (place === "tens") return questionData.tens;
  return questionData.ones;
}

function MABVisual({
  place,
  count,
}: {
  place: PlaceValueName;
  count: number | null;
}) {
  if (count === null) {
    return (
      <div className="flex min-h-20 items-center justify-center rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 text-3xl font-black text-amber-700">
        ?
      </div>
    );
  }

  if (place === "hundreds") {
    return (
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="h-12 w-12 rounded-xl border border-teal-300 bg-teal-100 shadow-sm"
          />
        ))}
      </div>
    );
  }

  if (place === "tens") {
    return (
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="h-4 w-20 rounded-full border border-cyan-300 bg-cyan-100 shadow-sm"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-5 w-5 rounded-md border border-emerald-300 bg-emerald-100 shadow-sm"
        />
      ))}
    </div>
  );
}

export default function PlaceValueBuilder({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: PlaceValueBuilderQuestion;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [response, setResponse] = useState(0);

  useEffect(() => {
    setResponse(0);
  }, [questionData]);

  const visibleTotal = useMemo(
    () =>
      (questionData.hundreds ?? 0) * 100 +
      (questionData.tens ?? 0) * 10 +
      (questionData.ones ?? 0),
    [questionData.hundreds, questionData.ones, questionData.tens]
  );

  const answerLabel =
    questionData.mode === "identify_number"
      ? "What number is shown?"
      : questionData.mode === "identify_place"
      ? `How many ${placeLabel(questionData.place ?? "ones").toLowerCase()}?`
      : `Missing ${placeLabel(questionData.place ?? "ones").toLowerCase()} value`;

  function check() {
    if (response === questionData.answer) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
          Place Value Builder
        </div>
        <div className="flex items-center gap-2 mt-2">
          <h2 className="text-2xl font-black text-gray-900">{questionData.prompt}</h2>
          <ReadAloudBtn text={questionData.prompt} />
        </div>
        <p className="mt-2 text-sm text-gray-600">{answerLabel}</p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {questionData.placeValues.map((place) => {
          const count = placeCount(questionData, place);

          return (
            <div key={place} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-gray-500">
                {placeLabel(place)}
              </div>
              <div className="mt-4">
                <MABVisual place={place} count={count} />
              </div>
              <div className="mt-3 text-sm text-gray-600">
                {count === null
                  ? "Missing part"
                  : `${count} × ${unitValue(place)} = ${count * unitValue(place)}`}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50 p-4">
        <div className="text-xs font-bold uppercase tracking-wide text-teal-700">
          MAB Total
        </div>
        <div className="mt-2 text-3xl font-black text-teal-900">
          {(questionData.hundreds ?? 0)} hundreds + {(questionData.tens ?? 0)} tens + {(questionData.ones ?? 0)} ones ={" "}
          {visibleTotal}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="number"
          value={response}
          onChange={(event) => setResponse(clamp(Number(event.target.value), 0, 999))}
          placeholder="Type your answer"
          className="w-full max-w-xs rounded-xl border border-gray-300 px-4 py-3 text-lg font-bold text-gray-900 outline-none focus:border-teal-500"
        />
        <button
          type="button"
          onClick={check}
          className="rounded-xl bg-teal-600 px-5 py-3 font-black text-white hover:bg-teal-700"
        >
          Check answer
        </button>
      </div>
    </div>
  );
}
