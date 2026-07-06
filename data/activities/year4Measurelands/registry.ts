import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

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
function buildPlaceholderTask(lessonId: string, week: number, lessonNumber: number): PracticeTask {
  return {
    kind: "measurementCompare",
    scene: "intro",
    prompt: "This Level 4 Measurelands lesson is coming soon.",
    speakText:
      "This Level 4 Measurelands lesson is being built. The curriculum plan is on its way.",
    badgeLabel: "Measurelands · Level 4",
    introIcon: "🧭",
    introBody: [
      `Week ${week}, Lesson ${lessonNumber}.`,
      "Level 4 measurement content is coming soon.",
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
  return {
    prefix: `y4-measurement-w${week}-l${lessonNumber}`,
    week,
    lessonNumber,
    title: `Lesson ${lessonNumber}`,
    subtitle: `Level 4 — Week ${week}`,
    generate: (lessonId) => buildPlaceholderTask(lessonId, week, lessonNumber),
    reset: () => {},
    quizContributionBuilder: () => [],
    practisedSkills: undefined,
    placeholder: true,
    completionTitle: `Week ${week} Lesson ${lessonNumber} Complete!`,
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
    Y4_MEASURELANDS_LESSONS.push(makePlaceholderEntry(week, lessonNumber));
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
