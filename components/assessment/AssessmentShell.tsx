"use client";

import { ReactNode } from "react";
import { ChevronLeft, Home, LogOut, DoorOpen, Trophy, Zap } from "lucide-react";
import { MathFormattedText } from "@/components/FractionText";
import { formatStudentLevelLabel } from "@/lib/studentLevelLabel";
import { getRealmTheme } from "@/lib/useRealmTheme";

interface AssessmentShellProps {
  /** "Pre-Test" or "Post-Test" */
  testType: string;
  year: string;
  currentIndex: number;
  totalQuestions: number;
  subtitle?: string;
  questionPrompt: string;
  questionContent: ReactNode;
  hasAnswer: boolean;
  isLast: boolean;
  submitted?: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onExit: () => void;
  /** When provided, shows the "I Don't Know" skip button below the answers. */
  onIdk?: () => void;
  /** When provided, replaces the single Exit control with Home / Exit / Logout. */
  onHome?: () => void;
  onExitAssessment?: () => void;
  onLogout?: () => void;
  realmId?: string;
}

export default function AssessmentShell({
  testType,
  year,
  currentIndex,
  totalQuestions,
  subtitle,
  questionPrompt,
  questionContent,
  hasAnswer,
  isLast,
  submitted,
  onBack,
  onNext,
  onSubmit,
  onExit,
  onIdk,
  onHome,
  onExitAssessment,
  onLogout,
  realmId,
}: AssessmentShellProps) {
  const hasExitMenu = Boolean(onHome || onExitAssessment || onLogout);
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  const isPost = testType.toLowerCase().includes("post");
  const studentLevelLabel = formatStudentLevelLabel(year);
  const theme = getRealmTheme(realmId);
  const titleIconGradient = theme.isMeasurement
    ? "linear-gradient(135deg, #7c5a20 0%, #b8893a 55%, #d6b86c 100%)"
    : "linear-gradient(135deg, #14b8a6 0%, #059669 100%)";
  const progressTrack = theme.isMeasurement ? "rgba(214,184,108,0.22)" : "rgba(94,234,212,0.18)";
  const progressBg = theme.ctaGradientCss;

  return (
    <main
      className="min-h-screen flex flex-col items-center px-4 py-6 md:py-10"
      style={{
        background: theme.isMeasurement
          ? "linear-gradient(180deg, #140d04 0%, #2a1a06 40%, #120b03 100%)"
          : "linear-gradient(to bottom, rgb(2 6 23), rgb(15 23 42), rgb(2 6 23))",
      }}
    >
      {/* ── Mission Header ── */}
      <div className="w-full max-w-2xl mb-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          {hasExitMenu ? (
            <div className="flex items-center gap-1.5">
              {onHome && (
                <button
                  onClick={onHome}
                  title="Save & go Home"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-800/80 border border-slate-700/60 hover:bg-slate-700 hover:text-white transition"
                >
                  <Home className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Home</span>
                </button>
              )}
              {onExitAssessment && (
                <button
                  onClick={onExitAssessment}
                  title="Save & exit assessment"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-800/80 border border-slate-700/60 hover:bg-slate-700 hover:text-white transition"
                >
                  <DoorOpen className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Exit</span>
                </button>
              )}
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Save & log out"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 hover:text-rose-200 transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onExit}
              className="flex items-center gap-1 text-sm font-semibold text-slate-400 hover:text-white transition"
            >
              <ChevronLeft className="h-4 w-4" />
              Exit
            </button>
          )}

          <div className="flex items-center gap-2">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{
                background: theme.chipBg,
                color: theme.chipText,
                border: `1px solid ${theme.chipBorder}`,
              }}
            >
              {studentLevelLabel}
            </span>
            <span
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{
                background: theme.chipBg,
                color: theme.chipText,
                border: `1px solid ${theme.chipBorder}`,
              }}
            >
              {testType}
            </span>
          </div>
        </div>

        {/* Title block */}
        <div className="flex items-center gap-3 mb-1">
          <div
            className="flex items-center justify-center h-10 w-10 rounded-xl shadow-lg"
            style={{ background: titleIconGradient, boxShadow: theme.ctaShadow }}
          >
            {isPost ? (
              <Trophy className="h-5 w-5 text-white" />
            ) : (
              <Zap className="h-5 w-5 text-white" />
            )}
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              {isPost ? "Final Challenge" : "Skill Check"}
            </h1>
            <p className="text-sm text-slate-400">
              {subtitle ??
                (isPost
                  ? "Complete all questions to unlock your Legend"
                  : `${totalQuestions} questions · Show what you know`)}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-400">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span className="text-xs font-bold" style={{ color: theme.accentText }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div
            className="h-2.5 w-full rounded-full overflow-hidden border border-slate-700/50"
            style={{ background: progressTrack }}
          >
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ background: progressBg, width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Question Card ── */}
      <div className="w-full max-w-2xl flex-1">
        <div className="rounded-3xl border border-slate-700/60 bg-slate-800/80 backdrop-blur-sm shadow-2xl shadow-black/30 p-6 md:p-8">
          {/* Question number chip */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className="inline-flex items-center justify-center h-7 w-7 rounded-lg text-xs font-black"
              style={{
                background: theme.chipBg,
                color: theme.accentText,
                border: `1px solid ${theme.chipBorder}`,
              }}
            >
              {currentIndex + 1}
            </span>
            <div className="h-px flex-1 bg-slate-700/50" />
          </div>

          {/* Prompt zone */}
          <div className="mb-6">
            <h2 className="text-lg md:text-xl font-extrabold text-white leading-snug">
              <MathFormattedText text={questionPrompt} />
            </h2>
          </div>

          {/* Answer area */}
          <div className="relative">
            {questionContent}
          </div>

          {/* "I Don't Know" — marks incorrect, records the response, advances */}
          {onIdk && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={onIdk}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-slate-300 bg-slate-700/40 border border-slate-600/60 hover:bg-slate-700/70 hover:text-white transition active:scale-[0.98]"
              >
                <span className="text-lg leading-none">🤔</span>
                I Don&apos;t Know — Skip This Question
              </button>
            </div>
          )}
        </div>

        {/* ── Navigation ── */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            disabled={currentIndex === 0}
            className={[
              "px-5 py-3 rounded-2xl font-bold text-sm transition",
              currentIndex === 0
                ? "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700/50"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/50 hover:text-white",
            ].join(" ")}
          >
            Back
          </button>

          {isLast ? (
            <button
              onClick={onSubmit}
              disabled={!hasAnswer || submitted}
              className={[
                "px-8 py-3 rounded-2xl font-extrabold text-sm transition shadow-lg",
                hasAnswer && !submitted
                  ? `${theme.ctaGradientClass} ${theme.ctaHoverGradientClass} text-white`
                  : "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700/50 shadow-none",
              ].join(" ")}
              style={hasAnswer && !submitted ? { boxShadow: theme.ctaShadow } : undefined}
            >
              {isPost ? "Submit" : "Finish"}
            </button>
          ) : (
            <button
              onClick={onNext}
              disabled={!hasAnswer}
              className={[
                "px-8 py-3 rounded-2xl font-extrabold text-sm transition shadow-lg",
                hasAnswer
                  ? `${theme.ctaGradientClass} ${theme.ctaHoverGradientClass} text-white`
                  : "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700/50 shadow-none",
              ].join(" ")}
              style={hasAnswer ? { boxShadow: theme.ctaShadow } : undefined}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
