"use client";

import { useState } from "react";
import { Check, Minus } from "lucide-react";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import DataIcon from "@/components/statistica/DataIcon";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type Task = Extract<PracticeTask, { kind: "statisticaPictograph" }>;

const SIZE = 30;

// A single many-to-one symbol; a half symbol is clipped to its left half so a
// row can show, e.g., "three and a half" stars for a key of 1 = 2.
function Symbol({ label, color, half = false }: { label: string; color: string; half?: boolean }) {
  if (!half) return <DataIcon name={label} color={color} size={SIZE} />;
  return (
    <div className="relative overflow-hidden" style={{ width: SIZE / 2, height: SIZE }} aria-label="half symbol">
      <DataIcon name={label} color={color} size={SIZE} />
    </div>
  );
}

// Render the symbols for one row given a value and the key (units per symbol).
function symbolsFor(value: number, keyUnits: number) {
  const whole = Math.floor(value / keyUnits);
  const remainder = value - whole * keyUnits;
  const half = remainder > 0 && remainder * 2 === keyUnits;
  return { whole, half };
}

// Statistica Level 4 — many-to-one pictographs with a KEY (AC9M4ST01). Each
// symbol stands for keyUnits data points, so children multiply (and read half
// symbols) instead of counting one-to-one.
export default function StatisticaPictographCard({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: (answer?: string) => void }) {
  const isBuild = task.mode === "build";
  const [chosen, setChosen] = useState<string | null>(null);
  const [built, setBuilt] = useState<number[]>(() => task.categories.map(() => 0));
  const [settled, setSettled] = useState(false);

  // Build mode uses whole symbols only; the target is the row's symbol count.
  const targetSymbols = task.categories.map((c) => Math.round(c.count / task.keyUnits));
  const maxSymbols = Math.max(1, ...targetSymbols);

  function step(i: number, delta: number) {
    if (settled) return;
    setBuilt((b) => b.map((v, j) => (j === i ? Math.max(0, Math.min(maxSymbols + 1, v + delta)) : v)));
  }
  function submit() {
    if (settled) return;
    if (isBuild) {
      setSettled(true);
      const ok = task.categories.every((_, i) => built[i] === targetSymbols[i]);
      if (ok) onCorrect(); else onWrong(built.join(","));
      return;
    }
    if (!chosen) return;
    setSettled(true);
    if ((task.correctOptionIds ?? []).includes(chosen)) onCorrect(); else onWrong(chosen);
  }

  return (
    <div className="space-y-4">
      <TaskHeading prompt={task.prompt} speech={`${task.prompt}. ${task.speakText}`} />

      <div className="mx-auto max-w-lg rounded-2xl border border-[#f2bc45]/35 bg-gradient-to-b from-[#1c3226] to-[#101d15] p-4 shadow-[inset_0_1px_0_rgba(255,240,199,0.14),0_12px_32px_rgba(0,0,0,0.32)]">
        {/* Key legend — the heart of a many-to-one display */}
        <div className="mb-3 flex items-center justify-center gap-2 rounded-lg border border-[#f2bc45]/30 bg-[#f2bc45]/10 px-3 py-1.5">
          <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#f2bc45]/80">Key</span>
          <DataIcon name={task.symbolLabel} color="#f2bc45" size={20} />
          <span className="text-sm font-black text-white">= {task.keyUnits} {task.unitNoun}</span>
        </div>

        <div className="space-y-2">
          {task.categories.map((cat, i) => {
            const value = isBuild ? built[i]! * task.keyUnits : cat.count;
            const { whole, half } = symbolsFor(value, task.keyUnits);
            return (
              <div key={cat.id} className="flex items-center gap-2 rounded-lg bg-black/15 px-2 py-1.5">
                <div className="flex w-24 shrink-0 items-center gap-1 text-[12px] font-bold leading-tight text-white/90">
                  <span className="truncate">{cat.label}</span>
                  <OptionReadAloudButton text={cat.label} className="scale-75" />
                </div>
                <div className="flex min-h-[30px] flex-1 flex-wrap items-center gap-1">
                  {Array.from({ length: whole }, (_, s) => <Symbol key={s} label={task.symbolLabel} color={cat.color} />)}
                  {half ? <Symbol label={task.symbolLabel} color={cat.color} half /> : null}
                </div>
                {isBuild ? (
                  <div className="flex shrink-0 items-center gap-1">
                    <span className={`mr-1 w-12 text-right text-[11px] font-black tabular-nums ${built[i]! * task.keyUnits === cat.count ? "text-emerald-300" : "text-amber-300"}`}>aim {cat.count}</span>
                    <button type="button" onClick={() => step(i, -1)} disabled={settled} aria-label={`remove a symbol from ${cat.label}`} className="grid h-8 w-8 place-items-center rounded-md border border-white/15 bg-white/5 text-white/70 transition hover:bg-white/10 disabled:opacity-40"><Minus className="h-4 w-4" /></button>
                    <button type="button" onClick={() => step(i, 1)} disabled={settled} aria-label={`add a symbol to ${cat.label}`} className="grid h-8 w-10 place-items-center rounded-md border border-[#f2bc45]/55 bg-[#f2bc45]/15 text-lg font-black text-[#fff0c7] transition hover:bg-[#f2bc45]/25 disabled:opacity-40">+</button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {isBuild ? (
          <div className="mt-2 text-center text-[11px] font-bold text-[#f2bc45]/70">Each symbol you add is worth {task.keyUnits} {task.unitNoun}.</div>
        ) : null}
      </div>

      {isBuild ? null : (
        <div className="mx-auto grid max-w-md gap-2" style={{ gridTemplateColumns: `repeat(${task.options?.length ?? 3}, minmax(0,1fr))` }}>
          {task.options?.map((option) => (
            <div key={option.id} className="relative">
              <button type="button" onClick={() => !settled && setChosen(option.id)} className={["min-h-12 w-full rounded-lg border-2 px-2 py-2 pr-8 text-center text-sm font-black transition", chosen === option.id ? "border-[#f06b64] bg-[#fff0df] text-[#5b2e27] ring-2 ring-[#f2bc45]/55" : "border-[#b9caaa] bg-[#fffaf0] text-[#244531] hover:border-[#f06b64]"].join(" ")}>{option.label}</button>
              <OptionReadAloudButton text={option.label} className="absolute right-1 top-1/2 -translate-y-1/2 scale-90" />
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center">
        <button type="button" onClick={submit} disabled={settled || (!isBuild && !chosen)} className="flex h-12 items-center gap-2 rounded-lg bg-[#c74f4b] px-7 font-black text-white shadow-md transition hover:bg-[#a93f3c] active:scale-95 disabled:opacity-40"><Check className="h-5 w-5" /> Check</button>
      </div>
    </div>
  );
}
