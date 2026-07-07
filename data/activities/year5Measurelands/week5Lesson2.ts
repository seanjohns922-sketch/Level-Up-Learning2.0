import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { BINARY, decisionTask, sameAreaPair, samePerimeterPair, rectCells, choose, randInt } from "@/data/activities/year5Measurelands/week5Common";

// ── Measurelands · Level 5 · Week 5 · Lesson 2 — "Same Area, Different Perimeter" (AC9M5M02) ──
// Discover that area and perimeter are different attributes.
//   A. investigate — two gardens: same area (or same perimeter)? then reveal.
//   B. moreFence   — same area, different perimeter: which needs more fencing?
//   C. decide      — area or perimeter for this job?

type AreaTask = Extract<PracticeTask, { kind: "area" }>;

type LessonMemory = { cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"investigate" | "moreFence" | "decide"> = ["investigate", "moreFence", "decide", "investigate", "moreFence", "decide"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

function shape(dims: [number, number], label: string, emoji: string) {
  return { cells: rectCells(dims[0], dims[1]), label, emoji, gridW: dims[0], gridH: dims[1] };
}

// Activity A — discover, then reveal.
function buildInvestigate(): AreaTask {
  const sameArea = randInt(2) === 0;
  const [A, B] = sameArea ? sameAreaPair() : samePerimeterPair();
  return {
    kind: "area",
    scene: "investigate",
    areaUnit: "m²",
    prompt: "Look closely — what do you notice about these two gardens?",
    speakText: "Look at the two gardens made of tiles. What do you notice about them?",
    badgeLabel: "What Do You Notice?",
    compareShapes: { a: shape(A, "Garden A", "🟩"), b: shape(B, "Garden B", "🟩") },
    feedback: { correct: "Great noticing!", wrong: "Look again at the tiles and the outline." },
  };
}

// Activity B — same area, different perimeter: which needs more fence?
function buildMoreFenceTask(): AreaTask {
  const [A, B] = sameAreaPair();
  const periA = 2 * (A[0] + A[1]), periB = 2 * (B[0] + B[1]);
  const bigger = periA >= periB ? "Garden A" : "Garden B";
  return {
    kind: "area",
    scene: "compareArea",
    compareMode: "perimeter",
    areaUnit: "m²",
    prompt: "Which garden needs more fencing?",
    speakText: "Both gardens cover the same amount of space. Which one needs more fencing around it?",
    badgeLabel: "Which Needs More Fence?",
    compareShapes: { a: shape(A, "Garden A", "🚧"), b: shape(B, "Garden B", "🚧") },
    feedback: { correct: `Yes — ${bigger} has a longer outline, so it needs more fence.`, wrong: "Same space, but a longer, thinner shape needs more fence around it." },
  };
}

export function generateY5MeasurelandsWeek5Lesson2Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "moreFence") return buildMoreFenceTask();
  if (activity === "decide") return decisionTask(choose(BINARY), false);
  return buildInvestigate();
}

export function resetY5MeasurelandsWeek5Lesson2TaskSessionState() {
  lessonMemory.clear();
}

// Weekly-quiz contribution — MCQ-safe (investigate is interactive; the quiz uses
// the compare + decision scenes).
export function buildY5MeasurelandsWeek5Lesson2QuizTasks(): PracticeTask[] {
  return [
    buildMoreFenceTask(),
    decisionTask(choose(BINARY), false),
    buildMoreFenceTask(),
    decisionTask(choose(BINARY), false),
    buildMoreFenceTask(),
  ];
}
