"use client";

import { BookOpen, CheckCircle2, Lightbulb, XCircle } from "lucide-react";

export type ReviewMode = "lesson" | "quiz" | "pretest" | "posttest";

export type MistakeReviewItem = {
  id: string;
  questionNumber: number;
  prompt: string;
  studentAnswer?: string | null;
  correctAnswer?: string | null;
  explanation?: string | null;
  week?: number | null;
  lesson?: number | null;
  lessonTitle?: string | null;
  skillLabel?: string | null;
  taskId?: string | null;
  taskData?: unknown;
};

type MistakeReviewPanelProps = {
  mode: ReviewMode;
  items: MistakeReviewItem[];
  realmId?: string | null;
  title?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  onFinish: () => void;
  onPractice?: (item: MistakeReviewItem) => void;
};

function modeCopy(mode: ReviewMode) {
  if (mode === "pretest") {
    return {
      title: "Review Your Gaps",
      badge: "Diagnostic Review",
      answerLabel: "Incorrect",
      finish: "Continue",
      explanation: "You will learn this during your adventure.",
      showAnswers: false,
      showPracticeButton: false,
    };
  }
  if (mode === "posttest") {
    return {
      title: "Practice Recommendations",
      badge: "Post-Test Review",
      answerLabel: "Needs more practice",
      finish: "Continue",
      explanation: "Practice this lesson to improve.",
      showAnswers: false,
      showPracticeButton: true,
    };
  }
  if (mode === "quiz") {
    return {
      title: "Review My Quiz",
      badge: "Quiz Review",
      answerLabel: "Your answer",
      finish: "Finish Review",
      explanation: "Review the key idea, then continue your adventure.",
      showAnswers: true,
      showPracticeButton: false,
    };
  }
  return {
    title: "Review My Mistakes",
    badge: "Lesson Review",
    answerLabel: "Your answer",
    finish: "Finish Lesson",
    explanation: "Look at the correct answer and try the idea again next time.",
    showAnswers: true,
    showPracticeButton: false,
  };
}

export default function MistakeReviewPanel({
  mode,
  items,
  realmId,
  title,
  emptyTitle = "No mistakes to review",
  emptyMessage = "You answered everything correctly.",
  onFinish,
  onPractice,
}: MistakeReviewPanelProps) {
  const copy = modeCopy(mode);
  const isMeasurement = realmId === "measurement";
  const accent = isMeasurement
    ? {
        page: "bg-[#1b1030]",
        card: "border-amber-300/20 bg-[#fff8e8]",
        badge: "border-amber-300/40 bg-amber-400/15 text-amber-100",
        button: "bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950",
        heading: "text-[#2c1c07]",
      }
    : {
        page: "bg-slate-950",
        card: "border-teal-200/30 bg-white",
        badge: "border-teal-300/35 bg-teal-400/15 text-teal-100",
        button: "bg-trust-blue text-white",
        heading: "text-slate-950",
      };

  return (
    <main className={`min-h-screen ${accent.page} px-4 py-6`}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 text-center">
          <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${accent.badge}`}>
            <BookOpen className="h-4 w-4" />
            {copy.badge}
          </div>
          <h1 className="mt-3 text-3xl font-black text-white">{title ?? copy.title}</h1>
        </div>

        {items.length === 0 ? (
          <div className={`rounded-3xl border p-6 text-center shadow-xl ${accent.card}`}>
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
            <h2 className={`mt-3 text-2xl font-black ${accent.heading}`}>{emptyTitle}</h2>
            <p className="mt-2 text-sm font-semibold text-slate-600">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <article key={item.id} className={`rounded-3xl border p-4 shadow-xl ${accent.card}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                      Question {item.questionNumber}
                    </div>
                    <h2 className={`mt-1 text-lg font-black leading-tight ${accent.heading}`}>{item.prompt}</h2>
                  </div>
                  <XCircle className="h-6 w-6 shrink-0 text-red-500" />
                </div>

                <div className="mt-4 grid gap-2">
                  {copy.showAnswers ? (
                    <>
                      <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-800">
                        <span className="font-black">Your answer:</span> {item.studentAnswer || "Incorrect attempt"}
                      </div>
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800">
                        <span className="font-black">Correct answer:</span> {item.correctAnswer || "See the worked example"}
                      </div>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-800">
                      {copy.answerLabel}
                    </div>
                  )}

                  {(item.week || item.lesson || item.lessonTitle || item.skillLabel) ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
                      {item.week ? `Week ${item.week}` : "Practice"}
                      {item.lesson ? ` · Lesson ${item.lesson}` : ""}
                      {item.lessonTitle ? ` · ${item.lessonTitle}` : item.skillLabel ? ` · ${item.skillLabel}` : ""}
                    </div>
                  ) : null}

                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900">
                    <span className="inline-flex items-center gap-1.5">
                      <Lightbulb className="h-4 w-4" />
                      {item.explanation || copy.explanation}
                    </span>
                  </div>

                  {copy.showPracticeButton && onPractice ? (
                    <button
                      type="button"
                      onClick={() => onPractice(item)}
                      className={`mt-1 rounded-2xl px-4 py-3 text-sm font-black transition hover:brightness-105 ${accent.button}`}
                    >
                      Go to Lesson
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={onFinish}
            className={`rounded-2xl px-6 py-3 text-base font-black shadow-lg transition hover:brightness-105 ${accent.button}`}
          >
            {copy.finish}
          </button>
        </div>
      </div>
    </main>
  );
}
