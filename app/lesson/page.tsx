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
  const lessonMeta = useMemo(() => {
    const program = getProgramForYear(year);
    const weekPlan = program.find((w) => w.week === week);
    return weekPlan?.lessons.find((l) => l.id === effectiveLessonId) ?? null;
  }, [year, week, effectiveLessonId]);

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
    <main className="h-screen bg-background flex flex-col items-center justify-start px-4 py-3 overflow-hidden">
      <div className="w-full max-w-5xl flex flex-col flex-1 min-h-0">
        <div className="mb-2 shrink-0">
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
          <div className="rounded-3xl overflow-hidden shadow-xl border border-border/50 bg-card">
            <div className={`${lessonChrome.heroClass} text-white px-6 py-8`}>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1 text-sm font-semibold mb-3">
                Level {yearNumber} • Week {week} • Lesson {lessonNumber}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold font-display mb-2">
                {lessonMeta?.title ?? `Week ${week} Lesson ${lessonNumber}`}
              </h1>
              <p className="text-white/80 text-sm">
                {lessonMeta?.focus ?? "Watch the video and complete activities"}
              </p>
            </div>

            <div className="bg-background px-6 py-8">
              <div className="bg-card rounded-3xl border border-border shadow-sm p-6 mb-8">
                <div className="flex items-center gap-2 text-foreground font-bold mb-5">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-trust-blue-light text-trust-blue">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                  Lesson Video
                </div>
                <div className="aspect-video rounded-2xl border-2 border-dashed border-border bg-card flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-trust-blue-light text-trust-blue">
                      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <div>Video coming soon</div>
                  </div>
                </div>
              </div>

              <div className={lessonChrome.calloutClass}>
                <div className={lessonChrome.calloutTextClass}>
                  ✨ Keep going!
                </div>
                <div className="text-sm text-foreground/80">
                  Keep working to unlock your Level Up Legend.
                </div>
              </div>

              <button
                onClick={() => setStarted(true)}
                className={lessonChrome.buttonClass}
              >
                Begin Practice
              </button>
            </div>
          </div>
        ) : year === "Year 1" ? (
          <div className="rounded-3xl overflow-hidden shadow-xl border border-border/50 bg-card flex flex-col flex-1 min-h-0">
            <div className={`${lessonChrome.heroClass} text-white px-4 py-4 shrink-0`}>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1 text-sm font-semibold mb-3">
                Level {yearNumber} • Week {week} • Lesson {lessonNumber}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold font-display">
                Lesson {lessonNumber} Practice
              </h1>
              {lessonMeta?.title && (
                <p className="text-white/80 text-sm mt-1">{lessonMeta.title}</p>
              )}
              {lessonMeta?.focus && (
                <p className="text-white/60 text-xs mt-1">Focus: {lessonMeta.focus}</p>
              )}
            </div>
            <div className="bg-background px-4 py-4 flex-1 min-h-0 overflow-auto">

            <PracticeRunner
              key={`${year}-${week}-${lessonId}`}
              minutes={8}
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
          <div className="rounded-3xl overflow-hidden shadow-xl border border-border/50 bg-card flex flex-col flex-1 min-h-0">
            <div className={`${lessonChrome.heroClass} text-white px-4 py-4 shrink-0`}>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1 text-sm font-semibold mb-2">
                Level {yearNumber} • Week {week} • Lesson {lessonNumber}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold font-display">
                Lesson {lessonNumber} Practice
              </h1>
              {lessonMeta?.title && (
                <p className="text-white/80 text-sm mt-1">{lessonMeta.title}</p>
              )}
              {lessonMeta?.focus && (
                <p className="text-white/60 text-xs mt-1">Focus: {lessonMeta.focus}</p>
              )}
            </div>

            <div className="bg-background px-6 py-8">
              {lessonMeta?.activities?.length ? (
                <Year2LessonEngine
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
