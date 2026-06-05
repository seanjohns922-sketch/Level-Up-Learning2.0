"use client";

// Shown over a lesson when a saved snapshot is found, so the student can pick up
// exactly where they left off (timer, XP and progress restored) rather than
// restarting the whole lesson.

export default function LessonResumeGate({
  lessonTitle,
  onResume,
  onRestart,
}: {
  lessonTitle?: string;
  onResume: () => void;
  onRestart: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-slate-700/60 bg-slate-900 p-8 text-center shadow-2xl">
        <div className="mb-4 text-5xl">⏸️</div>
        <h2 className="mb-2 text-2xl font-extrabold text-white">Welcome back!</h2>
        <p className="mb-6 text-slate-400">
          You were partway through{lessonTitle ? <> <span className="font-bold text-slate-200">{lessonTitle}</span></> : " this lesson"}.
          Want to pick up where you left off?
        </p>
        <div className="space-y-3">
          <button
            onClick={onResume}
            className="w-full rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 py-3.5 font-extrabold text-white transition hover:from-teal-400 hover:to-emerald-400 active:scale-[0.98]"
          >
            ▶ Resume Lesson
          </button>
          <button
            onClick={onRestart}
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 font-semibold text-slate-300 transition hover:bg-white/10 active:scale-[0.98]"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
}
