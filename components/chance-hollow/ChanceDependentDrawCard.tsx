"use client";

import { useMemo, useState } from "react";
import { Hand, RotateCcw, Check } from "lucide-react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type Task = Extract<PracticeTask, { kind: "chanceDependentDraw" }>;

// Year 4 (AC9M4P02): draw a counter, then replace it (chances stay the same —
// independent) or keep it (the bag changes — dependent), and read how the next
// draw is affected. Hands-on: the child taps Draw and watches the bag update.
export default function ChanceDependentDrawCard({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: (answer?: string) => void }) {
  const [drawn, setDrawn] = useState(false);
  const [settled, setSettled] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);

  const drawColour = task.bag.find((group) => group.key === task.drawKey)!;

  // The bag as shown now: after a "keep" draw one of the drawn colour is gone.
  const shownBag = useMemo(
    () => task.bag.map((group) => (drawn && task.action === "keep" && group.key === task.drawKey ? { ...group, count: group.count - 1 } : group)),
    [drawn, task.action, task.bag, task.drawKey],
  );
  const shownTotal = shownBag.reduce((sum, group) => sum + group.count, 0);

  function choose(option: string) {
    if (settled) return;
    setSettled(true);
    setPicked(option);
    if (option === task.answer) onCorrect(); else onWrong(option);
  }

  const counters = shownBag.flatMap((group) => Array.from({ length: group.count }, (_, i) => ({ colour: group.colour, id: `${group.key}-${i}` })));

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <h2 className="text-xl font-extrabold leading-tight text-foreground md:text-2xl">{task.prompt}</h2>
        <ReadAloudBtn text={task.prompt} />
      </div>

      <div className="rounded-xl border border-[#e4d8f5] bg-[#faf7ff] p-4">
        {/* The bag */}
        <div className="mx-auto max-w-sm rounded-b-[3rem] rounded-t-xl border-2 border-[#6d3f9c] bg-white p-4 shadow-inner">
          <div className="mb-2 text-center text-xs font-black uppercase tracking-wide text-[#6d3f9c]">{shownTotal} counters in the bag</div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {counters.map((counter) => (
              <span key={counter.id} className="inline-block h-8 w-8 rounded-full border-2 border-white shadow" style={{ background: counter.colour }} />
            ))}
          </div>
        </div>

        {/* Draw / result */}
        {!drawn ? (
          <div className="mt-4 flex justify-center">
            <button type="button" onClick={() => setDrawn(true)} className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#6d3f9c] px-6 font-black text-white shadow-md transition hover:bg-[#5a3183] active:scale-95">
              <Hand className="h-5 w-5" /> Draw a counter
            </button>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 rounded-lg bg-white p-3 text-center">
            <span className="inline-flex items-center gap-2 font-bold text-[#3a2f52]">
              You drew
              <span className="inline-block h-6 w-6 rounded-full border-2 border-white shadow" style={{ background: drawColour.colour }} />
              {drawColour.name}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#efe7fb] px-3 py-1 text-sm font-black text-[#6d3f9c]">
              {task.action === "replace" ? <><RotateCcw className="h-4 w-4" /> and put it back</> : <><Hand className="h-4 w-4" /> and kept it out</>}
            </span>
          </div>
        )}
      </div>

      {/* Question appears once the draw is done */}
      {drawn ? (
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <p className="font-bold text-[#2b2135]">{task.question}</p>
            <OptionReadAloudButton text={task.question} />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {task.options.map((option) => {
              const isAnswer = option === task.answer;
              const isPicked = option === picked;
              const state = settled && isAnswer ? "border-emerald-400 bg-emerald-50 text-emerald-800" : settled && isPicked ? "border-red-400 bg-red-50 text-red-800" : "border-[#e0d3f2] bg-white text-[#3a2f52] hover:border-[#6d3f9c]";
              return (
                <button key={option} type="button" disabled={settled} onClick={() => choose(option)} className={`flex items-center justify-between gap-3 rounded-lg border-2 px-4 py-3 text-left font-black transition disabled:cursor-default ${state}`}>
                  <span>{option}</span>
                  {settled && isAnswer ? <Check className="h-5 w-5 shrink-0" /> : <OptionReadAloudButton text={option} />}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
