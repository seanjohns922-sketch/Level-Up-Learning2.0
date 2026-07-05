import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { ML_OBJECTS, L_OBJECTS, ALL_CAP_OBJECTS, type CapObject } from "@/data/activities/year3Measurelands/capacityObjects";

// ── Measurelands · L3 · Week 4 · Lesson 3 — "Compare Capacity" (Apply) ──
// AC9M3M02: use measured capacities to compare, order and find differences.
// THREE rotating activities: compareMore · order · howMuchMore (typed).

type CapTask = Extract<PracticeTask, { kind: "capacity" }>;
type Item = { label: string; emoji: string; value: number; unit: "mL" | "L" };

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"compareMore" | "order" | "howMuchMore"> = ["compareMore", "order", "howMuchMore", "compareMore", "howMuchMore", "order"];

function getMemory(id: string): LessonMemory {
  const e = lessonMemory.get(id);
  if (e) return e;
  const c: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(id, c);
  return c;
}
function randInt(n: number) { return Math.floor(Math.random() * n); }
function shuffle<T>(a: T[]): T[] { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j]!, b[i]!]; } return b; }
function toMl(v: number, u: "mL" | "L") { return u === "L" ? v * 1000 : v; }

/** n distinct objects, each shown at its REAL capacity; comparable values all distinct. */
function pickItems(n: number, forceUnit?: "mL" | "L"): Item[] {
  const pool = forceUnit === "mL" ? ML_OBJECTS : forceUnit === "L" ? L_OBJECTS : ALL_CAP_OBJECTS;
  for (let attempt = 0; attempt < 60; attempt++) {
    const objs = shuffle(pool).slice(0, n);
    const items = objs.map((o: CapObject) => ({ label: o.label, emoji: o.emoji, unit: o.unit, value: o.capacity }));
    const comps = items.map((i) => toMl(i.value, i.unit));
    if (new Set(comps).size === n && new Set(items.map((i) => i.label)).size === n) return items;
  }
  return pool.slice(0, n).map((o: CapObject) => ({ label: o.label, emoji: o.emoji, unit: o.unit, value: o.capacity }));
}

function buildIntro(): CapTask {
  return {
    kind: "capacity", scene: "intro",
    prompt: "Now use the measurements!",
    speakText: "Professor Gauge says: reading the jug is only the beginning. Now let's use those measurements to compare, order and solve problems.",
    badgeLabel: "Meazurex Mission",
    feedback: { correct: "Let's compare!", wrong: "Let's compare!" },
  };
}

function buildCompareMore(_m: LessonMemory): CapTask {
  const items = pickItems(2);
  const more = toMl(items[0]!.value, items[0]!.unit) > toMl(items[1]!.value, items[1]!.unit) ? items[0]! : items[1]!;
  return {
    kind: "capacity", scene: "compareMore",
    prompt: "Which holds more?",
    speakText: `Which holds more, the ${items[0]!.label} or the ${items[1]!.label}?`,
    badgeLabel: "Which Holds More?",
    compareItems: items,
    correctLabel: more.label,
    compareMode: "more",
    options: shuffle(items.map((i) => i.label)),
    correctOption: more.label,
    feedback: { correct: `Yes — the ${more.label} holds more at ${more.value} ${more.unit}.`, wrong: `Compare the amounts — the ${more.label} holds more.` },
  };
}

function buildOrder(_m: LessonMemory): CapTask {
  const items = pickItems(4);
  const ordered = [...items].sort((a, b) => toMl(a.value, a.unit) - toMl(b.value, b.unit));
  return {
    kind: "capacity", scene: "order",
    prompt: "Order the containers from least to greatest.",
    speakText: "Tap the containers in order, from the least capacity to the greatest.",
    badgeLabel: "Order by Capacity",
    compareItems: shuffle(items),
    orderedLabels: ordered.map((i) => i.label),
    feedback: { correct: "Good ordering — least to greatest!", wrong: "Start with the least — tap the smallest amount first." },
  };
}

function buildHowMuchMore(_m: LessonMemory): CapTask {
  const unit: "mL" | "L" = randInt(2) === 0 ? "mL" : "L";
  const items = pickItems(2, unit);
  const hi = items[0]!.value > items[1]!.value ? items[0]! : items[1]!;
  const lo = hi === items[0]! ? items[1]! : items[0]!;
  const diff = hi.value - lo.value;
  const step = unit === "mL" ? 100 : 1;
  const opts = new Set<number>([diff, Math.max(1, diff - step), diff + step]);
  return {
    kind: "capacity", scene: "howMuchMore",
    prompt: `How much more does the ${hi.label} hold than the ${lo.label}?`,
    speakText: `How much more does the ${hi.label} hold than the ${lo.label}? Type your answer.`,
    badgeLabel: "How Much More?",
    compareItems: [hi, lo],
    answerValue: diff,
    answerUnit: unit,
    // quiz-compatible MCQ mirror:
    options: shuffle([...opts]).map((n) => `${n} ${unit}`),
    correctOption: `${diff} ${unit}`,
    feedback: { correct: `Yes — ${hi.value} − ${lo.value} = ${diff} ${unit}.`, wrong: `Take away: ${hi.value} − ${lo.value} = ${diff} ${unit}.` },
  };
}

export function generateY3MeasurelandsWeek4Lesson3Task(lessonId: string, _d: Difficulty): PracticeTask {
  const m = getMemory(lessonId);
  if (!m.introShown) { m.introShown = true; return buildIntro(); }
  const a = ROTATION[m.cursor % ROTATION.length]!;
  m.cursor += 1;
  if (a === "order") return buildOrder(m);
  if (a === "howMuchMore") return buildHowMuchMore(m);
  return buildCompareMore(m);
}
export function resetY3MeasurelandsWeek4Lesson3TaskSessionState() { lessonMemory.clear(); }
export function buildY3MeasurelandsWeek4Lesson3QuizTasks(): PracticeTask[] {
  const s: LessonMemory = { introShown: true, cursor: 0 };
  return [buildCompareMore(s), buildHowMuchMore(s), buildCompareMore(s), buildHowMuchMore(s), buildCompareMore(s)];
}
