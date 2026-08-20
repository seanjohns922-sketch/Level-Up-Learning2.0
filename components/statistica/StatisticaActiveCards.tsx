"use client";

import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import StatisticaPlot from "@/components/statistica/StatisticaPlot";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type RankTask = Extract<PracticeTask, { kind: "statisticaRank" }>;
type GapTask = Extract<PracticeTask, { kind: "statisticaGap" }>;
type TapGraphTask = Extract<PracticeTask, { kind: "statisticaTapGraph" }>;
type TableTask = Extract<PracticeTask, { kind: "statisticaTable" }>;
type ResultProps = { onCorrect: () => void; onWrong: (answer?: string) => void };

const panel = "mx-auto max-w-2xl rounded-lg border border-[#f2bc45]/45 bg-[#17281f] p-4 shadow-[inset_0_1px_0_rgba(255,240,199,0.12)] sm:p-5";

function SubmitButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="flex h-12 items-center gap-2 rounded-lg bg-[#c74f4b] px-7 font-black text-white shadow-md transition hover:bg-[#a93f3c] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40">
      <Check className="h-5 w-5" /> Check
    </button>
  );
}

export function StatisticaRankCard({ task, onCorrect, onWrong }: { task: RankTask } & ResultProps) {
  const [order, setOrder] = useState<string[]>([]);
  const [settled, setSettled] = useState(false);

  function choose(id: string) {
    if (!settled && !order.includes(id)) setOrder((current) => [...current, id]);
  }
  function submit() {
    if (settled || order.length !== task.categories.length) return;
    setSettled(true);
    if (order.every((id, index) => id === task.correctOrderIds[index])) onCorrect();
    else onWrong(order.join(","));
  }

  return (
    <div className="space-y-4">
      <TaskHeading prompt={task.prompt} speech={`${task.prompt}. ${task.speakText}`} />
      <StatisticaPlot categories={task.categories} display="columns" onColumnClick={choose} selectedIds={order} />
      <div className="mx-auto grid max-w-lg grid-cols-3 gap-2" aria-label="Ranked order">
        {task.categories.map((_, index) => {
          const category = task.categories.find((item) => item.id === order[index]);
          return (
            <div key={index} className="relative">
              <button type="button" disabled={!category || settled} onClick={() => !settled && setOrder((current) => current.filter((__, i) => i !== index))} className="min-h-16 w-full rounded-lg border-2 border-dashed border-[#b9caaa] bg-[#fffaf0] p-2 pr-9 text-center text-sm font-black text-[#244531] disabled:opacity-100">
                <span className="block text-[10px] uppercase text-[#c65b1a]">{index + 1}</span>
                {category?.label ?? "Tap a bar"}
              </button>
              <OptionReadAloudButton text={`${index + 1}. ${category?.label ?? "Empty position"}`} className="absolute right-1 top-1/2 -translate-y-1/2 scale-90" />
            </div>
          );
        })}
      </div>
      <div className="flex justify-center gap-2">
        <button type="button" onClick={() => setOrder([])} disabled={settled || order.length === 0} aria-label="Reset order" className="grid h-12 w-12 place-items-center rounded-lg border-2 border-[#b9caaa] bg-[#fffaf0] text-[#244531] disabled:opacity-40"><RotateCcw className="h-5 w-5" /></button>
        <SubmitButton disabled={settled || order.length !== task.categories.length} onClick={submit} />
      </div>
    </div>
  );
}

export function StatisticaGapCard({ task, onCorrect, onWrong }: { task: GapTask } & ResultProps) {
  const smaller = Math.min(...task.categories.map((category) => category.count));
  const [selected, setSelected] = useState<string[]>([]);
  const [settled, setSettled] = useState(false);

  function toggle(key: string) {
    if (settled) return;
    setSelected((current) => current.includes(key) ? current.filter((v) => v !== key) : [...current, key]);
  }
  function submit() {
    if (settled || selected.length === 0) return;
    setSettled(true);
    if (selected.length === task.difference) onCorrect(); else onWrong(String(selected.length));
  }

  return (
    <div className="space-y-4">
      <TaskHeading prompt={task.prompt} speech={`${task.prompt}. ${task.speakText}`} />
      <StatisticaPlot
        categories={task.categories}
        display="objects"
        cell={(cat, cellIndex, _colIndex, cellSize) => {
          const isExtra = cat.id === task.largerCategoryId && cellIndex >= smaller;
          const key = `${cat.id}:${cellIndex}`;
          const active = isExtra && selected.includes(key);
          return (
            <button key={cellIndex} type="button" disabled={!isExtra || settled} onClick={() => toggle(key)} aria-label={isExtra ? `extra mark ${cellIndex - smaller + 1}` : undefined} className={`grid place-items-center rounded-[3px] border transition ${isExtra ? "cursor-pointer border-[#fff0c7]" : "cursor-default border-white/15"} ${active ? "ring-2 ring-[#fff0c7]" : ""}`} style={{ height: cellSize, width: cellSize, background: cat.color }}>
              {isExtra ? <span className="h-1.5 w-1.5 rounded-full bg-white/95" /> : null}
            </button>
          );
        }}
      />
      <div className="flex items-center justify-center gap-2 text-lg font-black text-[#244531]">
        <span>Extra marks counted: {selected.length}</span>
        <OptionReadAloudButton text={`Extra marks counted: ${selected.length}`} />
      </div>
      <div className="flex justify-center"><SubmitButton disabled={settled || selected.length === 0} onClick={submit} /></div>
    </div>
  );
}

export function StatisticaTapGraphCard({ task, onCorrect, onWrong }: { task: TapGraphTask } & ResultProps) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [settled, setSettled] = useState(false);

  function submit() {
    if (settled || !chosen) return;
    setSettled(true);
    if (chosen === task.correctCategoryId) onCorrect(); else onWrong(chosen);
  }

  const statusById: Record<string, "correct" | "wrong"> = settled
    ? { [task.correctCategoryId]: "correct", ...(chosen && chosen !== task.correctCategoryId ? { [chosen]: "wrong" as const } : {}) }
    : {};

  return (
    <div className="space-y-4">
      <TaskHeading prompt={task.prompt} speech={`${task.prompt}. ${task.speakText}`} />
      <StatisticaPlot
        categories={task.categories}
        display={task.display}
        onColumnClick={(id) => { if (!settled) setChosen(id); }}
        selectedIds={chosen ? [chosen] : []}
        statusById={statusById}
      />
      <div className="flex justify-center"><SubmitButton disabled={settled || !chosen} onClick={submit} /></div>
    </div>
  );
}

export function StatisticaTableCard({ task, onCorrect, onWrong }: { task: TableTask } & ResultProps) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [settled, setSettled] = useState(false);
  const maxCount = Math.max(...task.rows.map((row) => row.count));

  function submit() {
    if (settled) return;
    setSettled(true);
    if (task.mode === "select") {
      if (chosen === task.correctRowId) onCorrect(); else onWrong(chosen ?? "");
    } else if (count === task.answerCount) onCorrect();
    else onWrong(String(count));
  }

  return (
    <div className="space-y-4">
      <TaskHeading prompt={task.prompt} speech={`${task.prompt}. ${task.speakText}`} />
      <div className={panel}>
        <div className="overflow-hidden rounded-lg border border-[#f2bc45]/45">
          <div className="grid grid-cols-[1fr_90px] bg-[#f2bc45]/15 px-4 py-2 text-xs font-black uppercase text-[#fff0c7]"><span>Category</span><span className="text-center">Frequency</span></div>
          {task.rows.map((row) => (
            <div key={row.id} className={`relative border-t border-white/10 transition ${chosen === row.id ? "bg-[#ff7b72]/25 ring-2 ring-inset ring-[#ff7b72]" : "bg-[#fffaf0]/5"} ${task.mode === "select" ? "hover:bg-[#fff0c7]/10" : ""}`}>
              <button type="button" disabled={task.mode !== "select" || settled} onClick={() => setChosen(row.id)} className={`grid w-full grid-cols-[1fr_90px] items-center px-4 py-3 pr-14 text-left ${task.mode !== "select" ? "cursor-default" : ""}`}>
                <span className="flex items-center gap-3 font-black text-white"><span className="h-4 w-4 rounded-sm" style={{ backgroundColor: row.color }} />{row.label}</span>
                <span className="text-center text-xl font-black text-[#fff0c7]">{row.count}</span>
              </button>
              <OptionReadAloudButton text={`${row.label}, ${row.count}`} className="absolute right-2 top-1/2 -translate-y-1/2" />
            </div>
          ))}
        </div>
        {task.mode === "count" ? (
          <div className="mt-4 flex items-center justify-center gap-4">
            <button type="button" onClick={() => setCount((value) => Math.max(0, value - 1))} disabled={settled} aria-label="decrease answer" className="h-12 w-12 rounded-lg border-2 border-[#f2bc45]/50 bg-white/5 text-2xl font-black text-white">−</button>
            <output className="grid h-14 min-w-20 place-items-center rounded-lg bg-[#fffaf0] text-2xl font-black text-[#244531]">{count}</output>
            <button type="button" onClick={() => setCount((value) => Math.min(maxCount, value + 1))} disabled={settled} aria-label="increase answer" className="h-12 w-12 rounded-lg border-2 border-[#f2bc45]/50 bg-white/5 text-2xl font-black text-white">+</button>
            <OptionReadAloudButton text={`Current answer: ${count}`} />
          </div>
        ) : null}
      </div>
      <div className="flex justify-center"><SubmitButton disabled={settled || (task.mode === "select" && !chosen)} onClick={submit} /></div>
    </div>
  );
}
