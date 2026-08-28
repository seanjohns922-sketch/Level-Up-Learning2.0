"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RealmActiveLessonShell } from "@/components/lesson/RealmActiveLessonShell";
import { RealmLessonHome } from "@/components/lesson/RealmLessonHome";
import { PracticeRunner } from "@/components/PracticeRunner";
import { createRandomRealmLessonGenerator, type RealmLessonTaskGenerator } from "@/data/activities/realm-lesson-blueprint";
import { getStatisticaLevel1TaskSet } from "@/data/activities/statistica/level1";
import { getStatisticaLevel2TaskSet } from "@/data/activities/statistica/level2";
import { getStatisticaLevel3TaskSet } from "@/data/activities/statistica/level3";
import { getStatisticaLevel4TaskSet } from "@/data/activities/statistica/level4";
import { getStatisticaLevel5TaskSet } from "@/data/activities/statistica/level5";
import { getStatisticaLevel6TaskSet } from "@/data/activities/statistica/level6";
import { buildRealmProgramHref } from "@/lib/realms/realm-journey";

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
  // Levels 1-3 are built; other levels stay blueprint-only until they're coded.
  const [getTask] = useState<RealmLessonTaskGenerator | null>(() => {
    const taskSet = levelNumber === 1 ? getStatisticaLevel1TaskSet(lessonId)
      : levelNumber === 2 ? getStatisticaLevel2TaskSet(lessonId)
      : levelNumber === 3 ? getStatisticaLevel3TaskSet(lessonId)
      : levelNumber === 4 ? getStatisticaLevel4TaskSet(lessonId)
      : levelNumber === 5 ? getStatisticaLevel5TaskSet(lessonId)
      : levelNumber === 6 ? getStatisticaLevel6TaskSet(lessonId)
      : null;
    return taskSet ? createRandomRealmLessonGenerator(taskSet) : null;
  });
  const weekHref = buildRealmProgramHref({ realmId: "statistics", year: level, week, preview: true });
  const back = () => router.push(weekHref);

  if (started && getTask) {
    return (
      <main className="min-h-screen bg-[#06151a] p-3 sm:p-5">
        <div className="mx-auto w-full max-w-[1500px]">
          <RealmActiveLessonShell
            realm="statistics"
            levelNumber={levelNumber}
            levelLabel={`Level ${levelNumber}`}
            year={level}
            week={week}
            lessonNumber={lessonNumber}
            lessonTitle={lessonTitle}
            focus={focus}
            demoMode
            onBack={back}
          >
            <PracticeRunner
              minutes={9}
              completionMode="time_only"
              scoreCap={10}
              getTask={getTask}
              onComplete={back}
              lessonTitle={lessonTitle}
              liveContext={{
                level,
                strand: "Statistics",
                week,
                lessonId,
                lessonTitle,
              }}
              realmId="statistics"
              levelNumber={levelNumber}
              practisedSkills={[...successCriteria]}
              nextUpLabel={lessonNumber < 3 ? `Week ${week} lesson ${lessonNumber + 1}` : `Week ${week} quiz`}
              activityNoun="Investigation"
            />
          </RealmActiveLessonShell>
        </div>
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
