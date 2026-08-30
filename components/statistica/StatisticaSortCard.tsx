"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import DataIcon from "@/components/statistica/DataIcon";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type Task = Extract<PracticeTask, { kind: "statisticaSort" }>;

// Sort each item into its category bin: tap an item to pick it up, tap a bin to
// drop it in. Correct when every item sits in its own category.
export default function StatisticaSortCard({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: (answer?: string) => void }) {
  const [placement, setPlacement] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [settled, setSettled] = useState(false);

  const tray = task.items.filter((it) => !placement[it.id]);

  function pickBin(catId: string) {
    if (settled || !selected) return;
    setPlacement((p) => ({ ...p, [selected]: catId }));
    setSelected(null);
  }
  function returnItem(id: string) {
    if (settled) return;
    setPlacement((p) => { const n = { ...p }; delete n[id]; return n; });
  }
  function submit() {
    if (settled) return;
    if (Object.keys(placement).length !== task.items.length) return;
    setSettled(true);
    const ok = task.items.every((it) => placement[it.id] === it.category);
    if (ok) onCorrect(); else onWrong(task.items.map((it) => `${it.id}:${placement[it.id]}`).join(","));
  }

  // After checking, mark each placed card right (green) or wrong (red).
  const statusOf = (it: { id: string; category: string }): "correct" | "wrong" | null =>
    settled && placement[it.id] ? (placement[it.id] === it.category ? "correct" : "wrong") : null;

  const chip = (it: { id: string; label: string; category: string }, inBin: boolean) => {
    const color = task.categories.find((c) => c.id === it.category)?.color ?? "#c65b4e";
    const status = statusOf(it);
    const stateCls = status === "correct"
      ? "border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-400"
      : status === "wrong"
        ? "border-red-500 bg-red-50 text-red-900 ring-2 ring-red-400"
        : selected === it.id
          ? "border-[#f06b64] bg-[#fff0df] text-[#5b2e27] ring-2 ring-[#f2bc45]/55"
          : "border-[#b9caaa] bg-[#fffaf0] text-[#244531] hover:border-[#f06b64]";
    return (
      <div key={it.id} className="relative">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); if (inBin) returnItem(it.id); else setSelected((s) => (s === it.id ? null : it.id)); }}
          disabled={settled}
          className={["flex min-h-11 items-center gap-1.5 rounded-lg border-2 py-1.5 pl-2.5 pr-11 text-sm font-black transition disabled:opacity-100", stateCls].join(" ")}
        >
          {status === "correct" ? <Check className="h-5 w-5 text-emerald-600" /> : status === "wrong" ? <X className="h-5 w-5 text-red-600" /> : <DataIcon name={it.label} color={color} size={20} />}
          {it.label}
        </button>
        {!settled ? <OptionReadAloudButton text={it.label} className="absolute right-1 top-1/2 -translate-y-1/2" /> : null}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <TaskHeading prompt={task.prompt} speech={`${task.prompt}. ${task.speakText}`} />

      {/* tray of items to sort */}
      <div className="mx-auto flex min-h-[52px] max-w-md flex-wrap items-center justify-center gap-2 rounded-lg border border-dashed border-[#f2bc45]/45 bg-[#17281f] p-3">
        {tray.length ? tray.map((it) => chip(it, false)) : <span className="text-xs font-bold text-white/40">All sorted — tap Check!</span>}
      </div>

      {/* category bins */}
      <div className="mx-auto grid max-w-md gap-3" style={{ gridTemplateColumns: `repeat(${task.categories.length === 4 ? 2 : Math.min(task.categories.length, 3)}, minmax(0,1fr))` }}>
        {task.categories.map((cat) => {
          const inThis = task.items.filter((it) => placement[it.id] === cat.id);
          const armed = Boolean(selected) && !settled;
          return (
            <div
              key={cat.id}
              role="button"
              tabIndex={armed ? 0 : -1}
              aria-label={`Put in ${cat.label}`}
              onClick={() => pickBin(cat.id)}
              onKeyDown={(e) => { if (armed && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); pickBin(cat.id); } }}
              className={["relative min-h-[92px] rounded-lg border-2 p-2 text-left transition", armed ? "cursor-pointer hover:brightness-110" : "cursor-default"].join(" ")}
              style={{ borderColor: cat.color, background: `${cat.color}14`, boxShadow: armed ? `0 0 0 3px ${cat.color}55` : "none" }}
            >
              <div className="mb-1.5 min-h-9 pr-9 text-center text-xs font-black uppercase tracking-wide" style={{ color: cat.color }}>{cat.label}</div>
              <span onClick={(e) => e.stopPropagation()}><OptionReadAloudButton text={cat.label} className="absolute right-1 top-1" /></span>
              <div className="flex flex-wrap justify-center gap-1.5">{inThis.map((it) => chip(it, true))}</div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center">
        <button type="button" onClick={submit} disabled={settled || tray.length > 0} className="flex h-12 items-center gap-2 rounded-lg bg-[#c74f4b] px-7 font-black text-white shadow-md transition hover:bg-[#a93f3c] active:scale-95 disabled:opacity-40"><Check className="h-5 w-5" /> Check</button>
      </div>
    </div>
  );
}
