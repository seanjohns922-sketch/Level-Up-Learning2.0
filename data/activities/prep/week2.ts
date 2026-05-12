import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

type GroundObjectType =
  | "dots"
  | "gems"
  | "stars"
  | "blocks"
  | "robot_tokens"
  | "energy_orbs"
  | "crystals"
  | "bolts"
  | "futuristic_coins";
type GroundMatchTask = Extract<PracticeTask, { kind: "groundMatch" }>;
type GroundFlashTask = Extract<PracticeTask, { kind: "groundFlash" }>;
type GroundHuntTask = Extract<PracticeTask, { kind: "groundHunt" }>;
type GroundSequenceTask = Extract<PracticeTask, { kind: "groundSequence" }>;
type GroundTapCountTask = Extract<PracticeTask, { kind: "groundTapCount" }>;
type GroundFeedTask = Extract<PracticeTask, { kind: "groundFeed" }>;
type GroundBuildTask = Extract<PracticeTask, { kind: "groundBuild" }>;

const TARGETS = [6, 7, 8, 9, 10] as const;
const OBJECT_TYPES: GroundObjectType[] = [
  "dots",
  "gems",
  "stars",
  "blocks",
  "robot_tokens",
  "energy_orbs",
  "crystals",
  "bolts",
  "futuristic_coins",
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
  if (objectType === "crystals") return "crystals";
  if (objectType === "bolts") return "bolts";
  if (objectType === "futuristic_coins") return "coins";
  return "dots";
}

function collectLabel(objectType: GroundObjectType) {
  if (objectType === "energy_orbs") return "energy cells";
  if (objectType === "robot_tokens") return "robot tokens";
  return objectLabel(objectType);
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

function buildWordChoiceOptions(
  target: number,
  memory: Week2Memory,
  optionCount = 3
) {
  const distractors = shuffle(TARGETS.filter((value) => value !== target)).slice(0, optionCount - 1);
  const correctPosition = chooseAnswerPosition(memory, optionCount);
  const ordered = new Array<number>(optionCount);
  ordered[correctPosition] = target;
  const positions = Array.from({ length: optionCount }, (_, index) => index).filter((index) => index !== correctPosition);
  positions.forEach((position, index) => {
    ordered[position] = distractors[index]!;
  });
  return ordered.map((value, index) => ({
    id: `word-${target}-${index}-${value}`,
    kind: "word" as const,
    word: numberWord(value),
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

function buildThreeWayMatchOptions(target: number, memory: Week2Memory) {
  const correctPosition = chooseAnswerPosition(memory, 3);
  const distractors = shuffle(TARGETS.filter((value) => value !== target)).slice(0, 2);
  const distractorObjects = shuffle(OBJECT_TYPES).slice(0, 2);
  const options = Array.from({ length: 3 }, (_, index) => {
    if (index === correctPosition) {
      return {
        id: `three-way-${target}-${index}`,
        kind: "pair" as const,
        pairNumeral: target,
        pairWord: numberWord(target),
        pairQuantity: target,
        objectType: pickObject(memory),
      };
    }

    const distractorIndex = index > correctPosition ? index - 1 : index;
    const numeral = distractors[distractorIndex]!;
    const quantity =
      distractorIndex % 2 === 0
        ? numeral
        : shuffle(TARGETS.filter((value) => value !== numeral))[0]!;

    return {
      id: `three-way-${target}-${index}-${numeral}`,
      kind: "pair" as const,
      pairNumeral: numeral,
      pairWord: numberWord(
        distractorIndex % 2 === 0
          ? shuffle(TARGETS.filter((value) => value !== numeral))[0]!
          : numeral
      ),
      pairQuantity: quantity,
      objectType: distractorObjects[distractorIndex]!,
    };
  });

  return {
    options,
    correctOptionId: options[correctPosition]!.id,
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

function createWhichGroupHasTask(lessonId: string): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory);
  const correctObjectType = pickObject(memory);
  const distractorObjects = shuffle(OBJECT_TYPES.filter((value) => value !== correctObjectType)).slice(0, 2);
  const correctPosition = chooseAnswerPosition(memory, 3);
  const quantities = shuffle(TARGETS.filter((value) => value !== target)).slice(0, 2);
  const values = Array.from({ length: 3 }, (_, index) => {
    if (index === correctPosition) {
      return {
        id: `group-${target}-${index}`,
        kind: "quantity" as const,
        quantity: target,
        objectType: correctObjectType,
      };
    }
    const distractorIndex = index > correctPosition ? index - 1 : index;
    return {
      id: `group-${target}-${index}-${quantities[distractorIndex]}`,
      kind: "quantity" as const,
      quantity: quantities[distractorIndex]!,
      objectType: distractorObjects[distractorIndex]!,
    };
  });
  pushRecent(memory.recentKinds, "which_group_has", 4);
  memory.taskCounter += 1;

  return {
    kind: "groundMatch",
    prompt: `Which group has ${target}?`,
    speakText: `Which group has ${numberWord(target)}?`,
    targetNumber: target,
    visualType: "ground-quantity-card",
    promptType: "numeral_to_group",
    shownNumeral: target,
    options: values,
    correctOptionId: values[correctPosition]!.id,
    feedback: {
      correct: "Great spotting!",
      wrong: "Count the groups carefully.",
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

function createHowManyTask(lessonId: string): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory);
  const objectType = pickObject(memory);
  const options = buildNumeralChoiceOptions(target, memory, 3);
  pushRecent(memory.recentKinds, "how_many", 4);
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
      correct: `Yes — there are ${target}.`,
      wrong: "Count each object once.",
    },
  };
}

function createQuickCountTask(lessonId: string): GroundFlashTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory);
  const objectType = pickObject(memory);
  const options = buildNumeralTapOptions(target, memory, 3);
  pushRecent(memory.recentKinds, "quick_count", 4);
  memory.taskCounter += 1;

  return {
    kind: "groundFlash",
    prompt: "How many before it disappears?",
    speakText: "How many before it disappears?",
    targetNumber: target,
    objectType,
    revealType: "objects",
    revealMs: 1100,
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: {
      correct: "Quick counting!",
      wrong: "Try the quick count again.",
    },
  };
}

function createFindMatchingNumberTask(lessonId: string): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory);
  const objectType = pickObject(memory);
  const options = buildNumeralChoiceOptions(target, memory, 4);
  pushRecent(memory.recentKinds, "find_matching_number", 4);
  memory.taskCounter += 1;

  return {
    kind: "groundMatch",
    prompt: "Find the matching number.",
    speakText: "Find the matching number.",
    targetNumber: target,
    visualType: "ground-quantity-card",
    promptType: "group_to_numeral",
    objectType,
    shownQuantity: target,
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: {
      correct: "Nice matching!",
      wrong: "Count and match again.",
    },
  };
}

function createNumbotCountTask(lessonId: string): GroundFeedTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory);
  const objectType = randInt(0, 1) === 0 ? "energy_orbs" : "robot_tokens";
  const totalObjects = randInt(0, 1) === 0 ? target : 10;
  pushRecent(memory.recentKinds, "numbot_count", 4);
  memory.taskCounter += 1;

  return {
    kind: "groundFeed",
    prompt: `Feed Numbot ${target} ${collectLabel(objectType)}.`,
    speakText: `Feed Numbot ${numberWord(target)} ${collectLabel(objectType)}.`,
    targetNumber: target,
    objectType,
    totalObjects,
    feedback: {
      correct: "Numbot counted them!",
      wrong: "Count carefully for Numbot.",
    },
  };
}

function createCountAndBuildTask(lessonId: string): GroundBuildTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory);
  const objectType = pickObject(memory);
  pushRecent(memory.recentKinds, "count_build", 4);
  memory.taskCounter += 1;

  return {
    kind: "groundBuild",
    prompt: `Build ${target}.`,
    speakText: `Build ${numberWord(target)}.`,
    targetNumber: target,
    objectType,
    feedback: {
      correct: `Yes — you built ${target}.`,
      wrong: "Try building it again.",
    },
  };
}

function createFlashQuantityTask(lessonId: string): GroundFlashTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory);
  const objectType = pickObject(memory);
  const options = buildNumeralTapOptions(target, memory, 3);
  pushRecent(memory.recentKinds, "flash_quantity", 4);
  memory.taskCounter += 1;

  return {
    kind: "groundFlash",
    prompt: "Flash quantity!",
    speakText: "Watch the quantity, then tap the number.",
    targetNumber: target,
    objectType,
    revealType: "objects",
    revealMs: 900,
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: {
      correct: "Great spotting!",
      wrong: "Watch the quantity again.",
    },
  };
}

function createLesson3ListenAndTapTask(lessonId: string): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory);
  const options = buildNumeralChoiceOptions(target, memory, 3);
  pushRecent(memory.recentKinds, "listen_tap_l3", 4);
  memory.taskCounter += 1;

  return {
    kind: "groundMatch",
    prompt: "Listen and tap.",
    speakText: `Tap number ${numberWord(target)}.`,
    targetNumber: target,
    targetNumberName: numberWord(target),
    visualType: "ground-number-card",
    promptType: "number_to_numeral",
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: {
      correct: `Yes — that is ${numberWord(target)}.`,
      wrong: "Listen again.",
    },
  };
}

function createLesson3WordNumberMatchTask(lessonId: string): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory);
  const useWordToNumeral = memory.taskCounter % 2 === 0;
  pushRecent(memory.recentKinds, "word_number_match", 4);
  memory.taskCounter += 1;

  if (useWordToNumeral) {
    const options = buildNumeralChoiceOptions(target, memory, 3);
    return {
      kind: "groundMatch",
      prompt: "Find the number.",
      speakText: `This word is ${numberWord(target)}. Find number ${numberWord(target)}.`,
      targetNumber: target,
      targetNumberName: numberWord(target),
      visualType: "ground-number-card",
      promptType: "word_to_numeral",
      shownWord: numberWord(target),
      options,
      correctOptionId: options.find((option) => option.numeral === target)!.id,
      feedback: {
        correct: `Correct — ${numberWord(target)} matches ${target}.`,
        wrong: `Look for number ${numberWord(target)}.`,
      },
    };
  }

  const options = buildWordChoiceOptions(target, memory, 3);
  return {
    kind: "groundMatch",
    prompt: "Match the number.",
    speakText: `${numberWord(target)} matches number ${numberWord(target)}.`,
    targetNumber: target,
    targetNumberName: numberWord(target),
    visualType: "ground-flash-match-card",
    promptType: "numeral_to_word",
    shownNumeral: target,
    options,
    correctOptionId: options.find((option) => option.word === numberWord(target))!.id,
    feedback: {
      correct: `Yes — that word says ${numberWord(target)}.`,
      wrong: "Listen again.",
    },
  };
}

function createLesson3MatchGroupTask(lessonId: string): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory);
  const correctObjectType = pickObject(memory);
  const distractorObjects = shuffle(OBJECT_TYPES.filter((value) => value !== correctObjectType)).slice(0, 2);
  const correctPosition = chooseAnswerPosition(memory, 3);
  const distractorQuantities = shuffle(TARGETS.filter((value) => value !== target)).slice(0, 2);
  const options = Array.from({ length: 3 }, (_, index) => {
    if (index === correctPosition) {
      return {
        id: `lesson3-group-${target}-${index}`,
        kind: "quantity" as const,
        quantity: target,
        objectType: correctObjectType,
      };
    }
    const distractorIndex = index > correctPosition ? index - 1 : index;
    return {
      id: `lesson3-group-${target}-${index}-${distractorQuantities[distractorIndex]}`,
      kind: "quantity" as const,
      quantity: distractorQuantities[distractorIndex]!,
      objectType: distractorObjects[distractorIndex]!,
    };
  });
  pushRecent(memory.recentKinds, "match_group_l3", 4);
  memory.taskCounter += 1;

  return {
    kind: "groundMatch",
    prompt: `Which group shows ${target}?`,
    speakText: `Which group shows ${numberWord(target)}?`,
    targetNumber: target,
    targetNumberName: numberWord(target),
    visualType: "ground-quantity-card",
    promptType: "numeral_to_group",
    shownNumeral: target,
    options,
    correctOptionId: options[correctPosition]!.id,
    feedback: {
      correct: "Nice match!",
      wrong: "Count the groups carefully.",
    },
  };
}

function createLesson3NumbotSaysTask(lessonId: string): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory);
  const useGroup = memory.taskCounter % 3 === 0;
  pushRecent(memory.recentKinds, "numbot_says_l3", 4);
  memory.taskCounter += 1;

  if (useGroup) {
    const objectType = pickObject(memory);
    const correctPosition = chooseAnswerPosition(memory, 3);
    const distractorObjects = shuffle(OBJECT_TYPES.filter((value) => value !== objectType)).slice(0, 2);
    const distractorQuantities = shuffle(TARGETS.filter((value) => value !== target)).slice(0, 2);
    const options = Array.from({ length: 3 }, (_, index) => {
      if (index === correctPosition) {
        return {
          id: `numbot-group-${target}-${index}`,
          kind: "quantity" as const,
          quantity: target,
          objectType,
        };
      }
      const distractorIndex = index > correctPosition ? index - 1 : index;
      return {
        id: `numbot-group-${target}-${index}-${distractorQuantities[distractorIndex]}`,
        kind: "quantity" as const,
        quantity: distractorQuantities[distractorIndex]!,
        objectType: distractorObjects[distractorIndex]!,
      };
    });

    return {
      kind: "groundMatch",
      prompt: "Numbot says match the group.",
      speakText: `Numbot says find ${numberWord(target)}.`,
      targetNumber: target,
      targetNumberName: numberWord(target),
      visualType: "ground-quantity-card",
      promptType: "numeral_to_group",
      helperVariant: "numbot",
      shownNumeral: target,
      options,
      correctOptionId: options[correctPosition]!.id,
      feedback: {
        correct: "Numbot powered up!",
        wrong: "Listen to Numbot again.",
      },
    };
  }

  const options = buildNumeralChoiceOptions(target, memory, 3);
  return {
    kind: "groundMatch",
    prompt: "Numbot says tap the number.",
    speakText: `Numbot says tap ${numberWord(target)}.`,
    targetNumber: target,
    targetNumberName: numberWord(target),
    visualType: "ground-number-card",
    promptType: "number_to_numeral",
    helperVariant: "numbot",
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: {
      correct: "Numbot is happy!",
      wrong: "Listen to Numbot again.",
    },
  };
}

function createLesson3HearAndFindTask(lessonId: string): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory);
  const mode = memory.taskCounter % 2 === 0 ? "numeral" : "group";
  pushRecent(memory.recentKinds, "hear_find", 4);
  memory.taskCounter += 1;

  if (mode === "group") {
    const objectType = pickObject(memory);
    const correctPosition = chooseAnswerPosition(memory, 3);
    const distractorObjects = shuffle(OBJECT_TYPES.filter((value) => value !== objectType)).slice(0, 2);
    const distractorQuantities = shuffle(TARGETS.filter((value) => value !== target)).slice(0, 2);
    const options = Array.from({ length: 3 }, (_, index) => {
      if (index === correctPosition) {
        return {
          id: `hear-find-group-${target}-${index}`,
          kind: "quantity" as const,
          quantity: target,
          objectType,
        };
      }
      const distractorIndex = index > correctPosition ? index - 1 : index;
      return {
        id: `hear-find-group-${target}-${index}-${distractorQuantities[distractorIndex]}`,
        kind: "quantity" as const,
        quantity: distractorQuantities[distractorIndex]!,
        objectType: distractorObjects[distractorIndex]!,
      };
    });

    return {
      kind: "groundMatch",
      prompt: "Hear and find.",
      speakText: `Find ${numberWord(target)}.`,
      targetNumber: target,
      targetNumberName: numberWord(target),
      visualType: "ground-quantity-card",
      promptType: "numeral_to_group",
      helperVariant: "speech_bubble",
      options,
      correctOptionId: options[correctPosition]!.id,
      feedback: {
        correct: "Great listening!",
        wrong: "Listen again and count carefully.",
      },
    };
  }

  const options = buildNumeralChoiceOptions(target, memory, 3);
  return {
    kind: "groundMatch",
    prompt: "Hear and find.",
    speakText: `Find ${numberWord(target)}.`,
    targetNumber: target,
    targetNumberName: numberWord(target),
    visualType: "ground-number-card",
    promptType: "number_to_numeral",
    helperVariant: "speech_bubble",
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: {
      correct: "You found it!",
      wrong: "Listen again.",
    },
  };
}

function createLesson3QuickMatchTask(lessonId: string): GroundFlashTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory);
  const objectType = pickObject(memory);
  const options = buildNumeralTapOptions(target, memory, 3);
  pushRecent(memory.recentKinds, "quick_match_l3", 4);
  memory.taskCounter += 1;

  return {
    kind: "groundFlash",
    prompt: "Match before it fades.",
    speakText: `Watch quickly, then find ${numberWord(target)}.`,
    targetNumber: target,
    objectType,
    revealType: "numeral",
    revealMs: 900,
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: {
      correct: "Quick match!",
      wrong: "Try the flash again.",
    },
  };
}

function createLesson3SpeechBubbleTask(lessonId: string): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory);
  const useGroup = memory.taskCounter % 2 === 1;
  pushRecent(memory.recentKinds, "speech_bubble_match", 4);
  memory.taskCounter += 1;

  if (useGroup) {
    const objectType = pickObject(memory);
    const correctPosition = chooseAnswerPosition(memory, 3);
    const distractorObjects = shuffle(OBJECT_TYPES.filter((value) => value !== objectType)).slice(0, 2);
    const distractorQuantities = shuffle(TARGETS.filter((value) => value !== target)).slice(0, 2);
    const options = Array.from({ length: 3 }, (_, index) => {
      if (index === correctPosition) {
        return {
          id: `speech-bubble-group-${target}-${index}`,
          kind: "quantity" as const,
          quantity: target,
          objectType,
        };
      }
      const distractorIndex = index > correctPosition ? index - 1 : index;
      return {
        id: `speech-bubble-group-${target}-${index}-${distractorQuantities[distractorIndex]}`,
        kind: "quantity" as const,
        quantity: distractorQuantities[distractorIndex]!,
        objectType: distractorObjects[distractorIndex]!,
      };
    });

    return {
      kind: "groundMatch",
      prompt: "Match the number bubble.",
      speakText: `${numberWord(target)}.`,
      targetNumber: target,
      targetNumberName: numberWord(target),
      visualType: "ground-quantity-card",
      promptType: "numeral_to_group",
      helperVariant: "speech_bubble",
      options,
      correctOptionId: options[correctPosition]!.id,
      feedback: {
        correct: "Nice match!",
        wrong: "Listen again.",
      },
    };
  }

  const options = buildNumeralChoiceOptions(target, memory, 3);
  return {
    kind: "groundMatch",
    prompt: "Match the number bubble.",
    speakText: `${numberWord(target)}.`,
    targetNumber: target,
    targetNumberName: numberWord(target),
    visualType: "ground-number-card",
    promptType: "number_to_numeral",
    helperVariant: "speech_bubble",
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: {
      correct: "Nice match!",
      wrong: "Listen again.",
    },
  };
}

function createLesson3ThreeWayMatchTask(lessonId: string): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory);
  const { options, correctOptionId } = buildThreeWayMatchOptions(target, memory);
  pushRecent(memory.recentKinds, "three_way_match", 4);
  memory.taskCounter += 1;

  return {
    kind: "groundMatch",
    prompt: "Which pair matches?",
    speakText: `Find ${numberWord(target)}.`,
    targetNumber: target,
    targetNumberName: numberWord(target),
    visualType: "ground-flash-match-card",
    promptType: "word_pair_match",
    options,
    correctOptionId,
    feedback: {
      correct: `Correct — ${numberWord(target)} all match.`,
      wrong: "Find the one that matches.",
    },
  };
}

function createLesson3FlashNumberTask(lessonId: string): GroundFlashTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory);
  const objectType = pickObject(memory);
  const options = buildNumeralTapOptions(target, memory, 3);
  pushRecent(memory.recentKinds, "flash_number_l3", 4);
  memory.taskCounter += 1;

  return {
    kind: "groundFlash",
    prompt: "Which number did you see?",
    speakText: "Which number did you see?",
    targetNumber: target,
    objectType,
    revealType: "numeral",
    revealMs: 1100,
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: {
      correct: "You found it!",
      wrong: "Watch carefully and try again.",
    },
  };
}

function createLesson3CountAndMatchTask(lessonId: string): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory);
  const objectType = pickObject(memory);
  pushRecent(memory.recentKinds, "count_match_l3", 4);
  memory.taskCounter += 1;

  const options = buildNumeralChoiceOptions(target, memory, 3);
  return {
    kind: "groundMatch",
    prompt: "Count and match.",
    speakText: `Count the ${objectLabel(objectType)}, then tap ${numberWord(target)}.`,
    targetNumber: target,
    targetNumberName: numberWord(target),
    visualType: "ground-quantity-card",
    promptType: "group_to_numeral",
    objectType,
    shownQuantity: target,
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: {
      correct: "Great counting!",
      wrong: "Count the group carefully.",
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
  const lesson3RotationPattern = [
    "listen_tap_l3",
    "match_group_l3",
    "hear_find",
    "numbot_says_l3",
    "flash_number_l3",
    "count_match_l3",
    "quick_match_l3",
    "speech_bubble_match",
    "listen_tap_l3",
    "match_group_l3",
    "hear_find",
    "flash_number_l3",
    "word_number_match",
    "three_way_match",
  ] as const;
  const lesson2RotationPattern = [
    "count_tap",
    "how_many",
    "match_group",
    "quick_count",
    "tap_each",
    "find_matching_number",
    "which_group_has",
    "numbot_count",
    "count_build",
    "flash_quantity",
  ] as const;
  const gameKind =
    lessonId === "y0-w2-l3"
      ? lesson3RotationPattern[memory.cursor % lesson3RotationPattern.length]!
      : lessonId === "y0-w2-l2"
      ? lesson2RotationPattern[memory.cursor % lesson2RotationPattern.length]!
      : rotationPattern[memory.cursor % rotationPattern.length]!;
  memory.cursor += 1;

  switch (gameKind) {
    case "listen_tap_l3":
      return createLesson3ListenAndTapTask(lessonId);
    case "word_number_match":
      return createLesson3WordNumberMatchTask(lessonId);
    case "match_group_l3":
      return createLesson3MatchGroupTask(lessonId);
    case "numbot_says_l3":
      return createLesson3NumbotSaysTask(lessonId);
    case "hear_find":
      return createLesson3HearAndFindTask(lessonId);
    case "quick_match_l3":
      return createLesson3QuickMatchTask(lessonId);
    case "speech_bubble_match":
      return createLesson3SpeechBubbleTask(lessonId);
    case "three_way_match":
      return createLesson3ThreeWayMatchTask(lessonId);
    case "flash_number_l3":
      return createLesson3FlashNumberTask(lessonId);
    case "count_match_l3":
      return createLesson3CountAndMatchTask(lessonId);
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
    case "count_tap":
      return createCountAndMatchTask(lessonId);
    case "how_many":
      return createHowManyTask(lessonId);
    case "match_group":
      return createMatchQuantityTask(lessonId);
    case "quick_count":
      return createQuickCountTask(lessonId);
    case "tap_each":
      return createCountAndMatchTask(lessonId);
    case "find_matching_number":
      return createFindMatchingNumberTask(lessonId);
    case "which_group_has":
      return createWhichGroupHasTask(lessonId);
    case "numbot_count":
      return createNumbotCountTask(lessonId);
    case "count_build":
      return createCountAndBuildTask(lessonId);
    case "flash_quantity":
      return createFlashQuantityTask(lessonId);
    default:
      return createTapTheNumberTask(lessonId);
  }
}
