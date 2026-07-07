import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { pullFrom, briefingIntro, UNITS, PRECISION, PERIMETER, AREA, ANGLE, MASS, TEMPERATURE } from "@/data/activities/year5Measurelands/week8Common";

// ── Measurelands · Level 5 · Week 8 · Lesson 2 — "Engineering Challenge" ──────
//   A. material — measure materials: choose the unit / read precisely.
//   B. plan     — construction planning: area / perimeter / angle.
//   C. mission  — engineering mission: mixed (mass / temperature).

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"material" | "plan" | "mission"> = ["material", "plan", "mission", "material", "plan", "mission"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

const PLAN_SOURCES = [...PERIMETER, ...AREA, ...ANGLE];
const MISSION_SOURCES = [...MASS, ...TEMPERATURE, ...PRECISION];

export function generateY5MeasurelandsWeek8Lesson2Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return briefingIntro(
      "Engineering Challenge",
      ["Engineers don't guess — they trust their measurements.", "Read the instruments carefully, then use the numbers to make the right call."],
      "Professor Gauge says: engineers don't guess, they trust measurements. Read carefully, then decide.",
    );
  }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "plan") return pullFrom(PLAN_SOURCES);
  if (activity === "mission") return pullFrom(MISSION_SOURCES);
  return pullFrom([...UNITS, ...PRECISION]);
}

export function resetY5MeasurelandsWeek8Lesson2TaskSessionState() {
  lessonMemory.clear();
}

export function buildY5MeasurelandsWeek8Lesson2QuizTasks(): PracticeTask[] {
  return [];
}
