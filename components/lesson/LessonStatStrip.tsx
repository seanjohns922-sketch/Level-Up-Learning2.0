"use client";

import { CheckCircle, HelpCircle, Target } from "lucide-react";

export function LessonStatStrip({
  questionsAnswered,
  correctAnswers,
  accuracy,
}: {
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
}) {
  const stats = [
    {
      label: "Questions",
      value: questionsAnswered,
      icon: HelpCircle,
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
      color: "text-violet-600",
      bg: "bg-violet-50 border-violet-100",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`rounded-2xl border p-4 shadow-sm ${s.bg} transition-all`}
        >
          <div className="mb-2 flex items-center gap-2">
            <s.icon className={`h-4 w-4 ${s.color}`} />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
              {s.label}
            </span>
          </div>
          <div className="text-3xl font-black text-gray-900 tabular-nums">
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}
