"use client";

import { useState } from "react";
import { Check, Minus } from "lucide-react";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import DataIcon from "@/components/statistica/DataIcon";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type Task = Extract<PracticeTask, { kind: "statisticaGraph" }>;

// One-to-one displays (objects) and picture graphs. build = fill each column to
// its target count; read/compare = answer a question about the filled display.
export default function StatisticaGraphCard({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: (answer?: string) => void }) {
  const isBuild = task.mode === "build";
  const maxCount = Math.max(1, ...task.categories.map((c) => c.count));
  const rows = maxCount;
  const rowHeight = rows > 12 ? 12 : rows > 8 ? 18 : 26;
  const cellSize = rows > 12 ? 10 : rows > 8 ? 15 : 22;
  const cellGap = rows > 12 ? 2 : rows > 8 ? 3 : 4;
  const [built, setBuilt] = useState<number[]>(() => task.categories.map(() => 0));
  const [chosen, setChosen] = useState<string | null>(null);
  const [settled, setSettled] = useState(false);

  const cellShape = task.display === "pictures" ? "rounded-full" : "rounded-md";

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

      <div className="mx-auto max-w-md rounded-lg border border-[#f2bc45]/45 bg-[#17281f] p-4 shadow-[inset_0_1px_0_rgba(255,240,199,0.12)]">
        <div className="flex items-end justify-center gap-3">
          {/* value axis */}
          <div className="flex flex-col-reverse justify-between pb-8 pr-1 text-[10px] font-black text-[#f2bc45]/70" style={{ height: rows * rowHeight }}>
            {Array.from({ length: rows }, (_, r) => <span key={r} className="leading-none">{r + 1}</span>)}
          </div>
          {task.categories.map((cat, i) => {
            const value = isBuild ? built[i]! : cat.count;
            const matched = isBuild && built[i] === cat.count;
            return (
              <div key={cat.id} className="flex flex-col items-center">
                {isBuild ? <div className={`mb-1 text-xs font-black ${matched ? "text-emerald-300" : "text-amber-300"}`}>aim: {cat.count}</div> : null}
                <div className="relative flex flex-col-reverse" style={{ height: rows * rowHeight, gap: cellGap }}>
                  {Array.from({ length: rows }, (_, r) => {
                    const filled = r < value;
                    if (task.display === "pictures" && filled) {
                      return <div key={r} className="grid place-items-center" style={{ height: cellSize, width: cellSize }}><DataIcon name={cat.label} color={cat.color} size={cellSize} /></div>;
                    }
                    return <div key={r} className={`${cellShape} border`} style={filled ? { height: cellSize, width: cellSize, background: cat.color, borderColor: cat.color } : { height: cellSize, width: cellSize, borderColor: "rgba(242,188,69,0.22)", background: "rgba(255,244,223,0.04)" }} />;
                  })}
                </div>
                <div className="mt-2 flex max-w-[80px] items-center gap-1 text-center text-[11px] font-bold leading-tight text-white/85">
                  <span>{cat.label}</span>
                  <OptionReadAloudButton text={isBuild ? `${cat.label}, target ${cat.count}` : cat.label} />
                </div>
                {isBuild ? (
                  <div className="mt-1 flex gap-1">
                    <button type="button" onClick={() => add(i, -1)} disabled={settled} aria-label={`remove from ${cat.label}`} className="grid h-6 w-6 place-items-center rounded-md border border-white/15 bg-white/5 text-white/70 disabled:opacity-40"><Minus className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={() => add(i, 1)} disabled={settled} aria-label={`add to ${cat.label}`} className="grid h-6 w-9 place-items-center rounded-md border border-[#f2bc45]/55 bg-[#f2bc45]/15 text-sm font-black text-[#fff0c7] disabled:opacity-40">+</button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {isBuild ? (
        <div className="flex justify-center"><SubmitButton disabled={settled} onClick={submitBuild} /></div>
      ) : (
        <>
          <div className="mx-auto grid max-w-md gap-2 sm:grid-cols-2">
            {task.options?.map((option) => (
              <div key={option.id} className="relative">
                <button type="button" onClick={() => !settled && setChosen(option.id)} className={["min-h-14 w-full rounded-lg border-2 p-3 pr-12 text-center text-sm font-black transition", chosen === option.id ? "border-[#f06b64] bg-[#fff0df] text-[#5b2e27] ring-2 ring-[#f2bc45]/55" : "border-[#b9caaa] bg-[#fffaf0] text-[#244531] hover:border-[#f06b64]"].join(" ")}>{option.label}</button>
                <OptionReadAloudButton text={option.label} className="absolute right-2 top-1/2 -translate-y-1/2" />
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
