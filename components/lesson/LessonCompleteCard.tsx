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
    <div className="rounded-2xl border border-[#E6E8EC] bg-white shadow-sm overflow-hidden">
      {/* Hero — deep slate to match dashboard */}
      <div
        className="relative px-6 py-8 text-center text-white"
        style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)" }}
      >
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#0EA5A4]/15 border border-[#0EA5A4]/30">
          <Trophy className="h-7 w-7 text-[#F59E0B]" />
        </div>
        <h2 className="text-2xl font-bold tracking-[-0.01em]">Lesson Complete</h2>
        <p className="mt-1 text-sm font-medium text-white/70">{lessonTitle}</p>
      </div>

      <div className="px-6 py-6 space-y-5 bg-[#F7F8FA]">
        {/* XP earned — gold reward accent */}
        <div className="rounded-xl border border-[#E6E8EC] bg-white p-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Star className="h-4 w-4 text-[#F59E0B]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748B]">
              XP Earned
            </span>
          </div>
          <div className="text-4xl font-bold text-[#F59E0B]">{xp} XP</div>
        </div>

        <div className="rounded-xl border border-[#E6E8EC] bg-white px-4 py-3 text-center text-sm font-semibold text-[#0F172A]">
          Nice work — your lesson progress has been updated.
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Questions", value: questionsAnswered, icon: CheckCircle },
            { label: "Correct", value: correctAnswers, icon: CheckCircle },
            { label: "Accuracy", value: `${accuracy}%`, icon: Target },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-[#E6E8EC] bg-white p-4 text-center"
            >
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#F1F5F9]">
                <s.icon className="h-4 w-4 text-[#0EA5A4]" />
              </div>
              <div className="text-2xl font-bold text-[#0F172A]">{s.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748B] mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onExit}
          className="w-full rounded-xl bg-[#0EA5A4] px-6 py-3.5 text-base font-bold text-white hover:bg-[#0d9594] transition-all active:scale-[0.99] shadow-sm"
        >
          Return to Week →
        </button>
      </div>
    </div>
  );
}
