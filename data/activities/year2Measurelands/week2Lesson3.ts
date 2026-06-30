import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { MASS_OBJECTS, type MassObject } from "@/data/activities/year1Measurelands/week2Lesson1";

// ── Measurelands · Level 2 (Year 2) · Week 2 · Lesson 3 — "Predict & Prove" ──
// AC9M2M01. Year 2 thinking: Level 1's mass week ended on FAIR measurement
// (same-size cubes); Level 2's capstone is REASONING — proving which object has
// greater mass with the cubes, not the picture, and quantifying the gap.
//   A — Prove It        (justify WHY one object has greater mass — text MCQ)
//   B — Heavier or Lighter?  (compare; trust the cubes, not the picture)
//   C — By How Many?     (the mass difference)
// Adds a "reason" scene to massMeasure; reuses compare/difference + the shared
// mass-audited pool. No new art.

type MassTask = Extract<PracticeTask, { kind: "massMeasure" }>;

const POOL: MassObject[] = MASS_OBJECTS.filter((o) => o.cubes >= 1 && o.cubes <= 12);

type LessonMemory = { introShown: boolean; cursor: number; lastKey: string | null };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"reason" | "compare" | "difference"> = ["reason", "compare", "difference", "reason", "difference", "compare"];

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
function toItem(o: MassObject) {
  return { id: o.id, imageSrc: o.image, label: o.label, cubes: o.cubes };
}
function numberOptions(correct: number): number[] {
  const candidates = [correct + 1, correct - 1, correct + 2, correct - 2].filter(
    (n) => n >= 1 && n <= 12 && n !== correct,
  );
  return shuffle([correct, ...shuffle([...new Set(candidates)]).slice(0, 2)]);
}
// Two distinct-mass objects; when `misleading`, the heavier does not look bigger.
function pickPair(memory: LessonMemory, misleading: boolean): [MassObject, MassObject] {
  let fallback: [MassObject, MassObject] | null = null;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const a = choose(POOL);
    const b = choose(POOL.filter((o) => o.id !== a.id && o.cubes !== a.cubes && Math.abs(o.cubes - a.cubes) <= 7));
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
  const rock = POOL.find((o) => o.id === "rock") ?? POOL[0]!;
  const balloon = POOL.find((o) => o.id === "balloon") ?? POOL[1]!;
  return {
    kind: "massMeasure",
    scene: "intro",
    prompt: "Prove it with the cubes.",
    speakText:
      "Good measurers don't just guess — they prove it. The rock is small but measures more cubes, so it has greater mass. The big balloon measures fewer cubes. The balance cubes prove which is heavier, not the picture.",
    badgeLabel: "Meazurex Mission",
    teachingItems: [
      { imageSrc: rock.image, label: rock.label, cubes: rock.cubes, caption: `${rock.label} = ${rock.cubes} cubes (small but heavy)` },
      { imageSrc: balloon.image, label: balloon.label, cubes: balloon.cubes, caption: `${balloon.label} = ${balloon.cubes} cubes (big but light)` },
    ],
    feedback: { correct: "Let's prove it!", wrong: "Let's get ready." },
  };
}

// Activity A — Prove it: WHY does the heavier object have greater mass?
function buildReasonTask(memory: LessonMemory): MassTask {
  const [a, b] = pickPair(memory, true);
  const heavier = a.cubes > b.cubes ? a : b;
  const lighter = a.cubes > b.cubes ? b : a;
  return {
    kind: "massMeasure",
    scene: "reason",
    prompt: `The ${heavier.label.toLowerCase()} has greater mass than the ${lighter.label.toLowerCase()}. How do you know?`,
    speakText: `The ${heavier.label.toLowerCase()} has greater mass than the ${lighter.label.toLowerCase()}. How do you know?`,
    badgeLabel: "Prove It",
    items: [toItem(heavier), toItem(lighter)],
    textOptions: shuffle(["It measures more balance cubes", "It looks bigger", "I just guessed"]),
    correctTextOption: "It measures more balance cubes",
    feedback: { correct: "Yes — the cubes prove it!", wrong: "We know from the cubes, not the picture or a guess." },
  };
}

// Activity B — compare: which has greater / less mass? (trust the cubes)
function buildCompareTask(memory: LessonMemory): MassTask {
  const [a, b] = pickPair(memory, true);
  const mode: "greater" | "less" = randInt(2) === 0 ? "greater" : "less";
  const winner = mode === "greater" ? (a.cubes > b.cubes ? a : b) : a.cubes < b.cubes ? a : b;
  return {
    kind: "massMeasure",
    scene: "compare",
    prompt: mode === "greater" ? "Which has greater mass?" : "Which has less mass?",
    speakText: mode === "greater" ? "Prove which object has greater mass. Count the cubes." : "Prove which object has less mass. Count the cubes.",
    badgeLabel: "Prove Which Is Heavier",
    items: shuffle([toItem(a), toItem(b)]),
    compareMode: mode,
    correctOptionId: winner.id,
    feedback: { correct: `Yes — it measures ${mode === "greater" ? "more" : "fewer"} cubes!`, wrong: "Count the cubes under each object." },
  };
}

// Activity C — by how many cubes? (the mass difference)
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
    badgeLabel: "By How Many?",
    items: [toItem(heavier), toItem(lighter)],
    options: numberOptions(diff),
    correctAnswer: diff,
    feedback: { correct: `Yes — ${diff} more ${diff === 1 ? "cube" : "cubes"}!`, wrong: "Count each one, then find the difference." },
  };
}

export function generateY2MeasurelandsWeek2Lesson3Task(
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
  if (rotation === "reason") return buildReasonTask(memory);
  if (rotation === "compare") return buildCompareTask(memory);
  return buildDifferenceTask(memory);
}

export function resetY2MeasurelandsWeek2Lesson3TaskSessionState() {
  lessonMemory.clear();
}

// 5 fixed tasks for the weekly quiz / post-test: reason, compare, difference x2.
export function buildY2MeasurelandsWeek2Lesson3QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, lastKey: null };
  return [
    buildReasonTask(seed),
    buildCompareTask(seed),
    buildDifferenceTask(seed),
    buildReasonTask(seed),
    buildDifferenceTask(seed),
  ];
}
