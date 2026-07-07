import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { estimateTask, closestTask, guessTask } from "@/data/activities/year5Measurelands/week7Common";

// ── Measurelands · Level 5 · Week 7 · Lesson 3 — "Estimate Angles" (AC9M5M04) ──
// Estimate LAST — now students know what real degrees look like from measuring
// and constructing, so estimation is grounded, not guessing.
//   Intro: benchmark angles (30 / 90 / 135).
//   A. estimate — estimate the angle.
//   B. closest  — which estimate is closest?
//   C. guess    — is Professor Gauge's estimate sensible?

type ProtractorTask = Extract<PracticeTask, { kind: "protractor" }>;

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"estimate" | "closest" | "guess"> = ["estimate", "closest", "guess", "estimate", "closest", "guess"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

function buildIntroTask(): ProtractorTask {
  return {
    kind: "protractor",
    scene: "intro",
    prompt: "Now estimate — you know what degrees look like.",
    speakText:
      "Professor Gauge says: now you've measured with a protractor, you know what angles look like. Estimate first, then you could check with the protractor. Compare to a right angle — 90 degrees.",
    badgeLabel: "Meazurex Mission",
    feedback: { correct: "Let's estimate!", wrong: "Let's estimate!" },
  };
}

export function generateY5MeasurelandsWeek7Lesson3Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) { memory.introShown = true; return buildIntroTask(); }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "closest") return closestTask();
  if (activity === "guess") return guessTask();
  return estimateTask();
}

export function resetY5MeasurelandsWeek7Lesson3TaskSessionState() {
  lessonMemory.clear();
}

export function buildY5MeasurelandsWeek7Lesson3QuizTasks(): PracticeTask[] {
  return [estimateTask(), closestTask(), guessTask(), estimateTask(), closestTask()];
}
