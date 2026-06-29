import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import {
  generateY2MeasurelandsWeek1Lesson1Task,
  resetY2MeasurelandsWeek1Lesson1TaskSessionState,
} from "@/data/activities/year2Measurelands/week1Lesson1";
import {
  generateY2MeasurelandsWeek1Lesson2Task,
  resetY2MeasurelandsWeek1Lesson2TaskSessionState,
} from "@/data/activities/year2Measurelands/week1Lesson2";
import {
  generateY2MeasurelandsWeek1Lesson3Task,
  resetY2MeasurelandsWeek1Lesson3TaskSessionState,
} from "@/data/activities/year2Measurelands/week1Lesson3";
import {
  generateY2MeasurelandsWeek2Lesson1Task,
  resetY2MeasurelandsWeek2Lesson1TaskSessionState,
} from "@/data/activities/year2Measurelands/week2Lesson1";

// Level 2 (Year 2) Measurelands lesson registry. Mirrors the Level 1 registry so
// app/lesson/page.tsx can resolve `y2-measurement-w{n}-l{m}` ids to tasks.
// No quizContributionBuilder in Level 2 — a post-test is coded last.
// See MEASURELANDS_LEVEL2_PLAN.md.
type Y2MeasurelandsLessonEntry = {
  prefix: string;
  week: number;
  lessonNumber: number;
  title: string;
  subtitle?: string;
  generate: (lessonId: string, difficulty: Difficulty) => PracticeTask;
  reset: () => void;
  practisedSkills?: string[];
  completionTitle: string;
  unlockMessage: string;
  returnRoute: string;
};

const Y2_MEASURELANDS_LESSONS: Y2MeasurelandsLessonEntry[] = [
  {
    prefix: "y2-measurement-w1-l1",
    week: 1,
    lessonNumber: 1,
    title: "How Many More?",
    subtitle: "Unit Count Canyon",
    generate: generateY2MeasurelandsWeek1Lesson1Task,
    reset: resetY2MeasurelandsWeek1Lesson1TaskSessionState,
    practisedSkills: [
      "Measuring length in uniform units",
      "Finding how many more units one object is",
      "Finding how many fewer units one object is",
      "Quantifying the difference between two lengths",
    ],
    completionTitle: "Difference Finder Complete!",
    unlockMessage: "Lesson 2 unlocked.",
    returnRoute: "/program?year=Year 2&week=1&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y2-measurement-w1-l2",
    week: 1,
    lessonNumber: 2,
    title: "Order by Count",
    subtitle: "Unit Count Canyon",
    generate: generateY2MeasurelandsWeek1Lesson2Task,
    reset: resetY2MeasurelandsWeek1Lesson2TaskSessionState,
    practisedSkills: [
      "Ordering objects by unit count",
      "Comparing measured lengths (trust the count)",
      "Identifying equal lengths",
      "Reasoning about how much longer",
    ],
    completionTitle: "Measurement Comparer Complete!",
    unlockMessage: "Lesson 3 unlocked.",
    returnRoute: "/program?year=Year 2&week=1&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y2-measurement-w1-l3",
    week: 1,
    lessonNumber: 3,
    title: "Measuring Detective",
    subtitle: "Unit Count Canyon",
    generate: generateY2MeasurelandsWeek1Lesson3Task,
    reset: resetY2MeasurelandsWeek1Lesson3TaskSessionState,
    practisedSkills: [
      "Choosing the best measuring tool",
      "Explaining why a tool is a poor fit",
      "Justifying the best tool for the job",
      "Matching tool size to object size",
    ],
    completionTitle: "Measuring Detective Complete!",
    unlockMessage: "Week complete.",
    returnRoute: "/program?year=Year 2&week=1&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y2-measurement-w2-l1",
    week: 2,
    lessonNumber: 1,
    title: "Count the Weights",
    subtitle: "Balance Basin",
    generate: generateY2MeasurelandsWeek2Lesson1Task,
    reset: resetY2MeasurelandsWeek2Lesson1TaskSessionState,
    practisedSkills: [
      "Reading a measured mass in balance cubes",
      "Comparing measured masses (trust the cubes)",
      "Finding how many more cubes one object measures",
      "Using measurement instead of appearance",
    ],
    completionTitle: "Mass Measurer Complete!",
    unlockMessage: "Lesson 2 unlocked.",
    returnRoute: "/program?year=Year 2&week=2&legacy=1&realm_id=measurement",
  },
];

export function isY2MeasurelandsLessonId(lessonId: string): boolean {
  return Y2_MEASURELANDS_LESSONS.some((entry) => lessonId.startsWith(entry.prefix));
}

export function resolveY2MeasurelandsLessonTask(
  lessonId: string,
  difficulty: Difficulty,
): PracticeTask | null {
  const entry = Y2_MEASURELANDS_LESSONS.find((candidate) => lessonId.startsWith(candidate.prefix));
  return entry ? entry.generate(lessonId, difficulty) : null;
}

export function getY2MeasurelandsPractisedSkills(lessonId: string): string[] | undefined {
  return Y2_MEASURELANDS_LESSONS.find((entry) => lessonId.startsWith(entry.prefix))?.practisedSkills;
}

export type Y2MeasurelandsLessonMeta = Omit<Y2MeasurelandsLessonEntry, "generate" | "reset">;

export function getY2MeasurelandsLessonMeta(lessonId: string): Y2MeasurelandsLessonMeta | null {
  const entry = Y2_MEASURELANDS_LESSONS.find((candidate) => lessonId.startsWith(candidate.prefix));
  if (!entry) return null;
  const { generate: _generate, reset: _reset, ...meta } = entry;
  return meta;
}

export function resetY2MeasurelandsLessonSessionState() {
  Y2_MEASURELANDS_LESSONS.forEach((entry) => entry.reset());
}
