"use client";

import { LogOut, ChevronLeft, User } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  levelNum: number;
  week: number;
  lessonsDone: number;
  totalLessons: number;
  topic?: string;
  onBack: () => void;
  onLogout: () => void;
  studentName?: string;
  legendAvatar?: string;
};

export default function HeroHeader({
  levelNum,
  week,
  lessonsDone,
  totalLessons,
  topic,
  onBack,
  onLogout,
  studentName,
  legendAvatar,
}: Props) {
  const router = useRouter();
  const displayName = studentName || "Adventurer";
  const progressPct = Math.round((lessonsDone / Math.max(totalLessons, 1)) * 100);
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative">
      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/15 to-transparent pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-5 pt-4 pb-14">
        {/* Utility row */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:bg-white/20 transition"
            aria-label="Back"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/profile")}
              className="h-8 flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 pl-1 pr-3 text-white/80 hover:bg-white/20 transition"
              type="button"
              aria-label="Profile"
            >
              <span className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold text-white">
                {initials}
              </span>
              <span className="text-xs font-semibold truncate max-w-[80px]">{displayName}</span>
            </button>
            <button
              onClick={onLogout}
              className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:bg-white/20 transition"
              type="button"
              aria-label="Log out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Hero content — centered */}
        <div className="text-center">
          {/* Level pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-3">
            <span className="text-[10px] font-extrabold text-emerald-300 uppercase tracking-widest">
              Level {levelNum}
            </span>
            <span className="text-white/30">·</span>
            <span className="text-[10px] font-extrabold text-teal-200 uppercase tracking-widest">
              Number Nexus
            </span>
          </div>

          {/* Week title */}
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-1.5"
              style={{ textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
            Week {week}
          </h1>

          {/* Topic */}
          {topic && (
            <p className="text-sm font-medium text-white/60 mb-3">{topic}</p>
          )}

          {/* Completion subline */}
          <p className="text-xs font-bold text-white/50 mb-3">
            {lessonsDone} of {totalLessons} lessons completed
          </p>

          {/* Progress bar */}
          <div className="max-w-xs mx-auto">
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden backdrop-blur-sm">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
