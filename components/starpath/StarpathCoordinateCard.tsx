"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Check, RotateCcw, Play } from "lucide-react";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { runCommands, samePoint, shortestSteps, type MoveDir, type Point } from "@/data/activities/starpath/level5/coordinates";

type Task = Extract<PracticeTask, { kind: "starpathCoordinate" }>;
const STEP = 38, PAD_L = 26, PAD_T = 14, PAD_R = 14, PAD_B = 26;

const ARROW: Record<MoveDir, typeof ArrowUp> = { up: ArrowUp, down: ArrowDown, left: ArrowLeft, right: ArrowRight };

function StarMark({ cx, cy, colour = "#fcd34d" }: { cx: number; cy: number; colour?: string }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 === 0 ? 9 : 3.8;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(" ");
  return <polygon points={pts} fill={colour} stroke="#fff7d6" strokeWidth="1" style={{ filter: "drop-shadow(0 0 5px rgba(252,211,77,0.8))" }} />;
}

export default function StarpathCoordinateCard({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: (answer?: string) => void }) {
  const { bounds } = task;
  const W = PAD_L + bounds.x * STEP + PAD_R;
  const H = PAD_T + bounds.y * STEP + PAD_B;
  const cx = (x: number) => PAD_L + x * STEP;
  const cy = (y: number) => PAD_T + (bounds.y - y) * STEP;

  const [selected, setSelected] = useState<Point | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const [commands, setCommands] = useState<MoveDir[]>([]);
  const [rover, setRover] = useState<Point | null>(task.start ?? null);
  const [running, setRunning] = useState(false);
  const [settled, setSettled] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const points = task.points ?? [];

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
  function runRoute() {
    if (settled || running || !task.start || !commands.length) return;
    setRunning(true);
    const { path, onGrid, hitBlock } = runCommands(task.start, commands, bounds, task.blocked ?? []);
    path.forEach((p, index) => {
      const t = setTimeout(() => {
        setRover(p);
        if (index === path.length - 1) {
          setRunning(false);
          setSettled(true);
          const reached = task.goal ? samePoint(p, task.goal) : false;
          const efficient = task.maxSteps === undefined || commands.length <= task.maxSteps;
          if (reached && onGrid && !hitBlock && efficient) onCorrect(); else onWrong(commands.join(","));
        }
      }, index * 240);
      timers.current.push(t);
    });
  }

  const isTap = task.render === "tap";
  const isCommands = task.render === "commands";

  return (
    <div className="space-y-4">
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      {task.givenCommands?.length ? (
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {task.givenCommands.map((command, index) => {
            const Icon = ARROW[command];
            return <span key={index} className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-950 text-cyan-200"><Icon className="h-4 w-4" strokeWidth={3} /></span>;
          })}
        </div>
      ) : null}

      <div className="mx-auto w-fit rounded-2xl border border-cyan-300/25 bg-slate-950 p-3 shadow-[0_16px_40px_-20px_rgba(8,145,178,0.5)]">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-[min(20rem,78vw)]" role="img">
          {/* grid */}
          {Array.from({ length: bounds.x + 1 }, (_, x) => (
            <line key={`vx${x}`} x1={cx(x)} y1={cy(0)} x2={cx(x)} y2={cy(bounds.y)} stroke="rgba(103,232,249,0.14)" strokeWidth="1" />
          ))}
          {Array.from({ length: bounds.y + 1 }, (_, y) => (
            <line key={`hz${y}`} x1={cx(0)} y1={cy(y)} x2={cx(bounds.x)} y2={cy(y)} stroke="rgba(103,232,249,0.14)" strokeWidth="1" />
          ))}
          {/* axes */}
          <line x1={cx(0)} y1={cy(0)} x2={cx(bounds.x)} y2={cy(0)} stroke="#67e8f9" strokeWidth="2" />
          <line x1={cx(0)} y1={cy(0)} x2={cx(0)} y2={cy(bounds.y)} stroke="#67e8f9" strokeWidth="2" />
          {/* axis numbers */}
          {Array.from({ length: bounds.x + 1 }, (_, x) => (
            <text key={`xl${x}`} x={cx(x)} y={cy(0) + 15} textAnchor="middle" fontSize="10" fontWeight="700" fill="#a5f3fc">{x}</text>
          ))}
          {Array.from({ length: bounds.y + 1 }, (_, y) => (
            <text key={`yl${y}`} x={cx(0) - 9} y={cy(y) + 3.5} textAnchor="middle" fontSize="10" fontWeight="700" fill="#a5f3fc">{y}</text>
          ))}
          {/* blocked sectors */}
          {(task.blocked ?? []).map((cell, index) => (
            <rect key={`b${index}`} x={cx(cell.x) - 9} y={cy(cell.y) - 9} width="18" height="18" rx="3" fill="rgba(244,63,94,0.18)" stroke="rgba(251,113,133,0.6)" />
          ))}
          {/* goal */}
          {task.goal ? <StarMark cx={cx(task.goal.x)} cy={cy(task.goal.y)} /> : null}
          {/* static points */}
          {points.map((p) => {
            if (p.kind === "star" || p.kind === "goal") return <StarMark key={p.id} cx={cx(p.x)} cy={cy(p.y)} />;
            if (p.kind === "dot") return <circle key={p.id} cx={cx(p.x)} cy={cy(p.y)} r="6" fill="#a78bfa" stroke="#ede9fe" strokeWidth="1.5" />;
            return null;
          })}
          {/* rover */}
          {rover ? <circle cx={cx(rover.x)} cy={cy(rover.y)} r="7" fill="#22d3ee" stroke="#ecfeff" strokeWidth="2" style={{ filter: "drop-shadow(0 0 5px rgba(34,211,238,0.8))" }} /> : null}
          {/* tap targets + selection */}
          {isTap
            ? Array.from({ length: (bounds.x + 1) * (bounds.y + 1) }, (_, index) => {
                const x = index % (bounds.x + 1);
                const y = Math.floor(index / (bounds.x + 1));
                const sel = selected && selected.x === x && selected.y === y;
                return (
                  <g key={`t${index}`}>
                    {sel ? <circle cx={cx(x)} cy={cy(y)} r="10" fill="none" stroke="#22d3ee" strokeWidth="2.5" /> : null}
                    <circle cx={cx(x)} cy={cy(y)} r={STEP / 2 - 2} fill="transparent" style={{ cursor: settled ? "default" : "pointer" }} onClick={() => !settled && setSelected({ x, y })} />
                  </g>
                );
              })
            : null}
        </svg>
      </div>

      {task.render === "options" ? (
        <>
          <div className="mx-auto grid max-w-md gap-2 sm:grid-cols-3">
            {task.options?.map((option) => (
              <button key={option.id} type="button" onClick={() => !settled && setChosen(option.id)} className={["rounded-2xl border-2 p-3 text-center text-base font-black transition", chosen === option.id ? "border-cyan-500 bg-cyan-50 text-indigo-950 ring-2 ring-cyan-300" : "border-violet-200 bg-white text-indigo-900 hover:border-cyan-400"].join(" ")}>{option.label}</button>
            ))}
          </div>
          <div className="flex justify-center"><SubmitButton disabled={settled || !chosen} onClick={submitOption} /></div>
        </>
      ) : null}

      {isTap ? (
        <div className="flex justify-center"><SubmitButton disabled={settled || !selected} onClick={submitTap} /></div>
      ) : null}

      {isCommands ? (
        <div className="space-y-3">
          <div className="mx-auto flex min-h-9 max-w-sm flex-wrap items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-2">
            {commands.length ? commands.map((command, index) => {
              const Icon = ARROW[command];
              return <span key={index} className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-950 text-cyan-200"><Icon className="h-4 w-4" strokeWidth={3} /></span>;
            }) : <span className="text-xs font-bold text-slate-400">Add moves to build a route{task.maxSteps ? ` (aim for ${shortestSteps(task.start!, task.goal!)} moves)` : ""}</span>}
          </div>
          <div className="flex justify-center gap-2">
            {(["left", "up", "down", "right"] as MoveDir[]).map((dir) => {
              const Icon = ARROW[dir];
              return <button key={dir} type="button" disabled={settled || running} onClick={() => setCommands((c) => [...c, dir])} aria-label={dir} className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-violet-200 bg-white text-indigo-900 transition hover:border-cyan-400 disabled:opacity-40"><Icon className="h-5 w-5" strokeWidth={3} /></button>;
            })}
          </div>
          <div className="flex justify-center gap-2.5">
            <button type="button" onClick={() => { setCommands([]); setRover(task.start ?? null); }} disabled={settled || running} title="Clear" aria-label="Clear" className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white text-slate-600 disabled:opacity-40"><RotateCcw className="h-5 w-5" /></button>
            <button type="button" onClick={runRoute} disabled={settled || running || !commands.length} className="flex h-12 items-center gap-2 rounded-2xl bg-emerald-600 px-7 font-black text-white shadow-md transition hover:bg-emerald-700 active:scale-95 disabled:opacity-40"><Play className="h-5 w-5" /> Run</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SubmitButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} disabled={disabled} className="flex h-12 items-center gap-2 rounded-2xl bg-emerald-600 px-7 font-black text-white shadow-md transition hover:bg-emerald-700 active:scale-95 disabled:opacity-40"><Check className="h-5 w-5" /> Check</button>;
}
