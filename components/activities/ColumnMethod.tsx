"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import type { ColumnMethodQuestion } from "@/data/activities/year2/lessonEngine";
import ReadAloudBtn from "@/components/ReadAloudBtn";

type Step = {
  col: number; // display index, 0 = leftmost
  answerDigit: number;
  // addition
  carryIn?: number;
  carryOut?: number;
  topDigit: number;
  bottomDigit: number;
  // subtraction
  borrowed?: boolean;
  workingTop?: number; // top digit after any regroup (e.g. 15)
};

function toDigits(value: number, columns: number): number[] {
  const chars = String(value).padStart(columns, "0").split("");
  return chars.map((c) => Number(c));
}

export default function ColumnMethod({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: ColumnMethodQuestion;
  onCorrect?: () => void;
  onWrong?: (studentAnswer?: string) => void;
}) {
  const [top, bottom] = questionData.operands;
  const isAdd = questionData.operation === "add";
  const sign = isAdd ? "+" : "−";
  const columns = useMemo(
    () => Math.max(String(top).length, String(bottom).length, String(questionData.answer).length),
    [top, bottom, questionData.answer]
  );

  const topD = useMemo(() => toDigits(top, columns), [top, columns]);
  const botD = useMemo(() => toDigits(bottom, columns), [bottom, columns]);

  // Precompute the guided steps (right column first).
  const steps = useMemo<Step[]>(() => {
    const order: Step[] = [];
    if (isAdd) {
      let carry = 0;
      for (let i = columns - 1; i >= 0; i -= 1) {
        const sum = topD[i]! + botD[i]! + carry;
        const carryOut = sum >= 10 ? 1 : 0;
        order.push({ col: i, topDigit: topD[i]!, bottomDigit: botD[i]!, carryIn: carry, answerDigit: sum % 10, carryOut });
        carry = carryOut;
      }
    } else {
      const workingTop = [...topD];
      for (let i = columns - 1; i >= 0; i -= 1) {
        let borrowed = false;
        if (workingTop[i]! < botD[i]!) {
          let j = i - 1;
          while (j >= 0 && workingTop[j] === 0) {
            workingTop[j] = 9;
            j -= 1;
          }
          if (j >= 0) workingTop[j]! -= 1;
          workingTop[i]! += 10;
          borrowed = true;
        }
        order.push({ col: i, topDigit: topD[i]!, bottomDigit: botD[i]!, answerDigit: workingTop[i]! - botD[i]!, borrowed, workingTop: workingTop[i]! });
      }
    }
    return order;
  }, [isAdd, columns, topD, botD]);

  const [stepIdx, setStepIdx] = useState(0);
  const [placed, setPlaced] = useState<Record<number, number>>({});
  const [carriesShown, setCarriesShown] = useState<Record<number, number>>({}); // carry displayed above column
  const [borrowsShown, setBorrowsShown] = useState<Record<number, boolean>>({});
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const step = steps[stepIdx];
  const placeName = (col: number) => ["ones", "tens", "hundreds", "thousands", "ten thousands"][columns - 1 - col] ?? "column";

  useEffect(() => {
    inputRef.current?.focus();
  }, [stepIdx]);

  function submitStep() {
    if (!step || done) return;
    const entered = Number(value);
    if (value === "" || Number.isNaN(entered)) return;
    if (entered !== step.answerDigit) {
      setFeedback(
        isAdd
          ? `Add the ${placeName(step.col)}: ${step.topDigit} + ${step.bottomDigit}${step.carryIn ? ` + ${step.carryIn} carried` : ""} = ${step.topDigit + step.bottomDigit + (step.carryIn ?? 0)}. Write ${step.answerDigit}${step.carryOut ? " and carry 1" : ""}.`
          : step.borrowed
          ? `You can't take ${step.bottomDigit} from ${step.topDigit}. Regroup, then ${step.workingTop} − ${step.bottomDigit} = ${step.answerDigit}.`
          : `Subtract the ${placeName(step.col)}: ${step.topDigit} − ${step.bottomDigit} = ${step.answerDigit}.`
      );
      onWrong?.(value);
      return;
    }
    // correct
    const nextPlaced = { ...placed, [step.col]: step.answerDigit };
    setPlaced(nextPlaced);
    if (isAdd && step.carryOut && step.col > 0) {
      setCarriesShown((c) => ({ ...c, [step.col - 1]: 1 }));
    }
    if (!isAdd && step.borrowed) {
      setBorrowsShown((b) => ({ ...b, [step.col]: true }));
    }
    setValue("");
    setShowHint(false);
    setFeedback(null);
    if (stepIdx === steps.length - 1) {
      setDone(true);
      onCorrect?.();
    } else {
      setStepIdx(stepIdx + 1);
    }
  }

  const cell = "flex h-12 w-11 items-center justify-center rounded-lg text-2xl font-black tabular-nums sm:h-14 sm:w-12 sm:text-3xl";

  function columnCell(kind: "top" | "bottom" | "answer", col: number) {
    const isCurrent = !done && step?.col === col;
    if (kind === "answer") {
      if (col in placed) return <div key={`a${col}`} className={`${cell} border-2 border-emerald-300 bg-emerald-50 text-emerald-900`}>{placed[col]}</div>;
      if (isCurrent)
        return (
          <input
            key={`a${col}`}
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, "").slice(-1))}
            onKeyDown={(e) => { if (e.key === "Enter") submitStep(); }}
            aria-label={`${placeName(col)} digit`}
            className={`${cell} border-2 border-teal-500 bg-white text-teal-900 outline-none ring-2 ring-teal-200`}
          />
        );
      return <div key={`a${col}`} className={`${cell} border-2 border-dashed border-slate-200 bg-white`} />;
    }
    const digit = kind === "top" ? topD[col] : botD[col];
    const show = digit !== 0 || (kind === "top" ? String(top).length : String(bottom).length) > columns - 1 - col;
    return (
      <div key={`${kind}${col}`} className={`${cell} ${isCurrent ? "bg-amber-100 text-amber-900 ring-2 ring-amber-300" : "text-slate-900"}`}>
        {show ? digit : ""}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-2">
        <h2 className="text-2xl font-black text-gray-900">{questionData.prompt}</h2>
        <ReadAloudBtn text={questionData.prompt} />
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start">
        {/* Column grid */}
        <div className="inline-flex flex-col items-end rounded-2xl border border-teal-100 bg-teal-50 p-4">
          {/* carry / regroup row */}
          <div className="flex gap-1.5">
            {Array.from({ length: columns }).map((_, col) => (
              <div key={`c${col}`} className="flex h-6 w-11 items-center justify-center text-sm font-black text-red-500 sm:w-12">
                {isAdd ? (carriesShown[col] ? "1" : "") : borrowsShown[col] ? "-1" : ""}
              </div>
            ))}
          </div>
          <div className="flex gap-1.5">{Array.from({ length: columns }).map((_, col) => columnCell("top", col))}</div>
          <div className="mt-1 flex items-center gap-1.5">
            <div className={`${cell} -ml-8 text-teal-700`}>{sign}</div>
            {Array.from({ length: columns }).map((_, col) => columnCell("bottom", col))}
          </div>
          <div className="my-2 h-[3px] w-full rounded bg-slate-400" />
          <div className="flex gap-1.5">{Array.from({ length: columns }).map((_, col) => columnCell("answer", col))}</div>
        </div>

        {/* Guidance */}
        <div className="rounded-2xl border border-teal-100 bg-white p-4">
          {done ? (
            <div className="text-lg font-black text-emerald-700">Solved! {top} {sign} {bottom} = {questionData.answer}.</div>
          ) : (
            <>
              <div className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">
                Step {stepIdx + 1} of {steps.length} · {placeName(step?.col ?? 0)}
              </div>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {isAdd
                  ? `Add the ${placeName(step!.col)}: ${step!.topDigit} + ${step!.bottomDigit}${step!.carryIn ? ` + ${step!.carryIn} carried` : ""}. What goes in the ${placeName(step!.col)} place?`
                  : step!.borrowed
                  ? `Subtract the ${placeName(step!.col)}: you can't take ${step!.bottomDigit} from ${step!.topDigit}, so regroup first. What is ${step!.workingTop} − ${step!.bottomDigit}?`
                  : `Subtract the ${placeName(step!.col)}: ${step!.topDigit} − ${step!.bottomDigit}. What goes in the ${placeName(step!.col)} place?`}
              </p>
              {showHint ? (
                <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
                  {isAdd
                    ? `${step!.topDigit} + ${step!.bottomDigit}${step!.carryIn ? ` + ${step!.carryIn}` : ""} = ${step!.topDigit + step!.bottomDigit + (step!.carryIn ?? 0)}. Write ${step!.answerDigit}${step!.carryOut ? ", and carry 1 to the next column." : "."}`
                    : `${step!.workingTop ?? step!.topDigit} − ${step!.bottomDigit} = ${step!.answerDigit}.${step!.borrowed ? " (You regrouped 1 from the next column.)" : ""}`}
                </p>
              ) : null}
              {feedback ? <p className="mt-2 text-sm font-bold text-red-600">{feedback}</p> : null}
              <div className="mt-4 flex gap-3">
                <button type="button" onClick={submitStep} disabled={value === ""} className="rounded-2xl bg-teal-600 px-5 py-3 font-black text-white transition hover:bg-teal-700 disabled:opacity-40">
                  Check this column
                </button>
                <button type="button" onClick={() => setShowHint(true)} className="rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-3 font-black text-amber-800 transition hover:bg-amber-100">
                  Hint
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
