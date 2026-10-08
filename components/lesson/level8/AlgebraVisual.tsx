"use client";
import { useId } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import type { Algebra8Visual, GraphLine } from "@/data/activities/level8/algebra-visual";
import { algebra8VisualSpeech } from "@/data/activities/level8/algebra-visual";

// Level 8 Algebra diagrams. Each one supports the question without showing its answer.
const INK = "#1f2a37", MUTED = "#64748b", GRID = "#e2e8f0", LINES = ["#7c3aed", "#c2410c", "#0f766e"], NEG = "#dc2626";
const minus = (n: number) => (n < 0 ? `−${-n}` : String(n));

function Graph({ v }: { v: Extract<Algebra8Visual, { kind: "graph" }> }) {
  const clip = useId().replace(/:/g, "");
  const W = 340, H = 310, L = 40, R = W - 14, T = 16, B = H - 34;
  const X = (x: number) => L + ((x - v.xMin) / (v.xMax - v.xMin)) * (R - L);
  const Y = (y: number) => B - ((y - v.yMin) / (v.yMax - v.yMin)) * (B - T);
  const xs: number[] = [], ys: number[] = [];
  const xStep = v.xMax - v.xMin > 12 ? 2 : 1, yStep = v.yStep ?? (v.yMax - v.yMin > 24 ? 5 : v.yMax - v.yMin > 12 ? 2 : 1);
  for (let x = Math.ceil(v.xMin / xStep) * xStep; x <= v.xMax; x += xStep) xs.push(x);
  for (let y = Math.ceil(v.yMin / yStep) * yStep; y <= v.yMax; y += yStep) ys.push(y);
  const ax = v.yMin <= 0 && v.yMax >= 0 ? Y(0) : B, ay = v.xMin <= 0 && v.xMax >= 0 ? X(0) : L;
  const ends = (l: GraphLine) =>
    "x" in l ? [X(l.x), Y(v.yMin), X(l.x), Y(v.yMax)] : [X(v.xMin), Y(l.m * v.xMin + l.c), X(v.xMax), Y(l.m * v.xMax + l.c)];
  const region = () => {
    if (!v.shade) return null;
    const l = v.lines[v.shade.line], s = v.shade.side;
    if ("x" in l) return s === "left" ? `${L},${T} ${X(l.x)},${T} ${X(l.x)},${B} ${L},${B}` : `${X(l.x)},${T} ${R},${T} ${R},${B} ${X(l.x)},${B}`;
    const [x1, y1, x2, y2] = ends(l), edge = s === "above" ? T - 400 : B + 400;
    return `${x1},${y1} ${x2},${y2} ${x2},${edge} ${x1},${edge}`;
  };
  // Label each line beside it, on the side where the text cannot cross the line.
  const labelAt = (l: GraphLine, i: number) => {
    if ("x" in l) return l.x < 0 ? { x: X(l.x) - 5, y: B - 8 - i * 18, anchor: "end" as const } : { x: X(l.x) + 5, y: B - 8 - i * 18, anchor: "start" as const };
    const inside = (x: number) => { const y = l.m * x + l.c; return y <= v.yMax && y >= v.yMin; };
    const xs: number[] = [];
    for (let x = v.xMin; x <= v.xMax + 1e-9; x += 0.1) if (inside(x)) xs.push(x);
    if (!xs.length) return { x: R - 4, y: T + 14 + i * 16, anchor: "end" as const };
    const x = xs[0] + (xs[xs.length - 1] - xs[0]) * (i % 2 ? 0.12 : 0.88), px = X(x), py = Y(l.m * x + l.c);
    if (l.m === 0) return { x: R - 4, y: py - 7, anchor: "end" as const };
    // Text runs rightwards, so put it right of a line only when there is room.
    const right = px < R - 110;
    if (l.m > 0) return right ? { x: px + 8, y: py + 16, anchor: "start" as const } : { x: px - 8, y: py - 8, anchor: "end" as const };
    return right ? { x: px + 8, y: py - 8, anchor: "start" as const } : { x: px - 8, y: py + 16, anchor: "end" as const };
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-md" role="img" aria-label={algebra8VisualSpeech(v)}>
      <defs><clipPath id={clip}><rect x={L} y={T} width={R - L} height={B - T} /></clipPath></defs>
      {xs.map((x) => <line key={`gx${x}`} x1={X(x)} x2={X(x)} y1={T} y2={B} stroke={GRID} />)}
      {ys.map((y) => <line key={`gy${y}`} x1={L} x2={R} y1={Y(y)} y2={Y(y)} stroke={GRID} />)}
      {v.shade && <polygon points={region()!} fill={LINES[0]} opacity={0.14} clipPath={`url(#${clip})`} />}
      <line x1={L} x2={R} y1={ax} y2={ax} stroke={INK} strokeWidth={1.6} />
      <line x1={ay} x2={ay} y1={T} y2={B} stroke={INK} strokeWidth={1.6} />
      {xs.filter((x) => x !== 0).map((x) => <text key={`tx${x}`} x={X(x)} y={Math.min(ax + 18, H - 6)} textAnchor="middle" fontSize={15} fill={MUTED}>{minus(x)}</text>)}
      {ys.filter((y) => y !== 0).map((y) => <text key={`ty${y}`} x={ay - 5} y={Y(y) + 5} textAnchor="end" fontSize={15} fill={MUTED}>{minus(y)}</text>)}
      {v.xMin <= 0 && v.yMin <= 0 && <text x={ay - 5} y={ax + 18} textAnchor="end" fontSize={15} fill={MUTED}>0</text>}
      <text x={R} y={ax - 6} textAnchor="end" fontSize={16} fontWeight={700} fill={INK}>{v.xLabel ?? "x"}</text>
      <text x={ay + 6} y={T + 10} fontSize={16} fontWeight={700} fill={INK}>{v.yLabel ?? "y"}</text>
      <g clipPath={`url(#${clip})`}>
        {v.lines.map((l, i) => { const [x1, y1, x2, y2] = ends(l); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={LINES[i % 3]} strokeWidth={2.8} strokeDasharray={v.shade?.line === i && v.shade.strict ? "7 5" : undefined} />; })}
        {v.points?.filter((p) => p.guide).map((p, i) => (
          <g key={`g${i}`} stroke={MUTED} strokeDasharray="4 4" strokeWidth={1.4}>
            <line x1={X(p.x)} x2={X(p.x)} y1={Y(p.y)} y2={ax} />
            <line x1={X(p.x)} x2={ay} y1={Y(p.y)} y2={Y(p.y)} />
          </g>
        ))}
      </g>
      {v.lines.map((l, i) => { const at = labelAt(l, i); return <text key={`l${i}`} x={at.x} y={at.y} textAnchor={at.anchor} fontSize={16} fontWeight={700} fill={LINES[i % 3]} stroke="#fff" strokeWidth={4} paintOrder="stroke">{l.label}</text>; })}
      {v.points?.map((p, i) => (
        <g key={`p${i}`}>
          <circle cx={X(p.x)} cy={Y(p.y)} r={5.5} fill={INK} stroke="#fff" strokeWidth={1.5} />
          {p.label && <text x={X(p.x) + 7} y={Y(p.y) - 7} fontSize={16} fontWeight={700} fill={INK} stroke="#fff" strokeWidth={4} paintOrder="stroke">{p.label}</text>}
        </g>
      ))}
    </svg>
  );
}

function Inequality({ v }: { v: Extract<Algebra8Visual, { kind: "inequality" }> }) {
  const W = 360, L = 24, R = 336, X = (n: number) => L + ((n - v.min) / (v.max - v.min)) * (R - L), y = 52;
  const ticks = Array.from({ length: v.max - v.min + 1 }, (_, i) => v.min + i);
  const a = v.from ? X(v.from.value) : L - 12, b = v.to ? X(v.to.value) : R + 12, colour = LINES[0];
  const dot = (e: { value: number; closed: boolean }) => <circle cx={X(e.value)} cy={y} r={7} fill={e.closed ? colour : "#fff"} stroke={colour} strokeWidth={3} />;
  return (
    <svg viewBox={`0 0 ${W} 96`} className="mx-auto w-full max-w-lg" role="img" aria-label={algebra8VisualSpeech(v)}>
      <defs><marker id="a8-arrow" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="16" markerHeight="16" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill={colour} /></marker></defs>
      <line x1={L - 14} x2={R + 14} y1={y} y2={y} stroke={INK} strokeWidth={2} />
      {ticks.map((n) => <g key={n}><line x1={X(n)} x2={X(n)} y1={y - 7} y2={y + 7} stroke={INK} strokeWidth={1.4} />{(ticks.length <= 11 || (n - v.min) % 2 === 0) && <text x={X(n)} y={y + 30} textAnchor="middle" fontSize={20} fill={INK}>{minus(n)}</text>}</g>)}
      <line x1={a} x2={b} y1={y} y2={y} stroke={colour} strokeWidth={6} markerEnd={v.to ? undefined : "url(#a8-arrow)"} markerStart={v.from ? undefined : "url(#a8-arrow)"} />
      {v.from && dot(v.from)}
      {v.to && dot(v.to)}
    </svg>
  );
}

function Tiles({ v }: { v: Extract<Algebra8Visual, { kind: "tiles" }> }) {
  const tile = (neg: boolean, long: boolean, key: string) => (
    <span key={key} className={`inline-flex items-center justify-center rounded border-2 text-sm font-bold ${long ? "h-14 w-7" : "h-7 w-7"}`} style={{ borderColor: neg ? NEG : LINES[0], background: neg ? "#fee2e2" : "#ede9fe", color: neg ? NEG : LINES[0] }}>
      {long ? (neg ? "−x" : "x") : neg ? "−1" : "1"}
    </span>
  );
  return (
    <div className="flex flex-wrap items-end justify-center gap-3 py-2" role="img" aria-label={algebra8VisualSpeech(v)}>
      {v.groups.map((g, i) => (
        <div key={i} className="flex items-end gap-3">
          {i > 0 && <span className="pb-1 text-xl font-bold" style={{ color: MUTED }}>{v.joiner ?? "+"}</span>}
          <div className="flex max-w-[11rem] flex-wrap items-end gap-1 rounded-lg border border-dashed border-slate-300 p-2">
            {Array.from({ length: Math.abs(g.x) }, (_, k) => tile(g.x < 0, true, `x${k}`))}
            {Array.from({ length: Math.abs(g.units) }, (_, k) => tile(g.units < 0, false, `u${k}`))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Area({ v }: { v: Extract<Algebra8Visual, { kind: "area" }> }) {
  return (
    <div className="mx-auto w-fit py-2" role="img" aria-label={algebra8VisualSpeech(v)}>
      <div className="grid items-center gap-1" style={{ gridTemplateColumns: `auto repeat(${v.parts.length}, minmax(4.5rem, 1fr))` }}>
        <span />
        {v.parts.map((p, i) => <span key={i} className="text-center text-lg font-bold" style={{ color: LINES[0] }}>{p}</span>)}
        <span className="pr-2 text-lg font-bold" style={{ color: LINES[1] }}>{v.outer}</span>
        {v.cells.map((c, i) => (
          <span key={i} className="flex h-16 items-center justify-center border-2 text-lg font-bold" style={{ borderColor: INK, background: c === "?" ? "#fff7ed" : "#f5f3ff", color: INK }}>{c}</span>
        ))}
      </div>
    </div>
  );
}

function Steps({ v }: { v: Extract<Algebra8Visual, { kind: "steps" }> }) {
  return (
    <ol className="mx-auto grid max-w-md gap-1.5 py-1" role="img" aria-label={algebra8VisualSpeech(v)}>
      {v.rows.map((r, i) => (
        <li key={i} className="grid grid-cols-[3.5rem_1fr_auto_1fr] items-center gap-2 rounded-lg bg-slate-50 px-2 py-1.5 text-lg">
          <span className="text-xs font-bold uppercase" style={{ color: MUTED }}>Line {i + 1}</span>
          <span className="text-right font-semibold">{r.left}</span>
          <span>=</span>
          <span className="font-semibold">{r.right}{r.note && <span className="ml-2 text-sm font-normal" style={{ color: MUTED }}>{r.note}</span>}</span>
        </li>
      ))}
    </ol>
  );
}

export default function AlgebraVisual({ visual }: { visual: Algebra8Visual }) {
  return (
    <div className="rounded-xl border border-violet-300 bg-white p-4 text-slate-900">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="font-bold">{visual.title}</p>
        <ReadAloudBtn text={algebra8VisualSpeech(visual)} label="Read diagram" />
      </div>
      {visual.kind === "graph" && <Graph v={visual} />}
      {visual.kind === "inequality" && <Inequality v={visual} />}
      {visual.kind === "tiles" && <Tiles v={visual} />}
      {visual.kind === "area" && <Area v={visual} />}
      {visual.kind === "steps" && <Steps v={visual} />}
    </div>
  );
}
