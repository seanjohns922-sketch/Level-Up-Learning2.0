import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { regularShape, irregularShape, perimeterOptions, randInt, type Shape } from "@/data/activities/year5Measurelands/week3Common";

// ── Measurelands · Level 5 · Week 3 · Lesson 3 — "Perimeter Problems" (AC9M5M02) ──
// Solve authentic perimeter problems across regular and irregular land.
//   A. fence   — fence the farm (how much fencing?).
//   B. trail   — walking trail (how far around?).
//   C. mission — survey mission (mixed regular / irregular).

type SurveyorTask = Extract<PracticeTask, { kind: "perimeterCalc" }>;

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"fence" | "trail" | "mission"> = ["fence", "trail", "mission", "fence", "trail", "mission"];

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
  const s = regularShape(8, 14);
  return {
    kind: "perimeterCalc",
    scene: "intro",
    prompt: "Surveyors measure boundaries every day.",
    speakText:
      "Professor Gauge says: surveyors measure boundaries every day. Use perimeter to work out fences, paths and walking tracks around real land.",
    badgeLabel: "Meazurex Mission",
    introLines: [
      "Surveyors measure boundaries every day.",
      "Use perimeter to work out fences, paths and walking tracks.",
    ],
    ...core(s),
    feedback: { correct: "Let's survey!", wrong: "Let's survey!" },
  };
}

// Activity A — Fence the farm (typed or MCQ).
function buildFenceTask(asMcq = false): SurveyorTask {
  const s = regularShape(8, 22);
  const base = {
    kind: "perimeterCalc" as const,
    scene: "problem" as const,
    prompt: `How much fencing goes around the ${s.shapeName}?`,
    speakText: `A farmer is fencing the ${s.shapeName}. How much fencing goes all the way around?`,
    badgeLabel: "Fence the Farm",
    ...core(s),
    answerUnit: s.unit,
    feedback: { correct: `Yes — ${s.perimeter} ${s.unit} of fencing.`, wrong: `Add every side — ${s.perimeter} ${s.unit}.` },
  };
  if (asMcq) { const { options, correct } = perimeterOptions(s); return { ...base, options, correctNumber: correct }; }
  return { ...base, answerValue: s.perimeter };
}

// Activity B — Walking trail (MCQ).
function buildTrailTask(): SurveyorTask {
  const s = randInt(2) === 0 ? irregularShape(8, 18) : regularShape(8, 20);
  const { options, correct } = perimeterOptions(s);
  return {
    kind: "perimeterCalc",
    scene: "problem",
    prompt: `How far is it around the ${s.shapeName}?`,
    speakText: `How far is the walking trail all the way around the ${s.shapeName}?`,
    badgeLabel: "Walking Trail",
    ...core(s),
    options,
    correctNumber: correct,
    answerUnit: s.unit,
    feedback: { correct: `Yes — ${correct} ${s.unit} around.`, wrong: `Add every side — it's ${correct} ${s.unit}.` },
  };
}

// Activity C — Survey mission (mixed regular / irregular, MCQ).
function buildMissionTask(): SurveyorTask {
  const s = randInt(2) === 0 ? irregularShape(8, 18) : regularShape(8, 22);
  const { options, correct } = perimeterOptions(s);
  return {
    kind: "perimeterCalc",
    scene: "problem",
    prompt: `What is the perimeter of the ${s.shapeName}?`,
    speakText: `Survey mission: what is the perimeter all the way around the ${s.shapeName}?`,
    badgeLabel: "Survey Mission",
    ...core(s),
    options,
    correctNumber: correct,
    answerUnit: s.unit,
    feedback: { correct: `Yes — ${correct} ${s.unit} around the ${s.shapeName}.`, wrong: `Measure all the way around — ${correct} ${s.unit}.` },
  };
}

export function generateY5MeasurelandsWeek3Lesson3Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) { memory.introShown = true; return buildIntroTask(); }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "trail") return buildTrailTask();
  if (activity === "mission") return buildMissionTask();
  return buildFenceTask(randInt(2) === 0);
}

export function resetY5MeasurelandsWeek3Lesson3TaskSessionState() {
  lessonMemory.clear();
}

export function buildY5MeasurelandsWeek3Lesson3QuizTasks(): PracticeTask[] {
  return [buildFenceTask(true), buildTrailTask(), buildMissionTask(), buildTrailTask(), buildMissionTask()];
}
