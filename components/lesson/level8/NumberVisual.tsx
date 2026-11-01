"use client";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import type { Number8Visual } from "@/data/activities/level8/number-visual";
import { number8VisualSpeech } from "@/data/activities/level8/number-visual";

// Level 8 Number diagrams. Each one supports the question without showing its answer.
const INK = "#3c2a63", MUTED = "#5b5078", ACCENT = "#0f766e", WARM = "#c2410c";

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
          {v.labelTicks !== false && (ticks.length <= 9 || Math.round((n - v.min) / v.step) % 2 === 0) && <text x={x(n)} y={100} textAnchor="middle" fontSize={17} fill={INK}>{n < 0 ? `−${-n}` : n}</text>}
        </g>
      ))}
      {v.points.map((p, i) => (
        <g key={i}>
          <circle cx={x(p.value)} cy={70} r={9} fill={p.colour ?? WARM} stroke="#fff" strokeWidth={2.5} />
          <text x={x(p.value)} y={v.points.some((other,j)=>j!==i&&Math.abs(x(other.value)-x(p.value))<75)?(i%2?22:46):46} textAnchor="middle" fontSize={18} fontWeight={700} fill={p.colour ?? WARM}>{p.label}</text>
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
          <rect x={s.at} y={150 - s.side} width={s.side} height={s.side} fill={s.highlight ? "#ffb12e" : "#d3c0f7"} stroke={INK} strokeWidth={2.5} />
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
          <div className="flex flex-wrap items-center gap-1 rounded-lg border-2 px-2 py-1" style={{ borderColor: ACCENT }}>
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
  const unit = v.unit ?? "", amount = v.hideBase ? "?" : unit === "$" ? `$${v.base}` : `${v.base}${unit ? ` ${unit}` : ""}`;
  const whole = v.direction > 0 ? 100 + v.percent : 100;
  return (
    <div role="img" aria-label={number8VisualSpeech(v)} className="py-2">
      <p className="mb-2 text-base font-bold" style={{ color: INK }}>Original 100% = {amount}; {v.direction > 0 ? "+" : "−"}{v.percent}%</p>
      <div className="flex h-16 w-full overflow-hidden rounded-lg shadow-md" aria-hidden="true">
        <div className="relative border-2" style={{ width: `${10000 / whole}%`, borderColor: INK, background: "linear-gradient(135deg,#9a6cf0,#6d3bd1)" }}>
          {v.direction < 0 && <div className="absolute inset-y-0 right-0 border-l-2 border-dashed" style={{ width: `${v.percent}%`, borderColor: "#c76f00", background: "#ffb12e" }}/>}
        </div>
        {v.direction > 0 && <div className="border-2 border-dashed" style={{ width: `${v.percent / whole * 100}%`, borderColor: "#c76f00", background: "#ffb12e" }}/>}
      </div>
      {v.caption && <p className="mt-2 text-sm" style={{ color: MUTED }}>{v.caption}</p>}
    </div>
  );
}

function Lengths({v}:{v:Extract<Number8Visual,{kind:"lengths"}>}) {
  const total=v.lengths.reduce((a,b)=>a+b,0),gap=v.object==='pipe'?8:2,scale=(400-gap*(v.lengths.length-1))/total;
  return <><svg viewBox="0 0 440 100" role="img" aria-label={number8VisualSpeech(v)} className="mx-auto w-full max-w-xl">{v.lengths.map((len,i)=>{const x=20+v.lengths.slice(0,i).reduce((a,b)=>a+b,0)*scale+i*gap,w=len*scale;return <g key={i}>
    <rect x={x} y="25" width={w} height="40" rx={v.object==='pipe'?8:1} fill={v.object==='pipe'?'#cbd5e1':'#e5c28b'} stroke="#654b31" strokeWidth="2"/>
    {v.object==='timber'&&<path d={`M${x+4} 39 Q${x+w/2} 33 ${x+w-4} 41 M${x+4} 53 Q${x+w/2} 58 ${x+w-4} 51`} fill="none" stroke="#ac8047"/>}
    {v.object==='fence'&&[0,.25,.5,.75,1].map((t,j)=><line key={j} x1={x+t*w} x2={x+t*w} y1="18" y2="70" stroke="#654b31" strokeWidth="3"/>)}
    {v.object==='pipe'&&<ellipse cx={x+w-5} cy="45" rx="5" ry="19" fill="#94a3b8" stroke="#475569"/>}
    <text x={x+w/2} y="91" textAnchor="middle" fontSize="17" fontWeight="700" fill={INK}>{v.labels[i]}</text></g>;})}</svg><p className="mt-2 text-sm">{v.caption}</p></>;
}

function Tally({v}:{v:Extract<Number8Visual,{kind:"tally"}>}) {
  return <svg viewBox="0 0 360 90" className="mx-auto w-full max-w-lg" role="img" aria-label={number8VisualSpeech(v)}>{Array.from({length:v.groups+1},(_,g)=><g key={g} stroke={INK} strokeWidth="3">{Array.from({length:g<v.groups?4:v.singles},(_,i)=><line key={i} x1={20+g*80+i*16} x2={20+g*80+i*16} y1="18" y2="70"/>)}{g<v.groups&&<line x1={12+g*80} x2={76+g*80} y1="60" y2="28"/>}</g>)}</svg>;
}

export default function NumberVisual({ visual }: { visual: Number8Visual }) {
  return (
    <div className="rounded-2xl bg-[#f6f3fb] p-3 text-slate-900 sm:p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="font-bold">{visual.title}</p>
        <ReadAloudBtn text={number8VisualSpeech(visual)} label="Read diagram" />
      </div>
      {visual.kind === "tally" && <Tally v={visual} />}
      {visual.kind === "lengths" && <Lengths v={visual} />}
      {visual.kind === "numberline" && <NumberLine v={visual} />}
      {visual.kind === "squares" && <Squares v={visual} />}
      {visual.kind === "factors" && <Factors v={visual} />}
      {visual.kind === "division" && <Division v={visual} />}
      {visual.kind === "percentbar" && <PercentBar v={visual} />}
    </div>
  );
}
