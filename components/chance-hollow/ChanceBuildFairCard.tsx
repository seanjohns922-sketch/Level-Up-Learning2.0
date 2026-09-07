"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Check, Minus, Play, Plus, Swords } from "lucide-react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type Task = Extract<PracticeTask, { kind: "chanceBuildFair" }>;

const FRAME = "#6d3f9c";
const INK = "#2c2140";

function pt(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function SpinnerWheel({ wedges, rotation = 0, spinning = false }: { wedges: string[]; rotation?: number; spinning?: boolean }) {
  const n = Math.max(wedges.length, 1);
  const wedgeAngle = 360 / n;
  const cx = 90, cy = 90, r = 76;
  return (
    <div className="relative h-[190px] w-[190px]">
      <div className="absolute left-1/2 top-0 z-10 h-0 w-0 -translate-x-1/2 border-x-[10px] border-t-[18px] border-x-transparent border-t-[#f59e0b] drop-shadow" />
      <svg
        viewBox="0 0 180 180"
        width="180"
        height="180"
        className="absolute bottom-0 left-[5px]"
        style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? "transform 950ms cubic-bezier(0.2, 0.75, 0.2, 1)" : undefined }}
        role="img"
        aria-label="Fair game spinner"
      >
        {wedges.map((colour, index) => {
          const [x0, y0] = pt(cx, cy, r, index * wedgeAngle);
          const [x1, y1] = pt(cx, cy, r, (index + 1) * wedgeAngle);
          return <path key={index} d={`M ${cx} ${cy} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${wedgeAngle > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`} fill={colour} stroke="#fff" strokeWidth={2} />;
        })}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={FRAME} strokeWidth={4} />
        <circle cx={cx} cy={cy} r={7} fill={INK} />
      </svg>
    </div>
  );
}

export default function ChanceBuildFairCard({ task, onCorrect }: { task: Task; onCorrect: () => void; onWrong: (answer?: string) => void }) {
  const [a, b] = task.colours;
  const [counts, setCounts] = useState<[number, number]>([3, 1]);
  const [phase, setPhase] = useState<"fix" | "battle" | "finished">("fix");
  const [nudge, setNudge] = useState(false);
  const [score, setScore] = useState<[number, number]>([0, 0]);
  const [history, setHistory] = useState<Array<"student" | "chanzia">>([]);
  const [lastWinner, setLastWinner] = useState<"student" | "chanzia" | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  const wedges: string[] = [
    ...Array(counts[0]).fill(a!.colour),
    ...Array(counts[1]).fill(b!.colour),
  ];

  function adjust(idx: 0 | 1, delta: number) {
    if (phase !== "fix") return;
    setNudge(false);
    setCounts((c) => {
      const next: [number, number] = [c[0], c[1]];
      next[idx] = Math.min(task.maxParts, Math.max(1, next[idx] + delta));
      return next;
    });
  }

  function check() {
    if (phase !== "fix") return;
    if (counts[0] === counts[1]) {
      setNudge(false);
      setPhase("battle");
    } else {
      setNudge(true);
    }
  }

  function spin() {
    if (phase !== "battle" || spinning) return;
    setSpinning(true);
    setLastWinner(null);
    const outcomeIndex = Math.floor(Math.random() * wedges.length);
    const result: "student" | "chanzia" = outcomeIndex < counts[0] ? "student" : "chanzia";
    const targetAngle = 360 - ((outcomeIndex + 0.5) * 360) / wedges.length;
    setRotation((current) => (Math.floor(current / 360) + 3) * 360 + targetAngle);
    timerRef.current = window.setTimeout(() => {
      const nextScore: [number, number] = [score[0] + (result === "student" ? 1 : 0), score[1] + (result === "chanzia" ? 1 : 0)];
      setScore(nextScore);
      setHistory((current) => [...current, result]);
      setLastWinner(result);
      setSpinning(false);
      if (nextScore[0] === 3 || nextScore[1] === 3) {
        setPhase("finished");
        onCorrect();
      }
    }, 975);
  }

  const stepper = (idx: 0 | 1) => {
    const c = idx === 0 ? a! : b!;
    return (
      <div className="flex items-center gap-2">
        <span className="flex min-w-[64px] items-center gap-1.5 font-black text-[#3a2f52]"><span className="inline-block h-4 w-4 rounded-full border border-white shadow" style={{ background: c.colour }} /><span className="capitalize">{c.name}</span></span>
        <button type="button" onClick={() => adjust(idx, -1)} disabled={phase !== "fix"} aria-label={`fewer ${c.name} parts`} className="grid h-10 w-10 place-items-center rounded-lg border-2 border-[#e0d3f2] bg-white text-[#3a2f52] disabled:opacity-40"><Minus className="h-5 w-5" /></button>
        <span className="min-w-[2ch] text-center font-mono text-xl font-black tabular-nums text-[#6d3f9c]">{counts[idx]}</span>
        <button type="button" onClick={() => adjust(idx, 1)} disabled={phase !== "fix"} aria-label={`more ${c.name} parts`} className="grid h-10 w-10 place-items-center rounded-lg border-2 border-[#6d3f9c] bg-[#f1e8fb] text-[#3a2f52] disabled:opacity-40"><Plus className="h-5 w-5" /></button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <h2 className="text-xl font-extrabold leading-tight text-foreground md:text-2xl">{task.prompt}</h2>
        <ReadAloudBtn text={task.prompt} />
      </div>

      {phase === "fix" ? (
        <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="flex flex-col items-center gap-2 rounded-xl border border-[#e4d8f5] bg-[#faf7ff] p-4">
            <SpinnerWheel wedges={wedges} />
            <span className="text-sm font-bold" style={{ color: counts[0] === counts[1] ? "#2f7d4f" : "#6b6280" }}>
              {counts[0] === counts[1] ? "Equal parts — ready to play!" : `${counts[0]} vs ${counts[1]} — unfair`}
            </span>
          </div>
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-rose-700"><Swords className="h-4 w-4" /> Fix the game first</div>
            <p className="text-sm font-bold text-[#3a2f52]">Change the parts so your colour and Chanzia&apos;s colour have the same chance.</p>
            {stepper(0)}
            {stepper(1)}
            {nudge ? <p className="text-sm font-bold text-[#c74f4b]">Not fair yet — the two colours need the same number of parts.</p> : null}
            <button type="button" onClick={check} className="flex h-12 items-center gap-2 rounded-lg bg-[#6d3f9c] px-7 font-black text-white shadow-md transition hover:bg-[#5a3183] active:scale-95">
              <Check className="h-5 w-5" /> Fix and challenge Chanzia
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-[#d8c6ee] bg-[linear-gradient(135deg,#faf7ff,#f5ecff)] p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.16em] text-[#8b3f84]">Fair game showdown</div>
              <h3 className="mt-1 text-2xl font-black text-[#2c2140]">First to 3 wins</h3>
            </div>
            <div className="rounded-lg bg-[#2c2140] px-4 py-2 font-mono text-xl font-black text-white">{score[0]} — {score[1]}</div>
          </div>
          <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
            <div className="rounded-lg border-2 p-4 text-center" style={{ borderColor: a!.colour, background: `${a!.colour}18` }}>
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full text-2xl font-black text-white shadow-lg" style={{ background: a!.colour }}>YOU</div>
              <div className="mt-3 text-lg font-black text-[#2c2140]">Your colour: <span className="capitalize">{a!.name}</span></div>
              <div className="mt-1 text-3xl font-black" style={{ color: a!.colour }}>{score[0]}</div>
            </div>
            <div className="flex flex-col items-center">
              <SpinnerWheel wedges={wedges} rotation={rotation} spinning={spinning} />
              <div className="mt-2 flex min-h-6 items-center gap-1.5 text-sm font-black text-[#5a416f]">
                {lastWinner ? <><span className="h-3 w-3 rounded-full" style={{ background: lastWinner === "student" ? a!.colour : b!.colour }} />{lastWinner === "student" ? "You won that spin!" : "Chanzia won that spin!"}</> : "The repaired spinner gives equal chances."}
              </div>
            </div>
            <div className="rounded-lg border-2 p-3 text-center" style={{ borderColor: b!.colour, background: `${b!.colour}18` }}>
              <Image src="/images/chanzia-flick-cutout.png" alt="Chanzia Flick, your Level 4 Chance Hollow opponent" width={220} height={263} className="mx-auto max-h-64 w-auto object-contain drop-shadow-[0_12px_12px_rgba(44,33,64,0.28)]" />
              <div className="mt-2 text-lg font-black text-[#2c2140]">Chanzia: <span className="capitalize">{b!.name}</span></div>
              <div className="mt-1 text-3xl font-black" style={{ color: b!.colour }}>{score[1]}</div>
            </div>
          </div>
          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex gap-2" aria-label="Spin history">
              {history.map((winner, index) => <span key={index} className="h-4 w-4 rounded-full border-2 border-white shadow" style={{ background: winner === "student" ? a!.colour : b!.colour }} />)}
            </div>
            {phase === "battle" ? (
              <button type="button" onClick={spin} disabled={spinning} className="flex h-12 items-center gap-2 rounded-lg bg-gradient-to-r from-[#6d3f9c] via-[#b1368c] to-[#f59e0b] px-8 font-black text-white shadow-lg transition hover:brightness-110 active:scale-95 disabled:opacity-60">
                <Play className="h-5 w-5 fill-current" /> {spinning ? "Spinning…" : "Spin the fair game"}
              </button>
            ) : (
              <div className="rounded-lg bg-[#2c2140] px-5 py-3 text-center font-black text-white">
                {score[0] === 3 ? "You beat Chanzia!" : "Chanzia wins this time — and the game was still fair."}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
