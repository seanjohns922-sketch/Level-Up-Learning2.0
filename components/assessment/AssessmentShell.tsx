"use client";

import { ReactNode } from "react";
import { ChevronLeft, Home, LogOut, DoorOpen, HelpCircle } from "lucide-react";
import { MathFormattedText } from "@/components/FractionText";
import { formatStudentLevelLabel } from "@/lib/studentLevelLabel";
import { getRealmTheme } from "@/lib/useRealmTheme";
import { getStarpathBackground } from "@/lib/starpath-visuals";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";

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
  /** Lesson-native assessment tasks need the same canvas width as lessons. */
  wideContent?: boolean;
  /** The lesson task renders its own prompt and read-aloud control. */
  hidePrompt?: boolean;
  /** Render the answer area on a light panel (lesson-native tasks draw dark text). */
  lightSurface?: boolean;
  /** Per-question answered flags — enables the "check your answers" navigator. */
  answeredFlags?: boolean[];
  /** Jump to an already-reached question (review answers; unanswered stay locked). */
  onJump?: (index: number) => void;
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
  wideContent = false,
  hidePrompt = false,
  lightSurface = false,
  answeredFlags,
  onJump,
}: AssessmentShellProps) {
  // The frontier is the first unanswered question — you may review anything up to
  // and including it, but never jump ahead to questions you haven't answered.
  const firstUnanswered = answeredFlags ? answeredFlags.indexOf(false) : -1;
  const frontier = !answeredFlags
    ? totalQuestions - 1
    : firstUnanswered === -1
      ? totalQuestions - 1
      : firstUnanswered;
  const showNavigator = Boolean(onJump && answeredFlags && totalQuestions > 1);
  const hasExitMenu = Boolean(onHome || onExitAssessment || onLogout);
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  const isPost = testType.toLowerCase().includes("post");
  const studentLevelLabel = formatStudentLevelLabel(year);
  const theme = getRealmTheme(realmId);
  const isSpace = realmId === "space";
  const progressTrack = theme.isMeasurement
    ? "rgba(214,184,108,0.22)"
    : isSpace
      ? "rgba(124,58,237,0.22)"
      : "rgba(94,234,212,0.18)";
  const progressBg = theme.ctaGradientCss;

  return (
    <main
      className="assessment-shell relative min-h-screen flex flex-col items-center px-4 pt-6 md:pt-10"
      data-wide-content={wideContent ? "true" : "false"}
      style={{
        background: theme.isMeasurement
          ? "linear-gradient(180deg, #140d04 0%, #2a1a06 40%, #120b03 100%)"
          : isSpace
            ? "#070a1b"
            : "linear-gradient(to bottom, rgb(2 6 23), rgb(15 23 42), rgb(2 6 23))",
        paddingBottom: "max(7rem, calc(env(safe-area-inset-bottom) + 6rem))",
      }}
    >
      {/* ── Starpath cosmic backdrop (matches the lesson theme) ── */}
      {isSpace && (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getStarpathBackground(year as RealmLevelId) ?? "/images/starpath-home-bg-ground.png"}
            alt=""
            className="h-full w-full object-cover"
            style={{ filter: "brightness(0.32) saturate(1.2)" }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(7,10,27,0.70), rgba(19,12,52,0.86))" }}
          />
        </div>
      )}

      {/* ── Mission Header ── */}
      <div className={`assessment-header relative z-10 w-full ${wideContent ? "max-w-6xl" : "max-w-2xl"} mb-6`}>
        {/* Top bar */}
        <div className="assessment-top-bar flex items-center justify-between mb-4">
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
        <div className="assessment-title-block mb-1">
          <div
            className="text-[11px] font-black uppercase tracking-[0.22em]"
            style={{ color: theme.accentText }}
          >
            {isPost ? "Final Challenge" : "Skill Check"}
          </div>
          <h1 className="mt-1 text-2xl md:text-[2rem] font-black text-white leading-tight tracking-tight">
            {isPost ? "Show what you've mastered" : "Let's see what you know"}
          </h1>
          <p className="mt-1.5 text-sm md:text-base" style={{ color: "rgba(226,232,240,0.72)" }}>
            {subtitle ??
              (isPost
                ? "Complete all questions to unlock your Legend"
                : `${totalQuestions} questions · Show what you know`)}
          </p>
        </div>

        {/* Progress bar */}
        <div className="assessment-progress mt-4">
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

        {/* Review navigator — jump back to any answered question; unanswered stay locked */}
        {showNavigator && answeredFlags && onJump && (
          <div className="assessment-nav-strip mt-4">
            <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Jump to a question
            </div>
            <div className="flex flex-wrap gap-1.5">
              {answeredFlags.map((answered, i) => {
                const reachable = i <= frontier;
                const isCurrent = i === currentIndex;
                const style: React.CSSProperties = !reachable
                  ? { background: "rgba(148,163,184,0.10)", color: "#64748b", border: "1px solid rgba(148,163,184,0.22)" }
                  : isCurrent
                    ? { background: theme.chipBg, color: theme.accentText, border: `2px solid ${theme.accentText}` }
                    : answered
                      ? { background: theme.chipBg, color: theme.accentText, border: `1px solid ${theme.chipBorder}` }
                      : { background: "transparent", color: "rgba(226,232,240,0.7)", border: "1px dashed rgba(148,163,255,0.4)" };
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={!reachable}
                    aria-current={isCurrent ? "true" : undefined}
                    aria-label={`Question ${i + 1}${answered ? ", answered" : ""}${!reachable ? ", locked" : ""}`}
                    onClick={() => reachable && onJump(i)}
                    className={[
                      "flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-xs font-black transition",
                      reachable ? "hover:brightness-110 active:scale-95" : "cursor-not-allowed",
                    ].join(" ")}
                    style={style}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Question Card ── */}
      <div className={`assessment-content relative z-10 w-full ${wideContent ? "max-w-6xl" : "max-w-2xl"} flex-1`}>
        <div
          className={[
            "assessment-question-card rounded-3xl border backdrop-blur-sm shadow-2xl shadow-black/30 p-6 md:p-8",
            isSpace ? "border-cyan-200/25 bg-[#150f38]/80" : "border-slate-700/60 bg-slate-800/80",
          ].join(" ")}
        >
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
          {!hidePrompt && (
            <div className="mb-6">
              <h2 className="text-lg md:text-xl font-extrabold text-white leading-snug">
                <MathFormattedText text={questionPrompt} />
              </h2>
            </div>
          )}

          {/* Answer area — lesson-native tasks draw dark text, so give them a light panel */}
          <div className={lightSurface ? "relative rounded-2xl bg-[#f6f5ff] p-4 text-slate-950 sm:p-6" : "relative"}>
            {questionContent}
          </div>

          {/* "I Don't Know" — marks incorrect, records the response, advances */}
          {onIdk && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={onIdk}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-slate-300 bg-slate-700/40 border border-slate-600/60 hover:bg-slate-700/70 hover:text-white transition active:scale-[0.98]"
              >
                <HelpCircle className="h-5 w-5" />
                I Don&apos;t Know — Skip This Question
              </button>
            </div>
          )}
        </div>

        {/* ── Navigation ── */}
        <div className="assessment-navigation mt-5 flex items-center justify-between gap-3">
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
