"use client";

import { useEffect, useState } from "react";
import type { TypedResponseQuestion } from "@/data/activities/year2/lessonEngine";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import PlaceValueMABVisual from "@/components/activities/PlaceValueMABVisual";
import DecimalModelVisual from "@/components/activities/DecimalModelVisual";

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/,/g, "").replace(/\s+/g, " ");
}

function normalizeOrderingNumber(value: string) {
  return value.trim().replace(/,/g, "").replace(/\s+/g, "");
}

function extractOrderingNumbers(value: string) {
  return (value.match(/\d[\d,]*/g) ?? []).map(normalizeOrderingNumber).filter(Boolean);
}

function columnLabel(label: string) {
  if (label === "O") return "ones";
  if (label === "T") return "tens";
  if (label === "H") return "hundreds";
  if (label === "Th") return "thousands";
  return "current";
}

function formatWholeNumber(value: number) {
  return value.toLocaleString();
}

function digitCells(value: number, width: number) {
  return String(value).padStart(width, " ").split("");
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
}: {
  topValue: number;
  bottomValue: number;
}) {
  const width = Math.max(String(topValue).length, String(bottomValue).length, String(topValue * bottomValue).length);
  const topDigits = digitCells(topValue, width);
  const bottomDigits = digitCells(bottomValue, width);
  const rowCount = String(bottomValue).length > 1 ? 2 : 1;

  return (
    <div className="w-fit rounded-xl bg-white p-4 shadow-sm">
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
        {Array.from({ length: rowCount }).map((_, rowIndex) => (
          <div key={`workspace-row-${rowIndex}`} className="grid w-fit grid-flow-col gap-2">
            <div className="w-8" />
            {Array.from({ length: width + rowIndex }).map((__, index) => (
              <div
                key={`workspace-cell-${rowIndex}-${index}`}
                className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-dashed border-teal-200 bg-teal-50/50 text-xl font-black text-teal-400"
              >
                _
              </div>
            ))}
          </div>
        ))}
      </div>
      {rowCount > 1 ? <div className="mt-3 h-1 w-full rounded bg-slate-300" /> : null}
      <div className="mt-3 grid w-fit grid-flow-col gap-2">
        <div className="w-8" />
        {Array.from({ length: width + (rowCount > 1 ? 1 : 0) }).map((_, index) => (
          <div
            key={`workspace-total-${index}`}
            className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-dashed border-amber-200 bg-amber-50/50 text-xl font-black text-amber-400"
          >
            _
          </div>
        ))}
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
}: {
  leftValue: number;
  topValue: number;
}) {
  const splitLeft =
    leftValue >= 10 ? [Math.floor(leftValue / 10) * 10, leftValue % 10].filter(Boolean) : [leftValue];
  const splitTop =
    topValue >= 10 ? [Math.floor(topValue / 10) * 10, topValue % 10].filter(Boolean) : [topValue];

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
            {splitTop.map((_, cellIndex) => (
              <div
                key={`workspace-box-${rowIndex}-${cellIndex}`}
                className="flex h-12 items-center justify-center rounded-lg border-2 border-dashed border-teal-200 bg-teal-50/50 text-xl font-black text-teal-400"
              >
                _
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-lg border-2 border-dashed border-amber-200 bg-amber-50/50 px-4 py-3 text-sm font-semibold text-amber-700">
        Add the box totals to find the final answer.
      </div>
    </div>
  );
}

export default function TypedResponseActivity({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: TypedResponseQuestion;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const writtenMethod = questionData.writtenMethod;
  const isGuidedAddition = writtenMethod?.operation === "+";
  const isGuidedSubtraction = writtenMethod?.operation === "-";
  const isColumnMultiplication = writtenMethod?.operation === "×";
  const isGuidedWrittenMethod = isGuidedAddition || isGuidedSubtraction;
  const orderingAnswerParts = !writtenMethod ? extractOrderingNumbers(questionData.answer) : [];
  const isOrderingResponse =
    !writtenMethod &&
    orderingAnswerParts.length >= 4 &&
    /Type the numbers from (smallest to largest|largest to smallest)/i.test(questionData.prompt) &&
    orderingAnswerParts.every((part) => /^\d+$/.test(part));
  const [typed, setTyped] = useState("");
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
    isGuidedWrittenMethod && writtenMethod ? writtenMethod.answerLength - 1 : -1
  );
  const [guidedPhase, setGuidedPhase] = useState<"decide" | "input" | "done">(
    isGuidedWrittenMethod && writtenMethod ? "decide" : "done"
  );
  const [guidedFeedback, setGuidedFeedback] = useState("");

  useEffect(() => {
    setTyped("");
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
    setCurrentColumn(isGuidedWrittenMethod && writtenMethod ? writtenMethod.answerLength - 1 : -1);
    setGuidedPhase(isGuidedWrittenMethod && writtenMethod ? "decide" : "done");
    setGuidedFeedback("");
  }, [isGuidedWrittenMethod, isOrderingResponse, orderingAnswerParts.length, questionData, writtenMethod]);

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
    const topDigits = writtenMethod.top.map((digit) => Number(digit || 0));
    const bottomDigits = writtenMethod.bottom.map((digit) => Number(digit || 0));
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
      if (currentColumn > 0) {
        nextCarryDisplay[currentColumn - 1] = "1";
        nextCarryValues[currentColumn - 1] = (nextCarryValues[currentColumn - 1] ?? 0) + 1;
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
      const topDigits = writtenMethod.top.map((digit) => Number(digit || 0));
      const bottomDigits = writtenMethod.bottom.map((digit) => Number(digit || 0));
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

      setCurrentColumn(currentColumn - 1);
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

  function check() {
    const value = isColumnMultiplication
      ? normalize(typed)
      : writtenMethod
      ? normalize(normalizedDigitAnswer())
      : isOrderingResponse
      ? orderedInputs.map(normalizeOrderingNumber).join(",")
      : normalize(typed);
    const expected = isOrderingResponse
      ? orderingAnswerParts.join(",")
      : normalize(questionData.answer);
    if (value === expected) onCorrect?.();
    else onWrong?.();
  }

  const activityTitle =
    writtenMethod?.title ??
    (questionData.visual?.type === "box_method"
      ? "Box Method"
      : questionData.visual?.type === "column_multiplication"
      ? "Column Multiplication"
      : "Typed Response");

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
        {activityTitle}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <h2 className="text-2xl font-black text-gray-900">{questionData.prompt}</h2>
        <ReadAloudBtn text={questionData.prompt} />
      </div>
      {questionData.visual?.type === "mab" ? (
        <PlaceValueMABVisual questionData={questionData.visual} title="MAB model" />
      ) : null}
      {questionData.visual?.type === "decimal_model" ? (
        <DecimalModelVisual visual={questionData.visual} title="Decimal model" />
      ) : null}
      {questionData.visual?.type === "column_multiplication" ? (
        <div className="mt-4 space-y-4">
          {questionData.visual.showWorkedExample ? <ColumnMultiplicationWorkedExample /> : null}
          <div className="rounded-2xl border border-teal-100 bg-teal-50 p-5">
            <ColumnMultiplicationWorkspace
              topValue={questionData.visual.topValue}
              bottomValue={questionData.visual.bottomValue}
            />
            <p className="mt-4 text-sm font-medium text-slate-600">
              Use column multiplication vertically, then type the final answer.
            </p>
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
            />
            <p className="mt-4 text-sm font-medium text-slate-600">
              Fill each box in your head or on paper, then type the final answer.
            </p>
          </div>
        </div>
      ) : null}
      {questionData.helper ? (
        <p className="mt-2 text-sm text-gray-600">{questionData.helper}</p>
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
                    "relative flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-2xl font-black",
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
                    "flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-2xl font-black text-slate-900",
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
                            ? `${carryValues[currentColumn]} + ${Number(writtenMethod.top[currentColumn] || 0)} + ${Number(writtenMethod.bottom[currentColumn] || 0)}`
                            : `${Number(writtenMethod.top[currentColumn] || 0)} + ${Number(writtenMethod.bottom[currentColumn] || 0)}`
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
                ? "Use column multiplication vertically, then type the final answer."
                : "Complete the written method vertically, then check your answer."}
            </p>
          )}
          {isColumnMultiplication ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <input
                value={typed}
                onChange={(event) => setTyped(event.target.value)}
                inputMode="numeric"
                placeholder="Type the final answer"
                className="w-full max-w-md rounded-xl border border-gray-300 px-4 py-3 text-lg font-bold text-gray-900 outline-none focus:border-teal-500"
              />
            </div>
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
          ) : (
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
          <button
            type="button"
            onClick={check}
            className="rounded-xl bg-teal-600 px-5 py-3 font-black text-white hover:bg-teal-700"
          >
            Check answer
          </button>
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
