"use client";

import { LogOut, ChevronLeft } from "lucide-react";

type Props = {
  levelNum: number;
  week: number;
  lessonsDone: number;
  overallPercent: number;
  onBack: () => void;
  onLogout: () => void;
  studentName?: string;
  legendAvatar?: string;
};

export default function HeroHeader({
  levelNum,
  week,
  lessonsDone,
  overallPercent,
  onBack,
  onLogout,
  studentName,
  legendAvatar,
}: Props) {
  const displayName = studentName || "Adventurer";

  return (
    <div className="relative">
      {/* Subtle dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-transparent pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-5 pt-4 pb-20">
        {/* Nav row */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={onBack}
            className="h-9 w-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white/90 hover:bg-white/25 transition"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-xs font-bold hover:bg-white/25 transition"
            type="button"
          >
            <LogOut className="h-3.5 w-3.5" />
            Log Out
          </button>
        </div>

        {/* Welcome section */}
        <div className="flex items-center gap-4">
          {/* Legend avatar */}
          {legendAvatar && (
            <div className="h-16 w-16 rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg bg-white/10 backdrop-blur-sm flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={legendAvatar} alt="" className="h-full w-full object-cover" />
            </div>
          )}
          <div>
            <p className="text-white/70 text-xs font-bold tracking-wider uppercase">Welcome back</p>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
              {displayName}
            </h1>
            <p className="text-white/60 text-xs font-medium mt-0.5">
              Level {levelNum} · Number Nexus · Week {week}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
