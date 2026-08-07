"use client";

import { useState } from "react";
import { Box, Diamond, RotateCcw, Undo2 } from "lucide-react";
import type { SkipCountQuestion } from "@/data/activities/year2/lessonEngine";
import ReadAloudBtn from "@/components/ReadAloudBtn";

export default function SkipCount({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: SkipCountQuestion;
  onCorrect?: () => void;
  onWrong?: (studentAnswer?: string) => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const [builtTerms, setBuiltTerms] = useState<number[]>([]);

  function choose(option: number) {
    setPicked(option);
    if (option === questionData.answer) onCorrect?.();
    else onWrong?.(String(option));
  }

  function checkCreatedPattern() {
    const expected = questionData.expectedSequence ?? [];
    const correct =
      builtTerms.length === expected.length &&
      builtTerms.every((value, index) => value === expected[index]);
    if (correct) onCorrect?.();
    else onWrong?.(builtTerms.join(", "));
  }

  function renderTerm(value: number, compact = false) {
    if (questionData.representation === "numbers") {
      return <span className={compact ? "text-xl font-black" : "text-3xl font-black"}>{value}</span>;
    }

    const Icon = questionData.representation === "objects" ? Box : Diamond;
    return (
      <span className="flex max-w-40 flex-wrap justify-center gap-1" aria-label={`${value} ${questionData.representation}`}>
        {Array.from({ length: value }).map((_, index) => (
          <Icon key={index} className={compact ? "h-4 w-4 text-teal-700" : "h-5 w-5 text-teal-700"} aria-hidden="true" />
        ))}
      </span>
    );
  }

  if (questionData.mode === "create") {
    const expectedLength = questionData.expectedSequence?.length ?? 3;
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">Pattern Creator</div>
            <h2 className="mt-2 text-2xl font-black text-gray-900">{questionData.prompt}</h2>
          </div>
          <ReadAloudBtn text={questionData.prompt} />
        </div>

        <div className="mt-5 rounded-lg border border-teal-100 bg-teal-50 p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-teal-700">Your pattern</div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            <div className="flex min-h-24 items-center justify-center rounded-lg border border-teal-300 bg-white p-2">
              {renderTerm(questionData.sequence[0] ?? 0)}
            </div>
            {Array.from({ length: expectedLength }).map((_, index) => (
              <div
                key={index}
                className="flex min-h-24 items-center justify-center rounded-lg border-2 border-dashed border-teal-300 bg-white/70 p-2"
              >
                {typeof builtTerms[index] === "number" ? renderTerm(builtTerms[index]!) : <span className="text-2xl font-black text-teal-300">?</span>}
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setBuiltTerms((current) => current.slice(0, -1))}
              disabled={builtTerms.length === 0}
              className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40"
              title="Undo last term"
              aria-label="Undo last term"
            >
              <Undo2 className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setBuiltTerms([])}
              disabled={builtTerms.length === 0}
              className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40"
              title="Clear pattern"
              aria-label="Clear pattern"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-5">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-600">Term palette</div>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {questionData.options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setBuiltTerms((current) => current.length < expectedLength ? [...current, option] : current)}
                className="flex min-h-16 items-center justify-center rounded-lg border border-slate-200 bg-white p-3 text-slate-900 shadow-sm transition hover:border-teal-400 hover:bg-teal-50"
                aria-label={`Add term ${option}`}
              >
                {renderTerm(option, true)}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={checkCreatedPattern}
          disabled={builtTerms.length !== expectedLength}
          className="mt-5 w-full rounded-lg bg-teal-700 px-5 py-3 font-black text-white transition hover:bg-teal-800 disabled:opacity-40"
        >
          Check pattern
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
          Skip Count
        </div>
        <div className="flex items-center gap-2 mt-2">
          <h2 className="text-2xl font-black text-gray-900">{questionData.prompt}</h2>
          <ReadAloudBtn text={questionData.prompt} />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50 p-4">
        <div className="text-xs font-bold uppercase tracking-wide text-teal-700">
          Sequence
        </div>
        <div className="mt-2 flex flex-wrap gap-3">
          {questionData.sequence.map((value, idx) => (
            <div
              key={`${value}-${idx}`}
              className={`rounded-xl px-5 py-3 text-3xl font-black shadow-sm ${
                value === -1
                  ? "border-2 border-dashed border-teal-300 bg-teal-50 text-teal-700"
                  : "bg-white text-teal-900"
              }`}
            >
              {value === -1 ? "?" : value}
            </div>
          ))}
          {!questionData.sequence.includes(-1) && (
            <div className="rounded-xl border-2 border-dashed border-teal-300 px-5 py-3 text-3xl font-black text-teal-700">
              ?
            </div>
          )}
        </div>
        {questionData.visualGroups?.length ? (
          <div className="mt-4">
            <div className="text-xs font-bold uppercase tracking-wide text-teal-700">
              Bundle model
            </div>
            <div className="mt-3 grid gap-2">
              {questionData.visualGroups.map((groupSize, groupIndex) => (
                <div key={`${groupSize}-${groupIndex}`} className="flex flex-wrap gap-2 rounded-xl bg-white p-3 shadow-sm">
                  {Array.from({ length: groupSize }).map((_, itemIndex) => (
                    <div key={`${groupIndex}-${itemIndex}`} className="h-5 w-5 rounded-full bg-emerald-500" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid gap-3">
        {questionData.options.map((option, index) => (
          <button
            key={`${option}-${index}`}
            type="button"
            onClick={() => choose(option)}
            className={[
              "rounded-2xl border px-5 py-4 text-left text-2xl font-black transition",
              picked === option
                ? "border-teal-300 bg-teal-50 text-teal-900"
                : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50",
            ].join(" ")}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
