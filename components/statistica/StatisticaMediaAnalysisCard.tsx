"use client";

import { useState } from "react";
import { BarChart3, Check, Circle, Table2 } from "lucide-react";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type Task = Extract<PracticeTask, { kind: "statisticaMediaAnalysis" }>;

const MODE_LABELS: Record<Task["mode"], string> = {
  calculate: "Calculate from the evidence",
  compare: "Compare the evidence",
  method: "Audit the method",
  conclusion: "Test the conclusion",
  distortion: "Detect the distortion",
  quantify: "Measure the real change",
  repair: "Repair the representation",
  defend: "Defend your critique",
};

function EvidenceDisplay({ task }: { task: Task }) {
  if (task.display === "table") {
    return (
      <div className="overflow-hidden rounded-lg border border-[#cbd8c3] bg-white">
        <div className="flex items-center gap-2 bg-[#173b2c] px-3 py-2 text-xs font-black text-white"><Table2 className="h-4 w-4" />{task.data.title}</div>
        <table className="w-full text-sm">
          <tbody>{task.data.labels.map((label, index) => (
            <tr key={label} className="border-t border-[#e1e9dc] first:border-t-0">
              <th className="px-3 py-2 text-left font-bold text-[#315341]">{label}</th>
              <td className="px-3 py-2 text-right font-black text-[#173b2c]">{task.data.values[index]} {task.data.unit}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    );
  }

  if (task.display === "pictograph") {
    return (
      <div className="rounded-lg border border-[#b8c9b0] bg-[#10271d] p-3 text-white">
        <div className="flex items-center gap-2 text-xs font-black"><Circle className="h-4 w-4 text-[#f2bc45]" />{task.data.title}</div>
        <div className="mt-3 grid min-h-32 grid-cols-2 items-end gap-5 border-b-2 border-[#d6b65b]/65 px-4 pb-2">
          {task.data.values.map((value, index) => {
            const scale = task.data.visualMultipliers?.[index] ?? 1;
            return (
              <div key={task.data.labels[index]} className="flex flex-col items-center justify-end gap-1">
                <span className="text-xs font-black">{value} {task.data.unit}</span>
                <div className="rounded-md bg-[#20b8a5] shadow-[inset_0_2px_0_rgba(255,255,255,.35)]" style={{ width: `${44 * scale}px`, height: `${44 * scale}px` }} />
                <span className="text-[10px] font-bold text-white/80">{task.data.labels[index]}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (task.display === "selected") {
    const source = task.data.source;
    return (
      <div className="rounded-lg border border-[#b8c9b0] bg-[#10271d] p-3 text-white">
        <div className="flex items-center justify-between gap-2 text-xs font-black"><span className="inline-flex items-center gap-2"><BarChart3 className="h-4 w-4 text-[#f2bc45]" />{task.data.title}</span><span className="rounded bg-[#f2bc45] px-2 py-1 text-[10px] uppercase text-[#3f2b1e]">Published selection</span></div>
        <div className="mt-3 flex h-20 items-end gap-3 border-b-2 border-l-2 border-[#d6b65b]/65 px-3">
          {task.data.values.map((value, index) => <div key={task.data.labels[index]} className="flex flex-1 flex-col items-center justify-end self-stretch"><span className="text-[10px] font-black">{value}</span><div className="w-full max-w-12 rounded-t bg-[#20b8a5]" style={{ height: `${Math.max(12, value / Math.max(...task.data.values) * 78)}%` }} /><span className="text-[9px] font-bold">{task.data.labels[index]}</span></div>)}
        </div>
        {source ? <div className="mt-2 rounded bg-white/10 px-2 py-1.5 text-[10px]"><span className="font-black text-[#f2bc45]">Full record: </span>{source.labels.map((label, index) => `${label} ${source.values[index]}`).join(" · ")}</div> : null}
      </div>
    );
  }

  if (task.display === "parts") {
    const total = task.data.values.reduce((sum, value) => sum + value, 0);
    return (
      <div className="rounded-lg border border-[#b8c9b0] bg-[#10271d] p-3 text-white">
        <div className="flex items-center justify-between gap-2 text-xs font-black"><span className="inline-flex items-center gap-2"><BarChart3 className="h-4 w-4 text-[#f2bc45]" />{task.data.title}</span><span className="rounded bg-[#f2bc45] px-2 py-1 text-[10px] uppercase text-[#3f2b1e]">Claimed whole</span></div>
        <div className="mt-4 flex h-12 overflow-hidden rounded-md border-2 border-white/30">
          {task.data.values.map((value, index) => <div key={task.data.labels[index]} className="flex min-w-0 items-center justify-center border-r border-white/30 px-1 text-[10px] font-black last:border-r-0 odd:bg-[#20b8a5] even:bg-[#6366f1]" style={{ width: `${value / total * 100}%` }}>{value}%</div>)}
        </div>
        <div className="mt-2 grid gap-1 text-[10px] font-bold sm:grid-cols-3">{task.data.labels.map((label, index) => <span key={label}>{label}: {task.data.values[index]}%</span>)}</div>
      </div>
    );
  }

  const top = Math.max(...task.data.values);
  const bottom = task.axisMin ?? 0;
  const span = Math.max(1, top - bottom);
  return (
    <div className="rounded-lg border border-[#b8c9b0] bg-[#10271d] p-3 text-white">
      <div className="flex items-center justify-between gap-2 text-xs font-black">
        <span className="inline-flex items-center gap-2"><BarChart3 className="h-4 w-4 text-[#f2bc45]" />{task.data.title}</span>
        {bottom > 0 ? <span className="rounded bg-[#f2bc45] px-2 py-1 text-[10px] uppercase text-[#3f2b1e]">Axis starts at {bottom}</span> : null}
      </div>
      <div className="mt-3 flex h-28 items-end gap-2 border-b-2 border-l-2 border-[#d6b65b]/65 px-2">
        {task.data.values.map((value, index) => {
          const height = Math.max(6, ((value - bottom) / span) * 100);
          return (
            <div key={`${task.data.labels[index]}-${index}`} className="flex min-w-0 flex-1 flex-col items-center justify-end self-stretch">
              <span className="mb-1 text-[11px] font-black text-white">{value}</span>
              <div className="w-full max-w-14 rounded-t bg-[#20b8a5] shadow-[inset_0_2px_0_rgba(255,255,255,.35)]" style={{ height: `${height}%` }} />
              <span className="mt-1 min-h-7 text-center text-[10px] font-bold leading-tight text-white/80">{task.data.labels[index]}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-1 text-right text-[10px] font-bold text-white/60">{task.data.unit}</div>
    </div>
  );
}

export default function StatisticaMediaAnalysisCard({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: (answer?: string) => void }) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [settled, setSettled] = useState(false);

  function submit() {
    if (!chosen || settled) return;
    setSettled(true);
    if (task.correctOptionIds.includes(chosen)) {
      onCorrect();
    } else {
      onWrong(task.options.find((option) => option.id === chosen)?.label ?? chosen);
    }
  }

  return (
    <div className="space-y-2">
      <TaskHeading prompt={task.prompt} speech={`${task.prompt}. ${task.speakText}`} />
      <div className="mx-auto grid max-w-4xl gap-2 sm:grid-cols-[minmax(0,1.15fr)_minmax(250px,.85fr)]">
        <EvidenceDisplay task={task} />
        <aside className="rounded-lg border-2 border-[#d8c98e] bg-[#fffaf0] p-3 text-[#244531]">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#9b6221]">{MODE_LABELS[task.mode]}</div>
          <div className="mt-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#718477]">{task.mode === "method" || task.mode === "conclusion" || task.mode === "calculate" || task.mode === "compare" ? "Media claim" : "Headline paired with the graphic"}</div>
          <div className="mt-1 text-base font-black leading-snug">“{task.claim}”</div>
          {task.evidenceNote ? <div className="mt-2 rounded-md bg-[#eaf3e5] px-3 py-2 text-xs font-bold leading-relaxed">{task.evidenceNote}</div> : null}
        </aside>
        {task.sample || task.method ? (
          <dl className="grid gap-2 sm:col-span-2 sm:grid-cols-2">
            {task.sample ? <div className="rounded-md border border-[#cbd8c3] bg-[#f5f8f1] px-3 py-2"><dt className="text-[10px] font-black uppercase tracking-[0.12em] text-[#718477]">Sample</dt><dd className="mt-0.5 text-xs font-bold leading-snug text-[#315341]">{task.sample}</dd></div> : null}
            {task.method ? <div className="rounded-md border border-[#cbd8c3] bg-[#f5f8f1] px-3 py-2"><dt className="text-[10px] font-black uppercase tracking-[0.12em] text-[#718477]">Method</dt><dd className="mt-0.5 text-xs font-bold leading-snug text-[#315341]">{task.method}</dd></div> : null}
          </dl>
        ) : null}
      </div>

      <div className="mx-auto grid max-w-3xl gap-2 sm:grid-cols-2">
        {task.options.map((option) => (
          <div key={option.id} className="relative">
            <button type="button" onClick={() => !settled && setChosen(option.id)} className={["min-h-12 w-full rounded-lg border-2 px-3 py-2 pr-10 text-left text-sm font-bold leading-snug transition", chosen === option.id ? "border-[#f06b64] bg-[#fff0df] text-[#5b2e27] ring-2 ring-[#f2bc45]/55" : "border-[#b9caaa] bg-[#fffaf0] text-[#244531] hover:border-[#f06b64]"].join(" ")}>{option.label}</button>
            <OptionReadAloudButton text={option.label} className="absolute right-1 top-1/2 -translate-y-1/2 scale-90" />
          </div>
        ))}
      </div>
      <div className="flex justify-center"><button type="button" onClick={submit} disabled={!chosen || settled} className="flex h-11 items-center gap-2 rounded-lg bg-[#c74f4b] px-7 font-black text-white shadow-md transition active:scale-95 disabled:opacity-40"><Check className="h-5 w-5" /> Check evidence</button></div>
    </div>
  );
}
