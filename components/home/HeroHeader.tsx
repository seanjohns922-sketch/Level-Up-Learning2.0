"use client";

import ReadAloudBtn from "@/components/ReadAloudBtn";

type Props = {
  levelNum: number;
  week: number;
  lessonsDone: number;
  overallPercent: number;
  onBack: () => void;
  onLogout: () => void;
};

export default function HeroHeader({ levelNum, week, lessonsDone, overallPercent, onBack, onLogout }: Props) {
  return (
    <div className="relative overflow-hidden">
      {/* Gradient background with magical particles */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800" />
      <div className="absolute inset-0 opacity-20">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: `${4 + i * 2}px`,
              height: `${4 + i * 2}px`,
              top: `${15 + i * 12}%`,
              left: `${10 + i * 15}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + i * 0.3}s`,
            }}
          />
        ))}
      </div>
      <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/5" />
      <div className="absolute bottom-8 -left-16 h-48 w-48 rounded-full bg-white/5" />

      <div className="relative max-w-2xl mx-auto px-6 pt-5 pb-24">
        {/* Nav row */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="h-10 w-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-white hover:bg-white/25 transition"
            aria-label="Back"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur text-white text-sm font-bold hover:bg-white/25 transition"
            type="button"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
            Log Out
          </button>
        </div>

        {/* Title area */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-1.5 rounded-full text-sm font-bold text-white mb-3">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><polygon points="12,2 15,10 22,10 16,15 18,22 12,18 6,22 8,15 2,10 9,10" /></svg>
            LEVEL {levelNum} — NUMBER NEXUS
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Week {week} of 12
          </h1>
          <p className="text-teal-100 mt-1.5 text-sm font-medium">
            {lessonsDone}/3 lessons completed · Number Nexus
          </p>

          {/* Overall progress bar */}
          <div className="mt-4 mx-auto max-w-xs">
            <div className="h-2.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 to-yellow-400 transition-all duration-500"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
            <p className="text-xs text-teal-200 mt-1.5 font-medium">Tower Progress: Week {week}/12</p>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">
          <path d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z" fill="hsl(30 30% 96%)" />
        </svg>
      </div>
    </div>
  );
}
