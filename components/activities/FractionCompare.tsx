"use client";

import { useState } from "react";
import type { FractionCompareQuestion } from "@/data/activities/year2/lessonEngine";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { FractionText, MathFormattedText } from "@/components/FractionText";

function fractionParts(label: string) {
  const [numerator, denominator] = label.split("/").map(Number);
  return {
    numerator: numerator ?? 0,
    denominator: denominator ?? 1,
  };
}

function FractionBar({ fraction }: { fraction: string }) {
  const { numerator, denominator } = fractionParts(fraction);
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
      <div
        className="grid gap-1 overflow-hidden rounded-xl border-2 border-slate-300 bg-slate-100 p-1"
        style={{ gridTemplateColumns: `repeat(${denominator}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: denominator }).map((_, index) => (
          <div
            key={index}
            className={[
              "h-14 rounded-[4px]",
              index < numerator ? "bg-emerald-400" : "bg-white",
            ].join(" ")}
          />
        ))}
      </div>
      <div className="mt-3 text-center text-2xl font-black text-slate-900">
        <FractionText value={fraction} />
      </div>
    </div>
  );
}

export default function FractionCompare({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: FractionCompareQuestion;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const isTapSide = questionData.mode === "greater_less_visual";
  const isEquivalentCompare = questionData.mode === "equivalent_to_compare";

  const options =
    questionData.mode === "symbol_compare"
      ? [">", "<", "="]
      : questionData.mode === "visual_compare"
      ? [questionData.leftFraction, questionData.rightFraction]
      : isEquivalentCompare
      ? [questionData.leftFraction, questionData.rightFraction, "They are equal"]
      : isTapSide
      ? []
      : ["true", "false"];

  function chooseSide(side: "left" | "right") {
    setPicked(side);
    if (side === questionData.answer) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-black text-gray-900">
          <MathFormattedText text={questionData.prompt} />
        </h2>
        <ReadAloudBtn text={questionData.prompt} />
      </div>
      {questionData.helper ? (
        <p className="mt-2 text-sm font-semibold text-slate-500">
          <MathFormattedText text={questionData.helper} />
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 sm:grid-cols-2">
        {[
          { side: "left" as const, fraction: questionData.leftFraction, label: "LEFT" },
          { side: "right" as const, fraction: questionData.rightFraction, label: "RIGHT" },
        ].map((item) =>
          isTapSide ? (
            <button
              key={item.side}
              type="button"
              onClick={() => chooseSide(item.side)}
              className={[
                "rounded-2xl border p-2 text-left transition",
                picked === item.side
                  ? item.side === questionData.answer
                    ? "border-emerald-400 bg-emerald-100 shadow-[0_0_0_3px_rgba(52,211,153,0.25)]"
                    : "border-red-300 bg-red-50 shadow-[0_0_0_3px_rgba(248,113,113,0.18)]"
                  : "border-transparent hover:bg-white/70",
              ].join(" ")}
            >
              <div className="mb-2 text-xs font-black uppercase tracking-wide text-emerald-700">{item.label}</div>
              <FractionBar fraction={item.fraction} />
            </button>
          ) : (
            <div key={item.side}>
              <FractionBar fraction={item.fraction} />
            </div>
          )
        )}
      </div>

      {!isTapSide ? (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setPicked(option)}
                className={[
                  "rounded-2xl border px-5 py-4 text-xl font-black transition",
                  picked === option
                    ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                    : "border-gray-200 bg-white text-gray-900 hover:bg-emerald-50/40",
                ].join(" ")}
              >
                <MathFormattedText text={option} compactFractions />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => (picked === questionData.answer ? onCorrect?.() : onWrong?.())}
            disabled={!picked}
            className="mt-4 w-full rounded-2xl bg-emerald-600 px-5 py-3 font-black text-white hover:bg-emerald-700 disabled:opacity-40"
          >
            Check comparison
          </button>
        </>
      ) : null}
    </div>
  );
}
