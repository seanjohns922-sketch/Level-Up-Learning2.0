import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { CONTAINERS, type CapacityContainer } from "@/data/activities/year1Measurelands/week3Lesson1";

type CapacityTask = Extract<PracticeTask, { kind: "capacityMeasure" }>;

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

function pickContainer(
  memory: LessonMemory,
  filter?: (container: CapacityContainer) => boolean,
): CapacityContainer {
  const pool = CONTAINERS.filter(
    (container) => container.id !== memory.lastId && (filter ? filter(container) : true),
  );
  const chosen = choose(pool.length ? pool : CONTAINERS);
  memory.lastId = chosen.id;
  return chosen;
}

function comparisonFor(container: CapacityContainer, fair: boolean) {
  if (fair) {
    return {
      containerImageSrc: container.image,
      label: container.label,
      left: { unit: "cup" as const, count: container.cups },
      right: { unit: "cup" as const, count: container.cups },
    };
  }
  return {
    containerImageSrc: container.image,
    label: container.label,
    left: { unit: "cup" as const, count: container.cups },
    right: { unit: "spoon" as const, count: container.cups * 2 + 2 },
  };
}

function buildIntroTask(): CapacityTask {
  const bathtub = { image: "/images/measurelands/containers-3d/bathtub.png", label: "Bathtub", cups: 10 };
  return {
    kind: "capacityMeasure",
    scene: "intro",
    prompt: "Better measuring units make capacity easier to measure.",
    speakText:
      "Professor Gauge says: after we measure and compare capacity, we also need to choose measuring units that make sense. A bathtub is easier to measure with cups than with lots and lots of spoons. Good measuring units should make sense for the container.",
    badgeLabel: "Meazurex Mission",
    fairComparison: {
      containerImageSrc: bathtub.image,
      label: bathtub.label,
      left: { unit: "cup", count: 10 },
      right: { unit: "spoon", count: 150 },
    },
    feedback: { correct: "Let's choose better measuring units!", wrong: "Let's get ready." },
  };
}

function buildChooseUnitTask(memory: LessonMemory): CapacityTask {
  const large = randInt(2) === 0;
  const target = large
    ? pickContainer(memory, (container) => container.cups >= 6)
    : pickContainer(memory, (container) => container.cups <= 3);
  const correctOptionId = large ? "cup" : "spoon";
  return {
    kind: "capacityMeasure",
    scene: "betterUnit",
    prompt: `Which unit would you use to measure the ${target.label.toLowerCase()}?`,
    speakText: `Which unit would you use to measure the ${target.label.toLowerCase()}?`,
    badgeLabel: "Which Unit Would You Use?",
    target: { imageSrc: target.image, label: target.label, cups: target.cups },
    sensibleUnits: shuffle([
      { id: "cup", unit: "cup", label: "Cup" },
      { id: "spoon", unit: "spoon", label: "Spoon" },
    ]),
    correctOptionId,
    feedback: {
      correct:
        correctOptionId === "cup"
          ? "Yes — a cup is a better unit for a larger container."
          : "Yes — a spoon can be a sensible unit for a small container.",
      wrong:
        correctOptionId === "cup"
          ? "A cup is the better unit for a larger container."
          : "A spoon is the better unit for a small container.",
    },
  };
}

function buildLongerMeasureTask(memory: LessonMemory): CapacityTask {
  const target = pickContainer(memory, (container) => container.cups >= 6);
  return {
    kind: "capacityMeasure",
    scene: "betterUnit",
    prompt: "Which is the better measuring tool?",
    speakText:
      "Look at the two measurements. Which is the better measuring tool? The better tool takes fewer repeated measures.",
    badgeLabel: "Which Takes Longer?",
    fairComparison: {
      containerImageSrc: target.image,
      label: target.label,
      left: { unit: "cup", count: target.cups },
      right: { unit: "spoon", count: target.cups * 18 + 6 },
    },
    sensibleUnits: shuffle([
      { id: "cup", unit: "cup", label: "Cup" },
      { id: "spoon", unit: "spoon", label: "Spoon" },
    ]),
    correctOptionId: "cup",
    feedback: {
      correct: "Yes — cups are the better measuring tool here because you need fewer of them.",
      wrong: "The better measuring tool here is cups because the job takes fewer repeated measures.",
    },
  };
}

function buildFixProfessorTask(memory: LessonMemory): CapacityTask {
  const largeTarget = pickContainer(memory, (container) => container.cups >= 7);
  return {
    kind: "capacityMeasure",
    scene: "betterUnit",
    prompt: "Fix Professor Gauge's measurement.",
    speakText:
      "Professor Gauge used spoons to measure a large container. Which unit should he use instead?",
    badgeLabel: "Fix Professor Gauge",
    fairComparison: {
      containerImageSrc: largeTarget.image,
      label: largeTarget.label,
      left: { unit: "spoon", count: largeTarget.cups * 18 + 6 },
      right: { unit: "cup", count: largeTarget.cups },
    },
    sensibleUnits: shuffle([
      { id: "cup", unit: "cup", label: "Cup" },
      { id: "bucket", unit: "bucket", label: "Bucket Unit" },
    ]),
    correctOptionId: "cup",
    feedback: {
      correct: "Yes — cups are the better unit here.",
      wrong: "Cups are the better unit here. Bucket units would be too large and not very helpful.",
    },
  };
}

function buildFairSupportTask(memory: LessonMemory): CapacityTask {
  const container = pickContainer(memory);
  return {
    kind: "capacityMeasure",
    scene: "fairChoose",
    prompt: "Which comparison is fair?",
    speakText: "Which comparison is fair? A fair comparison uses the same measuring unit both times.",
    badgeLabel: "Fair or Unfair?",
    fairComparisons: shuffle([
      { id: "fair", ...comparisonFor(container, true) },
      { id: "unfair", ...comparisonFor(container, false) },
    ]),
    correctOptionId: "fair",
    feedback: {
      correct: "Yes — the fair comparison uses the same unit.",
      wrong: "The fair comparison is the one that uses the same unit both times.",
    },
  };
}

function buildWhySameUnitTask(memory: LessonMemory): CapacityTask {
  const container = pickContainer(memory);
  return {
    kind: "capacityMeasure",
    scene: "fairJudge",
    prompt: "Why should we use the same measuring unit?",
    speakText: "Why should we use the same measuring unit? Choose the best answer.",
    badgeLabel: "Same Unit Rule",
    fairComparison: comparisonFor(container, false),
    fair: false,
    problemOptions: [
      "It makes the comparison fair.",
      "It makes the number bigger.",
      "It does not matter.",
    ],
    correctProblem: "It makes the comparison fair.",
    feedback: {
      correct: "Yes — the same unit makes the comparison fair.",
      wrong: "We use the same unit to make the comparison fair.",
    },
  };
}

export function generateY1MeasurelandsWeek3Lesson3Task(
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
  if (rotation === "A") return buildChooseUnitTask(memory);
  if (rotation === "B") return buildLongerMeasureTask(memory);
  return buildFixProfessorTask(memory);
}

export function resetY1MeasurelandsWeek3Lesson3TaskSessionState() {
  lessonMemory.clear();
}

export function buildY1MeasurelandsWeek3Lesson3QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, lastId: null };
  return [
    buildFairSupportTask(seed),
    {
      ...buildLongerMeasureTask(seed),
      prompt: "Which measurement tool is better?",
      speakText: "Which measurement tool is better?",
    },
    {
      ...buildFixProfessorTask(seed),
      prompt: "Fix Professor Gauge's measurement.",
      speakText: "Fix Professor Gauge's measurement.",
    },
    {
      ...buildChooseUnitTask(seed),
      prompt: "Choose the better measuring unit.",
      speakText: "Choose the better measuring unit.",
    },
    buildWhySameUnitTask(seed),
  ];
}
