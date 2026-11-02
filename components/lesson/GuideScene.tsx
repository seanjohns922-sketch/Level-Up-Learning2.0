"use client";

import Image from "next/image";
import type { GuideVisual, ScenePart } from "@/data/lesson-guides/guide-visual";
import { moneyName } from "@/data/lesson-guides/guide-visual";
import GuideVisualView from "@/components/lesson/GuideVisual";

// Picture-led worked examples for Levels 1–2, drawn with the lessons' own objects (glossy counters,
// striped tens rods, amber ones cubes, dashed group circles). `step` is the step the child has
// chosen; null means the guide is at rest, so every part shows and nothing is lit up.

const INK = "#16302d", TEAL = "#0f9488", TEAL_LIGHT = "#14b8a6", MINT = "#e7f8f4", ORANGE = "#ff9e1f", ORANGE_INK = "#b45309", CROSS = "#b91c1c";
const GLOSS = "radial-gradient(circle at 34% 28%, #fff 0 12%, #ffd27a 24%, #ff9e1f 70%, #d97706)";
const GLOSS_TEAL = "radial-gradient(circle at 34% 28%, #fff 0 12%, #8ff0e2 24%, #14b8a6 70%, #0b6d64)";
const COLOURS: Record<string, string> = { red: "#ef4444", blue: "#3b82f6", yellow: "#facc15", green: "#22c55e", purple: "#a855f7", orange: "#f97316" };
const SHAPES: Record<string, string> = { "★": "star", "●": "circle", "▲": "triangle", "■": "square" };

type Step = number | null;
const shown = (p: { step?: number }, step: Step) => step === null || !p.step || step >= p.step;
const lit = (p: { focus?: number[] }, step: Step) => step !== null && !!p.focus?.includes(step);
const after = (at: number | undefined, step: Step) => at === undefined || step === null || step >= at;

function Counter({ teal, crossed, ringed, size = 34, icon }: { teal?: boolean; crossed?: boolean; ringed?: boolean; size?: number; icon?: string }) {
  return <span className="relative inline-block" style={{ width: size, height: size }}>
    {icon
      ? <span className="grid h-full w-full place-items-center leading-none transition-opacity duration-300" style={{ fontSize: size * 0.82, opacity: crossed ? 0.32 : 1 }} aria-hidden>{icon}</span>
      : <span className="block h-full w-full rounded-full shadow-[0_3px_3px_rgba(0,0,0,0.2)] transition-opacity duration-300" style={{ background: teal ? GLOSS_TEAL : GLOSS, opacity: crossed ? 0.32 : 1, outline: ringed ? `3px solid ${TEAL}` : undefined, outlineOffset: 2 }} />}
    {crossed && <svg viewBox="0 0 10 10" className="absolute inset-0" aria-hidden><path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke={CROSS} strokeWidth="1.6" strokeLinecap="round" /></svg>}
  </span>;
}

function Counters({ p, step }: { p: Extract<ScenePart, { type: "counters" }>; step: Step }) {
  const total = p.n + (p.second ?? 0), crossed = after(p.crossStep, step) ? (p.crossed ?? 0) : 0, ring = after(p.ringStep, step) ? (p.ring ?? 0) : 0;
  const cols = p.frame ? 5 : Math.min(p.cols ?? total, 5);
  const cells = p.frame ? Math.max(10, Math.ceil(total / 10) * 10) : total;
  return <div className={`grid justify-center ${p.frame ? "gap-0 overflow-hidden rounded-lg border-[3px] bg-white" : "gap-2"}`} style={{ gridTemplateColumns: `repeat(${cols}, auto)`, borderColor: TEAL }}>
    {Array.from({ length: cells }, (_, i) => {
      const counter = i < total ? <Counter teal={i >= p.n} crossed={i >= total - crossed} ringed={i < ring} icon={p.icon} size={p.icon && !p.frame && total <= 6 ? 46 : 34} /> : <span className="block h-[34px] w-[34px]" />;
      return p.frame ? <span key={i} className="grid h-10 w-10 place-items-center border border-[#9fd8cf]">{counter}</span> : <span key={i}>{counter}</span>;
    })}
  </div>;
}

function Cube({ size = 18 }: { size?: number }) {
  return <span className="inline-block rounded-[4px]" style={{ width: size, height: size, background: "linear-gradient(135deg,#ffcf6b,#f59e0b)", boxShadow: "inset 2px 2px 0 rgba(255,255,255,.55)" }} />;
}
const Rod = ({ small }: { small?: boolean }) => <span className="inline-block rounded-[4px]" style={{ height: small ? 70 : 110, width: small ? 12 : 18, background: `repeating-linear-gradient(180deg,#22b8a7 0 ${small ? 6 : 9.6}px,#0d8f82 ${small ? 6 : 9.6}px ${small ? 7 : 11}px)`, boxShadow: "inset 2px 0 0 rgba(255,255,255,.5)" }} />;
const Flat = ({ small, tiny }: { small?: boolean; tiny?: boolean }) => { const cell = tiny ? 5 : small ? 7 : 11; return <span className="inline-block rounded-[4px]" style={{ height: cell * 10, width: cell * 10, background: `repeating-linear-gradient(90deg,transparent 0 ${cell - 1.4}px,#0d8f82 ${cell - 1.4}px ${cell}px),repeating-linear-gradient(180deg,#22b8a7 0 ${cell - 1.4}px,#0d8f82 ${cell - 1.4}px ${cell}px)` }} />; };

function Blocks({ p }: { p: Extract<ScenePart, { type: "blocks" }> }) {
  const small = (p.hundreds ?? 0) >= 3 || (p.tens ?? 0) >= 9;
  return <div className="flex flex-wrap items-end justify-center gap-3">
    {(p.hundreds ?? 0) > 0 && <div className="flex max-w-full flex-wrap gap-1.5">{Array.from({ length: p.hundreds! }, (_, i) => <Flat key={i} small={small} tiny={p.hundreds! >= 6} />)}</div>}
    {(p.tens ?? 0) > 0 && <div className="flex flex-wrap gap-1">{Array.from({ length: p.tens! }, (_, i) => <Rod key={i} small={small} />)}</div>}
    {(p.ones ?? 0) > 0 && <div className="grid grid-cols-5 gap-1">{Array.from({ length: p.ones! }, (_, i) => <Cube key={i} />)}</div>}
  </div>;
}

function Groups({ p, step }: { p: Extract<ScenePart, { type: "groups" }>; step: Step }) {
  const filled = after(p.fillStep, step);
  const ring = p.each > 6 ? 130 : p.each > 4 ? 96 : 86, seed = p.each > 4 && p.each <= 6 ? 20 : 24;
  return <div className="flex flex-wrap justify-center gap-2">
    {Array.from({ length: p.groups }, (_, g) => <div key={g} className="flex flex-wrap content-center items-center justify-center gap-1 rounded-[50%] border-4 border-dashed bg-white p-2" style={{ borderColor: TEAL_LIGHT, width: ring, minHeight: ring }}>
      {filled ? Array.from({ length: p.each }, (_, i) => p.object === "cube" ? <Cube key={i} size={20} /> : <Counter key={i} size={seed} />) : <span className="text-2xl font-black" style={{ color: TEAL }}>?</span>}
    </div>)}
  </div>;
}

function NumberLineView({ p, step }: { p: Extract<ScenePart, { type: "line" }>; step: Step }) {
  const W = 460, L = 24, R = W - 24, x = (v: number) => L + ((v - p.min) / (p.max - p.min)) * (R - L), y = 84;
  const ticks: number[] = []; for (let v = p.min; v <= p.max + 1e-9; v += p.tick) ticks.push(Math.round(v * 1000) / 1000);
  const every = p.labelEvery ?? p.tick;
  const onTick = (v: number) => Math.abs(((v - p.min) / every) % 1) < 1e-6;
  return <svg viewBox={`0 0 ${W} 144`} className="block w-full max-w-[520px]" aria-hidden>
    <line x1={L - 8} x2={R + 8} y1={y} y2={y} stroke={INK} strokeWidth={3} />
    {ticks.map((t) => { const big = Math.abs(((t - p.min) / every) % 1) < 1e-6; return <g key={t}><line x1={x(t)} x2={x(t)} y1={y - (big ? 9 : 6)} y2={y + (big ? 9 : 6)} stroke={INK} strokeWidth={big ? 2 : 1.2} />{big && <text x={x(t)} y={y + 30} textAnchor="middle" fontSize={15} fontWeight={800} fill={INK}>{t}</text>}</g>; })}
    {(p.jumps ?? []).map((j, i) => { const a = x(j.from), b = x(j.to), mid = (a + b) / 2, h = Math.min(54, Math.abs(b - a) * 0.42 + 6), hide = !after(j.step, step);
      return <g key={i} style={{ opacity: hide ? 0 : 1, transition: "opacity .3s" }}><path d={`M${a} ${y - 4} Q${mid} ${y - 4 - h * 1.6} ${b} ${y - 4}`} fill="none" stroke={j.step && step === j.step ? ORANGE : TEAL} strokeWidth={3.5} /><path d={`M${b} ${y - 4} l${b > a ? -9 : 9} -7 M${b} ${y - 4} l${b > a ? -2 : 2} -11`} stroke={j.step && step === j.step ? ORANGE : TEAL} strokeWidth={3} fill="none" strokeLinecap="round" />{j.text && <text x={mid} y={y - 10 - h * 0.85} textAnchor="middle" fontSize={14} fontWeight={800} fill={TEAL}>{j.text}</text>}</g>; })}
    {(p.marks ?? []).map((m, i) => { const hide = !after(m.step, step), c = m.tone === "unknown" ? ORANGE : m.tone === "answer" ? ORANGE : TEAL;
      return <g key={i} style={{ opacity: hide ? 0 : 1, transition: "opacity .3s" }}><circle cx={x(m.value)} cy={y} r={8} fill={c} />{m.text && !(onTick(m.value) && m.text === String(m.value)) && <text x={x(m.value)} y={y + 52} textAnchor="middle" fontSize={15} fontWeight={800} fill={m.tone ? ORANGE_INK : INK}>{m.text}</text>}</g>; })}
  </svg>;
}

function BarModel({ p, step }: { p: Extract<ScenePart, { type: "barModel" }>; step: Step }) {
  const reveal = p.answer !== undefined && after(p.answerStep, step);
  const cell = (text: string, unknown: boolean, grow: number, key?: number) => <div key={key} className="grid min-h-12 place-items-center rounded-lg px-3 text-lg font-black" style={{ flexGrow: grow, flexBasis: 0, background: unknown ? (reveal ? ORANGE : "#fff") : "#a7e3d8", color: unknown ? (reveal ? "#fff" : ORANGE_INK) : INK, border: unknown && !reveal ? `3px dashed ${ORANGE}` : undefined }}>{unknown ? (reveal ? p.answer : "?") : text}</div>;
  const sizes = p.parts.map((x) => Math.max(1, Number(String(x).replace(/[^\d.]/g, "")) || 1));
  return <div className="grid w-full max-w-[420px] gap-2">
    <div className="flex">{cell(p.whole, p.unknown === "whole", 1)}</div>
    <div className="flex gap-1.5">{p.parts.map((x, i) => cell(x, p.unknown === i, sizes[i], i))}</div>
  </div>;
}

function Fraction({ p, step }: { p: Extract<ScenePart, { type: "fraction" }>; step: Step }) {
  const shaded = after(p.shadeStep, step) ? p.shaded : 0;
  if (p.shape === "circle") {
    const r = 54, c = 60, seg = (i: number) => { const a0 = (i / p.parts) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / p.parts) * 2 * Math.PI - Math.PI / 2; return `M${c} ${c}L${c + r * Math.cos(a0)} ${c + r * Math.sin(a0)}A${r} ${r} 0 0 1 ${c + r * Math.cos(a1)} ${c + r * Math.sin(a1)}Z`; };
    return <svg viewBox="0 0 120 120" className="h-32 w-32" aria-hidden>{Array.from({ length: p.parts }, (_, i) => <path key={i} d={seg(i)} fill={i < shaded ? TEAL_LIGHT : "#fff"} stroke={INK} strokeWidth={2} />)}</svg>;
  }
  const cols = p.shape === "bar" ? p.parts : p.parts === 4 ? 2 : p.parts;
  const rows = p.shape === "bar" ? 1 : Math.ceil(p.parts / cols);
  return <div className="grid overflow-hidden rounded-md border-[3px] bg-white" style={{ borderColor: INK, gridTemplateColumns: `repeat(${cols}, ${p.shape === "bar" ? "38px" : "56px"})`, gridTemplateRows: `repeat(${rows}, ${p.shape === "bar" ? "48px" : "56px"})` }}>
    {Array.from({ length: p.parts }, (_, i) => <span key={i} className="border transition-colors duration-300" style={{ borderColor: INK, background: i < shaded ? TEAL_LIGHT : "#fff" }} />)}
  </div>;
}

function Seq({ items }: { items: string[] }) {
  const size = items.length > 6 ? 36 : 48;
  return <div className="flex flex-wrap items-center justify-center gap-1">{items.map((x, i) => {
    if (x === "?") return <span key={i} className="grid place-items-center rounded-full border-4 border-dashed text-2xl font-black" style={{ width: size, height: size, borderColor: ORANGE, color: ORANGE_INK }}>?</span>;
    if (COLOURS[x]) return <span key={i} className="block rounded-full shadow-[0_3px_3px_rgba(0,0,0,0.2)]" style={{ width: size, height: size, background: COLOURS[x] }} title={x} />;
    if (x === "|") return <span key={i} className="mx-1 h-12 w-[3px] rounded bg-[#0f9488]" />;
    return <span key={i} className="grid place-items-center leading-none" style={{ width: size, height: size, fontSize: size * 0.75, color: SHAPES[x] === "star" ? "#eab308" : SHAPES[x] === "triangle" ? "#ef4444" : SHAPES[x] === "square" ? "#3b82f6" : TEAL }}>{x}</span>;
  })}</div>;
}

function Tally({ n }: { n: number }) {
  const fives = Math.floor(n / 5), ones = n % 5;
  const group = (k: number, gate: boolean, key: number) => <svg key={key} viewBox="0 0 56 60" className="h-14 w-14" aria-hidden>{Array.from({ length: k }, (_, i) => <line key={i} x1={8 + i * 11} x2={8 + i * 11} y1={6} y2={54} stroke={INK} strokeWidth={4} strokeLinecap="round" />)}{gate && <line x1={2} y1={46} x2={52} y2={12} stroke={TEAL} strokeWidth={4} strokeLinecap="round" />}</svg>;
  return <div className="flex flex-wrap items-center justify-center gap-2">{Array.from({ length: fives }, (_, i) => group(4, true, i))}{ones > 0 && group(ones, false, 99)}</div>;
}

function Pictograph({ p }: { p: Extract<ScenePart, { type: "pictograph" }> }) {
  return <div className="grid w-full gap-1.5 overflow-x-auto rounded-xl bg-white p-3">{p.rows.map((r) => <div key={r.label} className="flex items-center gap-3"><span className="w-20 shrink-0 text-right text-base font-bold" style={{ color: INK }}>{r.label}</span><span className="flex shrink-0 gap-1 text-2xl leading-none">{Array.from({ length: r.n }, (_, i) => <span key={i}>{p.icon}</span>)}</span></div>)}</div>;
}

function Balance({ p }: { p: Extract<ScenePart, { type: "balance" }> }) {
  return <div className="flex flex-col items-center">
    <div className="flex items-end gap-16"><span className="mb-1 rounded-lg bg-white px-3 py-2 text-base font-black" style={{ color: INK }}>{p.object}</span><span className="mb-1 grid grid-cols-4 gap-1">{Array.from({ length: p.cubes }, (_, i) => <Cube key={i} size={p.cubeSize === "big" ? 28 : p.cubeSize === "small" ? 12 : 16} />)}</span></div>
    <svg viewBox="0 0 260 70" className="w-64" aria-hidden><path d="M20 10h220" stroke={INK} strokeWidth="7" strokeLinecap="round" /><path d="M130 10v52M96 64h68" stroke={INK} strokeWidth="7" strokeLinecap="round" /><path d="M10 10l20 0M230 10l20 0" stroke={INK} strokeWidth="4" /></svg>
  </div>;
}

// Units are drawn to the width of the object above them, so a row really does measure it.
function Units({ p }: { p: Extract<ScenePart, { type: "units" }> }) {
  const w = p.width / p.n, h = p.unit === "domino" ? 34 : p.unit === "clip" ? 20 : 36;
  return <div className="flex items-center" style={{ width: p.width }}>{Array.from({ length: p.n }, (_, i) => <span key={i} className="grid place-items-center" style={{ width: w, marginLeft: p.gapAt === i ? w : undefined }}>
    {p.unit === "block" && <span className="block rounded-[4px] border border-[#b45309]" style={{ width: w, height: h, background: "linear-gradient(135deg,#ffcf6b,#f59e0b)", boxShadow: "inset 2px 2px 0 rgba(255,255,255,.55)" }} />}
    {p.unit === "domino" && <span className="flex items-center justify-around rounded-md border-2 bg-white" style={{ width: w - 3, height: h, borderColor: INK }}><i className="block h-2 w-2 rounded-full" style={{ background: INK }} /><i className="block h-[70%] w-0.5" style={{ background: INK }} /><i className="block h-2 w-2 rounded-full" style={{ background: INK }} /></span>}
    {p.unit === "clip" && <svg viewBox="0 0 50 20" style={{ width: w - 2, height: h }} aria-hidden><path d="M38 15H9a5.5 5.5 0 0 1 0-11h32a4.5 4.5 0 0 1 0 9H13a2.2 2.2 0 0 1 0-4.5h25" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" /></svg>}
  </span>)}</div>;
}

function PictureView({ name }: { name: Extract<ScenePart, { type: "picture" }>["name"] }) {
  const line = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round" as const };
  return <svg viewBox="0 0 160 130" className="h-36 w-44" aria-hidden>
    {name === "robot" && <><rect x="55" y="8" width="50" height="50" rx="3" fill="#a7e3d8" {...line} /><circle cx="70" cy="30" r="7" fill="#fff" {...line} /><circle cx="90" cy="30" r="7" fill="#fff" {...line} /><rect x="42" y="62" width="76" height="60" rx="3" fill={ORANGE} {...line} /></>}
    {name === "house" && <><rect x="35" y="62" width="90" height="62" fill="#fff6d6" {...line} /><path d="M24 62 80 12l56 50z" fill="#ef4444" {...line} /><rect x="44" y="74" width="20" height="20" fill="#a7e3d8" {...line} /><rect x="96" y="74" width="20" height="20" fill="#a7e3d8" {...line} /><rect x="71" y="88" width="18" height="36" fill={ORANGE} {...line} /></>}
    {name === "castle" && <><rect x="52" y="58" width="56" height="66" fill="#cbd5e1" {...line} /><rect x="20" y="42" width="32" height="82" fill="#e2e8f0" {...line} /><rect x="108" y="42" width="32" height="82" fill="#e2e8f0" {...line} /><path d="M14 42 36 8l22 34z" fill="#3b82f6" {...line} /><path d="M102 42 124 8l22 34z" fill="#3b82f6" {...line} /><rect x="70" y="92" width="20" height="32" fill={ORANGE} {...line} /></>}
    {name === "pizza" && <><circle cx="80" cy="65" r="56" fill="#fbbf24" stroke="#b45309" strokeWidth="6" />{[[60, 45], [102, 50], [78, 72], [52, 84], [104, 88], [84, 100]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="8" fill="#dc2626" />)}</>}
    {name === "clock" && <><circle cx="80" cy="65" r="56" fill="#fff" {...line} />{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h) => { const a = (h * Math.PI) / 6; return <line key={h} x1={80 + 46 * Math.sin(a)} y1={65 - 46 * Math.cos(a)} x2={80 + 52 * Math.sin(a)} y2={65 - 52 * Math.cos(a)} stroke={INK} strokeWidth="3" />; })}<path d="M80 65V30M80 65l24 14" stroke={INK} strokeWidth="4" strokeLinecap="round" /></>}
  </svg>;
}

function Compass({ p, step }: { p: Extract<ScenePart, { type: "compass" }>; step: Step }) {
  const dirs = ["north", "east", "south", "west"], start = dirs.indexOf(p.from), turns = after(p.turnStep, step) ? p.turns : 0, a = (start + turns) * 90;
  return <svg viewBox="0 0 160 160" className="h-40 w-40" aria-hidden>
    <circle cx="80" cy="80" r="56" fill="#fff" stroke={INK} strokeWidth="3" />
    {["N", "E", "S", "W"].map((d, i) => { const r = (i * Math.PI) / 2; return <text key={d} x={80 + 70 * Math.sin(r)} y={86 - 70 * Math.cos(r)} textAnchor="middle" fontSize="17" fontWeight="800" fill={INK}>{d}</text>; })}
    <g style={{ transform: `rotate(${a}deg)`, transformOrigin: "80px 80px", transition: "transform .5s" }}><path d="M80 34l13 44H67z" fill={ORANGE} /><circle cx="80" cy="80" r="8" fill={INK} /></g>
    {turns > 0 && <path d="M96 40A44 44 0 0 1 122 66" fill="none" stroke={TEAL} strokeWidth="4" strokeLinecap="round" />}
  </svg>;
}

function Part({ p, step }: { p: ScenePart; step: Step }) {
  let body: React.ReactNode = null;
  switch (p.type) {
    case "counters": body = <Counters p={p} step={step} />; break;
    case "groups": body = <Groups p={p} step={step} />; break;
    case "array": body = <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${p.cols}, auto)` }}>{Array.from({ length: p.rows * p.cols }, (_, i) => <Counter key={i} size={30} />)}</div>; break;
    case "blocks": body = <Blocks p={p} />; break;
    case "money": body = <div className="flex flex-wrap items-center justify-center gap-2">{p.items.map((m, i) => <Image key={i} src={`/coins/${m}.png`} alt={moneyName(m)} width={m.startsWith("note") ? 110 : 56} height={56} className={`h-14 w-auto object-contain ${m.startsWith("note") ? "" : "rounded-full"}`} />)}</div>; break;
    case "image": {
      const src = `/images/measurelands/${p.src}`;
      if (p.crop) { // Trimmed to the object itself, so its ends sit exactly over the units below.
        const full = p.crop.width / (p.crop.x[1] - p.crop.x[0]), tall = full / 3;
        body = <div className="relative overflow-hidden" style={{ width: p.crop.width, height: tall * (p.crop.y[1] - p.crop.y[0]) }}><Image src={src} alt={p.alt} width={Math.round(full)} height={Math.round(tall)} className="absolute max-w-none" style={{ width: full, height: tall, left: -full * p.crop.x[0], top: -tall * p.crop.y[0] }} /></div>;
      } else body = <Image src={src} alt={p.alt} width={p.size ?? 96} height={p.size ?? 96} className="rounded-xl object-contain" style={{ width: p.size ?? 96, height: p.size ?? 96 }} />;
      break; }
    case "units": body = <Units p={p} />; break;
    case "picture": body = <PictureView name={p.name} />; break;
    case "text": { const t = p.then && after(p.then.step, step) ? p.then.text : p.text;
      body = <span className={`${p.big ? "text-4xl" : "text-xl"} font-black leading-tight`} style={{ color: p.tone ? ORANGE_INK : INK }}>{t}</span>; break; }
    case "sign": body = <span className="text-3xl font-black" style={{ color: TEAL }}>{p.text}</span>; break;
    case "seq": body = <Seq items={p.items} />; break;
    case "tally": body = <Tally n={p.n} />; break;
    case "barModel": body = <BarModel p={p} step={step} />; break;
    case "fraction": body = <Fraction p={p} step={step} />; break;
    case "line": body = <NumberLineView p={p} step={step} />; break;
    case "pictograph": body = <Pictograph p={p} />; break;
    case "balance": body = <Balance p={p} />; break;
    case "chips": { const marked = after(p.markStep, step) ? p.marked ?? [] : [];
      body = <div className="flex flex-wrap justify-center gap-1.5">{p.items.map((c, i) => <span key={i} className="flex items-center gap-1.5">{p.arrows && i > 0 && <span className="font-black" style={{ color: TEAL }}>→</span>}<span className="rounded-xl border-2 px-3 py-1.5 text-base font-black transition-colors duration-300" style={{ borderColor: marked.includes(i) ? TEAL : "#c8e6df", background: marked.includes(i) ? TEAL : "#fff", color: marked.includes(i) ? "#fff" : INK }}>{c}</span></span>)}</div>; break; }
    case "compass": body = <Compass p={p} step={step} />; break;
    case "visual": body = <div className="w-full max-w-[360px]"><GuideVisualView visual={p.visual as GuideVisual} /></div>; break;
  }
  if (p.type === "sign") return <div className="self-center transition-opacity duration-300" style={{ opacity: shown(p, step) ? 1 : 0 }}>{body}</div>;
  return <div data-scene-part className={`flex max-w-full min-w-0 flex-col items-center gap-1.5 rounded-2xl p-2 ${["line", "visual", "barModel", "pictograph"].includes(p.type) ? "w-full" : ""} transition-all duration-300 ${lit(p, step) ? "bg-[#fff6d6] shadow-[0_0_0_3px_#ffd95a]" : ""}`} style={{ opacity: shown(p, step) ? 1 : 0 }}>
    {body}
    {p.label && <span className="text-sm font-bold" style={{ color: INK }}>{p.label}</span>}
  </div>;
}

export default function GuideScene({ rows, step }: { rows: ScenePart[][]; step: Step }) {
  return <div className="grid min-w-0 gap-2 rounded-2xl p-2 sm:p-3" style={{ background: MINT }}>
    {rows.map((row, r) => <div key={r} className="flex flex-wrap items-center justify-center gap-2">{row.map((p, i) => <Part key={i} p={p} step={step} />)}</div>)}
  </div>;
}
