"use client";

import { ArrowRight, BookOpen } from "lucide-react";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type Task = Extract<PracticeTask, { kind: "statisticaConcept" }>;

export default function StatisticaConceptCard({ task, onContinue }: { task: Task; onContinue: () => void }) {
  return (
    <div className="space-y-5">
      <TaskHeading prompt={task.title} speech={`${task.title}. ${task.speakText}`} />

      <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border-2 border-[#b9caaa] bg-[#fffaf0] shadow-md">
        <div className="flex items-start gap-3 border-b border-[#dce5d5] bg-[#edf6e8] px-5 py-4">
          <div className="mt-0.5 rounded-lg bg-[#173b2c] p-2 text-[#f2bc45]">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-[0.14em] text-[#53705e]">Key idea</div>
            <p className="mt-1 text-lg font-black leading-snug text-[#173b2c]">{task.definition}</p>
          </div>
        </div>

        <div className="px-5 py-5 text-center">
          <div className="text-xs font-black uppercase tracking-[0.14em] text-[#6b7f70]">{task.exampleLabel}</div>
          <div className="mt-3 flex flex-wrap justify-center gap-2" aria-label={task.exampleValues.join(", ")}>
            {task.exampleValues.map((value, index) => {
              const highlighted = value === task.highlightValue;
              const secondaryHighlighted = value === task.secondaryHighlightValue;
              return (
                <div key={`${value}-${index}`} className="flex flex-col items-center gap-1">
                  <div
                    className={`grid h-12 w-12 place-items-center rounded-lg border-2 text-lg font-black ${highlighted ? "border-[#c74f4b] bg-[#ffe2d5] text-[#8f302d]" : secondaryHighlighted ? "border-[#138a78] bg-[#dff7ee] text-[#116354]" : "border-[#cad8c1] bg-white text-[#244531]"}`}
                  >
                    {value}
                  </div>
                  {highlighted ? <span className="text-[10px] font-black uppercase text-[#8f302d]">Highest</span> : null}
                  {secondaryHighlighted ? <span className="text-[10px] font-black uppercase text-[#116354]">Lowest</span> : null}
                </div>
              );
            })}
          </div>
          <p className="mx-auto mt-4 max-w-lg text-base font-bold leading-relaxed text-[#355444]">{task.explanation}</p>
        </div>
      </div>

      <div className="flex justify-center">
        <button type="button" onClick={onContinue} className="flex h-12 items-center gap-2 rounded-lg bg-[#c74f4b] px-7 font-black text-white shadow-md transition hover:bg-[#a93f3c] active:scale-95">
          {task.continueLabel}
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
