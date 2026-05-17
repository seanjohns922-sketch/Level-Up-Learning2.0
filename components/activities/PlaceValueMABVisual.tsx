"use client";

import type { MABVisualData, PlaceValueName } from "@/data/activities/year2/lessonEngine";

function placeLabel(place: PlaceValueName) {
  if (place === "hundred_thousands") return "Hundred Thousands";
  if (place === "ten_thousands") return "Ten Thousands";
  if (place === "thousands") return "Thousands";
  if (place === "hundreds") return "Hundreds";
  if (place === "tens") return "Tens";
  return "Ones";
}

function countLabel(place: PlaceValueName, count: number | null) {
  if (count === null) return placeLabel(place).toLowerCase();
  if (place === "hundred_thousands") return count === 1 ? "hundred thousand" : "hundred thousands";
  if (place === "ten_thousands") return count === 1 ? "ten thousand" : "ten thousands";
  if (place === "thousands") return count === 1 ? "thousand" : "thousands";
  if (place === "hundreds") return count === 1 ? "hundred" : "hundreds";
  if (place === "tens") return count === 1 ? "ten" : "tens";
  return count === 1 ? "one" : "ones";
}

function placeCount(questionData: MABVisualData, place: PlaceValueName) {
  if (place === "hundred_thousands") return questionData.hundredThousands;
  if (place === "ten_thousands") return questionData.tenThousands;
  if (place === "thousands") return questionData.thousands;
  if (place === "hundreds") return questionData.hundreds;
  if (place === "tens") return questionData.tens;
  return questionData.ones;
}

function shouldShowPlace(questionData: MABVisualData, place: PlaceValueName) {
  const count = placeCount(questionData, place);
  return count === null || count > 0;
}

function MABChipVisual({
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

  if (
    place === "hundred_thousands" ||
    place === "ten_thousands" ||
    place === "thousands"
  ) {
    const chipClass =
      place === "hundred_thousands"
        ? "border-fuchsia-300 bg-fuchsia-100 text-fuchsia-800"
        : place === "ten_thousands"
          ? "border-indigo-300 bg-indigo-100 text-indigo-800"
          : "border-sky-300 bg-sky-100 text-sky-800";
    const chipLabel =
      place === "hundred_thousands" ? "100k" : place === "ten_thousands" ? "10k" : "1k";
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

export default function PlaceValueMABVisual({
  questionData,
  title = "MAB model",
}: {
  questionData: MABVisualData;
  title?: string;
}) {
  const visiblePlaces = questionData.placeValues.filter((place) => shouldShowPlace(questionData, place));

  return (
    <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50 p-4">
      <div className="text-xs font-bold uppercase tracking-wide text-teal-700">
        {title}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visiblePlaces.map((place) => {
          const count = placeCount(questionData, place);

          return (
            <div key={place} className="rounded-2xl border border-gray-200 bg-white p-3">
              <div className="text-xs font-bold uppercase tracking-wide text-gray-500">
                {placeLabel(place)}
              </div>
              <div className="mt-3">
                <MABChipVisual place={place} count={count} />
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {count === null ? "Missing part" : `${count} ${countLabel(place, count)}`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
