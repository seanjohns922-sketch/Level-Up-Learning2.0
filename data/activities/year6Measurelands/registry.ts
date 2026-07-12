import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { YEAR6_MEASURELANDS_PROGRAM } from "@/data/programs/year6Measurelands";
import { generateY6MeasurelandsWeek1Lesson1Task, resetY6MeasurelandsWeek1Lesson1TaskSessionState, buildY6MeasurelandsWeek1Lesson1QuizTasks } from "@/data/activities/year6Measurelands/week1Lesson1";
import { generateY6MeasurelandsWeek1Lesson2Task, resetY6MeasurelandsWeek1Lesson2TaskSessionState, buildY6MeasurelandsWeek1Lesson2QuizTasks } from "@/data/activities/year6Measurelands/week1Lesson2";
import { generateY6MeasurelandsWeek1Lesson3Task, resetY6MeasurelandsWeek1Lesson3TaskSessionState, buildY6MeasurelandsWeek1Lesson3QuizTasks } from "@/data/activities/year6Measurelands/week1Lesson3";
import { generateY6MeasurelandsWeek2Lesson1Task, resetY6MeasurelandsWeek2Lesson1TaskSessionState, buildY6MeasurelandsWeek2Lesson1QuizTasks } from "@/data/activities/year6Measurelands/week2Lesson1";
import { generateY6MeasurelandsWeek2Lesson2Task, resetY6MeasurelandsWeek2Lesson2TaskSessionState, buildY6MeasurelandsWeek2Lesson2QuizTasks } from "@/data/activities/year6Measurelands/week2Lesson2";
import { generateY6MeasurelandsWeek2Lesson3Task, resetY6MeasurelandsWeek2Lesson3TaskSessionState, buildY6MeasurelandsWeek2Lesson3QuizTasks } from "@/data/activities/year6Measurelands/week2Lesson3";
import { generateY6MeasurelandsWeek3Lesson1Task, resetY6MeasurelandsWeek3Lesson1TaskSessionState, buildY6MeasurelandsWeek3Lesson1QuizTasks } from "@/data/activities/year6Measurelands/week3Lesson1";
import { generateY6MeasurelandsWeek3Lesson2Task, resetY6MeasurelandsWeek3Lesson2TaskSessionState, buildY6MeasurelandsWeek3Lesson2QuizTasks } from "@/data/activities/year6Measurelands/week3Lesson2";
import { generateY6MeasurelandsWeek3Lesson3Task, resetY6MeasurelandsWeek3Lesson3TaskSessionState, buildY6MeasurelandsWeek3Lesson3QuizTasks } from "@/data/activities/year6Measurelands/week3Lesson3";
import { generateY6MeasurelandsWeek4Lesson1Task, resetY6MeasurelandsWeek4Lesson1TaskSessionState, buildY6MeasurelandsWeek4Lesson1QuizTasks } from "@/data/activities/year6Measurelands/week4Lesson1";
import { generateY6MeasurelandsWeek4Lesson2Task, resetY6MeasurelandsWeek4Lesson2TaskSessionState, buildY6MeasurelandsWeek4Lesson2QuizTasks } from "@/data/activities/year6Measurelands/week4Lesson2";
import { generateY6MeasurelandsWeek4Lesson3Task, resetY6MeasurelandsWeek4Lesson3TaskSessionState, buildY6MeasurelandsWeek4Lesson3QuizTasks } from "@/data/activities/year6Measurelands/week4Lesson3";

// Measurelands Level 6 (Year 6) — placeholder registry only.
//
// Every placeholder resolves in realm_id=measurement but remains non-runnable
// via app/lesson/page.tsx: no XP, completion, unlock, attempt save or quiz
// progress is recorded until real lesson generators replace these entries.

type Y6MeasurelandsLessonEntry = {
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
  placeholder?: boolean;
};

function getPlannedWeek(week: number) {
  return YEAR6_MEASURELANDS_PROGRAM.find((candidate) => candidate.week === week);
}

function getPlannedLesson(week: number, lessonNumber: number) {
  return getPlannedWeek(week)?.lessons.find((candidate) => candidate.lesson === lessonNumber);
}

function buildPlaceholderTask(_lessonId: string, week: number, lessonNumber: number): PracticeTask {
  const plannedWeek = getPlannedWeek(week);
  const plannedLesson = getPlannedLesson(week, lessonNumber);
  const lessonTitle = plannedLesson?.title ?? `Week ${week} Lesson ${lessonNumber}`;
  const weekTopic = plannedWeek?.topic ?? `Week ${week}`;

  return {
    kind: "measurementCompare",
    scene: "intro",
    prompt: `${lessonTitle} is coming soon.`,
    speakText: `${lessonTitle} is being built for Measurelands Level 6.`,
    badgeLabel: "Measurelands · Level 6",
    introIcon: "⏳",
    introBody: [
      `${weekTopic}: ${lessonTitle}.`,
      plannedLesson?.focus ?? "Level 6 measurement content is coming soon.",
      "This lesson stays in Measurelands — it will not fall back to Number Nexus.",
    ],
    objects: [],
    correctOptionId: "continue",
    feedback: { correct: "Back to week.", wrong: "Back to week." },
  } as PracticeTask;
}

function makePlaceholderEntry(week: number, lessonNumber: number): Y6MeasurelandsLessonEntry {
  const isLastLessonOfWeek = lessonNumber === 3;
  const isLastWeek = week === 8;
  const plannedWeek = getPlannedWeek(week);
  const plannedLesson = getPlannedLesson(week, lessonNumber);
  const title = plannedLesson?.title ?? `Lesson ${lessonNumber}`;
  const subtitle = plannedWeek?.topic ?? `Level 6 — Week ${week}`;

  return {
    prefix: `y6-measurement-w${week}-l${lessonNumber}`,
    week,
    lessonNumber,
    title,
    subtitle,
    generate: (lessonId, difficulty) => buildPlaceholderTask(lessonId, week, lessonNumber),
    reset: () => {},
    quizContributionBuilder: () => [],
    practisedSkills: plannedLesson?.activityIdeas,
    placeholder: true,
    completionTitle: `${title} Complete!`,
    unlockMessage: !isLastLessonOfWeek
      ? `Lesson ${lessonNumber + 1} unlocked.`
      : isLastWeek
        ? "Level 6 Post-Test unlocked."
        : "Weekly Quiz unlocked.",
    returnRoute: `/program?year=Year 6&week=${week}&legacy=1&realm_id=measurement`,
  };
}

// Real, runnable lessons override the placeholders (placeholder: false → records
// XP, completion, unlock, attempts and quiz progress in realm_id=measurement).
type BuiltOverride = Partial<Y6MeasurelandsLessonEntry> &
  Pick<Y6MeasurelandsLessonEntry, "generate" | "reset" | "quizContributionBuilder" | "practisedSkills" | "completionTitle">;

const BUILT_LESSONS: Record<string, BuiltOverride> = {
  "y6-measurement-w1-l1": {
    generate: generateY6MeasurelandsWeek1Lesson1Task,
    reset: resetY6MeasurelandsWeek1Lesson1TaskSessionState,
    quizContributionBuilder: buildY6MeasurelandsWeek1Lesson1QuizTasks,
    practisedSkills: ["Recognise rows and columns", "Predict rows × columns", "Discover Area = length × width"],
    completionTitle: "Discover the Formula Complete!",
  },
  "y6-measurement-w1-l2": {
    generate: generateY6MeasurelandsWeek1Lesson2Task,
    reset: resetY6MeasurelandsWeek1Lesson2TaskSessionState,
    quizContributionBuilder: buildY6MeasurelandsWeek1Lesson2QuizTasks,
    practisedSkills: ["Identify length and width", "Use Area = length × width", "Tell area apart from perimeter"],
    completionTitle: "Calculate Area Complete!",
  },
  "y6-measurement-w1-l3": {
    generate: generateY6MeasurelandsWeek1Lesson3Task,
    reset: resetY6MeasurelandsWeek1Lesson3TaskSessionState,
    quizContributionBuilder: buildY6MeasurelandsWeek1Lesson3QuizTasks,
    practisedSkills: ["Choose the correct dimensions", "Calculate area in m²", "Solve practical area problems"],
    completionTitle: "Area Investigations Complete!",
  },
  "y6-measurement-w2-l1": {
    generate: generateY6MeasurelandsWeek2Lesson1Task,
    reset: resetY6MeasurelandsWeek2Lesson1TaskSessionState,
    quizContributionBuilder: buildY6MeasurelandsWeek2Lesson1QuizTasks,
    practisedSkills: ["Recognise rectangles inside a shape", "Split shapes sensibly", "Reject splits that leave non-rectangles"],
    completionTitle: "Break the Shape Complete!",
  },
  "y6-measurement-w2-l2": {
    generate: generateY6MeasurelandsWeek2Lesson2Task,
    reset: resetY6MeasurelandsWeek2Lesson2TaskSessionState,
    quizContributionBuilder: buildY6MeasurelandsWeek2Lesson2QuizTasks,
    practisedSkills: ["Calculate each rectangle's area", "Add the areas for the total", "Measure every part exactly once"],
    completionTitle: "Calculate Composite Area Complete!",
  },
  "y6-measurement-w2-l3": {
    generate: generateY6MeasurelandsWeek2Lesson3Task,
    reset: resetY6MeasurelandsWeek2Lesson3TaskSessionState,
    quizContributionBuilder: buildY6MeasurelandsWeek2Lesson3QuizTasks,
    practisedSkills: ["Choose a split strategy", "Split a real space into rectangles", "Solve practical composite-area problems"],
    completionTitle: "Architect Challenges Complete!",
  },
  "y6-measurement-w3-l1": {
    generate: generateY6MeasurelandsWeek3Lesson1Task,
    reset: resetY6MeasurelandsWeek3Lesson1TaskSessionState,
    quizContributionBuilder: buildY6MeasurelandsWeek3Lesson1QuizTasks,
    practisedSkills: ["Recognise cubic units", "Build 3D prisms cube by cube", "Count cubes including hidden ones"],
    completionTitle: "Build Volume Complete!",
  },
  "y6-measurement-w3-l2": {
    generate: generateY6MeasurelandsWeek3Lesson2Task,
    reset: resetY6MeasurelandsWeek3Lesson2TaskSessionState,
    quizContributionBuilder: buildY6MeasurelandsWeek3Lesson2QuizTasks,
    practisedSkills: ["Identify layers", "Count cubes per layer", "Find volume as cubes-per-layer × layers"],
    completionTitle: "Count the Layers Complete!",
  },
  "y6-measurement-w3-l3": {
    generate: generateY6MeasurelandsWeek3Lesson3Task,
    reset: resetY6MeasurelandsWeek3Lesson3TaskSessionState,
    quizContributionBuilder: buildY6MeasurelandsWeek3Lesson3QuizTasks,
    practisedSkills: ["Compare volumes", "Solve packing problems", "Connect volume and capacity (cm³ = mL)"],
    completionTitle: "Volume Problems Complete!",
  },
  "y6-measurement-w4-l1": {
    generate: generateY6MeasurelandsWeek4Lesson1Task,
    reset: resetY6MeasurelandsWeek4Lesson1TaskSessionState,
    quizContributionBuilder: buildY6MeasurelandsWeek4Lesson1QuizTasks,
    practisedSkills: ["Read a tape measure in cm", "Convert length (cm↔m)", "Set a target length by converting"],
    completionTitle: "Length Lab Complete!",
  },
  "y6-measurement-w4-l2": {
    generate: generateY6MeasurelandsWeek4Lesson2Task,
    reset: resetY6MeasurelandsWeek4Lesson2TaskSessionState,
    quizContributionBuilder: buildY6MeasurelandsWeek4Lesson2QuizTasks,
    practisedSkills: ["Convert mass on a scale (g↔kg)", "Convert capacity on a jug (mL↔L)", "Compare measures across units"],
    completionTitle: "Mass & Capacity Lab Complete!",
  },
  "y6-measurement-w4-l3": {
    generate: generateY6MeasurelandsWeek4Lesson3Task,
    reset: resetY6MeasurelandsWeek4Lesson3TaskSessionState,
    quizContributionBuilder: buildY6MeasurelandsWeek4Lesson3QuizTasks,
    practisedSkills: ["Read decimal amounts", "Solve real conversion problems", "Compare and check conversions"],
    completionTitle: "Lab Challenges Complete!",
  },
};

const Y6_MEASURELANDS_LESSONS: Y6MeasurelandsLessonEntry[] = [];
for (let week = 1; week <= 8; week += 1) {
  for (let lessonNumber = 1; lessonNumber <= 3; lessonNumber += 1) {
    const entry = makePlaceholderEntry(week, lessonNumber);
    const built = BUILT_LESSONS[entry.prefix];
    if (built) Object.assign(entry, built, { placeholder: false });
    Y6_MEASURELANDS_LESSONS.push(entry);
  }
}

export function isY6MeasurelandsLessonId(lessonId: string): boolean {
  return Y6_MEASURELANDS_LESSONS.some((entry) => lessonId.startsWith(entry.prefix));
}

export function isY6MeasurelandsPlaceholderLesson(lessonId: string): boolean {
  const entry = Y6_MEASURELANDS_LESSONS.find((candidate) => lessonId.startsWith(candidate.prefix));
  return entry?.placeholder === true;
}

export function resolveY6MeasurelandsLessonTask(
  lessonId: string,
  difficulty: Difficulty,
): PracticeTask | null {
  const entry = Y6_MEASURELANDS_LESSONS.find((candidate) => lessonId.startsWith(candidate.prefix));
  return entry ? entry.generate(lessonId, difficulty) : null;
}

export function getY6MeasurelandsPractisedSkills(lessonId: string): string[] | undefined {
  return Y6_MEASURELANDS_LESSONS.find((entry) => lessonId.startsWith(entry.prefix))?.practisedSkills;
}

export type Y6MeasurelandsLessonMeta = Omit<Y6MeasurelandsLessonEntry, "generate" | "reset">;

export function getY6MeasurelandsLessonMeta(lessonId: string): Y6MeasurelandsLessonMeta | null {
  const entry = Y6_MEASURELANDS_LESSONS.find((candidate) => lessonId.startsWith(candidate.prefix));
  if (!entry) return null;
  const { generate: _generate, reset: _reset, ...meta } = entry;
  return meta;
}

export function resetY6MeasurelandsLessonSessionState() {
  Y6_MEASURELANDS_LESSONS.forEach((entry) => entry.reset());
}
