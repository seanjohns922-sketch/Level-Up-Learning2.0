"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type Task = Extract<PracticeTask, { kind: "statisticaLineGraph" }>;

// Statistica Level 5 — a premium line graph of change over time (AC9M5ST02):
// a grounded axis, dashed interval gridlines, a bright plotted line and marked
// data points, matching the column-graph plot's dark-glass styling.
function LineChart({ points, unit, yLabel, color }: { points: Task["points"]; unit: string; yLabel: string; color: string }) {
  const W = 460, H = 300, padL = 44, padR = 16, padT = 16, padB = 40;
  const maxVal = Math.max(1, ...points.map((p) => p.value));
  const step = maxVal <= 6 ? 1 : maxVal <= 12 ? 2 : maxVal <= 24 ? 5 : 10;
  const top = Math.ceil(maxVal / step) * step;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const x = (i: number) => padL + (points.length === 1 ? plotW / 2 : (plotW * i) / (points.length - 1));
  const y = (v: number) => padT + plotH - (plotH * v) / top;
  const stops: number[] = [];
  for (let v = 0; v <= top; v += step) stops.push(v);
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(" ");

  return (
    <div className="mx-auto max-w-lg overflow-x-auto rounded-2xl border border-[#f2bc45]/35 bg-gradient-to-b from-[#1c3226] to-[#101d15] p-4 pt-3 shadow-[inset_0_1px_0_rgba(255,240,199,0.14),0_12px_32px_rgba(0,0,0,0.32)]">
      <div className="mb-1 text-center text-[10px] font-black uppercase tracking-[0.16em] text-[#f2bc45]/70">{yLabel} ({unit})</div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Line graph of ${yLabel} in ${unit}`} style={{ maxWidth: 460 }}>
        {stops.map((v) => (
          <g key={v}>
            <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} stroke="rgba(242,188,69,0.16)" strokeDasharray="4 4" />
            <text x={padL - 6} y={y(v) + 3} textAnchor="end" fontSize="10" fontWeight="800" fill="rgba(242,188,69,0.6)">{v}</text>
          </g>
        ))}
        <line x1={padL} x2={W - padR} y1={padT + plotH} y2={padT + plotH} stroke="rgba(242,188,69,0.45)" strokeWidth="2" strokeLinecap="round" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${color}88)` }} />
        {points.map((p, i) => (
          <g key={p.label}>
            <circle cx={x(i)} cy={y(p.value)} r="5.5" fill="#101d15" stroke={color} strokeWidth="3" />
            <text x={x(i)} y={padT + plotH + 18} textAnchor="middle" fontSize="10.5" fontWeight="800" fill="rgba(255,255,255,0.9)">{p.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function StatisticaLineGraphCard({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: (answer?: string) => void }) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [settled, setSettled] = useState(false);

  function submit() {
    if (settled || !chosen) return;
    setSettled(true);
    if (task.correctOptionIds.includes(chosen)) onCorrect(); else onWrong(chosen);
  }

  return (
    <div className="space-y-4">
      <TaskHeading prompt={task.prompt} speech={`${task.prompt}. ${task.speakText}`} />

      <LineChart points={task.points} unit={task.unit} yLabel={task.yLabel} color={task.color} />

      <div className="mx-auto grid max-w-lg gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(task.options.length, 3)}, minmax(0,1fr))` }}>
        {task.options.map((option) => (
          <div key={option.id} className="relative">
            <button type="button" onClick={() => !settled && setChosen(option.id)} className={["min-h-12 w-full rounded-lg border-2 px-2 py-2 pr-8 text-center text-sm font-black transition", chosen === option.id ? "border-[#f06b64] bg-[#fff0df] text-[#5b2e27] ring-2 ring-[#f2bc45]/55" : "border-[#b9caaa] bg-[#fffaf0] text-[#244531] hover:border-[#f06b64]"].join(" ")}>{option.label}</button>
            <OptionReadAloudButton text={option.label} className="absolute right-1 top-1/2 -translate-y-1/2 scale-90" />
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button type="button" onClick={submit} disabled={settled || !chosen} className="flex h-12 items-center gap-2 rounded-lg bg-[#c74f4b] px-7 font-black text-white shadow-md transition hover:bg-[#a93f3c] active:scale-95 disabled:opacity-40"><Check className="h-5 w-5" /> Check</button>
      </div>
    </div>
  );
}
