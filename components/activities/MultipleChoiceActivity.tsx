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
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<"correct" | "partial" | "wrong" | null>(null);

  const isMultiSelect =
    Array.isArray(questionData.correctAnswers) && questionData.correctAnswers.length > 0;

  function choose(option: string) {
    if (isMultiSelect) {
      if (submitted) return;
      setSelected((current) =>
        current.includes(option) ? current.filter((item) => item !== option) : [...current, option]
      );
      return;
    }
    setPicked(option);
    if (option === questionData.answer) onCorrect?.();
    else onWrong?.();
  }

  function submitMultiSelect() {
    if (!isMultiSelect || submitted) return;
    const correctAnswers = new Set(questionData.correctAnswers ?? []);
    const hasIncorrect = selected.some((option) => !correctAnswers.has(option));
    const selectedCorrectCount = selected.filter((option) => correctAnswers.has(option)).length;
    const allCorrectSelected =
      selected.length === correctAnswers.size && selected.every((option) => correctAnswers.has(option));

    setSubmitted(true);

    if (allCorrectSelected) {
      setFeedback(
        questionData.allCorrectFeedback ??
          "Great thinking. You found all the answers that make sense."
      );
      setFeedbackTone("correct");
      onCorrect?.();
      return;
    }

    if (!hasIncorrect && selectedCorrectCount > 0) {
      setFeedback(
        questionData.partialFeedback ??
          "Partly right. You found one correct answer, but there is another one too."
      );
      setFeedbackTone("partial");
      onWrong?.();
      return;
    }

    setFeedback(
      questionData.incorrectFeedback ?? "That selection does not match the question."
    );
    setFeedbackTone("wrong");
    onWrong?.();
  }

  return (
    <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(2,23,22,0.04),0_8px_24px_rgba(2,23,22,0.05)]">
      {questionData.visual?.type === "shopping_list" ||
      questionData.visual?.type === "australian_money" ||
      questionData.visual?.type === "receipt" ? (
        <MoneyContextVisual visual={questionData.visual} />
      ) : null}
      <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.22em] text-teal-700/90">
        <span className="h-1.5 w-1.5 rounded-full bg-teal-500 shadow-[0_0_6px_rgba(20,184,166,0.6)]" />
        Multiple Choice
      </div>
      <div className="flex items-start gap-2.5 mt-2">
        <h2 className="text-[1.65rem] md:text-[1.85rem] font-bold text-slate-900 leading-[1.15] tracking-[-0.02em]">
          <MathFormattedText text={questionData.prompt} />
        </h2>
        <div className="mt-1.5">
          <ReadAloudBtn text={questionData.prompt} />
        </div>
      </div>
      {renderMode === "lesson" && questionData.helper ? (
        <p className="mt-2 text-[15px] text-slate-500 leading-relaxed">
          <MathFormattedText text={questionData.helper} />
        </p>
      ) : null}
      {isMultiSelect && questionData.instruction ? (
        <p className="mt-2 text-sm font-bold text-emerald-700">
          <MathFormattedText text={questionData.instruction} />
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

      <div className="mt-6 grid gap-2.5">
        {questionData.options.map((option, index) => {
          const isPicked = isMultiSelect
            ? selected.includes(option)
            : picked === option;
          return (
            <button
              key={`${option}-${index}`}
              type="button"
              onClick={() => choose(option)}
              className={[
                "group relative w-full rounded-2xl border px-5 py-4 text-left text-xl md:text-[1.4rem] font-extrabold tracking-tight transition-all duration-150",
                "active:translate-y-[1px] active:shadow-none",
                isPicked
                  ? "border-teal-400 bg-gradient-to-br from-teal-50 to-emerald-50 text-teal-900 shadow-[0_2px_0_rgba(13,148,136,0.25),inset_0_1px_0_rgba(255,255,255,0.8)] ring-1 ring-teal-300/60"
                  : "border-slate-200 bg-white text-slate-800 hover:-translate-y-[1px] hover:border-teal-300 hover:bg-teal-50/30 hover:shadow-[0_4px_12px_rgba(13,148,136,0.08)]",
              ].join(" ")}
            >
              {/* Left accent bar (appears on hover/picked) */}
              <span
                aria-hidden
                className={[
                  "absolute left-0 top-2 bottom-2 w-[3px] rounded-full transition-opacity",
                  isPicked
                    ? "bg-gradient-to-b from-teal-400 to-emerald-500 opacity-100"
                    : "bg-teal-400 opacity-0 group-hover:opacity-60",
                ].join(" ")}
              />
              <MathFormattedText text={option} compactFractions />
            </button>
          );
        })}
      </div>
      {isMultiSelect ? (
        <div className="mt-5">
          <button
            type="button"
            onClick={submitMultiSelect}
            disabled={selected.length === 0 || submitted}
            className="rounded-2xl bg-teal-600 px-5 py-3 text-lg font-black text-white transition disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Check answer
          </button>
        </div>
      ) : null}
      {isMultiSelect && submitted ? (
        <div
          className={[
            "mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold",
            feedbackTone === "correct"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : feedbackTone === "partial"
              ? "border-amber-200 bg-amber-50 text-amber-900"
              : "border-red-200 bg-red-50 text-red-900",
          ].join(" ")}
        >
          {feedback ? <p>{feedback}</p> : null}
          {selected.length > 0 && questionData.selectionFeedback ? (
            <div className="mt-2 grid gap-1">
              {selected
                .filter((option) => questionData.selectionFeedback?.[option])
                .map((option) => (
                  <p key={option}>
                    <MathFormattedText text={questionData.selectionFeedback?.[option] ?? ""} />
                  </p>
                ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
