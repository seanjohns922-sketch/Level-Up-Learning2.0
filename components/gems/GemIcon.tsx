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

export const GEM_RARITY: Record<GemRarity, { light: string; mid: string; dark: string; glow: string }> = {
  common: { light: "#e2e8f0", mid: "#94a3b8", dark: "#475569", glow: "rgba(148,163,184,0.0)" },
  uncommon: { light: "#bbf7d0", mid: "#22c55e", dark: "#15803d", glow: "rgba(34,197,94,0.35)" },
  rare: { light: "#bae6fd", mid: "#0ea5e9", dark: "#075985", glow: "rgba(14,165,233,0.5)" },
  epic: { light: "#e9d5ff", mid: "#a855f7", dark: "#6b21a8", glow: "rgba(168,85,247,0.55)" },
  legendary: { light: "#fde68a", mid: "#f59e0b", dark: "#b45309", glow: "rgba(245,158,11,0.65)" },
};

type FacetTone = "light" | "mid" | "dark";
type GemGeometry = {
  outline: string;
  facets: Array<{ d: string; tone: FacetTone; opacity: number }>;
  lines?: string[];
  glint: string;
};

const CUTS: Record<GemCut, GemGeometry> = {
  round: {
    outline: "M22 9 H42 L54 24 L32 57 L10 24 Z",
    facets: [
      { d: "M10 24 L22 9 L26 24 Z", tone: "light", opacity: 0.72 },
      { d: "M26 24 H38 L32 57 Z", tone: "dark", opacity: 0.42 },
      { d: "M38 24 L42 9 L54 24 Z", tone: "mid", opacity: 0.5 },
    ],
    lines: ["M10 24 H54", "M22 9 L26 24 L32 57", "M42 9 L38 24 L32 57"],
    glint: "M20 16 L24 12 M18 20 L18.5 19.5",
  },
  emerald: {
    outline: "M19 11 H45 L53 19 V45 L45 53 H19 L11 45 V19 Z",
    facets: [
      { d: "M19 11 H45 L40 18 H24 Z", tone: "light", opacity: 0.68 },
      { d: "M40 18 H53 V45 L40 39 Z", tone: "dark", opacity: 0.35 },
      { d: "M24 39 H40 L45 53 H19 Z", tone: "mid", opacity: 0.38 },
    ],
    lines: ["M24 18 H40 V39 H24 Z", "M11 19 L24 18 L19 11", "M53 45 L40 39 L45 53"],
    glint: "M19 22 V18 H25",
  },
  marquise: {
    outline: "M32 6 Q52 32 32 58 Q12 32 32 6 Z",
    facets: [
      { d: "M32 6 L32 32 L17 27 Z", tone: "light", opacity: 0.62 },
      { d: "M32 32 L47 27 L32 58 Z", tone: "dark", opacity: 0.42 },
      { d: "M17 27 L32 32 L32 58 Z", tone: "mid", opacity: 0.34 },
    ],
    lines: ["M32 6 V58", "M17 27 L32 32 L47 27"],
    glint: "M27 15 Q24 18 22 22",
  },
  pear: {
    outline: "M32 7 Q49 22 48 39 Q48 57 32 57 Q16 57 16 39 Q15 22 32 7 Z",
    facets: [
      { d: "M32 7 L31 30 L17 35 Q18 20 32 7 Z", tone: "light", opacity: 0.68 },
      { d: "M31 30 L48 35 Q50 51 32 57 Z", tone: "dark", opacity: 0.38 },
      { d: "M17 35 L31 30 L32 57 Q16 57 17 35 Z", tone: "mid", opacity: 0.35 },
    ],
    lines: ["M32 7 L31 30 L32 57", "M17 35 L31 30 L48 35"],
    glint: "M26 17 Q22 21 21 26",
  },
  heart: {
    outline: "M32 19 Q24 6 15 15 Q6 25 32 53 Q58 25 49 15 Q40 6 32 19 Z",
    facets: [
      { d: "M32 19 L15 15 Q7 23 18 35 Z", tone: "light", opacity: 0.66 },
      { d: "M32 19 L49 15 Q57 24 44 36 Z", tone: "dark", opacity: 0.36 },
      { d: "M18 35 L32 19 L44 36 L32 53 Z", tone: "mid", opacity: 0.38 },
    ],
    lines: ["M32 19 V53", "M18 35 L32 19 L44 36"],
    glint: "M16 20 Q14 23 15 26",
  },
  trillion: {
    outline: "M32 8 L57 53 H7 Z",
    facets: [
      { d: "M32 8 L27 38 L7 53 Z", tone: "light", opacity: 0.62 },
      { d: "M32 8 L57 53 L37 38 Z", tone: "dark", opacity: 0.42 },
      { d: "M27 38 H37 L57 53 H7 Z", tone: "mid", opacity: 0.38 },
    ],
    lines: ["M32 8 L27 38 H37 Z", "M27 38 L7 53", "M37 38 L57 53"],
    glint: "M27 19 L23 27",
  },
  hexagon: {
    outline: "M32 6 L54 19 V45 L32 58 L10 45 V19 Z",
    facets: [
      { d: "M32 6 L32 31 L10 19 Z", tone: "light", opacity: 0.62 },
      { d: "M32 31 L54 19 V45 L32 44 Z", tone: "dark", opacity: 0.38 },
      { d: "M10 45 L32 31 L32 58 Z", tone: "mid", opacity: 0.35 },
    ],
    lines: ["M10 19 L32 31 L54 19", "M10 45 L32 44 L54 45", "M32 6 V58"],
    glint: "M20 19 L25 13",
  },
  cushion: {
    outline: "M18 11 H46 Q53 11 53 18 V46 Q53 53 46 53 H18 Q11 53 11 46 V18 Q11 11 18 11 Z",
    facets: [
      { d: "M18 11 H46 L39 20 H20 Z", tone: "light", opacity: 0.64 },
      { d: "M39 20 L53 18 V46 L39 40 Z", tone: "dark", opacity: 0.35 },
      { d: "M20 40 H39 L46 53 H18 Z", tone: "mid", opacity: 0.36 },
    ],
    lines: ["M20 20 H39 V40 H20 Z", "M11 18 L20 20 L18 11", "M53 46 L39 40 L46 53"],
    glint: "M19 21 Q19 17 24 17",
  },
  cluster: {
    outline: "M20 30 L14 20 L22 24 L26 10 L32 26 L40 8 L44 26 L52 22 L46 34 L44 56 H22 Z",
    facets: [
      { d: "M14 20 L26 10 L32 34 L20 30 Z", tone: "light", opacity: 0.68 },
      { d: "M40 8 L52 22 L40 35 L32 34 Z", tone: "dark", opacity: 0.38 },
      { d: "M20 30 L32 34 L44 26 L44 56 H22 Z", tone: "mid", opacity: 0.38 },
      { d: "M26 10 L32 26 L40 8 L32 34 Z", tone: "light", opacity: 0.3 },
    ],
    lines: ["M20 30 L32 34 L44 26", "M32 26 V34 L33 56"],
    glint: "M25 17 L27 12 M20 25 L21 23",
  },
};

const ALL_CUTS = Object.keys(CUTS) as GemCut[];

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function cutForGem(id: string, rarity: GemRarity): GemCut {
  const hash = stableHash(`${rarity}:${id}`);
  if (rarity === "legendary") return (["cluster", "heart"] as const)[hash % 2];
  if (rarity === "epic") return (["marquise", "pear"] as const)[hash % 2];
  return ALL_CUTS[hash % ALL_CUTS.length];
}

export default function GemIcon({
  rarity,
  cut = "round",
  locked = false,
  size = 68,
}: {
  rarity: GemRarity;
  cut?: GemCut;
  locked?: boolean;
  size?: number;
}) {
  const c = GEM_RARITY[rarity];
  const geometry = CUTS[cut];
  const reactId = useId().replace(/:/g, "");
  const gradientId = `gem-gradient-${reactId}`;
  const clipId = `gem-clip-${reactId}`;

  if (locked) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <path d={geometry.outline} fill="#26324a" stroke="#3a4a68" strokeWidth="1.25" strokeLinejoin="round" />
        <path d={geometry.facets[0]?.d} fill="#2f3d59" opacity="0.9" />
        {(geometry.lines ?? []).map((line, index) => (
          <path key={index} d={line} fill="none" stroke="#465675" strokeWidth="0.75" opacity="0.42" />
        ))}
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      style={{ filter: `drop-shadow(0 5px 10px ${c.glow})` }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.light} />
          <stop offset="52%" stopColor={c.mid} />
          <stop offset="100%" stopColor={c.dark} />
        </linearGradient>
        <clipPath id={clipId}>
          <path d={geometry.outline} />
        </clipPath>
      </defs>

      <path d={geometry.outline} fill={`url(#${gradientId})`} stroke={c.dark} strokeWidth="1.25" strokeLinejoin="round" />
      <g clipPath={`url(#${clipId})`}>
        {geometry.facets.map((facet, index) => (
          <path key={index} d={facet.d} fill={c[facet.tone]} opacity={facet.opacity} />
        ))}
        {(geometry.lines ?? []).map((line, index) => (
          <path key={index} d={line} fill="none" stroke={c.light} strokeWidth="0.8" opacity="0.46" />
        ))}
      </g>
      <path d={geometry.glint} fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.82" />
    </svg>
  );
}
