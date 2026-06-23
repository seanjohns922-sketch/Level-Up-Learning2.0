import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { CONTAINERS, type CapacityContainer } from "@/data/activities/year1Measurelands/week3Lesson1";

type CapacityTask = Extract<PracticeTask, { kind: "capacityMeasure" }>;

const BY_ID: Record<string, CapacityContainer> = Object.fromEntries(CONTAINERS.map((c) => [c.id, c]));
const toItem = (c: CapacityContainer) => ({ id: c.id, imageSrc: c.image, label: c.label, cups: c.cups });

const EQUAL_GROUPS: CapacityContainer[][] = Object.values(
  CONTAINERS.reduce<Record<number, CapacityContainer[]>>((acc, c) => {
    (acc[c.cups] ??= []).push(c);
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

// Pair containers of similar apparent size but different measured capacity.
function pickBusterPair(memory: LessonMemory): [CapacityContainer, CapacityContainer] {
  const first = choose(CONTAINERS.filter((c) => c.id !== memory.lastId));
  const candidates = CONTAINERS.filter((c) => c.id !== first.id && c.cups !== first.cups);
  const ambiguous = candidates.filter((c) => Math.abs(c.look - first.look) <= 1);
  const partner = ambiguous.length ? choose(ambiguous) : choose(candidates);
  memory.lastId = partner.id;
  return [first, partner];
}

function buildIntroTask(): CapacityTask {
  return {
    kind: "capacityMeasure",
    scene: "intro",
    prompt: "Now we can compare our measurements.",
    speakText:
      "Professor Gauge says: now that we can measure capacity using cups, we can compare our measurements. The container that needs more cups holds more. Count the cups, not just the container shape.",
    badgeLabel: "Meazurex Mission",
    teachingItems: [
      { imageSrc: BY_ID.jug!.image, label: "Jug", cups: 4, caption: "The jug holds 4 cups." },
      { imageSrc: BY_ID.bucket!.image, label: "Bucket", cups: 8, caption: "The bucket holds 8 cups — more cups means greater capacity." },
    ],
    feedback: { correct: "Let's start comparing!", wrong: "Let's get ready." },
  };
}

function buildCompareTask(memory: LessonMemory): CapacityTask {
  const [a, b] = pickBusterPair(memory);
  const more = randInt(2) === 0;
  const winner = more ? (a.cups > b.cups ? a : b) : (a.cups < b.cups ? a : b);
  return {
    kind: "capacityMeasure",
    scene: "compare",
    prompt: more ? "Which container holds more?" : "Which container holds less?",
    speakText: more ? "Count the cups. Which container holds more?" : "Count the cups. Which container holds less?",
    badgeLabel: more ? "Which Holds More?" : "Which Holds Less?",
    items: shuffle([toItem(a), toItem(b)]),
    compareMode: more ? "more" : "less",
    correctOptionId: winner.id,
    feedback: { correct: "More cups means greater capacity!", wrong: "Count the cups for each container." },
  };
}

function buildOrderTask(memory: LessonMemory): CapacityTask {
  const pool = shuffle(CONTAINERS);
  const chosen: CapacityContainer[] = [];
  const usedCups = new Set<number>();
  for (const c of pool) {
    if (usedCups.has(c.cups)) continue;
    chosen.push(c);
    usedCups.add(c.cups);
    if (chosen.length === 3) break;
  }
  memory.lastId = chosen[chosen.length - 1]!.id;
  const ordered = [...chosen].sort((a, b) => a.cups - b.cups);
  return {
    kind: "capacityMeasure",
    scene: "order",
    prompt: "Order them: smallest to largest capacity.",
    speakText: "Count each container's cups. Tap them in order from smallest to largest capacity.",
    badgeLabel: "Order the Capacities",
    items: shuffle(chosen.map(toItem)),
    orderedIds: ordered.map((c) => c.id),
    feedback: { correct: "Perfectly ordered!", wrong: "Count the cups and try again." },
  };
}

function buildEqualTask(memory: LessonMemory): CapacityTask {
  const group = choose(EQUAL_GROUPS);
  const [target, match] = shuffle(group).slice(0, 2) as [CapacityContainer, CapacityContainer];
  memory.lastId = match.id;
  const distractors = shuffle(CONTAINERS.filter((c) => c.cups !== target.cups)).slice(0, 2);
  return {
    kind: "capacityMeasure",
    scene: "equal",
    prompt: `Which container has the same capacity as the ${target.label.toLowerCase()}?`,
    speakText: `The ${target.label.toLowerCase()} holds ${target.cups} cups. Which container has the same capacity?`,
    badgeLabel: "Find the Same Capacity",
    target: { imageSrc: target.image, label: target.label, cups: target.cups },
    items: shuffle([toItem(match), ...distractors.map(toItem)]),
    correctOptionId: match.id,
    feedback: { correct: "Same number of cups — same capacity!", wrong: "Find the one with the same number of cups." },
  };
}

function buildGreatestTask(memory: LessonMemory): CapacityTask {
  const pool = shuffle(CONTAINERS);
  const chosen: CapacityContainer[] = [];
  const usedCups = new Set<number>();
  for (const c of pool) {
    if (usedCups.has(c.cups)) continue;
    chosen.push(c);
    usedCups.add(c.cups);
    if (chosen.length === 3) break;
  }
  memory.lastId = chosen[chosen.length - 1]!.id;
  const greatest = [...chosen].sort((a, b) => b.cups - a.cups)[0]!;
  return {
    kind: "capacityMeasure",
    scene: "compare",
    prompt: "Which container has the greatest capacity?",
    speakText: "Count the cups. Which container has the greatest capacity?",
    badgeLabel: "Greatest Capacity",
    items: shuffle(chosen.map(toItem)),
    correctOptionId: greatest.id,
    feedback: { correct: "That one has the most cups!", wrong: "Count the cups — the most cups means greater capacity." },
  };
}

export function generateY1MeasurelandsWeek3Lesson2Task(
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

export function resetY1MeasurelandsWeek3Lesson2TaskSessionState() {
  lessonMemory.clear();
}

export function buildY1MeasurelandsWeek3Lesson2QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, lastId: null };
  const more = buildCompareTask(seed);
  const lessPair = pickBusterPair(seed);
  const lessWinner = lessPair[0].cups < lessPair[1].cups ? lessPair[0] : lessPair[1];
  const less: CapacityTask = {
    kind: "capacityMeasure",
    scene: "compare",
    prompt: "Which container holds less?",
    speakText: "Count the cups. Which container holds less?",
    badgeLabel: "Which Holds Less?",
    items: shuffle([toItem(lessPair[0]), toItem(lessPair[1])]),
    compareMode: "less",
    correctOptionId: lessWinner.id,
    feedback: { correct: "Fewer cups means less capacity!", wrong: "Count the cups for each container." },
  };
  return [more, less, buildOrderTask(seed), buildEqualTask(seed), buildGreatestTask(seed)];
}
