"use client";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { number7PictureSpeech, type Number7Material, type Number7Picture as Picture } from "@/data/activities/year7Number/pictures";

// Level 7 Number pictures (approved mockup, 24 Nov 2026): teal for what is given, one orange accent for the unknown.
const INK = "#10201f", TEAL = "#0f766e", TEAL_FILL = "#2dd4bf", UNKNOWN = "#ffb12e", UNKNOWN_INK = "#3a2200";
const FONT = { fontFamily: "Barlow, system-ui, sans-serif", fontWeight: 700 } as const;

/** A label chip; "?" anywhere in the text makes it the orange unknown. */
function Chip({ x, y, text, size = 16 }: { x: number; y: number; text: string; size?: number }) {
  const unknown = text.includes("?"), w = text.length * size * 0.56 + 16;
  return <g><rect x={x - w / 2} y={y - size * 0.95} width={w} height={size * 1.55} rx={7} fill={unknown ? UNKNOWN : "#fff"} opacity={unknown ? 1 : 0.94} stroke={unknown ? "#b86e00" : "none"} />
    <text x={x} y={y + size * 0.18} textAnchor="middle" fontSize={size} fill={unknown ? UNKNOWN_INK : INK} {...FONT} fontWeight={unknown ? 800 : 700}>{text}</text></g>;
}

function Materials() {
  return <defs>
    <pattern id="n7-timber" width="36" height="12" patternUnits="userSpaceOnUse"><rect width="36" height="12" fill="#d9a86c" /><rect width="36" height="1.2" y="11" fill="#b9864c" /><rect width="1.2" height="12" x="22" fill="#c4935a" /><path d="M2 4h14M24 7h10" stroke="#e7bd86" strokeWidth="1" /></pattern>
    <pattern id="n7-grass" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#6cc46a" /><path d="M3 11l1-5M7 12l1-6M11 10l1-4" stroke="#3f9c45" strokeWidth="1.2" /></pattern>
    <pattern id="n7-tiles" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#e6d3bb" /><circle cx="8" cy="10" r="1.6" fill="#c9b293" /><circle cx="27" cy="6" r="1.2" fill="#cdb79a" /><circle cx="33" cy="29" r="1.8" fill="#c4ac8c" /><circle cx="14" cy="31" r="1.3" fill="#d1bca0" /></pattern>
    <pattern id="n7-strip" width="36" height="12" patternUnits="userSpaceOnUse"><rect width="36" height="12" fill="#f5c27a" /><rect width="36" height="1.2" y="11" fill="#d39a48" /><rect width="1.2" height="12" x="14" fill="#dca85c" /></pattern>
  </defs>;
}
const FILL: Record<Number7Material, string> = { timber: "url(#n7-timber)", grass: "url(#n7-grass)", tiles: "url(#n7-tiles)", plain: "#ccfbf1" };

function Plots({ p }: { p: Extract<Picture, { kind: "plots" }> }) {
  const units = p.plots.reduce((sum, q) => sum + q.w, 0) + (p.joined ? 0 : (p.plots.length - 1) * Math.max(...p.plots.map((q) => q.w)) * 0.25);
  const tallest = Math.max(...p.plots.map((q) => q.h)), scale = Math.min(360 / units, 200 / tallest);
  const top = p.ask || p.note ? 52 : 16, base = top + tallest * scale;
  const space = p.joined ? 0 : Math.max(...p.plots.map((r) => r.w)) * scale * 0.25;
  const placed = p.plots.map((q, i) => ({ ...q, i, at: 30 + p.plots.slice(0, i).reduce((sum, r) => sum + r.w * scale + space, 0) }));
  const width = Math.max(420, 60 + p.plots.reduce((sum, r) => sum + r.w * scale, 0) + space * (p.plots.length - 1));
  return <svg viewBox={`0 0 ${width} ${base + 48}`} className="mx-auto block h-auto max-h-[300px] w-full" role="img" aria-label={number7PictureSpeech(p)}>
    <Materials />
    {p.note && <Chip x={width / 2} y={26} text={p.note} />}
    {p.ask && !p.note && <Chip x={width / 2} y={26} text={`? ${p.ask}`} />}
    {placed.map((q) => {
      const w = q.w * scale, h = q.h * scale, y = base - h;
      return <g key={q.i}>
        <rect x={q.at} y={y} width={w} height={h} fill={q.strip ? "url(#n7-strip)" : FILL[q.material]} stroke="#5b3a17" strokeWidth={q.material === "plain" ? 0 : 4} />
        {q.material === "plain" && <rect x={q.at} y={y} width={w} height={h} fill="none" stroke={TEAL} strokeWidth={3} />}
        {q.centre && <Chip x={q.at + w / 2} y={y + h / 2 + 5} text={q.centre} size={Math.min(18, Math.max(13, w / 6))} />}
        {q.bottom && <g><line x1={q.at} y1={base + 14} x2={q.at + w} y2={base + 14} stroke={TEAL} strokeWidth={2} /><path d={`M${q.at} ${base + 7}v14M${q.at + w} ${base + 7}v14`} stroke={TEAL} strokeWidth={2} /><Chip x={q.at + w / 2} y={base + 19} text={q.bottom} size={15} /></g>}
        {q.left && <g><line x1={q.at - 14} y1={y} x2={q.at - 14} y2={base} stroke={TEAL} strokeWidth={2} /><Chip x={q.at - 14} y={y + h / 2 + 5} text={q.left} size={15} /></g>}
      </g>;
    })}
  </svg>;
}

function Grow({ p }: { p: Extract<Picture, { kind: "grow" }> }) {
  const n = p.to, cell = Math.min(22, 280 / n), x0 = 40, y0 = 14, size = cell * 0.38;
  const items = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const old = r >= n - p.from && c < p.from, cx = x0 + c * cell + cell / 2, cy = y0 + r * cell + cell / 2;
    items.push(p.item === "crystal"
      ? <polygon key={`${r}-${c}`} points={`${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`} fill={old ? TEAL_FILL : "#ffd28a"} stroke={old ? TEAL : "#d48a10"} strokeWidth={1.2} />
      : <rect key={`${r}-${c}`} x={cx - size} y={cy - size} width={size * 2} height={size * 2} rx={2} fill={old ? TEAL_FILL : "#ffd28a"} stroke={old ? TEAL : "#d48a10"} strokeWidth={1.2} />);
  }
  const bottom = y0 + n * cell + 16;
  return <svg viewBox={`0 0 ${x0 + n * cell + 20} ${bottom + 44}`} className="mx-auto block h-auto max-h-[340px] w-full max-w-md" role="img" aria-label={number7PictureSpeech(p)}>
    {items}
    <line x1={x0} y1={bottom} x2={x0 + p.from * cell} y2={bottom} stroke={TEAL} strokeWidth={2} /><Chip x={x0 + (p.from * cell) / 2} y={bottom + 5} text={String(p.from)} size={14} />
    <line x1={x0} y1={bottom + 26} x2={x0 + n * cell} y2={bottom + 26} stroke={TEAL} strokeWidth={2} /><Chip x={x0 + (n * cell) / 2} y={bottom + 31} text={String(p.to)} size={14} />
    <line x1={x0 - 16} y1={y0 + (n - p.from) * cell} x2={x0 - 16} y2={y0 + n * cell} stroke={TEAL} strokeWidth={2} /><Chip x={x0 - 16} y={y0 + (n - p.from / 2) * cell + 5} text={String(p.from)} size={14} />
  </svg>;
}

function SquareStrip({ p }: { p: Extract<Picture, { kind: "squarestrip" }> }) {
  const values = Array.from({ length: p.to - p.from + 1 }, (_, i) => p.from + i), col = 400 / values.length;
  return <svg viewBox="0 0 440 150" className="mx-auto block h-auto max-h-[300px] w-full" role="img" aria-label={number7PictureSpeech(p)}>
    <text x={14} y={52} fontSize={15} fill={TEAL} {...FONT}>n</text><text x={14} y={104} fontSize={15} fill={TEAL} {...FONT}>n²</text>
    {values.map((v, i) => <g key={v}>
      <rect x={34 + i * col + 4} y={28} width={col - 8} height={36} rx={8} fill="#ccfbf1" stroke="#14b8a6" />
      <text x={34 + i * col + col / 2} y={52} textAnchor="middle" fontSize={18} fill={INK} {...FONT}>{v}</text>
      <rect x={34 + i * col + 4} y={80} width={col - 8} height={36} rx={8} fill="#fff" stroke="#14b8a6" />
      <text x={34 + i * col + col / 2} y={104} textAnchor="middle" fontSize={18} fill={INK} {...FONT}>{v * v}</text>
    </g>)}
    <Chip x={220} y={140} text={`Where does ${p.target} fit?`} size={14} />
  </svg>;
}

function Tree({ p }: { p: Extract<Picture, { kind: "tree" }> }) {
  const node = (x: number, y: number, text: string, prime: boolean) => <g><circle cx={x} cy={y} r={26} fill={prime ? "#ccfbf1" : "#fff"} stroke={prime ? TEAL : "#8aa9a4"} strokeWidth={2.5} /><text x={x} y={y + 6} textAnchor="middle" fontSize={18} fill={INK} {...FONT}>{text}</text></g>;
  return <svg viewBox="0 0 360 230" className="mx-auto block h-auto max-h-[260px] w-full max-w-sm" role="img" aria-label={number7PictureSpeech(p)}>
    <path d="M180 58L110 120M180 58L250 120M250 146L210 190M250 146L290 190" stroke={TEAL} strokeWidth={2.5} fill="none" />
    {node(180, 34, String(p.root), false)}{node(110, 134, String(p.left), true)}{node(250, 134, String(p.right), false)}
    <Chip x={210} y={204} text="?" size={16} /><Chip x={290} y={204} text="?" size={16} />
    <text x={110} y={182} textAnchor="middle" fontSize={13} fill={TEAL} {...FONT}>prime</text>
  </svg>;
}

function Primes({ p }: { p: Extract<Picture, { kind: "primes" }> }) {
  const step = Math.min(56, 340 / p.primes.length);
  return <svg viewBox="0 0 380 110" className="mx-auto block h-auto max-h-[160px] w-full" role="img" aria-label={number7PictureSpeech(p)}>
    {p.primes.map((v, i) => <g key={i}><circle cx={20 + step / 2 + i * step} cy={50} r={step * 0.4} fill="#ccfbf1" stroke={TEAL} strokeWidth={2.5} /><text x={20 + step / 2 + i * step} y={57} textAnchor="middle" fontSize={20} fill={INK} {...FONT}>{v}</text></g>)}
    <text x={190} y={100} textAnchor="middle" fontSize={14} fill={TEAL} {...FONT}>Each circle is a prime factor</text>
  </svg>;
}

function Power({ p }: { p: Extract<Picture, { kind: "power" }> }) {
  return <svg viewBox="0 0 380 170" className="mx-auto block h-auto max-h-[200px] w-full max-w-md" role="img" aria-label={number7PictureSpeech(p)}>
    <text x={150} y={110} textAnchor="middle" fontSize={72} fill={INK} {...FONT}>{p.base}</text>
    <text x={150 + String(p.base).length * 22 + 16} y={70} textAnchor="middle" fontSize={40} fill={TEAL} {...FONT}>{p.exponent}</text>
    <path d={`M150 122v18M${150 + String(p.base).length * 22 + 16} 34V18`} stroke={TEAL} strokeWidth={2} />
    <Chip x={150} y={156} text={`base: the repeated factor`} size={14} />
    <Chip x={262} y={20} text={`exponent: how many factors`} size={13} />
  </svg>;
}

function Doubling({ p }: { p: Extract<Picture, { kind: "doubling" }> }) {
  if (p.item === "branch3") {
    const tips = [70, 105, 140, 165, 190, 215, 240, 275, 310];
    return <svg viewBox="0 0 380 190" className="mx-auto block h-auto max-h-[230px] w-full max-w-md" role="img" aria-label={number7PictureSpeech(p)}>
      <line x1={190} y1={160} x2={190} y2={112} stroke="#7a5230" strokeWidth={7} strokeLinecap="round" />
      {[105, 190, 275].map((x) => <line key={x} x1={190} y1={112} x2={x} y2={70} stroke="#7a5230" strokeWidth={5} strokeLinecap="round" />)}
      {tips.map((x, i) => <g key={x}><line x1={[105, 190, 275][Math.floor(i / 3)]} y1={70} x2={x} y2={30} stroke="#7a5230" strokeWidth={3.5} strokeLinecap="round" /><circle cx={x} cy={28} r={6} fill="#4ade80" stroke="#15803d" /></g>)}
      <text x={318} y={76} fontSize={14} fill={TEAL} {...FONT}>2 splits</text>
      <Chip x={190} y={180} text={`? ${p.target}`} size={14} />
    </svg>;
  }
  if (p.item === "branch") {
    const lines: [number, number, number, number][] = [[190, 150, 190, 105], [190, 105, 130, 65], [190, 105, 250, 65], [130, 65, 100, 30], [130, 65, 160, 30], [250, 65, 220, 30], [250, 65, 280, 30]];
    return <svg viewBox="0 0 380 190" className="mx-auto block h-auto max-h-[230px] w-full max-w-md" role="img" aria-label={number7PictureSpeech(p)}>
      {lines.map(([a, b, c, d], i) => <line key={i} x1={a} y1={b} x2={c} y2={d} stroke="#7a5230" strokeWidth={i === 0 ? 7 : i < 3 ? 5 : 3.5} strokeLinecap="round" />)}
      {[100, 160, 220, 280].map((x) => <circle key={x} cx={x} cy={28} r={6} fill="#4ade80" stroke="#15803d" />)}
      <text x={300} y={70} fontSize={14} fill={TEAL} {...FONT}>2 splits drawn</text>
      <Chip x={190} y={178} text={`? ${p.target}`} size={14} />
    </svg>;
  }
  const stages = Array.from({ length: p.shown }, (_, i) => 2 ** i);
  return <svg viewBox="0 0 400 170" className="mx-auto block h-auto max-h-[210px] w-full" role="img" aria-label={number7PictureSpeech(p)}>
    {stages.map((count, s) => <g key={s}>
      <circle cx={60 + s * 110} cy={70} r={40} fill="#f0fdf4" stroke="#86efac" strokeWidth={2} />
      {Array.from({ length: count }, (_, k) => <ellipse key={k} cx={60 + s * 110 + (count === 1 ? 0 : Math.cos((k / count) * 6.28) * 18)} cy={70 + (count === 1 ? 0 : Math.sin((k / count) * 6.28) * 18)} rx={9} ry={6} fill="#4ade80" stroke="#15803d" />)}
      <text x={60 + s * 110} y={132} textAnchor="middle" fontSize={14} fill={TEAL} {...FONT}>{s === 0 ? "start" : `${s} h`}</text>
      {s < p.shown - 1 && <text x={115 + s * 110} y={76} textAnchor="middle" fontSize={16} fill={TEAL} {...FONT}>×2</text>}
    </g>)}
    <text x={372} y={76} textAnchor="middle" fontSize={22} fill={TEAL} {...FONT}>…</text>
    <Chip x={200} y={160} text={`? ${p.target}`} size={14} />
  </svg>;
}

function Timeline({ p }: { p: Extract<Picture, { kind: "timeline" }> }) {
  const [a, b] = p.every, show = Math.max(a, b) * 1.6, X = (t: number) => 74 + (t / show) * 280;
  const marks = (every: number) => Array.from({ length: Math.floor(show / every) + 1 }, (_, i) => i * every);
  const row = (every: number, y: number, colour: string, label: string) => <g>
    <line x1={74} y1={y} x2={360} y2={y} stroke="#9fb3af" strokeWidth={2} />
    {marks(every).map((t) => <g key={t}><circle cx={X(t)} cy={y} r={9} fill={colour} stroke="#fff" strokeWidth={2} /><text x={X(t)} y={y + 26} textAnchor="middle" fontSize={13} fill={INK} {...FONT}>{t}</text></g>)}
    <text x={52} y={y + 5} textAnchor="end" fontSize={13} fill={INK} {...FONT}>{label}</text>
    <text x={372} y={y + 5} fontSize={18} fill={TEAL} {...FONT}>…</text>
  </g>;
  return <svg viewBox="0 0 400 170" className="mx-auto block h-auto max-h-[210px] w-full" role="img" aria-label={number7PictureSpeech(p)}>
    {row(a, 40, "#fbbf24", `${a} s`)}{row(b, 104, "#38bdf8", `${b} s`)}
    <Chip x={210} y={158} text="? next time both flash" size={14} />
  </svg>;
}

function Counters({ p }: { p: Extract<Picture, { kind: "counters" }> }) {
  const COL = { blue: ["#60a5fa", "#1d4ed8"], gold: ["#fcd34d", "#b45309"], red: ["#f87171", "#b91c1c"] } as const;
  const perRow = 15, r = 8;
  const height = (g: { count: number }) => Math.ceil(g.count / perRow) * 22 + 34;
  const rows = p.groups.map((g, i) => ({ g, top: 24 + p.groups.slice(0, i).reduce((sum, h) => sum + height(h), 0) }));
  const y = 24 + p.groups.reduce((sum, h) => sum + height(h), 0);
  return <svg viewBox={`0 0 400 ${y}`} className="mx-auto block h-auto max-h-[260px] w-full" role="img" aria-label={number7PictureSpeech(p)}>
    {rows.map(({ g, top }) => <g key={g.label}>
      <text x={14} y={top} fontSize={14} fill={INK} {...FONT}>{`${g.count} ${g.label}`}</text>
      {Array.from({ length: g.count }, (_, i) => <circle key={i} cx={24 + (i % perRow) * 24} cy={top + 16 + Math.floor(i / perRow) * 22} r={r} fill={COL[g.colour][0]} stroke={COL[g.colour][1]} strokeWidth={1.5} />)}
    </g>)}
  </svg>;
}

function PowerStrip({ p }: { p: Extract<Picture, { kind: "powerstrip" }> }) {
  const ks = Array.from({ length: p.to - p.from + 1 }, (_, i) => p.from + i), col = Math.min(80, 360 / ks.length);
  const width = 20 + ks.length * col;
  return <svg viewBox={`0 0 ${Math.max(380, width)} 130`} className="mx-auto block h-auto max-h-[170px] w-full" role="img" aria-label={number7PictureSpeech(p)}>
    {ks.map((k, i) => <g key={k}>
      <rect x={14 + i * col} y={20} width={col - 14} height={46} rx={10} fill="#ccfbf1" stroke="#14b8a6" />
      <text x={14 + i * col + (col - 14) / 2} y={50} textAnchor="middle" fontSize={18} fill={INK} {...FONT}>10<tspan dy={-8} fontSize={12}>{k}</tspan></text>
      {k <= p.showUpTo && <text x={14 + i * col + (col - 14) / 2} y={90} textAnchor="middle" fontSize={15} fill={TEAL} {...FONT}>{(10 ** k).toLocaleString("en-AU")}</text>}
      {i < ks.length - 1 && <text x={14 + i * col + col - 7} y={16} textAnchor="middle" fontSize={12} fill={TEAL} {...FONT}>×10</text>}
    </g>)}
    <text x={Math.max(380, width) / 2} y={122} textAnchor="middle" fontSize={13} fill={INK} {...FONT}>Each step multiplies by 10</text>
  </svg>;
}

/** Column values written out (fits narrow columns better than words such as "hundred-thousands"). */
const PLACE_NAMES = ["1", "10", "100", "1000", "10 000", "100 000", "1 000 000", "10 000 000"];
function PlaceValue({ p }: { p: Extract<Picture, { kind: "placevalue" }> }) {
  const col = Math.min(70, 330 / p.places), left = 96, width = left + p.places * col + 10;
  return <svg viewBox={`0 0 ${width} ${58 + p.rows.length * 44}`} className="mx-auto block h-auto max-h-[240px] w-full" role="img" aria-label={number7PictureSpeech(p)}>
    {Array.from({ length: p.places }, (_, i) => { const power = p.places - 1 - i; return <g key={i}>
      <rect x={left + i * col} y={6} width={col - 4} height={40} rx={6} fill={TEAL} />
      <text x={left + i * col + (col - 4) / 2} y={24} textAnchor="middle" fontSize={11} fill="#fff" {...FONT}>{PLACE_NAMES[power] ?? ""}</text>
      <text x={left + i * col + (col - 4) / 2} y={40} textAnchor="middle" fontSize={13} fill="#ccfbf1" {...FONT}>10<tspan dy={-5} fontSize={9}>{power}</tspan></text>
    </g>; })}
    {p.rows.map((r, j) => <g key={j}>
      <text x={left - 8} y={78 + j * 44} textAnchor="end" fontSize={13} fill={INK} {...FONT}>{r.label}</text>
      {r.digits.map((d, i) => <g key={i}><rect x={left + i * col} y={54 + j * 44} width={col - 4} height={38} rx={6} fill="#fff" stroke="#9fd9cf" />{d !== null && <text x={left + i * col + (col - 4) / 2} y={80 + j * 44} textAnchor="middle" fontSize={20} fill={INK} {...FONT}>{d}</text>}</g>)}
    </g>)}
  </svg>;
}

function FractionBar({ p }: { p: Extract<Picture, { kind: "fractionbar" }> }) {
  if (p.grid) return <svg viewBox="0 0 240 240" className="mx-auto block h-auto max-h-[240px] w-full max-w-[240px]" role="img" aria-label={number7PictureSpeech(p)}>
    {Array.from({ length: 100 }, (_, i) => <rect key={i} x={10 + (i % 10) * 22} y={10 + Math.floor(i / 10) * 22} width={20} height={20} rx={2} fill={i < p.shaded ? TEAL_FILL : "#fff"} stroke={i < p.shaded ? TEAL : "#cfe3df"} />)}
  </svg>;
  const w = 360 / p.parts;
  return <svg viewBox={`0 0 400 ${p.scale ? 120 : p.caption ? 118 : 90}`} className="mx-auto block h-auto max-h-[170px] w-full" role="img" aria-label={number7PictureSpeech(p)}>
    {Array.from({ length: p.parts }, (_, i) => <rect key={i} x={20 + i * w} y={20} width={w} height={46} fill={i < p.shaded ? TEAL_FILL : "#fff"} stroke={TEAL} strokeWidth={1.5} />)}
    {p.scale === "percent" && <g><text x={20} y={90} textAnchor="middle" fontSize={14} fill={INK} {...FONT}>0%</text><text x={380} y={90} textAnchor="middle" fontSize={14} fill={INK} {...FONT}>100%</text></g>}
    {p.caption && <text x={200} y={p.scale ? 112 : 94} textAnchor="middle" fontSize={13} fill={INK} {...FONT}>{p.caption}</text>}
  </svg>;
}

function Tank({ p }: { p: Extract<Picture, { kind: "tank" }> }) {
  const top = 30, h = 170, part = h / p.parts, water = h - p.used * part;
  return <svg viewBox="0 0 380 230" className="mx-auto block h-auto max-h-[250px] w-full max-w-md" role="img" aria-label={number7PictureSpeech(p)}>
    <defs><linearGradient id="n7-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7dd3fc" /><stop offset="1" stopColor="#0284c7" /></linearGradient></defs>
    <rect x={110} y={top + h - water} width={140} height={water} fill="url(#n7-water)" />
    {Array.from({ length: p.parts - 1 }, (_, i) => <line key={i} x1={110} x2={250} y1={top + (i + 1) * part} y2={top + (i + 1) * part} stroke="#475569" strokeDasharray="4 4" opacity={0.5} />)}
    <rect x={110} y={top} width={140} height={h} rx={10} fill="none" stroke="#334155" strokeWidth={5} />
    <rect x={160} y={top - 14} width={40} height={14} rx={3} fill="#64748b" />
    <line x1={270} x2={270} y1={top} y2={top + p.used * part} stroke="#b86e00" strokeWidth={2} />
    <text x={278} y={top + (p.used * part) / 2 + 5} fontSize={14} fill="#7a3e00" {...FONT}>{`${p.used}/${p.parts} used`}</text>
    <Chip x={180} y={top + h + 22} text={`Full: ${p.capacity}`} size={14} />
    <Chip x={180} y={top + h - water / 2 + 5} text="? L left" size={14} />
  </svg>;
}

function Lengths({ p }: { p: Extract<Picture, { kind: "lengths" }> }) {
  const total = p.pieces.reduce((s, q) => s + q.length, 0), scale = 340 / total;
  const colours = ["#f472b6", "#a78bfa", "#38bdf8"];
  const placed = p.pieces.map((q, i) => ({ ...q, i, at: 20 + p.pieces.slice(0, i).reduce((s, r) => s + r.length * scale, 0) }));
  return <svg viewBox="0 0 380 130" className="mx-auto block h-auto max-h-[170px] w-full" role="img" aria-label={number7PictureSpeech(p)}>
    <defs><pattern id="n7-rope" width="12" height="16" patternUnits="userSpaceOnUse"><rect width="12" height="16" fill="#c8a165" /><path d="M0 16L12 0" stroke="#a67c3d" strokeWidth="3" /></pattern></defs>
    {placed.map((q) => <g key={q.i}>
      <rect x={q.at} y={44} width={q.length * scale - (p.object === "ribbon" ? 3 : 0)} height={p.object === "rope" ? 16 : 20} rx={p.object === "rope" ? 8 : 2} fill={p.object === "rope" ? "url(#n7-rope)" : colours[q.i % 3]} opacity={q.cut ? 0.55 : 1} />
      {q.cut && <path d={`M${q.at + q.length * scale} 36v40`} stroke="#334155" strokeWidth={2} strokeDasharray="4 3" />}
      <Chip x={q.at + (q.length * scale) / 2} y={q.label.includes("?") ? 98 : 26} text={q.label} size={14} />
    </g>)}
    {p.object === "ribbon" && <Chip x={190} y={110} text={`? ${p.ask}`} size={14} />}
  </svg>;
}

function PercentBar({ p }: { p: Extract<Picture, { kind: "percentbar" }> }) {
  const share = p.part / p.of;
  return <svg viewBox="0 0 400 130" className="mx-auto block h-auto max-h-[170px] w-full" role="img" aria-label={number7PictureSpeech(p)}>
    <rect x={20} y={40} width={360} height={44} rx={8} fill="#fff" stroke={TEAL} strokeWidth={2} />
    <rect x={20} y={40} width={360 * share} height={44} rx={8} fill={TEAL_FILL} />
    <Chip x={200} y={26} text={`Whole: ${p.whole} = 100%`} size={14} />
    <Chip x={20 + (360 * share) / 2} y={68} text={p.partLabel} size={14} />
    <Chip x={200} y={112} text={`? ${p.ask}`} size={13} />
  </svg>;
}

export default function Number7Picture({ picture }: { picture: Picture }) {
  return <figure className="m-0 rounded-2xl border border-[#d6e6e2] bg-gradient-to-b from-[#eef8f5] to-[#e2f2ee] p-3 text-slate-900 sm:p-4">
    <div className="mb-2 flex items-center justify-between gap-3"><figcaption className="font-bold">{picture.title}</figcaption><ReadAloudBtn text={number7PictureSpeech(picture)} label="Read diagram" /></div>
    {picture.kind === "plots" && <Plots p={picture} />}
    {picture.kind === "grow" && <Grow p={picture} />}
    {picture.kind === "squarestrip" && <SquareStrip p={picture} />}
    {picture.kind === "tree" && <Tree p={picture} />}
    {picture.kind === "primes" && <Primes p={picture} />}
    {picture.kind === "power" && <Power p={picture} />}
    {picture.kind === "doubling" && <Doubling p={picture} />}
    {picture.kind === "timeline" && <Timeline p={picture} />}
    {picture.kind === "counters" && <Counters p={picture} />}
    {picture.kind === "powerstrip" && <PowerStrip p={picture} />}
    {picture.kind === "placevalue" && <PlaceValue p={picture} />}
    {picture.kind === "fractionbar" && <FractionBar p={picture} />}
    {picture.kind === "tank" && <Tank p={picture} />}
    {picture.kind === "lengths" && <Lengths p={picture} />}
    {picture.kind === "percentbar" && <PercentBar p={picture} />}
  </figure>;
}
