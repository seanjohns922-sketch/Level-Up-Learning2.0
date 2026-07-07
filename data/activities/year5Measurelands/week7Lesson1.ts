import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { angleIntroTask, estimateStepperTask, compareEstimateTask, streakTask, closestTask, guessTask } from "@/data/activities/year5Measurelands/week7Common";

// ── Measurelands · Level 5 · Week 7 · Lesson 1 — "Estimate the Angle" (AC9M5M04) ──
// Estimate FIRST — an Alien-Angles-style game. Students meet benchmark angles,
// then commit to a guess with a stepper and get immediate closeness feedback, so
// they build real degree sense before ever touching the protractor (Lesson 2).
//   Intro: benchmark angles (30 / 45 / 90 / 135 / 180).
//   A. estimateStepper — commit an estimate, reveal how close (⭐ by closeness).
//   B. compareEstimate — smaller / equal / larger than 90°, then estimate.
//   C. streak          — Beat Your Best: 5 angles, running average, high score.

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"estimateStepper" | "compareEstimate" | "streak"> = ["estimateStepper", "compareEstimate", "streak", "estimateStepper", "compareEstimate", "streak"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

export function generateY5MeasurelandsWeek7Lesson1Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) { memory.introShown = true; return angleIntroTask(); }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "compareEstimate") return compareEstimateTask();
  if (activity === "streak") return streakTask();
  return estimateStepperTask();
}

export function resetY5MeasurelandsWeek7Lesson1TaskSessionState() {
  lessonMemory.clear();
}

// The live lesson is an open-ended estimation game; the weekly quiz needs
// determinate answers, so it uses the closest / sensible MCQ variants.
export function buildY5MeasurelandsWeek7Lesson1QuizTasks(): PracticeTask[] {
  return [closestTask(), guessTask(), closestTask(), guessTask(), closestTask()];
}
