"use client";

import { useState } from "react";
import type { MultipleChoiceQuestion } from "@/data/activities/year2/lessonEngine";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import PlaceValueMABVisual from "@/components/activities/PlaceValueMABVisual";
import DecimalModelVisual from "@/components/activities/DecimalModelVisual";
import DecimalShiftVisual from "@/components/activities/DecimalShiftVisual";
import FractionContextVisual from "@/components/activities/FractionContextVisual";
import FractionNumberLineVisual from "@/components/activities/FractionNumberLineVisual";
import IntegerContextVisual from "@/components/activities/IntegerContextVisual";
import IntegerNumberLineVisual from "@/components/activities/IntegerNumberLineVisual";
import MoneyContextVisual from "@/components/activities/MoneyContextVisual";
import ArrayVisual from "@/components/activities/ArrayVisual";
import RuleBoxVisual from "@/components/activities/RuleBoxVisual";
import DiscountVisual from "@/components/activities/DiscountVisual";
import BestBuyCardComparisonVisual from "@/components/activities/BestBuyCardComparisonVisual";
import PatternSequenceStripVisual from "@/components/activities/PatternSequenceStripVisual";
import GrowingPatternVisual from "@/components/activities/GrowingPatternVisual";
import ErrorPatternVisual from "@/components/activities/ErrorPatternVisual";
import FunctionMachineCardVisual from "@/components/activities/FunctionMachineCardVisual";
import InputOutputTableVisual from "@/components/activities/InputOutputTableVisual";
import MissingRuleMachineVisual from "@/components/activities/MissingRuleMachineVisual";
import ReverseMachineCardVisual from "@/components/activities/ReverseMachineCardVisual";
import RuleBuilderCardVisual from "@/components/activities/RuleBuilderCardVisual";
import TermPositionCardVisual from "@/components/activities/TermPositionCardVisual";
import TermPredictorCardVisual from "@/components/activities/TermPredictorCardVisual";
import ReversePatternCardVisual from "@/components/activities/ReversePatternCardVisual";
import { FractionText, MathFormattedText } from "@/components/FractionText";

function FractionBar({
  numerator,
  denominator,
  tone = "emerald",
}: {
  numerator: number;
  denominator: number;
  tone?: "emerald" | "amber" | "slate";
}) {
  const fill =
    tone === "amber" ? "bg-amber-300" : tone === "slate" ? "bg-slate-300" : "bg-emerald-400";
  return (
    <div className="w-full">
      <div
        className="grid overflow-hidden rounded-xl border-2 border-slate-300 bg-slate-100 p-1"
        style={{ gridTemplateColumns: `repeat(${denominator}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: denominator }).map((_, index) => (
          <div
            key={index}
            className={[
              "h-9 rounded-[4px]",
              index < numerator ? fill : "bg-white",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}

function SameDenominatorOperationVisual({
  visual,
}: {
  visual: Extract<NonNullable<MultipleChoiceQuestion["visual"]>, { type: "same_denominator_operation" }>;
}) {
  const hasConversion =
    typeof visual.originalNumeratorA === "number" &&
    typeof visual.originalDenominatorA === "number" &&
    typeof visual.originalNumeratorB === "number" &&
    typeof visual.originalDenominatorB === "number";
  const leftLabel = hasConversion
    ? `${visual.originalNumeratorA}/${visual.originalDenominatorA}`
    : `${visual.numeratorA}/${visual.denominator}`;
  const rightLabel = hasConversion
    ? `${visual.originalNumeratorB}/${visual.originalDenominatorB}`
    : `${visual.numeratorB}/${visual.denominator}`;

  return (
    <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
        {hasConversion ? "Make the Pieces Match" : "Matching Fraction Pieces"}
      </div>
      {hasConversion ? (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl bg-white px-4 py-3 text-lg font-black text-slate-900 shadow-sm">
          <FractionText value={leftLabel} size="sm" />
          <span className="text-emerald-700">{visual.operation}</span>
          <FractionText value={rightLabel} size="sm" />
          <span className="text-slate-400">→</span>
          <MathFormattedText text={visual.conversionLabel ?? ""} />
        </div>
      ) : null}
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
        <div className="rounded-2xl bg-white p-3 shadow-sm">
          <div className="mb-2 text-center text-lg font-black text-slate-900">
            <FractionText value={`${visual.numeratorA}/${visual.denominator}`} size="sm" />
          </div>
          <FractionBar numerator={visual.numeratorA} denominator={visual.denominator} />
        </div>
        <div className="text-center text-2xl font-black text-emerald-700">{visual.operation}</div>
        <div className="rounded-2xl bg-white p-3 shadow-sm">
          <div className="mb-2 text-center text-lg font-black text-slate-900">
            <FractionText value={`${visual.numeratorB}/${visual.denominator}`} size="sm" />
          </div>
          <FractionBar
            numerator={visual.numeratorB}
            denominator={visual.denominator}
            tone={visual.operation === "+" ? "emerald" : "amber"}
          />
        </div>
        <div className="text-center text-2xl font-black text-emerald-700">=</div>
        <div className="rounded-2xl bg-white p-3 shadow-sm">
          <div className="mb-2 text-center text-lg font-black text-slate-900">Result</div>
          <FractionBar numerator={visual.resultNumerator} denominator={visual.denominator} />
        </div>
      </div>
    </div>
  );
}

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
      {questionData.visual?.type === "decimal_shift" ? (
        <DecimalShiftVisual visual={questionData.visual} />
      ) : null}
      {questionData.visual?.type === "fraction_number_line" ? (
        <FractionNumberLineVisual visual={questionData.visual} />
      ) : null}
      {questionData.visual?.type === "fraction_context" ? (
        <FractionContextVisual visual={questionData.visual} />
      ) : null}
      {questionData.visual?.type === "integer_context" ? (
        <IntegerContextVisual visual={questionData.visual} />
      ) : null}
      {questionData.visual?.type === "integer_number_line" ? (
        <IntegerNumberLineVisual visual={questionData.visual} />
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
      {questionData.visual?.type === "same_denominator_operation" ? (
        <SameDenominatorOperationVisual visual={questionData.visual} />
      ) : null}
      {questionData.visual?.type === "discount_price_tag" ? (
        <DiscountVisual visual={questionData.visual} />
      ) : null}
      {questionData.visual?.type === "best_buy_card_comparison" ? (
        <BestBuyCardComparisonVisual visual={questionData.visual} revealUnitRates={picked !== null} />
      ) : null}
      {questionData.visual?.type === "pattern_sequence_strip" ? (
        <PatternSequenceStripVisual visual={questionData.visual} />
      ) : null}
      {questionData.visual?.type === "growing_pattern" ? (
        <GrowingPatternVisual visual={questionData.visual} />
      ) : null}
      {questionData.visual?.type === "error_pattern" ? (
        <ErrorPatternVisual visual={questionData.visual} revealIncorrect={picked !== null} />
      ) : null}
      {questionData.visual?.type === "function_machine_card" ? (
        <FunctionMachineCardVisual visual={questionData.visual} />
      ) : null}
      {questionData.visual?.type === "input_output_table" ? (
        <InputOutputTableVisual visual={questionData.visual} />
      ) : null}
      {questionData.visual?.type === "missing_rule_machine" ? (
        <MissingRuleMachineVisual visual={questionData.visual} />
      ) : null}
      {questionData.visual?.type === "reverse_machine_card" ? (
        <ReverseMachineCardVisual visual={questionData.visual} />
      ) : null}
      {questionData.visual?.type === "rule_builder_card" ? (
        <RuleBuilderCardVisual visual={questionData.visual} />
      ) : null}
      {questionData.visual?.type === "term_position_card" ? (
        <TermPositionCardVisual visual={questionData.visual} />
      ) : null}
      {questionData.visual?.type === "term_predictor_card" ? (
        <TermPredictorCardVisual visual={questionData.visual} />
      ) : null}
      {questionData.visual?.type === "reverse_pattern_card" ? (
        <ReversePatternCardVisual visual={questionData.visual} />
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
              <MathFormattedText text={option} fractionSize="md" />
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
