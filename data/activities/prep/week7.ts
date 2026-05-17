import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

type GroundObjectType = Extract<PracticeTask, { kind: "groundBuild" }>["objectType"];
type GroundPatternLayout = NonNullable<Extract<PracticeTask, { kind: "groundFlash" }>["patternLayout"]>;
type GroundTapCountTask = Extract<PracticeTask, { kind: "groundTapCount" }>;
type GroundMoveCountTask = Extract<PracticeTask, { kind: "groundMoveCount" }>;
type GroundBuildTask = Extract<PracticeTask, { kind: "groundBuild" }>;
type GroundMatchTask = Extract<PracticeTask, { kind: "groundMatch" }>;
type GroundGrowingCountTask = Extract<PracticeTask, { kind: "groundGrowingCount" }>;
type GroundFeedTask = Extract<PracticeTask, { kind: "groundFeed" }>;
type GroundFlashTask = Extract<PracticeTask, { kind: "groundFlash" }>;

type Week7Memory = {
  cursor: number;
  recentTargets: number[];
  recentKinds: string[];
  recentObjects: GroundObjectType[];
  recentLayouts: GroundPatternLayout[];
  recentPositions: number[];
};

const OBJECTS: GroundObjectType[] = [
  "stars",
  "crystals",
  "robot_tokens",
  "energy_orbs",
  "planets",
  "blocks",
  "dots",
];
const LOW_TARGETS = [8, 9, 10, 11, 12, 13] as const;
const MID_TARGETS = [11, 12, 13, 14, 15, 16, 17] as const;
const HIGH_TARGETS = [12, 13, 14, 15, 16, 17, 18, 19, 20] as const;
const LESSON1_ROTATION = [
  "count_collection",
  "tap_to_count",
  "organise_collection",
  "count_robots",
  "which_number_matches",
  "fill_the_ten_frame",
  "count_the_moving_objects",
  "groups_of_ten",
  "find_the_collection",
  "count_and_build",
  "fix_the_count",
  "count_the_path",
  "quick_count",
  "teen_number_match",
  "how_many_more",
] as const;

const memoryByLesson = new Map<string, Week7Memory>();

function getMemory(lessonId: string) {
  const existing = memoryByLesson.get(lessonId);
  if (existing) return existing;
  const created: Week7Memory = {
    cursor: 0,
    recentTargets: [],
    recentKinds: [],
    recentObjects: [],
    recentLayouts: [],
    recentPositions: [],
  };
  memoryByLesson.set(lessonId, created);
  return created;
}

function pushRecent<T>(list: T[], value: T, limit: number) {
  list.push(value);
  while (list.length > limit) list.shift();
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: readonly T[] | T[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex]!, next[index]!];
  }
  return next;
}

function numberWord(value: number) {
  const words = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
    "twenty",
  ];
  return words[value] ?? String(value);
}

function objectLabel(objectType: GroundObjectType) {
  if (objectType === "robot_tokens") return "robots";
  if (objectType === "energy_orbs") return "energy cells";
  if (objectType === "blocks") return "cubes";
  if (objectType === "dots") return "glowing dots";
  if (objectType === "planets") return "planets";
  if (objectType === "crystals") return "crystals";
  return objectType;
}

function chooseRecentSafe<T>(pool: readonly T[] | T[], recent: T[]) {
  let candidate = pool[randInt(0, pool.length - 1)]!;
  for (let attempts = 0; attempts < 4; attempts += 1) {
    const lastTwo = recent.slice(-2);
    if (lastTwo.length === 2 && lastTwo.every((value) => value === candidate)) {
      candidate = pool[randInt(0, pool.length - 1)]!;
      continue;
    }
    break;
  }
  return candidate;
}

function stagePool(memory: Week7Memory, difficulty: Difficulty) {
  if (difficulty === "easy") {
    if (memory.cursor < 6) return [...LOW_TARGETS];
    if (memory.cursor < 16) return [...MID_TARGETS];
    return [...HIGH_TARGETS];
  }
  if (difficulty === "medium") return [...MID_TARGETS, 18, 19];
  return [...HIGH_TARGETS];
}

function pickTarget(memory: Week7Memory, difficulty: Difficulty) {
  const target = chooseRecentSafe(stagePool(memory, difficulty), memory.recentTargets);
  pushRecent(memory.recentTargets, target, 6);
  return target;
}

function pickObject(memory: Week7Memory, preferred?: GroundObjectType[]) {
  const objectType = chooseRecentSafe(preferred ?? OBJECTS, memory.recentObjects);
  pushRecent(memory.recentObjects, objectType, 6);
  return objectType;
}

function pickLayout(memory: Week7Memory, quantity: number, preferred?: GroundPatternLayout[]) {
  const pool: GroundPatternLayout[] = preferred
    ? preferred
    : quantity >= 11
      ? ["ten_frame", "symmetry"]
      : quantity >= 8
        ? ["ten_frame", "domino", "symmetry"]
        : ["dice", "domino", "symmetry", "ten_frame"];
  const layout = chooseRecentSafe(pool, memory.recentLayouts);
  pushRecent(memory.recentLayouts, layout, 6);
  return layout;
}

function nextKind(memory: Week7Memory) {
  const kind = LESSON1_ROTATION[memory.cursor % LESSON1_ROTATION.length]!;
  memory.cursor += 1;
  pushRecent(memory.recentKinds, kind, 6);
  return kind;
}

function chooseAnswerPosition(memory: Week7Memory, optionCount: number) {
  const position = chooseRecentSafe(Array.from({ length: optionCount }, (_, index) => index), memory.recentPositions);
  pushRecent(memory.recentPositions, position, 5);
  return position;
}

function closeNumeralOptions(target: number, memory: Week7Memory, optionCount = 3) {
  const nearby = shuffle(
    Array.from({ length: 13 }, (_, index) => index + 8).filter(
      (value) => value !== target && Math.abs(value - target) <= 3
    )
  );
  const fallback = shuffle(Array.from({ length: 13 }, (_, index) => index + 8).filter((value) => value !== target));
  const distractors = (nearby.length >= optionCount - 1 ? nearby : fallback).slice(0, optionCount - 1);
  const correctPosition = chooseAnswerPosition(memory, optionCount);
  const ordered = new Array<number>(optionCount);
  ordered[correctPosition] = target;
  const positions = Array.from({ length: optionCount }, (_, index) => index).filter((index) => index !== correctPosition);
  positions.forEach((position, index) => {
    ordered[position] = distractors[index]!;
  });
  return ordered.map((numeral, index) => ({
    id: `num-${target}-${index}-${numeral}`,
    numeral,
  }));
}

function makeTapCountTask(task: Omit<GroundTapCountTask, "kind">): PracticeTask {
  return { kind: "groundTapCount", ...task };
}

function makeMoveCountTask(task: Omit<GroundMoveCountTask, "kind">): PracticeTask {
  return { kind: "groundMoveCount", ...task };
}

function makeBuildTask(task: Omit<GroundBuildTask, "kind">): PracticeTask {
  return { kind: "groundBuild", ...task };
}

function makeMatchTask(task: Omit<GroundMatchTask, "kind">): PracticeTask {
  return { kind: "groundMatch", ...task };
}

function makeGrowingCountTask(task: Omit<GroundGrowingCountTask, "kind">): PracticeTask {
  return { kind: "groundGrowingCount", ...task };
}

function makeFeedTask(task: Omit<GroundFeedTask, "kind">): PracticeTask {
  return { kind: "groundFeed", ...task };
}

function makeFlashTask(task: Omit<GroundFlashTask, "kind">): PracticeTask {
  return { kind: "groundFlash", ...task };
}

function createCountCollectionTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const objectType = pickObject(memory);
  const options = closeNumeralOptions(target, memory);
  return makeTapCountTask({
    prompt: "How many are there?",
    speakText: "How many are there? Tap to count carefully.",
    targetNumber: target,
    objectType,
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "Great counting!", wrong: "Touch each object once and count again." },
  });
}

function createTapToCountTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const objectType = pickObject(memory);
  const options = closeNumeralOptions(target, memory);
  return makeTapCountTask({
    prompt: `Tap to count the ${objectLabel(objectType)}.`,
    speakText: `Tap each ${objectLabel(objectType)} to count. Then tap the number.`,
    targetNumber: target,
    objectType,
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "You counted carefully!", wrong: "Tap each one once." },
  });
}

function createOrganiseCollectionTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const objectType = pickObject(memory);
  const options = closeNumeralOptions(target, memory);
  return makeMoveCountTask({
    prompt: "Move the objects into the counting zone, then count.",
    speakText: "Move each object into the counting zone, then count how many there are.",
    targetNumber: target,
    objectType,
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "Nice organising!", wrong: "Move each object once, then count carefully." },
  });
}

function createCountRobotsTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = Math.max(11, pickTarget(memory, difficulty));
  return makeFeedTask({
    prompt: "How many robots are charging?",
    speakText: "How many robots are charging? Feed each robot into the charger as you count.",
    targetNumber: target,
    objectType: "robot_tokens",
    totalObjects: target,
    feedback: { correct: "The robots are all counted!", wrong: "Count each robot once." },
  });
}

function createWhichNumberMatchesTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const objectType = pickObject(memory);
  const options = closeNumeralOptions(target, memory).map((option) => ({
    id: option.id,
    kind: "numeral" as const,
    numeral: option.numeral,
  }));
  return makeMatchTask({
    prompt: "Which number matches the collection?",
    speakText: "Which number matches the collection?",
    targetNumber: target,
    visualType: "ground-quantity-card",
    promptType: "group_to_numeral",
    objectType,
    patternLayout: target >= 11 ? undefined : pickLayout(memory, target),
    shownQuantity: target,
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: `You found ${target}!`, wrong: "Count the collection carefully." },
  });
}

function createFillTenFrameTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = Math.max(11, pickTarget(memory, difficulty));
  const options = closeNumeralOptions(target, memory).map((option) => ({
    id: option.id,
    kind: "numeral" as const,
    numeral: option.numeral,
  }));
  return makeMatchTask({
    prompt: "Count the ten frame and extras.",
    speakText: "Count the ten frame and extras. How many are there altogether?",
    targetNumber: target,
    visualType: "ground-quantity-card",
    promptType: "group_to_numeral",
    objectType: pickObject(memory),
    patternLayout: "ten_frame",
    shownQuantity: target,
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "Great teen number counting!", wrong: "Count the full frame and the extras." },
  });
}

function createCountMovingObjectsTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const pool = difficulty === "hard" ? [10, 11, 12, 13] : [8, 9, 10, 11, 12];
  const target = chooseRecentSafe(pool, memory.recentTargets);
  pushRecent(memory.recentTargets, target, 6);
  const options = closeNumeralOptions(target, memory);
  return makeGrowingCountTask({
    prompt: "Count the moving objects.",
    speakText: "Count the moving objects carefully.",
    targetNumber: target,
    objectType: pickObject(memory),
    revealMs: 460,
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "You tracked them carefully!", wrong: "Watch the objects appear and count again." },
  });
}

function createGroupsOfTenTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = Math.max(11, pickTarget(memory, difficulty));
  const extras = target - 10;
  const options = closeNumeralOptions(target, memory).map((option) => ({
    id: option.id,
    kind: "numeral" as const,
    numeral: option.numeral,
  }));
  return makeMatchTask({
    prompt: `10 and ${extras} more. How many altogether?`,
    speakText: `Ten and ${numberWord(extras)} more. How many altogether?`,
    targetNumber: target,
    visualType: "ground-quantity-card",
    promptType: "group_to_numeral",
    objectType: pickObject(memory),
    patternLayout: "ten_frame",
    shownQuantity: target,
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: `Yes, 10 and ${extras} makes ${target}!`, wrong: "See the full group of ten, then count the extras." },
  });
}

function createFindCollectionTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = Math.max(11, pickTarget(memory, difficulty));
  const distractors = shuffle(
    Array.from({ length: 13 }, (_, index) => index + 8).filter((value) => value !== target && Math.abs(value - target) <= 2)
  ).slice(0, 2);
  const values = shuffle([target, ...distractors]);
  const options = values.map((value, index) => ({
    id: `find-${target}-${index}-${value}`,
    kind: "quantity" as const,
    quantity: value,
    objectType: pickObject(memory),
    patternLayout: value >= 11 ? "ten_frame" : pickLayout(memory, value),
  }));
  return makeMatchTask({
    prompt: `Find ${target}.`,
    speakText: `Find ${numberWord(target)}.`,
    targetNumber: target,
    visualType: "ground-quantity-card",
    promptType: "numeral_to_group",
    shownNumeral: target,
    objectType: pickObject(memory),
    options,
    correctOptionId: options.find((option) => option.quantity === target)!.id,
    feedback: { correct: `You found ${target}!`, wrong: "Look for the collection with that many objects." },
  });
}

function createCountAndBuildTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = Math.max(11, pickTarget(memory, difficulty));
  const objectType = pickObject(memory);
  return makeBuildTask({
    prompt: `Build ${target}.`,
    speakText: `Build ${numberWord(target)}.`,
    targetNumber: target,
    objectType,
    compareMode: "exact",
    maxBuild: 20,
    referenceGroup: {
      quantity: target,
      objectType,
      patternLayout: "ten_frame",
    },
    feedback: { correct: `You built ${target}!`, wrong: "Add or remove objects until the count matches." },
  });
}

function createFixCountTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const options = closeNumeralOptions(target, memory).map((option) => ({
    id: option.id,
    kind: "numeral" as const,
    numeral: option.numeral,
  }));
  return makeMatchTask({
    prompt: "Numbot counted these. What is the correct total?",
    speakText: "Numbot counted these. What is the correct total?",
    targetNumber: target,
    visualType: "ground-quantity-card",
    promptType: "group_to_numeral",
    objectType: pickObject(memory),
    patternLayout: target >= 11 ? undefined : pickLayout(memory, target),
    shownQuantity: target,
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "You fixed the count!", wrong: "Count each object once to find the correct total." },
  });
}

function createCountPathTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const options = closeNumeralOptions(target, memory);
  return makeMoveCountTask({
    prompt: "Follow the count path and move each object.",
    speakText: "Follow the count path and move each object, then choose the total.",
    targetNumber: target,
    objectType: pickObject(memory),
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "Great tracking!", wrong: "Follow the path and move each one once." },
  });
}

function createQuickCountTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const pool = difficulty === "hard" ? [11, 12, 13, 14] : [8, 9, 10, 11, 12];
  const target = chooseRecentSafe(pool, memory.recentTargets);
  pushRecent(memory.recentTargets, target, 6);
  const options = closeNumeralOptions(target, memory).map((option) => ({
    id: option.id,
    numeral: option.numeral,
  }));
  return makeFlashTask({
    prompt: "Quick count. How many did you see?",
    speakText: "Quick count. How many did you see?",
    targetNumber: target,
    objectType: pickObject(memory),
    patternLayout: pickLayout(memory, Math.min(target, 12), target >= 11 ? ["ten_frame"] : undefined),
    revealType: "objects",
    revealMs: difficulty === "hard" ? 1100 : 1400,
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "Quick counting complete!", wrong: "Look for groups to help you count fast." },
  });
}

function createTeenNumberMatchTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = Math.max(11, pickTarget(memory, difficulty));
  const distractors = shuffle(
    Array.from({ length: 13 }, (_, index) => index + 8).filter((value) => value !== target && Math.abs(value - target) <= 2)
  ).slice(0, 2);
  const values = shuffle([target, ...distractors]);
  const options = values.map((value, index) => ({
    id: `teen-${target}-${index}-${value}`,
    kind: "pair" as const,
    pairNumeral: value,
    pairQuantity: value,
    objectType: pickObject(memory),
    patternLayout: value >= 11 ? "ten_frame" : pickLayout(memory, value),
  }));
  return makeMatchTask({
    prompt: "Match the teen number to the collection.",
    speakText: "Match the teen number to the collection.",
    targetNumber: target,
    visualType: "ground-number-card",
    promptType: "number_to_objects",
    shownNumeral: target,
    options,
    correctOptionId: options.find((option) => option.pairNumeral === target)!.id,
    feedback: { correct: `That collection shows ${target}.`, wrong: "Look for the collection with that many objects." },
  });
}

function createHowManyMoreTask(lessonId: string): PracticeTask {
  const memory = getMemory(lessonId);
  const shownPart = chooseRecentSafe([11, 12, 13, 14, 15, 16, 17, 18, 19], memory.recentTargets);
  pushRecent(memory.recentTargets, shownPart, 6);
  const missing = 20 - shownPart;
  const options = shuffle([missing, Math.max(1, missing - 1), Math.min(9, missing + 1)]).map((numeral, index) => ({
    id: `more-${shownPart}-${index}-${numeral}`,
    kind: "numeral" as const,
    numeral,
  }));
  return makeMatchTask({
    prompt: "How many more to make 20?",
    speakText: "How many more to make 20?",
    targetNumber: missing,
    visualType: "ground-quantity-card",
    promptType: "group_to_numeral",
    shownNumeral: 20,
    shownQuantity: shownPart,
    objectType: pickObject(memory),
    patternLayout: "ten_frame",
    options,
    correctOptionId: options.find((option) => option.numeral === missing)!.id,
    feedback: { correct: `Yes, ${shownPart} and ${missing} makes 20!`, wrong: "Count how many spaces are still empty." },
  });
}

function generateLesson1Task(lessonId: string, difficulty: Difficulty, kind: (typeof LESSON1_ROTATION)[number]): PracticeTask {
  switch (kind) {
    case "count_collection":
      return createCountCollectionTask(lessonId, difficulty);
    case "tap_to_count":
      return createTapToCountTask(lessonId, difficulty);
    case "organise_collection":
      return createOrganiseCollectionTask(lessonId, difficulty);
    case "count_robots":
      return createCountRobotsTask(lessonId, difficulty);
    case "which_number_matches":
      return createWhichNumberMatchesTask(lessonId, difficulty);
    case "fill_the_ten_frame":
      return createFillTenFrameTask(lessonId, difficulty);
    case "count_the_moving_objects":
      return createCountMovingObjectsTask(lessonId, difficulty);
    case "groups_of_ten":
      return createGroupsOfTenTask(lessonId, difficulty);
    case "find_the_collection":
      return createFindCollectionTask(lessonId, difficulty);
    case "count_and_build":
      return createCountAndBuildTask(lessonId, difficulty);
    case "fix_the_count":
      return createFixCountTask(lessonId, difficulty);
    case "count_the_path":
      return createCountPathTask(lessonId, difficulty);
    case "quick_count":
      return createQuickCountTask(lessonId, difficulty);
    case "teen_number_match":
      return createTeenNumberMatchTask(lessonId, difficulty);
    case "how_many_more":
      return createHowManyMoreTask(lessonId);
  }
}

export function generatePrepWeek7Task(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const kind = nextKind(memory);
  return generateLesson1Task(lessonId, difficulty, kind);
}

export function resetPrepWeek7TaskSessionState() {
  memoryByLesson.clear();
}
