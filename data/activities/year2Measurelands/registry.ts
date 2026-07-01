import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import {
  generateY2MeasurelandsWeek1Lesson1Task,
  resetY2MeasurelandsWeek1Lesson1TaskSessionState,
  buildY2MeasurelandsWeek1Lesson1QuizTasks,
} from "@/data/activities/year2Measurelands/week1Lesson1";
import {
  generateY2MeasurelandsWeek1Lesson2Task,
  resetY2MeasurelandsWeek1Lesson2TaskSessionState,
  buildY2MeasurelandsWeek1Lesson2QuizTasks,
} from "@/data/activities/year2Measurelands/week1Lesson2";
import {
  generateY2MeasurelandsWeek1Lesson3Task,
  resetY2MeasurelandsWeek1Lesson3TaskSessionState,
  buildY2MeasurelandsWeek1Lesson3QuizTasks,
} from "@/data/activities/year2Measurelands/week1Lesson3";
import {
  generateY2MeasurelandsWeek2Lesson1Task,
  resetY2MeasurelandsWeek2Lesson1TaskSessionState,
  buildY2MeasurelandsWeek2Lesson1QuizTasks,
} from "@/data/activities/year2Measurelands/week2Lesson1";
import {
  generateY2MeasurelandsWeek2Lesson2Task,
  resetY2MeasurelandsWeek2Lesson2TaskSessionState,
  buildY2MeasurelandsWeek2Lesson2QuizTasks,
} from "@/data/activities/year2Measurelands/week2Lesson2";
import {
  generateY2MeasurelandsWeek2Lesson3Task,
  resetY2MeasurelandsWeek2Lesson3TaskSessionState,
  buildY2MeasurelandsWeek2Lesson3QuizTasks,
} from "@/data/activities/year2Measurelands/week2Lesson3";
import {
  generateY2MeasurelandsWeek3Lesson1Task,
  resetY2MeasurelandsWeek3Lesson1TaskSessionState,
  buildY2MeasurelandsWeek3Lesson1QuizTasks,
} from "@/data/activities/year2Measurelands/week3Lesson1";
import {
  generateY2MeasurelandsWeek3Lesson2Task,
  resetY2MeasurelandsWeek3Lesson2TaskSessionState,
  buildY2MeasurelandsWeek3Lesson2QuizTasks,
} from "@/data/activities/year2Measurelands/week3Lesson2";
import {
  generateY2MeasurelandsWeek3Lesson3Task,
  resetY2MeasurelandsWeek3Lesson3TaskSessionState,
  buildY2MeasurelandsWeek3Lesson3QuizTasks,
} from "@/data/activities/year2Measurelands/week3Lesson3";
import {
  generateY2MeasurelandsWeek4Lesson1Task,
  resetY2MeasurelandsWeek4Lesson1TaskSessionState,
  buildY2MeasurelandsWeek4Lesson1QuizTasks,
} from "@/data/activities/year2Measurelands/week4Lesson1";
import {
  generateY2MeasurelandsWeek4Lesson2Task,
  resetY2MeasurelandsWeek4Lesson2TaskSessionState,
  buildY2MeasurelandsWeek4Lesson2QuizTasks,
} from "@/data/activities/year2Measurelands/week4Lesson2";
import {
  generateY2MeasurelandsWeek4Lesson3Task,
  resetY2MeasurelandsWeek4Lesson3TaskSessionState,
  buildY2MeasurelandsWeek4Lesson3QuizTasks,
} from "@/data/activities/year2Measurelands/week4Lesson3";
import {
  generateY2MeasurelandsWeek5Lesson1Task,
  resetY2MeasurelandsWeek5Lesson1TaskSessionState,
  buildY2MeasurelandsWeek5Lesson1QuizTasks,
} from "@/data/activities/year2Measurelands/week5Lesson1";
import {
  generateY2MeasurelandsWeek5Lesson2Task,
  resetY2MeasurelandsWeek5Lesson2TaskSessionState,
  buildY2MeasurelandsWeek5Lesson2QuizTasks,
} from "@/data/activities/year2Measurelands/week5Lesson2";
import {
  generateY2MeasurelandsWeek5Lesson3Task,
  resetY2MeasurelandsWeek5Lesson3TaskSessionState,
  buildY2MeasurelandsWeek5Lesson3QuizTasks,
} from "@/data/activities/year2Measurelands/week5Lesson3";

// Level 2 (Year 2) Measurelands lesson registry. Mirrors the Level 1 registry so
// app/lesson/page.tsx can resolve `y2-measurement-w{n}-l{m}` ids to tasks.
// Each lesson contributes exactly 5 quiz/post-test questions via
// quizContributionBuilder (the weekly-quiz/post-test UI is wired last).
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
  quizContributionBuilder?: () => PracticeTask[];
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
    quizContributionBuilder: buildY2MeasurelandsWeek1Lesson1QuizTasks,
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
    quizContributionBuilder: buildY2MeasurelandsWeek1Lesson2QuizTasks,
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
    quizContributionBuilder: buildY2MeasurelandsWeek1Lesson3QuizTasks,
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
    quizContributionBuilder: buildY2MeasurelandsWeek2Lesson1QuizTasks,
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
  {
    prefix: "y2-measurement-w2-l2",
    week: 2,
    lessonNumber: 2,
    title: "By How Many?",
    subtitle: "Balance Basin",
    generate: generateY2MeasurelandsWeek2Lesson2Task,
    reset: resetY2MeasurelandsWeek2Lesson2TaskSessionState,
    quizContributionBuilder: buildY2MeasurelandsWeek2Lesson2QuizTasks,
    practisedSkills: [
      "Ordering objects by measured mass",
      "Finding how many more cubes one object measures",
      "Identifying equal masses",
      "Reasoning with balance-cube counts",
    ],
    completionTitle: "Mass Comparer Complete!",
    unlockMessage: "Lesson 3 unlocked.",
    returnRoute: "/program?year=Year 2&week=2&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y2-measurement-w2-l3",
    week: 2,
    lessonNumber: 3,
    title: "Predict & Prove",
    subtitle: "Balance Basin",
    generate: generateY2MeasurelandsWeek2Lesson3Task,
    reset: resetY2MeasurelandsWeek2Lesson3TaskSessionState,
    quizContributionBuilder: buildY2MeasurelandsWeek2Lesson3QuizTasks,
    practisedSkills: [
      "Proving which object has greater mass",
      "Trusting the cubes over appearance",
      "Reasoning with measured mass",
      "Finding how many more cubes",
    ],
    completionTitle: "Mass Reasoner Complete!",
    unlockMessage: "Week complete.",
    returnRoute: "/program?year=Year 2&week=2&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y2-measurement-w3-l1",
    week: 3,
    lessonNumber: 1,
    title: "Count the Cups",
    subtitle: "Capacity Springs",
    generate: generateY2MeasurelandsWeek3Lesson1Task,
    reset: resetY2MeasurelandsWeek3Lesson1TaskSessionState,
    quizContributionBuilder: buildY2MeasurelandsWeek3Lesson1QuizTasks,
    practisedSkills: [
      "Reading larger capacity measurements in cups",
      "Comparing measured capacities",
      "Finding how many more cups one container holds",
      "Using cup counts instead of appearance",
    ],
    completionTitle: "Capacity Counter Complete!",
    unlockMessage: "Lesson 2 unlocked.",
    returnRoute: "/program?year=Year 2&week=3&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y2-measurement-w3-l2",
    week: 3,
    lessonNumber: 2,
    title: "Order by Capacity",
    subtitle: "Capacity Springs",
    generate: generateY2MeasurelandsWeek3Lesson2Task,
    reset: resetY2MeasurelandsWeek3Lesson2TaskSessionState,
    quizContributionBuilder: buildY2MeasurelandsWeek3Lesson2QuizTasks,
    practisedSkills: [
      "Ordering measured capacities",
      "Identifying greatest and least capacity",
      "Recognising equal capacity measurements",
      "Using cup counts to justify comparisons",
    ],
    completionTitle: "Capacity Orderer Complete!",
    unlockMessage: "Lesson 3 unlocked.",
    returnRoute: "/program?year=Year 2&week=3&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y2-measurement-w3-l3",
    week: 3,
    lessonNumber: 3,
    title: "Better Measuring Units",
    subtitle: "Capacity Springs",
    generate: generateY2MeasurelandsWeek3Lesson3Task,
    reset: resetY2MeasurelandsWeek3Lesson3TaskSessionState,
    quizContributionBuilder: buildY2MeasurelandsWeek3Lesson3QuizTasks,
    practisedSkills: [
      "Choosing sensible capacity units",
      "Explaining why a unit is too small or too large",
      "Solving simple measuring-tool problems",
      "Reasoning about efficient measurement",
    ],
    completionTitle: "Capacity Unit Expert Complete!",
    unlockMessage: "Week complete.",
    returnRoute: "/program?year=Year 2&week=3&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y2-measurement-w4-l1",
    week: 4,
    lessonNumber: 1,
    title: "Measure It Your Way",
    subtitle: "Closer Count",
    generate: generateY2MeasurelandsWeek4Lesson1Task,
    reset: resetY2MeasurelandsWeek4Lesson1TaskSessionState,
    quizContributionBuilder: buildY2MeasurelandsWeek4Lesson1QuizTasks,
    practisedSkills: [
      "Measuring length with big and small uniform units (no gaps)",
      "Combining units to measure an object exactly",
      "Understanding smaller units give a larger, more accurate measure",
      "Recognising a bigger unit-count doesn't mean a longer object",
    ],
    completionTitle: "Measure Master Complete!",
    unlockMessage: "Lesson 2 unlocked.",
    returnRoute: "/program?year=Year 2&week=4&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y2-measurement-w4-l2",
    week: 4,
    lessonNumber: 2,
    title: "Estimate It",
    subtitle: "Closer Count",
    generate: generateY2MeasurelandsWeek4Lesson2Task,
    reset: resetY2MeasurelandsWeek4Lesson2TaskSessionState,
    quizContributionBuilder: buildY2MeasurelandsWeek4Lesson2QuizTasks,
    practisedSkills: [
      "Estimating length by eye before measuring",
      "Choosing a sensible estimate for an object's size",
      "Comparing lengths by estimation",
    ],
    completionTitle: "Estimator Complete!",
    unlockMessage: "Lesson 3 unlocked.",
    returnRoute: "/program?year=Year 2&week=4&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y2-measurement-w4-l3",
    week: 4,
    lessonNumber: 3,
    title: "Different Units, Different Counts",
    subtitle: "Closer Count",
    generate: generateY2MeasurelandsWeek4Lesson3Task,
    reset: resetY2MeasurelandsWeek4Lesson3TaskSessionState,
    quizContributionBuilder: buildY2MeasurelandsWeek4Lesson3QuizTasks,
    practisedSkills: [
      "Measuring the same object with different informal units",
      "Explaining why smaller units make bigger counts",
      "Completing a measurement with equal informal units",
    ],
    completionTitle: "Different Units Complete!",
    unlockMessage: "Week complete.",
    returnRoute: "/program?year=Year 2&week=4&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y2-measurement-w5-l1",
    week: 5,
    lessonNumber: 1,
    title: "O'Clock Time",
    subtitle: "Clock Tower I",
    generate: generateY2MeasurelandsWeek5Lesson1Task,
    reset: resetY2MeasurelandsWeek5Lesson1TaskSessionState,
    quizContributionBuilder: buildY2MeasurelandsWeek5Lesson1QuizTasks,
    practisedSkills: [
      "Reading o'clock on an analog clock",
      "Recognising the minute hand at 12",
      "Using the hour hand to name the time",
    ],
    completionTitle: "O'Clock Reader Complete!",
    unlockMessage: "Lesson 2 unlocked.",
    returnRoute: "/program?year=Year 2&week=5&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y2-measurement-w5-l2",
    week: 5,
    lessonNumber: 2,
    title: "Half Past Time",
    subtitle: "Clock Tower I",
    generate: generateY2MeasurelandsWeek5Lesson2Task,
    reset: resetY2MeasurelandsWeek5Lesson2TaskSessionState,
    quizContributionBuilder: buildY2MeasurelandsWeek5Lesson2QuizTasks,
    practisedSkills: [
      "Reading half past on an analog clock",
      "Recognising the minute hand at 6",
      "Reading the hour hand between two numbers",
    ],
    completionTitle: "Half Past Reader Complete!",
    unlockMessage: "Lesson 3 unlocked.",
    returnRoute: "/program?year=Year 2&week=5&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y2-measurement-w5-l3",
    week: 5,
    lessonNumber: 3,
    title: "Build the Time",
    subtitle: "Clock Tower I",
    generate: generateY2MeasurelandsWeek5Lesson3Task,
    reset: resetY2MeasurelandsWeek5Lesson3TaskSessionState,
    quizContributionBuilder: buildY2MeasurelandsWeek5Lesson3QuizTasks,
    practisedSkills: [
      "Building o'clock and half past times",
      "Choosing the correct hour",
      "Choosing the correct minute-hand position",
      "Connecting clock hands to time words",
    ],
    completionTitle: "Clock Builder Complete!",
    unlockMessage: "Week complete.",
    returnRoute: "/program?year=Year 2&week=5&legacy=1&realm_id=measurement",
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
