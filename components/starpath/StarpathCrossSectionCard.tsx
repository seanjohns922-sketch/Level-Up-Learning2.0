"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { getCrossObject, type CrossObject } from "@/data/activities/starpath/level6/crossSections";

type Task = Extract<PracticeTask, { kind: "starpathCrossSection" }>;

// Oblique geometry, ported from the approved slicer prototype.
type P = [number, number];
const DX = 30, DY = -16, CX = 104, W = 88, YB = 178, YT = 54, H = YB - YT;
const add = (p: P, dx: number, dy: number): P => [p[0] + dx, p[1] + dy];
const lerp = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const ptsStr = (a: P[]) => a.map((p) => p.join(",")).join(" ");
const COL = { front: "#3b82f6", top: "#60a5fa", side: "#2563eb", cyl: "#38bdf8", pyr: "#a78bfa", cut: "#fbbf24" };

function baseOutline(base: CrossObject["base"], cx: number, y: number, s: number): P[] {
  const hw = (W / 2) * s, d: P = [DX * s, DY * s];
  if (base === "rect" || base === "sq") {
    const w = base === "sq" ? hw * 0.9 : hw;
    const fl: P = [cx - w, y], fr: P = [cx + w, y];
    return [fl, fr, add(fr, d[0], d[1]), add(fl, d[0], d[1])];
  }
  if (base === "tri") {
    return [[cx - hw, y], [cx + hw, y], add([cx, y], d[0] * 1.5, d[1] * 1.5)];
  }
  // hexagon
  const a = hw;
  return [[cx - a * 0.5, y], [cx + a * 0.5, y], add([cx + a, y], d[0] * 0.4, d[1] * 0.4), add([cx + a * 0.5, y], d[0] * 0.9, d[1] * 0.9), add([cx - a * 0.5, y], d[0] * 0.9, d[1] * 0.9), add([cx - a, y], d[0] * 0.4, d[1] * 0.4)];
}

type SceneEl =
  | { k: "poly"; pts: P[]; fill: string; op: number; stroke?: string }
  | { k: "ellipse"; cx: number; cy: number; rx: number; ry: number; fill: string; op: number; stroke?: string }
  | { k: "path"; d: string; fill: string; op: number; stroke?: string };

function buildScene(object: CrossObject, t: number): SceneEl[] {
  const els: SceneEl[] = [];
  const yCut = YB - H * t;
  const scale = object.constantSection ? 1 : 1 - t; // pyramids/cones shrink

  if (object.base === "circ") {
    const rx0 = W / 2, ry0 = 15;
    const rx1 = (W / 2) * (object.constantSection ? 1 : 0), ry1 = 15 * (object.constantSection ? 1 : 0);
    els.push({ k: "path", d: `M ${CX - rx0} ${YB} L ${CX - rx1} ${YT} A ${Math.max(rx1, 0.5)} ${Math.max(ry1, 0.5)} 0 0 0 ${CX + rx1} ${YT} L ${CX + rx0} ${YB} A ${rx0} ${ry0} 0 0 1 ${CX - rx0} ${YB} Z`, fill: COL.cyl, op: 0.5, stroke: "rgba(255,255,255,.3)" });
    els.push({ k: "ellipse", cx: CX, cy: YT, rx: Math.max(rx1, 0.6), ry: Math.max(ry1, 0.6), fill: COL.cyl, op: 0.75, stroke: "rgba(255,255,255,.5)" });
    els.push({ k: "ellipse", cx: CX, cy: yCut, rx: (W / 2) * scale, ry: 15 * scale, fill: COL.cut, op: 0.88, stroke: "#fff" });
    els.push({ k: "ellipse", cx: CX, cy: YB, rx: rx0, ry: ry0, fill: "none", op: 1, stroke: "rgba(255,255,255,.3)" });
    return els;
  }

  const b0 = baseOutline(object.base, CX, YB, 1);
  if (object.kind === "pyramid") {
    const apex = add([CX, YT], DX * 0.5, DY * 0.5);
    for (let i = 0; i < b0.length; i += 1) {
      els.push({ k: "poly", pts: [b0[i]!, b0[(i + 1) % b0.length]!, apex], fill: COL.pyr, op: 0.5 });
    }
    els.push({ k: "poly", pts: b0, fill: COL.side, op: 0.35 });
    // slice corners ride the lateral edges, so it lines up with the pyramid
    els.push({ k: "poly", pts: b0.map((c) => lerp(c, apex, t)), fill: COL.cut, op: 0.88, stroke: "#fff" });
    return els;
  }

  // extruded prism
  const top = b0.map((p): P => [p[0], p[1] - H]);
  for (let i = 0; i < b0.length; i += 1) {
    const a = b0[i]!, b = b0[(i + 1) % b0.length]!;
    els.push({ k: "poly", pts: [a, b, [b[0], b[1] - H], [a[0], a[1] - H]], fill: COL.side, op: 0.42 });
  }
  els.push({ k: "poly", pts: top, fill: COL.top, op: 0.8 });
  els.push({ k: "poly", pts: b0, fill: COL.front, op: 0.2 });
  els.push({ k: "poly", pts: baseOutline(object.base, CX, yCut, 1), fill: COL.cut, op: 0.88, stroke: "#fff" });
  return els;
}

function SceneEls({ els }: { els: SceneEl[] }) {
  return (
    <>
      {els.map((e, i) => {
        if (e.k === "ellipse") return <ellipse key={i} cx={e.cx} cy={e.cy} rx={e.rx} ry={e.ry} fill={e.fill} fillOpacity={e.op} stroke={e.stroke ?? "rgba(255,255,255,.35)"} strokeWidth={1.3} />;
        if (e.k === "path") return <path key={i} d={e.d} fill={e.fill} fillOpacity={e.op} stroke={e.stroke ?? "rgba(255,255,255,.35)"} strokeWidth={1.2} />;
        return <polygon key={i} points={ptsStr(e.pts)} fill={e.fill} fillOpacity={e.op} stroke={e.stroke ?? "rgba(255,255,255,.35)"} strokeWidth={1.2} strokeLinejoin="round" />;
      })}
    </>
  );
}

function SectionShape({ object, t }: { object: CrossObject; t: number }) {
  const s = object.constantSection ? 1 : 1 - t;
  const cx = 60, cy = 48, fill = COL.cut, stroke = "#b45309";
  let node: React.ReactNode;
  if (object.base === "circ") {
    node = <ellipse cx={cx} cy={cy} rx={36 * s} ry={36 * s} fill={fill} fillOpacity={0.9} stroke={stroke} strokeWidth={2} />;
  } else if (object.base === "tri") {
    const a = 40 * s;
    node = <polygon points={ptsStr([[cx - a, cy + a * 0.7], [cx + a, cy + a * 0.7], [cx, cy - a * 0.7]])} fill={fill} fillOpacity={0.9} stroke={stroke} strokeWidth={2} />;
  } else if (object.base === "hex") {
    const a = 36 * s, pts: P[] = [];
    for (let i = 0; i < 6; i += 1) { const ang = Math.PI / 6 + (i * Math.PI) / 3; pts.push([cx + a * Math.cos(ang), cy + a * Math.sin(ang)]); }
    node = <polygon points={ptsStr(pts)} fill={fill} fillOpacity={0.9} stroke={stroke} strokeWidth={2} />;
  } else {
    const w = (object.base === "sq" ? 32 : 42) * s, h = (object.base === "sq" ? 32 : 28) * s;
    node = <rect x={cx - w} y={cy - h} width={w * 2} height={h * 2} rx={2} fill={fill} fillOpacity={0.9} stroke={stroke} strokeWidth={2} />;
  }
  return <svg viewBox="0 0 120 96" className="h-24 w-full">{node}</svg>;
}

function OptionButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={["rounded-2xl border-2 p-3 text-center text-sm font-bold transition", selected ? "border-cyan-500 bg-cyan-50 text-indigo-950 ring-2 ring-cyan-300" : "border-violet-200 bg-white text-indigo-900 hover:border-cyan-400"].join(" ")}>
      {children}
    </button>
  );
}

export default function StarpathCrossSectionCard({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: (answer?: string) => void }) {
  const object = getCrossObject(task.objectId);
  const [t, setT] = useState(0.35);
  const [chosen, setChosen] = useState<string | null>(null);
  const [settled, setSettled] = useState(false);

  function submit() {
    if (settled || !chosen) return;
    setSettled(true);
    if (task.correctOptionIds.includes(chosen)) onCorrect(); else onWrong(chosen);
  }

  return (
    <div className="space-y-4">
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="l6cross-stage mx-auto max-w-md rounded-3xl p-4">
        <div className="grid grid-cols-[1.4fr_1fr] items-center gap-3">
          <svg viewBox="0 0 208 210" className="h-auto w-full" role="img" aria-label={`${object.name} being sliced`}>
            <SceneEls els={buildScene(object, t)} />
          </svg>
          <div className="text-center">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200/70">The slice</div>
            <SectionShape object={object} t={t} />
            <div className="font-mono text-[11px] tabular-nums text-white/60">
              {object.constantSection ? "same size" : `${Math.round((1 - t) * 100)}% of base`}
            </div>
          </div>
        </div>
        <div className="mt-3">
          <label className="mb-1 block font-sans text-xs font-bold text-white/60">Move the cut up ↑</label>
          <input type="range" min={0} max={100} value={Math.round(t * 100)} onChange={(e) => setT(Number(e.target.value) / 100)} className="w-full" style={{ accentColor: "#22d3ee" }} aria-label="Move the cut plane" />
        </div>
      </div>

      <div className="mx-auto grid max-w-md gap-2 sm:grid-cols-2">
        {task.options.map((option) => (
          <OptionButton key={option.id} selected={chosen === option.id} onClick={() => { if (!settled) setChosen(option.id); }}>{option.label}</OptionButton>
        ))}
      </div>
      <div className="flex justify-center">
        <button type="button" onClick={submit} disabled={settled || !chosen} className="flex h-12 items-center gap-2 rounded-2xl bg-emerald-600 px-7 font-black text-white shadow-md transition hover:bg-emerald-700 active:scale-95 disabled:opacity-40"><Check className="h-5 w-5" /> Check</button>
      </div>
      <style>{`.l6cross-stage{background:radial-gradient(120% 90% at 50% 4%, #20204e 0%, #141235 48%, #0b0a24 100%);box-shadow:0 14px 34px -16px rgba(10,8,40,.6), inset 0 0 0 1px rgba(148,163,255,.14);}`}</style>
    </div>
  );
}
