"use client";

import { ChartColumn, Dices, Hourglass, Orbit, Sigma, Timer } from "lucide-react";
import { LESSON_CHIP, LESSON_CHIP_NUMBER, lessonBarTheme } from "@/lib/lesson-bar-theme";

const TIMER_ICON = { measurement: Hourglass, space: Orbit, statistics: ChartColumn, pattern: Sigma, chance: Dices } as const;

/** Running low and almost out look the same in every realm. */
const LOW_TIME = {
  warn: { chip: "rgba(251, 191, 36, 0.16)", text: "#fef3c7", icon: "#fcd34d" },
  danger: { chip: "rgba(248, 113, 113, 0.18)", text: "#fee2e2", icon: "#fca5a5" },
};

/** The lesson bar's countdown chip. */
export function LessonTimer({ seconds, total, realmId }: { seconds: number; total: number; realmId?: string }) {
  const clamped = Math.max(0, seconds);
  const minutes = Math.floor(clamped / 60);
  const remaining = String(clamped % 60).padStart(2, "0");
  const pct = total > 0 ? (clamped / total) * 100 : 0;

  const theme = lessonBarTheme(realmId);
  const palette = pct > 50 ? { chip: theme.chip, text: theme.text, icon: theme.accent } : LOW_TIME[pct > 12 ? "warn" : "danger"];
  const Icon = TIMER_ICON[realmId as keyof typeof TIMER_ICON] ?? Timer;

  return (
    <div className={`${LESSON_CHIP} transition-colors duration-500`} style={{ background: palette.chip }}>
      <Icon aria-hidden className="h-6 w-6 shrink-0" style={{ color: palette.icon }} />
      <span className={LESSON_CHIP_NUMBER} style={{ color: palette.text }} aria-label={`${minutes} minutes ${remaining} seconds left`}>
        {minutes}:{remaining}
      </span>
    </div>
  );
}
