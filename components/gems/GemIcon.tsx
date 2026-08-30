import { useId } from "react";
import type { GemRarity } from "@/lib/gems";

export type GemCut =
  | "round"
  | "emerald"
  | "marquise"
  | "pear"
  | "heart"
  | "trillion"
  | "hexagon"
  | "cushion"
  | "cluster";

// Optional etched emblem on the table — gives each gem an identity beyond colour.
export type GemEmblem = "number" | "measure" | "space" | "stats" | "reading" | "streak" | "perfect" | "explorer";

// Kept for the rest of the UI, which colour-codes rarity from these hex values.
export const GEM_RARITY: Record<GemRarity, { light: string; mid: string; dark: string; glow: string }> = {
  common: { light: "#e2e8f0", mid: "#94a3b8", dark: "#475569", glow: "rgba(148,163,184,0.0)" },
  uncommon: { light: "#bbf7d0", mid: "#22c55e", dark: "#15803d", glow: "rgba(34,197,94,0.35)" },
  rare: { light: "#bae6fd", mid: "#0ea5e9", dark: "#075985", glow: "rgba(14,165,233,0.5)" },
  epic: { light: "#e9d5ff", mid: "#a855f7", dark: "#6b21a8", glow: "rgba(168,85,247,0.55)" },
  legendary: { light: "#fde68a", mid: "#f59e0b", dark: "#b45309", glow: "rgba(245,158,11,0.65)" },
};

// Base hue/saturation per rarity, tuned to give real light play across facets.
// Epic and legendary carry "fire" (dispersion flecks); common is near-grey.
const RARITY_HSL: Record<GemRarity, { h: number; s: number; fire: boolean }> = {
  common: { h: 218, s: 13, fire: false },
  uncommon: { h: 145, s: 60, fire: false },
  rare: { h: 200, s: 72, fire: false },
  epic: { h: 273, s: 64, fire: true },
  legendary: { h: 43, s: 80, fire: true },
};

// Each cut is one radial brilliant engine, varied by girdle sides, table sides
// and vertical stretch — so the family shares a premium finish but keeps shape.
const CUT_CFG: Record<GemCut, { sides: number; table: number; stretch: number }> = {
  round: { sides: 16, table: 8, stretch: 1 },
  cushion: { sides: 16, table: 8, stretch: 1 },
  hexagon: { sides: 12, table: 6, stretch: 1 },
  trillion: { sides: 9, table: 3, stretch: 1 },
  emerald: { sides: 8, table: 8, stretch: 1.18 },
  marquise: { sides: 16, table: 8, stretch: 1.5 },
  pear: { sides: 16, table: 8, stretch: 1.28 },
  heart: { sides: 16, table: 8, stretch: 1 },
  cluster: { sides: 16, table: 8, stretch: 1 },
};

const ALL_CUTS = Object.keys(CUT_CFG) as GemCut[];

const EMBLEM: Record<GemEmblem, string> = {
  number: "M-4 3 L-1.5 -3.5 M-3 0 H0.5 M1 3 L3.5 -3.5 M2.2 0 H5",
  measure: "M-5 -2.6 H5 V2.6 H-5 Z M-2.6 -2.6 V-0.4 M0 -2.6 V0.9 M2.6 -2.6 V-0.4",
  space: "M0 -5 L1.3 -1.3 L5 -1.3 L2 1 L3 4.8 L0 2.5 L-3 4.8 L-2 1 L-5 -1.3 L-1.3 -1.3 Z",
  stats: "M-4.5 3.5 V-0.5 H-2 V3.5 M-0.5 3.5 V-3 H2 V3.5 M3.5 3.5 V-1.6 H5",
  reading: "M0 -3.4 C-2.2 -4.7 -4.8 -4.3 -5.2 -3.4 V3.4 C-4.8 2.5 -2.2 2.1 0 3.4 C2.2 2.1 4.8 2.5 5.2 3.4 V-3.4 C4.8 -4.3 2.2 -4.7 0 -3.4 Z M0 -3.4 V3.4",
  streak: "M0.6 -5 L-3 1 H-0.2 L-1.2 5 L3.4 -1 H0.2 Z",
  perfect: "M-4 0 L-1.4 2.4 L4 -3",
  explorer: "M0 -5 L1.2 -1.4 M0 5 L-1.2 1.4 M-5 0 L-1.4 -1.2 M5 0 L1.4 1.2 M0 0 m-1.6 0 a1.6 1.6 0 1 0 3.2 0 a1.6 1.6 0 1 0 -3.2 0",
};

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// Map a gem's realm (or, for global gems, its milestone) to an etched emblem so
// each gem is identifiable at a glance — the core of a collectible line.
export function emblemForGem(realmId: string | null | undefined, milestoneType?: string): GemEmblem | undefined {
  switch (realmId) {
    case "number": return "number";
    case "measurement": return "measure";
    case "space": return "space";
    case "statistics": return "stats";
    case "reading":
    case "writing":
    case "grammar": return "reading";
  }
  switch (milestoneType) {
    case "perfect": return "perfect";
    case "streaks_xp": return "streak";
    case "explorer": return "explorer";
    case "quizzes_tests": return "perfect";
    case "lessons": return "number";
    default: return undefined;
  }
}

export function cutForGem(id: string, rarity: GemRarity): GemCut {
  const hash = stableHash(`${rarity}:${id}`);
  if (rarity === "legendary") return (["cluster", "heart"] as const)[hash % 2];
  if (rarity === "epic") return (["marquise", "pear"] as const)[hash % 2];
  return ALL_CUTS[hash % ALL_CUTS.length];
}

const TAU = Math.PI * 2;
type Pt = [number, number];
const ptsStr = (pts: Pt[]) => pts.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ");
const centroid = (pts: Pt[]): Pt => [
  pts.reduce((s, p) => s + p[0], 0) / pts.length,
  pts.reduce((s, p) => s + p[1], 0) / pts.length,
];

export default function GemIcon({
  rarity,
  cut = "round",
  locked = false,
  size = 68,
  emblem,
}: {
  rarity: GemRarity;
  cut?: GemCut;
  locked?: boolean;
  size?: number;
  emblem?: GemEmblem;
}) {
  const reactId = useId().replace(/:/g, "");
  const cfg = CUT_CFG[cut] ?? CUT_CFG.round;
  const cx = 32;
  const cy = 32;
  const stretch = cfg.stretch;
  const R = Math.min(26, 28 / stretch);
  const rT = R * 0.44;
  const k = Math.max(1, Math.round(cfg.sides / cfg.table));
  const light = -Math.PI * 0.72;

  const at = (ang: number, r: number): Pt => [cx + r * Math.cos(ang), cy + r * Math.sin(ang) * stretch];
  const T: Pt[] = Array.from({ length: cfg.table }, (_, i) => at(-Math.PI / 2 + (i / cfg.table) * TAU, rT));
  const G: Pt[] = Array.from({ length: cfg.sides }, (_, i) => at(-Math.PI / 2 + (i / cfg.sides) * TAU, R));

  const base = RARITY_HSL[rarity];
  const fire = base.fire && !locked;

  // Build the crown facets by fanning each table edge out to its girdle arc.
  type Facet = { pts: Pt[]; fill: string; stroke: string };
  const facets: Facet[] = [];
  const shade = (pts: Pt[], dl: number, hueShift = 0, sat = base.s) => {
    const c = centroid(pts);
    const ang = Math.atan2(c[1] - cy, c[0] - cx);
    const face = Math.cos(ang - light);
    let L = 47 + 21 * face + dl;
    L = Math.max(20, Math.min(84, L));
    if (locked) {
      return { pts, fill: `hsl(222 18% ${Math.max(16, L * 0.34)}%)`, stroke: "hsl(222 20% 30%)" };
    }
    return {
      pts,
      fill: `hsl(${((base.h + hueShift) % 360 + 360) % 360} ${sat}% ${L}%)`,
      stroke: `hsl(${base.h} ${sat}% ${Math.max(12, L - 24)}%)`,
    };
  };

  for (let i = 0; i < cfg.table; i += 1) {
    const Ti = T[i]!;
    const Tn = T[(i + 1) % cfg.table]!;
    const gStart = i * k;
    const mid = gStart + Math.floor(k / 2);
    const gEnd = (i + 1) * k;
    const f = fire && i % 3 === 0;
    for (let j = gStart; j < mid; j += 1) {
      facets.push(shade([Ti, G[j % cfg.sides]!, G[(j + 1) % cfg.sides]!], -5, f ? -52 : 0, f ? 90 : base.s));
    }
    for (let j = mid; j < gEnd; j += 1) {
      facets.push(shade([Tn, G[j % cfg.sides]!, G[(j + 1) % cfg.sides]!], -6, f ? 54 : 0, f ? 90 : base.s));
    }
    facets.push(shade([Ti, G[mid % cfg.sides]!, Tn], 7));
  }

  const tableFill = locked ? "hsl(222 18% 26%)" : `hsl(${base.h} ${Math.max(6, base.s - 8)}% 74%)`;
  const tableStroke = locked ? "hsl(222 20% 32%)" : `hsl(${base.h} ${base.s}% 40%)`;
  const glow = locked ? "none" : `drop-shadow(0 4px 9px ${GEM_RARITY[rarity].glow})`;

  const sparkR = R * 0.14;

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ filter: glow }} aria-hidden="true">
      <defs>
        <clipPath id={`clip-${reactId}`}>
          <polygon points={ptsStr(G)} />
        </clipPath>
        <filter id={`soft-${reactId}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.1" />
        </filter>
      </defs>

      {/* girdle silhouette */}
      <polygon points={ptsStr(G)} fill={tableFill} stroke={tableStroke} strokeWidth="0.9" strokeLinejoin="round" />

      {/* crown facets */}
      <g clipPath={`url(#clip-${reactId})`}>
        {facets.map((f, i) => (
          <polygon key={i} points={ptsStr(f.pts)} fill={f.fill} stroke={f.stroke} strokeWidth="0.3" />
        ))}
        {/* table */}
        <polygon points={ptsStr(T)} fill={tableFill} stroke={tableStroke} strokeWidth="0.4" opacity={locked ? 0.9 : 1} />

        {!locked && (
          <>
            {/* table highlight + culet sparkle */}
            <circle cx={cx - R * 0.16} cy={cy - R * 0.14 * stretch} r={sparkR} fill="#fff" opacity="0.85" filter={`url(#soft-${reactId})`} />
            <circle cx={cx} cy={cy} r={R * 0.05} fill="#fff" opacity="0.9" />
            {/* slow specular sheen edge */}
            <ellipse cx={cx} cy={cy} rx={R * 0.34} ry={R * 0.95 * stretch} fill="#fff" opacity="0.07" transform={`rotate(26 ${cx} ${cy})`} />
          </>
        )}

        {emblem && (
          <g transform={`translate(${cx} ${cy}) scale(${(R / 26) * 0.9})`} opacity={locked ? 0.12 : 0.2}>
            <path d={EMBLEM[emblem]} fill={emblem === "space" ? "#fff" : "none"} stroke={emblem === "space" ? "none" : "#fff"} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
      </g>
    </svg>
  );
}
