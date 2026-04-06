"use client";

import { Zap } from "lucide-react";

const XP_PER_CORRECT = 10;

export function calcXP(correct: number) {
  return correct * XP_PER_CORRECT;
}

export function LessonXPBar({
  correct,
  totalTarget,
}: {
  correct: number;
  totalTarget: number;
}) {
  const earned = calcXP(correct);
  const max = totalTarget * XP_PER_CORRECT;
  const pct = max > 0 ? Math.min(100, (earned / max) * 100) : 0;

  return (
    <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-teal-50 to-white p-2.5 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-sm">
          <Zap className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-xs font-black uppercase tracking-wide text-emerald-900 md:text-sm">
              {earned} / {max} XP
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700/80 md:text-[11px]">
              Lesson progress
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-emerald-100/80 shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${pct}%`,
                background:
                  "linear-gradient(90deg, hsl(44 96% 58%), hsl(49 95% 64%), hsl(142 66% 48%))",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
