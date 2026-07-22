"use client";

import { Trophy, Star, Target, CheckCircle } from "lucide-react";
import { calcXP } from "./LessonXPBar";
import { getRealmTheme } from "@/lib/useRealmTheme";

export function LessonCompleteCard({
  lessonTitle,
  questionsAnswered,
  correctAnswers,
  xpCorrectAnswers,
  accuracy,
  onExit,
  realmId,
  eyebrow,
  completionTitle,
  completionMessage,
  exitLabel,
}: {
  lessonTitle: string;
  questionsAnswered: number;
  correctAnswers: number;
  xpCorrectAnswers?: number;
  accuracy: number;
  onExit: () => void;
  realmId?: string;
  eyebrow?: string;
  completionTitle?: string;
  completionMessage?: string;
  exitLabel?: string;
}) {
  const xp = calcXP(xpCorrectAnswers ?? correctAnswers);
  const theme = getRealmTheme(realmId);

  return (
    <div className="relative">
      {/* Bezel — matches LessonHUDRail */}
      <div
        aria-hidden
        className="absolute -inset-[2px] pointer-events-none"
        style={{
          clipPath:
            "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)",
          background: theme.isMeasurement
            ? "linear-gradient(135deg, rgba(214,184,108,0.45) 0%, rgba(138,100,34,0.22) 50%, rgba(232,201,126,0.35) 100%)"
            : "linear-gradient(135deg, rgba(94,234,212,0.4) 0%, rgba(15,118,110,0.2) 50%, rgba(94,234,212,0.3) 100%)",
        }}
      />
      <div
        className="relative overflow-hidden"
        style={{
          clipPath:
            "polygon(13px 0, 100% 0, 100% calc(100% - 13px), calc(100% - 13px) 100%, 0 100%, 0 13px)",
          background: theme.cardSurface,
          boxShadow: theme.cardInsetShadow,
        }}
      >
        {/* Hero */}
        <div
          className="px-6 py-7 text-center border-b"
          style={{ borderColor: theme.cardBorderTint }}
        >
          <div
            className="mx-auto mb-3 flex h-14 w-14 items-center justify-center"
            style={{
              clipPath:
                "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
              background: theme.trophyGradient,
              boxShadow: theme.trophyShadow,
            }}
          >
            <Trophy
              className="h-6 w-6"
              style={{ color: theme.isMeasurement ? "#fff7e0" : "#ccfbf1" }}
            />
          </div>
          <div
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-[0.2em]"
            style={{
              borderColor: theme.chipBorder,
              background: theme.chipBg,
              color: theme.chipText,
            }}
          >
            {eyebrow ?? "Lesson Complete"}
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-[-0.01em] text-white">
            {completionTitle ?? lessonTitle}
          </h2>
        </div>

        <div className="p-4 space-y-3">
          {/* XP earned */}
          <div
            className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-4 text-center"
            style={{ boxShadow: "inset 0 1px 0 rgba(251,191,36,0.18)" }}
          >
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Star className="h-3.5 w-3.5 text-amber-200" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-amber-200">
                XP Earned
              </span>
            </div>
            <div className="text-3xl font-bold text-amber-100">{xp} XP</div>
          </div>

          {/* Stats — 3 col, matches HUD aesthetic */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Questions", value: questionsAnswered, icon: CheckCircle },
              { label: "Correct", value: correctAnswers, icon: CheckCircle },
              { label: "Accuracy", value: `${accuracy}%`, icon: Target },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-lg border px-2 py-3 text-center"
                style={{
                  borderColor: theme.statBorder,
                  background: theme.statBg,
                  boxShadow: theme.isMeasurement
                    ? "inset 0 1px 0 rgba(232,201,126,0.14)"
                    : "inset 0 1px 0 rgba(94,234,212,0.12)",
                }}
              >
                <s.icon
                  className="h-3.5 w-3.5 mx-auto mb-1"
                  style={{ color: theme.statIcon }}
                />
                <div className="text-xl font-bold text-white">{s.value}</div>
                <div
                  className="text-[9px] font-mono font-bold uppercase tracking-[0.18em] mt-0.5"
                  style={{ color: theme.statLabel }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Status note */}
          <div
            className="rounded-lg border px-3 py-2 text-center text-[12px] font-semibold"
            style={{
              borderColor: theme.statBorder,
              background: theme.statBg,
              color: theme.isMeasurement ? "#f5e6c4" : "#ccfbf1",
            }}
          >
            {completionMessage ?? "Nice work — your progress has been updated."}
          </div>

          <button
            type="button"
            onClick={onExit}
            className="w-full rounded-lg px-6 py-3 text-sm font-bold text-white transition active:scale-[0.99]"
            style={{
              background: theme.ctaGradientCss,
              boxShadow: theme.isMeasurement
                ? "inset 0 1px 0 rgba(245,220,160,0.35), 0 0 18px rgba(214,184,108,0.30)"
                : "inset 0 1px 0 rgba(204,251,241,0.3), 0 0 18px rgba(45,212,191,0.25)",
            }}
          >
            {exitLabel ?? "Return to Week →"}
          </button>
        </div>
      </div>
    </div>
  );
}
