"use client";

import { useState } from "react";
import { Check, RotateCw } from "lucide-react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type Task = Extract<PracticeTask, { kind: "chanceSpinTally" }>;

const FRAME = "#6d3f9c";
const INK = "#2c2140";

// Point on a circle, `deg` measured clockwise from the top (12 o'clock).
function pt(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function TallyGroup({ n }: { n: number }) {
  return (
    <svg viewBox="0 0 34 34" className="h-8 w-8" aria-hidden="true">
      {Array.from({ length: Math.min(n, 4) }, (_, i) => (
        <line key={i} x1={5 + i * 7} y1={4} x2={5 + i * 7} y2={30} stroke={FRAME} strokeWidth={2.6} strokeLinecap="round" />
      ))}
      {n >= 5 ? <line x1={2} y1={30} x2={32} y2={4} stroke="#e05a52" strokeWidth={2.8} strokeLinecap="round" /> : null}
    </svg>
  );
}

function TallyMarks({ n }: { n: number }) {
  const groups: number[] = [];
  let left = n;
  while (left > 0) { groups.push(Math.min(5, left)); left -= 5; }
  return (
    <div className="flex min-h-[34px] flex-wrap items-center gap-1.5">
      {groups.map((g, i) => <TallyGroup key={i} n={g} />)}
    </div>
  );
}

export default function ChanceSpinTallyCard({ task, onCorrect }: { task: Task; onCorrect: () => void; onWrong: (answer?: string) => void }) {
  const { wedges, labels, spins } = task;
  const n = Math.max(wedges.length, 1);
  const wedgeAngle = 360 / n;

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [landed, setLanded] = useState<string | null>(null); // colour awaiting a tally
  const [tallies, setTallies] = useState<Record<string, number>>({});
  const [done, setDone] = useState(0);
  const [nudge, setNudge] = useState(false);

  const finished = done >= spins;
  const nameOf = (colour: string) => labels.find((l) => l.colour === colour)?.name ?? "that colour";

  function spin() {
    if (spinning || landed || finished) return;
    const idx = Math.floor(Math.random() * n);
    const colour = wedges[idx]!;
    const centre = idx * wedgeAngle + wedgeAngle / 2;
    // Land wedge `idx` under the fixed top pointer: rotation ≡ (360 - centre).
    const base = Math.ceil((rotation + 1) / 360) * 360;
    const target = base + 360 * 4 + (360 - centre);
    setSpinning(true);
    setNudge(false);
    setRotation(target);
    window.setTimeout(() => {
      setSpinning(false);
      setLanded(colour);
    }, 1500);
  }

  function record(colour: string) {
    if (spinning || !landed || finished) return;
    // A mis-tap just nudges — it must not end the task, so we do not call onWrong.
    if (colour !== landed) { setNudge(true); return; }
    setNudge(false);
    setTallies((t) => ({ ...t, [colour]: (t[colour] ?? 0) + 1 }));
    setLanded(null);
    setDone((d) => {
      const next = d + 1;
      if (next >= spins) window.setTimeout(() => onCorrect(), 450);
      return next;
    });
  }

  const cx = 90, cy = 90, r = 78;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <h2 className="text-xl font-extrabold leading-tight text-foreground md:text-2xl">{task.prompt}</h2>
        <ReadAloudBtn text={task.prompt} />
      </div>

      <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
        {/* Spinner */}
        <div className="flex flex-col items-center gap-2 rounded-xl border border-[#e4d8f5] bg-[#faf7ff] p-4">
          <svg viewBox="0 0 180 194" width="180" height="194" role="img" aria-label="Spinner">
            <g style={{ transition: spinning ? "transform 1.5s cubic-bezier(0.17,0.67,0.32,1.3)" : "none", transform: `rotate(${rotation}deg)`, transformOrigin: `${cx}px ${cy}px` }}>
              {wedges.map((colour, i) => {
                const [x0, y0] = pt(cx, cy, r, i * wedgeAngle);
                const [x1, y1] = pt(cx, cy, r, (i + 1) * wedgeAngle);
                const large = wedgeAngle > 180 ? 1 : 0;
                return <path key={i} d={`M ${cx} ${cy} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`} fill={colour} stroke="#ffffff" strokeWidth={2} />;
              })}
              <circle cx={cx} cy={cy} r={r} fill="none" stroke={FRAME} strokeWidth={3} />
            </g>
            {/* fixed pointer at top */}
            <path d={`M ${cx} ${cy - r - 8} l -9 16 l 18 0 z`} fill={INK} />
            <circle cx={cx} cy={cy} r={7} fill={INK} />
          </svg>
          <button type="button" onClick={spin} disabled={spinning || !!landed || finished} className="flex h-11 items-center gap-2 rounded-lg bg-[#6d3f9c] px-6 font-black text-white shadow-md transition hover:bg-[#5a3183] active:scale-95 disabled:opacity-40">
            <RotateCw className={spinning ? "h-5 w-5 animate-spin" : "h-5 w-5"} /> Spin
          </button>
          <div className="text-sm font-bold text-[#6b6280]">Recorded {done} of {spins}</div>
        </div>

        {/* Record area */}
        <div className="space-y-2">
          <p className="text-sm font-bold text-[#3a2f52]" role="status">
            {finished ? "All done — nice tallying!" : landed ? `It landed on ${nameOf(landed)}. Tap ${nameOf(landed)} to record it.` : "Press Spin, then record where it lands."}
          </p>
          {nudge && landed ? <p className="text-sm font-bold text-[#c74f4b]">That is not where it landed — tap {nameOf(landed)}.</p> : null}
          <div className="space-y-2">
            {labels.map((l) => {
              const active = landed === l.colour;
              return (
                <div key={l.colour} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => record(l.colour)}
                    disabled={!landed || finished}
                    className={["flex min-w-[132px] items-center justify-between gap-2 rounded-lg border-2 px-3 py-2.5 text-left font-black transition disabled:opacity-70", active ? "border-[#6d3f9c] bg-[#f1e8fb] ring-2 ring-[#6d3f9c]/40" : "border-[#e0d3f2] bg-white"].join(" ")}
                  >
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-4 w-4 rounded-full border border-white shadow" style={{ background: l.colour }} />
                      <span className="capitalize text-[#3a2f52]">{l.name}</span>
                    </span>
                    <OptionReadAloudButton text={l.name} />
                  </button>
                  <TallyMarks n={tallies[l.colour] ?? 0} />
                  <span className="font-mono text-lg font-black tabular-nums text-[#6d3f9c]">{tallies[l.colour] ?? 0}</span>
                </div>
              );
            })}
          </div>
          {finished ? (
            <div className="pt-1 text-sm font-bold text-[#2f7d4f]"><Check className="mr-1 inline h-4 w-4" />Tally complete</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
