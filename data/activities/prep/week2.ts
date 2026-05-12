import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

type GroundObjectType = "dots" | "gems" | "stars" | "blocks" | "robot_tokens" | "energy_orbs";
type GroundMatchTask = Extract<PracticeTask, { kind: "groundMatch" }>;
type GroundFlashTask = Extract<PracticeTask, { kind: "groundFlash" }>;
type GroundHuntTask = Extract<PracticeTask, { kind: "groundHunt" }>;
type GroundSequenceTask = Extract<PracticeTask, { kind: "groundSequence" }>;
type GroundTapCountTask = Extract<PracticeTask, { kind: "groundTapCount" }>;

const TARGETS = [6, 7, 8, 9, 10] as const;
const OBJECT_TYPES: GroundObjectType[] = [
  "dots",
  "gems",
  "stars",
  "blocks",
  "robot_tokens",
  "energy_orbs",
];

type Week2Memory = {
  cursor: number;
  taskCounter: number;
  recentTargets: number[];
  recentObjects: GroundObjectType[];
  recentKinds: string[];
  recentPositions: number[];
};

const memoryByLesson = new Map<string, Week2Memory>();
const rotationPattern = [
  "tap_number",
  "listen_tap",
  "quick_find",
  "number_hunt",
  "match_quantity",
  "which_number",
  "numbot_says",
  "flash_recognition",
  "count_match",
  "missing_number",
] as const;

function getMemory(lessonId: string): Week2Memory {
  const existing = memoryByLesson.get(lessonId);
  if (existing) return existing;
  const created: Week2Memory = {
    cursor: 0,
    taskCounter: 0,
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

function shuffle<T>(items: T[]) {
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
  if (objectType === "gems") return "gems";
  if (objectType === "stars") return "stars";
  if (objectType === "blocks") return "blocks";
  if (objectType === "robot_tokens") return "robot tokens";
  if (objectType === "energy_orbs") return "energy cells";
  return "dots";
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

function pickTarget(memory: Week2Memory) {
  const target = chooseRecentSafe(TARGETS, memory.recentTargets);
  pushRecent(memory.recentTargets, target, 4);
  return target;
}

function pickObject(memory: Week2Memory) {
  const objectType = chooseRecentSafe(OBJECT_TYPES, memory.recentObjects);
  pushRecent(memory.recentObjects, objectType, 4);
  return objectType;
}

function chooseAnswerPosition(memory: Week2Memory, optionCount: number) {
  const position = chooseRecentSafe(Array.from({ length: optionCount }, (_, index) => index), memory.recentPositions);
  pushRecent(memory.recentPositions, position, 4);
  return position;
}

function buildNumeralChoiceOptions(
  target: number,
  memory: Week2Memory,
  optionCount = 4
) {
  const distractors = shuffle(TARGETS.filter((value) => value !== target)).slice(0, optionCount - 1);
  const correctPosition = chooseAnswerPosition(memory, optionCount);
  const ordered = new Array<number>(optionCount);
  ordered[correctPosition] = target;
  const positions = Array.from({ length: optionCount }, (_, index) => index).filter((index) => index !== correctPosition);
  positions.forEach((position, index) => {
    ordered[position] = distractors[index]!;
  });
  return ordered.map((numeral, index) => ({
    id: `num-${target}-${index}-${numeral}`,
    kind: "numeral" as const,
    numeral,
  }));
}

function buildNumeralTapOptions(
  target: number,
  memory: Week2Memory,
  optionCount = 4
) {
  const distractors = shuffle(TARGETS.filter((value) => value !== target)).slice(0, optionCount - 1);
  const correctPosition = chooseAnswerPosition(memory, optionCount);
  const ordered = new Array<number>(optionCount);
  ordered[correctPosition] = target;
  const positions = Array.from({ length: optionCount }, (_, index) => index).filter((index) => index !== correctPosition);
  positions.forEach((position, index) => {
    ordered[position] = distractors[index]!;
  });
  return ordered.map((numeral, index) => ({
    id: `choice-${target}-${index}-${numeral}`,
    numeral,
  }));
}

function buildSequenceOptions(target: number, memory: Week2Memory) {
  const options = buildNumeralTapOptions(target, memory, 3);
  return {
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
  };
}

function createTapTheNumberTask(lessonId: string): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory);
  const options = buildNumeralChoiceOptions(target, memory, 4);
  pushRecent(memory.recentKinds, "tap_number", 4);
  memory.taskCounter += 1;

  return {
    kind: "groundMatch",
    prompt: "Tap the number.",
    speakText: `Tap number ${numberWord(target)}.`,
    targetNumber: target,
    visualType: "ground-number-card",
    promptType: "number_to_numeral",
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: {
      correct: `You found ${target}!`,
      wrong: "Try that one again.",
    },
  };
}

function createListenAndTapTask(lessonId: string): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory);
  const options = buildNumeralChoiceOptions(target, memory, 3);
  pushRecent(memory.recentKinds, "listen_tap", 4);
  memory.taskCounter += 1;

  return {
    kind: "groundMatch",
    prompt: "Listen and tap.",
    speakText: `Find number ${numberWord(target)}.`,
    targetNumber: target,
    visualType: "ground-number-card",
    promptType: "number_to_numeral",
    helperVariant: "speech_bubble",
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: {
      correct: "Great listening!",
      wrong: "Listen again.",
    },
  };
}

function createQuickFindTask(lessonId: string): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory);
  const options = buildNumeralChoiceOptions(target, memory, 4);
  pushRecent(memory.recentKinds, "quick_find", 4);
  memory.taskCounter += 1;

  return {
    kind: "groundMatch",
    prompt: `Find ${target} before Numbot!`,
    speakText: `Find number ${numberWord(target)} before Numbot.`,
    targetNumber: target,
    visualType: "ground-number-card",
    promptType: "number_to_numeral",
    helperVariant: "numbot",
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: {
      correct: "Great spotting!",
      wrong: "Try again.",
    },
  };
}

function createNumberHuntTask(lessonId: string): GroundHuntTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory);
  const totalTiles = randInt(8, 12);
  const targetCount = randInt(2, 3);
  const tiles = Array.from({ length: totalTiles }, (_, index) => {
    if (index < targetCount) {
      return { id: `hunt-${target}-${index}`, numeral: target, isTarget: true };
    }
    const distractor = shuffle(TARGETS.filter((value) => value !== target))[0]!;
    return { id: `hunt-${target}-${index}-${distractor}`, numeral: distractor, isTarget: false };
  });
  pushRecent(memory.recentKinds, "number_hunt", 4);
  memory.taskCounter += 1;

  return {
    kind: "groundHunt",
    prompt: `Tap all the ${target}s.`,
    speakText: `Tap all the ${numberWord(target)}s.`,
    targetNumber: target,
    tiles: shuffle(tiles),
    feedback: {
      correct: "Great hunting!",
      wrong: "Look carefully and try again.",
    },
  };
}

function createMatchQuantityTask(lessonId: string): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory);
  const objectType = pickObject(memory);
  const options = buildNumeralChoiceOptions(target, memory, 3);
  pushRecent(memory.recentKinds, "match_quantity", 4);
  memory.taskCounter += 1;

  return {
    kind: "groundMatch",
    prompt: `How many ${objectLabel(objectType)}?`,
    speakText: `How many ${objectLabel(objectType)} are there?`,
    targetNumber: target,
    visualType: "ground-quantity-card",
    promptType: "group_to_numeral",
    objectType,
    shownQuantity: target,
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: {
      correct: `You found ${target}!`,
      wrong: "Count carefully.",
    },
  };
}

function createWhichNumberTask(lessonId: string): GroundFlashTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory);
  const objectType = pickObject(memory);
  const options = buildNumeralTapOptions(target, memory, 3);
  pushRecent(memory.recentKinds, "which_number", 4);
  memory.taskCounter += 1;

  return {
    kind: "groundFlash",
    prompt: "Which number did you see?",
    speakText: "Which number did you see?",
    targetNumber: target,
    objectType,
    revealType: "numeral",
    revealMs: 1200,
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: {
      correct: "Nice remembering!",
      wrong: "Watch carefully and try again.",
    },
  };
}

function createNumbotSaysTask(lessonId: string): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory);
  const options = buildNumeralChoiceOptions(target, memory, 4);
  pushRecent(memory.recentKinds, "numbot_says", 4);
  memory.taskCounter += 1;

  return {
    kind: "groundMatch",
    prompt: "Numbot says: tap the number.",
    speakText: `Numbot says tap ${numberWord(target)}.`,
    targetNumber: target,
    visualType: "ground-number-card",
    promptType: "number_to_numeral",
    helperVariant: "numbot",
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: {
      correct: "Numbot powered up!",
      wrong: "Listen to Numbot again.",
    },
  };
}

function createFlashRecognitionTask(lessonId: string): GroundFlashTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory);
  const objectType = pickObject(memory);
  const options = buildNumeralTapOptions(target, memory, 4);
  pushRecent(memory.recentKinds, "flash_recognition", 4);
  memory.taskCounter += 1;

  return {
    kind: "groundFlash",
    prompt: "Look quickly. Which number?",
    speakText: "Look quickly. Which number?",
    targetNumber: target,
    objectType,
    revealType: "numeral",
    revealMs: 900,
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: {
      correct: "Fast finding!",
      wrong: "Try the quick flash again.",
    },
  };
}

function createCountAndMatchTask(lessonId: string): GroundTapCountTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory);
  const objectType = pickObject(memory);
  const options = buildNumeralTapOptions(target, memory, 3);
  pushRecent(memory.recentKinds, "count_match", 4);
  memory.taskCounter += 1;

  return {
    kind: "groundTapCount",
    prompt: `Tap and count the ${objectLabel(objectType)}.`,
    speakText: `Tap and count the ${objectLabel(objectType)}.`,
    targetNumber: target,
    objectType,
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: {
      correct: "Great counting!",
      wrong: "Tap each one once.",
    },
  };
}

function createMissingNumberTask(lessonId: string): GroundSequenceTask {
  const memory = getMemory(lessonId);
  const start = randInt(6, 8);
  const sequence = [start, start + 1, start + 2, start + 3];
  const missingIndex = randInt(1, 2);
  const target = sequence[missingIndex]!;
  const shownSequence = sequence.map((value, index) => (index === missingIndex ? "__" : value)) as Array<number | "__">;
  const { options, correctOptionId } = buildSequenceOptions(target, memory);
  pushRecent(memory.recentTargets, target, 4);
  pushRecent(memory.recentKinds, "missing_number", 4);
  memory.taskCounter += 1;

  return {
    kind: "groundSequence",
    prompt: "Which number is missing?",
    speakText: "Which number is missing?",
    targetNumber: target,
    sequence: shownSequence,
    options,
    correctOptionId,
    feedback: {
      correct: "You found it!",
      wrong: "Try the missing number again.",
    },
  };
}

export function resetPrepWeek2TaskSessionState() {
  memoryByLesson.clear();
}

export function generatePrepWeek2Task(
  lessonId: string,
  difficulty: Difficulty = "easy"
): PracticeTask {
  void difficulty;
  const memory = getMemory(lessonId);
  const gameKind = rotationPattern[memory.cursor % rotationPattern.length]!;
  memory.cursor += 1;

  switch (gameKind) {
    case "tap_number":
      return createTapTheNumberTask(lessonId);
    case "listen_tap":
      return createListenAndTapTask(lessonId);
    case "quick_find":
      return createQuickFindTask(lessonId);
    case "number_hunt":
      return createNumberHuntTask(lessonId);
    case "match_quantity":
      return createMatchQuantityTask(lessonId);
    case "which_number":
      return createWhichNumberTask(lessonId);
    case "numbot_says":
      return createNumbotSaysTask(lessonId);
    case "flash_recognition":
      return createFlashRecognitionTask(lessonId);
    case "count_match":
      return createCountAndMatchTask(lessonId);
    case "missing_number":
      return createMissingNumberTask(lessonId);
    default:
      return createTapTheNumberTask(lessonId);
  }
}
