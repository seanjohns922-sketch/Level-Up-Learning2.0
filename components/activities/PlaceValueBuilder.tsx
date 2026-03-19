"use client";

import { useEffect, useMemo, useState } from "react";
import type { PlaceValueBuilderQuestion, PlaceValueName } from "@/data/activities/year2/lessonEngine";
import ReadAloudBtn from "@/components/ReadAloudBtn";

function placeLabel(place: PlaceValueName) {
  if (place === "ten_thousands") return "Ten Thousands";
  if (place === "thousands") return "Thousands";
  if (place === "hundreds") return "Hundreds";
  if (place === "tens") return "Tens";
  return "Ones";
}

function unitValue(place: PlaceValueName) {
  if (place === "ten_thousands") return 10000;
  if (place === "thousands") return 1000;
  if (place === "hundreds") return 100;
  if (place === "tens") return 10;
  return 1;
}

function placeCount(questionData: PlaceValueBuilderQuestion, place: PlaceValueName) {
  if (place === "ten_thousands") return questionData.tenThousands;
  if (place === "thousands") return questionData.thousands;
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
      <div className="grid grid-cols-3 gap-1.5">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="h-10 w-10 rounded-lg border border-teal-300 bg-teal-100 shadow-sm"
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
            className="h-3 w-16 rounded-full border border-cyan-300 bg-cyan-100 shadow-sm"
          />
        ))}
      </div>
    );
  }

  if (place === "ten_thousands" || place === "thousands") {
    const chipClass =
      place === "ten_thousands"
        ? "border-indigo-300 bg-indigo-100 text-indigo-800"
        : "border-sky-300 bg-sky-100 text-sky-800";
    const chipLabel = place === "ten_thousands" ? "10k" : "1k";
    return (
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={`rounded-lg border px-3 py-1.5 text-sm font-black shadow-sm ${chipClass}`}
          >
            {chipLabel}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-4 w-4 rounded-sm border border-emerald-300 bg-emerald-100 shadow-sm"
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
  const [response, setResponse] = useState("");

  useEffect(() => {
    setResponse("");
  }, [questionData]);

  const visibleTotal = useMemo(
    () =>
      (questionData.tenThousands ?? 0) * 10000 +
      (questionData.thousands ?? 0) * 1000 +
      (questionData.hundreds ?? 0) * 100 +
      (questionData.tens ?? 0) * 10 +
      (questionData.ones ?? 0),
    [
      questionData.tenThousands,
      questionData.thousands,
      questionData.hundreds,
      questionData.ones,
      questionData.tens,
    ]
  );

  const knownBreakdown = useMemo(() => {
    return questionData.placeValues.map((place) => {
      const count = placeCount(questionData, place) ?? 0;
      return `${count} ${placeLabel(place).toLowerCase()}`;
    });
  }, [questionData]);

  const answerLabel =
    questionData.mode === "identify_number"
      ? "What number is shown?"
      : questionData.mode === "identify_place"
      ? `How many ${placeLabel(questionData.place ?? "ones").toLowerCase()}?`
      : `Missing ${placeLabel(questionData.place ?? "ones").toLowerCase()} value`;

  function check() {
    const cleaned = response.trim();
    if (cleaned === "") return;
    const numericResponse = Number(cleaned);
    if (!Number.isFinite(numericResponse)) {
      onWrong?.();
      return;
    }
    if (numericResponse === questionData.answer) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
          Place Value Builder
        </div>
        <div className="flex items-center gap-2 mt-2">
          <h2 className="text-2xl font-black text-gray-900">{questionData.prompt}</h2>
          <ReadAloudBtn text={questionData.prompt} />
        </div>
        <p className="mt-1.5 text-sm text-gray-600">{answerLabel}</p>
        {questionData.mode === "missing_mab_part" ? (
          <div className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900">
            Target number:
            <span className="text-2xl font-black">{questionData.targetNumber}</span>
          </div>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {questionData.placeValues.map((place) => {
          const count = placeCount(questionData, place);

          return (
            <div key={place} className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
              <div className="text-xs font-bold uppercase tracking-wide text-gray-500">
                {placeLabel(place)}
              </div>
              <div className="mt-3">
                <MABVisual place={place} count={count} />
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {count === null
                  ? "Missing part"
                  : `${count} × ${unitValue(place)} = ${count * unitValue(place)}`}
              </div>
            </div>
          );
        })}
      </div>

      {questionData.mode === "identify_number" ? (
        <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <div className="text-xs font-bold uppercase tracking-wide text-teal-700">
            Work it out
          </div>
          <div className="mt-1.5 text-base font-bold text-teal-900">
            Count each place-value block to find the number.
          </div>
        </div>
      ) : questionData.mode === "missing_mab_part" ? (
        <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <div className="text-xs font-bold uppercase tracking-wide text-teal-700">
            Known blocks
          </div>
          <div className="mt-1.5 text-2xl font-black text-teal-900">
            {knownBreakdown.join(" + ")} = {visibleTotal}
          </div>
          <div className="mt-2 text-sm text-teal-800">
            Use the target number to work out the missing value.
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <div className="text-xs font-bold uppercase tracking-wide text-teal-700">
            Place value clue
          </div>
          <div className="mt-1.5 text-2xl font-black text-teal-900">
            {questionData.targetNumber}
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          inputMode="numeric"
          value={response}
          onChange={(event) => setResponse(event.target.value.replace(/[^\d]/g, ""))}
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
