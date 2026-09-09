"use client";

import { useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import { MathFormattedText } from "@/components/FractionText";
import ChanceVisual from "@/components/chance-hollow/ChanceVisual";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type ChanceQuizTask = Extract<PracticeTask, { kind: "chanceQuizQuestion" }>;

export default function ChanceQuizQuestionCard({ task, onCorrect, onWrong }: {
  task: ChanceQuizTask;
  onCorrect: () => void;
  onWrong: (answer?: string) => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);

  function choose(option: string) {
    setPicked(option);
    if (option === task.answer) onCorrect();
    else onWrong(option);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl font-black leading-tight text-[#2b1730] md:text-2xl">
          <MathFormattedText text={task.prompt} fractionSize="lg" />
        </h2>
        <ReadAloudBtn text={task.speakText} label="Read" className="shrink-0 border-[#b4588d]/35 bg-white text-[#6e315d]" />
      </div>
      {task.visual ? (
        <div className="flex min-h-44 items-center justify-center rounded-lg border border-[#dcb9d2] bg-[#fff8fc] p-4">
          <ChanceVisual visual={task.visual} />
        </div>
      ) : null}
      <div className="grid gap-3">
        {task.options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => choose(option)}
            className={`flex min-h-14 items-center justify-between gap-3 rounded-lg border-2 px-5 py-3 text-left text-lg font-black transition ${option === picked ? "border-[#9e4f86] bg-[#f8e8f3] text-[#542345]" : "border-[#e2cfe0] bg-white text-[#35233b] hover:border-[#b4588d] hover:bg-[#fff8fc]"}`}
          >
            <span><MathFormattedText text={option} fractionSize="lg" /></span>
            <OptionReadAloudButton text={option} />
          </button>
        ))}
      </div>
    </div>
  );
}
