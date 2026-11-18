"use client";

import type { CSSProperties, ReactNode } from "react";

/**
 * The shared look for quizzes and lesson practice: chunky pressable buttons, a
 * question stage framed in the realm's gradient, and rune-diamond progress.
 * Colours come from the realm's --quiz-* variables (getWeeklyQuizTheme), so
 * every realm keeps its own palette.
 */

const BUTTON_BASE =
  "inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl px-6 font-[family-name:var(--font-display)] text-lg font-black transition active:translate-y-1 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:active:translate-y-0";

export const QUIZ_BUTTON = {
  /** The main action: realm colours with a darker lip underneath. */
  primary: `${BUTTON_BASE} bg-[image:var(--quiz-action)] text-white shadow-[0_6px_0_var(--quiz-edge),0_14px_28px_var(--quiz-glow)] hover:brightness-110 active:shadow-[0_2px_0_var(--quiz-edge)]`,
  /** A quieter action on the light stage. */
  secondary: `${BUTTON_BASE} border-2 border-[var(--quiz-border)] bg-white text-[var(--quiz-ink)] shadow-[0_5px_0_var(--quiz-border)] hover:bg-[var(--quiz-tint)] active:shadow-[0_1px_0_var(--quiz-border)]`,
  /** A quieter action on the dark realm background. */
  glass: `${BUTTON_BASE} border border-white/20 bg-white/10 text-white hover:bg-white/15`,
} as const;

/** The light question area, framed by a thin band of the realm's gradient. */
export function QuizStage({ background, className = "", children }: { background: string; className?: string; children: ReactNode }) {
  return (
    <div className="rounded-[30px] bg-[image:var(--quiz-frame)] p-[3px] shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
      <section className={`rounded-[27px] px-4 py-6 text-slate-950 sm:px-8 sm:py-8 ${className}`} style={{ background }}>
        {children}
      </section>
    </div>
  );
}

const RUNE: CSSProperties = { transform: "rotate(45deg)" };

/**
 * "Question 4 of 15" with a row of diamonds: lit once answered, glowing on the
 * current question. With onJump, answered questions (and the current one) can
 * be tapped to go back to them.
 */
export function QuizRuneProgress({ total, current, isDone, onJump }: {
  total: number;
  current: number;
  isDone: (index: number) => boolean;
  onJump?: (index: number) => void;
}) {
  const answered = Array.from({ length: total }, (_, index) => isDone(index)).filter(Boolean).length;
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <p className="font-[family-name:var(--font-display)] text-lg font-black text-white">
        Question {current + 1} <span className="font-bold text-white/60">of {total}</span>
        <span className="sr-only">, {answered} answered</span>
      </p>
      <ol className="flex flex-wrap items-center gap-1" aria-label="Questions">
        {Array.from({ length: total }, (_, index) => {
          const done = isDone(index);
          const now = index === current;
          const rune = (
            <span
              aria-hidden="true"
              className={now ? "block h-5 w-5 rounded-[5px]" : "block h-3.5 w-3.5 rounded-[4px]"}
              style={{
                ...RUNE,
                background: now ? "var(--quiz-rune-now)" : done ? "var(--quiz-rune)" : "rgba(255,255,255,0.16)",
                boxShadow: now ? "0 0 16px var(--quiz-rune-now)" : done ? "0 0 10px color-mix(in srgb, var(--quiz-rune) 60%, transparent)" : "none",
                outline: now ? "3px solid color-mix(in srgb, var(--quiz-rune-now) 45%, transparent)" : undefined,
                outlineOffset: now ? 3 : undefined,
              }}
            />
          );
          const name = `Question ${index + 1}${now ? ", current" : done ? ", answered" : ""}`;
          return (
            <li key={index}>
              {onJump && (done || now) ? (
                <button type="button" onClick={() => onJump(index)} aria-label={name} aria-current={now ? "step" : undefined} className="grid h-8 w-8 place-items-center rounded-lg transition hover:bg-white/10">
                  {rune}
                </button>
              ) : (
                <span className="grid h-8 w-8 place-items-center" aria-label={name} role="img">{rune}</span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
