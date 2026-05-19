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
type BuildVisualStyle = NonNullable<GroundBuildTask["visualStyle"]>;
type CompareVisualStyle = NonNullable<GroundCompareTask["visualStyle"]>;

type Lesson1Kind =
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
  recentVisuals: string[];
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
const LESSON1_ROTATION: Lesson1Kind[] = [
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
    recentVisuals: [],
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

function pickVisualStyle<T extends string>(memory: Week10Memory, pool: readonly T[]) {
  const visual = chooseRecentSafe(pool, memory.recentVisuals as T[]);
  pushRecent(memory.recentVisuals, visual, 6);
  return visual;
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

const ORDINAL_CHARACTERS: GroundOrdinalTask["characters"] = [
  { id: "numbot", label: "Numbot", emoji: "🤖" },
  { id: "alien", label: "Alien", emoji: "👽" },
  { id: "rocket", label: "Rocket", emoji: "🚀" },
  { id: "pod", label: "Hover Pod", emoji: "🛸" },
  { id: "runner", label: "Runner", emoji: "🏃" },
  { id: "crystal", label: "Crystal", emoji: "💠" },
];

type Lesson2Kind =
  | "count_bot"
  | "teen_titan"
  | "order_master"
  | "position_phantom"
  | "race_commander"
  | "path_breaker"
  | "biggest_blaster"
  | "match_machine"
  | "combo_round"
  | "final_boss_round";

const LESSON2_ROTATION: Lesson2Kind[] = [
  "count_bot",
  "teen_titan",
  "order_master",
  "position_phantom",
  "race_commander",
  "path_breaker",
  "biggest_blaster",
  "match_machine",
  "combo_round",
  "final_boss_round",
];


type Lesson3Kind =
  | "build_number_lab"
  | "which_has_more"
  | "which_has_less"
  | "make_equal"
  | "build_same_amount"
  | "more_or_less_than_ten"
  | "teen_builder"
  | "balance_groups"
  | "match_collection_lab"
  | "which_is_bigger"
  | "build_missing_part"
  | "sort_groups"
  | "quick_build_flash"
  | "same_or_different"
  | "nexus_build_challenge";

const LESSON3_ROTATION: Lesson3Kind[] = [
  "build_number_lab",
  "which_has_more",
  "which_has_less",
  "make_equal",
  "build_same_amount",
  "more_or_less_than_ten",
  "teen_builder",
  "balance_groups",
  "match_collection_lab",
  "which_is_bigger",
  "build_missing_part",
  "sort_groups",
  "quick_build_flash",
  "same_or_different",
  "nexus_build_challenge",
];

const BUILD_VISUALS: BuildVisualStyle[] = [
  "double_ten_frame",
  "energy_cell_grid",
  "build_trays",
  "crate_system",
  "reactor_cells",
  "stacked_groups",
  "collection_shelves",
];

const COMPARE_VISUALS: CompareVisualStyle[] = [
  "balance_panels",
  "reactor_cells",
  "collection_shelves",
  "crate_system",
  "double_ten_frame",
  "energy_cell_grid",
  "stacked_groups",
];

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
  const visualStyle = pickVisualStyle(memory, BUILD_VISUALS);
  return makeBuildTask({
    prompt: `Build ${target}.`,
    speakText: `Build ${numberWord(target)}.`,
    introPrompt: "Arcade build!",
    targetNumber: target,
    objectType: pickObject(memory),
    maxBuild: 20,
    visualStyle,
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

function nextKind<T extends string>(memory: Week10Memory, rotation: readonly T[]) {
  const kind = rotation[memory.cursor % rotation.length]!;
  memory.cursor += 1;
  pushRecent(memory.recentKinds, kind, 6);
  return kind;
}

function generateLesson1Task(lessonId: string, difficulty: Difficulty, kind: Lesson1Kind): PracticeTask {
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

function makeCompareGroup(memory: Week10Memory, quantity: number, layout?: GroundPatternLayout): GroundCompareTask["groups"][number] {
  return {
    id: `compare-${quantity}-${pickObject(memory)}-${Math.random().toString(36).slice(2, 7)}`,
    quantity,
    objectType: pickObject(memory),
    patternLayout: layout ?? pickLayout(memory, quantity >= 10 ? ["ten_frame", "symmetry"] : undefined),
  };
}

function createBuildReferenceTask(
  lessonId: string,
  difficulty: Difficulty,
  { prompt, speakText, target, objectType, startingBuilt = 0, visualStyle, feedback }: {
    prompt: string;
    speakText: string;
    target?: number;
    objectType?: GroundObjectType;
    startingBuilt?: number;
    visualStyle?: BuildVisualStyle;
    feedback: { correct: string; wrong: string };
  }
): PracticeTask {
  const memory = getMemory(lessonId);
  const total = target ?? pickTarget(memory, difficulty);
  const safeStart = Math.min(startingBuilt, total);
  return makeBuildTask({
    prompt,
    speakText,
    introPrompt: "Builder lab!",
    targetNumber: total,
    objectType: objectType ?? pickObject(memory),
    compareMode: "exact",
    visualStyle,
    maxBuild: 20,
    startingBuilt: safeStart,
    referenceGroup: {
      quantity: total,
      objectType: pickObject(memory),
      patternLayout: total >= 10 ? "ten_frame" : pickLayout(memory),
    },
    buildMode: total >= 11 ? "split" : "single",
    showExample: false,
    feedback,
  });
}

function createWhichHasLessTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const visualStyle = pickVisualStyle(memory, COMPARE_VISUALS);
  const lower = pickTarget(memory, difficulty);
  const higher = Math.min(20, lower + randInt(1, 3));
  const groups = shuffle([makeCompareGroup(memory, lower), makeCompareGroup(memory, higher)]);
  const correct = groups.find((group) => group.quantity === lower)!;
  return makeCompareTask({
    prompt: "Which group has less?",
    speakText: "Which group has less?",
    introPrompt: "Builder lab!",
    targetNumber: lower,
    comparisonType: "less",
    helperVariant: "battle",
    visualStyle,
    referenceGroup: { quantity: higher, objectType: groups[0]!.objectType, patternLayout: groups[0]!.patternLayout },
    groups,
    correctGroupId: correct.id,
    feedback: { correct: "Great comparing!", wrong: "Look for the smaller group." },
  });
}

function createMoreOrLessThanTenTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const visualStyle = pickVisualStyle(memory, ["double_ten_frame", "energy_cell_grid", "reactor_cells"] as const);
  const pool = difficulty === "easy" ? [8, 9, 11, 12] : difficulty === "medium" ? [8, 9, 11, 12, 13, 14] : [7, 8, 9, 11, 12, 13, 14, 15];
  const target = chooseRecentSafe(pool, memory.recentTargets);
  pushRecent(memory.recentTargets, target, 6);
  const asksMore = Math.random() < 0.5;
  return makeCompareTask({
    prompt: asksMore ? "Is this group more than 10?" : "Is this group less than 10?",
    speakText: asksMore ? "Is this group more than 10?" : "Is this group less than 10?",
    introPrompt: "Builder lab!",
    targetNumber: target,
    comparisonType: "statement",
    visualStyle,
    statementRelation: asksMore ? "more" : "less",
    groups: [
      { id: `compare-ten-target-${target}`, quantity: target, objectType: pickObject(memory), patternLayout: target >= 10 ? "ten_frame" : pickLayout(memory) },
      { id: `compare-ten-base-10`, quantity: 10, objectType: pickObject(memory), patternLayout: "ten_frame" },
    ],
    feedback: { correct: "You compared it carefully!", wrong: "Compare the group to 10 again." },
  });
}

function createTeenBuilderTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const visualStyle = pickVisualStyle(memory, ["double_ten_frame", "energy_cell_grid", "reactor_cells"] as const);
  const teen = Math.max(11, pickTarget(memory, difficulty));
  return makeBuildTask({
    prompt: `Build ${teen}.`,
    speakText: `Build ${numberWord(teen)}.`,
    introPrompt: "Teen builder!",
    targetNumber: teen,
    objectType: pickObject(memory, ["energy_orbs", "crystals", "number_orbs"]),
    maxBuild: 20,
    visualStyle,
    buildMode: "split",
    showExample: false,
    splitPartLayouts: ["ten_frame", teen - 10 >= 6 ? "ten_frame" : "symmetry"],
    feedback: { correct: `You built ${teen}!`, wrong: "Use a full ten and the extras." },
  });
}

function createSortGroupsTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const visualStyle = pickVisualStyle(memory, COMPARE_VISUALS);
  const start = difficulty === "easy" ? randInt(6, 10) : difficulty === "medium" ? randInt(10, 14) : randInt(12, 16);
  const values = [start, Math.min(20, start + 1), Math.min(20, start + 3)];
  const groups = shuffle(values).map((quantity, index) => ({
    id: `builder-order-${lessonId}-${index}-${quantity}`,
    quantity,
    objectType: pickObject(memory),
    patternLayout: quantity >= 10 ? "ten_frame" as const : pickLayout(memory),
  }));
  return makeCompareTask({
    prompt: "Sort the groups from least to greatest.",
    speakText: "Sort the groups from least to greatest.",
    introPrompt: "Builder lab!",
    targetNumber: values[values.length - 1]!,
    comparisonType: "order",
    visualStyle,
    groups,
    correctOrderIds: [...groups].sort((a, b) => a.quantity - b.quantity).map((group) => group.id),
    orderDirection: "ASC",
    feedback: { correct: "You sorted the groups!", wrong: "Start with the smallest group." },
  });
}

function createSameOrDifferentTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const visualStyle = pickVisualStyle(memory, COMPARE_VISUALS);
  const base = pickTarget(memory, difficulty);
  const same = Math.random() < 0.5;
  const otherPool = Array.from({ length: 21 }, (_, index) => index).filter((value) => value !== base && Math.abs(value - base) <= 2);
  const other = same ? base : chooseRecentSafe(otherPool, memory.recentTargets);
  pushRecent(memory.recentTargets, other, 6);
  return makeCompareTask({
    prompt: "Do these groups show the same amount?",
    speakText: "Do these groups show the same amount?",
    introPrompt: "Builder lab!",
    targetNumber: base,
    comparisonType: "equal",
    visualStyle,
    helperVariant: base >= 10 ? "ten_frame" : "flash",
    groups: [
      { id: `same-a-${base}`, quantity: base, objectType: pickObject(memory), patternLayout: base >= 10 ? "ten_frame" : pickLayout(memory) },
      { id: `same-b-${other}`, quantity: other, objectType: pickObject(memory), patternLayout: other >= 10 ? "ten_frame" : pickLayout(memory) },
    ],
    feedback: { correct: same ? "Yes, they match!" : "Correct, they are different!", wrong: "Check both groups carefully." },
  });
}

function generateLesson3Task(lessonId: string, difficulty: Difficulty, kind: Lesson3Kind): PracticeTask {
  const memory = getMemory(lessonId);
  switch (kind) {
    case "build_number_lab":
      {
        const visualStyle = pickVisualStyle(memory, BUILD_VISUALS);
        const task = createBuildNumberTask(lessonId, difficulty) as GroundBuildTask;
        return { ...task, visualStyle, prompt: `Build ${task.targetNumber}.`, speakText: `Build ${numberWord(task.targetNumber)}.`, introPrompt: "Builder lab!", feedback: { correct: "You built the perfect amount!", wrong: "Build the target quantity." } };
      }
    case "which_has_more":
      {
        const visualStyle = pickVisualStyle(memory, COMPARE_VISUALS);
        return { ...(createWhichGroupMoreTask(lessonId, difficulty) as GroundCompareTask), visualStyle, prompt: "Which group has more?", speakText: "Which group has more?", introPrompt: "Builder lab!", feedback: { correct: "Great comparing!", wrong: "Look for the larger group." } };
      }
    case "which_has_less":
      return createWhichHasLessTask(lessonId, difficulty);
    case "make_equal":
      {
        const target = pickTarget(memory, difficulty);
        const visualStyle = pickVisualStyle(memory, ["reactor_cells", "collection_shelves", "build_trays", "double_ten_frame"] as const);
        return createBuildReferenceTask(lessonId, difficulty, { prompt: "Make the groups equal.", speakText: "Make the groups equal.", target, visualStyle, startingBuilt: Math.max(0, target - randInt(1, 3)), feedback: { correct: "You made them equal!", wrong: "Match the first group." } });
      }
    case "build_same_amount":
      return createBuildReferenceTask(lessonId, difficulty, { prompt: "Build the same amount.", speakText: "Build the same amount.", visualStyle: pickVisualStyle(memory, BUILD_VISUALS), feedback: { correct: "You matched the amount!", wrong: "Build the same amount as the first group." } });
    case "more_or_less_than_ten":
      return createMoreOrLessThanTenTask(lessonId, difficulty);
    case "teen_builder":
      return createTeenBuilderTask(lessonId, difficulty);
    case "balance_groups":
      {
        const target = pickTarget(memory, difficulty);
        return createBuildReferenceTask(lessonId, difficulty, { prompt: "Balance the groups.", speakText: "Balance the groups.", target, visualStyle: pickVisualStyle(memory, ["reactor_cells", "collection_shelves", "double_ten_frame"] as const), startingBuilt: Math.max(0, target - randInt(2, 4)), feedback: { correct: "You balanced the groups!", wrong: "Make both groups show the same amount." } });
      }
    case "match_collection_lab":
      return { ...(createMatchCollectionTask(lessonId, difficulty) as GroundMatchTask), prompt: "Match the collection.", speakText: "Match the collection.", introPrompt: "Builder lab!", feedback: { correct: "Collection matched!", wrong: "Check the quantity again." } };
    case "which_is_bigger":
      {
        const visualStyle = pickVisualStyle(memory, COMPARE_VISUALS);
        return { ...(createFindBiggestTask(lessonId, difficulty) as GroundCompareTask), visualStyle, prompt: "Which quantity is bigger?", speakText: "Which quantity is bigger?", introPrompt: "Builder lab!", feedback: { correct: "Great comparing!", wrong: "Look for the bigger quantity." } };
      }
    case "build_missing_part":
      {
        const target = Math.max(11, pickTarget(memory, difficulty));
        const built = Math.max(1, target - randInt(2, 5));
        return makeBuildTask({ prompt: `Add more to make ${target}.`, speakText: `Add more to make ${numberWord(target)}.`, introPrompt: "Builder lab!", targetNumber: target, objectType: pickObject(memory), maxBuild: 20, visualStyle: pickVisualStyle(memory, ["double_ten_frame", "energy_cell_grid", "reactor_cells"] as const), startingBuilt: built, compareMode: "exact", buildMode: target >= 11 ? "split" : "single", showExample: false, feedback: { correct: "You built the missing part!", wrong: "Add the missing amount." } });
      }
    case "sort_groups":
      return createSortGroupsTask(lessonId, difficulty);
    case "quick_build_flash":
      {
        const target = pickTarget(memory, difficulty);
        return makeBuildTask({ prompt: `Quick build! Make ${target}.`, speakText: `Quick build. Make ${numberWord(target)}.`, introPrompt: "Quick build!", targetNumber: target, objectType: pickObject(memory), maxBuild: 20, visualStyle: pickVisualStyle(memory, BUILD_VISUALS), buildMode: target >= 11 ? "split" : "single", showExample: false, feedback: { correct: "Quick build complete!", wrong: "Build the target quickly and carefully." } });
      }
    case "same_or_different":
      return createSameOrDifferentTask(lessonId, difficulty);
    case "nexus_build_challenge":
      {
        const target = Math.max(12, pickTarget(memory, difficulty));
        return createBuildReferenceTask(lessonId, difficulty, { prompt: `Nexus Build Challenge: Build ${target} to match the lab.`, speakText: `Nexus Build Challenge. Build ${numberWord(target)} to match the lab.`, target, visualStyle: pickVisualStyle(memory, BUILD_VISUALS), startingBuilt: Math.max(0, target - randInt(1, 4)), feedback: { correct: "Nexus Build Challenge complete!", wrong: "Build and match the lab amount." } });
      }
  }
}

function createTapNumberQuizTask(lessonId: string): PracticeTask {
  const task = createTapNumberTask(lessonId, "easy") as GroundHuntTask;
  return {
    ...task,
    introPrompt: "Take your time.",
    feedback: { correct: "Quick thinking!", wrong: "Try the target number again." },
  };
}

function createCountBotQuizTask(lessonId: string): PracticeTask {
  const task = createCountBotBossTask(lessonId, "easy") as GroundFlashTask;
  return {
    ...task,
    revealMs: 2300,
    prompt: "Count Bot: How many flashed?",
    speakText: "Defeat Count Bot. How many flashed?",
    introPrompt: "Count Bot shield up!",
  };
}

function createRaceCommanderPlaceTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const racerCount = difficulty === "easy" ? 3 : difficulty === "medium" ? 4 : 5;
  const otherCharacters = shuffle(ORDINAL_CHARACTERS.filter((character) => character.id !== "numbot")).slice(0, Math.max(0, racerCount - 1));
  const characters = shuffle([{ id: "numbot", label: "Numbot", emoji: "🤖" } as const, ...otherCharacters]);
  const finalOrder = shuffle(characters.map((character) => character.id));
  let startOrder = shuffle(finalOrder);
  while (startOrder.join("|") === finalOrder.join("|")) startOrder = shuffle(finalOrder);
  const midOne = [...startOrder];
  const swapOne = randInt(0, Math.max(0, midOne.length - 2));
  [midOne[swapOne], midOne[swapOne + 1]] = [midOne[swapOne + 1], midOne[swapOne]];
  const midTwo = [...finalOrder];
  if (midTwo.length > 3) {
    const swapTwo = randInt(1, Math.max(1, midTwo.length - 2));
    [midTwo[swapTwo - 1], midTwo[swapTwo]] = [midTwo[swapTwo], midTwo[swapTwo - 1]];
  }
  const numbotPlace = finalOrder.findIndex((id) => id === "numbot") + 1;
  const optionPool = [1, 2, 3, 4, 5].filter((value) => value <= finalOrder.length);
  return makeOrdinalTask({
    prompt: "Race Commander: What place did Numbot finish?",
    speakText: "Race Commander. What place did Numbot finish?",
    introPrompt: "Watch the racers.",
    targetNumber: numbotPlace,
    badgeLabel: "Race Commander",
    scenario: "race",
    mode: "which_place",
    characters,
    order: finalOrder,
    raceStartOrder: startOrder,
    raceProgressOrders: [midOne, midTwo],
    raceDurationMs: randInt(7600, 9200),
    targetCharacterId: "numbot",
    positionOptions: optionPool,
    feedback: { correct: "Race tracked perfectly!", wrong: "Check where Numbot finished." },
  });
}

function buildRaceBossTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const racerCount = difficulty === "easy" ? 3 : difficulty === "medium" ? 4 : 5;
  const characters = shuffle(ORDINAL_CHARACTERS).slice(0, racerCount);
  const finalOrder = characters.map((character) => character.id);
  const targetIndex = randInt(0, Math.min(2, finalOrder.length - 1));
  const mode = randInt(0, 2);
  let startOrder = shuffle(finalOrder);
  while (startOrder.join("|") == finalOrder.join("|")) startOrder = shuffle(finalOrder);
  const midOne = [...startOrder];
  const swapOne = randInt(0, Math.max(0, midOne.length - 2));
  [midOne[swapOne], midOne[swapOne + 1]] = [midOne[swapOne + 1], midOne[swapOne]];
  const midTwo = [...finalOrder];
  if (midTwo.length > 3) {
    const swapTwo = randInt(1, Math.max(1, midTwo.length - 2));
    [midTwo[swapTwo - 1], midTwo[swapTwo]] = [midTwo[swapTwo], midTwo[swapTwo - 1]];
  }
  if (mode === 0) {
    return makeOrdinalTask({
      prompt: "Race Commander: Who finished first?",
      speakText: "Race Commander. Who finished first?",
      introPrompt: "Watch the racers.",
      targetNumber: 1,
      badgeLabel: "Race Commander",
      scenario: "race",
      mode: "identify",
      characters,
      order: finalOrder,
      raceStartOrder: startOrder,
      raceProgressOrders: [midOne, midTwo],
      raceDurationMs: randInt(5200, 7600),
      targetPosition: 1,
      feedback: { correct: "Boss shield broken!", wrong: "Track the finish line again." },
    });
  }
  if (mode === 1) {
    return makeOrdinalTask({
      prompt: "Race Commander: Who came second?",
      speakText: "Race Commander. Who came second?",
      introPrompt: "Watch the racers.",
      targetNumber: 2,
      badgeLabel: "Race Commander",
      scenario: "race",
      mode: "identify",
      characters,
      order: finalOrder,
      raceStartOrder: startOrder,
      raceProgressOrders: [midOne, midTwo],
      raceDurationMs: randInt(5200, 7600),
      targetPosition: 2,
      feedback: { correct: "Boss shield broken!", wrong: "Check the finishing places again." },
    });
  }
  const targetCharacterId = finalOrder[targetIndex];
  return makeOrdinalTask({
    prompt: "Race Commander: What place did Numbot finish?",
    speakText: targetCharacterId === "numbot" ? "Race Commander. What place did Numbot finish?" : `Race Commander. What place did ${characters.find((character) => character.id === targetCharacterId)?.label ?? 'the racer'} finish?`,
    introPrompt: "Watch the racers.",
    targetNumber: targetIndex + 1,
    badgeLabel: "Race Commander",
    scenario: "race",
    mode: "which_place",
    characters,
    order: finalOrder,
    raceStartOrder: startOrder,
    raceProgressOrders: [midOne, midTwo],
    raceDurationMs: randInt(5200, 7600),
    targetCharacterId,
    positionOptions: [1, 2, 3, ...(finalOrder.length > 3 ? [4] : [])],
    feedback: { correct: "Race tracked perfectly!", wrong: "Check the final race order again." },
  });
}

function createCountBotBossTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const task = createQuickCountFlashTask(lessonId, difficulty) as GroundFlashTask;
  return { ...task, prompt: "Count Bot: How many flashed?", speakText: "Defeat Count Bot. How many flashed?", introPrompt: "Count Bot shield up!", feedback: { correct: "Count Bot defeated!", wrong: "Count fast and try again." } };
}

function createTeenTitanBossTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const task = createTeenNumberMatchTask(lessonId, difficulty) as GroundMatchTask;
  return { ...task, prompt: "Teen Titan: Match the teen number.", speakText: "Teen Titan. Match the teen number.", introPrompt: "Teen Titan challenge!", feedback: { correct: "Teen Titan defeated!", wrong: "Think ten and some more." } };
}

function createOrderMasterBossTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const task = createOrderNumbersTask(lessonId, difficulty) as GroundOrderTapTask;
  return { ...task, prompt: "Order Master: Sort the numbers.", speakText: "Order Master. Sort the numbers.", introPrompt: "Order Master arena!", badgeLabel: "Order Master", feedback: { correct: "Order Master defeated!", wrong: "Sort them carefully again." } };
}

function createPositionPhantomBossTask(): PracticeTask {
  const task = createPositionPopTask() as GroundSpatialTask;
  return { ...task, prompt: "Position Phantom: Tap the object beside Numbot.", speakText: "Position Phantom. Tap the object beside Numbot.", badgeLabel: "Position Phantom", feedback: { correct: "Position Phantom faded away!", wrong: "Check beside Numbot again." } };
}

function createPathBreakerBossTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const task = randInt(0, 1) === 0 ? createNumberPathRushTask(lessonId, difficulty) as GroundSequenceTask : createBeforeOrAfterTask(lessonId, difficulty) as GroundSequenceTask;
  return { ...task, prompt: task.prompt.startsWith("What comes") ? `Path Breaker: ${task.prompt}` : "Path Breaker: Repair the path.", speakText: task.speakText ? `Path Breaker. ${task.speakText}` : "Path Breaker. Repair the path.", introPrompt: "Path Breaker incoming!", feedback: { correct: "Path Breaker defeated!", wrong: "Fix the path carefully." } };
}

function createBiggestBlasterBossTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const task = randInt(0, 1) === 0 ? createFindBiggestTask(lessonId, difficulty) as GroundCompareTask : createFindSmallestTask(lessonId, difficulty) as GroundCompareTask;
  const isBiggest = task.comparisonType === "biggest";
  return { ...task, prompt: isBiggest ? "Biggest Blaster: Which number is biggest?" : "Biggest Blaster: Which number is smallest?", speakText: isBiggest ? "Biggest Blaster. Which number is biggest?" : "Biggest Blaster. Which number is smallest?", introPrompt: "Blaster challenge!", feedback: { correct: "Biggest Blaster defeated!", wrong: "Compare the groups again." } };
}

function createMatchMachineBossTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const task = createMatchCollectionTask(lessonId, difficulty) as GroundMatchTask;
  return { ...task, prompt: "Match Machine: Match the collection.", speakText: "Match Machine. Match the collection.", introPrompt: "Match Machine online!", feedback: { correct: "Match Machine defeated!", wrong: "Check the quantity again." } };
}

function createComboRoundBossTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const pick = randInt(0, 2);
  if (pick === 0) {
    const task = createTapNumberTask(lessonId, difficulty) as GroundHuntTask;
    return { ...task, prompt: `Combo Round: ${task.prompt}`, speakText: `Combo Round. ${task.speakText ?? ''}`.trim(), introPrompt: "Combo streak!", feedback: { correct: "Combo streak!", wrong: "Reset and try the combo again." } };
  }
  if (pick === 1) {
    const task = createWhichGroupMoreTask(lessonId, difficulty) as GroundCompareTask;
    return { ...task, prompt: "Combo Round: Which group has more?", speakText: "Combo Round. Which group has more?", introPrompt: "Combo streak!", feedback: { correct: "Combo streak!", wrong: "Compare quickly and try again." } };
  }
  const task = createWhatComesNextTask(lessonId, difficulty) as GroundSequenceTask;
  return { ...task, prompt: "Combo Round: What comes next?", speakText: "Combo Round. What comes next?", introPrompt: "Combo streak!", feedback: { correct: "Combo streak!", wrong: "Count on and try again." } };
}

function createFinalBossRoundTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const pick = randInt(0, 2);
  if (pick === 0) {
    const task = createArcadeBonusTask(lessonId, difficulty) as GroundMatchTask;
    return { ...task, prompt: "Final Boss Round: Match it all.", speakText: "Final Boss Round. Match it all.", introPrompt: "Final boss shield!", feedback: { correct: "Final boss defeated!", wrong: "Check the mixed match again." } };
  }
  if (pick === 1) {
    const task = createBuildNumberTask(lessonId, difficulty) as GroundBuildTask;
    return { ...task, prompt: `Final Boss Round: Build ${task.targetNumber}.`, speakText: `Final Boss Round. Build ${numberWord(task.targetNumber)}.`, introPrompt: "Final boss shield!", feedback: { correct: "Final boss defeated!", wrong: "Build the target carefully again." } };
  }
  const task = createOrderNumbersTask(lessonId, difficulty) as GroundOrderTapTask;
  return { ...task, prompt: "Final Boss Round: Sort the numbers.", speakText: "Final Boss Round. Sort the numbers.", introPrompt: "Final boss shield!", badgeLabel: "Final Boss", feedback: { correct: "Final boss defeated!", wrong: "Sort them carefully again." } };
}

function generateLesson2Task(lessonId: string, difficulty: Difficulty, kind: Lesson2Kind): PracticeTask {
  switch (kind) {
    case "count_bot":
      return createCountBotBossTask(lessonId, difficulty);
    case "teen_titan":
      return createTeenTitanBossTask(lessonId, difficulty);
    case "order_master":
      return createOrderMasterBossTask(lessonId, difficulty);
    case "position_phantom":
      return createPositionPhantomBossTask();
    case "race_commander":
      return buildRaceBossTask(lessonId, difficulty);
    case "path_breaker":
      return createPathBreakerBossTask(lessonId, difficulty);
    case "biggest_blaster":
      return createBiggestBlasterBossTask(lessonId, difficulty);
    case "match_machine":
      return createMatchMachineBossTask(lessonId, difficulty);
    case "combo_round":
      return createComboRoundBossTask(lessonId, difficulty);
    case "final_boss_round":
      return createFinalBossRoundTask(lessonId, difficulty);
  }
}

export function generatePrepWeek10Task(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (lessonId === "y0-w10-l3") {
    const kind = nextKind(memory, LESSON3_ROTATION);
    return generateLesson3Task(lessonId, difficulty, kind);
  }
  if (lessonId === "y0-w10-l2") {
    const kind = nextKind(memory, LESSON2_ROTATION);
    return generateLesson2Task(lessonId, difficulty, kind);
  }
  const kind = nextKind(memory, LESSON1_ROTATION);
  return generateLesson1Task(lessonId, difficulty, kind);
}

export function generatePrepWeek10TaskByKind(
  lessonId: string,
  difficulty: Difficulty,
  kind: string
): PracticeTask {
  if (kind === "tap_number_quiz") {
    return createTapNumberQuizTask(lessonId);
  }
  if (kind === "count_bot_quiz") {
    return createCountBotQuizTask(lessonId);
  }
  if (kind === "race_commander_place") {
    return createRaceCommanderPlaceTask(lessonId, difficulty);
  }
  if (lessonId === "y0-w10-l3") {
    return generateLesson3Task(lessonId, difficulty, kind as Lesson3Kind);
  }
  if (lessonId === "y0-w10-l2") {
    return generateLesson2Task(lessonId, difficulty, kind as Lesson2Kind);
  }
  return generateLesson1Task(lessonId, difficulty, kind as Lesson1Kind);
}

export function resetPrepWeek10TaskSessionState() {
  memoryByLesson.clear();
}
