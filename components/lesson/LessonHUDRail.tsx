"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, Dices, Lightbulb } from "lucide-react";
import { LessonXPBar } from "@/components/lesson/LessonXPBar";
import { LessonTimer } from "@/components/lesson/LessonTimer";
import { LessonMasteryTile } from "@/components/lesson/LessonMasteryTile";
import { ComboCounter, StreakSoundToggle } from "@/components/lesson/ComboCounter";
import { lessonBarTheme } from "@/lib/lesson-bar-theme";
import { MathFormattedText } from "@/components/FractionText";
import ReadAloudBtn from "@/components/ReadAloudBtn";

/** A lesson's layout: the slim bar across the top, then the question underneath. */
export const LESSON_LAYOUT = "grid gap-4";
/** The bar's row above the question. */
export const LESSON_HUD_ROW = "min-w-0";

const isStarpath = (realmId?: string) => realmId === "space";

/** The streak's resting name in each realm. */
function streakName(realmId: string | undefined, levelNumber: number | undefined) {
  if (levelNumber === 7) return "CRYSTAL STREAK";
  if (isStarpath(realmId)) return "STAR CHAIN";
  const names: Record<string, string> = { measurement: "EXPLORER STREAK", statistics: "DATA STREAK", pattern: "PATTERN STREAK", chance: "CHANCE STREAK" };
  return names[realmId ?? ""] ?? "STREAK";
}

const BUTTON = "flex h-[52px] shrink-0 items-center gap-2 rounded-[14px] px-4 text-[17px] font-extrabold transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

/** The slim lesson bar: progress, timer, streak and accuracy, then sound, hint and Learn the skill, in the realm's colours. */
export function LessonHUDRail({
  levelNumber,
  correctAnswers,
  xpCorrectAnswers,
  accuracy,
  secondsLeft,
  totalSeconds,
  xpTarget,
  xpMode,
  xpDisplayValue,
  xpDisplayMax,
  xpDisplayLabel,
  xpDisplayRightLabel,
  hint,
  comboCount = 0,
  realmId,
  onLearnSkill,
}: {
  levelNumber?: number;
  correctAnswers: number;
  xpCorrectAnswers?: number;
  accuracy: number;
  secondsLeft: number;
  totalSeconds: number;
  xpTarget: number;
  xpMode?: "xp" | "progress";
  xpDisplayValue?: number;
  xpDisplayMax?: number;
  xpDisplayLabel?: string;
  xpDisplayRightLabel?: string;
  hint?: string | null;
  comboCount?: number;
  realmId?: string;
  /** Opens the lesson's guide; the button only shows when there is one. */
  onLearnSkill?: () => void;
}) {
  const [hintOpen, setHintOpen] = useState(false);
  const theme = lessonBarTheme(realmId);
  const hintLabel = realmId === "measurement" ? "Clue" : realmId === "chance" ? "Chance Hint" : "Hint";
  const HintIcon = realmId === "chance" ? Dices : Lightbulb;

  return (
    <div data-lesson-hud className="rounded-[22px] border-[1.5px] p-2" style={{ background: theme.plate, borderColor: theme.edge, boxShadow: theme.plateShadow }}>
      <div className="flex flex-wrap items-center gap-2.5">
        <LessonXPBar
          correct={xpCorrectAnswers ?? correctAnswers}
          totalTarget={xpTarget}
          mode={xpMode}
          currentValue={xpDisplayValue}
          maxValue={xpDisplayMax}
          valueLabel={xpDisplayLabel}
          rightLabel={xpDisplayRightLabel}
          realmId={realmId}
        />
        <LessonTimer seconds={Math.max(0, secondsLeft)} total={totalSeconds} realmId={realmId} />
        {/* On phones the streak shows only once one is running. */}
        <div className={comboCount > 0 ? "" : "hidden sm:block"}>
          <ComboCounter count={comboCount} cave={levelNumber === 7} chainLabel={streakName(realmId, levelNumber)} realmId={realmId} />
        </div>
        <div data-lesson-stats className="hidden sm:block">
          <LessonMasteryTile accuracy={accuracy} realmId={realmId} />
        </div>

        <div className="ml-auto flex items-center gap-2.5">
          <StreakSoundToggle />
          {hint ? (
            <button
              type="button"
              onClick={() => setHintOpen((open) => !open)}
              aria-expanded={hintOpen}
              className={`${BUTTON} border-[1.5px] border-amber-300/35 bg-amber-300/[0.12] text-amber-100`}
            >
              <HintIcon aria-hidden className="h-5 w-5" />
              {hintLabel}
              <ChevronDown aria-hidden className={`h-4 w-4 opacity-70 transition-transform ${hintOpen ? "rotate-180" : ""}`} />
            </button>
          ) : null}
          {onLearnSkill ? (
            <button
              type="button"
              onClick={onLearnSkill}
              className={`${BUTTON} px-5 text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]`}
              style={{ background: theme.cta, boxShadow: "inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -3px 0 rgba(0,0,0,0.2)" }}
            >
              <BookOpen aria-hidden className="h-5 w-5" />
              Learn the skill
            </button>
          ) : null}
        </div>
      </div>

      {hint && hintOpen ? (
        <div className="mt-2 rounded-xl border px-4 py-3 text-[17px] font-medium leading-relaxed text-white" style={{ background: theme.tint, borderColor: theme.tintEdge }}>
          <div className="mb-2 flex justify-end">
            <ReadAloudBtn text={hint} />
          </div>
          <MathFormattedText text={hint} />
        </div>
      ) : null}
    </div>
  );
}
