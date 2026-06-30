import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 2 (Year 2) · Week 3 · Lesson 1 — "Count the Cups" ──
// AC9M2M01. Level 1 measured capacity in cups. Level 2 reads larger measured
// capacities, compares them, and finds the difference in cups.

type CapacityTask = Extract<PracticeTask, { kind: "capacityMeasure" }>;

const BASE = "/images/measurelands/containers-3d";

type CapacityContainer = { id: string; label: string; image: string; cups: number; look: number };

const POOL: CapacityContainer[] = [
  { id: "cup", label: "Cup", image: `${BASE}/cup.png`, cups: 4, look: 1 },
  { id: "mug", label: "Mug", image: `${BASE}/mug.png`, cups: 5, look: 2 },
  { id: "bottle", label: "Bottle", image: `${BASE}/bottle.png`, cups: 7, look: 2 },
  { id: "teapot", label: "Teapot", image: `${BASE}/teapot.png`, cups: 8, look: 3 },
  { id: "kettle", label: "Kettle", image: `${BASE}/kettle.png`, cups: 9, look: 3 },
  { id: "jug", label: "Jug", image: `${BASE}/jug.png`, cups: 10, look: 3 },
  { id: "measuring-jug", label: "Measuring Jug", image: `${BASE}/measuring-jug.png`, cups: 11, look: 3 },
  { id: "watering-can", label: "Watering Can", image: `${BASE}/watering-can.png`, cups: 13, look: 4 },
  { id: "pot", label: "Pot", image: `${BASE}/pot.png`, cups: 14, look: 4 },
  { id: "bucket", label: "Bucket", image: `${BASE}/bucket.png`, cups: 16, look: 4 },
  { id: "fish-tank", label: "Fish Tank", image: `${BASE}/fish-tank.png`, cups: 18, look: 5 },
  { id: "bathtub", label: "Bathtub", image: `${BASE}/bathtub.png`, cups: 20, look: 5 },
];

const BY_ID: Record<string, CapacityContainer> = Object.fromEntries(POOL.map((c) => [c.id, c]));

type LessonMemory = { introShown: boolean; cursor: number; lastKey: string | null };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"count" | "compare" | "difference"> = ["count", "compare", "difference", "compare", "difference", "count"];

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

function item(c: CapacityContainer) {
  return { id: c.id, imageSrc: c.image, label: c.label, cups: c.cups };
}

function numberOptions(correct: number, max = 22): number[] {
  const candidates = [correct - 2, correct - 1, correct + 1, correct + 2, correct + 3].filter(
    (n) => n >= 1 && n <= max && n !== correct,
  );
  return shuffle([correct, ...shuffle([...new Set(candidates)]).slice(0, 2)]);
}

function differenceOptions(correct: number): number[] {
  const candidates = [correct - 2, correct - 1, correct + 1, correct + 2, correct + 3].filter(
    (n) => n >= 1 && n <= 10 && n !== correct,
  );
  return shuffle([correct, ...shuffle([...new Set(candidates)]).slice(0, 2)]);
}

function pickContainer(memory: LessonMemory): CapacityContainer {
  const candidates = POOL.filter((c) => c.id !== memory.lastKey);
  const selected = choose(candidates.length ? candidates : POOL);
  memory.lastKey = selected.id;
  return selected;
}

function pickPair(memory: LessonMemory, misleading: boolean): [CapacityContainer, CapacityContainer] {
  let fallback: [CapacityContainer, CapacityContainer] | null = null;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const a = choose(POOL);
    const b = choose(POOL.filter((c) => c.id !== a.id && c.cups !== a.cups && Math.abs(c.cups - a.cups) <= 8));
    if (!b) continue;
    const key = [a.id, b.id].sort().join("|");
    if (key === memory.lastKey) continue;
    fallback = fallback ?? [a, b];
    const larger = a.cups > b.cups ? a : b;
    const smaller = a.cups > b.cups ? b : a;
    if (!misleading || larger.look <= smaller.look + 1) {
      memory.lastKey = key;
      return [a, b];
    }
  }
  const pair = fallback ?? [POOL[0]!, POOL[1]!];
  memory.lastKey = [pair[0].id, pair[1].id].sort().join("|");
  return pair;
}

function buildIntroTask(): CapacityTask {
  return {
    kind: "capacityMeasure",
    scene: "intro",
    prompt: "Read the cups, then compare.",
    speakText:
      "Professor Gauge says: Level Two measurers count larger cup measurements, compare them, and find how many more cups one container holds. The cups tell us the capacity, not just the container picture.",
    badgeLabel: "Meazurex Mission",
    teachingItems: [
      { imageSrc: BY_ID.bottle!.image, label: "Bottle", cups: 7, caption: "The bottle holds 7 cups." },
      { imageSrc: BY_ID.pot!.image, label: "Pot", cups: 14, caption: "The pot holds 14 cups — that is 7 more cups." },
    ],
    feedback: { correct: "Let's count the cups.", wrong: "Let's get ready." },
  };
}

function buildCountTask(memory: LessonMemory): CapacityTask {
  const c = pickContainer(memory);
  return {
    kind: "capacityMeasure",
    scene: "count",
    prompt: `How many cups does the ${c.label.toLowerCase()} hold?`,
    speakText: `Count the cups in rows. How many cups does the ${c.label.toLowerCase()} hold?`,
    badgeLabel: "Count the Cups",
    container: item(c),
    options: numberOptions(c.cups),
    correctAnswer: c.cups,
    feedback: { correct: "You read the capacity measurement.", wrong: "Count the cups carefully. Try rows of five." },
  };
}

function buildCompareTask(memory: LessonMemory): CapacityTask {
  const [a, b] = pickPair(memory, true);
  const mode: "more" | "less" = randInt(2) === 0 ? "more" : "less";
  const target = mode === "more" ? (a.cups > b.cups ? a : b) : a.cups < b.cups ? a : b;
  return {
    kind: "capacityMeasure",
    scene: "compare",
    prompt: mode === "more" ? "Which container holds more?" : "Which container holds less?",
    speakText: mode === "more" ? "Count the cups. Which container holds more?" : "Count the cups. Which container holds less?",
    badgeLabel: mode === "more" ? "Which Holds More?" : "Which Holds Less?",
    items: shuffle([item(a), item(b)]),
    compareMode: mode,
    correctOptionId: target.id,
    feedback: { correct: "The cup count proves it.", wrong: "Use the cup count, not the container picture." },
  };
}

function buildDifferenceTask(memory: LessonMemory): CapacityTask {
  const [a, b] = pickPair(memory, false);
  const larger = a.cups > b.cups ? a : b;
  const smaller = a.cups > b.cups ? b : a;
  const diff = larger.cups - smaller.cups;
  return {
    kind: "capacityMeasure",
    scene: "difference",
    prompt: `How many more cups does the ${larger.label.toLowerCase()} hold than the ${smaller.label.toLowerCase()}?`,
    speakText: `The ${larger.label.toLowerCase()} holds ${larger.cups} cups. The ${smaller.label.toLowerCase()} holds ${smaller.cups} cups. How many more cups does the ${larger.label.toLowerCase()} hold?`,
    badgeLabel: "How Many More Cups?",
    items: [item(larger), item(smaller)],
    options: differenceOptions(diff),
    correctAnswer: diff,
    feedback: { correct: `Yes — ${diff} more ${diff === 1 ? "cup" : "cups"}.`, wrong: "Compare the two cup counts and find the difference." },
  };
}

export function generateY2MeasurelandsWeek3Lesson1Task(
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
  if (rotation === "compare") return buildCompareTask(memory);
  if (rotation === "difference") return buildDifferenceTask(memory);
  return buildCountTask(memory);
}

export function resetY2MeasurelandsWeek3Lesson1TaskSessionState() {
  lessonMemory.clear();
}

export function buildY2MeasurelandsWeek3Lesson1QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, lastKey: null };
  return [
    buildCountTask(seed),
    buildCompareTask(seed),
    buildDifferenceTask(seed),
    buildCompareTask(seed),
    buildDifferenceTask(seed),
  ];
}
