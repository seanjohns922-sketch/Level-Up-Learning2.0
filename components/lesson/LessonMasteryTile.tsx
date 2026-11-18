"use client";

import { Star } from "lucide-react";
import { LESSON_CHIP, LESSON_CHIP_LABEL, LESSON_CHIP_NUMBER, lessonBarTheme } from "@/lib/lesson-bar-theme";

const ACCURACY_LABEL: Record<string, string> = {
  measurement: "Mastery",
  pattern: "Mastery",
  space: "Mission Accuracy",
  statistics: "Data Accuracy",
  chance: "Chance Accuracy",
};

/** The lesson bar's accuracy chip ("mastery" in some realms), in the realm's colours. */
export function LessonMasteryTile({ accuracy, realmId }: { accuracy: number; realmId?: string }) {
  const theme = lessonBarTheme(realmId);
  const label = ACCURACY_LABEL[realmId ?? ""] ?? "Accuracy";

  return (
    <div className={LESSON_CHIP} style={{ background: theme.chip }}>
      <Star aria-hidden className="h-[22px] w-[22px] shrink-0" strokeWidth={2.5} style={{ color: theme.accent }} />
      <span className={LESSON_CHIP_NUMBER} style={{ color: theme.text }}>{accuracy}%</span>
      <span className={LESSON_CHIP_LABEL} style={{ color: theme.label }}>{label.toLowerCase()}</span>
    </div>
  );
}
