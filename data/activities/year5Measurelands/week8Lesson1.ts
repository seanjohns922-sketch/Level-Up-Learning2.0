import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { toolDecision, measurementDecision, pullFrom, briefingIntro, PERIMETER, AREA, AREA_OR_PERIM } from "@/data/activities/year5Measurelands/week8Common";

// ── Measurelands · Level 5 · Week 8 · Lesson 1 — "Design the Adventure Park" ──
// Capstone: choose the mathematics, then solve. No new mechanics.
//   A. tool    — choose the right tool / measurement for a park job.
//   B. decide  — area or perimeter for the layout? (compare)
//   C. solve   — complete the park (perimeter / area).

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"tool" | "decide" | "solve"> = ["tool", "decide", "solve", "tool", "decide", "solve"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

export function generateY5MeasurelandsWeek8Lesson1Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return briefingIntro(
      "Design the Adventure Park",
      ["Today you're a Master Engineer designing the greatest adventure park in Measurelands.", "Every path, fence and garden needs the right measurement — decide first, then solve."],
      "Professor Gauge says: today you design the greatest adventure park in Measurelands. Every decision needs measurement — choose what to measure first, then solve it.",
    );
  }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "decide") return memory.cursor % 2 === 0 ? measurementDecision() : pullFrom(AREA_OR_PERIM);
  if (activity === "solve") return memory.cursor % 2 === 0 ? pullFrom(PERIMETER) : pullFrom(AREA);
  return toolDecision();
}

export function resetY5MeasurelandsWeek8Lesson1TaskSessionState() {
  lessonMemory.clear();
}

// Week 8 has NO weekly quiz — the capstone flows straight into the Level 5
// Post-Test. This builder exists only to satisfy the registry contract.
export function buildY5MeasurelandsWeek8Lesson1QuizTasks(): PracticeTask[] {
  return [];
}
