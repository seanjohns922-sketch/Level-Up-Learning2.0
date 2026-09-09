"use client";

import type { ChanceVisual as ChanceVisualData } from "@/data/activities/year1/practice-task";

// Procedural SVG apparatus for Chance Hollow questions: a spinner, coin, die,
// bag of counters, or a likelihood scale. Drawn above the mcq options so the
// probability question shows the real tool it is about instead of plain text.

const FRAME = "#6d3f9c"; // Chance Hollow violet
const FRAME_SOFT = "#efe7fb";
const INK = "#2c2140";

function countByColour(colours: string[]) {
  const map = new Map<string, number>();
  for (const c of colours) map.set(c, (map.get(c) ?? 0) + 1);
  return [...map.entries()];
}

function Spinner({ wedges, large = false }: { wedges: string[]; large?: boolean }) {
  const n = Math.max(wedges.length, 1);
  const cx = 70;
  const cy = 70;
  const r = 58;
  const slice = (2 * Math.PI) / n;
  return (
    <svg
      viewBox="0 0 140 152"
      width={large ? 190 : 150}
      height={large ? 206 : 163}
      role="img"
      aria-label="Spinner"
    >
      {wedges.map((colour, i) => {
        const a0 = i * slice - Math.PI / 2;
        const a1 = a0 + slice;
        const x0 = cx + r * Math.cos(a0);
        const y0 = cy + r * Math.sin(a0);
        const x1 = cx + r * Math.cos(a1);
        const y1 = cy + r * Math.sin(a1);
        const large = slice > Math.PI ? 1 : 0;
        return (
          <path
            key={i}
            d={`M ${cx} ${cy} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`}
            fill={colour}
            stroke="#ffffff"
            strokeWidth={2}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={FRAME} strokeWidth={3} />
      {/* pointer */}
      <path d={`M ${cx} ${cy - r - 6} l -8 14 l 16 0 z`} fill={INK} />
      <circle cx={cx} cy={cy} r={7} fill={INK} />
    </svg>
  );
}

// A single 3D coin: a tilted disc with a gold rim showing its thickness.
function coinDisc(cx: number, cy: number, letter: string, key: string) {
  const rx = 42, ry = 35, t = 10;
  return (
    <g key={key}>
      <ellipse cx={cx} cy={cy + t} rx={rx} ry={ry} fill="#b8860b" />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#f4c542" stroke="#b8860b" strokeWidth={3} />
      <ellipse cx={cx} cy={cy} rx={rx - 7} ry={ry - 7} fill="none" stroke="#d9a521" strokeWidth={2.5} />
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize={40} fontWeight={900} fill="#7a5b12">{letter}</text>
    </g>
  );
}

// Two 3D coins side by side — heads and tails — so a coin reads as a two-sided
// object with both outcomes on show. The given face is shown first.
function Coin({ face }: { face?: "heads" | "tails" }) {
  const primary = face === "tails" ? "T" : "H";
  const secondary = primary === "T" ? "H" : "T";
  return (
    <svg viewBox="0 0 210 116" width="200" height="110" role="img" aria-label="Coin — heads or tails">
      {coinDisc(58, 45, primary, "a")}
      {coinDisc(152, 45, secondary, "b")}
    </svg>
  );
}

const PIP_LAYOUT: Record<number, ReadonlyArray<[number, number]>> = {
  1: [[0.5, 0.5]],
  2: [[0.28, 0.28], [0.72, 0.72]],
  3: [[0.28, 0.28], [0.5, 0.5], [0.72, 0.72]],
  4: [[0.3, 0.3], [0.7, 0.3], [0.3, 0.7], [0.7, 0.7]],
  5: [[0.3, 0.3], [0.7, 0.3], [0.5, 0.5], [0.3, 0.7], [0.7, 0.7]],
  6: [[0.3, 0.28], [0.7, 0.28], [0.3, 0.5], [0.7, 0.5], [0.3, 0.72], [0.7, 0.72]],
};

type Vec = [number, number];
// Place a die face's pips onto a parallelogram face (origin O, edge vectors u, v)
// so the pips sit correctly on each 3D face.
function facePips(num: number, O: Vec, u: Vec, v: Vec, key: string, r = 4.6) {
  const pips = PIP_LAYOUT[Math.min(Math.max(num, 1), 6)] ?? PIP_LAYOUT[1]!;
  return pips.map(([px, py], i) => (
    <circle key={`${key}-${i}`} cx={O[0] + px * u[0] + py * v[0]} cy={O[1] + px * u[1] + py * v[1]} r={r} fill={INK} />
  ));
}

// A 3D isometric die showing three faces at once, so it reads as a six-sided
// cube rather than a flat card. `face` is shown on the top; two other numbers
// sit on the visible sides.
function Die({ face }: { face: number }) {
  const top = Math.min(Math.max(face, 1), 6);
  const [s1, s2] = [1, 2, 3, 5, 6].filter((n) => n !== top);
  // Cube vertices (isometric).
  const A: Vec = [75, 16], B: Vec = [131, 48], C: Vec = [75, 80], D: Vec = [19, 48];
  const D2: Vec = [19, 104], C2: Vec = [75, 136], B2: Vec = [131, 104];
  const sub = (p: Vec, q: Vec): Vec => [p[0] - q[0], p[1] - q[1]];
  return (
    <svg viewBox="0 0 150 152" width="140" height="142" role="img" aria-label={`Die showing ${top} on top`}>
      <polygon points={`${A} ${B} ${C} ${D}`} fill="#ffffff" stroke={FRAME} strokeWidth={2.5} strokeLinejoin="round" />
      <polygon points={`${D} ${C} ${C2} ${D2}`} fill="#e7ddf7" stroke={FRAME} strokeWidth={2.5} strokeLinejoin="round" />
      <polygon points={`${C} ${B} ${B2} ${C2}`} fill="#d6c6ef" stroke={FRAME} strokeWidth={2.5} strokeLinejoin="round" />
      {facePips(top, D, sub(A, D), sub(C, D), "top")}
      {facePips(s1!, D, sub(C, D), sub(D2, D), "left")}
      {facePips(s2!, C, sub(B, C), sub(C2, C), "right")}
    </svg>
  );
}

function DicePair({ left, right }: { left: number; right: number }) {
  return (
    <div className="flex items-center justify-center gap-2" role="img" aria-label={`Two dice showing ${left} and ${right}`}>
      <Die face={left} />
      <Die face={right} />
    </div>
  );
}

function DiceGrid({ mode, highlight }: { mode: "sum" | "difference"; highlight: number }) {
  return (
    <div className="grid grid-cols-6 gap-1" role="img" aria-label={`All two-dice ${mode} outcomes, highlighting ${highlight}`}>
      {Array.from({ length: 36 }, (_, index) => {
        const a = Math.floor(index / 6) + 1;
        const b = (index % 6) + 1;
        const value = mode === "sum" ? a + b : Math.abs(a - b);
        const active = value === highlight;
        return (
          <div key={`${a}-${b}`} className={`grid h-9 w-9 place-items-center rounded-md border text-xs font-black ${active ? "border-fuchsia-400 bg-fuchsia-500 text-white shadow-[0_0_12px_rgba(217,70,239,0.42)]" : "border-violet-200 bg-white text-violet-950"}`}>
            {a},{b}
          </div>
        );
      })}
    </div>
  );
}

function Frequency({ labels, counts, total, totalLabel }: { labels: string[]; counts: number[]; total: number; totalLabel?: string }) {
  const safeTotal = Math.max(total, 1);
  return (
    <div className="w-full max-w-md space-y-2" role="img" aria-label={`Frequency results from ${total} trials`}>
      {labels.map((label, index) => (
        <div key={`${label}-${index}`} className="grid grid-cols-[5rem_1fr_3rem] items-center gap-2 text-sm font-bold text-[#3a2f52]">
          <span className="truncate text-right">{label}</span>
          <div className="h-7 overflow-hidden rounded-md bg-violet-100">
            <div className="h-full rounded-md bg-gradient-to-r from-fuchsia-500 to-cyan-400" style={{ width: `${Math.max(8, ((counts[index] ?? 0) / safeTotal) * 100)}%` }} />
          </div>
          <span className="font-mono text-base font-black">{counts[index] ?? 0}</span>
        </div>
      ))}
      <div className="text-center text-xs font-black uppercase tracking-[0.14em] text-violet-500">{totalLabel ?? `${total} trials altogether`}</div>
    </div>
  );
}

function ExpectedObserved({
  expected,
  observed,
  total,
  eventLabel,
}: {
  expected: number;
  observed: number;
  total: number;
  eventLabel?: string;
}) {
  // Both counts live on one shared 0..total axis so the prediction and the
  // real result can be read against each other. A dotted guide line marks the
  // expected count, and the observed bar overshoots or falls short of it — that
  // gap is the "chance variation" the card is teaching.
  const safeTotal = Math.max(total, 1);
  const x0 = 116; // left edge of the plotted track
  const x1 = 386; // right edge (== total); leaves room for the end count chip
  const trackW = x1 - x0;
  const toX = (n: number) => x0 + (Math.max(0, Math.min(n, safeTotal)) / safeTotal) * trackW;
  const expX = toX(expected);
  const obsX = toX(observed);
  const diff = observed - expected;
  const diffLabel = diff === 0 ? "spot on" : `${diff > 0 ? "+" : "−"}${Math.abs(diff)}`;

  const rows: { key: string; label: string; sub: string; value: number; endX: number }[] = [
    { key: "exp", label: "Expected", sub: "predicted", value: expected, endX: expX },
    { key: "obs", label: "Observed", sub: "what happened", value: observed, endX: obsX },
  ];

  return (
    <div className="w-full max-w-md" role="img" aria-label={`Expected ${expected} versus observed ${observed} out of ${total} trials`}>
      <svg viewBox="0 0 420 168" className="w-full">
        <defs>
          <linearGradient id="eo-observed" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#e64bd8" />
            <stop offset="1" stopColor="#38d9f0" />
          </linearGradient>
        </defs>

        {/* dotted prediction guide, drawn behind the bars */}
        <line x1={expX} y1="26" x2={expX} y2="132" stroke="#7fe7ff" strokeWidth="2" strokeDasharray="3 5" opacity="0.7" />

        {rows.map((row, i) => {
          const cy = 44 + i * 52;
          const barTop = cy - 15;
          const isObserved = row.key === "obs";
          return (
            <g key={row.key}>
              <text x="14" y={cy - 2} className="fill-white" fontSize="15" fontWeight="800">{row.label}</text>
              <text x="14" y={cy + 15} fontSize="10.5" fontWeight="700" letterSpacing="0.5" fill="#c7b8e8" style={{ textTransform: "uppercase" }}>{row.sub}</text>
              {/* track */}
              <rect x={x0} y={barTop} width={trackW} height="30" rx="9" fill="#ffffff" opacity="0.08" />
              {/* value bar */}
              <rect
                x={x0}
                y={barTop}
                width={Math.max(6, row.endX - x0)}
                height="30"
                rx="9"
                fill={isObserved ? "url(#eo-observed)" : "none"}
                stroke={isObserved ? "none" : "#7fe7ff"}
                strokeWidth={isObserved ? 0 : 2.5}
                strokeDasharray={isObserved ? undefined : "6 5"}
              />
              {/* count chip */}
              <g transform={`translate(${row.endX + 10}, ${cy})`}>
                <circle cx="0" cy="0" r="15" fill={isObserved ? "#e64bd8" : "#0b1020"} stroke={isObserved ? "#ffffff" : "#7fe7ff"} strokeWidth="2" />
                <text x="0" y="5" textAnchor="middle" fontSize="14" fontWeight="900" fill="#ffffff">{row.value}</text>
              </g>
            </g>
          );
        })}

        {/* baseline axis */}
        <line x1={x0} y1="150" x2={x1} y2="150" stroke="#ffffff" strokeWidth="1.5" opacity="0.25" />
        <text x={x0} y="164" fontSize="11" fontWeight="800" fill="#c7b8e8">0</text>
        <text x={x1} y="164" textAnchor="end" fontSize="11" fontWeight="800" fill="#c7b8e8">{total}{eventLabel ? ` ${eventLabel}` : " trials"}</text>
      </svg>

      <div className="mt-1 flex items-center justify-center gap-2 text-center">
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-cyan-200">
          Chance variation: {diffLabel}
        </span>
      </div>
    </div>
  );
}

function Convergence({
  expected,
  samples,
  eventLabel,
}: {
  expected: number;
  samples: { trials: number; value: number }[];
  eventLabel?: string;
}) {
  // Relative frequency (y) plotted against a growing number of trials (x). A
  // dashed line marks the expected probability; the observed line swings wide
  // at small trial counts and hugs the expected line as trials grow — the
  // long-run steadying the card is teaching.
  const pts = samples.length ? samples : [{ trials: 1, value: expected }];
  const x0 = 52;
  const x1 = 388;
  const top = 20;
  const bottom = 150;
  const plotH = bottom - top;
  const stepX = pts.length > 1 ? (x1 - x0) / (pts.length - 1) : 0;
  const px = (i: number) => x0 + i * stepX;
  const py = (v: number) => top + (1 - Math.max(0, Math.min(1, v))) * plotH;
  const expY = py(expected);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${px(i)} ${py(p.value)}`).join(" ");
  const expPct = Math.round(expected * 100);

  return (
    <div className="w-full max-w-md" role="img" aria-label={`Relative frequency settling toward ${expPct}% as trials increase`}>
      <svg viewBox="0 0 420 184" className="w-full">
        <defs>
          <linearGradient id="cv-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#e64bd8" />
            <stop offset="1" stopColor="#38d9f0" />
          </linearGradient>
        </defs>

        {/* y gridlines at 0 / 50 / 100% */}
        {[0, 0.5, 1].map((g) => (
          <g key={g}>
            <line x1={x0} y1={py(g)} x2={x1} y2={py(g)} stroke="#ffffff" strokeWidth="1" opacity={g === 0 ? 0.22 : 0.08} />
            <text x={x0 - 8} y={py(g) + 4} textAnchor="end" fontSize="10" fontWeight="700" fill="#c7b8e8">{Math.round(g * 100)}%</text>
          </g>
        ))}

        {/* expected probability line */}
        <line x1={x0} y1={expY} x2={x1} y2={expY} stroke="#7fe7ff" strokeWidth="2" strokeDasharray="4 5" />
        <text x={x1} y={expY - 6} textAnchor="end" fontSize="11" fontWeight="800" fill="#7fe7ff">expected {expPct}%</text>

        {/* observed relative-frequency path */}
        <path d={line} fill="none" stroke="url(#cv-line)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => {
          const last = i === pts.length - 1;
          return (
            <g key={`${p.trials}-${i}`}>
              <circle cx={px(i)} cy={py(p.value)} r={last ? 6 : 4} fill={last ? "#38d9f0" : "#e64bd8"} stroke="#150f22" strokeWidth="2" />
              <text x={px(i)} y="168" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#c7b8e8">{p.trials}</text>
            </g>
          );
        })}
        <text x={(x0 + x1) / 2} y="182" textAnchor="middle" fontSize="9.5" fontWeight="800" letterSpacing="1" fill="#8f7fb5" style={{ textTransform: "uppercase" }}>{eventLabel ?? "trials"} →</text>
      </svg>
    </div>
  );
}

function Bag({ counters }: { counters: string[] }) {
  return (
    <svg viewBox="0 0 150 150" width="150" height="150" role="img" aria-label="Bag of counters">
      {/* sack */}
      <path d="M 30 54 Q 24 132 75 138 Q 126 132 120 54 Z" fill={FRAME_SOFT} stroke={FRAME} strokeWidth={3} />
      <path d="M 30 54 Q 75 40 120 54 L 116 44 Q 75 30 34 44 Z" fill={FRAME} />
      {/* counters, laid out in a tidy cluster inside the sack */}
      {counters.slice(0, 12).map((colour, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const cx = 48 + col * 18 + (row % 2 ? 9 : 0);
        const cy = 78 + row * 18;
        return <circle key={i} cx={cx} cy={cy} r={8} fill={colour} stroke="#ffffff" strokeWidth={1.5} />;
      })}
    </svg>
  );
}

const SCALE_STOPS: ReadonlyArray<{ key: string; label: string; colour: string }> = [
  { key: "impossible", label: "Impossible", colour: "#dc2626" },
  { key: "unlikely", label: "Unlikely", colour: "#f59e0b" },
  { key: "even", label: "Even chance", colour: "#d4a914" },
  { key: "likely", label: "Likely", colour: "#84cc16" },
  { key: "certain", label: "Certain", colour: "#16a34a" },
];

function Scale({ highlight, value }: { highlight?: string; value?: number }) {
  // Wide horizontal padding so the end labels ("Impossible", "Certain") sit
  // fully inside the viewBox instead of being clipped at the edges.
  const x0 = 52;
  const barW = 268;
  return (
    <svg viewBox="0 0 372 72" width="360" height="70" style={{ maxWidth: "100%", height: "auto" }} role="img" aria-label="Likelihood scale">
      <defs>
        <linearGradient id="chance-scale" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#dc2626" />
          <stop offset="0.4" stopColor="#f59e0b" />
          <stop offset="0.7" stopColor="#84cc16" />
          <stop offset="1" stopColor="#16a34a" />
        </linearGradient>
      </defs>
      <rect x={x0} y={20} width={barW} height={14} rx={7} fill="url(#chance-scale)" />
      {SCALE_STOPS.map((s, i) => {
        const x = x0 + (i / (SCALE_STOPS.length - 1)) * barW;
        const on = highlight === s.key;
        return (
          <g key={s.key}>
            <circle cx={x} cy={27} r={on ? 10 : 5} fill="#ffffff" stroke={s.colour} strokeWidth={on ? 4 : 2} />
            <text x={x} y={56} textAnchor="middle" fontSize={12} fontWeight={on ? 900 : 600} fill={on ? INK : "#6b6280"}>{s.label}</text>
          </g>
        );
      })}
      {typeof value === "number" ? (
        <g transform={`translate(${x0 + Math.max(0, Math.min(1, value)) * barW}, 8)`}>
          <path d="M -7 0 L 7 0 L 0 10 Z" fill={INK} />
          <text x="0" y="-2" textAnchor="middle" fontSize="10" fontWeight="900" fill={INK}>{Math.round(value * 100)}%</text>
        </g>
      ) : null}
    </svg>
  );
}

export default function ChanceVisual({
  visual,
  variant = "question",
}: {
  visual: ChanceVisualData;
  variant?: "question" | "concept";
}) {
  const concept = variant === "concept";
  const legend =
    visual.type === "spinner"
      ? countByColour(visual.wedges)
      : visual.type === "bag"
        ? countByColour(visual.counters)
        : null;
  return (
    <div
      className={concept ? "chance-visual flex flex-col items-center gap-2" : "chance-visual mb-4 flex flex-col items-center gap-2 rounded-xl border border-[#e4d8f5] bg-[#faf7ff] p-4"}
      data-chance-visual={visual.type}
    >
      {visual.type === "spinner" && <Spinner wedges={visual.wedges} large={concept} />}
      {visual.type === "coin" && <Coin face={visual.face} />}
      {visual.type === "die" && <Die face={visual.face} />}
      {visual.type === "dicePair" && <DicePair left={visual.left} right={visual.right} />}
      {visual.type === "diceGrid" && <DiceGrid mode={visual.mode} highlight={visual.highlight} />}
      {visual.type === "bag" && <Bag counters={visual.counters} />}
      {visual.type === "frequency" && <Frequency labels={visual.labels} counts={visual.counts} total={visual.total} totalLabel={visual.totalLabel} />}
      {visual.type === "expectedObserved" && <ExpectedObserved expected={visual.expected} observed={visual.observed} total={visual.total} eventLabel={visual.eventLabel} />}
      {visual.type === "convergence" && <Convergence expected={visual.expected} samples={visual.samples} eventLabel={visual.eventLabel} />}
      {visual.type === "scale" && <Scale highlight={visual.highlight} value={visual.value} />}
      {legend && legend.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {legend.map(([colour, n]) => (
            <span key={colour} className={`inline-flex items-center gap-1.5 text-sm font-bold ${concept ? "text-white/80" : "text-[#3a2f52]"}`}>
              <span className="inline-block h-3.5 w-3.5 rounded-full border border-white" style={{ background: colour }} />
              {n}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
