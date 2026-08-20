"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import StatisticaPlot from "@/components/statistica/StatisticaPlot";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type Task = Extract<PracticeTask, { kind: "statisticaShape" }>;

// Statistica Level 4 — describe a distribution (AC9M4ST02): where the data is
// concentrated, its overall shape, and how spread out / variable it is. Two
// data sets are shown side by side for compare / variation questions.
export default function StatisticaShapeCard({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: (answer?: string) => void }) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [settled, setSettled] = useState(false);
  const twoSets = Boolean(task.categoriesB);

  function submit() {
    if (settled || !chosen) return;
    setSettled(true);
    if (task.correctOptionIds.includes(chosen)) onCorrect(); else onWrong(chosen);
  }

  return (
    <div className="space-y-4">
      <TaskHeading prompt={task.prompt} speech={`${task.prompt}. ${task.speakText}`} />

      {twoSets ? (
        <div className="mx-auto flex max-w-2xl flex-col items-stretch gap-3 sm:flex-row">
          <figure className="flex-1">
            <figcaption className="mb-1 text-center text-xs font-black uppercase tracking-[0.12em] text-[#f2bc45]/75">{task.setLabelA ?? "Set A"}</figcaption>
            <StatisticaPlot categories={task.categories} display="columns" labelReadAloud={false} />
          </figure>
          <figure className="flex-1">
            <figcaption className="mb-1 text-center text-xs font-black uppercase tracking-[0.12em] text-[#f2bc45]/75">{task.setLabelB ?? "Set B"}</figcaption>
            <StatisticaPlot categories={task.categoriesB!} display="columns" labelReadAloud={false} />
          </figure>
        </div>
      ) : (
        <StatisticaPlot categories={task.categories} display="columns" />
      )}

      <div className="mx-auto grid max-w-lg gap-2">
        {task.options.map((option) => (
          <div key={option.id} className="relative">
            <button type="button" onClick={() => !settled && setChosen(option.id)} className={["min-h-12 w-full rounded-lg border-2 px-3 py-2 pr-10 text-left text-sm font-bold transition", chosen === option.id ? "border-[#f06b64] bg-[#fff0df] text-[#5b2e27] ring-2 ring-[#f2bc45]/55" : "border-[#b9caaa] bg-[#fffaf0] text-[#244531] hover:border-[#f06b64]"].join(" ")}>{option.label}</button>
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
