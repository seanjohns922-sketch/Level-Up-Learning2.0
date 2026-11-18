import { getRealmTheme } from "@/lib/useRealmTheme";

/**
 * One look for the lesson bar (progress, timer, mastery, hint) in every realm:
 * Pattern Peaks' design, coloured from each realm's own theme. A realm only
 * changes the colours, never the shape, so the bars can't drift apart again.
 */
export type LessonBarTheme = {
  /** The thin gradient edge around each panel. */
  bezel: string;
  /** The dark panel behind the numbers. */
  plate: string;
  plateShadow: string;
  /** The faint dotted texture on the bar. */
  dots: string;
  /** The round badge on the progress panel. */
  orb: string;
  orbShadow: string;
  /** The progress fill. */
  fill: string;
  fillGlow: string;
  /** Big numbers and small labels. */
  text: string;
  label: string;
  /** Icons and the soft glow behind text. */
  accent: string;
  glow: string;
  /** The hint button's tint. */
  tint: string;
  tintEdge: string;
};

const mix = (colour: string, percent: number, base = "transparent") => `color-mix(in srgb, ${colour} ${percent}%, ${base})`;

export function lessonBarTheme(realmId?: string | null): LessonBarTheme {
  const { ctaFrom, ctaTo, accentText } = getRealmTheme(realmId ?? "number");
  return {
    bezel: `linear-gradient(135deg, ${mix(ctaFrom, 64)} 0%, ${mix(ctaTo, 52)} 50%, ${mix(accentText, 48)} 100%)`,
    plate: `linear-gradient(135deg, ${mix(ctaFrom, 10, "#05080a")} 0%, ${mix(ctaFrom, 22, "#071210")} 55%, ${mix(ctaTo, 26, "#0b0a16")} 100%)`,
    plateShadow: `inset 0 1px 0 ${mix(accentText, 22)}, inset 0 -8px 18px rgba(0, 0, 0, 0.5)`,
    dots: `radial-gradient(circle, ${mix(accentText, 50)} 1px, transparent 1.5px)`,
    orb: `radial-gradient(circle at 35% 30%, ${accentText} 0%, ${ctaTo} 62%, #0a0a12 100%)`,
    orbShadow: `inset 0 0 6px ${mix(accentText, 55)}, 0 0 12px ${mix(ctaFrom, 45)}`,
    fill: `linear-gradient(90deg, ${ctaFrom} 0%, ${accentText} 45%, ${ctaTo} 100%)`,
    fillGlow: `0 0 12px ${mix(accentText, 58)}`,
    text: mix(accentText, 30, "#ffffff"),
    label: mix(accentText, 85, "#ffffff"),
    accent: accentText,
    glow: mix(accentText, 45),
    tint: mix(ctaFrom, 12),
    tintEdge: mix(accentText, 34),
  };
}
