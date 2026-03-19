"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getLegendForYear } from "@/data/legends";
import { getProgramForYear } from "@/data/programs";
import { DEV_MODE, DEMO_MODE } from "@/data/config";
import { readProgress, updateProgress, writeProgress } from "@/data/progress";
import type { StudentProgress } from "@/data/progress";
import {
  readProgramStore,
  getWeekProgress,
  isWeekComplete,
  type ProgramProgressStore,
} from "@/lib/program-progress";
import { LEVEL2_HERO_GRADIENT } from "@/lib/levelTheme";

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

  const year = sp.get("year") ?? "Year 1";
  const weekNum = Number(sp.get("week") ?? "1");
  const week = String(weekNum);
  const levelNum = parseInt(year.replace(/\D/g, ""), 10) || 1;
  const curriculumYear = useMemo(() => {
    const selected = getProgramForYear(year);
    return selected.length > 0 ? year : "Year 1";
  }, [year]);

  const [store, setStore] = useState<ProgramProgressStore>({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setStore(readProgramStore()); setIsClient(true); }, []);

  // Re-read store on window focus (in case lesson page updated it)
  useEffect(() => {
    function onFocus() { setStore(readProgramStore()); }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // Also re-read when route params change (navigating back from lesson)
  useEffect(() => {
    setStore(readProgramStore());
  }, [weekNum, year]);

  const prevProgress = getWeekProgress(store, year, Math.max(1, weekNum - 1));
  const canAccessThisWeek = DEMO_MODE ? true : weekNum === 1 ? true : isWeekComplete(prevProgress);

  const lastAllowedWeek = useMemo(() => {
    if (DEMO_MODE) return 12;
    let allowed = 1;
    for (let w = 2; w <= 12; w++) {
      if (isWeekComplete(getWeekProgress(store, year, w - 1))) allowed = w;
      else break;
    }
    return allowed;
  }, [year, store]);

  const progress = getWeekProgress(store, year, week);

  type ProgramItem = { type: "lesson" | "quiz" | "posttest"; n: number; title: string; focus: string };
  const items: ProgramItem[] = useMemo(() => {
    const program = getProgramForYear(curriculumYear);
    const weekPlan = program.find((w) => w.week === weekNum);
    const lessons = weekPlan?.lessons ?? [];
    const base: ProgramItem[] = [
      { type: "lesson" as const, n: 1, title: lessons[0]?.title ?? "Lesson 1", focus: lessons[0]?.focus ?? "" },
      { type: "lesson" as const, n: 2, title: lessons[1]?.title ?? "Lesson 2", focus: lessons[1]?.focus ?? "" },
      { type: "lesson" as const, n: 3, title: lessons[2]?.title ?? "Lesson 3", focus: lessons[2]?.focus ?? "" },
      { type: "quiz" as const, n: 1, title: "Weekly Quiz", focus: "15 questions from all 3 lessons" },
    ];
    if (weekNum === 12) {
      base.push({ type: "posttest" as const, n: 1, title: "Post-Test", focus: "Score 90%+ to unlock your Legend" });
    }
    return base;
  }, [curriculumYear, weekNum]);

  function openItem(item: (typeof items)[number]) {
    if (!canAccessThisWeek) return;

    if (!DEMO_MODE) {
      if (item.type === "lesson") {
        const lessonIdx = item.n - 1;
        if (lessonIdx > 0 && !progress.lessonsCompleted[lessonIdx - 1]) return;
      }
      if (item.type === "quiz") {
        if (progress.lessonsCompleted.filter(Boolean).length < 3) return;
      }
      if (item.type === "posttest") {
        if (progress.lessonsCompleted.filter(Boolean).length < 3) return;
      }
    }

    if (item.type === "lesson") {
      const yearNumber = parseInt(curriculumYear.replace(/\D/g, ""), 10) || 1;
      router.push(
        `/lesson?year=${encodeURIComponent(curriculumYear)}&week=${week}&lessonId=y${yearNumber}-w${weekNum}-l${item.n}`
      );
      return;
    }
    if (item.type === "posttest") {
      router.push(`/posttest?year=${encodeURIComponent(curriculumYear)}`);
      return;
    }
    router.push(`/session?year=${encodeURIComponent(curriculumYear)}&week=${week}&type=${item.type}&n=${item.n}`);
  }

  function goToWeek(targetWeek: number) {
    const clamped = Math.max(1, Math.min(12, targetWeek));
    if (!DEMO_MODE && clamped > lastAllowedWeek) {
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
      {DEV_MODE && (
        <div className="fixed bottom-4 right-4 px-4 py-2 bg-red-600 text-white font-extrabold rounded-xl shadow-lg z-50">DEV MODE</div>
      )}

      {/* ── Green hero ── */}
      <div className="relative overflow-hidden">
        <div className={`absolute inset-0 ${LEVEL2_HERO_GRADIENT}`} />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/5" />
        <div className="absolute bottom-0 -left-16 h-48 w-48 rounded-full bg-white/5" />

        <div className="relative max-w-2xl mx-auto px-6 pt-5 pb-24">
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
              <span className="text-sm text-white/80 font-medium ml-1">Level {levelNum}</span>
            </div>
          </div>

          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-4 py-1.5 rounded-full text-sm font-bold text-white">
              Level {levelNum} – 12-Week Program
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white mt-3 tracking-tight">Week {weekNum}</h1>
            <p className="text-teal-100 mt-2 text-sm font-medium">
              {isClient
                ? weekComplete
                  ? "✅ Completed"
                  : `${lessonsDoneCount}/3 lessons – ${progress.quizCompleted ? "quiz done" : "quiz pending"}`
                : "0/3 lessons – quiz pending"}
            </p>

            <div className="mt-5 mx-auto max-w-sm bg-white/15 backdrop-blur rounded-full px-5 py-3">
              <div className="h-2.5 rounded-full bg-white/20 overflow-hidden">
                <div className="h-full rounded-full bg-white/80 transition-all duration-500" style={{ width: `${percent}%` }} />
              </div>
              <p className="text-xs text-white/70 mt-2 text-center font-medium">{xp} / {totalXp} XP</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">
            <path d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z" fill="#f6f2ec" />
          </svg>
        </div>
      </div>

      {/* ── Lesson cards ── */}
      <div className="-mt-12 relative z-10 pb-12 px-6">
        <div className="max-w-2xl mx-auto">
          {DEV_MODE && (
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
              const isPostTest = item.type === "posttest";
              const completed = isLesson
                ? progress.lessonsCompleted[item.n - 1]
                : isPostTest
                  ? false // post-test "completed" is tracked via progress store separately
                  : progress.quizCompleted;

              let locked = false;
              if (!DEMO_MODE) {
                if (isLesson && item.n > 1 && !progress.lessonsCompleted[item.n - 2]) locked = true;
                if (item.type === "quiz" && lessonsDoneCount < 3) locked = true;
                if (isPostTest && lessonsDoneCount < 3) locked = true;
              }

              const postTestReady = isPostTest && !locked;

              return (
                <button
                  key={`${item.type}-${item.n}`}
                  onClick={() => !locked && openItem(item)}
                  disabled={locked}
                  className={[
                    "w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 group",
                    locked
                      ? "border-gray-100 bg-gray-50/50 opacity-50 cursor-not-allowed"
                      : postTestReady
                        ? "border-primary/30 bg-primary-light hover:shadow-lg hover:-translate-y-0.5 animate-[postTestGlow_2s_ease-in-out_infinite]"
                        : completed
                          ? "border-emerald-100 bg-emerald-50/30 hover:shadow-md"
                          : "border-gray-100 bg-white hover:shadow-md hover:-translate-y-0.5",
                  ].join(" ")}
                >
                  <div className={[
                    "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-sm font-bold transition-all",
                    locked ? "bg-gray-100 text-gray-400"
                      : postTestReady ? "bg-primary/10 text-primary"
                        : completed ? "bg-emerald-100 text-emerald-600"
                          : item.type === "quiz" ? "bg-blue-50 text-blue-500" : "bg-gray-100 text-gray-500",
                  ].join(" ")}>
                    {locked ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                    ) : isPostTest ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    ) : item.type === "quiz" ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" /></svg>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-400 font-medium">
                      {isLesson ? `Lesson ${item.n}` : isPostTest ? "Final Assessment" : "Weekly Quiz"}
                    </div>
                    <div className="font-extrabold text-gray-900 truncate">{item.title}</div>
                    <div className="text-xs mt-0.5 truncate" style={{ color: locked && isPostTest ? "hsl(var(--muted-foreground))" : undefined }}>
                      {locked && isPostTest
                        ? "🔒 Complete all lessons to unlock"
                        : postTestReady
                          ? "✨ Ready to start"
                          : item.focus}
                    </div>
                    {!isPostTest && (
                      <div className="text-xs text-gray-400 mt-0.5">{isLesson ? "10 XP" : "20 XP"}</div>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    {locked ? (
                      <span className="text-xs text-gray-300 font-bold px-3 py-1.5 rounded-full border border-gray-200">LOCKED</span>
                    ) : completed ? (
                      <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                      </div>
                    ) : postTestReady ? (
                      <span className="text-xs font-extrabold px-4 py-1.5 rounded-full bg-primary text-primary-foreground shadow-sm">
                        START
                      </span>
                    ) : (
                      <span className="text-xs font-extrabold px-4 py-1.5 rounded-full border-2 border-gray-900 text-gray-900 group-hover:bg-gray-900 group-hover:text-white transition">START</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

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
