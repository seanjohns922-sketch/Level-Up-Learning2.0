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

function pickContainer(memory: LessonMemory, filter?: (container: CapacityContainer) => boolean): CapacityContainer {
  const pool = CONTAINERS.filter((container) => container.id !== memory.lastId && (filter ? filter(container) : true));
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
  const bucket = CONTAINERS.find((container) => container.id === "bucket")!;
  return {
    kind: "capacityMeasure",
    scene: "intro",
    prompt: "Using the same measuring unit makes capacity fair.",
    speakText:
      "Professor Gauge says: if two explorers use different measuring tools, they can get different numbers for the same container. Capacity comparisons are only fair when we use the same measuring unit each time.",
    badgeLabel: "Meazurex Mission",
    fairComparison: {
      containerImageSrc: bucket.image,
      label: "Bucket",
      left: { unit: "cup", count: 5 },
      right: { unit: "spoon", count: 12 },
    },
    feedback: { correct: "Let's check which measurements are fair!", wrong: "Let's get ready." },
  };
}

function buildFairChooseTask(memory: LessonMemory): CapacityTask {
  const fairContainer = pickContainer(memory);
  const unfairContainer = pickContainer(memory, (container) => container.id !== fairContainer.id);
  const options = shuffle([
    { id: "fair", ...comparisonFor(fairContainer, true) },
    { id: "unfair", ...comparisonFor(unfairContainer, false) },
  ]);
  return {
    kind: "capacityMeasure",
    scene: "fairChoose",
    prompt: "Which comparison is fair?",
    speakText: "Which comparison is fair? A fair comparison uses the same measuring unit both times.",
    badgeLabel: "Which Measurement Is Fair?",
    fairComparisons: options,
    correctOptionId: "fair",
    feedback: { correct: "Yes — both explorers used the same cup.", wrong: "A fair comparison uses the same measuring unit both times." },
  };
}

function buildProblemTask(memory: LessonMemory): CapacityTask {
  const left = pickContainer(memory, (container) => container.cups <= 5);
  const right = pickContainer(memory, (container) => container.cups >= 6 && container.id !== left.id);
  return {
    kind: "capacityMeasure",
    scene: "fairJudge",
    prompt: "What is wrong with this measurement?",
    speakText: "What is wrong? Listen carefully. The explorers used different measuring units.",
    badgeLabel: "Find the Problem",
    fairComparison: {
      containerImageSrc: right.image,
      label: right.label,
      left: { unit: "cup", count: left.cups },
      right: { unit: "spoon", count: right.cups + 4 },
    },
    fair: false,
    problemOptions: [
      "Different measuring units",
      "Too much water",
      "Wrong container",
    ],
    correctProblem: "Different measuring units",
    feedback: { correct: "Right — the measuring units do not match.", wrong: "The problem is that the measuring units are different." },
  };
}

function buildBetterUnitTask(memory: LessonMemory): CapacityTask {
  const large = randInt(2) === 0;
  const target = large
    ? pickContainer(memory, (container) => container.cups >= 6)
    : pickContainer(memory, (container) => container.cups <= 3);
  const correctUnit = large ? "cup" : "spoon";
  return {
    kind: "capacityMeasure",
    scene: "betterUnit",
    prompt: `Which is the better unit to measure the ${target.label.toLowerCase()}?`,
    speakText: `Which is the better measuring unit for the ${target.label.toLowerCase()}?`,
    badgeLabel: "Choose the Better Unit",
    target: { imageSrc: target.image, label: target.label, cups: target.cups },
    sensibleUnits: shuffle([
      { id: "cup", unit: "cup", label: "Cup" },
      { id: "spoon", unit: "spoon", label: "Spoon" },
    ]),
    correctOptionId: correctUnit,
    feedback: {
      correct: correctUnit === "cup" ? "Yes — a cup is a better unit for a larger container." : "Yes — a spoon is a sensible unit for a small container.",
      wrong: correctUnit === "cup" ? "A cup is the better unit for a larger container." : "A spoon is the better unit for a small container.",
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
    feedback: { correct: "Yes — the same unit makes the comparison fair.", wrong: "We use the same unit to make comparisons fair." },
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
  if (rotation === "A") return buildFairChooseTask(memory);
  if (rotation === "B") return buildProblemTask(memory);
  return buildBetterUnitTask(memory);
}

export function resetY1MeasurelandsWeek3Lesson3TaskSessionState() {
  lessonMemory.clear();
}

export function buildY1MeasurelandsWeek3Lesson3QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, lastId: null };
  const fair = buildFairChooseTask(seed);
  const differentUnits = buildProblemTask(seed);
  const betterUnitLarge = buildBetterUnitTask(seed);
  const betterUnitSmall = buildBetterUnitTask(seed);
  if (betterUnitSmall.correctOptionId === betterUnitLarge.correctOptionId) {
    const small = CONTAINERS.find((container) => container.cups <= 3)!;
    betterUnitSmall.target = { imageSrc: small.image, label: small.label, cups: small.cups };
    betterUnitSmall.correctOptionId = "spoon";
    betterUnitSmall.sensibleUnits = [
      { id: "cup", unit: "cup", label: "Cup" },
      { id: "spoon", unit: "spoon", label: "Spoon" },
    ];
  }
  return [
    fair,
    {
      ...differentUnits,
      prompt: "Which measurement uses different units?",
      speakText: "Which measurement uses different units?",
    },
    buildProblemTask(seed),
    betterUnitLarge,
    buildWhySameUnitTask(seed),
  ];
}
