"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { readProgress } from "@/data/progress";
import { readProgramStore, getWeekProgress } from "@/lib/program-progress";
import { ChevronLeft, Zap, Target, Flame, Clock, BookOpen, TrendingUp } from "lucide-react";
import { getHomeBg, getHomeBgFilter, getVignetteStyle } from "@/lib/levelBand";

export default function RealmStatsPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<ReturnType<typeof readProgress>>(null);
  const [store, setStore] = useState<ReturnType<typeof readProgramStore>>({});

  useEffect(() => {
    setProgress(readProgress());
    setStore(readProgramStore());
  }, []);

  const year = progress?.year ?? "Year 1";
  const week = progress?.assignedWeek ?? 1;
  const levelNum = parseInt(year.replace(/\D/g, ""), 10) || 1;

  const stats = useMemo(() => {
    let xp = 0;
    let totalLessons = 0;
    let completedLessons = 0;
    let quizCount = 0;
    let quizTotal = 0;

    for (let w = 1; w <= 12; w++) {
      const wp = getWeekProgress(store, year, w);
      const done = wp.lessonsCompleted.filter(Boolean).length;
      completedLessons += done;
      totalLessons += 3;
      xp += done * 40;
      if (wp.quizScore !== undefined) {
        xp += Math.round((wp.quizScore / 100) * 60);
        quizCount++;
        quizTotal += wp.quizScore;
      }
    }

    const accuracy = quizCount > 0 ? Math.round(quizTotal / quizCount) : (progress?.scorePercent ?? 0);

    return { xp, completedLessons, totalLessons, accuracy };
  }, [store, year, progress]);

  return (
    <main className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={getHomeBg(levelNum)} alt="" className="w-full h-full object-cover" style={{ filter: getHomeBgFilter(levelNum) }} />
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: getVignetteStyle(levelNum) }} />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-5 pt-4 pb-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:bg-white/20 transition"
            aria-label="Back"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-lg font-black text-white tracking-tight" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
              Number Nexus Stats
            </h1>
            <p className="text-[11px] font-bold text-emerald-400/80 uppercase tracking-widest">Level {levelNum} Progress</p>
          </div>
        </div>

        {/* 2×2 stat cards — Number Nexus teal/emerald palette */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { icon: Zap, label: "XP Earned", value: stats.xp.toLocaleString(), gradient: "from-emerald-500/15 to-teal-500/10", iconColor: "text-emerald-300", borderColor: "border-emerald-400/20", valueColor: "text-emerald-200" },
            { icon: Target, label: "Accuracy", value: `${stats.accuracy}%`, gradient: "from-teal-500/15 to-cyan-500/10", iconColor: "text-teal-300", borderColor: "border-teal-400/20", valueColor: "text-teal-200" },
            { icon: Flame, label: "Current Streak", value: "0d", gradient: "from-emerald-600/15 to-emerald-500/10", iconColor: "text-emerald-300", borderColor: "border-emerald-400/20", valueColor: "text-emerald-200" },
            { icon: Clock, label: "Time This Week", value: "—", gradient: "from-cyan-500/15 to-teal-600/10", iconColor: "text-cyan-300", borderColor: "border-cyan-400/20", valueColor: "text-cyan-200" },
          ].map((card) => (
            <div
              key={card.label}
              className={`rounded-2xl bg-gradient-to-br ${card.gradient} backdrop-blur-xl border ${card.borderColor} p-4`}
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)" }}
            >
              <div className={`h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center mb-2 ${card.iconColor}`}>
                <card.icon className="h-4 w-4" />
              </div>
              <div className={`text-2xl font-black ${card.valueColor} leading-none`}>{card.value}</div>
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mt-1">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Progress section */}
        <div
          className="rounded-2xl bg-black/30 backdrop-blur-xl border border-white/8 p-5"
          style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
        >
          <h2 className="text-sm font-extrabold text-white/80 mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            Weekly Progress
          </h2>

          {/* Week progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-white/50">Week Progress</span>
              <span className="text-xs font-extrabold text-emerald-400">Week {week}</span>
            </div>
            <div className="h-2 rounded-full bg-white/8 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                style={{ width: `${Math.round((week / 12) * 100)}%` }}
              />
            </div>
          </div>

          {/* Lessons completed */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-white/50 flex items-center gap-1.5">
                <BookOpen className="h-3 w-3" /> Lessons Completed
              </span>
              <span className="text-xs font-extrabold text-teal-400">
                {stats.completedLessons} / {stats.totalLessons}
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/8 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-700"
                style={{ width: `${Math.round((stats.completedLessons / Math.max(stats.totalLessons, 1)) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
