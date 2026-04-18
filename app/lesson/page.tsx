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
    <main className="min-h-screen bg-background flex items-start justify-center px-4 py-6">
      <div className="w-full max-w-6xl">
        <div className="mb-4">
          <button
            onClick={() =>
              router.push(`/program?year=${encodeURIComponent(year)}&week=${week}`)
            }
            className={`text-sm font-bold transition-colors ${lessonChrome.backLinkClass}`}
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
                <div className="bg-card rounded-[20px] border border-border/60 shadow-[0_2px_6px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] p-5 md:p-6 flex flex-col">
                  <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-trust-blue-light/80 border border-trust-blue/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-trust-blue">
                    Mission Briefing
                  </div>
                  <h2 className="mt-3 text-[1.35rem] md:text-2xl font-bold text-foreground leading-[1.15] tracking-[-0.02em]">
                    {safeLessonTitle ?? `Week ${week} Lesson ${lessonNumber}`}
                  </h2>
                  {safeLessonFocus ? (
                    <p className="mt-2 text-sm font-medium text-foreground/80 leading-relaxed">
                      <span className="font-semibold text-foreground">Focus:</span> {safeLessonFocus}
                    </p>
                  ) : null}
                  <p className="mt-2.5 text-sm font-normal text-muted-foreground leading-relaxed">
                    Watch the short lesson video, then jump into 8 minutes of practice. Earn XP for every correct answer and unlock your Level Up Legend.
                  </p>
                </div>

                {/* RIGHT: Video card */}
                <div className="bg-card rounded-[20px] border border-border/60 shadow-[0_2px_6px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] p-3 md:p-4">
                  <div className="flex items-center gap-2 text-foreground font-semibold mb-2.5 px-1 tracking-tight">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-trust-blue-light text-trust-blue shadow-sm">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                    <span className="text-sm">Lesson Video</span>
                  </div>
                  {hasEmbeddedLessonVideo ? (
                    <div
                      className="rounded-xl overflow-hidden bg-black shadow-inner"
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
                    <div className="aspect-video rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center text-white/70 text-xs gap-2 shadow-inner">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/15 shadow-lg">
                        <svg viewBox="0 0 24 24" className="h-5 w-5 ml-0.5" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                      <span className="font-medium tracking-wide">Video coming soon</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ROW 2: Compact action strip */}
              <div className="mt-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-[20px] border border-border/60 bg-card px-4 py-3 md:px-5 md:py-3.5 shadow-[0_2px_6px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/80 border border-slate-200/80 px-3 py-1.5 text-xs font-semibold text-slate-700">
                    <span className="text-slate-500">⏱</span> 8 min
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/70 px-3 py-1.5 text-xs font-semibold text-amber-800 shadow-[0_1px_2px_rgba(245,158,11,0.08)]">
                    <span className="text-amber-500">⚡</span> 50 XP
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-[0_1px_2px_rgba(16,185,129,0.08)]">
                    <span className="text-emerald-500">✨</span> Unlock Legend
                  </span>
                </div>
                <button
                  onClick={() => setStarted(true)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-2xl text-white font-bold tracking-tight px-6 py-2.5 text-sm md:text-base shadow-[0_8px_20px_rgba(2,23,22,0.45),inset_0_1px_0_rgba(94,234,212,0.25)] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(2,23,22,0.55),inset_0_1px_0_rgba(94,234,212,0.35)] active:scale-[0.98] transition-all duration-200 border border-teal-400/20"
                  style={{
                    background:
                      "linear-gradient(135deg, #021716 0%, #064e47 50%, #0d9488 100%)",
                  }}
                >
                  Begin Practise <span className="text-base text-teal-300">→</span>
                </button>
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
