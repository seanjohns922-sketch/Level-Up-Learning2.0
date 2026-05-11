import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

type GroundObjectType = "dots" | "gems" | "stars" | "blocks" | "robot_tokens" | "energy_orbs";
type GroundPromptType =
  | "number_to_numeral"
  | "numeral_to_group"
  | "group_to_numeral"
  | "number_to_objects"
  | "match_pair";

type GroundMatchTask = Extract<PracticeTask, { kind: "groundMatch" }>;

const OBJECT_TYPES: GroundObjectType[] = [
  "dots",
  "gems",
  "stars",
  "blocks",
  "robot_tokens",
  "energy_orbs",
];

const RECENT_TARGETS_LIMIT = 3;
const RECENT_OBJECTS_LIMIT = 3;
const RECENT_PROMPTS_LIMIT = 4;
const RECENT_POSITIONS_LIMIT = 3;

type GroundLessonMemory = {
  poolCursor: number;
  taskCounter: number;
  recentTargets: number[];
  recentObjects: GroundObjectType[];
  recentPrompts: GroundPromptType[];
  recentAnswerPositions: number[];
};

const lessonMemory = new Map<string, GroundLessonMemory>();
const poolPattern = ["A", "B", "A", "C", "B", "C", "A"] as const;

function getMemory(lessonId: string): GroundLessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: GroundLessonMemory = {
    poolCursor: 0,
    taskCounter: 0,
    recentTargets: [],
    recentObjects: [],
    recentPrompts: [],
    recentAnswerPositions: [],
  };
  lessonMemory.set(lessonId, created);
  return created;
}

function pushRecent<T>(list: T[], value: T, max: number) {
  list.push(value);
  while (list.length > max) list.shift();
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}

function sampleDistinct(values: number[], count: number, avoid: number[] = []) {
  const available = values.filter((value) => !avoid.includes(value));
  return shuffle(available).slice(0, count);
}

function pickTarget(memory: GroundLessonMemory) {
  const targets = [1, 2, 3, 4, 5];
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const candidate = targets[randInt(0, targets.length - 1)]!;
    const lastTwo = memory.recentTargets.slice(-2);
    if (lastTwo.length === 2 && lastTwo.every((value) => value === candidate)) continue;
    return candidate;
  }
  return targets[randInt(0, targets.length - 1)]!;
}

function pickObjectType(memory: GroundLessonMemory) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const candidate = OBJECT_TYPES[randInt(0, OBJECT_TYPES.length - 1)]!;
    const lastTwo = memory.recentObjects.slice(-2);
    if (lastTwo.length === 2 && lastTwo.every((value) => value === candidate)) continue;
    return candidate;
  }
  return OBJECT_TYPES[randInt(0, OBJECT_TYPES.length - 1)]!;
}

function pickPromptType(memory: GroundLessonMemory, options: GroundPromptType[]) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const candidate = options[randInt(0, options.length - 1)]!;
    if (memory.recentPrompts[memory.recentPrompts.length - 1] === candidate) continue;
    return candidate;
  }
  return options[randInt(0, options.length - 1)]!;
}

function chooseCorrectPosition(memory: GroundLessonMemory) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const candidate = randInt(0, 2);
    const lastTwo = memory.recentAnswerPositions.slice(-2);
    if (lastTwo.length === 2 && lastTwo.every((value) => value === candidate)) continue;
    return candidate;
  }
  return randInt(0, 2);
}

function numberWord(value: number) {
  return ["zero", "one", "two", "three", "four", "five"][value] ?? String(value);
}

function buildNumeralOptions(target: number, memory: GroundLessonMemory) {
  const distractors = sampleDistinct([1, 2, 3, 4, 5], 2, [target]);
  const correctPosition = chooseCorrectPosition(memory);
  const ordered = new Array<number>(3);
  ordered[correctPosition] = target;
  const remainingPositions = [0, 1, 2].filter((position) => position !== correctPosition);
  remainingPositions.forEach((position, index) => {
    ordered[position] = distractors[index]!;
  });
  pushRecent(memory.recentAnswerPositions, correctPosition, RECENT_POSITIONS_LIMIT);
  return ordered.map((numeral, index) => ({
    id: `n-${target}-${index}-${numeral}`,
    kind: "numeral" as const,
    numeral,
  }));
}

function buildQuantityOptions(target: number, objectType: GroundObjectType, memory: GroundLessonMemory) {
  const distractors = sampleDistinct([1, 2, 3, 4, 5], 2, [target]);
  const correctPosition = chooseCorrectPosition(memory);
  const ordered = new Array<number>(3);
  ordered[correctPosition] = target;
  const remainingPositions = [0, 1, 2].filter((position) => position !== correctPosition);
  remainingPositions.forEach((position, index) => {
    ordered[position] = distractors[index]!;
  });
  pushRecent(memory.recentAnswerPositions, correctPosition, RECENT_POSITIONS_LIMIT);
  return ordered.map((quantity, index) => ({
    id: `q-${target}-${index}-${quantity}`,
    kind: "quantity" as const,
    quantity,
    objectType,
  }));
}

function buildPairOptions(target: number, objectType: GroundObjectType, memory: GroundLessonMemory) {
  const wrongNumbers = sampleDistinct([1, 2, 3, 4, 5], 2, [target]);
  const candidates = shuffle([
    { pairNumeral: target, pairQuantity: target },
    { pairNumeral: wrongNumbers[0]!, pairQuantity: target },
    { pairNumeral: target, pairQuantity: wrongNumbers[1]! },
  ]);
  const correctOptionId = `pair-${target}-${target}`;
  const options = candidates.map((option, index) => ({
    id: option.pairNumeral === target && option.pairQuantity === target ? correctOptionId : `pair-${index}-${option.pairNumeral}-${option.pairQuantity}`,
    kind: "pair" as const,
    objectType,
    pairNumeral: option.pairNumeral,
    pairQuantity: option.pairQuantity,
  }));
  const correctIndex = options.findIndex((option) => option.id === correctOptionId);
  pushRecent(memory.recentAnswerPositions, correctIndex, RECENT_POSITIONS_LIMIT);
  return { options, correctOptionId };
}

export function resetPrepWeek1TaskSessionState() {
  lessonMemory.clear();
}

export function createGroundNumberRecognitionTask(lessonId: string): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory);
  const promptType = pickPromptType(memory, ["number_to_numeral"]);
  const promptTemplates = [
    `Tap number ${target}.`,
    `Find number ${target}.`,
    `Which one is ${target}?`,
    `Tap the numeral ${target}.`,
  ];
  const prompt = promptTemplates[randInt(0, promptTemplates.length - 1)]!;
  const options = buildNumeralOptions(target, memory);
  pushRecent(memory.recentTargets, target, RECENT_TARGETS_LIMIT);
  pushRecent(memory.recentPrompts, promptType, RECENT_PROMPTS_LIMIT);
  memory.taskCounter += 1;

  return {
    kind: "groundMatch",
    prompt,
    speakText: `Tap number ${numberWord(target)}.`,
    targetNumber: target,
    visualType: "ground-number-card",
    promptType,
    shownNumeral: target,
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: {
      correct: `Yes — that is ${target}.`,
      wrong: `Look for the number ${target}.`,
    },
  };
}

export function createGroundQuantityMatchTask(lessonId: string): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory);
  const objectType = pickObjectType(memory);
  const promptType = pickPromptType(memory, ["numeral_to_group", "group_to_numeral", "number_to_objects"]);
  pushRecent(memory.recentTargets, target, RECENT_TARGETS_LIMIT);
  pushRecent(memory.recentObjects, objectType, RECENT_OBJECTS_LIMIT);
  pushRecent(memory.recentPrompts, promptType, RECENT_PROMPTS_LIMIT);
  memory.taskCounter += 1;

  if (promptType === "group_to_numeral") {
    const options = buildNumeralOptions(target, memory);
    return {
      kind: "groundMatch",
      prompt: `How many ${objectType === "gems" ? "gems" : objectType === "stars" ? "stars" : "objects"}?`,
      speakText: `How many ${objectType === "gems" ? "gems are there" : objectType === "stars" ? "stars are there" : "objects are there"}?`,
      targetNumber: target,
      visualType: "ground-quantity-card",
      promptType,
      objectType,
      shownQuantity: target,
      options,
      correctOptionId: options.find((option) => option.numeral === target)!.id,
      feedback: {
        correct: `Correct — there are ${target}.`,
        wrong: "Count each object carefully.",
      },
    };
  }

  const options = buildQuantityOptions(target, objectType, memory);
  return {
    kind: "groundMatch",
    prompt:
      promptType === "numeral_to_group"
        ? `Which group shows ${target}?`
        : `Match number ${target}.`,
    speakText:
      promptType === "numeral_to_group"
        ? `Which group shows ${numberWord(target)}?`
        : `Match number ${numberWord(target)}.`,
    targetNumber: target,
    visualType: "ground-quantity-card",
    promptType,
    objectType,
    shownNumeral: target,
    options,
    correctOptionId: options.find((option) => option.quantity === target)!.id,
    feedback: {
      correct: `Correct — there are ${target}.`,
      wrong: "Count each object carefully.",
    },
  };
}

export function createGroundFluencyMatchTask(lessonId: string): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory);
  const objectType = pickObjectType(memory);
  const promptType = pickPromptType(memory, ["numeral_to_group", "group_to_numeral", "match_pair"]);
  pushRecent(memory.recentTargets, target, RECENT_TARGETS_LIMIT);
  pushRecent(memory.recentObjects, objectType, RECENT_OBJECTS_LIMIT);
  pushRecent(memory.recentPrompts, promptType, RECENT_PROMPTS_LIMIT);
  memory.taskCounter += 1;

  if (promptType === "match_pair") {
    const { options, correctOptionId } = buildPairOptions(target, objectType, memory);
    return {
      kind: "groundMatch",
      prompt: "Which pair matches?",
      speakText: "Which pair matches?",
      targetNumber: target,
      visualType: "ground-flash-match-card",
      promptType,
      objectType,
      options,
      correctOptionId,
      feedback: {
        correct: "Great matching!",
        wrong: "Count the group, then choose the number.",
      },
    };
  }

  if (promptType === "group_to_numeral") {
    const options = buildNumeralOptions(target, memory);
    return {
      kind: "groundMatch",
      prompt: "Find the matching number.",
      speakText: "Find the matching number.",
      targetNumber: target,
      visualType: "ground-flash-match-card",
      promptType,
      objectType,
      shownQuantity: target,
      options,
      correctOptionId: options.find((option) => option.numeral === target)!.id,
      feedback: {
        correct: "Great matching!",
        wrong: "Count the group, then choose the number.",
      },
    };
  }

  const options = buildQuantityOptions(target, objectType, memory);
  return {
    kind: "groundMatch",
    prompt: "Find the matching group.",
    speakText: "Find the matching group.",
    targetNumber: target,
    visualType: "ground-flash-match-card",
    promptType,
    objectType,
    shownNumeral: target,
    options,
    correctOptionId: options.find((option) => option.quantity === target)!.id,
    feedback: {
      correct: "Great matching!",
      wrong: "Count the group, then choose the number.",
    },
  };
}

export function generatePrepWeek1Task(
  lessonId: string,
  difficulty: Difficulty = "easy"
): PracticeTask {
  void difficulty;
  if (lessonId !== "y0-w1-l1") {
    return createGroundNumberRecognitionTask("y0-w1-l1");
  }

  const memory = getMemory(lessonId);
  const pool = poolPattern[memory.poolCursor % poolPattern.length]!;
  memory.poolCursor += 1;

  if (pool === "A") return createGroundNumberRecognitionTask(lessonId);
  if (pool === "B") return createGroundQuantityMatchTask(lessonId);
  return createGroundFluencyMatchTask(lessonId);
}
