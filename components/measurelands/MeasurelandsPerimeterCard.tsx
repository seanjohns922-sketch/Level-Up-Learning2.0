"use client";

import { useMemo, useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { boundaryEdges, edgeKey, perimeter, type Side } from "@/data/activities/year3Measurelands/perimeterShapes";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type PerimTask = Extract<PracticeTask, { kind: "perimeter" }>;
const U = 46; // cell size in px
const PAD = 16;

function Shell({ badge, prompt, speakText, children }: { badge: string; prompt: string; speakText?: string; children: React.ReactNode }) {
  return (
    <div className="measurelands-shell space-y-4">
      <div className="measurelands-prompt-card rounded-[30px] border px-5 py-5 shadow-[0_14px_42px_rgba(76,29,149,0.1)]" style={{ borderColor: "rgba(214,184,108,0.38)", background: "linear-gradient(145deg, rgba(255,248,232,0.98) 0%, rgba(250,243,228,0.98) 52%, rgba(244,232,205,0.96) 100%)" }}>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]" style={{ background: "rgba(91,33,182,0.08)", border: "1px solid rgba(167,139,250,0.34)", color: "#5b21b6" }}>{badge}</div>
        <div className="flex items-start gap-3">
          <div className="measurelands-prompt-text flex-1 text-2xl font-black leading-tight text-[#2c1c07] sm:text-3xl">{prompt}</div>
          <ReadAloudBtn text={speakText ?? prompt} size="md" className="shrink-0" />
        </div>
      </div>
      {children}
    </div>
  );
}

function edgeLine(c: number, r: number, side: Side): [number, number, number, number] {
  const x = PAD + c * U;
  const y = PAD + r * U;
  if (side === "top") return [x, y, x + U, y];
  if (side === "right") return [x + U, y, x + U, y + U];
  if (side === "bottom") return [x, y + U, x + U, y + U];
  return [x, y, x, y + U];
}

function edgeBar(c: number, r: number, side: Side) {
  const x = PAD + c * U;
  const y = PAD + r * U;
  const thickness = 10;
  if (side === "top") return { x, y: y - thickness / 2, width: U, height: thickness };
  if (side === "right") return { x: x + U - thickness / 2, y, width: thickness, height: U };
  if (side === "bottom") return { x, y: y + U - thickness / 2, width: U, height: thickness };
  return { x: x - thickness / 2, y, width: thickness, height: U };
}

function ShapeSVG({
  cells, gridW, gridH, uid, children, size,
}: { cells: Array<[number, number]>; gridW: number; gridH: number; uid: string; children?: React.ReactNode; size?: number }) {
  const w = gridW * U + PAD * 2;
  const h = gridH * U + PAD * 2;
  return (
    <div className="mx-auto" style={{ maxWidth: size ?? Math.min(w, 420) }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label="A shape on a grid">
        <defs>
          <filter id={`glow-${uid}`} x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        {/* cell fills */}
        {cells.map(([c, r]) => (<rect key={`f${c},${r}`} x={PAD + c * U} y={PAD + r * U} width={U} height={U} fill="rgba(127,176,122,0.28)" />))}
        {/* faint inner grid lines */}
        {cells.map(([c, r]) => (<rect key={`g${c},${r}`} x={PAD + c * U} y={PAD + r * U} width={U} height={U} fill="none" stroke="rgba(90,58,20,0.14)" strokeWidth={1} />))}
        {children}
      </svg>
    </div>
  );
}

function TraceScene({ task, onCorrect, onWrong }: { task: PerimTask; onCorrect: () => void; onWrong: () => void }) {
  const [uid] = useState(() => Math.random().toString(36).slice(2, 8));
  const cells = task.cells ?? [];
  const edges = useMemo(() => boundaryEdges(cells), [cells]);
  const [walked, setWalked] = useState<Set<string>>(() => new Set((task.prefilled ?? []).map(([c, r, s]) => edgeKey(c, r, s))));
  const done = walked.size >= edges.length;
  const tap = (k: string) => {
    if (walked.has(k)) return;
    const next = new Set(walked); next.add(k); setWalked(next);
    if (next.size >= edges.length) onCorrect();
  };
  return (
    <Shell badge={task.badgeLabel ?? "Walk the Perimeter"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3">
        <ShapeSVG cells={cells} gridW={task.gridW ?? 4} gridH={task.gridH ?? 3} uid={uid}>
          {edges.map(([c, r, s]) => {
            const k = edgeKey(c, r, s);
            const [x1, y1, x2, y2] = edgeLine(c, r, s);
            const on = walked.has(k);
            const bar = edgeBar(c, r, s);
            return (
              <g key={k}>
                {on ? (
                  <rect
                    x={bar.x}
                    y={bar.y}
                    width={bar.width}
                    height={bar.height}
                    rx={5}
                    fill="#84cc16"
                    stroke="#3f7d12"
                    strokeWidth={1.5}
                  />
                ) : null}
                {!done ? <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={26} strokeLinecap="round" style={{ cursor: "pointer" }} onClick={() => tap(k)} /> : null}
              </g>
            );
          })}
        </ShapeSVG>
        <p className={`mt-2 text-center text-sm font-black ${done ? "text-[#16a34a]" : "text-[#a98b52]"}`}>{done ? "🎉 All the way around!" : `Tap every outside edge — ${walked.size}/${edges.length}`}</p>
      </div>
    </Shell>
  );
}

function MissingSideScene({ task, onCorrect, onWrong }: { task: PerimTask; onCorrect: () => void; onWrong: () => void }) {
  const [uid] = useState(() => Math.random().toString(36).slice(2, 8));
  const cells = task.cells ?? [];
  const edges = useMemo(() => boundaryEdges(cells), [cells]);
  const miss = task.missingSide!;
  const missKey = edgeKey(miss[0], miss[1], miss[2]);
  const candidates = [miss, ...(task.decoySides ?? [])];
  const [wrong, setWrong] = useState<string | null>(null);
  const [fixed, setFixed] = useState(false);
  return (
    <Shell badge={task.badgeLabel ?? "Find the Missing Side"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3">
        <ShapeSVG cells={cells} gridW={task.gridW ?? 4} gridH={task.gridH ?? 3} uid={uid}>
          {/* boundary drawn solid except the missing edge */}
          {edges.map(([c, r, s]) => {
            const k = edgeKey(c, r, s);
            if (k === missKey && !fixed) return null;
            const [x1, y1, x2, y2] = edgeLine(c, r, s);
            const isFilledMiss = k === missKey && fixed;
            return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke={isFilledMiss ? "#16a34a" : "#c99a4a"} strokeWidth={8} strokeLinecap="round" filter={isFilledMiss ? `url(#glow-${uid})` : undefined} />;
          })}
          {/* tappable candidates (dashed) */}
          {!fixed && candidates.map(([c, r, s], i) => {
            const k = edgeKey(c, r, s);
            const [x1, y1, x2, y2] = edgeLine(c, r, s);
            return (
              <g key={`cand${i}`}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={wrong === k ? "#C0564E" : "#7c3aed"} strokeWidth={5} strokeDasharray="5 5" strokeLinecap="round" />
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={26} strokeLinecap="round" style={{ cursor: "pointer" }} onClick={() => (k === missKey ? (setFixed(true), onCorrect()) : (setWrong(k), onWrong(), window.setTimeout(() => setWrong(null), 600)))} />
              </g>
            );
          })}
        </ShapeSVG>
        <p className="mt-2 text-center text-sm font-black text-[#a98b52]">{fixed ? "🎉 Fence closed!" : "Tap the outside edge that finishes the boundary"}</p>
      </div>
    </Shell>
  );
}

function MiniPath({ cells, gridW, gridH, pathType, uid }: { cells: Array<[number, number]>; gridW: number; gridH: number; pathType: "full" | "cut" | "incomplete"; uid: string }) {
  const edges = boundaryEdges(cells);
  const shown = pathType === "incomplete" ? edges.slice(0, edges.length - 1) : edges;
  const w = gridW * U + PAD * 2;
  const h = gridH * U + PAD * 2;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label="A path around a shape">
      {cells.map(([c, r]) => (<rect key={`${c},${r}`} x={PAD + c * U} y={PAD + r * U} width={U} height={U} fill="rgba(127,176,122,0.22)" stroke="rgba(90,58,20,0.12)" strokeWidth={1} />))}
      {shown.map(([c, r, s], i) => { const [x1, y1, x2, y2] = edgeLine(c, r, s); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#7c3aed" strokeWidth={7} strokeLinecap="round" />; })}
      {pathType === "cut" ? <line x1={PAD} y1={PAD} x2={PAD + gridW * U} y2={PAD + gridH * U} stroke="#7c3aed" strokeWidth={7} strokeLinecap="round" /> : null}
    </svg>
  );
}

function WhichPathScene({ task, onCorrect, onWrong }: { task: PerimTask; onCorrect: () => void; onWrong: () => void }) {
  const [uid] = useState(() => Math.random().toString(36).slice(2, 8));
  const [wrong, setWrong] = useState<string | null>(null);
  const cells = task.cells ?? [];
  return (
    <Shell badge={task.badgeLabel ?? "Which Path Is the Perimeter?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid grid-cols-3 gap-3">
        {(task.pathOptions ?? []).map((o) => (
          <button key={o.id} type="button" onClick={() => (o.id === task.correctPathId ? onCorrect() : (setWrong(o.id), onWrong(), window.setTimeout(() => setWrong(null), 600)))} className={`rounded-[22px] border-2 p-2 transition hover:-translate-y-0.5 active:scale-[0.98] ${wrong === o.id ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[rgba(255,252,245,0.96)]"}`}>
            <MiniPath cells={cells} gridW={task.gridW ?? 4} gridH={task.gridH ?? 3} pathType={o.pathType} uid={`${uid}${o.id}`} />
          </button>
        ))}
      </div>
    </Shell>
  );
}

function CompareWalkScene({ task, onCorrect, onWrong }: { task: PerimTask; onCorrect: () => void; onWrong: () => void }) {
  const [uid] = useState(() => Math.random().toString(36).slice(2, 8));
  const cmp = task.compareShapes!;
  const pa = perimeter(cmp.a.cells);
  const pb = perimeter(cmp.b.cells);
  const longerLabel = pa >= pb ? cmp.a.label : cmp.b.label;
  const Card = ({ s, i }: { s: typeof cmp.a; i: string }) => (
    <button type="button" onClick={() => (s.label === longerLabel ? onCorrect() : onWrong())} className="flex flex-col items-center gap-2 rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[rgba(255,252,245,0.96)] p-3 transition hover:-translate-y-0.5 active:scale-[0.98]">
      <span className="text-2xl">{s.emoji}</span>
      <ShapeSVG cells={s.cells} gridW={s.gridW} gridH={s.gridH} uid={`${uid}${i}`} size={210}>
        {boundaryEdges(s.cells).map(([c, r, side], j) => { const [x1, y1, x2, y2] = edgeLine(c, r, side); return <line key={j} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#7c3aed" strokeWidth={7} strokeLinecap="round" />; })}
      </ShapeSVG>
      <span className="text-base font-black text-[#2c1c07]">{s.label}</span>
    </button>
  );
  return (
    <Shell badge={task.badgeLabel ?? "Which Walk Is Longer?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid grid-cols-2 gap-3"><Card s={cmp.a} i="a" /><Card s={cmp.b} i="b" /></div>
    </Shell>
  );
}

function IntroScene({ task, onCorrect }: { task: PerimTask; onCorrect: () => void }) {
  const [uid] = useState(() => Math.random().toString(36).slice(2, 8));
  const cells = task.cells ?? [];
  return (
    <Shell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3">
        <ShapeSVG cells={cells} gridW={task.gridW ?? 4} gridH={task.gridH ?? 3} uid={uid}>
          {boundaryEdges(cells).map(([c, r, s], i) => { const [x1, y1, x2, y2] = edgeLine(c, r, s); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#16a34a" strokeWidth={8} strokeLinecap="round" filter={`url(#glow-${uid})`}><animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" /></line>; })}
        </ShapeSVG>
        <p className="mt-1 text-center text-lg font-black text-[#16a34a]">🚶 The perimeter is the path all the way around the outside.</p>
      </div>
      <button type="button" onClick={onCorrect} className="mx-auto flex min-h-[60px] items-center justify-center rounded-[24px] border-2 border-[rgba(180,120,20,0.55)] bg-[#fffaf0] px-8 text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]">Let&apos;s explore! →</button>
    </Shell>
  );
}

export function MeasurelandsPerimeterCard({ task, onCorrect, onWrong }: { task: PerimTask; onCorrect: () => void; onWrong: () => void }) {
  switch (task.scene) {
    case "intro": return <IntroScene task={task} onCorrect={onCorrect} />;
    case "missingSide": return <MissingSideScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "whichPath": return <WhichPathScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "compareWalk": return <CompareWalkScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    default: return <TraceScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  }
}
