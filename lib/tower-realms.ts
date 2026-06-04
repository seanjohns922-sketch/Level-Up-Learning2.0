// ── Tower of Knowledge — realm segments ─────────────────────────────────────
// The Tower was shattered by the Fog of Forgetfulness, its shards scattered
// into the nine realms. Each realm is a segment of the Tower that rebuilds as
// the learner restores it (segment fills by that realm's % complete).
//
// v1 progress source: the Number realm fills from cumulative unlocked legends
// (Prep→Y6). Other realms have no per-realm progress tracking yet, so they sit
// foggy/locked — which matches the story (their shards aren't recovered yet).
// Swap in a cumulative Supabase per-realm count here later without touching UI.

import { getAllRealms } from "@/data/programs/genres";
import { readProgress } from "@/data/progress";
import { getEffectiveUnlockedLegendIds } from "@/data/legends";

export type TowerRealm = {
  id: string;
  strand: string;
  realm: string;
  hasContent: boolean;
  /** Where tapping the segment takes the learner (undefined = coming soon). */
  route?: string;
  /** 0..1 restoration of this realm's segment. */
  percent: number;
  accent: string;
  glow: string;
  emoji: string;
};

const REALM_VISUALS: Record<string, { accent: string; glow: string; emoji: string; route?: string }> = {
  number:      { accent: "#5eead4", glow: "rgba(45,212,191,0.55)",  emoji: "🔢", route: "/number-nexus" },
  measurement: { accent: "#c8a030", glow: "rgba(200,160,48,0.55)",  emoji: "📏", route: "/measurelands" },
  space:       { accent: "#60a5fa", glow: "rgba(96,165,250,0.5)",   emoji: "🧭" },
  reading:     { accent: "#86efac", glow: "rgba(134,239,172,0.5)",  emoji: "📖" },
  writing:     { accent: "#c4b5fd", glow: "rgba(196,181,253,0.5)",  emoji: "✒️" },
  grammar:     { accent: "#fda4af", glow: "rgba(253,164,175,0.5)",  emoji: "🔤" },
  statistics:  { accent: "#67e8f9", glow: "rgba(103,232,249,0.5)",  emoji: "📊" },
  algebra:     { accent: "#fbbf24", glow: "rgba(251,191,36,0.5)",   emoji: "➗" },
  probability: { accent: "#f472b6", glow: "rgba(244,114,182,0.5)",  emoji: "🎲" },
};

const FALLBACK = { accent: "#94a3b8", glow: "rgba(148,163,184,0.4)", emoji: "✦" };

/** Build the nine Tower segments with each realm's current restoration. */
export function getTowerRealms(): TowerRealm[] {
  const progress = readProgress();
  const numberFraction = Math.min(
    1,
    getEffectiveUnlockedLegendIds(progress?.year, progress?.unlockedLegends).length / 7
  );

  return getAllRealms().map((r) => {
    const v = REALM_VISUALS[r.id] ?? FALLBACK;
    // v1: only the Number realm has cross-level progress wired up.
    const percent = r.id === "number" ? numberFraction : 0;
    return {
      id: r.id,
      strand: r.strand,
      realm: r.realm,
      hasContent: r.hasContent,
      route: v.route,
      percent,
      accent: v.accent,
      glow: v.glow,
      emoji: v.emoji,
    };
  });
}

/** Overall Tower restoration (0..1) across all nine realms. */
export function getTowerRestoration(realms: TowerRealm[]): number {
  if (realms.length === 0) return 0;
  return realms.reduce((sum, r) => sum + r.percent, 0) / realms.length;
}
