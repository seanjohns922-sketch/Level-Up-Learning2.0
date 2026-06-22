import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { MASS_OBJECTS, type MassObject } from "@/data/activities/year1Measurelands/week2Lesson1";

// ── Measurelands · Level 1 · Week 2 · Lesson 2 — "Compare Measured Mass" ──
// AC9M1M01: compare and order objects by mass and justify with the measurement.
// Builds on L1 (measuring): now students INTERPRET the cube counts to compare,
// order, and match mass. Picture size is kept size-inverted so they must use
// the cube counts, not the object's appearance.
//   A — Which Is Heavier?  (scene "compare", two measured objects)
//   B — Order the Masses   (scene "order",   3 scales lightest→heaviest)
//   C — Find the Same Mass (scene "equal",   match an equal measurement)

type MassTask = Extract<PracticeTask, { kind: "massMeasure" }>;

const BY_ID: Record<string, MassObject> = Object.fromEntries(MASS_OBJECTS.map((o) => [o.id, o]));
const toItem = (o: MassObject) => ({ id: o.id, imageSrc: o.image, label: o.label, cubes: o.cubes });

// Objects grouped by equal cube count (for "find the same mass").
const EQUAL_GROUPS: MassObject[][] = Object.values(
  MASS_OBJECTS.reduce<Record<number, MassObject[]>>((acc, o) => {
    (acc[o.cubes] ??= []).push(o);
    return acc;
  }, {}),
).filter((group) => group.length >= 2);

type LessonMemory = { introShown: boolean; cursor: number; lastId: string | null };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"A" | "B" | "C"> = ["A", "B", "C", "A", "C", "B"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, lastId: null };
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

// Two objects with different mass where the heavier does NOT look bigger.
function pickBusterPair(memory: LessonMemory): [MassObject, MassObject] {
  const first = choose(MASS_OBJECTS.filter((o) => o.id !== memory.lastId));
  const candidates = MASS_OBJECTS.filter((o) => o.id !== first.id && o.cubes !== first.cubes);
  const busters = candidates.filter((o) => {
    const heavier = first.cubes > o.cubes ? first : o;
    const lighter = first.cubes > o.cubes ? o : first;
    return heavier.look <= lighter.look;
  });
  const partner = busters.length ? choose(busters) : choose(candidates);
  memory.lastId = partner.id;
  return [first, partner];
}

function buildIntroTask(): MassTask {
  return {
    kind: "massMeasure",
    scene: "intro",
    prompt: "Now we can compare our measurements.",
    speakText:
      "Professor Gauge says: now that we can measure mass with balance cubes, we can compare our measurements. The object that needs more cubes is heavier. Remember — count the cubes, don't just look at the picture!",
    badgeLabel: "Meazurex Mission",
    teachingItems: [
      { imageSrc: BY_ID.apple!.image, label: "Apple", cubes: 3, caption: "The apple is 3 balance cubes." },
      { imageSrc: BY_ID.book!.image, label: "Book", cubes: 7, caption: "The book is 7 cubes — more cubes, so it is heavier." },
    ],
    feedback: { correct: "Let's start comparing!", wrong: "Let's get ready." },
  };
}

// Activity A — Which is heavier / lighter?
function buildCompareTask(memory: LessonMemory): MassTask {
  const [a, b] = pickBusterPair(memory);
  const greater = randInt(2) === 0;
  const winner = greater ? (a.cubes > b.cubes ? a : b) : (a.cubes < b.cubes ? a : b);
  return {
    kind: "massMeasure",
    scene: "compare",
    prompt: greater ? "Which object is heavier?" : "Which object is lighter?",
    speakText: greater ? "Count the balance cubes. Which object is heavier?" : "Count the balance cubes. Which object is lighter?",
    badgeLabel: greater ? "Which Is Heavier?" : "Which Is Lighter?",
    items: shuffle([toItem(a), toItem(b)]),
    compareMode: greater ? "greater" : "less",
    correctOptionId: winner.id,
    feedback: { correct: "More cubes means heavier!", wrong: "Count the cubes under each object." },
  };
}

// Activity B — Order three masses (lightest → heaviest, sometimes reversed).
function buildOrderTask(memory: LessonMemory): MassTask {
  // three objects with distinct cube counts
  const pool = shuffle(MASS_OBJECTS);
  const chosen: MassObject[] = [];
  const usedCubes = new Set<number>();
  for (const o of pool) {
    if (usedCubes.has(o.cubes)) continue;
    chosen.push(o);
    usedCubes.add(o.cubes);
    if (chosen.length === 3) break;
  }
  memory.lastId = chosen[chosen.length - 1]!.id;
  const ascending = randInt(2) === 0;
  const ordered = [...chosen].sort((x, y) => (ascending ? x.cubes - y.cubes : y.cubes - x.cubes));
  return {
    kind: "massMeasure",
    scene: "order",
    prompt: ascending ? "Order them: lightest to heaviest." : "Order them: heaviest to lightest.",
    speakText: ascending
      ? "Count each one's balance cubes. Tap them in order from lightest to heaviest."
      : "Count each one's balance cubes. Tap them in order from heaviest to lightest.",
    badgeLabel: "Order the Masses",
    items: shuffle(chosen.map(toItem)),
    orderedIds: ordered.map((o) => o.id),
    feedback: { correct: "Perfectly ordered!", wrong: "Count the cubes and order them again." },
  };
}

// Activity C — Find the object with the same mass.
function buildEqualTask(memory: LessonMemory): MassTask {
  const group = choose(EQUAL_GROUPS);
  const [target, match] = shuffle(group).slice(0, 2) as [MassObject, MassObject];
  memory.lastId = match.id;
  const distractors = shuffle(MASS_OBJECTS.filter((o) => o.cubes !== target.cubes)).slice(0, 2);
  return {
    kind: "massMeasure",
    scene: "equal",
    prompt: `Which object has the same mass as the ${target.label.toLowerCase()}?`,
    speakText: `The ${target.label.toLowerCase()} is ${target.cubes} balance cubes. Which object has the same mass?`,
    badgeLabel: "Find the Same Mass",
    target: { imageSrc: target.image, label: target.label, cubes: target.cubes },
    items: shuffle([toItem(match), ...distractors.map(toItem)]),
    correctOptionId: match.id,
    feedback: { correct: "Same number of cubes — same mass!", wrong: "Find the one with the same number of cubes." },
  };
}

// "Select the greatest measurement" — 3 objects, tap the heaviest (quiz use).
function buildGreatestTask(memory: LessonMemory): MassTask {
  const pool = shuffle(MASS_OBJECTS);
  const chosen: MassObject[] = [];
  const usedCubes = new Set<number>();
  for (const o of pool) {
    if (usedCubes.has(o.cubes)) continue;
    chosen.push(o);
    usedCubes.add(o.cubes);
    if (chosen.length === 3) break;
  }
  memory.lastId = chosen[chosen.length - 1]!.id;
  const heaviest = [...chosen].sort((x, y) => y.cubes - x.cubes)[0]!;
  return {
    kind: "massMeasure",
    scene: "compare",
    prompt: "Which object has the greatest mass?",
    speakText: "Count the balance cubes. Which object has the greatest mass?",
    badgeLabel: "Greatest Mass",
    items: shuffle(chosen.map(toItem)),
    correctOptionId: heaviest.id,
    feedback: { correct: "That one has the most cubes!", wrong: "Count the cubes — the most cubes is heaviest." },
  };
}

export function generateY1MeasurelandsWeek2Lesson2Task(
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
  if (rotation === "A") return buildCompareTask(memory);
  if (rotation === "B") return buildOrderTask(memory);
  return buildEqualTask(memory);
}

export function resetY1MeasurelandsWeek2Lesson2TaskSessionState() {
  lessonMemory.clear();
}

// 5 fixed tasks for the Week 2 weekly quiz (Lesson 2's contribution):
// heavier, lighter, order three, find equal, select greatest.
export function buildY1MeasurelandsWeek2Lesson2QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, lastId: null };
  const heavier = buildCompareTask(seed);
  // force one "lighter" question
  const lighterPair = pickBusterPair(seed);
  const lighterWinner = lighterPair[0].cubes < lighterPair[1].cubes ? lighterPair[0] : lighterPair[1];
  const lighter: MassTask = {
    kind: "massMeasure",
    scene: "compare",
    prompt: "Which object is lighter?",
    speakText: "Count the balance cubes. Which object is lighter?",
    badgeLabel: "Which Is Lighter?",
    items: shuffle([toItem(lighterPair[0]), toItem(lighterPair[1])]),
    compareMode: "less",
    correctOptionId: lighterWinner.id,
    feedback: { correct: "Fewer cubes means lighter!", wrong: "Count the cubes under each object." },
  };
  return [heavier, lighter, buildOrderTask(seed), buildEqualTask(seed), buildGreatestTask(seed)];
}
