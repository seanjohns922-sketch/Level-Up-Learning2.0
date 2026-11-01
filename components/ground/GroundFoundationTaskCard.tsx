"use client";

import { Check, Plus, RotateCcw, Volume2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { speak } from "@/lib/speak";
import GroundDragPiece from "./GroundDragPiece";
import GroundObjectToken from "@/components/ground/GroundObjectToken";

type GroundFoundationTask = Extract<PracticeTask, { kind: "groundFoundation" }>;
type ObjectName = Extract<GroundFoundationTask, { mode: "add_to" }> ["object"];

function Token({ object, muted = false, newlyAdded = false }: { object: ObjectName; muted?: boolean; newlyAdded?: boolean }) {
  return <GroundObjectToken objectType={object} size="lg" muted={muted} newlyAdded={newlyAdded} />;
}

function PatternToken({ token }: { token: string }) {
  return <GroundObjectToken objectType={token} size="lg" />;
}

function Frame({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">{children}</div>;
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
    <div className="mx-auto w-full max-w-4xl rounded-lg border border-slate-200 bg-white p-5 text-slate-950 shadow-[0_12px_32px_rgba(15,23,42,0.10)]">
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
            <div className="grid gap-4 sm:grid-cols-[1fr_136px]">
              <div data-ground-drop="cart" className="flex min-h-36 flex-wrap content-center items-center justify-center gap-3 rounded-2xl border-b-[10px] border-[#7a4f27] bg-gradient-to-b from-[#fbe7c6] to-[#e6c28f] p-4">
                {Array.from({ length: task.start }, (_, index) => <Token key={`start-${index}`} object={task.object} />)}
                {Array.from({ length: count }, (_, index) => <Token key={`added-${index}`} object={task.object} newlyAdded={index === count - 1} />)}
              </div>
              <div className="flex min-h-36 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-cyan-300 bg-cyan-50/60 p-3">
                <GroundDragPiece label={`Drag one more ${task.object.slice(0, -1)} on`} onPlace={(target) => { if (target === "cart" || target === null) setCount((value) => Math.min(value + 1, task.change + 2)); }} className="flex flex-col items-center gap-1 rounded-xl p-2">
                  <GroundObjectToken objectType={task.object} size="lg" />
                  <span className="text-base font-black text-teal-900">Drag me on</span>
                </GroundDragPiece>
              </div>
            </div>
          </Frame>
        ) : null}

        {task.mode === "take_away" ? (
          <Frame>
            <div data-ground-drop="away" className="mb-3 grid min-h-16 place-items-center rounded-2xl border-4 border-dashed border-amber-500 bg-amber-50 text-lg font-black text-amber-900">Drag them away to here</div>
            <div className="flex min-h-36 flex-wrap content-center items-center justify-center gap-3 rounded-2xl border-b-[10px] border-[#7a4f27] bg-gradient-to-b from-[#fbe7c6] to-[#e6c28f] p-4">
              {Array.from({ length: task.total }, (_, index) => (
                removed.includes(index)
                  ? <button key={index} type="button" aria-label="Put it back" onClick={() => setRemoved((values) => values.filter((value) => value !== index))}><Token object={task.object} muted /></button>
                  : <GroundDragPiece key={index} label="Take this one away" onPlace={(target) => { if (target === "away" || target === null) setRemoved((values) => [...values, index]); }}><Token object={task.object} /></GroundDragPiece>
              ))}
            </div>
          </Frame>
        ) : null}

        {task.mode === "equal_share" || task.mode === "equal_group" ? (
          <div className="space-y-4">
            <Frame>
              <div className="flex min-h-24 flex-wrap content-center justify-center gap-2 rounded-lg border border-slate-200 bg-white p-3">
                {Array.from({ length: task.total - assignments.length }, (_, index) => <GroundDragPiece key={index} label="Drag this crystal to a group" onPlace={(target) => { if (target === null) return; const group = Number(target); setAssignments((values) => { const next = [...values, group]; if (task.mode === "equal_group" && next.filter((value) => value === boxCount - 1).length >= task.groupSize) setBoxCount((value) => Math.min(value + 1, Math.ceil(task.total / task.groupSize))); return next; }); }}><GroundObjectToken objectType="crystals" size="lg" /></GroundDragPiece>)}
              </div>
            </Frame>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: task.mode === "equal_share" ? task.groups : boxCount }, (_, group) => (
                <button key={group} type="button" data-ground-drop={group} disabled={!canAssign} onClick={() => setAssignments((values) => [...values, group])} className="min-h-40 rounded-xl border-2 border-cyan-500 bg-white p-3 disabled:opacity-60">
                  <span className="text-sm font-bold text-slate-600">Group {group + 1}</span>
                  <span className="mt-3 flex flex-wrap justify-center gap-2">
                    {assignments.filter((value) => value === group).map((_, index) => <GroundObjectToken key={index} objectType="crystals" size="md" />)}
                  </span>
                </button>
              ))}
            </div>
            {task.mode === "equal_group" && assignments.length < task.total ? (
              <button type="button" onClick={() => setBoxCount((value) => Math.min(value + 1, task.total))} className="inline-flex h-14 items-center gap-2 rounded-xl px-5 text-lg border-2 border-cyan-700 bg-white px-4 font-bold text-cyan-900">
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
              <div data-ground-drop="next-bead" style={{ backgroundImage: "linear-gradient(transparent 48%,#a16207 48%,#a16207 52%,transparent 52%)" }} className="flex min-h-20 flex-wrap items-center justify-center gap-3 rounded-2xl">
                {task.sequence.map((token, index) => token === "?"
                  ? <span key={index} className="grid h-16 w-16 place-items-center rounded-full border-4 border-dashed border-amber-500 bg-amber-50 text-2xl font-black">{selectedPattern ? <PatternToken token={selectedPattern} /> : "?"}</span>
                  : <PatternToken key={index} token={token} />)}
              </div>
            </Frame>
            <div className="flex justify-center gap-3">
              {task.options.map((token) => (
                <GroundDragPiece key={token} label={`Choose ${token}`} onPlace={(target) => { if (target === "next-bead" || target === null) setSelectedPattern(token); }} className={`rounded-xl p-1 ${selectedPattern === token ? "outline outline-4 outline-cyan-600" : ""}`}>
                  <PatternToken token={token} />
                </GroundDragPiece>
              ))}
            </div>
          </div>
        ) : null}

        {task.mode === "create_pattern" ? (
          <div className="space-y-5">
            <Frame>
              <div data-ground-drop="necklace" style={{ backgroundImage: "linear-gradient(transparent 48%,#a16207 48%,#a16207 52%,transparent 52%)" }} className="flex min-h-20 flex-wrap items-center justify-center gap-3 rounded-2xl">
                {expectedPattern.map((_, index) => builtPattern[index]
                  ? <PatternToken key={index} token={builtPattern[index]!} />
                  : <span key={index} className="h-16 w-16 rounded-lg border-2 border-dashed border-slate-400" />)}
              </div>
            </Frame>
            <div className="flex justify-center gap-3">
              {[...new Set(task.repeatUnit)].map((token) => (
                <GroundDragPiece key={token} label={`Add ${token}`} disabled={builtPattern.length >= expectedPattern.length} onPlace={(target) => { if (target === "necklace" || target === null) setBuiltPattern((values) => [...values, token]); }}>
                  <PatternToken token={token} />
                </GroundDragPiece>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button type="button" onClick={reset} className="grid h-16 w-16 place-items-center rounded-lg border-2 border-slate-300 bg-white" aria-label="Reset">
          <RotateCcw className="h-5 w-5" />
        </button>
        <button type="button" onClick={check} className="inline-flex h-16 items-center gap-2 rounded-xl bg-emerald-700 px-12 text-xl font-extrabold text-white">
          <Check className="h-6 w-6" /> Check
        </button>
      </div>
    </div>
  );
}
