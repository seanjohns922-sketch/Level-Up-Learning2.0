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
  | "futuristic_coins"
  | "planets"
  | "rockets"
  | "number_orbs";

type GroundPatternLayout = "dice" | "ten_frame" | "domino" | "finger" | "symmetry";
type GroundMatchTask = Extract<PracticeTask, { kind: "groundMatch" }>;
type GroundFlashTask = Extract<PracticeTask, { kind: "groundFlash" }>;
type GroundBuildTask = Extract<PracticeTask, { kind: "groundBuild" }>;

type LessonMode = "dot_patterns" | "object_groups";

type Week4Memory = {
  cursor: number;
  recentTargets: number[];
  recentObjects: GroundObjectType[];
  recentKinds: string[];
  recentPositions: number[];
  recentLayouts: GroundPatternLayout[];
};

const TARGETS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
const LOW_TARGETS = [1, 2, 3, 4, 5] as const;
const MID_TARGETS = [4, 5, 6, 7, 8] as const;
const TEN_FRAME_TARGETS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
const REAL_WORLD_OBJECTS: GroundObjectType[] = ["stars", "planets", "energy_orbs", "robot_tokens", "crystals", "gems"];
const FAST_OBJECTS: GroundObjectType[] = ["dots", "stars", "gems", "number_orbs", "crystals"];
const OBJECT_GROUP_OBJECTS: GroundObjectType[] = ["stars", "crystals", "blocks", "robot_tokens", "planets", "energy_orbs", "futuristic_coins", "gems"];

const lesson1Rotation = [
  "flash_dot",
  "ten_frame",
  "which_card",
  "memory_flash",
  "fast_match",
  "subitising_race",
  "dots_to_numbers",
  "ten_frame_match",
  "finger_match",
  "real_world",
  "true_false",
  "quick_build",
] as const;

const lesson2Rotation = [
  "quick_group_flash",
  "which_group_matches",
  "real_world_quick_look",
  "memory_group",
  "fast_group_match",
  "ten_frame_objects",
  "true_false_group",
  "objects_to_numbers",
  "numbot_quick_eyes",
  "build_the_group",
  "group_race",
  "same_or_different",
] as const;

const memoryByLesson = new Map<string, Week4Memory>();

function getLessonMode(lessonId: string): LessonMode {
  return lessonId === "y0-w4-l2" ? "object_groups" : "dot_patterns";
}

function getMemory(lessonId: string): Week4Memory {
  const existing = memoryByLesson.get(lessonId);
  if (existing) return existing;
  const created: Week4Memory = {
    cursor: 0,
    recentTargets: [],
    recentObjects: [],
    recentKinds: [],
    recentPositions: [],
    recentLayouts: [],
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
  if (objectType === "number_orbs") return "glowing orbs";
  if (objectType === "futuristic_coins") return "coins";
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

function stagePool(memory: Week4Memory, difficulty: Difficulty) {
  const step = memory.cursor;
  if (difficulty === "easy") {
    if (step < 14) return [...LOW_TARGETS];
    if (step < 28) return [...MID_TARGETS];
    return [...TARGETS];
  }
  if (difficulty === "medium") {
    if (step < 10) return [...MID_TARGETS];
    return [...TARGETS];
  }
  return [...TARGETS];
}

function pickTarget(memory: Week4Memory, difficulty: Difficulty, allowed?: readonly number[]) {
  const pool = allowed ? [...allowed] : stagePool(memory, difficulty);
  const target = chooseRecentSafe(pool, memory.recentTargets);
  pushRecent(memory.recentTargets, target, 4);
  return target;
}

function pickLayout(memory: Week4Memory, target: number, preferred?: readonly GroundPatternLayout[]) {
  const allowed: GroundPatternLayout[] = preferred
    ? [...preferred]
    : target <= 5
      ? ["dice", "ten_frame", "domino", "finger", "symmetry"]
      : target <= 6
        ? ["dice", "ten_frame", "domino", "symmetry"]
        : ["ten_frame", "domino", "symmetry"];
  const layout = chooseRecentSafe(allowed, memory.recentLayouts);
  pushRecent(memory.recentLayouts, layout, 4);
  return layout;
}

function pickObject(memory: Week4Memory, allowed: readonly GroundObjectType[] = REAL_WORLD_OBJECTS) {
  const objectType = chooseRecentSafe(allowed, memory.recentObjects);
  pushRecent(memory.recentObjects, objectType, 4);
  return objectType;
}

function chooseAnswerPosition(memory: Week4Memory, optionCount: number) {
  const position = chooseRecentSafe(Array.from({ length: optionCount }, (_, index) => index), memory.recentPositions);
  pushRecent(memory.recentPositions, position, 4);
  return position;
}

function nearbyDistractors(target: number, optionCount: number) {
  const closePool = TARGETS.filter((value) => value !== target).sort((a, b) => Math.abs(a - target) - Math.abs(b - target));
  return shuffle(closePool.slice(0, Math.max(4, optionCount + 1))).slice(0, optionCount - 1);
}

function buildNumeralOptions(target: number, memory: Week4Memory, optionCount = 3) {
  const distractors = nearbyDistractors(target, optionCount);
  const correctPosition = chooseAnswerPosition(memory, optionCount);
  const ordered = new Array<number>(optionCount);
  ordered[correctPosition] = target;
  const positions = Array.from({ length: optionCount }, (_, index) => index).filter((index) => index !== correctPosition);
  positions.forEach((position, index) => {
    ordered[position] = distractors[index]!;
  });
  const options = ordered.map((numeral, index) => ({ id: `num-${target}-${index}-${numeral}`, numeral }));
  return { options, correctOptionId: options[correctPosition]!.id };
}

function buildQuantityOptions(target: number, memory: Week4Memory, objectType: GroundObjectType, layout: GroundPatternLayout, optionCount = 3) {
  const distractors = nearbyDistractors(target, optionCount);
  const correctPosition = chooseAnswerPosition(memory, optionCount);
  const ordered = new Array<number>(optionCount);
  ordered[correctPosition] = target;
  const positions = Array.from({ length: optionCount }, (_, index) => index).filter((index) => index !== correctPosition);
  positions.forEach((position, index) => {
    ordered[position] = distractors[index]!;
  });
  const options = ordered.map((quantity, index) => ({
    id: `qty-${target}-${index}-${quantity}`,
    kind: "quantity" as const,
    quantity,
    objectType,
    patternLayout: quantity <= 5 && layout === "finger" ? "finger" : quantity > 6 ? "ten_frame" : layout,
  }));
  return { options, correctOptionId: options[correctPosition]!.id };
}

function buildYesNoOptions(memory: Week4Memory, isTrue: boolean) {
  const yesFirst = chooseAnswerPosition(memory, 2) === 0;
  const options = yesFirst
    ? [
        { id: "yes", kind: "word" as const, word: "yes" },
        { id: "no", kind: "word" as const, word: "no" },
      ]
    : [
        { id: "no", kind: "word" as const, word: "no" },
        { id: "yes", kind: "word" as const, word: "yes" },
      ];
  return { options, correctOptionId: isTrue ? "yes" : "no" };
}

function createFlashDotRecognitionTask(lessonId: string, difficulty: Difficulty): GroundFlashTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const layout = pickLayout(memory, target, target > 6 ? ["ten_frame", "symmetry"] : undefined);
  const { options, correctOptionId } = buildNumeralOptions(target, memory, 3);
  pushRecent(memory.recentKinds, "flash_dot", 4);
  return {
    kind: "groundFlash",
    prompt: "Spot it fast!",
    speakText: "Quick eyes. How many instantly?",
    targetNumber: target,
    objectType: "dots",
    patternLayout: layout,
    revealType: "objects",
    revealMs: difficulty === "easy" ? 2180 : difficulty === "medium" ? 1860 : 1620,
    options,
    correctOptionId,
    feedback: { correct: "Quick spotting!", wrong: "Look again, then recognise it." },
  };
}

function createTenFrameQuickLookTask(lessonId: string, difficulty: Difficulty): GroundFlashTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty, TEN_FRAME_TARGETS);
  const { options, correctOptionId } = buildNumeralOptions(target, memory, 3);
  pushRecent(memory.recentKinds, "ten_frame", 4);
  return {
    kind: "groundFlash",
    prompt: "Quick eyes on the frame",
    speakText: "Ten frame quick look. How many instantly?",
    targetNumber: target,
    objectType: "dots",
    patternLayout: "ten_frame",
    revealType: "objects",
    revealMs: difficulty === "easy" ? 2280 : difficulty === "medium" ? 1900 : 1680,
    options,
    correctOptionId,
    feedback: { correct: "You saw it fast!", wrong: "Trust what you noticed." },
  };
}

function createWhichCardMatchesTask(lessonId: string, difficulty: Difficulty): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const layout = pickLayout(memory, target);
  const { options, correctOptionId } = buildQuantityOptions(target, memory, "dots", layout, 3);
  pushRecent(memory.recentKinds, "which_card", 4);
  return {
    kind: "groundMatch",
    prompt: "Which card matches?",
    speakText: `Which card shows ${numberWord(target)}? Do not count. Recognise it.`,
    targetNumber: target,
    targetNumberName: numberWord(target),
    visualType: "ground-quantity-card",
    promptType: "numeral_to_group",
    shownNumeral: target,
    objectType: "dots",
    patternLayout: layout,
    options,
    correctOptionId,
    feedback: { correct: "You recognised it instantly!", wrong: "Quick eyes. Try again." },
  };
}

function createMemoryFlashTask(lessonId: string, difficulty: Difficulty): GroundFlashTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const layout = pickLayout(memory, target);
  const { options, correctOptionId } = buildNumeralOptions(target, memory, 3);
  pushRecent(memory.recentKinds, "memory_flash", 4);
  return {
    kind: "groundFlash",
    prompt: "Remember the pattern",
    speakText: "Look, remember, then tap the number you saw.",
    targetNumber: target,
    objectType: "dots",
    patternLayout: layout,
    revealType: "objects",
    revealMs: difficulty === "easy" ? 1980 : difficulty === "medium" ? 1700 : 1520,
    promptAfterReveal: "What did you see?",
    options,
    correctOptionId,
    feedback: { correct: "Memory match!", wrong: "Hold the picture in your mind." },
  };
}

function createFindFastMatchTask(lessonId: string, difficulty: Difficulty): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const objectType = pickObject(memory, FAST_OBJECTS);
  const layout = pickLayout(memory, target);
  const { options, correctOptionId } = buildQuantityOptions(target, memory, objectType, layout, 3);
  pushRecent(memory.recentKinds, "fast_match", 4);
  return {
    kind: "groundMatch",
    prompt: "Find the fast match",
    speakText: `Which one shows ${numberWord(target)}? Quick eyes.`,
    targetNumber: target,
    targetNumberName: numberWord(target),
    visualType: "ground-quantity-card",
    promptType: "numeral_to_group",
    shownNumeral: target,
    objectType,
    patternLayout: layout,
    options,
    correctOptionId,
    feedback: { correct: "Fast spotting!", wrong: "Notice the pattern, not one-by-one counting." },
  };
}

function createSubitisingRaceTask(lessonId: string, difficulty: Difficulty): GroundFlashTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const layout = pickLayout(memory, target, target > 6 ? ["ten_frame", "symmetry"] : undefined);
  const { options, correctOptionId } = buildNumeralOptions(target, memory, 4);
  pushRecent(memory.recentKinds, "subitising_race", 4);
  return {
    kind: "groundFlash",
    prompt: "Subitising race!",
    speakText: "Quick eyes. Spot it before it fades.",
    targetNumber: target,
    objectType: "dots",
    patternLayout: layout,
    revealType: "objects",
    revealMs: difficulty === "easy" ? 1820 : difficulty === "medium" ? 1620 : 1460,
    options,
    correctOptionId,
    feedback: { correct: "FAST SPOTTING!", wrong: "Blink and spot it again." },
  };
}

function createDotsToNumbersTask(lessonId: string, difficulty: Difficulty): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const layout = pickLayout(memory, target);
  const { options, correctOptionId } = buildNumeralOptions(target, memory, 3);
  pushRecent(memory.recentKinds, "dots_to_numbers", 4);
  return {
    kind: "groundMatch",
    prompt: "Dots to number",
    speakText: "How many instantly? Tap the matching number.",
    targetNumber: target,
    targetNumberName: numberWord(target),
    visualType: "ground-quantity-card",
    promptType: "group_to_numeral",
    shownQuantity: target,
    objectType: "dots",
    patternLayout: layout,
    options: options.map((option) => ({ id: option.id, kind: "numeral" as const, numeral: option.numeral })),
    correctOptionId,
    feedback: { correct: "You noticed it quickly!", wrong: "See the pattern as a whole." },
  };
}

function createTenFrameMatchTask(lessonId: string, difficulty: Difficulty): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty, TEN_FRAME_TARGETS);
  const { options, correctOptionId } = buildNumeralOptions(target, memory, 3);
  pushRecent(memory.recentKinds, "ten_frame_match", 4);
  return {
    kind: "groundMatch",
    prompt: "Ten frame match",
    speakText: "Spot the ten frame and tap the number.",
    targetNumber: target,
    targetNumberName: numberWord(target),
    visualType: "ground-quantity-card",
    promptType: "group_to_numeral",
    shownQuantity: target,
    objectType: "dots",
    patternLayout: "ten_frame",
    options: options.map((option) => ({ id: option.id, kind: "numeral" as const, numeral: option.numeral })),
    correctOptionId,
    feedback: { correct: "Ten-frame expert!", wrong: "Look at the filled spaces as a whole." },
  };
}

function createFingerPatternMatchTask(lessonId: string, difficulty: Difficulty): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty, LOW_TARGETS);
  const { options, correctOptionId } = buildNumeralOptions(target, memory, 3);
  pushRecent(memory.recentKinds, "finger_match", 4);
  return {
    kind: "groundMatch",
    prompt: "Finger pattern match",
    speakText: "Quick eyes. Match the finger pattern.",
    targetNumber: target,
    targetNumberName: numberWord(target),
    visualType: "ground-quantity-card",
    promptType: "group_to_numeral",
    shownQuantity: target,
    objectType: "dots",
    patternLayout: "finger",
    options: options.map((option) => ({ id: option.id, kind: "numeral" as const, numeral: option.numeral })),
    correctOptionId,
    feedback: { correct: "You saw the fingers fast!", wrong: "Notice the hand shape first." },
  };
}

function createRealWorldQuickLookTask(lessonId: string, difficulty: Difficulty): GroundFlashTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const objectType = pickObject(memory, REAL_WORLD_OBJECTS);
  const layout = pickLayout(memory, target, target > 6 ? ["ten_frame", "symmetry", "domino"] : ["dice", "domino", "symmetry", "ten_frame"]);
  const { options, correctOptionId } = buildNumeralOptions(target, memory, 3);
  pushRecent(memory.recentKinds, "real_world", 4);
  return {
    kind: "groundFlash",
    prompt: "Real-world quick look",
    speakText: `How many ${objectLabel(objectType)} instantly?`,
    targetNumber: target,
    objectType,
    patternLayout: layout,
    revealType: "objects",
    revealMs: difficulty === "easy" ? 1980 : difficulty === "medium" ? 1740 : 1580,
    options,
    correctOptionId,
    feedback: { correct: "Amazing noticing!", wrong: "Look at the whole shape first." },
  };
}

function createTrueOrFalseQuickLookTask(lessonId: string, difficulty: Difficulty): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const shownNumeral = randInt(0, 1) === 1 ? target : chooseRecentSafe(TARGETS.filter((value) => value !== target), memory.recentTargets);
  const { options, correctOptionId } = buildYesNoOptions(memory, shownNumeral === target);
  pushRecent(memory.recentKinds, "true_false", 4);
  return {
    kind: "groundMatch",
    prompt: `Does this show ${shownNumeral}?`,
    speakText: `Quick look. Does this show ${numberWord(shownNumeral)}?`,
    targetNumber: target,
    targetNumberName: numberWord(target),
    visualType: "ground-quantity-card",
    promptType: "group_to_numeral",
    shownQuantity: target,
    objectType: pickObject(memory, ["dots", "stars", "gems", "number_orbs"]),
    patternLayout: pickLayout(memory, target),
    options,
    correctOptionId,
    feedback: { correct: "You checked it fast!", wrong: "Match the pattern to the number." },
  };
}

function createQuickBuildTask(lessonId: string, difficulty: Difficulty): GroundBuildTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty, TEN_FRAME_TARGETS);
  const objectType = pickObject(memory, ["dots", "energy_orbs", "stars", "number_orbs"]);
  pushRecent(memory.recentKinds, "quick_build", 4);
  return {
    kind: "groundBuild",
    prompt: `Build ${target} fast!`,
    speakText: `Build ${numberWord(target)} fast. Fill the frame.`,
    targetNumber: target,
    objectType,
    feedback: { correct: "Fast builder!", wrong: "Fill to the target, then try again." },
  };
}

function createQuickGroupFlashTask(lessonId: string, difficulty: Difficulty): GroundFlashTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const objectType = pickObject(memory, OBJECT_GROUP_OBJECTS);
  const layout = pickLayout(memory, target, target > 6 ? ["ten_frame", "symmetry", "domino"] : undefined);
  const { options, correctOptionId } = buildNumeralOptions(target, memory, 3);
  pushRecent(memory.recentKinds, "quick_group_flash", 4);
  return {
    kind: "groundFlash",
    prompt: "Spot the group fast!",
    speakText: `Quick eyes. How many ${objectLabel(objectType)} instantly?`,
    targetNumber: target,
    objectType,
    patternLayout: layout,
    revealType: "objects",
    revealMs: difficulty === "easy" ? 2120 : difficulty === "medium" ? 1820 : 1620,
    options,
    correctOptionId,
    feedback: { correct: "You spotted it instantly!", wrong: "See the group as a whole." },
  };
}

function createWhichGroupMatchesTask(lessonId: string, difficulty: Difficulty): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const objectType = pickObject(memory, OBJECT_GROUP_OBJECTS);
  const layout = pickLayout(memory, target);
  const { options, correctOptionId } = buildQuantityOptions(target, memory, objectType, layout, 3);
  pushRecent(memory.recentKinds, "which_group_matches", 4);
  return {
    kind: "groundMatch",
    prompt: "Which group matches?",
    speakText: `Which group shows ${numberWord(target)}? Quick eyes.`,
    targetNumber: target,
    targetNumberName: numberWord(target),
    visualType: "ground-quantity-card",
    promptType: "numeral_to_group",
    shownNumeral: target,
    objectType,
    patternLayout: layout,
    options,
    correctOptionId,
    feedback: { correct: "Group match found!", wrong: "Notice the shape of the group." },
  };
}

function createRealWorldQuickLookObjectTask(lessonId: string, difficulty: Difficulty): GroundFlashTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const objectType = pickObject(memory, OBJECT_GROUP_OBJECTS);
  const layout = pickLayout(memory, target, target > 6 ? ["ten_frame", "domino", "symmetry"] : ["dice", "domino", "symmetry"]);
  const { options, correctOptionId } = buildNumeralOptions(target, memory, 3);
  pushRecent(memory.recentKinds, "real_world_quick_look", 4);
  return {
    kind: "groundFlash",
    prompt: "Real-world quick look",
    speakText: `How many ${objectLabel(objectType)} instantly?`,
    targetNumber: target,
    objectType,
    patternLayout: layout,
    revealType: "objects",
    revealMs: difficulty === "easy" ? 2040 : difficulty === "medium" ? 1760 : 1560,
    options,
    correctOptionId,
    feedback: { correct: "Amazing eyes!", wrong: "Look for the pattern in the group." },
  };
}

function createMemoryGroupTask(lessonId: string, difficulty: Difficulty): GroundFlashTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const objectType = pickObject(memory, OBJECT_GROUP_OBJECTS);
  const layout = pickLayout(memory, target);
  const { options, correctOptionId } = buildNumeralOptions(target, memory, 3);
  pushRecent(memory.recentKinds, "memory_group", 4);
  return {
    kind: "groundFlash",
    prompt: "Remember the group",
    speakText: "Look, remember the group, then tap the number.",
    targetNumber: target,
    objectType,
    patternLayout: layout,
    revealType: "objects",
    revealMs: difficulty === "easy" ? 980 : difficulty === "medium" ? 680 : 500,
    promptAfterReveal: "What did you notice?",
    options,
    correctOptionId,
    feedback: { correct: "Memory spotter!", wrong: "Hold the group picture in your mind." },
  };
}

function createFastGroupMatchTask(lessonId: string, difficulty: Difficulty): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const objectType = pickObject(memory, OBJECT_GROUP_OBJECTS);
  const layout = pickLayout(memory, target, target > 6 ? ["ten_frame", "symmetry"] : undefined);
  const { options, correctOptionId } = buildQuantityOptions(target, memory, objectType, layout, 3);
  pushRecent(memory.recentKinds, "fast_group_match", 4);
  return {
    kind: "groundMatch",
    prompt: "Find the fast match",
    speakText: `Find the group with ${numberWord(target)}.`,
    targetNumber: target,
    targetNumberName: numberWord(target),
    visualType: "ground-quantity-card",
    promptType: "numeral_to_group",
    shownNumeral: target,
    objectType,
    patternLayout: layout,
    options,
    correctOptionId,
    feedback: { correct: "Super fast!", wrong: "Look at the whole group, not each object." },
  };
}

function createTenFrameObjectsTask(lessonId: string, difficulty: Difficulty): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty, TEN_FRAME_TARGETS);
  const objectType = pickObject(memory, ["stars", "gems", "energy_orbs", "robot_tokens"]);
  const { options, correctOptionId } = buildNumeralOptions(target, memory, 3);
  pushRecent(memory.recentKinds, "ten_frame_objects", 4);
  return {
    kind: "groundMatch",
    prompt: "Ten frame objects",
    speakText: "Quick eyes. Match the object frame to the number.",
    targetNumber: target,
    targetNumberName: numberWord(target),
    visualType: "ground-quantity-card",
    promptType: "group_to_numeral",
    shownQuantity: target,
    objectType,
    patternLayout: "ten_frame",
    options: options.map((option) => ({ id: option.id, kind: "numeral" as const, numeral: option.numeral })),
    correctOptionId,
    feedback: { correct: "Frame spotted!", wrong: "Notice the filled spaces in the frame." },
  };
}

function createTrueOrFalseGroupTask(lessonId: string, difficulty: Difficulty): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const shownNumeral = randInt(0, 1) === 1 ? target : chooseRecentSafe(TARGETS.filter((value) => value !== target), memory.recentTargets);
  const objectType = pickObject(memory, OBJECT_GROUP_OBJECTS);
  const layout = pickLayout(memory, target);
  const { options, correctOptionId } = buildYesNoOptions(memory, shownNumeral === target);
  pushRecent(memory.recentKinds, "true_false_group", 4);
  return {
    kind: "groundMatch",
    prompt: `Does this group show ${shownNumeral}?`,
    speakText: `Does this group show ${numberWord(shownNumeral)}?`,
    targetNumber: target,
    targetNumberName: numberWord(target),
    visualType: "ground-quantity-card",
    promptType: "group_to_numeral",
    shownQuantity: target,
    objectType,
    patternLayout: layout,
    options,
    correctOptionId,
    feedback: { correct: "You checked it fast!", wrong: "Compare the group to the number again." },
  };
}

function createObjectsToNumbersTask(lessonId: string, difficulty: Difficulty): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const objectType = pickObject(memory, OBJECT_GROUP_OBJECTS);
  const layout = pickLayout(memory, target);
  const { options, correctOptionId } = buildNumeralOptions(target, memory, 3);
  pushRecent(memory.recentKinds, "objects_to_numbers", 4);
  return {
    kind: "groundMatch",
    prompt: "Objects to numbers",
    speakText: "Recognise the group and tap the number.",
    targetNumber: target,
    targetNumberName: numberWord(target),
    visualType: "ground-quantity-card",
    promptType: "group_to_numeral",
    shownQuantity: target,
    objectType,
    patternLayout: layout,
    options: options.map((option) => ({ id: option.id, kind: "numeral" as const, numeral: option.numeral })),
    correctOptionId,
    feedback: { correct: "You recognised the group!", wrong: "Look at the structure of the group." },
  };
}

function createNumbotQuickEyesTask(lessonId: string, difficulty: Difficulty): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const objectType = pickObject(memory, OBJECT_GROUP_OBJECTS);
  const layout = pickLayout(memory, target);
  const { options, correctOptionId } = buildQuantityOptions(target, memory, objectType, layout, 3);
  pushRecent(memory.recentKinds, "numbot_quick_eyes", 4);
  return {
    kind: "groundMatch",
    prompt: `Spot ${target} fast!`,
    speakText: `Numbot says spot ${numberWord(target)} fast.`,
    targetNumber: target,
    targetNumberName: numberWord(target),
    visualType: "ground-quantity-card",
    promptType: "numeral_to_group",
    helperVariant: "numbot",
    shownNumeral: target,
    objectType,
    patternLayout: layout,
    options,
    correctOptionId,
    feedback: { correct: "Numbot is impressed!", wrong: "Listen again and spot the group." },
  };
}

function createBuildTheGroupTask(lessonId: string, difficulty: Difficulty): GroundBuildTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty, TEN_FRAME_TARGETS);
  const objectType = pickObject(memory, OBJECT_GROUP_OBJECTS);
  pushRecent(memory.recentKinds, "build_the_group", 4);
  return {
    kind: "groundBuild",
    prompt: `Build ${target}`,
    speakText: `Build ${numberWord(target)} fast.`,
    targetNumber: target,
    objectType,
    feedback: { correct: "Group complete!", wrong: "Build until the amount feels right." },
  };
}

function createGroupRaceTask(lessonId: string, difficulty: Difficulty): GroundFlashTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const objectType = pickObject(memory, OBJECT_GROUP_OBJECTS);
  const layout = pickLayout(memory, target, target > 6 ? ["ten_frame", "symmetry"] : ["dice", "domino", "symmetry"]);
  const { options, correctOptionId } = buildNumeralOptions(target, memory, 4);
  pushRecent(memory.recentKinds, "group_race", 4);
  return {
    kind: "groundFlash",
    prompt: "Group race!",
    speakText: "Quick eyes. Spot the group before it disappears.",
    targetNumber: target,
    objectType,
    patternLayout: layout,
    revealType: "objects",
    revealMs: difficulty === "easy" ? 1760 : difficulty === "medium" ? 1540 : 1420,
    options,
    correctOptionId,
    feedback: { correct: "FAST SPOTTING!", wrong: "Try another fast look." },
  };
}

function createSameOrDifferentTask(lessonId: string, difficulty: Difficulty): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const isSame = randInt(0, 1) === 1;
  const secondQuantity = isSame ? target : chooseRecentSafe(TARGETS.filter((value) => value !== target), memory.recentTargets);
  const objectType = pickObject(memory, OBJECT_GROUP_OBJECTS);
  const secondObjectType = pickObject(memory, OBJECT_GROUP_OBJECTS.filter((value) => value !== objectType));
  const firstLayout = pickLayout(memory, target);
  const secondLayout = pickLayout(memory, secondQuantity);
  const { options, correctOptionId } = buildYesNoOptions(memory, isSame);
  pushRecent(memory.recentKinds, "same_or_different", 4);
  return {
    kind: "groundMatch",
    prompt: "Same or different?",
    speakText: "Do these groups show the same amount?",
    targetNumber: target,
    targetNumberName: numberWord(target),
    visualType: "ground-quantity-card",
    promptType: "same_or_different_group",
    shownQuantity: target,
    shownSecondQuantity: secondQuantity,
    objectType,
    shownSecondObjectType: secondObjectType,
    patternLayout: firstLayout,
    shownSecondPatternLayout: secondLayout,
    options,
    correctOptionId,
    feedback: { correct: "You noticed the amounts!", wrong: "Compare the group shapes again." },
  };
}

export function resetPrepWeek4TaskSessionState() {
  memoryByLesson.clear();
}

export function generatePrepWeek4Task(lessonId: string, difficulty: Difficulty = "easy"): PracticeTask {
  const memory = getMemory(lessonId);
  const mode = getLessonMode(lessonId);
  const rotation = mode === "object_groups" ? lesson2Rotation : lesson1Rotation;
  const gameKind = rotation[memory.cursor % rotation.length]!;
  memory.cursor += 1;

  switch (gameKind) {
    case "flash_dot": return createFlashDotRecognitionTask(lessonId, difficulty);
    case "ten_frame": return createTenFrameQuickLookTask(lessonId, difficulty);
    case "which_card": return createWhichCardMatchesTask(lessonId, difficulty);
    case "memory_flash": return createMemoryFlashTask(lessonId, difficulty);
    case "fast_match": return createFindFastMatchTask(lessonId, difficulty);
    case "subitising_race": return createSubitisingRaceTask(lessonId, difficulty);
    case "dots_to_numbers": return createDotsToNumbersTask(lessonId, difficulty);
    case "ten_frame_match": return createTenFrameMatchTask(lessonId, difficulty);
    case "finger_match": return createFingerPatternMatchTask(lessonId, difficulty);
    case "real_world": return createRealWorldQuickLookTask(lessonId, difficulty);
    case "true_false": return createTrueOrFalseQuickLookTask(lessonId, difficulty);
    case "quick_build": return createQuickBuildTask(lessonId, difficulty);
    case "quick_group_flash": return createQuickGroupFlashTask(lessonId, difficulty);
    case "which_group_matches": return createWhichGroupMatchesTask(lessonId, difficulty);
    case "real_world_quick_look": return createRealWorldQuickLookObjectTask(lessonId, difficulty);
    case "memory_group": return createMemoryGroupTask(lessonId, difficulty);
    case "fast_group_match": return createFastGroupMatchTask(lessonId, difficulty);
    case "ten_frame_objects": return createTenFrameObjectsTask(lessonId, difficulty);
    case "true_false_group": return createTrueOrFalseGroupTask(lessonId, difficulty);
    case "objects_to_numbers": return createObjectsToNumbersTask(lessonId, difficulty);
    case "numbot_quick_eyes": return createNumbotQuickEyesTask(lessonId, difficulty);
    case "build_the_group": return createBuildTheGroupTask(lessonId, difficulty);
    case "group_race": return createGroupRaceTask(lessonId, difficulty);
    case "same_or_different": return createSameOrDifferentTask(lessonId, difficulty);
    default: return createQuickGroupFlashTask(lessonId, difficulty);
  }
}
