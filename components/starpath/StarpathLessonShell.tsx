"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { PracticeRunner } from "@/components/PracticeRunner";
import StarpathMissionHome, { type StarpathMissionMetadata } from "@/components/starpath/StarpathMissionHome";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import { createRandomRealmLessonGenerator } from "@/data/activities/realm-lesson-blueprint";
import { writeStarpathDemoJourney } from "@/lib/starpath-demo-state";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { getActiveStudentIdentity } from "@/lib/studentIdentity";
import { saveRealmLessonAttempt } from "@/lib/student-progress-sync";
import type { LessonPerformanceSummary } from "@/components/lesson/Year2LessonEngine";
import type { TeacherInsight, TeacherInsightInput } from "@/lib/teacher-insights";
import { RealmActiveLessonShell } from "@/components/lesson/RealmActiveLessonShell";

function levelNumber(level: StarpathMissionMetadata["level"]) {
  if (level === "Prep") return 0;
  const parsed = Number(level.replace("Year ", ""));
  return Number.isInteger(parsed) ? parsed : 0;
}

export default function StarpathLessonShell({
  lesson,
  content,
}: {
  lesson: StarpathMissionMetadata;
  content: StarpathLessonContent;
}) {
  const router = useRouter();
  const [missionStarted, setMissionStarted] = useState(false);
  const [getTask] = useState(() => createRandomRealmLessonGenerator(content.createTaskSet()));
  const lessonFinalizedRef = useRef(false);
  const summaryRef = useRef<LessonPerformanceSummary | null>(null);

  // Persist a completed mission for real students. Self-guards on demo mode so a
  // demo view never writes progress or banks XP.
  const persistLessonCompletion = useCallback(async () => {
    if (isDemoPreviewMode()) return;
    try {
      const studentId = getActiveStudentIdentity().studentId;
      if (!studentId) return;
      const summary = summaryRef.current;
      const completionKey =
        typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
      let insight: TeacherInsight | null = null;
      if (summary) {
        const insightInput: TeacherInsightInput = {
          studentId,
          level: lesson.level,
          strand: "Space",
          week: lesson.week,
          lessonId: lesson.registryId,
          title: lesson.title,
          score: summary.correctAnswers,
          accuracy: summary.accuracy,
          timeSpent: summary.timeSpentSeconds,
          questionsAnswered: summary.questionsAnswered,
          topicSummaries: summary.topicSummaries,
        };
        try {
          const response = await fetch("/api/teacher-insight", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(insightInput),
          });
          if (response.ok) {
            const payload = (await response.json()) as { insight?: TeacherInsight };
            insight = payload.insight ?? null;
          }
        } catch (error) {
          console.warn("[Starpath] Coaching insight generation failed", error);
        }
      }
      const attempt = {
        at: new Date().toISOString(),
        completed: true,
        lessonId: lesson.registryId,
        lessonNumber: lesson.lesson,
        title: lesson.title,
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
        insight,
      };
      await saveRealmLessonAttempt(
        studentId,
        lesson.level,
        lesson.week,
        lesson.lesson,
        lesson.registryId,
        attempt,
        completionKey,
        "space",
      );
    } catch (error) {
      console.warn("[Starpath] Lesson persist failed", error);
    }
  }, [lesson.level, lesson.registryId, lesson.lesson, lesson.title, lesson.week]);

  useEffect(() => {
    writeStarpathDemoJourney(lesson.level, {
      currentWeek: lesson.week,
      currentLesson: lesson.lesson,
    });
  }, [lesson.lesson, lesson.level, lesson.week]);

  const completeLesson = useCallback(() => {
    if (!lessonFinalizedRef.current) {
      lessonFinalizedRef.current = true;
      writeStarpathDemoJourney(lesson.level, {
        currentWeek: lesson.week,
        currentLesson: Math.min(3, lesson.lesson + 1),
      });
      void persistLessonCompletion();
      return;
    }
    router.push(lesson.weekHref);
  }, [lesson.lesson, lesson.level, lesson.week, lesson.weekHref, persistLessonCompletion, router]);

  if (!missionStarted) {
    return <StarpathMissionHome lesson={lesson} content={content} onStart={() => setMissionStarted(true)} />;
  }

  return (
    <main className="min-h-screen px-3 py-3 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-[1500px]">
        <RealmActiveLessonShell
          realm="space"
          levelNumber={levelNumber(lesson.level)}
          levelLabel={lesson.levelLabel}
          year={lesson.level}
          week={lesson.week}
          lessonNumber={lesson.lesson}
          lessonTitle={lesson.title}
          focus={lesson.learningIntention}
          demoMode={isDemoPreviewMode()}
          artworkSrc={content.artworkSrc}
          onBack={() => router.push(lesson.weekHref)}
        >
            <PracticeRunner
              minutes={9}
              getTask={getTask}
              onComplete={completeLesson}
              onPerformanceSummary={(summary) => { summaryRef.current = summary; }}
              lessonTitle={lesson.title}
              completionMode="time_only"
              scoreCap={10}
              liveContext={{
                level: lesson.levelLabel,
                strand: "Space",
                week: lesson.week,
                lessonId: lesson.registryId,
                lessonTitle: lesson.title,
              }}
              realmId="space"
              levelNumber={levelNumber(lesson.level)}
              practisedSkills={[...content.practisedSkills]}
              nextUpLabel={content.nextUpLabel}
              brainBreakFrequency="normal"
              showResultsAfterReflection
              showCoachReview
              showMistakeReview={false}
              activityNoun="Activity"
              experienceCopy={{
                reflectionTitle: "Mission Log",
                reflectionPrompt: content.reflection.prompt,
                reflectionOptions: [...content.reflection.options],
                completionEyebrow: "Mission Complete",
                completionTitle: "Mission Complete!",
                completionMessage: "Excellent exploring today! Your discoveries have been saved.",
                exitLabel: `Back to Week ${lesson.week} →`,
              }}
            />
        </RealmActiveLessonShell>
      </div>
    </main>
  );
}
