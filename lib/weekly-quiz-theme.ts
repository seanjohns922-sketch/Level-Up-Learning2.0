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
  };
}
