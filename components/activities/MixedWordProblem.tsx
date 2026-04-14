"use client";

import { useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import type { MixedWordProblemQuestion } from "@/data/activities/year2/lessonEngine";
import MoneyContextVisual from "@/components/activities/MoneyContextVisual";
import ArrayVisual from "@/components/activities/ArrayVisual";

export default function MixedWordProblem({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: MixedWordProblemQuestion;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const needsOperationChoice =
    questionData.mode === "choose_operation" &&
    !!questionData.correctOperation &&
    !!questionData.operationChoices?.length;
  const [picked, setPicked] = useState<number | null>(null);
  const [pickedOperation, setPickedOperation] = useState<string | null>(null);
  const [operationReady, setOperationReady] = useState(!needsOperationChoice);
  const [operationFeedback, setOperationFeedback] = useState("");

  function chooseOperation(operation: string) {
    setPickedOperation(operation);
    if (operation === questionData.correctOperation) {
      setOperationReady(true);
      setOperationFeedback("");
      return;
    }

    setOperationReady(false);
    setOperationFeedback("Try again. Read the story carefully and decide whether it is combining or taking away.");
  }

  function choose(option: number) {
    if (!operationReady) return;
    setPicked(option);
    if (option === questionData.answer) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      {questionData.visual && questionData.visual.type !== "array" ? (
        <MoneyContextVisual visual={questionData.visual} />
      ) : null}
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
          Mixed Word Problem
        </div>
        <div className="mt-2 flex items-center gap-2">
          <h2 className="text-2xl font-black text-gray-900">{questionData.prompt}</h2>
          <ReadAloudBtn text={questionData.prompt} />
        </div>
        <p className="mt-2 text-sm text-gray-600">{questionData.helper}</p>
      </div>

      {questionData.visual?.type === "array" ? (
        <ArrayVisual
          rows={questionData.visual.rows}
          cols={questionData.visual.columns}
          highlightedRows={questionData.visual.highlightedRows}
          title="Grouped set model"
        />
      ) : null}

      {questionData.showStrategyClue !== false ? (
        <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50 p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-teal-700">
            Strategy clue
          </div>
          <div className="mt-2 text-lg font-bold text-teal-900">
            {questionData.operationLabel}
          </div>
        </div>
      ) : null}

      {needsOperationChoice ? (
        <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50 p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-teal-700">
            Choose the operation
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Decide whether this story needs addition or subtraction before solving.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {questionData.operationChoices?.map((operation) => {
              const label =
                operation === "+"
                  ? "Addition"
                  : operation === "-"
                  ? "Subtraction"
                  : operation === "x"
                  ? "Multiplication"
                  : "Division";
              return (
                <button
                  key={operation}
                  type="button"
                  onClick={() => chooseOperation(operation)}
                  className={[
                    "rounded-2xl border px-5 py-3 text-left text-lg font-black transition",
                    pickedOperation === operation
                      ? "border-teal-300 bg-white text-teal-900"
                      : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50",
                  ].join(" ")}
                >
                  {operation} {label}
                </button>
              );
            })}
          </div>
          {operationFeedback ? (
            <p className="mt-3 text-sm font-bold text-rose-600">{operationFeedback}</p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 grid gap-3">
        {questionData.options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => choose(option)}
            className={[
              "rounded-2xl border px-5 py-4 text-left text-2xl font-black transition",
              picked === option
                ? "border-teal-300 bg-teal-50 text-teal-900"
                : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50",
              !operationReady ? "cursor-not-allowed opacity-50" : "",
            ].join(" ")}
            disabled={!operationReady}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
