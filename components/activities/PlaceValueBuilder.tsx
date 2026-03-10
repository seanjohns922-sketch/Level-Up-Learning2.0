"use client";

import { useEffect, useMemo, useState } from "react";

type PlaceValueName = "hundreds" | "tens" | "ones";

type PlaceValueBuilderConfig = {
  min?: number;
  max?: number;
  placeValues?: PlaceValueName[];
  hideOnePlaceValue?: boolean;
};

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
  config,
}: {
  config?: Record<string, unknown>;
}) {
  const typedConfig = (config ?? {}) as PlaceValueBuilderConfig;
  const min = typeof typedConfig.min === "number" ? typedConfig.min : 100;
  const max = typeof typedConfig.max === "number" ? typedConfig.max : 999;
  const places: PlaceValueName[] =
    Array.isArray(typedConfig.placeValues) && typedConfig.placeValues.length > 0
      ? typedConfig.placeValues.filter(
          (value): value is PlaceValueName =>
            value === "hundreds" || value === "tens" || value === "ones"
        )
      : ["hundreds", "tens", "ones"];
  const hideOnePlaceValue = typedConfig.hideOnePlaceValue === true;

  const [seed, setSeed] = useState(0);
  const [digits, setDigits] = useState<Record<PlaceValueName, number>>({
    hundreds: 0,
    tens: 0,
    ones: 0,
  });
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");

  const target = useMemo(() => randInt(min, max), [min, max, seed]);
  const hiddenPlace = useMemo<PlaceValueName | null>(() => {
    if (!hideOnePlaceValue || places.length === 0) return null;
    return places[randInt(0, places.length - 1)];
  }, [hideOnePlaceValue, places, seed]);

  useEffect(() => {
    const nextDigits: Record<PlaceValueName, number> = {
      hundreds: digitForPlace(target, "hundreds"),
      tens: digitForPlace(target, "tens"),
      ones: digitForPlace(target, "ones"),
    };

    if (!hiddenPlace) {
      nextDigits.hundreds = 0;
      nextDigits.tens = 0;
      nextDigits.ones = 0;
    } else {
      nextDigits[hiddenPlace] = 0;
    }

    setDigits(nextDigits);
    setStatus("idle");
  }, [target, hiddenPlace]);

  const builtValue =
    digits.hundreds * 100 + digits.tens * 10 + digits.ones;

  function setDigit(place: PlaceValueName, next: number) {
    setDigits((current) => ({
      ...current,
      [place]: clamp(next, 0, 9),
    }));
    setStatus("idle");
  }

  function check() {
    const isCorrect = builtValue === target;
    setStatus(isCorrect ? "correct" : "wrong");
  }

  function reset() {
    setSeed((current) => current + 1);
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
            Place Value Builder
          </div>
          <h2 className="mt-2 text-2xl font-black text-gray-900">
            {hiddenPlace
              ? `Find the missing ${placeLabel(hiddenPlace).toLowerCase()} digit`
              : "Build the number with hundreds, tens, and ones"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Target number:{" "}
            <span className="font-black text-gray-900">{target}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
        >
          New number
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {places.map((place) => {
          const actual = digitForPlace(target, place);
          const isHidden = hiddenPlace === place;
          const displayValue = hiddenPlace && !isHidden ? actual : digits[place];

          return (
            <div
              key={place}
              className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
            >
              <div className="text-xs font-bold uppercase tracking-wide text-gray-500">
                {placeLabel(place)}
              </div>
              <div className="mt-2 text-4xl font-black text-gray-900">
                {hiddenPlace && !isHidden ? actual : displayValue}
              </div>
              <div className="mt-3 text-sm text-gray-600">
                Value: {displayValue * unitValue(place)}
              </div>
              {hiddenPlace && !isHidden ? (
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

      <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
        <div className="text-xs font-bold uppercase tracking-wide text-indigo-700">
          Built Number
        </div>
        <div className="mt-2 text-3xl font-black text-indigo-900">
          {digits.hundreds} hundreds + {digits.tens} tens + {digits.ones} ones ={" "}
          {builtValue}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={check}
          className="rounded-xl bg-indigo-600 px-5 py-3 font-black text-white hover:bg-indigo-700"
        >
          Check answer
        </button>
        <div className="text-sm font-bold">
          {status === "correct" ? (
            <span className="text-emerald-700">Correct.</span>
          ) : status === "wrong" ? (
            <span className="text-red-700">Not yet. Adjust the place values.</span>
          ) : (
            <span className="text-gray-500">Build the target number, then check.</span>
          )}
        </div>
      </div>
    </div>
  );
}
