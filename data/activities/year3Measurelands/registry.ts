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
