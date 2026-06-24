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
import {
  generateY1MeasurelandsWeek3Lesson3Task,
  resetY1MeasurelandsWeek3Lesson3TaskSessionState,
  buildY1MeasurelandsWeek3Lesson3QuizTasks,
} from "@/data/activities/year1Measurelands/week3Lesson3";
import {
  generateY1MeasurelandsWeek4Lesson1Task,
  resetY1MeasurelandsWeek4Lesson1TaskSessionState,
  buildY1MeasurelandsWeek4Lesson1QuizTasks,
} from "@/data/activities/year1Measurelands/week4Lesson1";
import {
  generateY1MeasurelandsWeek4Lesson2Task,
  resetY1MeasurelandsWeek4Lesson2TaskSessionState,
  buildY1MeasurelandsWeek4Lesson2QuizTasks,
} from "@/data/activities/year1Measurelands/week4Lesson2";
import {
  generateY1MeasurelandsWeek4Lesson3Task,
  resetY1MeasurelandsWeek4Lesson3TaskSessionState,
  buildY1MeasurelandsWeek4Lesson3QuizTasks,
} from "@/data/activities/year1Measurelands/week4Lesson3";
import {
  generateY1MeasurelandsWeek5Lesson1Task,
  resetY1MeasurelandsWeek5Lesson1TaskSessionState,
  buildY1MeasurelandsWeek5Lesson1QuizTasks,
} from "@/data/activities/year1Measurelands/week5Lesson1";
import {
  generateY1MeasurelandsWeek5Lesson2Task,
  resetY1MeasurelandsWeek5Lesson2TaskSessionState,
  buildY1MeasurelandsWeek5Lesson2QuizTasks,
} from "@/data/activities/year1Measurelands/week5Lesson2";
import {
  generateY1MeasurelandsWeek5Lesson3Task,
  resetY1MeasurelandsWeek5Lesson3TaskSessionState,
  buildY1MeasurelandsWeek5Lesson3QuizTasks,
} from "@/data/activities/year1Measurelands/week5Lesson3";
import {
  generateY1MeasurelandsWeek6Lesson1Task,
  resetY1MeasurelandsWeek6Lesson1TaskSessionState,
  buildY1MeasurelandsWeek6Lesson1QuizTasks,
} from "@/data/activities/year1Measurelands/week6Lesson1";
import {
  generateY1MeasurelandsWeek6Lesson2Task,
  resetY1MeasurelandsWeek6Lesson2TaskSessionState,
  buildY1MeasurelandsWeek6Lesson2QuizTasks,
} from "@/data/activities/year1Measurelands/week6Lesson2";
import {
  generateY1MeasurelandsWeek6Lesson3Task,
  resetY1MeasurelandsWeek6Lesson3TaskSessionState,
  buildY1MeasurelandsWeek6Lesson3QuizTasks,
} from "@/data/activities/year1Measurelands/week6Lesson3";

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
  {
    prefix: "y1-measurement-w3-l3",
    week: 3,
    lessonNumber: 3,
    title: "Better Measuring Units",
    subtitle: "Capacity Springs",
    generate: generateY1MeasurelandsWeek3Lesson3Task,
    reset: resetY1MeasurelandsWeek3Lesson3TaskSessionState,
    practisedSkills: [
      "Recognising fair capacity measurements",
      "Spotting different measuring units",
      "Choosing a sensible measuring unit",
      "Knowing why the same unit matters",
    ],
    completionTitle: "Fair Capacity Measurer Complete!",
    unlockMessage: "Weekly Quiz unlocked.",
    returnRoute: "/program?year=Year 1&week=3&legacy=1&realm_id=measurement",
    quizContributionBuilder: buildY1MeasurelandsWeek3Lesson3QuizTasks,
  },
  {
    prefix: "y1-measurement-w4-l1",
    week: 4,
    lessonNumber: 1,
    title: "Hour, Day, Week",
    subtitle: "Duration Dunes",
    generate: generateY1MeasurelandsWeek4Lesson1Task,
    reset: resetY1MeasurelandsWeek4Lesson1TaskSessionState,
    practisedSkills: [
      "Matching activities to hour, day or week",
      "Comparing how long activities last",
      "Ordering activities by duration",
      "Using time words to reason",
    ],
    completionTitle: "Time Explorer Complete!",
    unlockMessage: "Lesson 2 unlocked.",
    returnRoute: "/program?year=Year 1&week=4&legacy=1&realm_id=measurement",
    quizContributionBuilder: buildY1MeasurelandsWeek4Lesson1QuizTasks,
  },
  {
    prefix: "y1-measurement-w4-l2",
    week: 4,
    lessonNumber: 2,
    title: "Compare Durations",
    subtitle: "Duration Dunes",
    generate: generateY1MeasurelandsWeek4Lesson2Task,
    reset: resetY1MeasurelandsWeek4Lesson2TaskSessionState,
    practisedSkills: [
      "Comparing how long events last",
      "Finding the longer and shorter event",
      "Ordering events by duration",
      "Reasoning with hour, day and week",
    ],
    completionTitle: "Duration Comparer Complete!",
    unlockMessage: "Lesson 3 unlocked.",
    returnRoute: "/program?year=Year 1&week=4&legacy=1&realm_id=measurement",
    quizContributionBuilder: buildY1MeasurelandsWeek4Lesson2QuizTasks,
  },
  {
    prefix: "y1-measurement-w4-l3",
    week: 4,
    lessonNumber: 3,
    title: "Sort by Duration",
    subtitle: "Duration Dunes",
    generate: generateY1MeasurelandsWeek4Lesson3Task,
    reset: resetY1MeasurelandsWeek4Lesson3TaskSessionState,
    practisedSkills: [
      "Sorting activities into hour/day/week groups",
      "Choosing the best duration unit",
      "Ordering activities by duration",
      "Reasoning about how long events take",
    ],
    completionTitle: "Duration Sorter Complete!",
    unlockMessage: "Weekly Quiz unlocked.",
    returnRoute: "/program?year=Year 1&week=4&legacy=1&realm_id=measurement",
    quizContributionBuilder: buildY1MeasurelandsWeek4Lesson3QuizTasks,
  },
  {
    prefix: "y1-measurement-w5-l1",
    week: 5,
    lessonNumber: 1,
    title: "Days Make a Week",
    subtitle: "Calendar Grove",
    generate: generateY1MeasurelandsWeek5Lesson1Task,
    reset: resetY1MeasurelandsWeek5Lesson1TaskSessionState,
    practisedSkills: [
      "Knowing 7 days make a week",
      "Building a complete week",
      "Knowing the week repeats",
      "Finding what comes next",
    ],
    completionTitle: "Week Builder Complete!",
    unlockMessage: "Lesson 2 unlocked.",
    returnRoute: "/program?year=Year 1&week=5&legacy=1&realm_id=measurement",
    quizContributionBuilder: buildY1MeasurelandsWeek5Lesson1QuizTasks,
  },
  {
    prefix: "y1-measurement-w5-l2",
    week: 5,
    lessonNumber: 2,
    title: "Weeks and Months",
    subtitle: "Calendar Grove",
    generate: generateY1MeasurelandsWeek5Lesson2Task,
    reset: resetY1MeasurelandsWeek5Lesson2TaskSessionState,
    practisedSkills: [
      "Knowing months are made of several weeks",
      "Recognising weeks inside a month",
      "Comparing week and month",
      "Ordering day, week and month",
    ],
    completionTitle: "Calendar Comparer Complete!",
    unlockMessage: "Lesson 3 unlocked.",
    returnRoute: "/program?year=Year 1&week=5&legacy=1&realm_id=measurement",
    quizContributionBuilder: buildY1MeasurelandsWeek5Lesson2QuizTasks,
  },
  {
    prefix: "y1-measurement-w5-l3",
    week: 5,
    lessonNumber: 3,
    title: "Month Explorer",
    subtitle: "Calendar Grove",
    generate: generateY1MeasurelandsWeek5Lesson3Task,
    reset: resetY1MeasurelandsWeek5Lesson3TaskSessionState,
    practisedSkills: [
      "Knowing months belong in a yearly cycle",
      "Identifying the next month",
      "Sequencing months in order",
      "Knowing the year repeats after December",
    ],
    completionTitle: "Month Explorer Complete!",
    unlockMessage: "Weekly Quiz unlocked.",
    returnRoute: "/program?year=Year 1&week=5&legacy=1&realm_id=measurement",
    quizContributionBuilder: buildY1MeasurelandsWeek5Lesson3QuizTasks,
  },
  {
    prefix: "y1-measurement-w6-l1",
    week: 6,
    lessonNumber: 1,
    title: "Find the Date",
    subtitle: "Calendar Quest",
    generate: generateY1MeasurelandsWeek6Lesson1Task,
    reset: resetY1MeasurelandsWeek6Lesson1TaskSessionState,
    practisedSkills: [
      "Finding a date on a calendar",
      "Reading the highlighted date",
      "Connecting events to dates",
      "Knowing the date is a number",
    ],
    completionTitle: "Date Finder Complete!",
    unlockMessage: "Lesson 2 unlocked.",
    returnRoute: "/program?year=Year 1&week=6&legacy=1&realm_id=measurement",
    quizContributionBuilder: buildY1MeasurelandsWeek6Lesson1QuizTasks,
  },
  {
    prefix: "y1-measurement-w6-l2",
    week: 6,
    lessonNumber: 2,
    title: "Calendar Navigation",
    subtitle: "Calendar Quest",
    generate: generateY1MeasurelandsWeek6Lesson2Task,
    reset: resetY1MeasurelandsWeek6Lesson2TaskSessionState,
    practisedSkills: [
      "Finding the next date",
      "Finding the previous date",
      "Jumping one week later or earlier",
      "Moving through a calendar in order",
    ],
    completionTitle: "Calendar Navigator Complete!",
    unlockMessage: "Lesson 3 unlocked.",
    returnRoute: "/program?year=Year 1&week=6&legacy=1&realm_id=measurement",
    quizContributionBuilder: buildY1MeasurelandsWeek6Lesson2QuizTasks,
  },
  {
    prefix: "y1-measurement-w6-l3",
    week: 6,
    lessonNumber: 3,
    title: "Event Planner",
    subtitle: "Calendar Quest",
    generate: generateY1MeasurelandsWeek6Lesson3Task,
    reset: resetY1MeasurelandsWeek6Lesson3TaskSessionState,
    practisedSkills: [
      "Reading when an event happens",
      "Placing events on a calendar",
      "Comparing which event comes first or last",
      "Using a calendar to plan",
    ],
    completionTitle: "Event Planner Complete!",
    unlockMessage: "Weekly Quiz unlocked.",
    returnRoute: "/program?year=Year 1&week=6&legacy=1&realm_id=measurement",
    quizContributionBuilder: buildY1MeasurelandsWeek6Lesson3QuizTasks,
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
