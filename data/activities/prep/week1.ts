import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

type GroundObjectType = "dots" | "gems" | "stars" | "blocks" | "robot_tokens" | "energy_orbs";
type GroundPromptType =
  | "number_to_numeral"
  | "numeral_to_group"
  | "group_to_numeral"
  | "number_to_objects"
  | "match_pair";

type GroundMatchTask = Extract<PracticeTask, { kind: "groundMatch" }>;
type GroundCollectTask = Extract<PracticeTask, { kind: "groundCollect" }>;
type GroundBuildTask = Extract<PracticeTask, { kind: "groundBuild" }>;
type GroundFlashTask = Extract<PracticeTask, { kind: "groundFlash" }>;

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
  recentGameKinds: string[];
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
    recentGameKinds: [],
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

function objectLabel(objectType: GroundObjectType) {
  if (objectType === "gems") return "gems";
  if (objectType === "stars") return "stars";
  if (objectType === "blocks") return "blocks";
  if (objectType === "robot_tokens") return "robot tokens";
  if (objectType === "energy_orbs") return "energy orbs";
  return "dots";
}

function collectLabel(objectType: GroundObjectType) {
  if (objectType === "energy_orbs") return "orbs";
  if (objectType === "robot_tokens") return "tokens";
  return objectLabel(objectType);
}

function recordGameKind(memory: GroundLessonMemory, value: string) {
  pushRecent(memory.recentGameKinds, value, 4);
}

function avoidRecentGameKind(memory: GroundLessonMemory, candidates: string[]) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const candidate = candidates[randInt(0, candidates.length - 1)]!;
    if (memory.recentGameKinds[memory.recentGameKinds.length - 1] === candidate) continue;
    return candidate;
  }
  return candidates[randInt(0, candidates.length - 1)]!;
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
  recordGameKind(memory, "groundMatch:number");

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

export function createGroundCollectTask(lessonId: string): GroundCollectTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory);
  const objectType = pickObjectType(memory);
  pushRecent(memory.recentTargets, target, RECENT_TARGETS_LIMIT);
  pushRecent(memory.recentObjects, objectType, RECENT_OBJECTS_LIMIT);
  recordGameKind(memory, "groundCollect");
  memory.taskCounter += 1;

  const prompts = [
    `Collect ${target} ${collectLabel(objectType)}.`,
    `Tap ${target} ${collectLabel(objectType)}.`,
    `Feed Numbot ${target} ${collectLabel(objectType)}.`,
  ];
  const prompt =
    objectType === "energy_orbs" || objectType === "robot_tokens"
      ? prompts[2]!
      : prompts[randInt(0, 1)]!;

  return {
    kind: "groundCollect",
    prompt,
    speakText:
      objectType === "energy_orbs" || objectType === "robot_tokens"
        ? `Feed Numbot ${numberWord(target)} ${collectLabel(objectType)}.`
        : `Tap ${numberWord(target)} ${collectLabel(objectType)}.`,
    targetNumber: target,
    objectType,
    totalObjects: 5,
    feedback: {
      correct: "Great counting!",
      wrong: "One tap for each object.",
    },
  };
}

export function createGroundBuildTask(lessonId: string): GroundBuildTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory);
  const objectType = pickObjectType(memory);
  pushRecent(memory.recentTargets, target, RECENT_TARGETS_LIMIT);
  pushRecent(memory.recentObjects, objectType, RECENT_OBJECTS_LIMIT);
  recordGameKind(memory, "groundBuild");
  memory.taskCounter += 1;

  return {
    kind: "groundBuild",
    prompt: `Build ${target} ${objectLabel(objectType)}.`,
    speakText: `Build ${numberWord(target)} ${objectLabel(objectType)}.`,
    targetNumber: target,
    objectType,
    feedback: {
      correct: "Nice work!",
      wrong: `Try building ${target}.`,
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
  recordGameKind(memory, "groundMatch:quantity");

  if (promptType === "group_to_numeral") {
    const options = buildNumeralOptions(target, memory);
    return {
      kind: "groundMatch",
      prompt: `How many ${objectLabel(objectType)}?`,
      speakText: `How many ${objectLabel(objectType)} are there?`,
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
  recordGameKind(memory, "groundMatch:fluency");

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

export function createGroundFlashRecognitionTask(lessonId: string): GroundFlashTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory);
  const objectType = pickObjectType(memory);
  const options = buildNumeralOptions(target, memory).map((option) => ({
    id: option.id,
    numeral: option.numeral!,
  }));
  pushRecent(memory.recentTargets, target, RECENT_TARGETS_LIMIT);
  pushRecent(memory.recentObjects, objectType, RECENT_OBJECTS_LIMIT);
  recordGameKind(memory, "groundFlash");
  memory.taskCounter += 1;

  return {
    kind: "groundFlash",
    prompt: "Look quickly. How many?",
    speakText: "Look quickly. How many?",
    targetNumber: target,
    objectType,
    revealMs: 1200,
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: {
      correct: "Great spotting!",
      wrong: "Try the quick count again.",
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

  if (pool === "A") {
    const mode = avoidRecentGameKind(memory, ["groundMatch:number", "groundBuild"]);
    return mode === "groundBuild"
      ? createGroundBuildTask(lessonId)
      : createGroundNumberRecognitionTask(lessonId);
  }

  if (pool === "B") {
    const mode = avoidRecentGameKind(memory, ["groundMatch:quantity", "groundCollect"]);
    return mode === "groundCollect"
      ? createGroundCollectTask(lessonId)
      : createGroundQuantityMatchTask(lessonId);
  }

  const mode = avoidRecentGameKind(memory, ["groundMatch:fluency", "groundFlash"]);
  return mode === "groundFlash"
    ? createGroundFlashRecognitionTask(lessonId)
    : createGroundFluencyMatchTask(lessonId);
}
