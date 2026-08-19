"use client";

import { useState } from "react";
import { Check, Minus } from "lucide-react";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import DataIcon from "@/components/statistica/DataIcon";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type Task = Extract<PracticeTask, { kind: "statisticaGraph" }>;

// One-to-one displays (objects) and picture graphs. build = fill each column to
// its target count; read/compare/claim = answer a question about the display.
export default function StatisticaGraphCard({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: (answer?: string) => void }) {
  const isBuild = task.mode === "build";
  const maxCount = Math.max(1, ...task.categories.map((c) => c.count));
  const rows = maxCount;
  // Size cells to fill a target plot height so items are as large as the row
  // count allows — small data gets big icons, 20-tall columns still fit.
  const unit = Math.max(14, Math.min(34, Math.floor(360 / rows)));
  const cellGap = Math.max(2, Math.min(6, Math.round(unit * 0.16)));
  const cellSize = unit - cellGap;
  const plotH = rows * unit;
  const colWidth = cellSize + 22;
  const AXIS = 24;

  // Labelled gridlines at sensible intervals (not one line per unit when tall).
  const step = rows <= 6 ? 1 : rows <= 12 ? 2 : 5;
  const stops: number[] = [];
  for (let v = step; v <= rows; v += step) stops.push(v);
  if (stops[stops.length - 1] !== rows) stops.push(rows);

  const [built, setBuilt] = useState<number[]>(() => task.categories.map(() => 0));
  const [chosen, setChosen] = useState<string | null>(null);
  const [settled, setSettled] = useState(false);

  const cellShape = task.display === "pictures" ? "rounded-full" : "rounded-[3px]";

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

  const cell = (cat: { label: string; color: string }, key: number) =>
    task.display === "pictures" ? (
      <div key={key} className="grid place-items-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]" style={{ height: cellSize, width: cellSize }}>
        <DataIcon name={cat.label} color={cat.color} size={cellSize} />
      </div>
    ) : (
      <div key={key} className={`${cellShape} shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]`} style={{ height: cellSize, width: cellSize, background: cat.color }} />
    );

  return (
    <div className="space-y-4">
      <TaskHeading prompt={task.prompt} speech={`${task.prompt}. ${task.speakText}`} />

      <div className="mx-auto max-w-lg rounded-2xl border border-[#f2bc45]/35 bg-gradient-to-b from-[#1c3226] to-[#101d15] p-4 pt-3 shadow-[inset_0_1px_0_rgba(255,240,199,0.14),0_12px_32px_rgba(0,0,0,0.32)]">
        {/* plot area (axis gutter handled by left:AXIS on the absolute children) */}
        <div className="relative mx-auto" style={{ height: plotH }}>
          {/* labelled gridlines */}
          {stops.map((v) => (
            <div key={v} className="pointer-events-none absolute right-0 flex items-center" style={{ left: AXIS, bottom: v * unit }}>
              <span className="absolute -translate-x-full -translate-y-1/2 pr-1.5 text-right text-[9px] font-black tabular-nums text-[#f2bc45]/60" style={{ left: 0 }}>{v}</span>
              <div className="h-px w-full" style={{ borderTop: "1px dashed rgba(242,188,69,0.16)" }} />
            </div>
          ))}
          {/* baseline shelf */}
          <div className="absolute bottom-0 h-[2px] rounded-full bg-[#f2bc45]/40" style={{ left: AXIS - 4, right: 0 }} />

          {/* columns */}
          <div className="absolute bottom-0 flex items-end justify-around" style={{ left: AXIS, right: 0, height: plotH }}>
            {task.categories.map((cat, i) => {
              const value = isBuild ? built[i]! : cat.count;
              const matched = isBuild && built[i] === cat.count;
              return (
                <div
                  key={cat.id}
                  className="relative flex flex-col-reverse items-center overflow-hidden rounded-t-lg pt-1 transition-shadow"
                  style={{ height: plotH, width: colWidth, gap: cellGap, background: `${cat.color}14`, boxShadow: `inset 0 -3px 0 ${cat.color}${matched ? "" : "66"}` }}
                >
                  {Array.from({ length: value }, (_, r) => cell(cat, r))}
                </div>
              );
            })}
          </div>
        </div>

        {/* category labels sit on the shelf, aligned under each column */}
        <div className="flex justify-around" style={{ paddingLeft: AXIS }}>
          {task.categories.map((cat, i) => (
            <div key={cat.id} className="flex flex-col items-center" style={{ width: colWidth }}>
              {isBuild ? (
                <div className={`mb-1 mt-2 text-[11px] font-black ${built[i] === cat.count ? "text-emerald-300" : "text-amber-300"}`}>aim {cat.count}</div>
              ) : null}
              <div className={`flex items-center gap-1 text-center text-[11px] font-bold leading-tight text-white/90 ${isBuild ? "" : "mt-2"}`}>
                <span className="max-w-[68px]">{cat.label}</span>
                <OptionReadAloudButton text={isBuild ? `${cat.label}, target ${cat.count}` : cat.label} />
              </div>
              {isBuild ? (
                <div className="mt-1.5 flex gap-1">
                  <button type="button" onClick={() => add(i, -1)} disabled={settled} aria-label={`remove from ${cat.label}`} className="grid h-7 w-7 place-items-center rounded-md border border-white/15 bg-white/5 text-white/70 transition hover:bg-white/10 disabled:opacity-40"><Minus className="h-3.5 w-3.5" /></button>
                  <button type="button" onClick={() => add(i, 1)} disabled={settled} aria-label={`add to ${cat.label}`} className="grid h-7 w-10 place-items-center rounded-md border border-[#f2bc45]/55 bg-[#f2bc45]/15 text-base font-black text-[#fff0c7] transition hover:bg-[#f2bc45]/25 disabled:opacity-40">+</button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

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
