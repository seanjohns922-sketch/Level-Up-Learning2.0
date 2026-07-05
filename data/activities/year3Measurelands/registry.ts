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
import {
  buildY3MeasurelandsWeek3Lesson2QuizTasks,
  generateY3MeasurelandsWeek3Lesson2Task,
  resetY3MeasurelandsWeek3Lesson2TaskSessionState,
} from "@/data/activities/year3Measurelands/week3Lesson2";
import {
  buildY3MeasurelandsWeek3Lesson3QuizTasks,
  generateY3MeasurelandsWeek3Lesson3Task,
  resetY3MeasurelandsWeek3Lesson3TaskSessionState,
} from "@/data/activities/year3Measurelands/week3Lesson3";
import {
  buildY3MeasurelandsWeek4Lesson1QuizTasks,
  generateY3MeasurelandsWeek4Lesson1Task,
  resetY3MeasurelandsWeek4Lesson1TaskSessionState,
} from "@/data/activities/year3Measurelands/week4Lesson1";
import {
  buildY3MeasurelandsWeek4Lesson2QuizTasks,
  generateY3MeasurelandsWeek4Lesson2Task,
  resetY3MeasurelandsWeek4Lesson2TaskSessionState,
} from "@/data/activities/year3Measurelands/week4Lesson2";
import {
  buildY3MeasurelandsWeek4Lesson3QuizTasks,
  generateY3MeasurelandsWeek4Lesson3Task,
  resetY3MeasurelandsWeek4Lesson3TaskSessionState,
} from "@/data/activities/year3Measurelands/week4Lesson3";
import {
  buildY3MeasurelandsWeek5Lesson1QuizTasks,
  generateY3MeasurelandsWeek5Lesson1Task,
  resetY3MeasurelandsWeek5Lesson1TaskSessionState,
} from "@/data/activities/year3Measurelands/week5Lesson1";
import {
  buildY3MeasurelandsWeek5Lesson2QuizTasks,
  generateY3MeasurelandsWeek5Lesson2Task,
  resetY3MeasurelandsWeek5Lesson2TaskSessionState,
} from "@/data/activities/year3Measurelands/week5Lesson2";
import {
  buildY3MeasurelandsWeek5Lesson3QuizTasks,
  generateY3MeasurelandsWeek5Lesson3Task,
  resetY3MeasurelandsWeek5Lesson3TaskSessionState,
} from "@/data/activities/year3Measurelands/week5Lesson3";
import {
  buildY3MeasurelandsWeek6Lesson1QuizTasks,
  generateY3MeasurelandsWeek6Lesson1Task,
  resetY3MeasurelandsWeek6Lesson1TaskSessionState,
} from "@/data/activities/year3Measurelands/week6Lesson1";
import {
  buildY3MeasurelandsWeek6Lesson2QuizTasks,
  generateY3MeasurelandsWeek6Lesson2Task,
  resetY3MeasurelandsWeek6Lesson2TaskSessionState,
} from "@/data/activities/year3Measurelands/week6Lesson2";
import {
  buildY3MeasurelandsWeek6Lesson3QuizTasks,
  generateY3MeasurelandsWeek6Lesson3Task,
  resetY3MeasurelandsWeek6Lesson3TaskSessionState,
} from "@/data/activities/year3Measurelands/week6Lesson3";
import {
  buildY3MeasurelandsWeek7Lesson1QuizTasks,
  generateY3MeasurelandsWeek7Lesson1Task,
  resetY3MeasurelandsWeek7Lesson1TaskSessionState,
} from "@/data/activities/year3Measurelands/week7Lesson1";
import {
  buildY3MeasurelandsWeek7Lesson2QuizTasks,
  generateY3MeasurelandsWeek7Lesson2Task,
  resetY3MeasurelandsWeek7Lesson2TaskSessionState,
} from "@/data/activities/year3Measurelands/week7Lesson2";
import {
  buildY3MeasurelandsWeek7Lesson3QuizTasks,
  generateY3MeasurelandsWeek7Lesson3Task,
  resetY3MeasurelandsWeek7Lesson3TaskSessionState,
} from "@/data/activities/year3Measurelands/week7Lesson3";
import {
  buildY3MeasurelandsWeek8Lesson1QuizTasks,
  generateY3MeasurelandsWeek8Lesson1Task,
  resetY3MeasurelandsWeek8Lesson1TaskSessionState,
} from "@/data/activities/year3Measurelands/week8Lesson1";
import {
  buildY3MeasurelandsWeek8Lesson2QuizTasks,
  generateY3MeasurelandsWeek8Lesson2Task,
  resetY3MeasurelandsWeek8Lesson2TaskSessionState,
} from "@/data/activities/year3Measurelands/week8Lesson2";
import {
  buildY3MeasurelandsWeek8Lesson3QuizTasks,
  generateY3MeasurelandsWeek8Lesson3Task,
  resetY3MeasurelandsWeek8Lesson3TaskSessionState,
} from "@/data/activities/year3Measurelands/week8Lesson3";

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
      "Choose sensible formal mass units",
      "Identify unrealistic mass statements",
    ],
    completionTitle: "Grams and Kilograms Complete!",
    unlockMessage: "Lesson 2 unlocked.",
    returnRoute: "/program?year=Year 3&week=3&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y3-measurement-w3-l2",
    week: 3,
    lessonNumber: 2,
    title: "Read the Scale",
    subtitle: "Mass Works",
    generate: generateY3MeasurelandsWeek3Lesson2Task,
    reset: resetY3MeasurelandsWeek3Lesson2TaskSessionState,
    quizContributionBuilder: buildY3MeasurelandsWeek3Lesson2QuizTasks,
    practisedSkills: [
      "Read gram and kilogram scales",
      "Match an object to a scale reading",
      "Choose realistic mass measurements",
    ],
    completionTitle: "Read the Scale Complete!",
    unlockMessage: "Lesson 3 unlocked.",
    returnRoute: "/program?year=Year 3&week=3&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y3-measurement-w3-l3",
    week: 3,
    lessonNumber: 3,
    title: "Compare Mass",
    subtitle: "Mass Works",
    generate: generateY3MeasurelandsWeek3Lesson3Task,
    reset: resetY3MeasurelandsWeek3Lesson3TaskSessionState,
    quizContributionBuilder: buildY3MeasurelandsWeek3Lesson3QuizTasks,
    practisedSkills: [
      "Compare measured masses",
      "Order masses from lightest to heaviest",
      "Find how much heavier an object is",
    ],
    completionTitle: "Compare Mass Complete!",
    unlockMessage: "Weekly Quiz unlocked.",
    returnRoute: "/program?year=Year 3&week=3&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y3-measurement-w4-l1",
    week: 4,
    lessonNumber: 1,
    title: "Meet mL and L",
    subtitle: "Capacity Lab",
    generate: generateY3MeasurelandsWeek4Lesson1Task,
    reset: resetY3MeasurelandsWeek4Lesson1TaskSessionState,
    quizContributionBuilder: buildY3MeasurelandsWeek4Lesson1QuizTasks,
    practisedSkills: ["Recognise millilitres and litres", "Choose mL or L", "Spot an unrealistic capacity"],
    completionTitle: "Meet mL and L Complete!",
    unlockMessage: "Lesson 2 unlocked.",
    returnRoute: "/program?year=Year 3&week=4&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y3-measurement-w4-l2",
    week: 4,
    lessonNumber: 2,
    title: "Read the Jug",
    subtitle: "Capacity Lab",
    generate: generateY3MeasurelandsWeek4Lesson2Task,
    reset: resetY3MeasurelandsWeek4Lesson2TaskSessionState,
    quizContributionBuilder: buildY3MeasurelandsWeek4Lesson2QuizTasks,
    practisedSkills: ["Read a measuring jug", "Match a jug to an amount", "Choose a realistic capacity"],
    completionTitle: "Read the Jug Complete!",
    unlockMessage: "Lesson 3 unlocked.",
    returnRoute: "/program?year=Year 3&week=4&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y3-measurement-w4-l3",
    week: 4,
    lessonNumber: 3,
    title: "Compare Capacity",
    subtitle: "Capacity Lab",
    generate: generateY3MeasurelandsWeek4Lesson3Task,
    reset: resetY3MeasurelandsWeek4Lesson3TaskSessionState,
    quizContributionBuilder: buildY3MeasurelandsWeek4Lesson3QuizTasks,
    practisedSkills: ["Compare capacities", "Order by capacity", "Find how much more"],
    completionTitle: "Compare Capacity Complete!",
    unlockMessage: "Weekly Quiz unlocked.",
    returnRoute: "/program?year=Year 3&week=4&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y3-measurement-w5-l1",
    week: 5,
    lessonNumber: 1,
    title: "Minutes and Seconds",
    subtitle: "Time Trails",
    generate: generateY3MeasurelandsWeek5Lesson1Task,
    reset: resetY3MeasurelandsWeek5Lesson1TaskSessionState,
    quizContributionBuilder: buildY3MeasurelandsWeek5Lesson1QuizTasks,
    practisedSkills: ["Recognise seconds, minutes and hours", "Sort activities by duration unit", "Spot an unrealistic duration"],
    completionTitle: "Minutes and Seconds Complete!",
    unlockMessage: "Lesson 2 unlocked.",
    returnRoute: "/program?year=Year 3&week=5&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y3-measurement-w5-l2",
    week: 5,
    lessonNumber: 2,
    title: "Estimate a Duration",
    subtitle: "Time Trails",
    generate: generateY3MeasurelandsWeek5Lesson2Task,
    reset: resetY3MeasurelandsWeek5Lesson2TaskSessionState,
    quizContributionBuilder: buildY3MeasurelandsWeek5Lesson2QuizTasks,
    practisedSkills: ["Estimate how long an activity takes", "Choose the best estimate", "Reason from time benchmarks"],
    completionTitle: "Estimate a Duration Complete!",
    unlockMessage: "Lesson 3 unlocked.",
    returnRoute: "/program?year=Year 3&week=5&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y3-measurement-w5-l3",
    week: 5,
    lessonNumber: 3,
    title: "Compare Duration",
    subtitle: "Time Trails",
    generate: generateY3MeasurelandsWeek5Lesson3Task,
    reset: resetY3MeasurelandsWeek5Lesson3TaskSessionState,
    quizContributionBuilder: buildY3MeasurelandsWeek5Lesson3QuizTasks,
    practisedSkills: ["Compare how long activities take", "Order activities by duration", "Find how much longer"],
    completionTitle: "Compare Duration Complete!",
    unlockMessage: "Weekly Quiz unlocked.",
    returnRoute: "/program?year=Year 3&week=5&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y3-measurement-w6-l1",
    week: 6,
    lessonNumber: 1,
    title: "Five-Minute Time",
    subtitle: "Minute Clockworks",
    generate: generateY3MeasurelandsWeek6Lesson1Task,
    reset: resetY3MeasurelandsWeek6Lesson1TaskSessionState,
    quizContributionBuilder: buildY3MeasurelandsWeek6Lesson1QuizTasks,
    practisedSkills: ["Read clocks in five-minute steps", "Match a time to the right clock", "Build a five-minute time"],
    completionTitle: "Five-Minute Time Complete!",
    unlockMessage: "Lesson 2 unlocked.",
    returnRoute: "/program?year=Year 3&week=6&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y3-measurement-w6-l2",
    week: 6,
    lessonNumber: 2,
    title: "Read to the Minute",
    subtitle: "Minute Clockworks",
    generate: generateY3MeasurelandsWeek6Lesson2Task,
    reset: resetY3MeasurelandsWeek6Lesson2TaskSessionState,
    quizContributionBuilder: buildY3MeasurelandsWeek6Lesson2QuizTasks,
    practisedSkills: ["Read clocks to the nearest minute", "Match analog and digital time", "Spot an incorrect reading"],
    completionTitle: "Read to the Minute Complete!",
    unlockMessage: "Lesson 3 unlocked.",
    returnRoute: "/program?year=Year 3&week=6&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y3-measurement-w6-l3",
    week: 6,
    lessonNumber: 3,
    title: "Build Any Time",
    subtitle: "Minute Clockworks",
    generate: generateY3MeasurelandsWeek6Lesson3Task,
    reset: resetY3MeasurelandsWeek6Lesson3TaskSessionState,
    quizContributionBuilder: buildY3MeasurelandsWeek6Lesson3QuizTasks,
    practisedSkills: ["Build any time on a clock", "Match analog and digital time", "Read to the nearest minute"],
    completionTitle: "Build Any Time Complete!",
    unlockMessage: "Weekly Quiz unlocked.",
    returnRoute: "/program?year=Year 3&week=6&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y3-measurement-w7-l1",
    week: 7,
    lessonNumber: 1,
    title: "Around the Edge",
    subtitle: "Perimeter",
    generate: generateY3MeasurelandsWeek7Lesson1Task,
    reset: resetY3MeasurelandsWeek7Lesson1TaskSessionState,
    quizContributionBuilder: buildY3MeasurelandsWeek7Lesson1QuizTasks,
    practisedSkills: ["Recognise the perimeter", "Walk around the outside", "Find a missing edge"],
    completionTitle: "Around the Edge Complete!",
    unlockMessage: "Lesson 2 unlocked.",
    returnRoute: "/program?year=Year 3&week=7&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y3-measurement-w7-l2",
    week: 7,
    lessonNumber: 2,
    title: "Trace the Boundary",
    subtitle: "Perimeter",
    generate: generateY3MeasurelandsWeek7Lesson2Task,
    reset: resetY3MeasurelandsWeek7Lesson2TaskSessionState,
    quizContributionBuilder: buildY3MeasurelandsWeek7Lesson2QuizTasks,
    practisedSkills: ["Trace a complete perimeter", "Find the missing side", "Stay on the outside"],
    completionTitle: "Trace the Boundary Complete!",
    unlockMessage: "Lesson 3 unlocked.",
    returnRoute: "/program?year=Year 3&week=7&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y3-measurement-w7-l3",
    week: 7,
    lessonNumber: 3,
    title: "Explore Perimeter",
    subtitle: "Perimeter",
    generate: generateY3MeasurelandsWeek7Lesson3Task,
    reset: resetY3MeasurelandsWeek7Lesson3TaskSessionState,
    quizContributionBuilder: buildY3MeasurelandsWeek7Lesson3QuizTasks,
    practisedSkills: ["Compare perimeters", "Recognise perimeter in real life", "Trace around objects"],
    completionTitle: "Explore Perimeter Complete!",
    unlockMessage: "Weekly Quiz unlocked.",
    returnRoute: "/program?year=Year 3&week=7&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y3-measurement-w8-l1",
    week: 8,
    lessonNumber: 1,
    title: "Cover the Space",
    subtitle: "Area",
    generate: generateY3MeasurelandsWeek8Lesson1Task,
    reset: resetY3MeasurelandsWeek8Lesson1TaskSessionState,
    quizContributionBuilder: buildY3MeasurelandsWeek8Lesson1QuizTasks,
    practisedSkills: ["Recognise area as the inside space", "Cover a shape with tiles", "Count square units"],
    completionTitle: "Cover the Space Complete!",
    unlockMessage: "Lesson 2 unlocked.",
    returnRoute: "/program?year=Year 3&week=8&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y3-measurement-w8-l2",
    week: 8,
    lessonNumber: 2,
    title: "Count the Squares",
    subtitle: "Area",
    generate: generateY3MeasurelandsWeek8Lesson2Task,
    reset: resetY3MeasurelandsWeek8Lesson2TaskSessionState,
    quizContributionBuilder: buildY3MeasurelandsWeek8Lesson2QuizTasks,
    practisedSkills: ["Count square units", "Compare areas", "Order shapes by area"],
    completionTitle: "Count the Squares Complete!",
    unlockMessage: "Lesson 3 unlocked.",
    returnRoute: "/program?year=Year 3&week=8&legacy=1&realm_id=measurement",
  },
  {
    prefix: "y3-measurement-w8-l3",
    week: 8,
    lessonNumber: 3,
    title: "Build the Area",
    subtitle: "Area",
    generate: generateY3MeasurelandsWeek8Lesson3Task,
    reset: resetY3MeasurelandsWeek8Lesson3TaskSessionState,
    quizContributionBuilder: buildY3MeasurelandsWeek8Lesson3QuizTasks,
    practisedSkills: ["Build a given area", "Make same area, different shape", "Cover shapes with tiles"],
    completionTitle: "Build the Area Complete!",
    unlockMessage: "Level 3 Post-Test unlocked.",
    returnRoute: "/program?year=Year 3&week=8&legacy=1&realm_id=measurement",
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
