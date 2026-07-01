import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import {
  Y2_CAPACITY_CONTAINERS,
  type Y2CapacityContainer,
  toY2CapacityItem,
} from "@/data/activities/year2Measurelands/week3Lesson1";

// ── Measurelands · Level 2 (Year 2) · Week 3 · Lesson 2 — "Order by Capacity" ──
// AC9M2M01. Students order and justify measured capacities by cup count, not
// by picture size or container height.

type CapacityTask = Extract<PracticeTask, { kind: "capacityMeasure" }>;
type CapacityItem = NonNullable<CapacityTask["items"]>[number];

const POOL = Y2_CAPACITY_CONTAINERS;
const BY_ID: Record<string, Y2CapacityContainer> = Object.fromEntries(POOL.map((c) => [c.id, c]));

type LessonMemory = { introShown: boolean; cursor: number; lastKey: string | null };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"order3" | "most" | "equal" | "order4" | "least" | "order5"> = [
  "order3",
  "most",
  "equal",
  "order4",
  "least",
  "order5",
];

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

function pickSet(memory: LessonMemory, count: number): Y2CapacityContainer[] {
  const chosen: Y2CapacityContainer[] = [];
  const usedCups = new Set<number>();
  const candidates = shuffle(POOL).filter((c) => c.id !== memory.lastKey);
  for (const c of candidates) {
    if (usedCups.has(c.cups)) continue;
    chosen.push(c);
    usedCups.add(c.cups);
    if (chosen.length === count) break;
  }
  memory.lastKey = chosen[chosen.length - 1]?.id ?? memory.lastKey;
  return chosen;
}

function itemWithCups(c: Y2CapacityContainer, cups: number, id = c.id): CapacityItem {
  return { ...toY2CapacityItem(c), id, cups };
}

function buildIntroTask(): CapacityTask {
  return {
    kind: "capacityMeasure",
    scene: "intro",
    prompt: "We can order measured capacities.",
    speakText:
      "Professor Gauge says: once we have measured containers, we can compare lots of them. Order the containers by their cup counts. The container with the greatest number of cups has the greatest capacity.",
    badgeLabel: "Meazurex Mission",
    teachingItems: [
      { imageSrc: BY_ID.bottle!.image, label: "Bottle", cups: 4, caption: "The bottle holds 4 cups." },
      { imageSrc: BY_ID.jug!.image, label: "Jug", cups: 8, caption: "The jug holds 8 cups." },
      { imageSrc: BY_ID.bucket!.image, label: "Bucket", cups: 20, caption: "The bucket holds the most because it has the greatest cup count." },
    ],
    feedback: { correct: "Let's order capacities.", wrong: "Let's get ready." },
  };
}

function buildOrderTask(memory: LessonMemory, count: 3 | 4 | 5): CapacityTask {
  const chosen = pickSet(memory, count);
  const descending = randInt(4) === 0;
  const ordered = [...chosen].sort((a, b) => descending ? b.cups - a.cups : a.cups - b.cups);
  return {
    kind: "capacityMeasure",
    scene: "order",
    prompt: descending ? "Order them: greatest to least capacity." : "Order them: least to greatest capacity.",
    speakText: descending
      ? "Compare the cup counts. Tap the containers in order from greatest capacity to least capacity."
      : "Compare the cup counts. Tap the containers in order from least capacity to greatest capacity.",
    badgeLabel: "Order by Capacity",
    items: shuffle(chosen.map(toY2CapacityItem)),
    orderedIds: ordered.map((c) => c.id),
    feedback: {
      correct: "You ordered the measured capacities.",
      wrong: "Coach tip: order the containers by cup count; the smallest count goes first.",
    },
  };
}

function buildMostLeastTask(memory: LessonMemory, mode: "most" | "least"): CapacityTask {
  const chosen = pickSet(memory, 3);
  const target = [...chosen].sort((a, b) => mode === "most" ? b.cups - a.cups : a.cups - b.cups)[0]!;
  return {
    kind: "capacityMeasure",
    scene: "compare",
    prompt: mode === "most" ? "Which container holds the most?" : "Which container holds the least?",
    speakText: mode === "most"
      ? "Compare the cup counts. Which container holds the most?"
      : "Compare the cup counts. Which container holds the least?",
    badgeLabel: mode === "most" ? "Holds the Most" : "Holds the Least",
    items: shuffle(chosen.map(toY2CapacityItem)),
    compareMode: mode === "most" ? "more" : "less",
    correctOptionId: target.id,
    feedback: {
      correct: "The cup count proves it.",
      wrong: "Coach tip: choose most or least by the cup count, not the container shape.",
    },
  };
}

function buildEqualTask(memory: LessonMemory): CapacityTask {
  const equalPairs: Array<[Y2CapacityContainer, Y2CapacityContainer, number]> = [
    [BY_ID.bottle!, BY_ID["measuring-jug"]!, 4],
    [BY_ID.teapot!, BY_ID.kettle!, 7],
    [BY_ID.jug!, BY_ID.pot!, 12],
    [BY_ID.bucket!, BY_ID["watering-can"]!, 16],
  ];
  const [target, match, cups] = choose(equalPairs);
  memory.lastKey = `${target.id}|${match.id}`;
  const distractors = shuffle(POOL.filter((c) => c.id !== target.id && c.id !== match.id && c.cups !== cups)).slice(0, 2);
  return {
    kind: "capacityMeasure",
    scene: "equal",
    prompt: `Which container has the same capacity as the ${target.label.toLowerCase()}?`,
    speakText: `The ${target.label.toLowerCase()} holds ${cups} cups. Which container has the same capacity?`,
    badgeLabel: "Find the Same Capacity",
    target: itemWithCups(target, cups),
    items: shuffle([itemWithCups(match, cups), ...distractors.map(toY2CapacityItem)]),
    correctOptionId: match.id,
    feedback: {
      correct: "Same cup count means same capacity.",
      wrong: "Coach tip: same capacity means the cup counts match exactly.",
    },
  };
}

export function generateY2MeasurelandsWeek3Lesson2Task(
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
  if (rotation === "order3") return buildOrderTask(memory, 3);
  if (rotation === "order4") return buildOrderTask(memory, 4);
  if (rotation === "order5") return buildOrderTask(memory, 5);
  if (rotation === "least") return buildMostLeastTask(memory, "least");
  if (rotation === "equal") return buildEqualTask(memory);
  return buildMostLeastTask(memory, "most");
}

export function resetY2MeasurelandsWeek3Lesson2TaskSessionState() {
  lessonMemory.clear();
}

export function buildY2MeasurelandsWeek3Lesson2QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, lastKey: null };
  return [
    buildOrderTask(seed, 3),
    buildMostLeastTask(seed, "most"),
    buildMostLeastTask(seed, "least"),
    buildEqualTask(seed),
    buildOrderTask(seed, 4),
  ];
}
