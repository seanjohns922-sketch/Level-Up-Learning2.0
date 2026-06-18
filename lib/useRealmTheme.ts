/**
 * Realm-aware visual theme tokens.
 *
 * Purely presentational — does NOT affect progression, scoring, XP,
 * chains, quizzes, save/resume, unlock logic, or routing.
 *
 * Default theme = Number Nexus (teal / emerald) — visually unchanged.
 * realmId === "measurement" → Measurelands (brass / gold / violet / earth).
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

/** Pure resolver — safe in SSR, client, server components. */
export function getRealmTheme(realmId?: string | null): RealmTheme {
  return realmId === "measurement" ? MEASURELANDS : NUMBER_NEXUS;
}

/**
 * React-friendly alias. No state needed — the theme is a pure function of
 * `realmId`, so this stays a thin wrapper for ergonomics & future expansion.
 */
export function useRealmTheme(realmId?: string | null): RealmTheme {
  return getRealmTheme(realmId);
}

export const REALM_THEME_TOKENS = { NUMBER_NEXUS, MEASURELANDS };