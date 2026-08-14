"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RealmLessonHome } from "@/components/lesson/RealmLessonHome";
import { PracticeRunner } from "@/components/PracticeRunner";
import { createRandomRealmLessonGenerator, type RealmLessonTaskGenerator } from "@/data/activities/realm-lesson-blueprint";
import { getStatisticaLevel1TaskSet } from "@/data/activities/statistica/level1";

type Props = {
  level: string;
  levelNumber: number;
  week: number;
  lessonNumber: number;
  lessonId: string;
  lessonTitle: string;
  focus: string;
  successCriteria: readonly string[];
};

export default function StatisticaLessonShell({ level, levelNumber, week, lessonNumber, lessonId, lessonTitle, focus, successCriteria }: Props) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  // Level 1 is built; other levels stay blueprint-only until they're coded.
  const [getTask] = useState<RealmLessonTaskGenerator | null>(() => {
    const taskSet = levelNumber === 1 ? getStatisticaLevel1TaskSet(lessonId) : null;
    return taskSet ? createRandomRealmLessonGenerator(taskSet) : null;
  });
  const back = () => router.push(`/statistica?teacher_preview=1&level=${encodeURIComponent(level)}&week=${week}`);

  if (started && getTask) {
    return (
      <main className="min-h-screen bg-[#06151a] p-3 sm:p-5">
        <PracticeRunner
          minutes={9}
          getTask={getTask}
          onComplete={back}
          lessonTitle={lessonTitle}
          realmId="statistics"
          levelNumber={levelNumber}
          activityNoun="Question"
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#06151a] p-3 sm:p-5">
      <RealmLessonHome
        realm="statistics"
        levelNumber={levelNumber}
        levelLabel={`Level ${levelNumber}`}
        year={level}
        week={week}
        lessonNumber={lessonNumber}
        lessonTitle={lessonTitle}
        focus={focus}
        successCriteria={successCriteria}
        startDisabled={!getTask}
        startDisabledLabel="Activity Preview Coming Soon"
        onBack={back}
        onStart={() => { if (getTask) setStarted(true); }}
      />
    </main>
  );
}
