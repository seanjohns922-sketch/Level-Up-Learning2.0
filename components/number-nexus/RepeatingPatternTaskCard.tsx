"use client";

import { Check, RotateCcw, Volume2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { PracticeTask, Year1PatternToken } from "@/data/activities/year1/practice-task";
import { speak } from "@/lib/speak";
import { RepeatingPatternStrip, RepeatingPatternToken } from "./RepeatingPatternVisual";

type PatternTask = Extract<PracticeTask, { kind: "repeatingPattern" }>;

function samePattern(left: readonly Year1PatternToken[] | null, right: readonly Year1PatternToken[]): boolean {
  return left?.length === right.length && left.every((token, index) => token === right[index]);
}

export default function RepeatingPatternTaskCard({ task, onCorrect, onWrong }: { task: PatternTask; onCorrect?: () => void; onWrong?: () => void }) {
  const [selectedUnit, setSelectedUnit] = useState<Year1PatternToken[] | null>(null);
  const [built, setBuilt] = useState<Year1PatternToken[]>([]);
  const expected = useMemo(() => {
    if (task.mode === "continue") return task.answer;
    if (task.mode === "create") return Array.from({ length: task.repeats }, () => task.repeatUnit).flat();
    return task.answerUnit;
  }, [task]);
  const palette = task.mode === "identify_unit" ? [] : task.palette;

  function reset(): void {
    setSelectedUnit(null);
    setBuilt([]);
  }

  function check(): void {
    const correct = task.mode === "identify_unit" ? samePattern(selectedUnit, expected) : samePattern(built, expected);
    if (correct) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="mx-auto w-full max-w-4xl rounded-lg border border-cyan-900/20 bg-[#f6fbfc] p-5 text-slate-950 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-2xl font-extrabold leading-tight">{task.prompt}</h2>
        <button type="button" onClick={() => speak(task.speakText)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-300 bg-white" aria-label="Read question" title="Read question">
          <Volume2 className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <div className="mt-5 rounded-lg border-2 border-cyan-800/20 bg-white p-5">
        {task.mode === "create" ? <RepeatingPatternStrip sequence={task.repeatUnit} /> : <RepeatingPatternStrip sequence={task.sequence} />}
      </div>

      {task.mode === "identify_unit" ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {task.unitOptions.map((unit, index) => (
            <button key={`${unit.join("-")}-${index}`} type="button" onClick={() => setSelectedUnit(unit)} className={`min-h-24 rounded-lg border-2 bg-white p-3 transition ${samePattern(selectedUnit, unit) ? "border-cyan-700 shadow-md" : "border-slate-300 hover:border-cyan-500"}`} aria-label={`Choose ${unit.map((token) => token.replace("-", " ")).join(" then ")}`}>
              <RepeatingPatternStrip sequence={unit} compact />
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="mt-5 flex min-h-20 flex-wrap items-center justify-center gap-3 rounded-lg border-2 border-dashed border-slate-400 bg-white p-4">
            {Array.from({ length: expected.length }, (_, index) => built[index]
              ? <RepeatingPatternToken key={index} token={built[index]!} />
              : <span key={index} className="h-14 w-14 rounded-lg border-2 border-dashed border-slate-400" />)}
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {palette.map((token) => (
              <button key={token} type="button" disabled={built.length >= expected.length} onClick={() => setBuilt((current) => [...current, token])} className="rounded-lg p-1 disabled:opacity-40" aria-label={`Place ${token.replace("-", " ")}`}>
                <RepeatingPatternToken token={token} />
              </button>
            ))}
          </div>
        </>
      )}

      <div className="mt-6 flex justify-between gap-3">
        <button type="button" onClick={reset} className="grid h-12 w-12 place-items-center rounded-lg border-2 border-slate-300 bg-white" aria-label="Reset" title="Reset">
          <RotateCcw className="h-5 w-5" aria-hidden />
        </button>
        <button type="button" onClick={check} className="grid h-12 w-12 place-items-center rounded-lg bg-emerald-700 text-white" aria-label="Check answer" title="Check answer">
          <Check className="h-6 w-6" aria-hidden />
        </button>
      </div>
    </div>
  );
}

