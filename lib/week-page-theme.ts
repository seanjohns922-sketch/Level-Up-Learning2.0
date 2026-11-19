import type { CSSProperties } from "react";
import { getRealmTheme } from "@/lib/useRealmTheme";

/**
 * The week page's colours as CSS variables, taken from the realm's own theme.
 * Every realm shares one week page design; only these colours change.
 */
export function weekPageTheme(realmId: string): CSSProperties {
  const { ctaFrom, ctaTo, accentText } = getRealmTheme(realmId);
  return {
    "--wk-from": ctaFrom,
    "--wk-to": ctaTo,
    "--wk-accent": accentText,
  } as CSSProperties;
}

/** A see-through glass surface that lets the realm art show behind it. */
export const WEEK_GLASS = "border-[1.5px] border-white/15 bg-[rgba(6,10,14,0.58)] backdrop-blur-md";
/** A top-bar pill: Hub, the realm, the week selector. */
export const WEEK_PILL = `${WEEK_GLASS} inline-flex h-[52px] items-center gap-2.5 rounded-full px-5 text-[17px] font-extrabold text-white transition hover:bg-[rgba(6,10,14,0.72)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wk-accent)]`;
/** The realm's filled action colour (Start, the progress fill, the profile button). */
export const WEEK_FILL = "bg-[linear-gradient(135deg,var(--wk-from),var(--wk-to))]";
