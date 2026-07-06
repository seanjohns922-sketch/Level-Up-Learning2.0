import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { choose, shuffle, pull } from "@/data/activities/year4Measurelands/week8Common";
import { buildY4MeasurelandsWeek4Lesson3QuizTasks } from "@/data/activities/year4Measurelands/week4Lesson3";
import { buildY4MeasurelandsWeek5Lesson3QuizTasks } from "@/data/activities/year4Measurelands/week5Lesson3";

// ── Measurelands · Level 4 · Week 8 · Lesson 1 — "Design the Park" ────────────
// Capstone application (AC9M4M01/M02). Students design a Measurelands park:
// FIRST decide what to measure and which instrument to use, THEN solve perimeter
// (fencing) and area (grass) problems. No new mechanics — reuses the toolChoice
// card plus the Perimeter (Week 4) and Area (Week 5) solve tasks.
//   A. tool   — choose the right measurement / instrument for a park job.
//   B. fence  — perimeter problem (how much fencing goes around).
//   C. grass  — area problem (how much grass/turf covers the space).

type ToolTask = Extract<PracticeTask, { kind: "toolChoice" }>;

type LessonMemory = { introShown: boolean; cursor: number; toolCursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"tool" | "fence" | "grass"> = ["tool", "fence", "grass", "tool", "fence", "grass"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, toolCursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

function buildIntroTask(): ToolTask {
  return {
    kind: "toolChoice",
    scene: "intro",
    prompt: "Design the Park",
    speakText:
      "Professor Gauge says: today you are a Master Surveyor designing a brand-new Measurelands park. Every decision uses measurement. First decide WHAT you are measuring, then choose the right tool, then solve it.",
    badgeLabel: "Meazurex Mission",
    introLines: [
      "Today you're a Master Surveyor designing a brand-new Measurelands park.",
      "Every decision uses measurement — first decide WHAT to measure, then choose the right tool.",
    ],
    introTools: [
      { id: "length", label: "Length", focus: "How long?", iconKey: "m-length" },
      { id: "perimeter", label: "Perimeter", focus: "Around the edge", iconKey: "m-perimeter" },
      { id: "area", label: "Area", focus: "Space covered", iconKey: "m-area" },
      { id: "mass", label: "Mass", focus: "How heavy?", iconKey: "m-mass" },
      { id: "capacity", label: "Capacity", focus: "How much fits?", iconKey: "m-capacity" },
    ],
    feedback: {
      correct: "Let's design it!",
      wrong: "First decide what you are measuring, then choose the tool.",
    },
  };
}

// Activity A — Choose the right measurement / instrument for a park job.
type ToolSpec = {
  prompt: string;
  object: { label: string; iconKey: string };
  tools: Array<{ id: string; label: string; iconKey: string }>;
  correctToolId: string;
  correct: string;
  wrong: string;
};

const TOOL_SPECS: ToolSpec[] = [
  {
    prompt: "You need to measure the long fence right around the whole park. Which tool is best?",
    object: { label: "park fence", iconKey: "playground" },
    tools: [
      { id: "wheel", label: "Trundle wheel", iconKey: "wheel" },
      { id: "ruler", label: "Small ruler", iconKey: "m-length" },
      { id: "scales", label: "Kitchen scales", iconKey: "m-mass" },
    ],
    correctToolId: "wheel",
    correct: "Yes — a trundle wheel measures long distances outdoors.",
    wrong: "A small ruler would take forever outside — use the trundle wheel for big distances.",
  },
  {
    prompt: "You need to measure the width of a small garden sign. Which tool is best?",
    object: { label: "garden sign", iconKey: "book" },
    tools: [
      { id: "ruler", label: "Ruler", iconKey: "m-length" },
      { id: "wheel", label: "Trundle wheel", iconKey: "wheel" },
      { id: "jug", label: "Measuring jug", iconKey: "m-capacity" },
    ],
    correctToolId: "ruler",
    correct: "Yes — a ruler is right for small lengths.",
    wrong: "A trundle wheel is for big spaces — a small sign needs a ruler.",
  },
  {
    prompt: "You want to know how heavy a bag of garden soil is. What should you measure?",
    object: { label: "bag of soil", iconKey: "tree" },
    tools: [
      { id: "mass", label: "Mass (scales)", iconKey: "m-mass" },
      { id: "length", label: "Length (ruler)", iconKey: "m-length" },
      { id: "capacity", label: "Capacity (jug)", iconKey: "m-capacity" },
    ],
    correctToolId: "mass",
    correct: "Yes — how heavy means mass, so use the scales.",
    wrong: "The clue is 'how heavy' — that is mass, measured on scales.",
  },
  {
    prompt: "You want to know how much water the park pond holds. What should you measure?",
    object: { label: "pond", iconKey: "oval" },
    tools: [
      { id: "capacity", label: "Capacity (jug)", iconKey: "m-capacity" },
      { id: "length", label: "Length (ruler)", iconKey: "m-length" },
      { id: "mass", label: "Mass (scales)", iconKey: "m-mass" },
    ],
    correctToolId: "capacity",
    correct: "Yes — how much water fits is capacity, measured with a jug.",
    wrong: "The clue is 'how much water it holds' — that is capacity.",
  },
  {
    prompt: "You want to know how much fencing goes around the playground. What are you measuring?",
    object: { label: "playground", iconKey: "playground" },
    tools: [
      { id: "perimeter", label: "Perimeter", iconKey: "m-perimeter" },
      { id: "area", label: "Area", iconKey: "m-area" },
      { id: "mass", label: "Mass", iconKey: "m-mass" },
    ],
    correctToolId: "perimeter",
    correct: "Yes — the fence goes around the edge, so that's perimeter.",
    wrong: "Fencing goes around the outside — that's the perimeter, not the area.",
  },
  {
    prompt: "You want to know how much grass covers the playground. What are you measuring?",
    object: { label: "playground", iconKey: "playground" },
    tools: [
      { id: "area", label: "Area", iconKey: "m-area" },
      { id: "perimeter", label: "Perimeter", iconKey: "m-perimeter" },
      { id: "capacity", label: "Capacity", iconKey: "m-capacity" },
    ],
    correctToolId: "area",
    correct: "Yes — grass covers the inside space, so that's area.",
    wrong: "Grass covers the space inside — that's the area, not the perimeter.",
  },
];

function buildToolTask(memory: LessonMemory): ToolTask {
  const spec = TOOL_SPECS[memory.toolCursor % TOOL_SPECS.length]!;
  memory.toolCursor += 1;
  return {
    kind: "toolChoice",
    scene: "best",
    prompt: spec.prompt,
    speakText: spec.prompt,
    badgeLabel: "Choose the Right Tool",
    object: spec.object,
    tools: shuffle(spec.tools),
    correctToolId: spec.correctToolId,
    feedback: { correct: spec.correct, wrong: spec.wrong },
  };
}

// Activity B — Fence it (perimeter solve, reused from Week 4).
function buildFenceTask(): PracticeTask {
  return pull(buildY4MeasurelandsWeek4Lesson3QuizTasks);
}

// Activity C — Grass it (area solve, reused from Week 5).
function buildGrassTask(): PracticeTask {
  return pull(buildY4MeasurelandsWeek5Lesson3QuizTasks);
}

export function generateY4MeasurelandsWeek8Lesson1Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "fence") return buildFenceTask();
  if (activity === "grass") return buildGrassTask();
  return buildToolTask(memory);
}

export function resetY4MeasurelandsWeek8Lesson1TaskSessionState() {
  lessonMemory.clear();
}

// Week 8 has NO weekly quiz — the capstone flows straight into the Level 4
// Post-Test. This builder exists only to satisfy the registry contract.
export function buildY4MeasurelandsWeek8Lesson1QuizTasks(): PracticeTask[] {
  return [];
}
