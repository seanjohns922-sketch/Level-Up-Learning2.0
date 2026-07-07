import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { alienTask, estimateTask, closestTask, guessTask } from "@/data/activities/year5Measurelands/week7Common";

// ── Measurelands · Level 5 · Week 7 · Lesson 3 — "Estimate Angles" (AC9M5M04) ──
// Estimate LAST, and it is ONE game: Alien Angles. The student is given a target
// angle in degrees and drags a bare ray to where they think it is — no protractor,
// no markings, no help. When they press Estimate, the protractor appears behind
// the angle so they can SEE how close they were. Having measured (L1) and
// constructed (L2), they now have real degree sense to draw on.
//   Every task: alien — aim the beam at the target, then reveal the protractor.

export function generateY5MeasurelandsWeek7Lesson3Task(_lessonId: string, _difficulty: Difficulty): PracticeTask {
  return alienTask();
}

export function resetY5MeasurelandsWeek7Lesson3TaskSessionState() {
  // Stateless — each round is an independent alien target.
}

// The live lesson is an open-ended aiming game; the weekly quiz needs determinate
// answers, so it uses the estimate / closest / sensible MCQ variants.
export function buildY5MeasurelandsWeek7Lesson3QuizTasks(): PracticeTask[] {
  return [estimateTask(), closestTask(), guessTask(), estimateTask(), closestTask()];
}
