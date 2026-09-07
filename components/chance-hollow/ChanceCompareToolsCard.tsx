"use client";

import { useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import ChanceVisual from "@/components/chance-hollow/ChanceVisual";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type Task = Extract<PracticeTask, { kind: "chanceCompare" }>;

// Two or three chance tools shown side by side to compare, then a graded choice.
export default function ChanceCompareToolsCard({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: (answer?: string) => void }) {
  const [settled, setSettled] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);

  function choose(option: string) {
    if (settled) return;
    setSettled(true);
    setPicked(option);
    if (option === task.answer) onCorrect(); else onWrong(option);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <h2 className="text-xl font-extrabold leading-tight text-foreground md:text-2xl">{task.prompt}</h2>
        <ReadAloudBtn text={task.prompt} />
      </div>

      {/* Tools side by side */}
      <div className="flex flex-wrap items-start justify-center gap-4 rounded-xl border border-[#e4d8f5] bg-[#faf7ff] p-4">
        {task.tools.map((tool, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="rounded-full bg-[#6d3f9c] px-3 py-1 text-xs font-black uppercase tracking-wide text-white">{tool.label}</span>
            <ChanceVisual visual={tool.visual} />
            {tool.caption ? <span className="text-sm font-bold text-[#3a2f52]">{tool.caption}</span> : null}
          </div>
        ))}
      </div>

      {/* Options */}
      <div className="grid gap-2 sm:grid-cols-2">
        {task.options.map((option) => {
          const isAnswer = option === task.answer;
          const isPicked = option === picked;
          const state = settled && isAnswer ? "border-emerald-400 bg-emerald-50 text-emerald-800" : settled && isPicked ? "border-red-400 bg-red-50 text-red-800" : "border-[#e0d3f2] bg-white text-[#3a2f52] hover:border-[#6d3f9c]";
          return (
            <button key={option} type="button" disabled={settled} onClick={() => choose(option)} className={`flex items-center justify-between gap-3 rounded-lg border-2 px-4 py-3 text-left font-black transition disabled:cursor-default ${state}`}>
              <span>{option}</span>
              <OptionReadAloudButton text={option} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
