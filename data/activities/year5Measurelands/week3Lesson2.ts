import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { irregularShape, perimeterOptions, type Shape } from "@/data/activities/year5Measurelands/week3Common";

// ── Measurelands · Level 5 · Week 3 · Lesson 2 — "Irregular Perimeters" (AC9M5M02) ──
// Every outside edge matters — find the perimeter of irregular (L / step) shapes.
//   A. find    — tap every outside side (don't miss a hidden edge).
//   B. calc    — add every side of an irregular shape (typed).
//   C. survey  — choose the perimeter of an irregular garden (MCQ).

type SurveyorTask = Extract<PracticeTask, { kind: "perimeterCalc" }>;

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"find" | "calc" | "survey"> = ["find", "calc", "survey", "find", "calc", "survey"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

function core(s: Shape) {
  return { poly: s.poly, sideLabels: s.sideLabels, perimeter: s.perimeter, unit: s.unit, theme: s.theme, shapeName: s.shapeName };
}

function buildIntroTask(): SurveyorTask {
  const s = irregularShape(8, 14);
  return {
    kind: "perimeterCalc",
    scene: "intro",
    prompt: "Every outside edge matters.",
    speakText:
      "Professor Gauge says: irregular shapes still have a perimeter — every outside edge matters. Follow the whole boundary and add every side once, even the hidden corners.",
    badgeLabel: "Meazurex Mission",
    introLines: [
      "Irregular shapes still have a perimeter.",
      "Follow the whole boundary and add every outside side once — don't miss a corner.",
    ],
    ...core(s),
    feedback: { correct: "Let's survey!", wrong: "Let's survey!" },
  };
}

// Activity A — Find every outside side.
function buildFindTask(): SurveyorTask {
  const s = irregularShape(8, 16);
  return {
    kind: "perimeterCalc",
    scene: "measureEvery",
    prompt: "Tap every outside side to measure it.",
    speakText: "Follow the whole boundary. Tap every outside side of the shape to measure it — don't miss any.",
    badgeLabel: "Find Every Side",
    ...core(s),
    feedback: { correct: "Every side measured — nice surveying!", wrong: "Keep going — measure every side." },
  };
}

// Activity B — Calculate the irregular perimeter (typed).
function buildCalcTask(): SurveyorTask {
  const s = irregularShape(8, 16);
  return {
    kind: "perimeterCalc",
    scene: "calc",
    prompt: `What is the perimeter of the ${s.shapeName}?`,
    speakText: `Add every outside side. What is the perimeter of the ${s.shapeName}?`,
    badgeLabel: "Find the Perimeter",
    ...core(s),
    answerValue: s.perimeter,
    answerUnit: s.unit,
    feedback: { correct: `Yes — ${s.perimeter} ${s.unit}.`, wrong: `Add every side once — it's ${s.perimeter} ${s.unit}.` },
  };
}

// Activity C — Survey the park (MCQ).
function buildSurveyTask(): SurveyorTask {
  const s = irregularShape(8, 16);
  const { options, correct } = perimeterOptions(s);
  return {
    kind: "perimeterCalc",
    scene: "choose",
    prompt: `What is the perimeter of the ${s.shapeName}?`,
    speakText: `Survey the ${s.shapeName}. What is the perimeter all the way around?`,
    badgeLabel: "Survey the Park",
    ...core(s),
    options,
    correctNumber: correct,
    answerUnit: s.unit,
    feedback: { correct: `Yes — ${correct} ${s.unit} around.`, wrong: `Add every outside side — it's ${correct} ${s.unit}.` },
  };
}

export function generateY5MeasurelandsWeek3Lesson2Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) { memory.introShown = true; return buildIntroTask(); }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "calc") return buildCalcTask();
  if (activity === "survey") return buildSurveyTask();
  return buildFindTask();
}

export function resetY5MeasurelandsWeek3Lesson2TaskSessionState() {
  lessonMemory.clear();
}

export function buildY5MeasurelandsWeek3Lesson2QuizTasks(): PracticeTask[] {
  return [buildSurveyTask(), buildSurveyTask(), buildSurveyTask(), buildSurveyTask(), buildSurveyTask()];
}
