import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { CONTEXTS, rectDims, areaOptions, choose, type Ctx } from "@/data/activities/year5Measurelands/week4Common";

// ── Measurelands · Level 5 · Week 4 · Lesson 1 — "Rows and Columns" (AC9M5M02) ──
// See a rectangle as equal rows and columns — the array model of area.
//   A. rows    — tap each row to light it up, then count.
//   B. columns — tap each column, then count.
//   C. array   — how many squares? (rows × columns, not one-by-one).

type AreaTask = Extract<PracticeTask, { kind: "area" }>;

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"rows" | "columns" | "array"> = ["rows", "columns", "array", "rows", "columns", "array"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

function buildIntroTask(): AreaTask {
  const { w, h } = rectDims(3, 6);
  return {
    kind: "area",
    scene: "intro",
    arrayReveal: true,
    gridW: w,
    gridH: h,
    areaUnit: "m²",
    prompt: "Don't count every tile — look for the pattern.",
    speakText:
      "Professor Gauge says: instead of counting every tile, look for the pattern. A rectangle is made of equal rows and columns. Rows times columns tells you how many squares cover it.",
    badgeLabel: "Meazurex Mission",
    feedback: { correct: "Let's build!", wrong: "Let's build!" },
  };
}

function buildRowsTask(ctx: Ctx): AreaTask {
  const { w, h } = rectDims(2, 6);
  return {
    kind: "area",
    scene: "rows",
    gridW: w,
    gridH: h,
    context: ctx.label,
    emoji: ctx.emoji,
    prompt: "How many rows?",
    speakText: `Tap each row of the ${ctx.label} to light it up, then count. How many rows?`,
    badgeLabel: "Count the Rows",
    feedback: { correct: `Yes — ${h} rows.`, wrong: "Tap every row." },
  };
}

function buildColumnsTask(ctx: Ctx): AreaTask {
  const { w, h } = rectDims(2, 6);
  return {
    kind: "area",
    scene: "columns",
    gridW: w,
    gridH: h,
    context: ctx.label,
    emoji: ctx.emoji,
    prompt: "How many columns?",
    speakText: `Tap each column of the ${ctx.label} to light it up, then count. How many columns?`,
    badgeLabel: "Count the Columns",
    feedback: { correct: `Yes — ${w} columns.`, wrong: "Tap every column." },
  };
}

function buildArrayTask(ctx: Ctx): AreaTask {
  const { w, h } = rectDims(2, 7);
  const { options, correct } = areaOptions(w, h);
  return {
    kind: "area",
    scene: "arrayArea",
    gridW: w,
    gridH: h,
    context: ctx.label,
    emoji: ctx.emoji,
    areaUnit: "m²",
    prompt: `How many squares cover the ${ctx.label}?`,
    speakText: `Use the rows and columns. How many squares cover the ${ctx.label}?`,
    badgeLabel: "How Many Squares?",
    options,
    correctNumber: correct,
    feedback: { correct: `Yes — ${h} rows × ${w} columns = ${correct} m².`, wrong: `Multiply the rows by the columns — ${h} × ${w} = ${correct}.` },
  };
}

export function generateY5MeasurelandsWeek4Lesson1Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) { memory.introShown = true; return buildIntroTask(); }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  const ctx = choose(CONTEXTS);
  if (activity === "columns") return buildColumnsTask(ctx);
  if (activity === "array") return buildArrayTask(ctx);
  return buildRowsTask(ctx);
}

export function resetY5MeasurelandsWeek4Lesson1TaskSessionState() {
  lessonMemory.clear();
}

// Weekly-quiz contribution — MCQ-safe (rows/columns are interactive; the quiz
// uses the array MCQ).
export function buildY5MeasurelandsWeek4Lesson1QuizTasks(): PracticeTask[] {
  return [buildArrayTask(choose(CONTEXTS)), buildArrayTask(choose(CONTEXTS)), buildArrayTask(choose(CONTEXTS)), buildArrayTask(choose(CONTEXTS)), buildArrayTask(choose(CONTEXTS))];
}
