import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { ML_OBJECTS, L_OBJECTS, ALL_CAP_OBJECTS, type CapObject } from "@/data/activities/year3Measurelands/capacityObjects";

// ── Measurelands · L3 · Week 4 · Lesson 1 — "Meet mL & L" (Learn) ──
// AC9M3M01: recognise millilitres and litres and choose the sensible unit.
// THREE rotating activities: chooseUnit · sort · spotMistake.

type CapTask = Extract<PracticeTask, { kind: "capacity" }>;

type LessonMemory = { introShown: boolean; cursor: number; recent: string[] };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"chooseUnit" | "sort" | "spotMistake"> = ["chooseUnit", "sort", "spotMistake", "chooseUnit", "spotMistake", "sort"];

function getMemory(id: string): LessonMemory {
  const e = lessonMemory.get(id);
  if (e) return e;
  const c: LessonMemory = { introShown: false, cursor: 0, recent: [] };
  lessonMemory.set(id, c);
  return c;
}
function randInt(n: number) { return Math.floor(Math.random() * n); }
function shuffle<T>(a: T[]): T[] { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j]!, b[i]!]; } return b; }
function pick(memory: LessonMemory, pool: CapObject[] = ALL_CAP_OBJECTS): CapObject {
  for (let k = 0; k < 30; k++) { const o = pool[randInt(pool.length)]!; if (!memory.recent.includes(o.label)) { memory.recent.push(o.label); if (memory.recent.length > 6) memory.recent.shift(); return o; } }
  return pool[randInt(pool.length)]!;
}

function buildIntro(): CapTask {
  return {
    kind: "capacity", scene: "intro",
    prompt: "Meet millilitres and litres!",
    speakText: "Professor Gauge says: scientists don't always measure with cups. Today we'll use millilitres and litres. Small amounts use millilitres, large amounts use litres. One litre is 1000 millilitres.",
    badgeLabel: "Meazurex Mission",
    feedback: { correct: "Let's measure!", wrong: "Let's measure!" },
  };
}

function buildChooseUnit(memory: LessonMemory): CapTask {
  const o = pick(memory);
  const correct = o.unit === "L" ? "Litres (L)" : "Millilitres (mL)";
  return {
    kind: "capacity", scene: "chooseUnit",
    prompt: `Would you measure a ${o.label} in millilitres or litres?`,
    speakText: `Would you measure a ${o.label} in millilitres or litres?`,
    badgeLabel: "Which Unit?",
    object: { label: o.label, emoji: o.emoji },
    options: ["Millilitres (mL)", "Litres (L)"],
    correctOption: correct,
    feedback: {
      correct: o.unit === "L" ? `Yes — a ${o.label} holds a lot, so use litres.` : `Yes — a ${o.label} holds a little, so use millilitres.`,
      wrong: o.unit === "L" ? `A ${o.label} holds a lot — litres is the sensible unit.` : `A ${o.label} holds a little — millilitres is the sensible unit.`,
    },
  };
}

function buildSort(memory: LessonMemory): CapTask {
  const ml = shuffle(ML_OBJECTS).slice(0, 3);
  const l = shuffle(L_OBJECTS).slice(0, 3);
  const items = shuffle([...ml, ...l]).map((o) => ({ label: o.label, emoji: o.emoji, unit: o.unit }));
  memory.recent = items.map((i) => i.label).slice(-6);
  return {
    kind: "capacity", scene: "sort",
    prompt: "Sort each container into millilitres or litres.",
    speakText: "Sort each container. Tap a container, then tap the millilitres bin or the litres bin.",
    badgeLabel: "Sort the Containers",
    items,
    feedback: { correct: "All sorted — great unit choices!", wrong: "Not that bin — think how much it holds." },
  };
}

function buildSpotMistake(memory: LessonMemory): CapTask {
  const o = pick(memory);
  const correctClaim = randInt(2) === 0;
  if (correctClaim) {
    return {
      kind: "capacity", scene: "spotMistake",
      prompt: "Does that make sense?",
      speakText: `Professor Gauge says a ${o.label} holds about ${o.capacity} ${o.unit}. Does that make sense?`,
      badgeLabel: "Does That Make Sense?",
      object: { label: o.label, emoji: o.emoji },
      statement: `A ${o.label} holds about ${o.capacity} ${o.unit}.`,
      options: ["Yes, that makes sense", "No, that's not sensible"],
      correctOption: "Yes, that makes sense",
      feedback: { correct: `Right — a ${o.label} holds about ${o.capacity} ${o.unit}.`, wrong: `That one is fine — a ${o.label} really holds about ${o.capacity} ${o.unit}.` },
    };
  }
  // silly claim: swap to the wrong unit + an odd value
  const wrongUnit = o.unit === "mL" ? "L" : "mL";
  const sillyVal = o.unit === "mL" ? 5 + randInt(30) /* huge in L */ : 5 + randInt(45); /* tiny in mL */
  return {
    kind: "capacity", scene: "spotMistake",
    prompt: "Does that make sense?",
    speakText: `Professor Gauge says a ${o.label} holds ${sillyVal} ${wrongUnit}. Does that make sense?`,
    badgeLabel: "Does That Make Sense?",
    object: { label: o.label, emoji: o.emoji },
    statement: `A ${o.label} holds ${sillyVal} ${wrongUnit}.`,
    options: ["No, that's not sensible", "Yes, that makes sense"],
    correctOption: "No, that's not sensible",
    feedback: { correct: `Yes — a ${o.label} should be measured in ${o.unit}, about ${o.capacity} ${o.unit}.`, wrong: `Look again — ${sillyVal} ${wrongUnit} is silly for a ${o.label}. It holds about ${o.capacity} ${o.unit}.` },
  };
}

export function generateY3MeasurelandsWeek4Lesson1Task(lessonId: string, _d: Difficulty): PracticeTask {
  const m = getMemory(lessonId);
  if (!m.introShown) { m.introShown = true; return buildIntro(); }
  const a = ROTATION[m.cursor % ROTATION.length]!;
  m.cursor += 1;
  if (a === "sort") return buildSort(m);
  if (a === "spotMistake") return buildSpotMistake(m);
  return buildChooseUnit(m);
}
export function resetY3MeasurelandsWeek4Lesson1TaskSessionState() { lessonMemory.clear(); }
export function buildY3MeasurelandsWeek4Lesson1QuizTasks(): PracticeTask[] {
  const s: LessonMemory = { introShown: true, cursor: 0, recent: [] };
  return [buildChooseUnit(s), buildSpotMistake(s), buildChooseUnit(s), buildSpotMistake(s), buildChooseUnit(s)];
}
