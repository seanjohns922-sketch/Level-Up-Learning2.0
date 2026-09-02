"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RealmActiveLessonShell } from "@/components/lesson/RealmActiveLessonShell";
import { RealmLessonHome } from "@/components/lesson/RealmLessonHome";
import { Year2LessonEngine } from "@/components/lesson/Year2LessonEngine";
import { generatePatternPeaksQuestion } from "@/data/activities/patternPeaks/generator";
import type { Lesson } from "@/data/programs/year1";

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
  const [started, setStarted] = useState(false);
  const weekHref = `/pattern-peaks/program?teacher_preview=1&level=${encodeURIComponent(level)}&week=${week}`;
  const back = () => router.push(weekHref);
  const successCriteria = [
    lesson.focus,
    `use the ${String(lesson.config?.mechanic ?? "pattern model")} to show my thinking`,
    "check my answer and explain why the rule or equation works",
  ];

  if (started) {
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
            />
          </RealmActiveLessonShell>
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
        onStart={() => setStarted(true)}
      />
    </main>
  );
}
