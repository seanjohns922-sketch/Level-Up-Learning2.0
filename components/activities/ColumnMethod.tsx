"use client";

import { useMemo, useRef, useState } from "react";
import type { ColumnMethodQuestion } from "@/data/activities/year2/lessonEngine";
import ReadAloudBtn from "@/components/ReadAloudBtn";

function digitsRightAligned(value: number, columns: number): string[] {
  const chars = String(value).split("");
  const pad = columns - chars.length;
  return Array.from({ length: columns }, (_, index) => (index < pad ? "" : chars[index - pad]!));
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
  const sign = questionData.operation === "add" ? "+" : "−";

  const columns = useMemo(
    () => Math.max(String(top).length, String(bottom).length, String(questionData.answer).length),
    [top, bottom, questionData.answer]
  );

  const [entered, setEntered] = useState<string[]>(() => Array.from({ length: columns }, () => ""));
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const topDigits = digitsRightAligned(top, columns);
  const bottomDigits = digitsRightAligned(bottom, columns);

  function setDigit(index: number, raw: string) {
    if (status === "correct") return;
    const value = raw.replace(/[^0-9]/g, "").slice(-1);
    setEntered((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
    setStatus("idle");
    // auto-advance to the next column on the right when a digit is typed
    if (value && index < columns - 1) inputsRef.current[index + 1]?.focus();
  }

  const allFilled = entered.every((digit) => digit !== "");

  function check() {
    if (!allFilled) return;
    const assembled = Number(entered.join(""));
    if (assembled === questionData.answer) {
      setStatus("correct");
      onCorrect?.();
    } else {
      setStatus("wrong");
      onWrong?.(String(assembled));
    }
  }

  const cellBase =
    "flex h-12 w-11 items-center justify-center rounded-lg text-2xl font-black tabular-nums sm:h-14 sm:w-12 sm:text-3xl";

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-2">
        <h2 className="text-2xl font-black text-gray-900">{questionData.prompt}</h2>
        <ReadAloudBtn text={questionData.prompt} />
      </div>
      {questionData.helper ? (
        <p className="mt-2 text-sm text-slate-600">{questionData.helper}</p>
      ) : null}

      <div className="mt-6 inline-flex flex-col items-end rounded-2xl border border-teal-100 bg-teal-50 p-4">
        {/* top operand */}
        <div className="flex gap-1.5">
          {topDigits.map((d, i) => (
            <div key={`t-${i}`} className={`${cellBase} text-slate-900`}>{d}</div>
          ))}
        </div>
        {/* operator + bottom operand */}
        <div className="mt-1 flex items-center gap-1.5">
          <div className={`${cellBase} -ml-8 text-teal-700`}>{sign}</div>
          {bottomDigits.map((d, i) => (
            <div key={`b-${i}`} className={`${cellBase} text-slate-900`}>{d}</div>
          ))}
        </div>
        {/* rule line */}
        <div className="my-2 h-[3px] w-full rounded bg-slate-400" />
        {/* answer inputs */}
        <div className="flex gap-1.5">
          {entered.map((d, i) => (
            <input
              key={`a-${i}`}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              aria-label={`Answer digit, column ${columns - i}`}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              disabled={status === "correct"}
              className={[
                cellBase,
                "border-2 outline-none transition",
                status === "wrong"
                  ? "border-red-300 bg-red-50 text-red-900"
                  : status === "correct"
                  ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                  : "border-teal-300 bg-white text-teal-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-200",
              ].join(" ")}
            />
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={check}
          disabled={!allFilled || status === "correct"}
          className="rounded-2xl bg-teal-600 px-5 py-3 font-black text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Check answer
        </button>
        {status === "wrong" ? (
          <span className="text-sm font-bold text-red-600">Not quite — check each column from the right.</span>
        ) : null}
        {status === "correct" ? (
          <span className="text-sm font-bold text-emerald-700">Correct!</span>
        ) : null}
      </div>
    </div>
  );
}
