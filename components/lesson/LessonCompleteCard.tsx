"use client";

import { Trophy, Star, Target, CheckCircle } from "lucide-react";
import { calcXP } from "./LessonXPBar";

export function LessonCompleteCard({
  lessonTitle,
  questionsAnswered,
  correctAnswers,
  accuracy,
  onExit,
}: {
  lessonTitle: string;
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  onExit: () => void;
}) {
  const xp = calcXP(correctAnswers);

  return (
    <div className="rounded-3xl border border-border/50 bg-card shadow-xl overflow-hidden">
      {/* Hero celebration */}
      <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white px-6 py-8 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
          <Trophy className="h-8 w-8 text-yellow-300" />
        </div>
        <h2 className="text-3xl font-black">Lesson Complete!</h2>
        <p className="mt-1 text-emerald-100 text-sm font-medium">{lessonTitle}</p>
      </div>

      <div className="px-6 py-6 space-y-5">
        {/* XP earned */}
        <div className="rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 p-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Star className="h-5 w-5 text-violet-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-violet-600">
              XP Earned
            </span>
          </div>
          <div className="text-4xl font-black text-violet-700">{xp} XP</div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-extrabold text-emerald-700 shadow-sm">
          Nice work! Your lesson progress has been updated.
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Questions",
              value: questionsAnswered,
              icon: CheckCircle,
              color: "text-blue-600",
              bg: "bg-blue-50 border-blue-100",
            },
            {
              label: "Correct",
              value: correctAnswers,
              icon: CheckCircle,
              color: "text-emerald-600",
              bg: "bg-emerald-50 border-emerald-100",
            },
            {
              label: "Accuracy",
              value: `${accuracy}%`,
              icon: Target,
              color: "text-amber-600",
              bg: "bg-amber-50 border-amber-100",
            },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl border p-4 text-center ${s.bg}`}>
              <s.icon className={`h-4 w-4 mx-auto mb-1 ${s.color}`} />
              <div className="text-2xl font-black text-gray-900">{s.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onExit}
          className="w-full rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-4 text-lg font-extrabold text-white hover:opacity-90 transition-all active:scale-[0.98] shadow-lg shadow-teal-900/20"
        >
          Return to Week →
        </button>
      </div>
    </div>
  );
}
