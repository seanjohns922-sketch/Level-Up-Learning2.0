"use client";

import { LESSON_CHIP, LESSON_CHIP_LABEL, LESSON_CHIP_NUMBER, lessonBarTheme } from "@/lib/lesson-bar-theme";

// The ring fills as answers come in. XP itself is banked once, when the lesson
// is finished (LESSON_XP), so the ring counts correct answers, not XP.
const POINTS_PER_CORRECT = 10;

const PROGRESS_NAME: Record<string, { progress: string; xp: string }> = {
  measurement: { progress: "Explorer Progress", xp: "Journey Progress" },
  space: { progress: "Mission Progress", xp: "Starpath Progress" },
  statistics: { progress: "Investigation Progress", xp: "Data Progress" },
  pattern: { progress: "Explorer Progress", xp: "Pattern Progress" },
  chance: { progress: "Trial Progress", xp: "Chance Progress" },
};
const DEFAULT_PROGRESS_NAME = { progress: "Session Progress", xp: "Lesson Progress" };

/** "2 / 5 correct" → the big "2 / 5" and the small "correct". */
function splitLabel(label: string) {
  const match = label.match(/^(\d+\s*\/\s*\d+)\s*(.*)$/);
  return match ? { value: match[1], unit: match[2].toLowerCase() } : { value: label, unit: "" };
}

/** The lesson bar's progress chip: a ring that fills, with "2 / 5 correct" (or "3 / 9 min") beside it. */
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
  const earned = mode === "progress" ? Math.max(0, currentValue ?? 0) : (correct ?? 0) * POINTS_PER_CORRECT;
  const max = mode === "progress" ? Math.max(1, maxValue ?? 1) : Math.max(1, (totalTarget ?? 0) * POINTS_PER_CORRECT);
  const pct = Math.min(100, (earned / max) * 100);
  const { value, unit } = splitLabel(valueLabel ?? (mode === "progress" ? `${earned} / ${max}` : `${correct ?? 0} / ${Math.max(1, totalTarget ?? 0)} correct`));
  const name = rightLabel ?? (PROGRESS_NAME[realmId ?? ""] ?? DEFAULT_PROGRESS_NAME)[mode];
  const theme = lessonBarTheme(realmId);

  return (
    <div className={LESSON_CHIP} style={{ background: theme.chip }} title={name}>
      <div
        role="progressbar"
        aria-label={name}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full"
        style={{ background: `conic-gradient(${theme.ring} 0 ${pct}%, ${theme.ringTrack} ${pct}% 100%)` }}
      >
        <div className="h-[30px] w-[30px] rounded-full bg-[#0a0d11]" />
      </div>
      <span className={LESSON_CHIP_NUMBER} style={{ color: theme.text }}>{value}</span>
      {unit ? <span className={LESSON_CHIP_LABEL} style={{ color: theme.label }}>{unit}</span> : null}
    </div>
  );
}
