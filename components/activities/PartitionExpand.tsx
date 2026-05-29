"use client";

import { useState } from "react";
import type { PartitionExpandQuestion } from "@/data/activities/year2/lessonEngine";
import ReadAloudBtn from "@/components/ReadAloudBtn";

type PlaceKey = "thousands" | "hundreds" | "tens" | "ones";

const PLACE_MULTIPLIERS: Record<PlaceKey, number> = {
  thousands: 1000,
  hundreds: 100,
  tens: 10,
  ones: 1,
};

function standardQuantity(key: PlaceKey, value?: number) {
  const multiplier = PLACE_MULTIPLIERS[key];
  return Math.floor((value ?? 0) / multiplier);
}

function placeValueFromQuantity(key: PlaceKey, quantity: number) {
  return quantity * PLACE_MULTIPLIERS[key];
}

function formatPlaceQuantity(key: PlaceKey, quantity: number) {
  const singular = key === "thousands" ? "thousand" : key.slice(0, -1);
  return `${quantity} ${quantity === 1 ? singular : key}`;
}

export default function PartitionExpand({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: PartitionExpandQuestion;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const hasThousands = (questionData.standard.thousands ?? 0) > 0 || questionData.target >= 1000;

  const places: { key: PlaceKey; label: string }[] = [
    ...(hasThousands ? [{ key: "thousands" as const, label: "Thousands" }] : []),
    { key: "hundreds", label: "Hundreds" },
    { key: "tens", label: "Tens" },
    { key: "ones", label: "Ones" },
  ];

  const [values, setValues] = useState<Record<PlaceKey, string>>({
    thousands:
      questionData.mode === "flexible_partition"
        ? String(standardQuantity("thousands", questionData.standard.thousands))
        : "",
    hundreds:
      questionData.mode === "flexible_partition"
        ? String(standardQuantity("hundreds", questionData.standard.hundreds))
        : "",
    tens:
      questionData.mode === "flexible_partition"
        ? String(standardQuantity("tens", questionData.standard.tens))
        : "",
    ones:
      questionData.mode === "flexible_partition"
        ? String(standardQuantity("ones", questionData.standard.ones))
        : "",
  });

  function setValue(key: PlaceKey, next: string) {
    setValues((current) => ({
      ...current,
      [key]: next.replace(/[^\d]/g, ""),
    }));
  }

  function numericValue(key: PlaceKey) {
    return Number(values[key] || "0");
  }

  function check() {
    const thousands = numericValue("thousands");
    const hundreds = numericValue("hundreds");
    const tens = numericValue("tens");
    const ones = numericValue("ones");
    const sum =
      placeValueFromQuantity("thousands", thousands) +
      placeValueFromQuantity("hundreds", hundreds) +
      placeValueFromQuantity("tens", tens) +
      placeValueFromQuantity("ones", ones);

    const std = questionData.standard;
    const stdThousands = standardQuantity("thousands", std.thousands);
    const stdHundreds = standardQuantity("hundreds", std.hundreds);
    const stdTens = standardQuantity("tens", std.tens);
    const stdOnes = standardQuantity("ones", std.ones);

    const isCorrect =
      questionData.mode === "flexible_partition"
        ? sum === questionData.target &&
          (thousands !== stdThousands ||
            hundreds !== stdHundreds ||
            tens !== stdTens ||
            ones !== stdOnes)
        : thousands === stdThousands &&
          hundreds === stdHundreds &&
          tens === stdTens &&
          ones === stdOnes;

    if (isCorrect) onCorrect?.();
    else onWrong?.();
  }

  const total = places.reduce((sum, place) => {
    return sum + placeValueFromQuantity(place.key, numericValue(place.key));
  }, 0);
  const quantityExpression = places
    .map((place) => formatPlaceQuantity(place.key, numericValue(place.key)))
    .join(" + ");
  const expandedExpression = places
    .map((place) => placeValueFromQuantity(place.key, numericValue(place.key)).toLocaleString())
    .join(" + ");

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
          Partition & Expand
        </div>
        <div className="flex items-center gap-2 mt-2">
          <h2 className="text-2xl font-black text-gray-900">{questionData.prompt}</h2>
          <ReadAloudBtn text={questionData.prompt} />
        </div>
      </div>

      <div className={`mt-6 grid gap-4 ${hasThousands ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
        {places.map((item) => (
          <label
            key={item.key}
            className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
          >
            <div className="text-xs font-bold uppercase tracking-wide text-gray-500">
              {item.label}
            </div>
            <div className="mt-1 text-sm text-gray-500">
              How many {item.label.toLowerCase()}?
            </div>
            <input
              value={values[item.key]}
              onChange={(event) => setValue(item.key, event.target.value)}
              inputMode="numeric"
              className="mt-3 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-3xl font-black text-gray-900 outline-none focus:border-teal-500"
              placeholder="0"
            />
          </label>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50 p-4">
        <div className="text-xs font-bold uppercase tracking-wide text-teal-700">
          Place value quantities
        </div>
        <div className="mt-2 text-2xl font-black text-teal-900">
          {quantityExpression}
        </div>
        <div className="mt-4 text-xs font-bold uppercase tracking-wide text-teal-700">
          Expanded value
        </div>
        <div className="mt-2 text-3xl font-black text-teal-900">
          {expandedExpression} = {total.toLocaleString()}
        </div>
        {questionData.mode === "flexible_partition" ? (
          <div className="mt-2 text-sm text-teal-800">
            Make the same total in a different way from the standard partition.
          </div>
        ) : null}
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
