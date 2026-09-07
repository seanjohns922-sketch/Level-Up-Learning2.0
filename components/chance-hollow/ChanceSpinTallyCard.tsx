"use client";

import { useEffect, useRef, useState } from "react";
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

const DIE_PIPS: Record<number, ReadonlyArray<[number, number]>> = {
  1: [[0.5, 0.5]],
  2: [[0.3, 0.3], [0.7, 0.7]],
  3: [[0.3, 0.3], [0.5, 0.5], [0.7, 0.7]],
  4: [[0.32, 0.32], [0.68, 0.32], [0.32, 0.68], [0.68, 0.68]],
  5: [[0.32, 0.32], [0.68, 0.32], [0.5, 0.5], [0.32, 0.68], [0.68, 0.68]],
  6: [[0.32, 0.28], [0.68, 0.28], [0.32, 0.5], [0.68, 0.5], [0.32, 0.72], [0.68, 0.72]],
};

function DieFace({ face }: { face: number }) {
  const pips = DIE_PIPS[Math.min(Math.max(face, 1), 6)] ?? DIE_PIPS[1]!;
  const s = 120, pad = 10;
  return (
    <svg viewBox="0 0 140 140" width="150" height="150" role="img" aria-label={`Die showing ${face}`}>
      <rect x={pad} y={pad} width={s} height={s} rx={22} fill="#ffffff" stroke={FRAME} strokeWidth={4} />
      {pips.map(([px, py], i) => <circle key={i} cx={pad + px * s} cy={pad + py * s} r={10} fill={INK} />)}
    </svg>
  );
}

function CoinFace({ side }: { side: string }) {
  return (
    <svg viewBox="0 0 150 150" width="150" height="150" role="img" aria-label={`Coin showing ${side}`}>
      <circle cx={75} cy={75} r={62} fill="#f4c542" stroke="#b8860b" strokeWidth={5} />
      <circle cx={75} cy={75} r={50} fill="none" stroke="#d9a521" strokeWidth={3} />
      <text x={75} y={96} textAnchor="middle" fontSize={56} fontWeight={900} fill="#7a5b12">{side === "tails" ? "T" : "H"}</text>
    </svg>
  );
}

export default function ChanceSpinTallyCard({ task, onCorrect }: { task: Task; onCorrect: () => void; onWrong: (answer?: string) => void }) {
  const { tool, draw, labels, spins } = task;
  const n = Math.max(draw.length, 1);
  const wedgeAngle = 360 / n;
  const distinctKeys = labels.map((l) => l.key);

  const [rotation, setRotation] = useState(0);
  const [busy, setBusy] = useState(false);
  const [display, setDisplay] = useState<string>(distinctKeys[0] ?? "");
  const [landed, setLanded] = useState<string | null>(null); // outcome awaiting a tally
  const [tallies, setTallies] = useState<Record<string, number>>({});
  const [done, setDone] = useState(0);
  const [nudge, setNudge] = useState(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => { timers.current.forEach((id) => { window.clearTimeout(id); window.clearInterval(id); }); }, []);

  const finished = done >= spins;
  const nameOf = (key: string) => labels.find((l) => l.key === key)?.name ?? "that one";
  const actionWord = tool === "coin" ? "Flip" : tool === "die" ? "Roll" : "Spin";

  function act() {
    if (busy || landed || finished) return;
    setBusy(true);
    setNudge(false);
    const idx = Math.floor(Math.random() * n);
    const result = draw[idx]!;

    if (tool === "spinner") {
      const centre = idx * wedgeAngle + wedgeAngle / 2;
      const base = Math.ceil((rotation + 1) / 360) * 360;
      setRotation(base + 360 * 4 + (360 - centre));
      timers.current.push(window.setTimeout(() => { setBusy(false); setLanded(result); }, 1500));
      return;
    }
    // coin / die: flicker through faces, then settle on the result
    let ticks = 0;
    const iv = window.setInterval(() => {
      ticks += 1;
      setDisplay(distinctKeys[Math.floor(Math.random() * distinctKeys.length)]!);
      if (ticks >= 11) {
        window.clearInterval(iv);
        setDisplay(result);
        setBusy(false);
        setLanded(result);
      }
    }, 90);
    timers.current.push(iv);
  }

  function record(key: string) {
    if (busy || !landed || finished) return;
    // A mis-tap just nudges — it must not end the task, so we do not call onWrong.
    if (key !== landed) { setNudge(true); return; }
    setNudge(false);
    setTallies((t) => ({ ...t, [key]: (t[key] ?? 0) + 1 }));
    setLanded(null);
    setDone((d) => {
      const next = d + 1;
      if (next >= spins) timers.current.push(window.setTimeout(() => onCorrect(), 450));
      return next;
    });
  }

  const shown = landed ?? display;
  const cx = 90, cy = 90, r = 78;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <h2 className="text-xl font-extrabold leading-tight text-foreground md:text-2xl">{task.prompt}</h2>
        <ReadAloudBtn text={task.prompt} />
      </div>

      <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
        {/* Tool */}
        <div className="flex flex-col items-center gap-3 rounded-xl border border-[#e4d8f5] bg-[#faf7ff] p-4">
          {tool === "spinner" ? (
            <svg viewBox="0 0 180 194" width="180" height="194" role="img" aria-label="Spinner">
              <g style={{ transition: busy ? "transform 1.5s cubic-bezier(0.17,0.67,0.32,1.3)" : "none", transform: `rotate(${rotation}deg)`, transformOrigin: `${cx}px ${cy}px` }}>
                {draw.map((colour, i) => {
                  const [x0, y0] = pt(cx, cy, r, i * wedgeAngle);
                  const [x1, y1] = pt(cx, cy, r, (i + 1) * wedgeAngle);
                  const large = wedgeAngle > 180 ? 1 : 0;
                  return <path key={i} d={`M ${cx} ${cy} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`} fill={colour} stroke="#ffffff" strokeWidth={2} />;
                })}
                <circle cx={cx} cy={cy} r={r} fill="none" stroke={FRAME} strokeWidth={3} />
              </g>
              <path d={`M ${cx} ${cy - r - 8} l -9 16 l 18 0 z`} fill={INK} />
              <circle cx={cx} cy={cy} r={7} fill={INK} />
            </svg>
          ) : (
            <div className={busy ? "animate-pulse" : ""}>
              {tool === "die" ? <DieFace face={Number(shown) || 1} /> : <CoinFace side={shown} />}
            </div>
          )}
          <button type="button" onClick={act} disabled={busy || !!landed || finished} className="flex h-11 items-center gap-2 rounded-lg bg-[#6d3f9c] px-6 font-black text-white shadow-md transition hover:bg-[#5a3183] active:scale-95 disabled:opacity-40">
            <RotateCw className={busy ? "h-5 w-5 animate-spin" : "h-5 w-5"} /> {actionWord}
          </button>
          <div className="text-sm font-bold text-[#6b6280]">Recorded {done} of {spins}</div>
        </div>

        {/* Record area */}
        <div className="space-y-2">
          <p className="text-sm font-bold text-[#3a2f52]" role="status">
            {finished ? "All done — nice tallying!" : landed ? `It landed on ${nameOf(landed)}. Tap ${nameOf(landed)} to record it.` : `Press ${actionWord}, then record where it lands.`}
          </p>
          {nudge && landed ? <p className="text-sm font-bold text-[#c74f4b]">That is not where it landed — tap {nameOf(landed)}.</p> : null}
          <div className="grid gap-2 sm:grid-cols-2">
            {labels.map((l) => {
              const active = landed === l.key;
              return (
                <div key={l.key} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => record(l.key)}
                    disabled={!landed || finished}
                    className={["flex min-w-[112px] items-center justify-between gap-2 rounded-lg border-2 px-3 py-2.5 text-left font-black transition disabled:opacity-70", active ? "border-[#6d3f9c] bg-[#f1e8fb] ring-2 ring-[#6d3f9c]/40" : "border-[#e0d3f2] bg-white"].join(" ")}
                  >
                    <span className="flex items-center gap-2">
                      {l.colour ? <span className="inline-block h-4 w-4 rounded-full border border-white shadow" style={{ background: l.colour }} /> : null}
                      <span className="capitalize text-[#3a2f52]">{l.name}</span>
                    </span>
                    <OptionReadAloudButton text={l.name} />
                  </button>
                  <TallyMarks n={tallies[l.key] ?? 0} />
                  <span className="font-mono text-lg font-black tabular-nums text-[#6d3f9c]">{tallies[l.key] ?? 0}</span>
                </div>
              );
            })}
          </div>
          {finished ? <div className="pt-1 text-sm font-bold text-[#2f7d4f]"><Check className="mr-1 inline h-4 w-4" />Tally complete</div> : null}
        </div>
      </div>
    </div>
  );
}
