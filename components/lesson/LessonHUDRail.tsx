"use client";

import { useState } from "react";
import { ChevronDown, Lightbulb } from "lucide-react";
import { LessonXPBar } from "@/components/lesson/LessonXPBar";
import { LessonTimer } from "@/components/lesson/LessonTimer";
import { LessonStatStrip } from "@/components/lesson/LessonStatStrip";
import { MathFormattedText } from "@/components/FractionText";

/**
 * Compact HUD rail used by lesson runners.
 * - Landscape (lg+): rendered as a sticky left rail (~320px) so the question card has the full right column.
 * - Mobile/portrait: stacked above the question card.
 * Hint is collapsed by default (chip) and can be expanded inline.
 */
export function LessonHUDRail({
  levelNumber,
  week,
  lessonNumber,
  lessonTitle,
  targetLabel,
  correctAnswers,
  xpCorrectAnswers,
  questionsAnswered,
  accuracy,
  secondsLeft,
  totalSeconds,
  xpTarget,
  hint,
}: {
  levelNumber?: number;
  week?: number;
  lessonNumber?: number;
  lessonTitle?: string | null;
  targetLabel?: string | null;
  correctAnswers: number;
  xpCorrectAnswers?: number;
  questionsAnswered: number;
  accuracy: number;
  secondsLeft: number;
  totalSeconds: number;
  xpTarget: number;
  hint?: string | null;
}) {
  const [hintOpen, setHintOpen] = useState(false);

  const showCrumb =
    typeof levelNumber === "number" &&
    typeof week === "number" &&
    typeof lessonNumber === "number";

  return (
    <div className="relative">
      {/* Bezel */}
      <div
        aria-hidden
        className="absolute -inset-[2px] pointer-events-none"
        style={{
          clipPath:
            "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)",
          background:
            "linear-gradient(135deg, rgba(94,234,212,0.4) 0%, rgba(15,118,110,0.2) 50%, rgba(94,234,212,0.3) 100%)",
        }}
      />
      <div
        className="relative p-3.5 space-y-3 overflow-hidden"
        style={{
          clipPath:
            "polygon(13px 0, 100% 0, 100% calc(100% - 13px), calc(100% - 13px) 100%, 0 100%, 0 13px)",
          background:
            "linear-gradient(135deg, #021716 0%, #042925 50%, #053b35 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(94,234,212,0.18), inset 0 -10px 20px rgba(0,0,0,0.45)",
        }}
      >
        {/* Compact crumb + title */}
        {showCrumb && (
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-300/30 bg-teal-500/10 px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-teal-200/90">
              L{levelNumber} · W{week} · L{lessonNumber}
            </div>
            {lessonTitle ? (
              <div className="mt-1.5 text-[13px] font-bold leading-snug text-white/95 line-clamp-2">
                {lessonTitle}
              </div>
            ) : null}
            {targetLabel ? (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-300/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-emerald-100">
                {targetLabel}
              </div>
            ) : null}
          </div>
        )}

        {/* XP + Timer */}
        <div className="flex items-stretch gap-2 lg:flex-col lg:items-stretch">
          <div className="flex-1 min-w-0">
            <LessonXPBar correct={xpCorrectAnswers ?? correctAnswers} totalTarget={xpTarget} />
          </div>
          <div className="flex-shrink-0 lg:self-end">
            <LessonTimer seconds={Math.max(0, secondsLeft)} total={totalSeconds} />
          </div>
        </div>

        {/* Stats: 3-col on mobile, 1-col on lg rail */}
        <div className="lg:[&>div]:!grid-cols-1">
          <LessonStatStrip
            questionsAnswered={questionsAnswered}
            correctAnswers={correctAnswers}
            accuracy={accuracy}
          />
        </div>

        {/* Collapsible hint */}
        {hint ? (
          <div>
            <button
              type="button"
              onClick={() => setHintOpen((v) => !v)}
              className="group relative flex w-full items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-left transition hover:bg-amber-500/15"
              style={{ boxShadow: hintOpen ? "0 0 14px rgba(251,191,36,0.18)" : undefined }}
            >
              <span
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center"
                style={{
                  clipPath:
                    "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
                  background:
                    "radial-gradient(circle at 35% 30%, #fbbf24 0%, #b45309 65%, #451a03 100%)",
                  boxShadow: "inset 0 0 4px rgba(254,240,138,0.6)",
                }}
              >
                <Lightbulb className="h-3 w-3 text-amber-50" />
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-amber-200">
                Hint
              </span>
              <ChevronDown
                className={`ml-auto h-3.5 w-3.5 text-amber-200/70 transition-transform ${
                  hintOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {hintOpen && (
              <div
                className="mt-1.5 rounded-lg border border-amber-400/25 px-3 py-2.5 text-[13px] font-medium leading-relaxed text-amber-50/95"
                style={{
                  background:
                    "linear-gradient(135deg, #1a1305 0%, #2e1f05 100%)",
                  boxShadow: "inset 0 1px 0 rgba(251,191,36,0.18)",
                }}
              >
                <MathFormattedText text={hint} />
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
