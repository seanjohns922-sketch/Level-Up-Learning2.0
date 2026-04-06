"use client";

import ReadAloudBtn from "@/components/ReadAloudBtn";

type Lesson = { id: string; lesson: number; title: string };

type Props = {
  week: number;
  lessonsDone: number;
  topic?: string;
  lessons: Lesson[];
  onContinue: () => void;
};

export default function WeekCard({ week, lessonsDone, topic, lessons, onContinue }: Props) {
  return (
    <div
      className="rounded-3xl border border-white/40 shadow-xl p-5"
      style={{
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.3) inset",
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="inline-flex items-center rounded-full bg-teal-100/80 text-teal-700 px-3 py-1 text-xs font-extrabold tracking-wide">
          WEEK {week}
        </span>
        <span className="text-xs text-gray-500 font-medium">{lessonsDone}/3 done</span>
      </div>
      <div className="flex items-start gap-2">
        <div>
          <h2 className="text-xl font-black text-gray-800 leading-tight">
            Week {week}
          </h2>
          <p className="mt-1 text-sm font-semibold text-teal-700">
            Focus: {topic ?? "Your current focus"}
          </p>
        </div>
        <ReadAloudBtn text={`Week ${week}. Focus: ${topic ?? "Your current focus"}. ${lessonsDone} of 3 lessons done. ${lessons.map(l => `Lesson ${l.lesson}: ${l.title}`).join(". ")}`} />
      </div>

      <div className="mt-3.5 grid gap-2">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="flex items-center gap-3">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100/80 text-teal-700 text-xs font-extrabold flex-shrink-0">
              {lesson.lesson}
            </span>
            <span className="text-sm text-gray-600">{lesson.title}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onContinue}
        className="mt-5 w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 hover:brightness-110 transition-all active:scale-[0.98]"
        type="button"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" /></svg>
        Continue Week {week} →
      </button>
    </div>
  );
}
