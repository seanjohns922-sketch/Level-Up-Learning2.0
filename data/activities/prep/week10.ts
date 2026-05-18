import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

type GroundObjectType = Extract<PracticeTask, { kind: "groundBuild" }>['objectType'];
type GroundPatternLayout = NonNullable<Extract<PracticeTask, { kind: "groundFlash" }>['patternLayout']>;
type GroundMatchTask = Extract<PracticeTask, { kind: "groundMatch" }>;
type GroundCompareTask = Extract<PracticeTask, { kind: "groundCompare" }>;
type GroundFlashTask = Extract<PracticeTask, { kind: "groundFlash" }>;
type GroundHuntTask = Extract<PracticeTask, { kind: "groundHunt" }>;
type GroundSequenceTask = Extract<PracticeTask, { kind: "groundSequence" }>;
type GroundBuildTask = Extract<PracticeTask, { kind: "groundBuild" }>;
type GroundOrderTapTask = Extract<PracticeTask, { kind: "groundOrderTap" }>;
type GroundOrdinalTask = Extract<PracticeTask, { kind: "groundOrdinal" }>;
type GroundSpatialTask = Extract<PracticeTask, { kind: "groundSpatial" }>;

type Week10Kind =
  | "tap_number"
  | "match_collection"
  | "quick_count_flash"
  | "find_biggest"
  | "find_smallest"
  | "number_path_rush"
  | "who_is_first"
  | "what_comes_next"
  | "which_group_more"
  | "build_number"
  | "before_or_after"
  | "teen_number_match"
  | "position_pop"
  | "order_numbers"
  | "arcade_bonus";

type Week10Memory = {
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
  "rockets",
  "number_orbs",
];
const ROTATION: Week10Kind[] = [
  "tap_number",
  "match_collection",
  "quick_count_flash",
  "find_biggest",
  "find_smallest",
  "number_path_rush",
  "who_is_first",
  "what_comes_next",
  "which_group_more",
  "build_number",
  "before_or_after",
  "teen_number_match",
  "position_pop",
  "order_numbers",
  "arcade_bonus",
];
const memoryByLesson = new Map<string, Week10Memory>();

function getMemory(lessonId: string) {
  const existing = memoryByLesson.get(lessonId);
  if (existing) return existing;
  const created: Week10Memory = {
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
    "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
  ];
  return words[value] ?? String(value);
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

function stageTargets(memory: Week10Memory, difficulty: Difficulty) {
  if (difficulty === "easy") {
    if (memory.cursor < 5) return [6, 7, 8, 9, 10, 11, 12];
    if (memory.cursor < 11) return [10, 11, 12, 13, 14, 15, 16];
    return [12, 13, 14, 15, 16, 17, 18, 19, 20];
  }
  if (difficulty === "medium") return [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  return [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
}

function pickTarget(memory: Week10Memory, difficulty: Difficulty) {
  const target = chooseRecentSafe(stageTargets(memory, difficulty), memory.recentTargets);
  pushRecent(memory.recentTargets, target, 6);
  return target;
}

function pickObject(memory: Week10Memory, preferred?: GroundObjectType[]) {
  const objectType = chooseRecentSafe(preferred ?? OBJECTS, memory.recentObjects);
  pushRecent(memory.recentObjects, objectType, 6);
  return objectType;
}

function pickLayout(memory: Week10Memory, preferred?: GroundPatternLayout[]) {
  const pool: GroundPatternLayout[] = preferred ?? ["dice", "domino", "symmetry", "ten_frame"];
  const layout = chooseRecentSafe(pool, memory.recentLayouts);
  pushRecent(memory.recentLayouts, layout, 6);
  return layout;
}

function chooseAnswerPosition(memory: Week10Memory, optionCount: number) {
  const position = chooseRecentSafe(Array.from({ length: optionCount }, (_, index) => index), memory.recentPositions);
  pushRecent(memory.recentPositions, position, 5);
  return position;
}

function numeralOptions(target: number, memory: Week10Memory, optionCount = 4) {
  const nearby = shuffle(
    Array.from({ length: 21 }, (_, index) => index).filter((value) => value !== target && Math.abs(value - target) <= 3)
  );
  const fallback = shuffle(Array.from({ length: 21 }, (_, index) => index).filter((value) => value !== target));
  const distractors = (nearby.length >= optionCount - 1 ? nearby : fallback).slice(0, optionCount - 1);
  const correctPosition = chooseAnswerPosition(memory, optionCount);
  const ordered = new Array<number>(optionCount);
  ordered[correctPosition] = target;
  const positions = Array.from({ length: optionCount }, (_, index) => index).filter((index) => index !== correctPosition);
  positions.forEach((position, index) => {
    ordered[position] = distractors[index]!;
  });
  return ordered.map((numeral, index) => ({ id: `n-${target}-${index}-${numeral}`, numeral }));
}

function makeMatchTask(task: Omit<GroundMatchTask, "kind">): PracticeTask {
  return { kind: "groundMatch", ...task };
}

function makeCompareTask(task: Omit<GroundCompareTask, "kind">): PracticeTask {
  return { kind: "groundCompare", ...task };
}

function makeFlashTask(task: Omit<GroundFlashTask, "kind">): PracticeTask {
  return { kind: "groundFlash", ...task };
}

function makeHuntTask(task: Omit<GroundHuntTask, "kind">): PracticeTask {
  return { kind: "groundHunt", ...task };
}

function makeSequenceTask(task: Omit<GroundSequenceTask, "kind">): PracticeTask {
  return { kind: "groundSequence", ...task };
}

function makeBuildTask(task: Omit<GroundBuildTask, "kind">): PracticeTask {
  return { kind: "groundBuild", ...task };
}

function makeOrderTapTask(task: Omit<GroundOrderTapTask, "kind">): PracticeTask {
  return { kind: "groundOrderTap", ...task };
}

function makeOrdinalTask(task: Omit<GroundOrdinalTask, "kind">): PracticeTask {
  return { kind: "groundOrdinal", ...task };
}

function makeSpatialTask(task: Omit<GroundSpatialTask, "kind">): PracticeTask {
  return { kind: "groundSpatial", ...task };
}

function createTapNumberTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const tiles = numeralOptions(target, memory, difficulty === "easy" ? 4 : 6).map((option) => ({
    id: option.id,
    numeral: option.numeral,
    isTarget: option.numeral === target,
  }));
  return makeHuntTask({
    prompt: `Tap ${target}.`,
    speakText: `Tap ${numberWord(target)}.`,
    introPrompt: "Arcade round!",
    targetNumber: target,
    tiles,
    feedback: { correct: "Quick thinking!", wrong: "Try the target number again." },
  });
}

function createMatchCollectionTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const objectType = pickObject(memory);
  const options = numeralOptions(target, memory, 3).map((option) => ({ id: option.id, kind: "numeral" as const, numeral: option.numeral }));
  return makeMatchTask({
    prompt: "Match the collection.",
    speakText: "Match the collection.",
    introPrompt: "Arcade round!",
    targetNumber: target,
    visualType: "ground-quantity-card",
    promptType: "group_to_numeral",
    objectType,
    patternLayout: pickLayout(memory, target >= 10 ? ["ten_frame", "symmetry"] : undefined),
    shownQuantity: target,
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "Matched!", wrong: "Look at the quantity again." },
  });
}

function createQuickCountFlashTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const options = numeralOptions(target, memory, 3);
  return makeFlashTask({
    prompt: "Quick count flash!",
    speakText: "Quick count flash!",
    introPrompt: "Watch fast.",
    targetNumber: target,
    objectType: pickObject(memory),
    patternLayout: pickLayout(memory, target >= 10 ? ["ten_frame", "symmetry"] : ["dice", "domino", "symmetry"]),
    revealType: "objects",
    revealMs: difficulty === "easy" ? 1500 : difficulty === "medium" ? 1200 : 900,
    promptAfterReveal: "How many did you see?",
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "Arcade bonus!", wrong: "Try the flash count again." },
  });
}

function compareGroups(targetA: number, targetB: number, memory: Week10Memory) {
  return [
    { id: `g-a-${targetA}`, quantity: targetA, objectType: pickObject(memory), patternLayout: pickLayout(memory) },
    { id: `g-b-${targetB}`, quantity: targetB, objectType: pickObject(memory), patternLayout: pickLayout(memory) },
  ];
}

function createFindBiggestTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const a = pickTarget(memory, difficulty);
  const b = Math.min(20, a + randInt(1, 3));
  const c = Math.max(0, a - randInt(1, 2));
  const groups = shuffle(compareGroups(a, b, memory).concat([{ id: `g-c-${c}`, quantity: c, objectType: pickObject(memory), patternLayout: pickLayout(memory) }]));
  const correct = groups.reduce((best, group) => (group.quantity > best.quantity ? group : best), groups[0]!);
  return makeCompareTask({
    prompt: "Which number is biggest?",
    speakText: "Which number is biggest?",
    introPrompt: "Arcade round!",
    targetNumber: correct.quantity,
    comparisonType: "biggest",
    helperVariant: "flash",
    groups,
    correctGroupId: correct.id,
    feedback: { correct: "You found the biggest!", wrong: "Compare the groups again." },
  });
}

function createFindSmallestTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const a = pickTarget(memory, difficulty);
  const b = Math.min(20, a + randInt(1, 3));
  const c = Math.max(0, a - randInt(1, 2));
  const groups = shuffle(compareGroups(a, b, memory).concat([{ id: `g-c-${c}`, quantity: c, objectType: pickObject(memory), patternLayout: pickLayout(memory) }]));
  const correct = groups.reduce((best, group) => (group.quantity < best.quantity ? group : best), groups[0]!);
  return makeCompareTask({
    prompt: "Which number is smallest?",
    speakText: "Which number is smallest?",
    introPrompt: "Arcade round!",
    targetNumber: correct.quantity,
    comparisonType: "smallest",
    helperVariant: "flash",
    groups,
    correctGroupId: correct.id,
    feedback: { correct: "Smallest spotted!", wrong: "Compare the groups again." },
  });
}

function createNumberPathRushTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const start = Math.max(0, pickTarget(memory, difficulty) - 3);
  const target = start + 3;
  const options = numeralOptions(target, memory, 3);
  return makeSequenceTask({
    prompt: "Number path rush!",
    speakText: "Number path rush!",
    introPrompt: "Keep going.",
    targetNumber: target,
    sequence: [start, start + 1, start + 2, "__"],
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "Path complete!", wrong: "Count on quickly." },
  });
}

function createWhoIsFirstTask(): PracticeTask {
  const characters = shuffle([
    { id: "numbot", label: "Numbot", emoji: "🤖" },
    { id: "alien", label: "Alien", emoji: "👽" },
    { id: "rocket", label: "Rocket", emoji: "🚀" },
    { id: "pod", label: "Hover Pod", emoji: "🛸" },
  ]);
  const order = characters.map((character) => character.id);
  return makeOrdinalTask({
    prompt: "Who is first?",
    speakText: "Who is first?",
    introPrompt: "Ordinal pop!",
    targetNumber: 1,
    badgeLabel: "Ordinal Pop",
    scenario: "queue",
    mode: "identify",
    characters,
    order,
    targetPosition: 1,
    feedback: { correct: "Position found!", wrong: "Look at the first spot." },
  });
}

function createWhatComesNextTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const start = Math.max(0, pickTarget(memory, difficulty) - 2);
  const target = start + 3;
  const options = numeralOptions(target, memory, 3);
  return makeSequenceTask({
    prompt: "What comes next?",
    speakText: "What comes next?",
    introPrompt: "Arcade round!",
    targetNumber: target,
    sequence: [start, start + 1, start + 2, "__"],
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "Sequence solved!", wrong: "Count on one more." },
  });
}

function createWhichGroupMoreTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const lower = pickTarget(memory, difficulty);
  const higher = Math.min(20, lower + randInt(1, 4));
  const groups = shuffle(compareGroups(lower, higher, memory));
  const correct = groups.find((group) => group.quantity === higher)!;
  return makeCompareTask({
    prompt: "Which group has more?",
    speakText: "Which group has more?",
    introPrompt: "Compare fast.",
    targetNumber: higher,
    comparisonType: "more",
    helperVariant: "battle",
    referenceGroup: { quantity: lower, objectType: groups[0]!.objectType, patternLayout: groups[0]!.patternLayout },
    groups,
    correctGroupId: correct.id,
    feedback: { correct: "More found!", wrong: "Check which group has extra objects." },
  });
}

function createBuildNumberTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  return makeBuildTask({
    prompt: `Build ${target}.`,
    speakText: `Build ${numberWord(target)}.`,
    introPrompt: "Arcade build!",
    targetNumber: target,
    objectType: pickObject(memory),
    maxBuild: 20,
    buildMode: target <= 10 ? "single" : "split",
    showExample: false,
    feedback: { correct: "Built!", wrong: "Try the target number again." },
  });
}

function createBeforeOrAfterTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const base = pickTarget(memory, difficulty);
  const askBefore = randInt(0, 1) === 0;
  const target = askBefore ? Math.max(0, base - 1) : Math.min(20, base + 1);
  const options = numeralOptions(target, memory, 3);
  return makeSequenceTask({
    prompt: askBefore ? `What comes before ${base}?` : `What comes after ${base}?`,
    speakText: askBefore ? `What comes before ${numberWord(base)}?` : `What comes after ${numberWord(base)}?`,
    introPrompt: "Quick answer.",
    targetNumber: target,
    sequence: askBefore ? [target, "__", base] : [base, "__", target],
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "Nice and quick!", wrong: "Check the number next to it." },
  });
}

function createTeenNumberMatchTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = Math.max(11, pickTarget(memory, difficulty));
  const options = numeralOptions(target, memory, 3).map((option) => ({ id: option.id, kind: "numeral" as const, numeral: option.numeral }));
  return makeMatchTask({
    prompt: "Teen number match.",
    speakText: "Teen number match.",
    introPrompt: "Arcade round!",
    targetNumber: target,
    visualType: "ground-quantity-card",
    promptType: "group_to_numeral",
    objectType: pickObject(memory, ["energy_orbs", "crystals", "number_orbs"]),
    patternLayout: "ten_frame",
    shownQuantity: target,
    shownNumeral: 10,
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "Teen number matched!", wrong: "Think ten and some more." },
  });
}

function createPositionPopTask(): PracticeTask {
  const slots = [
    { id: "row-1", label: "Spot 1", row: 0, col: 0 },
    { id: "row-2", label: "Spot 2", row: 0, col: 1 },
    { id: "row-3", label: "Spot 3", row: 0, col: 2 },
    { id: "row-4", label: "Spot 4", row: 0, col: 3 },
  ];
  const characters = [
    { id: "numbot", label: "Numbot", emoji: "🤖" },
    { id: "alien", label: "Alien", emoji: "👽" },
    { id: "rocket", label: "Rocket", emoji: "🚀" },
    { id: "crystal", label: "Crystal", emoji: "💠" },
  ];
  const placementBySlot = {
    "row-1": "alien",
    "row-2": "numbot",
    "row-3": "rocket",
    "row-4": "crystal",
  };
  return makeSpatialTask({
    prompt: "Tap the object beside Numbot.",
    speakText: "Tap the object beside Numbot.",
    badgeLabel: "Position Pop",
    scenario: "lab",
    mode: "identify",
    characters,
    slots,
    placementBySlot,
    targetCharacterId: "rocket",
    feedback: { correct: "Position pop!", wrong: "Check what is right next to Numbot." },
  });
}

function createOrderNumbersTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const start = Math.max(0, pickTarget(memory, difficulty) - 2);
  const numerals = shuffle([start, start + 1, start + 2, start + 3]).slice(0, difficulty === "easy" ? 3 : 4);
  const ordered = [...numerals].sort((a, b) => a - b);
  return makeOrderTapTask({
    prompt: "Order the numbers.",
    speakText: "Order the numbers.",
    introPrompt: "Sort fast.",
    targetNumber: ordered.length,
    uiMode: "order",
    direction: "ASC",
    badgeLabel: "Arcade Sort",
    pathNumerals: ordered,
    tiles: numerals.map((numeral, index) => ({ id: `o-${index}-${numeral}`, numeral })),
    feedback: { correct: "Sorted!", wrong: "Try the order again." },
  });
}

function createArcadeBonusTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  const options: GroundMatchTask["options"] = numeralOptions(target, memory, 3).map((option) => ({
    id: option.id,
    kind: "pair" as const,
    pairNumeral: option.numeral,
    pairQuantity: option.numeral,
    pairWord: numberWord(option.numeral),
    pairParts: option.numeral >= 10 ? [10, option.numeral - 10] : [Math.max(1, option.numeral - 1), 1],
    pairPartObjectTypes: [pickObject(memory), pickObject(memory)],
    pairPartLayouts: ["ten_frame", option.numeral >= 10 ? "ten_frame" : pickLayout(memory)],
  }));
  return makeMatchTask({
    prompt: "Arcade bonus round! Match it all.",
    speakText: "Arcade bonus round! Match it all.",
    introPrompt: "Bonus round!",
    targetNumber: target,
    visualType: "ground-flash-match-card",
    promptType: "match_pair",
    shownQuantity: target,
    objectType: pickObject(memory),
    patternLayout: target >= 10 ? "ten_frame" : pickLayout(memory),
    shownNumeral: target,
    options,
    correctOptionId: options.find((option) => option.pairNumeral === target)!.id,
    feedback: { correct: "Arcade bonus!", wrong: "Check the matching number pair." },
  });
}

function nextKind(memory: Week10Memory) {
  const kind = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  pushRecent(memory.recentKinds, kind, 6);
  return kind;
}

function generateLesson1Task(lessonId: string, difficulty: Difficulty, kind: Week10Kind): PracticeTask {
  switch (kind) {
    case "tap_number":
      return createTapNumberTask(lessonId, difficulty);
    case "match_collection":
      return createMatchCollectionTask(lessonId, difficulty);
    case "quick_count_flash":
      return createQuickCountFlashTask(lessonId, difficulty);
    case "find_biggest":
      return createFindBiggestTask(lessonId, difficulty);
    case "find_smallest":
      return createFindSmallestTask(lessonId, difficulty);
    case "number_path_rush":
      return createNumberPathRushTask(lessonId, difficulty);
    case "who_is_first":
      return createWhoIsFirstTask();
    case "what_comes_next":
      return createWhatComesNextTask(lessonId, difficulty);
    case "which_group_more":
      return createWhichGroupMoreTask(lessonId, difficulty);
    case "build_number":
      return createBuildNumberTask(lessonId, difficulty);
    case "before_or_after":
      return createBeforeOrAfterTask(lessonId, difficulty);
    case "teen_number_match":
      return createTeenNumberMatchTask(lessonId, difficulty);
    case "position_pop":
      return createPositionPopTask();
    case "order_numbers":
      return createOrderNumbersTask(lessonId, difficulty);
    case "arcade_bonus":
      return createArcadeBonusTask(lessonId, difficulty);
  }
}

export function generatePrepWeek10Task(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const kind = nextKind(memory);
  return generateLesson1Task(lessonId, difficulty, kind);
}

export function resetPrepWeek10TaskSessionState() {
  memoryByLesson.clear();
}
