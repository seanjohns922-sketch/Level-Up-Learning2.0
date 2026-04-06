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
    <div className="grid grid-cols-3 gap-2">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`rounded-2xl border p-3 ${s.bg} transition-all`}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
              {s.label}
            </span>
          </div>
          <div className="text-xl font-black text-gray-900 tabular-nums">
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}
