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
    <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-teal-50 to-white p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-sm">
          <Zap className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-black uppercase tracking-wide text-emerald-900">
              {earned} / {max} XP
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700/80">
              Lesson progress
            </span>
          </div>
          <div className="h-3.5 overflow-hidden rounded-full bg-emerald-100/80 shadow-inner">
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
