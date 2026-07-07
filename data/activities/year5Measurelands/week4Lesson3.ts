import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { rectDims, areaOptions, choose } from "@/data/activities/year5Measurelands/week4Common";

// ── Measurelands · Level 5 · Week 4 · Lesson 3 — "Area Problems" (AC9M5M02) ──
// Use the array strategy to solve practical area problems.
//   A. playground — how much soft fall covers the playground? (MCQ)
//   B. carpet     — how much carpet covers the classroom? (typed)
//   C. mission    — architect mission: court / garden / courtyard (MCQ)

type AreaTask = Extract<PracticeTask, { kind: "area" }>;

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"playground" | "carpet" | "mission"> = ["playground", "carpet", "mission", "playground", "carpet", "mission"];

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
    prompt: "Architects use smart strategies.",
    speakText:
      "Professor Gauge says: architects don't count every tile — they use smart strategies. Use rows times columns to work out how much space you need to cover.",
    badgeLabel: "Meazurex Mission",
    feedback: { correct: "Let's design!", wrong: "Let's design!" },
  };
}

function buildPlaygroundTask(): AreaTask {
  const { w, h } = rectDims(3, 8);
  const { options, correct } = areaOptions(w, h);
  return {
    kind: "area",
    scene: "arrayArea",
    gridW: w,
    gridH: h,
    context: "playground soft fall",
    emoji: "🛝",
    areaUnit: "m²",
    prompt: "How much soft fall covers the playground?",
    speakText: "The playground needs soft fall on every square. How much soft fall covers it?",
    badgeLabel: "Playground Surface",
    options,
    correctNumber: correct,
    feedback: { correct: `Yes — ${h} × ${w} = ${correct} m² of soft fall.`, wrong: `Rows × columns — ${h} × ${w} = ${correct} m².` },
  };
}

function buildCarpetTask(): AreaTask {
  const { w, h } = rectDims(3, 8);
  return {
    kind: "area",
    scene: "calcArea",
    gridW: w,
    gridH: h,
    context: "classroom carpet",
    emoji: "🏫",
    areaUnit: "m²",
    prompt: "How much carpet covers the classroom?",
    speakText: "The classroom floor needs carpet. How much carpet covers it?",
    badgeLabel: "Classroom Carpet",
    answerValue: w * h,
    feedback: { correct: `Yes — ${h} × ${w} = ${w * h} m² of carpet.`, wrong: `Multiply rows by columns — ${h} × ${w} = ${w * h}.` },
  };
}

const MISSIONS: Array<{ label: string; emoji: string }> = [
  { label: "basketball court", emoji: "🏀" },
  { label: "vegetable garden", emoji: "🥕" },
  { label: "castle courtyard", emoji: "🏰" },
  { label: "picnic area", emoji: "🧺" },
  { label: "tiled courtyard", emoji: "🧱" },
];

function buildMissionTask(): AreaTask {
  const m = choose(MISSIONS);
  const { w, h } = rectDims(3, 8);
  const { options, correct } = areaOptions(w, h);
  return {
    kind: "area",
    scene: "arrayArea",
    gridW: w,
    gridH: h,
    context: m.label,
    emoji: m.emoji,
    areaUnit: "m²",
    prompt: `What area does the ${m.label} cover?`,
    speakText: `Architect mission: what area does the ${m.label} cover?`,
    badgeLabel: "Architect Mission",
    options,
    correctNumber: correct,
    feedback: { correct: `Yes — ${h} × ${w} = ${correct} m².`, wrong: `Rows × columns — ${h} × ${w} = ${correct} m².` },
  };
}

export function generateY5MeasurelandsWeek4Lesson3Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) { memory.introShown = true; return buildIntroTask(); }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "carpet") return buildCarpetTask();
  if (activity === "mission") return buildMissionTask();
  return buildPlaygroundTask();
}

export function resetY5MeasurelandsWeek4Lesson3TaskSessionState() {
  lessonMemory.clear();
}

export function buildY5MeasurelandsWeek4Lesson3QuizTasks(): PracticeTask[] {
  return [buildPlaygroundTask(), buildMissionTask(), buildPlaygroundTask(), buildMissionTask(), buildPlaygroundTask()];
}
