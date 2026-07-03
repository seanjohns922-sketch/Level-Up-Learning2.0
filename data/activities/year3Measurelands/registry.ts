import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import {
  buildY3MeasurelandsWeek1Lesson1QuizTasks,
  generateY3MeasurelandsWeek1Lesson1Task,
  resetY3MeasurelandsWeek1Lesson1TaskSessionState,
} from "@/data/activities/year3Measurelands/week1Lesson1";
import {
  buildY3MeasurelandsWeek1Lesson2QuizTasks,
  generateY3MeasurelandsWeek1Lesson2Task,
  resetY3MeasurelandsWeek1Lesson2TaskSessionState,
} from "@/data/activities/year3Measurelands/week1Lesson2";
import {
  buildY3MeasurelandsWeek1Lesson3QuizTasks,
  generateY3MeasurelandsWeek1Lesson3Task,
  resetY3MeasurelandsWeek1Lesson3TaskSessionState,
} from "@/data/activities/year3Measurelands/week1Lesson3";
import {
  buildY3MeasurelandsWeek2Lesson1QuizTasks,
  generateY3MeasurelandsWeek2Lesson1Task,
  resetY3MeasurelandsWeek2Lesson1TaskSessionState,
} from "@/data/activities/year3Measurelands/week2Lesson1";
import {
  buildY3MeasurelandsWeek2Lesson2QuizTasks,
  generateY3MeasurelandsWeek2Lesson2Task,
  resetY3MeasurelandsWeek2Lesson2TaskSessionState,
} from "@/data/activities/year3Measurelands/week2Lesson2";
import {
  buildY3MeasurelandsWeek2Lesson3QuizTasks,
  generateY3MeasurelandsWeek2Lesson3Task,
  resetY3MeasurelandsWeek2Lesson3TaskSessionState,
} from "@/data/activities/year3Measurelands/week2Lesson3";
import {
  buildY3MeasurelandsWeek3Lesson1QuizTasks,
  generateY3MeasurelandsWeek3Lesson1Task,
  resetY3MeasurelandsWeek3Lesson1TaskSessionState,
} from "@/data/activities/year3Measurelands/week3Lesson1";

type Y3MeasurelandsLessonEntry = {
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

const Y3_MEASURELANDS_LESSONS: Y3MeasurelandsLessonEntry[] = [
  {
    prefix: "y3-measurement-w1-l1",
    week: 1,
    lessonNumber: 1,
    title: "Meet the Ruler",
    subtitle: "Ruler Ridge",
    generate: generateY3MeasurelandsWeek1Lesson1Task,
    reset: resetY3MeasurelandsWeek1Lesson1TaskSessionState,
    quizContributionBuilder: buildY3MeasurelandsWeek1Lesson1QuizTasks,
    practisedSkills: [
      "Read a ruler from zero",
      "Measure length in centimetres",
      "Compare lengths in cm",
    ],
    completionTitle: "Meet the Ruler Complete!",
    unlockMessage: "Lesson 2 unlocked.",
    returnRoute: "/program?year=Year 3&week=1&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y3-measurement-w1-l2",
    week: 1,
    lessonNumber: 2,
    title: "Measure in Centimetres",
    subtitle: "Ruler Ridge",
    generate: generateY3MeasurelandsWeek1Lesson2Task,
    reset: resetY3MeasurelandsWeek1Lesson2TaskSessionState,
    quizContributionBuilder: buildY3MeasurelandsWeek1Lesson2QuizTasks,
    practisedSkills: [
      "Line objects up with zero",
      "Read whole centimetres on a ruler",
      "Measure classroom objects in cm",
      "Compare measured lengths",
    ],
    completionTitle: "Centimetre Measurer Complete!",
    unlockMessage: "Lesson 3 unlocked.",
    returnRoute: "/program?year=Year 3&week=1&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y3-measurement-w1-l3",
    week: 1,
    lessonNumber: 3,
    title: "Measurement Detective",
    subtitle: "Ruler Ridge",
    generate: generateY3MeasurelandsWeek1Lesson3Task,
    reset: resetY3MeasurelandsWeek1Lesson3TaskSessionState,
    quizContributionBuilder: buildY3MeasurelandsWeek1Lesson3QuizTasks,
    practisedSkills: [
      "Compare centimetre measurements",
      "Find the difference between lengths",
      "Choose the correct ruler reading",
      "Check measurement mistakes",
    ],
    completionTitle: "Measurement Detective Complete!",
    unlockMessage: "Weekly Quiz unlocked.",
    returnRoute: "/program?year=Year 3&week=1&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y3-measurement-w2-l1",
    week: 2,
    lessonNumber: 1,
    title: "Meet the Metre",
    subtitle: "Metre Mountain",
    generate: generateY3MeasurelandsWeek2Lesson1Task,
    reset: resetY3MeasurelandsWeek2Lesson1TaskSessionState,
    quizContributionBuilder: buildY3MeasurelandsWeek2Lesson1QuizTasks,
    practisedSkills: [
      "Recognise one metre (100 cm)",
      "Choose centimetres or metres",
      "Compare lengths to one metre",
    ],
    completionTitle: "Meet the Metre Complete!",
    unlockMessage: "Lesson 2 unlocked.",
    returnRoute: "/program?year=Year 3&week=2&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y3-measurement-w2-l2",
    week: 2,
    lessonNumber: 2,
    title: "Choose cm or m",
    subtitle: "Metre Mountain",
    generate: generateY3MeasurelandsWeek2Lesson2Task,
    reset: resetY3MeasurelandsWeek2Lesson2TaskSessionState,
    quizContributionBuilder: buildY3MeasurelandsWeek2Lesson2QuizTasks,
    practisedSkills: [
      "Choose centimetres or metres",
      "Sort objects by measuring unit",
      "Spot an unsensible unit choice",
    ],
    completionTitle: "Choose cm or m Complete!",
    unlockMessage: "Lesson 3 unlocked.",
    returnRoute: "/program?year=Year 3&week=2&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y3-measurement-w2-l3",
    week: 2,
    lessonNumber: 3,
    title: "Estimate then Measure",
    subtitle: "Metre Mountain",
    generate: generateY3MeasurelandsWeek2Lesson3Task,
    reset: resetY3MeasurelandsWeek2Lesson3TaskSessionState,
    quizContributionBuilder: buildY3MeasurelandsWeek2Lesson3QuizTasks,
    practisedSkills: [
      "Estimate a length before measuring",
      "Choose the most sensible estimate",
      "Measure to check an estimate",
    ],
    completionTitle: "Estimate then Measure Complete!",
    unlockMessage: "Weekly Quiz unlocked.",
    returnRoute: "/program?year=Year 3&week=2&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y3-measurement-w3-l1",
    week: 3,
    lessonNumber: 1,
    title: "Meet Grams and Kilograms",
    subtitle: "Mass Works",
    generate: generateY3MeasurelandsWeek3Lesson1Task,
    reset: resetY3MeasurelandsWeek3Lesson1TaskSessionState,
    quizContributionBuilder: buildY3MeasurelandsWeek3Lesson1QuizTasks,
    practisedSkills: [
      "Recognise grams and kilograms",
      "Choose sensible mass units",
      "Match familiar objects to g or kg",
    ],
    completionTitle: "Grams and Kilograms Complete!",
    unlockMessage: "Lesson 2 unlocked.",
    returnRoute: "/program?year=Year 3&week=3&legacy=1&realm_id=measurement",
  },
];

export function isY3MeasurelandsLessonId(lessonId: string): boolean {
  return Y3_MEASURELANDS_LESSONS.some((entry) => lessonId.startsWith(entry.prefix));
}

export function resolveY3MeasurelandsLessonTask(
  lessonId: string,
  difficulty: Difficulty,
): PracticeTask | null {
  const entry = Y3_MEASURELANDS_LESSONS.find((candidate) => lessonId.startsWith(candidate.prefix));
  return entry ? entry.generate(lessonId, difficulty) : null;
}

export function getY3MeasurelandsPractisedSkills(lessonId: string): string[] | undefined {
  return Y3_MEASURELANDS_LESSONS.find((entry) => lessonId.startsWith(entry.prefix))?.practisedSkills;
}

export type Y3MeasurelandsLessonMeta = Omit<Y3MeasurelandsLessonEntry, "generate" | "reset">;

export function getY3MeasurelandsLessonMeta(lessonId: string): Y3MeasurelandsLessonMeta | null {
  const entry = Y3_MEASURELANDS_LESSONS.find((candidate) => lessonId.startsWith(candidate.prefix));
  if (!entry) return null;
  const { generate: _generate, reset: _reset, ...meta } = entry;
  return meta;
}

export function resetY3MeasurelandsLessonSessionState() {
  Y3_MEASURELANDS_LESSONS.forEach((entry) => entry.reset());
}
