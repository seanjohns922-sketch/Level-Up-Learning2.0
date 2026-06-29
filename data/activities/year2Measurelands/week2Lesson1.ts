import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { MASS_OBJECTS, type MassObject } from "@/data/activities/year1Measurelands/week2Lesson1";

// ── Measurelands · Level 2 (Year 2) · Week 2 · Lesson 1 — "Count the Weights" ──
// AC9M2M01. Year 2 thinking: Ground knew "which is heavier"; Level 1 measured
// "how many cubes"; Level 2 COMPARES AND REASONS using the measured mass —
// trusting the cubes over the picture, and finding the DIFFERENCE.
//   A — Count the Weights   (read a measured mass on a balanced scale)
//   B — Which Has Greater Mass?  (compare; the cubes decide, not the picture)
//   C — How Many More?      (the genuine Year-2 step: the mass difference)
// Reuses the massMeasure card (count / compare / new difference scene) and the
// shared mass object pool (each object's `look` size differs from its `cubes`
// mass, so bigger never means heavier). No new art.

type MassTask = Extract<PracticeTask, { kind: "massMeasure" }>;

// Reuse the shared (mass-audited) pool, full 1..12 range.
const POOL: MassObject[] = MASS_OBJECTS.filter((o) => o.cubes >= 1 && o.cubes <= 12);

type LessonMemory = { introShown: boolean; cursor: number; lastKey: string | null };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"difference" | "compare" | "count"> = ["difference", "compare", "count", "compare", "difference", "count"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, lastKey: null };
  lessonMemory.set(lessonId, created);
  return created;
}

function randInt(maxExclusive: number) {
  return Math.floor(Math.random() * maxExclusive);
}
function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}
function choose<T>(items: T[]): T {
  return items[randInt(items.length)]!;
}
function numberOptions(correct: number): number[] {
  const candidates = [correct + 1, correct - 1, correct + 2, correct - 2].filter(
    (n) => n >= 1 && n <= 12 && n !== correct,
  );
  return shuffle([correct, ...shuffle([...new Set(candidates)]).slice(0, 2)]);
}
function item(o: MassObject) {
  return { id: o.id, imageSrc: o.image, label: o.label, cubes: o.cubes };
}

// Two distinct objects with distinct masses; avoid an immediate repeat. When
// `misleading` is set, prefer pairs where the HEAVIER object looks smaller.
function pickPair(memory: LessonMemory, misleading: boolean): [MassObject, MassObject] {
  let fallback: [MassObject, MassObject] | null = null;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const a = choose(POOL);
    const b = choose(POOL.filter((o) => o.id !== a.id && o.cubes !== a.cubes && Math.abs(o.cubes - a.cubes) <= 6));
    if (!b) continue;
    const key = [a.id, b.id].sort().join("|");
    if (key === memory.lastKey) continue;
    fallback = fallback ?? [a, b];
    const heavier = a.cubes > b.cubes ? a : b;
    const lighter = a.cubes > b.cubes ? b : a;
    if (!misleading || heavier.look <= lighter.look) {
      memory.lastKey = key;
      return [a, b];
    }
  }
  const pair = fallback ?? [POOL[0]!, POOL[1]!];
  memory.lastKey = [pair[0].id, pair[1].id].sort().join("|");
  return pair;
}

function buildIntroTask(): MassTask {
  const apple = POOL.find((o) => o.id === "apple") ?? POOL[0]!;
  const book = POOL.find((o) => o.id === "book") ?? POOL[1]!;
  return {
    kind: "massMeasure",
    scene: "intro",
    prompt: "Measure mass, don't guess.",
    speakText:
      "Good measurers don't guess. They measure using the same balance cubes. The apple is three cubes. The book is seven cubes. The book has greater mass because it measures more cubes — even if it doesn't look bigger.",
    badgeLabel: "Meazurex Mission",
    teachingItems: [
      { imageSrc: apple.image, label: apple.label, cubes: apple.cubes, caption: `${apple.label} = ${apple.cubes} cubes` },
      { imageSrc: book.image, label: book.label, cubes: book.cubes, caption: `${book.label} = ${book.cubes} cubes` },
    ],
    feedback: { correct: "Let's measure the mass!", wrong: "Let's get ready." },
  };
}

// Activity A — read a measured mass (how many cubes?).
function buildCountTask(memory: LessonMemory): MassTask {
  const pool = POOL.filter((o) => o.id !== memory.lastKey);
  const obj = choose(pool.length ? pool : POOL);
  memory.lastKey = obj.id;
  return {
    kind: "massMeasure",
    scene: "count",
    prompt: `How many balance cubes is the ${obj.label.toLowerCase()}?`,
    speakText: `The scale is balanced. How many balance cubes is the ${obj.label.toLowerCase()}?`,
    badgeLabel: "Count the Weights",
    object: { imageSrc: obj.image, label: obj.label, cubes: obj.cubes },
    options: numberOptions(obj.cubes),
    correctAnswer: obj.cubes,
    feedback: { correct: "You measured it!", wrong: "Count the balance cubes one by one." },
  };
}

// Activity B — which has greater / less mass? (trust the cubes, not the picture)
function buildCompareTask(memory: LessonMemory): MassTask {
  const [a, b] = pickPair(memory, true);
  const mode: "greater" | "less" = Math.random() < 0.5 ? "greater" : "less";
  const target = mode === "greater" ? (a.cubes > b.cubes ? a : b) : a.cubes < b.cubes ? a : b;
  return {
    kind: "massMeasure",
    scene: "compare",
    prompt: mode === "greater" ? "Which has greater mass?" : "Which has less mass?",
    speakText: mode === "greater" ? "Which object has greater mass? Trust the cubes, not the picture." : "Which object has less mass? Trust the cubes, not the picture.",
    badgeLabel: "Trust the Cubes",
    items: shuffle([item(a), item(b)]),
    compareMode: mode,
    correctOptionId: target.id,
    feedback: {
      correct: `Yes — it measures ${mode === "greater" ? "more" : "fewer"} cubes!`,
      wrong: "Count the cubes under each one — that is the real mass.",
    },
  };
}

// Activity C — how many more cubes? (the mass difference — the Year-2 step)
function buildDifferenceTask(memory: LessonMemory): MassTask {
  const [a, b] = pickPair(memory, false);
  const heavier = a.cubes > b.cubes ? a : b;
  const lighter = a.cubes > b.cubes ? b : a;
  const diff = heavier.cubes - lighter.cubes;
  return {
    kind: "massMeasure",
    scene: "difference",
    prompt: `How many more cubes does the ${heavier.label.toLowerCase()} measure than the ${lighter.label.toLowerCase()}?`,
    speakText: `How many more balance cubes does the ${heavier.label.toLowerCase()} measure than the ${lighter.label.toLowerCase()}?`,
    badgeLabel: "How Many More?",
    items: [item(heavier), item(lighter)],
    options: numberOptions(diff),
    correctAnswer: diff,
    feedback: { correct: `Yes — ${diff} more ${diff === 1 ? "cube" : "cubes"}!`, wrong: "Count each one, then find the difference." },
  };
}

export function generateY2MeasurelandsWeek2Lesson1Task(
  lessonId: string,
  _difficulty: Difficulty,
): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const rotation = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (rotation === "difference") return buildDifferenceTask(memory);
  if (rotation === "compare") return buildCompareTask(memory);
  return buildCountTask(memory);
}

export function resetY2MeasurelandsWeek2Lesson1TaskSessionState() {
  lessonMemory.clear();
}
