import { getRealmTheme } from "./useRealmTheme";

/** One visual contract for every phase of the shared weekly quiz. */
export function getWeeklyQuizTheme(realm: string) {
  const theme = getRealmTheme(realm);
  return {
    "--quiz-hero": theme.cardSurface,
    "--quiz-accent": theme.accentText,
    "--quiz-border": theme.borderRing,
    "--quiz-tint": theme.surfaceTint,
    // Darken the realm colour for readable labels and white button text.
    "--quiz-ink": `color-mix(in srgb, ${theme.ctaFrom} 50%, #0f172a)`,
    "--quiz-action": `linear-gradient(135deg, color-mix(in srgb, ${theme.ctaFrom} 50%, #0f172a), color-mix(in srgb, ${theme.ctaTo} 50%, #0f172a))`,
    "--quiz-halo": `radial-gradient(circle at 20% 20%, ${theme.haloA}, transparent 34%), radial-gradient(circle at 82% 28%, ${theme.haloB}, transparent 30%)`,
    // The bright realm gradient that frames the question stage.
    "--quiz-frame": `linear-gradient(135deg, ${theme.ctaFrom}, ${theme.ctaTo})`,
    // The darker lip under a chunky button, and its glow.
    "--quiz-edge": `color-mix(in srgb, ${theme.ctaFrom} 32%, #020617)`,
    "--quiz-glow": `color-mix(in srgb, ${theme.ctaTo} 38%, transparent)`,
    // Progress runes: done, and the question you're on.
    "--quiz-rune": theme.accentText,
    "--quiz-rune-now": `color-mix(in srgb, ${theme.ctaTo} 70%, #ffffff)`,
  };
}
