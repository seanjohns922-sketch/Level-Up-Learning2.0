"use client";

import { LogOut } from "lucide-react";
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
            className="px-4 py-2 rounded-md font-extrabold tracking-[0.22em] text-xs text-white border border-teal-300/40 bg-[#0b1220]/80 hover:border-teal-200/70 hover:bg-[#0e1830]/80 transition active:scale-[0.97] shadow-[inset_0_0_0_1px_rgba(94,234,212,0.08)]"
            aria-label="Back"
          >
            ← BACK
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/profile")}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-extrabold tracking-[0.22em] text-white border border-teal-300/40 bg-[#0b1220]/80 hover:border-teal-200/70 hover:bg-[#0e1830]/80 transition active:scale-[0.97] shadow-[inset_0_0_0_1px_rgba(94,234,212,0.08)]"
              type="button"
              aria-label="Profile"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-teal-300 shadow-[0_0_8px_rgba(94,234,212,0.9)]" />
              <span className="truncate max-w-[100px]">{displayName.toUpperCase()}</span>
            </button>
            <button
              onClick={onLogout}
              className="p-2 rounded-md text-white border border-teal-300/40 bg-[#0b1220]/80 hover:border-teal-200/70 hover:bg-[#0e1830]/80 transition active:scale-[0.97] shadow-[inset_0_0_0_1px_rgba(94,234,212,0.08)]"
              type="button"
              aria-label="Log out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Hero content — centered */}
        <div className="text-center">
          {/* Nexus level pill */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-3 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-teal-50"
            style={{
              background: "linear-gradient(135deg, #021a18 0%, #064e47 50%, #0a5048 100%)",
              clipPath: "polygon(7px 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%, 0 7px)",
              boxShadow: "inset 0 1px 0 rgba(94,234,212,0.35), inset 0 -1px 0 rgba(0,0,0,0.5), 0 0 16px rgba(20,184,166,0.25)",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-teal-300 shadow-[0_0_8px_rgba(94,234,212,0.9)]" />
            Level {levelNum}
            <span className="text-teal-400/50">·</span>
            <span className="text-teal-200">Number Nexus</span>
          </div>

          {/* Week title */}
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-1.5"
              style={{ textShadow: "0 2px 14px rgba(20,184,166,0.4), 0 2px 12px rgba(0,0,0,0.4)" }}>
            Week {week}
          </h1>

          {/* Topic */}
          {topic && (
            <p className="text-sm font-medium text-white/70 mb-3">{topic}</p>
          )}

          {/* Completion subline */}
          <p className="text-[10px] font-mono font-bold text-teal-200/70 uppercase tracking-[0.18em] mb-3">
            {lessonsDone} / {totalLessons} Lessons Completed
          </p>

          {/* Nexus progress plate */}
          <div className="max-w-xs mx-auto relative">
            <div
              className="absolute -inset-[2px]"
              style={{
                clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)",
                background: "linear-gradient(135deg, rgba(94,234,212,0.5), rgba(13,148,136,0.4))",
              }}
            />
            <div
              className="relative px-1 py-[3px]"
              style={{
                clipPath: "polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)",
                background: "linear-gradient(135deg, #021a18 0%, #052e2b 100%)",
              }}
            >
              <div className="h-1.5 rounded-full overflow-hidden bg-black/50">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${progressPct}%`,
                    background: "linear-gradient(90deg, #5eead4 0%, #14b8a6 60%, #10b981 100%)",
                    boxShadow: "0 0 10px rgba(94,234,212,0.7)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
