import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

type GroundObjectType =
  | "stars"
  | "robot_tokens"
  | "crystals"
  | "dots"
  | "blocks"
  | "energy_orbs"
  | "planets"
  | "rockets"
  | "number_orbs";

type GroundSequenceTask = Extract<PracticeTask, { kind: "groundSequence" }>;
type GroundOrderTapTask = Extract<PracticeTask, { kind: "groundOrderTap" }>;
type GroundGrowingCountTask = Extract<PracticeTask, { kind: "groundGrowingCount" }>;
type GroundFlashTask = Extract<PracticeTask, { kind: "groundFlash" }>;

const OBJECT_TYPES: GroundObjectType[] = [
  "stars",
  "robot_tokens",
  "crystals",
  "dots",
  "blocks",
  "energy_orbs",
  "planets",
  "rockets",
  "number_orbs",
];

type Week3Memory = {
  cursor: number;
  recentTargets: number[];
  recentObjects: GroundObjectType[];
  recentKinds: string[];
  recentPositions: number[];
};

const memoryByLesson = new Map<string, Week3Memory>();

const rotationPattern = [
  "count_along",
  "missing_number",
  "number_path",
  "count_rockets",
  "next_number",
  "number_train",
  "tap_in_order",
  "listen_build",
  "fast_flash_count",
  "finish_count",
] as const;

function getMemory(lessonId: string): Week3Memory {
  const existing = memoryByLesson.get(lessonId);
  if (existing) return existing;
  const created: Week3Memory = {
    cursor: 0,
    recentTargets: [],
    recentObjects: [],
    recentKinds: [],
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
  return ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"][value] ?? String(value);
}

function objectLabel(objectType: GroundObjectType) {
  if (objectType === "robot_tokens") return "robots";
  if (objectType === "energy_orbs") return "energy cells";
  if (objectType === "number_orbs") return "number orbs";
  return objectType;
}

function chooseRecentSafe<T>(pool: readonly T[] | T[], recent: T[]) {
  let candidate = pool[randInt(0, pool.length - 1)]!;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const lastTwo = recent.slice(-2);
    if (lastTwo.length === 2 && lastTwo.every((value) => value === candidate)) {
      candidate = pool[randInt(0, pool.length - 1)]!;
      continue;
    }
    break;
  }
  return candidate;
}

function difficultyMaxTarget(difficulty: Difficulty) {
  if (difficulty === "easy") return 7;
  if (difficulty === "medium") return 9;
  return 10;
}

function pickTarget(memory: Week3Memory, difficulty: Difficulty, min = 1) {
  const maxTarget = difficultyMaxTarget(difficulty);
  const pool = Array.from({ length: maxTarget - min + 1 }, (_, index) => min + index);
  const target = chooseRecentSafe(pool, memory.recentTargets);
  pushRecent(memory.recentTargets, target, 4);
  return target;
}

function pickObject(memory: Week3Memory) {
  const objectType = chooseRecentSafe(OBJECT_TYPES, memory.recentObjects);
  pushRecent(memory.recentObjects, objectType, 4);
  return objectType;
}

function chooseAnswerPosition(memory: Week3Memory, optionCount: number) {
  const position = chooseRecentSafe(Array.from({ length: optionCount }, (_, index) => index), memory.recentPositions);
  pushRecent(memory.recentPositions, position, 4);
  return position;
}

function buildNumeralOptions(target: number, memory: Week3Memory, upperBound: number, optionCount = 3) {
  const pool = Array.from({ length: upperBound }, (_, index) => index + 1).filter((value) => value !== target);
  const distractors = shuffle(pool).slice(0, optionCount - 1);
  const correctPosition = chooseAnswerPosition(memory, optionCount);
  const ordered = new Array<number>(optionCount);
  ordered[correctPosition] = target;
  const positions = Array.from({ length: optionCount }, (_, index) => index).filter((index) => index !== correctPosition);
  positions.forEach((position, index) => {
    ordered[position] = distractors[index]!;
  });
  return {
    options: ordered.map((numeral, index) => ({
      id: `option-${target}-${index}-${numeral}`,
      numeral,
    })),
    correctOptionId: `option-${target}-${correctPosition}-${target}`,
  };
}

function sequenceTask(
  lessonId: string,
  prompt: string,
  speakText: string,
  sequence: Array<number | "__">,
  target: number,
  upperBound: number
): GroundSequenceTask {
  const memory = getMemory(lessonId);
  const { options, correctOptionId } = buildNumeralOptions(target, memory, upperBound, 3);
  return {
    kind: "groundSequence",
    prompt,
    speakText,
    targetNumber: target,
    sequence,
    options,
    correctOptionId,
    feedback: {
      correct: "Awesome counting!",
      wrong: "Try that one again.",
    },
  };
}

function createCountAlongTask(lessonId: string, difficulty: Difficulty): GroundSequenceTask {
  const memory = getMemory(lessonId);
  const target = Math.max(4, pickTarget(memory, difficulty, 4));
  pushRecent(memory.recentKinds, "count_along", 4);
  return sequenceTask(
    lessonId,
    "What comes next?",
    `${Array.from({ length: target - 1 }, (_, index) => numberWord(index + 1)).join(", ")}. What comes next?`,
    Array.from({ length: target }, (_, index) => (index === target - 1 ? "__" : index + 1)),
    target,
    Math.max(6, difficultyMaxTarget(difficulty))
  );
}

function createMissingNumberTask(lessonId: string, difficulty: Difficulty): GroundSequenceTask {
  const memory = getMemory(lessonId);
  const maxTarget = difficultyMaxTarget(difficulty);
  const length = difficulty === "easy" ? 4 : difficulty === "medium" ? 5 : 6;
  const minStart = difficulty === "easy" ? 3 : difficulty === "medium" ? 4 : 5;
  const startMax = Math.max(minStart, maxTarget - length + 1);
  const start = randInt(minStart, startMax);
  const sequence = Array.from({ length }, (_, index) => start + index);
  const missingIndex = difficulty === "easy" ? randInt(0, Math.min(2, length - 1)) : randInt(0, length - 1);
  const target = sequence[missingIndex]!;
  pushRecent(memory.recentTargets, target, 4);
  pushRecent(memory.recentKinds, "missing_number", 4);
  return sequenceTask(
    lessonId,
    "Which number is missing?",
    "Which number is missing?",
    sequence.map((value, index) => (index === missingIndex ? "__" : value)),
    target,
    maxTarget
  );
}

function createNextNumberTask(lessonId: string, difficulty: Difficulty): GroundSequenceTask {
  const memory = getMemory(lessonId);
  const previous = pickTarget(memory, difficulty, 5);
  const target = Math.min(10, previous + 1);
  pushRecent(memory.recentTargets, target, 4);
  pushRecent(memory.recentKinds, "next_number", 4);
  return sequenceTask(
    lessonId,
    "What comes after?",
    `What comes after ${numberWord(previous)}?`,
    [previous, "__"],
    target,
    Math.max(6, difficultyMaxTarget(difficulty))
  );
}

function createNumberTrainTask(lessonId: string, difficulty: Difficulty): GroundSequenceTask {
  const memory = getMemory(lessonId);
  const maxTarget = difficultyMaxTarget(difficulty);
  const minStart = difficulty === "easy" ? 3 : difficulty === "medium" ? 4 : 5;
  const start = randInt(Math.min(minStart, Math.max(minStart, maxTarget - 3)), Math.max(minStart, maxTarget - 3));
  const sequence = [start, start + 1, start + 2, start + 3];
  const missingIndex = randInt(1, 2);
  const target = sequence[missingIndex]!;
  pushRecent(memory.recentTargets, target, 4);
  pushRecent(memory.recentKinds, "number_train", 4);
  return sequenceTask(
    lessonId,
    "Fill the train gap.",
    "Which number goes in the train?",
    sequence.map((value, index) => (index === missingIndex ? "__" : value)),
    target,
    maxTarget
  );
}

function createFinishCountTask(lessonId: string, difficulty: Difficulty): GroundSequenceTask {
  const memory = getMemory(lessonId);
  const target = Math.max(6, pickTarget(memory, difficulty, 6));
  pushRecent(memory.recentKinds, "finish_count", 4);
  return sequenceTask(
    lessonId,
    "Finish the count.",
    `${Array.from({ length: target - 1 }, (_, index) => numberWord(index + 1)).join(", ")}. Tap the next number.`,
    Array.from({ length: target }, (_, index) => (index === target - 1 ? "__" : index + 1)),
    target,
    Math.max(6, difficultyMaxTarget(difficulty))
  );
}

function buildOrderTiles(target: number) {
  return shuffle(
    Array.from({ length: target }, (_, index) => ({
      id: `tile-${target}-${index + 1}`,
      numeral: index + 1,
    }))
  );
}

function createNumberPathTask(lessonId: string, difficulty: Difficulty): GroundOrderTapTask {
  const memory = getMemory(lessonId);
  const target = Math.max(6, pickTarget(memory, difficulty, 6));
  pushRecent(memory.recentKinds, "number_path", 4);
  return {
    kind: "groundOrderTap",
    prompt: "Tap the path in order.",
    speakText: `Tap the numbers in order to ${numberWord(target)}.`,
    targetNumber: target,
    tiles: buildOrderTiles(target),
    feedback: {
      correct: "Path complete!",
      wrong: "Start at 1 and keep counting.",
    },
  };
}

function createTapInOrderTask(lessonId: string, difficulty: Difficulty): GroundOrderTapTask {
  const memory = getMemory(lessonId);
  const target = Math.max(6, pickTarget(memory, difficulty, 6));
  pushRecent(memory.recentKinds, "tap_in_order", 4);
  return {
    kind: "groundOrderTap",
    prompt: "Tap in order.",
    speakText: `Tap from 1 to ${numberWord(target)}.`,
    targetNumber: target,
    tiles: buildOrderTiles(target),
    feedback: {
      correct: "Great counting!",
      wrong: "Tap the numbers in order.",
    },
  };
}

function createListenAndBuildTask(lessonId: string, difficulty: Difficulty): GroundOrderTapTask {
  const memory = getMemory(lessonId);
  const target = Math.max(6, pickTarget(memory, difficulty, 6));
  pushRecent(memory.recentKinds, "listen_build", 4);
  return {
    kind: "groundOrderTap",
    prompt: "Listen and build the count.",
    speakText: `Count to ${numberWord(target)}.`,
    targetNumber: target,
    tiles: buildOrderTiles(target),
    feedback: {
      correct: "You counted with Numbot!",
      wrong: "Count from 1.",
    },
  };
}

function createCountRocketsTask(lessonId: string, difficulty: Difficulty): GroundGrowingCountTask {
  const memory = getMemory(lessonId);
  const target = Math.max(6, pickTarget(memory, difficulty, 6));
  const objectType = chooseRecentSafe(["rockets", "planets", "number_orbs", "stars", "crystals"] as const, memory.recentObjects) as GroundObjectType;
  pushRecent(memory.recentObjects, objectType, 4);
  pushRecent(memory.recentKinds, "count_rockets", 4);
  const { options, correctOptionId } = buildNumeralOptions(target, memory, difficultyMaxTarget(difficulty), 3);
  return {
    kind: "groundGrowingCount",
    prompt: `How many ${objectLabel(objectType)} now?`,
    speakText: `Count the ${objectLabel(objectType)}. How many now?`,
    targetNumber: target,
    objectType,
    revealMs: 420,
    options,
    correctOptionId,
    feedback: {
      correct: "Rocket count complete!",
      wrong: "Count again slowly.",
    },
  };
}

function createFastFlashCountTask(lessonId: string, difficulty: Difficulty): GroundFlashTask {
  const memory = getMemory(lessonId);
  const target = Math.max(6, pickTarget(memory, difficulty, 6));
  const objectType = pickObject(memory);
  const { options, correctOptionId } = buildNumeralOptions(target, memory, difficultyMaxTarget(difficulty), 3);
  pushRecent(memory.recentKinds, "fast_flash_count", 4);
  return {
    kind: "groundFlash",
    prompt: "What number did you see?",
    speakText: "What number did you see?",
    targetNumber: target,
    objectType,
    revealType: "numeral",
    revealMs: difficulty === "easy" ? 1200 : difficulty === "medium" ? 950 : 800,
    options,
    correctOptionId,
    feedback: {
      correct: "Fast finding!",
      wrong: "Watch the flash again.",
    },
  };
}

export function resetPrepWeek3TaskSessionState() {
  memoryByLesson.clear();
}

export function generatePrepWeek3Task(
  lessonId: string,
  difficulty: Difficulty = "easy"
): PracticeTask {
  const memory = getMemory(lessonId);
  const gameKind = rotationPattern[memory.cursor % rotationPattern.length]!;
  memory.cursor += 1;

  switch (gameKind) {
    case "count_along":
      return createCountAlongTask(lessonId, difficulty);
    case "missing_number":
      return createMissingNumberTask(lessonId, difficulty);
    case "number_path":
      return createNumberPathTask(lessonId, difficulty);
    case "count_rockets":
      return createCountRocketsTask(lessonId, difficulty);
    case "next_number":
      return createNextNumberTask(lessonId, difficulty);
    case "number_train":
      return createNumberTrainTask(lessonId, difficulty);
    case "tap_in_order":
      return createTapInOrderTask(lessonId, difficulty);
    case "listen_build":
      return createListenAndBuildTask(lessonId, difficulty);
    case "fast_flash_count":
      return createFastFlashCountTask(lessonId, difficulty);
    case "finish_count":
      return createFinishCountTask(lessonId, difficulty);
    default:
      return createCountAlongTask(lessonId, difficulty);
  }
}
