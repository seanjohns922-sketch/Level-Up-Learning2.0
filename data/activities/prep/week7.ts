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
type GroundCompareTask = Extract<PracticeTask, { kind: "groundCompare" }>;

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
const EARLY_TEENS = [11, 12, 13, 14] as const;
const MID_TEENS = [15, 16, 17] as const;
const LATE_TEENS = [18, 19, 20] as const;
const TEENS = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20] as const;
const WEEK7_MOVING_REVEAL_MS = 650;
const WEEK7_QUICK_COUNT_REVEAL_MS: Record<Difficulty, number> = {
  easy: 2200,
  medium: 1800,
  hard: 1500,
};
const WEEK7_QUICK_TEEN_REVEAL_MS: Record<Difficulty, number> = {
  easy: 2400,
  medium: 2000,
  hard: 1700,
};
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
const LESSON2_ROTATION = [
  "build_teen_number",
  "which_number_matches",
  "teen_number_match",
  "how_many_more_than_10",
  "find_the_teen_number",
  "fill_the_collection",
  "numbot_teen_reactor",
  "match_the_extras",
  "teen_number_path",
  "quick_teen_flash",
  "count_the_extras",
  "build_to_20",
  "same_or_different",
  "missing_teen_number",
  "which_is_bigger",
] as const;
const LESSON3_ROTATION = [
  "build_collection",
  "build_groups",
  "match_collection",
  "build_to_20",
  "numbot_group_builder",
  "organise_objects",
  "how_many_more",
  "find_the_collection",
  "build_teen_number",
  "complete_the_frame",
  "quick_group_flash",
  "group_the_robots",
  "same_or_different",
  "build_missing_part",
  "collection_sort",
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

function teenStagePool(memory: Week7Memory, difficulty: Difficulty) {
  if (difficulty === "easy") {
    if (memory.cursor < 5) return [...EARLY_TEENS];
    if (memory.cursor < 12) return [...MID_TEENS, ...EARLY_TEENS];
    return [...TEENS];
  }
  if (difficulty === "medium") return [...MID_TEENS, ...LATE_TEENS, 14];
  return [...TEENS];
}

function pickTarget(memory: Week7Memory, difficulty: Difficulty) {
  const target = chooseRecentSafe(stagePool(memory, difficulty), memory.recentTargets);
  pushRecent(memory.recentTargets, target, 6);
  return target;
}

function pickTeenTarget(memory: Week7Memory, difficulty: Difficulty) {
  const target = chooseRecentSafe(teenStagePool(memory, difficulty), memory.recentTargets);
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

function nextLesson1Kind(memory: Week7Memory) {
  const kind = LESSON1_ROTATION[memory.cursor % LESSON1_ROTATION.length]!;
  memory.cursor += 1;
  pushRecent(memory.recentKinds, kind, 6);
  return kind;
}

function nextLesson2Kind(memory: Week7Memory) {
  const kind = LESSON2_ROTATION[memory.cursor % LESSON2_ROTATION.length]!;
  memory.cursor += 1;
  pushRecent(memory.recentKinds, kind, 6);
  return kind;
}

function nextLesson3Kind(memory: Week7Memory) {
  const kind = LESSON3_ROTATION[memory.cursor % LESSON3_ROTATION.length]!;
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

function extraCountOptions(extras: number, memory: Week7Memory) {
  const pool = shuffle([extras, Math.max(1, extras - 1), Math.min(10, extras + 1), Math.min(10, extras + 2)]);
  const chosen = Array.from(new Set(pool)).slice(0, 3);
  while (chosen.length < 3) {
    const fallback = randInt(1, 10);
    if (!chosen.includes(fallback)) chosen.push(fallback);
  }
  const correctPosition = chooseAnswerPosition(memory, 3);
  const ordered = new Array<number>(3);
  ordered[correctPosition] = extras;
  const distractors = chosen.filter((value) => value !== extras).slice(0, 2);
  const positions = [0, 1, 2].filter((index) => index !== correctPosition);
  positions.forEach((position, index) => {
    ordered[position] = distractors[index]!;
  });
  return ordered.map((numeral, index) => ({
    id: `extra-${extras}-${index}-${numeral}`,
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

function makeCompareTask(task: Omit<GroundCompareTask, "kind">): PracticeTask {
  return { kind: "groundCompare", ...task };
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
  const target = pickTeenTarget(memory, difficulty);
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
    revealMs: WEEK7_MOVING_REVEAL_MS,
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
    revealMs: WEEK7_QUICK_COUNT_REVEAL_MS[difficulty],
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

function createTeenBuilderTask(lessonId: string, difficulty: Difficulty, prompt: string, speakText: string, target?: number, feedback?: NonNullable<GroundBuildTask["feedback"]>): PracticeTask {
  const memory = getMemory(lessonId);
  const teenTarget = target ?? pickTeenTarget(memory, difficulty);
  const objectType = pickObject(memory);
  return makeBuildTask({
    prompt,
    speakText,
    targetNumber: teenTarget,
    objectType,
    compareMode: "exact",
    maxBuild: 20,
    referenceGroup: {
      quantity: teenTarget,
      objectType,
      patternLayout: "ten_frame",
    },
    feedback: feedback ?? { correct: `You built ${teenTarget}!`, wrong: "Build the full ten and the extras." },
  });
}

function createTeenWhichNumberMatchesTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = pickTeenTarget(memory, difficulty);
  const options = closeNumeralOptions(target, memory).map((option) => ({
    id: option.id,
    kind: "numeral" as const,
    numeral: option.numeral,
  }));
  return makeMatchTask({
    prompt: "What number is this?",
    speakText: "What number is this?",
    targetNumber: target,
    visualType: "ground-quantity-card",
    promptType: "group_to_numeral",
    objectType: pickObject(memory),
    patternLayout: "ten_frame",
    shownQuantity: target,
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: `Yes, that is ${target}!`, wrong: "See the full 10 and count the extras." },
  });
}

function createHowManyMoreThan10Task(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = pickTeenTarget(memory, difficulty);
  const extras = target - 10;
  const options = extraCountOptions(extras, memory).map((option) => ({
    id: option.id,
    kind: "numeral" as const,
    numeral: option.numeral,
  }));
  return makeMatchTask({
    prompt: `How many more than 10 is ${target}?`,
    speakText: `How many more than 10 is ${numberWord(target)}?`,
    targetNumber: extras,
    visualType: "ground-quantity-card",
    promptType: "group_to_numeral",
    objectType: pickObject(memory),
    patternLayout: "ten_frame",
    shownQuantity: target,
    options,
    correctOptionId: options.find((option) => option.numeral === extras)!.id,
    feedback: { correct: `Yes, ${target} is 10 and ${extras} more.`, wrong: "Count the extras after the full 10." },
  });
}

function createFindTeenNumberTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = pickTeenTarget(memory, difficulty);
  const distractors = shuffle(TEENS.filter((value) => value !== target && Math.abs(value - target) <= 2)).slice(0, 2);
  const values = shuffle([target, ...distractors]);
  const options = values.map((value, index) => ({
    id: `teen-find-${target}-${index}-${value}`,
    kind: "quantity" as const,
    quantity: value,
    objectType: pickObject(memory),
    patternLayout: "ten_frame" as const,
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
    feedback: { correct: `You found ${target}!`, wrong: "Look for the full 10 and the correct extras." },
  });
}

function createMatchExtrasTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const extras = chooseRecentSafe([1, 2, 3, 4, 5, 6, 7, 8, 9], memory.recentTargets);
  pushRecent(memory.recentTargets, extras + 10, 6);
  const target = 10 + extras;
  const options = closeNumeralOptions(target, memory).map((option) => ({
    id: option.id,
    kind: "numeral" as const,
    numeral: option.numeral,
  }));
  return makeMatchTask({
    prompt: `Which number has ${extras} more than 10?`,
    speakText: `Which number has ${numberWord(extras)} more than 10?`,
    targetNumber: target,
    visualType: "ground-quantity-card",
    promptType: "group_to_numeral",
    objectType: pickObject(memory),
    patternLayout: "ten_frame",
    shownQuantity: target,
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: `${target} is 10 and ${extras} more!`, wrong: "Look for the teen number with that many extras." },
  });
}

function createTeenNumberPathTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const start = difficulty === "easy" ? randInt(11, 13) : difficulty === "medium" ? randInt(12, 15) : randInt(14, 17);
  const values = [start, start + 1, start + 2];
  pushRecent(memory.recentTargets, start + 2, 6);
  const groups = shuffle(values).map((quantity, index) => ({
    id: `teen-order-${lessonId}-${index}-${quantity}`,
    quantity,
    objectType: pickObject(memory),
    patternLayout: "ten_frame" as const,
  }));
  return makeCompareTask({
    prompt: "Put the teen collections in order.",
    speakText: "Put the teen collections in order from least to most.",
    targetNumber: values[values.length - 1]!,
    comparisonType: "order",
    groups,
    correctOrderIds: [...groups].sort((a, b) => a.quantity - b.quantity).map((group) => group.id),
    orderDirection: "ASC",
    feedback: { correct: "Great teen number ordering!", wrong: "Start with the smallest teen number." },
  });
}

function createQuickTeenFlashTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = pickTeenTarget(memory, difficulty);
  const options = closeNumeralOptions(target, memory).map((option) => ({ id: option.id, numeral: option.numeral }));
  return makeFlashTask({
    prompt: "Quick teen flash. What number did you see?",
    speakText: "Quick teen flash. What number did you see?",
    targetNumber: target,
    objectType: pickObject(memory),
    patternLayout: "ten_frame",
    revealType: "objects",
    revealMs: WEEK7_QUICK_TEEN_REVEAL_MS[difficulty],
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "You spotted the teen number!", wrong: "Look for the full ten and the extras." },
  });
}

function createCountTheExtrasTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  return createHowManyMoreThan10Task(lessonId, difficulty);
}

function createBuildTo20Task(lessonId: string, difficulty: Difficulty): PracticeTask {
  const pool = difficulty === "easy" ? [18] : difficulty === "medium" ? [18, 19] : [18, 19, 20];
  const memory = getMemory(lessonId);
  const target = chooseRecentSafe(pool, memory.recentTargets);
  pushRecent(memory.recentTargets, target, 6);
  return createTeenBuilderTask(
    lessonId,
    difficulty,
    `Build ${target}.`,
    `Build ${numberWord(target)}.`,
    target,
    { correct: `You built ${target}!`, wrong: "Use a full ten and the extras to build the teen number." }
  );
}

function createSameOrDifferentTeenTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const base = pickTeenTarget(memory, difficulty);
  const same = Math.random() < 0.5;
  const other = same ? base : chooseRecentSafe(TEENS.filter((value) => value !== base && Math.abs(value - base) <= 2), memory.recentTargets);
  pushRecent(memory.recentTargets, other, 6);
  return makeCompareTask({
    prompt: "Do these show the same number?",
    speakText: "Do these show the same number?",
    targetNumber: base,
    comparisonType: "equal",
    helperVariant: "ten_frame",
    groups: [
      { id: `same-${base}-a`, quantity: base, objectType: pickObject(memory), patternLayout: "ten_frame" },
      { id: `same-${other}-b`, quantity: other, objectType: pickObject(memory), patternLayout: "ten_frame" },
    ],
    feedback: { correct: same ? "Yes, they match!" : "Correct, they are different!", wrong: "Look at the extras after 10." },
  });
}

function createMissingTeenNumberTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = pickTeenTarget(memory, difficulty);
  const extras = target - 10;
  const options = closeNumeralOptions(target, memory).map((option) => ({
    id: option.id,
    kind: "numeral" as const,
    numeral: option.numeral,
  }));
  return makeMatchTask({
    prompt: `10 and ${extras} more is...`,
    speakText: `10 and ${numberWord(extras)} more is...`,
    targetNumber: target,
    visualType: "ground-quantity-card",
    promptType: "group_to_numeral",
    objectType: pickObject(memory),
    patternLayout: "ten_frame",
    shownQuantity: target,
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: `Yes, 10 and ${extras} more is ${target}!`, wrong: "Count on from the full ten." },
  });
}

function createWhichIsBiggerTeenTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const first = pickTeenTarget(memory, difficulty);
  const second = chooseRecentSafe(TEENS.filter((value) => value !== first), memory.recentTargets);
  pushRecent(memory.recentTargets, second, 6);
  const groups = shuffle([
    { id: `bigger-${first}`, quantity: first, objectType: pickObject(memory), patternLayout: "ten_frame" as const },
    { id: `bigger-${second}`, quantity: second, objectType: pickObject(memory), patternLayout: "ten_frame" as const },
  ]);
  const correctGroup = groups.reduce((best, current) => (current.quantity > best.quantity ? current : best));
  return makeCompareTask({
    prompt: "Which is bigger?",
    speakText: "Which is bigger?",
    targetNumber: Math.max(first, second),
    comparisonType: "biggest",
    helperVariant: "ten_frame",
    groups,
    correctGroupId: correctGroup.id,
    feedback: { correct: "You found the bigger teen number!", wrong: "Look at which one has more extras after 10." },
  });
}

function createLesson3BuildCollectionTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const target = pickTeenTarget(getMemory(lessonId), difficulty);
  return createTeenBuilderTask(lessonId, difficulty, `Build ${target}.`, `Build ${numberWord(target)}.`, target, {
    correct: `You built ${target}!`,
    wrong: "Build the full 10 and then the extras."
  });
}

function createLesson3BuildGroupsTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = pickTeenTarget(memory, difficulty);
  const options = closeNumeralOptions(target, memory);
  return makeMoveCountTask({
    prompt: "Make groups to help count.",
    speakText: "Make groups to help count, then choose the total.",
    targetNumber: target,
    objectType: pickObject(memory),
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "Great grouping!", wrong: "Group the objects carefully, then count the total." },
  });
}

function createLesson3MatchCollectionTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const target = pickTeenTarget(getMemory(lessonId), difficulty);
  const memory = getMemory(lessonId);
  const distractors = shuffle(TEENS.filter((value) => value !== target && Math.abs(value - target) <= 2)).slice(0, 2);
  const values = shuffle([target, ...distractors]);
  const options = values.map((value, index) => ({
    id: `group-match-${target}-${index}-${value}`,
    kind: "quantity" as const,
    quantity: value,
    objectType: pickObject(memory),
    patternLayout: "ten_frame" as const,
  }));
  return makeMatchTask({
    prompt: `Which collection shows ${target}?`,
    speakText: `Which collection shows ${numberWord(target)}?`,
    targetNumber: target,
    visualType: "ground-number-card",
    promptType: "number_to_objects",
    shownNumeral: target,
    options,
    correctOptionId: options.find((option) => option.quantity === target)!.id,
    feedback: { correct: `That collection shows ${target}!`, wrong: "Look for the full 10 and the correct extras." },
  });
}

function createLesson3NumbotGroupBuilderTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const target = pickTeenTarget(getMemory(lessonId), difficulty);
  return makeBuildTask({
    prompt: `Numbot says build ${target}.`,
    speakText: `Numbot says build ${numberWord(target)} energy cells.`,
    targetNumber: target,
    objectType: "energy_orbs",
    compareMode: "exact",
    maxBuild: 20,
    referenceGroup: {
      quantity: target,
      objectType: "energy_orbs",
      patternLayout: "ten_frame",
    },
    feedback: { correct: `You built ${target}!`, wrong: "Use the full ten and the extras to power Numbot." },
  });
}

function createLesson3OrganiseObjectsTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = pickTeenTarget(memory, difficulty);
  const options = closeNumeralOptions(target, memory);
  return makeMoveCountTask({
    prompt: "Organise the objects, then count.",
    speakText: "Organise the objects into rows or groups, then count them.",
    targetNumber: target,
    objectType: pickObject(memory),
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "You organised the collection perfectly!", wrong: "Move the objects into neat groups, then count again." },
  });
}

function createLesson3CompleteFrameTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const target = pickTeenTarget(getMemory(lessonId), difficulty);
  return createTeenBuilderTask(lessonId, difficulty, `Complete the frame to make ${target}.`, `Complete the frame to make ${numberWord(target)}.`, target, {
    correct: `You completed ${target}!`,
    wrong: "Fill the ten frame and then add the right extras."
  });
}

function createLesson3QuickGroupFlashTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const target = pickTeenTarget(getMemory(lessonId), difficulty);
  const memory = getMemory(lessonId);
  const options = closeNumeralOptions(target, memory).map((option) => ({ id: option.id, numeral: option.numeral }));
  return makeFlashTask({
    prompt: "Quick group flash. How many did you see?",
    speakText: "Quick group flash. How many did you see?",
    targetNumber: target,
    objectType: pickObject(memory),
    patternLayout: "ten_frame",
    revealType: "objects",
    revealMs: WEEK7_QUICK_TEEN_REVEAL_MS[difficulty],
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "You spotted the collection!", wrong: "Look for the full 10 and the extras." },
  });
}

function createLesson3GroupRobotsTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = pickTeenTarget(memory, difficulty);
  const options = closeNumeralOptions(target, memory);
  return makeMoveCountTask({
    prompt: "Group the robots, then count.",
    speakText: "Group the robots to help count them, then choose the total.",
    targetNumber: target,
    objectType: "robot_tokens",
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "The robots are grouped and counted!", wrong: "Group the robots neatly, then count again." },
  });
}

function createLesson3BuildMissingPartTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = pickTeenTarget(memory, difficulty);
  const extras = target - 10;
  const options = extraCountOptions(extras, memory).map((option) => ({
    id: option.id,
    kind: "numeral" as const,
    numeral: option.numeral,
  }));
  return makeMatchTask({
    prompt: `10 and how many more makes ${target}?`,
    speakText: `10 and how many more makes ${numberWord(target)}?`,
    targetNumber: extras,
    visualType: "ground-quantity-card",
    promptType: "group_to_numeral",
    shownNumeral: target,
    shownQuantity: 10,
    objectType: pickObject(memory),
    patternLayout: "ten_frame",
    options,
    correctOptionId: options.find((option) => option.numeral === extras)!.id,
    feedback: { correct: `Yes, 10 and ${extras} more makes ${target}!`, wrong: "Count the extras after the full 10." },
  });
}

function createLesson3CollectionSortTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const start = difficulty === "easy" ? randInt(11, 13) : difficulty === "medium" ? randInt(12, 15) : randInt(14, 17);
  const values = [start, start + 1, start + 2];
  pushRecent(memory.recentTargets, start + 2, 6);
  const groups = shuffle(values).map((quantity, index) => ({
    id: `collection-sort-${lessonId}-${index}-${quantity}`,
    quantity,
    objectType: pickObject(memory),
    patternLayout: "ten_frame" as const,
  }));
  return makeCompareTask({
    prompt: "Put the collections in order.",
    speakText: "Put the collections in order from least to greatest.",
    targetNumber: values[values.length - 1]!,
    comparisonType: "order",
    groups,
    correctOrderIds: [...groups].sort((a, b) => a.quantity - b.quantity).map((group) => group.id),
    orderDirection: "ASC",
    feedback: { correct: "Great collection ordering!", wrong: "Start with the smallest collection." },
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

function generateLesson2Task(lessonId: string, difficulty: Difficulty, kind: (typeof LESSON2_ROTATION)[number]): PracticeTask {
  switch (kind) {
    case "build_teen_number": {
      const target = pickTeenTarget(getMemory(lessonId), difficulty);
      return createTeenBuilderTask(lessonId, difficulty, `Build ${target}.`, `Build ${numberWord(target)}.`, target);
    }
    case "which_number_matches":
      return createTeenWhichNumberMatchesTask(lessonId, difficulty);
    case "teen_number_match":
      return createTeenNumberMatchTask(lessonId, difficulty);
    case "how_many_more_than_10":
      return createHowManyMoreThan10Task(lessonId, difficulty);
    case "find_the_teen_number":
      return createFindTeenNumberTask(lessonId, difficulty);
    case "fill_the_collection": {
      const target = pickTeenTarget(getMemory(lessonId), difficulty);
      return createTeenBuilderTask(lessonId, difficulty, `Make ${target}.`, `Make ${numberWord(target)}.`, target, { correct: `You made ${target}!`, wrong: "Fill the ten frame and extras to make the teen number." });
    }
    case "numbot_teen_reactor": {
      const target = pickTeenTarget(getMemory(lessonId), difficulty);
      return createTeenBuilderTask(lessonId, difficulty, `Numbot says build ${target}.`, `Numbot says build ${numberWord(target)}.`, target, { correct: `You built ${target}!`, wrong: "Power the reactor with a full 10 and the right extras." });
    }
    case "match_the_extras":
      return createMatchExtrasTask(lessonId, difficulty);
    case "teen_number_path":
      return createTeenNumberPathTask(lessonId, difficulty);
    case "quick_teen_flash":
      return createQuickTeenFlashTask(lessonId, difficulty);
    case "count_the_extras":
      return createCountTheExtrasTask(lessonId, difficulty);
    case "build_to_20":
      return createBuildTo20Task(lessonId, difficulty);
    case "same_or_different":
      return createSameOrDifferentTeenTask(lessonId, difficulty);
    case "missing_teen_number":
      return createMissingTeenNumberTask(lessonId, difficulty);
    case "which_is_bigger":
      return createWhichIsBiggerTeenTask(lessonId, difficulty);
  }
}

function generateLesson3Task(lessonId: string, difficulty: Difficulty, kind: (typeof LESSON3_ROTATION)[number]): PracticeTask {
  switch (kind) {
    case "build_collection":
      return createLesson3BuildCollectionTask(lessonId, difficulty);
    case "build_groups":
      return createLesson3BuildGroupsTask(lessonId, difficulty);
    case "match_collection":
      return createLesson3MatchCollectionTask(lessonId, difficulty);
    case "build_to_20":
      return createBuildTo20Task(lessonId, difficulty);
    case "numbot_group_builder":
      return createLesson3NumbotGroupBuilderTask(lessonId, difficulty);
    case "organise_objects":
      return createLesson3OrganiseObjectsTask(lessonId, difficulty);
    case "how_many_more":
      return createHowManyMoreTask(lessonId);
    case "find_the_collection":
      return createFindTeenNumberTask(lessonId, difficulty);
    case "build_teen_number":
      return createLesson3BuildCollectionTask(lessonId, difficulty);
    case "complete_the_frame":
      return createLesson3CompleteFrameTask(lessonId, difficulty);
    case "quick_group_flash":
      return createLesson3QuickGroupFlashTask(lessonId, difficulty);
    case "group_the_robots":
      return createLesson3GroupRobotsTask(lessonId, difficulty);
    case "same_or_different":
      return createSameOrDifferentTeenTask(lessonId, difficulty);
    case "build_missing_part":
      return createLesson3BuildMissingPartTask(lessonId, difficulty);
    case "collection_sort":
      return createLesson3CollectionSortTask(lessonId, difficulty);
  }
}

export function generatePrepWeek7Task(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (lessonId === "y0-w7-l3") {
    const kind = nextLesson3Kind(memory);
    return generateLesson3Task(lessonId, difficulty, kind);
  }
  if (lessonId === "y0-w7-l2") {
    const kind = nextLesson2Kind(memory);
    return generateLesson2Task(lessonId, difficulty, kind);
  }
  const kind = nextLesson1Kind(memory);
  return generateLesson1Task(lessonId, difficulty, kind);
}

export function resetPrepWeek7TaskSessionState() {
  memoryByLesson.clear();
}
