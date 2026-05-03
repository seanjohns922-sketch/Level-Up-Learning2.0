"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { TypedResponseQuestion, WrittenMethodLayout } from "@/data/activities/year2/lessonEngine";
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
import { Fraction, MathFormattedText } from "@/components/FractionText";

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/,/g, "").replace(/\s+/g, " ");
}

function normalizeDecimalEquivalent(value: string) {
  const normalized = normalize(value);
  if (/^\.\d+$/.test(normalized)) return `0${normalized}`;
  if (/^-\.\d+$/.test(normalized)) return normalized.replace("-.", "-0.");
  return normalized;
}

function normalizeOrderingNumber(value: string) {
  return value.trim().replace(/,/g, "").replace(/\s+/g, "");
}

function extractOrderingNumbers(value: string) {
  return (value.match(/\d[\d,]*/g) ?? []).map(normalizeOrderingNumber).filter(Boolean);
}

function extractSequenceNumbers(value: string) {
  return (value.match(/-?\d[\d,]*(?:\.\d+)?/g) ?? [])
    .map((part) => part.replace(/,/g, "").trim())
    .filter(Boolean);
}

function StackedFraction({
  numerator,
  denominator,
}: {
  numerator: number;
  denominator: number;
}) {
  return (
    <div className="inline-flex items-center rounded-xl bg-white px-4 py-3 shadow-sm">
      <Fraction numerator={numerator} denominator={denominator} size="lg" />
    </div>
  );
}

function SameDenominatorEquationInput({
  visual,
  value,
  onChange,
  inputRef,
}: {
  visual: Extract<NonNullable<TypedResponseQuestion["visual"]>, { type: "same_denominator_operation" }>;
  value: string;
  onChange: (value: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  const hasConversion =
    typeof visual.originalNumeratorA === "number" &&
    typeof visual.originalDenominatorA === "number" &&
    typeof visual.originalNumeratorB === "number" &&
    typeof visual.originalDenominatorB === "number";
  const leftNumerator = visual.originalNumeratorA ?? visual.numeratorA;
  const leftDenominator = visual.originalDenominatorA ?? visual.denominator;
  const rightNumerator = visual.originalNumeratorB ?? visual.numeratorB;
  const rightDenominator = visual.originalDenominatorB ?? visual.denominator;

  return (
    <div className="w-full rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
        Complete the Fraction
      </div>
      {hasConversion && visual.conversionLabel ? (
        <div className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm">
          Make pieces match: <MathFormattedText text={visual.conversionLabel} />
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <StackedFraction numerator={leftNumerator} denominator={leftDenominator} />
        <span className="text-3xl font-black text-emerald-700">{visual.operation}</span>
        <StackedFraction numerator={rightNumerator} denominator={rightDenominator} />
        <span className="text-3xl font-black text-emerald-700">=</span>
        <div className="inline-flex flex-col items-center rounded-xl bg-white px-4 py-3 shadow-sm">
          <input
            ref={inputRef}
            type="text"
            autoComplete="off"
            spellCheck={false}
            value={value}
            onChange={(event) => onChange(event.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            aria-label="Missing numerator"
            className="block h-12 w-20 appearance-none rounded-t-xl border border-b-0 border-emerald-300 bg-white px-3 text-center text-2xl font-black leading-none text-slate-900 caret-teal-600 outline-none focus:border-teal-500"
            style={{ WebkitTextFillColor: "#0f172a" }}
          />
          <span className="h-1 w-20 rounded-full bg-slate-500" />
          <span className="flex h-12 w-20 items-center justify-center rounded-b-xl border border-t-0 border-emerald-300 bg-emerald-50 text-center text-2xl font-black leading-none text-slate-800">
            {visual.denominator}
          </span>
        </div>
      </div>
      <div className="mt-3 text-sm font-semibold text-slate-600">
        Denominator stays fixed. Type the numerator only.
      </div>
    </div>
  );
}

function FractionDecimalPercentConversionInput({
  visual,
  decimalValue,
  percentValue,
  onDecimalChange,
  onPercentChange,
}: {
  visual: Extract<NonNullable<TypedResponseQuestion["visual"]>, { type: "fraction_decimal_percent_conversion" }>;
  decimalValue: string;
  percentValue: string;
  onDecimalChange: (value: string) => void;
  onPercentChange: (value: string) => void;
}) {
  return (
    <div className="w-full rounded-2xl border border-sky-100 bg-sky-50 p-5">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">
        Convert Step-by-Step
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="text-lg font-black text-slate-700">Convert:</span>
        <StackedFraction numerator={visual.numerator} denominator={visual.denominator} />
        <span className="text-3xl font-black text-sky-700">=</span>
        <input
          type="text"
          value={decimalValue}
          onChange={(event) => onDecimalChange(event.target.value.replace(/[^\d.]/g, ""))}
          inputMode="decimal"
          placeholder="decimal"
          className="h-14 w-32 rounded-xl border border-sky-300 bg-white px-3 text-center text-xl font-black text-slate-900 outline-none focus:border-teal-500"
          style={{ WebkitTextFillColor: "#0f172a" }}
        />
        <span className="text-lg font-black text-slate-700">decimal</span>
        <span className="text-3xl font-black text-sky-700">=</span>
        <input
          type="text"
          value={percentValue}
          onChange={(event) => onPercentChange(event.target.value.replace(/[^\d.%]/g, ""))}
          inputMode="decimal"
          placeholder="%"
          className="h-14 w-32 rounded-xl border border-sky-300 bg-white px-3 text-center text-xl font-black text-slate-900 outline-none focus:border-teal-500"
          style={{ WebkitTextFillColor: "#0f172a" }}
        />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="text-xs font-black uppercase tracking-[0.14em] text-sky-700">
            Step 1
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            Fraction to decimal: divide {visual.numerator} by {visual.denominator}.
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="text-xs font-black uppercase tracking-[0.14em] text-sky-700">
            Step 2
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            Decimal to percentage: multiply the decimal by 100.
          </p>
        </div>
      </div>
    </div>
  );
}

function PercentStructuredMethodInput({
  visual,
  currentStep,
  inputs,
  feedback,
  onInputChange,
  inputRef,
}: {
  visual: Extract<
    NonNullable<TypedResponseQuestion["visual"]>,
    { type: "percent_structured_method" } | { type: "discount_step_method" }
  >;
  currentStep: number;
  inputs: string[];
  feedback: string;
  onInputChange: (index: number, value: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  const amount = visual.type === "discount_step_method" ? visual.price : visual.amount;
  return (
    <div className="w-full rounded-2xl border border-amber-100 bg-amber-50 p-5">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">
        {visual.method === "decimal" ? "Decimal Method" : "Percentage Method"}
      </div>
      <div className="mt-2 text-sm font-bold text-slate-600">
        {visual.method === "decimal"
          ? `Convert ${visual.percent}% to a decimal, then multiply by ${amount}.`
          : visual.type === "discount_step_method"
            ? `Find the discount, then subtract it from ${visual.price}.`
            : `Break ${visual.percent}% of ${amount} into easier parts.`}
      </div>
      <div className="mt-5 grid gap-3">
        {visual.steps.map((step, index) => {
          const isUnlocked = index <= currentStep;
          const isActive = index === currentStep;
          const isDone = index < currentStep;
          return (
            <div
              key={`${step.prompt}-${index}`}
              className={[
                "rounded-2xl border p-4 shadow-sm transition",
                isActive
                  ? "border-amber-300 bg-white"
                  : isDone
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-amber-100 bg-white/60 opacity-60",
              ].join(" ")}
            >
              <div className="text-xs font-black uppercase tracking-[0.14em] text-amber-700">
                Step {index + 1}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="text-lg font-black text-slate-900">{step.prompt}</span>
                <input
                  ref={isActive ? inputRef : undefined}
                  value={inputs[index] ?? ""}
                  onChange={(event) =>
                    onInputChange(index, event.target.value.replace(/[^\d.]/g, ""))
                  }
                  disabled={!isUnlocked || isDone}
                  inputMode="decimal"
                  className="h-12 w-28 rounded-xl border border-amber-300 bg-white px-3 text-center text-xl font-black text-slate-900 outline-none focus:border-teal-500 disabled:bg-emerald-50"
                  style={{ WebkitTextFillColor: "#0f172a" }}
                  aria-label={`Percentage method step ${index + 1}`}
                />
                {step.suffix ? (
                  <span className="text-lg font-black text-slate-600">{step.suffix}</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      {feedback ? <p className="mt-3 text-sm font-bold text-rose-600">{feedback}</p> : null}
    </div>
  );
}

function MultiStepMethodInput({
  visual,
  currentStep,
  inputs,
  feedback,
  onInputChange,
  inputRef,
}: {
  visual: Extract<NonNullable<TypedResponseQuestion["visual"]>, { type: "multi_step_method" }>;
  currentStep: number;
  inputs: string[];
  feedback: string;
  onInputChange: (index: number, value: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="w-full rounded-2xl border border-sky-100 bg-sky-50 p-5">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">
        Build the Solution
      </div>
      <div className="mt-2 text-sm font-bold text-slate-600">
        {visual.contextLabel}
      </div>
      <div className="mt-5 grid gap-3">
        {visual.steps.map((step, index) => {
          const isUnlocked = index <= currentStep;
          const isActive = index === currentStep;
          const isDone = index < currentStep;
          return (
            <div
              key={`${step.prompt}-${index}`}
              className={[
                "rounded-2xl border p-4 shadow-sm transition",
                isActive
                  ? "border-sky-300 bg-white"
                  : isDone
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-sky-100 bg-white/60 opacity-60",
              ].join(" ")}
            >
              <div className="text-xs font-black uppercase tracking-[0.14em] text-sky-700">
                Step {index + 1}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="text-lg font-black text-slate-900">{step.prompt}</span>
                <input
                  ref={isActive ? inputRef : undefined}
                  value={inputs[index] ?? ""}
                  onChange={(event) =>
                    onInputChange(index, event.target.value.replace(/[^\d.-]/g, ""))
                  }
                  disabled={!isUnlocked || isDone}
                  inputMode="decimal"
                  className="h-12 w-28 rounded-xl border border-sky-300 bg-white px-3 text-center text-xl font-black text-slate-900 outline-none focus:border-teal-500 disabled:bg-emerald-50"
                  style={{ WebkitTextFillColor: "#0f172a" }}
                  aria-label={`Multi-step method step ${index + 1}`}
                />
                {step.suffix ? (
                  <span className="text-lg font-black text-slate-600">{step.suffix}</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      {feedback ? <p className="mt-3 text-sm font-bold text-rose-600">{feedback}</p> : null}
    </div>
  );
}

function StrategyOwnershipInput({
  visual,
  selectedStrategy,
  answerValue,
  reflectionValue,
  feedback,
  solved,
  onStrategySelect,
  onAnswerChange,
  onReflectionSelect,
}: {
  visual: Extract<NonNullable<TypedResponseQuestion["visual"]>, { type: "strategy_ownership" }>;
  selectedStrategy: string | null;
  answerValue: string;
  reflectionValue: string | null;
  feedback: string;
  solved: boolean;
  onStrategySelect: (strategy: string) => void;
  onAnswerChange: (value: string) => void;
  onReflectionSelect: (value: string) => void;
}) {
  const selectedStrategyData = visual.strategies.find((strategy) => strategy.label === selectedStrategy);

  return (
    <div className="w-full space-y-4">
      <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-sky-50 p-5">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">
          Mission Briefing
        </div>
        <div className="mt-2 text-xl font-black text-slate-900">{visual.missionTitle}</div>
        <p className="mt-2 text-sm font-bold text-slate-700">{visual.missionDescription}</p>
        <p className="mt-2 text-sm text-slate-600">{visual.supportText}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
          Step A: Problem
        </div>
        <div className="mt-2 text-4xl font-black text-slate-950">
          <MathFormattedText text={visual.problemLabel} />
        </div>
      </div>

      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">
          Step B: Choose a Strategy
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {visual.strategies.map((strategy) => {
            const active = selectedStrategy === strategy.label;
            return (
              <button
                key={strategy.label}
                type="button"
                onClick={() => onStrategySelect(strategy.label)}
                disabled={solved}
                className={[
                  "rounded-2xl border p-4 text-left transition",
                  active
                    ? "border-teal-500 bg-white shadow-sm ring-2 ring-teal-200"
                    : "border-amber-200 bg-white/80 hover:bg-white",
                  solved && !active ? "opacity-50" : "",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-base font-black text-slate-900">{strategy.label}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-600">
                    {strategy.tag}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        {selectedStrategyData ? (
          <p className="mt-3 text-sm font-bold text-slate-700">{selectedStrategyData.feedback}</p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-teal-100 bg-teal-50 p-5">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">
          Step C: Solve
        </div>
        <input
          value={answerValue}
          onChange={(event) => onAnswerChange(event.target.value)}
          disabled={solved}
          placeholder="Type your answer"
          className="mt-3 w-full max-w-md rounded-xl border border-teal-300 bg-white px-4 py-3 text-lg font-black text-slate-900 outline-none focus:border-teal-500 disabled:bg-emerald-50"
          style={{ WebkitTextFillColor: "#0f172a" }}
        />
      </div>

      {solved && visual.reflectionPrompt && visual.reflectionOptions?.length ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
            Step D: Reflect
          </div>
          <p className="mt-2 text-base font-black text-slate-900">{visual.reflectionPrompt}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {visual.reflectionOptions.map((option) => {
              const active = reflectionValue === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onReflectionSelect(option)}
                  className={[
                    "rounded-xl px-4 py-3 font-black transition",
                    active
                      ? "bg-emerald-600 text-white"
                      : "border border-emerald-200 bg-white text-slate-900 hover:bg-emerald-50",
                  ].join(" ")}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {feedback ? (
        <p className={["text-sm font-bold", solved ? "text-emerald-700" : "text-rose-600"].join(" ")}>
          {feedback}
        </p>
      ) : null}
    </div>
  );
}

type RelatedDenominatorStep = "multiplier" | "numerator" | "solve" | "done";

function getRelatedDenominatorWorking(
  visual: Extract<NonNullable<TypedResponseQuestion["visual"]>, { type: "same_denominator_operation" }>
) {
  if (
    typeof visual.originalNumeratorA !== "number" ||
    typeof visual.originalDenominatorA !== "number" ||
    typeof visual.originalNumeratorB !== "number" ||
    typeof visual.originalDenominatorB !== "number"
  ) {
    return null;
  }

  const convertsLeft = visual.originalDenominatorA !== visual.denominator;
  const denominatorToChange = convertsLeft ? visual.originalDenominatorA : visual.originalDenominatorB;
  const numeratorToChange = convertsLeft ? visual.originalNumeratorA : visual.originalNumeratorB;
  const convertedNumerator = convertsLeft ? visual.numeratorA : visual.numeratorB;
  const multiplier = visual.denominator / denominatorToChange;

  if (!Number.isInteger(multiplier) || multiplier <= 1) {
    return null;
  }

  return {
    convertsLeft,
    denominatorToChange,
    numeratorToChange,
    convertedNumerator,
    multiplier,
  };
}

function RelatedDenominatorWorkingInput({
  visual,
  working,
  step,
  inputs,
  feedback,
  onInputChange,
  inputRef,
}: {
  visual: Extract<NonNullable<TypedResponseQuestion["visual"]>, { type: "same_denominator_operation" }>;
  working: NonNullable<ReturnType<typeof getRelatedDenominatorWorking>>;
  step: RelatedDenominatorStep;
  inputs: {
    multiplier: string;
    scaledNumerator: string;
    resultNumerator: string;
  };
  feedback: string;
  onInputChange: (field: "multiplier" | "scaledNumerator" | "resultNumerator", value: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  const originalLeftNumerator = visual.originalNumeratorA ?? visual.numeratorA;
  const originalLeftDenominator = visual.originalDenominatorA ?? visual.denominator;
  const originalRightNumerator = visual.originalNumeratorB ?? visual.numeratorB;
  const originalRightDenominator = visual.originalDenominatorB ?? visual.denominator;
  const conversionLeft = working.convertsLeft ? visual.numeratorA : originalLeftNumerator;
  const conversionRight = working.convertsLeft ? originalRightNumerator : visual.numeratorB;
  const showNumeratorStep = step === "numerator" || step === "solve" || step === "done";
  const showSolveStep = step === "solve" || step === "done";

  return (
    <div className="w-full rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
        Match, Rewrite, Solve
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <StackedFraction numerator={originalLeftNumerator} denominator={originalLeftDenominator} />
        <span className="text-3xl font-black text-emerald-700">{visual.operation}</span>
        <StackedFraction numerator={originalRightNumerator} denominator={originalRightDenominator} />
      </div>

      <div className="mt-5 grid gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
            Step 1: Find the multiplier
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-2xl font-black text-slate-900">
            <span>{working.denominatorToChange}</span>
            <span className="text-emerald-700">×</span>
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={inputs.multiplier}
              onChange={(event) => onInputChange("multiplier", event.target.value.replace(/\D/g, ""))}
              disabled={step !== "multiplier"}
              inputMode="numeric"
              aria-label="Denominator multiplier"
              className="h-14 w-20 rounded-xl border border-emerald-300 bg-white px-3 text-center text-2xl font-black text-slate-900 outline-none focus:border-teal-500 disabled:bg-emerald-50"
              style={{ WebkitTextFillColor: "#0f172a" }}
            />
            <span>=</span>
            <span>{visual.denominator}</span>
          </div>
        </div>

        {showNumeratorStep ? (
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
              Step 2: Apply it to the numerator
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-2xl font-black text-slate-900">
              <span>{working.numeratorToChange}</span>
              <span className="text-emerald-700">×</span>
              <span>{working.multiplier}</span>
              <span>=</span>
              <input
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={inputs.scaledNumerator}
                onChange={(event) => onInputChange("scaledNumerator", event.target.value.replace(/\D/g, ""))}
                disabled={step !== "numerator"}
                inputMode="numeric"
                aria-label="Converted numerator"
                className="h-14 w-20 rounded-xl border border-emerald-300 bg-white px-3 text-center text-2xl font-black text-slate-900 outline-none focus:border-teal-500 disabled:bg-emerald-50"
                style={{ WebkitTextFillColor: "#0f172a" }}
              />
            </div>
          </div>
        ) : null}

        {showSolveStep ? (
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
              Step 3: Rewrite and solve
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <StackedFraction numerator={working.numeratorToChange} denominator={working.denominatorToChange} />
              <span className="text-3xl font-black text-slate-400">=</span>
              <StackedFraction numerator={working.convertedNumerator} denominator={visual.denominator} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <StackedFraction numerator={conversionLeft} denominator={visual.denominator} />
              <span className="text-3xl font-black text-emerald-700">{visual.operation}</span>
              <StackedFraction numerator={conversionRight} denominator={visual.denominator} />
              <span className="text-3xl font-black text-emerald-700">=</span>
              <div className="inline-flex flex-col items-center rounded-xl bg-white px-4 py-3 shadow-sm">
                <input
                  ref={inputRef}
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  value={inputs.resultNumerator}
                  onChange={(event) => onInputChange("resultNumerator", event.target.value.replace(/\D/g, ""))}
                  disabled={step !== "solve"}
                  inputMode="numeric"
                  aria-label="Final numerator"
                  className="block h-12 w-20 appearance-none rounded-t-xl border border-b-0 border-emerald-300 bg-white px-3 text-center text-2xl font-black leading-none text-slate-900 caret-teal-600 outline-none focus:border-teal-500 disabled:bg-emerald-50"
                  style={{ WebkitTextFillColor: "#0f172a" }}
                />
                <span className="h-1 w-20 rounded-full bg-slate-500" />
                <span className="flex h-12 w-20 items-center justify-center rounded-b-xl border border-t-0 border-emerald-300 bg-emerald-50 text-center text-2xl font-black leading-none text-slate-800">
                  {visual.denominator}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {feedback ? (
        <div className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
          {feedback}
        </div>
      ) : null}
    </div>
  );
}

function columnLabel(label: string) {
  if (label === "O") return "ones";
  if (label === "T") return "tens";
  if (label === "H") return "hundreds";
  if (label === "Th") return "thousands";
  if (label === "t") return "tenths";
  if (label === "h") return "hundredths";
  return "current";
}

function formatWholeNumber(value: number) {
  return value.toLocaleString();
}

function digitCells(value: number, width: number) {
  return String(value).padStart(width, " ").split("");
}

function normalizeNumberInput(value: string) {
  return value.replace(/,/g, "").replace(/\s+/g, "");
}

function numericInputsMatch(actual: string, expected: string) {
  const normalizedActual = normalizeDecimalEquivalent(normalizeNumberInput(actual));
  const normalizedExpected = normalizeDecimalEquivalent(normalizeNumberInput(expected));
  if (normalizedActual === normalizedExpected) return true;

  const actualNumber = Number(normalizedActual);
  const expectedNumber = Number(normalizedExpected);
  return (
    Number.isFinite(actualNumber) &&
    Number.isFinite(expectedNumber) &&
    Math.abs(actualNumber - expectedNumber) < 0.000001
  );
}

function parseStructuredFraction(value: string) {
  const trimmed = value.trim();
  const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = Number(mixedMatch[1]);
    const numerator = Number(mixedMatch[2]);
    const denominator = Number(mixedMatch[3]);

    if (!Number.isFinite(whole) || !Number.isFinite(numerator) || !Number.isFinite(denominator)) {
      return null;
    }

    if (denominator === 0) return null;

    return { whole, numerator, denominator };
  }

  const simpleMatch = trimmed.match(/^(\d+)\/(\d+)$/);
  if (simpleMatch) {
    const numerator = Number(simpleMatch[1]);
    const denominator = Number(simpleMatch[2]);

    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
      return null;
    }

    return { whole: 0, numerator, denominator };
  }

  return null;
}

function mixedNumeralsEquivalent(
  left: { whole: number; numerator: number; denominator: number },
  right: { whole: number; numerator: number; denominator: number }
) {
  const leftImproper = left.whole * left.denominator + left.numerator;
  const rightImproper = right.whole * right.denominator + right.numerator;
  return leftImproper * right.denominator === rightImproper * left.denominator;
}

function parseFlexibleFraction(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^\d+$/.test(trimmed)) {
    const whole = Number(trimmed);
    if (!Number.isFinite(whole)) return null;
    return { whole, numerator: 0, denominator: 1 };
  }

  const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = Number(mixedMatch[1]);
    const numerator = Number(mixedMatch[2]);
    const denominator = Number(mixedMatch[3]);
    if (!Number.isFinite(whole) || !Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
      return null;
    }
    return { whole, numerator, denominator };
  }

  const simpleMatch = trimmed.match(/^(\d+)\/(\d+)$/);
  if (simpleMatch) {
    const numerator = Number(simpleMatch[1]);
    const denominator = Number(simpleMatch[2]);
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
      return null;
    }
    return { whole: 0, numerator, denominator };
  }

  return null;
}

function structuredFractionKey(questionData: TypedResponseQuestion) {
  return [
    questionData.prompt,
    questionData.answer,
    questionData.helper ?? "",
    questionData.placeholder ?? "",
    questionData.fixedDenominator ?? "",
    questionData.visual?.type ?? "",
    questionData.visual?.type === "same_denominator_operation"
      ? [
          questionData.visual.numeratorA,
          questionData.visual.numeratorB,
          questionData.visual.denominator,
          questionData.visual.operation,
          questionData.visual.originalNumeratorA ?? "",
          questionData.visual.originalDenominatorA ?? "",
          questionData.visual.originalNumeratorB ?? "",
          questionData.visual.originalDenominatorB ?? "",
        ].join(",")
      : "",
  ].join("|");
}

function getWrittenMethodKey(writtenMethod?: WrittenMethodLayout) {
  if (!writtenMethod) return "";
  return [
    writtenMethod.title,
    writtenMethod.operation,
    writtenMethod.answerLength,
    writtenMethod.top.join(","),
    writtenMethod.bottom.join(","),
    writtenMethod.placeValueLabels.join(","),
    writtenMethod.carryRow?.join(",") ?? "",
    writtenMethod.borrowRow?.join(",") ?? "",
    writtenMethod.crossedTop?.join(",") ?? "",
  ].join("|");
}

function isEquivalentNumberSequence(input: string, expected: string) {
  const inputParts = extractSequenceNumbers(input);
  const expectedParts = extractSequenceNumbers(expected);

  if (inputParts.length < 2 || expectedParts.length < 2) {
    return false;
  }

  if (inputParts.length !== expectedParts.length) {
    return false;
  }

  return inputParts.every((part, index) => part === expectedParts[index]);
}

function getColumnMultiplicationButtonLabel(
  step: "ones_digit" | "carry" | "ones_row" | "tens_row" | "total" | "done"
) {
  return step === "total" || step === "done" ? "Check answer" : "Check step";
}

function getColumnMultiplicationRows(topValue: number, bottomValue: number) {
  const digits = String(bottomValue).split("").map(Number);
  const onesDigit = digits[digits.length - 1] ?? 0;
  const tensDigit = digits.length > 1 ? digits[digits.length - 2] ?? 0 : null;
  const onesRow = topValue * onesDigit;
  const tensRow = tensDigit === null ? null : topValue * tensDigit * 10;
  const total = topValue * bottomValue;
  return { onesRow, tensRow, total };
}

function getColumnMultiplicationStepData(topValue: number, bottomValue: number) {
  const topDigits = String(topValue).split("").map(Number);
  const bottomDigits = String(bottomValue).split("").map(Number);
  const topOnes = topDigits[topDigits.length - 1] ?? 0;
  const topTens = topDigits[topDigits.length - 2] ?? 0;
  const bottomOnes = bottomDigits[bottomDigits.length - 1] ?? 0;
  const firstProduct = topOnes * bottomOnes;
  const carry = Math.floor(firstProduct / 10);
  const onesDigit = firstProduct % 10;
  const onesRow = topValue * bottomOnes;
  const onesRowLeading = Math.floor(onesRow / 10);
  return {
    topOnes,
    topTens,
    bottomOnes,
    carry,
    onesDigit,
    onesRow,
    onesRowLeading,
  };
}

function splitForBoxMethod(value: number) {
  return value >= 10 ? [Math.floor(value / 10) * 10, value % 10].filter(Boolean) : [value];
}

function getBoxMethodCells(leftValue: number, topValue: number) {
  const splitLeft = splitForBoxMethod(leftValue);
  const splitTop = splitForBoxMethod(topValue);
  const cells = splitLeft.flatMap((left) => splitTop.map((top) => left * top));
  const total = cells.reduce((sum, value) => sum + value, 0);
  return { splitLeft, splitTop, cells, total };
}

function isStaticWrittenMethodCell(writtenMethod: WrittenMethodLayout | undefined, index: number) {
  return Boolean(writtenMethod?.fixedAnswerCells?.[index]);
}

function getLastEditableWrittenMethodColumn(writtenMethod: WrittenMethodLayout | undefined) {
  if (!writtenMethod) return -1;
  for (let index = writtenMethod.answerLength - 1; index >= 0; index -= 1) {
    if (!isStaticWrittenMethodCell(writtenMethod, index)) return index;
  }
  return -1;
}

function getPreviousEditableWrittenMethodColumn(
  writtenMethod: WrittenMethodLayout | undefined,
  fromIndex: number
) {
  if (!writtenMethod) return -1;
  for (let index = fromIndex - 1; index >= 0; index -= 1) {
    if (!isStaticWrittenMethodCell(writtenMethod, index)) return index;
  }
  return -1;
}

function numericWrittenMethodDigits(cells: string[]) {
  return cells.map((digit) => (/^\d$/.test(digit) ? Number(digit) : 0));
}

function ColumnMultiplicationWorkedExample() {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
        Worked Example
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-700">
        Multiply the ones first, then the tens. Add the rows.
      </p>
      <div className="mt-4 w-fit rounded-xl bg-emerald-50/70 p-4">
        <div className="grid w-fit grid-flow-col gap-2">
          <div className="w-8" />
          {digitCells(23, 4).map((digit, index) => (
            <div key={`example-top-${index}`} className="flex h-10 w-10 items-center justify-center text-2xl font-black text-slate-900">
              {digit.trim()}
            </div>
          ))}
        </div>
        <div className="mt-1 grid w-fit grid-flow-col gap-2">
          <div className="flex h-10 w-8 items-center justify-center text-3xl font-black text-slate-700">×</div>
          {digitCells(45, 4).map((digit, index) => (
            <div key={`example-bottom-${index}`} className="flex h-10 w-10 items-center justify-center text-2xl font-black text-slate-900">
              {digit.trim()}
            </div>
          ))}
        </div>
        <div className="mt-2 h-1 w-full rounded bg-slate-300" />
        <div className="mt-2 grid w-fit grid-flow-col gap-2">
          <div className="w-8" />
          {digitCells(115, 4).map((digit, index) => (
            <div key={`example-row1-${index}`} className="flex h-10 w-10 items-center justify-center text-2xl font-black text-slate-900">
              {digit.trim()}
            </div>
          ))}
          <div className="pl-3 text-sm font-semibold text-slate-600">(23 × 5)</div>
        </div>
        <div className="mt-1 grid w-fit grid-flow-col gap-2">
          <div className="w-8" />
          {digitCells(920, 4).map((digit, index) => (
            <div key={`example-row2-${index}`} className="flex h-10 w-10 items-center justify-center text-2xl font-black text-slate-900">
              {digit.trim()}
            </div>
          ))}
          <div className="pl-3 text-sm font-semibold text-slate-600">(23 × 40)</div>
        </div>
        <div className="mt-2 h-1 w-full rounded bg-slate-300" />
        <div className="mt-2 grid w-fit grid-flow-col gap-2">
          <div className="w-8" />
          {digitCells(1035, 4).map((digit, index) => (
            <div key={`example-total-${index}`} className="flex h-10 w-10 items-center justify-center text-2xl font-black text-slate-900">
              {digit.trim()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FixedFractionValue({
  numerator,
  denominator,
}: {
  numerator: number | undefined;
  denominator: number | undefined;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-14 w-24 items-center justify-center rounded-t-xl border border-b-0 border-slate-300 bg-white text-3xl font-black text-slate-900">
        {numerator}
      </div>
      <div className="h-1 w-24 rounded-full bg-slate-600" />
      <div className="flex h-14 w-24 items-center justify-center rounded-b-xl border border-t-0 border-slate-300 bg-white text-3xl font-black text-slate-900">
        {denominator}
      </div>
    </div>
  );
}

function MissingFractionValue({
  numerator,
  denominator,
  missing,
  value,
  onChange,
}: {
  numerator: number | undefined;
  denominator: number | undefined;
  missing: "numerator" | "denominator";
  value: string;
  onChange: (value: string) => void;
}) {
  const input = (
    <input
      type="text"
      autoComplete="off"
      spellCheck={false}
      value={value}
      onChange={(event) => onChange(event.target.value.replace(/\D/g, ""))}
      inputMode="numeric"
      placeholder=""
      className="block h-14 w-24 appearance-none border border-slate-300 bg-white px-3 text-center text-3xl font-black leading-none text-slate-900 caret-teal-600 outline-none focus:border-teal-500"
      style={{ WebkitTextFillColor: "#0f172a" }}
    />
  );

  return (
    <div className="flex flex-col items-center">
      {missing === "numerator" ? (
        <div className="overflow-hidden rounded-t-xl">{input}</div>
      ) : (
        <div className="flex h-14 w-24 items-center justify-center rounded-t-xl border border-b-0 border-slate-300 bg-white text-3xl font-black text-slate-900">
          {numerator}
        </div>
      )}
      <div className="h-1 w-24 rounded-full bg-slate-600" />
      {missing === "denominator" ? (
        <div className="overflow-hidden rounded-b-xl">{input}</div>
      ) : (
        <div className="flex h-14 w-24 items-center justify-center rounded-b-xl border border-t-0 border-slate-300 bg-white text-3xl font-black text-slate-900">
          {denominator}
        </div>
      )}
    </div>
  );
}

function ColumnMultiplicationWorkspace({
  topValue,
  bottomValue,
  carryValue,
  onesDigitValue,
  onesRowLeadingValue,
  tensRowValue,
  totalValue,
  currentStep,
  onChange,
}: {
  topValue: number;
  bottomValue: number;
  carryValue: string;
  onesDigitValue: string;
  onesRowLeadingValue: string;
  tensRowValue: string;
  totalValue: string;
  currentStep: "ones_digit" | "carry" | "ones_row" | "tens_row" | "total" | "done";
  onChange: (
    field: "carry" | "onesDigit" | "onesRowLeading" | "tensRow" | "total",
    value: string
  ) => void;
}) {
  const { tensRow } = getColumnMultiplicationRows(topValue, bottomValue);
  const stepData = getColumnMultiplicationStepData(topValue, bottomValue);
  const width = Math.max(
    String(topValue).length,
    String(bottomValue).length,
    String(topValue * bottomValue).length
  );
  const topDigits = digitCells(topValue, width);
  const bottomDigits = digitCells(bottomValue, width);
  const rowCount = tensRow === null ? 1 : 2;

  return (
    <div className="w-fit rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-1 grid w-fit grid-flow-col gap-2">
        <div className="w-8" />
        {Array.from({ length: width }).map((_, index) => {
          const carryIndex = width - 2;
          if (index !== carryIndex) {
            return <div key={`carry-slot-${index}`} className="h-8 w-12" />;
          }

          const showCarryValue = currentStep !== "ones_digit";
          return (
            <div key={`carry-slot-${index}`} className="flex h-8 w-12 items-center justify-center">
              <input
                value={showCarryValue ? carryValue : ""}
                onChange={(event) => onChange("carry", event.target.value)}
                inputMode="numeric"
                maxLength={1}
                disabled={currentStep !== "carry"}
                className={[
                  "h-8 w-8 rounded-md border border-amber-200 bg-amber-50 text-center text-sm font-black text-amber-700 outline-none",
                  currentStep === "carry" ? "focus:border-amber-500 ring-2 ring-amber-200" : "",
                  currentStep !== "carry" ? "opacity-90" : "",
                ].join(" ")}
              />
            </div>
          );
        })}
      </div>
      <div className="grid w-fit grid-flow-col gap-2">
        <div className="w-8" />
        {topDigits.map((digit, index) => (
          <div key={`workspace-top-${index}`} className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-2xl font-black text-slate-900">
            {digit.trim()}
          </div>
        ))}
      </div>
      <div className="mt-2 grid w-fit grid-flow-col gap-2">
        <div className="flex h-12 w-8 items-center justify-center text-3xl font-black text-slate-700">×</div>
        {bottomDigits.map((digit, index) => (
          <div key={`workspace-bottom-${index}`} className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-2xl font-black text-slate-900">
            {digit.trim()}
          </div>
        ))}
      </div>
      <div className="mt-3 h-1 w-full rounded bg-slate-300" />
      <div className="mt-3 space-y-2">
        <div className="grid w-fit grid-flow-col gap-2">
          <div className="w-8" />
          {width > 1 ? (
            <input
              value={currentStep === "ones_digit" ? "" : onesRowLeadingValue}
              onChange={(event) => onChange("onesRowLeading", event.target.value)}
              inputMode="numeric"
              placeholder=""
              disabled={currentStep !== "ones_row"}
              className={[
                "h-12 rounded-lg border-2 border-dashed border-teal-200 bg-teal-50/50 px-3 text-right text-xl font-black text-slate-900 outline-none",
                currentStep === "ones_row" ? "focus:border-teal-500 ring-2 ring-teal-200" : "",
              ].join(" ")}
              style={{ width: `${(width - 1) * 48 + Math.max(0, width - 2) * 8}px` }}
            />
          ) : null}
          <input
            value={onesDigitValue}
            onChange={(event) => onChange("onesDigit", event.target.value)}
            inputMode="numeric"
            maxLength={1}
            placeholder=""
            disabled={currentStep !== "ones_digit"}
            className={[
              "h-12 w-12 rounded-lg border-2 border-dashed border-teal-200 bg-teal-50/50 text-center text-xl font-black text-slate-900 outline-none",
              currentStep === "ones_digit" ? "focus:border-teal-500 ring-2 ring-teal-200" : "",
            ].join(" ")}
          />
        </div>
        {rowCount > 1 ? (
          <div className="grid w-fit grid-flow-col gap-2">
            <div className="w-8" />
            <input
              value={tensRowValue}
              onChange={(event) => onChange("tensRow", event.target.value)}
              inputMode="numeric"
              placeholder=""
              disabled={currentStep !== "tens_row"}
              className={[
                "col-span-1 h-12 max-w-full rounded-lg border-2 border-dashed border-teal-200 bg-teal-50/50 px-3 text-right text-xl font-black text-slate-900 outline-none",
                currentStep === "tens_row" ? "focus:border-teal-500 ring-2 ring-teal-200" : "",
              ].join(" ")}
              style={{ width: `${(width + 1) * 48 + Math.max(0, width) * 8}px` }}
            />
          </div>
        ) : null}
      </div>
      {rowCount > 1 ? <div className="mt-3 h-1 w-full rounded bg-slate-300" /> : null}
      <div className="mt-3 grid w-fit grid-flow-col gap-2">
        <div className="w-8" />
        <input
          value={totalValue}
          onChange={(event) => onChange("total", event.target.value)}
          inputMode="numeric"
          placeholder=""
          disabled={currentStep !== "total"}
          className={[
            "col-span-1 h-12 max-w-full rounded-lg border-2 border-dashed border-amber-200 bg-amber-50/50 px-3 text-right text-xl font-black text-slate-900 outline-none",
            currentStep === "total" ? "focus:border-amber-500 ring-2 ring-amber-200" : "",
          ].join(" ")}
          style={{ width: `${(width + (rowCount > 1 ? 1 : 0)) * 48 + Math.max(0, width + (rowCount > 1 ? 1 : 0) - 1) * 8}px` }}
        />
      </div>
      <div className="mt-3 text-xs font-medium text-slate-500">
        {currentStep === "ones_digit"
          ? `Multiply ${stepData.topOnes} × ${stepData.bottomOnes}. Enter the ones digit.`
          : currentStep === "carry"
          ? "Carry the extra above the next column."
          : currentStep === "ones_row"
          ? `Multiply ${stepData.topTens} × ${stepData.bottomOnes} and add the carry.`
          : currentStep === "tens_row"
          ? "Now complete the tens row, shifted one place left."
          : currentStep === "total"
          ? "Add the rows to find the final total."
          : "Column multiplication complete."}
      </div>
    </div>
  );
}

function BoxMethodWorkedExample() {
  const rowLabels = ["20", "3"];
  const columnLabels = ["40", "5"];
  const cells = [
    ["800", "100"],
    ["120", "15"],
  ];

  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
        Worked Example
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-700">
        Split into tens and ones. Find each box. Add the totals.
      </p>
      <div className="mt-4 w-fit rounded-xl bg-emerald-50/70 p-4">
        <div className="mb-2 text-sm font-bold text-slate-700">23 × 45</div>
        <div className="grid grid-cols-[56px_repeat(2,88px)] gap-2">
          <div />
          {columnLabels.map((label) => (
            <div key={`box-col-${label}`} className="flex h-12 items-center justify-center rounded-lg bg-slate-100 text-xl font-black text-slate-900">
              {label}
            </div>
          ))}
          {rowLabels.map((label, rowIndex) => (
            <div key={`row-${label}`} className="contents">
              <div className="flex h-12 items-center justify-center rounded-lg bg-slate-100 text-xl font-black text-slate-900">
                {label}
              </div>
              {cells[rowIndex].map((cell, cellIndex) => (
                <div key={`box-cell-${rowIndex}-${cellIndex}`} className="flex h-12 items-center justify-center rounded-lg bg-white text-xl font-black text-slate-900 shadow-sm">
                  {cell}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-3 text-sm font-semibold text-slate-700">800 + 100 + 120 + 15 = 1035</div>
      </div>
    </div>
  );
}

function BoxMethodWorkspace({
  leftValue,
  topValue,
  boxValues,
  totalValue,
  onChange,
}: {
  leftValue: number;
  topValue: number;
  boxValues: string[];
  totalValue: string;
  onChange: (field: "box" | "total", value: string, index?: number) => void;
}) {
  const { splitLeft, splitTop } = getBoxMethodCells(leftValue, topValue);

  return (
    <div className="w-fit rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-2 text-sm font-bold text-slate-700">
        {formatWholeNumber(leftValue)} × {formatWholeNumber(topValue)}
      </div>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `56px repeat(${splitTop.length}, 88px)` }}
      >
        <div />
        {splitTop.map((label, index) => (
          <div key={`workspace-col-${index}`} className="flex h-12 items-center justify-center rounded-lg bg-slate-100 text-xl font-black text-slate-900">
            {label}
          </div>
        ))}
        {splitLeft.map((label, rowIndex) => (
          <div key={`workspace-row-${rowIndex}`} className="contents">
            <div className="flex h-12 items-center justify-center rounded-lg bg-slate-100 text-xl font-black text-slate-900">
              {label}
            </div>
            {splitTop.map((topLabel, cellIndex) => {
              const flatIndex = rowIndex * splitTop.length + cellIndex;
              return (
                <div
                  key={`workspace-box-${rowIndex}-${cellIndex}`}
                  className="relative flex h-12 items-center justify-center rounded-lg border-2 border-dashed border-teal-200 bg-teal-50/50 px-2"
                >
                  {!boxValues[flatIndex] ? (
                    <span className="pointer-events-none absolute left-2 top-1 text-[10px] font-bold text-slate-400">
                      {label} × {topLabel}
                    </span>
                  ) : null}
                  <input
                    value={boxValues[flatIndex] ?? ""}
                    onChange={(event) => onChange("box", event.target.value, flatIndex)}
                    inputMode="numeric"
                    className={[
                      "h-10 w-full rounded-md bg-transparent text-center text-xl font-black text-slate-900 outline-none",
                      "focus:ring-2 focus:ring-teal-200",
                    ].join(" ")}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-lg border-2 border-dashed border-amber-200 bg-amber-50/50 px-4 py-3">
        <div className="text-sm font-semibold text-amber-700">Final total</div>
        <input
          value={totalValue}
          onChange={(event) => onChange("total", event.target.value)}
          inputMode="numeric"
          className={[
            "mt-2 h-11 w-full rounded-lg bg-transparent px-2 text-lg font-black text-slate-900 outline-none",
            "focus:ring-2 focus:ring-amber-200",
          ].join(" ")}
        />
      </div>
      <div className="mt-3 text-xs font-medium text-slate-500">
        Complete each box step-by-step, then add the totals.
      </div>
    </div>
  );
}

type MultiplicationStrategy = "box_method" | "long_multiplication" | "split_sum";
type EstimateReasonableness = "yes" | "no";

function getSplitSumParts(value: number) {
  const tensPart = Math.floor(value / 10) * 10;
  const onesPart = value % 10;
  return { tensPart, onesPart };
}

function LongMultiplicationStrategyWorkspace({
  topValue,
  bottomValue,
  carryValue,
  onesRowValue,
  tensRowValue,
  totalValue,
  onChange,
}: {
  topValue: number;
  bottomValue: number;
  carryValue: string;
  onesRowValue: string;
  tensRowValue: string;
  totalValue: string;
  onChange: (field: "carry" | "onesRow" | "tensRow" | "total", value: string) => void;
}) {
  const width = Math.max(
    String(topValue).length,
    String(bottomValue).length,
    String(topValue * bottomValue).length
  );
  const topDigits = digitCells(topValue, width);
  const bottomDigits = digitCells(bottomValue, width);
  const topNumberDigits = String(topValue).split("").map(Number);
  const bottomNumberDigits = String(bottomValue).split("").map(Number);
  const onesDigit = bottomNumberDigits[bottomNumberDigits.length - 1] ?? 0;
  const topOnes = topNumberDigits[topNumberDigits.length - 1] ?? 0;
  const firstCarry = Math.floor((topOnes * onesDigit) / 10);

  return (
    <div className="w-fit rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-1 grid w-fit grid-flow-col gap-2">
        <div className="w-8" />
        {Array.from({ length: width }).map((_, index) => {
          const carryIndex = width - 2;
          if (index !== carryIndex) {
            return <div key={`strategy-carry-slot-${index}`} className="h-8 w-12" />;
          }

          return (
            <div key={`strategy-carry-slot-${index}`} className="flex h-8 w-12 items-center justify-center">
              <input
                value={carryValue}
                onChange={(event) => onChange("carry", event.target.value)}
                inputMode="numeric"
                maxLength={1}
                className="h-8 w-8 rounded-md border border-amber-200 bg-amber-50 text-center text-sm font-black text-amber-700 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              />
            </div>
          );
        })}
      </div>
      <div className="grid w-fit grid-flow-col gap-2">
        <div className="w-8" />
        {topDigits.map((digit, index) => (
          <div key={`strategy-top-${index}`} className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-2xl font-black text-slate-900">
            {digit.trim()}
          </div>
        ))}
      </div>
      <div className="mt-2 grid w-fit grid-flow-col gap-2">
        <div className="flex h-12 w-8 items-center justify-center text-3xl font-black text-slate-700">×</div>
        {bottomDigits.map((digit, index) => (
          <div key={`strategy-bottom-${index}`} className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-2xl font-black text-slate-900">
            {digit.trim()}
          </div>
        ))}
      </div>
      <div className="mt-3 h-1 w-full rounded bg-slate-300" />
      <div className="mt-3 grid w-fit grid-flow-col gap-2">
        <div className="w-8" />
        <input
          value={onesRowValue}
          onChange={(event) => onChange("onesRow", event.target.value)}
          inputMode="numeric"
          className="h-12 rounded-lg border-2 border-dashed border-teal-200 bg-teal-50/50 px-3 text-right text-xl font-black text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          style={{ width: `${width * 48 + Math.max(0, width - 1) * 8}px` }}
        />
      </div>
      <div className="mt-2 grid w-fit grid-flow-col gap-2">
        <div className="w-8" />
        <input
          value={tensRowValue}
          onChange={(event) => onChange("tensRow", event.target.value)}
          inputMode="numeric"
          className="h-12 rounded-lg border-2 border-dashed border-teal-200 bg-teal-50/50 px-3 text-right text-xl font-black text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          style={{ width: `${(width + 1) * 48 + Math.max(0, width) * 8}px` }}
        />
      </div>
      <div className="mt-3 h-1 w-full rounded bg-slate-300" />
      <div className="mt-3 grid w-fit grid-flow-col gap-2">
        <div className="w-8" />
        <input
          value={totalValue}
          onChange={(event) => onChange("total", event.target.value)}
          inputMode="numeric"
          className="h-12 rounded-lg border-2 border-dashed border-amber-200 bg-amber-50/50 px-3 text-right text-xl font-black text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          style={{ width: `${(width + 1) * 48 + Math.max(0, width) * 8}px` }}
        />
      </div>
      <div className="mt-3 text-xs font-medium text-slate-500">
        Enter any carry above the next column, then complete both partial-product rows and the total.
        {firstCarry > 0 ? ` The first carry is needed after ${topOnes} × ${onesDigit}.` : " No carry is needed in the first step."}
      </div>
    </div>
  );
}

function SplitSumWorkspace({
  topValue,
  bottomValue,
  tensProductValue,
  onesProductValue,
  totalValue,
  onChange,
}: {
  topValue: number;
  bottomValue: number;
  tensProductValue: string;
  onesProductValue: string;
  totalValue: string;
  onChange: (field: "tensProduct" | "onesProduct" | "total", value: string) => void;
}) {
  const { tensPart, onesPart } = getSplitSumParts(bottomValue);

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="min-w-[110px] text-lg font-black text-slate-900">
            {formatWholeNumber(topValue)} × {formatWholeNumber(tensPart)}
          </div>
          <span className="text-lg font-black text-slate-500">=</span>
          <input
            value={tensProductValue}
            onChange={(event) => onChange("tensProduct", event.target.value)}
            inputMode="numeric"
            className="h-12 min-w-[170px] rounded-lg border-2 border-dashed border-teal-200 bg-teal-50/50 px-3 text-right text-xl font-black text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="min-w-[110px] text-lg font-black text-slate-900">
            {formatWholeNumber(topValue)} × {formatWholeNumber(onesPart)}
          </div>
          <span className="text-lg font-black text-slate-500">=</span>
          <input
            value={onesProductValue}
            onChange={(event) => onChange("onesProduct", event.target.value)}
            inputMode="numeric"
            className="h-12 min-w-[170px] rounded-lg border-2 border-dashed border-teal-200 bg-teal-50/50 px-3 text-right text-xl font-black text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          />
        </div>
        <div className="h-1 w-full rounded bg-slate-300" />
        <div className="flex items-center gap-3">
          <div className="min-w-[110px] text-lg font-black text-slate-900">Total</div>
          <span className="text-lg font-black text-slate-500">=</span>
          <input
            value={totalValue}
            onChange={(event) => onChange("total", event.target.value)}
            inputMode="numeric"
            className="h-12 min-w-[170px] rounded-lg border-2 border-dashed border-amber-200 bg-amber-50/50 px-3 text-right text-xl font-black text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
        </div>
      </div>
      <div className="mt-3 text-xs font-medium text-slate-500">
        Split the second factor into tens and ones, find each product, then add the total.
      </div>
    </div>
  );
}

export default function TypedResponseActivity({
  questionData,
  onCorrect,
  onWrong,
  renderMode = "lesson",
}: {
  questionData: TypedResponseQuestion;
  onCorrect?: () => void;
  onWrong?: () => void;
  renderMode?: "lesson" | "quiz";
}) {
  const writtenMethod = questionData.writtenMethod;
  const isGuidedAddition = writtenMethod?.operation === "+";
  const isGuidedSubtraction = writtenMethod?.operation === "-";
  const isColumnMultiplication = writtenMethod?.operation === "×";
  const isStrategyMultiplication = questionData.visual?.type === "multiplication_strategy";
  const isEstimateStrategyMultiplication = questionData.visual?.type === "multiplication_estimate_strategy";
  const isDivisionRemainderCheck = questionData.visual?.type === "division_remainder_check";
  const isDivisionBuildGroups = questionData.visual?.type === "division_build_groups";
  const isNumericInputOnly = questionData.visual?.type === "numeric_input_only";
  const fractionDecimalPercentConversionVisual =
    questionData.visual?.type === "fraction_decimal_percent_conversion" ? questionData.visual : null;
  const isFractionDecimalPercentConversion = fractionDecimalPercentConversionVisual !== null;
  const percentStructuredMethodVisual =
    questionData.visual?.type === "percent_structured_method" ? questionData.visual : null;
  const isPercentStructuredMethod = percentStructuredMethodVisual !== null;
  const discountStepMethodVisual =
    questionData.visual?.type === "discount_step_method" ? questionData.visual : null;
  const isDiscountStepMethod = discountStepMethodVisual !== null;
  const multiStepMethodVisual =
    questionData.visual?.type === "multi_step_method" ? questionData.visual : null;
  const isMultiStepMethod = multiStepMethodVisual !== null;
  const strategyOwnershipVisual =
    questionData.visual?.type === "strategy_ownership" ? questionData.visual : null;
  const isStrategyOwnership = strategyOwnershipVisual !== null;
  const equivalentFractionInputVisual =
    questionData.visual?.type === "equivalent_fraction_input" ? questionData.visual : null;
  const isEquivalentFractionInput = equivalentFractionInputVisual !== null;
  const sameDenominatorOperationVisual =
    questionData.visual?.type === "same_denominator_operation" ? questionData.visual : null;
  const relatedDenominatorWorking = sameDenominatorOperationVisual
    ? getRelatedDenominatorWorking(sameDenominatorOperationVisual)
    : null;
  const isRelatedDenominatorWorking = relatedDenominatorWorking !== null;
  const buildGroupsVisual =
    questionData.visual?.type === "division_build_groups" ? questionData.visual : null;
  const strategyVisual =
    questionData.visual?.type === "multiplication_strategy" ||
    questionData.visual?.type === "multiplication_estimate_strategy"
      ? questionData.visual
      : null;
  const isGuidedWrittenMethod = isGuidedAddition || isGuidedSubtraction;
  const orderingAnswerParts = !writtenMethod ? extractOrderingNumbers(questionData.answer) : [];
  const expectedStructuredFraction = !writtenMethod ? parseStructuredFraction(questionData.answer) : null;
  const acceptedAnswerList = [questionData.answer, ...(questionData.acceptedAnswers ?? [])].filter(Boolean);
  const declaredInputType = questionData.inputType;
  const isOrderingResponse =
    !writtenMethod &&
    orderingAnswerParts.length >= 4 &&
    /Type the numbers from (smallest to largest|largest to smallest)/i.test(questionData.prompt) &&
    orderingAnswerParts.every((part) => /^\d+$/.test(part));
  const isFractionInput = declaredInputType === "fraction";
  const isMixedNumberInput = declaredInputType === "mixed";
  const isFlexibleFractionInput = declaredInputType === "flexible_fraction";
  const isStructuredFractionResponse =
    !writtenMethod &&
    !isOrderingResponse &&
    questionData.kind === "typed_response" &&
    (isFractionInput || isMixedNumberInput || isFlexibleFractionInput || !!expectedStructuredFraction);
  const isMixedNumberResponse =
    (isStructuredFractionResponse && isMixedNumberInput) ||
    (!declaredInputType && isStructuredFractionResponse && (expectedStructuredFraction?.whole ?? 0) > 0);
  const showsWholeNumberField = isMixedNumberResponse || isFlexibleFractionInput;
  const usesFixedDenominator =
    (isStructuredFractionResponse || isFractionInput) && typeof questionData.fixedDenominator === "number";
  const isIntegerInput = declaredInputType === "integer";
  const [typed, setTyped] = useState("");
  const [fractionWholeInput, setFractionWholeInput] = useState("");
  const [fractionNumeratorInput, setFractionNumeratorInput] = useState("");
  const [fractionDenominatorInput, setFractionDenominatorInput] = useState("");
  const [conversionDecimalInput, setConversionDecimalInput] = useState("");
  const [conversionPercentInput, setConversionPercentInput] = useState("");
  const [percentMethodStep, setPercentMethodStep] = useState(0);
  const [percentMethodInputs, setPercentMethodInputs] = useState<string[]>(
    percentStructuredMethodVisual || discountStepMethodVisual || multiStepMethodVisual
      ? Array.from({
          length:
            (percentStructuredMethodVisual ?? discountStepMethodVisual ?? multiStepMethodVisual)?.steps.length ?? 0,
        }, () => "")
      : []
  );
  const [percentMethodFeedback, setPercentMethodFeedback] = useState("");
  const [relatedDenominatorStep, setRelatedDenominatorStep] =
    useState<RelatedDenominatorStep>("multiplier");
  const [relatedDenominatorInputs, setRelatedDenominatorInputs] = useState({
    multiplier: "",
    scaledNumerator: "",
    resultNumerator: "",
  });
  const [relatedDenominatorFeedback, setRelatedDenominatorFeedback] = useState("");
  const [columnChartInputs, setColumnChartInputs] = useState<{
    carry: string;
    onesDigit: string;
    onesRowLeading: string;
    tensRow: string;
    total: string;
  }>({
    carry: "",
    onesDigit: "",
    onesRowLeading: "",
    tensRow: "",
    total: "",
  });
  const [multiplicationStep, setMultiplicationStep] = useState<
    "ones_digit" | "carry" | "ones_row" | "tens_row" | "total" | "done"
  >("ones_digit");
  const [multiplicationFeedback, setMultiplicationFeedback] = useState("");
  const [boxMethodInputs, setBoxMethodInputs] = useState<string[]>([]);
  const [boxMethodTotal, setBoxMethodTotal] = useState("");
  const [boxMethodFeedback, setBoxMethodFeedback] = useState("");
  const [selectedStrategy, setSelectedStrategy] = useState<MultiplicationStrategy | null>(null);
  const [strategyLocked, setStrategyLocked] = useState(false);
  const [strategyFeedback, setStrategyFeedback] = useState("");
  const [ownershipStrategy, setOwnershipStrategy] = useState<string | null>(null);
  const [ownershipReflection, setOwnershipReflection] = useState<string | null>(null);
  const [ownershipFeedback, setOwnershipFeedback] = useState("");
  const [ownershipSolved, setOwnershipSolved] = useState(false);
  const [estimateInput, setEstimateInput] = useState("");
  const [reasonablenessChoice, setReasonablenessChoice] = useState<EstimateReasonableness | null>(null);
  const [reasonablenessExplanation, setReasonablenessExplanation] = useState("");
  const [strategyLongInputs, setStrategyLongInputs] = useState({
    carry: "",
    onesRow: "",
    tensRow: "",
    total: "",
  });
  const [strategySplitInputs, setStrategySplitInputs] = useState({
    tensProduct: "",
    onesProduct: "",
    total: "",
  });
  const [divisionCheckInputs, setDivisionCheckInputs] = useState({
    quotient: "",
    remainder: "",
    checkQuotient: "",
    checkRemainder: "",
    checkTotal: "",
  });
  const [divisionCheckFeedback, setDivisionCheckFeedback] = useState("");
  const [revealedGroupCount, setRevealedGroupCount] = useState(0);
  const [buildGroupsRemainder, setBuildGroupsRemainder] = useState("");
  const [buildGroupsFeedback, setBuildGroupsFeedback] = useState("");
  const [orderedInputs, setOrderedInputs] = useState<string[]>(
    isOrderingResponse ? Array.from({ length: orderingAnswerParts.length }, () => "") : []
  );
  const [digitInputs, setDigitInputs] = useState<string[]>(
    writtenMethod
      ? Array.from({ length: writtenMethod.answerLength }, () => "")
      : []
  );
  const [workingTopDigits, setWorkingTopDigits] = useState<number[]>(
    isGuidedSubtraction && writtenMethod
      ? writtenMethod.top.map((digit) => Number(digit || 0))
      : []
  );
  const [borrowDisplay, setBorrowDisplay] = useState<string[]>(
    isGuidedSubtraction && writtenMethod
      ? Array.from({ length: writtenMethod.answerLength }, () => "")
      : []
  );
  const [carryDisplay, setCarryDisplay] = useState<string[]>(
    isGuidedAddition && writtenMethod
      ? Array.from({ length: writtenMethod.answerLength }, () => "")
      : []
  );
  const [carryValues, setCarryValues] = useState<number[]>(
    isGuidedAddition && writtenMethod
      ? Array.from({ length: writtenMethod.answerLength }, () => 0)
      : []
  );
  const [crossedDigits, setCrossedDigits] = useState<boolean[]>(
    isGuidedSubtraction && writtenMethod
      ? Array.from({ length: writtenMethod.answerLength }, () => false)
      : []
  );
  const [currentColumn, setCurrentColumn] = useState(
    isGuidedWrittenMethod ? getLastEditableWrittenMethodColumn(writtenMethod) : -1
  );
  const [guidedPhase, setGuidedPhase] = useState<"decide" | "input" | "done">(
    isGuidedWrittenMethod && writtenMethod ? "decide" : "done"
  );
  const [guidedFeedback, setGuidedFeedback] = useState("");
  const wholeRef = useRef<HTMLInputElement | null>(null);
  const numeratorRef = useRef<HTMLInputElement | null>(null);
  const denominatorRef = useRef<HTMLInputElement | null>(null);
  const questionKey = structuredFractionKey(questionData);
  const currentWrittenMethodKey = getWrittenMethodKey(writtenMethod);
  const resetKey = [
    questionKey,
    currentWrittenMethodKey,
    isGuidedWrittenMethod ? "guided" : "plain",
    isOrderingResponse ? `ordering-${orderingAnswerParts.length}` : "not-ordering",
  ].join("|");

  useEffect(() => {
    const resetTimer = setTimeout(() => {
      setTyped("");
      setFractionWholeInput("");
      setFractionNumeratorInput("");
      setFractionDenominatorInput(questionData.fixedDenominator ? String(questionData.fixedDenominator) : "");
      setConversionDecimalInput("");
      setConversionPercentInput("");
      setPercentMethodStep(0);
      setPercentMethodInputs(
        questionData.visual?.type === "percent_structured_method" ||
          questionData.visual?.type === "discount_step_method" ||
          questionData.visual?.type === "multi_step_method"
          ? Array.from({ length: questionData.visual.steps.length }, () => "")
          : []
      );
      setPercentMethodFeedback("");
      setRelatedDenominatorStep("multiplier");
      setRelatedDenominatorInputs({
        multiplier: "",
        scaledNumerator: "",
        resultNumerator: "",
      });
      setRelatedDenominatorFeedback("");
      setColumnChartInputs({
        carry: "",
        onesDigit: "",
        onesRowLeading: "",
        tensRow: "",
        total: "",
      });
      setMultiplicationStep("ones_digit");
      setMultiplicationFeedback("");
      if (questionData.visual?.type === "box_method") {
        const { cells } = getBoxMethodCells(questionData.visual.leftValue, questionData.visual.topValue);
        setBoxMethodInputs(Array.from({ length: cells.length }, () => ""));
        setBoxMethodTotal("");
        setBoxMethodFeedback("");
      } else if (questionData.visual?.type === "multiplication_strategy") {
        const { cells } = getBoxMethodCells(questionData.visual.topValue, questionData.visual.bottomValue);
        setBoxMethodInputs(Array.from({ length: cells.length }, () => ""));
        setBoxMethodTotal("");
        setBoxMethodFeedback("");
      } else {
        setBoxMethodInputs([]);
        setBoxMethodTotal("");
        setBoxMethodFeedback("");
      }
      setSelectedStrategy(null);
      setStrategyLocked(false);
      setStrategyFeedback("");
      setOwnershipStrategy(null);
      setOwnershipReflection(null);
      setOwnershipFeedback("");
      setOwnershipSolved(false);
      setEstimateInput("");
      setReasonablenessChoice(null);
      setReasonablenessExplanation("");
      setStrategyLongInputs({
        carry: "",
        onesRow: "",
        tensRow: "",
        total: "",
      });
      setStrategySplitInputs({
        tensProduct: "",
        onesProduct: "",
        total: "",
      });
      setDivisionCheckInputs({
        quotient: "",
        remainder: "",
        checkQuotient: "",
        checkRemainder: "",
        checkTotal: "",
      });
      setDivisionCheckFeedback("");
      setRevealedGroupCount(0);
      setBuildGroupsRemainder("");
      setBuildGroupsFeedback("");
      setOrderedInputs(
        isOrderingResponse ? Array.from({ length: orderingAnswerParts.length }, () => "") : []
      );
      setDigitInputs(
        writtenMethod
          ? Array.from({ length: writtenMethod.answerLength }, () => "")
          : []
      );
      setWorkingTopDigits(
        isGuidedSubtraction && writtenMethod
          ? writtenMethod.top.map((digit) => Number(digit || 0))
          : []
      );
      setBorrowDisplay(
        isGuidedSubtraction && writtenMethod
          ? Array.from({ length: writtenMethod.answerLength }, () => "")
          : []
      );
      setCarryDisplay(
        isGuidedAddition && writtenMethod
          ? Array.from({ length: writtenMethod.answerLength }, () => "")
          : []
      );
      setCarryValues(
        isGuidedAddition && writtenMethod
          ? Array.from({ length: writtenMethod.answerLength }, () => 0)
          : []
      );
      setCrossedDigits(
        isGuidedSubtraction && writtenMethod
          ? Array.from({ length: writtenMethod.answerLength }, () => false)
          : []
      );
      setCurrentColumn(isGuidedWrittenMethod ? getLastEditableWrittenMethodColumn(writtenMethod) : -1);
      setGuidedPhase(isGuidedWrittenMethod && writtenMethod ? "decide" : "done");
      setGuidedFeedback("");
    }, 0);

    return () => clearTimeout(resetTimer);
  }, [resetKey]);

  function normalizedDigitAnswer() {
    const joined = digitInputs.join("").replace(/\s+/g, "");
    return joined.replace(/^0+(?=\d)/, "");
  }

  function updateRelatedDenominatorInput(
    field: "multiplier" | "scaledNumerator" | "resultNumerator",
    value: string
  ) {
    setRelatedDenominatorInputs((current) => ({
      ...current,
      [field]: value,
    }));
    setRelatedDenominatorFeedback("");
  }

  function updatePercentMethodInput(index: number, value: string) {
    setPercentMethodInputs((current) =>
      current.map((entry, entryIndex) => (entryIndex === index ? value : entry))
    );
    setPercentMethodFeedback("");
  }

  function displayTopDigit(index: number) {
    const original = writtenMethod?.top[index] ?? "";
    const current = workingTopDigits[index];
    if (original === "" && current === 0 && !borrowDisplay[index]) return "";
    return String(current ?? 0);
  }

  function applyRegroup() {
    if (!writtenMethod || currentColumn < 0) return false;

    const nextTop = [...workingTopDigits];
    const nextBorrow = [...borrowDisplay];
    const nextCrossed = [...crossedDigits];
    let lender = currentColumn - 1;

    while (lender >= 0 && nextTop[lender] === 0) {
      lender -= 1;
    }

    if (lender < 0) return false;

    nextTop[lender] -= 1;
    nextBorrow[lender] = String(nextTop[lender]);
    nextCrossed[lender] = true;

    for (let index = lender + 1; index < currentColumn; index += 1) {
      nextTop[index] = 9;
      nextBorrow[index] = "9";
      nextCrossed[index] = true;
    }

    nextTop[currentColumn] += 10;
    nextBorrow[currentColumn] = String(nextTop[currentColumn]);
    nextCrossed[currentColumn] = true;

    setWorkingTopDigits(nextTop);
    setBorrowDisplay(nextBorrow);
    setCrossedDigits(nextCrossed);
    return true;
  }

  function handleRegroupChoice(choice: "regroup" | "no_regroup") {
    if (!writtenMethod || currentColumn < 0) return;
    const bottomDigits = writtenMethod.bottom.map((digit) => Number(digit || 0));
    const needsRegroup = workingTopDigits[currentColumn] < bottomDigits[currentColumn];

    if ((choice === "regroup") !== needsRegroup) {
      setGuidedFeedback(
        needsRegroup
          ? `You cannot do ${workingTopDigits[currentColumn]} - ${bottomDigits[currentColumn]} without regrouping.`
          : `You can already do ${workingTopDigits[currentColumn]} - ${bottomDigits[currentColumn]} without regrouping.`
      );
      onWrong?.();
      return;
    }

    if (needsRegroup) {
      const didRegroup = applyRegroup();
      if (!didRegroup) {
        setGuidedFeedback("There is no column available to regroup from.");
        onWrong?.();
        return;
      }
      setGuidedFeedback("Good. The top number has updated after regrouping.");
    } else {
      setGuidedFeedback("Good. No regrouping is needed for this column.");
    }

    setGuidedPhase("input");
  }

  function handleCarryChoice(choice: "carry" | "no_carry") {
    if (!writtenMethod || currentColumn < 0) return;
    const topDigits = numericWrittenMethodDigits(writtenMethod.top);
    const bottomDigits = numericWrittenMethodDigits(writtenMethod.bottom);
    const columnSum =
      topDigits[currentColumn] + bottomDigits[currentColumn] + (carryValues[currentColumn] ?? 0);
    const needsCarry = columnSum >= 10;

    if ((choice === "carry") !== needsCarry) {
      const leftExpression = carryValues[currentColumn]
        ? `${carryValues[currentColumn]} + ${topDigits[currentColumn]} + ${bottomDigits[currentColumn]}`
        : `${topDigits[currentColumn]} + ${bottomDigits[currentColumn]}`;
      setGuidedFeedback(
        needsCarry
          ? `${leftExpression} makes ${columnSum}, so you need to carry.`
          : `${leftExpression} makes ${columnSum}, so no carry is needed.`
      );
      onWrong?.();
      return;
    }

    if (needsCarry) {
      const nextCarryDisplay = [...carryDisplay];
      const nextCarryValues = [...carryValues];
      const targetColumn = getPreviousEditableWrittenMethodColumn(writtenMethod, currentColumn);
      if (targetColumn >= 0) {
        nextCarryDisplay[targetColumn] = "1";
        nextCarryValues[targetColumn] = (nextCarryValues[targetColumn] ?? 0) + 1;
      }
      setCarryDisplay(nextCarryDisplay);
      setCarryValues(nextCarryValues);
      setGuidedFeedback("Good. The carry now appears above the next column.");
    } else {
      setGuidedFeedback("Good. No carry is needed for this column.");
    }

    setGuidedPhase("input");
  }

  function checkGuidedDigit() {
    if (!writtenMethod || currentColumn < 0) return;
    if (isGuidedAddition) {
      const topDigits = numericWrittenMethodDigits(writtenMethod.top);
      const bottomDigits = numericWrittenMethodDigits(writtenMethod.bottom);
      const expectedDigit =
        (topDigits[currentColumn] + bottomDigits[currentColumn] + (carryValues[currentColumn] ?? 0)) % 10;
      const typedDigit = digitInputs[currentColumn];

      if (typedDigit !== String(expectedDigit)) {
        setGuidedFeedback(`Try the ${columnLabel(writtenMethod.placeValueLabels[currentColumn] ?? "")} column again.`);
        onWrong?.();
        return;
      }

      const nextInputs = [...digitInputs];
      nextInputs[currentColumn] = String(expectedDigit);
      setDigitInputs(nextInputs);
      setGuidedFeedback("");

      if (currentColumn === 0) {
        setGuidedPhase("done");
        onCorrect?.();
        return;
      }

      const nextColumn = getPreviousEditableWrittenMethodColumn(writtenMethod, currentColumn);
      if (nextColumn < 0) {
        setGuidedPhase("done");
        onCorrect?.();
        return;
      }

      setCurrentColumn(nextColumn);
      setGuidedPhase("decide");
      return;
    }

    const bottomDigits = writtenMethod.bottom.map((digit) => Number(digit || 0));
    const expectedDigit = workingTopDigits[currentColumn] - bottomDigits[currentColumn];
    const typedDigit = digitInputs[currentColumn];

    if (typedDigit !== String(expectedDigit)) {
      setGuidedFeedback(`Try the ${columnLabel(writtenMethod.placeValueLabels[currentColumn] ?? "")} column again.`);
      onWrong?.();
      return;
    }

    const nextInputs = [...digitInputs];
    nextInputs[currentColumn] = String(expectedDigit);
    setDigitInputs(nextInputs);
    setGuidedFeedback("");

    if (currentColumn === 0) {
      setGuidedPhase("done");
      onCorrect?.();
      return;
    }

    setCurrentColumn(currentColumn - 1);
    setGuidedPhase("decide");
  }

  function handleStrategySelect(strategy: MultiplicationStrategy) {
    if (strategyLocked && selectedStrategy !== strategy) return;
    setSelectedStrategy(strategy);
    setStrategyFeedback("");
  }

  function lockStrategyIfNeeded(value: string) {
    if (value.trim()) {
      setStrategyLocked(true);
    }
  }

  function strategyIsComplete() {
    if (!(isStrategyMultiplication || isEstimateStrategyMultiplication) || !selectedStrategy) return false;
    if (selectedStrategy === "box_method") {
      const baseReady =
        boxMethodInputs.length > 0 && boxMethodInputs.every((value) => value.trim()) && boxMethodTotal.trim().length > 0;
      if (!baseReady) return false;
      if (isEstimateStrategyMultiplication) {
        return (
          estimateInput.trim().length > 0 &&
          reasonablenessChoice !== null &&
          reasonablenessExplanation.trim().length > 0
        );
      }
      return true;
    }
    if (selectedStrategy === "long_multiplication") {
      if (!strategyVisual) return false;
      const { onesPart } = getSplitSumParts(strategyVisual.bottomValue);
      const topDigits = String(strategyVisual.topValue).split("").map(Number);
      const topOnes = topDigits[topDigits.length - 1] ?? 0;
      const expectedCarry = Math.floor((topOnes * onesPart) / 10);
      const coreComplete =
        strategyLongInputs.onesRow.trim().length > 0 &&
        strategyLongInputs.tensRow.trim().length > 0 &&
        strategyLongInputs.total.trim().length > 0;
      if (!coreComplete) return false;
      const methodReady = expectedCarry === 0 ? true : strategyLongInputs.carry.trim().length > 0;
      if (!methodReady) return false;
      if (isEstimateStrategyMultiplication) {
        return (
          estimateInput.trim().length > 0 &&
          reasonablenessChoice !== null &&
          reasonablenessExplanation.trim().length > 0
        );
      }
      return true;
    }
    const splitReady = Object.values(strategySplitInputs).every((value) => value.trim().length > 0);
    if (!splitReady) return false;
    if (isEstimateStrategyMultiplication) {
      return (
        estimateInput.trim().length > 0 &&
        reasonablenessChoice !== null &&
        reasonablenessExplanation.trim().length > 0
      );
    }
    return true;
  }

  function check() {
    if (isFractionDecimalPercentConversion && fractionDecimalPercentConversionVisual) {
      const decimalMatches =
        normalizeDecimalEquivalent(conversionDecimalInput) ===
        normalizeDecimalEquivalent(fractionDecimalPercentConversionVisual.decimalAnswer);
      const normalizedPercent = conversionPercentInput.trim().replace(/\s+/g, "");
      const expectedPercent = fractionDecimalPercentConversionVisual.percentAnswer;
      const percentMatches =
        normalizedPercent === expectedPercent ||
        normalizedPercent === expectedPercent.replace("%", "");

      if (decimalMatches && percentMatches) {
        onCorrect?.();
      } else {
        onWrong?.();
      }
      return;
    }

    if (isDivisionBuildGroups && questionData.visual?.type === "division_build_groups") {
      const remainderMatches =
        normalizeNumberInput(buildGroupsRemainder) === String(questionData.visual.remainder);
      if (remainderMatches) {
        setBuildGroupsFeedback("");
        onCorrect?.();
      } else {
        setBuildGroupsFeedback(
          `Reveal the groups until the next multiple is too large, then type what is left.`
        );
        onWrong?.();
      }
      return;
    }

    if (isDivisionRemainderCheck && questionData.visual?.type === "division_remainder_check") {
      const { quotient, remainder, divisor, dividend } = questionData.visual;
      const quotientMatches = normalizeNumberInput(divisionCheckInputs.quotient) === String(quotient);
      const remainderMatches =
        normalizeNumberInput(divisionCheckInputs.remainder) === String(remainder);
      const checkQuotientMatches =
        normalizeNumberInput(divisionCheckInputs.checkQuotient) === String(quotient);
      const checkRemainderMatches =
        normalizeNumberInput(divisionCheckInputs.checkRemainder) === String(remainder);
      const checkTotalMatches =
        normalizeNumberInput(divisionCheckInputs.checkTotal) === String(divisor * quotient + remainder);

      if (quotientMatches && remainderMatches && checkQuotientMatches && checkRemainderMatches && checkTotalMatches) {
        setDivisionCheckFeedback(`Correct! ${dividend} = ${dividend}`);
        onCorrect?.();
      } else {
        setDivisionCheckFeedback(`That doesn't match ${dividend}. Try again.`);
        onWrong?.();
      }
      return;
    }

    if (isStrategyOwnership && strategyOwnershipVisual) {
      if (!ownershipStrategy) {
        setOwnershipFeedback("Choose a strategy first. There is no single correct strategy here.");
        return;
      }

      const selectedStrategyData = strategyOwnershipVisual.strategies.find(
        (strategy) => strategy.label === ownershipStrategy
      );

      if (!ownershipSolved) {
        if (numericInputsMatch(typed, questionData.answer)) {
          setOwnershipSolved(true);
          setOwnershipFeedback(
            selectedStrategyData
              ? `Correct answer. ${selectedStrategyData.feedback} Now reflect on how it worked for you.`
              : "Correct answer. Now reflect on how your strategy worked for you."
          );
          return;
        }

        setOwnershipFeedback(
          selectedStrategyData
            ? `Your strategy could still work. ${selectedStrategyData.feedback} Check your calculation and try again.`
            : "Your strategy could still work. Check your calculation and try again."
        );
        return;
      }

      if (!ownershipReflection) {
        setOwnershipFeedback("Choose one reflection before moving on.");
        return;
      }

      setOwnershipFeedback("");
      onCorrect?.();
      return;
    }

    if ((isStrategyMultiplication || isEstimateStrategyMultiplication) && strategyVisual) {
      if (!selectedStrategy) {
        setStrategyFeedback("Choose one method before you start solving.");
        onWrong?.();
        return;
      }

      const finalAnswer = normalizeNumberInput(questionData.answer);
      if (isEstimateStrategyMultiplication) {
        const roundedTop = Math.round(strategyVisual.topValue / 10) * 10;
        const roundedBottom = Math.round(strategyVisual.bottomValue / 10) * 10;
        const expectedEstimate = String(roundedTop * roundedBottom);
        if (normalizeNumberInput(estimateInput) !== expectedEstimate) {
          setStrategyFeedback(`Estimate first by rounding to ${roundedTop} × ${roundedBottom}.`);
          onWrong?.();
          return;
        }
      }

      if (selectedStrategy === "box_method") {
        const expected = getBoxMethodCells(strategyVisual.topValue, strategyVisual.bottomValue);
        const boxesMatch = expected.cells.every(
          (value, index) => normalizeNumberInput(boxMethodInputs[index] ?? "") === String(value)
        );
        const totalMatches = normalizeNumberInput(boxMethodTotal) === finalAnswer;

        if (!boxesMatch || !totalMatches) {
          setStrategyFeedback("Check each box value and make sure the total matches the full product.");
          onWrong?.();
          return;
        }
      }

      if (selectedStrategy === "long_multiplication") {
        const { bottomValue, topValue } = strategyVisual;
        const { tensPart, onesPart } = getSplitSumParts(bottomValue);
        const topDigits = String(topValue).split("").map(Number);
        const topOnes = topDigits[topDigits.length - 1] ?? 0;
        const expectedCarry = Math.floor((topOnes * onesPart) / 10);
        const carryMatches =
          expectedCarry === 0
            ? strategyLongInputs.carry.trim().length === 0 || normalizeNumberInput(strategyLongInputs.carry) === "0"
            : normalizeNumberInput(strategyLongInputs.carry) === String(expectedCarry);
        const onesRowExpected = topValue * onesPart;
        const tensRowExpected = topValue * tensPart;
        const onesRowMatches = normalizeNumberInput(strategyLongInputs.onesRow) === String(onesRowExpected);
        const tensRowMatches = normalizeNumberInput(strategyLongInputs.tensRow) === String(tensRowExpected);
        const totalMatches = normalizeNumberInput(strategyLongInputs.total) === finalAnswer;

        if (!(carryMatches && onesRowMatches && tensRowMatches && totalMatches)) {
          setStrategyFeedback("Check the carry, both partial-product rows, and then the final total.");
          onWrong?.();
          return;
        }
      }

      if (selectedStrategy === "split_sum") {
        const { bottomValue, topValue } = strategyVisual;
        const { tensPart, onesPart } = getSplitSumParts(bottomValue);
        const tensMatches = normalizeNumberInput(strategySplitInputs.tensProduct) === String(topValue * tensPart);
        const onesMatches = normalizeNumberInput(strategySplitInputs.onesProduct) === String(topValue * onesPart);
        const totalMatches = normalizeNumberInput(strategySplitInputs.total) === finalAnswer;

        if (!(tensMatches && onesMatches && totalMatches)) {
          setStrategyFeedback("Check the tens product, the ones product, and then the total.");
          onWrong?.();
          return;
        }
      }

      if (isEstimateStrategyMultiplication) {
        if (reasonablenessChoice !== "yes") {
          setStrategyFeedback("After estimating and solving, this answer should be marked as reasonable.");
          onWrong?.();
          return;
        }
        if (reasonablenessExplanation.trim().length < 8) {
          setStrategyFeedback("Explain why the answer is reasonable by linking it to your estimate.");
          onWrong?.();
          return;
        }
      }

      setStrategyFeedback("");
      onCorrect?.();
      return;
    }

    if (questionData.visual?.type === "column_multiplication") {
      const expected = getColumnMultiplicationRows(
        questionData.visual.topValue,
        questionData.visual.bottomValue
      );
      const stepData = getColumnMultiplicationStepData(
        questionData.visual.topValue,
        questionData.visual.bottomValue
      );

      if (multiplicationStep === "ones_digit") {
        if (normalizeNumberInput(columnChartInputs.onesDigit) === String(stepData.onesDigit)) {
          setMultiplicationFeedback("");
          setMultiplicationStep("carry");
        } else {
          setMultiplicationFeedback(
            `Multiply ${stepData.topOnes} × ${stepData.bottomOnes} and enter only the ones digit.`
          );
          onWrong?.();
        }
        return;
      }

      if (multiplicationStep === "carry") {
        if (normalizeNumberInput(columnChartInputs.carry) === String(stepData.carry)) {
          setMultiplicationFeedback("");
          setMultiplicationStep("ones_row");
        } else {
          setMultiplicationFeedback("Carry the extra above the next column.");
          onWrong?.();
        }
        return;
      }

      if (multiplicationStep === "ones_row") {
        if (normalizeNumberInput(columnChartInputs.onesRowLeading) === String(stepData.onesRowLeading)) {
          setMultiplicationFeedback("");
          setMultiplicationStep(expected.tensRow === null ? "total" : "tens_row");
        } else {
          setMultiplicationFeedback(
            `Now multiply ${stepData.topTens} × ${stepData.bottomOnes} and add the carry.`
          );
          onWrong?.();
        }
        return;
      }

      if (multiplicationStep === "tens_row") {
        if (normalizeNumberInput(columnChartInputs.tensRow) === String(expected.tensRow ?? "")) {
          setMultiplicationFeedback("");
          setMultiplicationStep("total");
        } else {
          setMultiplicationFeedback("Complete the tens row and remember the place-value shift.");
          onWrong?.();
        }
        return;
      }

      if (multiplicationStep === "total") {
        if (normalizeNumberInput(columnChartInputs.total) === String(expected.total)) {
          setMultiplicationFeedback("");
          setMultiplicationStep("done");
          onCorrect?.();
        } else {
          setMultiplicationFeedback("Add the rows carefully to find the final total.");
          onWrong?.();
        }
        return;
      }
      return;
    }

    if (questionData.visual?.type === "box_method") {
      const expected = getBoxMethodCells(questionData.visual.leftValue, questionData.visual.topValue);
      const boxesMatch = expected.cells.every(
        (value, index) => normalizeNumberInput(boxMethodInputs[index] ?? "") === String(value)
      );
      const totalMatches = normalizeNumberInput(boxMethodTotal) === String(expected.total);

      if (boxesMatch && totalMatches) {
        setBoxMethodFeedback("");
        onCorrect?.();
      } else {
        setBoxMethodFeedback("Complete each box correctly, then add the totals for the final answer.");
        onWrong?.();
      }
      return;
    }

    if (
      (isPercentStructuredMethod && percentStructuredMethodVisual) ||
      (isDiscountStepMethod && discountStepMethodVisual) ||
      (isMultiStepMethod && multiStepMethodVisual)
    ) {
      const stepVisual = percentStructuredMethodVisual ?? discountStepMethodVisual ?? multiStepMethodVisual;
      const step = stepVisual?.steps[percentMethodStep];
      if (!step) return;

      if (numericInputsMatch(percentMethodInputs[percentMethodStep] ?? "", step.answer)) {
        setPercentMethodFeedback("");
        if (percentMethodStep >= stepVisual.steps.length - 1) {
          setPercentMethodStep(stepVisual.steps.length);
          onCorrect?.();
        } else {
          setPercentMethodStep((current) => current + 1);
        }
      } else {
        setPercentMethodFeedback(
          isDiscountStepMethod
            ? "Find the discount first, then subtract it from the original price."
            : isMultiStepMethod
            ? "Check what the situation needs before the next step."
            : percentStructuredMethodVisual?.method === "decimal"
            ? "Divide by 100 first, then multiply by the amount."
            : "Break the percentage into easier parts and try this step again."
        );
        onWrong?.();
      }
      return;
    }

    if (isRelatedDenominatorWorking && relatedDenominatorWorking && sameDenominatorOperationVisual) {
      if (relatedDenominatorStep === "multiplier") {
        if (normalizeNumberInput(relatedDenominatorInputs.multiplier) === String(relatedDenominatorWorking.multiplier)) {
          setRelatedDenominatorFeedback("");
          setRelatedDenominatorStep("numerator");
        } else {
          setRelatedDenominatorFeedback(
            `Check what multiplies ${relatedDenominatorWorking.denominatorToChange} to make ${sameDenominatorOperationVisual.denominator}.`
          );
          onWrong?.();
        }
        return;
      }

      if (relatedDenominatorStep === "numerator") {
        if (
          normalizeNumberInput(relatedDenominatorInputs.scaledNumerator) ===
          String(relatedDenominatorWorking.convertedNumerator)
        ) {
          setRelatedDenominatorFeedback("");
          setRelatedDenominatorStep("solve");
        } else {
          setRelatedDenominatorFeedback("Use the same multiplier on the numerator.");
          onWrong?.();
        }
        return;
      }

      if (relatedDenominatorStep === "solve") {
        if (
          normalizeNumberInput(relatedDenominatorInputs.resultNumerator) ===
          String(sameDenominatorOperationVisual.resultNumerator)
        ) {
          setRelatedDenominatorFeedback("");
          setRelatedDenominatorStep("done");
          onCorrect?.();
        } else {
          setRelatedDenominatorFeedback(
            sameDenominatorOperationVisual.operation === "+"
              ? "Now add the numerators."
              : "Now subtract the numerators."
          );
          onWrong?.();
        }
        return;
      }

      return;
    }

    if (isStructuredFractionResponse) {
      const whole = normalizeNumberInput(fractionWholeInput);
      const numerator = normalizeNumberInput(fractionNumeratorInput);
      const denominator = normalizeNumberInput(
        usesFixedDenominator && questionData.fixedDenominator
          ? String(questionData.fixedDenominator)
          : fractionDenominatorInput
      );

      const parsed =
        isFlexibleFractionInput && whole && !numerator && !denominator
          ? {
              whole: Number(whole),
              numerator: 0,
              denominator: 1,
            }
          : !numerator || !denominator
            ? null
            : {
                whole: whole ? Number(whole) : 0,
                numerator: Number(numerator),
                denominator: Number(denominator),
              };

      if (!parsed) {
        onWrong?.();
        return;
      }

      if (
        !Number.isFinite(parsed.whole) ||
        !Number.isFinite(parsed.numerator) ||
        !Number.isFinite(parsed.denominator) ||
        parsed.denominator === 0
      ) {
        onWrong?.();
        return;
      }

      const matchesAcceptedFraction = acceptedAnswerList.some((answerOption) => {
        const expectedFraction =
          parseStructuredFraction(answerOption) ?? parseFlexibleFraction(answerOption);
        return expectedFraction ? mixedNumeralsEquivalent(parsed, expectedFraction) : false;
      });

      if (matchesAcceptedFraction) {
        onCorrect?.();
      } else {
        onWrong?.();
      }
      return;
    }

    if (isFlexibleFractionInput) {
      const parsedInput = parseFlexibleFraction(typed);
      if (!parsedInput) {
        onWrong?.();
        return;
      }

      const matchesAcceptedFraction = acceptedAnswerList.some((answerOption) => {
        const expected = parseFlexibleFraction(answerOption);
        return expected ? mixedNumeralsEquivalent(parsedInput, expected) : false;
      });

      if (matchesAcceptedFraction) {
        onCorrect?.();
      } else {
        onWrong?.();
      }
      return;
    }

    if (isEquivalentFractionInput && equivalentFractionInputVisual) {
      const normalizedTyped = normalizeNumberInput(typed);
      if (acceptedAnswerList.some((answerOption) => normalizedTyped === String(answerOption))) {
        onCorrect?.();
      } else {
        onWrong?.();
      }
      return;
    }

    if (isNumericInputOnly) {
      if (acceptedAnswerList.some((answerOption) => numericInputsMatch(typed, answerOption))) {
        onCorrect?.();
      } else {
        onWrong?.();
      }
      return;
    }

    const rawValue = isColumnMultiplication
      ? normalize(typed)
      : writtenMethod
      ? normalize(normalizedDigitAnswer())
      : isOrderingResponse
      ? orderedInputs.map(normalizeOrderingNumber).join(",")
      : normalize(typed);
    const rawExpected = isOrderingResponse
      ? orderingAnswerParts.join(",")
      : normalize(questionData.answer);
    const value =
      isColumnMultiplication || writtenMethod || isOrderingResponse
        ? rawValue
        : normalizeDecimalEquivalent(rawValue);
    const expected = isOrderingResponse ? rawExpected : normalizeDecimalEquivalent(rawExpected);
    const matchesAcceptedAnswer =
      value === expected ||
      isEquivalentNumberSequence(typed, questionData.answer) ||
      acceptedAnswerList.slice(1).some((answerOption) => {
        const normalizedOption = normalizeDecimalEquivalent(normalize(answerOption));
        return value === normalizedOption || isEquivalentNumberSequence(typed, answerOption);
      });
    if (matchesAcceptedAnswer) {
      onCorrect?.();
    } else {
      onWrong?.();
    }
  }

  const visualType = questionData.visual?.type;
  const activityTitle =
    writtenMethod?.title ??
    (visualType === "strategy_ownership"
      ? "Choose Your Strategy"
      : visualType === "numeric_input_only"
      ? "Mixed Operations"
      : visualType === "multi_step_method"
      ? "Build the Solution"
      : visualType === "discount_step_method"
      ? "Discount Method"
      : visualType === "percent_structured_method"
      ? "Percentage Method"
      : visualType === "division_build_groups"
      ? "Build the Groups"
      : visualType === "division_remainder_check"
      ? "Division Check"
      : visualType === "multiplication_strategy" || visualType === "multiplication_estimate_strategy"
      ? "Choose a Method"
      : visualType === "box_method"
      ? "Box Method"
      : visualType === "column_multiplication"
      ? "Column Multiplication"
      : "Typed Response");
  const typedResponseButtonLabel =
    isStrategyOwnership && ownershipSolved
      ? "Finish reflection"
      : ((isPercentStructuredMethod && percentStructuredMethodVisual) ||
      (isDiscountStepMethod && discountStepMethodVisual) ||
      (isMultiStepMethod && multiStepMethodVisual)) &&
    percentMethodStep <
      ((percentStructuredMethodVisual ?? discountStepMethodVisual ?? multiStepMethodVisual)?.steps.length ?? 1) - 1
      ? "Check step"
      : isRelatedDenominatorWorking && relatedDenominatorStep !== "solve" && relatedDenominatorStep !== "done"
      ? "Check step"
      : "Check answer";
  const columnMultiplicationButtonLabel = getColumnMultiplicationButtonLabel(multiplicationStep);

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      {questionData.visual?.type === "shopping_list" ||
      questionData.visual?.type === "australian_money" ||
      questionData.visual?.type === "receipt" ? (
        <MoneyContextVisual visual={questionData.visual} />
      ) : null}
      <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
        {activityTitle}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <h2 className="text-2xl font-black text-gray-900">
          <MathFormattedText text={questionData.prompt} />
        </h2>
        <ReadAloudBtn text={questionData.prompt} />
      </div>
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
      {questionData.visual?.type === "best_buy_card_comparison" ? (
        <BestBuyCardComparisonVisual visual={questionData.visual} />
      ) : null}
      {discountStepMethodVisual ? (
        <DiscountVisual
          visual={discountStepMethodVisual}
          revealDiscount={percentMethodStep > 0}
          revealFinal={percentMethodStep >= discountStepMethodVisual.steps.length}
        />
      ) : null}
      {multiStepMethodVisual?.supportVisual ? (
        <DiscountVisual visual={multiStepMethodVisual.supportVisual} />
      ) : null}
      {buildGroupsVisual ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-2xl border border-teal-100 bg-teal-50 p-5">
            <div className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">
              Build the Groups
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              {buildGroupsVisual.multiples.map((multiple, index) => {
                const visible = index < revealedGroupCount;
                return (
                  <div
                    key={`multiple-${multiple}`}
                    className={[
                      "flex h-12 min-w-[88px] items-center justify-center rounded-xl border-2 px-4 text-lg font-black transition",
                      visible
                        ? "border-teal-300 bg-white text-slate-900"
                        : "border-dashed border-teal-200 bg-teal-50/50 text-teal-200",
                    ].join(" ")}
                  >
                    {visible ? multiple : "?"}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  setRevealedGroupCount((current) =>
                    Math.min(buildGroupsVisual.multiples.length, current + 1)
                  )
                }
                disabled={revealedGroupCount >= buildGroupsVisual.multiples.length}
                className="rounded-xl bg-teal-600 px-4 py-3 font-black text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Tap to reveal
              </button>
              <button
                type="button"
                onClick={() => setRevealedGroupCount(buildGroupsVisual.multiples.length)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-black text-slate-900 hover:bg-slate-50"
              >
                Skip steps
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Keep counting until the next number is too big.
            </p>
          </div>

          {revealedGroupCount > 0 ? (
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
              <div className="text-sm font-bold uppercase tracking-[0.18em] text-amber-700">
                What is left?
              </div>
              <input
                value={buildGroupsRemainder}
                onChange={(event) => setBuildGroupsRemainder(event.target.value.replace(/[^\d]/g, ""))}
                inputMode="numeric"
                placeholder="Type the remainder"
                className="mt-3 h-12 w-full max-w-xs rounded-xl border border-amber-300 bg-white px-4 text-center text-xl font-black text-slate-900 outline-none focus:border-amber-500"
              />
            </div>
          ) : null}

          {buildGroupsFeedback ? (
            <p className="text-sm font-bold text-rose-600">{buildGroupsFeedback}</p>
          ) : null}

          {(revealedGroupCount > 0 && buildGroupsRemainder.trim().length > 0) ? (
            <button
              type="button"
              onClick={check}
              className="rounded-xl bg-teal-600 px-5 py-3 font-black text-white hover:bg-teal-700"
            >
              Check answer
            </button>
          ) : null}
        </div>
      ) : null}
      {questionData.visual?.type === "division_remainder_check" ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-2xl border border-teal-100 bg-teal-50 p-5">
            <div className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">
              Step 1: Solve the Division
            </div>
            <div className="mt-3 flex flex-wrap items-end gap-4">
              <div>
                <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Quotient</div>
                <input
                  value={divisionCheckInputs.quotient}
                  onChange={(event) =>
                    setDivisionCheckInputs((current) => ({
                      ...current,
                      quotient: event.target.value.replace(/[^\d]/g, ""),
                    }))
                  }
                  inputMode="numeric"
                  className="h-12 w-28 rounded-xl border border-teal-300 bg-white px-4 text-center text-xl font-black text-slate-900 outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Remainder</div>
                <input
                  value={divisionCheckInputs.remainder}
                  onChange={(event) =>
                    setDivisionCheckInputs((current) => ({
                      ...current,
                      remainder: event.target.value.replace(/[^\d]/g, ""),
                    }))
                  }
                  inputMode="numeric"
                  className="h-12 w-28 rounded-xl border border-teal-300 bg-white px-4 text-center text-xl font-black text-slate-900 outline-none focus:border-teal-500"
                />
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              The remainder must be less than the divisor.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
            <div className="text-sm font-bold uppercase tracking-[0.18em] text-amber-700">
              Step 2: Multiply Back and Check
            </div>
            <p className="mt-2 text-sm text-slate-700">
              Write the check:
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xl font-black text-slate-900">
              <div className="flex h-12 min-w-[64px] items-center justify-center rounded-xl border border-amber-300 bg-white px-4">
                {questionData.visual.divisor}
              </div>
              <span>×</span>
              <input
                value={divisionCheckInputs.checkQuotient}
                onChange={(event) =>
                  setDivisionCheckInputs((current) => ({
                    ...current,
                    checkQuotient: event.target.value.replace(/[^\d]/g, ""),
                  }))
                }
                inputMode="numeric"
                className="h-12 w-24 rounded-xl border border-amber-300 bg-white px-4 text-center text-xl font-black text-slate-900 outline-none focus:border-amber-500"
              />
              <span>+</span>
              <input
                value={divisionCheckInputs.checkRemainder}
                onChange={(event) =>
                  setDivisionCheckInputs((current) => ({
                    ...current,
                    checkRemainder: event.target.value.replace(/[^\d]/g, ""),
                  }))
                }
                inputMode="numeric"
                className="h-12 w-24 rounded-xl border border-amber-300 bg-white px-4 text-center text-xl font-black text-slate-900 outline-none focus:border-amber-500"
              />
              <span>=</span>
              <input
                value={divisionCheckInputs.checkTotal}
                onChange={(event) =>
                  setDivisionCheckInputs((current) => ({
                    ...current,
                    checkTotal: event.target.value.replace(/[^\d]/g, ""),
                  }))
                }
                inputMode="numeric"
                className="h-12 w-28 rounded-xl border border-amber-300 bg-white px-4 text-center text-xl font-black text-slate-900 outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {divisionCheckFeedback ? (
            <p className="text-sm font-bold text-rose-600">{divisionCheckFeedback}</p>
          ) : null}

          <button
            type="button"
            onClick={check}
            className="rounded-xl bg-teal-600 px-5 py-3 font-black text-white hover:bg-teal-700"
          >
            Check answer
          </button>
        </div>
      ) : null}
      {strategyVisual ? (
        <div className="mt-4 space-y-4">
          {isEstimateStrategyMultiplication ? (
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
              <div className="text-sm font-bold uppercase tracking-[0.18em] text-amber-700">
                Step 1: Quick Estimate
              </div>
              <p className="mt-2 text-sm text-slate-700">
                Round both numbers to the nearest 10 before you solve.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <input
                  value={estimateInput}
                  onChange={(event) => setEstimateInput(event.target.value.replace(/[^\d,\s]/g, ""))}
                  inputMode="numeric"
                  placeholder="Type the estimate"
                  className="h-12 w-full max-w-xs rounded-xl border border-amber-300 bg-white px-4 text-lg font-black text-slate-900 outline-none focus:border-amber-500"
                />
              </div>
            </div>
          ) : null}
          <div className="rounded-2xl border border-teal-100 bg-teal-50 p-5">
            <div className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">
              {isEstimateStrategyMultiplication ? "Step 2: Choose a Method" : "Which method would you use?"}
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              {([
                ["box_method", "Box Method"],
                ["long_multiplication", "Long Multiplication"],
                ...(isEstimateStrategyMultiplication ? [] : ([["split_sum", "Split the Sum"]] as Array<[MultiplicationStrategy, string]>)),
              ] as Array<[MultiplicationStrategy, string]>).map(([strategy, label]) => {
                const active = selectedStrategy === strategy;
                const disabled = strategyLocked && !active;
                return (
                  <button
                    key={strategy}
                    type="button"
                    onClick={() => handleStrategySelect(strategy)}
                    disabled={disabled}
                    className={[
                      "rounded-xl px-4 py-3 font-black transition",
                      active
                        ? "bg-teal-600 text-white"
                        : "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
                      disabled ? "cursor-not-allowed opacity-45" : "",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Choose one method first. Once you start solving, that method stays locked for this question.
            </p>
          </div>

          {selectedStrategy === "box_method" ? (
            <div className="rounded-2xl border border-teal-100 bg-teal-50 p-5">
              <BoxMethodWorkspace
                leftValue={strategyVisual.topValue}
                topValue={strategyVisual.bottomValue}
                boxValues={boxMethodInputs}
                totalValue={boxMethodTotal}
                onChange={(field, value, index) => {
                  const cleaned = value.replace(/[^\d,\s]/g, "");
                  lockStrategyIfNeeded(cleaned);
                  if (field === "box" && typeof index === "number") {
                    setBoxMethodInputs((current) =>
                      current.map((cell, cellIndex) => (cellIndex === index ? cleaned : cell))
                    );
                    return;
                  }
                  setBoxMethodTotal(cleaned);
                }}
              />
            </div>
          ) : null}

          {selectedStrategy === "long_multiplication" ? (
            <div className="rounded-2xl border border-teal-100 bg-teal-50 p-5">
              <LongMultiplicationStrategyWorkspace
                topValue={strategyVisual.topValue}
                bottomValue={strategyVisual.bottomValue}
                carryValue={strategyLongInputs.carry}
                onesRowValue={strategyLongInputs.onesRow}
                tensRowValue={strategyLongInputs.tensRow}
                totalValue={strategyLongInputs.total}
                onChange={(field, value) => {
                  const cleaned = value.replace(/[^\d,\s]/g, "");
                  lockStrategyIfNeeded(cleaned);
                  setStrategyLongInputs((current) => ({ ...current, [field]: cleaned }));
                }}
              />
            </div>
          ) : null}

          {selectedStrategy === "split_sum" ? (
            <div className="rounded-2xl border border-teal-100 bg-teal-50 p-5">
              <SplitSumWorkspace
                topValue={strategyVisual.topValue}
                bottomValue={strategyVisual.bottomValue}
                tensProductValue={strategySplitInputs.tensProduct}
                onesProductValue={strategySplitInputs.onesProduct}
                totalValue={strategySplitInputs.total}
                onChange={(field, value) => {
                  const cleaned = value.replace(/[^\d,\s]/g, "");
                  lockStrategyIfNeeded(cleaned);
                  setStrategySplitInputs((current) => ({ ...current, [field]: cleaned }));
                }}
              />
            </div>
          ) : null}

          {isEstimateStrategyMultiplication ? (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <div className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
                Step 3: Check It Makes Sense
              </div>
              <p className="mt-2 text-sm text-slate-700">Is your answer reasonable?</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {([
                  ["yes", "Yes"],
                  ["no", "No"],
                ] as Array<[EstimateReasonableness, string]>).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setReasonablenessChoice(value)}
                    className={[
                      "rounded-xl px-4 py-3 font-black transition",
                      reasonablenessChoice === value
                        ? "bg-emerald-600 text-white"
                        : "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <textarea
                value={reasonablenessExplanation}
                onChange={(event) => setReasonablenessExplanation(event.target.value)}
                placeholder="Explain why your answer is reasonable compared with your estimate."
                className="mt-3 min-h-[110px] w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-base font-medium text-slate-900 outline-none focus:border-emerald-500"
              />
            </div>
          ) : null}

          {strategyFeedback ? (
            <p className="text-sm font-bold text-rose-600">{strategyFeedback}</p>
          ) : null}

          {strategyIsComplete() ? (
            <button
              type="button"
              onClick={check}
              className="rounded-xl bg-teal-600 px-5 py-3 font-black text-white hover:bg-teal-700"
            >
              Check answer
            </button>
          ) : null}
        </div>
      ) : null}
      {questionData.visual?.type === "column_multiplication" ? (
        <div className="mt-4 space-y-4">
          {questionData.visual.showWorkedExample ? <ColumnMultiplicationWorkedExample /> : null}
          <div className="rounded-2xl border border-teal-100 bg-teal-50 p-5">
            <ColumnMultiplicationWorkspace
              topValue={questionData.visual.topValue}
              bottomValue={questionData.visual.bottomValue}
              carryValue={columnChartInputs.carry}
              onesDigitValue={columnChartInputs.onesDigit}
              onesRowLeadingValue={columnChartInputs.onesRowLeading}
              tensRowValue={columnChartInputs.tensRow}
              totalValue={columnChartInputs.total}
              currentStep={multiplicationStep}
              onChange={(field, value) =>
                setColumnChartInputs((current) => ({
                  ...current,
                  [field]: value.replace(/[^\d,\s]/g, ""),
                }))
              }
            />
            <p className="mt-4 text-sm font-medium text-slate-600">
              Build the multiplication step by step inside the chart.
            </p>
            {multiplicationFeedback ? (
              <p className="mt-3 text-sm font-bold text-rose-600">{multiplicationFeedback}</p>
            ) : null}
            <button
              type="button"
              onClick={check}
              className="mt-4 rounded-xl bg-teal-600 px-5 py-3 font-black text-white hover:bg-teal-700"
            >
              {columnMultiplicationButtonLabel}
            </button>
          </div>
        </div>
      ) : null}
      {questionData.visual?.type === "box_method" ? (
        <div className="mt-4 space-y-4">
          {questionData.visual.showWorkedExample ? <BoxMethodWorkedExample /> : null}
          <div className="rounded-2xl border border-teal-100 bg-teal-50 p-5">
            <BoxMethodWorkspace
              leftValue={questionData.visual.leftValue}
              topValue={questionData.visual.topValue}
              boxValues={boxMethodInputs}
              totalValue={boxMethodTotal}
              onChange={(field, value, index) => {
                const cleaned = value.replace(/[^\d,\s]/g, "");
                if (field === "box" && typeof index === "number") {
                  setBoxMethodInputs((current) =>
                    current.map((cell, cellIndex) => (cellIndex === index ? cleaned : cell))
                  );
                  return;
                }
                setBoxMethodTotal(cleaned);
              }}
            />
            <p className="mt-4 text-sm font-medium text-slate-600">
              Complete each box step-by-step.
            </p>
            {boxMethodFeedback ? (
              <p className="mt-3 text-sm font-bold text-rose-600">{boxMethodFeedback}</p>
            ) : null}
            <button
              type="button"
              onClick={check}
              className="mt-4 rounded-xl bg-teal-600 px-5 py-3 font-black text-white hover:bg-teal-700"
            >
              Check answer
            </button>
          </div>
        </div>
      ) : null}
      {renderMode === "lesson" && questionData.helper ? (
        <p className="mt-2 text-sm text-gray-600">
          <MathFormattedText text={questionData.helper} />
        </p>
      ) : null}

      {writtenMethod && !isColumnMultiplication ? (
        <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50 p-5">
          <div className="w-fit rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-2 grid w-fit grid-flow-col gap-2">
              <div className="w-8" />
              {writtenMethod.placeValueLabels.map((label, index) => (
                <div
                  key={`label-${index}`}
                  className="flex h-7 w-12 items-center justify-center text-xs font-black tracking-wide text-slate-500"
                >
                  {label}
                </div>
              ))}
            </div>
            {isGuidedAddition && carryDisplay.some(Boolean) ? (
              <div className="mb-1 grid w-fit grid-flow-col gap-2">
                <div className="w-8" />
                {carryDisplay.map((digit, index) => (
                  <div key={`carry-${index}`} className="flex h-8 w-12 items-center justify-center text-sm font-black text-amber-600">
                    {digit}
                  </div>
                ))}
              </div>
            ) : writtenMethod.carryRow ? (
              <div className="mb-1 grid w-fit grid-flow-col gap-2">
                <div className="w-8" />
                {writtenMethod.carryRow.map((digit, index) => (
                  <div key={`carry-${index}`} className="flex h-8 w-12 items-center justify-center text-sm font-black text-amber-600">
                    {digit}
                  </div>
                ))}
              </div>
            ) : null}
            {isGuidedSubtraction && borrowDisplay.some(Boolean) ? (
              <div className="mb-1 grid w-fit grid-flow-col gap-2">
                <div className="w-8" />
                {borrowDisplay.map((digit, index) => (
                  <div key={`borrow-${index}`} className="flex h-8 w-12 items-center justify-center text-sm font-black text-red-500">
                    {digit}
                  </div>
                ))}
              </div>
            ) : !isGuidedSubtraction && writtenMethod.borrowRow ? (
              <div className="mb-1 grid w-fit grid-flow-col gap-2">
                <div className="w-8" />
                {writtenMethod.borrowRow.map((digit, index) => (
                  <div key={`borrow-${index}`} className="flex h-8 w-12 items-center justify-center text-sm font-black text-red-500">
                    {digit}
                  </div>
                ))}
              </div>
            ) : null}
            <div className="grid w-fit grid-flow-col gap-2">
              <div className="w-8" />
              {writtenMethod.top.map((digit, index) => (
                <div
                  key={`top-${index}`}
                  className={[
                    digit === "."
                      ? "relative flex h-12 w-12 items-center justify-center text-2xl font-black"
                      : "relative flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-2xl font-black",
                    currentColumn === index && isGuidedWrittenMethod
                      ? "ring-2 ring-teal-400"
                      : "",
                    (isGuidedSubtraction ? crossedDigits[index] : writtenMethod.crossedTop?.[index])
                      ? "text-slate-700"
                      : "text-slate-900",
                  ].join(" ")}
                >
                  {isGuidedSubtraction ? displayTopDigit(index) : digit || ""}
                  {(isGuidedSubtraction ? crossedDigits[index] : writtenMethod.crossedTop?.[index]) ? (
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-red-500">
                      <span className="block h-0.5 w-14 rotate-[58deg] rounded bg-red-500" />
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="mt-2 grid w-fit grid-flow-col gap-2">
              <div className="flex h-12 w-8 items-center justify-center text-3xl font-black text-slate-700">
                {writtenMethod.operation}
              </div>
              {writtenMethod.bottom.map((digit, index) => (
                <div
                  key={`bottom-${index}`}
                  className={[
                    digit === "."
                      ? "flex h-12 w-12 items-center justify-center text-2xl font-black text-slate-900"
                      : "flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-2xl font-black text-slate-900",
                    currentColumn === index && isGuidedWrittenMethod ? "ring-2 ring-teal-400" : "",
                  ].join(" ")}
                >
                  {digit || ""}
                </div>
              ))}
            </div>
            <div className="mt-3 h-1 w-full rounded bg-slate-300" />
            {isColumnMultiplication ? null : (
              <div className="mt-3 grid w-fit grid-flow-col gap-2">
                <div className="w-8" />
                {digitInputs.map((digit, index) => (
                  isStaticWrittenMethodCell(writtenMethod, index) ? (
                    <div
                      key={`answer-static-${index}`}
                      className="flex h-12 w-12 items-center justify-center text-2xl font-black text-slate-700"
                    >
                      {writtenMethod.fixedAnswerCells?.[index] ?? ""}
                    </div>
                  ) : (
                    <input
                      key={`answer-${index}`}
                      value={digit}
                      inputMode="numeric"
                      maxLength={1}
                      disabled={isGuidedWrittenMethod ? index !== currentColumn || guidedPhase !== "input" : false}
                      onChange={(event) => {
                        const nextValue = event.target.value.replace(/[^0-9]/g, "").slice(-1);
                        setDigitInputs((current) =>
                          current.map((cell, cellIndex) =>
                            cellIndex === index ? nextValue : cell
                          )
                        );
                      }}
                      className={[
                        "h-12 w-12 rounded-lg border border-teal-300 bg-white text-center text-2xl font-black text-slate-900 outline-none focus:border-teal-500",
                        isGuidedWrittenMethod && index === currentColumn ? "ring-2 ring-teal-400" : "",
                        isGuidedWrittenMethod && (index !== currentColumn || guidedPhase !== "input")
                          ? "bg-slate-50 text-slate-500"
                          : "",
                      ].join(" ")}
                    />
                  )
                ))}
              </div>
            )}
          </div>
          {isGuidedWrittenMethod && currentColumn >= 0 ? (
            <div className="mt-4 rounded-xl bg-white p-4 shadow-sm">
              <div className="text-sm font-black text-slate-900">
                Work on the {columnLabel(writtenMethod.placeValueLabels[currentColumn] ?? "")} column first.
              </div>
              {guidedPhase === "decide" ? (
                <>
                  <p className="mt-2 text-sm text-slate-600">
                    {isGuidedAddition
                      ? `Do you need to carry for ${
                          (carryValues[currentColumn] ?? 0)
                            ? `${carryValues[currentColumn]} + ${numericWrittenMethodDigits(writtenMethod.top)[currentColumn]} + ${numericWrittenMethodDigits(writtenMethod.bottom)[currentColumn]}`
                            : `${numericWrittenMethodDigits(writtenMethod.top)[currentColumn]} + ${numericWrittenMethodDigits(writtenMethod.bottom)[currentColumn]}`
                        }?`
                      : `Can you do ${workingTopDigits[currentColumn]} - ${Number(writtenMethod.bottom[currentColumn] || 0)}?`}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {isGuidedAddition ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleCarryChoice("no_carry")}
                          className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-black text-slate-900 hover:bg-slate-50"
                        >
                          No carry needed
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCarryChoice("carry")}
                          className="rounded-xl bg-amber-500 px-4 py-2 font-black text-white hover:bg-amber-600"
                        >
                          Carry
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleRegroupChoice("no_regroup")}
                          className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-black text-slate-900 hover:bg-slate-50"
                        >
                          No regroup needed
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRegroupChoice("regroup")}
                          className="rounded-xl bg-amber-500 px-4 py-2 font-black text-white hover:bg-amber-600"
                        >
                          Regroup
                        </button>
                      </>
                    )}
                  </div>
                </>
              ) : guidedPhase === "input" ? (
                <>
                  <p className="mt-2 text-sm text-slate-600">
                    Type the answer digit for the {columnLabel(writtenMethod.placeValueLabels[currentColumn] ?? "")} column.
                  </p>
                  <button
                    type="button"
                    onClick={checkGuidedDigit}
                    className="mt-3 rounded-xl bg-teal-600 px-4 py-2 font-black text-white hover:bg-teal-700"
                  >
                    Check this digit
                  </button>
                </>
              ) : (
                <p className="mt-2 text-sm text-slate-600">
                  You have completed each column in order.
                </p>
              )}
              {guidedFeedback ? (
                <p className="mt-3 text-sm font-bold text-rose-600">{guidedFeedback}</p>
              ) : null}
            </div>
          ) : (
            <p className="mt-3 text-sm font-medium text-slate-600">
              {isColumnMultiplication
                ? "Use the column chart to complete each row, then check your method."
                : "Complete the written method vertically, then check your answer."}
            </p>
          )}
          {isColumnMultiplication ? (
            <button
              type="button"
              onClick={check}
              className="mt-4 rounded-xl bg-teal-600 px-5 py-3 font-black text-white hover:bg-teal-700"
            >
              Check answer
            </button>
          ) : null}
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {isOrderingResponse ? (
            <div className="w-full">
              <div className="flex flex-wrap gap-3">
                {orderedInputs.map((value, index) => (
                  <input
                    key={`ordered-${index}`}
                    value={value}
                    onChange={(event) => {
                      const nextValue = event.target.value.replace(/[^\d,\s]/g, "");
                      setOrderedInputs((current) =>
                        current.map((cell, cellIndex) => (cellIndex === index ? nextValue : cell))
                      );
                    }}
                    inputMode="numeric"
                    placeholder={`${index + 1}`}
                    className="min-w-[120px] flex-1 rounded-xl border border-gray-300 px-4 py-3 text-lg font-bold text-gray-900 outline-none focus:border-teal-500"
                  />
                ))}
              </div>
            </div>
          ) : isStrategyOwnership && strategyOwnershipVisual ? (
            <StrategyOwnershipInput
              visual={strategyOwnershipVisual}
              selectedStrategy={ownershipStrategy}
              answerValue={typed}
              reflectionValue={ownershipReflection}
              feedback={ownershipFeedback}
              solved={ownershipSolved}
              onStrategySelect={(strategy) => {
                setOwnershipStrategy(strategy);
                setOwnershipFeedback("");
              }}
              onAnswerChange={(value) => setTyped(value)}
              onReflectionSelect={(value) => {
                setOwnershipReflection(value);
                setOwnershipFeedback("");
              }}
            />
          ) : isMultiStepMethod && multiStepMethodVisual ? (
            <MultiStepMethodInput
              visual={multiStepMethodVisual}
              currentStep={percentMethodStep}
              inputs={percentMethodInputs}
              feedback={percentMethodFeedback}
              onInputChange={updatePercentMethodInput}
              inputRef={numeratorRef}
            />
          ) : isDiscountStepMethod && discountStepMethodVisual ? (
            <PercentStructuredMethodInput
              visual={discountStepMethodVisual}
              currentStep={percentMethodStep}
              inputs={percentMethodInputs}
              feedback={percentMethodFeedback}
              onInputChange={updatePercentMethodInput}
              inputRef={numeratorRef}
            />
          ) : isPercentStructuredMethod && percentStructuredMethodVisual ? (
            <PercentStructuredMethodInput
              visual={percentStructuredMethodVisual}
              currentStep={percentMethodStep}
              inputs={percentMethodInputs}
              feedback={percentMethodFeedback}
              onInputChange={updatePercentMethodInput}
              inputRef={numeratorRef}
            />
          ) : isStructuredFractionResponse &&
            sameDenominatorOperationVisual &&
            usesFixedDenominator &&
            isRelatedDenominatorWorking &&
            relatedDenominatorWorking ? (
            <RelatedDenominatorWorkingInput
              visual={sameDenominatorOperationVisual}
              working={relatedDenominatorWorking}
              step={relatedDenominatorStep}
              inputs={relatedDenominatorInputs}
              feedback={relatedDenominatorFeedback}
              onInputChange={updateRelatedDenominatorInput}
              inputRef={numeratorRef}
            />
          ) : isStructuredFractionResponse && sameDenominatorOperationVisual && usesFixedDenominator ? (
            <SameDenominatorEquationInput
              visual={sameDenominatorOperationVisual}
              value={fractionNumeratorInput}
              onChange={setFractionNumeratorInput}
              inputRef={numeratorRef}
            />
          ) : isStructuredFractionResponse ? (
            <div className="w-full max-w-[420px]">
              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm transition focus-within:border-teal-400 focus-within:shadow-[0_0_0_4px_rgba(45,212,191,0.12)]">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {isFlexibleFractionInput
                    ? "Fraction or mixed number"
                    : isMixedNumberResponse
                    ? usesFixedDenominator
                      ? "Mixed number answer"
                      : "Mixed number"
                    : isFractionInput
                      ? usesFixedDenominator
                        ? "Equivalent fraction answer"
                        : "Fraction answer"
                      : usesFixedDenominator
                      ? "Equivalent fraction answer"
                      : "Fraction answer"}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  {showsWholeNumberField ? (
                    <input
                      ref={wholeRef}
                      type="text"
                      autoComplete="off"
                      spellCheck={false}
                      value={fractionWholeInput}
                      onChange={(event) => {
                        const nextValue = event.target.value.replace(/\D/g, "");
                        setFractionWholeInput(nextValue);
                        if (nextValue.length >= 1) {
                          numeratorRef.current?.focus();
                        }
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "ArrowRight" && !fractionWholeInput) {
                          numeratorRef.current?.focus();
                        }
                      }}
                      inputMode="numeric"
                      placeholder=""
                      className="h-16 w-16 appearance-none border-0 bg-transparent px-1 text-center text-[2rem] font-black leading-none text-slate-900 caret-teal-600 outline-none"
                      style={{ WebkitTextFillColor: "#0f172a" }}
                      aria-label="Whole number"
                    />
                  ) : null}
                  <div className="flex flex-col items-center">
                    <input
                      ref={numeratorRef}
                      type="text"
                      autoComplete="off"
                      spellCheck={false}
                      value={fractionNumeratorInput}
                      onChange={(event) => {
                        const nextValue = event.target.value.replace(/\D/g, "");
                        setFractionNumeratorInput(nextValue);
                        if (nextValue.length >= 1) {
                          denominatorRef.current?.focus();
                        }
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Backspace" && !fractionNumeratorInput && showsWholeNumberField) {
                          wholeRef.current?.focus();
                        }
                      }}
                      inputMode="numeric"
                      placeholder=""
                      className="block h-11 w-16 appearance-none border-0 bg-transparent px-1 text-center text-[1.65rem] font-black leading-none text-slate-900 caret-teal-600 outline-none"
                      style={{ WebkitTextFillColor: "#0f172a" }}
                      aria-label="Fraction numerator"
                    />
                    <div className="h-[3px] w-16 rounded-full bg-slate-500" />
                    {usesFixedDenominator && questionData.fixedDenominator ? (
                      <div
                        className="flex h-11 w-16 items-center justify-center px-1 text-center text-[1.65rem] font-black leading-none text-slate-700"
                        aria-label="Fixed denominator"
                      >
                        {questionData.fixedDenominator}
                      </div>
                    ) : (
                      <input
                        ref={denominatorRef}
                        type="text"
                        autoComplete="off"
                        spellCheck={false}
                        value={fractionDenominatorInput}
                        onChange={(event) => {
                          const nextValue = event.target.value.replace(/\D/g, "");
                          setFractionDenominatorInput(nextValue);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Backspace" && !fractionDenominatorInput) {
                            numeratorRef.current?.focus();
                          }
                        }}
                        inputMode="numeric"
                        placeholder=""
                        className="block h-11 w-16 appearance-none border-0 bg-transparent px-1 text-center text-[1.65rem] font-black leading-none text-slate-900 caret-teal-600 outline-none"
                        style={{ WebkitTextFillColor: "#0f172a" }}
                        aria-label="Fraction denominator"
                      />
                    )}
                  </div>
                </div>
                <div className="mt-3 text-xs font-medium text-slate-500">
                  {isFlexibleFractionInput
                    ? "Type a fraction or mixed number. Leave the fraction part blank if the answer is a whole number."
                    : isMixedNumberResponse
                    ? usesFixedDenominator
                      ? "Type the whole number and numerator. The denominator stays fixed."
                      : "Type one mixed number. Leave the whole number blank if it is less than one."
                    : isFractionInput
                      ? usesFixedDenominator
                        ? "Type the numerator for the equivalent fraction. The denominator stays fixed."
                        : "Type the fraction."
                      : isIntegerInput
                        ? "Type the whole number only."
                        : isFlexibleFractionInput
                          ? "Type a fraction or mixed number."
                          : usesFixedDenominator
                            ? "Type the numerator for the equivalent fraction. The denominator stays fixed."
                            : "Type one fraction."}
                </div>
                {fractionWholeInput || fractionNumeratorInput || fractionDenominatorInput || (usesFixedDenominator && questionData.fixedDenominator) ? (
                  <div className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                    Your number:{" "}
                    {isFlexibleFractionInput && fractionWholeInput && !fractionNumeratorInput && !fractionDenominatorInput ? (
                      <span>{fractionWholeInput}</span>
                    ) : fractionNumeratorInput && (fractionDenominatorInput || questionData.fixedDenominator) ? (
                      <Fraction
                        whole={fractionWholeInput || undefined}
                        numerator={fractionNumeratorInput}
                        denominator={fractionDenominatorInput || String(questionData.fixedDenominator)}
                        size="md"
                      />
                    ) : (
                      <span className="text-slate-400">complete the fraction</span>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          ) : isEquivalentFractionInput && equivalentFractionInputVisual ? (
            <div className="w-full">
              <div className="flex flex-wrap items-center gap-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <FixedFractionValue
                  numerator={equivalentFractionInputVisual.leftNumerator}
                  denominator={equivalentFractionInputVisual.leftDenominator}
                />
                <div className="text-4xl font-black text-slate-700">=</div>
                <MissingFractionValue
                  numerator={equivalentFractionInputVisual.rightNumerator}
                  denominator={equivalentFractionInputVisual.rightDenominator}
                  missing={equivalentFractionInputVisual.missing}
                  value={typed}
                  onChange={setTyped}
                />
              </div>
            </div>
          ) : isFractionDecimalPercentConversion && fractionDecimalPercentConversionVisual ? (
            <FractionDecimalPercentConversionInput
              visual={fractionDecimalPercentConversionVisual}
              decimalValue={conversionDecimalInput}
              percentValue={conversionPercentInput}
              onDecimalChange={setConversionDecimalInput}
              onPercentChange={setConversionPercentInput}
            />
          ) : questionData.visual?.type === "box_method" || isColumnMultiplication || isStrategyMultiplication || isEstimateStrategyMultiplication || isDivisionRemainderCheck || isDivisionBuildGroups ? null : (
            <input
              value={typed}
              onChange={(event) =>
                setTyped(
                  isIntegerInput || isNumericInputOnly
                    ? event.target.value.replace(/[^\d.,-]/g, "")
                    : event.target.value
                )
              }
              inputMode={isIntegerInput ? "numeric" : isNumericInputOnly ? "decimal" : undefined}
              placeholder={
                isColumnMultiplication
                  ? "Type the final answer"
                  : questionData.placeholder ??
                    (isIntegerInput
                      ? "Type the integer"
                      : isFlexibleFractionInput
                        ? "Type a fraction or mixed number"
                        : isNumericInputOnly
                          ? "Enter your answer"
                          : "Type your answer")
              }
              className="w-full max-w-md rounded-xl border border-gray-300 px-4 py-3 text-lg font-bold text-gray-900 outline-none focus:border-teal-500"
            />
          )}
          {isColumnMultiplication || isStrategyMultiplication || isEstimateStrategyMultiplication || isDivisionRemainderCheck || isDivisionBuildGroups ? null : (
            <button
              type="button"
              onClick={check}
              className="rounded-xl bg-teal-600 px-5 py-3 font-black text-white hover:bg-teal-700"
            >
              {typedResponseButtonLabel}
            </button>
          )}
        </div>
      )}

      {writtenMethod && !isGuidedWrittenMethod && !isColumnMultiplication ? (
        <button
          type="button"
          onClick={check}
          className="mt-4 rounded-xl bg-teal-600 px-5 py-3 font-black text-white hover:bg-teal-700"
        >
          Check answer
        </button>
      ) : null}
    </div>
  );
}
