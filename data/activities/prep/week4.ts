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

type Week4Memory = {
  cursor: number;
  recentTargets: number[];
  recentObjects: GroundObjectType[];
  recentKinds: string[];
  recentPositions: number[];
  recentLayouts: GroundPatternLayout[];
};

const TARGETS = [1, 2, 3, 4, 5] as const;
const PATTERN_LAYOUTS: GroundPatternLayout[] = ["dice", "ten_frame", "domino", "finger", "symmetry"];
const DOT_ONLY_LAYOUTS: GroundPatternLayout[] = ["dice", "ten_frame", "domino", "finger", "symmetry"];
const REAL_WORLD_OBJECTS: GroundObjectType[] = ["stars", "planets", "energy_orbs", "robot_tokens", "crystals", "gems"];
const rotationPattern = [
  "flash_dot",
  "ten_frame",
  "which_card",
  "memory_flash",
  "fast_match",
  "subitising_race",
  "dots_to_fingers",
  "real_world",
] as const;

const memoryByLesson = new Map<string, Week4Memory>();

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
  if (objectType === "energy_orbs") return "orbs";
  if (objectType === "number_orbs") return "number orbs";
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

function pickTarget(memory: Week4Memory, difficulty: Difficulty) {
  const pool = difficulty === "easy" ? [1, 2, 3] : difficulty === "medium" ? [2, 3, 4, 5] : [...TARGETS];
  const target = chooseRecentSafe(pool, memory.recentTargets);
  pushRecent(memory.recentTargets, target, 4);
  return target;
}

function pickLayout(memory: Week4Memory, allowed: readonly GroundPatternLayout[] = PATTERN_LAYOUTS) {
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

function buildNumeralOptions(target: number, memory: Week4Memory, optionCount = 3) {
  const distractors = shuffle(TARGETS.filter((value) => value !== target)).slice(0, optionCount - 1);
  const correctPosition = chooseAnswerPosition(memory, optionCount);
  const ordered = new Array<number>(optionCount);
  ordered[correctPosition] = target;
  const positions = Array.from({ length: optionCount }, (_, index) => index).filter((index) => index !== correctPosition);
  positions.forEach((position, index) => {
    ordered[position] = distractors[index]!;
  });
  const options = ordered.map((numeral, index) => ({ id: `num-${target}-${index}-${numeral}`, numeral }));
  return {
    options,
    correctOptionId: options[correctPosition]!.id,
  };
}

function buildQuantityOptions(
  target: number,
  memory: Week4Memory,
  objectType: GroundObjectType,
  layout?: GroundPatternLayout,
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
  const options = ordered.map((quantity, index) => ({
    id: `qty-${target}-${index}-${quantity}`,
    kind: "quantity" as const,
    quantity,
    objectType,
    patternLayout: layout ?? pickLayout(memory),
  }));
  return {
    options,
    correctOptionId: options[correctPosition]!.id,
  };
}

function createFlashDotRecognitionTask(lessonId: string, difficulty: Difficulty): GroundFlashTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const layout = pickLayout(memory, DOT_ONLY_LAYOUTS);
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
    revealMs: difficulty === "easy" ? 1150 : difficulty === "medium" ? 900 : 720,
    options,
    correctOptionId,
    feedback: { correct: "Quick spotting!", wrong: "Look again, then recognise it." },
  };
}

function createTenFrameQuickLookTask(lessonId: string, difficulty: Difficulty): GroundFlashTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const { options, correctOptionId } = buildNumeralOptions(target, memory, 3);
  pushRecent(memory.recentKinds, "ten_frame", 4);
  return {
    kind: "groundFlash",
    prompt: "Ten frame quick look",
    speakText: "How many? Don't count. Recognise it.",
    targetNumber: target,
    objectType: "dots",
    patternLayout: "ten_frame",
    revealType: "objects",
    revealMs: difficulty === "easy" ? 1250 : difficulty === "medium" ? 980 : 780,
    options,
    correctOptionId,
    feedback: { correct: "You saw it fast!", wrong: "Trust what you noticed." },
  };
}

function createWhichCardMatchesTask(lessonId: string, difficulty: Difficulty): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const layout = pickLayout(memory);
  const { options, correctOptionId } = buildQuantityOptions(target, memory, "dots", layout, 3);
  pushRecent(memory.recentKinds, "which_card", 4);
  return {
    kind: "groundMatch",
    prompt: `Which one shows ${target}?`,
    speakText: `Which card shows ${numberWord(target)}?`,
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
  const layout = pickLayout(memory);
  const { options, correctOptionId } = buildNumeralOptions(target, memory, 3);
  pushRecent(memory.recentKinds, "memory_flash", 4);
  return {
    kind: "groundFlash",
    prompt: "Remember the pattern",
    speakText: "Look, remember, then tap the number.",
    targetNumber: target,
    objectType: "dots",
    patternLayout: layout,
    revealType: "objects",
    revealMs: difficulty === "easy" ? 1000 : difficulty === "medium" ? 760 : 620,
    promptAfterReveal: "What did you see?",
    options,
    correctOptionId,
    feedback: { correct: "Memory match!", wrong: "Hold the picture in your mind." },
  };
}

function createFindFastMatchTask(lessonId: string, difficulty: Difficulty): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const objectType = pickObject(memory, ["dots", "gems", "stars", "crystals", "number_orbs"]);
  const { options, correctOptionId } = buildQuantityOptions(target, memory, objectType, undefined, 3);
  pushRecent(memory.recentKinds, "fast_match", 4);
  return {
    kind: "groundMatch",
    prompt: "Find the fast match",
    speakText: `Which one shows ${numberWord(target)}?`,
    targetNumber: target,
    targetNumberName: numberWord(target),
    visualType: "ground-quantity-card",
    promptType: "numeral_to_group",
    shownNumeral: target,
    objectType,
    options,
    correctOptionId,
    feedback: { correct: "Fast spotting!", wrong: "Notice the pattern, not one-by-one counting." },
  };
}

function createSubitisingRaceTask(lessonId: string, difficulty: Difficulty): GroundFlashTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const layout = pickLayout(memory);
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
    revealMs: difficulty === "easy" ? 900 : difficulty === "medium" ? 680 : 560,
    options,
    correctOptionId,
    feedback: { correct: "FAST SPOTTING!", wrong: "Blink and spot it again." },
  };
}

function createDotsToFingersTask(lessonId: string, difficulty: Difficulty): GroundMatchTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const { options, correctOptionId } = buildNumeralOptions(target, memory, 3);
  pushRecent(memory.recentKinds, "dots_to_fingers", 4);
  return {
    kind: "groundMatch",
    prompt: "Quick fingers!",
    speakText: "How many instantly?",
    targetNumber: target,
    targetNumberName: numberWord(target),
    visualType: "ground-quantity-card",
    promptType: "group_to_numeral",
    shownQuantity: target,
    objectType: "dots",
    patternLayout: "finger",
    options: options.map((option) => ({ id: option.id, kind: "numeral" as const, numeral: option.numeral })),
    correctOptionId,
    feedback: { correct: "You noticed it quickly!", wrong: "See the pattern as a whole." },
  };
}

function createRealWorldQuickLookTask(lessonId: string, difficulty: Difficulty): GroundFlashTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const objectType = pickObject(memory, REAL_WORLD_OBJECTS);
  const layout = pickLayout(memory, ["dice", "domino", "symmetry"]);
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
    revealMs: difficulty === "easy" ? 1050 : difficulty === "medium" ? 820 : 700,
    options,
    correctOptionId,
    feedback: { correct: "Amazing noticing!", wrong: "Look at the whole shape first." },
  };
}

export function resetPrepWeek4TaskSessionState() {
  memoryByLesson.clear();
}

export function generatePrepWeek4Task(lessonId: string, difficulty: Difficulty = "easy"): PracticeTask {
  const memory = getMemory(lessonId);
  const gameKind = rotationPattern[memory.cursor % rotationPattern.length]!;
  memory.cursor += 1;

  switch (gameKind) {
    case "flash_dot": return createFlashDotRecognitionTask(lessonId, difficulty);
    case "ten_frame": return createTenFrameQuickLookTask(lessonId, difficulty);
    case "which_card": return createWhichCardMatchesTask(lessonId, difficulty);
    case "memory_flash": return createMemoryFlashTask(lessonId, difficulty);
    case "fast_match": return createFindFastMatchTask(lessonId, difficulty);
    case "subitising_race": return createSubitisingRaceTask(lessonId, difficulty);
    case "dots_to_fingers": return createDotsToFingersTask(lessonId, difficulty);
    case "real_world": return createRealWorldQuickLookTask(lessonId, difficulty);
    default: return createFlashDotRecognitionTask(lessonId, difficulty);
  }
}
