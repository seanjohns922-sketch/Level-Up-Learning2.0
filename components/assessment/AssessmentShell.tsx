"use client";

import { ReactNode } from "react";
import { ChevronLeft, Trophy, Zap } from "lucide-react";

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
}: AssessmentShellProps) {
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  const isPost = testType.toLowerCase().includes("post");

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center px-4 py-6 md:py-10">
      {/* ── Mission Header ── */}
      <div className="w-full max-w-2xl mb-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onExit}
            className="flex items-center gap-1 text-sm font-semibold text-slate-400 hover:text-white transition"
          >
            <ChevronLeft className="h-4 w-4" />
            Exit
          </button>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              {year}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {testType}
            </span>
          </div>
        </div>

        {/* Title block */}
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/25">
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
            <span className="text-xs font-bold text-teal-400">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden border border-slate-700/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Question Card ── */}
      <div className="w-full max-w-2xl flex-1">
        <div className="rounded-3xl border border-slate-700/60 bg-slate-800/80 backdrop-blur-sm shadow-2xl shadow-black/30 p-6 md:p-8">
          {/* Question number chip */}
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-teal-500/20 text-xs font-black text-teal-400 border border-teal-500/30">
              {currentIndex + 1}
            </span>
            <div className="h-px flex-1 bg-slate-700/50" />
          </div>

          {/* Prompt zone */}
          <div className="mb-6">
            <h2 className="text-lg md:text-xl font-extrabold text-white leading-snug">
              {questionPrompt}
            </h2>
          </div>

          {/* Answer area */}
          <div className="relative">
            {questionContent}
          </div>
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
                  ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-400 hover:to-emerald-400 shadow-teal-500/25"
                  : "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700/50 shadow-none",
              ].join(" ")}
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
                  ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-400 hover:to-emerald-400 shadow-teal-500/25"
                  : "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700/50 shadow-none",
              ].join(" ")}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
