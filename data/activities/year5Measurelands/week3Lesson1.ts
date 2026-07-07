import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { rectShape, regularShape, perimeterOptions, type Shape } from "@/data/activities/year5Measurelands/week3Common";

// ── Measurelands · Level 5 · Week 3 · Lesson 1 — "Efficient Perimeter" (AC9M5M02) ──
// Calculate perimeter efficiently — opposite sides are equal, so measure once.
//   A. once    — measure two sides, use the equal opposite sides (tap).
//   B. calc    — add every side to find the perimeter (typed).
//   C. builder — choose the perimeter (MCQ builder challenge).

type SurveyorTask = Extract<PracticeTask, { kind: "perimeterCalc" }>;

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"once" | "calc" | "builder"> = ["once", "calc", "builder", "once", "calc", "builder"];

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
  const s = rectShape(6, 12);
  return {
    kind: "perimeterCalc",
    scene: "intro",
    prompt: "Master surveyors don't measure the same side twice.",
    speakText:
      "Professor Gauge says: master surveyors don't measure the same side twice. If opposite sides are equal, measure once and use the value twice. That's efficient perimeter.",
    badgeLabel: "Meazurex Mission",
    introLines: [
      "Master surveyors don't measure the same side twice.",
      "If opposite sides are equal, measure once and use the value twice.",
    ],
    ...core(s),
    feedback: { correct: "Let's survey!", wrong: "Let's survey!" },
  };
}

// Activity A — Measure once, use twice.
function buildOnceTask(): SurveyorTask {
  const s = rectShape(6, 18);
  return {
    kind: "perimeterCalc",
    scene: "measureOnce",
    prompt: "A surveyor measured two sides. Find the perimeter.",
    speakText: "The surveyor measured two sides. Opposite sides are equal — tap each unknown side and choose its length, then find the perimeter.",
    badgeLabel: "Measure Once, Use Twice",
    ...core(s),
    measuredSides: [0, 1],
    feedback: { correct: `Yes — ${s.perimeter} ${s.unit} all the way around.`, wrong: "Opposite sides are equal — match the side across from it." },
  };
}

// Activity B — Calculate the perimeter (typed).
function buildCalcTask(): SurveyorTask {
  const s = regularShape(6, 20);
  return {
    kind: "perimeterCalc",
    scene: "calc",
    prompt: `What is the perimeter of the ${s.shapeName}?`,
    speakText: `Add every side. What is the perimeter of the ${s.shapeName}?`,
    badgeLabel: "Find the Perimeter",
    ...core(s),
    answerValue: s.perimeter,
    answerUnit: s.unit,
    feedback: { correct: `Yes — ${s.perimeter} ${s.unit}.`, wrong: `Add every side once — it's ${s.perimeter} ${s.unit}.` },
  };
}

// Activity C — Builder challenge (MCQ).
function buildBuilderTask(): SurveyorTask {
  const s = regularShape(6, 20);
  const { options, correct } = perimeterOptions(s);
  return {
    kind: "perimeterCalc",
    scene: "choose",
    prompt: `How much fencing goes around the ${s.shapeName}?`,
    speakText: `How much fencing goes all the way around the ${s.shapeName}?`,
    badgeLabel: "Builder Challenge",
    ...core(s),
    options,
    correctNumber: correct,
    answerUnit: s.unit,
    feedback: { correct: `Yes — ${correct} ${s.unit} of fencing.`, wrong: `Add every side — it's ${correct} ${s.unit}.` },
  };
}

export function generateY5MeasurelandsWeek3Lesson1Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) { memory.introShown = true; return buildIntroTask(); }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "calc") return buildCalcTask();
  if (activity === "builder") return buildBuilderTask();
  return buildOnceTask();
}

export function resetY5MeasurelandsWeek3Lesson1TaskSessionState() {
  lessonMemory.clear();
}

// Weekly-quiz contribution — MCQ-safe (measureOnce is interactive; the quiz uses
// the calc/builder scenes as MCQ).
export function buildY5MeasurelandsWeek3Lesson1QuizTasks(): PracticeTask[] {
  return [buildBuilderTask(), buildBuilderTask(), buildBuilderTask(), buildBuilderTask(), buildBuilderTask()];
}
