import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { YEAR4_MEASURELANDS_PROGRAM } from "@/data/programs/year4Measurelands";
import {
  buildY4MeasurelandsWeek1Lesson1QuizTasks,
  generateY4MeasurelandsWeek1Lesson1Task,
  resetY4MeasurelandsWeek1Lesson1TaskSessionState,
} from "@/data/activities/year4Measurelands/week1Lesson1";
import {
  buildY4MeasurelandsWeek1Lesson2QuizTasks,
  generateY4MeasurelandsWeek1Lesson2Task,
  resetY4MeasurelandsWeek1Lesson2TaskSessionState,
} from "@/data/activities/year4Measurelands/week1Lesson2";
import {
  buildY4MeasurelandsWeek1Lesson3QuizTasks,
  generateY4MeasurelandsWeek1Lesson3Task,
  resetY4MeasurelandsWeek1Lesson3TaskSessionState,
} from "@/data/activities/year4Measurelands/week1Lesson3";
import {
  buildY4MeasurelandsWeek2Lesson1QuizTasks,
  generateY4MeasurelandsWeek2Lesson1Task,
  resetY4MeasurelandsWeek2Lesson1TaskSessionState,
} from "@/data/activities/year4Measurelands/week2Lesson1";
import {
  buildY4MeasurelandsWeek2Lesson2QuizTasks,
  generateY4MeasurelandsWeek2Lesson2Task,
  resetY4MeasurelandsWeek2Lesson2TaskSessionState,
} from "@/data/activities/year4Measurelands/week2Lesson2";
import {
  buildY4MeasurelandsWeek2Lesson3QuizTasks,
  generateY4MeasurelandsWeek2Lesson3Task,
  resetY4MeasurelandsWeek2Lesson3TaskSessionState,
} from "@/data/activities/year4Measurelands/week2Lesson3";
import {
  buildY4MeasurelandsWeek3Lesson1QuizTasks,
  generateY4MeasurelandsWeek3Lesson1Task,
  resetY4MeasurelandsWeek3Lesson1TaskSessionState,
} from "@/data/activities/year4Measurelands/week3Lesson1";
import {
  buildY4MeasurelandsWeek3Lesson2QuizTasks,
  generateY4MeasurelandsWeek3Lesson2Task,
  resetY4MeasurelandsWeek3Lesson2TaskSessionState,
} from "@/data/activities/year4Measurelands/week3Lesson2";
import {
  buildY4MeasurelandsWeek3Lesson3QuizTasks,
  generateY4MeasurelandsWeek3Lesson3Task,
  resetY4MeasurelandsWeek3Lesson3TaskSessionState,
} from "@/data/activities/year4Measurelands/week3Lesson3";
import {
  buildY4MeasurelandsWeek4Lesson1QuizTasks,
  generateY4MeasurelandsWeek4Lesson1Task,
  resetY4MeasurelandsWeek4Lesson1TaskSessionState,
} from "@/data/activities/year4Measurelands/week4Lesson1";
import {
  buildY4MeasurelandsWeek4Lesson2QuizTasks,
  generateY4MeasurelandsWeek4Lesson2Task,
  resetY4MeasurelandsWeek4Lesson2TaskSessionState,
} from "@/data/activities/year4Measurelands/week4Lesson2";
import {
  buildY4MeasurelandsWeek4Lesson3QuizTasks,
  generateY4MeasurelandsWeek4Lesson3Task,
  resetY4MeasurelandsWeek4Lesson3TaskSessionState,
} from "@/data/activities/year4Measurelands/week4Lesson3";
import {
  buildY4MeasurelandsWeek5Lesson1QuizTasks,
  generateY4MeasurelandsWeek5Lesson1Task,
  resetY4MeasurelandsWeek5Lesson1TaskSessionState,
} from "@/data/activities/year4Measurelands/week5Lesson1";
import {
  buildY4MeasurelandsWeek5Lesson2QuizTasks,
  generateY4MeasurelandsWeek5Lesson2Task,
  resetY4MeasurelandsWeek5Lesson2TaskSessionState,
} from "@/data/activities/year4Measurelands/week5Lesson2";
import {
  buildY4MeasurelandsWeek5Lesson3QuizTasks,
  generateY4MeasurelandsWeek5Lesson3Task,
  resetY4MeasurelandsWeek5Lesson3TaskSessionState,
} from "@/data/activities/year4Measurelands/week5Lesson3";
import {
  buildY4MeasurelandsWeek6Lesson1QuizTasks,
  generateY4MeasurelandsWeek6Lesson1Task,
  resetY4MeasurelandsWeek6Lesson1TaskSessionState,
} from "@/data/activities/year4Measurelands/week6Lesson1";
import {
  buildY4MeasurelandsWeek6Lesson2QuizTasks,
  generateY4MeasurelandsWeek6Lesson2Task,
  resetY4MeasurelandsWeek6Lesson2TaskSessionState,
} from "@/data/activities/year4Measurelands/week6Lesson2";
import {
  buildY4MeasurelandsWeek6Lesson3QuizTasks,
  generateY4MeasurelandsWeek6Lesson3Task,
  resetY4MeasurelandsWeek6Lesson3TaskSessionState,
} from "@/data/activities/year4Measurelands/week6Lesson3";
import {
  buildY4MeasurelandsWeek7Lesson1QuizTasks,
  generateY4MeasurelandsWeek7Lesson1Task,
  resetY4MeasurelandsWeek7Lesson1TaskSessionState,
} from "@/data/activities/year4Measurelands/week7Lesson1";
import {
  buildY4MeasurelandsWeek7Lesson2QuizTasks,
  generateY4MeasurelandsWeek7Lesson2Task,
  resetY4MeasurelandsWeek7Lesson2TaskSessionState,
} from "@/data/activities/year4Measurelands/week7Lesson2";
import {
  buildY4MeasurelandsWeek7Lesson3QuizTasks,
  generateY4MeasurelandsWeek7Lesson3Task,
  resetY4MeasurelandsWeek7Lesson3TaskSessionState,
} from "@/data/activities/year4Measurelands/week7Lesson3";
import {
  buildY4MeasurelandsWeek8Lesson1QuizTasks,
  generateY4MeasurelandsWeek8Lesson1Task,
  resetY4MeasurelandsWeek8Lesson1TaskSessionState,
} from "@/data/activities/year4Measurelands/week8Lesson1";
import {
  buildY4MeasurelandsWeek8Lesson2QuizTasks,
  generateY4MeasurelandsWeek8Lesson2Task,
  resetY4MeasurelandsWeek8Lesson2TaskSessionState,
} from "@/data/activities/year4Measurelands/week8Lesson2";
import {
  buildY4MeasurelandsWeek8Lesson3QuizTasks,
  generateY4MeasurelandsWeek8Lesson3Task,
  resetY4MeasurelandsWeek8Lesson3TaskSessionState,
} from "@/data/activities/year4Measurelands/week8Lesson3";

// Built lessons replace their placeholder entry (real generator, no "Coming
// Soon" gate). Add a row here as each Level 4 lesson ships.
const BUILT_LESSONS: Record<
  string,
  Pick<
    Y4MeasurelandsLessonEntry,
    "generate" | "reset" | "quizContributionBuilder" | "practisedSkills" | "completionTitle" | "unlockMessage"
  >
> = {
  "y4-measurement-w1-l1": {
    generate: generateY4MeasurelandsWeek1Lesson1Task,
    reset: resetY4MeasurelandsWeek1Lesson1TaskSessionState,
    quizContributionBuilder: buildY4MeasurelandsWeek1Lesson1QuizTasks,
    practisedSkills: [
      "Read measurements between whole centimetres",
      "Read the half-centimetre mark accurately",
      "Choose the correct reading instead of rounding",
      "Check a measurement for accuracy",
    ],
    completionTitle: "Reading Between the Marks Complete!",
    unlockMessage: "Lesson 2 unlocked.",
  },
  "y4-measurement-w1-l2": {
    generate: generateY4MeasurelandsWeek1Lesson2Task,
    reset: resetY4MeasurelandsWeek1Lesson2TaskSessionState,
    quizContributionBuilder: buildY4MeasurelandsWeek1Lesson2QuizTasks,
    practisedSkills: [
      "Measure objects accurately from zero",
      "Choose the correctly aligned ruler",
      "Read to the correct graduation",
      "Check the start and finish points",
    ],
    completionTitle: "Measure Precisely Complete!",
    unlockMessage: "Lesson 3 unlocked.",
  },
  "y4-measurement-w1-l3": {
    generate: generateY4MeasurelandsWeek1Lesson3Task,
    reset: resetY4MeasurelandsWeek1Lesson3TaskSessionState,
    quizContributionBuilder: buildY4MeasurelandsWeek1Lesson3QuizTasks,
    practisedSkills: [
      "Compare measurements to find the longer object",
      "Work out how much longer",
      "Order objects by measured length",
      "Spot an inaccurate measurement",
    ],
    completionTitle: "Solve Measurement Problems Complete!",
    unlockMessage: "Weekly Quiz unlocked.",
  },
  "y4-measurement-w2-l1": {
    generate: generateY4MeasurelandsWeek2Lesson1Task,
    reset: resetY4MeasurelandsWeek2Lesson1TaskSessionState,
    quizContributionBuilder: buildY4MeasurelandsWeek2Lesson1QuizTasks,
    practisedSkills: [
      "Read analog and digital mass scales",
      "Read between the graduations (0.5 kg, 50 g)",
      "Match an object to the correct scale",
      "Check a reading for accuracy",
    ],
    completionTitle: "Read the Scale Complete!",
    unlockMessage: "Lesson 2 unlocked.",
  },
  "y4-measurement-w2-l2": {
    generate: generateY4MeasurelandsWeek2Lesson2Task,
    reset: resetY4MeasurelandsWeek2Lesson2TaskSessionState,
    quizContributionBuilder: buildY4MeasurelandsWeek2Lesson2QuizTasks,
    practisedSkills: [
      "Read a measuring jug accurately",
      "Read partial capacity graduations (0.5 L, 250 mL)",
      "Choose the jug that matches an amount",
      "Check a capacity reading for accuracy",
    ],
    completionTitle: "Read the Measuring Jug Complete!",
    unlockMessage: "Lesson 3 unlocked.",
  },
  "y4-measurement-w2-l3": {
    generate: generateY4MeasurelandsWeek2Lesson3Task,
    reset: resetY4MeasurelandsWeek2Lesson3TaskSessionState,
    quizContributionBuilder: buildY4MeasurelandsWeek2Lesson3QuizTasks,
    practisedSkills: [
      "Compare masses using scale readings",
      "Compare capacities using jug readings",
      "Work out how much heavier or how much more",
      "Use measurements, not guesses, to solve problems",
    ],
    completionTitle: "Measurement Investigations Complete!",
    unlockMessage: "Weekly Quiz unlocked.",
  },
  "y4-measurement-w3-l1": {
    generate: generateY4MeasurelandsWeek3Lesson1Task,
    reset: resetY4MeasurelandsWeek3Lesson1TaskSessionState,
    quizContributionBuilder: buildY4MeasurelandsWeek3Lesson1QuizTasks,
    practisedSkills: [
      "Read temperature in degrees Celsius",
      "Match a thermometer to a temperature",
      "Know that higher means warmer",
      "Compare hotter and colder",
    ],
    completionTitle: "Meet the Thermometer Complete!",
    unlockMessage: "Lesson 2 unlocked.",
  },
  "y4-measurement-w3-l2": {
    generate: generateY4MeasurelandsWeek3Lesson2Task,
    reset: resetY4MeasurelandsWeek3Lesson2TaskSessionState,
    quizContributionBuilder: buildY4MeasurelandsWeek3Lesson2QuizTasks,
    practisedSkills: [
      "Read a thermometer between the labelled marks",
      "Choose the correct temperature reading",
      "Check a temperature reading for accuracy",
    ],
    completionTitle: "Read the Temperature Complete!",
    unlockMessage: "Lesson 3 unlocked.",
  },
  "y4-measurement-w3-l3": {
    generate: generateY4MeasurelandsWeek3Lesson3Task,
    reset: resetY4MeasurelandsWeek3Lesson3TaskSessionState,
    quizContributionBuilder: buildY4MeasurelandsWeek3Lesson3QuizTasks,
    practisedSkills: [
      "Compare temperatures to find the warmest",
      "Order temperatures from coldest to warmest",
      "Use temperatures to solve weather problems",
    ],
    completionTitle: "Temperature Investigations Complete!",
    unlockMessage: "Weekly Quiz unlocked.",
  },
  "y4-measurement-w4-l1": {
    generate: generateY4MeasurelandsWeek4Lesson1Task,
    reset: resetY4MeasurelandsWeek4Lesson1TaskSessionState,
    quizContributionBuilder: buildY4MeasurelandsWeek4Lesson1QuizTasks,
    practisedSkills: [
      "Measure the sides of a shape accurately",
      "Measure every side without missing one",
      "Choose the correctly measured side",
    ],
    completionTitle: "Measure the Outside Complete!",
    unlockMessage: "Lesson 2 unlocked.",
  },
  "y4-measurement-w4-l2": {
    generate: generateY4MeasurelandsWeek4Lesson2Task,
    reset: resetY4MeasurelandsWeek4Lesson2TaskSessionState,
    quizContributionBuilder: buildY4MeasurelandsWeek4Lesson2QuizTasks,
    practisedSkills: [
      "Find perimeter by adding every side",
      "Choose the correct perimeter",
      "Spot a missed side in a perimeter",
    ],
    completionTitle: "Find the Perimeter Complete!",
    unlockMessage: "Lesson 3 unlocked.",
  },
  "y4-measurement-w4-l3": {
    generate: generateY4MeasurelandsWeek4Lesson3Task,
    reset: resetY4MeasurelandsWeek4Lesson3TaskSessionState,
    quizContributionBuilder: buildY4MeasurelandsWeek4Lesson3QuizTasks,
    practisedSkills: [
      "Work out how much fencing a garden needs",
      "Find the distance around a path",
      "Solve real-world perimeter problems",
    ],
    completionTitle: "Perimeter Problems Complete!",
    unlockMessage: "Weekly Quiz unlocked.",
  },
  "y4-measurement-w5-l1": {
    generate: generateY4MeasurelandsWeek5Lesson1Task,
    reset: resetY4MeasurelandsWeek5Lesson1TaskSessionState,
    quizContributionBuilder: buildY4MeasurelandsWeek5Lesson1QuizTasks,
    practisedSkills: [
      "Cover a rectangle with equal square units",
      "Count square units to measure area",
      "Recognise area as the inside space",
    ],
    completionTitle: "Measure Area Complete!",
    unlockMessage: "Lesson 2 unlocked.",
  },
  "y4-measurement-w5-l2": {
    generate: generateY4MeasurelandsWeek5Lesson2Task,
    reset: resetY4MeasurelandsWeek5Lesson2TaskSessionState,
    quizContributionBuilder: buildY4MeasurelandsWeek5Lesson2QuizTasks,
    practisedSkills: [
      "Compare areas by counting square units",
      "Order shapes by area",
      "Recognise equal areas in different shapes",
    ],
    completionTitle: "Compare Area Complete!",
    unlockMessage: "Lesson 3 unlocked.",
  },
  "y4-measurement-w5-l3": {
    generate: generateY4MeasurelandsWeek5Lesson3Task,
    reset: resetY4MeasurelandsWeek5Lesson3TaskSessionState,
    quizContributionBuilder: buildY4MeasurelandsWeek5Lesson3QuizTasks,
    practisedSkills: [
      "Use area to compare real spaces",
      "Count square tiles to cover a floor",
      "Solve real-world area problems",
    ],
    completionTitle: "Area Problems Complete!",
    unlockMessage: "Weekly Quiz unlocked.",
  },
  "y4-measurement-w6-l1": {
    generate: generateY4MeasurelandsWeek6Lesson1Task,
    reset: resetY4MeasurelandsWeek6Lesson1TaskSessionState,
    quizContributionBuilder: buildY4MeasurelandsWeek6Lesson1QuizTasks,
    practisedSkills: [
      "Match equal units of time",
      "Choose the correct time conversion",
      "Convert between seconds, minutes, hours and days",
    ],
    completionTitle: "Convert Time Complete!",
    unlockMessage: "Lesson 2 unlocked.",
  },
  "y4-measurement-w6-l2": {
    generate: generateY4MeasurelandsWeek6Lesson2Task,
    reset: resetY4MeasurelandsWeek6Lesson2TaskSessionState,
    quizContributionBuilder: buildY4MeasurelandsWeek6Lesson2QuizTasks,
    practisedSkills: [
      "Work out how long something takes",
      "Work out the finish time",
      "Use a timeline to show elapsed time",
    ],
    completionTitle: "Elapsed Time Complete!",
    unlockMessage: "Lesson 3 unlocked.",
  },
  "y4-measurement-w6-l3": {
    generate: generateY4MeasurelandsWeek6Lesson3Task,
    reset: resetY4MeasurelandsWeek6Lesson3TaskSessionState,
    quizContributionBuilder: buildY4MeasurelandsWeek6Lesson3QuizTasks,
    practisedSkills: [
      "Work out the length of a journey",
      "Compare event times and durations",
      "Order a day's events by time",
    ],
    completionTitle: "Solve Time Problems Complete!",
    unlockMessage: "Weekly Quiz unlocked.",
  },
  "y4-measurement-w7-l1": {
    generate: generateY4MeasurelandsWeek7Lesson1Task,
    reset: resetY4MeasurelandsWeek7Lesson1TaskSessionState,
    quizContributionBuilder: buildY4MeasurelandsWeek7Lesson1QuizTasks,
    practisedSkills: [
      "Recognise an angle as a measure of turn",
      "Tell an angle from a line or a ray",
      "Find angles in real objects",
    ],
    completionTitle: "Meet Angles Complete!",
    unlockMessage: "Lesson 2 unlocked.",
  },
  "y4-measurement-w7-l2": {
    generate: generateY4MeasurelandsWeek7Lesson2Task,
    reset: resetY4MeasurelandsWeek7Lesson2TaskSessionState,
    quizContributionBuilder: buildY4MeasurelandsWeek7Lesson2QuizTasks,
    practisedSkills: [
      "Compare an angle to a right angle",
      "Order angles by size",
      "Name acute, right, obtuse, straight and reflex angles",
    ],
    completionTitle: "Compare Angles Complete!",
    unlockMessage: "Lesson 3 unlocked.",
  },
  "y4-measurement-w7-l3": {
    generate: generateY4MeasurelandsWeek7Lesson3Task,
    reset: resetY4MeasurelandsWeek7Lesson3TaskSessionState,
    quizContributionBuilder: buildY4MeasurelandsWeek7Lesson3QuizTasks,
    practisedSkills: [
      "Find right angles",
      "Classify angles in everyday objects",
      "Compare and sort angles",
    ],
    completionTitle: "Angle Explorer Complete!",
    unlockMessage: "Weekly Quiz unlocked.",
  },
  "y4-measurement-w8-l1": {
    generate: generateY4MeasurelandsWeek8Lesson1Task,
    reset: resetY4MeasurelandsWeek8Lesson1TaskSessionState,
    quizContributionBuilder: buildY4MeasurelandsWeek8Lesson1QuizTasks,
    practisedSkills: [
      "Choose the correct measuring tool for the job",
      "Decide what to measure before starting",
      "Use perimeter to work out fencing",
      "Use area to work out grass or turf",
    ],
    completionTitle: "Design the Park Complete!",
    unlockMessage: "Lesson 2 unlocked.",
  },
  "y4-measurement-w8-l2": {
    generate: generateY4MeasurelandsWeek8Lesson2Task,
    reset: resetY4MeasurelandsWeek8Lesson2TaskSessionState,
    quizContributionBuilder: buildY4MeasurelandsWeek8Lesson2QuizTasks,
    practisedSkills: [
      "Read a scale, a jug and a thermometer",
      "Compare measurements to make a decision",
      "Use the right instrument for each measurement",
      "Solve a science investigation",
    ],
    completionTitle: "Science Investigation Complete!",
    unlockMessage: "Lesson 3 unlocked.",
  },
  "y4-measurement-w8-l3": {
    generate: generateY4MeasurelandsWeek8Lesson3Task,
    reset: resetY4MeasurelandsWeek8Lesson3TaskSessionState,
    quizContributionBuilder: buildY4MeasurelandsWeek8Lesson3QuizTasks,
    practisedSkills: [
      "Combine two or more measurement skills in one problem",
      "Choose the right measurement for real-world situations",
      "Solve authentic mixed measurement missions",
      "Explain which measurement a problem needs",
    ],
    completionTitle: "Master Surveyor Mission Complete!",
    unlockMessage: "Level 4 Post-Test unlocked.",
  },
};

// Measurelands Level 4 (Year 4) — registry SHELL.
//
// PLUMBING ONLY. This mirrors the Level 3 registry
// (data/activities/year3Measurelands/registry.ts) so the lesson, session and
// program pipelines resolve Level 4 Measurelands lessons under
// realm_id=measurement WITHOUT ever falling back to Number Nexus. Every entry
// currently uses a shared "coming soon" placeholder generator; each will be
// swapped for a real week/lesson generator as the Level 4 curriculum is built.
//
// Lesson id pattern: y4-measurement-w{week}-l{lesson}.

type Y4MeasurelandsLessonEntry = {
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
  /**
   * True while this lesson is an unbuilt scaffold. Placeholder lessons render a
   * "Coming Soon" screen instead of a runnable practice — no XP, no save, no
   * completion, no unlocks, no teacher data, no quiz progression. Set to false
   * (or omit) once a real generator replaces the placeholder.
   */
  placeholder?: boolean;
};

// Shared placeholder task — renders a clear "not built yet" Measurelands scene
// (never a Number Nexus fallback). Real generators replace this per lesson.
function getPlannedWeek(week: number) {
  return YEAR4_MEASURELANDS_PROGRAM.find((candidate) => candidate.week === week);
}

function getPlannedLesson(week: number, lessonNumber: number) {
  return getPlannedWeek(week)?.lessons.find((candidate) => candidate.lesson === lessonNumber);
}

function buildPlaceholderTask(lessonId: string, week: number, lessonNumber: number): PracticeTask {
  const plannedWeek = getPlannedWeek(week);
  const plannedLesson = getPlannedLesson(week, lessonNumber);
  const lessonTitle = plannedLesson?.title ?? `Week ${week} Lesson ${lessonNumber}`;
  const weekTopic = plannedWeek?.topic ?? `Week ${week}`;

  return {
    kind: "measurementCompare",
    scene: "intro",
    prompt: `${lessonTitle} is coming soon.`,
    speakText:
      `${lessonTitle} is being built for Measurelands Level 4.`,
    badgeLabel: "Measurelands · Level 4",
    introIcon: "🧭",
    introBody: [
      `${weekTopic}: ${lessonTitle}.`,
      plannedLesson?.focus ?? "Level 4 measurement content is coming soon.",
      "This lesson stays in Measurelands — it will not fall back to Number Nexus.",
    ],
    objects: [],
    correctOptionId: "continue",
    feedback: { correct: "Back to week.", wrong: "Back to week." },
  } as PracticeTask;
}

function makePlaceholderEntry(week: number, lessonNumber: number): Y4MeasurelandsLessonEntry {
  const isLastLessonOfWeek = lessonNumber === 3;
  const isLastWeek = week === 8;
  const plannedWeek = getPlannedWeek(week);
  const plannedLesson = getPlannedLesson(week, lessonNumber);
  const title = plannedLesson?.title ?? `Lesson ${lessonNumber}`;
  const subtitle = plannedWeek?.topic ?? `Level 4 — Week ${week}`;

  return {
    prefix: `y4-measurement-w${week}-l${lessonNumber}`,
    week,
    lessonNumber,
    title,
    subtitle,
    generate: (lessonId) => buildPlaceholderTask(lessonId, week, lessonNumber),
    reset: () => {},
    quizContributionBuilder: () => [],
    practisedSkills: plannedLesson?.activityIdeas,
    placeholder: true,
    completionTitle: `${title} Complete!`,
    unlockMessage: !isLastLessonOfWeek
      ? `Lesson ${lessonNumber + 1} unlocked.`
      : isLastWeek
        ? "Level 4 Post-Test unlocked."
        : "Weekly Quiz unlocked.",
    returnRoute: `/program?year=Year 4&week=${week}&legacy=1&realm_id=measurement`,
  };
}

const Y4_MEASURELANDS_LESSONS: Y4MeasurelandsLessonEntry[] = [];
for (let week = 1; week <= 8; week += 1) {
  for (let lessonNumber = 1; lessonNumber <= 3; lessonNumber += 1) {
    const entry = makePlaceholderEntry(week, lessonNumber);
    const built = BUILT_LESSONS[entry.prefix];
    Y4_MEASURELANDS_LESSONS.push(built ? { ...entry, ...built, placeholder: false } : entry);
  }
}

export function isY4MeasurelandsLessonId(lessonId: string): boolean {
  return Y4_MEASURELANDS_LESSONS.some((entry) => lessonId.startsWith(entry.prefix));
}

/** True when the resolved Level 4 lesson is still an unbuilt placeholder. */
export function isY4MeasurelandsPlaceholderLesson(lessonId: string): boolean {
  const entry = Y4_MEASURELANDS_LESSONS.find((candidate) => lessonId.startsWith(candidate.prefix));
  return entry?.placeholder === true;
}

export function resolveY4MeasurelandsLessonTask(
  lessonId: string,
  difficulty: Difficulty,
): PracticeTask | null {
  const entry = Y4_MEASURELANDS_LESSONS.find((candidate) => lessonId.startsWith(candidate.prefix));
  return entry ? entry.generate(lessonId, difficulty) : null;
}

export function getY4MeasurelandsPractisedSkills(lessonId: string): string[] | undefined {
  return Y4_MEASURELANDS_LESSONS.find((entry) => lessonId.startsWith(entry.prefix))?.practisedSkills;
}

export function getY4MeasurelandsLessonQuizContribution(lessonId: string): PracticeTask[] {
  const entry = Y4_MEASURELANDS_LESSONS.find((candidate) => lessonId.startsWith(candidate.prefix));
  return entry?.quizContributionBuilder?.() ?? [];
}

export type Y4MeasurelandsLessonMeta = Omit<Y4MeasurelandsLessonEntry, "generate" | "reset">;

export function getY4MeasurelandsLessonMeta(lessonId: string): Y4MeasurelandsLessonMeta | null {
  const entry = Y4_MEASURELANDS_LESSONS.find((candidate) => lessonId.startsWith(candidate.prefix));
  if (!entry) return null;
  const { generate: _generate, reset: _reset, ...meta } = entry;
  return meta;
}

export function resetY4MeasurelandsLessonSessionState() {
  Y4_MEASURELANDS_LESSONS.forEach((entry) => entry.reset());
}
