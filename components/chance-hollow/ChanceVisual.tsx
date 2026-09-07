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

function Spinner({ wedges }: { wedges: string[] }) {
  const n = Math.max(wedges.length, 1);
  const cx = 70;
  const cy = 70;
  const r = 58;
  const slice = (2 * Math.PI) / n;
  return (
    <svg viewBox="0 0 140 152" width="150" height="163" role="img" aria-label="Spinner">
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

function Coin({ face }: { face?: "heads" | "tails" }) {
  const label = face === "tails" ? "T" : "H";
  return (
    <svg viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="Coin">
      <circle cx={60} cy={60} r={50} fill="#f4c542" stroke="#b8860b" strokeWidth={4} />
      <circle cx={60} cy={60} r={40} fill="none" stroke="#d9a521" strokeWidth={3} />
      <text x={60} y={78} textAnchor="middle" fontSize={46} fontWeight={900} fill="#7a5b12">{label}</text>
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
  { key: "likely", label: "Likely", colour: "#84cc16" },
  { key: "certain", label: "Certain", colour: "#16a34a" },
];

function Scale({ highlight }: { highlight?: string }) {
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
    </svg>
  );
}

export default function ChanceVisual({ visual }: { visual: ChanceVisualData }) {
  const legend =
    visual.type === "spinner"
      ? countByColour(visual.wedges)
      : visual.type === "bag"
        ? countByColour(visual.counters)
        : null;
  return (
    <div className="mb-4 flex flex-col items-center gap-2 rounded-xl border border-[#e4d8f5] bg-[#faf7ff] p-4">
      {visual.type === "spinner" && <Spinner wedges={visual.wedges} />}
      {visual.type === "coin" && <Coin face={visual.face} />}
      {visual.type === "die" && <Die face={visual.face} />}
      {visual.type === "bag" && <Bag counters={visual.counters} />}
      {visual.type === "scale" && <Scale highlight={visual.highlight} />}
      {legend && legend.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {legend.map(([colour, n]) => (
            <span key={colour} className="inline-flex items-center gap-1.5 text-sm font-bold text-[#3a2f52]">
              <span className="inline-block h-3.5 w-3.5 rounded-full border border-white" style={{ background: colour }} />
              {n}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
