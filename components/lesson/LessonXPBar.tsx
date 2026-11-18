"use client";

import { ChartColumn, Dices, Hourglass, Orbit, Sigma, Zap } from "lucide-react";
import { lessonBarTheme } from "@/lib/lesson-bar-theme";

// The bar fills as answers come in. XP itself is banked once, when the lesson
// is finished (LESSON_XP), so the bar counts correct answers, not XP.
const POINTS_PER_CORRECT = 10;

function calcPoints(correct: number) {
  return correct * POINTS_PER_CORRECT;
}

export function LessonXPBar({
  correct,
  totalTarget,
  mode = "xp",
  currentValue,
  maxValue,
  valueLabel,
  rightLabel,
  realmId,
}: {
  correct?: number;
  totalTarget?: number;
  mode?: "xp" | "progress";
  currentValue?: number;
  maxValue?: number;
  valueLabel?: string;
  rightLabel?: string;
  realmId?: string;
}) {
  const isMeasurement = realmId === "measurement";
  const isStarpath = realmId === "space";
  const isStatistics = realmId === "statistics";
  const isPattern = realmId === "pattern";
  const isChance = realmId === "chance";
  const earned = mode === "progress" ? Math.max(0, currentValue ?? 0) : calcPoints(correct ?? 0);
  const max = mode === "progress"
    ? Math.max(1, maxValue ?? 1)
    : Math.max(1, (totalTarget ?? 0) * POINTS_PER_CORRECT);
  const pct = max > 0 ? Math.min(100, (earned / max) * 100) : 0;
  const leftLabel = valueLabel ?? (mode === "progress" ? `${earned} / ${max}` : `${correct ?? 0} / ${Math.max(1, totalTarget ?? 0)} correct`);
  const defaultRight = isMeasurement
    ? (mode === "progress" ? "Explorer Progress" : "Journey Progress")
    : isStarpath
      ? (mode === "progress" ? "Mission Progress" : "Starpath Progress")
      : isStatistics
        ? (mode === "progress" ? "Investigation Progress" : "Data Progress")
      : isPattern
        ? (mode === "progress" ? "Explorer Progress" : "Pattern Progress")
      : isChance
        ? (mode === "progress" ? "Trial Progress" : "Chance Progress")
      : (mode === "progress" ? "Session Progress" : "Lesson Progress");
  const trailingLabel = rightLabel ?? defaultRight;

  const theme = lessonBarTheme(realmId);
  const Icon = isMeasurement ? Hourglass : isStarpath ? Orbit : isStatistics ? ChartColumn : isPattern ? Sigma : isChance ? Dices : Zap;

  return (
    <div className="relative h-full">
      <div aria-hidden className="pointer-events-none absolute -inset-[2px] rounded-xl" style={{ background: theme.bezel }} />
      <div className="relative flex h-full items-center overflow-hidden rounded-[10px] px-2.5 py-2" style={{ background: theme.plate, boxShadow: theme.plateShadow }}>
        <div className="relative flex w-full items-center gap-2.5">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full" style={{ background: theme.orb, boxShadow: theme.orbShadow }}>
            <Icon className="h-4 w-4 text-white" style={{ filter: `drop-shadow(0 0 4px ${theme.glow})` }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-xs font-mono font-extrabold uppercase tracking-[0.16em] md:text-sm" style={{ color: theme.text, textShadow: `0 0 10px ${theme.glow}` }}>
                {leftLabel}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] md:text-[11px]" style={{ color: theme.label }}>
                {trailingLabel}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.65)]">
              <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%`, background: theme.fill, boxShadow: theme.fillGlow }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
