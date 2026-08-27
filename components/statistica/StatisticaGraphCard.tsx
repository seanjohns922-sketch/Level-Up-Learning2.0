"use client";

import { useState } from "react";
import { Check, Minus } from "lucide-react";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import StatisticaPlot from "@/components/statistica/StatisticaPlot";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type Task = Extract<PracticeTask, { kind: "statisticaGraph" }>;

// One-to-one displays (objects), picture graphs and column graphs. build = fill
// each column to its target; read/compare/claim = answer about the display.
export default function StatisticaGraphCard({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: (answer?: string) => void }) {
  const isBuild = task.mode === "build";
  const buildStep = task.buildStep ?? 1;
  const rows = Math.max(1, ...task.categories.map((c) => c.count));
  const [built, setBuilt] = useState<number[]>(() => task.categories.map(() => 0));
  const [chosen, setChosen] = useState<string | null>(null);
  const [settled, setSettled] = useState(false);

  function add(i: number, delta: number) {
    if (settled) return;
    setBuilt((b) => b.map((v, j) => (j === i ? Math.max(0, Math.min(rows, v + delta)) : v)));
  }
  function submitBuild() {
    if (settled) return;
    setSettled(true);
    const ok = task.categories.every((c, i) => built[i] === c.count);
    if (ok) onCorrect(); else onWrong(built.join(","));
  }
  function submitOption() {
    if (settled || !chosen) return;
    setSettled(true);
    if ((task.correctOptionIds ?? []).includes(chosen)) onCorrect(); else onWrong(chosen);
  }

  return (
    <div className="space-y-4">
      <TaskHeading prompt={task.prompt} speech={`${task.prompt}. ${task.speakText}`} />

      <StatisticaPlot
        categories={task.categories}
        display={task.display}
        values={isBuild ? built : undefined}
        footer={isBuild ? (cat, i) => (
          <>
            <div className={`mt-1 text-[11px] font-black ${built[i] === cat.count ? "text-emerald-300" : "text-amber-300"}`}>aim {cat.count}</div>
            <div className="mt-1 flex gap-1">
              <button type="button" onClick={() => add(i, -buildStep)} disabled={settled} aria-label={`remove ${buildStep} from ${cat.label}`} className="grid h-7 w-7 place-items-center rounded-md border border-white/15 bg-white/5 text-white/70 transition hover:bg-white/10 disabled:opacity-40"><Minus className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => add(i, buildStep)} disabled={settled} aria-label={`add ${buildStep} to ${cat.label}`} className="grid h-7 w-10 place-items-center rounded-md border border-[#f2bc45]/55 bg-[#f2bc45]/15 text-base font-black text-[#fff0c7] transition hover:bg-[#f2bc45]/25 disabled:opacity-40">{buildStep > 1 ? `+${buildStep}` : "+"}</button>
            </div>
          </>
        ) : undefined}
      />

      {isBuild ? (
        <div className="flex justify-center"><SubmitButton disabled={settled} onClick={submitBuild} /></div>
      ) : (
        <>
          <div className="mx-auto grid max-w-lg gap-2" style={{ gridTemplateColumns: `repeat(${task.options?.length ?? 2}, minmax(0,1fr))` }}>
            {task.options?.map((option) => (
              <div key={option.id} className="relative">
                <button type="button" onClick={() => !settled && setChosen(option.id)} className={["min-h-11 w-full rounded-lg border-2 px-2 py-2 pr-8 text-center text-sm font-black transition", chosen === option.id ? "border-[#f06b64] bg-[#fff0df] text-[#5b2e27] ring-2 ring-[#f2bc45]/55" : "border-[#b9caaa] bg-[#fffaf0] text-[#244531] hover:border-[#f06b64]"].join(" ")}>{option.label}</button>
                <OptionReadAloudButton text={option.label} className="absolute right-1 top-1/2 -translate-y-1/2 scale-90" />
              </div>
            ))}
          </div>
          <div className="flex justify-center"><SubmitButton disabled={settled || !chosen} onClick={submitOption} /></div>
        </>
      )}
    </div>
  );
}

function SubmitButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} disabled={disabled} className="flex h-12 items-center gap-2 rounded-lg bg-[#c74f4b] px-7 font-black text-white shadow-md transition hover:bg-[#a93f3c] active:scale-95 disabled:opacity-40"><Check className="h-5 w-5" /> Check</button>;
}
