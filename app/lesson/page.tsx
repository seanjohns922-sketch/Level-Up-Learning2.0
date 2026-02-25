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
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="mb-4">
          <button
            onClick={() =>
              router.push(`/program?year=${encodeURIComponent(year)}&week=${week}`)
            }
            className="text-sm text-indigo-700 hover:underline font-bold"
          >
            ← Back to Week {week}
          </button>
        </div>

        {!started ? (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              Week {week} Lesson {lessonMeta?.lesson ?? ""}
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
            <p className="text-gray-600 mb-6">
              Watch the short video, then begin your practice.
            </p>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 mb-6">
              <div className="text-sm font-bold text-gray-700 mb-2">Lesson Video</div>
              <div className="aspect-video rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500">
                Video placeholder
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 mb-6">
              <div className="font-bold text-indigo-900 mb-2">Keep going!</div>
              <div className="text-sm text-indigo-900">
                Keep working to unlock your Level Up Legend.
              </div>
            </div>

            <button
              onClick={() => setStarted(true)}
              className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl hover:bg-indigo-700 transition"
            >
              Begin your practice
            </button>
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
                if (effectiveLessonId.startsWith("y1-w2-")) {
                  return generateWeek2Task(effectiveLessonId);
                }
                if (effectiveLessonId.startsWith("y1-w3-")) {
                  return generateWeek3Task(effectiveLessonId);
                }
                if (effectiveLessonId.startsWith("y1-w4-")) {
                  return generateWeek4Task(effectiveLessonId, ctx);
                }
                if (effectiveLessonId.startsWith("y1-w5-")) {
                  return generateWeek5Task(effectiveLessonId, ctx);
                }
                if (effectiveLessonId.startsWith("y1-w6-")) {
                  return generateWeek6Task(effectiveLessonId, ctx);
                }
                if (effectiveLessonId.startsWith("y1-w7-")) {
                  return generateWeek7Task(effectiveLessonId, ctx);
                }
                if (effectiveLessonId.startsWith("y1-w8-")) {
                  return generateWeek8Task(effectiveLessonId);
                }
                if (effectiveLessonId.startsWith("y1-w9-")) {
                  return generateWeek9Task(effectiveLessonId);
                }
                if (effectiveLessonId.startsWith("y1-w10-")) {
                  return generateWeek10Task(effectiveLessonId);
                }
                if (effectiveLessonId.startsWith("y1-w11-")) {
                  return generateWeek11Task(effectiveLessonId);
                }
                if (effectiveLessonId.startsWith("y1-w12-")) {
                  return generateWeek12Task(effectiveLessonId);
                }
                if (effectiveLessonId.startsWith("y1-w1-")) {
                  return generateWeek1Task(effectiveLessonId);
                }
                return generateWeek1Task(effectiveLessonId);
              }}
              onComplete={completeLesson}
            />
          </>
        )}
      </div>
    </main>
  );
}
