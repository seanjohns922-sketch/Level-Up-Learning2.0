"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import type { ColumnMethodQuestion } from "@/data/activities/year2/lessonEngine";
import ReadAloudBtn from "@/components/ReadAloudBtn";

type Step = {
  col: number; // display index, 0 = leftmost
  order: number; // 0 = first solved (ones)
  answerDigit: number;
  bottomDigit: number;
  origTop: number;
  // addition
  carryIn?: number;
  carryOut?: number;
  // subtraction: workTop is the top value AFTER any regrouping (e.g. 11, or a reduced 6)
  workTop?: number;
  borrowedIn?: boolean;
};

function toDigits(value: number, columns: number): number[] {
  return String(value).padStart(columns, "0").split("").map(Number);
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

  // Precompute the guided steps (right column first), plus, for subtraction,
  // the working top value per column and the point at which each regroup
  // becomes visible.
  const { steps, workTop, revealAt } = useMemo(() => {
    const list: Step[] = [];
    const work = [...topD];
    const reveal = new Array(columns).fill(Infinity);
    let order = 0;
    if (isAdd) {
      let carry = 0;
      for (let i = columns - 1; i >= 0; i -= 1) {
        const sum = topD[i]! + botD[i]! + carry;
        const carryOut = sum >= 10 ? 1 : 0;
        list.push({ col: i, order, answerDigit: sum % 10, bottomDigit: botD[i]!, origTop: topD[i]!, carryIn: carry, carryOut });
        carry = carryOut;
        order += 1;
      }
    } else {
      for (let i = columns - 1; i >= 0; i -= 1) {
        let borrowedIn = false;
        if (work[i]! < botD[i]!) {
          let j = i - 1;
          while (j >= 0 && work[j] === 0) {
            work[j] = 9;
            reveal[j] = Math.min(reveal[j], order);
            j -= 1;
          }
          if (j >= 0) {
            work[j]! -= 1;
            reveal[j] = Math.min(reveal[j], order);
          }
          work[i]! += 10;
          reveal[i] = Math.min(reveal[i], order);
          borrowedIn = true;
        }
        list.push({ col: i, order, answerDigit: work[i]! - botD[i]!, bottomDigit: botD[i]!, origTop: topD[i]!, workTop: work[i]!, borrowedIn });
        order += 1;
      }
    }
    return { steps: list, workTop: work, revealAt: reveal };
  }, [isAdd, columns, topD, botD]);

  const stepByCol = useMemo(() => {
    const m: Record<number, Step> = {};
    steps.forEach((s) => { m[s.col] = s; });
    return m;
  }, [steps]);

  const [stepIdx, setStepIdx] = useState(0);
  const [placed, setPlaced] = useState<Record<number, number>>({});
  const [carriesShown, setCarriesShown] = useState<Record<number, number>>({});
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const step = steps[stepIdx];
  const placeName = (col: number) => ["ones", "tens", "hundreds", "thousands", "ten thousands"][columns - 1 - col] ?? "column";
  const subValue = (col: number) => (stepIdx >= revealAt[col] ? workTop[col]! : topD[col]!); // regrouped value once revealed

  useEffect(() => { inputRef.current?.focus(); }, [stepIdx]);

  function submitStep() {
    if (!step || done) return;
    if (value === "") return;
    const entered = Number(value);
    if (entered !== step.answerDigit) {
      setFeedback(
        isAdd
          ? `${step.origTop} + ${step.bottomDigit}${step.carryIn ? ` + ${step.carryIn}` : ""} = ${step.origTop + step.bottomDigit + (step.carryIn ?? 0)}. Write ${step.answerDigit}${step.carryOut ? " and carry 1." : "."}`
          : `${step.workTop} − ${step.bottomDigit} = ${step.answerDigit}. Use the regrouped number.`
      );
      onWrong?.(value);
      return;
    }
    const nextPlaced = { ...placed, [step.col]: step.answerDigit };
    setPlaced(nextPlaced);
    if (isAdd && step.carryOut && step.col > 0) setCarriesShown((c) => ({ ...c, [step.col - 1]: 1 }));
    setValue("");
    setShowHint(false);
    setFeedback(null);
    if (stepIdx === steps.length - 1) { setDone(true); onCorrect?.(); }
    else setStepIdx(stepIdx + 1);
  }

  const cell = "flex h-12 w-11 items-center justify-center rounded-lg text-2xl font-black tabular-nums sm:h-14 sm:w-12 sm:text-3xl";

  function TopCell({ col }: { col: number }) {
    const isCurrent = !done && step?.col === col;
    const ring = isCurrent ? "bg-amber-100 ring-2 ring-amber-300" : "";
    if (isAdd) {
      const show = topD[col] !== 0 || String(top).length > columns - 1 - col;
      return <div className={`${cell} ${ring} text-slate-900`}>{show ? topD[col] : ""}</div>;
    }
    const revealed = stepIdx >= revealAt[col];
    const orig = topD[col]!;
    const work = workTop[col]!;
    if (!revealed || work === orig) {
      const show = orig !== 0 || String(top).length > columns - 1 - col;
      return <div className={`${cell} ${ring} text-slate-900`}>{show ? orig : ""}</div>;
    }
    if (work > orig) {
      // borrowed in: e.g. 1 -> 11
      return <div className={`${cell} ${ring} text-teal-700`}>{work}</div>;
    }
    // reduced by a borrow: show crossed-out original + new value
    return (
      <div className={`relative ${cell} ${ring} text-teal-800`}>
        <span className="absolute -top-1 right-1 text-xs font-bold text-slate-400 line-through">{orig}</span>
        {work}
      </div>
    );
  }

  function AnswerCell({ col }: { col: number }) {
    const isCurrent = !done && step?.col === col;
    if (col in placed) return <div className={`${cell} border-2 border-emerald-300 bg-emerald-50 text-emerald-900`}>{placed[col]}</div>;
    if (isCurrent)
      return (
        <input
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
    return <div className={`${cell} border-2 border-dashed border-slate-200 bg-white`} />;
  }

  const promptText = () => {
    if (!step) return "";
    if (isAdd) return `Add the ${placeName(step.col)}: ${step.origTop} + ${step.bottomDigit}${step.carryIn ? ` + ${step.carryIn} carried` : ""}. What goes in the ${placeName(step.col)} place?`;
    if (step.borrowedIn) return `Subtract the ${placeName(step.col)}: you can't take ${step.bottomDigit} from ${step.origTop}, so regroup. Now ${step.workTop} − ${step.bottomDigit} = ?`;
    if (step.workTop! < step.origTop) return `You already regrouped 1 from the ${placeName(step.col)}, so it is now ${step.workTop}. ${step.workTop} − ${step.bottomDigit} = ?`;
    return `Subtract the ${placeName(step.col)}: ${step.origTop} − ${step.bottomDigit}. What goes in the ${placeName(step.col)} place?`;
  };

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-2">
        <h2 className="text-2xl font-black text-gray-900">{questionData.prompt}</h2>
        <ReadAloudBtn text={questionData.prompt} />
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start">
        <div className="inline-flex flex-col items-end rounded-2xl border border-teal-100 bg-teal-50 p-4">
          {isAdd ? (
            <div className="flex gap-1.5">
              {Array.from({ length: columns }).map((_, col) => (
                <div key={`c${col}`} className="flex h-6 w-11 items-center justify-center text-sm font-black text-red-500 sm:w-12">
                  {carriesShown[col] ? "1" : ""}
                </div>
              ))}
            </div>
          ) : null}
          <div className="flex gap-1.5">{Array.from({ length: columns }).map((_, col) => <TopCell key={`t${col}`} col={col} />)}</div>
          <div className="mt-1 flex items-center gap-1.5">
            <div className={`${cell} -ml-8 text-teal-700`}>{sign}</div>
            {Array.from({ length: columns }).map((_, col) => {
              const show = botD[col] !== 0 || String(bottom).length > columns - 1 - col;
              const isCurrent = !done && step?.col === col;
              return <div key={`b${col}`} className={`${cell} ${isCurrent ? "bg-amber-100 ring-2 ring-amber-300" : ""} text-slate-900`}>{show ? botD[col] : ""}</div>;
            })}
          </div>
          <div className="my-2 h-[3px] w-full rounded bg-slate-400" />
          <div className="flex gap-1.5">{Array.from({ length: columns }).map((_, col) => <AnswerCell key={`a${col}`} col={col} />)}</div>
        </div>

        <div className="rounded-2xl border border-teal-100 bg-white p-4">
          {done ? (
            <div className="text-lg font-black text-emerald-700">Solved! {top} {sign} {bottom} = {questionData.answer}.</div>
          ) : (
            <>
              <div className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">Step {stepIdx + 1} of {steps.length} · {placeName(step!.col)}</div>
              <p className="mt-2 text-lg font-bold text-slate-900">{promptText()}</p>
              {showHint ? (
                <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
                  {isAdd
                    ? `${step!.origTop} + ${step!.bottomDigit}${step!.carryIn ? ` + ${step!.carryIn}` : ""} = ${step!.origTop + step!.bottomDigit + (step!.carryIn ?? 0)}. Write ${step!.answerDigit}${step!.carryOut ? ", carry 1." : "."}`
                    : `${step!.workTop} − ${step!.bottomDigit} = ${step!.answerDigit}.`}
                </p>
              ) : null}
              {feedback ? <p className="mt-2 text-sm font-bold text-red-600">{feedback}</p> : null}
              <div className="mt-4 flex gap-3">
                <button type="button" onClick={submitStep} disabled={value === ""} className="rounded-2xl bg-teal-600 px-5 py-3 font-black text-white transition hover:bg-teal-700 disabled:opacity-40">Check this column</button>
                <button type="button" onClick={() => setShowHint(true)} className="rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-3 font-black text-amber-800 transition hover:bg-amber-100">Hint</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
