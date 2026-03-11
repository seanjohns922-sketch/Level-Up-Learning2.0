"use client";

import { useState } from "react";
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

function digitForPlace(value: number, place: PlaceValueName) {
  if (place === "hundreds") return Math.floor(value / 100) % 10;
  if (place === "tens") return Math.floor(value / 10) % 10;
  return value % 10;
}

function unitValue(place: PlaceValueName) {
  if (place === "hundreds") return 100;
  if (place === "tens") return 10;
  return 1;
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
  const [digits, setDigits] = useState<Record<PlaceValueName, number>>(() => {
    const initial: Record<PlaceValueName, number> = {
      hundreds:
        questionData.hiddenPlace === "hundreds"
          ? 0
          : questionData.hiddenPlace
          ? digitForPlace(questionData.target, "hundreds")
          : 0,
      tens:
        questionData.hiddenPlace === "tens"
          ? 0
          : questionData.hiddenPlace
          ? digitForPlace(questionData.target, "tens")
          : 0,
      ones:
        questionData.hiddenPlace === "ones"
          ? 0
          : questionData.hiddenPlace
          ? digitForPlace(questionData.target, "ones")
          : 0,
    };

    return initial;
  });

  const builtValue = digits.hundreds * 100 + digits.tens * 10 + digits.ones;

  function setDigit(place: PlaceValueName, next: number) {
    setDigits((current) => ({
      ...current,
      [place]: clamp(next, 0, 9),
    }));
  }

  function check() {
    if (builtValue === questionData.target) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
          Place Value Builder
        </div>
        <h2 className="mt-2 text-2xl font-black text-gray-900">
          {questionData.hiddenPlace
            ? `Find the missing ${placeLabel(questionData.hiddenPlace).toLowerCase()} digit`
            : "Build the number with hundreds, tens, and ones"}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Target number:{" "}
          <span className="font-black text-gray-900">{questionData.target}</span>
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {questionData.placeValues.map((place) => {
          const actual = digitForPlace(questionData.target, place);
          const isLocked = questionData.hiddenPlace !== null && questionData.hiddenPlace !== place;
          const displayValue = isLocked ? actual : digits[place];

          return (
            <div key={place} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-gray-500">
                {placeLabel(place)}
              </div>
              <div className="mt-2 text-4xl font-black text-gray-900">{displayValue}</div>
              <div className="mt-3 text-sm text-gray-600">
                Value: {displayValue * unitValue(place)}
              </div>
              {isLocked ? (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800">
                  Given to the learner
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDigit(place, digits[place] - 1)}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 font-black text-gray-700 hover:bg-gray-100"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => setDigit(place, 0)}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 font-black text-gray-700 hover:bg-gray-100"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => setDigit(place, digits[place] + 1)}
                    className="rounded-xl bg-emerald-600 px-3 py-2 font-black text-white hover:bg-emerald-700"
                  >
                    +1
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50 p-4">
        <div className="text-xs font-bold uppercase tracking-wide text-teal-700">
          Built Number
        </div>
        <div className="mt-2 text-3xl font-black text-teal-900">
          {digits.hundreds} hundreds + {digits.tens} tens + {digits.ones} ones ={" "}
          {builtValue}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
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
