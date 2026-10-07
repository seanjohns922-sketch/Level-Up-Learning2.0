"use client";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import type { Number8Visual } from "@/data/activities/level8/number-visual";
import { number8VisualSpeech } from "@/data/activities/level8/number-visual";

// Level 8 Number diagrams. Each one supports the question without showing its answer.
const INK = "#1f2a37", MUTED = "#64748b", ACCENT = "#0f766e", WARM = "#c2410c";

function NumberLine({ v }: { v: Extract<Number8Visual, { kind: "numberline" }> }) {
  const W = 360, L = 24, R = 336, span = v.max - v.min, x = (n: number) => L + ((n - v.min) / span) * (R - L);
  const ticks: number[] = [];
  for (let n = v.min; n <= v.max + 1e-9; n += v.step) ticks.push(Number(n.toFixed(6)));
  return (
    <svg viewBox={`0 0 ${W} 112`} className="mx-auto w-full max-w-lg" role="img" aria-label={number8VisualSpeech(v)}>
      <line x1={L - 14} x2={R + 14} y1={70} y2={70} stroke={INK} strokeWidth={2.5} markerEnd="url(#n8-arrow)" markerStart="url(#n8-arrow)" />
      <defs><marker id="n8-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill={INK} /></marker></defs>
      {v.interval && <rect x={x(v.interval[0])} y={63} width={x(v.interval[1]) - x(v.interval[0])} height={14} rx={4} fill={ACCENT} opacity={0.22} />}
      {ticks.map((n) => (
        <g key={n}>
          <line x1={x(n)} x2={x(n)} y1={62} y2={78} stroke={INK} strokeWidth={1.6} />
          {v.labelTicks !== false && <text x={x(n)} y={100} textAnchor="middle" fontSize={17} fill={INK}>{n < 0 ? `−${-n}` : n}</text>}
        </g>
      ))}
      {v.points.map((p, i) => (
        <g key={i}>
          <circle cx={x(p.value)} cy={70} r={7} fill={p.colour ?? WARM} stroke="#fff" strokeWidth={2} />
          <text x={x(p.value)} y={46} textAnchor="middle" fontSize={18} fontWeight={700} fill={p.colour ?? WARM}>{p.label}</text>
        </g>
      ))}
    </svg>
  );
}

function Squares({ v }: { v: Extract<Number8Visual, { kind: "squares" }> }) {
  const max = Math.max(...v.squares.map((s) => s.area)), scale = 120 / Math.sqrt(max);
  const sides = v.squares.map((s) => Math.sqrt(s.area) * scale);
  const placed = v.squares.map((s, i) => ({ ...s, side: sides[i], at: 10 + sides.slice(0, i).reduce((sum, w) => sum + w + 26, 0) }));
  const cursor = 10 + sides.reduce((sum, w) => sum + w + 26, 0);
  return (
    <svg viewBox={`0 0 ${cursor} 170`} className="mx-auto w-full max-w-xl" role="img" aria-label={number8VisualSpeech(v)}>
      {placed.map((s, i) => (
        <g key={i}>
          <rect x={s.at} y={150 - s.side} width={s.side} height={s.side} fill={s.highlight ? "#fde7d8" : "#e0f2f1"} stroke={s.highlight ? WARM : ACCENT} strokeWidth={2} />
          <text x={s.at + s.side / 2} y={150 - s.side / 2 + 5} textAnchor="middle" fontSize={15} fontWeight={700} fill={INK}>{s.label}</text>
          {s.sideLabel && <text x={s.at + s.side / 2} y={166} textAnchor="middle" fontSize={13} fill={MUTED}>side {s.sideLabel}</text>}
        </g>
      ))}
    </svg>
  );
}

function Factors({ v }: { v: Extract<Number8Visual, { kind: "factors" }> }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 py-3" role="img" aria-label={number8VisualSpeech(v)}>
      {v.groups.map((g, i) => (
        <div key={i} className="flex items-center gap-2">
          {g.operator && <span className="text-2xl font-bold" style={{ color: MUTED }}>{g.operator}</span>}
          <div className="flex items-center gap-1 rounded-lg border-2 px-2 py-1" style={{ borderColor: ACCENT }}>
            <span className="text-lg" style={{ color: MUTED }}>(</span>
            {Array.from({ length: g.count }, (_, k) => (
              <span key={k} className="flex items-center gap-1">
                {k > 0 && <span style={{ color: MUTED }}>×</span>}
                <span className="grid h-9 min-w-9 place-items-center rounded-md px-1 text-lg font-bold" style={{ background: "#e0f2f1", color: INK }}>{g.base}</span>
              </span>
            ))}
            <span className="text-lg" style={{ color: MUTED }}>)</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Division({ v }: { v: Extract<Number8Visual, { kind: "division" }> }) {
  const rows: { remainder: number; digit: number }[] = [];
  let r = v.numerator % v.denominator;
  for (let i = 0; i < v.places; i++) { const digit = Math.floor((r * 10) / v.denominator); rows.push({ remainder: r, digit }); r = (r * 10) % v.denominator; }
  return (
    <div role="img" aria-label={number8VisualSpeech(v)}>
      <table className="mx-auto text-center text-base">
        <thead><tr style={{ color: MUTED }}><th className="px-3 py-1">Step</th><th className="px-3 py-1">Remainder × 10</th><th className="px-3 py-1">÷ {v.denominator}</th><th className="px-3 py-1">Digit</th></tr></thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t" style={{ borderColor: "#e2e8f0" }}>
              <td className="px-3 py-1">{i + 1}</td><td className="px-3 py-1">{row.remainder * 10}</td><td className="px-3 py-1">{row.digit} r {(row.remainder * 10) % v.denominator}</td><td className="px-3 py-1 font-bold" style={{ color: ACCENT }}>{row.digit}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-center text-sm" style={{ color: MUTED }}>When a remainder repeats, the digits repeat.</p>
    </div>
  );
}

function PercentBar({ v }: { v: Extract<Number8Visual, { kind: "percentbar" }> }) {
  // Laid out with HTML so the labels stay readable on a phone.
  const unit = v.unit ?? "", amount = unit === "$" ? `$${v.base}` : `${v.base}${unit ? ` ${unit}` : ""}`;
  const change = Math.max(30, v.percent), whole = v.direction > 0 ? 100 + change : 100;
  return (
    <div role="img" aria-label={number8VisualSpeech(v)} className="py-2">
      <div className="flex h-14 w-full text-xs font-bold sm:text-base">
        <div className="relative flex items-center justify-center rounded-lg border-2" style={{ width: `${(100 / whole) * 100}%`, borderColor: ACCENT, background: "#e0f2f1", color: INK }}>
          {v.direction < 0 && <div className="absolute inset-y-0 right-0 flex items-center justify-center rounded-r-md border-l-2 border-dashed" style={{ width: `${change}%`, borderColor: WARM, background: "#fde7d8", color: WARM }}>−{v.percent}%</div>}
          <span className="px-1" style={v.direction < 0 ? { marginRight: `${change}%` } : undefined}>100% = {amount}</span>
        </div>
        {v.direction > 0 && <div className="ml-1 flex items-center justify-center rounded-lg border-2 border-dashed" style={{ width: `${(change / whole) * 100}%`, borderColor: WARM, background: "#fde7d8", color: WARM }}>+{v.percent}%</div>}
      </div>
      {v.caption && <p className="mt-2 text-sm" style={{ color: MUTED }}>{v.caption}</p>}
    </div>
  );
}

export default function NumberVisual({ visual }: { visual: Number8Visual }) {
  return (
    <div className="rounded-xl border border-teal-300 bg-white p-4 text-slate-900">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="font-bold">{visual.title}</p>
        <ReadAloudBtn text={number8VisualSpeech(visual)} label="Read diagram" />
      </div>
      {visual.kind === "numberline" && <NumberLine v={visual} />}
      {visual.kind === "squares" && <Squares v={visual} />}
      {visual.kind === "factors" && <Factors v={visual} />}
      {visual.kind === "division" && <Division v={visual} />}
      {visual.kind === "percentbar" && <PercentBar v={visual} />}
    </div>
  );
}
