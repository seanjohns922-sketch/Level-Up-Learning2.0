"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { samePoint, type Point } from "@/data/activities/starpath/level5/coordinates";

type Task = Extract<PracticeTask, { kind: "starpathTransform" }>;
const STEP = 38, PAD_L = 26, PAD_T = 14, PAD_R = 14, PAD_B = 26;
const TILE = STEP - 9;

export default function StarpathTransformCard({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: (answer?: string) => void }) {
  const { bounds } = task;
  const W = PAD_L + bounds.x * STEP + PAD_R;
  const H = PAD_T + bounds.y * STEP + PAD_B;
  const cx = (x: number) => PAD_L + x * STEP;
  const cy = (y: number) => PAD_T + (bounds.y - y) * STEP;

  const [selected, setSelected] = useState<Point | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const [settled, setSettled] = useState(false);
  const markKey = task.markStart ? `${task.markStart.x}:${task.markStart.y}` : null;

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

  const tile = (p: Point, fill: string, ring = false, key?: string) => (
    <rect
      key={key ?? `${p.x}:${p.y}`}
      x={cx(p.x) - TILE / 2} y={cy(p.y) - TILE / 2} width={TILE} height={TILE} rx="4"
      fill={fill}
      stroke={ring ? "#ffffff" : "rgba(255,255,255,0.35)"} strokeWidth={ring ? 2.5 : 1}
      style={ring ? { filter: "drop-shadow(0 0 5px rgba(255,255,255,0.8))" } : undefined}
    />
  );

  const isTap = task.render === "tap";

  return (
    <div className="space-y-4">
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="mx-auto w-fit rounded-2xl border border-cyan-300/25 bg-slate-950 p-3 shadow-[0_16px_40px_-20px_rgba(8,145,178,0.5)]">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-[min(20rem,78vw)]" role="img">
          {/* faint reference dots instead of a full grid */}
          {Array.from({ length: (bounds.x + 1) * (bounds.y + 1) }, (_, index) => {
            const x = index % (bounds.x + 1);
            const y = Math.floor(index / (bounds.x + 1));
            return <circle key={`d${index}`} cx={cx(x)} cy={cy(y)} r="1.4" fill="rgba(148,163,255,0.38)" />;
          })}

          {/* mirror line */}
          {task.line ? (
            task.line.axis === "vertical"
              ? <line x1={cx(task.line.at)} y1={cy(0)} x2={cx(task.line.at)} y2={cy(bounds.y)} stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 5px rgba(245,158,11,0.8))" }} />
              : <line x1={cx(0)} y1={cy(task.line.at)} x2={cx(bounds.x)} y2={cy(task.line.at)} stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 5px rgba(245,158,11,0.8))" }} />
          ) : null}

          {/* image tiles */}
          {(task.image ?? []).map((p) => tile(p, "rgba(167,139,250,0.85)", false, `img${p.x}:${p.y}`))}
          {/* shape tiles */}
          {task.shape.map((p) => tile(p, "#22d3ee", markKey === `${p.x}:${p.y}`, `sh${p.x}:${p.y}`))}
          {/* rotation centre */}
          {task.centre ? <circle cx={cx(task.centre.x)} cy={cy(task.centre.y)} r="4.5" fill="#0b0a24" stroke="#fcd34d" strokeWidth="2.5" style={{ filter: "drop-shadow(0 0 5px rgba(252,211,77,0.9))" }} /> : null}

          {/* tap targets */}
          {isTap
            ? Array.from({ length: (bounds.x + 1) * (bounds.y + 1) }, (_, index) => {
                const x = index % (bounds.x + 1);
                const y = Math.floor(index / (bounds.x + 1));
                const sel = selected && selected.x === x && selected.y === y;
                return (
                  <g key={`t${index}`}>
                    {sel ? <circle cx={cx(x)} cy={cy(y)} r="10" fill="none" stroke="#34d399" strokeWidth="3" /> : null}
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
              <button key={option.id} type="button" onClick={() => !settled && setChosen(option.id)} className={["rounded-2xl border-2 p-3 text-center text-sm font-black transition", chosen === option.id ? "border-cyan-500 bg-cyan-50 text-indigo-950 ring-2 ring-cyan-300" : "border-violet-200 bg-white text-indigo-900 hover:border-cyan-400"].join(" ")}>{option.label}</button>
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
