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
import { getHomeBg, getHomeBgFilter, getVignetteStyle } from "@/lib/levelBand";


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
    ];
    if (weekNum !== 12) {
      base.push({ type: "quiz" as const, n: 1, title: "Weekly Quiz", focus: "15 questions from all 3 lessons" });
    } else {
      base.push({ type: "posttest" as const, n: 1, title: "Post-Test", focus: "Score 90%+ to unlock your Legend" });
    }
    return base;
  }, [curriculumYear, weekNum]);

  const currentWeekPlan = useMemo(() => {
    const program = getProgramForYear(curriculumYear);
    return program.find((w) => w.week === weekNum);
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
    <main className="min-h-screen relative">
      {/* Realm background — same as student dashboard for this level */}
      <div className="fixed inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getHomeBg(levelNum)}
          alt=""
          className="w-full h-full object-cover"
          style={{ filter: getHomeBgFilter(levelNum) }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: getVignetteStyle(levelNum) }}
        />
        <div className="absolute inset-0 bg-black/30" />
        {/* Soft top glow for premium polish */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at top, rgba(255,255,255,0.10), transparent 60%)",
          }}
        />
      </div>

      {DEV_MODE && (
        <div className="fixed bottom-4 right-4 px-4 py-2 bg-red-600 text-white font-extrabold rounded-xl shadow-lg z-50">DEV MODE</div>
      )}

      {/* ── Hero header ── */}
      <div className="relative z-10">
        <div className="relative max-w-6xl mx-auto px-6 pt-5 pb-10">
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
            {/* Nexus level pill */}
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-teal-50"
              style={{
                background: "linear-gradient(135deg, #021a18 0%, #064e47 50%, #0a5048 100%)",
                clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
                boxShadow: "inset 0 1px 0 rgba(94,234,212,0.35), inset 0 -1px 0 rgba(0,0,0,0.5), 0 0 18px rgba(20,184,166,0.25)",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-teal-300 shadow-[0_0_8px_rgba(94,234,212,0.9)]" />
              Level {levelNum} · 12-Week Program
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white mt-3 tracking-tight drop-shadow-[0_2px_12px_rgba(20,184,166,0.35)]">Week {weekNum}</h1>
            <p className="text-base md:text-lg text-teal-50/95 mt-2 font-semibold">
              <span className="text-teal-300/80 font-mono text-xs uppercase tracking-[0.18em] mr-2">Focus</span>
              {currentWeekPlan?.topic ?? "Your current focus"}
            </p>
            <p className="text-teal-200/80 mt-2 text-xs font-mono uppercase tracking-[0.16em]">
              {isClient
                ? weekComplete
                  ? "◆ Completed"
                  : `${lessonsDoneCount}/3 Lessons · ${progress.quizCompleted ? "Quiz Done" : "Quiz Pending"}`
                : "0/3 Lessons · Quiz Pending"}
            </p>

            {/* Nexus XP plate */}
            <div className="mt-5 mx-auto max-w-sm relative">
              <div
                className="absolute -inset-[2px]"
                style={{
                  clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
                  background: "linear-gradient(135deg, rgba(94,234,212,0.55), rgba(20,184,166,0.15) 40%, rgba(13,148,136,0.5))",
                }}
              />
              <div
                className="relative px-5 py-3"
                style={{
                  clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
                  background: "linear-gradient(135deg, #021a18 0%, #052e2b 50%, #064e47 100%)",
                  boxShadow: "inset 0 1px 0 rgba(94,234,212,0.25), inset 0 -8px 18px rgba(0,0,0,0.45)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage: "repeating-linear-gradient(0deg, rgba(94,234,212,0.4) 0 1px, transparent 1px 3px)",
                  }}
                />
                <div className="relative h-2 rounded-full bg-black/50 overflow-hidden ring-1 ring-teal-400/20">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percent}%`,
                      background: "linear-gradient(90deg, #5eead4 0%, #14b8a6 50%, #10b981 100%)",
                      boxShadow: "0 0 10px rgba(94,234,212,0.7)",
                    }}
                  />
                </div>
                <p className="relative text-[10px] text-teal-100/90 mt-2 text-center font-mono font-bold tracking-[0.2em]">
                  {xp} / {totalXp} XP
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Horizontal lesson dashboard ── */}
      <div className="relative z-10 pb-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {DEV_MODE && (
            <div className="mb-6 rounded-2xl border border-amber-200/40 bg-amber-50/95 backdrop-blur p-4">
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

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 items-stretch relative">
            {items.map((item, idx) => {
              const isLesson = item.type === "lesson";
              const isPostTest = item.type === "posttest";
              const completed = isLesson
                ? progress.lessonsCompleted[item.n - 1]
                : isPostTest
                  ? false
                  : progress.quizCompleted;

              let locked = false;
              if (!DEMO_MODE) {
                if (isLesson && item.n > 1 && !progress.lessonsCompleted[item.n - 2]) locked = true;
                if (item.type === "quiz" && lessonsDoneCount < 3) locked = true;
                if (isPostTest && lessonsDoneCount < 3) locked = true;
              }

              const isActive = !locked && !completed;
              const postTestReady = isPostTest && !locked;
              const isLast = idx === items.length - 1;
              const labelTop = isLesson ? `Lesson ${item.n}` : isPostTest ? "Final Assessment" : "Weekly Quiz";

              return (
                <div key={`${item.type}-${item.n}`} className="relative flex">
                  {/* Bezel frame */}
                  <div
                    className="absolute -inset-[2px] pointer-events-none"
                    style={{
                      clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
                      background: locked
                        ? "linear-gradient(135deg, rgba(94,234,212,0.12), rgba(13,148,136,0.08))"
                        : postTestReady
                          ? "linear-gradient(135deg, rgba(251,191,36,0.6), rgba(245,158,11,0.25) 40%, rgba(251,191,36,0.55))"
                          : isActive
                            ? "linear-gradient(135deg, rgba(94,234,212,0.6), rgba(13,148,136,0.2) 40%, rgba(20,184,166,0.55))"
                            : completed
                              ? "linear-gradient(135deg, rgba(16,185,129,0.5), rgba(13,148,136,0.2) 40%, rgba(16,185,129,0.45))"
                              : "linear-gradient(135deg, rgba(94,234,212,0.35), rgba(13,148,136,0.15) 40%, rgba(20,184,166,0.35))",
                    }}
                  />
                  <button
                    onClick={() => !locked && openItem(item)}
                    disabled={locked}
                    className={[
                      "relative w-full text-left p-5 transition-all flex flex-col gap-3 group overflow-hidden",
                      locked
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:-translate-y-1",
                    ].join(" ")}
                    style={{
                      clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
                      background: locked
                        ? "linear-gradient(135deg, #021a18 0%, #052e2b 100%)"
                        : "linear-gradient(135deg, #021a18 0%, #052e2b 50%, #064e47 100%)",
                      boxShadow: isActive
                        ? "inset 0 1px 0 rgba(94,234,212,0.25), inset 0 -10px 24px rgba(0,0,0,0.45), 0 0 22px rgba(20,184,166,0.3)"
                        : "inset 0 1px 0 rgba(94,234,212,0.18), inset 0 -10px 20px rgba(0,0,0,0.4), 0 0 14px rgba(20,184,166,0.15)",
                    }}
                  >
                    {/* Scanline texture */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-[0.06]"
                      style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(94,234,212,0.6) 0 1px, transparent 1px 3px)" }}
                    />

                    <div className="relative flex items-center justify-between">
                      <span
                        className="h-11 w-11 flex items-center justify-center flex-shrink-0"
                        style={{
                          clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
                          background: locked
                            ? "radial-gradient(circle at 30% 30%, #1e293b, #0f172a 70%)"
                            : postTestReady
                              ? "radial-gradient(circle at 30% 30%, #fde68a, #f59e0b 50%, #78350f 100%)"
                              : completed
                                ? "radial-gradient(circle at 30% 30%, #6ee7b7, #10b981 50%, #064e3b 100%)"
                                : "radial-gradient(circle at 30% 30%, #5eead4, #14b8a6 50%, #064e47 100%)",
                          boxShadow: "inset 0 0 8px rgba(0,0,0,0.5), 0 0 10px rgba(94,234,212,0.35)",
                        }}
                      >
                        <span className={locked ? "text-slate-500" : "text-teal-50"}>
                          {locked ? (
                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                          ) : isPostTest ? (
                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                          ) : item.type === "quiz" ? (
                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
                          ) : (
                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" /></svg>
                          )}
                        </span>
                      </span>
                      {completed ? (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono font-extrabold tracking-[0.14em] text-emerald-100"
                          style={{
                            clipPath: "polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)",
                            background: "linear-gradient(135deg, #064e3b 0%, #10b981 100%)",
                            boxShadow: "inset 0 1px 0 rgba(110,231,183,0.4)",
                          }}
                        >
                          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                          DONE
                        </span>
                      ) : locked ? (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono font-extrabold tracking-[0.14em] text-slate-400"
                          style={{
                            clipPath: "polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)",
                            background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                          }}
                        >
                          LOCKED
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono font-extrabold tracking-[0.14em] text-teal-100"
                          style={{
                            clipPath: "polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)",
                            background: postTestReady
                              ? "linear-gradient(135deg, #78350f 0%, #f59e0b 100%)"
                              : "linear-gradient(135deg, #064e47 0%, #14b8a6 100%)",
                            boxShadow: "inset 0 1px 0 rgba(94,234,212,0.4)",
                          }}
                        >
                          <span className="h-1 w-1 rounded-full bg-teal-200 shadow-[0_0_6px_rgba(94,234,212,0.9)] animate-pulse" />
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <div className="relative flex-1 min-w-0">
                      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-teal-300/70 font-bold">
                        {labelTop}
                      </div>
                      <div className="font-extrabold text-white mt-1 leading-tight line-clamp-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
                        {item.title}
                      </div>
                      <div
                        className="mt-1.5 text-xs text-teal-100/60 leading-snug"
                        style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                      >
                        {locked && isPostTest ? "Complete all lessons to unlock" : item.focus}
                      </div>
                    </div>

                    <div className="relative flex items-center justify-between pt-2 border-t border-teal-400/15">
                      <span className="text-[10px] font-mono font-bold text-teal-200/70 tracking-[0.14em]">
                        {isPostTest ? "MASTERY" : isLesson ? "10 XP" : "20 XP"}
                      </span>
                      {locked ? (
                        <span className="text-[10px] font-mono font-extrabold text-slate-600">—</span>
                      ) : (
                        <span
                          className="text-[10px] font-mono font-extrabold tracking-[0.18em] px-3 py-1 text-white"
                          style={{
                            clipPath: "polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)",
                            background: postTestReady
                              ? "linear-gradient(135deg, #78350f 0%, #f59e0b 100%)"
                              : completed
                                ? "linear-gradient(135deg, #064e3b 0%, #10b981 100%)"
                                : "linear-gradient(135deg, #064e47 0%, #0d9488 50%, #14b8a6 100%)",
                            boxShadow: "inset 0 1px 0 rgba(94,234,212,0.4), 0 0 8px rgba(20,184,166,0.35)",
                          }}
                        >
                          {completed ? "REPLAY" : "START"}
                        </span>
                      )}
                    </div>
                  </button>

                  {!isLast && (
                    <div className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 z-20 pointer-events-none">
                      <div
                        className="h-7 w-7 flex items-center justify-center"
                        style={{
                          clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
                          background: completed
                            ? "radial-gradient(circle, #10b981, #064e3b 70%)"
                            : "radial-gradient(circle, #14b8a6, #064e47 70%)",
                          boxShadow: "0 0 10px rgba(94,234,212,0.5)",
                        }}
                      >
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-teal-50" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 6l6 6-6 6" /></svg>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
