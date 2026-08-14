"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
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

  const chip = (it: { id: string; label: string }, inBin: boolean) => (
    <button
      key={it.id}
      type="button"
      onClick={() => (inBin ? returnItem(it.id) : setSelected((s) => (s === it.id ? null : it.id)))}
      disabled={settled}
      className={["rounded-xl border-2 px-3 py-1.5 text-sm font-black transition disabled:opacity-70", selected === it.id ? "border-cyan-400 bg-cyan-50 text-teal-950 ring-2 ring-cyan-300" : "border-teal-200 bg-white text-teal-900 hover:border-cyan-400"].join(" ")}
    >
      {it.label}
    </button>
  );

  return (
    <div className="space-y-4">
      <TaskHeading prompt={task.prompt} speech={task.speakText} />

      {/* tray of items to sort */}
      <div className="mx-auto flex min-h-[52px] max-w-md flex-wrap items-center justify-center gap-2 rounded-2xl border border-dashed border-cyan-300/30 bg-slate-950 p-3">
        {tray.length ? tray.map((it) => chip(it, false)) : <span className="text-xs font-bold text-white/40">All sorted — tap Check!</span>}
      </div>

      {/* category bins */}
      <div className="mx-auto grid max-w-md gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(task.categories.length, 3)}, minmax(0,1fr))` }}>
        {task.categories.map((cat) => {
          const inThis = task.items.filter((it) => placement[it.id] === cat.id);
          return (
            <button key={cat.id} type="button" onClick={() => pickBin(cat.id)} disabled={settled || !selected} className="min-h-[92px] rounded-2xl border-2 p-2 text-left transition disabled:cursor-default" style={{ borderColor: cat.color, background: `${cat.color}14` }}>
              <div className="mb-1.5 text-center text-xs font-black uppercase tracking-wide" style={{ color: cat.color }}>{cat.label}</div>
              <div className="flex flex-wrap justify-center gap-1.5">{inThis.map((it) => chip(it, true))}</div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-center">
        <button type="button" onClick={submit} disabled={settled || tray.length > 0} className="flex h-12 items-center gap-2 rounded-2xl bg-emerald-600 px-7 font-black text-white shadow-md transition hover:bg-emerald-700 active:scale-95 disabled:opacity-40"><Check className="h-5 w-5" /> Check</button>
      </div>
    </div>
  );
}
