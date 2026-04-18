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
                {/* LEFT: Mission briefing — featured card */}
                <div
                  className="relative overflow-hidden rounded-[20px] border border-emerald-100/80 p-5 md:p-6 flex flex-col shadow-[0_1px_2px_rgba(16,185,129,0.04),0_12px_32px_-8px_rgba(16,185,129,0.12)]"
                  style={{
                    background:
                      "linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)",
                  }}
                >
                  {/* Left accent border */}
                  <div
                    aria-hidden
                    className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full"
                    style={{
                      background:
                        "linear-gradient(180deg, #10B981 0%, #059669 100%)",
                    }}
                  />
                  {/* Faint grid texture */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-[0.04]"
                    style={{
                      backgroundImage:
                        "linear-gradient(to right, #064e3b 1px, transparent 1px), linear-gradient(to bottom, #064e3b 1px, transparent 1px)",
                      backgroundSize: "22px 22px",
                      maskImage:
                        "radial-gradient(ellipse at top right, black 0%, transparent 70%)",
                      WebkitMaskImage:
                        "radial-gradient(ellipse at top right, black 0%, transparent 70%)",
                    }}
                  />
                  <div className="relative inline-flex w-fit items-center gap-1.5 rounded-full bg-white/80 border border-emerald-200/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700 shadow-[0_1px_2px_rgba(16,185,129,0.06)]">
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                    Mission Briefing
                  </div>
                  <h2 className="relative mt-3 text-[1.4rem] md:text-[1.6rem] font-bold text-slate-900 leading-[1.1] tracking-[-0.025em]">
                    {safeLessonTitle ?? `Week ${week} Lesson ${lessonNumber}`}
                  </h2>
                  {safeLessonFocus ? (
                    <p className="relative mt-2 text-sm font-medium text-slate-700 leading-relaxed">
                      <span className="font-semibold text-emerald-800">Focus:</span> {safeLessonFocus}
                    </p>
                  ) : null}
                  <p className="relative mt-2.5 text-sm font-normal text-slate-500 leading-relaxed">
                    Watch the short lesson video, then jump into 8 minutes of practice. Earn XP for every correct answer and unlock your Level Up Legend.
                  </p>
                </div>

                {/* RIGHT: Video card */}
                <div
                  className="relative overflow-hidden rounded-[20px] border border-slate-200/70 p-3 md:p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-8px_rgba(16,185,129,0.10)]"
                  style={{
                    background:
                      "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
                  }}
                >
                  <div className="flex items-center gap-2 text-slate-900 font-semibold mb-2.5 px-1 tracking-tight">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full text-white shadow-[0_4px_10px_rgba(16,185,129,0.35)]"
                      style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)" }}
                    >
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 ml-0.5" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                    <span className="text-sm">Lesson Video</span>
                  </div>
                  {hasEmbeddedLessonVideo ? (
                    <div
                      className="rounded-xl overflow-hidden bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),0_8px_24px_-6px_rgba(2,23,22,0.4)]"
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
                    <div
                      className="relative aspect-video rounded-xl flex flex-col items-center justify-center text-white/80 text-xs gap-2 overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_24px_-6px_rgba(2,23,22,0.35)]"
                      style={{
                        background:
                          "radial-gradient(ellipse at center, #1e293b 0%, #0f172a 70%, #020617 100%)",
                      }}
                    >
                      {/* Soft glow behind play button */}
                      <div
                        aria-hidden
                        className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
                        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.25), transparent 70%)" }}
                      />
                      <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/15 shadow-[0_8px_20px_rgba(16,185,129,0.25)]">
                        <svg viewBox="0 0 24 24" className="h-5 w-5 ml-0.5" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                      <span className="relative font-medium tracking-wide text-white/70">Video coming soon</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ROW 2: Compact action strip */}
              <div
                className="relative mt-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-[20px] border border-slate-200/70 px-4 py-3 md:px-5 md:py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-8px_rgba(16,185,129,0.10)]"
                style={{
                  background:
                    "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
                }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                    8 min
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 px-3 py-1.5 text-xs font-semibold text-amber-800 shadow-[0_1px_2px_rgba(245,158,11,0.10)]"
                    style={{ background: "linear-gradient(180deg, #FFFBEB 0%, #FEF3C7 100%)" }}
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-amber-500" fill="currentColor">
                      <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
                    </svg>
                    50 XP
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-[0_1px_2px_rgba(16,185,129,0.10)]"
                    style={{ background: "linear-gradient(180deg, #ECFDF5 0%, #D1FAE5 100%)" }}
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-emerald-500" fill="currentColor">
                      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8 5.8 21.3l2.4-7.4L2 9.4h7.6z" />
                    </svg>
                    Unlock Legend
                  </span>
                </div>
                <button
                  onClick={() => setStarted(true)}
                  className="relative inline-flex items-center justify-center gap-1.5 rounded-2xl text-white font-bold tracking-tight px-6 py-2.5 text-sm md:text-base shadow-[0_10px_25px_rgba(16,185,129,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(16,185,129,0.45),inset_0_1px_0_rgba(255,255,255,0.3)] active:scale-[0.98] transition-all duration-200 border border-emerald-400/30"
                  style={{
                    background:
                      "linear-gradient(135deg, #10B981 0%, #059669 60%, #047857 100%)",
                  }}
                >
                  Begin Practise <span className="text-base text-emerald-100">→</span>
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
