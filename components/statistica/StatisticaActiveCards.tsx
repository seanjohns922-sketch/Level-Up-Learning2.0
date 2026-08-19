"use client";

import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import DataIcon from "@/components/statistica/DataIcon";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
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

function MiniColumn({ label, color, count, selected = false }: { label: string; color: string; count: number; selected?: boolean }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
      <div className="text-sm font-black text-[#fff0c7]">{count}</div>
      <div className="flex h-40 flex-col-reverse gap-1 rounded-md border border-white/10 bg-black/15 p-2">
        {Array.from({ length: count }, (_, index) => (
          <span key={index} className="h-4 w-8 rounded-full border border-white/15" style={{ backgroundColor: color }} />
        ))}
      </div>
      <div className={`mt-1 max-w-full truncate text-sm font-black ${selected ? "text-[#ff7b72]" : "text-white"}`}>{label}</div>
    </div>
  );
}

export function StatisticaRankCard({ task, onCorrect, onWrong }: { task: RankTask } & ResultProps) {
  const [order, setOrder] = useState<string[]>([]);
  const [settled, setSettled] = useState(false);
  const available = task.categories.filter((category) => !order.includes(category.id));

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
      <div className={panel}>
        <div className="flex items-end justify-center gap-3 sm:gap-6">
          {task.categories.map((category) => <MiniColumn key={category.id} {...category} selected={order.includes(category.id)} />)}
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2" aria-label="Ranked order">
          {task.categories.map((_, index) => {
            const category = task.categories.find((item) => item.id === order[index]);
            return (
              <div key={index} className="relative">
                <button type="button" disabled={!category || settled} onClick={() => !settled && setOrder((current) => current.filter((__, i) => i !== index))} className="min-h-20 w-full rounded-lg border-2 border-dashed border-[#f2bc45]/45 bg-[#fffaf0]/5 p-2 pr-11 text-center text-sm font-black text-white disabled:opacity-100">
                  <span className="block text-[10px] uppercase text-[#f2bc45]">{index + 1}</span>
                  {category?.label ?? "Tap a column"}
                </button>
                <OptionReadAloudButton text={`${index + 1}. ${category?.label ?? "Empty position"}`} className="absolute right-1 top-1/2 -translate-y-1/2" />
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {available.map((category) => (
            <div key={category.id} className="relative">
              <button type="button" onClick={() => choose(category.id)} disabled={settled} className="min-h-12 rounded-lg border-2 border-[#b9caaa] bg-[#fffaf0] py-3 pl-4 pr-12 text-sm font-black text-[#244531] hover:border-[#f06b64] disabled:opacity-50">
                {category.label}
              </button>
              <OptionReadAloudButton text={category.label} className="absolute right-1 top-1/2 -translate-y-1/2" />
            </div>
          ))}
        </div>
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
  const [selected, setSelected] = useState<number[]>([]);
  const [settled, setSettled] = useState(false);

  function toggle(index: number) {
    if (settled) return;
    setSelected((current) => current.includes(index) ? current.filter((value) => value !== index) : [...current, index]);
  }

  function submit() {
    if (settled || selected.length === 0) return;
    setSettled(true);
    if (selected.length === task.difference) onCorrect(); else onWrong(String(selected.length));
  }

  return (
    <div className="space-y-4">
      <TaskHeading prompt={task.prompt} speech={`${task.prompt}. ${task.speakText}`} />
      <div className={panel}>
        <div className="mb-4 flex items-center justify-center gap-2">
          <p className="text-center text-sm font-bold text-[#fff0c7]">Tap every extra data mark, then check your count.</p>
          <OptionReadAloudButton text="Tap every extra data mark, then check your count." />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-8">
          {task.categories.map((category) => (
            <div key={category.id} className="flex flex-col items-center">
              <div className="flex h-52 flex-col-reverse gap-1.5 rounded-lg border border-white/10 bg-black/15 p-3">
                {Array.from({ length: category.count }, (_, index) => {
                  const isExtra = category.id === task.largerCategoryId && index >= smaller;
                  const active = isExtra && selected.includes(index);
                  return (
                    <button key={index} type="button" disabled={!isExtra || settled} onClick={() => toggle(index)} aria-label={isExtra ? `extra ${category.label} mark ${index - smaller + 1}` : undefined} className={`grid h-7 w-16 place-items-center rounded-md border transition ${isExtra ? "cursor-pointer border-[#f2bc45]" : "cursor-default border-white/10"} ${active ? "ring-4 ring-[#fff0c7]/70" : ""}`} style={{ backgroundColor: category.color }}>
                      {isExtra ? <span className="h-2 w-2 rounded-full bg-white/90" /> : null}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 flex items-center gap-1 text-sm font-black text-white">{category.label}<OptionReadAloudButton text={category.label} /></div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 text-xl font-black text-[#fff0c7]">
          <span>Extra marks counted: {selected.length}</span>
          <OptionReadAloudButton text={`Extra marks counted: ${selected.length}`} />
        </div>
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

  return (
    <div className="space-y-4">
      <TaskHeading prompt={task.prompt} speech={`${task.prompt}. ${task.speakText}`} />
      <div className={panel}>
        <div className="flex items-end justify-center gap-3 sm:gap-6">
          {task.categories.map((category) => (
            <div key={category.id} className={`relative flex min-w-0 flex-1 rounded-lg border-2 transition ${chosen === category.id ? "border-[#ff7b72] bg-[#fff0c7]/15 ring-2 ring-[#f2bc45]/60" : "border-transparent hover:border-[#f2bc45]/55"}`}>
              <button type="button" disabled={settled} onClick={() => setChosen(category.id)} aria-pressed={chosen === category.id} className="flex min-w-0 flex-1 flex-col items-center p-2">
                <div className="flex h-44 flex-col-reverse gap-1.5">
                  {Array.from({ length: category.count }, (_, index) => task.display === "pictures" ? (
                    <span key={index} className="grid h-7 w-9 place-items-center"><DataIcon name={category.label} color={category.color} size={27} /></span>
                  ) : (
                    <span key={index} className="h-6 w-10 rounded-md border border-white/15" style={{ backgroundColor: category.color }} />
                  ))}
                </div>
                <span className="mt-2 max-w-full truncate pr-8 text-sm font-black text-white">{category.label}</span>
              </button>
              <OptionReadAloudButton text={category.label} className="absolute bottom-1 right-1" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center"><SubmitButton disabled={settled || !chosen} onClick={submit} /></div>
    </div>
  );
}

export function StatisticaTableCard({ task, onCorrect, onWrong }: { task: TableTask } & ResultProps) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [settled, setSettled] = useState(false);

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
            <button type="button" onClick={() => setCount((value) => Math.min(10, value + 1))} disabled={settled} aria-label="increase answer" className="h-12 w-12 rounded-lg border-2 border-[#f2bc45]/50 bg-white/5 text-2xl font-black text-white">+</button>
            <OptionReadAloudButton text={`Current answer: ${count}`} />
          </div>
        ) : null}
      </div>
      <div className="flex justify-center"><SubmitButton disabled={settled || (task.mode === "select" && !chosen)} onClick={submit} /></div>
    </div>
  );
}
