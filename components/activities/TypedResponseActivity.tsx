"use client";

import { useEffect, useRef, useState } from "react";
import type { TypedResponseQuestion, WrittenMethodLayout } from "@/data/activities/year2/lessonEngine";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import PlaceValueMABVisual from "@/components/activities/PlaceValueMABVisual";
import DecimalModelVisual from "@/components/activities/DecimalModelVisual";
import MoneyContextVisual from "@/components/activities/MoneyContextVisual";
import ArrayVisual from "@/components/activities/ArrayVisual";
import RuleBoxVisual from "@/components/activities/RuleBoxVisual";
import { MathFormattedText } from "@/components/FractionText";

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

function structuredFractionKey(questionData: TypedResponseQuestion) {
  return [
    questionData.prompt,
    questionData.answer,
    questionData.helper ?? "",
    questionData.placeholder ?? "",
    questionData.fixedDenominator ?? "",
    questionData.visual?.type ?? "",
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
  const isGuidedWrittenMethod = isGuidedAddition || isGuidedSubtraction;
  const orderingAnswerParts = !writtenMethod ? extractOrderingNumbers(questionData.answer) : [];
  const expectedStructuredFraction = !writtenMethod ? parseStructuredFraction(questionData.answer) : null;
  const isOrderingResponse =
    !writtenMethod &&
    orderingAnswerParts.length >= 4 &&
    /Type the numbers from (smallest to largest|largest to smallest)/i.test(questionData.prompt) &&
    orderingAnswerParts.every((part) => /^\d+$/.test(part));
  const isStructuredFractionResponse =
    !writtenMethod &&
    !isOrderingResponse &&
    questionData.kind === "typed_response" &&
    expectedStructuredFraction !== null;
  const usesFixedDenominator = isStructuredFractionResponse && typeof questionData.fixedDenominator === "number";
  const [typed, setTyped] = useState("");
  const [fractionWholeInput, setFractionWholeInput] = useState("");
  const [fractionNumeratorInput, setFractionNumeratorInput] = useState("");
  const [fractionDenominatorInput, setFractionDenominatorInput] = useState("");
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
    setTyped("");
    setFractionWholeInput("");
    setFractionNumeratorInput("");
    setFractionDenominatorInput(questionData.fixedDenominator ? String(questionData.fixedDenominator) : "");
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
  }, [resetKey]);

  function normalizedDigitAnswer() {
    const joined = digitInputs.join("").replace(/\s+/g, "");
    return joined.replace(/^0+(?=\d)/, "");
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
    if (!isStrategyMultiplication || !selectedStrategy) return false;
    if (selectedStrategy === "box_method") {
      return boxMethodInputs.length > 0 && boxMethodInputs.every((value) => value.trim()) && boxMethodTotal.trim().length > 0;
    }
    if (selectedStrategy === "long_multiplication") {
      if (questionData.visual?.type !== "multiplication_strategy") return false;
      const { onesPart } = getSplitSumParts(questionData.visual.bottomValue);
      const topDigits = String(questionData.visual.topValue).split("").map(Number);
      const topOnes = topDigits[topDigits.length - 1] ?? 0;
      const expectedCarry = Math.floor((topOnes * onesPart) / 10);
      const coreComplete =
        strategyLongInputs.onesRow.trim().length > 0 &&
        strategyLongInputs.tensRow.trim().length > 0 &&
        strategyLongInputs.total.trim().length > 0;
      if (!coreComplete) return false;
      return expectedCarry === 0 ? true : strategyLongInputs.carry.trim().length > 0;
    }
    return Object.values(strategySplitInputs).every((value) => value.trim().length > 0);
  }

  function check() {
    if (isStrategyMultiplication && questionData.visual?.type === "multiplication_strategy") {
      if (!selectedStrategy) {
        setStrategyFeedback("Choose one method before you start solving.");
        onWrong?.();
        return;
      }

      const finalAnswer = normalizeNumberInput(questionData.answer);

      if (selectedStrategy === "box_method") {
        const expected = getBoxMethodCells(questionData.visual.topValue, questionData.visual.bottomValue);
        const boxesMatch = expected.cells.every(
          (value, index) => normalizeNumberInput(boxMethodInputs[index] ?? "") === String(value)
        );
        const totalMatches = normalizeNumberInput(boxMethodTotal) === finalAnswer;

        if (boxesMatch && totalMatches) {
          setStrategyFeedback("");
          onCorrect?.();
        } else {
          setStrategyFeedback("Check each box value and make sure the total matches the full product.");
          onWrong?.();
        }
        return;
      }

      if (selectedStrategy === "long_multiplication") {
        const { bottomValue, topValue } = questionData.visual;
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

        if (carryMatches && onesRowMatches && tensRowMatches && totalMatches) {
          setStrategyFeedback("");
          onCorrect?.();
        } else {
          setStrategyFeedback("Check the carry, both partial-product rows, and then the final total.");
          onWrong?.();
        }
        return;
      }

      const { bottomValue, topValue } = questionData.visual;
      const { tensPart, onesPart } = getSplitSumParts(bottomValue);
      const tensMatches = normalizeNumberInput(strategySplitInputs.tensProduct) === String(topValue * tensPart);
      const onesMatches = normalizeNumberInput(strategySplitInputs.onesProduct) === String(topValue * onesPart);
      const totalMatches = normalizeNumberInput(strategySplitInputs.total) === finalAnswer;

      if (tensMatches && onesMatches && totalMatches) {
        setStrategyFeedback("");
        onCorrect?.();
      } else {
        setStrategyFeedback("Check the tens product, the ones product, and then the total.");
        onWrong?.();
      }
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

    if (isStructuredFractionResponse && expectedStructuredFraction) {
      const whole = normalizeNumberInput(fractionWholeInput);
      const numerator = normalizeNumberInput(fractionNumeratorInput);
      const denominator = normalizeNumberInput(
        usesFixedDenominator && questionData.fixedDenominator
          ? String(questionData.fixedDenominator)
          : fractionDenominatorInput
      );

      if (!numerator || !denominator) {
        onWrong?.();
        return;
      }

      const parsed = {
        whole: whole ? Number(whole) : 0,
        numerator: Number(numerator),
        denominator: Number(denominator),
      };

      if (
        !Number.isFinite(parsed.whole) ||
        !Number.isFinite(parsed.numerator) ||
        !Number.isFinite(parsed.denominator) ||
        parsed.denominator === 0
      ) {
        onWrong?.();
        return;
      }

      if (mixedNumeralsEquivalent(parsed, expectedStructuredFraction)) {
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
    if (value === expected || isEquivalentNumberSequence(typed, questionData.answer)) {
      onCorrect?.();
    } else {
      onWrong?.();
    }
  }

  const activityTitle =
    writtenMethod?.title ??
    (questionData.visual?.type === "multiplication_strategy"
      ? "Choose a Method"
      : 
    (questionData.visual?.type === "box_method"
      ? "Box Method"
      : questionData.visual?.type === "column_multiplication"
      ? "Column Multiplication"
      : "Typed Response"));
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
      {questionData.visual?.type === "multiplication_strategy" ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-2xl border border-teal-100 bg-teal-50 p-5">
            <div className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">
              Which method would you use?
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              {([
                ["box_method", "Box Method"],
                ["long_multiplication", "Long Multiplication"],
                ["split_sum", "Split the Sum"],
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
                leftValue={questionData.visual.topValue}
                topValue={questionData.visual.bottomValue}
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
                topValue={questionData.visual.topValue}
                bottomValue={questionData.visual.bottomValue}
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
                topValue={questionData.visual.topValue}
                bottomValue={questionData.visual.bottomValue}
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
          ) : isStructuredFractionResponse ? (
            <div className="flex flex-wrap items-end gap-4">
              {usesFixedDenominator ? null : (
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Whole
                  </div>
                  <input
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
                    inputMode="numeric"
                    placeholder=""
                    className="block h-16 w-20 appearance-none rounded-xl border border-gray-300 bg-white px-3 text-center text-2xl font-black leading-none text-slate-900 caret-teal-600 outline-none focus:border-teal-500"
                    style={{ WebkitTextFillColor: "#0f172a" }}
                  />
                </div>
              )}
              <div className="flex flex-col items-center">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {usesFixedDenominator ? "Answer fraction" : "Fraction"}
                </div>
                <div className="mt-2 flex flex-col items-center">
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
                    inputMode="numeric"
                    placeholder=""
                    className="block h-12 w-20 appearance-none rounded-t-xl border border-b-0 border-gray-300 bg-white px-3 text-center text-2xl font-black leading-none text-slate-900 caret-teal-600 outline-none focus:border-teal-500"
                    style={{ WebkitTextFillColor: "#0f172a" }}
                  />
                  <div className="h-1 w-20 rounded-full bg-slate-500" />
                  {usesFixedDenominator && questionData.fixedDenominator ? (
                    <div className="flex h-12 w-20 items-center justify-center rounded-b-xl border border-t-0 border-gray-300 bg-slate-100 px-3 text-center text-2xl font-black leading-none text-slate-700">
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
                      inputMode="numeric"
                      placeholder=""
                      className="block h-12 w-20 appearance-none rounded-b-xl border border-t-0 border-gray-300 bg-white px-3 text-center text-2xl font-black leading-none text-slate-900 caret-teal-600 outline-none focus:border-teal-500"
                      style={{ WebkitTextFillColor: "#0f172a" }}
                    />
                  )}
                </div>
                <div className="mt-2 text-xs font-medium text-slate-500">
                  {usesFixedDenominator
                    ? "The denominator stays the same. Type the numerator."
                    : "Leave whole blank for fractions less than one."}
                </div>
              </div>
            </div>
          ) : questionData.visual?.type === "box_method" || isColumnMultiplication || isStrategyMultiplication ? null : (
            <input
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              placeholder={
                isColumnMultiplication
                  ? "Type the final answer"
                  : questionData.placeholder ?? "Type your answer"
              }
              className="w-full max-w-md rounded-xl border border-gray-300 px-4 py-3 text-lg font-bold text-gray-900 outline-none focus:border-teal-500"
            />
          )}
          {isColumnMultiplication || isStrategyMultiplication ? null : (
            <button
              type="button"
              onClick={check}
              className="rounded-xl bg-teal-600 px-5 py-3 font-black text-white hover:bg-teal-700"
            >
              Check answer
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
