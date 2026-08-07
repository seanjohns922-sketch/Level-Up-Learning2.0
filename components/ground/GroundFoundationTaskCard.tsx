"use client";

import { Bot, Check, Gem, Plus, RotateCcw, Star, Volume2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { speak } from "@/lib/speak";

type GroundFoundationTask = Extract<PracticeTask, { kind: "groundFoundation" }>;
type ObjectName = Extract<GroundFoundationTask, { mode: "add_to" }> ["object"];

const PATTERN_STYLES: Record<string, string> = {
  star: "bg-amber-300 text-amber-950 border-amber-500",
  crystal: "bg-cyan-300 text-cyan-950 border-cyan-500",
  robot: "bg-rose-300 text-rose-950 border-rose-500",
};

function ObjectIcon({ object, className = "h-7 w-7" }: { object: ObjectName; className?: string }) {
  if (object === "robots") return <Bot className={className} />;
  if (object === "stars") return <Star className={className} />;
  return <Gem className={className} />;
}

function Token({ object, muted = false }: { object: ObjectName; muted?: boolean }) {
  return (
    <span className={`grid h-12 w-12 place-items-center rounded-lg border-2 ${muted ? "border-slate-300 bg-slate-100 text-slate-400" : "border-cyan-500 bg-cyan-100 text-cyan-900"}`}>
      <ObjectIcon object={object} />
    </span>
  );
}

function PatternToken({ token }: { token: string }) {
  const Icon = token === "star" ? Star : token === "robot" ? Bot : Gem;
  return (
    <span className={`grid h-14 w-14 place-items-center rounded-lg border-2 ${PATTERN_STYLES[token] ?? PATTERN_STYLES.crystal}`}>
      <Icon className="h-7 w-7" />
    </span>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border-2 border-slate-200 bg-white p-4 shadow-sm">{children}</div>;
}

export default function GroundFoundationTaskCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: GroundFoundationTask;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [count, setCount] = useState(0);
  const [removed, setRemoved] = useState<number[]>([]);
  const [assignments, setAssignments] = useState<number[]>([]);
  const [boxCount, setBoxCount] = useState(1);
  const [selectedPatternUnit, setSelectedPatternUnit] = useState<string[] | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [builtPattern, setBuiltPattern] = useState<string[]>([]);

  const expectedPattern = useMemo(
    () => task.mode === "create_pattern" ? Array.from({ length: task.repeats }, () => task.repeatUnit).flat() : [],
    [task],
  );

  function reset() {
    setCount(0);
    setRemoved([]);
    setAssignments([]);
    setBoxCount(1);
    setSelectedPatternUnit(null);
    setSelectedPattern(null);
    setBuiltPattern([]);
  }

  function check() {
    if (task.mode === "add_to") return count === task.change ? onCorrect?.() : onWrong?.();
    if (task.mode === "take_away") return removed.length === task.change ? onCorrect?.() : onWrong?.();
    if (task.mode === "equal_share") {
      const totals = Array.from({ length: task.groups }, (_, group) => assignments.filter((value) => value === group).length);
      return assignments.length === task.total && new Set(totals).size === 1 ? onCorrect?.() : onWrong?.();
    }
    if (task.mode === "equal_group") {
      const totals = Array.from({ length: boxCount }, (_, group) => assignments.filter((value) => value === group).length);
      return assignments.length === task.total && totals.every((value) => value === task.groupSize) ? onCorrect?.() : onWrong?.();
    }
    if (task.mode === "identify_pattern") {
      return selectedPatternUnit?.join("|") === task.answer.join("|") ? onCorrect?.() : onWrong?.();
    }
    if (task.mode === "continue_pattern") return selectedPattern === task.answer ? onCorrect?.() : onWrong?.();
    return builtPattern.length === expectedPattern.length && builtPattern.every((token, index) => token === expectedPattern[index])
      ? onCorrect?.()
      : onWrong?.();
  }

  const canAssign = (task.mode === "equal_share" || task.mode === "equal_group") && assignments.length < task.total;

  return (
    <div className="mx-auto w-full max-w-4xl rounded-lg border border-slate-300 bg-slate-50 p-5 text-slate-950 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-2xl font-extrabold leading-tight">{task.prompt}</h2>
        {task.speakText ? (
          <button type="button" onClick={() => speak(task.speakText!)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-300 bg-white" aria-label="Read question">
            <Volume2 className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <div className="mt-5">
        {task.mode === "add_to" ? (
          <Frame>
            <div className="flex min-h-28 flex-wrap items-center justify-center gap-3">
              {Array.from({ length: task.start }, (_, index) => <Token key={`start-${index}`} object={task.object} />)}
              {Array.from({ length: count }, (_, index) => <Token key={`added-${index}`} object={task.object} />)}
            </div>
            <div className="mt-4 flex justify-center">
              <button type="button" onClick={() => setCount((value) => Math.min(value + 1, task.change + 2))} className="inline-flex h-12 items-center gap-2 rounded-lg bg-cyan-700 px-5 font-bold text-white">
                <Plus className="h-5 w-5" /> Add one
              </button>
            </div>
          </Frame>
        ) : null}

        {task.mode === "take_away" ? (
          <Frame>
            <div className="flex min-h-28 flex-wrap items-center justify-center gap-3">
              {Array.from({ length: task.total }, (_, index) => (
                <button key={index} type="button" onClick={() => setRemoved((values) => values.includes(index) ? values.filter((value) => value !== index) : [...values, index])} aria-label={`${removed.includes(index) ? "Restore" : "Remove"} ${task.object.slice(0, -1)} ${index + 1}`}>
                  <Token object={task.object} muted={removed.includes(index)} />
                </button>
              ))}
            </div>
          </Frame>
        ) : null}

        {task.mode === "equal_share" || task.mode === "equal_group" ? (
          <div className="space-y-4">
            <Frame>
              <div className="flex min-h-16 flex-wrap justify-center gap-2">
                {Array.from({ length: task.total - assignments.length }, (_, index) => <Token key={index} object="crystals" />)}
              </div>
            </Frame>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: task.mode === "equal_share" ? task.groups : boxCount }, (_, group) => (
                <button key={group} type="button" disabled={!canAssign} onClick={() => setAssignments((values) => [...values, group])} className="min-h-32 rounded-lg border-2 border-cyan-500 bg-white p-3 disabled:opacity-60">
                  <span className="text-sm font-bold text-slate-600">Group {group + 1}</span>
                  <span className="mt-3 flex flex-wrap justify-center gap-1">
                    {assignments.filter((value) => value === group).map((_, index) => <Gem key={index} className="h-7 w-7 text-cyan-700" />)}
                  </span>
                </button>
              ))}
            </div>
            {task.mode === "equal_group" && assignments.length < task.total ? (
              <button type="button" onClick={() => setBoxCount((value) => Math.min(value + 1, task.total))} className="inline-flex h-11 items-center gap-2 rounded-lg border-2 border-cyan-700 bg-white px-4 font-bold text-cyan-900">
                <Plus className="h-5 w-5" /> New group
              </button>
            ) : null}
          </div>
        ) : null}

        {task.mode === "identify_pattern" ? (
          <div className="space-y-5">
            <Frame>
              <div className="flex min-h-20 flex-wrap items-center justify-center gap-3">
                {task.sequence.map((token, index) => <PatternToken key={index} token={token} />)}
              </div>
            </Frame>
            <div className="grid gap-3 sm:grid-cols-3">
              {task.options.map((option) => {
                const optionKey = option.join("|");
                const selected = selectedPatternUnit?.join("|") === optionKey;
                return (
                  <button
                    key={optionKey}
                    type="button"
                    onClick={() => setSelectedPatternUnit(option)}
                    className={`flex min-h-20 items-center justify-center gap-2 rounded-lg border-2 bg-white p-3 ${selected ? "border-cyan-600 outline outline-2 outline-cyan-200" : "border-slate-300"}`}
                    aria-label={`Choose ${option.join(" then ")}`}
                  >
                    {option.map((token, index) => <PatternToken key={`${token}-${index}`} token={token} />)}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {task.mode === "continue_pattern" ? (
          <div className="space-y-5">
            <Frame>
              <div className="flex min-h-20 flex-wrap items-center justify-center gap-3">
                {task.sequence.map((token, index) => token === "?"
                  ? <span key={index} className="grid h-14 w-14 place-items-center rounded-lg border-2 border-dashed border-slate-400 text-2xl font-black">?</span>
                  : <PatternToken key={index} token={token} />)}
              </div>
            </Frame>
            <div className="flex justify-center gap-3">
              {task.options.map((token) => (
                <button key={token} type="button" onClick={() => setSelectedPattern(token)} className={`rounded-lg p-1 ${selectedPattern === token ? "outline outline-4 outline-cyan-600" : ""}`} aria-label={`Choose ${token}`}>
                  <PatternToken token={token} />
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {task.mode === "create_pattern" ? (
          <div className="space-y-5">
            <Frame>
              <div className="flex min-h-20 flex-wrap items-center justify-center gap-3">
                {expectedPattern.map((_, index) => builtPattern[index]
                  ? <PatternToken key={index} token={builtPattern[index]!} />
                  : <span key={index} className="h-14 w-14 rounded-lg border-2 border-dashed border-slate-400" />)}
              </div>
            </Frame>
            <div className="flex justify-center gap-3">
              {[...new Set(task.repeatUnit)].map((token) => (
                <button key={token} type="button" disabled={builtPattern.length >= expectedPattern.length} onClick={() => setBuiltPattern((values) => [...values, token])} className="rounded-lg p-1 disabled:opacity-50" aria-label={`Place ${token}`}>
                  <PatternToken token={token} />
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex justify-between gap-3">
        <button type="button" onClick={reset} className="grid h-12 w-12 place-items-center rounded-lg border-2 border-slate-300 bg-white" aria-label="Reset">
          <RotateCcw className="h-5 w-5" />
        </button>
        <button type="button" onClick={check} className="inline-flex h-12 items-center gap-2 rounded-lg bg-emerald-700 px-6 font-extrabold text-white">
          <Check className="h-5 w-5" /> Check
        </button>
      </div>
    </div>
  );
}
