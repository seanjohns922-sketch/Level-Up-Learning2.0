"use client";
import { useCallback } from "react";
import StarpathVoyageQuiz from "@/components/starpath/StarpathVoyageQuiz";
import { LEVEL8_PROGRAMS } from "@/data/activities/level8/program";
import { level8Quiz } from "@/data/activities/level8/questions";
import { level8DemoHref } from "@/lib/level8-routes";
import type { Level8Realm } from "@/lib/level8-config";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
export default function QuizClient({
  realm,
  week,
}: {
  realm: Level8Realm;
  week: number;
}) {
  const buildTasks = useCallback(
    (attempt: number): PracticeTask[] =>
      level8Quiz(realm, week, attempt).map((q) => ({
        kind: "level8Question",
        realm,
        prompt: q.prompt,
        speakText: q.prompt,
        options: q.options,
        answer: q.answer,
        question: q,
        feedback: { correct: q.explanation!, wrong: q.explanation! },
      })),
    [realm, week],
  );
  const w = LEVEL8_PROGRAMS[realm][week - 1];
  return (
    <StarpathVoyageQuiz
      realm={realm}
      buildTasks={buildTasks}
      quiz={{
        level: "Year 8",
        levelLabel: "Level 8",
        week,
        title: w.topic,
        coverage:
          "Five questions from each lesson. Score 12/15 (80%) to continue.",
        lessonTitles: w.lessons.map((l) => l.title) as [string, string, string],
        lessonCurriculumCodes: w.lessons.map((l) => l.curriculum ?? []) as [
          string[],
          string[],
          string[],
        ],
        lessonSkillIds: w.lessons.map((l) => [l.id]) as [
          string[],
          string[],
          string[],
        ],
        weekHref: level8DemoHref(realm, week, "week"),
        nextWeekHref: level8DemoHref(realm, week + 1, "week"),
      }}
    />
  );
}
