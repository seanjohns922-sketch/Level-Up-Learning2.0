/**
 * Realm-aware visual theme tokens.
 *
 * Purely presentational — does NOT affect progression, scoring, XP,
 * chains, quizzes, save/resume, unlock logic, or routing.
 *
 * Default theme = Number Nexus (teal / emerald) — visually unchanged.
 * realmId === "measurement" → Measurelands (brass / gold / violet / earth).
 * realmId === "space" → Starpath (violet / cyan / cosmic navy).
 * realmId === "pattern" → Pattern Peaks (emerald / violet / mountain dusk).
 */

export type RealmTheme = {
  realmId: string;
  isMeasurement: boolean;
  /** Primary CTA gradient (135deg from/to). */
  ctaFrom: string;
  ctaTo: string;
  ctaHoverFrom: string;
  ctaHoverTo: string;
  /** Tailwind class fallback for `bg-gradient-to-r from-X to-Y`. */
  ctaGradientClass: string;
  ctaHoverGradientClass: string;
  /** CSS string: `linear-gradient(...)`. */
  ctaGradientCss: string;
  /** Soft halo behind primary CTAs. */
  ctaShadow: string;
  /** Accent text colour (chips / labels). */
  accentText: string;
  /** Soft accent text colour. */
  accentTextSoft: string;
  /** Border/ring colour for selected / highlighted surfaces. */
  borderRing: string;
  /** Subtle surface tint. */
  surfaceTint: string;
  /** Hero/page background radial halos. */
  haloA: string;
  haloB: string;
  haloC: string;
  /** Score-ring / "pass" accent (replaces teal). */
  passRing: string;
  passRingGlow: string;
  /** Card surface gradient used by lesson celebration cards. */
  cardSurface: string;
  cardInsetShadow: string;
  /** Inner divider/border tint inside celebration cards. */
  cardBorderTint: string;
  /** "Lesson Complete" chip styles. */
  chipBorder: string;
  chipBg: string;
  chipText: string;
  /** Trophy badge gradient. */
  trophyGradient: string;
  trophyShadow: string;
  /** Stat-tile border/bg/text/icon. */
  statBorder: string;
  statBg: string;
  statLabel: string;
  statIcon: string;
  /** Confetti palette. */
  confetti: string[];
};

const NUMBER_NEXUS: RealmTheme = {
  realmId: "number",
  isMeasurement: false,
  ctaFrom: "#14b8a6",
  ctaTo: "#10b981",
  ctaHoverFrom: "#2dd4bf",
  ctaHoverTo: "#34d399",
  ctaGradientClass: "bg-gradient-to-r from-teal-500 to-emerald-500",
  ctaHoverGradientClass: "hover:from-teal-400 hover:to-emerald-400",
  ctaGradientCss: "linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #2dd4bf 100%)",
  ctaShadow: "0 10px 30px -8px rgba(16,185,129,0.5)",
  accentText: "#5eead4",
  accentTextSoft: "rgba(94,234,212,0.8)",
  borderRing: "rgba(94,234,212,0.35)",
  surfaceTint: "rgba(20,184,166,0.08)",
  haloA: "rgba(20,184,166,0.10)",
  haloB: "rgba(16,185,129,0.10)",
  haloC: "rgba(6,182,212,0.05)",
  passRing: "rgb(45 212 191)",
  passRingGlow: "rgb(20 184 166)",
  cardSurface: "linear-gradient(135deg, #021716 0%, #042925 50%, #053b35 100%)",
  cardInsetShadow:
    "inset 0 1px 0 rgba(94,234,212,0.18), inset 0 -10px 20px rgba(0,0,0,0.45)",
  cardBorderTint: "rgba(94,234,212,0.15)",
  chipBorder: "rgba(94,234,212,0.30)",
  chipBg: "rgba(20,184,166,0.10)",
  chipText: "rgba(153,246,228,0.90)",
  trophyGradient:
    "radial-gradient(circle at 35% 30%, #5eead4 0%, #0f766e 65%, #042925 100%)",
  trophyShadow: "inset 0 0 8px rgba(204,251,241,0.5)",
  statBorder: "rgba(94,234,212,0.20)",
  statBg: "rgba(20,184,166,0.05)",
  statLabel: "rgba(153,246,228,0.70)",
  statIcon: "#5eead4",
  confetti: ["#2dd4bf", "#34d399", "#fcd34d", "#f472b6", "#38bdf8"],
};

const MEASURELANDS: RealmTheme = {
  realmId: "measurement",
  isMeasurement: true,
  ctaFrom: "#b8893a",
  ctaTo: "#d6b86c",
  ctaHoverFrom: "#c89a4b",
  ctaHoverTo: "#e8c97e",
  ctaGradientClass: "bg-gradient-to-r from-[#b8893a] to-[#d6b86c]",
  ctaHoverGradientClass: "hover:from-[#c89a4b] hover:to-[#e8c97e]",
  ctaGradientCss:
    "linear-gradient(135deg, #8a6422 0%, #b8893a 50%, #d6b86c 100%)",
  ctaShadow: "0 10px 30px -8px rgba(184,137,58,0.55)",
  accentText: "#e8c97e",
  accentTextSoft: "rgba(214,184,108,0.80)",
  borderRing: "rgba(214,184,108,0.35)",
  surfaceTint: "rgba(60,40,15,0.45)",
  haloA: "rgba(214,184,108,0.22)",
  haloB: "rgba(167,139,250,0.18)",
  haloC: "rgba(184,137,58,0.10)",
  passRing: "#d6b86c",
  passRingGlow: "#b8893a",
  cardSurface:
    "linear-gradient(135deg, #1a0e00 0%, #2a1a05 50%, #3c280f 100%)",
  cardInsetShadow:
    "inset 0 1px 0 rgba(214,184,108,0.20), inset 0 -10px 20px rgba(0,0,0,0.55)",
  cardBorderTint: "rgba(214,184,108,0.18)",
  chipBorder: "rgba(214,184,108,0.35)",
  chipBg: "rgba(214,184,108,0.10)",
  chipText: "#e8c97e",
  trophyGradient:
    "radial-gradient(circle at 35% 30%, #f5dca0 0%, #b8893a 60%, #3c280f 100%)",
  trophyShadow: "inset 0 0 8px rgba(245,220,160,0.55)",
  statBorder: "rgba(214,184,108,0.25)",
  statBg: "rgba(60,40,15,0.45)",
  statLabel: "rgba(232,201,126,0.75)",
  statIcon: "#e8c97e",
  confetti: ["#d6b86c", "#e8c97e", "#a78bfa", "#8aa977", "#b8893a"],
};

const STARPATH: RealmTheme = {
  ...NUMBER_NEXUS,
  realmId: "space",
  ctaFrom: "#7c3aed",
  ctaTo: "#06b6d4",
  ctaHoverFrom: "#8b5cf6",
  ctaHoverTo: "#22d3ee",
  ctaGradientClass: "bg-gradient-to-r from-violet-600 to-cyan-500",
  ctaHoverGradientClass: "hover:from-violet-500 hover:to-cyan-400",
  ctaGradientCss: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 48%, #06b6d4 100%)",
  ctaShadow: "0 10px 30px -8px rgba(34,211,238,0.48)",
  accentText: "#a5f3fc",
  accentTextSoft: "rgba(196,181,253,0.86)",
  borderRing: "rgba(103,232,249,0.36)",
  surfaceTint: "rgba(124,58,237,0.10)",
  haloA: "rgba(124,58,237,0.20)",
  haloB: "rgba(34,211,238,0.16)",
  haloC: "rgba(217,70,239,0.08)",
  passRing: "#67e8f9",
  passRingGlow: "#7c3aed",
  cardSurface: "linear-gradient(135deg, #16082f 0%, #1e1b4b 52%, #083344 100%)",
  cardInsetShadow: "inset 0 1px 0 rgba(165,243,252,0.18), inset 0 -10px 20px rgba(0,0,0,0.48)",
  cardBorderTint: "rgba(103,232,249,0.18)",
  chipBorder: "rgba(165,243,252,0.32)",
  chipBg: "rgba(124,58,237,0.16)",
  chipText: "#cffafe",
  trophyGradient: "radial-gradient(circle at 35% 30%, #a5f3fc 0%, #7c3aed 58%, #1e1b4b 100%)",
  trophyShadow: "inset 0 0 8px rgba(207,250,254,0.50)",
  statBorder: "rgba(196,181,253,0.25)",
  statBg: "rgba(124,58,237,0.10)",
  statLabel: "rgba(207,250,254,0.72)",
  statIcon: "#67e8f9",
  confetti: ["#67e8f9", "#a78bfa", "#f0abfc", "#fde68a", "#22d3ee"],
};

const STATISTICA: RealmTheme = {
  ...NUMBER_NEXUS,
  realmId: "statistics",
  ctaFrom: "#a83e4b",
  ctaTo: "#f2bc45",
  ctaHoverFrom: "#c74f4b",
  ctaHoverTo: "#f6cc70",
  ctaGradientClass: "bg-gradient-to-r from-[#a83e4b] to-[#f2bc45]",
  ctaHoverGradientClass: "hover:from-[#c74f4b] hover:to-[#f6cc70]",
  ctaGradientCss: "linear-gradient(135deg, #8e3341 0%, #e85d63 55%, #f2bc45 100%)",
  ctaShadow: "0 10px 30px -8px rgba(232,93,99,0.46)",
  accentText: "#f2bc45",
  accentTextSoft: "rgba(255,244,223,0.86)",
  borderRing: "rgba(242,188,69,0.38)",
  surfaceTint: "rgba(32,180,134,0.08)",
  haloA: "rgba(32,180,134,0.14)",
  haloB: "rgba(240,107,100,0.13)",
  haloC: "rgba(242,188,69,0.08)",
  passRing: "#20b486",
  passRingGlow: "#f2bc45",
  cardSurface: "linear-gradient(135deg, #101d15 0%, #163a32 52%, #51312b 100%)",
  chipBorder: "rgba(242,188,69,0.34)",
  chipBg: "rgba(240,107,100,0.12)",
  chipText: "#fff4df",
  trophyGradient: "radial-gradient(circle at 35% 30%, #f2bc45 0%, #20b486 58%, #163a32 100%)",
  statIcon: "#f2bc45",
  confetti: ["#20b486", "#f2bc45", "#f06b64", "#6c63d9", "#fff4df"],
};

const PATTERN_PEAKS: RealmTheme = {
  ...NUMBER_NEXUS,
  realmId: "pattern",
  ctaFrom: "#059669",
  ctaTo: "#7c3aed",
  ctaHoverFrom: "#10b981",
  ctaHoverTo: "#8b5cf6",
  ctaGradientClass: "bg-gradient-to-r from-emerald-600 to-violet-600",
  ctaHoverGradientClass: "hover:from-emerald-500 hover:to-violet-500",
  ctaGradientCss: "linear-gradient(135deg, #047857 0%, #059669 48%, #7c3aed 100%)",
  ctaShadow: "0 10px 30px -8px rgba(91,33,182,0.42)",
  accentText: "#6ee7b7",
  accentTextSoft: "rgba(196,181,253,0.9)",
  borderRing: "rgba(124,58,237,0.34)",
  surfaceTint: "rgba(16,185,129,0.08)",
  haloA: "rgba(16,185,129,0.16)",
  haloB: "rgba(124,58,237,0.14)",
  haloC: "rgba(250,204,21,0.06)",
  passRing: "#34d399",
  passRingGlow: "#7c3aed",
  cardSurface: "linear-gradient(135deg, #071d18 0%, #0b3329 52%, #241443 100%)",
  cardInsetShadow: "inset 0 1px 0 rgba(110,231,183,0.18), inset 0 -10px 20px rgba(0,0,0,0.46)",
  cardBorderTint: "rgba(196,181,253,0.2)",
  chipBorder: "rgba(110,231,183,0.34)",
  chipBg: "rgba(124,58,237,0.14)",
  chipText: "#d1fae5",
  trophyGradient: "radial-gradient(circle at 35% 30%, #a7f3d0 0%, #059669 50%, #5b21b6 100%)",
  trophyShadow: "inset 0 0 8px rgba(221,214,254,0.55)",
  statBorder: "rgba(196,181,253,0.24)",
  statBg: "rgba(16,185,129,0.07)",
  statLabel: "rgba(209,250,229,0.76)",
  statIcon: "#a78bfa",
  confetti: ["#34d399", "#a78bfa", "#facc15", "#6ee7b7", "#c4b5fd"],
};

/** Pure resolver — safe in SSR, client, server components. */
export function getRealmTheme(realmId?: string | null): RealmTheme {
  if (realmId === "measurement") return MEASURELANDS;
  if (realmId === "space") return STARPATH;
  if (realmId === "statistics") return STATISTICA;
  if (realmId === "pattern") return PATTERN_PEAKS;
  return NUMBER_NEXUS;
}

/**
 * React-friendly alias. No state needed — the theme is a pure function of
 * `realmId`, so this stays a thin wrapper for ergonomics & future expansion.
 */
export function useRealmTheme(realmId?: string | null): RealmTheme {
  return getRealmTheme(realmId);
}

export const REALM_THEME_TOKENS = { NUMBER_NEXUS, MEASURELANDS, STARPATH, STATISTICA, PATTERN_PEAKS };
