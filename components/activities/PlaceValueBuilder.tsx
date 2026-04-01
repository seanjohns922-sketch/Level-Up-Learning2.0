"use client";

import { useEffect, useMemo, useState } from "react";
import type { PlaceValueBuilderQuestion, PlaceValueName } from "@/data/activities/year2/lessonEngine";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import PlaceValueMABVisual from "@/components/activities/PlaceValueMABVisual";

function placeLabel(place: PlaceValueName) {
  if (place === "hundred_thousands") return "Hundred Thousands";
  if (place === "ten_thousands") return "Ten Thousands";
  if (place === "thousands") return "Thousands";
  if (place === "hundreds") return "Hundreds";
  if (place === "tens") return "Tens";
  return "Ones";
}

function placeCount(questionData: PlaceValueBuilderQuestion, place: PlaceValueName) {
  if (place === "hundred_thousands") return questionData.hundredThousands;
  if (place === "ten_thousands") return questionData.tenThousands;
  if (place === "thousands") return questionData.thousands;
  if (place === "hundreds") return questionData.hundreds;
  if (place === "tens") return questionData.tens;
  return questionData.ones;
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

  const mabVisualData = useMemo(
    () => ({
      type: "mab" as const,
      placeValues: questionData.placeValues,
      hundredThousands: questionData.hundredThousands,
      tenThousands: questionData.tenThousands,
      thousands: questionData.thousands,
      hundreds: questionData.hundreds,
      tens: questionData.tens,
      ones: questionData.ones,
    }),
    [questionData]
  );

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

      <PlaceValueMABVisual questionData={mabVisualData} title="MAB model" />

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
          <div className="mt-1.5 text-base font-bold text-teal-900">
            Count the visible blocks and use the target number to work out the missing value.
          </div>
          <div className="mt-2 text-sm text-teal-800">
            Use the target number to work out the missing value.
          </div>
        </div>
      ) : null}

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
