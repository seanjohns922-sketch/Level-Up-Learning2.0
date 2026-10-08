"use client";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { chance8VisualSpeech, gridCell, type Chance8Visual, type VennRegion } from "@/data/activities/level8/chance-visual";

// Level 8 Probability diagrams. Each one supports the question without showing its answer.
const INK = "#1f2a37", MUTED = "#64748b", EDGE = "#94a3b8", HI = "#fde68a", HI_EDGE = "#d97706";
type V<K extends Chance8Visual["kind"]> = Extract<Chance8Visual, { kind: K }>;

function Spinner({ v }: { v: V<"spinner"> }) {
  const n = v.sectors.length, c = 110, r = 92, step = (2 * Math.PI) / n;
  const pt = (a: number, d: number) => [c + d * Math.cos(a - Math.PI / 2), c + d * Math.sin(a - Math.PI / 2)];
  return (
    <svg viewBox="0 0 220 226" className="mx-auto w-full max-w-[260px]" role="img" aria-label={chance8VisualSpeech(v)}>
      {v.sectors.map((s, i) => {
        const [x0, y0] = pt(i * step, r), [x1, y1] = pt((i + 1) * step, r), [lx, ly] = pt((i + 0.5) * step, r * 0.62);
        return (
          <g key={i}>
            <path d={`M${c} ${c} L${x0} ${y0} A${r} ${r} 0 ${step > Math.PI ? 1 : 0} 1 ${x1} ${y1}Z`} fill={s.color} stroke="#fff" strokeWidth={2} />
            <text x={lx} y={ly + 5} textAnchor="middle" fontSize={n > 10 ? 11 : 14} fontWeight={700} fill={INK}>{s.label}</text>
          </g>
        );
      })}
      <circle cx={c} cy={c} r={r} fill="none" stroke={INK} strokeWidth={2.5} />
      <path d={`M${c} ${c - r - 10} l-8 14 h16z`} fill={INK} />
      <circle cx={c} cy={c} r={6} fill={INK} />
    </svg>
  );
}

function Bag({ v }: { v: V<"bag"> }) {
  const dots = v.groups.flatMap((g) => Array.from({ length: g.count }, () => g.color));
  const per = Math.min(10, Math.ceil(Math.sqrt(dots.length * 1.6)));
  return (
    <div role="img" aria-label={chance8VisualSpeech(v)} className="mx-auto max-w-sm">
      <div className="mx-auto grid w-fit gap-1.5 rounded-b-[48px] rounded-t-xl border-2 border-slate-400 bg-slate-50 px-5 pb-6 pt-4" style={{ gridTemplateColumns: `repeat(${per}, 1.25rem)` }}>
        {dots.map((col, i) => <span key={i} className="h-5 w-5 rounded-full border border-black/20" style={{ background: col }} />)}
      </div>
      <p className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm font-semibold">
        {v.groups.map((g) => (
          <span key={g.label} className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border border-black/20" style={{ background: g.color }} />{g.label}: {g.count}</span>
        ))}
      </p>
    </div>
  );
}

function Bar({ v }: { v: V<"bar"> }) {
  const W = 340, L = 10, R = W - 10, x = L + v.p * (R - L);
  return (
    <svg viewBox={`0 0 ${W} 112`} className="mx-auto w-full max-w-lg" role="img" aria-label={chance8VisualSpeech(v)}>
      <rect x={L} y={30} width={x - L} height={40} fill="#c4b5fd" stroke={INK} />
      <rect x={x} y={30} width={R - x} height={40} fill={v.hideNot ? "#f8fafc" : "#e2e8f0"} stroke={INK} strokeDasharray={v.hideNot ? "5 4" : undefined} />
      <text x={(L + x) / 2} y={22} textAnchor="middle" fontSize={13} fill={INK} fontWeight={700}>{v.event}</text>
      <text x={(L + x) / 2} y={56} textAnchor="middle" fontSize={15} fill={INK} fontWeight={700}>{v.pText}</text>
      <text x={(x + R) / 2} y={22} textAnchor="middle" fontSize={13} fill={INK} fontWeight={700}>Not {v.event}</text>
      <text x={(x + R) / 2} y={56} textAnchor="middle" fontSize={15} fill={INK} fontWeight={700}>{v.hideNot ? "?" : v.notText}</text>
      <text x={L} y={92} fontSize={13} fill={MUTED}>0</text>
      <text x={R} y={92} fontSize={13} fill={MUTED} textAnchor="end">1</text>
    </svg>
  );
}

function Tree({ v }: { v: V<"tree"> }) {
  const n = v.first.length * v.second.length, row = 34, H = Math.max(160, n * row + 44), W = 380;
  const ys = Array.from({ length: n }, (_, i) => 40 + i * row + row / 2 - 4);
  const hi = new Set(v.highlight ?? []);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-lg" role="img" aria-label={chance8VisualSpeech(v)}>
      <g fontSize={13} fill={MUTED} textAnchor="middle"><text x={120} y={20}>{v.firstLabel}</text><text x={238} y={20}>{v.secondLabel}</text><text x={330} y={20}>Outcome</text></g>
      {v.first.map((a, i) => {
        const idx = v.second.map((_, j) => i * v.second.length + j), y = idx.reduce((s, k) => s + ys[k], 0) / idx.length;
        return (
          <g key={a + i}>
            <path d={`M24 ${(ys[0] + ys[n - 1]) / 2}L96 ${y}`} stroke={EDGE} strokeWidth={2} />
            <rect x={96} y={y - 13} width={48} height={26} rx={7} fill="#ede9fe" />
            <text x={120} y={y + 5} textAnchor="middle" fontSize={14} fontWeight={700} fill={INK}>{a}</text>
            {v.second.map((b, j) => {
              const end = ys[idx[j]], key = `${a}, ${b}`, on = hi.has(key);
              return (
                <g key={b + j}>
                  <path d={`M144 ${y}L214 ${end}`} stroke={on ? HI_EDGE : EDGE} strokeWidth={on ? 3 : 2} />
                  <rect x={214} y={end - 13} width={48} height={26} rx={7} fill="#fce7f3" />
                  <text x={238} y={end + 5} textAnchor="middle" fontSize={14} fontWeight={700} fill={INK}>{b}</text>
                  {on && <rect x={286} y={end - 13} width={88} height={26} rx={7} fill={HI} stroke={HI_EDGE} />}
                  <text x={330} y={end + 5} textAnchor="middle" fontSize={14} fill={INK}>{key}</text>
                </g>
              );
            })}
          </g>
        );
      })}
      <circle cx={24} cy={(ys[0] + ys[n - 1]) / 2} r={5} fill={INK} />
    </svg>
  );
}

function Venn({ v }: { v: V<"venn"> }) {
  const on = new Set<VennRegion>(v.shade ?? []), id = `vc${v.counts.join("")}`;
  const A = { cx: 150, cy: 128, r: 86 }, B = { cx: 250, cy: 128, r: 86 };
  return (
    <svg viewBox="0 0 400 252" className="mx-auto w-full max-w-lg" role="img" aria-label={chance8VisualSpeech(v)}>
      <defs>
        <clipPath id={`${id}a`}><circle {...A} /></clipPath>
        <mask id={`${id}na`}><rect width={400} height={252} fill="#fff" /><circle {...A} fill="#000" /></mask>
        <mask id={`${id}nb`}><rect width={400} height={252} fill="#fff" /><circle {...B} fill="#000" /></mask>
        <mask id={`${id}n`}><rect width={400} height={252} fill="#fff" /><circle {...A} fill="#000" /><circle {...B} fill="#000" /></mask>
      </defs>
      <rect x={4} y={4} width={392} height={244} rx={10} fill={on.has("neither") ? HI : "#fff"} stroke={EDGE} strokeWidth={2} mask={on.has("neither") ? `url(#${id}n)` : undefined} />
      {on.has("neither") && <rect x={4} y={4} width={392} height={244} rx={10} fill="none" stroke={EDGE} strokeWidth={2} />}
      <circle {...A} fill={on.has("a") ? HI : "#e0f2fe"} mask={`url(#${id}nb)`} />
      <circle {...B} fill={on.has("b") ? HI : "#fce7f3"} mask={`url(#${id}na)`} />
      <circle {...B} fill={on.has("both") ? HI : "#ede9fe"} clipPath={`url(#${id}a)`} />
      <circle {...A} fill="none" stroke="#0369a1" strokeWidth={2} />
      <circle {...B} fill="none" stroke="#be185d" strokeWidth={2} />
      <g textAnchor="middle" fill={INK} fontWeight={700}>
        <text x={118} y={30} fontSize={15}>{v.labels[0]}</text>
        <text x={282} y={30} fontSize={15}>{v.labels[1]}</text>
        <text x={112} y={136} fontSize={24}>{v.counts[0]}</text>
        <text x={200} y={136} fontSize={24}>{v.counts[1]}</text>
        <text x={288} y={136} fontSize={24}>{v.counts[2]}</text>
        <text x={352} y={234} fontSize={18}>{v.counts[3]}</text>
      </g>
    </svg>
  );
}

function Grid({ v }: { v: V<"grid"> }) {
  const key = (r: number, c: number) => `${r},${c}`;
  const hi = new Set((v.highlight ?? []).map(([r, c]) => key(r, c))), crossed = new Set((v.crossed ?? []).map(([r, c]) => key(r, c)));
  return (
    <div role="img" aria-label={chance8VisualSpeech(v)} className="overflow-x-auto">
      <p className="mb-1 text-center text-sm text-slate-600">Rows: <b>{v.rowLabel}</b> · Columns: <b>{v.colLabel}</b></p>
      <table className="mx-auto border-collapse text-center text-sm tabular-nums">
        <thead>
          <tr><th aria-hidden />{v.cols.map((c, j) => <th key={j} className="min-w-[2.6rem] p-1.5 font-bold text-violet-800">{c}</th>)}</tr>
        </thead>
        <tbody>
          {v.rows.map((rw, i) => (
            <tr key={i}>
              <th className="p-1.5 pr-2 font-bold text-violet-800">{rw}</th>
              {v.cols.map((_, j) => {
                const k = key(i, j), x = crossed.has(k);
                return (
                  <td key={j} className={`relative border border-slate-300 p-1.5 ${hi.has(k) ? "bg-amber-200 font-bold" : x ? "bg-slate-100 text-slate-400" : "bg-white"}`}>
                    {v.hidden || x ? "" : gridCell(v, i, j)}
                    {x && <span aria-hidden className="absolute inset-0 flex items-center justify-center text-lg text-slate-500">✕</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ChanceVisual({ visual }: { visual: Chance8Visual }) {
  return (
    <div className="rounded-xl border border-violet-300 bg-white p-4 text-slate-900">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="font-bold">{visual.title}</p>
        <ReadAloudBtn text={chance8VisualSpeech(visual)} label="Read diagram" />
      </div>
      {visual.kind === "spinner" && <Spinner v={visual} />}
      {visual.kind === "bag" && <Bag v={visual} />}
      {visual.kind === "bar" && <Bar v={visual} />}
      {visual.kind === "tree" && <Tree v={visual} />}
      {visual.kind === "venn" && <Venn v={visual} />}
      {visual.kind === "grid" && <Grid v={visual} />}
    </div>
  );
}
