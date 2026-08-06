"use client";

import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import { getL2Shape, l2ShapeSvg } from "@/data/activities/starpath/level2/l2-shapes";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { isCompositeSolution, type CompositePlacement } from "@/data/activities/starpath/level4/composite";

type Task = Extract<PracticeTask, { kind: "starpathComposite" }>;
type Figure = NonNullable<Task["figure"]>;
const cellKey = (cell: { r: number; c: number }) => `${cell.r}:${cell.c}`;

const STYLE = (
  <style>{`
    .l4-stage{background:radial-gradient(120% 90% at 50% 2%, #2a2a6e 0%, #16123f 45%, #0b0a24 100%);box-shadow:0 14px 34px -16px rgba(10,8,40,.6), inset 0 0 0 1px rgba(148,163,255,.14);}
    @keyframes l4-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
    .l4-shake{animation:l4-shake .34s ease-in-out;}
    @media (prefers-reduced-motion: reduce){.l4-shake{animation:none;}}
  `}</style>
);

function Svg({ svg, className, style }: { svg: string; className?: string; style?: React.CSSProperties }) {
  return <span className={className} style={style} aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />;
}
function shapeIcon(shape: string, size = 34) {
  return l2ShapeSvg(getL2Shape(shape), { size });
}

// ── Figure build: place familiar shapes into a composite silhouette ────────────
function FigureBuild({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: (a?: string) => void }) {
  const fig = task.figure as Figure;
  const palette = task.buildPalette ?? ["triangle", "square", "rectangle", "circle"];
  const [selected, setSelected] = useState(palette[0]!);
  const [placed, setPlaced] = useState<Record<string, boolean>>({});
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [settled, setSettled] = useState(false);
  const [vbX, vbY, vbW, vbH] = fig.viewBox.split(/\s+/).map(Number) as [number, number, number, number];
  const aspect = vbW / vbH;
  const boxStyle: React.CSSProperties = aspect > 0.85 ? { width: "84%", aspectRatio: `${vbW} / ${vbH}` } : { height: "82%", aspectRatio: `${vbW} / ${vbH}` };
  const placedCount = fig.parts.filter((p) => placed[p.id]).length;
  const modelSvg = `<svg viewBox="${fig.viewBox}" xmlns="http://www.w3.org/2000/svg">${fig.parts.map((p) => (placed[p.id] ? p.solid : p.ghost)).join("")}</svg>`;

  function place(part: Figure["parts"][number]) {
    if (settled || placed[part.id]) return;
    if (selected !== part.shape) {
      setWrongId(part.id);
      setTimeout(() => setWrongId((v) => (v === part.id ? null : v)), 400);
      setSettled(true);
      onWrong(`${part.id}:${selected}`);
      return;
    }
    const next = { ...placed, [part.id]: true };
    setPlaced(next);
    if (fig.parts.every((p) => next[p.id])) {
      setSettled(true);
      onCorrect();
    }
  }

  return (
    <div className="space-y-4">
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <p className="mx-auto max-w-md text-center text-sm font-bold text-slate-500">Pick a shape, then tap the glowing socket it matches.</p>
      <div className="mx-auto flex max-w-lg flex-wrap justify-center gap-2.5">
        {palette.map((shape) => (
          <button
            type="button"
            key={shape}
            onClick={() => setSelected(shape)}
            className={["flex flex-col items-center gap-1 rounded-2xl border-2 bg-white px-3 py-2 shadow-sm transition [&>span>svg]:h-9 [&>span>svg]:w-9", selected === shape ? "border-violet-600 bg-violet-50 ring-4 ring-violet-200" : "border-violet-200 hover:-translate-y-0.5 hover:border-cyan-400"].join(" ")}
          >
            <Svg svg={shapeIcon(shape)} />
            <span className="text-[11px] font-black capitalize text-indigo-950">{shape}</span>
          </button>
        ))}
      </div>
      <div className="l4-stage mx-auto flex aspect-square w-full max-w-sm items-center justify-center overflow-hidden rounded-3xl p-4">
        <div className="relative" style={boxStyle}>
          <Svg svg={modelSvg} className="pointer-events-none block h-full w-full [&>svg]:h-full [&>svg]:w-full" style={{ filter: "drop-shadow(0 8px 10px rgba(0,0,0,.42))" }} />
          {fig.parts.filter((part) => !placed[part.id]).map((part) => {
            const l = ((part.hit.x - vbX) / vbW) * 100;
            const t = ((part.hit.y - vbY) / vbH) * 100;
            const w = (part.hit.w / vbW) * 100;
            const h = (part.hit.h / vbH) * 100;
            return (
              <button
                type="button"
                key={part.id}
                onClick={() => place(part)}
                aria-label={`${part.label} — needs a ${part.shape}`}
                style={{ left: `${l}%`, top: `${t}%`, width: `${w}%`, height: `${h}%` }}
                className={["absolute rounded-lg transition", wrongId === part.id ? "l4-shake bg-rose-400/30" : "hover:bg-cyan-300/20"].join(" ")}
              />
            );
          })}
        </div>
      </div>
      <p className="text-center text-xs font-semibold text-slate-500">{placedCount}/{fig.parts.length} shapes placed</p>
      {STYLE}
    </div>
  );
}

// ── Figure scan: name the familiar shapes that make the figure ─────────────────
function FigureScan({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: (a?: string) => void }) {
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [settled, setSettled] = useState(false);
  function choose(id: string) {
    if (settled) return;
    if (id === task.correctOptionId) {
      setSettled(true);
      onCorrect();
    } else {
      setWrongId(id);
      setTimeout(() => setWrongId((v) => (v === id ? null : v)), 400);
      setSettled(true);
      onWrong(id);
    }
  }
  return (
    <div className="space-y-4">
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="l4-stage mx-auto flex aspect-square w-full max-w-xs items-center justify-center rounded-3xl p-5">
        <Svg svg={task.figureSvg ?? ""} className="block h-[86%] w-[86%] [&>svg]:h-full [&>svg]:w-full" />
      </div>
      <div className="mx-auto grid max-w-md gap-2.5">
        {(task.options ?? []).map((option) => (
          <button
            type="button"
            key={option.id}
            onClick={() => choose(option.id)}
            className={["rounded-2xl border-2 px-4 py-3 text-center text-base font-black capitalize transition", wrongId === option.id ? "l4-shake border-rose-400 bg-rose-50 text-rose-900" : "border-violet-200 bg-white text-indigo-950 hover:-translate-y-0.5 hover:border-cyan-400"].join(" ")}
          >
            {option.label}
          </button>
        ))}
      </div>
      {STYLE}
    </div>
  );
}

// ── Figure compare: pick the complete build, then the reason ───────────────────
function FigureCompare({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: (a?: string) => void }) {
  const [choice, setChoice] = useState("");
  const [reason, setReason] = useState("");
  const [settled, setSettled] = useState(false);
  function submit() {
    if (settled) return;
    setSettled(true);
    if (choice === task.correctOptionId && reason === task.correctReasonId) onCorrect();
    else onWrong(`${choice}:${reason}`);
  }
  return (
    <div className="space-y-4">
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="mx-auto grid max-w-xl gap-3 sm:grid-cols-2">
        {(task.figureOptions ?? []).map((option) => (
          <button
            type="button"
            key={option.id}
            onClick={() => !settled && setChoice(option.id)}
            className={["l4-stage flex aspect-square items-center justify-center rounded-3xl p-4 transition", choice === option.id ? "ring-4 ring-violet-400" : "opacity-90 hover:opacity-100"].join(" ")}
          >
            <Svg svg={option.svg} className="block h-[84%] w-[84%] [&>svg]:h-full [&>svg]:w-full" />
          </button>
        ))}
      </div>
      <div className="mx-auto grid max-w-xl gap-2">
        {(task.reasonOptions ?? []).map((option) => (
          <button
            type="button"
            key={option.id}
            onClick={() => !settled && setReason(option.id)}
            className={["rounded-2xl border-2 p-3 text-left text-sm font-semibold transition", reason === option.id ? "border-cyan-500 bg-cyan-50 text-cyan-950" : "border-slate-200 bg-white text-slate-700 hover:border-cyan-300"].join(" ")}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="flex justify-center">
        <button type="button" onClick={submit} disabled={settled || !choice || !reason} className="flex h-12 items-center gap-2 rounded-2xl bg-emerald-600 px-7 font-black text-white shadow-md transition hover:bg-emerald-700 active:scale-95 disabled:opacity-40">
          <Check className="h-5 w-5" /> Check
        </button>
      </div>
      {STYLE}
    </div>
  );
}

// ── Legacy cube board (Week 2 solid / views / hidden) ──────────────────────────
function cubeStack(height: number, size = 42) {
  const unit = 12;
  const parts: string[] = [];
  for (let i = 0; i < height; i += 1) {
    const y = 42 - (i + 1) * unit;
    parts.push(`<path d="M14 ${y + 4} L24 ${y} L34 ${y + 4} L24 ${y + 8} Z" fill="#c4b5fd" stroke="#4c1d95" stroke-width="1.4"/><path d="M14 ${y + 4} V${y + 4 + unit} L24 ${y + 8 + unit} V${y + 8} Z" fill="#8b5cf6" stroke="#4c1d95" stroke-width="1.4"/><path d="M34 ${y + 4} V${y + 4 + unit} L24 ${y + 8 + unit} V${y + 8} Z" fill="#6d28d9" stroke="#4c1d95" stroke-width="1.4"/>`);
  }
  return `<svg viewBox="0 0 48 48" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">${parts.join("")}</svg>`;
}
function LegacyBoard({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: (a?: string) => void }) {
  const [selected, setSelected] = useState(task.palette?.[0]?.id ?? "");
  const [placements, setPlacements] = useState<CompositePlacement[]>(task.fixedCells ?? []);
  const [settled, setSettled] = useState(false);
  const cols = task.cols ?? 4;
  const rows = task.rows ?? 3;
  const occupied = new Map(placements.map((item) => [cellKey(item), item]));
  function place(r: number, c: number) {
    if (settled) return;
    const k = `${r}:${c}`;
    setPlacements((cur) => (cur.some((item) => cellKey(item) === k) ? cur.filter((item) => cellKey(item) !== k) : [...cur, { r, c, pieceId: selected }]));
  }
  function submit() {
    if (settled) return;
    setSettled(true);
    if (isCompositeSolution(task, placements)) onCorrect();
    else onWrong(placements.map((item) => `${cellKey(item)}=${item.pieceId}`).join(","));
  }
  return (
    <div className="space-y-4">
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="mx-auto max-w-md rounded-2xl border border-cyan-300/40 bg-cyan-50/80 px-3 py-2 text-center text-sm font-bold text-cyan-950">{task.designBrief}</div>
      {task.viewLabels ? (
        <div className="mx-auto grid max-w-md grid-cols-3 gap-2 text-center text-xs font-black">
          <div className="rounded-xl border border-violet-300 bg-violet-50 px-2 py-2 text-violet-900">Front<br /><span className="text-sm">{task.viewLabels.front.join(" · ")}</span></div>
          <div className="rounded-xl border border-cyan-300 bg-cyan-50 px-2 py-2 text-cyan-900">Side<br /><span className="text-sm">{task.viewLabels.side.join(" · ")}</span></div>
          <div className="rounded-xl border border-amber-300 bg-amber-50 px-2 py-2 text-amber-900">Top<br /><span className="text-sm">{task.viewLabels.top} cells</span></div>
        </div>
      ) : null}
      <div className="mx-auto flex max-w-lg flex-wrap justify-center gap-2.5">
        {(task.palette ?? []).map((piece) => (
          <button type="button" key={piece.id} onClick={() => setSelected(piece.id)} className={["flex flex-col items-center gap-1 rounded-2xl border-2 bg-white px-3 py-2 [&>span>svg]:h-8 [&>span>svg]:w-8", selected === piece.id ? "border-violet-600 bg-violet-50 ring-4 ring-violet-200" : "border-violet-200"].join(" ")}>
            <Svg svg={cubeStack(Number(piece.id.split("-")[1] ?? 1))} />
            <span className="text-[11px] font-black text-indigo-950">{piece.label}</span>
          </button>
        ))}
      </div>
      <div className="l4-stage mx-auto w-full max-w-md rounded-3xl p-4">
        <div className="mx-auto grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: rows * cols }, (_, index) => {
            const r = Math.floor(index / cols);
            const c = index % cols;
            const item = occupied.get(`${r}:${c}`);
            return (
              <button type="button" key={`${r}:${c}`} onClick={() => place(r, c)} aria-label={`Row ${r + 1}, column ${c + 1}`} className={["flex aspect-square items-center justify-center rounded-xl border-2 transition [&>span>svg]:h-[86%] [&>span>svg]:w-[86%]", item ? "border-transparent bg-white/5" : "border-white/10 bg-white/[0.03] hover:border-cyan-300/50"].join(" ")}>
                {item ? <Svg svg={cubeStack(Number(item.pieceId.split("-")[1] ?? 1))} /> : null}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex justify-center gap-2.5">
        <button type="button" onClick={() => setPlacements(task.fixedCells ?? [])} disabled={settled} title="Reset" aria-label="Reset" className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white text-slate-600 disabled:opacity-40"><RotateCcw className="h-5 w-5" /></button>
        <button type="button" onClick={submit} disabled={settled || !placements.length} className="flex h-12 items-center gap-2 rounded-2xl bg-emerald-600 px-7 font-black text-white shadow-md hover:bg-emerald-700 disabled:opacity-40"><Check className="h-5 w-5" /> Check</button>
      </div>
      {STYLE}
    </div>
  );
}

export default function StarpathCompositeCard({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: (answer?: string) => void }) {
  if (task.figure) return <FigureBuild task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.figureOptions?.length) return <FigureCompare task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.figureSvg) return <FigureScan task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  return <LegacyBoard task={task} onCorrect={onCorrect} onWrong={onWrong} />;
}
