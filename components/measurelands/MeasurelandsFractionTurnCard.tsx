"use client";

import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type Task = Extract<PracticeTask, { kind: "fractionTurn" }>;
const DIRECTIONS = { right: 0, down: 90, left: 180, up: 270 } as const;
const TURNS = { quarter: 90, half: 180, "three-quarter": 270, full: 360 } as const;

function FractionVisual({ parts, shaded }: { parts: 2 | 4 | 8; shaded: number }) {
  const c = 90;
  const r = 72;
  return (
    <svg viewBox="0 0 180 180" className="h-48 w-48" aria-label={`${shaded} of ${parts} equal parts shaded`}>
      {Array.from({ length: parts }, (_, index) => {
        const a = (index * 360) / parts - 90;
        const b = ((index + 1) * 360) / parts - 90;
        const p1 = [c + r * Math.cos((a * Math.PI) / 180), c + r * Math.sin((a * Math.PI) / 180)];
        const p2 = [c + r * Math.cos((b * Math.PI) / 180), c + r * Math.sin((b * Math.PI) / 180)];
        return <path key={index} d={`M ${c} ${c} L ${p1[0]} ${p1[1]} A ${r} ${r} 0 0 1 ${p2[0]} ${p2[1]} Z`} fill={index < shaded ? "#f59e0b" : "#f5f3ff"} stroke="#5b21b6" strokeWidth="3" />;
      })}
    </svg>
  );
}

function TurnVisual({ task }: { task: Task }) {
  const start = DIRECTIONS[task.startDirection ?? "up"];
  const turn = TURNS[task.turnFraction ?? "quarter"];
  const end = start + turn * (task.clockwise === false ? -1 : 1);
  const circumference = 2 * Math.PI * 70;
  return (
    <div className="relative h-48 w-48 rounded-full border-4 border-violet-200 bg-white" aria-label={`${task.turnFraction} turn`}>
      <svg viewBox="0 0 192 192" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <circle cx="96" cy="96" r="70" fill="none" stroke="#ddd6fe" strokeWidth="8" />
        <circle
          cx="96"
          cy="96"
          r="70"
          fill="none"
          stroke="#8b5cf6"
          strokeLinecap="round"
          strokeWidth="8"
          strokeDasharray={`${(turn / 360) * circumference} ${circumference}`}
          transform={`rotate(${start - 90} 96 96)`}
        />
      </svg>
      <div className="absolute left-1/2 top-1/2 h-1.5 w-16 origin-left rounded-full bg-amber-500" style={{ transform: `rotate(${start}deg)` }} />
      <div className="absolute left-1/2 top-1/2 h-1.5 w-16 origin-left rounded-full bg-violet-700" style={{ transform: `rotate(${end}deg)` }} />
      <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-900" />
      <div className="absolute bottom-2 left-0 right-0 text-center text-xs font-bold text-slate-600">gold start · purple finish</div>
    </div>
  );
}

export function MeasurelandsFractionTurnCard({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: () => void }) {
  return (
    <div className="measurelands-shell space-y-4">
      <div className="rounded-[28px] border border-amber-200 bg-[#fffaf0] p-5 shadow-sm">
        <div className="mb-3 text-xs font-black uppercase text-violet-800">{task.badgeLabel ?? "Fraction Mission"}</div>
        <div className="flex items-start gap-3"><h2 className="flex-1 text-2xl font-black text-slate-900">{task.prompt}</h2><ReadAloudBtn text={task.speakText ?? task.prompt} size="md" /></div>
      </div>
      <div className="flex justify-center rounded-[28px] border border-violet-200 bg-white p-5">
        {task.scene === "fraction" ? <FractionVisual parts={task.parts ?? 4} shaded={task.shadedParts ?? 1} /> : <TurnVisual task={task} />}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {task.options.map((option) => (
          <button key={option} type="button" onClick={() => option === task.correctOption ? onCorrect() : onWrong()} className="relative min-h-20 rounded-2xl border-2 border-violet-200 bg-white px-4 text-lg font-black text-slate-900">
            <span className="absolute right-2 top-2"><OptionReadAloudButton text={option} /></span>{option}
          </button>
        ))}
      </div>
    </div>
  );
}
