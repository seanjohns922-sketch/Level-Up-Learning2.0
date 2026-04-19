"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PracticeRunner } from "@/components/PracticeRunner";
import { Year2LessonEngine } from "@/components/lesson/Year2LessonEngine";
import { generateWeek1Task } from "@/data/activities/year1/week1";
import { generateWeek2Task } from "@/data/activities/year1/week2";
import { generateWeek3Task } from "@/data/activities/year1/week3";
import { generateWeek4Task } from "@/data/activities/year1/week4";
import { generateWeek5Task } from "@/data/activities/year1/week5";
import { generateWeek6Task } from "@/data/activities/year1/week6";
import { generateWeek7Task } from "@/data/activities/year1/week7";
import { generateWeek8Task } from "@/data/activities/year1/week8";
import { generateWeek9Task } from "@/data/activities/year1/week9";
import { generateWeek10Task } from "@/data/activities/year1/week10";
import { generateWeek12Task } from "@/data/activities/year1/week12";
import { generateWeek11Task } from "@/data/activities/year1/week11";
import { getProgramForYear } from "@/data/programs";
import { readProgress, updateProgress } from "@/data/progress";
import { markLessonComplete } from "@/lib/program-progress";
import { getLessonChrome } from "@/lib/levelTheme";
import { LessonPageHero } from "@/components/lesson/LessonPageHero";

export default function LessonPageWrapper() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Loading…</p></div>}><LessonPage /></Suspense>;
}

function LessonPage() {
  const router = useRouter();
  const params = useSearchParams();

  const year = params.get("year") ?? "Year 1";
  const week = Number(params.get("week") ?? "1");
  const yearNumber = parseInt(year.replace(/\D/g, ""), 10) || 1;
  const lessonId = params.get("lessonId") ?? `y${yearNumber}-w1-l1`;
  const expectedPrefix = `y${yearNumber}-w${week}-`;
  const effectiveLessonId = lessonId.startsWith(expectedPrefix)
    ? lessonId
    : `y${yearNumber}-w${week}-l1`;

  // Extract lesson number from lessonId (e.g. "y1-w1-l2" → 2)
  const lessonNumber = useMemo(() => {
    const match = effectiveLessonId.match(/l(\d+)$/);
    return match ? Number(match[1]) : 1;
  }, [effectiveLessonId]);
  const lessonChrome = useMemo(() => getLessonChrome(yearNumber), [yearNumber]);

  const [started, setStarted] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const lessonMeta = useMemo(() => {
    const program = getProgramForYear(year);
    const weekPlan = program.find((w) => w.week === week);
    return weekPlan?.lessons.find((l) => l.id === effectiveLessonId) ?? null;
  }, [year, week, effectiveLessonId]);
  const safeLessonTitle = isHydrated ? lessonMeta?.title : null;
  const safeLessonFocus = isHydrated ? lessonMeta?.focus : null;
  const hasEmbeddedLessonVideo =
    year === "Year 4" && week === 2 && lessonNumber === 1;

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const p = readProgress();
    if (!p || p.status !== "ASSIGNED_PROGRAM") return;
    const nextWeek = Math.max(p.assignedWeek ?? 1, week);
    if (nextWeek !== p.assignedWeek) updateProgress({ assignedWeek: nextWeek });
  }, [week]);

  useEffect(() => {
    setStarted(false);
    // Clear session start time so PracticeRunner gets a fresh timer
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("lul_lesson_start_time");
    }
  }, [effectiveLessonId, week, year]);

  function completeLesson() {
    markLessonComplete(year, week, lessonNumber);
    router.push(`/program?year=${encodeURIComponent(year)}&week=${week}`);
  }

  function markLessonDone() {
    markLessonComplete(year, week, lessonNumber);
  }

  function goBackToProgram() {
    router.push(`/program?year=${encodeURIComponent(year)}&week=${week}`);
  }

  return (
    <main className="min-h-screen flex items-start justify-center px-4 py-6 bg-background">
      <div className="w-full max-w-6xl">
        <div className="mb-4">
          <button
            onClick={() =>
              router.push(`/program?year=${encodeURIComponent(year)}&week=${week}`)
            }
            className="text-sm font-mono font-bold uppercase tracking-[0.18em] text-teal-700 hover:text-teal-600 transition-colors"
          >
            ← Back to Week {week}
          </button>
        </div>

        {!started ? (
          <div className="rounded-[24px] overflow-hidden shadow-[0_2px_6px_rgba(0,0,0,0.04),0_16px_40px_rgba(0,0,0,0.08)] border border-border/40 bg-card">
            <LessonPageHero
              levelNumber={yearNumber}
              week={week}
              lessonNumber={lessonNumber}
              pageTitle={`Lesson ${lessonNumber} Practise`}
              lessonTitle={safeLessonTitle ?? `Week ${week} Lesson ${lessonNumber}`}
              focus={safeLessonFocus ?? "Watch the video and complete activities"}
              heroClass={lessonChrome.heroClass}
            />

            <div className="bg-background px-4 py-5 md:px-6 md:py-6">
              {/* ROW 1: 2-column landscape — left intro / right video */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* LEFT: Mission briefing */}
                <div className="relative overflow-hidden bg-card rounded-[20px] border border-teal-200/60 shadow-[0_2px_6px_rgba(2,23,22,0.04),0_8px_24px_rgba(2,23,22,0.06)] p-5 md:p-6 flex flex-col">
                  {/* Circuit corner accents */}
                  <svg aria-hidden className="pointer-events-none absolute -top-px -left-px h-16 w-16 text-teal-500/25" viewBox="0 0 64 64" fill="none">
                    <path d="M0 16 H20 L28 24 H48" stroke="currentColor" strokeWidth="1" />
                    <path d="M0 28 H10 L16 34" stroke="currentColor" strokeWidth="1" />
                    <circle cx="48" cy="24" r="1.5" fill="currentColor" />
                    <circle cx="16" cy="34" r="1.5" fill="currentColor" />
                  </svg>
                  <svg aria-hidden className="pointer-events-none absolute -bottom-px -right-px h-20 w-20 text-emerald-500/20" viewBox="0 0 80 80" fill="none">
                    <path d="M80 50 H60 L52 58 H30" stroke="currentColor" strokeWidth="1" />
                    <path d="M80 64 H66 L60 70" stroke="currentColor" strokeWidth="1" />
                    <circle cx="30" cy="58" r="1.5" fill="currentColor" />
                    <circle cx="60" cy="70" r="1.5" fill="currentColor" />
                  </svg>
                  {/* Faint number grid */}
                  <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{
                    backgroundImage: "linear-gradient(rgba(13,148,136,1) 1px, transparent 1px), linear-gradient(90deg, rgba(13,148,136,1) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }} />

                  <div className="relative inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-300/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-teal-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-teal-600/90 text-white shadow-sm">
                      <svg viewBox="0 0 16 16" className="h-2.5 w-2.5" fill="currentColor"><path d="M8 1l6 3.5v7L8 15 2 11.5v-7L8 1zm0 2.3L4 5.6v4.8l4 2.3 4-2.3V5.6L8 3.3z"/></svg>
                    </span>
                    Mission Briefing
                  </div>
                  <h2 className="relative mt-3 text-[1.35rem] md:text-2xl font-bold text-foreground leading-[1.15] tracking-[-0.02em]">
                    {safeLessonTitle ?? `Week ${week} Lesson ${lessonNumber}`}
                  </h2>
                  {safeLessonFocus ? (
                    <p className="relative mt-2 text-sm font-medium text-foreground/80 leading-relaxed">
                      <span className="font-semibold text-teal-800">Focus:</span> {safeLessonFocus}
                    </p>
                  ) : null}
                  <p className="relative mt-2.5 text-sm font-normal text-muted-foreground leading-relaxed">
                    Watch the short lesson video, then jump into 8 minutes of practice. Earn XP for every correct answer and unlock your Level Up Legend.
                  </p>
                </div>

                {/* RIGHT: Video card */}
                <div className="relative overflow-hidden bg-card rounded-[20px] border border-teal-200/60 shadow-[0_2px_6px_rgba(2,23,22,0.04),0_8px_24px_rgba(2,23,22,0.06)] p-3 md:p-4">
                  <svg aria-hidden className="pointer-events-none absolute -top-px -right-px h-16 w-16 text-teal-500/25" viewBox="0 0 64 64" fill="none">
                    <path d="M64 16 H44 L36 24 H16" stroke="currentColor" strokeWidth="1" />
                    <path d="M64 28 H54 L48 34" stroke="currentColor" strokeWidth="1" />
                    <circle cx="16" cy="24" r="1.5" fill="currentColor" />
                  </svg>
                  <div className="relative flex items-center gap-2 text-foreground font-semibold mb-2.5 px-1 tracking-tight">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-teal-600 to-emerald-700 text-white shadow-[0_2px_6px_rgba(13,148,136,0.35),inset_0_1px_0_rgba(255,255,255,0.2)]">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                    <span className="text-sm">Lesson Video</span>
                    <span className="ml-auto inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-[0.2em] text-teal-700/70">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
                      Live
                    </span>
                  </div>
                  {hasEmbeddedLessonVideo ? (
                    <div
                      className="relative rounded-xl overflow-hidden bg-black shadow-inner ring-1 ring-teal-500/20"
                      style={{ position: "relative", width: "100%", paddingTop: "56.25%" }}
                    >
                      <iframe
                        src="https://player.vimeo.com/video/1183966051?h=ff99ab69f7"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        className="absolute left-0 top-0 h-full w-full"
                        title="Lesson video"
                      />
                    </div>
                  ) : (
                    <div className="relative aspect-video rounded-xl overflow-hidden flex flex-col items-center justify-center text-white/80 text-xs gap-2 shadow-inner ring-1 ring-teal-400/30"
                      style={{ background: "linear-gradient(135deg, #021716 0%, #064e47 60%, #0d9488 100%)" }}
                    >
                      {/* Holographic grid */}
                      <div aria-hidden className="absolute inset-0 opacity-[0.18]" style={{
                        backgroundImage: "linear-gradient(rgba(94,234,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(94,234,212,1) 1px, transparent 1px)",
                        backgroundSize: "28px 28px",
                        maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
                        WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
                      }} />
                      {/* Corner brackets */}
                      <svg aria-hidden className="absolute top-2 left-2 h-5 w-5 text-teal-300/70" viewBox="0 0 20 20" fill="none"><path d="M2 8V2h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      <svg aria-hidden className="absolute top-2 right-2 h-5 w-5 text-teal-300/70" viewBox="0 0 20 20" fill="none"><path d="M18 8V2h-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      <svg aria-hidden className="absolute bottom-2 left-2 h-5 w-5 text-teal-300/70" viewBox="0 0 20 20" fill="none"><path d="M2 12v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      <svg aria-hidden className="absolute bottom-2 right-2 h-5 w-5 text-teal-300/70" viewBox="0 0 20 20" fill="none"><path d="M18 12v6h-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-teal-500/15 backdrop-blur-sm border border-teal-300/40 shadow-[0_0_24px_rgba(94,234,212,0.35)]">
                        <svg viewBox="0 0 24 24" className="h-5 w-5 ml-0.5 text-teal-200" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                      <span className="relative font-mono text-[10px] uppercase tracking-[0.25em] text-teal-200/90">Video coming soon</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ROW 2: Compact action strip */}
              <div className="relative overflow-hidden mt-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-[20px] border border-teal-200/60 bg-card px-4 py-3 md:px-5 md:py-3.5 shadow-[0_2px_6px_rgba(2,23,22,0.04),0_8px_24px_rgba(2,23,22,0.06)]">
                <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-1/3 opacity-[0.05]" style={{
                  backgroundImage: "linear-gradient(rgba(13,148,136,1) 1px, transparent 1px), linear-gradient(90deg, rgba(13,148,136,1) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                  maskImage: "linear-gradient(90deg, transparent, black)",
                  WebkitMaskImage: "linear-gradient(90deg, transparent, black)",
                }} />
                <div className="relative flex flex-wrap items-center gap-3">
                  {/* Nexus Plate: Time */}
                  <div className="relative">
                    <div className="absolute -inset-[3px] pointer-events-none" style={{
                      background: "linear-gradient(135deg, rgba(94,234,212,0.55) 0%, rgba(15,118,110,0.25) 50%, rgba(94,234,212,0.45) 100%)",
                      clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
                    }} />
                    <div className="relative inline-flex items-center gap-2.5 pl-2 pr-4 py-2 overflow-hidden"
                      style={{
                        background: "linear-gradient(135deg, #021a18 0%, #063d38 45%, #0a5048 100%)",
                        clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
                        boxShadow: "inset 0 1px 0 rgba(94,234,212,0.35), inset 0 -8px 16px rgba(0,0,0,0.4)",
                      }}
                    >
                      <div aria-hidden className="absolute inset-0 opacity-20 pointer-events-none" style={{
                        backgroundImage: "repeating-linear-gradient(0deg, rgba(94,234,212,0.15) 0px, rgba(94,234,212,0.15) 1px, transparent 1px, transparent 3px)",
                      }} />
                      <svg aria-hidden className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-10 text-teal-300/40 pointer-events-none" viewBox="0 0 40 24" fill="none">
                        <path d="M0 12 H14 L18 8 H32" stroke="currentColor" strokeWidth="0.8" />
                        <path d="M0 18 H10 L14 14 H28" stroke="currentColor" strokeWidth="0.8" />
                        <circle cx="32" cy="8" r="1.2" fill="currentColor" />
                        <circle cx="28" cy="14" r="1" fill="currentColor" />
                      </svg>
                      <span className="relative inline-flex h-7 w-7 items-center justify-center" style={{
                        background: "radial-gradient(circle at 35% 30%, #0d9488 0%, #064e47 60%, #021716 100%)",
                        clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
                        boxShadow: "inset 0 0 6px rgba(94,234,212,0.6), 0 0 8px rgba(94,234,212,0.3)",
                      }}>
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-teal-100 drop-shadow-[0_0_3px_rgba(94,234,212,0.9)]" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="13" r="7" />
                          <path d="M12 9v4l2.5 1.5M9 2h6" strokeLinecap="round" />
                        </svg>
                      </span>
                      <span className="relative text-[11px] font-mono font-bold uppercase tracking-[0.22em] text-teal-50 drop-shadow-[0_1px_0_rgba(0,0,0,0.6)]">8 Min</span>
                    </div>
                  </div>

                  {/* Nexus Plate: XP */}
                  <div className="relative">
                    <div className="absolute -inset-[3px] pointer-events-none" style={{
                      background: "linear-gradient(135deg, rgba(251,191,36,0.55) 0%, rgba(94,234,212,0.3) 50%, rgba(251,191,36,0.45) 100%)",
                      clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
                    }} />
                    <div className="relative inline-flex items-center gap-2.5 pl-2 pr-4 py-2 overflow-hidden"
                      style={{
                        background: "linear-gradient(135deg, #021a18 0%, #0a3d36 45%, #154d3a 100%)",
                        clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
                        boxShadow: "inset 0 1px 0 rgba(251,191,36,0.3), inset 0 -8px 16px rgba(0,0,0,0.4), 0 0 18px rgba(251,191,36,0.18)",
                      }}
                    >
                      <div aria-hidden className="absolute inset-0 opacity-20 pointer-events-none" style={{
                        backgroundImage: "repeating-linear-gradient(0deg, rgba(251,191,36,0.15) 0px, rgba(251,191,36,0.15) 1px, transparent 1px, transparent 3px)",
                      }} />
                      <div aria-hidden className="absolute left-0 top-0 h-full w-12 pointer-events-none" style={{
                        background: "radial-gradient(circle at 30% 50%, rgba(251,191,36,0.45), transparent 70%)",
                      }} />
                      <svg aria-hidden className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-10 text-amber-300/40 pointer-events-none" viewBox="0 0 40 24" fill="none">
                        <path d="M0 12 H14 L18 8 H32" stroke="currentColor" strokeWidth="0.8" />
                        <circle cx="32" cy="8" r="1.2" fill="currentColor" />
                      </svg>
                      <span className="relative inline-flex h-7 w-7 items-center justify-center" style={{
                        background: "radial-gradient(circle at 35% 30%, #fbbf24 0%, #92400e 70%, #1c1917 100%)",
                        clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
                        boxShadow: "inset 0 0 6px rgba(253,224,71,0.7), 0 0 10px rgba(251,191,36,0.5)",
                      }}>
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-amber-50 drop-shadow-[0_0_4px_rgba(253,224,71,1)]" fill="currentColor">
                          <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
                        </svg>
                      </span>
                      <span className="relative text-[11px] font-mono font-bold uppercase tracking-[0.22em] text-amber-50 drop-shadow-[0_1px_0_rgba(0,0,0,0.6)]">50 XP</span>
                    </div>
                  </div>

                  {/* Nexus Plate: Legend */}
                  <div className="relative">
                    <div className="absolute -inset-[3px] pointer-events-none" style={{
                      background: "linear-gradient(135deg, rgba(110,231,183,0.55) 0%, rgba(15,118,110,0.3) 50%, rgba(110,231,183,0.45) 100%)",
                      clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
                    }} />
                    <div className="relative inline-flex items-center gap-2.5 pl-2 pr-4 py-2 overflow-hidden"
                      style={{
                        background: "linear-gradient(135deg, #021a18 0%, #063d38 45%, #0d6b50 100%)",
                        clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
                        boxShadow: "inset 0 1px 0 rgba(110,231,183,0.35), inset 0 -8px 16px rgba(0,0,0,0.4), 0 0 14px rgba(52,211,153,0.15)",
                      }}
                    >
                      <div aria-hidden className="absolute inset-0 opacity-20 pointer-events-none" style={{
                        backgroundImage: "repeating-linear-gradient(0deg, rgba(110,231,183,0.15) 0px, rgba(110,231,183,0.15) 1px, transparent 1px, transparent 3px)",
                      }} />
                      <svg aria-hidden className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-10 text-emerald-300/40 pointer-events-none" viewBox="0 0 40 24" fill="none">
                        <path d="M0 12 H14 L18 8 H32" stroke="currentColor" strokeWidth="0.8" />
                        <path d="M0 18 H10 L14 14 H28" stroke="currentColor" strokeWidth="0.8" />
                        <circle cx="32" cy="8" r="1.2" fill="currentColor" />
                      </svg>
                      <span className="relative inline-flex h-7 w-7 items-center justify-center" style={{
                        background: "radial-gradient(circle at 35% 30%, #34d399 0%, #065f46 60%, #021716 100%)",
                        clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
                        boxShadow: "inset 0 0 6px rgba(110,231,183,0.7), 0 0 10px rgba(52,211,153,0.4)",
                      }}>
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-emerald-50 drop-shadow-[0_0_3px_rgba(110,231,183,0.9)]" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M12 2l9 5v10l-9 5-9-5V7l9-5z" strokeLinejoin="round" />
                          <path d="M12 7l5 2.8v5.4L12 18l-5-2.8V9.8L12 7z" strokeLinejoin="round" opacity="0.65" />
                        </svg>
                      </span>
                      <span className="relative text-[11px] font-mono font-bold uppercase tracking-[0.22em] text-emerald-50 drop-shadow-[0_1px_0_rgba(0,0,0,0.6)]">Unlock Legend</span>
                    </div>
                  </div>
                </div>
                <div className="relative group">
                  {/* Outer bracket bezel */}
                  <div className="absolute -inset-[3px] pointer-events-none transition-opacity duration-200 group-hover:opacity-100" style={{
                    background: "linear-gradient(135deg, rgba(94,234,212,0.7) 0%, rgba(15,118,110,0.35) 50%, rgba(94,234,212,0.6) 100%)",
                    clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
                  }} />
                  <button
                    onClick={() => setStarted(true)}
                    className="relative inline-flex items-center justify-center gap-2 text-white font-bold tracking-tight px-7 py-3 text-sm md:text-base overflow-hidden hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
                    style={{
                      background: "linear-gradient(135deg, #021a18 0%, #064e47 45%, #0d9488 100%)",
                      clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
                      boxShadow: "inset 0 1px 0 rgba(94,234,212,0.4), inset 0 -10px 20px rgba(0,0,0,0.45), 0 8px 22px rgba(2,23,22,0.5), 0 0 18px rgba(94,234,212,0.2)",
                    }}
                  >
                    {/* Scanlines */}
                    <div aria-hidden className="absolute inset-0 opacity-20 pointer-events-none" style={{
                      backgroundImage: "repeating-linear-gradient(0deg, rgba(94,234,212,0.18) 0px, rgba(94,234,212,0.18) 1px, transparent 1px, transparent 3px)",
                    }} />
                    {/* Circuit traces - left */}
                    <svg aria-hidden className="absolute left-1.5 top-1/2 -translate-y-1/2 h-7 w-10 text-teal-300/40 pointer-events-none" viewBox="0 0 40 28" fill="none">
                      <path d="M0 14 H14 L18 10 H32" stroke="currentColor" strokeWidth="0.8" />
                      <path d="M0 20 H10 L14 16 H28" stroke="currentColor" strokeWidth="0.8" />
                      <circle cx="32" cy="10" r="1.2" fill="currentColor" />
                    </svg>
                    {/* Circuit traces - right */}
                    <svg aria-hidden className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-10 text-teal-300/40 pointer-events-none" viewBox="0 0 40 28" fill="none">
                      <path d="M40 14 H26 L22 10 H8" stroke="currentColor" strokeWidth="0.8" />
                      <path d="M40 20 H30 L26 16 H12" stroke="currentColor" strokeWidth="0.8" />
                      <circle cx="8" cy="10" r="1.2" fill="currentColor" />
                    </svg>
                    {/* Energy glow sweep */}
                    <div aria-hidden className="absolute inset-y-0 left-1/4 right-1/4 pointer-events-none" style={{
                      background: "radial-gradient(ellipse at center, rgba(94,234,212,0.25), transparent 70%)",
                    }} />
                    <span className="relative font-mono uppercase tracking-[0.18em] text-teal-50 drop-shadow-[0_1px_0_rgba(0,0,0,0.6)]">Begin Practise</span>
                    <span className="relative inline-flex h-5 w-5 items-center justify-center text-teal-200 drop-shadow-[0_0_4px_rgba(94,234,212,0.9)]">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : year === "Year 1" ? (
          <div className="rounded-3xl overflow-hidden shadow-xl border border-border/50 bg-card">
            <LessonPageHero
              levelNumber={yearNumber}
              week={week}
              lessonNumber={lessonNumber}
              pageTitle={`Lesson ${lessonNumber} Practise`}
              lessonTitle={safeLessonTitle}
              focus={safeLessonFocus}
              heroClass={lessonChrome.heroClass}
            />
            <div className="bg-background px-6 py-8">
            <PracticeRunner
              key={`${year}-${week}-${lessonId}`}
              minutes={8}
              lessonTitle={safeLessonTitle ?? `Week ${week} Lesson ${lessonNumber}`}
              getTask={(ctx) => {
                const d = ctx?.difficulty ?? "easy";
                if (effectiveLessonId.startsWith("y1-w2-")) {
                  return generateWeek2Task(effectiveLessonId, d);
                }
                if (effectiveLessonId.startsWith("y1-w3-")) {
                  return generateWeek3Task(effectiveLessonId, d);
                }
                if (effectiveLessonId.startsWith("y1-w4-")) {
                  return generateWeek4Task(effectiveLessonId, ctx, d);
                }
                if (effectiveLessonId.startsWith("y1-w5-")) {
                  return generateWeek5Task(effectiveLessonId, ctx, d);
                }
                if (effectiveLessonId.startsWith("y1-w6-")) {
                  return generateWeek6Task(effectiveLessonId, ctx, d);
                }
                if (effectiveLessonId.startsWith("y1-w7-")) {
                  return generateWeek7Task(effectiveLessonId, ctx, d);
                }
                if (effectiveLessonId.startsWith("y1-w8-")) {
                  return generateWeek8Task(effectiveLessonId, d);
                }
                if (effectiveLessonId.startsWith("y1-w9-")) {
                  return generateWeek9Task(effectiveLessonId, d);
                }
                if (effectiveLessonId.startsWith("y1-w10-")) {
                  return generateWeek10Task(effectiveLessonId, d);
                }
                if (effectiveLessonId.startsWith("y1-w11-")) {
                  return generateWeek11Task(effectiveLessonId, d);
                }
                if (effectiveLessonId.startsWith("y1-w12-")) {
                  return generateWeek12Task(effectiveLessonId, d);
                }
                if (effectiveLessonId.startsWith("y1-w1-")) {
                  return generateWeek1Task(effectiveLessonId, d);
                }
                return generateWeek1Task(effectiveLessonId, d);
              }}
              onComplete={completeLesson}
            />
            </div>
          </div>
        ) : (
          <div className="rounded-3xl overflow-hidden shadow-xl border border-border/50 bg-card">
            <LessonPageHero
              levelNumber={yearNumber}
              week={week}
              lessonNumber={lessonNumber}
              pageTitle={`Lesson ${lessonNumber} Practise`}
              lessonTitle={safeLessonTitle}
              focus={safeLessonFocus}
              heroClass={lessonChrome.heroClass}
            />

            <div className="bg-background px-4 py-5">
              {lessonMeta?.activities?.length ? (
                <Year2LessonEngine
                  key={lessonMeta.id}
                  lesson={lessonMeta}
                  onTimedComplete={markLessonDone}
                  onExit={goBackToProgram}
                />
              ) : (
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="text-sm font-bold text-gray-900">
                    Activity configuration missing for this lesson.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
