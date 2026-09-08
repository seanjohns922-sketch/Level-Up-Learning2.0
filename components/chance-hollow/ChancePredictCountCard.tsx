"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Minus, Plus, RotateCw, Swords } from "lucide-react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type Task = Extract<PracticeTask, { kind: "chancePredictCount" }>;

const FRAME = "#6d3f9c";
const INK = "#2c2140";
const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)]!;
function pt(cx: number, cy: number, r: number, deg: number): [number, number] {
  const A = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(A), cy + r * Math.sin(A)];
}

export default function ChancePredictCountCard({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: (answer?: string) => void }) {
  const { wedges, targetKey, targetName, spins } = task;
  const total = Math.max(wedges.length, 1);
  const redCount = wedges.filter((w) => w === targetKey).length;
  const expected = Math.round((spins * redCount) / total);

  const [chanzia] = useState(() => Math.min(spins, Math.max(0, expected + pick([-3, -2, -1, 1, 2, 3]))));
  const [phase, setPhase] = useState<"predict" | "running" | "result">("predict");
  const [guess, setGuess] = useState(Math.round(spins / 2));
  const [redSoFar, setRedSoFar] = useState(0);
  const [done, setDone] = useState(0);
  const [actual, setActual] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [settled, setSettled] = useState(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => { timers.current.forEach((id) => { window.clearTimeout(id); window.clearInterval(id); }); }, []);

  const wedgeAngle = 360 / total;
  const cx = 90, cy = 90, r = 76;

  function lockIn() {
    if (phase !== "predict") return;
    setPhase("running");
    let step = 0;
    let reds = 0;
    const iv = window.setInterval(() => {
      const idx = Math.floor(Math.random() * total);
      if (wedges[idx] === targetKey) reds += 1;
      setRedSoFar(reds);
      setDone(step + 1);
      setRotation((v) => v + 150 + Math.floor(Math.random() * 260));
      step += 1;
      if (step >= spins) { window.clearInterval(iv); setActual(reds); setPhase("result"); }
    }, 190);
    timers.current.push(iv);
  }

  const kidDist = Math.abs(guess - actual);
  const chanziaDist = Math.abs(chanzia - actual);
  const kidWon = kidDist <= 2 || kidDist <= chanziaDist;

  function finish() {
    if (settled) return;
    setSettled(true);
    if (kidWon) onCorrect(); else onWrong(String(guess));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <h2 className="text-xl font-extrabold leading-tight text-foreground md:text-2xl">{task.prompt}</h2>
        <ReadAloudBtn text={task.prompt} />
      </div>

      <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
        {/* Spinner */}
        <div className="flex flex-col items-center gap-2 rounded-xl border border-[#e4d8f5] bg-[#faf7ff] p-4">
          <svg viewBox="0 0 180 194" width="180" height="194" role="img" aria-label="Spinner">
            <g style={{ transition: phase === "running" ? "transform 0.18s linear" : undefined, transform: `rotate(${rotation}deg)`, transformOrigin: `${cx}px ${cy}px` }}>
              {wedges.map((colour, i) => {
                const [x0, y0] = pt(cx, cy, r, i * wedgeAngle);
                const [x1, y1] = pt(cx, cy, r, (i + 1) * wedgeAngle);
                return <path key={i} d={`M ${cx} ${cy} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${wedgeAngle > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`} fill={colour} stroke="#fff" strokeWidth={2} />;
              })}
              <circle cx={cx} cy={cy} r={r} fill="none" stroke={FRAME} strokeWidth={3} />
            </g>
            <path d={`M ${cx} ${cy - r - 8} l -9 16 l 18 0 z`} fill={INK} />
            <circle cx={cx} cy={cy} r={7} fill={INK} />
          </svg>
          <div className="text-sm font-bold text-[#6b6280]">{redCount} of {total} parts are {targetName}</div>
          {phase !== "predict" ? <div className="text-sm font-black text-[#6d3f9c]">Spin {done} of {spins} · {targetName} so far: {redSoFar}</div> : null}
        </div>

        {/* Right side */}
        <div className="space-y-3">
          {phase === "predict" ? (
            <>
              <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-rose-700"><Swords className="h-4 w-4" /> Predict, then beat Chanzia</div>
              <p className="text-sm font-bold text-[#3a2f52]">Out of {spins} spins, how many will land on {targetName}?</p>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setGuess((g) => Math.max(0, g - 1))} aria-label="fewer" className="grid h-11 w-11 place-items-center rounded-lg border-2 border-[#e0d3f2] bg-white text-[#3a2f52]"><Minus className="h-5 w-5" /></button>
                <span className="min-w-[3ch] text-center font-mono text-3xl font-black tabular-nums text-[#6d3f9c]">{guess}</span>
                <OptionReadAloudButton text={`${guess} ${targetName} results`} />
                <button type="button" onClick={() => setGuess((g) => Math.min(spins, g + 1))} aria-label="more" className="grid h-11 w-14 place-items-center rounded-lg border-2 border-[#6d3f9c] bg-[#f1e8fb] text-[#3a2f52]"><Plus className="h-5 w-5" /></button>
              </div>
              <button type="button" onClick={lockIn} className="flex h-12 items-center gap-2 rounded-lg bg-[#6d3f9c] px-6 font-black text-white shadow-md transition hover:bg-[#5a3183] active:scale-95">
                <RotateCw className="h-5 w-5" /> Lock in {guess} and spin
              </button>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border-2 border-[#6d3f9c] bg-[#f1e8fb] px-3 py-2"><div className="text-xs font-black uppercase text-[#6d3f9c]">You said</div><div className="font-mono text-2xl font-black text-[#2c2140]">{guess}</div></div>
                <div className="rounded-lg border-2 border-rose-300 bg-rose-50 px-3 py-2"><div className="text-xs font-black uppercase text-rose-700">Chanzia said</div><div className="font-mono text-2xl font-black text-rose-800">{chanzia}</div></div>
              </div>
              {phase === "result" ? (
                <div className="space-y-2">
                  <p className="text-lg font-black text-[#2c2140]">It landed on {targetName} <span className="text-[#6d3f9c]">{actual}</span> time{actual === 1 ? "" : "s"}.</p>
                  <p className="text-sm font-bold text-[#3a2f52]">You were off by {kidDist}. Chanzia was off by {chanziaDist}.</p>
                  <p className={`text-base font-black ${kidWon ? "text-emerald-700" : "text-rose-700"}`}>{kidWon ? (kidDist <= chanziaDist ? "You beat Chanzia!" : "Close enough — you win the round!") : "Chanzia was closer this time."}</p>
                  <button type="button" disabled={settled} onClick={finish} className="flex h-11 items-center gap-2 rounded-lg bg-[#6d3f9c] px-6 font-black text-white shadow-md transition hover:bg-[#5a3183] active:scale-95 disabled:opacity-40"><Check className="h-5 w-5" /> Finish round</button>
                </div>
              ) : (
                <p className="text-sm font-bold text-[#6b6280]" role="status">Spinning… counting the {targetName} results.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
