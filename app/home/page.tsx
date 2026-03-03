"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { clearScopedProgress, readProgress, StudentProgress } from "@/data/progress";
import { getProgramForYear } from "@/data/programs";
import { clearScopedProgramStore, readProgramStore, getWeekProgress, isWeekComplete, type ProgramProgressStore } from "@/lib/program-progress";
import { supabase } from "@/lib/supabase";

export default function StudentHomePage() {
  const router = useRouter();
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [store, setStore] = useState<ProgramProgressStore>({});

  useEffect(() => {
    setProgress(readProgress());
    setStore(readProgramStore());
  }, []);

  const year = progress?.year ?? "Year 1";
  const week = progress?.assignedWeek ?? 1;
  const curriculumYear = useMemo(() => {
    const selected = getProgramForYear(year);
    return selected.length > 0 ? year : "Year 1";
  }, [year]);
  const program = useMemo(() => getProgramForYear(curriculumYear), [curriculumYear]);
  const programWeek = useMemo(() => program.find((w) => w.week === week) ?? null, [program, week]);
  const wp = getWeekProgress(store, year, week);
  const lessonsDone = wp.lessonsCompleted.filter(Boolean).length;
  const overallPercent = Math.round((week / 12) * 100);
  const levelNum = parseInt(year.replace(/\D/g, ""), 10) || 1;

  // Must be before any early return to satisfy Rules of Hooks
  const lastAllowedWeek = useMemo(() => {
    let allowed = 1;
    for (let w = 2; w <= 12; w++) {
      if (isWeekComplete(getWeekProgress(store, year, w - 1))) allowed = w;
      else break;
    }
    return allowed;
  }, [year, store]);

  function goLevels() { router.push("/levels"); }
  function goLegends() { router.push("/legends"); }
  function goLessons() { router.push(`/program?year=${encodeURIComponent(year)}&week=${week}`); }
  function continueWeek() {
    router.push(`/program?year=${encodeURIComponent(year)}&week=${week}`);
  }

  if (!progress) {
    return (
      <main className="min-h-screen bg-[#f6f2ec] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-lg text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-5">
            <svg viewBox="0 0 24 24" className="h-8 w-8 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Welcome to Level Up Learning</h1>
          <p className="text-gray-500 mb-8">Choose your level to begin your first pre-test.</p>
          <button
            onClick={goLevels}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-extrabold text-lg shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition"
            type="button"
          >
            Choose Level →
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f2ec]">
      {/* ── Green hero header ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600" />
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute bottom-0 -left-16 h-48 w-48 rounded-full bg-white/5" />

        <div className="relative max-w-2xl mx-auto px-6 pt-6 pb-28">
          {/* Nav row */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.push("/login")}
              className="h-10 w-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-white hover:bg-white/25 transition"
              aria-label="Back"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                clearScopedProgress();
                clearScopedProgramStore();
                localStorage.removeItem("lul_active_student_v1");
                try {
                  Object.keys(localStorage).forEach((key) => {
                    if (key.startsWith("lul_week_")) localStorage.removeItem(key);
                  });
                } catch {
                  // ignore
                }
                router.push("/login");
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur text-white text-sm font-bold hover:bg-white/25 transition"
              type="button"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
              Log Out
            </button>
          </div>

          {/* Level badge + week */}
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-4 py-1.5 rounded-full text-sm font-bold text-white">
              ✦ LEVEL {levelNum}
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white mt-3 tracking-tight">
              Week {week} of 12
            </h1>
            <p className="text-emerald-100 mt-2 text-sm font-medium">
              {lessonsDone}/3 lessons completed this week
            </p>

            {/* Overall progress bar */}
            <div className="mt-5 mx-auto max-w-sm">
              <div className="h-2.5 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white transition-all duration-500"
                  style={{ width: `${overallPercent}%` }}
                />
              </div>
              <p className="text-xs text-emerald-100 mt-2 font-medium">Overall: Week {week}/12</p>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">
            <path d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z" fill="#f6f2ec" />
          </svg>
        </div>
      </div>

      {/* ── Content cards ── */}
      <div className="-mt-16 relative z-10 pb-12 px-6">
        <div className="max-w-2xl mx-auto grid gap-5">

          {/* Current week card */}
          <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/60 border border-gray-100/80 p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-600 px-3 py-1 text-xs font-extrabold tracking-wide">
                WEEK {week}
              </span>
              <span className="text-xs text-gray-400 font-medium">{lessonsDone}/3 done</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 leading-tight">
              {programWeek?.topic ?? "Your current focus"}
            </h2>

            <div className="mt-4 grid gap-2.5">
              {(programWeek?.lessons ?? []).map((lesson) => (
                <div key={lesson.id} className="flex items-center gap-3">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 text-xs font-extrabold flex-shrink-0">
                    {lesson.lesson}
                  </span>
                  <span className="text-sm text-gray-600">{lesson.title}</span>
                </div>
              ))}
            </div>

            <button
              onClick={continueWeek}
              className="mt-6 w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:from-emerald-600 hover:to-emerald-700 transition-all active:scale-[0.98]"
              type="button"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" /></svg>
              Continue Week {week} →
            </button>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={goLessons}
              className="bg-white rounded-2xl border border-emerald-100 shadow-sm shadow-emerald-50 p-5 text-center hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.98] group"
              type="button"
            >
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
                </svg>
              </div>
              <div className="text-sm font-bold text-gray-900">Lessons</div>
            </button>

            <button
              onClick={goLegends}
              className="bg-white rounded-2xl border border-amber-100 shadow-sm shadow-amber-50 p-5 text-center hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.98] group"
              type="button"
            >
              <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 21h8M12 17v4M7 4h10l-1 6H8L7 4z" />
                </svg>
              </div>
              <div className="text-sm font-bold text-gray-900">My Legends</div>
            </button>

            <button
              onClick={goLevels}
              className="bg-white rounded-2xl border border-blue-100 shadow-sm shadow-blue-50 p-5 text-center hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.98] group"
              type="button"
            >
              <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </div>
              <div className="text-sm font-bold text-gray-900">Levels</div>
            </button>
          </div>

          {/* Score bar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400 font-medium">Pre-test Score</div>
              <div className="text-3xl font-black text-gray-900 mt-0.5">{progress?.scorePercent ?? 0}%</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 font-medium">Status</div>
              <div className="text-base font-extrabold text-emerald-600 mt-0.5">Week {week}/12</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
