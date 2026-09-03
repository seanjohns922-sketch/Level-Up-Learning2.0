"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RealmActiveLessonShell } from "@/components/lesson/RealmActiveLessonShell";
import { RealmLessonHome, LessonConceptIntro } from "@/components/lesson/RealmLessonHome";
import { Year2LessonEngine } from "@/components/lesson/Year2LessonEngine";
import { generatePatternPeaksQuestion, isPatternPeaksQuestion } from "@/data/activities/patternPeaks/generator";
import { getPatternPeaksLessonConceptIntro, type PatternPeaksYearLabel } from "@/data/programs/patternPeaks";
import { buildRealmProgramHref } from "@/lib/realms/realm-journey";
import { getWorld3DReturnPathForLesson, preserveWorld3DReturnContextForLesson } from "@/lib/world3d/return-context";
import type { Lesson } from "@/data/programs/year1";

type Phase = "home" | "concept" | "active";

export default function PatternPeaksLessonShell({
  level,
  levelNumber,
  week,
  lesson,
}: {
  level: string;
  levelNumber: number;
  week: number;
  lesson: Lesson;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("home");
  // Return to the shared Week Home (same as every other realm); prefer the
  // stored 3D return path so a lesson entered from the Pattern Peaks 3D world
  // lands back there.
  const weekHref = getWorld3DReturnPathForLesson({
    realmId: "pattern",
    level,
    week,
    lessonNumber: lesson.lesson,
    lessonId: lesson.id,
  }) ?? buildRealmProgramHref({ realmId: "pattern", year: level, week });
  const back = () => router.push(weekHref);

  useEffect(() => {
    preserveWorld3DReturnContextForLesson({
      realmId: "pattern",
      level,
      week,
      lessonNumber: lesson.lesson,
      lessonId: lesson.id,
    });
  }, [lesson.id, lesson.lesson, level, week]);
  const successCriteria = [
    lesson.focus,
    `use the ${String(lesson.config?.mechanic ?? "pattern model")} to show my thinking`,
    "check my answer and explain why the rule or equation works",
  ];
  const conceptIntro = getPatternPeaksLessonConceptIntro(level as PatternPeaksYearLabel, week, lesson.lesson);

  if (phase === "active") {
    return (
      <main className="min-h-screen bg-[#0c1219] p-3 sm:p-5">
        <div className="mx-auto w-full max-w-[1500px]">
          <RealmActiveLessonShell
            realm="pattern"
            levelNumber={levelNumber}
            levelLabel={`Level ${levelNumber}`}
            year={level}
            week={week}
            lessonNumber={lesson.lesson}
            lessonTitle={lesson.title}
            focus={lesson.focus}
            demoMode
            onBack={back}
          >
            <Year2LessonEngine
              lesson={lesson}
              onTimedComplete={back}
              onExit={back}
              realmId="pattern"
              levelNumber={levelNumber}
              practisedSkills={successCriteria}
              nextUpLabel={lesson.lesson < 3 ? `Week ${week} lesson ${lesson.lesson + 1}` : `Week ${week} review`}
              liveContext={{
                level,
                strand: "Algebra",
                week,
                lessonId: lesson.id,
                lessonTitle: lesson.title,
              }}
              questionGenerator={generatePatternPeaksQuestion}
              isQuestionCompatible={isPatternPeaksQuestion}
            />
          </RealmActiveLessonShell>
        </div>
      </main>
    );
  }

  // "Meet the idea" teaching step — a page inside the lesson that explains what
  // to do before the challenge questions begin. Kept off the home page.
  if (phase === "concept" && conceptIntro) {
    return (
      <main className="min-h-screen bg-[#0c1219] p-3 sm:p-5">
        <div className="mx-auto w-full max-w-[1100px] space-y-5">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setPhase("home")}
              className="rounded-lg border border-emerald-300/25 px-4 py-2 text-xs font-mono font-black uppercase tracking-[0.14em] text-emerald-50 transition hover:brightness-110"
            >
              ← Back
            </button>
            <span className="text-xs font-mono font-bold uppercase tracking-[0.16em] text-emerald-200/70">
              Level {levelNumber} · Week {week} · Lesson {lesson.lesson}
            </span>
          </div>
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-300">Pattern Challenge</div>
            <h1 className="mt-1 text-3xl font-black text-white sm:text-4xl">{lesson.title}</h1>
            <p className="mt-2 max-w-3xl text-base font-semibold text-white/70">{lesson.focus}</p>
          </div>
          <LessonConceptIntro realm="pattern" conceptIntro={conceptIntro} />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setPhase("active")}
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-violet-600 px-8 py-3 text-base font-black text-white shadow-[0_16px_40px_rgba(16,185,129,0.24)] transition hover:from-emerald-500 hover:to-violet-500"
            >
              Start the Challenge →
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0c1219] p-3 sm:p-5">
      <RealmLessonHome
        realm="pattern"
        levelNumber={levelNumber}
        levelLabel={`Level ${levelNumber}`}
        year={level}
        week={week}
        lessonNumber={lesson.lesson}
        lessonTitle={lesson.title}
        focus={lesson.focus}
        successCriteria={successCriteria}
        onBack={back}
        onStart={() => setPhase(conceptIntro ? "concept" : "active")}
      />
    </main>
  );
}
