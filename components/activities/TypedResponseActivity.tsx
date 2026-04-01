"use client";

import { useEffect, useState } from "react";
import type { TypedResponseQuestion } from "@/data/activities/year2/lessonEngine";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import PlaceValueMABVisual from "@/components/activities/PlaceValueMABVisual";
import DecimalModelVisual from "@/components/activities/DecimalModelVisual";

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/,/g, "").replace(/\s+/g, " ");
}

function columnLabel(label: string) {
  if (label === "O") return "ones";
  if (label === "T") return "tens";
  if (label === "H") return "hundreds";
  if (label === "Th") return "thousands";
  return "current";
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
  const isGuidedWrittenMethod = isGuidedAddition || isGuidedSubtraction;
  const [typed, setTyped] = useState("");
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
  }, [questionData, writtenMethod]);

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
    const value = writtenMethod
      ? normalize(normalizedDigitAnswer())
      : normalize(typed);
    if (value === normalize(questionData.answer)) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
        {writtenMethod?.title ?? "Typed Response"}
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
      {questionData.helper ? (
        <p className="mt-2 text-sm text-gray-600">{questionData.helper}</p>
      ) : null}

      {writtenMethod ? (
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
              Complete the written method vertically, then check your answer.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <input
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            placeholder={questionData.placeholder ?? "Type your answer"}
            className="w-full max-w-md rounded-xl border border-gray-300 px-4 py-3 text-lg font-bold text-gray-900 outline-none focus:border-teal-500"
          />
          <button
            type="button"
            onClick={check}
            className="rounded-xl bg-teal-600 px-5 py-3 font-black text-white hover:bg-teal-700"
          >
            Check answer
          </button>
        </div>
      )}

      {writtenMethod && !isGuidedWrittenMethod ? (
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
