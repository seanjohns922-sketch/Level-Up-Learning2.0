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
import {
  generateY1MeasurelandsWeek1Lesson3Task,
  resetY1MeasurelandsWeek1Lesson3TaskSessionState,
  buildY1MeasurelandsWeek1Lesson3QuizTasks,
} from "@/data/activities/year1Measurelands/week1Lesson3";
import {
  generateY1MeasurelandsWeek2Lesson1Task,
  resetY1MeasurelandsWeek2Lesson1TaskSessionState,
  buildY1MeasurelandsWeek2Lesson1QuizTasks,
} from "@/data/activities/year1Measurelands/week2Lesson1";
import {
  generateY1MeasurelandsWeek2Lesson2Task,
  resetY1MeasurelandsWeek2Lesson2TaskSessionState,
  buildY1MeasurelandsWeek2Lesson2QuizTasks,
} from "@/data/activities/year1Measurelands/week2Lesson2";
import {
  generateY1MeasurelandsWeek2Lesson3Task,
  resetY1MeasurelandsWeek2Lesson3TaskSessionState,
  buildY1MeasurelandsWeek2Lesson3QuizTasks,
} from "@/data/activities/year1Measurelands/week2Lesson3";
import {
  generateY1MeasurelandsWeek3Lesson1Task,
  resetY1MeasurelandsWeek3Lesson1TaskSessionState,
  buildY1MeasurelandsWeek3Lesson1QuizTasks,
} from "@/data/activities/year1Measurelands/week3Lesson1";
import {
  generateY1MeasurelandsWeek3Lesson2Task,
  resetY1MeasurelandsWeek3Lesson2TaskSessionState,
  buildY1MeasurelandsWeek3Lesson2QuizTasks,
} from "@/data/activities/year1Measurelands/week3Lesson2";

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
  {
    prefix: "y1-measurement-w1-l3",
    week: 1,
    lessonNumber: 3,
    title: "No Gaps, No Overlaps",
    subtitle: "Length Trail",
    generate: generateY1MeasurelandsWeek1Lesson3Task,
    reset: resetY1MeasurelandsWeek1Lesson3TaskSessionState,
    practisedSkills: [
      "Spotting a correct measurement",
      "Spotting gaps and overlaps",
      "Fixing a measurement",
      "Knowing why measurements must be fair",
    ],
    completionTitle: "Fair Measurer Complete!",
    unlockMessage: "Weekly Quiz unlocked.",
    returnRoute: "/program?year=Year 1&week=1&legacy=1&realm_id=measurement",
    quizContributionBuilder: buildY1MeasurelandsWeek1Lesson3QuizTasks,
  },
  {
    prefix: "y1-measurement-w2-l1",
    week: 2,
    lessonNumber: 1,
    title: "Measuring Mass",
    subtitle: "Balance Basin",
    generate: generateY1MeasurelandsWeek2Lesson1Task,
    reset: resetY1MeasurelandsWeek2Lesson1TaskSessionState,
    practisedSkills: [
      "Measuring mass with balance cubes",
      "Counting balance cubes",
      "Comparing measured mass",
      "Using the same unit fairly",
    ],
    completionTitle: "Mass Measurer Complete!",
    unlockMessage: "Lesson 2 unlocked.",
    returnRoute: "/program?year=Year 1&week=2&legacy=1&realm_id=measurement",
    quizContributionBuilder: buildY1MeasurelandsWeek2Lesson1QuizTasks,
  },
  {
    prefix: "y1-measurement-w2-l2",
    week: 2,
    lessonNumber: 2,
    title: "Compare Measured Mass",
    subtitle: "Balance Basin",
    generate: generateY1MeasurelandsWeek2Lesson2Task,
    reset: resetY1MeasurelandsWeek2Lesson2TaskSessionState,
    practisedSkills: [
      "Comparing mass measurements",
      "Ordering measured masses",
      "Finding equal mass",
      "Using cube counts to justify",
    ],
    completionTitle: "Mass Comparer Complete!",
    unlockMessage: "Lesson 3 unlocked.",
    returnRoute: "/program?year=Year 1&week=2&legacy=1&realm_id=measurement",
    quizContributionBuilder: buildY1MeasurelandsWeek2Lesson2QuizTasks,
  },
  {
    prefix: "y1-measurement-w2-l3",
    week: 2,
    lessonNumber: 3,
    title: "Fair or Unfair Measure?",
    subtitle: "Balance Basin",
    generate: generateY1MeasurelandsWeek2Lesson3Task,
    reset: resetY1MeasurelandsWeek2Lesson3TaskSessionState,
    practisedSkills: [
      "Spotting a fair measurement",
      "Using the same unit every time",
      "Fixing an unfair measurement",
      "Knowing why units must match",
    ],
    completionTitle: "Fair Measurer Complete!",
    unlockMessage: "Weekly Quiz unlocked.",
    returnRoute: "/program?year=Year 1&week=2&legacy=1&realm_id=measurement",
    quizContributionBuilder: buildY1MeasurelandsWeek2Lesson3QuizTasks,
  },
  {
    prefix: "y1-measurement-w3-l1",
    week: 3,
    lessonNumber: 1,
    title: "Fill with Cups",
    subtitle: "Capacity Springs",
    generate: generateY1MeasurelandsWeek3Lesson1Task,
    reset: resetY1MeasurelandsWeek3Lesson1TaskSessionState,
    practisedSkills: [
      "Measuring capacity with cups",
      "Counting how many cups fill a container",
      "Comparing measured capacity",
      "Using the same cup fairly",
    ],
    completionTitle: "Capacity Measurer Complete!",
    unlockMessage: "Lesson 2 unlocked.",
    returnRoute: "/program?year=Year 1&week=3&legacy=1&realm_id=measurement",
    quizContributionBuilder: buildY1MeasurelandsWeek3Lesson1QuizTasks,
  },
  {
    prefix: "y1-measurement-w3-l2",
    week: 3,
    lessonNumber: 2,
    title: "Compare Measured Capacity",
    subtitle: "Capacity Springs",
    generate: generateY1MeasurelandsWeek3Lesson2Task,
    reset: resetY1MeasurelandsWeek3Lesson2TaskSessionState,
    practisedSkills: [
      "Comparing capacity measurements",
      "Identifying containers that hold more or less",
      "Ordering measured capacities",
      "Finding equal capacity",
    ],
    completionTitle: "Capacity Comparer Complete!",
    unlockMessage: "Lesson 3 unlocked.",
    returnRoute: "/program?year=Year 1&week=3&legacy=1&realm_id=measurement",
    quizContributionBuilder: buildY1MeasurelandsWeek3Lesson2QuizTasks,
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
