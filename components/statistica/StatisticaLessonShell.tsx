"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { getWorld3DReturnPathForLesson, preserveWorld3DReturnContextForLesson } from "@/lib/world3d/return-context";
import { useDemoPreviewMode } from "@/lib/demo-mode";
import { getActiveStudentIdentity } from "@/lib/studentIdentity";
import { restoreStudentStateFromServer, saveRealmLessonAttempt } from "@/lib/student-progress-sync";
import type { LessonPerformanceSummary } from "@/components/lesson/Year2LessonEngine";

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
  const previewMode = useDemoPreviewMode();
  const [started, setStarted] = useState(false);
  const summaryRef = useRef<LessonPerformanceSummary | null>(null);
  const savingRef = useRef(false);
  const completionSavedRef = useRef(false);
  const exitRequestedRef = useRef(false);
  const completionKeyRef = useRef<string | null>(null);
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
  const weekHref = getWorld3DReturnPathForLesson({
    realmId: "statistics",
    level,
    week,
    lessonNumber,
    lessonId,
  }) ?? buildRealmProgramHref({ realmId: "statistics", year: level, week });
  const back = () => router.push(weekHref);

  const completeLesson = useCallback(() => {
    if (completionSavedRef.current) {
      router.push(weekHref);
      return;
    }
    if (savingRef.current) {
      exitRequestedRef.current = true;
      return;
    }
    if (previewMode) {
      completionSavedRef.current = true;
      return;
    }

    const studentId = getActiveStudentIdentity().studentId;
    if (!studentId) {
      window.alert("We couldn't verify this student, so the lesson was not saved. Please return home and sign in again.");
      return;
    }

    savingRef.current = true;
    const summary = summaryRef.current;
    const completionKey = completionKeyRef.current ?? (
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`
    );
    completionKeyRef.current = completionKey;
    void saveRealmLessonAttempt(
      studentId,
      level,
      week,
      lessonNumber,
      lessonId,
      {
        at: new Date().toISOString(),
        completed: true,
        lessonId,
        lessonNumber,
        title: lessonTitle,
        questionsAnswered: summary?.questionsAnswered ?? 0,
        totalQuestions: summary?.questionsAnswered ?? 0,
        correctAnswers: summary?.correctAnswers ?? 0,
        correctCount: summary?.correctAnswers ?? 0,
        accuracy: summary?.accuracy ?? 0,
        accuracyPercent: summary?.accuracy ?? 0,
        bestChain: summary?.bestChain ?? 0,
        timeSpentSeconds: summary?.timeSpentSeconds ?? 0,
        topicSummaries: summary?.topicSummaries ?? [],
        strengths: summary?.strengths ?? [],
        areasToImprove: summary?.areasToImprove ?? [],
        struggledQuestionTypes: summary?.struggledQuestionTypes ?? [],
      },
      completionKey,
      "statistics",
    )
      .then(() => {
        completionSavedRef.current = true;
        return restoreStudentStateFromServer(studentId, "statistics").catch((error) => {
          console.warn("[Statistica] Lesson saved but progress refresh failed", error);
        }).then(() => {
          if (exitRequestedRef.current) router.push(weekHref);
        });
      })
      .catch((error) => {
        console.error("[Statistica] Lesson completion save failed", error);
        window.alert("We couldn't save this lesson yet. Please check the connection and press Finish again.");
      })
      .finally(() => {
        savingRef.current = false;
      });
  }, [lessonId, lessonNumber, lessonTitle, level, previewMode, router, week, weekHref]);

  useEffect(() => {
    preserveWorld3DReturnContextForLesson({
      realmId: "statistics",
      level,
      week,
      lessonNumber,
      lessonId,
    });
  }, [lessonId, lessonNumber, level, week]);

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
            demoMode={previewMode}
            onBack={back}
          >
            <PracticeRunner
              minutes={9}
              completionMode="time_only"
              scoreCap={10}
              getTask={getTask}
              onComplete={completeLesson}
              onPerformanceSummary={(summary) => { summaryRef.current = summary; }}
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
              showResultsAfterReflection
              showMistakeReview={false}
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
