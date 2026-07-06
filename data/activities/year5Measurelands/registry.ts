import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { YEAR5_MEASURELANDS_PROGRAM } from "@/data/programs/year5Measurelands";

// Measurelands Level 5 (Year 5) — registry shell only.
//
// Every lesson resolves inside realm_id=measurement with a non-runnable
// placeholder until the real Level 5 curriculum is built. Placeholders must not
// award XP, save completion, unlock progression, or feed teacher/quiz data.

type Y5MeasurelandsLessonEntry = {
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
  return YEAR5_MEASURELANDS_PROGRAM.find((candidate) => candidate.week === week);
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
    speakText: `${lessonTitle} is being built for Measurelands Level 5.`,
    badgeLabel: "Measurelands · Level 5",
    introIcon: "🧭",
    introBody: [
      `${weekTopic}: ${lessonTitle}.`,
      plannedLesson?.focus ?? "Level 5 measurement content is coming soon.",
      "This lesson stays in Measurelands — it will not fall back to Number Nexus.",
    ],
    objects: [],
    correctOptionId: "continue",
    feedback: { correct: "Back to week.", wrong: "Back to week." },
  } as PracticeTask;
}

function makePlaceholderEntry(week: number, lessonNumber: number): Y5MeasurelandsLessonEntry {
  const isLastLessonOfWeek = lessonNumber === 3;
  const isLastWeek = week === 8;
  const plannedWeek = getPlannedWeek(week);
  const plannedLesson = getPlannedLesson(week, lessonNumber);
  const title = plannedLesson?.title ?? `Lesson ${lessonNumber}`;
  const subtitle = plannedWeek?.topic ?? `Level 5 — Week ${week}`;

  return {
    prefix: `y5-measurement-w${week}-l${lessonNumber}`,
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
        ? "Level 5 Post-Test unlocked."
        : "Weekly Quiz unlocked.",
    returnRoute: `/program?year=Year 5&week=${week}&legacy=1&realm_id=measurement`,
  };
}

const Y5_MEASURELANDS_LESSONS: Y5MeasurelandsLessonEntry[] = [];
for (let week = 1; week <= 8; week += 1) {
  for (let lessonNumber = 1; lessonNumber <= 3; lessonNumber += 1) {
    Y5_MEASURELANDS_LESSONS.push(makePlaceholderEntry(week, lessonNumber));
  }
}

export function isY5MeasurelandsLessonId(lessonId: string): boolean {
  return Y5_MEASURELANDS_LESSONS.some((entry) => lessonId.startsWith(entry.prefix));
}

export function isY5MeasurelandsPlaceholderLesson(lessonId: string): boolean {
  const entry = Y5_MEASURELANDS_LESSONS.find((candidate) => lessonId.startsWith(candidate.prefix));
  return entry?.placeholder === true;
}

export function resolveY5MeasurelandsLessonTask(
  lessonId: string,
  difficulty: Difficulty,
): PracticeTask | null {
  const entry = Y5_MEASURELANDS_LESSONS.find((candidate) => lessonId.startsWith(candidate.prefix));
  return entry ? entry.generate(lessonId, difficulty) : null;
}

export function getY5MeasurelandsPractisedSkills(lessonId: string): string[] | undefined {
  return Y5_MEASURELANDS_LESSONS.find((entry) => lessonId.startsWith(entry.prefix))?.practisedSkills;
}

export type Y5MeasurelandsLessonMeta = Omit<Y5MeasurelandsLessonEntry, "generate" | "reset">;

export function getY5MeasurelandsLessonMeta(lessonId: string): Y5MeasurelandsLessonMeta | null {
  const entry = Y5_MEASURELANDS_LESSONS.find((candidate) => lessonId.startsWith(candidate.prefix));
  if (!entry) return null;
  const { generate: _generate, reset: _reset, ...meta } = entry;
  return meta;
}

export function resetY5MeasurelandsLessonSessionState() {
  Y5_MEASURELANDS_LESSONS.forEach((entry) => entry.reset());
}
