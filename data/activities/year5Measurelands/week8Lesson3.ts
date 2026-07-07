import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { pullFrom, measurementDecision, briefingIntro, TIME, CAPACITY, AREA, PERIMETER, ANGLE, UNITS } from "@/data/activities/year5Measurelands/week8Common";

// ── Measurelands · Level 5 · Week 8 · Lesson 3 — "Master Builder Mission" ─────
// The final challenge before the Level 5 Post-Test.
//   A. camp      — school camp planning: time / timetable + water (capacity).
//   B. community — community project: decide the measurement, then solve.
//   C. master    — master mission: mixed across all strands (incl. a light angle).

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"camp" | "community" | "master"> = ["camp", "community", "master", "camp", "community", "master"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

const CAMP_SOURCES = [...TIME, ...CAPACITY];
const MASTER_SOURCES = [...AREA, ...PERIMETER, ...ANGLE, ...TIME, ...UNITS];

export function generateY5MeasurelandsWeek8Lesson3Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return briefingIntro(
      "The Master Builder Mission",
      ["Your final challenge before becoming a Master Builder.", "Every problem mixes different skills — decide what to measure, choose your strategy, then solve."],
      "Professor Gauge says: this is your final challenge before becoming a Master Builder. Decide what to measure, choose your strategy, then solve.",
    );
  }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "community") return memory.cursor % 2 === 0 ? measurementDecision() : pullFrom([...AREA, ...PERIMETER]);
  if (activity === "master") return pullFrom(MASTER_SOURCES);
  return pullFrom(CAMP_SOURCES);
}

export function resetY5MeasurelandsWeek8Lesson3TaskSessionState() {
  lessonMemory.clear();
}

export function buildY5MeasurelandsWeek8Lesson3QuizTasks(): PracticeTask[] {
  return [];
}
