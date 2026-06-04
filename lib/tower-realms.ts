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
import { readProgress, isPlacementComplete } from "@/data/progress";
import { getEffectiveUnlockedLegendIds, getLegendForYear } from "@/data/legends";
import { readProgramStore, getWeekProgress, isWeekComplete } from "@/lib/program-progress";
import { readBestChain } from "@/lib/best-chain";

const NUMBER_LEVELS = 7; // Prep → Year 6
const WEEKS_PER_LEVEL = 12;

/**
 * Real, finely-grained restoration for the Number realm (the only built realm
 * in the MVP). Blends levels passed (post-tests) with the current level's week
 * completion, so the segment ticks up every week — not just at level-end.
 * A completed placement/pre-test lights a first ember.
 */
function numberRealmPercent(): number {
  const progress = readProgress();
  const year = progress?.year ?? "Year 1";
  const effective = getEffectiveUnlockedLegendIds(year, progress?.unlockedLegends);
  const floorsDone = effective.length; // levels fully restored (post-test passed)
  const currentPassed = effective.includes(getLegendForYear(year).id);

  let weekFraction = 0;
  if (!currentPassed && typeof window !== "undefined") {
    const store = readProgramStore();
    let weeksComplete = 0;
    for (let w = 1; w <= WEEKS_PER_LEVEL; w += 1) {
      if (isWeekComplete(getWeekProgress(store, year, w))) weeksComplete += 1;
    }
    weekFraction = weeksComplete / WEEKS_PER_LEVEL;
  }

  const raw = (floorsDone + (currentPassed ? 0 : weekFraction)) / NUMBER_LEVELS;
  // Pre-test spark: a placed learner always shows a faint first ember.
  const sparked = isPlacementComplete(progress) ? Math.max(raw, 0.04) : raw;
  return Math.min(1, sparked);
}

/** Beacon brightness (0..1) — powered by the learner's best streak/chain. */
export function getTowerStreakLevel(): number {
  const progress = readProgress();
  const year = progress?.year ?? "Year 1";
  const best = readBestChain("number", year);
  return Math.max(0, Math.min(1, best / 10)); // 10 = Nexus chain = full beacon
}

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
  const numberFraction = numberRealmPercent();

  return getAllRealms().map((r) => {
    const v = REALM_VISUALS[r.id] ?? FALLBACK;
    // MVP: only the Number realm has progress wired up. Other realms plug into
    // this same map (one line each) as their curricula ship — no UI change.
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

// ── Tower as LEVEL FLOORS ────────────────────────────────────────────────────
// The Tower restores level by level. Each floor (Ground → Level 6) fills as the
// learner completes that level's realms — small wins throughout, climbing the
// Tower. MVP: only the Number realm has full level coverage, so a floor fills
// from Number's completion at that level (legend passed = restored; current
// level = week progress). As more realms ship, each floor blends their
// per-level completion in (denominator grows) — one line change here.

export type TowerFloorState = "restored" | "current" | "locked";

export type TowerFloor = {
  label: string; // "Ground Level", "Level 1"…
  year: string; // "Prep", "Year 1"…
  percent: number; // 0..1 restoration of this floor
  state: TowerFloorState;
};

const TOWER_LEVELS: { label: string; year: string }[] = [
  { label: "Ground Level", year: "Prep" },
  { label: "Level 1", year: "Year 1" },
  { label: "Level 2", year: "Year 2" },
  { label: "Level 3", year: "Year 3" },
  { label: "Level 4", year: "Year 4" },
  { label: "Level 5", year: "Year 5" },
  { label: "Level 6", year: "Year 6" },
];

export function getTowerFloors(): TowerFloor[] {
  const progress = readProgress();
  const currentYear = progress?.year ?? "Year 1";
  const placed = isPlacementComplete(progress);
  const effective = getEffectiveUnlockedLegendIds(currentYear, progress?.unlockedLegends);

  // Week completion for the learner's current level.
  let currentWeekFraction = 0;
  if (typeof window !== "undefined") {
    const store = readProgramStore();
    let weeksComplete = 0;
    for (let w = 1; w <= WEEKS_PER_LEVEL; w += 1) {
      if (isWeekComplete(getWeekProgress(store, currentYear, w))) weeksComplete += 1;
    }
    currentWeekFraction = weeksComplete / WEEKS_PER_LEVEL;
  }

  return TOWER_LEVELS.map((lvl) => {
    const passed = effective.includes(getLegendForYear(lvl.year).id);
    const isCurrent = lvl.year === currentYear;

    let percent: number;
    let state: TowerFloorState;
    if (passed) {
      percent = 1;
      state = "restored";
    } else if (isCurrent) {
      percent = placed ? Math.max(0.04, currentWeekFraction) : currentWeekFraction; // pre-test spark
      state = "current";
    } else {
      percent = 0;
      state = "locked";
    }
    return { label: lvl.label, year: lvl.year, percent, state };
  });
}

/** Count of fully-restored Tower floors (levels passed). */
export function getFloorsRestored(floors: TowerFloor[]): number {
  return floors.filter((f) => f.state === "restored").length;
}
