"use client";

import { useMemo, useState } from "react";
import type { NumberOrderQuestion } from "@/data/activities/year2/lessonEngine";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import FractionNumberLineVisual from "@/components/activities/FractionNumberLineVisual";
import IntegerNumberLineVisual from "@/components/activities/IntegerNumberLineVisual";
import { FractionText, MathFormattedText } from "@/components/FractionText";

export default function NumberOrder({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: NumberOrderQuestion;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const isFractionOrder = Array.isArray(questionData.fractions) && questionData.fractions.length > 0;
  const cards = isFractionOrder
    ? (questionData.fractions ?? [])
    : questionData.numbers.map((value) => String(value));

  const correctOrder = useMemo(
    () => {
      if (questionData.correctOrder?.length) return questionData.correctOrder;
      if (isFractionOrder) {
        const parseFraction = (value: string) => {
          const [numerator, denominator] = value.split("/").map(Number);
          return denominator ? numerator / denominator : 0;
        };
        return [...(questionData.fractions ?? [])].sort((a, b) =>
          questionData.ascending ? parseFraction(a) - parseFraction(b) : parseFraction(b) - parseFraction(a)
        );
      }

      return [...questionData.numbers]
        .sort((a, b) => (questionData.ascending ? a - b : b - a))
        .map((value) => String(value));
    },
    [
      isFractionOrder,
      questionData.ascending,
      questionData.correctOrder,
      questionData.fractions,
      questionData.numbers,
    ]
  );

  function selectValue(value: string) {
    if (selected.includes(value)) return;
    const next = [...selected, value];
    setSelected(next);
    if (next.length === correctOrder.length) {
      const isCorrect = next.every((value, index) => value === correctOrder[index]);
      if (isCorrect) onCorrect?.();
      else onWrong?.();
    }
  }

  function removeLast() {
    setSelected((current) => current.slice(0, -1));
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
            {isFractionOrder ? "Fraction Order" : "Number Line Position"}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <h2 className="text-2xl font-black text-gray-900">
              <MathFormattedText text={questionData.prompt} fractionSize="md" />
            </h2>
            <ReadAloudBtn text={questionData.prompt} />
          </div>
          {questionData.helper ? (
            <p className="mt-2 text-[15px] text-slate-500 leading-relaxed">
              <MathFormattedText text={questionData.helper} fractionSize="sm" />
            </p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={removeLast}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={() => setSelected([])}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </div>

      {questionData.visual?.type === "integer_number_line" ? (
        <IntegerNumberLineVisual visual={questionData.visual} title="Number line" />
      ) : null}
      {questionData.visual?.type === "fraction_number_line" ? (
        <FractionNumberLineVisual visual={questionData.visual} />
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((value, idx) => (
          <button
            key={`${value}-${idx}`}
            type="button"
            onClick={() => selectValue(value)}
            disabled={selected.includes(value)}
            className={[
              "rounded-2xl border p-6 text-xl font-black transition",
              selected.includes(value)
                ? "border-gray-200 bg-gray-100 text-gray-400"
                : "border-gray-200 bg-white text-gray-900 hover:bg-emerald-50",
            ].join(" ")}
          >
            {isFractionOrder ? <FractionText value={value} size="md" /> : value}
          </button>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-teal-100 bg-teal-50 p-5">
        <h3 className="text-sm font-bold uppercase tracking-wide text-teal-700">
          Your order
        </h3>
        <div className="mt-4 flex flex-wrap gap-3">
          {selected.length > 0 ? (
            selected.map((value, i) => (
              <div
                key={`${value}-${i}`}
                className="rounded-xl bg-white px-4 py-3 text-xl font-black text-teal-900 shadow-sm"
              >
                {isFractionOrder ? <FractionText value={value} size="md" /> : value}
              </div>
            ))
          ) : (
            <div className="text-sm font-bold text-teal-700">
              Tap the cards in order.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
