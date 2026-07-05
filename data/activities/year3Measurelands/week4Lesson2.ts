import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { ALL_CAP_OBJECTS, type CapObject } from "@/data/activities/year3Measurelands/capacityObjects";

// ── Measurelands · L3 · Week 4 · Lesson 2 — "Read the Jug" (Read) ──
// AC9M3M02: read a measuring jug (an instrument with labelled markings).
// THREE rotating activities: readJug · matchJug · whichJug.

type CapTask = Extract<PracticeTask, { kind: "capacity" }>;
type JugSpec = { unit: "mL" | "L"; max: number; majorStep: number; values: number[] };

const JUGS: JugSpec[] = [
  { unit: "mL", max: 1000, majorStep: 250, values: [250, 500, 750, 1000] },
  { unit: "mL", max: 500, majorStep: 100, values: [100, 200, 300, 400, 500] },
  { unit: "L", max: 6, majorStep: 1, values: [1, 2, 3, 4, 5] },
];

type LessonMemory = { introShown: boolean; cursor: number; recent: string[] };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"readJug" | "matchJug" | "whichJug"> = ["readJug", "matchJug", "whichJug", "readJug", "whichJug", "matchJug"];

function getMemory(id: string): LessonMemory {
  const e = lessonMemory.get(id);
  if (e) return e;
  const c: LessonMemory = { introShown: false, cursor: 0, recent: [] };
  lessonMemory.set(id, c);
  return c;
}
function randInt(n: number) { return Math.floor(Math.random() * n); }
function choose<T>(a: T[]): T { return a[randInt(a.length)]!; }
function shuffle<T>(a: T[]): T[] { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j]!, b[i]!]; } return b; }

function buildIntro(): CapTask {
  return {
    kind: "capacity", scene: "intro",
    prompt: "Read the measuring jug.",
    speakText: "Professor Gauge says: scientists read measuring jugs the same way we read rulers. Look at where the water reaches, then read the number and unit on the scale.",
    badgeLabel: "Meazurex Mission",
    feedback: { correct: "Let's read!", wrong: "Let's read!" },
  };
}

function buildReadJug(memory: LessonMemory): CapTask {
  const spec = choose(JUGS);
  const value = choose(spec.values);
  const step = spec.majorStep;
  const opts = new Set<number>([value, value - step, value + step]);
  while (opts.size < 3) opts.add(value + step * (1 + randInt(2)));
  const numberOptions = shuffle([...opts].filter((n) => n > 0 && n <= spec.max)).slice(0, 3);
  if (!numberOptions.includes(value)) numberOptions[0] = value;
  memory.recent = [`${value}${spec.unit}`];
  return {
    kind: "capacity", scene: "readJug",
    prompt: "How much liquid is in the jug?",
    speakText: "How much liquid is in the jug? Read where the water reaches on the scale.",
    badgeLabel: "Read the Jug",
    jug: { value, unit: spec.unit, max: spec.max, majorStep: spec.majorStep },
    numberOptions: shuffle(numberOptions),
    correctNumber: value,
    readUnit: spec.unit,
    // quiz-compatible MCQ mirror:
    options: shuffle(numberOptions).map((n) => `${n} ${spec.unit}`),
    correctOption: `${value} ${spec.unit}`,
    feedback: { correct: `Yes — the water is at ${value} ${spec.unit}.`, wrong: `Look again — the water reaches the ${value} ${spec.unit} mark.` },
  };
}

function buildMatchJug(_memory: LessonMemory): CapTask {
  const spec = choose(JUGS);
  const vals = shuffle(spec.values).slice(0, 3);
  const target = choose(vals);
  const jugs = shuffle(vals.map((v, i) => ({ id: `j${i}`, value: v, unit: spec.unit, max: spec.max, majorStep: spec.majorStep })));
  const correct = jugs.find((j) => j.value === target)!;
  return {
    kind: "capacity", scene: "matchJug",
    prompt: `Which jug shows ${target} ${spec.unit}?`,
    speakText: `Which jug shows ${target} ${spec.unit}? Read each scale.`,
    badgeLabel: "Match the Jug",
    jugs,
    correctJugId: correct.id,
    feedback: { correct: `Yes — that jug reads ${target} ${spec.unit}.`, wrong: `Read the water line — find the jug at ${target} ${spec.unit}.` },
  };
}

function buildWhichJug(memory: LessonMemory): CapTask {
  let o: CapObject = choose(ALL_CAP_OBJECTS);
  for (let k = 0; k < 20 && memory.recent.includes(o.label); k++) o = choose(ALL_CAP_OBJECTS);
  memory.recent.push(o.label); if (memory.recent.length > 6) memory.recent.shift();
  const correct = `${o.capacity} ${o.unit}`;
  const wrongUnit = o.unit === "mL" ? "L" : "mL";
  const distractors = [`${o.capacity} ${wrongUnit}`, o.unit === "mL" ? `${1 + randInt(5)} L` : `${20 + randInt(60)} mL`];
  return {
    kind: "capacity", scene: "whichJug",
    prompt: `Which is a sensible amount for a ${o.label}?`,
    speakText: `Which is a sensible amount for a ${o.label}?`,
    badgeLabel: "Which Reading Is Correct?",
    object: { label: o.label, emoji: o.emoji },
    options: shuffle([correct, ...distractors]),
    correctOption: correct,
    feedback: { correct: `Yes — a ${o.label} holds about ${correct}.`, wrong: `Think about its size — a ${o.label} holds about ${correct}.` },
  };
}

export function generateY3MeasurelandsWeek4Lesson2Task(lessonId: string, _d: Difficulty): PracticeTask {
  const m = getMemory(lessonId);
  if (!m.introShown) { m.introShown = true; return buildIntro(); }
  const a = ROTATION[m.cursor % ROTATION.length]!;
  m.cursor += 1;
  if (a === "matchJug") return buildMatchJug(m);
  if (a === "whichJug") return buildWhichJug(m);
  return buildReadJug(m);
}
export function resetY3MeasurelandsWeek4Lesson2TaskSessionState() { lessonMemory.clear(); }
export function buildY3MeasurelandsWeek4Lesson2QuizTasks(): PracticeTask[] {
  const s: LessonMemory = { introShown: true, cursor: 0, recent: [] };
  return [buildReadJug(s), buildWhichJug(s), buildReadJug(s), buildWhichJug(s), buildReadJug(s)];
}
