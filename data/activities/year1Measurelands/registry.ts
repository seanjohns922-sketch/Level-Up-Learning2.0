import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import {
  generateY1MeasurelandsWeek1Lesson1Task,
  resetY1MeasurelandsWeek1Lesson1TaskSessionState,
  buildY1MeasurelandsWeek1Lesson1QuizTasks,
} from "@/data/activities/year1Measurelands/week1Lesson1";
import {
  generateY1MeasurelandsWeek1Lesson2Task,
  resetY1MeasurelandsWeek1Lesson2TaskSessionState,
  buildY1MeasurelandsWeek1Lesson2QuizTasks,
} from "@/data/activities/year1Measurelands/week1Lesson2";

// Level 1 (Year 1) Measurelands lesson registry. Mirrors the Prep registry so
// app/lesson/page.tsx can resolve `y1-measurement-w{n}-l{m}` ids to tasks.
type Y1MeasurelandsLessonEntry = {
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
  quizContributionBuilder?: () => PracticeTask[];
};

const Y1_MEASURELANDS_LESSONS: Y1MeasurelandsLessonEntry[] = [
  {
    prefix: "y1-measurement-w1-l1",
    week: 1,
    lessonNumber: 1,
    title: "Measure with Blocks",
    subtitle: "Length Trail",
    generate: generateY1MeasurelandsWeek1Lesson1Task,
    reset: resetY1MeasurelandsWeek1Lesson1TaskSessionState,
    practisedSkills: [
      "Measuring with equal blocks",
      "Counting how many blocks long",
      "Comparing measured lengths",
    ],
    completionTitle: "Block Measurer Complete!",
    unlockMessage: "Lesson 2 unlocked.",
    returnRoute: "/program?year=Year 1&week=1&legacy=1&realm_id=measurement",
    quizContributionBuilder: buildY1MeasurelandsWeek1Lesson1QuizTasks,
  },
  {
    prefix: "y1-measurement-w1-l2",
    week: 1,
    lessonNumber: 2,
    title: "Compare Measured Lengths",
    subtitle: "Length Trail",
    generate: generateY1MeasurelandsWeek1Lesson2Task,
    reset: resetY1MeasurelandsWeek1Lesson2TaskSessionState,
    practisedSkills: [
      "Reading a measured length",
      "Comparing measured lengths",
      "Ordering measured lengths",
      "Finding equal measured lengths",
    ],
    completionTitle: "Measurement Comparer Complete!",
    unlockMessage: "Lesson 3 unlocked.",
    returnRoute: "/program?year=Year 1&week=1&legacy=1&realm_id=measurement",
    quizContributionBuilder: buildY1MeasurelandsWeek1Lesson2QuizTasks,
  },
];

export function isY1MeasurelandsLessonId(lessonId: string): boolean {
  return Y1_MEASURELANDS_LESSONS.some((entry) => lessonId.startsWith(entry.prefix));
}

export function resolveY1MeasurelandsLessonTask(
  lessonId: string,
  difficulty: Difficulty,
): PracticeTask | null {
  const entry = Y1_MEASURELANDS_LESSONS.find((candidate) => lessonId.startsWith(candidate.prefix));
  return entry ? entry.generate(lessonId, difficulty) : null;
}

export function getY1MeasurelandsPractisedSkills(lessonId: string): string[] | undefined {
  return Y1_MEASURELANDS_LESSONS.find((entry) => lessonId.startsWith(entry.prefix))?.practisedSkills;
}

export type Y1MeasurelandsLessonMeta = Omit<Y1MeasurelandsLessonEntry, "generate" | "reset">;

export function getY1MeasurelandsLessonMeta(lessonId: string): Y1MeasurelandsLessonMeta | null {
  const entry = Y1_MEASURELANDS_LESSONS.find((candidate) => lessonId.startsWith(candidate.prefix));
  if (!entry) return null;
  const { generate: _generate, reset: _reset, ...meta } = entry;
  return meta;
}

export function resetY1MeasurelandsLessonSessionState() {
  Y1_MEASURELANDS_LESSONS.forEach((entry) => entry.reset());
}
