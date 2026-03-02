"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getLegendForYear } from "@/data/legends";
import { getProgramForYear } from "@/data/programs";
import { DEV_MODE } from "@/data/config";
import { readProgress, StudentProgress, updateProgress, writeProgress } from "@/data/progress";

type WeekProgress = {
  lessonsCompleted: boolean[];
  quizCompleted: boolean;
  quizScore?: number;
};
type ProgramProgressStore = Record<string, WeekProgress>;

const PROGRAM_STORE_KEY = "lul_program_progress_v1";

function readProgramStore(): ProgramProgressStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PROGRAM_STORE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ProgramProgressStore;
  } catch { return {}; }
}

function getWeekProgress(store: ProgramProgressStore, year: string, week: string): WeekProgress {
  return store[`${year}|${week}`] ?? { lessonsCompleted: [false, false, false], quizCompleted: false };
}

function isWeekComplete(p: WeekProgress) {
  return (p.quizScore ?? 0) >= 80 || (p.lessonsCompleted.filter(Boolean).length === 3 && p.quizCompleted);
}

export default function ProgramPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f6f2ec] flex items-center justify-center"><p className="text-gray-400">Loading…</p></div>}>
      <ProgramPage />
    </Suspense>
  );
}

function ProgramPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const year = sp.get("year") ?? "Year 3";
  const weekNum = Number(sp.get("week") ?? "1");
  const week = String(weekNum);
  const levelNum = parseInt(year.replace(/\D/g, ""), 10) || 1;

  const [store, setStore] = useState<ProgramProgressStore>({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setStore(readProgramStore()); setIsClient(true); }, []);

  const prevProgress = getWeekProgress(store, year, String(Math.max(1, weekNum - 1)));
  const canAccessThisWeek = DEV_MODE ? true : weekNum === 1 ? true : isWeekComplete(prevProgress);

  const lastAllowedWeek = useMemo(() => {
    if (DEV_MODE) return 12;
    let allowed = 1;
    for (let w = 2; w <= 12; w++) {
      if (isWeekComplete(getWeekProgress(store, year, String(w - 1)))) allowed = w;
      else break;
    }
    return allowed;
  }, [year, store]);

  const progress = getWeekProgress(store, year, week);

  const items = useMemo(() => {
    const program = getProgramForYear(year);
    const weekPlan = program.find((w) => w.week === weekNum);
    const lessons = weekPlan?.lessons ?? [];
    return [
      { type: "lesson" as const, n: 1, title: lessons[0]?.title ?? "Lesson 1" },
      { type: "lesson" as const, n: 2, title: lessons[1]?.title ?? "Lesson 2" },
      { type: "lesson" as const, n: 3, title: lessons[2]?.title ?? "Lesson 3" },
      { type: "quiz" as const, n: 1, title: "Weekly Quiz" },
    ];
  }, [year, weekNum]);

  function openItem(item: (typeof items)[number]) {
    if (!canAccessThisWeek) return;

    // Lock logic: lessons sequential, quiz after all 3 lessons
    if (item.type === "lesson") {
      const lessonIdx = item.n - 1;
      if (lessonIdx > 0 && !progress.lessonsCompleted[lessonIdx - 1]) return;
    }
    if (item.type === "quiz") {
      if (progress.lessonsCompleted.filter(Boolean).length < 3) return;
    }

    if (item.type === "lesson" && year === "Year 1" && weekNum >= 1 && weekNum <= 12) {
      router.push(`/lesson?year=${encodeURIComponent(year)}&week=${week}&lessonId=y1-w${weekNum}-l${item.n}`);
      return;
    }
    router.push(`/session?year=${encodeURIComponent(year)}&week=${week}&type=${item.type}&n=${item.n}`);
  }

  function goToWeek(targetWeek: number) {
    const clamped = Math.max(1, Math.min(12, targetWeek));
    if (!DEV_MODE && clamped > lastAllowedWeek) {
      router.push(`/program?year=${encodeURIComponent(year)}&week=${lastAllowedWeek}`);
      return;
    }
    router.push(`/program?year=${encodeURIComponent(year)}&week=${clamped}`);
  }

  const lessonsDoneCount = progress.lessonsCompleted.filter(Boolean).length;
  const weekComplete = isWeekComplete(progress);

  useEffect(() => {
    const student = readProgress();
    if (!student || student.status !== "ASSIGNED_PROGRAM") return;
    const savedWeek = student.assignedWeek ?? 1;
    let nextWeek = savedWeek;
    if (weekNum > savedWeek) nextWeek = weekNum;
    if (weekComplete) nextWeek = Math.max(nextWeek, Math.min(12, weekNum + 1));
    if (nextWeek !== savedWeek) updateProgress({ assignedWeek: nextWeek });
  }, [weekComplete, weekNum]);

  function finishProgram() {
    const legend = getLegendForYear(year);
    const student = readProgress();
    const unlocked = student?.unlockedLegends ?? [];
    const nextUnlocked = unlocked.includes(legend.id) ? unlocked : [...unlocked, legend.id];
    const nextStudent: StudentProgress = {
      year,
      scorePercent: Math.max(student?.scorePercent ?? 0, 90),
      status: "PASSED",
      unlockedLegends: nextUnlocked,
    };
    writeProgress(nextStudent);
    router.push(`/results?year=${encodeURIComponent(year)}&score=90&total=100&source=program_complete`);
  }

  // XP
  const xp = lessonsDoneCount * 10 + (progress.quizCompleted ? 20 : 0);
  const totalXp = 50;
  const percent = Math.round((xp / totalXp) * 100);

  if (!canAccessThisWeek) {
    return (
      <main className="min-h-screen bg-[#f6f2ec] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Week {weekNum} Locked</h1>
          <p className="text-gray-500 mb-6 text-sm">Complete Week {weekNum - 1} first (3 lessons + quiz ≥ 80%) to unlock.</p>
          <button onClick={() => goToWeek(lastAllowedWeek)} className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition">
            Go to Week {lastAllowedWeek}
          </button>
          <button onClick={() => router.push("/home")} className="w-full mt-3 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition">
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f2ec]">
      {DEV_MODE && process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 px-4 py-2 bg-red-600 text-white font-extrabold rounded-xl shadow-lg z-50">DEV MODE</div>
      )}

      {/* ── Green hero ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600" />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/5" />
        <div className="absolute bottom-0 -left-16 h-48 w-48 rounded-full bg-white/5" />

        <div className="relative max-w-2xl mx-auto px-6 pt-5 pb-24">
          {/* Nav */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push("/home")}
              className="px-4 py-2 rounded-full bg-white/15 backdrop-blur text-white text-sm font-semibold hover:bg-white/25 transition"
            >
              ← Back
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => goToWeek(weekNum - 1)} className="h-10 w-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-white hover:bg-white/25 transition" aria-label="Previous week">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <button onClick={() => goToWeek(weekNum + 1)} className="h-10 w-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-white hover:bg-white/25 transition" aria-label="Next week">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 6l6 6-6 6" /></svg>
              </button>
              <span className="text-sm text-white/80 font-medium ml-1">Level {levelNum} – 12-Week Program</span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-4 py-1.5 rounded-full text-sm font-bold text-white">
              Level {levelNum} – 12-Week Program
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white mt-3 tracking-tight">Week {weekNum}</h1>
            <p className="text-emerald-100 mt-2 text-sm font-medium">
              {isClient
                ? weekComplete
                  ? "✅ Completed"
                  : `${lessonsDoneCount}/3 lessons – ${progress.quizCompleted ? "quiz done" : "quiz pending"}`
                : "0/3 lessons – quiz pending"}
            </p>

            {/* XP bar */}
            <div className="mt-5 mx-auto max-w-sm bg-white/15 backdrop-blur rounded-full px-5 py-3">
              <div className="h-2.5 rounded-full bg-white/20 overflow-hidden">
                <div className="h-full rounded-full bg-white/80 transition-all duration-500" style={{ width: `${percent}%` }} />
              </div>
              <p className="text-xs text-white/70 mt-2 text-center font-medium">{xp} / {totalXp} XP</p>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">
            <path d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z" fill="#f6f2ec" />
          </svg>
        </div>
      </div>

      {/* ── Lesson cards ── */}
      <div className="-mt-12 relative z-10 pb-12 px-6">
        <div className="max-w-2xl mx-auto">
          {DEV_MODE && process.env.NODE_ENV === "development" && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="font-bold text-amber-800 mb-2 text-sm">DEV – Jump to any week</div>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <button key={i} onClick={() => goToWeek(i + 1)} className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-xs font-bold hover:bg-amber-100 transition">
                    W{i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/60 border border-gray-100/80 p-5 grid gap-3">
            {items.map((item) => {
              const isLesson = item.type === "lesson";
              const completed = isLesson ? progress.lessonsCompleted[item.n - 1] : progress.quizCompleted;

              // Lock states
              let locked = false;
              if (isLesson && item.n > 1 && !progress.lessonsCompleted[item.n - 2]) locked = true;
              if (!isLesson && lessonsDoneCount < 3) locked = true;

              return (
                <button
                  key={`${item.type}-${item.n}`}
                  onClick={() => !locked && openItem(item)}
                  disabled={locked}
                  className={[
                    "w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 group",
                    locked
                      ? "border-gray-100 bg-gray-50/50 opacity-50 cursor-not-allowed"
                      : completed
                        ? "border-emerald-100 bg-emerald-50/30 hover:shadow-md"
                        : "border-gray-100 bg-white hover:shadow-md hover:-translate-y-0.5",
                  ].join(" ")}
                >
                  {/* Icon */}
                  <div className={[
                    "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-sm font-bold",
                    locked ? "bg-gray-100 text-gray-400"
                      : completed ? "bg-emerald-100 text-emerald-600"
                        : item.type === "quiz" ? "bg-blue-50 text-blue-500" : "bg-gray-100 text-gray-500",
                  ].join(" ")}>
                    {locked ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                    ) : item.type === "quiz" ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" /></svg>
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-400 font-medium">{isLesson ? `Lesson ${item.n}` : "Weekly Quiz"}</div>
                    <div className="font-extrabold text-gray-900 truncate">{item.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{isLesson ? "10 XP" : "20 XP"}</div>
                  </div>

                  {/* Action */}
                  <div className="flex-shrink-0">
                    {locked ? (
                      <span className="text-xs text-gray-300 font-bold px-3 py-1.5 rounded-full border border-gray-200">LOCKED</span>
                    ) : completed ? (
                      <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                      </div>
                    ) : (
                      <span className="text-xs font-extrabold px-4 py-1.5 rounded-full border-2 border-gray-900 text-gray-900 group-hover:bg-gray-900 group-hover:text-white transition">START</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Finish CTA */}
          {weekNum === 12 && weekComplete && (
            <div className="mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl border border-emerald-200 p-6 text-center">
              <div className="text-2xl mb-2">🏆</div>
              <h3 className="text-xl font-black text-gray-900 mb-1">Program Complete!</h3>
              <p className="text-sm text-gray-500 mb-4">You've finished all 12 weeks. Unlock your Legend!</p>
              <button
                onClick={finishProgram}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-extrabold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition"
              >
                Finish Program → Unlock Legend
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
