import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { makeRect, makeSquare, makeL, perimeterOptions, randRange, choose, randInt, type Shape } from "@/data/activities/year4Measurelands/week4Common";

// ── Measurelands · Level 4 · Week 4 · Lesson 3 — "Perimeter Problems" (AC9M4M02) ──
// Real-world surveying: fences, paths and enclosures, in metres.
// THREE rotating activities:
//   A. fence   — how much fencing goes around the garden? (typed)
//   B. path    — how far around the playground path? (choose)
//   C. mission — surveyor mission: paddock / pool / enclosure (typed or choose)

type SurveyorTask = Extract<PracticeTask, { kind: "perimeterCalc" }>;

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"fence" | "path" | "mission"> = ["fence", "path", "mission", "fence", "path", "mission"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

function shapeCore(shape: Shape) {
  return { poly: shape.poly, sideLabels: shape.sideLabels, perimeter: shape.perimeter, unit: shape.unit, theme: shape.theme, shapeName: shape.shapeName };
}

function landShape(theme: Shape["theme"], name: string): Shape {
  const kind = randInt(3);
  let s: Shape;
  if (kind === 1) s = makeSquare(randRange(6, 20), "m");
  else if (kind === 2) {
    const W = randRange(10, 22), H = randRange(10, 22);
    s = makeL(W, H, randRange(3, W - 3), randRange(3, H - 3), "m");
  } else {
    let w = randRange(6, 22), h = randRange(6, 22);
    if (w === h) h += 1;
    s = makeRect(w, h, "m");
  }
  return { ...s, theme, shapeName: name };
}

function buildIntroTask(): SurveyorTask {
  const s = makeRect(12, 8, "m");
  return {
    kind: "perimeterCalc",
    scene: "intro",
    prompt: "Surveyors don't measure shapes — they measure land.",
    speakText:
      "Professor Gauge says: surveyors don't just measure shapes, they measure land. Use the perimeter to work out how much fencing a garden needs, or how far it is around a playground.",
    badgeLabel: "Meazurex Mission",
    ...shapeCore({ ...s, theme: "garden", shapeName: "garden" }),
    feedback: { correct: "Let's survey!", wrong: "Let's survey!" },
  };
}

// Activity A — Garden Fence (typed).
function buildFenceTask(): SurveyorTask {
  const shape = landShape("garden", choose(["garden", "vegetable patch", "flower bed"]));
  return {
    kind: "perimeterCalc",
    scene: "problem",
    prompt: `How much fencing goes all the way around the ${shape.shapeName}?`,
    speakText: `How much fencing goes all the way around the ${shape.shapeName}? Add every side.`,
    badgeLabel: "Garden Fence",
    ...shapeCore(shape),
    answerValue: shape.perimeter,
    answerUnit: "m",
    feedback: {
      correct: `Yes — ${shape.perimeter} m of fencing.`,
      wrong: `The fence goes around every side — ${shape.perimeter} m.`,
    },
  };
}

// Activity B — Playground Path (choose).
function buildPathTask(): SurveyorTask {
  const shape = landShape("playground", choose(["playground", "basketball court", "sandpit"]));
  const { options, correct } = perimeterOptions(shape);
  return {
    kind: "perimeterCalc",
    scene: "problem",
    prompt: `How far is it around the ${shape.shapeName} path?`,
    speakText: `How far is it all the way around the ${shape.shapeName}? Add every side.`,
    badgeLabel: "Playground Path",
    ...shapeCore(shape),
    options,
    correctNumber: correct,
    answerUnit: "m",
    feedback: {
      correct: `Yes — ${correct} m around.`,
      wrong: `Add every side once — it's ${correct} m around.`,
    },
  };
}

// Activity C — Surveyor Mission (typed or choose).
const MISSIONS: Array<{ theme: Shape["theme"]; name: string }> = [
  { theme: "paddock", name: "paddock" },
  { theme: "pool", name: "swimming pool" },
  { theme: "park", name: "animal enclosure" },
  { theme: "playground", name: "cricket pitch" },
];

function buildMissionTask(asMcq = false): SurveyorTask {
  const m = choose(MISSIONS);
  const shape = landShape(m.theme, m.name);
  const base = {
    kind: "perimeterCalc" as const,
    scene: "problem" as const,
    prompt: `A surveyor is fencing the ${shape.shapeName}. What is the perimeter?`,
    speakText: `A surveyor needs to fence the ${shape.shapeName}. What is the perimeter? Add every side.`,
    badgeLabel: "Surveyor Mission",
    ...shapeCore(shape),
    answerUnit: "m" as const,
    feedback: {
      correct: `Yes — ${shape.perimeter} m around the ${shape.shapeName}.`,
      wrong: `Measure all the way around — ${shape.perimeter} m.`,
    },
  };
  if (asMcq) {
    const { options, correct } = perimeterOptions(shape);
    return { ...base, options, correctNumber: correct };
  }
  return { ...base, answerValue: shape.perimeter };
}

export function generateY4MeasurelandsWeek4Lesson3Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "path") return buildPathTask();
  if (activity === "mission") return buildMissionTask(randInt(2) === 0);
  return buildFenceTask();
}

export function resetY4MeasurelandsWeek4Lesson3TaskSessionState() {
  lessonMemory.clear();
}

export function buildY4MeasurelandsWeek4Lesson3QuizTasks(): PracticeTask[] {
  // MCQ-safe variants for the weekly quiz.
  return [buildPathTask(), buildMissionTask(true), buildPathTask(), buildMissionTask(true), buildPathTask()];
}
