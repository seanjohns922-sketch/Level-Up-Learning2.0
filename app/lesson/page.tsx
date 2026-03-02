"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PracticeRunner } from "@/components/PracticeRunner";
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

export default function LessonPage() {
  const router = useRouter();
  const params = useSearchParams();

  const year = params.get("year") ?? "Year 1";
  const week = Number(params.get("week") ?? "1");
  const lessonId = params.get("lessonId") ?? "y1-w1-l1";
  const expectedPrefix = `y1-w${week}-`;
  const effectiveLessonId = lessonId.startsWith(expectedPrefix)
    ? lessonId
    : `y1-w${week}-l1`;
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
  }, [effectiveLessonId, week, year]);

  function completeLesson() {
    const key = `lul_week_${year}_${week}`;
    const raw = localStorage.getItem(key);
    const done: string[] = raw ? JSON.parse(raw) : [];
    const next = Array.from(new Set([...done, lessonId]));
    localStorage.setItem(key, JSON.stringify(next));

    router.push(`/program?year=${encodeURIComponent(year)}&week=${week}`);
  }

  return (
    <main className="min-h-screen bg-[#fbf7f1] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-5xl">
        <div className="mb-4">
          <button
            onClick={() =>
              router.push(`/program?year=${encodeURIComponent(year)}&week=${week}`)
            }
            className="text-sm text-blue-600 hover:underline font-bold"
          >
            Back to Week {week}
          </button>
        </div>

        {!started ? (
          <div className="rounded-3xl overflow-hidden shadow-xl border border-white/70 bg-white">
            <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 text-white px-6 py-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1 text-sm font-semibold mb-4">
                Week {week} - Lesson {lessonMeta?.lesson ?? ""}
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
                {lessonMeta?.title ?? `Week ${week} Lesson ${lessonMeta?.lesson ?? ""}`}
              </h1>
              <div className="text-white/90 text-base">
                {lessonMeta?.focus ?? "Focus"}
              </div>
            </div>

            <div className="bg-[#fbf7f1] px-6 py-10">
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 mb-8">
                <div className="flex items-center gap-2 text-gray-900 font-bold mb-5">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                  Lesson Video
                </div>
                <div className="aspect-video rounded-2xl border-2 border-dashed border-gray-200 bg-white flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <div>Video coming soon</div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 mb-8">
                <div className="flex items-center gap-2 font-bold text-emerald-900 mb-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.6-4.9-2.6-4.9 2.6.9-5.6-4-3.9 5.5-.8z" />
                    </svg>
                  </span>
                  Keep going!
                </div>
                <div className="text-sm text-emerald-900">
                  Keep working to unlock your Level Up Legend.
                </div>
              </div>

              <button
                onClick={() => setStarted(true)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-extrabold text-xl hover:from-emerald-600 hover:to-emerald-700 transition"
              >
                Begin Practice
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              Week {week} Lesson {lessonMeta?.lesson ?? ""} Practice
            </h1>
            {lessonMeta?.title ? (
              <div className="text-xl font-extrabold text-gray-900 mb-2">
                {lessonMeta.title}
              </div>
            ) : null}
            {lessonMeta ? (
              <div className="mb-4">
                <div className="text-sm text-gray-600 mt-1">
                  Focus: {lessonMeta.focus}
                </div>
              </div>
            ) : null}

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
          </>
        )}
      </div>
    </main>
  );
}
