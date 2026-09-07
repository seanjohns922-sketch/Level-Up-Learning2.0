"use client";

import { useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type Task = Extract<PracticeTask, { kind: "chanceBuildFair" }>;

const FRAME = "#6d3f9c";
const INK = "#2c2140";

function pt(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

export default function ChanceBuildFairCard({ task, onCorrect }: { task: Task; onCorrect: () => void; onWrong: (answer?: string) => void }) {
  const [a, b] = task.colours;
  // Start deliberately unfair so there is something to fix.
  const [counts, setCounts] = useState<[number, number]>([3, 1]);
  const [settled, setSettled] = useState(false);
  const [nudge, setNudge] = useState(false);

  const wedges: string[] = [
    ...Array(counts[0]).fill(a!.colour),
    ...Array(counts[1]).fill(b!.colour),
  ];
  const n = Math.max(wedges.length, 1);
  const wedgeAngle = 360 / n;
  const cx = 90, cy = 90, r = 76;

  function adjust(idx: 0 | 1, delta: number) {
    if (settled) return;
    setNudge(false);
    setCounts((c) => {
      const next: [number, number] = [c[0], c[1]];
      next[idx] = Math.min(task.maxParts, Math.max(1, next[idx] + delta));
      return next;
    });
  }

  function check() {
    if (settled) return;
    // A build task: an unfair check just nudges so they can keep adjusting; only
    // an equal (fair) spinner completes the task.
    if (counts[0] === counts[1]) {
      setSettled(true);
      onCorrect();
    } else {
      setNudge(true);
    }
  }

  const stepper = (idx: 0 | 1) => {
    const c = idx === 0 ? a! : b!;
    return (
      <div className="flex items-center gap-2">
        <span className="flex min-w-[64px] items-center gap-1.5 font-black text-[#3a2f52]"><span className="inline-block h-4 w-4 rounded-full border border-white shadow" style={{ background: c.colour }} /><span className="capitalize">{c.name}</span></span>
        <button type="button" onClick={() => adjust(idx, -1)} disabled={settled} aria-label={`fewer ${c.name} parts`} className="grid h-10 w-10 place-items-center rounded-lg border-2 border-[#e0d3f2] bg-white text-[#3a2f52] disabled:opacity-40"><Minus className="h-5 w-5" /></button>
        <span className="min-w-[2ch] text-center font-mono text-xl font-black tabular-nums text-[#6d3f9c]">{counts[idx]}</span>
        <button type="button" onClick={() => adjust(idx, 1)} disabled={settled} aria-label={`more ${c.name} parts`} className="grid h-10 w-10 place-items-center rounded-lg border-2 border-[#6d3f9c] bg-[#f1e8fb] text-[#3a2f52] disabled:opacity-40"><Plus className="h-5 w-5" /></button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <h2 className="text-xl font-extrabold leading-tight text-foreground md:text-2xl">{task.prompt}</h2>
        <ReadAloudBtn text={task.prompt} />
      </div>

      <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="flex flex-col items-center gap-2 rounded-xl border border-[#e4d8f5] bg-[#faf7ff] p-4">
          <svg viewBox="0 0 180 180" width="180" height="180" role="img" aria-label="Spinner preview">
            {wedges.map((colour, i) => {
              const [x0, y0] = pt(cx, cy, r, i * wedgeAngle);
              const [x1, y1] = pt(cx, cy, r, (i + 1) * wedgeAngle);
              return <path key={i} d={`M ${cx} ${cy} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${wedgeAngle > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`} fill={colour} stroke="#fff" strokeWidth={2} />;
            })}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={FRAME} strokeWidth={3} />
            <circle cx={cx} cy={cy} r={6} fill={INK} />
          </svg>
          <span className="text-sm font-bold" style={{ color: counts[0] === counts[1] ? "#2f7d4f" : "#6b6280" }}>
            {counts[0] === counts[1] ? "Equal parts — looks fair!" : `${counts[0]} vs ${counts[1]} — not equal yet`}
          </span>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-bold text-[#3a2f52]">Change the number of parts so both colours have the same amount.</p>
          {stepper(0)}
          {stepper(1)}
          {nudge ? <p className="text-sm font-bold text-[#c74f4b]">Not fair yet — the two colours need the same number of parts.</p> : null}
          <button type="button" onClick={check} disabled={settled} className="flex h-12 items-center gap-2 rounded-lg bg-[#6d3f9c] px-7 font-black text-white shadow-md transition hover:bg-[#5a3183] active:scale-95 disabled:opacity-40">
            <Check className="h-5 w-5" /> Check if it is fair
          </button>
        </div>
      </div>
    </div>
  );
}
