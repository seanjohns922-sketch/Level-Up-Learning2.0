import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { randomShape, perimeterOptions, choose, randInt } from "@/data/activities/year4Measurelands/week4Common";

// ── Measurelands · Level 4 · Week 4 · Lesson 2 — "Find the Perimeter" (AC9M4M02) ──
// Perimeter = the total distance around the outside. Add every side once (no
// formula). Reuses the surveyor shape.
// THREE rotating activities:
//   A. calc       — type the perimeter (add the sides).
//   B. choose      — pick the correct perimeter (misconception distractors).
//   C. spotMissed  — Professor Gauge's total: did he miss a side?

type SurveyorTask = Extract<PracticeTask, { kind: "perimeterCalc" }>;

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"calc" | "choose" | "spotMissed"> = ["calc", "choose", "spotMissed", "calc", "choose", "spotMissed"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

function shapeCore(shape: ReturnType<typeof randomShape>) {
  return {
    poly: shape.poly,
    sideLabels: shape.sideLabels,
    perimeter: shape.perimeter,
    unit: shape.unit,
    theme: shape.theme,
    shapeName: shape.shapeName,
  };
}

function buildIntroTask(): SurveyorTask {
  return {
    kind: "perimeterCalc",
    scene: "intro",
    prompt: "Perimeter is the total distance around the outside.",
    speakText:
      "Professor Gauge says: perimeter is the total distance around the outside. Measure every side, then add them all together. Four plus six plus four plus six is twenty.",
    badgeLabel: "Meazurex Mission",
    poly: [[0, 0], [6, 0], [6, 4], [0, 4]],
    sideLabels: [6, 4, 6, 4],
    perimeter: 20,
    unit: "cm",
    theme: "garden",
    shapeName: "garden bed",
    feedback: { correct: "Let's add!", wrong: "Let's add!" },
  };
}

// Activity A — Calculate the Perimeter (typed).
function buildCalcTask(): SurveyorTask {
  const shape = randomShape("cm", { min: 3, max: 9 });
  return {
    kind: "perimeterCalc",
    scene: "calc",
    prompt: `What is the perimeter of the ${shape.shapeName}?`,
    speakText: `Add every side. What is the perimeter of the ${shape.shapeName}?`,
    badgeLabel: "Find the Perimeter",
    ...shapeCore(shape),
    answerValue: shape.perimeter,
    answerUnit: shape.unit,
    feedback: {
      correct: `Yes — the sides add to ${shape.perimeter} ${shape.unit}.`,
      wrong: `Add every outside side once — the perimeter is ${shape.perimeter} ${shape.unit}.`,
    },
  };
}

// Activity B — Choose the Correct Perimeter.
function buildChooseTask(): SurveyorTask {
  const shape = randomShape("cm", { min: 3, max: 9 });
  const { options, correct } = perimeterOptions(shape);
  return {
    kind: "perimeterCalc",
    scene: "choose",
    prompt: `Which is the perimeter of the ${shape.shapeName}?`,
    speakText: `Which is the perimeter of the ${shape.shapeName}? Add every side.`,
    badgeLabel: "Choose the Perimeter",
    ...shapeCore(shape),
    options,
    correctNumber: correct,
    feedback: {
      correct: `Yes — ${correct} ${shape.unit} all the way around.`,
      wrong: `Add every side once — it's ${correct} ${shape.unit}, not the area or just two sides.`,
    },
  };
}

// Activity C — Professor Gauge's Mistake (did he miss a side?).
function buildSpotMissedTask(): SurveyorTask {
  const shape = randomShape("cm", { min: 3, max: 9 });
  const gaugeRight = randInt(2) === 0;
  const claim = gaugeRight ? shape.perimeter : shape.perimeter - choose(shape.sideLabels);
  return {
    kind: "perimeterCalc",
    scene: "spotMissed",
    prompt: "Did Professor Gauge find the perimeter correctly?",
    speakText: `Professor Gauge added the sides and got ${claim} ${shape.unit}. Did he find the perimeter correctly?`,
    badgeLabel: "Professor Gauge's Mistake",
    ...shapeCore(shape),
    answerValue: claim, // the card compares claim vs true perimeter
    statement: `Professor Gauge got ${claim} ${shape.unit}.`,
    feedback: {
      correct: gaugeRight
        ? `Right — ${shape.perimeter} ${shape.unit} is correct.`
        : `Right — he missed a side. It should be ${shape.perimeter} ${shape.unit}.`,
      wrong: gaugeRight
        ? `Add the sides — ${shape.perimeter} ${shape.unit} is correct.`
        : `Check every side — he missed one. It's ${shape.perimeter} ${shape.unit}.`,
    },
  };
}

export function generateY4MeasurelandsWeek4Lesson2Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "choose") return buildChooseTask();
  if (activity === "spotMissed") return buildSpotMissedTask();
  return buildCalcTask();
}

export function resetY4MeasurelandsWeek4Lesson2TaskSessionState() {
  lessonMemory.clear();
}

export function buildY4MeasurelandsWeek4Lesson2QuizTasks(): PracticeTask[] {
  // MCQ-safe: choose (options) + spotMissed (Yes/No). Calc keypad omitted here.
  return [buildChooseTask(), buildSpotMissedTask(), buildChooseTask(), buildSpotMissedTask(), buildChooseTask()];
}
