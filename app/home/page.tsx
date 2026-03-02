"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { readProgress, StudentProgress } from "@/data/progress";
import { getProgramForYear } from "@/data/programs";

export default function StudentHomePage() {
  const router = useRouter();
  const [progress, setProgress] = useState<StudentProgress | null>(null);

  useEffect(() => {
    setProgress(readProgress());
  }, []);

  const year = progress?.year ?? "Year 1";
  const week = progress?.assignedWeek ?? 1;
  const program = useMemo(() => getProgramForYear(year), [year]);
  const programWeek = useMemo(
    () => program.find((w) => w.week === week) ?? null,
    [program, week]
  );

  const weekPercent = Math.round((Math.max(1, Math.min(12, week)) / 12) * 100);
  const lessonCount = programWeek?.lessons.length ?? 3;

  function goLevels() {
    router.push("/levels");
  }

  function goLegends() {
    router.push("/legends");
  }

  function continueWeek() {
    const yr = encodeURIComponent(year);
    router.push(`/program?year=${yr}&week=${week}`);
  }

  if (!progress) {
    return (
      <main className="min-h-screen bg-[#fbf7f1] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-lg text-center">
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Welcome to Level Up Learning
          </h1>
          <p className="text-gray-600 mb-6">
            Choose your level to begin your first pre-test.
          </p>
          <button
            onClick={goLevels}
            className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-extrabold text-lg hover:bg-emerald-600 transition"
            type="button"
          >
            Choose Level
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbf7f1]">
      <div className="bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 text-white px-6 pt-8 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex items-center gap-3">
              <button
                type="button"
                className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center"
                aria-label="Back"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center"
                aria-label="Forward"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1 text-sm font-semibold">
              Level 1
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-black">Week {week} of 12</h1>
            <p className="mt-2 text-emerald-50">
              0/{lessonCount} lessons completed this week
            </p>
            <div className="mt-4 h-3 rounded-full bg-white/30 overflow-hidden">
              <div
                className="h-full bg-white/70 rounded-full"
                style={{ width: `${weekPercent}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-emerald-50">
              Overall: Week {week}/12
            </div>
          </div>
        </div>
      </div>

      <div className="-mt-14 pb-12 px-6">
        <div className="max-w-4xl mx-auto grid gap-6">
          <div className="bg-white rounded-3xl shadow-lg border border-emerald-100 p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-sm font-bold">
                WEEK {week}
              </span>
              <span className="text-sm text-gray-500">0/{lessonCount} done</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900">
              {programWeek?.topic ?? "Your current focus"}
            </h2>
            <div className="mt-4 grid gap-2">
              {(programWeek?.lessons ?? []).map((lesson) => (
                <div key={lesson.id} className="flex items-center gap-3 text-gray-700">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold">
                    {lesson.lesson}
                  </span>
                  <span>{lesson.title}</span>
                </div>
              ))}
            </div>
            <button
              onClick={continueWeek}
              className="mt-6 w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-extrabold text-lg hover:from-emerald-600 hover:to-emerald-700 transition"
              type="button"
            >
              Continue Week {week}
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={goLegends}
              className="bg-white rounded-3xl border border-amber-100 shadow-sm p-6 text-left hover:shadow-md transition"
              type="button"
            >
              <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-3">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 21h8M12 17v4M7 4h10l-1 6H8L7 4z" />
                </svg>
              </div>
              <div className="text-lg font-bold text-gray-900">My Legends</div>
            </button>

            <button
              onClick={goLevels}
              className="bg-white rounded-3xl border border-blue-100 shadow-sm p-6 text-left hover:shadow-md transition"
              type="button"
            >
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h6v6h-6z" />
                </svg>
              </div>
              <div className="text-lg font-bold text-gray-900">Levels</div>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Pre-test Score</div>
              <div className="text-3xl font-black text-gray-900">
                {progress.scorePercent ?? 0}%
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Status</div>
              <div className="text-lg font-bold text-emerald-600">
                Week {week}/12
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
