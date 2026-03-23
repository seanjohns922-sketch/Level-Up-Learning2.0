"use client";

import { useEffect, useState } from "react";
import type { TypedResponseQuestion } from "@/data/activities/year2/lessonEngine";
import ReadAloudBtn from "@/components/ReadAloudBtn";

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
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
  const [typed, setTyped] = useState("");
  const [digitInputs, setDigitInputs] = useState<string[]>(
    writtenMethod
      ? Array.from({ length: writtenMethod.answerLength }, () => "")
      : []
  );

  useEffect(() => {
    setTyped("");
    setDigitInputs(
      writtenMethod
        ? Array.from({ length: writtenMethod.answerLength }, () => "")
        : []
    );
  }, [questionData, writtenMethod]);

  function normalizedDigitAnswer() {
    const joined = digitInputs.join("").replace(/\s+/g, "");
    return joined.replace(/^0+(?=\d)/, "");
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
            {writtenMethod.carryRow ? (
              <div className="mb-1 grid w-fit grid-flow-col gap-2">
                <div className="w-8" />
                {writtenMethod.carryRow.map((digit, index) => (
                  <div key={`carry-${index}`} className="flex h-8 w-12 items-center justify-center text-sm font-black text-amber-600">
                    {digit}
                  </div>
                ))}
              </div>
            ) : null}
            {writtenMethod.borrowRow ? (
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
                    writtenMethod.crossedTop?.[index]
                      ? "text-slate-700"
                      : "text-slate-900",
                  ].join(" ")}
                >
                  {digit || ""}
                  {writtenMethod.crossedTop?.[index] ? (
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
                <div key={`bottom-${index}`} className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-2xl font-black text-slate-900">
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
                  onChange={(event) => {
                    const nextValue = event.target.value.replace(/[^0-9]/g, "").slice(-1);
                    setDigitInputs((current) =>
                      current.map((cell, cellIndex) =>
                        cellIndex === index ? nextValue : cell
                      )
                    );
                  }}
                  className="h-12 w-12 rounded-lg border border-teal-300 bg-white text-center text-2xl font-black text-slate-900 outline-none focus:border-teal-500"
                />
              ))}
            </div>
          </div>
          <p className="mt-3 text-sm font-medium text-slate-600">
            Complete the written method vertically, then check your answer.
          </p>
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

      {writtenMethod ? (
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
