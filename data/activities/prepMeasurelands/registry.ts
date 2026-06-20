import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import {
  generatePrepMeasurelandsWeek1Task,
  resetPrepMeasurelandsWeek1TaskSessionState,
} from "@/data/activities/prepMeasurelands/week1";
import {
  generatePrepMeasurelandsWeek1Lesson2Task,
  resetPrepMeasurelandsWeek1Lesson2TaskSessionState,
} from "@/data/activities/prepMeasurelands/week1Lesson2";
import {
  generatePrepMeasurelandsWeek1Lesson3Task,
  resetPrepMeasurelandsWeek1Lesson3TaskSessionState,
} from "@/data/activities/prepMeasurelands/week1Lesson3";
import {
  generatePrepMeasurelandsWeek2Lesson1Task,
  resetPrepMeasurelandsWeek2Lesson1TaskSessionState,
} from "@/data/activities/prepMeasurelands/week2Lesson1";
import {
  generatePrepMeasurelandsWeek2Lesson2Task,
  buildMeasurelandsWeek2Lesson2QuizTasks,
  resetPrepMeasurelandsWeek2Lesson2TaskSessionState,
} from "@/data/activities/prepMeasurelands/week2Lesson2";
import {
  generatePrepMeasurelandsWeek2Lesson3Task,
  resetPrepMeasurelandsWeek2Lesson3TaskSessionState,
} from "@/data/activities/prepMeasurelands/week2Lesson3";
import {
  generatePrepMeasurelandsWeek3Lesson1Task,
  buildMeasurelandsWeek3Lesson1QuizTasks,
  resetPrepMeasurelandsWeek3Lesson1TaskSessionState,
} from "@/data/activities/prepMeasurelands/week3Lesson1";
import {
  generatePrepMeasurelandsWeek3Lesson2Task,
  buildMeasurelandsWeek3Lesson2QuizTasks,
  resetPrepMeasurelandsWeek3Lesson2TaskSessionState,
} from "@/data/activities/prepMeasurelands/week3Lesson2";
import {
  generatePrepMeasurelandsWeek3Lesson3Task,
  buildMeasurelandsWeek3Lesson3QuizTasks,
  resetPrepMeasurelandsWeek3Lesson3TaskSessionState,
} from "@/data/activities/prepMeasurelands/week3Lesson3";

type MeasurelandsLessonEntry = {
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

const PREP_MEASURELANDS_LESSONS: MeasurelandsLessonEntry[] = [
  {
    prefix: "y0-measurement-w1-l1",
    week: 1,
    lessonNumber: 1,
    title: "Which Is Longer?",
    subtitle: "Length Lands",
    generate: generatePrepMeasurelandsWeek1Task,
    reset: resetPrepMeasurelandsWeek1TaskSessionState,
    completionTitle: "Length Explorer Complete!",
    unlockMessage: "Lesson 2 unlocked.",
    returnRoute: "/program?year=Prep&week=1&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y0-measurement-w1-l2",
    week: 1,
    lessonNumber: 2,
    title: "Ordering Lengths",
    subtitle: "Length Lands",
    generate: generatePrepMeasurelandsWeek1Lesson2Task,
    reset: resetPrepMeasurelandsWeek1Lesson2TaskSessionState,
    practisedSkills: [
      "Finding the shortest object",
      "Finding the longest object",
      "Putting objects in order",
    ],
    completionTitle: "Length Line-Up Complete!",
    unlockMessage: "Lesson 3 unlocked.",
    returnRoute: "/program?year=Prep&week=1&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y0-measurement-w1-l3",
    week: 1,
    lessonNumber: 3,
    title: "Measuring Paths",
    subtitle: "Length Lands",
    generate: generatePrepMeasurelandsWeek1Lesson3Task,
    reset: resetPrepMeasurelandsWeek1Lesson3TaskSessionState,
    practisedSkills: [
      "Counting equal units",
      "Comparing path lengths",
      "Building paths",
    ],
    completionTitle: "Path Measuring Complete!",
    unlockMessage: "Weekly Quiz unlocked.",
    returnRoute: "/program?year=Prep&week=1&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y0-measurement-w2-l1",
    week: 2,
    lessonNumber: 1,
    title: "Heavy or Light?",
    subtitle: "Balance Basin",
    generate: generatePrepMeasurelandsWeek2Lesson1Task,
    reset: resetPrepMeasurelandsWeek2Lesson1TaskSessionState,
    practisedSkills: [
      "Heavier objects",
      "Lighter objects",
      "Comparing mass",
    ],
    completionTitle: "Heavy or Light Complete!",
    unlockMessage: "Lesson 2 unlocked.",
    returnRoute: "/program?year=Prep&week=2&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y0-measurement-w2-l2",
    week: 2,
    lessonNumber: 2,
    title: "Order by Mass",
    subtitle: "Balance Basin",
    generate: generatePrepMeasurelandsWeek2Lesson2Task,
    reset: resetPrepMeasurelandsWeek2Lesson2TaskSessionState,
    practisedSkills: [
      "Finding the lightest object",
      "Finding the heaviest object",
      "Putting objects in mass order",
    ],
    completionTitle: "Mass Sorting Complete!",
    unlockMessage: "Lesson 3 unlocked.",
    returnRoute: "/program?year=Prep&week=2&legacy=1&realm_id=measurement",
    quizContributionBuilder: buildMeasurelandsWeek2Lesson2QuizTasks,
  },
  {
    prefix: "y0-measurement-w2-l3",
    week: 2,
    lessonNumber: 3,
    title: "Balance the Scales",
    subtitle: "Balance Basin",
    generate: generatePrepMeasurelandsWeek2Lesson3Task,
    reset: resetPrepMeasurelandsWeek2Lesson3TaskSessionState,
    practisedSkills: [
      "Making a scale balance",
      "Finding objects that weigh the same",
      "Spotting balanced and not balanced",
    ],
    completionTitle: "Balance Basin Complete!",
    unlockMessage: "Weekly Quiz unlocked.",
    returnRoute: "/program?year=Prep&week=2&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y0-measurement-w3-l1",
    week: 3,
    lessonNumber: 1,
    title: "Which Holds More?",
    subtitle: "Capacity Springs",
    generate: generatePrepMeasurelandsWeek3Lesson1Task,
    reset: resetPrepMeasurelandsWeek3Lesson1TaskSessionState,
    practisedSkills: [
      "Comparing which container holds more",
      "Comparing which container holds less",
      "Using capacity words",
    ],
    completionTitle: "Capacity Springs Complete!",
    unlockMessage: "Lesson 2 unlocked.",
    returnRoute: "/program?year=Prep&week=3&legacy=1&realm_id=measurement",
    quizContributionBuilder: buildMeasurelandsWeek3Lesson1QuizTasks,
  },
  {
    prefix: "y0-measurement-w3-l2",
    week: 3,
    lessonNumber: 2,
    title: "Ordering Containers",
    subtitle: "Capacity Springs",
    generate: generatePrepMeasurelandsWeek3Lesson2Task,
    reset: resetPrepMeasurelandsWeek3Lesson2TaskSessionState,
    practisedSkills: [
      "Ordering containers by capacity",
      "Finding the smallest container",
      "Finding the largest container",
    ],
    completionTitle: "Container Order Complete!",
    unlockMessage: "Lesson 3 unlocked.",
    returnRoute: "/program?year=Prep&week=3&legacy=1&realm_id=measurement",
    quizContributionBuilder: buildMeasurelandsWeek3Lesson2QuizTasks,
  },
  {
    prefix: "y0-measurement-w3-l3",
    week: 3,
    lessonNumber: 3,
    title: "Filling the Springs",
    subtitle: "Capacity Springs",
    generate: generatePrepMeasurelandsWeek3Lesson3Task,
    reset: resetPrepMeasurelandsWeek3Lesson3TaskSessionState,
    practisedSkills: [
      "Describing how full a container is",
      "Finding empty, half full and full",
      "Ordering containers from empty to full",
    ],
    completionTitle: "Filling the Springs Complete!",
    unlockMessage: "Weekly Quiz unlocked.",
    returnRoute: "/program?year=Prep&week=3&legacy=1&realm_id=measurement",
    quizContributionBuilder: buildMeasurelandsWeek3Lesson3QuizTasks,
  },
];

export function isPrepMeasurelandsLessonId(lessonId: string): boolean {
  return PREP_MEASURELANDS_LESSONS.some((entry) => lessonId.startsWith(entry.prefix));
}

export function resolvePrepMeasurelandsLessonTask(
  lessonId: string,
  difficulty: Difficulty,
): PracticeTask | null {
  const entry = PREP_MEASURELANDS_LESSONS.find((candidate) => lessonId.startsWith(candidate.prefix));
  return entry ? entry.generate(lessonId, difficulty) : null;
}

export function getPrepMeasurelandsPractisedSkills(lessonId: string): string[] | undefined {
  return PREP_MEASURELANDS_LESSONS.find((entry) => lessonId.startsWith(entry.prefix))?.practisedSkills;
}

export type PrepMeasurelandsLessonMeta = Omit<MeasurelandsLessonEntry, "generate" | "reset">;

export function getPrepMeasurelandsLessonMeta(lessonId: string): PrepMeasurelandsLessonMeta | null {
  const entry = PREP_MEASURELANDS_LESSONS.find((candidate) => lessonId.startsWith(candidate.prefix));
  if (!entry) return null;
  const { generate: _generate, reset: _reset, ...meta } = entry;
  return meta;
}

export function resetPrepMeasurelandsLessonSessionState() {
  PREP_MEASURELANDS_LESSONS.forEach((entry) => entry.reset());
}
