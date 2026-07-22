"use client";

import { useState } from "react";
import { ChevronDown, Lightbulb } from "lucide-react";
import { LessonXPBar } from "@/components/lesson/LessonXPBar";
import { LessonTimer } from "@/components/lesson/LessonTimer";
import { LessonStatStrip } from "@/components/lesson/LessonStatStrip";
import { ComboCounter } from "@/components/lesson/ComboCounter";
import { MathFormattedText } from "@/components/FractionText";
import ReadAloudBtn from "@/components/ReadAloudBtn";

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
        style={isMeasurement ? {
          borderRadius: 18,
          background: "linear-gradient(135deg, rgba(200,160,48,0.42) 0%, rgba(120,90,15,0.18) 50%, rgba(200,160,48,0.36) 100%)",
        } : isStarpath ? {
          borderRadius: 18,
          background: "linear-gradient(135deg, rgba(103,232,249,0.72) 0%, rgba(124,58,237,0.68) 48%, rgba(240,171,252,0.52) 100%)",
        } : {
          clipPath: "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)",
          background: "linear-gradient(135deg, rgba(94,234,212,0.4) 0%, rgba(15,118,110,0.2) 50%, rgba(94,234,212,0.3) 100%)",
        }}
      />
      <div
        className="relative p-3.5 space-y-3 overflow-hidden"
        style={isMeasurement ? {
          borderRadius: 16,
          background: "linear-gradient(135deg, #140e04 0%, #2a1a06 50%, #3d2808 100%)",
          boxShadow: "inset 0 1px 0 rgba(200,160,48,0.18), inset 0 -10px 20px rgba(0,0,0,0.45), 0 0 18px rgba(109,40,217,0.08)",
        } : isStarpath ? {
          borderRadius: 16,
          background: "linear-gradient(145deg, #10062b 0%, #17164c 48%, #073448 100%)",
          boxShadow: "inset 0 1px 0 rgba(165,243,252,0.20), inset 0 -14px 28px rgba(2,6,23,0.58), 0 0 26px rgba(124,58,237,0.20)",
        } : {
          clipPath: "polygon(13px 0, 100% 0, 100% calc(100% - 13px), calc(100% - 13px) 100%, 0 100%, 0 13px)",
          background: "linear-gradient(135deg, #021716 0%, #042925 50%, #053b35 100%)",
          boxShadow: "inset 0 1px 0 rgba(94,234,212,0.18), inset 0 -10px 20px rgba(0,0,0,0.45)",
        }}
      >
        {isStarpath ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1.4px)",
              backgroundSize: "26px 26px",
            }}
          />
        ) : null}
        {/* Compact crumb + title */}
        {showCrumb && (
          <div>
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-[0.2em]"
              style={isMeasurement ? {
                border: "1px solid rgba(200,160,48,0.35)",
                background: "rgba(60,30,5,0.4)",
                color: "rgba(240,210,150,0.88)",
              } : isStarpath ? {
                border: "1px solid rgba(103,232,249,0.34)",
                background: "rgba(124,58,237,0.18)",
                color: "#cffafe",
              } : {
                border: "1px solid rgba(94,234,212,0.3)",
                background: "rgba(94,234,212,0.1)",
                color: "rgba(167,243,208,0.9)",
              }}
            >
              {levelNumber === 0 ? "Ground" : `L${levelNumber}`} · W{week} · L{lessonNumber}
            </div>
            {lessonTitle ? (
              <div className="mt-1.5 text-[13px] font-bold leading-snug text-white/95 line-clamp-2">
                {lessonTitle}
              </div>
            ) : null}
            {targetLabel ? (
              <div
                className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.16em]"
                style={isMeasurement ? {
                  border: "1px solid rgba(139,92,246,0.3)",
                  background: "rgba(109,40,217,0.12)",
                  color: "rgba(196,181,253,0.9)",
                } : isStarpath ? {
                  border: "1px solid rgba(240,171,252,0.30)",
                  background: "rgba(217,70,239,0.12)",
                  color: "#f5d0fe",
                } : {
                  border: "1px solid rgba(110,231,183,0.3)",
                  background: "rgba(110,231,183,0.1)",
                  color: "#d1fae5",
                }}
              >
                {targetLabel}
              </div>
            ) : null}
          </div>
        )}

        {/* XP + Timer */}
        <div className="flex items-stretch gap-2 lg:flex-col lg:items-stretch">
          <div className="flex-1 min-w-0">
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
          <div className="flex-shrink-0 lg:self-end">
            <LessonTimer seconds={Math.max(0, secondsLeft)} total={totalSeconds} realmId={realmId} />
          </div>
        </div>

        {/* Stats strip */}
        <div className="lg:[&>div]:!grid-cols-1">
          <LessonStatStrip
            questionsAnswered={questionsAnswered}
            correctAnswers={correctAnswers}
            accuracy={accuracy}
            realmId={realmId}
          />
        </div>

        {/* Combo chain counter */}
        <ComboCounter
          count={comboCount}
          chainLabel={isMeasurement ? "EXPLORER STREAK" : isStarpath ? "STAR CHAIN" : undefined}
          realmId={realmId}
        />

        {/* Collapsible hint */}
        {hint ? (
          <div>
            <button
              type="button"
              onClick={() => setHintOpen((v) => !v)}
              className="group relative flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition"
              style={isMeasurement ? {
                border: "1px solid rgba(200,160,48,0.3)",
                background: hintOpen ? "rgba(200,160,48,0.1)" : "rgba(200,160,48,0.07)",
                boxShadow: hintOpen ? "0 0 14px rgba(200,160,48,0.15)" : undefined,
              } : {
                border: "1px solid rgba(251,191,36,0.3)",
                background: "rgba(245,158,11,0.1)",
                boxShadow: hintOpen ? "0 0 14px rgba(251,191,36,0.18)" : undefined,
              }}
            >
              <span
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center"
                style={isMeasurement ? {
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 30%, #c8a030 0%, #4a3010 65%, #1a0e04 100%)",
                  boxShadow: "inset 0 0 4px rgba(200,160,48,0.6)",
                } : {
                  clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
                  background: "radial-gradient(circle at 35% 30%, #fbbf24 0%, #b45309 65%, #451a03 100%)",
                  boxShadow: "inset 0 0 4px rgba(254,240,138,0.6)",
                }}
              >
                <Lightbulb className="h-3 w-3 text-amber-50" />
              </span>
              <span
                className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]"
                style={{ color: isMeasurement ? "rgba(240,210,150,0.85)" : "rgba(253,230,138,0.9)" }}
              >
                {isMeasurement ? "Clue" : "Hint"}
              </span>
              <ChevronDown
                className={`ml-auto h-3.5 w-3.5 transition-transform ${hintOpen ? "rotate-180" : ""}`}
                style={{ color: isMeasurement ? "rgba(240,210,150,0.6)" : "rgba(253,230,138,0.7)" }}
              />
            </button>
            {hintOpen && (
              <div
                className="mt-1.5 rounded-lg px-3 py-2.5 text-[13px] font-medium leading-relaxed"
                style={isMeasurement ? {
                  border: "1px solid rgba(200,160,48,0.22)",
                  background: "linear-gradient(135deg, #1a1304 0%, #2e1f05 100%)",
                  boxShadow: "inset 0 1px 0 rgba(200,160,48,0.15)",
                  color: "rgba(240,220,175,0.92)",
                } : {
                  border: "1px solid rgba(251,191,36,0.25)",
                  background: "linear-gradient(135deg, #1a1305 0%, #2e1f05 100%)",
                  boxShadow: "inset 0 1px 0 rgba(251,191,36,0.18)",
                  color: "rgba(255,251,235,0.95)",
                }}
              >
                <div className="mb-2 flex justify-end">
                  <ReadAloudBtn text={hint} />
                </div>
                <MathFormattedText text={hint} />
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
