"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import DataIcon from "@/components/statistica/DataIcon";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type Task = Extract<PracticeTask, { kind: "statisticaCollect" }>;

// Collect the data: tap each scattered item to gather it into its category's live
// counter. Once every item is collected, answer a question about the counts.
export default function StatisticaCollectCard({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: (answer?: string) => void }) {
  const [collected, setCollected] = useState<Set<string>>(() => new Set());
  const [chosen, setChosen] = useState<string | null>(null);
  const [settled, setSettled] = useState(false);

  // A stable scattered order so the field doesn't reshuffle on each tap.
  const order = useMemo(() => task.items.map((it) => it.id), [task.items]);
  const itemsById = useMemo(() => new Map(task.items.map((it) => [it.id, it])), [task.items]);

  const counts = task.categories.map((cat) => task.items.filter((it) => it.category === cat.id && collected.has(it.id)).length);
  const total = task.items.length;
  const gathered = collected.size;
  const done = gathered === total;

  function tap(id: string) {
    if (settled || collected.has(id)) return;
    setCollected((s) => new Set(s).add(id));
  }
  function submit() {
    if (settled || !chosen) return;
    setSettled(true);
    if (task.correctOptionIds.includes(chosen)) onCorrect(); else onWrong(chosen);
  }

  return (
    <div className="space-y-4">
      <TaskHeading prompt={task.prompt} speech={`${task.prompt}. ${task.speakText}`} />

      {/* live per-category counters */}
      <div className="mx-auto grid max-w-md gap-2" style={{ gridTemplateColumns: `repeat(${task.categories.length}, minmax(0,1fr))` }}>
        {task.categories.map((cat, i) => (
          <div key={cat.id} className="relative rounded-lg border-2 p-2 text-center" style={{ borderColor: cat.color, background: `${cat.color}14` }}>
            <OptionReadAloudButton text={`${cat.label}, ${counts[i]} collected`} className="absolute right-1 top-1" />
            <div className="text-[11px] font-black uppercase tracking-wide" style={{ color: cat.color }}>{cat.label}</div>
            <div className="my-1 flex min-h-[16px] flex-wrap justify-center gap-[3px]">
              {Array.from({ length: counts[i]! }, (_, k) => <span key={k} className="h-2.5 w-2.5 rounded-full" style={{ background: cat.color }} />)}
            </div>
            <div className="text-lg font-black leading-none text-[#17281f] tabular-nums">{counts[i]}</div>
          </div>
        ))}
      </div>

      {/* scatter field: tap each item to gather it */}
      {!done ? (
        <div className="mx-auto flex min-h-[120px] max-w-md flex-wrap items-center justify-center gap-2 rounded-lg border border-dashed border-[#f2bc45]/45 bg-[#17281f] p-3">
          {order.filter((id) => !collected.has(id)).map((id) => {
            const it = itemsById.get(id)!;
            const cat = task.categories.find((c) => c.id === it.category)!;
            return (
              <div key={id} className="relative">
                <button type="button" onClick={() => tap(id)} className="flex min-h-20 min-w-20 flex-col items-center justify-center gap-0.5 rounded-lg border-2 px-3 py-1.5 text-xs font-black text-[#244531] shadow-sm transition hover:-translate-y-0.5 active:scale-90" style={{ borderColor: cat.color, background: "#fffaf0" }}>
                  <DataIcon name={it.label} color={cat.color} size={26} />
                  {it.label}
                </button>
                <OptionReadAloudButton text={it.label} className="absolute right-1 top-1" />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mx-auto max-w-md rounded-lg border border-[#f2bc45]/45 bg-[#17281f] p-3 text-center text-sm font-black text-emerald-300">
          All {total} collected! Now answer:
        </div>
      )}

      {/* answer phase */}
      {done ? (
        <>
          <div className="flex items-center justify-center gap-2 text-center text-sm font-black text-[#17281f]">
            <span>{task.question}</span>
            <OptionReadAloudButton text={task.question} />
          </div>
          <div className="mx-auto grid max-w-md gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(task.categories.length, 3)}, minmax(0,1fr))` }}>
            {task.categories.map((cat) => (
              <div key={cat.id} className="relative">
                <button type="button" onClick={() => !settled && setChosen(cat.id)} className={["min-h-14 w-full rounded-lg border-2 p-3 pr-12 text-center text-sm font-black transition", chosen === cat.id ? "border-[#f06b64] bg-[#fff0df] text-[#5b2e27] ring-2 ring-[#f2bc45]/55" : "border-[#b9caaa] bg-[#fffaf0] text-[#244531] hover:border-[#f06b64]"].join(" ")}>{cat.label}</button>
                <OptionReadAloudButton text={cat.label} className="absolute right-2 top-1/2 -translate-y-1/2" />
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <button type="button" onClick={submit} disabled={settled || !chosen} className="flex h-12 items-center gap-2 rounded-lg bg-[#c74f4b] px-7 font-black text-white shadow-md transition hover:bg-[#a93f3c] active:scale-95 disabled:opacity-40"><Check className="h-5 w-5" /> Check</button>
          </div>
        </>
      ) : (
        <div className="text-center text-xs font-bold text-[#496253]">{gathered} of {total} collected - tap them all</div>
      )}
    </div>
  );
}
