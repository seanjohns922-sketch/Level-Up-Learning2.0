"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Orbit } from "lucide-react";
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
import ReadAloudBtn from "@/components/ReadAloudBtn";

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
      const attempt = {
        completed: true,
        lessonId: lesson.registryId,
        lessonNumber: lesson.lesson,
        title: lesson.title,
        questionsAnswered: summary?.questionsAnswered ?? 0,
        correctAnswers: summary?.correctAnswers ?? 0,
        accuracy: summary?.accuracy ?? 0,
        bestChain: summary?.bestChain ?? 0,
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
    <main className="min-h-screen bg-[#070a1b] px-3 py-3 text-white sm:px-5 sm:py-5">
      <div className="fixed inset-0" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={content.artworkSrc} alt="" className="h-full w-full object-cover" style={{ filter: "brightness(0.35) saturate(1.15)" }} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,27,0.7),rgba(19,12,52,0.82))]" />
      </div>

      <div className="relative mx-auto max-w-[1500px]">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cyan-200/20 bg-[#090d24]/90 px-3 py-3 backdrop-blur-md sm:px-5">
          <Link href={lesson.weekHref} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-cyan-200/25 bg-white/5 px-4 text-sm font-bold text-cyan-100 transition hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" /> Back to Week {lesson.week}
          </Link>
          <div className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.16em] text-violet-200">
            <Orbit className="h-5 w-5 text-cyan-300" /> Starpath{isDemoPreviewMode() ? " · Demo Mode" : ""}
          </div>
        </header>

        <section className="overflow-hidden rounded-lg border border-cyan-200/25 bg-[#f8f7ff] shadow-[0_24px_90px_rgba(76,29,149,0.34)]">
          <div className="relative overflow-hidden border-b border-cyan-200/15 px-5 py-5 sm:px-7">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-950 via-indigo-950 to-cyan-950" />
            <div className="relative">
              <div className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-cyan-200">
                {lesson.levelLabel} · Week {lesson.week} · Mission {lesson.lesson}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-black tracking-normal text-white sm:text-4xl">{lesson.title}</h1>
                <ReadAloudBtn
                  text={`${lesson.title}. ${lesson.learningIntention}`}
                  label="Read"
                  className="border-cyan-200/30 bg-white/10 text-cyan-100 hover:text-white"
                />
              </div>
              <p className="mt-2 max-w-3xl text-sm font-semibold text-violet-100 sm:text-base">{lesson.learningIntention}</p>
            </div>
          </div>

          <div className="bg-[linear-gradient(180deg,#f8f7ff_0%,#eefcff_100%)] p-3 text-slate-950 sm:p-5">
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
              showCoachReview={false}
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
          </div>
        </section>
      </div>
    </main>
  );
}
