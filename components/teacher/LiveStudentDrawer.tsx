"use client";

import { formatRelativeTime, formatTimeActive, getLiveStatusTone, type LiveStudentStatus } from "@/lib/live-class";

export type LiveStudentEventRow = {
  id: string;
  event_type: string;
  created_at: string;
  payload: {
    questionText?: string | null;
    selectedAnswer?: string | null;
    correctAnswer?: string | null;
    isCorrect?: boolean | null;
    activityLabel?: string | null;
    lessonTitle?: string | null;
    questionOptions?: string[] | null;
    currentStepLabel?: string | null;
    progressLabel?: string | null;
  } | null;
};

export type LiveStudentDrawerData = {
  id: string;
  displayName: string;
  status: LiveStudentStatus;
  currentLevel?: string | null;
  currentWeek?: number | null;
  currentLesson?: string | null;
  currentLessonTitle?: string | null;
  currentActivityLabel?: string | null;
  currentQuestionText?: string | null;
  currentQuestionOptions?: string[] | null;
  currentStepLabel?: string | null;
  latestSelectedAnswer?: string | null;
  latestCorrectAnswer?: string | null;
  latestAnswerCorrect?: boolean | null;
  lastActiveAt?: string | null;
  timeOnCurrentQuestion?: number | null;
  lastEventText?: string | null;
  aiIssue?: string | null;
  aiLikelyGap?: string | null;
  aiSuggestedAction?: string | null;
};

function formatTimelineLabel(eventType: string) {
  switch (eventType) {
    case "lesson_started":
      return "Started lesson";
    case "activity_started":
      return "Started activity";
    case "question_loaded":
      return "Loaded question";
    case "answer_correct":
      return "Answered correctly";
    case "answer_incorrect":
      return "Answered incorrectly";
    case "hint_used":
      return "Used hint";
    case "lesson_completed":
      return "Completed lesson";
    case "quiz_started":
      return "Started quiz";
    case "quiz_completed":
      return "Completed quiz";
    case "idle_detected":
      return "Marked idle";
    default:
      return eventType.replace(/_/g, " ");
  }
}

export function LiveStudentDrawer({
  open,
  onClose,
  student,
  events,
}: {
  open: boolean;
  onClose: () => void;
  student: LiveStudentDrawerData | null;
  events: LiveStudentEventRow[];
}) {
  if (!open || !student) return null;

  const tone = getLiveStatusTone(student.status);

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label="Close live student drawer"
        className="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 h-full w-full max-w-[460px] overflow-y-auto border-l border-slate-200 bg-white shadow-[0_24px_64px_rgba(15,23,42,0.28)]">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/96 px-5 py-4 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-slate-500">
                Live Student
              </div>
              <h2 className="mt-1 text-xl font-black text-slate-900">{student.displayName}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-bold ${tone.badge}`}>
                  <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
                  {student.status === "on_track"
                    ? "On Track"
                    : student.status === "check_in"
                    ? "Check-in"
                    : student.status === "needs_support"
                    ? "Needs Support"
                    : "Idle / Away"}
                </span>
                <span>
                  {student.currentWeek ? `Week ${student.currentWeek}` : "No week"}
                  {student.currentLesson ? ` · ${student.currentLesson}` : ""}
                </span>
                <span>{formatRelativeTime(student.lastActiveAt)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-slate-500">
              Current Activity
            </div>
            <div className="mt-2 text-sm text-slate-700">
              <div className="font-bold text-slate-900">
                {student.currentLessonTitle ?? student.currentLesson ?? "Current lesson"}
              </div>
              <div className="mt-1">
                {student.currentActivityLabel ?? "Activity in progress"}
              </div>
              {student.currentQuestionText ? (
                <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Current Question
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">{student.currentQuestionText}</div>
                  {student.currentStepLabel ? (
                    <div className="mt-2 text-xs font-medium text-sky-700">
                      Current step: {student.currentStepLabel}
                    </div>
                  ) : null}
                  {student.currentQuestionOptions && student.currentQuestionOptions.length > 0 ? (
                    <div className="mt-3 grid gap-2">
                      {student.currentQuestionOptions.map((option) => (
                        <div
                          key={option}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {student.latestSelectedAnswer || student.latestCorrectAnswer ? (
                    <div className="mt-3 grid gap-2 text-sm">
                      {student.latestSelectedAnswer ? (
                        <div>
                          <span className="font-semibold text-slate-500">Latest answer:</span>{" "}
                          <span className="font-bold text-slate-900">{student.latestSelectedAnswer}</span>
                        </div>
                      ) : null}
                      {student.latestCorrectAnswer ? (
                        <div>
                          <span className="font-semibold text-slate-500">Correct answer:</span>{" "}
                          <span className="font-bold text-slate-900">{student.latestCorrectAnswer}</span>
                        </div>
                      ) : null}
                      {student.latestAnswerCorrect !== null && student.latestAnswerCorrect !== undefined ? (
                        <div
                          className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-bold ${
                            student.latestAnswerCorrect
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {student.latestAnswerCorrect ? "Correct" : "Incorrect"}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}
              <div className="mt-3 text-xs text-slate-500">
                {student.lastEventText ?? "Working"} · On question for{" "}
                {formatTimeActive(student.timeOnCurrentQuestion)}
              </div>
            </div>
          </section>

          {(student.aiIssue || student.aiSuggestedAction) && (
            <section className={`rounded-2xl border p-4 ${tone.badge} ${tone.border}`}>
              <div className="text-[11px] font-mono font-bold uppercase tracking-[0.18em]">
                AI Insight
              </div>
              {student.aiIssue ? <div className="mt-2 text-sm font-semibold">{student.aiIssue}</div> : null}
              {student.aiLikelyGap ? (
                <div className="mt-2 text-sm">
                  <span className="font-bold">Likely Gap:</span> {student.aiLikelyGap}
                </div>
              ) : null}
              {student.aiSuggestedAction ? (
                <div className="mt-2 text-sm">
                  <span className="font-bold">Suggested Teacher Action:</span> {student.aiSuggestedAction}
                </div>
              ) : null}
            </section>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-slate-500">
              Recent Activity Timeline
            </div>
            <div className="mt-3 grid gap-3">
              {events.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">
                  No live events yet for this student.
                </div>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="grid grid-cols-[72px_1fr] gap-3 text-sm">
                    <div className="font-mono text-xs uppercase tracking-[0.16em] text-slate-400">
                      {new Date(event.created_at).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <div className="font-semibold text-slate-900">{formatTimelineLabel(event.event_type)}</div>
                      {event.payload?.lessonTitle || event.payload?.activityLabel ? (
                        <div className="mt-1 text-xs text-slate-500">
                          {[event.payload?.lessonTitle, event.payload?.activityLabel].filter(Boolean).join(" · ")}
                        </div>
                      ) : null}
                      {event.payload?.questionText ? (
                        <div className="mt-1 text-sm text-slate-700">{event.payload.questionText}</div>
                      ) : null}
                      {event.payload?.selectedAnswer ? (
                        <div className="mt-1 text-xs text-slate-500">
                          Selected: <span className="font-semibold text-slate-700">{event.payload.selectedAnswer}</span>
                        </div>
                      ) : null}
                      {event.payload?.correctAnswer ? (
                        <div className="mt-1 text-xs text-slate-500">
                          Correct: <span className="font-semibold text-slate-700">{event.payload.correctAnswer}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
