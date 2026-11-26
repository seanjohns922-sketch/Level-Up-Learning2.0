"use client";
import { useCallback } from "react";
import StarpathVoyageQuiz from "@/components/starpath/StarpathVoyageQuiz";
import { LEVEL8_PROGRAMS } from "@/data/activities/level8/program";
import { level8Quiz } from "@/data/activities/level8/questions";
import { usePathname } from "next/navigation";
import Number7AccessGate from "@/components/lesson/Number7AccessGate";
import { level8DemoHref } from "@/lib/level8-routes";
import { level8LiveHref } from "@/lib/level8-release";
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
  // Live students take the quiz from /level8/quiz and return to their own week page; demo review returns to the demo week page.
  const live = usePathname().startsWith("/level8/");
  const weekHome = (target: number) => live ? level8LiveHref(realm, target, "week") : level8DemoHref(realm, target, "week");
  const quiz = (
    <StarpathVoyageQuiz
      key={`${realm}-${week}`}
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
        weekHref: weekHome(week),
        nextWeekHref: weekHome(week + 1),
      }}
    />
  );
  return live ? <Number7AccessGate realm={realm} week={week} lesson="quiz" level={8}>{quiz}</Number7AccessGate> : quiz;
}
