"use client";

import { useState } from "react";
import { ChevronDown, Dices, Lightbulb } from "lucide-react";
import { LessonXPBar } from "@/components/lesson/LessonXPBar";
import { LessonTimer } from "@/components/lesson/LessonTimer";
import { LessonMasteryTile } from "@/components/lesson/LessonMasteryTile";
import { ComboCounter } from "@/components/lesson/ComboCounter";
import { lessonBarTheme } from "@/lib/lesson-bar-theme";
import { MathFormattedText } from "@/components/FractionText";
import ReadAloudBtn from "@/components/ReadAloudBtn";

/** A lesson's layout: the slim bar across the top, then the question underneath. */
export const LESSON_LAYOUT = "grid gap-4";
/** The bar's row. The "Learn the skill" button sits at the end of the bar on wider screens. */
export const LESSON_HUD_ROW =
  "flex flex-col gap-3 lg:flex-row lg:items-stretch [&>button]:mb-0 lg:[&>button]:order-last lg:[&>button]:w-auto lg:[&>button]:max-w-[220px] lg:[&>button]:shrink-0 [&>[data-lesson-hud]]:min-w-0 [&>[data-lesson-hud]]:flex-1";

/** The lesson bar: progress, timer, mastery, streak and a hint, in the realm's colours. */
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
}) {
  const [hintOpen, setHintOpen] = useState(false);
  const isMeasurement = realmId === "measurement";
  const isStarpath = realmId === "space";
  const isStatistics = realmId === "statistics";
  const isPattern = realmId === "pattern";
  const isChance = realmId === "chance";

  const theme = lessonBarTheme(realmId);
  const hintLabel = isMeasurement ? "Clue" : isChance ? "Chance Hint" : "Hint";
  const HintIcon = isChance ? Dices : Lightbulb;

  return (
    <div data-lesson-hud className="relative">
      <div aria-hidden className="pointer-events-none absolute -inset-[2px] rounded-[18px]" style={{ background: theme.bezel }} />
      <div className="relative overflow-hidden rounded-2xl p-2.5" style={{ background: theme.plate, boxShadow: theme.plateShadow }}>
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: theme.dots, backgroundSize: "22px 22px" }} />
        <div className="relative flex flex-wrap items-stretch gap-2.5">
          <div className="min-w-[220px] flex-[2_1_260px]">
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
          </div>
          <div className="shrink-0">
            <LessonTimer seconds={Math.max(0, secondsLeft)} total={totalSeconds} realmId={realmId} />
          </div>
          <div data-lesson-stats className="hidden flex-[1_1_170px] sm:block">
            <LessonMasteryTile accuracy={accuracy} realmId={realmId} />
          </div>
          {/* On phones the streak shows only once one is running. */}
          <div className={comboCount > 0 ? "flex-[1_1_190px]" : "hidden flex-[1_1_190px] sm:block"}>
            <ComboCounter
              count={comboCount}
              cave={levelNumber === 7}
              chainLabel={levelNumber === 7 ? "CRYSTAL STREAK" : isMeasurement ? "EXPLORER STREAK" : isStarpath ? "STAR CHAIN" : isStatistics ? "DATA STREAK" : isPattern ? "PATTERN STREAK" : isChance ? "CHANCE STREAK" : undefined}
              realmId={realmId}
            />
          </div>
          {hint ? (
            <div className="flex-[0_1_170px]">
              <button
                type="button"
                onClick={() => setHintOpen((open) => !open)}
                aria-expanded={hintOpen}
                className="flex h-full min-h-12 w-full items-center gap-2 rounded-xl border px-3 py-2 text-left transition hover:brightness-125"
                style={{ background: theme.tint, borderColor: theme.tintEdge }}
              >
                <span
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
                  style={{ background: "radial-gradient(circle at 35% 30%, #fde68a 0%, #f59e0b 60%, #78350f 100%)", boxShadow: "inset 0 0 4px rgba(254,240,138,0.6)" }}
                >
                  <HintIcon className="h-3.5 w-3.5 text-amber-50" />
                </span>
                <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-amber-100">{hintLabel}</span>
                <ChevronDown className={`ml-auto h-4 w-4 text-amber-100/70 transition-transform ${hintOpen ? "rotate-180" : ""}`} />
              </button>
            </div>
          ) : null}
        </div>
        {hint && hintOpen ? (
          <div className="relative mt-2.5 rounded-xl border px-3 py-2.5 text-[15px] font-medium leading-relaxed text-white" style={{ background: theme.tint, borderColor: theme.tintEdge }}>
            <div className="mb-2 flex justify-end">
              <ReadAloudBtn text={hint} />
            </div>
            <MathFormattedText text={hint} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
