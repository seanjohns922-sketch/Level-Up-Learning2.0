"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [hoveredValue, setHoveredValue] = useState<string | null>(null);
  const [successValue, setSuccessValue] = useState<string | null>(null);
  const [wrongValue, setWrongValue] = useState<string | null>(null);
  const [checkingComplete, setCheckingComplete] = useState(false);
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

  useEffect(() => {
    if (!successValue) return;
    const timer = window.setTimeout(() => setSuccessValue(null), 550);
    return () => window.clearTimeout(timer);
  }, [successValue]);

  useEffect(() => {
    if (!wrongValue) return;
    const timer = window.setTimeout(() => setWrongValue(null), 420);
    return () => window.clearTimeout(timer);
  }, [wrongValue]);

  function fractionHint(value: string) {
    if (!isFractionOrder) return null;
    const [wholePart, fractionPart] = value.includes(" ")
      ? value.split(" ")
      : ["0", value];
    const whole = Number(wholePart);
    const [numerator, denominator] = fractionPart.split("/").map(Number);
    const numeric = (Number.isFinite(whole) ? whole : 0) + ((numerator ?? 0) / (denominator || 1));

    if (numeric < 0.55) return "Just above 1/2";
    if (numeric < 0.8) return "Between 1/2 and 1";
    if (numeric < 0.96) return "Close to 1";
    if (numeric < 1.1) return "Just above 1";
    if (numeric < 2) return "Between 1 and 2";
    return "Past 2";
  }

  function selectValue(value: string) {
    if (selected.includes(value)) return;
    const expected = correctOrder[selected.length];
    if (value !== expected) {
      setWrongValue(value);
      onWrong?.();
      return;
    }

    const next = [...selected, value];
    setSelected(next);
    setSuccessValue(value);

    if (next.length === correctOrder.length) {
      setCheckingComplete(true);
      window.setTimeout(() => {
        onCorrect?.();
      }, 260);
    }
  }

  function removeLast() {
    setSelected((current) => {
      if (current.length === 0) return current;
      setCheckingComplete(false);
      return current.slice(0, -1);
    });
  }

  function resetAll() {
    setSelected([]);
    setCheckingComplete(false);
  }

  const displayHint = hoveredValue ? fractionHint(hoveredValue) : null;

  function renderValue(value: string) {
    return isFractionOrder ? <FractionText value={value} size="md" /> : value;
  }

  function cardTone(value: string) {
    if (wrongValue === value) {
      return "border-rose-300 bg-rose-50 text-rose-800";
    }
    if (selected.includes(value)) {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }
    if (hoveredValue === value) {
      return "border-sky-300 bg-sky-50 text-sky-900";
    }
    return "border-gray-200 bg-white text-gray-900 hover:bg-emerald-50";
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
            onClick={resetAll}
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
        <FractionNumberLineVisual
          visual={questionData.visual}
          interactive
          previewLabel={hoveredValue}
          lockedLabels={selected}
          successLabel={successValue}
          wrongLabel={wrongValue}
        />
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((value, idx) => (
          <button
            key={`${value}-${idx}`}
            type="button"
            onClick={() => selectValue(value)}
            onMouseEnter={() => setHoveredValue(value)}
            onMouseLeave={() => setHoveredValue((current) => (current === value ? null : current))}
            onFocus={() => setHoveredValue(value)}
            onBlur={() => setHoveredValue((current) => (current === value ? null : current))}
            disabled={selected.includes(value)}
            className={[
              "rounded-2xl border p-6 text-xl font-black transition-all duration-150",
              wrongValue === value ? "animate-[pulse_0.28s_ease-in-out_1]" : "",
              selected.includes(value) ? "cursor-default opacity-70" : "",
              cardTone(value),
            ].join(" ")}
          >
            <div className="flex flex-col items-center gap-2">
              {renderValue(value)}
              {isFractionOrder && hoveredValue === value ? (
                <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-600">
                  {displayHint}
                </div>
              ) : null}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-teal-100 bg-teal-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-teal-700">
            Your order
          </h3>
          {checkingComplete ? (
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
              Checked left to right
            </div>
          ) : null}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {selected.length > 0 ? (
            selected.map((value, i) => (
              <div
                key={`${value}-${i}`}
                className={[
                  "rounded-xl bg-white px-4 py-3 text-xl font-black text-teal-900 shadow-sm transition-all duration-150",
                  checkingComplete ? "ring-2 ring-emerald-200" : "",
                ].join(" ")}
              >
                {renderValue(value)}
              </div>
            ))
          ) : (
            <div className="text-sm font-bold text-teal-700">
              {isFractionOrder ? "Hover first, then place each fraction in order." : "Tap the cards in order."}
            </div>
          )}
        </div>
        {checkingComplete && isFractionOrder ? (
          <div className="mt-4 text-sm font-bold text-emerald-700">
            Final order: {correctOrder.map((value, index) => (
              <span key={`${value}-${index}`} className="mr-2 inline-flex items-center">
                <FractionText value={value} size="sm" />
                {index < correctOrder.length - 1 ? <span className="ml-2 text-slate-400">,</span> : null}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
