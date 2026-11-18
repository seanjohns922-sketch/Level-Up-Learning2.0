"use client";

import { Sparkles, Target } from "lucide-react";
import { lessonBarTheme } from "@/lib/lesson-bar-theme";

const ACCURACY_LABEL: Record<string, string> = {
  measurement: "Mastery",
  pattern: "Mastery",
  space: "Mission Accuracy",
  statistics: "Data Accuracy",
  chance: "Chance Accuracy",
};

/** The lesson bar's accuracy tile ("Mastery" in most realms), in the realm's colours. */
export function LessonMasteryTile({ accuracy, realmId }: { accuracy: number; realmId?: string }) {
  const theme = lessonBarTheme(realmId);
  const label = ACCURACY_LABEL[realmId ?? ""] ?? "Accuracy";
  const Icon = realmId && realmId !== "number" ? Sparkles : Target;

  return (
    <div className="relative h-full">
      <div aria-hidden className="pointer-events-none absolute -inset-[2px] rounded-xl" style={{ background: theme.bezel }} />
      <div className="relative h-full overflow-hidden rounded-[10px] px-3 py-2.5" style={{ background: theme.plate, boxShadow: theme.plateShadow }}>
        <div className="relative mb-1 flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5" style={{ color: theme.accent, filter: `drop-shadow(0 0 3px ${theme.glow})` }} />
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]" style={{ color: theme.label }}>
            {label}
          </span>
        </div>
        <div className="relative text-2xl font-black tabular-nums text-white md:text-[1.7rem]" style={{ textShadow: `0 0 14px ${theme.glow}` }}>
          {accuracy}%
        </div>
      </div>
    </div>
  );
}
