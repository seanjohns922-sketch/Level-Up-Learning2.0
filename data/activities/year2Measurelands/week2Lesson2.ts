import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { MASS_OBJECTS, type MassObject } from "@/data/activities/year1Measurelands/week2Lesson1";

// ── Measurelands · Level 2 (Year 2) · Week 2 · Lesson 2 — "By How Many?" ──
// AC9M2M01. Year 2 thinking: Level 1 ordered 3 masses and found equal masses;
// Level 2 orders MORE objects and REASONS about the gaps using the cubes.
//   A — Order by Mass     (order 3 AND 4 objects — Level 1 only ordered 3)
//   B — By How Many?      (how many more cubes one object measures)
//   C — Find the Equal Mass (equivalence: same cubes = same mass)
// Reuses the massMeasure card (order / difference / equal) and the shared,
// mass-audited object pool. No new art.

type MassTask = Extract<PracticeTask, { kind: "massMeasure" }>;

const POOL: MassObject[] = MASS_OBJECTS.filter((o) => o.cubes >= 1 && o.cubes <= 12);
// Cube values shared by 2+ objects → valid "find the same mass" targets.
const EQUAL_GROUPS: MassObject[][] = (() => {
  const byCubes = new Map<number, MassObject[]>();
  for (const o of POOL) {
    const g = byCubes.get(o.cubes) ?? [];
    g.push(o);
    byCubes.set(o.cubes, g);
  }
  return [...byCubes.values()].filter((g) => g.length >= 2);
})();

type LessonMemory = { introShown: boolean; cursor: number; orderSize: 3 | 4; lastKey: string | null };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"order" | "difference" | "equal"> = ["order", "difference", "equal", "order", "equal", "difference"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, orderSize: 3, lastKey: null };
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
// n objects with distinct cube counts (no ties), avoiding an immediate repeat.
function pickDistinct(memory: LessonMemory, n: number): MassObject[] {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const chosen: MassObject[] = [];
    const used = new Set<number>();
    for (const o of shuffle(POOL)) {
      if (used.has(o.cubes)) continue;
      chosen.push(o);
      used.add(o.cubes);
      if (chosen.length === n) break;
    }
    if (chosen.length < n) continue;
    const key = chosen.map((o) => o.id).sort().join("|");
    if (key !== memory.lastKey) {
      memory.lastKey = key;
      return chosen;
    }
  }
  return shuffle(POOL).slice(0, n);
}

function buildIntroTask(): MassTask {
  const a = POOL.find((o) => o.id === "apple") ?? POOL[0]!;
  const b = POOL.find((o) => o.id === "backpack") ?? POOL[1]!;
  return {
    kind: "massMeasure",
    scene: "intro",
    prompt: "Order and compare measured masses.",
    speakText:
      "We can put masses in order and reason about them. Count each one's balance cubes. The object with more cubes has greater mass — and we can work out how many more.",
    badgeLabel: "Meazurex Mission",
    teachingItems: [
      { imageSrc: a.image, label: a.label, cubes: a.cubes, caption: `${a.label} = ${a.cubes} cubes` },
      { imageSrc: b.image, label: b.label, cubes: b.cubes, caption: `${b.label} = ${b.cubes} cubes` },
    ],
    feedback: { correct: "Let's order the masses!", wrong: "Let's get ready." },
  };
}

// Activity A — order 3 or 4 objects by mass (lightest↔heaviest).
function buildOrderTask(memory: LessonMemory, size: 3 | 4): MassTask {
  const chosen = pickDistinct(memory, size);
  const ascending = randInt(2) === 0;
  const ordered = [...chosen].sort((x, y) => (ascending ? x.cubes - y.cubes : y.cubes - x.cubes));
  return {
    kind: "massMeasure",
    scene: "order",
    prompt: ascending ? "Order them: lightest to heaviest." : "Order them: heaviest to lightest.",
    speakText: ascending
      ? "Count each object's balance cubes. Tap them from lightest to heaviest."
      : "Count each object's balance cubes. Tap them from heaviest to lightest.",
    badgeLabel: "Order by Mass",
    items: shuffle(chosen.map(toItem)),
    orderedIds: ordered.map((o) => o.id),
    feedback: { correct: "Perfectly ordered — by the cubes!", wrong: "Count the cubes: fewest first, most last." },
  };
}

// Activity B — by how many cubes? (the mass difference between two objects)
function buildDifferenceTask(memory: LessonMemory): MassTask {
  const [a, b] = pickDistinct(memory, 2);
  const heavier = a!.cubes > b!.cubes ? a! : b!;
  const lighter = a!.cubes > b!.cubes ? b! : a!;
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

// Activity C — find the object with the same mass (equivalence).
function buildEqualTask(memory: LessonMemory): MassTask {
  const group = choose(EQUAL_GROUPS);
  const [target, match] = shuffle(group).slice(0, 2) as [MassObject, MassObject];
  memory.lastKey = `equal-${target.id}-${match.id}`;
  const distractors = shuffle(POOL.filter((o) => o.cubes !== target.cubes && o.id !== match.id)).slice(0, 2);
  return {
    kind: "massMeasure",
    scene: "equal",
    prompt: `Which object has the same mass as the ${target.label.toLowerCase()}?`,
    speakText: `The ${target.label.toLowerCase()} is ${target.cubes} balance cubes. Which object has the same mass?`,
    badgeLabel: "Find the Equal Mass",
    target: { imageSrc: target.image, label: target.label, cubes: target.cubes },
    items: shuffle([toItem(match), ...distractors.map(toItem)]),
    correctOptionId: match.id,
    feedback: { correct: "Same cubes — same mass!", wrong: "Find the one with the same number of cubes." },
  };
}

export function generateY2MeasurelandsWeek2Lesson2Task(
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
  if (rotation === "order") {
    const size = memory.orderSize;
    memory.orderSize = size === 3 ? 4 : 3;
    return buildOrderTask(memory, size);
  }
  if (rotation === "difference") return buildDifferenceTask(memory);
  return buildEqualTask(memory);
}

export function resetY2MeasurelandsWeek2Lesson2TaskSessionState() {
  lessonMemory.clear();
}

// 5 fixed tasks for the weekly quiz / post-test: order x2 (3 & 4), difference, equal x2.
export function buildY2MeasurelandsWeek2Lesson2QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, orderSize: 3, lastKey: null };
  return [
    buildOrderTask(seed, 3),
    buildOrderTask(seed, 4),
    buildDifferenceTask(seed),
    buildEqualTask(seed),
    buildEqualTask(seed),
  ];
}
