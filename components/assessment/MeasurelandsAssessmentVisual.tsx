"use client";

import type { MzVisual } from "@/data/assessments/measurelandsVisuals";

// Premium SVG visuals for Measurelands pre/post-tests, echoing the real lesson
// instruments (ruler, scales, jug, clock, thermometer, area grid, cube stack,
// protractor…). Styled for the dark assessment shell with gold accents.

const GOLD = "#d6a94e";
const GOLD_DEEP = "#b8893a";
const INK = "#f8ede0";
const MUTE = "#c9b48f";
const PANEL = "rgba(51,44,32,0.55)";

function Panel({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(184,137,58,0.35)", background: "linear-gradient(160deg, rgba(60,40,15,0.35), rgba(30,24,14,0.5))" }}>
      {label ? <div className="mb-2 text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: GOLD }}>{label}</div> : null}
      {children}
    </div>
  );
}

// ── Ruler ─────────────────────────────────────────────────────────────────────
function Ruler({ toCm, emoji }: { toCm: number; emoji?: string }) {
  const span = Math.max(10, Math.ceil(toCm) + 2);
  const W = 560, H = 130, x0 = 30, x1 = W - 30, unit = (x1 - x0) / span;
  const objEnd = x0 + toCm * unit;
  return (
    <Panel label="Measure the length">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <rect x={x0} y={70} width={objEnd - x0} height={22} rx={5} fill={GOLD} opacity={0.9} />
        <text x={(x0 + objEnd) / 2} y={62} fontSize={20} textAnchor="middle">{emoji ?? "📏"}</text>
        <rect x={x0} y={95} width={x1 - x0} height={26} rx={4} fill="rgba(255,240,210,0.08)" stroke={GOLD_DEEP} />
        {Array.from({ length: span + 1 }).map((_, i) => {
          const x = x0 + i * unit;
          return (
            <g key={i}>
              <line x1={x} y1={95} x2={x} y2={i % 1 === 0 ? 108 : 102} stroke={MUTE} strokeWidth={i === Math.round(toCm) ? 2 : 1} />
              <text x={x} y={118} fontSize={9} textAnchor="middle" fill={MUTE}>{i}</text>
            </g>
          );
        })}
        <line x1={objEnd} y1={40} x2={objEnd} y2={95} stroke={GOLD} strokeDasharray="3 3" />
        <text x={x1} y={128} fontSize={9} textAnchor="end" fill={MUTE}>cm</text>
      </svg>
    </Panel>
  );
}

// ── Scale dial (mass) ──────────────────────────────────────────────────────────
function ScaleDial({ value, unit, max }: { value: number; unit: string; max: number }) {
  const cx = 130, cy = 120, r = 92;
  const f = Math.max(0, Math.min(1, value / max));
  const theta = Math.PI - f * Math.PI;
  const nx = cx + r * 0.82 * Math.cos(theta), ny = cy - r * 0.82 * Math.sin(theta);
  return (
    <Panel label="Read the scale">
      <svg viewBox="0 0 260 150" className="mx-auto block" style={{ maxHeight: 160 }}>
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={GOLD_DEEP} strokeWidth={10} strokeLinecap="round" />
        {Array.from({ length: 11 }).map((_, i) => {
          const t = Math.PI - (i / 10) * Math.PI;
          const x1 = cx + (r - 12) * Math.cos(t), y1 = cy - (r - 12) * Math.sin(t);
          const x2 = cx + r * Math.cos(t), y2 = cy - r * Math.sin(t);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={MUTE} strokeWidth={1.5} />;
        })}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={GOLD} strokeWidth={3.5} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={6} fill={INK} />
        <text x={cx} y={cy - 26} fontSize={22} fontWeight={800} textAnchor="middle" fill={INK}>{value} {unit}</text>
        <text x={cx - r} y={cy + 16} fontSize={9} textAnchor="middle" fill={MUTE}>0</text>
        <text x={cx + r} y={cy + 16} fontSize={9} textAnchor="middle" fill={MUTE}>{max}{unit}</text>
      </svg>
    </Panel>
  );
}

// ── Jug (capacity) ─────────────────────────────────────────────────────────────
function Jug({ value, unit, max }: { value: number; unit: string; max: number }) {
  const H = 150, top = 12, bottom = 138, x0 = 90, w = 80;
  const f = Math.max(0, Math.min(1, value / max));
  const fillTop = bottom - f * (bottom - top);
  const marks = 4;
  return (
    <Panel label="Read the jug">
      <svg viewBox="0 0 260 160" className="mx-auto block" style={{ maxHeight: 170 }}>
        <rect x={x0} y={fillTop} width={w} height={bottom - fillTop} fill={GOLD} opacity={0.55} />
        <path d={`M ${x0} ${top} L ${x0} ${bottom} Q ${x0} ${bottom + 8} ${x0 + 8} ${bottom + 8} L ${x0 + w - 8} ${bottom + 8} Q ${x0 + w} ${bottom + 8} ${x0 + w} ${bottom} L ${x0 + w} ${top}`} fill="none" stroke={GOLD_DEEP} strokeWidth={3} />
        <path d={`M ${x0 + w} ${top + 10} q 16 4 14 22`} fill="none" stroke={GOLD_DEEP} strokeWidth={3} />
        {Array.from({ length: marks + 1 }).map((_, i) => {
          const y = bottom - (i / marks) * (bottom - top);
          return (
            <g key={i}>
              <line x1={x0} y1={y} x2={x0 + 14} y2={y} stroke={MUTE} />
              <text x={x0 - 6} y={y + 3} fontSize={9} textAnchor="end" fill={MUTE}>{Math.round((i / marks) * max)}</text>
            </g>
          );
        })}
        <text x={x0 + w + 26} y={80} fontSize={22} fontWeight={800} textAnchor="middle" fill={INK}>{value}</text>
        <text x={x0 + w + 26} y={100} fontSize={12} textAnchor="middle" fill={MUTE}>{unit}</text>
      </svg>
    </Panel>
  );
}

// ── Analog clock ───────────────────────────────────────────────────────────────
function Clock({ hour, minute, digital }: { hour: number; minute: number; digital?: string }) {
  const cx = 80, cy = 80, r = 66;
  const mAng = (minute * 6 - 90) * (Math.PI / 180);
  const hAng = ((hour % 12) * 30 + minute * 0.5 - 90) * (Math.PI / 180);
  const hx = cx + r * 0.5 * Math.cos(hAng), hy = cy + r * 0.5 * Math.sin(hAng);
  const mx = cx + r * 0.78 * Math.cos(mAng), my = cy + r * 0.78 * Math.sin(mAng);
  return (
    <Panel label="Read the clock">
      <div className="flex items-center justify-center gap-5">
        <svg viewBox="0 0 160 160" style={{ width: 150, height: 150 }}>
          <circle cx={cx} cy={cy} r={r} fill="rgba(255,240,210,0.05)" stroke={GOLD_DEEP} strokeWidth={4} />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * 30 - 90) * (Math.PI / 180);
            const x1 = cx + (r - 8) * Math.cos(a), y1 = cy + (r - 8) * Math.sin(a);
            const x2 = cx + r * Math.cos(a), y2 = cy + r * Math.sin(a);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={MUTE} strokeWidth={2} />;
          })}
          <line x1={cx} y1={cy} x2={hx} y2={hy} stroke={INK} strokeWidth={5} strokeLinecap="round" />
          <line x1={cx} y1={cy} x2={mx} y2={my} stroke={GOLD} strokeWidth={3.5} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={5} fill={GOLD} />
        </svg>
        {digital ? <div className="rounded-xl px-4 py-2 text-2xl font-black" style={{ background: PANEL, color: INK, border: `1px solid ${GOLD_DEEP}` }}>{digital}</div> : null}
      </div>
    </Panel>
  );
}

// ── Thermometer ────────────────────────────────────────────────────────────────
function Thermometer({ value, from, max = 40 }: { value: number; from?: number; max?: number }) {
  const top = 14, bottom = 150, x = 60;
  const yFor = (v: number) => bottom - Math.max(0, Math.min(1, v / max)) * (bottom - top);
  return (
    <Panel label="Read the temperature">
      <svg viewBox="0 0 220 170" className="mx-auto block" style={{ maxHeight: 180 }}>
        <rect x={x - 8} y={top} width={16} height={bottom - top} rx={8} fill="rgba(255,240,210,0.06)" stroke={GOLD_DEEP} strokeWidth={2} />
        <rect x={x - 6} y={yFor(value)} width={12} height={bottom - yFor(value)} fill={GOLD} />
        <circle cx={x} cy={bottom + 8} r={13} fill={GOLD} stroke={GOLD_DEEP} strokeWidth={2} />
        {from !== undefined ? <line x1={x + 12} y1={yFor(from)} x2={x + 30} y2={yFor(from)} stroke={MUTE} strokeDasharray="3 3" /> : null}
        {from !== undefined ? <text x={x + 34} y={yFor(from) + 4} fontSize={12} fill={MUTE}>{from}°C</text> : null}
        <line x1={x + 12} y1={yFor(value)} x2={x + 30} y2={yFor(value)} stroke={GOLD} />
        <text x={x + 34} y={yFor(value) + 6} fontSize={20} fontWeight={800} fill={INK}>{value}°C</text>
      </svg>
    </Panel>
  );
}

// ── Rectangle (perimeter) ───────────────────────────────────────────────────────
function RectShape({ w, h, mode, unit = "units" }: { w: number; h: number; mode: string; unit?: string }) {
  const maxDim = Math.max(w, h);
  const scale = 120 / maxDim, rw = w * scale, rh = h * scale;
  const ox = (280 - rw) / 2, oy = (170 - rh) / 2;
  return (
    <Panel label={mode === "perimeter" ? "Distance around the edge" : "Space inside"}>
      <svg viewBox="0 0 280 170" className="w-full" style={{ maxHeight: 180 }}>
        <rect x={ox} y={oy} width={rw} height={rh} rx={4} fill={mode === "area" ? "rgba(214,169,78,0.18)" : "none"} stroke={GOLD} strokeWidth={mode === "perimeter" ? 5 : 3} />
        <text x={ox + rw / 2} y={oy - 8} fontSize={13} fontWeight={700} textAnchor="middle" fill={INK}>{w} {unit}</text>
        <text x={ox - 10} y={oy + rh / 2} fontSize={13} fontWeight={700} textAnchor="middle" fill={INK} transform={`rotate(-90 ${ox - 10} ${oy + rh / 2})`}>{h} {unit}</text>
      </svg>
    </Panel>
  );
}

// ── Area grid ───────────────────────────────────────────────────────────────────
function Grid({ cols, rows, unit = "units²" }: { cols: number; rows: number; unit?: string }) {
  const cell = Math.min(30, Math.floor(220 / Math.max(cols, rows)));
  const w = cols * cell, h = rows * cell, ox = (260 - w) / 2, oy = 10;
  return (
    <Panel label={`Count the unit squares (${unit})`}>
      <svg viewBox={`0 0 260 ${h + 24}`} className="w-full" style={{ maxHeight: 200 }}>
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => (
            <rect key={`${r}-${c}`} x={ox + c * cell} y={oy + r * cell} width={cell - 2} height={cell - 2} rx={2} fill="rgba(214,169,78,0.22)" stroke={GOLD_DEEP} strokeWidth={1} />
          ))
        )}
        <text x={130} y={h + 20} fontSize={12} textAnchor="middle" fill={MUTE}>{cols} × {rows}</text>
      </svg>
    </Panel>
  );
}

// ── Cube stack (volume) ─────────────────────────────────────────────────────────
function Cubes({ l, w, h }: { l: number; w: number; h: number }) {
  const U = 16, V = 8, HH = 18, ox = 130, oy = 40;
  const proj = (x: number, y: number, z: number) => [ox + (x - y) * U, oy + (x + y) * V - z * HH];
  const faces: React.ReactNode[] = [];
  for (let z = 0; z < h; z++) for (let y = w - 1; y >= 0; y--) for (let x = 0; x < l; x++) {
    faces.push(
      <g key={`${x}-${y}-${z}`}>
        <polygon points={`${proj(x, y, z + 1).join(",")} ${proj(x + 1, y, z + 1).join(",")} ${proj(x + 1, y + 1, z + 1).join(",")} ${proj(x, y + 1, z + 1).join(",")}`} fill="#e8c874" stroke={GOLD_DEEP} strokeWidth={0.5} />
        <polygon points={`${proj(x + 1, y, z).join(",")} ${proj(x + 1, y, z + 1).join(",")} ${proj(x + 1, y + 1, z + 1).join(",")} ${proj(x + 1, y + 1, z).join(",")}`} fill={GOLD_DEEP} stroke="#7a5a1f" strokeWidth={0.5} />
        <polygon points={`${proj(x, y + 1, z).join(",")} ${proj(x + 1, y + 1, z).join(",")} ${proj(x + 1, y + 1, z + 1).join(",")} ${proj(x, y + 1, z + 1).join(",")}`} fill={GOLD} stroke="#7a5a1f" strokeWidth={0.5} />
      </g>
    );
  }
  return (
    <Panel label="Count the cubic units">
      <svg viewBox="0 0 260 180" className="w-full" style={{ maxHeight: 190 }}>{faces}
        <text x={130} y={172} fontSize={12} textAnchor="middle" fill={MUTE}>{l} × {w} × {h}</text>
      </svg>
    </Panel>
  );
}

// ── Angle ───────────────────────────────────────────────────────────────────────
function Angle({ single, known, unknown, total }: { single?: number; known?: number; unknown?: number; total?: number }) {
  const cx = 140, cy = 150, r = 110;
  const ray = (deg: number, len = r, color = INK, wdt = 4) => {
    const a = -deg * (Math.PI / 180);
    return <line x1={cx} y1={cy} x2={cx + len * Math.cos(a)} y2={cy + len * Math.sin(a)} stroke={color} strokeWidth={wdt} strokeLinecap="round" />;
  };
  const arc = (a0: number, a1: number, color: string, rr: number) => {
    const p0 = [cx + rr * Math.cos(-a0 * Math.PI / 180), cy + rr * Math.sin(-a0 * Math.PI / 180)];
    const p1 = [cx + rr * Math.cos(-a1 * Math.PI / 180), cy + rr * Math.sin(-a1 * Math.PI / 180)];
    return <path d={`M ${p0[0]} ${p0[1]} A ${rr} ${rr} 0 0 0 ${p1[0]} ${p1[1]}`} fill="none" stroke={color} strokeWidth={3} />;
  };
  return (
    <Panel label="Angle reasoning">
      <svg viewBox="0 0 280 170" className="w-full" style={{ maxHeight: 180 }}>
        {total ? <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke={MUTE} strokeWidth={2} /> : ray(0, r, MUTE, 3)}
        {single !== undefined ? (
          <>{ray(single)}{arc(0, single, GOLD, 34)}<text x={cx + 44} y={cy - 20} fontSize={16} fontWeight={800} fill={INK}>{single}°</text></>
        ) : null}
        {known !== undefined && unknown !== undefined ? (
          <>
            {ray(known)}
            {arc(0, known, GOLD, 40)}
            {arc(known, total ?? 180, "#7dd3fc", 30)}
            <text x={cx + 40} y={cy - 46} fontSize={15} fontWeight={800} fill={GOLD}>{known}°</text>
            <text x={cx - 50} y={cy - 22} fontSize={15} fontWeight={800} fill="#7dd3fc">?</text>
          </>
        ) : null}
        <circle cx={cx} cy={cy} r={4} fill={INK} />
      </svg>
    </Panel>
  );
}

// ── Metric conversion chips ──────────────────────────────────────────────────────
function Convert({ fromValue, fromUnit, toValue, toUnit }: { fromValue: number; fromUnit: string; toValue: number; toUnit: string }) {
  const chip = (v: number, u: string, strong: boolean) => (
    <div className="rounded-2xl px-5 py-4 text-center" style={{ background: strong ? "rgba(214,169,78,0.18)" : PANEL, border: `2px solid ${strong ? GOLD : GOLD_DEEP}` }}>
      <div className="text-3xl font-black" style={{ color: INK }}>{v}</div>
      <div className="text-sm font-bold" style={{ color: MUTE }}>{u}</div>
    </div>
  );
  return (
    <Panel label="Convert the unit">
      <div className="flex items-center justify-center gap-4">
        {chip(fromValue, fromUnit, false)}
        <div className="text-3xl" style={{ color: GOLD }}>→</div>
        {chip(toValue, toUnit, true)}
      </div>
    </Panel>
  );
}

// ── Numeric compare bars ─────────────────────────────────────────────────────────
function Bars({ items, unit }: { items: Array<{ label: string; value: number }>; unit?: string }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <Panel label="Compare the amounts">
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-24 shrink-0 text-right text-sm font-black" style={{ color: INK }}>{it.label}</div>
            <div className="h-7 flex-1 rounded-lg" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="h-7 rounded-lg" style={{ width: `${(it.value / max) * 100}%`, background: i === 0 ? GOLD : GOLD_DEEP }} />
            </div>
          </div>
        ))}
        {unit ? <div className="text-right text-[11px]" style={{ color: MUTE }}>{unit}</div> : null}
      </div>
    </Panel>
  );
}

// ── Object cards (qualitative compare / sequence) ────────────────────────────────
function Objects({ items, caption }: { items: Array<{ label: string; emoji: string }>; caption?: string }) {
  return (
    <Panel label={caption ?? "Look at each one"}>
      <div className={`grid gap-3 ${items.length <= 2 ? "grid-cols-2" : items.length === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}>
        {items.map((it, i) => (
          <div key={i} className="flex flex-col items-center gap-1 rounded-2xl px-2 py-3 text-center" style={{ background: PANEL, border: `1px solid ${GOLD_DEEP}` }}>
            <span className="text-4xl">{it.emoji}</span>
            <span className="text-[12px] font-bold" style={{ color: INK }}>{it.label}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ── Concept instrument card (answer-neutral fallback) ────────────────────────────
const CONCEPT_ICON: Record<string, string> = {
  ruler: "📏", scale: "⚖️", jug: "🧪", clock: "🕐", thermometer: "🌡️", perimeter: "🔲",
  area: "▦", volume: "🧊", angle: "📐", convert: "🔁", calendar: "📅", duration: "⏱️", tools: "🛠️",
};
function Concept({ icon, label, sub }: { icon: string; label: string; sub?: string }) {
  return (
    <Panel>
      <div className="flex items-center gap-4">
        <span className="text-5xl">{CONCEPT_ICON[icon] ?? "📐"}</span>
        <div>
          <div className="text-lg font-black" style={{ color: INK }}>{label}</div>
          {sub ? <div className="text-sm" style={{ color: MUTE }}>{sub}</div> : null}
        </div>
      </div>
    </Panel>
  );
}

export default function MeasurelandsAssessmentVisual({ visual }: { visual: MzVisual }) {
  switch (visual.kind) {
    case "ruler": return <Ruler toCm={visual.toCm} emoji={visual.emoji} />;
    case "scaleDial": return <ScaleDial value={visual.value} unit={visual.unit} max={visual.max} />;
    case "jug": return <Jug value={visual.value} unit={visual.unit} max={visual.max} />;
    case "clock": return <Clock hour={visual.hour} minute={visual.minute} digital={visual.digital} />;
    case "thermometer": return <Thermometer value={visual.value} from={visual.from} max={visual.max} />;
    case "rectangle": return <RectShape w={visual.w} h={visual.h} mode={visual.mode} unit={visual.unit} />;
    case "grid": return <Grid cols={visual.cols} rows={visual.rows} unit={visual.unit} />;
    case "cubes": return <Cubes l={visual.l} w={visual.w} h={visual.h} />;
    case "angle": return <Angle single={visual.single} known={visual.known} unknown={visual.unknown} total={visual.total} />;
    case "convert": return <Convert fromValue={visual.fromValue} fromUnit={visual.fromUnit} toValue={visual.toValue} toUnit={visual.toUnit} />;
    case "bars": return <Bars items={visual.items} unit={visual.unit} />;
    case "objects": return <Objects items={visual.items} caption={visual.caption} />;
    case "concept": return <Concept icon={visual.icon} label={visual.label} sub={visual.sub} />;
    default: return null;
  }
}
