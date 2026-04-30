"use client";

import { useState } from "react";
import { FractionText } from "@/components/FractionText";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import type {
  EquivalentFractionBuildQuestion,
  EquivalentFractionMatchQuestion,
  EquivalentFractionYesNoQuestion,
} from "@/data/activities/year2/lessonEngine";

type Question =
  | EquivalentFractionMatchQuestion
  | EquivalentFractionBuildQuestion
  | EquivalentFractionYesNoQuestion;

function BarModel({ numerator, denominator }: { numerator: number; denominator: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div
        className="grid gap-1 overflow-hidden rounded-xl border-2 border-slate-300"
        style={{ gridTemplateColumns: `repeat(${denominator}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: denominator }).map((_, index) => (
          <div
            key={index}
            className={[
              "h-16 border-r border-slate-300 last:border-r-0",
              index < numerator ? "bg-emerald-400" : "bg-slate-100",
            ].join(" ")}
          />
        ))}
      </div>
      <div className="mt-3 text-center text-xl font-black text-slate-900">
        <FractionText value={`${numerator}/${denominator}`} />
      </div>
    </div>
  );
}

export default function EquivalentFractionBar({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: Question;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [pickedAnswer, setPickedAnswer] = useState<"yes" | "no" | null>(null);

  const isMatch = questionData.kind === "equivalent_fraction_match";
  const isBuild = questionData.kind === "equivalent_fraction_build";
  const isYesNo = questionData.kind === "equivalent_fraction_yes_no";

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-black text-gray-900">{questionData.prompt}</h2>
        <ReadAloudBtn text={questionData.prompt} />
      </div>
      <p className="mt-2 text-sm text-slate-600">
        Use the same whole bar to compare how much is shaded.
      </p>

      {isMatch ? (
        <>
          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">Given Fraction</div>
            <div className="mt-3 max-w-sm">
              <BarModel numerator={questionData.target.numerator} denominator={questionData.target.denominator} />
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {questionData.choices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                onClick={() => setPickedId(choice.id)}
                className={[
                  "rounded-2xl border p-4 transition",
                  pickedId === choice.id ? "border-emerald-400 bg-emerald-50" : "border-gray-200 bg-slate-50",
                ].join(" ")}
              >
                <BarModel numerator={choice.numerator} denominator={choice.denominator} />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => (pickedId === questionData.correctChoiceId ? onCorrect?.() : onWrong?.())}
            disabled={!pickedId}
            className="mt-4 w-full rounded-2xl bg-emerald-600 px-5 py-3 font-black text-white hover:bg-emerald-700 disabled:opacity-40"
          >
            Check match
          </button>
        </>
      ) : null}

      {isBuild ? (
        <>
          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">Start With This Bar</div>
            <div className="mt-3 max-w-sm">
              <BarModel numerator={questionData.source.numerator} denominator={questionData.source.denominator} />
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {questionData.options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setPickedId(option.id)}
                className={[
                  "rounded-2xl border p-4 transition",
                  pickedId === option.id ? "border-emerald-400 bg-emerald-50" : "border-gray-200 bg-slate-50",
                ].join(" ")}
              >
                <BarModel numerator={option.numerator} denominator={option.denominator} />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => (pickedId === questionData.correctOptionId ? onCorrect?.() : onWrong?.())}
            disabled={!pickedId}
            className="mt-4 w-full rounded-2xl bg-emerald-600 px-5 py-3 font-black text-white hover:bg-emerald-700 disabled:opacity-40"
          >
            Check build
          </button>
        </>
      ) : null}

      {isYesNo ? (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <BarModel numerator={questionData.left.numerator} denominator={questionData.left.denominator} />
            <BarModel numerator={questionData.right.numerator} denominator={questionData.right.denominator} />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {(["yes", "no"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setPickedAnswer(option)}
                className={[
                  "rounded-2xl border px-5 py-4 text-xl font-black transition",
                  pickedAnswer === option ? "border-emerald-400 bg-emerald-50 text-emerald-900" : "border-gray-200 bg-white text-gray-900",
                ].join(" ")}
              >
                {option === "yes" ? "Yes" : "No"}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => (pickedAnswer === questionData.answer ? onCorrect?.() : onWrong?.())}
            disabled={!pickedAnswer}
            className="mt-4 w-full rounded-2xl bg-emerald-600 px-5 py-3 font-black text-white hover:bg-emerald-700 disabled:opacity-40"
          >
            Check reasoning
          </button>
        </>
      ) : null}
    </div>
  );
}
