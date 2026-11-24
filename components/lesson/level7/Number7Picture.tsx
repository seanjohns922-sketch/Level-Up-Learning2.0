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

export default function Number7Picture({ picture }: { picture: Picture }) {
  return <figure className="m-0 rounded-2xl border border-[#d6e6e2] bg-gradient-to-b from-[#eef8f5] to-[#e2f2ee] p-3 text-slate-900 sm:p-4">
    <div className="mb-2 flex items-center justify-between gap-3"><figcaption className="font-bold">{picture.title}</figcaption><ReadAloudBtn text={number7PictureSpeech(picture)} label="Read diagram" /></div>
    {picture.kind === "plots" && <Plots p={picture} />}
    {picture.kind === "grow" && <Grow p={picture} />}
    {picture.kind === "squarestrip" && <SquareStrip p={picture} />}
  </figure>;
}
