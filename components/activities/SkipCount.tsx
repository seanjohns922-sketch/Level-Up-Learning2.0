"use client";

import { useState } from "react";
import { Box, Diamond, GitBranch, Play, RotateCcw, Undo2, Workflow } from "lucide-react";
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
  const [builtInstructions, setBuiltInstructions] = useState<string[]>([]);
  const [algorithmOutputCorrect, setAlgorithmOutputCorrect] = useState(false);
  const [pickedPattern, setPickedPattern] = useState<string | null>(null);

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

  function checkCreatedAlgorithm() {
    const expected = questionData.expectedInstructions ?? [];
    const correct =
      builtInstructions.length === expected.length &&
      builtInstructions.every((instruction, index) => instruction === expected[index]);
    if (correct) onCorrect?.();
    else onWrong?.(builtInstructions.join(" -> "));
  }

  function chooseAlgorithmOutput(option: number) {
    setPicked(option);
    if (option === questionData.answer) {
      setAlgorithmOutputCorrect(true);
      return;
    }
    onWrong?.(String(option));
  }

  function checkAlgorithmPattern() {
    if (!pickedPattern) return;
    if (pickedPattern === questionData.patternDescription) onCorrect?.();
    else onWrong?.(pickedPattern);
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

  if (questionData.mode === "algorithm_create") {
    const expectedLength = questionData.expectedInstructions?.length ?? 3;
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-indigo-700">
              <Workflow className="h-4 w-4" aria-hidden="true" /> Algorithm Builder
            </div>
            <h2 className="mt-2 text-2xl font-black text-gray-900">{questionData.prompt}</h2>
          </div>
          <ReadAloudBtn text={questionData.prompt} />
        </div>

        <div className="mt-5 rounded-lg border border-indigo-100 bg-indigo-50 p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-indigo-700">Your instructions</div>
          <div className="mt-3 grid gap-2">
            {Array.from({ length: expectedLength }).map((_, index) => (
              <div key={index} className="flex min-h-16 items-center gap-3 rounded-lg border border-indigo-200 bg-white px-3 py-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo-100 text-sm font-black text-indigo-700">{index + 1}</span>
                <span className="font-bold text-slate-800">{builtInstructions[index] ?? "Choose an instruction"}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setBuiltInstructions((current) => current.slice(0, -1))}
              disabled={builtInstructions.length === 0}
              className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40"
              title="Undo last instruction"
              aria-label="Undo last instruction"
            >
              <Undo2 className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setBuiltInstructions([])}
              disabled={builtInstructions.length === 0}
              className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40"
              title="Clear algorithm"
              aria-label="Clear algorithm"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-2">
          {questionData.instructionOptions?.map((instruction) => {
            const alreadyUsed = builtInstructions.includes(instruction);
            return (
              <div key={instruction} className="flex min-h-14 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setBuiltInstructions((current) => current.length < expectedLength && !current.includes(instruction) ? [...current, instruction] : current)}
                  disabled={alreadyUsed}
                  className="min-w-0 flex-1 px-4 py-3 text-left font-bold text-slate-900 transition hover:bg-indigo-50 disabled:opacity-40"
                >
                  {instruction}
                </button>
                <div className="grid w-14 place-items-center border-l border-slate-200">
                  <ReadAloudBtn text={instruction} />
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={checkCreatedAlgorithm}
          disabled={builtInstructions.length !== expectedLength}
          className="mt-5 w-full rounded-lg bg-indigo-700 px-5 py-3 font-black text-white transition hover:bg-indigo-800 disabled:opacity-40"
        >
          Test algorithm
        </button>
      </div>
    );
  }

  if (questionData.mode === "algorithm_follow" || questionData.mode === "algorithm_decision") {
    const isDecision = questionData.mode === "algorithm_decision";
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-indigo-700">
              {isDecision ? <GitBranch className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
              {isDecision ? "Decision Algorithm" : "Run the Algorithm"}
            </div>
            <h2 className="mt-2 text-2xl font-black text-gray-900">{questionData.prompt}</h2>
          </div>
          <ReadAloudBtn text={questionData.prompt} />
        </div>

        <div className="mt-5 rounded-lg border border-indigo-100 bg-indigo-50 p-4">
          <div className="text-sm font-black text-indigo-950">Start: {questionData.algorithmStart}</div>
          <div className="mt-3 grid gap-2">
            {questionData.algorithmSteps?.map((step, index) => (
              <div key={`${step}-${index}`} className="flex min-h-14 items-center gap-3 rounded-lg border border-indigo-100 bg-white px-3 py-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo-100 text-sm font-black text-indigo-700">{index + 1}</span>
                <span className="min-w-0 flex-1 font-bold text-slate-800">{step}</span>
                <ReadAloudBtn text={step} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {questionData.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => chooseAlgorithmOutput(option)}
              className={`min-h-16 rounded-lg border px-4 py-3 text-2xl font-black transition ${picked === option ? "border-indigo-500 bg-indigo-50 text-indigo-900" : "border-slate-200 bg-white text-slate-900 hover:border-indigo-300"}`}
            >
              {option}
            </button>
          ))}
        </div>

        {algorithmOutputCorrect ? (
          <div className="mt-5 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
            <div className="text-sm font-black text-emerald-950">Which statement describes the pattern?</div>
            <div className="mt-3 grid gap-2">
              {questionData.patternOptions?.map((option) => (
                <div key={option} className={`flex min-h-14 overflow-hidden rounded-lg border bg-white ${pickedPattern === option ? "border-emerald-500" : "border-slate-200"}`}>
                  <button
                    type="button"
                    onClick={() => setPickedPattern(option)}
                    className="min-w-0 flex-1 px-4 py-3 text-left font-bold text-slate-900"
                  >
                    {option}
                  </button>
                  <div className="grid w-14 place-items-center border-l border-slate-200">
                    <ReadAloudBtn text={option} />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={checkAlgorithmPattern}
              disabled={!pickedPattern}
              className="mt-4 w-full rounded-lg bg-emerald-700 px-5 py-3 font-black text-white disabled:opacity-40"
            >
              Check pattern
            </button>
          </div>
        ) : null}
      </div>
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
