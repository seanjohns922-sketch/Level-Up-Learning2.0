"use client";

import { useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import { boundaryEdges, cellKey, type Side } from "@/data/activities/year3Measurelands/perimeterShapes";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type AreaTask = Extract<PracticeTask, { kind: "area" }>;
const U = 44;
const PAD = 14;
const TILE = "#7c3aed";
const TILE_BG = "rgba(124,58,237,0.28)";

/** Choose a render width that keeps a tall/thin rectangle from getting too tall. */
function fitSize(gridW: number, gridH: number, maxW = 210, maxHpx = 300): number {
  return Math.min(maxW, Math.round(gridW * (maxHpx / gridH)) + 2 * PAD);
}

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
  const x = PAD + c * U, y = PAD + r * U;
  if (side === "top") return [x, y, x + U, y];
  if (side === "right") return [x + U, y, x + U, y + U];
  if (side === "bottom") return [x, y + U, x + U, y + U];
  return [x, y, x, y + U];
}

/** Renders a set of cells; `filled` cells show a tile, others show an empty slot.
 *  If onTap given, cells are tappable. `outline` draws the shape boundary. */
function Tiles({ cells, gridW, gridH, filled, onTap, outline, glow, size }: { cells: Array<[number, number]>; gridW: number; gridH: number; filled: Set<string>; onTap?: (k: string) => void; outline?: boolean; glow?: boolean; size?: number }) {
  const w = gridW * U + PAD * 2, h = gridH * U + PAD * 2;
  return (
    <div className="mx-auto" style={{ maxWidth: size ?? Math.min(w, 400) }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label="A shape made of square units">
        <style>{"@keyframes mlGlow{0%,100%{opacity:0.55}50%{opacity:1}}"}</style>
        {cells.map(([c, r]) => {
          const k = cellKey(c, r);
          const on = filled.has(k);
          return (
            <g key={k} onClick={onTap ? () => onTap(k) : undefined} style={{ cursor: onTap ? "pointer" : "default" }}>
              <rect x={PAD + c * U} y={PAD + r * U} width={U} height={U} rx={5} fill={on ? TILE_BG : "rgba(255,255,255,0.7)"} stroke={on ? TILE : "rgba(124,58,237,0.35)"} strokeWidth={on ? 2 : 1.4} strokeDasharray={on ? undefined : "4 4"} />
              {on ? <rect x={PAD + c * U + 5} y={PAD + r * U + 5} width={U - 10} height={U - 10} rx={4} fill={TILE} opacity={0.55} /> : null}
            </g>
          );
        })}
        {glow ? (
          <g style={{ filter: "drop-shadow(0 0 3px rgba(245,158,11,0.85))" }}>
            {boundaryEdges(cells).map(([c, r, s], i) => { const [x1, y1, x2, y2] = edgeLine(c, r, s); return <line key={`gl${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f59e0b" strokeWidth={6} strokeLinecap="round" style={{ animation: "mlGlow 1.2s ease infinite" }} />; })}
          </g>
        ) : outline ? boundaryEdges(cells).map(([c, r, s], i) => { const [x1, y1, x2, y2] = edgeLine(c, r, s); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#5b21b6" strokeWidth={4} strokeLinecap="round" />; }) : null}
      </svg>
    </div>
  );
}

/** Free gridW×gridH tap grid for buildArea (any cell can hold a tile). */
function BuildGrid({ gridW, gridH, filled, onTap }: { gridW: number; gridH: number; filled: Set<string>; onTap: (k: string) => void }) {
  const cells: Array<[number, number]> = [];
  for (let r = 0; r < gridH; r++) for (let c = 0; c < gridW; c++) cells.push([c, r]);
  return <Tiles cells={cells} gridW={gridW} gridH={gridH} filled={filled} onTap={onTap} />;
}

function CoverScene({ task, onCorrect }: { task: AreaTask; onCorrect: () => void }) {
  const cells = task.cells ?? [];
  const [filled, setFilled] = useState<Set<string>>(new Set());
  const done = filled.size >= cells.length;
  const tap = (k: string) => { if (filled.has(k)) return; const n = new Set(filled); n.add(k); setFilled(n); if (n.size >= cells.length) onCorrect(); };
  return (
    <Shell badge={task.badgeLabel ?? "Cover the Shape"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3">
        <Tiles cells={cells} gridW={task.gridW ?? 4} gridH={task.gridH ?? 3} filled={filled} onTap={done ? undefined : tap} outline />
        <p className={`mt-2 text-center text-sm font-black ${done ? "text-[#16a34a]" : "text-[#a98b52]"}`}>{done ? "🎉 Fully covered — that's the area!" : `Tap to place a tile in every square — ${filled.size}/${cells.length}`}</p>
      </div>
    </Shell>
  );
}

function BuildAreaScene({ task, onCorrect, onWrong }: { task: AreaTask; onCorrect: () => void; onWrong: () => void }) {
  const target = task.targetSquares ?? 6;
  const [filled, setFilled] = useState<Set<string>>(new Set());
  const tap = (k: string) => {
    const n = new Set(filled);
    if (n.has(k)) n.delete(k); else n.add(k);
    setFilled(n);
    if (n.size === target) onCorrect();
    else if (n.size > target) onWrong();
  };
  return (
    <Shell badge={task.badgeLabel ?? "Build the Area"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3">
        <BuildGrid gridW={task.gridW ?? 5} gridH={task.gridH ?? 4} filled={filled} onTap={tap} />
        <p className={`mt-2 text-center text-sm font-black ${filled.size === target ? "text-[#16a34a]" : filled.size > target ? "text-[#C0564E]" : "text-[#a98b52]"}`}>{filled.size === target ? "🎉 That's the area!" : filled.size > target ? "Too many — remove one" : `Place ${target} square units — ${filled.size}/${target}`}</p>
      </div>
    </Shell>
  );
}

function areaUnitLabel(task: AreaTask): string {
  return task.areaUnit ?? "square units";
}
function areaUnitSpoken(task: AreaTask): string {
  return task.areaUnit === "cm²" ? "square centimetres" : task.areaUnit === "m²" ? "square metres" : "square units";
}

function CountScene({ task, onCorrect, onWrong }: { task: AreaTask; onCorrect: () => void; onWrong: () => void }) {
  const cells = task.cells ?? [];
  const unit = areaUnitLabel(task);
  const spoken = areaUnitSpoken(task);
  return (
    <Shell badge={task.badgeLabel ?? "Count the Squares"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3">
        <Tiles cells={cells} gridW={task.gridW ?? 4} gridH={task.gridH ?? 3} filled={new Set(cells.map(([c, r]) => cellKey(c, r)))} outline size={330} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {(task.options ?? []).map((n) => (
          <button key={n} type="button" onClick={() => (n === task.correctNumber ? onCorrect() : onWrong())} className="relative flex min-h-[66px] items-center justify-center rounded-[22px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98] sm:text-2xl">
            <span className="absolute right-1 top-1 z-10"><OptionReadAloudButton text={`${n} ${spoken}`} /></span>{n} {unit}
          </button>
        ))}
      </div>
    </Shell>
  );
}

function shapePerimeter(s: { gridW: number; gridH: number }): number {
  return 2 * (s.gridW + s.gridH);
}

function CompareScene({ task, onCorrect, onWrong }: { task: AreaTask; onCorrect: () => void; onWrong: () => void }) {
  const cmp = task.compareShapes!;
  const metric = task.compareMode === "perimeter"
    ? (s: typeof cmp.a) => shapePerimeter(s)
    : (s: typeof cmp.a) => s.cells.length;
  const longer = metric(cmp.a) >= metric(cmp.b) ? cmp.a.label : cmp.b.label;
  const Card = ({ s }: { s: typeof cmp.a }) => (
    <button type="button" onClick={() => (s.label === longer ? onCorrect() : onWrong())} className="flex flex-col items-center gap-2 rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[rgba(255,252,245,0.96)] p-3 transition hover:-translate-y-0.5 active:scale-[0.98]">
      <span className="text-2xl">{s.emoji}</span>
      <Tiles cells={s.cells} gridW={s.gridW} gridH={s.gridH} filled={new Set(s.cells.map(([c, r]) => cellKey(c, r)))} outline size={fitSize(s.gridW, s.gridH)} />
      <span className="text-base font-black text-[#2c1c07]">{s.label}</span>
    </button>
  );
  return (
    <Shell badge={task.badgeLabel ?? "Which Has Greater Area?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid grid-cols-2 gap-3"><Card s={cmp.a} /><Card s={cmp.b} /></div>
    </Shell>
  );
}

function OrderScene({ task, onCorrect, onWrong }: { task: AreaTask; onCorrect: () => void; onWrong: () => void }) {
  const shapes = task.orderShapes ?? [];
  const [tapped, setTapped] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const remaining = shapes.filter((s) => !tapped.includes(s.label));
  const tap = (label: string) => {
    const s = shapes.find((x) => x.label === label)!;
    const smallest = remaining.reduce((a, b) => (a.cells.length <= b.cells.length ? a : b));
    if (s.label === smallest.label) { const n = [...tapped, label]; setTapped(n); setWrong(null); if (n.length === shapes.length) onCorrect(); }
    else { setWrong(label); onWrong(); window.setTimeout(() => setWrong(null), 600); }
  };
  return (
    <Shell badge={task.badgeLabel ?? "Order by Area"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <p className="text-center text-base font-black text-[#5b21b6]">Tap from smallest → largest area</p>
      <div className="grid grid-cols-3 gap-2">
        {shapes.map((s) => { const order = tapped.indexOf(s.label); return (
          <button key={s.label} type="button" disabled={order >= 0} onClick={() => tap(s.label)} className={`relative flex flex-col items-center gap-1 rounded-[20px] border-2 p-2 transition ${wrong === s.label ? "border-[#C0564E] bg-[#FCE0E0]" : order >= 0 ? "border-[rgba(15,118,110,0.6)] bg-[rgba(15,118,110,0.12)]" : "border-[rgba(214,184,108,0.55)] bg-[rgba(255,252,245,0.96)] hover:-translate-y-0.5"}`}>
            {order >= 0 ? <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#0f766e] text-xs font-black text-white">{order + 1}</span> : null}
            <span className="text-lg">{s.emoji}</span>
            <Tiles cells={s.cells} gridW={s.gridW} gridH={s.gridH} filled={new Set(s.cells.map(([c, r]) => cellKey(c, r)))} size={150} />
          </button>
        ); })}
      </div>
    </Shell>
  );
}

function MiniFill({ cells, gridW, gridH, fillType }: { cells: Array<[number, number]>; gridW: number; gridH: number; fillType: "inside" | "edge" | "partial" }) {
  const filled = fillType === "inside" ? new Set(cells.map(([c, r]) => cellKey(c, r))) : fillType === "partial" ? new Set(cells.slice(0, Math.max(1, Math.floor(cells.length / 2))).map(([c, r]) => cellKey(c, r))) : new Set<string>();
  return <Tiles cells={cells} gridW={gridW} gridH={gridH} filled={filled} outline={fillType === "edge"} />;
}

function WhichPartScene({ task, onCorrect, onWrong }: { task: AreaTask; onCorrect: () => void; onWrong: () => void }) {
  const [wrong, setWrong] = useState<string | null>(null);
  const cells = task.cells ?? [];
  return (
    <Shell badge={task.badgeLabel ?? "Which Part Is the Area?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid grid-cols-3 gap-3">
        {(task.partOptions ?? []).map((o) => (
          <button key={o.id} type="button" onClick={() => (o.id === task.correctPartId ? onCorrect() : (setWrong(o.id), onWrong(), window.setTimeout(() => setWrong(null), 600)))} className={`rounded-[22px] border-2 p-2 transition hover:-translate-y-0.5 active:scale-[0.98] ${wrong === o.id ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[rgba(255,252,245,0.96)]"}`}>
            <MiniFill cells={cells} gridW={task.gridW ?? 4} gridH={task.gridH ?? 3} fillType={o.fillType} />
          </button>
        ))}
      </div>
    </Shell>
  );
}

function SameAreaScene({ task, onCorrect, onWrong }: { task: AreaTask; onCorrect: () => void; onWrong: () => void }) {
  const [wrong, setWrong] = useState<string | null>(null);
  const cells = task.cells ?? [];
  return (
    <Shell badge={task.badgeLabel ?? "Same Area, Different Shape"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="flex flex-col items-center gap-1 rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3">
        <span className="text-sm font-black text-[#a98b52]">This shape has {cells.length} squares</span>
        <Tiles cells={cells} gridW={task.gridW ?? 4} gridH={task.gridH ?? 3} filled={new Set(cells.map(([c, r]) => cellKey(c, r)))} outline size={220} />
      </div>
      <p className="text-center text-base font-black text-[#5b21b6]">Which one has the same area?</p>
      <div className="grid grid-cols-3 gap-3">
        {(task.sameOptions ?? []).map((o) => (
          <button key={o.id} type="button" onClick={() => (o.id === task.correctSameId ? onCorrect() : (setWrong(o.id), onWrong(), window.setTimeout(() => setWrong(null), 600)))} className={`rounded-[22px] border-2 p-2 transition hover:-translate-y-0.5 active:scale-[0.98] ${wrong === o.id ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[rgba(255,252,245,0.96)]"}`}>
            <Tiles cells={o.cells} gridW={o.gridW} gridH={o.gridH} filled={new Set(o.cells.map(([c, r]) => cellKey(c, r)))} />
          </button>
        ))}
      </div>
    </Shell>
  );
}

function IntroScene({ task, onCorrect }: { task: AreaTask; onCorrect: () => void }) {
  const cells = task.cells ?? [];
  return (
    <Shell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3">
          <Tiles cells={cells} gridW={task.gridW ?? 4} gridH={task.gridH ?? 3} filled={new Set(cells.map(([c, r]) => cellKey(c, r)))} outline size={240} />
          <p className="mt-1 text-center text-sm font-black text-[#7c3aed]">{cells.length} {areaUnitLabel(task)}</p>
        </div>
        <div className="rounded-[24px] border border-[rgba(214,184,108,0.45)] bg-[rgba(255,250,240,0.96)] p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[12px] font-black uppercase tracking-[0.16em] text-[#a98b52]">What is area?</span>
            <span className="rounded-full bg-[rgba(124,58,237,0.12)] px-2 py-0.5 text-[11px] font-black text-[#7c3aed]">the space inside</span>
          </div>
          <p className="text-[17px] font-bold leading-snug text-[#2c1c07]">
            Area is the amount of <span className="font-black text-[#7c3aed]">surface inside</span> a shape.
          </p>
          <p className="mt-2 text-[15px] font-semibold leading-snug text-[#5a4423]">
            We measure it by covering the shape with <span className="font-black">equal squares</span>{task.areaUnit ? <> — each one a <span className="font-black text-[#7c3aed]">{task.areaUnit}</span></> : null} and counting them.
          </p>
          <div className="mt-3 rounded-[16px] border border-[rgba(214,184,108,0.5)] bg-white px-3 py-2 text-center text-[14px] font-bold text-[#2c1c07]">
            <span className="font-black text-[#5b21b6]">Perimeter</span> is the distance around the edge. <span className="font-black text-[#7c3aed]">Area</span> is the space inside.
          </div>
        </div>
      </div>
      <button type="button" onClick={onCorrect} className="mx-auto flex min-h-[60px] items-center justify-center rounded-[24px] border-2 border-[rgba(180,120,20,0.55)] bg-[#fffaf0] px-8 text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]">Let&apos;s build! →</button>
    </Shell>
  );
}

/* ── Equal or Different? — two shapes; same area or different area ── */
function SameDiffScene({ task, onCorrect, onWrong }: { task: AreaTask; onCorrect: () => void; onWrong: () => void }) {
  const cmp = task.compareShapes!;
  const same = cmp.a.cells.length === cmp.b.cells.length;
  const [wrong, setWrong] = useState<string | null>(null);
  const pick = (choice: "same" | "diff") => {
    if ((choice === "same") === same) onCorrect();
    else { setWrong(choice); onWrong(); window.setTimeout(() => setWrong(null), 600); }
  };
  const ShapeCard = ({ s }: { s: typeof cmp.a }) => (
    <div className="flex flex-col items-center gap-1 rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[rgba(255,252,245,0.96)] p-3">
      <span className="text-2xl">{s.emoji}</span>
      <Tiles cells={s.cells} gridW={s.gridW} gridH={s.gridH} filled={new Set(s.cells.map(([c, r]) => cellKey(c, r)))} outline size={fitSize(s.gridW, s.gridH)} />
      <span className="text-base font-black text-[#2c1c07]">{s.label}</span>
    </div>
  );
  return (
    <Shell badge={task.badgeLabel ?? "Equal or Different?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid grid-cols-2 gap-3"><ShapeCard s={cmp.a} /><ShapeCard s={cmp.b} /></div>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => pick("same")} className={`min-h-[68px] rounded-[24px] border-2 px-4 text-lg font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 ${wrong === "same" ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[#fffaf0]"}`}>Same area</button>
        <button type="button" onClick={() => pick("diff")} className={`min-h-[68px] rounded-[24px] border-2 px-4 text-lg font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 ${wrong === "diff" ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[#fffaf0]"}`}>Different area</button>
      </div>
    </Shell>
  );
}

/* ── Level 5 W4: rows / columns / arrays ── */
const ROW_HL = "rgba(245,158,11,0.5)";
const COL_HL = "rgba(13,148,136,0.45)";

function ArrayGrid({ gridW, gridH, rowsOn, colsOn, onRowTap, onColTap, reveal, size }: {
  gridW: number; gridH: number;
  rowsOn?: Set<number>; colsOn?: Set<number>;
  onRowTap?: (r: number) => void; onColTap?: (c: number) => void;
  reveal?: boolean; size?: number;
}) {
  const w = gridW * U + PAD * 2, h = gridH * U + PAD * 2;
  const R = Array.from({ length: gridH }, (_, i) => i);
  const C = Array.from({ length: gridW }, (_, i) => i);
  const colDelayBase = gridH * 0.24 + 0.6; // columns pulse after the rows finish
  return (
    <div className="mx-auto" style={{ maxWidth: size ?? Math.min(w, 360) }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label={`${gridH} rows by ${gridW} columns`}>
        <style>{"@keyframes mlPulse{0%{opacity:0}35%{opacity:1}75%{opacity:1}100%{opacity:0}}"}</style>
        {R.map((r) => C.map((c) => (
          <rect key={`b${c}-${r}`} x={PAD + c * U} y={PAD + r * U} width={U} height={U} rx={5} fill={TILE_BG} stroke={TILE} strokeWidth={1.4} />
        )))}
        {R.map((r) => (rowsOn?.has(r) ? <rect key={`r${r}`} x={PAD} y={PAD + r * U} width={gridW * U} height={U} rx={6} fill={ROW_HL} /> : null))}
        {C.map((c) => (colsOn?.has(c) ? <rect key={`c${c}`} x={PAD + c * U} y={PAD} width={U} height={gridH * U} rx={6} fill={COL_HL} /> : null))}
        {reveal ? (
          <>
            {R.map((r) => <rect key={`rr${r}`} x={PAD} y={PAD + r * U} width={gridW * U} height={U} rx={6} fill={ROW_HL} style={{ opacity: 0, animation: "mlPulse 1.1s ease forwards", animationDelay: `${r * 0.24}s` }} />)}
            {C.map((c) => <rect key={`cc${c}`} x={PAD + c * U} y={PAD} width={U} height={gridH * U} rx={6} fill={COL_HL} style={{ opacity: 0, animation: "mlPulse 1.1s ease forwards", animationDelay: `${colDelayBase + c * 0.2}s` }} />)}
          </>
        ) : null}
        {R.map((r) => C.map((c) => (
          <rect key={`g${c}-${r}`} x={PAD + c * U} y={PAD + r * U} width={U} height={U} rx={5} fill="none" stroke="rgba(124,58,237,0.55)" strokeWidth={1.3} />
        )))}
        {onRowTap ? R.map((r) => <rect key={`tr${r}`} x={PAD} y={PAD + r * U} width={gridW * U} height={U} fill="transparent" style={{ cursor: "pointer" }} onClick={() => onRowTap(r)} />) : null}
        {onColTap ? C.map((c) => <rect key={`tc${c}`} x={PAD + c * U} y={PAD} width={U} height={gridH * U} fill="transparent" style={{ cursor: "pointer" }} onClick={() => onColTap(c)} />) : null}
      </svg>
    </div>
  );
}

function ArrayReadout({ gridH, gridW, unit, showTotal }: { gridH: number; gridW: number; unit: string; showTotal?: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 rounded-[18px] border border-[rgba(214,184,108,0.5)] bg-white px-3 py-2 text-lg font-black">
      <span className="rounded-[10px] px-2 py-0.5 text-[#b45309]" style={{ background: "rgba(245,158,11,0.16)" }}>{gridH} rows</span>
      <span className="text-[#a98b52]">×</span>
      <span className="rounded-[10px] px-2 py-0.5 text-[#0f766e]" style={{ background: "rgba(13,148,136,0.14)" }}>{gridW} columns</span>
      {showTotal ? <><span className="text-[#a98b52]">=</span><span className="text-[#7c3aed]">{gridW * gridH} {unit}</span></> : null}
    </div>
  );
}

function RowColScene({ task, dir, onCorrect }: { task: AreaTask; dir: "rows" | "columns"; onCorrect: () => void }) {
  const gridW = task.gridW ?? 4, gridH = task.gridH ?? 3;
  const total = dir === "rows" ? gridH : gridW;
  const [on, setOn] = useState<Set<number>>(new Set());
  const done = on.size === total;
  const tap = (i: number) => { if (on.has(i)) return; const n = new Set(on); n.add(i); setOn(n); };
  const word = dir === "rows" ? "row" : "column";
  return (
    <Shell badge={task.badgeLabel ?? (dir === "rows" ? "Count the Rows" : "Count the Columns")} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3">
        {task.context ? <div className="mb-1 text-center text-[12px] font-black uppercase tracking-[0.14em] text-[#a98b52]">{task.emoji} {task.context}</div> : null}
        <ArrayGrid gridW={gridW} gridH={gridH} rowsOn={dir === "rows" ? on : undefined} colsOn={dir === "columns" ? on : undefined} onRowTap={dir === "rows" && !done ? tap : undefined} onColTap={dir === "columns" && !done ? tap : undefined} />
        <p className={`mt-2 text-center text-base font-black ${done ? "text-[#16a34a]" : "text-[#a98b52]"}`}>{done ? `🎉 ${total} ${dir}!` : `Tap each ${word} to light it up — ${on.size}/${total}`}</p>
      </div>
      {done ? (
        <button type="button" onClick={onCorrect} className="mx-auto flex min-h-[58px] items-center justify-center rounded-[24px] border-2 border-[#5b21b6] bg-[#5b21b6] px-8 text-lg font-black uppercase text-white shadow-sm transition hover:-translate-y-0.5">Confirm — {total} {dir}</button>
      ) : null}
    </Shell>
  );
}

function ArrayAreaScene({ task, onCorrect, onWrong }: { task: AreaTask; onCorrect: () => void; onWrong: () => void }) {
  const gridW = task.gridW ?? 4, gridH = task.gridH ?? 3;
  const unit = areaUnitLabel(task);
  const spoken = areaUnitSpoken(task);
  return (
    <Shell badge={task.badgeLabel ?? "How Many Squares?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3 space-y-2">
        {task.context ? <div className="text-center text-[12px] font-black uppercase tracking-[0.14em] text-[#a98b52]">{task.emoji} {task.context}</div> : null}
        <ArrayGrid gridW={gridW} gridH={gridH} size={320} />
        <ArrayReadout gridH={gridH} gridW={gridW} unit={unit} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {(task.options ?? []).map((n) => (
          <button key={n} type="button" onClick={() => (n === task.correctNumber ? onCorrect() : onWrong())} className="relative flex min-h-[64px] items-center justify-center rounded-[22px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]">
            <span className="absolute right-1 top-1 z-10"><OptionReadAloudButton text={`${n} ${spoken}`} /></span>{n} {unit}
          </button>
        ))}
      </div>
    </Shell>
  );
}

function AreaKeypad({ answer, unit, onCorrect, onWrong }: { answer: number; unit: string; onCorrect: () => void; onWrong: () => void }) {
  const [typed, setTyped] = useState("");
  const [status, setStatus] = useState<"idle" | "wrong">("idle");
  const add = (d: string) => { setStatus("idle"); setTyped((c) => (c === "0" ? d : c.length >= 3 ? c : `${c}${d}`)); };
  const check = () => { if (!typed) return; if (Number(typed) === answer) onCorrect(); else { setStatus("wrong"); onWrong(); } };
  return (
    <div className="rounded-[24px] border-2 border-[rgba(214,184,108,0.52)] bg-white p-3 shadow-sm">
      <div className={`mb-2 flex items-center justify-center gap-2 rounded-[20px] border-2 px-4 py-2 ${status === "wrong" ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.58)] bg-[#fffaf0]"}`}>
        <div className="min-w-[64px] text-center text-3xl font-black tabular-nums text-[#2c1c07]">{typed || "?"}</div>
        <div className="text-xl font-black text-[#7c3aed]">{unit}</div>
      </div>
      <div className="mb-2 text-center text-xs font-bold text-[#6b4d23]">{status === "wrong" ? "Rows × columns — try again." : "Rows × columns = area."}</div>
      <div className="grid grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button key={d} type="button" onClick={() => add(d)} className="rounded-[16px] border-2 border-[rgba(214,184,108,0.58)] bg-[#fff7df] py-2.5 text-2xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5">{d}</button>
        ))}
        <button type="button" onClick={() => { setStatus("idle"); setTyped(""); }} className="rounded-[16px] border-2 border-[rgba(214,184,108,0.58)] bg-white py-2.5 text-sm font-black uppercase text-[#7c4a12] shadow-sm">Clear</button>
        <button type="button" onClick={() => add("0")} className="rounded-[16px] border-2 border-[rgba(214,184,108,0.58)] bg-[#fff7df] py-2.5 text-2xl font-black text-[#2c1c07] shadow-sm">0</button>
        <button type="button" onClick={check} className="rounded-[16px] border-2 border-[#7c3aed] bg-[#7c3aed] py-2.5 text-lg font-black uppercase text-white shadow-sm transition hover:-translate-y-0.5">Go</button>
      </div>
    </div>
  );
}

function CalcAreaScene({ task, onCorrect, onWrong }: { task: AreaTask; onCorrect: () => void; onWrong: () => void }) {
  const gridW = task.gridW ?? 4, gridH = task.gridH ?? 3;
  return (
    <Shell badge={task.badgeLabel ?? "Find the Area"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_280px]">
        <div className="rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3 space-y-2">
          {task.context ? <div className="text-center text-[12px] font-black uppercase tracking-[0.14em] text-[#a98b52]">{task.emoji} {task.context}</div> : null}
          <ArrayGrid gridW={gridW} gridH={gridH} />
          <ArrayReadout gridH={gridH} gridW={gridW} unit={areaUnitLabel(task)} />
        </div>
        <AreaKeypad answer={task.answerValue ?? gridW * gridH} unit={areaUnitLabel(task)} onCorrect={onCorrect} onWrong={onWrong} />
      </div>
    </Shell>
  );
}

function SpotMistakeScene({ task, onCorrect, onWrong }: { task: AreaTask; onCorrect: () => void; onWrong: () => void }) {
  const gridW = task.gridW ?? 4, gridH = task.gridH ?? 3;
  const unit = areaUnitLabel(task);
  const spoken = areaUnitSpoken(task);
  return (
    <Shell badge={task.badgeLabel ?? "Professor Gauge's Mistake"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3 space-y-2">
        <ArrayGrid gridW={gridW} gridH={gridH} size={320} />
        <ArrayReadout gridH={gridH} gridW={gridW} unit={unit} />
      </div>
      {task.statement ? <div className="rounded-[18px] border border-[rgba(192,86,78,0.28)] bg-[rgba(252,224,224,0.5)] px-4 py-2 text-center text-lg font-black text-[#7c2d12]">{task.statement}</div> : null}
      <div className="grid grid-cols-3 gap-3">
        {(task.options ?? []).map((n) => (
          <button key={n} type="button" onClick={() => (n === task.correctNumber ? onCorrect() : onWrong())} className="relative flex min-h-[64px] items-center justify-center rounded-[22px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]">
            <span className="absolute right-1 top-1 z-10"><OptionReadAloudButton text={`${n} ${spoken}`} /></span>{n} {unit}
          </button>
        ))}
      </div>
    </Shell>
  );
}

function ArrayIntroScene({ task, onCorrect }: { task: AreaTask; onCorrect: () => void }) {
  const gridW = task.gridW ?? 5, gridH = task.gridH ?? 3;
  return (
    <Shell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3">
          <ArrayGrid gridW={gridW} gridH={gridH} reveal size={300} />
        </div>
        <div className="rounded-[24px] border border-[rgba(214,184,108,0.45)] bg-[rgba(255,250,240,0.96)] p-4">
          <div className="mb-2 text-[12px] font-black uppercase tracking-[0.16em] text-[#a98b52]">Look for the pattern</div>
          <p className="text-[17px] font-bold leading-snug text-[#2c1c07]">
            Instead of counting every tile, see the <span className="font-black text-[#b45309]">rows</span> and <span className="font-black text-[#0f766e]">columns</span>.
          </p>
          <p className="mt-2 text-[15px] font-semibold leading-snug text-[#5a4423]">
            Every row has the same number of squares — so <span className="font-black">rows × columns</span> tells you the total.
          </p>
          <div className="mt-3"><ArrayReadout gridH={gridH} gridW={gridW} unit={areaUnitLabel(task)} showTotal /></div>
        </div>
      </div>
      <button type="button" onClick={onCorrect} className="mx-auto flex min-h-[60px] items-center justify-center rounded-[24px] border-2 border-[rgba(180,120,20,0.55)] bg-[#fffaf0] px-8 text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]">Let&apos;s build! →</button>
    </Shell>
  );
}

/* ── L5 W5: same area, different perimeter (discover → reveal → Gauge) ── */
function InvestigateScene({ task, onCorrect, onWrong }: { task: AreaTask; onCorrect: () => void; onWrong: () => void }) {
  const cmp = task.compareShapes!;
  const areaA = cmp.a.cells.length, areaB = cmp.b.cells.length;
  const periA = shapePerimeter(cmp.a), periB = shapePerimeter(cmp.b);
  const sameArea = areaA === areaB, samePeri = periA === periB;
  const correct = sameArea && samePeri ? "both" : sameArea ? "area" : "perimeter";
  const [phase, setPhase] = useState<"notice" | "reveal">("notice");
  const [wrong, setWrong] = useState<string | null>(null);
  const pick = (c: string) => {
    if (c === correct) setPhase("reveal");
    else { setWrong(c); onWrong(); window.setTimeout(() => setWrong(null), 600); }
  };
  const bigger = periA >= periB ? cmp.a.label : cmp.b.label;
  const Card = ({ s, area, peri }: { s: typeof cmp.a; area: number; peri: number }) => (
    <div className="flex flex-col items-center gap-1 rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[rgba(255,252,245,0.96)] p-3">
      <span className="text-base font-black text-[#2c1c07]">{s.emoji} {s.label}</span>
      <Tiles cells={s.cells} gridW={s.gridW} gridH={s.gridH} filled={new Set(s.cells.map(([c, r]) => cellKey(c, r)))} outline={phase === "notice"} glow={phase === "reveal"} size={fitSize(s.gridW, s.gridH)} />
      {phase === "reveal" ? (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <span className="rounded-full px-3 py-1 text-sm font-black text-[#7c3aed]" style={{ background: "rgba(124,58,237,0.14)" }}>Area {area} m²</span>
          <span className="rounded-full px-3 py-1 text-sm font-black text-[#b45309]" style={{ background: "rgba(245,158,11,0.16)" }}>Perimeter {peri} m</span>
        </div>
      ) : null}
    </div>
  );
  const btn = (id: string, label: string) => (
    <button type="button" onClick={() => pick(id)} className={`min-h-[62px] rounded-[22px] border-2 px-3 text-base font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 ${wrong === id ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[#fffaf0]"}`}>{label}</button>
  );
  return (
    <Shell badge={task.badgeLabel ?? "What Do You Notice?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid grid-cols-2 gap-3">
        <Card s={cmp.a} area={areaA} peri={periA} />
        <Card s={cmp.b} area={areaB} peri={periB} />
      </div>
      {phase === "notice" ? (
        <>
          <p className="text-center text-base font-black text-[#5b21b6]">Which is true?</p>
          <div className="grid grid-cols-3 gap-3">
            {btn("area", "Same area")}
            {btn("perimeter", "Same perimeter")}
            {btn("both", "Both")}
          </div>
        </>
      ) : (
        <>
          <div className="rounded-[18px] border border-[rgba(214,184,108,0.5)] bg-[rgba(255,250,240,0.96)] px-4 py-3 text-center text-[15px] font-bold text-[#2c1c07]">
            {sameArea
              ? <>Same space covered — but the <span className="font-black text-[#b45309]">{bigger}</span> needs more fencing!</>
              : <>Same fence all the way around — but they cover a different amount of space!</>}
          </div>
          <button type="button" onClick={onCorrect} className="mx-auto flex min-h-[58px] items-center justify-center rounded-[24px] border-2 border-[#5b21b6] bg-[#5b21b6] px-8 text-lg font-black uppercase text-white shadow-sm transition hover:-translate-y-0.5">Got it →</button>
        </>
      )}
    </Shell>
  );
}

export function MeasurelandsAreaCard({ task, onCorrect, onWrong }: { task: AreaTask; onCorrect: () => void; onWrong: () => void }) {
  switch (task.scene) {
    case "intro": return task.arrayReveal ? <ArrayIntroScene task={task} onCorrect={onCorrect} /> : <IntroScene task={task} onCorrect={onCorrect} />;
    case "investigate": return <InvestigateScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "rows": return <RowColScene task={task} dir="rows" onCorrect={onCorrect} />;
    case "columns": return <RowColScene task={task} dir="columns" onCorrect={onCorrect} />;
    case "arrayArea": return <ArrayAreaScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "calcArea": return <CalcAreaScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "spotMistake": return <SpotMistakeScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "sameDiff": return <SameDiffScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "whichPart": return <WhichPartScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "cover": return <CoverScene task={task} onCorrect={onCorrect} />;
    case "countSquares": return <CountScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "compareArea": return <CompareScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "orderArea": return <OrderScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "sameArea": return <SameAreaScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    default: return <BuildAreaScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  }
}
