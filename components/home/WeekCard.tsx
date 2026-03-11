"use client";

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
    <div className="bg-card rounded-3xl shadow-lg shadow-gray-200/60 border border-border p-5">
      <div className="flex items-center gap-3 mb-3">
        <span className="inline-flex items-center rounded-full bg-primary-light text-primary px-3 py-1 text-xs font-extrabold tracking-wide">
          WEEK {week}
        </span>
        <span className="text-xs text-muted-foreground font-medium">{lessonsDone}/3 done</span>
      </div>
      <h2 className="text-xl font-black text-foreground leading-tight">
        {topic ?? "Your current focus"}
      </h2>

      <div className="mt-3.5 grid gap-2">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="flex items-center gap-3">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary-light text-primary text-xs font-extrabold flex-shrink-0">
              {lesson.lesson}
            </span>
            <span className="text-sm text-muted-foreground">{lesson.title}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onContinue}
        className="mt-5 w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-teal-200 hover:shadow-teal-300 hover:brightness-110 transition-all active:scale-[0.98]"
        type="button"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" /></svg>
        Continue Week {week} →
      </button>
    </div>
  );
}
