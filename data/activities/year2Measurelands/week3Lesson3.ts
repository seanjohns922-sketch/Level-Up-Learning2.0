import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import {
  Y2_CAPACITY_CONTAINERS,
  type Y2CapacityContainer,
  toY2CapacityItem,
} from "@/data/activities/year2Measurelands/week3Lesson1";

// ── Measurelands · Level 2 (Year 2) · Week 3 · Lesson 3 — "Better Measuring Units" ──
// AC9M2M01. Students choose sensible uniform informal units and explain why
// the best unit makes capacity measurement easier.

type CapacityTask = Extract<PracticeTask, { kind: "capacityMeasure" }>;
type Unit = NonNullable<CapacityTask["sensibleUnits"]>[number]["unit"];

const POOL = Y2_CAPACITY_CONTAINERS;
const BY_ID: Record<string, Y2CapacityContainer> = Object.fromEntries(POOL.map((c) => [c.id, c]));

type LessonMemory = { introShown: boolean; cursor: number; lastId: string | null };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"choose" | "wrong" | "pro"> = ["choose", "wrong", "pro", "choose", "pro", "wrong"];

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

function pickContainer(memory: LessonMemory, filter?: (container: Y2CapacityContainer) => boolean): Y2CapacityContainer {
  const candidates = POOL.filter((c) => c.id !== memory.lastId && (!filter || filter(c)));
  const selected = choose(candidates.length ? candidates : POOL.filter((c) => !filter || filter(c)));
  memory.lastId = selected.id;
  return selected;
}

function unitOption(id: Unit, label: string) {
  return { id, unit: id, label };
}

function sensibleUnit(container: Y2CapacityContainer): Unit {
  if (container.cups <= 4) return "cup";
  if (container.cups <= 32) return "measuringJug";
  return "bucket";
}

function spoonCount(container: Y2CapacityContainer) {
  return container.cups * 12 + 8;
}

function buildIntroTask(): CapacityTask {
  return {
    kind: "capacityMeasure",
    scene: "betterUnit",
    prompt: "Good measurers choose sensible units.",
    speakText:
      "Professor Gauge says: we can measure any container, but some units make the job much easier. A bathtub measured with spoons takes too many measurements. A bigger unit is more sensible.",
    badgeLabel: "Meazurex Mission",
    fairComparison: {
      containerImageSrc: BY_ID.bathtub!.image,
      label: "Bathtub",
      left: { unit: "spoon", count: 236 },
      right: { unit: "bucket", count: 5 },
    },
    sensibleUnits: shuffle([
      unitOption("spoon", "Spoon"),
      unitOption("bucket", "Bucket"),
    ]),
    correctOptionId: "bucket",
    feedback: {
      correct: "Let's choose sensible measuring units.",
      wrong: "The bucket is more sensible for a very large container.",
    },
  };
}

function buildChooseBetterUnitTask(memory: LessonMemory): CapacityTask {
  const target = choose([
    pickContainer(memory, (c) => ["bottle", "mug", "cup"].includes(c.id)),
    pickContainer(memory, (c) => ["jug", "kettle", "pot", "watering-can"].includes(c.id)),
    pickContainer(memory, (c) => ["storage-tub", "fish-tank", "bathtub", "bucket"].includes(c.id)),
  ]);
  const correct = sensibleUnit(target);
  const options = shuffle([
    unitOption("spoon", "Spoon"),
    unitOption("cup", "Cup"),
    unitOption("measuringJug", "Measuring Jug"),
    ...(correct === "bucket" ? [unitOption("bucket", "Bucket")] : []),
  ]).slice(0, 3);
  if (!options.some((o) => o.id === correct)) options[0] = unitOption(correct, correct === "measuringJug" ? "Measuring Jug" : "Bucket");
  return {
    kind: "capacityMeasure",
    scene: "betterUnit",
    prompt: `Which unit would you use to measure the ${target.label.toLowerCase()}?`,
    speakText: `Choose the best measuring unit for the ${target.label.toLowerCase()}. The best unit makes measuring easier.`,
    badgeLabel: "Choose the Better Unit",
    target: toY2CapacityItem(target),
    sensibleUnits: shuffle(options),
    correctOptionId: correct,
    feedback: {
      correct: "Yes — that unit makes measuring easier.",
      wrong: "Coach tip: match the unit size to the container so measuring is quick and clear.",
    },
  };
}

function buildWhatsWrongTask(memory: LessonMemory): CapacityTask {
  const largeTarget = pickContainer(memory, (c) => c.cups >= 16);
  const tinyTarget = pickContainer(memory, (c) => c.cups <= 4);
  const spoonProblem = randInt(2) === 0;
  const target = spoonProblem ? largeTarget : tinyTarget;
  return {
    kind: "capacityMeasure",
    scene: "fairJudge",
    prompt: spoonProblem
      ? `Why isn't a spoon a good unit for the ${target.label.toLowerCase()}?`
      : `Why is a bucket unit difficult for the ${target.label.toLowerCase()}?`,
    speakText: spoonProblem
      ? `The ${target.label.toLowerCase()} was measured with ${spoonCount(target)} spoons. Why isn't this a good measuring unit?`
      : `The ${target.label.toLowerCase()} was measured with bucket units. Why is this difficult?`,
    badgeLabel: "What's Wrong?",
    fairComparison: {
      containerImageSrc: target.image,
      label: target.label,
      left: spoonProblem
        ? { unit: "spoon", count: spoonCount(target) }
        : { unit: "bucket", count: 1 },
      right: spoonProblem
        ? { unit: "measuringJug", count: Math.max(2, Math.round(target.cups / 4)) }
        : { unit: "cup", count: target.cups },
    },
    problemOptions: spoonProblem
      ? ["Too many measurements", "The container is broken", "Water disappeared"]
      : ["The measuring unit is too large", "It gives a bigger number", "The cup is too tall"],
    correctProblem: spoonProblem ? "Too many measurements" : "The measuring unit is too large",
    feedback: {
      correct: "Yes — the unit makes the job harder.",
      wrong: "Coach tip: if the unit gives too many counts or is too large, choose a better unit.",
    },
  };
}

function buildProTask(memory: LessonMemory): CapacityTask {
  const target = pickContainer(memory, (c) => c.cups >= 8);
  const correct = sensibleUnit(target);
  const poorUnit: Unit = target.cups >= 20 ? "spoon" : "cup";
  return {
    kind: "capacityMeasure",
    scene: "fairJudge",
    prompt: `Why is the ${correct === "bucket" ? "bucket" : "measuring jug"} better for the ${target.label.toLowerCase()}?`,
    speakText: `Professor Gauge needs to measure the ${target.label.toLowerCase()}. Why is the ${correct === "bucket" ? "bucket" : "measuring jug"} the better tool?`,
    badgeLabel: "Measure Like a Pro",
    fairComparison: {
      containerImageSrc: target.image,
      label: target.label,
      left: { unit: poorUnit, count: poorUnit === "spoon" ? spoonCount(target) : target.cups },
      right: {
        unit: correct,
        count: correct === "bucket" ? Math.max(2, Math.round(target.cups / 8)) : Math.max(2, Math.round(target.cups / 4)),
      },
    },
    problemOptions: ["It is quicker and easier.", "It makes a bigger number.", "It looks nicer."],
    correctProblem: "It is quicker and easier.",
    feedback: {
      correct: "It is quicker and easier.",
      wrong: "The best tool is the one that makes measuring quicker and easier.",
    },
  };
}

function buildWhyTask(): CapacityTask {
  return {
    kind: "capacityMeasure",
    scene: "fairJudge",
    prompt: "Why should we choose a sensible measuring unit?",
    speakText: "Why should we choose a sensible measuring unit?",
    badgeLabel: "Why This Unit?",
    problemOptions: ["It makes measuring easier.", "It gives a bigger number.", "It looks nicer."],
    correctProblem: "It makes measuring easier.",
    feedback: {
      correct: "Yes — sensible units make measuring easier.",
      wrong: "Good measurers choose units that make measuring easier.",
    },
  };
}

export function generateY2MeasurelandsWeek3Lesson3Task(
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
  if (rotation === "choose") return buildChooseBetterUnitTask(memory);
  if (rotation === "wrong") return buildWhatsWrongTask(memory);
  return buildProTask(memory);
}

export function resetY2MeasurelandsWeek3Lesson3TaskSessionState() {
  lessonMemory.clear();
}

export function buildY2MeasurelandsWeek3Lesson3QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, lastId: null };
  return [
    buildChooseBetterUnitTask(seed),
    buildWhatsWrongTask(seed),
    buildProTask(seed),
    buildWhyTask(),
    buildChooseBetterUnitTask(seed),
  ];
}
