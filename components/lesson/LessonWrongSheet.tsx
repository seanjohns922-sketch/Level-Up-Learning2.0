"use client";

import type { CSSProperties, ReactNode } from "react";
import { AlertCircle, ArrowRight, Lightbulb } from "lucide-react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { QUIZ_BUTTON } from "@/components/quiz/QuizUi";
import { getWeeklyQuizTheme } from "@/lib/weekly-quiz-theme";

/**
 * "Not quite" after a wrong answer in lesson practice: a sheet that sticks to
 * the bottom of the screen so the question stays visible above it. Shows what
 * the learner gave beside the correct answer, the tip, and Next Question.
 */
export function LessonWrongSheet({
  realmId,
  answerLabel,
  studentAnswer,
  correctAnswer,
  explanation,
  speech,
  error,
  nextLabel,
  nextDisabled = false,
  onNext,
}: {
  realmId?: string;
  answerLabel: string;
  studentAnswer?: ReactNode;
  correctAnswer?: ReactNode;
  explanation?: ReactNode;
  speech: { text: string; speechKey: string };
  error?: string | null;
  nextLabel: string;
  nextDisabled?: boolean;
  onNext: () => void;
}) {
  return (
    <section
      data-lesson-wrong-feedback
      role="status"
      style={getWeeklyQuizTheme(realmId ?? "number") as CSSProperties}
      className="sticky bottom-0 z-30 mt-5 rounded-t-[28px] rounded-b-[18px] border-t-[3px] border-orange-500 bg-[image:var(--quiz-hero)] px-4 pb-5 pt-3 text-white shadow-[0_-18px_50px_rgba(0,0,0,0.35)] sm:px-7"
    >
      <span aria-hidden="true" className="mx-auto mb-3 block h-1.5 w-14 rounded-full bg-white/25" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-orange-500 shadow-[0_5px_0_#9a3412]">
            <AlertCircle className="h-7 w-7 text-white" />
          </span>
          <div>
            <p className="font-[family-name:var(--font-display)] text-2xl font-black sm:text-3xl">Not quite.</p>
            <p className="text-base font-semibold text-orange-200">Keep going!</p>
          </div>
        </div>
        <ReadAloudBtn
          text={speech.text}
          speechKey={speech.speechKey}
          label="Read feedback"
          className="shrink-0 !border-white/20 !bg-white/10 !text-white hover:!bg-white/20"
        />
      </div>

      {studentAnswer != null || correctAnswer != null ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {studentAnswer != null ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-orange-400/50 bg-orange-500/10 px-4 py-3">
              <span className="text-base font-bold text-orange-200">{answerLabel}</span>
              <span className="text-right font-[family-name:var(--font-display)] text-2xl font-black text-orange-300 line-through decoration-[3px]">{studentAnswer}</span>
            </div>
          ) : null}
          {correctAnswer != null ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-emerald-400 bg-emerald-500/15 px-4 py-3">
              <span className="text-base font-bold text-emerald-100">Correct answer</span>
              <span className="text-right font-[family-name:var(--font-display)] text-2xl font-black text-emerald-300">{correctAnswer}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {explanation ? (
          <div className="flex min-w-0 flex-[1_1_320px] items-start gap-3 rounded-2xl bg-white/[0.07] px-4 py-3">
            <Lightbulb className="mt-0.5 h-6 w-6 shrink-0 text-[var(--quiz-rune)]" aria-hidden="true" />
            <div className="whitespace-pre-line text-lg font-semibold leading-snug">{explanation}</div>
          </div>
        ) : null}
        <button type="button" onClick={onNext} disabled={nextDisabled} className={`${QUIZ_BUTTON.primary} ml-auto min-h-16 px-8 text-xl`}>
          {nextLabel}
          <ArrowRight className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
      {error ? <p className="mt-3 text-base font-bold text-orange-200">{error}</p> : null}
    </section>
  );
}
