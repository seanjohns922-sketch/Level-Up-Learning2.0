"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Orbit } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PracticeRunner } from "@/components/PracticeRunner";
import {
  createMeetTheShapesTaskGenerator,
  MEET_THE_SHAPES_PRACTISED_SKILLS,
} from "@/data/activities/starpath/ground/week1Lesson1";
import { writeStarpathDemoJourney } from "@/lib/starpath-demo-state";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";

type LessonMetadata = {
  level: RealmLevelId;
  levelLabel: string;
  week: number;
  lesson: number;
  title: string;
  focus: string;
  learningIntention: string;
  weekHref: string;
};

export default function StarpathMeetTheShapesLesson({ lesson }: { lesson: LessonMetadata }) {
  const router = useRouter();
  const [getTask] = useState(() => createMeetTheShapesTaskGenerator());
  const lessonFinalizedRef = useRef(false);

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
      return;
    }
    router.push(lesson.weekHref);
  }, [lesson.lesson, lesson.level, lesson.week, lesson.weekHref, router]);

  return (
    <main className="min-h-screen bg-[#070a1b] px-3 py-3 text-white sm:px-5 sm:py-5">
      <div className="fixed inset-0" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/starpath-home-bg-ground.png"
          alt=""
          className="h-full w-full object-cover"
          style={{ filter: "brightness(0.35) saturate(1.15)" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,27,0.7),rgba(19,12,52,0.82))]" />
      </div>

      <div className="relative mx-auto max-w-[1500px]">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cyan-200/20 bg-[#090d24]/90 px-3 py-3 backdrop-blur-md sm:px-5">
          <Link
            href={lesson.weekHref}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-cyan-200/25 bg-white/5 px-4 text-sm font-bold text-cyan-100 transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Week {lesson.week}
          </Link>
          <div className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.16em] text-violet-200">
            <Orbit className="h-5 w-5 text-cyan-300" /> Starpath · Demo Mode
          </div>
        </header>

        <section className="overflow-hidden rounded-lg border border-cyan-200/25 bg-[#f8f7ff] shadow-[0_24px_90px_rgba(76,29,149,0.34)]">
          <div className="relative overflow-hidden border-b border-cyan-200/15 px-5 py-5 sm:px-7">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-950 via-indigo-950 to-cyan-950" />
            <div className="relative">
              <div className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-cyan-200">
                {lesson.levelLabel} · Week {lesson.week} · Lesson {lesson.lesson}
              </div>
              <h1 className="mt-2 text-3xl font-black tracking-normal text-white sm:text-4xl">{lesson.title}</h1>
              <p className="mt-2 max-w-3xl text-sm font-semibold text-violet-100 sm:text-base">
                {lesson.learningIntention}
              </p>
            </div>
          </div>

          <div className="bg-[linear-gradient(180deg,#f8f7ff_0%,#eefcff_100%)] p-3 text-slate-950 sm:p-5">
            <PracticeRunner
              minutes={9}
              getTask={getTask}
              onComplete={completeLesson}
              lessonTitle={lesson.title}
              completionMode="time_only"
              scoreCap={10}
              liveContext={{
                level: lesson.levelLabel,
                strand: "Space",
                week: lesson.week,
                lessonId: "ground-space-w1-l1",
                lessonTitle: lesson.title,
              }}
              realmId="space"
              levelNumber={0}
              practisedSkills={MEET_THE_SHAPES_PRACTISED_SKILLS}
              nextUpLabel="Find the Shapes"
              brainBreakFrequency="normal"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
