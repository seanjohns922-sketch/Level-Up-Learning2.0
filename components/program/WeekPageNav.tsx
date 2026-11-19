"use client";

import type { ReactNode } from "react";
import { ChevronRight, Home, UserRound } from "lucide-react";
import { WEEK_FILL, WEEK_PILL } from "@/lib/week-page-theme";

/**
 * The week page's top bar, the same on every realm and level:
 * Hub › realm › week selector on the left; the RELIQ logo and the student's
 * profile button (where they log out) on the right, in the realm's colour.
 */
export function WeekPageNav({
  realmLabel,
  onHub,
  onRealm,
  onProfile,
  weekMenu,
  extraLinks,
  logo,
}: {
  realmLabel: string;
  onHub: () => void;
  onRealm: () => void;
  onProfile: () => void;
  weekMenu: ReactNode;
  extraLinks?: ReactNode;
  logo: ReactNode;
}) {
  const separator = <ChevronRight aria-hidden className="h-5 w-5 shrink-0 text-white/75 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]" />;
  return (
    <div className="mb-6 flex items-start justify-between gap-3">
      <nav aria-label="Where you are" className="flex min-w-0 flex-wrap items-center gap-2">
        <button type="button" onClick={onHub} className={WEEK_PILL} aria-label="Home to the central hub">
          <Home aria-hidden className="h-5 w-5" />
          Hub
        </button>
        {separator}
        <button type="button" onClick={onRealm} className={WEEK_PILL}>
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-[var(--wk-accent)] shadow-[0_0_8px_var(--wk-accent)]" />
          {realmLabel}
        </button>
        {separator}
        {weekMenu}
        {extraLinks}
      </nav>
      <div className="flex shrink-0 items-start gap-4">
        {logo}
        <button
          type="button"
          onClick={onProfile}
          aria-label="My profile and log out"
          title="Profile"
          className={`${WEEK_FILL} grid h-[52px] w-[52px] place-items-center rounded-full border-2 border-white/70 text-white shadow-[0_6px_18px_rgba(0,0,0,0.4)] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white`}
        >
          <UserRound aria-hidden className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
