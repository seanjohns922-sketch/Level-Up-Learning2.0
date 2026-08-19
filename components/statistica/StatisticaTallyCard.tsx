"use client";

import { useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type Task = Extract<PracticeTask, { kind: "statisticaTally" }>;

function TallyGroup({ n }: { n: number }) {
  // n is 1..5. Four uprights; the fifth is a diagonal across the bundle.
  return (
    <svg viewBox="0 0 34 34" className="h-9 w-9" aria-hidden="true">
      {Array.from({ length: Math.min(n, 4) }, (_, i) => (
        <line key={i} x1={5 + i * 7} y1={4} x2={5 + i * 7} y2={30} stroke="#f2bc45" strokeWidth={2.4} strokeLinecap="round" />
      ))}
      {n >= 5 ? <line x1={2} y1={30} x2={32} y2={4} stroke="#f06b64" strokeWidth={2.6} strokeLinecap="round" /> : null}
    </svg>
  );
}

function TallyMarks({ n }: { n: number }) {
  const groups: number[] = [];
  let left = n;
  while (left > 0) { groups.push(Math.min(5, left)); left -= 5; }
  if (groups.length === 0) groups.push(0);
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {groups.map((g, i) => <TallyGroup key={i} n={g} />)}
    </div>
  );
}

export default function StatisticaTallyCard({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: (answer?: string) => void }) {
  const isRecord = task.mode === "record";
  const [built, setBuilt] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [settled, setSettled] = useState(false);

  function submitRecord() {
    if (settled) return;
    setSettled(true);
    if (built === task.count) onCorrect(); else onWrong(String(built));
  }
  function submitRead() {
    if (settled || !chosen) return;
    setSettled(true);
    if ((task.correctOptionIds ?? []).includes(chosen)) onCorrect(); else onWrong(chosen);
  }

  return (
    <div className="space-y-4">
      <TaskHeading prompt={task.prompt} speech={`${task.prompt}. ${task.speakText}`} />

      <div className="mx-auto flex min-h-[96px] max-w-md items-center justify-center rounded-lg border border-[#f2bc45]/45 bg-[#17281f] p-4">
        <TallyMarks n={isRecord ? built : task.count} />
      </div>

      {isRecord ? (
        <>
          <div className="flex items-center justify-center gap-3">
            <button type="button" onClick={() => !settled && setBuilt((v) => Math.max(0, v - 1))} disabled={settled} aria-label="remove a tally" className="grid h-11 w-11 place-items-center rounded-lg border-2 border-[#b9caaa] bg-[#fffaf0] text-[#244531] disabled:opacity-40"><Minus className="h-5 w-5" /></button>
            <div className="min-w-[3ch] text-center font-mono text-2xl font-black text-[#c74f4b] tabular-nums">{built}</div>
            <button type="button" onClick={() => !settled && setBuilt((v) => Math.min(25, v + 1))} disabled={settled} aria-label={`add a tally for ${task.label}`} className="grid h-11 w-14 place-items-center rounded-lg border-2 border-[#f2bc45] bg-[#fff0df] text-[#5b2e27] disabled:opacity-40"><Plus className="h-5 w-5" /></button>
          </div>
          <div className="flex justify-center"><SubmitButton disabled={settled} onClick={submitRecord} /></div>
        </>
      ) : (
        <>
          <div className="mx-auto grid max-w-xs grid-cols-3 gap-2">
            {task.options?.map((option) => (
              <div key={option.id} className="relative">
                <button type="button" onClick={() => !settled && setChosen(option.id)} className={["min-h-14 w-full rounded-lg border-2 p-3 pr-11 text-center text-lg font-black transition", chosen === option.id ? "border-[#f06b64] bg-[#fff0df] text-[#5b2e27] ring-2 ring-[#f2bc45]/55" : "border-[#b9caaa] bg-[#fffaf0] text-[#244531] hover:border-[#f06b64]"].join(" ")}>{option.label}</button>
                <OptionReadAloudButton text={option.label} className="absolute right-1 top-1/2 -translate-y-1/2" />
              </div>
            ))}
          </div>
          <div className="flex justify-center"><SubmitButton disabled={settled || !chosen} onClick={submitRead} /></div>
        </>
      )}
    </div>
  );
}

function SubmitButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} disabled={disabled} className="flex h-12 items-center gap-2 rounded-lg bg-[#c74f4b] px-7 font-black text-white shadow-md transition hover:bg-[#a93f3c] active:scale-95 disabled:opacity-40"><Check className="h-5 w-5" /> Check</button>;
}
