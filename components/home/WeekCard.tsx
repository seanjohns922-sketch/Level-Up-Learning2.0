"use client";

import { BookOpen, CheckCircle2, Circle, ArrowRight } from "lucide-react";

type Lesson = { id: string; lesson: number; title: string };

type Props = {
  week: number;
  lessonsDone: number;
  topic?: string;
  lessons: Lesson[];
  onContinue: () => void;
};

export default function WeekCard({ week, lessonsDone, topic, lessons, onContinue }: Props) {
  const progressPct = Math.round((lessonsDone / Math.max(lessons.length, 3)) * 100);

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div>
          <h2 className="text-lg font-black text-gray-900">Course Progress</h2>
          <p className="text-xs text-gray-500 font-medium">Continue where you left off</p>
        </div>
        <button
          onClick={onContinue}
          className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="px-5 pb-5">
        {/* Week module card */}
        <div className="flex gap-4 items-start">
          {/* Module icon */}
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-200/60 flex items-center justify-center flex-shrink-0">
            <BookOpen className="h-8 w-8 text-amber-600" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                WEEK {week}
              </span>
            </div>
            <h3 className="text-sm font-bold text-gray-900 truncate">
              {topic || "Number Focus"}
            </h3>

            {/* Progress bar */}
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-gray-500">{progressPct}% completed</span>
                <span className="text-[10px] font-bold text-amber-600">+{(3 - lessonsDone) * 40} XP on completion</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lesson checklist */}
        <div className="mt-3 grid gap-1.5">
          {lessons.map((lesson, i) => {
            const done = i < lessonsDone;
            return (
              <div key={lesson.id} className="flex items-center gap-2.5 py-1">
                {done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-300 flex-shrink-0" />
                )}
                <span className={`text-xs font-medium ${done ? "text-gray-400 line-through" : "text-gray-700"}`}>
                  Lesson {lesson.lesson}: {lesson.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Continue button */}
        <button
          onClick={onContinue}
          className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 hover:brightness-105 transition-all active:scale-[0.98]"
          type="button"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
