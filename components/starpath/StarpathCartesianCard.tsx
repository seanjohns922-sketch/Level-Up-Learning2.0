"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { samePoint, type Point } from "@/data/activities/starpath/level5/coordinates";

type Task = Extract<PracticeTask, { kind: "starpathCartesian" }>;
const STEP = 30, PAD = 20;

function StarMark({ cx, cy, colour = "#fcd34d" }: { cx: number; cy: number; colour?: string }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 === 0 ? 8 : 3.4;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(" ");
  return <polygon points={pts} fill={colour} stroke="#fff7d6" strokeWidth="1" style={{ filter: "drop-shadow(0 0 4px rgba(252,211,77,0.8))" }} />;
}

export default function StarpathCartesianCard({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: (answer?: string) => void }) {
  const R = task.range;
  const span = 2 * R;
  const W = PAD * 2 + span * STEP;
  const OX = PAD + R * STEP, OY = PAD + R * STEP;
  const cx = (x: number) => OX + x * STEP;
  const cy = (y: number) => OY - y * STEP;

  const [selected, setSelected] = useState<Point | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const [settled, setSettled] = useState(false);

  const isTap = task.render === "tap";
  const ticks = Array.from({ length: span + 1 }, (_, i) => i - R);

  function submitTap() {
    if (settled || !selected) return;
    setSettled(true);
    if (task.answer && samePoint(selected, task.answer)) onCorrect(); else onWrong(selected ? `${selected.x},${selected.y}` : "");
  }
  function submitOption() {
    if (settled || !chosen) return;
    setSettled(true);
    if ((task.correctOptionIds ?? []).includes(chosen)) onCorrect(); else onWrong(chosen);
  }

  return (
    <div className="space-y-4">
      <TaskHeading prompt={task.prompt} speech={task.speakText} />

      <div className="mx-auto w-fit rounded-2xl border border-cyan-300/25 bg-slate-950 p-3 shadow-[0_16px_40px_-20px_rgba(8,145,178,0.5)]">
        <svg viewBox={`0 0 ${W} ${W}`} className="h-auto w-[min(20rem,80vw)]" role="img">
          {/* grid lines */}
          {ticks.map((x) => (
            <line key={`vx${x}`} x1={cx(x)} y1={cy(R)} x2={cx(x)} y2={cy(-R)} stroke="rgba(103,232,249,0.12)" strokeWidth="1" />
          ))}
          {ticks.map((y) => (
            <line key={`hz${y}`} x1={cx(-R)} y1={cy(y)} x2={cx(R)} y2={cy(y)} stroke="rgba(103,232,249,0.12)" strokeWidth="1" />
          ))}
          {/* axes with arrowheads */}
          <line x1={cx(-R)} y1={cy(0)} x2={cx(R)} y2={cy(0)} stroke="#67e8f9" strokeWidth="2" />
          <line x1={cx(0)} y1={cy(-R)} x2={cx(0)} y2={cy(R)} stroke="#67e8f9" strokeWidth="2" />
          <polygon points={`${cx(R) + 6},${cy(0)} ${cx(R) - 3},${cy(0) - 4} ${cx(R) - 3},${cy(0) + 4}`} fill="#67e8f9" />
          <polygon points={`${cx(0)},${cy(R) - 6} ${cx(0) - 4},${cy(R) + 3} ${cx(0) + 4},${cy(R) + 3}`} fill="#67e8f9" />
          {/* axis numbers (skip 0) */}
          {ticks.filter((n) => n !== 0).map((x) => (
            <text key={`xl${x}`} x={cx(x)} y={cy(0) + 13} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#7dd3fc">{x}</text>
          ))}
          {ticks.filter((n) => n !== 0).map((y) => (
            <text key={`yl${y}`} x={cx(0) - 8} y={cy(y) + 3} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#7dd3fc">{y}</text>
          ))}
          <text x={cx(0) - 8} y={cy(0) + 13} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#7dd3fc">0</text>
          {/* points */}
          {(task.points ?? []).map((p) => {
            if (p.kind === "star" || p.kind === "goal") return <StarMark key={p.id} cx={cx(p.x)} cy={cy(p.y)} />;
            if (p.kind === "rover") return <circle key={p.id} cx={cx(p.x)} cy={cy(p.y)} r="6.5" fill="#22d3ee" stroke="#ecfeff" strokeWidth="2" style={{ filter: "drop-shadow(0 0 4px rgba(34,211,238,0.8))" }} />;
            return <circle key={p.id} cx={cx(p.x)} cy={cy(p.y)} r="5.5" fill="#a78bfa" stroke="#ede9fe" strokeWidth="1.5" />;
          })}
          {/* tap lattice + selection */}
          {isTap
            ? ticks.flatMap((x) => ticks.map((y) => {
                const sel = selected && selected.x === x && selected.y === y;
                return (
                  <g key={`t${x}:${y}`}>
                    {sel ? <circle cx={cx(x)} cy={cy(y)} r="9" fill="none" stroke="#22d3ee" strokeWidth="2.5" /> : null}
                    <circle cx={cx(x)} cy={cy(y)} r={STEP / 2 - 1} fill="transparent" style={{ cursor: settled ? "default" : "pointer" }} onClick={() => !settled && setSelected({ x, y })} />
                  </g>
                );
              }))
            : null}
        </svg>
      </div>

      {task.render === "options" ? (
        <>
          <div className="mx-auto grid max-w-md gap-2 sm:grid-cols-2">
            {task.options?.map((option) => (
              <button key={option.id} type="button" onClick={() => !settled && setChosen(option.id)} className={["rounded-2xl border-2 p-3 text-center text-base font-black transition", chosen === option.id ? "border-cyan-500 bg-cyan-50 text-indigo-950 ring-2 ring-cyan-300" : "border-violet-200 bg-white text-indigo-900 hover:border-cyan-400"].join(" ")}>{option.label}</button>
            ))}
          </div>
          <div className="flex justify-center"><SubmitButton disabled={settled || !chosen} onClick={submitOption} /></div>
        </>
      ) : (
        <div className="flex justify-center"><SubmitButton disabled={settled || !selected} onClick={submitTap} /></div>
      )}
    </div>
  );
}

function SubmitButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} disabled={disabled} className="flex h-12 items-center gap-2 rounded-2xl bg-emerald-600 px-7 font-black text-white shadow-md transition hover:bg-emerald-700 active:scale-95 disabled:opacity-40"><Check className="h-5 w-5" /> Check</button>;
}
