import { getRealmTheme } from "@/lib/useRealmTheme";

/**
 * One look for the slim lesson bar (progress, timer, streak, accuracy, hint,
 * Learn the skill) in every realm, coloured from each realm's own theme. A
 * realm only changes the colours, never the shape, so the bars can't drift apart.
 */
export type LessonBarTheme = {
  /** The bar's dark background and its edge. */
  plate: string;
  edge: string;
  plateShadow: string;
  /** Each piece on the bar sits on this soft chip. */
  chip: string;
  /** The progress ring: filled part and empty track. */
  ring: string;
  ringTrack: string;
  /** Big numbers and small labels. */
  text: string;
  label: string;
  /** Icons and the soft glow behind text. */
  accent: string;
  glow: string;
  /** The hint panel's tint. */
  tint: string;
  tintEdge: string;
  /** The "Learn the skill" button. */
  cta: string;
};

/** Every piece on the bar shares this chip shape. */
export const LESSON_CHIP = "flex h-14 shrink-0 items-center gap-2.5 rounded-2xl px-4";
/** The big number on a chip. */
export const LESSON_CHIP_NUMBER = "text-2xl font-black leading-none tabular-nums";
/** The plain word beside it ("correct", "streak", "accuracy"). */
export const LESSON_CHIP_LABEL = "text-[15px] font-bold leading-tight";

const mix = (colour: string, percent: number, base = "transparent") => `color-mix(in srgb, ${colour} ${percent}%, ${base})`;

export function lessonBarTheme(realmId?: string | null): LessonBarTheme {
  const { ctaFrom, ctaTo, accentText, ctaGradientCss } = getRealmTheme(realmId ?? "number");
  return {
    plate: `linear-gradient(135deg, ${mix(ctaFrom, 16, "#070a0d")} 0%, ${mix(ctaTo, 14, "#080a10")} 100%)`,
    edge: mix(accentText, 30),
    plateShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
    chip: "rgba(255, 255, 255, 0.06)",
    ring: accentText,
    ringTrack: "rgba(255, 255, 255, 0.16)",
    text: "#ffffff",
    label: "rgba(255, 255, 255, 0.8)",
    accent: accentText,
    glow: mix(accentText, 45),
    tint: mix(ctaFrom, 12),
    tintEdge: mix(accentText, 34),
    cta: ctaGradientCss,
  };
}
