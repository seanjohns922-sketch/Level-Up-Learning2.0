"use client";

import { Check, Lock, Play, RotateCcw } from "lucide-react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { WEEK_FILL } from "@/lib/week-page-theme";

/** Where a lesson or quiz is up to for this learner. */
export type WeekCardState = "done" | "next" | "open" | "retry" | "soon" | "locked";

const FRAME: Record<WeekCardState, string> = {
  done: "border-[1.5px] border-[color-mix(in_srgb,var(--wk-accent)_30%,rgba(255,255,255,0.12))]",
  open: "border-[1.5px] border-[color-mix(in_srgb,var(--wk-accent)_30%,rgba(255,255,255,0.12))]",
  next: "border-2 border-[var(--wk-accent)] shadow-[0_0_0_5px_color-mix(in_srgb,var(--wk-accent)_22%,transparent),0_18px_44px_rgba(0,0,0,0.45)] lg:-translate-y-2.5",
  retry: "border-2 border-amber-400 shadow-[0_0_0_5px_rgba(251,191,36,0.2),0_18px_44px_rgba(0,0,0,0.45)] lg:-translate-y-2.5",
  soon: "border-[1.5px] border-dashed border-white/25 bg-[rgba(6,10,14,0.45)]",
  locked: "border-[1.5px] border-white/10 opacity-70",
};

const BADGE: Partial<Record<WeekCardState, string>> = {
  done: "bg-[color-mix(in_srgb,var(--wk-accent)_22%,transparent)] text-[var(--wk-accent)]",
  next: "bg-[var(--wk-accent)] text-slate-950",
  retry: "bg-amber-400 text-amber-950",
  soon: "bg-white/12 text-white/80",
  locked: "bg-white/10 text-white/70",
};

const ACTION: Record<"done" | "next" | "open" | "retry", string> = {
  done: "border-[1.5px] border-white/30 bg-white/[0.08] text-white",
  open: "border-[1.5px] border-white/30 bg-white/[0.08] text-white",
  next: `${WEEK_FILL} text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.35)] shadow-[inset_0_2px_0_rgba(255,255,255,0.3),inset_0_-3px_0_rgba(0,0,0,0.22)]`,
  retry: "bg-[linear-gradient(135deg,#f59e0b,#fbbf24)] text-amber-950 shadow-[inset_0_2px_0_rgba(255,255,255,0.35),inset_0_-3px_0_rgba(0,0,0,0.2)]",
};

/**
 * One lesson, quiz or post-test on the week page: a see-through glass card with
 * a readable title and description, its state, its XP and one clear action.
 */
export function WeekCard({
  kicker,
  title,
  description,
  readAloudText,
  state,
  badgeLabel,
  xpLabel,
  actionLabel,
  onOpen,
  connector,
}: {
  kicker: string;
  title: string;
  description: string;
  readAloudText: string;
  state: WeekCardState;
  /** The small label at the top right ("Done", "Up next", "Passed"…); none for an open card. */
  badgeLabel?: string;
  xpLabel: string;
  actionLabel: string;
  onOpen: () => void;
  /** The dot joining this card to the next one: lit once this card is done. */
  connector?: "lit" | "dim";
}) {
  const openable = state !== "soon" && state !== "locked";
  const badge = BADGE[state];
  return (
    <div
      onClick={openable ? onOpen : undefined}
      className={`relative flex min-h-[244px] min-w-0 flex-col gap-2.5 rounded-[22px] bg-[rgba(6,10,14,0.6)] p-[18px] text-left shadow-[0_14px_34px_rgba(0,0,0,0.35)] backdrop-blur-md transition ${FRAME[state]} ${openable ? "cursor-pointer hover:-translate-y-1" : "cursor-default"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex h-7 items-center rounded-full bg-[color-mix(in_srgb,var(--wk-from)_55%,rgba(255,255,255,0.08))] px-3 text-[13px] font-extrabold text-white">
          {kicker}
        </span>
        {badge && badgeLabel ? (
          <span className={`inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-extrabold ${badge}`}>
            {state === "done" ? <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={4} /> : null}
            {state === "locked" ? <Lock aria-hidden className="h-3.5 w-3.5" /> : null}
            {badgeLabel}
          </span>
        ) : null}
      </div>

      <div className="flex items-start justify-between gap-2.5">
        <h3 className="m-0 text-xl font-extrabold leading-tight text-white [text-wrap:balance]">{title}</h3>
        <ReadAloudBtn text={readAloudText} className="shrink-0 !h-9 !w-9 !border-white/25 !bg-white/10 !text-white hover:!border-white/40 hover:!text-white" />
      </div>

      <div className="flex-1">
        <p className="m-0 text-[15px] font-medium leading-snug text-white/85 line-clamp-3">{description}</p>
      </div>

      <div className="flex items-center justify-between gap-2.5">
        <span className={`text-[15px] font-extrabold ${state === "done" ? "text-[var(--wk-accent)]" : state === "retry" ? "text-amber-300" : "text-white/90"}`}>{xpLabel}</span>
        {openable ? (
          <button
            type="button"
            onClick={(event) => { event.stopPropagation(); onOpen(); }}
            className={`inline-flex h-[46px] items-center gap-2 whitespace-nowrap rounded-[14px] px-5 text-base font-black transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${ACTION[state]}`}
          >
            {state === "next" ? <Play aria-hidden className="h-4 w-4 fill-current" /> : null}
            {state === "retry" ? <RotateCcw aria-hidden className="h-4 w-4" /> : null}
            {actionLabel}
          </button>
        ) : (
          <span className="inline-flex h-[46px] items-center whitespace-nowrap rounded-[14px] border-[1.5px] border-dashed border-white/30 px-4 text-base font-extrabold text-white/70">
            {actionLabel}
          </span>
        )}
      </div>

      {connector ? (
        <span
          aria-hidden
          className={`absolute right-[-17px] top-1/2 z-10 hidden h-3 w-3 -translate-y-1/2 rounded-full lg:block ${connector === "lit" ? "bg-[var(--wk-accent)] shadow-[0_0_10px_var(--wk-accent)]" : "bg-white/35"}`}
        />
      ) : null}
    </div>
  );
}
