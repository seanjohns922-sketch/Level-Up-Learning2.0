import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { BINARY, BOTH, decisionTask, sortTask, choose } from "@/data/activities/year5Measurelands/week5Common";

// ── Measurelands · Level 5 · Week 5 · Lesson 1 — "Area or Perimeter?" (AC9M5M02) ──
// Decide which measurement a situation needs.
//   A. choose     — area or perimeter? (binary, changing contexts)
//   B. sort       — sort jobs into Area / Perimeter bins
//   C. both       — area, perimeter or BOTH? (introduces the third option)

type ToolTask = Extract<PracticeTask, { kind: "toolChoice" }>;

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"choose" | "sort" | "both"> = ["choose", "sort", "both", "choose", "sort", "both"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

function buildIntroTask(): ToolTask {
  return {
    kind: "toolChoice",
    scene: "intro",
    prompt: "Do we measure around it, or inside it?",
    speakText:
      "Professor Gauge says: sometimes we measure around the outside. Sometimes we cover the inside. Knowing which one to use is the real skill.",
    badgeLabel: "Meazurex Mission",
    introLines: [
      "Sometimes we measure around the outside. Sometimes we cover the inside.",
      "Knowing which one to use — before you calculate — is the real skill.",
    ],
    introTools: [
      { id: "perimeter", label: "Perimeter", focus: "the distance around the outside", iconKey: "m-perimeter" },
      { id: "area", label: "Area", focus: "the space covered inside", iconKey: "m-area" },
    ],
    feedback: { correct: "Let's decide!", wrong: "Let's decide!" },
  };
}

export function generateY5MeasurelandsWeek5Lesson1Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) { memory.introShown = true; return buildIntroTask(); }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "sort") return sortTask();
  if (activity === "both") return decisionTask(choose([...BOTH, ...BINARY]), true);
  return decisionTask(choose(BINARY), false);
}

export function resetY5MeasurelandsWeek5Lesson1TaskSessionState() {
  lessonMemory.clear();
}

// Weekly-quiz contribution — MCQ-safe (decisions are single-answer; sort is
// interactive, so the quiz uses decisions).
export function buildY5MeasurelandsWeek5Lesson1QuizTasks(): PracticeTask[] {
  return [
    decisionTask(choose(BINARY), false),
    decisionTask(choose(BINARY), false),
    decisionTask(choose([...BOTH, ...BINARY]), true),
    decisionTask(choose(BINARY), false),
    decisionTask(choose([...BOTH, ...BINARY]), true),
  ];
}
