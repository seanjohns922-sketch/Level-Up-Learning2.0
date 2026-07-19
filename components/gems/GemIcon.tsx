import type { GemRarity } from "@/lib/gems";

// Procedural, art-free gem: a faceted brilliant cut tinted by rarity. Shared by
// the Gem Vault, the reveal overlay and the My Home pedestal.
export const GEM_RARITY: Record<GemRarity, { light: string; mid: string; dark: string; glow: string }> = {
  common: { light: "#e2e8f0", mid: "#94a3b8", dark: "#475569", glow: "rgba(148,163,184,0.0)" },
  uncommon: { light: "#bbf7d0", mid: "#22c55e", dark: "#15803d", glow: "rgba(34,197,94,0.35)" },
  rare: { light: "#bae6fd", mid: "#0ea5e9", dark: "#075985", glow: "rgba(14,165,233,0.5)" },
  epic: { light: "#e9d5ff", mid: "#a855f7", dark: "#6b21a8", glow: "rgba(168,85,247,0.55)" },
  legendary: { light: "#fde68a", mid: "#f59e0b", dark: "#b45309", glow: "rgba(245,158,11,0.65)" },
};

export default function GemIcon({ rarity, locked, size = 68 }: { rarity: GemRarity; locked?: boolean; size?: number }) {
  const c = GEM_RARITY[rarity];
  const id = `gem-${rarity}-${locked ? "l" : "u"}`;
  const h = Math.round((size * 56) / 48);
  if (locked) {
    return (
      <svg width={size} height={h} viewBox="0 0 48 56" aria-hidden="true">
        <path d="M17 3 H31 L45 17 V21 L24 53 L3 21 V17 Z" fill="#26324a" stroke="#3a4a68" strokeWidth="1" />
        <path d="M17 3 H31 L37 17 H11 Z" fill="#2f3d59" />
      </svg>
    );
  }
  return (
    <svg width={size} height={h} viewBox="0 0 48 56" style={{ filter: `drop-shadow(0 4px 10px ${c.glow})` }} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.light} />
          <stop offset="100%" stopColor={c.mid} />
        </linearGradient>
      </defs>
      <path d="M17 3 H31 L45 17 V21 L24 53 L3 21 V17 Z" fill={`url(#${id})`} stroke={c.dark} strokeWidth="1" />
      <path d="M17 3 H31 L37 17 H11 Z" fill={c.light} opacity="0.85" />
      <path d="M11 17 H24 L24 53 Z" fill={c.mid} opacity="0.55" />
      <path d="M24 17 H37 L24 53 Z" fill={c.dark} opacity="0.45" />
      <path d="M3 17 L11 17 L17 3 Z" fill={c.mid} opacity="0.5" />
      <path d="M45 17 L37 17 L31 3 Z" fill={c.dark} opacity="0.4" />
      <path d="M20 7 H28" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
