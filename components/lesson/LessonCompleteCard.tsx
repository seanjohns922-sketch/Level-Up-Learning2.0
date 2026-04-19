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
    <div className="relative">
      {/* Bezel — matches LessonHUDRail */}
      <div
        aria-hidden
        className="absolute -inset-[2px] pointer-events-none"
        style={{
          clipPath:
            "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)",
          background:
            "linear-gradient(135deg, rgba(94,234,212,0.4) 0%, rgba(15,118,110,0.2) 50%, rgba(94,234,212,0.3) 100%)",
        }}
      />
      <div
        className="relative overflow-hidden"
        style={{
          clipPath:
            "polygon(13px 0, 100% 0, 100% calc(100% - 13px), calc(100% - 13px) 100%, 0 100%, 0 13px)",
          background:
            "linear-gradient(135deg, #021716 0%, #042925 50%, #053b35 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(94,234,212,0.18), inset 0 -10px 20px rgba(0,0,0,0.45)",
        }}
      >
        {/* Hero */}
        <div className="px-6 py-7 text-center border-b border-teal-300/15">
          <div
            className="mx-auto mb-3 flex h-14 w-14 items-center justify-center"
            style={{
              clipPath:
                "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
              background:
                "radial-gradient(circle at 35% 30%, #5eead4 0%, #0f766e 65%, #042925 100%)",
              boxShadow: "inset 0 0 8px rgba(204,251,241,0.5)",
            }}
          >
            <Trophy className="h-6 w-6 text-teal-50" />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-300/30 bg-teal-500/10 px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-teal-200/90">
            Lesson Complete
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-[-0.01em] text-white">
            {lessonTitle}
          </h2>
        </div>

        <div className="p-4 space-y-3">
          {/* XP earned */}
          <div
            className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-4 text-center"
            style={{ boxShadow: "inset 0 1px 0 rgba(251,191,36,0.18)" }}
          >
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Star className="h-3.5 w-3.5 text-amber-200" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-amber-200">
                XP Earned
              </span>
            </div>
            <div className="text-3xl font-bold text-amber-100">{xp} XP</div>
          </div>

          {/* Stats — 3 col, matches HUD aesthetic */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Questions", value: questionsAnswered, icon: CheckCircle },
              { label: "Correct", value: correctAnswers, icon: CheckCircle },
              { label: "Accuracy", value: `${accuracy}%`, icon: Target },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-teal-300/20 bg-teal-500/5 px-2 py-3 text-center"
                style={{ boxShadow: "inset 0 1px 0 rgba(94,234,212,0.12)" }}
              >
                <s.icon className="h-3.5 w-3.5 mx-auto mb-1 text-teal-300" />
                <div className="text-xl font-bold text-white">{s.value}</div>
                <div className="text-[9px] font-mono font-bold uppercase tracking-[0.18em] text-teal-200/70 mt-0.5">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Status note */}
          <div className="rounded-lg border border-teal-300/20 bg-teal-500/5 px-3 py-2 text-center text-[12px] font-semibold text-teal-100">
            Nice work — your progress has been updated.
          </div>

          <button
            type="button"
            onClick={onExit}
            className="w-full rounded-lg px-6 py-3 text-sm font-bold text-white transition active:scale-[0.99]"
            style={{
              background:
                "linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #2dd4bf 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(204,251,241,0.3), 0 0 18px rgba(45,212,191,0.25)",
            }}
          >
            Return to Week →
          </button>
        </div>
      </div>
    </div>
  );
}
