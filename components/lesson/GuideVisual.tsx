import type { GuideVisual as Visual, ShapeName } from "@/data/lesson-guides/guide-visual";
import { guideVisualSpeech } from "@/data/lesson-guides/guide-visual";

// Static worked-example diagrams for Learn the Skill guides. Nothing here is interactive.
const INK = "#1f2a37", MUTED = "#64748b", LINE = "#cbd5e1", ACCENT = "#0f766e", WARM = "#c2410c", FILL = "#e0f2f1";
const COLOURS: Record<string, string> = { red: "#ef4444", blue: "#3b82f6", green: "#22c55e", yellow: "#facc15", purple: "#a855f7", orange: "#f97316", pink: "#ec4899", gold: "#eab308" };
const colour = (name?: string) => (name && COLOURS[name.toLowerCase()]) ?? name ?? FILL;
const minus = (n: number) => (n < 0 ? `−${-n}` : String(n));
const ticks = (min: number, max: number, step: number) => { const out: number[] = []; for (let v = min; v <= max + 1e-9; v += step) out.push(Math.round(v * 1000) / 1000); return out; };
const Svg = ({ w, h, v, children }: { w: number; h: number; v: Visual; children: React.ReactNode }) => <svg viewBox={`0 0 ${w} ${h}`} className="mx-auto block w-full" style={{ maxWidth: Math.min(w * 1.25, 420) }} role="img" aria-label={guideVisualSpeech(v)}>{children}</svg>;
const T = (p: React.SVGProps<SVGTextElement>) => <text fontSize={14} fill={INK} textAnchor="middle" {...p} />;

function Thermometer({ v }: { v: Extract<Visual, { kind: "thermometer" }> }) {
  const top = 16, bottom = 196, y = (t: number) => bottom - ((t - v.min) / (v.max - v.min)) * (bottom - top);
  return <Svg w={160} h={236} v={v}>
    <rect x={62} y={top - 8} width={22} height={bottom - top + 16} rx={11} fill="#fff" stroke={INK} strokeWidth={2} />
    <circle cx={73} cy={bottom + 18} r={16} fill={WARM} stroke={INK} strokeWidth={2} />
    <rect x={67} y={y(v.value)} width={12} height={bottom + 6 - y(v.value)} fill={WARM} />
    {ticks(v.min, v.max, v.step).map((t) => { const big = Math.abs(((t - v.min) / (v.labelEvery ?? v.step * 2)) % 1) < 1e-6; return <g key={t}><line x1={84} x2={big ? 100 : 92} y1={y(t)} y2={y(t)} stroke={INK} strokeWidth={big ? 1.6 : 1} />{big && <T x={108} y={y(t) + 5} textAnchor="start">{minus(t)}°</T>}</g>; })}
  </Svg>;
}

function Clock({ v }: { v: Extract<Visual, { kind: "clock" }> }) {
  const c = 110, r = 92, hand = (deg: number, len: number) => ({ x: c + len * Math.sin((deg * Math.PI) / 180), y: c - len * Math.cos((deg * Math.PI) / 180) });
  const m = hand(v.minute * 6, 56), h = hand(((v.hour % 12) + v.minute / 60) * 30, 40);
  return <Svg w={220} h={220} v={v}>
    <circle cx={c} cy={c} r={r} fill="#fff" stroke={INK} strokeWidth={3} />
    {Array.from({ length: 60 }, (_, i) => { const a = hand(i * 6, r - 2), b = hand(i * 6, i % 5 ? r - 8 : r - 14); return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={INK} strokeWidth={i % 5 ? 1 : 2} />; })}
    {Array.from({ length: 12 }, (_, i) => { const p = hand((i + 1) * 30, r - 24); return <T key={i} x={p.x} y={p.y + 6} fontSize={17} fontWeight={700}>{i + 1}</T>; })}
    <line x1={c} y1={c} x2={h.x} y2={h.y} stroke={INK} strokeWidth={7} strokeLinecap="round" />
    <line x1={c} y1={c} x2={m.x} y2={m.y} stroke={ACCENT} strokeWidth={4} strokeLinecap="round" />
    <circle cx={c} cy={c} r={6} fill={INK} />
  </Svg>;
}

function Ruler({ v }: { v: Extract<Visual, { kind: "ruler" }> }) {
  const L = 20, W = 340, x = (cm: number) => L + (cm / v.length) * (W - L - 20), start = v.start ?? 0;
  return <Svg w={W} h={110} v={v}>
    <rect x={x(start)} y={14} width={x(v.end) - x(start)} height={26} rx={6} fill={FILL} stroke={ACCENT} strokeWidth={2} />
    {v.label && <T x={(x(start) + x(v.end)) / 2} y={32}>{v.label}</T>}
    <rect x={L - 10} y={48} width={W - L} height={40} fill="#fef9c3" stroke={INK} />
    {ticks(0, v.length, 0.1).map((t) => { const whole = Math.abs(t - Math.round(t)) < 1e-6, half = Math.abs(t * 2 - Math.round(t * 2)) < 1e-6; return <g key={t}><line x1={x(t)} x2={x(t)} y1={48} y2={48 + (whole ? 16 : half ? 11 : 6)} stroke={INK} strokeWidth={whole ? 1.5 : 0.7} />{whole && <T x={x(t)} y={82} fontSize={12}>{Math.round(t)}</T>}</g>; })}
    <line x1={x(v.end)} x2={x(v.end)} y1={10} y2={48} stroke={WARM} strokeWidth={2} strokeDasharray="4 3" />
  </Svg>;
}

function Gauge({ v }: { v: Extract<Visual, { kind: "gauge" }> }) {
  if (v.tool === "jug") {
    const top = 20, bottom = 200, y = (n: number) => bottom - (n / v.max) * (bottom - top);
    return <Svg w={200} h={220} v={v}>
      <path d={`M40 ${top} L40 ${bottom} Q40 ${bottom + 10} 50 ${bottom + 10} L130 ${bottom + 10} Q140 ${bottom + 10} 140 ${bottom} L140 ${top}`} fill="#fff" stroke={INK} strokeWidth={2.5} />
      <rect x={42} y={y(v.value)} width={96} height={bottom + 8 - y(v.value)} fill="#93c5fd" opacity={0.75} />
      {ticks(0, v.max, v.step).map((t, i) => <g key={t}><line x1={40} x2={i % 2 ? 54 : 62} y1={y(t)} y2={y(t)} stroke={INK} />{i % 2 === 0 && t > 0 && <T x={150} y={y(t) + 5} textAnchor="start" fontSize={13}>{t} {v.unit}</T>}</g>)}
    </Svg>;
  }
  const c = { x: 140, y: 140 }, r = 110, ang = (n: number) => Math.PI + (n / v.max) * Math.PI, pt = (n: number, len: number) => ({ x: c.x + len * Math.cos(ang(n)), y: c.y + len * Math.sin(ang(n)) });
  const needle = pt(v.value, r - 44);
  return <Svg w={280} h={160} v={v}>
    <path d={`M${c.x - r} ${c.y} A${r} ${r} 0 0 1 ${c.x + r} ${c.y}`} fill="#fff" stroke={INK} strokeWidth={2.5} />
    {ticks(0, v.max, v.step).map((t, i) => { const a = pt(t, r), b = pt(t, i % 2 ? r - 8 : r - 14), l = pt(t, r - 28); return <g key={t}><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={INK} />{i % 2 === 0 && <T x={l.x} y={l.y + 5} fontSize={12}>{t}</T>}</g>; })}
    <line x1={c.x} y1={c.y} x2={needle.x} y2={needle.y} stroke={WARM} strokeWidth={4} strokeLinecap="round" />
    <circle cx={c.x} cy={c.y} r={6} fill={INK} /><T x={c.x + 52} y={c.y - 6} fontSize={14} fill={MUTED}>{v.unit}</T>
  </Svg>;
}

function Angle({ v }: { v: Extract<Visual, { kind: "angle" }> }) {
  const c = { x: 150, y: 150 }, len = 120, rad = (v.degrees * Math.PI) / 180, end = { x: c.x + len * Math.cos(-rad), y: c.y + len * Math.sin(-rad) }, arc = 34;
  const arcEnd = { x: c.x + arc * Math.cos(-rad), y: c.y + arc * Math.sin(-rad) }, mid = { x: c.x + (arc + 22) * Math.cos(-rad / 2), y: c.y + (arc + 22) * Math.sin(-rad / 2) };
  return <Svg w={300} h={170} v={v}>
    {v.protractor && <g><path d={`M${c.x - 128} ${c.y} A128 128 0 0 1 ${c.x + 128} ${c.y} Z`} fill="#eff6ff" stroke="#93c5fd" />{ticks(0, 180, 10).map((t) => { const a = (t * Math.PI) / 180, o = { x: c.x + 128 * Math.cos(-a), y: c.y + 128 * Math.sin(-a) }, i2 = { x: c.x + 118 * Math.cos(-a), y: c.y + 118 * Math.sin(-a) }, l = { x: c.x + 106 * Math.cos(-a), y: c.y + 106 * Math.sin(-a) }; return <g key={t}><line x1={o.x} y1={o.y} x2={i2.x} y2={i2.y} stroke="#3b82f6" />{t % 30 === 0 && <T x={l.x} y={l.y + 4} fontSize={10} fill="#1d4ed8">{t}</T>}</g>; })}</g>}
    <line x1={c.x} y1={c.y} x2={c.x + len} y2={c.y} stroke={INK} strokeWidth={4} strokeLinecap="round" />
    <line x1={c.x} y1={c.y} x2={end.x} y2={end.y} stroke={INK} strokeWidth={4} strokeLinecap="round" />
    {v.degrees === 90 ? <path d={`M${c.x + 22} ${c.y} V${c.y - 22} H${c.x}`} fill="none" stroke={WARM} strokeWidth={2.5} /> : <path d={`M${c.x + arc} ${c.y} A${arc} ${arc} 0 ${v.degrees > 180 ? 1 : 0} 0 ${arcEnd.x} ${arcEnd.y}`} fill="none" stroke={WARM} strokeWidth={2.5} />}
    <T x={mid.x} y={mid.y + 5} fill={WARM} fontWeight={700}>{v.label ?? `${v.degrees}°`}</T>
  </Svg>;
}

function Grid({ v }: { v: Extract<Visual, { kind: "grid" }> }) {
  const n = v.max - v.min, S = Math.min(28, 260 / n), P = 26, W = P * 2 + n * S, X = (x: number) => P + (x - v.min) * S, Y = (y: number) => P + (v.max - y) * S;
  return <Svg w={W} h={W} v={v}>
    {ticks(v.min, v.max, 1).map((t) => <g key={t}><line x1={X(t)} x2={X(t)} y1={Y(v.min)} y2={Y(v.max)} stroke={LINE} /><line x1={X(v.min)} x2={X(v.max)} y1={Y(t)} y2={Y(t)} stroke={LINE} /></g>)}
    {v.min <= 0 && <><line x1={X(0)} x2={X(0)} y1={Y(v.min)} y2={Y(v.max)} stroke={INK} strokeWidth={1.8} /><line x1={X(v.min)} x2={X(v.max)} y1={Y(0)} y2={Y(0)} stroke={INK} strokeWidth={1.8} /></>}
    {ticks(v.min, v.max, n > 10 ? 2 : 1).filter((t) => t !== 0 || v.min === 0).map((t) => <g key={`l${t}`}><T x={X(t)} y={Y(Math.max(v.min, 0)) + 16} fontSize={12} fill={MUTED}>{minus(t)}</T>{t !== 0 && <T x={X(Math.max(v.min, 0)) - 10} y={Y(t) + 4} fontSize={12} fill={MUTED}>{minus(t)}</T>}</g>)}
    {v.mirror && (v.mirror.axis === "x" ? <line x1={X(v.mirror.at)} x2={X(v.mirror.at)} y1={Y(v.min)} y2={Y(v.max)} stroke={WARM} strokeWidth={2.5} strokeDasharray="6 4" /> : <line x1={X(v.min)} x2={X(v.max)} y1={Y(v.mirror.at)} y2={Y(v.mirror.at)} stroke={WARM} strokeWidth={2.5} strokeDasharray="6 4" />)}
    {v.shapes?.map((s, i) => <polygon key={i} points={s.points.map(([x, y]) => `${X(x)},${Y(y)}`).join(" ")} fill={s.dashed ? "#fff7ed" : FILL} fillOpacity={0.85} stroke={s.dashed ? WARM : ACCENT} strokeWidth={2.5} strokeDasharray={s.dashed ? "6 4" : undefined} />)}
    {v.points?.map((p, i) => <g key={i}><circle cx={X(p.x)} cy={Y(p.y)} r={5.5} fill={INK} />{p.label && <T x={X(p.x) + 8} y={Y(p.y) - 8} textAnchor="start" fontWeight={700} stroke="#fff" strokeWidth={3} paintOrder="stroke">{p.label}</T>}</g>)}
  </Svg>;
}

function GridRef({ v }: { v: Extract<Visual, { kind: "gridRef" }> }) {
  const S = Math.min(40, 280 / v.cols), P = 26, W = P + v.cols * S + 8, H = P + v.rows * S + 8;
  const cell = (ref: string) => ({ c: ref.charCodeAt(0) - 65, r: Number(ref.slice(1)) - 1 }), mid = (ref: string) => { const { c, r } = cell(ref); return { x: P + c * S + S / 2, y: P + (v.rows - 1 - r) * S + S / 2 }; };
  return <Svg w={W} h={H} v={v}>
    {Array.from({ length: v.cols }, (_, c) => Array.from({ length: v.rows }, (_, r) => <rect key={`${c}${r}`} x={P + c * S} y={P + r * S} width={S} height={S} fill="#fff" stroke={LINE} />))}
    {Array.from({ length: v.cols }, (_, c) => <T key={`c${c}`} x={P + c * S + S / 2} y={P - 8} fontWeight={700}>{String.fromCharCode(65 + c)}</T>)}
    {Array.from({ length: v.rows }, (_, r) => <T key={`r${r}`} x={P - 12} y={P + (v.rows - 1 - r) * S + S / 2 + 5} fontWeight={700}>{r + 1}</T>)}
    {v.path && v.path.length > 1 && <polyline points={v.path.map((ref) => { const m = mid(ref); return `${m.x},${m.y}`; }).join(" ")} fill="none" stroke={WARM} strokeWidth={3} strokeDasharray="6 4" />}
    {v.marks.map((m, i) => { const p = mid(m.ref); return <g key={i}><rect x={p.x - S / 2 + 2} y={p.y - S / 2 + 2} width={S - 4} height={S - 4} fill={FILL} stroke={ACCENT} strokeWidth={2} /><T x={p.x} y={p.y + 5} fontSize={12} fontWeight={700}>{m.label ?? m.ref}</T></g>; })}
  </Svg>;
}

const SHAPE_POINTS: Record<Exclude<ShapeName, "circle" | "oval">, [number, number][]> = {
  triangle: [[0, 1], [1, 1], [0.5, 0]], square: [[0, 0], [1, 0], [1, 1], [0, 1]], rectangle: [[-0.35, 0.2], [1.35, 0.2], [1.35, 0.8], [-0.35, 0.8]],
  pentagon: [[0.5, 0], [1, 0.38], [0.81, 1], [0.19, 1], [0, 0.38]], hexagon: [[0.25, 0.07], [0.75, 0.07], [1, 0.5], [0.75, 0.93], [0.25, 0.93], [0, 0.5]],
  octagon: [[0.3, 0], [0.7, 0], [1, 0.3], [1, 0.7], [0.7, 1], [0.3, 1], [0, 0.7], [0, 0.3]], rhombus: [[0.5, 0], [1, 0.5], [0.5, 1], [0, 0.5]],
  kite: [[0.5, 0], [0.9, 0.35], [0.5, 1], [0.1, 0.35]], trapezium: [[0.25, 0.15], [0.75, 0.15], [1, 0.85], [0, 0.85]], parallelogram: [[0.25, 0.2], [1.1, 0.2], [0.85, 0.8], [0, 0.8]],
};
function Shapes({ v }: { v: Extract<Visual, { kind: "shapes" }> }) {
  const box = 80, gap = 26, W = v.items.length * (box + gap) + gap;
  return <Svg w={W} h={box + 56} v={v}>
    {v.items.map((s, i) => { const k = (s.scale ?? 1) * box * 0.8, ox = gap + i * (box + gap) + (box - k) / 2, oy = 10 + (box - k) / 2, f = colour(s.color);
      return <g key={i}>{s.shape === "circle" ? <circle cx={ox + k / 2} cy={oy + k / 2} r={k / 2} fill={f} stroke={INK} strokeWidth={2.5} /> : s.shape === "oval" ? <ellipse cx={ox + k / 2} cy={oy + k / 2} rx={k / 2} ry={k / 3} fill={f} stroke={INK} strokeWidth={2.5} /> : <polygon points={SHAPE_POINTS[s.shape].map(([x, y]) => `${ox + x * k},${oy + y * k}`).join(" ")} fill={f} stroke={INK} strokeWidth={2.5} />}
        <T x={gap + i * (box + gap) + box / 2} y={box + 40} fontSize={14} fontWeight={600}>{s.label ?? s.shape}</T></g>; })}
  </Svg>;
}

function Net({ v }: { v: Extract<Visual, { kind: "net" }> }) {
  const S = 46, cols = Math.max(...v.cells.map(([, c]) => c)) + 1, rows = Math.max(...v.cells.map(([r]) => r)) + 1;
  return <Svg w={cols * S + 20} h={rows * S + 20} v={v}>
    {v.cells.map(([r, c], i) => <g key={i}><rect x={10 + c * S} y={10 + r * S} width={S} height={S} fill={v.marked?.includes(i) ? "#fed7aa" : FILL} stroke={INK} strokeWidth={2} />{v.labels?.[i] && <T x={10 + c * S + S / 2} y={10 + r * S + S / 2 + 6} fontSize={18} fontWeight={700}>{v.labels[i]}</T>}</g>)}
  </Svg>;
}

function Spinner({ v }: { v: Extract<Visual, { kind: "spinner" }> }) {
  const c = 100, r = 86, n = v.sectors.length, pt = (i: number) => ({ x: c + r * Math.sin((2 * Math.PI * i) / n), y: c - r * Math.cos((2 * Math.PI * i) / n) });
  return <Svg w={200} h={200} v={v}>
    {v.sectors.map((s, i) => { const a = pt(i), b = pt(i + 1); return <path key={i} d={`M${c} ${c} L${a.x} ${a.y} A${r} ${r} 0 0 1 ${b.x} ${b.y} Z`} fill={colour(s)} stroke="#fff" strokeWidth={3} opacity={v.highlight && v.highlight !== s ? 0.45 : 1} />; })}
    <circle cx={c} cy={c} r={r} fill="none" stroke={INK} strokeWidth={2.5} /><line x1={c} y1={c} x2={c + 10} y2={c - 54} stroke={INK} strokeWidth={4} strokeLinecap="round" /><circle cx={c} cy={c} r={7} fill={INK} />
  </Svg>;
}

function DiceGrid({ v }: { v: Extract<Visual, { kind: "diceGrid" }> }) {
  const S = 34, P = 32, on = (a: number, b: number) => v.highlight.some(([x, y]) => x === a && y === b);
  return <Svg w={P + 6 * S + 6} h={P + 6 * S + 6} v={v}>
    {[1, 2, 3, 4, 5, 6].map((a) => <T key={`h${a}`} x={P + (a - 1) * S + S / 2} y={P - 10} fontWeight={700}>{a}</T>)}
    {[1, 2, 3, 4, 5, 6].map((b) => <T key={`v${b}`} x={P - 14} y={P + (b - 1) * S + S / 2 + 5} fontWeight={700}>{b}</T>)}
    {[1, 2, 3, 4, 5, 6].flatMap((a) => [1, 2, 3, 4, 5, 6].map((b) => <g key={`${a}${b}`}><rect x={P + (a - 1) * S} y={P + (b - 1) * S} width={S} height={S} fill={on(a, b) ? "#fde68a" : "#fff"} stroke={LINE} /><T x={P + (a - 1) * S + S / 2} y={P + (b - 1) * S + S / 2 + 4} fontSize={10} fill={on(a, b) ? INK : MUTED}>{a},{b}</T></g>))}
  </Svg>;
}

function Blocks({ v }: { v: Extract<Visual, { kind: "blocks" }> }) {
  const B = Math.min(36, 300 / (v.count + (v.extra ?? 0) / 2)), W = 20 + v.count * B + (v.extra ?? 0) * (B / 2) + 20, len = v.count * B + (v.extra ?? 0) * (B / 2);
  return <Svg w={W} h={110} v={v}>
    <rect x={20} y={14} width={len} height={30} rx={14} fill="#bbf7d0" stroke={INK} strokeWidth={2} /><T x={20 + len / 2} y={34}>{v.object}</T>
    {Array.from({ length: v.count }, (_, i) => <g key={i}><rect x={20 + i * B} y={54} width={B} height={B * 0.8} fill="#bfdbfe" stroke={INK} strokeWidth={1.5} /><T x={20 + i * B + B / 2} y={54 + B * 0.55} fontSize={12}>{i + 1}</T></g>)}
    {Array.from({ length: v.extra ?? 0 }, (_, i) => <rect key={`e${i}`} x={20 + v.count * B + i * (B / 2)} y={54 + B * 0.3} width={B / 2} height={B * 0.5} fill="#fde68a" stroke={INK} strokeWidth={1.5} />)}
  </Svg>;
}

function AreaGrid({ v }: { v: Extract<Visual, { kind: "areaGrid" }> }) {
  const S = Math.min(34, 260 / v.cols, 180 / v.rows), P = 30;
  return <Svg w={P + v.cols * S + 10} h={P + v.rows * S + 10} v={v}>
    {Array.from({ length: v.rows }, (_, r) => Array.from({ length: v.cols }, (_, c) => <rect key={`${r}${c}`} x={P + c * S} y={P + r * S} width={S} height={S} fill={r === 0 ? "#fde68a" : FILL} stroke={ACCENT} />))}
    <T x={P + (v.cols * S) / 2} y={P - 10} fill={MUTED}>{v.cols} {v.unit ?? "columns"}</T>
    <T x={P - 14} y={P + (v.rows * S) / 2 + 5} fill={MUTED}>{v.rows}</T>
  </Svg>;
}

function Perimeter({ v }: { v: Extract<Visual, { kind: "perimeter" }> }) {
  if (v.shape === "triangle") return <Svg w={260} h={190} v={v}><polygon points="40,160 220,160 130,30" fill={FILL} stroke={ACCENT} strokeWidth={3} /><T x={130} y={182}>{v.sides[0]} {v.unit}</T><T x={196} y={92} textAnchor="start">{v.sides[1]} {v.unit}</T><T x={64} y={92} textAnchor="end">{v.sides[2]} {v.unit}</T></Svg>;
  const [a, b] = v.sides, k = Math.min(200 / a, 110 / b), w = a * k, h = b * k;
  return <Svg w={w + 120} h={h + 60} v={v}>
    <rect x={60} y={24} width={w} height={h} fill={FILL} stroke={ACCENT} strokeWidth={3} />
    <T x={60 + w / 2} y={18}>{a} {v.unit}</T><T x={60 + w / 2} y={h + 46}>{v.sides[2] ?? a} {v.unit}</T>
    <T x={54} y={24 + h / 2 + 5} textAnchor="end">{b} {v.unit}</T><T x={66 + w} y={24 + h / 2 + 5} textAnchor="start">{v.sides[3] ?? b} {v.unit}</T>
  </Svg>;
}

function Calendar({ v }: { v: Extract<Visual, { kind: "calendar" }> }) {
  const S = 38, P = 26, days = ["M", "T", "W", "T", "F", "S", "S"], rows = Math.ceil((v.startDay + v.days) / 7);
  return <Svg w={7 * S + 10} h={P + rows * S + 10} v={v}>
    {days.map((d, i) => <T key={i} x={5 + i * S + S / 2} y={18} fontWeight={700} fill={MUTED}>{d}</T>)}
    {Array.from({ length: v.days }, (_, i) => { const k = i + v.startDay, x = 5 + (k % 7) * S, y = P + Math.floor(k / 7) * S, on = v.highlight.includes(i + 1); return <g key={i}><rect x={x} y={y} width={S - 2} height={S - 2} rx={5} fill={on ? "#fde68a" : "#fff"} stroke={on ? WARM : LINE} strokeWidth={on ? 2 : 1} /><T x={x + S / 2 - 1} y={y + S / 2 + 4} fontWeight={on ? 700 : 400}>{i + 1}</T></g>; })}
  </Svg>;
}

function NumberLine({ v }: { v: Extract<Visual, { kind: "numberLine" }> }) {
  const L = 24, R = 336, x = (n: number) => L + ((n - v.min) / (v.max - v.min)) * (R - L), every = v.labelEvery ?? v.step;
  return <Svg w={360} h={100} v={v}>
    <line x1={L - 10} x2={R + 10} y1={56} y2={56} stroke={INK} strokeWidth={2.5} />
    {ticks(v.min, v.max, v.step).map((t) => { const lab = Math.abs(t / every - Math.round(t / every)) < 1e-6; return <g key={t}><line x1={x(t)} x2={x(t)} y1={lab ? 46 : 50} y2={lab ? 66 : 62} stroke={INK} />{lab && <T x={x(t)} y={86} fontSize={13}>{minus(t)}</T>}</g>; })}
    {v.marks.map((m, i) => <g key={i}><circle cx={x(m.value)} cy={56} r={6.5} fill={WARM} stroke="#fff" strokeWidth={2} /><T x={x(m.value)} y={34} fill={WARM} fontWeight={700}>{m.label}</T></g>)}
  </Svg>;
}

function Bars({ v }: { v: Extract<Visual, { kind: "bars" }> }) {
  const max = Math.max(...v.values), W = 40 + v.categories.length * 64, H = 190, y = (n: number) => 150 - (n / max) * 120;
  return <Svg w={W} h={H} v={v}>
    <line x1={30} x2={W - 6} y1={150} y2={150} stroke={INK} strokeWidth={2} /><line x1={30} x2={30} y1={20} y2={150} stroke={INK} strokeWidth={2} />
    {v.categories.map((c, i) => <g key={c}><rect x={44 + i * 64} y={y(v.values[i])} width={40} height={150 - y(v.values[i])} fill={ACCENT} /><T x={64 + i * 64} y={y(v.values[i]) - 6} fontWeight={700}>{v.values[i]}</T><T x={64 + i * 64} y={170} fontSize={13}>{c}</T></g>)}
  </Svg>;
}

function Dots({ v }: { v: Extract<Visual, { kind: "dots" }> }) {
  const n = v.max - v.min, S = Math.min(40, 300 / n), W = 40 + n * S, counts = new Map<number, number>();
  const maxCount = Math.max(...v.values.map((x) => { counts.set(x, (counts.get(x) ?? 0) + 1); return counts.get(x)!; })), H = 50 + maxCount * 18;
  const placed = new Map<number, number>();
  return <Svg w={W} h={H} v={v}>
    <line x1={14} x2={W - 14} y1={H - 30} y2={H - 30} stroke={INK} strokeWidth={2} />
    {ticks(v.min, v.max, 1).map((t) => <g key={t}><line x1={20 + (t - v.min) * S} x2={20 + (t - v.min) * S} y1={H - 30} y2={H - 24} stroke={INK} /><T x={20 + (t - v.min) * S} y={H - 8} fontSize={13}>{t}</T></g>)}
    {v.values.map((x, i) => { const k = placed.get(x) ?? 0; placed.set(x, k + 1); return <circle key={i} cx={20 + (x - v.min) * S} cy={H - 42 - k * 18} r={7} fill={ACCENT} />; })}
  </Svg>;
}

export default function GuideVisual({ visual }: { visual: Visual }) {
  switch (visual.kind) {
    case "thermometer": return <Thermometer v={visual} />;
    case "clock": return <Clock v={visual} />;
    case "ruler": return <Ruler v={visual} />;
    case "gauge": return <Gauge v={visual} />;
    case "angle": return <Angle v={visual} />;
    case "grid": return <Grid v={visual} />;
    case "gridRef": return <GridRef v={visual} />;
    case "shapes": return <Shapes v={visual} />;
    case "net": return <Net v={visual} />;
    case "spinner": return <Spinner v={visual} />;
    case "diceGrid": return <DiceGrid v={visual} />;
    case "blocks": return <Blocks v={visual} />;
    case "areaGrid": return <AreaGrid v={visual} />;
    case "perimeter": return <Perimeter v={visual} />;
    case "calendar": return <Calendar v={visual} />;
    case "numberLine": return <NumberLine v={visual} />;
    case "bars": return <Bars v={visual} />;
    case "dots": return <Dots v={visual} />;
  }
}
