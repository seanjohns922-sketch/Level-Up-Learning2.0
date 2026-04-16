"use client";

import { useState } from "react";
import type { MultipleChoiceQuestion } from "@/data/activities/year2/lessonEngine";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import PlaceValueMABVisual from "@/components/activities/PlaceValueMABVisual";
import DecimalModelVisual from "@/components/activities/DecimalModelVisual";
import MoneyContextVisual from "@/components/activities/MoneyContextVisual";
import ArrayVisual from "@/components/activities/ArrayVisual";
import RuleBoxVisual from "@/components/activities/RuleBoxVisual";
import { MathFormattedText } from "@/components/FractionText";

export default function MultipleChoiceActivity({
  questionData,
  onCorrect,
  onWrong,
  renderMode = "lesson",
}: {
  questionData: MultipleChoiceQuestion;
  onCorrect?: () => void;
  onWrong?: () => void;
  renderMode?: "lesson" | "quiz";
}) {
  const [picked, setPicked] = useState<string | null>(null);

  function choose(option: string) {
    setPicked(option);
    if (option === questionData.answer) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      {questionData.visual?.type === "shopping_list" ||
      questionData.visual?.type === "australian_money" ||
      questionData.visual?.type === "receipt" ? (
        <MoneyContextVisual visual={questionData.visual} />
      ) : null}
      <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
        Multiple Choice
      </div>
      <div className="flex items-center gap-2 mt-2">
        <h2 className="text-2xl font-black text-gray-900">
          <MathFormattedText text={questionData.prompt} />
        </h2>
        <ReadAloudBtn text={questionData.prompt} />
      </div>
      {renderMode === "lesson" && questionData.helper ? (
        <p className="mt-2 text-sm text-gray-600">
          <MathFormattedText text={questionData.helper} />
        </p>
      ) : null}
      {questionData.visual?.type === "mab" ? (
        <PlaceValueMABVisual questionData={questionData.visual} title="MAB model" />
      ) : null}
      {questionData.visual?.type === "decimal_model" ? (
        <DecimalModelVisual visual={questionData.visual} title="Decimal model" />
      ) : null}
      {questionData.visual?.type === "array" ? (
        <ArrayVisual
          rows={questionData.visual.rows}
          cols={questionData.visual.columns}
          highlightedRows={questionData.visual.highlightedRows}
          title="Grouped set model"
        />
      ) : null}
      {questionData.visual?.type === "rule_box" ? (
        <RuleBoxVisual visual={questionData.visual} title="Step-by-step rule" />
      ) : null}

      <div className="mt-6 grid gap-3">
        {questionData.options.map((option, index) => (
          <button
            key={`${option}-${index}`}
            type="button"
            onClick={() => choose(option)}
            className={[
              "rounded-2xl border px-5 py-4 text-left text-xl font-black transition",
              picked === option
                ? "border-teal-300 bg-teal-50 text-teal-900"
                : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50",
            ].join(" ")}
          >
            <MathFormattedText text={option} compactFractions />
          </button>
        ))}
      </div>
    </div>
  );
}
