"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { getTile } from "@/data/activities/starpath/level6/tessellation";

type Task = Extract<PracticeTask, { kind: "starpathTessellation" }>;
type P = [number, number];
const VW = 320, VH = 190;
const PAL = ["#38bdf8", "#a78bfa", "#fbbf24", "#34d399", "#fb7185"];

type Node = { pts?: P[]; cx?: number; cy?: number; r?: number; fill: string };
const ptsStr = (a: P[]) => a.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

// Tiling generators, ported from the approved prototype.
function tileNodes(id: string): Node[] {
  const out: Node[] = [];
  const push = (pts: P[], i: number) => out.push({ pts, fill: PAL[i % 3]! });
  if (id === "square") {
    const s = 34; let i = 0;
    for (let y = -2; y < VH + s; y += s) for (let x = -2; x < VW + s; x += s) push([[x, y], [x + s, y], [x + s, y + s], [x, y + s]], i++);
  } else if (id === "rectangle") {
    const w = 48, h = 28; let i = 0;
    for (let y = -2; y < VH + h; y += h) for (let x = -2; x < VW + w; x += w) push([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], i++);
  } else if (id === "parallelogram") {
    const w = 40, h = 30, sk = 16; let i = 0;
    for (let y = -2; y < VH + h; y += h) for (let x = -60; x < VW + w; x += w) { const o = (Math.round((y) / h) * sk) % w; push([[x + o, y], [x + w + o, y], [x + w - sk + o, y + h], [x - sk + o, y + h]], i++); }
  } else if (id === "triangle") {
    const a = 42, rh = a * Math.sqrt(3) / 2;
    for (let y = -rh; y < VH + rh; y += rh) { let i = 0; for (let x = -a; x < VW + a; x += a) { push([[x, y + rh], [x + a, y + rh], [x + a / 2, y]], i % 2); push([[x + a / 2, y], [x + 3 * a / 2, y], [x + a, y + rh]], (i + 1) % 2); i++; } }
  } else if (id === "hexagon") {
    const R = 22, hx = 1.5 * R, vy = Math.sqrt(3) * R; let i = 0;
    for (let c = -1; c * hx < VW + R; c += 1) for (let r = -1; r * vy < VH + R; r += 1) { const cx = c * hx, cy = r * vy + (c % 2 ? vy / 2 : 0); const pts: P[] = []; for (let k = 0; k < 6; k += 1) { const ang = (Math.PI / 3) * k; pts.push([cx + R * Math.cos(ang), cy + R * Math.sin(ang)]); } push(pts, i++); }
  } else if (id === "lshape") {
    // L-trominoes pair into 2x3 blocks that tile by translation.
    const u = 20; let i = 0;
    for (let y = -2; y < VH + 3 * u; y += 3 * u) for (let x = -2; x < VW + 2 * u; x += 2 * u) {
      push([[x, y], [x + u, y], [x + u, y + 2 * u], [x + 2 * u, y + 2 * u], [x + 2 * u, y + 3 * u], [x, y + 3 * u]], i++);
      push([[x + u, y], [x + 2 * u, y], [x + 2 * u, y + 2 * u], [x + u, y + 2 * u]], i++);
    }
  } else if (id === "pentagon") {
    const R = 28; let i = 0;
    for (let y = R; y < VH + R; y += R * 1.9) for (let x = R; x < VW + R; x += R * 1.9) { const pts: P[] = []; for (let k = 0; k < 5; k += 1) { const ang = -Math.PI / 2 + (2 * Math.PI / 5) * k; pts.push([x + R * Math.cos(ang), y + R * Math.sin(ang)]); } push(pts, i++); }
  } else {
    // circle
    const r = 20; let i = 0;
    for (let y = r; y < VH + r; y += r * 2) for (let x = r; x < VW + r; x += r * 2) out.push({ cx: x, cy: y, r, fill: PAL[(i++) % 3]! });
  }
  return out;
}

export default function StarpathTessellationCard({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: (answer?: string) => void }) {
  const tile = getTile(task.tileId);
  const [chosen, setChosen] = useState<string | null>(null);
  const [settled, setSettled] = useState(false);
  const nodes = tileNodes(tile.id);

  function submit() {
    if (settled || !chosen) return;
    setSettled(true);
    if (task.correctOptionIds.includes(chosen)) onCorrect(); else onWrong(chosen);
  }

  return (
    <div className="space-y-4">
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="mx-auto w-fit rounded-2xl border border-cyan-300/25 bg-slate-950 p-2 shadow-[0_16px_40px_-20px_rgba(8,145,178,0.5)]">
        <svg viewBox={`0 0 ${VW} ${VH}`} className="h-auto w-[min(21rem,82vw)]" role="img" aria-label={`${tile.name} tiling`}>
          <clipPath id="tessclip"><rect x="0" y="0" width={VW} height={VH} rx="10" /></clipPath>
          <g clipPath="url(#tessclip)">
            {nodes.map((n, i) => n.pts
              ? <polygon key={i} points={ptsStr(n.pts)} fill={n.fill} fillOpacity={0.82} stroke="rgba(11,10,36,0.55)" strokeWidth={1.1} strokeLinejoin="round" />
              : <circle key={i} cx={n.cx} cy={n.cy} r={n.r} fill={n.fill} fillOpacity={0.82} stroke="rgba(11,10,36,0.5)" strokeWidth={1.1} />)}
          </g>
        </svg>
      </div>
      <div className="mx-auto grid max-w-md gap-2 sm:grid-cols-2">
        {task.options.map((option) => (
          <button key={option.id} type="button" onClick={() => !settled && setChosen(option.id)} className={["rounded-2xl border-2 p-3 text-center text-sm font-black transition", chosen === option.id ? "border-cyan-500 bg-cyan-50 text-indigo-950 ring-2 ring-cyan-300" : "border-violet-200 bg-white text-indigo-900 hover:border-cyan-400"].join(" ")}>{option.label}</button>
        ))}
      </div>
      <div className="flex justify-center">
        <button type="button" onClick={submit} disabled={settled || !chosen} className="flex h-12 items-center gap-2 rounded-2xl bg-emerald-600 px-7 font-black text-white shadow-md transition hover:bg-emerald-700 active:scale-95 disabled:opacity-40"><Check className="h-5 w-5" /> Check</button>
      </div>
    </div>
  );
}
