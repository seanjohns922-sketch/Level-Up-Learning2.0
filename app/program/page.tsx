"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getProgramForYear } from "@/data/programs";
import { DEMO_MODE } from "@/data/config";
import { readProgress, updateProgress } from "@/data/progress";
import {
  getOptionalWeeks,
  getPlayableWeeks,
  getRecommendedAssignedWeek,
  readProgramStore,
  getWeekProgress,
  hasCompletedRequiredWeeks,
  isWeekComplete,
  isWeekPlayable,
  isFullRequiredPath,
  normalizeWeekList,
  type ProgramProgressStore,
} from "@/lib/program-progress";
import { getHomeBg, getHomeBgFilter, getVignetteStyle } from "@/lib/levelBand";

const TEACHER_MODE_KEY = "lul:hidden_teacher_mode";

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
  const curriculumYear = useMemo(() => {
    const selected = getProgramForYear(year);
    return selected.length > 0 ? year : "Year 1";
  }, [year]);
  const programYearIndex =
    curriculumYear === "Prep" ? 0 : parseInt(curriculumYear.replace(/\D/g, ""), 10) || 1;
  const levelNum = year === "Prep" ? 1 : parseInt(year.replace(/\D/g, ""), 10) || 1;
  const levelLabel = curriculumYear === "Prep" ? "Ground Level" : `Level ${programYearIndex}`;
  const isPrep = curriculumYear === "Prep";

  const [store, setStore] = useState<ProgramProgressStore>(() =>
    typeof window !== "undefined" ? readProgramStore() : {}
  );
  const [studentProgress, setStudentProgress] = useState(() =>
    typeof window !== "undefined" ? readProgress() : null
  );
  const [teacherMode, setTeacherMode] = useState(() =>
    typeof window !== "undefined" ? window.localStorage.getItem(TEACHER_MODE_KEY) === "true" : false
  );
  const [teacherToast, setTeacherToast] = useState("");
  const secretTapCountRef = useRef(0);
  const [weekMenuOpen, setWeekMenuOpen] = useState(false);
  const weekMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!weekMenuOpen) return;
    function onDown(e: MouseEvent) {
      if (weekMenuRef.current && !weekMenuRef.current.contains(e.target as Node)) {
        setWeekMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setWeekMenuOpen(false);
    }
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [weekMenuOpen]);

  // Re-read store on window focus (in case lesson page updated it)
  useEffect(() => {
    function onFocus() {
      setStore(readProgramStore());
      setStudentProgress(readProgress());
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const assignedProgram =
    studentProgress?.status === "ASSIGNED_PROGRAM" && studentProgress.year === curriculumYear
      ? studentProgress
      : null;
  const requiredWeeks = useMemo(
    () => normalizeWeekList(assignedProgram?.requiredWeeks),
    [assignedProgram?.requiredWeeks]
  );
  const optionalWeeks = useMemo(() => {
    const explicitOptionalWeeks = normalizeWeekList(assignedProgram?.optionalWeeks);
    return explicitOptionalWeeks.length > 0 ? explicitOptionalWeeks : getOptionalWeeks(requiredWeeks);
  }, [assignedProgram?.optionalWeeks, requiredWeeks]);
  const hasPersonalizedPlan = requiredWeeks.length > 0;
  const fullRequiredPath = useMemo(
    () => isFullRequiredPath(requiredWeeks, optionalWeeks),
    [optionalWeeks, requiredWeeks]
  );
  const requiredWeeksComplete = useMemo(
    () => hasCompletedRequiredWeeks(store, curriculumYear, requiredWeeks),
    [store, curriculumYear, requiredWeeks]
  );
  const canTakePostTestEarly = hasPersonalizedPlan && requiredWeeksComplete;
  const currentWeekIsRequired = requiredWeeks.includes(weekNum);
  const playableWeeks = useMemo(
    () => getPlayableWeeks(store, curriculumYear, requiredWeeks, optionalWeeks),
    [store, curriculumYear, requiredWeeks, optionalWeeks]
  );
  const weekIsPlayable = useMemo(
    () => isWeekPlayable(store, curriculumYear, weekNum, requiredWeeks, optionalWeeks),
    [store, curriculumYear, weekNum, requiredWeeks, optionalWeeks]
  );

  const prevProgress = getWeekProgress(store, year, Math.max(1, weekNum - 1));
  const weekUnlocked =
    DEMO_MODE || teacherMode ? true : hasPersonalizedPlan ? weekIsPlayable : weekNum === 1 ? true : isWeekComplete(prevProgress);

  const lastAllowedWeek = useMemo(() => {
    if (DEMO_MODE || teacherMode || hasPersonalizedPlan) return 12;
    let allowed = 1;
    for (let w = 2; w <= 12; w++) {
      if (isWeekComplete(getWeekProgress(store, year, w - 1))) allowed = w;
      else break;
    }
    return allowed;
  }, [teacherMode, year, store, hasPersonalizedPlan]);

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
      base.push({ type: "posttest" as const, n: 1, title: "Post-Test", focus: "Score 85%+ to unlock your Legend" });
    }
    return base;
  }, [curriculumYear, weekNum]);

  const currentWeekPlan = useMemo(() => {
    const program = getProgramForYear(curriculumYear);
    return program.find((w) => w.week === weekNum);
  }, [curriculumYear, weekNum]);

  function openItem(item: (typeof items)[number]) {
    if (!weekUnlocked && !teacherMode && !DEMO_MODE) return;

    if (!DEMO_MODE && !teacherMode) {
      if (item.type === "lesson") {
        const lessonIdx = item.n - 1;
        if (lessonIdx > 0 && !progress.lessonsCompleted[lessonIdx - 1]) return;
      }
      if (item.type === "quiz") {
        if (progress.lessonsCompleted.filter(Boolean).length < 3) return;
      }
      if (item.type === "posttest") {
        if (hasPersonalizedPlan) {
          if (!requiredWeeksComplete) return;
        } else if (progress.lessonsCompleted.filter(Boolean).length < 3) {
          return;
        }
      }
    }

    if (item.type === "lesson") {
      router.push(
        `/lesson?year=${encodeURIComponent(curriculumYear)}&week=${week}&lessonId=y${programYearIndex}-w${weekNum}-l${item.n}`
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
    if (!DEMO_MODE && !teacherMode && hasPersonalizedPlan && !playableWeeks.includes(clamped)) return;
    router.push(`/program?year=${encodeURIComponent(year)}&week=${clamped}`);
  }

  function setTeacherModeState(next: boolean) {
    setTeacherMode(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TEACHER_MODE_KEY, next ? "true" : "false");
    }
    setTeacherToast(next ? "Teacher mode enabled" : "Teacher mode disabled");
    window.setTimeout(() => setTeacherToast(""), 1800);
  }

  function handleSecretTeacherToggle() {
    secretTapCountRef.current += 1;
    const next = secretTapCountRef.current;
    if (next >= 6) {
      secretTapCountRef.current = 0;
      setTeacherModeState(!teacherMode);
      return;
    }
    window.setTimeout(() => {
      if (secretTapCountRef.current === next) {
        secretTapCountRef.current = 0;
      }
    }, 1500);
  }

  const lessonsDoneCount = progress.lessonsCompleted.filter(Boolean).length;
  const weekComplete = isWeekComplete(progress);

  useEffect(() => {
    const student = readProgress();
    if (!student || student.status !== "ASSIGNED_PROGRAM" || student.year !== curriculumYear) return;
    const savedWeek = student.assignedWeek ?? 1;
    let nextWeek = savedWeek;
    if (hasPersonalizedPlan) {
      nextWeek = getRecommendedAssignedWeek(store, curriculumYear, savedWeek, student.requiredWeeks);
    } else {
      if (weekNum > savedWeek) nextWeek = weekNum;
      if (weekComplete) nextWeek = Math.max(nextWeek, Math.min(12, weekNum + 1));
    }
    if (nextWeek !== savedWeek) updateProgress({ assignedWeek: nextWeek });
  }, [weekComplete, weekNum, hasPersonalizedPlan, store, curriculumYear]);

  const xp = lessonsDoneCount * 10 + (progress.quizCompleted ? 20 : 0);
  const totalXp = 50;
  const percent = Math.round((xp / totalXp) * 100);

  return (
    <main className="min-h-screen relative">
      {/* Realm background — same as student dashboard for this level */}
      <div className="fixed inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getHomeBg(levelNum, isPrep)}
          alt=""
          className="w-full h-full object-cover"
          style={{ filter: isPrep ? "brightness(1.22) contrast(1.05) saturate(1.18)" : getHomeBgFilter(levelNum) }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: getVignetteStyle(levelNum) }}
        />
        <div className={`absolute inset-0 ${isPrep ? "bg-black/10" : "bg-black/30"}`} />
        {isPrep && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 70%, rgba(94,234,212,0.22), transparent 65%), linear-gradient(180deg, rgba(186,230,253,0.10) 0%, transparent 40%)",
            }}
          />
        )}
        {/* Soft top glow for premium polish */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at top, rgba(255,255,255,0.10), transparent 60%)",
          }}
        />
      </div>

      {/* ── Hero header ── */}
      <div className="relative z-10">
        <div className="relative max-w-6xl mx-auto px-6 pt-5 pb-10">
          <div className="flex items-start justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/home")}
                className="border border-teal-300/25 bg-black/25 px-4 py-2 text-xs font-mono font-black uppercase tracking-[0.14em] text-teal-50 backdrop-blur-md transition hover:border-teal-200/45 hover:bg-teal-950/45 focus:outline-none focus:ring-2 focus:ring-teal-300/25"
                style={{
                  clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
                  boxShadow: "inset 0 1px 0 rgba(94,234,212,0.2), 0 0 18px rgba(20,184,166,0.12)",
                }}
              >
                ← Back
              </button>
              <div ref={weekMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setWeekMenuOpen((v) => !v)}
                  aria-haspopup="listbox"
                  aria-expanded={weekMenuOpen}
                  className="relative flex min-w-[170px] items-center justify-between gap-3 border border-teal-300/25 bg-black/25 px-4 py-2 text-xs font-mono font-black uppercase tracking-[0.14em] text-teal-50 backdrop-blur-md transition hover:border-teal-200/45 hover:bg-teal-950/45 focus:outline-none focus:ring-2 focus:ring-teal-300/25"
                  style={{
                    clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
                    boxShadow: "inset 0 1px 0 rgba(94,234,212,0.2), 0 0 18px rgba(20,184,166,0.12)",
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-300 shadow-[0_0_8px_rgba(94,234,212,0.9)]" />
                    Week {weekNum}
                  </span>
                  <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 text-teal-100/80 transition-transform ${weekMenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {weekMenuOpen && (
                  <div
                    role="listbox"
                    className="absolute left-0 top-[calc(100%+6px)] z-50 max-h-[260px] w-[170px] overflow-y-auto border border-teal-300/30 bg-[rgba(2,18,18,0.92)] backdrop-blur-xl"
                    style={{
                      clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
                      boxShadow: "inset 0 1px 0 rgba(94,234,212,0.25), 0 14px 40px rgba(0,0,0,0.55), 0 0 28px rgba(20,184,166,0.18)",
                    }}
                  >
                    <div className="px-3 py-1.5 border-b border-teal-300/15 text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-teal-300/80">
                      Select Week
                    </div>
                    <ul className="py-0.5">
                      {Array.from({ length: 12 }).map((_, index) => {
                        const targetWeek = index + 1;
                        const isUnlocked = DEMO_MODE || teacherMode || (hasPersonalizedPlan ? playableWeeks.includes(targetWeek) : targetWeek <= lastAllowedWeek);
                        const isCurrent = targetWeek === weekNum;
                        const isRequiredWeek = requiredWeeks.includes(targetWeek);
                        const isDoneWeek = isWeekComplete(getWeekProgress(store, year, targetWeek));
                        const status = hasPersonalizedPlan
                          ? isCurrent
                            ? "Current"
                            : isRequiredWeek
                              ? isDoneWeek
                                ? "Required Done"
                                : "Required"
                              : isDoneWeek
                                ? "Optional Done"
                                : requiredWeeksComplete
                                  ? "Optional"
                                  : "Locked"
                          : isCurrent
                            ? "Current"
                            : isUnlocked
                              ? "Open"
                              : "Locked";
                        return (
                          <li key={targetWeek}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={isCurrent}
                              onClick={() => {
                                setWeekMenuOpen(false);
                                goToWeek(targetWeek);
                              }}
                              className={`group flex w-full items-center justify-between gap-2 px-3 py-1 text-left text-[10px] font-mono font-bold uppercase tracking-[0.12em] transition ${
                                isCurrent
                                  ? "bg-teal-400/15 text-teal-100"
                                  : isUnlocked
                                  ? "text-teal-50/85 hover:bg-teal-400/10 hover:text-teal-50"
                                  : "text-teal-50/30 hover:bg-white/5"
                              }`}
                            >
                              <span className="flex items-center gap-1.5">
                                {isCurrent ? (
                                  <svg viewBox="0 0 24 24" className="h-2.5 w-2.5 text-teal-300" fill="none" stroke="currentColor" strokeWidth="3">
                                    <path d="M5 12l5 5L20 7" />
                                  </svg>
                                ) : (
                                  <span className={`h-1 w-1 rounded-full ${isUnlocked ? "bg-teal-400/70" : "bg-white/20"}`} />
                                )}
                                Week {targetWeek}
                              </span>
                              <span className={`text-[8px] tracking-[0.16em] ${
                                isCurrent ? "text-teal-300" : isUnlocked ? "text-teal-200/60" : "text-white/30"
                              }`}>
                                {status}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <span className="text-sm text-white/80 font-medium ml-1">{levelLabel}</span>
          </div>

          <div className="text-center">
            {/* Nexus level pill */}
            <button
              type="button"
              onClick={handleSecretTeacherToggle}
              className="inline-flex items-center gap-2 px-4 py-1.5 text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-teal-50"
              style={{
                background: "linear-gradient(135deg, #021a18 0%, #064e47 50%, #0a5048 100%)",
                clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
                boxShadow: "inset 0 1px 0 rgba(94,234,212,0.35), inset 0 -1px 0 rgba(0,0,0,0.5), 0 0 18px rgba(20,184,166,0.25)",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-teal-300 shadow-[0_0_8px_rgba(94,234,212,0.9)]" />
              {levelLabel} · Program
            </button>
            <h1 className="text-4xl md:text-5xl font-black text-white mt-3 tracking-tight drop-shadow-[0_2px_12px_rgba(20,184,166,0.35)]">Week {weekNum}</h1>
            <p className="text-base md:text-lg text-teal-50/95 mt-2 font-semibold">
              <span className="text-teal-300/80 font-mono text-xs uppercase tracking-[0.18em] mr-2">Focus</span>
              {currentWeekPlan?.topic ?? "Your current focus"}
            </p>
            {hasPersonalizedPlan ? (
              <p className="text-teal-200/80 mt-2 text-xs font-mono uppercase tracking-[0.16em]">
                {currentWeekIsRequired ? "◆ Required Week" : canTakePostTestEarly ? "◆ Optional Practice Week" : "◆ Locked Bonus Week"}
              </p>
            ) : null}
            <p className="text-teal-200/80 mt-2 text-xs font-mono uppercase tracking-[0.16em]">
              {weekUnlocked
                ? weekComplete
                  ? "◆ Completed"
                  : `${lessonsDoneCount}/3 Lessons · ${progress.quizCompleted ? "Quiz Done" : "Quiz Pending"}`
                : "◆ Preview Locked"}
            </p>

            {teacherToast ? (
              <div className="mt-3 inline-flex items-center rounded-full border border-teal-300/35 bg-black/30 px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-teal-100">
                {teacherToast}
              </div>
            ) : null}

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
      <div className="relative z-10 px-4 pb-16 pt-10 md:px-6 md:pt-16">
        <div className="max-w-6xl mx-auto">
          {hasPersonalizedPlan ? (
            <div className="mb-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[26px] border border-teal-300/25 bg-black/25 p-5 backdrop-blur-md shadow-[0_16px_40px_rgba(0,0,0,0.24)]">
                <div className="text-[11px] font-mono font-black uppercase tracking-[0.22em] text-teal-300/85">
                  Required Pathway
                </div>
                <p className="mt-2 text-sm text-teal-50/90">
                  {fullRequiredPath
                    ? "These weeks are needed to pass this level. Complete them in order."
                    : "These weeks are needed to pass this level."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {requiredWeeks.map((requiredWeek) => {
                    const done = isWeekComplete(getWeekProgress(store, year, requiredWeek));
                    return (
                      <button
                        key={requiredWeek}
                        type="button"
                        onClick={() => goToWeek(requiredWeek)}
                        className="inline-flex items-center gap-2 px-3 py-2 text-xs font-mono font-black uppercase tracking-[0.16em] text-teal-50 transition hover:-translate-y-0.5"
                        style={{
                          clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)",
                          background: done
                            ? "linear-gradient(135deg, #064e3b 0%, #10b981 100%)"
                            : "linear-gradient(135deg, #064e47 0%, #14b8a6 100%)",
                          boxShadow: done
                            ? "inset 0 1px 0 rgba(110,231,183,0.45), 0 0 16px rgba(16,185,129,0.28)"
                            : "inset 0 1px 0 rgba(94,234,212,0.35), 0 0 14px rgba(20,184,166,0.22)",
                        }}
                      >
                        <span>Week {requiredWeek}</span>
                        <span className="text-[10px] text-white/80">{done ? "Done" : "Required"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[26px] border border-white/12 bg-black/20 p-5 backdrop-blur-md shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
                <div className="text-[11px] font-mono font-black uppercase tracking-[0.22em] text-amber-200/90">
                  Optional Practice
                </div>
                <p className="mt-2 text-sm text-white/80">
                  {canTakePostTestEarly
                    ? "You’ve completed your required pathway. You can take the post-test now or keep practising for extra XP."
                    : "Complete your required pathway to unlock these extra weeks for more XP, rewards, and practice."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {optionalWeeks.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60">
                      No optional weeks in this pathway.
                    </div>
                  ) : optionalWeeks.map((optionalWeek) => {
                    const done = isWeekComplete(getWeekProgress(store, year, optionalWeek));
                    const optionalPlayable = requiredWeeksComplete || done;
                    return (
                      <button
                        key={optionalWeek}
                        type="button"
                        onClick={() => goToWeek(optionalWeek)}
                        className="inline-flex items-center gap-2 px-3 py-2 text-xs font-mono font-black uppercase tracking-[0.16em] text-white/85 transition hover:-translate-y-0.5"
                        style={{
                          clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)",
                          background: done
                            ? "linear-gradient(135deg, rgba(16,185,129,0.28), rgba(6,78,59,0.9))"
                            : optionalPlayable
                              ? "linear-gradient(135deg, rgba(15,23,42,0.85), rgba(51,65,85,0.7))"
                              : "linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.92))",
                          boxShadow: done
                            ? "inset 0 1px 0 rgba(110,231,183,0.18)"
                            : optionalPlayable
                              ? "inset 0 1px 0 rgba(255,255,255,0.08)"
                              : "inset 0 1px 0 rgba(148,163,184,0.08)",
                        }}
                      >
                        <span>Week {optionalWeek}</span>
                        <span className="text-[10px] text-white/60">
                          {done ? "Done" : optionalPlayable ? "Optional" : "Locked"}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {requiredWeeksComplete ? (
                  <div className="mt-4 rounded-2xl border border-emerald-300/25 bg-emerald-400/10 p-4">
                    <div className="text-[11px] font-mono font-black uppercase tracking-[0.18em] text-emerald-200">
                      Ready For Post-Test
                    </div>
                    <p className="mt-2 text-sm text-white/85">
                      All required weeks are complete. You can take the post-test now, or keep working through optional weeks first.
                    </p>
                    <button
                      type="button"
                      onClick={() => router.push(`/posttest?year=${encodeURIComponent(curriculumYear)}`)}
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-black uppercase tracking-[0.16em] text-white"
                      style={{
                        clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)",
                        background: "linear-gradient(135deg, #064e3b 0%, #10b981 100%)",
                        boxShadow: "inset 0 1px 0 rgba(110,231,183,0.45), 0 0 16px rgba(16,185,129,0.22)",
                      }}
                    >
                      Take Post-Test
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
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
              if (!DEMO_MODE && !teacherMode) {
                if (!weekUnlocked) {
                  locked = true;
                }
                if (isLesson && item.n > 1 && !progress.lessonsCompleted[item.n - 2]) locked = true;
                if (item.type === "quiz" && lessonsDoneCount < 3) locked = true;
                if (isPostTest) {
                  if (hasPersonalizedPlan) locked = !requiredWeeksComplete;
                  else if (lessonsDoneCount < 3) locked = true;
                }
              }

              const isActive = !locked && !completed;
              const postTestReady = isPostTest && !locked;
              const isLast = idx === items.length - 1;
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
                        : completed
                          ? "linear-gradient(135deg, #022c22 0%, #064e3b 50%, #047857 100%)"
                          : "linear-gradient(135deg, #021a18 0%, #052e2b 50%, #064e47 100%)",
                      boxShadow: completed
                        ? "inset 0 1px 0 rgba(110,231,183,0.4), inset 0 -10px 24px rgba(0,0,0,0.4), 0 0 26px rgba(16,185,129,0.45)"
                        : isActive
                          ? "inset 0 1px 0 rgba(94,234,212,0.25), inset 0 -10px 24px rgba(0,0,0,0.45), 0 0 22px rgba(20,184,166,0.3)"
                          : "inset 0 1px 0 rgba(94,234,212,0.18), inset 0 -10px 20px rgba(0,0,0,0.4), 0 0 14px rgba(20,184,166,0.15)",
                    }}
                  >
                    {/* Scanline texture */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-[0.06]"
                      style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(94,234,212,0.6) 0 1px, transparent 1px 3px)" }}
                    />
                    {/* Completed checkmark watermark */}
                    {completed && (
                      <svg
                        className="absolute -right-4 -bottom-4 h-32 w-32 text-emerald-400/10 pointer-events-none"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                    {/* Completed corner stripe */}
                    {completed && (
                      <div
                        className="absolute top-0 left-0 h-1 w-full pointer-events-none"
                        style={{
                          background: "linear-gradient(90deg, #6ee7b7, #10b981 50%, transparent 100%)",
                          boxShadow: "0 0 12px rgba(110,231,183,0.7)",
                        }}
                      />
                    )}

                    <div className="relative flex items-center justify-between">
                      <span
                        className="inline-flex items-center px-3 py-1 text-[11px] font-mono font-extrabold uppercase tracking-[0.18em]"
                        style={{
                          clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)",
                          background: locked
                            ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
                            : postTestReady
                              ? "linear-gradient(135deg, #78350f 0%, #f59e0b 100%)"
                              : completed
                                ? "linear-gradient(135deg, #064e3b 0%, #10b981 100%)"
                                : "linear-gradient(135deg, #064e47 0%, #14b8a6 100%)",
                          color: locked ? "#64748b" : "#ecfeff",
                          boxShadow: "inset 0 1px 0 rgba(94,234,212,0.35)",
                        }}
                      >
                        {isPostTest ? "Post Test" : item.type === "quiz" ? "Weekly Quiz" : `Lesson ${item.n}`}
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
                      <div className="font-extrabold text-white leading-tight line-clamp-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
                        {item.title}
                      </div>
                      <div
                        className="mt-1.5 text-xs text-teal-100/60 leading-snug"
                        style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                      >
                        {!weekUnlocked
                          ? hasPersonalizedPlan
                            ? "Complete your current lesson to unlock this"
                            : "Complete previous weeks to unlock"
                          : locked && isPostTest
                            ? hasPersonalizedPlan
                              ? "Complete your required pathway to unlock"
                              : "Complete all lessons to unlock"
                            : item.focus}
                      </div>
                    </div>

                    <div className="relative flex items-center justify-between pt-2 border-t border-teal-400/15">
                      <span className="text-[10px] font-mono font-bold text-teal-200/70 tracking-[0.14em]">
                        {isPostTest ? "MASTERY" : isLesson ? "10 XP" : "20 XP"}
                      </span>
                      {locked ? (
                        <span className="text-[10px] font-mono font-extrabold text-slate-400">
                          {weekUnlocked ? "—" : "LOCKED"}
                        </span>
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

          {!weekUnlocked ? (
            <div className="mt-6 rounded-[28px] border border-white/10 bg-black/25 p-6 text-center backdrop-blur-md shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/8 text-teal-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="4" y="11" width="16" height="9" rx="2" />
                  <path d="M8 11V8a4 4 0 018 0v3" />
                </svg>
              </div>
              <h2 className="mt-4 text-2xl font-black text-white">Week {weekNum} Preview</h2>
              <p className="mt-2 text-sm font-semibold text-teal-100/75">
                Complete previous weeks to unlock
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => goToWeek(lastAllowedWeek)}
                  className="rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-950/30 transition hover:-translate-y-0.5"
                >
                  Go to Week {lastAllowedWeek}
                </button>
                <button
                  onClick={() => router.push("/home")}
                  className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15"
                >
                  Back to Home
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
