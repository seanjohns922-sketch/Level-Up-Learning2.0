import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { CONTEXTS, rectDims, areaOptions, mistakeParts, choose, type Ctx } from "@/data/activities/year5Measurelands/week4Common";

// ── Measurelands · Level 5 · Week 4 · Lesson 2 — "Find the Area" (AC9M5M02) ──
// Determine the area of rectangles efficiently (rows × columns square units).
//   A. calc    — calculate the area (typed).
//   B. which   — which area is correct? (MCQ)
//   C. mistake — Professor Gauge added instead of multiplying.

type AreaTask = Extract<PracticeTask, { kind: "area" }>;

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"calc" | "which" | "mistake"> = ["calc", "which", "mistake", "calc", "which", "mistake"];

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
    prompt: "Rows and columns tell us the total.",
    speakText:
      "Professor Gauge says: rows and columns tell us the total number of square units. Every row has the same number of squares, so rows times columns gives the area.",
    badgeLabel: "Meazurex Mission",
    feedback: { correct: "Let's calculate!", wrong: "Let's calculate!" },
  };
}

function buildCalcTask(ctx: Ctx): AreaTask {
  const { w, h } = rectDims(2, 8);
  return {
    kind: "area",
    scene: "calcArea",
    gridW: w,
    gridH: h,
    context: ctx.label,
    emoji: ctx.emoji,
    areaUnit: "m²",
    prompt: `What is the area of the ${ctx.label}?`,
    speakText: `Use rows times columns. What is the area of the ${ctx.label}?`,
    badgeLabel: "Find the Area",
    answerValue: w * h,
    feedback: { correct: `Yes — ${h} × ${w} = ${w * h} m².`, wrong: `Multiply the rows by the columns — ${h} × ${w} = ${w * h}.` },
  };
}

function buildWhichTask(ctx: Ctx): AreaTask {
  const { w, h } = rectDims(2, 8);
  const { options, correct } = areaOptions(w, h);
  return {
    kind: "area",
    scene: "arrayArea",
    gridW: w,
    gridH: h,
    context: ctx.label,
    emoji: ctx.emoji,
    areaUnit: "m²",
    prompt: `Which is the area of the ${ctx.label}?`,
    speakText: `Which measurement is the area of the ${ctx.label}?`,
    badgeLabel: "Which Area Is Correct?",
    options,
    correctNumber: correct,
    feedback: { correct: `Yes — ${h} × ${w} = ${correct} m².`, wrong: `Rows × columns — ${h} × ${w} = ${correct}.` },
  };
}

function buildMistakeTask(ctx: Ctx): AreaTask {
  const { w, h } = rectDims(2, 8);
  const { options, correct, statement } = mistakeParts(w, h);
  return {
    kind: "area",
    scene: "spotMistake",
    gridW: w,
    gridH: h,
    context: ctx.label,
    emoji: ctx.emoji,
    areaUnit: "m²",
    prompt: "What is the correct area?",
    speakText: `${statement} That's not right. What is the correct area?`,
    badgeLabel: "Professor Gauge's Mistake",
    statement,
    options,
    correctNumber: correct,
    feedback: { correct: `Yes — you multiply, not add: ${h} × ${w} = ${correct} m².`, wrong: `Don't add — multiply the rows by the columns: ${h} × ${w} = ${correct}.` },
  };
}

export function generateY5MeasurelandsWeek4Lesson2Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) { memory.introShown = true; return buildIntroTask(); }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  const ctx = choose(CONTEXTS);
  if (activity === "which") return buildWhichTask(ctx);
  if (activity === "mistake") return buildMistakeTask(ctx);
  return buildCalcTask(ctx);
}

export function resetY5MeasurelandsWeek4Lesson2TaskSessionState() {
  lessonMemory.clear();
}

export function buildY5MeasurelandsWeek4Lesson2QuizTasks(): PracticeTask[] {
  return [buildWhichTask(choose(CONTEXTS)), buildMistakeTask(choose(CONTEXTS)), buildWhichTask(choose(CONTEXTS)), buildMistakeTask(choose(CONTEXTS)), buildWhichTask(choose(CONTEXTS))];
}
