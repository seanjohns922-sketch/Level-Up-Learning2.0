import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { BINARY, BOTH, decisionTask, choose } from "@/data/activities/year5Measurelands/week5Common";
import { rectDims, areaOptions } from "@/data/activities/year5Measurelands/week4Common";
import { regularShape, perimeterOptions, type Shape } from "@/data/activities/year5Measurelands/week3Common";

// ── Measurelands · Level 5 · Week 5 · Lesson 3 — "Design Challenge" (AC9M5M02) ──
// Decide the measurement, then solve.
//   A. decide     — area, perimeter or both for a design job?
//   B. grass      — solve an area problem (how much grass/turf?).
//   C. fence      — solve a perimeter problem (how much fencing?).

type AreaTask = Extract<PracticeTask, { kind: "area" }>;
type SurveyorTask = Extract<PracticeTask, { kind: "perimeterCalc" }>;

type LessonMemory = { cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"decide" | "grass" | "fence"> = ["decide", "grass", "fence", "decide", "grass", "fence"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

const AREA_PLACES: Array<{ label: string; emoji: string; verb: string }> = [
  { label: "playground", emoji: "🛝", verb: "soft fall" },
  { label: "classroom", emoji: "🏫", verb: "carpet" },
  { label: "garden bed", emoji: "🌱", verb: "grass" },
  { label: "sports court", emoji: "🏀", verb: "surface" },
];

// Activity B — solve an area problem (reuses the array model).
function buildGrassTask(): AreaTask {
  const p = choose(AREA_PLACES);
  const { w, h } = rectDims(3, 8);
  const { options, correct } = areaOptions(w, h);
  return {
    kind: "area",
    scene: "arrayArea",
    gridW: w,
    gridH: h,
    context: `${p.label} — ${p.verb}`,
    emoji: p.emoji,
    areaUnit: "m²",
    prompt: `How much ${p.verb} covers the ${p.label}?`,
    speakText: `The ${p.label} needs ${p.verb} on every square. How much ${p.verb} covers it?`,
    badgeLabel: "Cover the Space",
    options,
    correctNumber: correct,
    feedback: { correct: `Yes — ${h} × ${w} = ${correct} m².`, wrong: `Rows × columns — ${h} × ${w} = ${correct} m².` },
  };
}

// Activity C — solve a perimeter problem (reuses the Perimeter Trace).
function core(s: Shape) {
  return { poly: s.poly, sideLabels: s.sideLabels, perimeter: s.perimeter, unit: s.unit, theme: s.theme, shapeName: s.shapeName };
}
function buildFenceTask(): SurveyorTask {
  const s = regularShape(6, 20);
  const { options, correct } = perimeterOptions(s);
  return {
    kind: "perimeterCalc",
    scene: "problem",
    prompt: `How much fencing goes around the ${s.shapeName}?`,
    speakText: `How much fencing goes all the way around the ${s.shapeName}?`,
    badgeLabel: "Fence the Space",
    ...core(s),
    options,
    correctNumber: correct,
    answerUnit: s.unit,
    feedback: { correct: `Yes — ${correct} ${s.unit} of fencing.`, wrong: `Add every side — ${correct} ${s.unit}.` },
  };
}

export function generateY5MeasurelandsWeek5Lesson3Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "grass") return buildGrassTask();
  if (activity === "fence") return buildFenceTask();
  return decisionTask(choose([...BOTH, ...BINARY]), true);
}

export function resetY5MeasurelandsWeek5Lesson3TaskSessionState() {
  lessonMemory.clear();
}

export function buildY5MeasurelandsWeek5Lesson3QuizTasks(): PracticeTask[] {
  return [
    decisionTask(choose([...BOTH, ...BINARY]), true),
    buildGrassTask(),
    buildFenceTask(),
    buildGrassTask(),
    buildFenceTask(),
  ];
}
