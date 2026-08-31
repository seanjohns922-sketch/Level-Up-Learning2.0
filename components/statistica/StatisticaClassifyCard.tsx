"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type Task = Extract<PracticeTask, { kind: "statisticaClassify" }>;

// Classify a data variable as categorical or numerical (Year 3). Shows the
// variable and example responses, then the child picks the data type.
export default function StatisticaClassifyCard({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: (answer?: string) => void }) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [settled, setSettled] = useState(false);

  function submit() {
    if (settled || !chosen) return;
    setSettled(true);
    if (task.correctOptionIds.includes(chosen)) onCorrect(); else onWrong(chosen);
  }

  return (
    <div className={task.supportingDetails?.length ? "space-y-3" : "space-y-4"}>
      <TaskHeading prompt={task.prompt} speech={`${task.prompt}. ${task.speakText}`} />

      <div className={`mx-auto rounded-2xl border border-[#f2bc45]/35 bg-gradient-to-b from-[#1c3226] to-[#101d15] text-center shadow-[inset_0_1px_0_rgba(255,240,199,0.14)] ${task.supportingDetails?.length ? "max-w-2xl p-3" : "max-w-md p-5"}`}>
        <div className="text-[11px] font-black uppercase tracking-[0.14em] text-[#f2bc45]/70">{task.variableLabel ?? "The data we collect"}</div>
        <div className="mt-1 text-lg font-black text-white">{task.variable}</div>
        <div className={`${task.supportingDetails?.length ? "mt-2" : "mt-3"} text-[11px] font-black uppercase tracking-[0.14em] text-[#f2bc45]/70`}>{task.examplesLabel ?? "Example answers"}</div>
        <div className="mt-1 text-sm font-bold text-white/85">{task.examples}</div>
        {task.supportingDetails?.length ? (
          <dl className="mt-3 grid gap-2 text-left sm:grid-cols-2">
            {task.supportingDetails.map((detail) => (
              <div key={detail.label} className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2">
                <dt className="text-[10px] font-black uppercase tracking-[0.12em] text-[#f2bc45]/75">{detail.label}</dt>
                <dd className="mt-1 text-xs font-bold leading-relaxed text-white/85">{detail.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>

      <div className="mx-auto grid max-w-md gap-2" style={{ gridTemplateColumns: `repeat(${task.options.length}, minmax(0,1fr))` }}>
        {task.options.map((option) => (
          <div key={option.id} className="relative">
            <button type="button" onClick={() => !settled && setChosen(option.id)} className={["min-h-12 w-full rounded-lg border-2 px-2 py-2 pr-8 text-center text-sm font-black transition", chosen === option.id ? "border-[#f06b64] bg-[#fff0df] text-[#5b2e27] ring-2 ring-[#f2bc45]/55" : "border-[#b9caaa] bg-[#fffaf0] text-[#244531] hover:border-[#f06b64]"].join(" ")}>{option.label}</button>
            <OptionReadAloudButton text={option.label} className="absolute right-1 top-1/2 -translate-y-1/2 scale-90" />
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button type="button" onClick={submit} disabled={settled || !chosen} className="flex h-12 items-center gap-2 rounded-lg bg-[#c74f4b] px-7 font-black text-white shadow-md transition hover:bg-[#a93f3c] active:scale-95 disabled:opacity-40"><Check className="h-5 w-5" /> Check</button>
      </div>
    </div>
  );
}
