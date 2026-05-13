import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

type GroundObjectType = Extract<PracticeTask, { kind: "groundBuild" }>["objectType"];
type GroundPatternLayout = Extract<PracticeTask, { kind: "groundFlash" }>["patternLayout"];
type GroundBuildTask = Extract<PracticeTask, { kind: "groundBuild" }>;
type GroundMatchTask = Extract<PracticeTask, { kind: "groundMatch" }>;

type Week6Memory = {
  cursor: number;
  recentTargets: number[];
  recentKinds: string[];
  recentObjects: GroundObjectType[];
  recentLayouts: GroundPatternLayout[];
  recentPairs: string[];
};

const TARGETS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
const EARLY_TARGETS = [2, 3, 4, 5] as const;
const MID_TARGETS = [4, 5, 6, 7, 8] as const;
const OBJECTS: GroundObjectType[] = [
  "stars",
  "crystals",
  "robot_tokens",
  "blocks",
  "planets",
  "dots",
  "energy_orbs",
  "futuristic_coins",
  "number_orbs",
];
const LESSON1_ROTATION = [
  "build_number",
  "find_another_way",
  "part_part_whole",
  "match_same_total",
  "numbot_build",
  "balance_groups",
  "fill_the_frame",
  "split_the_group",
  "fix_the_build",
  "number_machine",
  "build_to_ten",
  "part_match",
] as const;

const memoryByLesson = new Map<string, Week6Memory>();

function getMemory(lessonId: string) {
  const existing = memoryByLesson.get(lessonId);
  if (existing) return existing;
  const created: Week6Memory = {
    cursor: 0,
    recentTargets: [],
    recentKinds: [],
    recentObjects: [],
    recentLayouts: [],
    recentPairs: [],
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

function chooseRecentSafe<T>(pool: readonly T[] | T[], recent: T[]) {
  let candidate = pool[randInt(0, pool.length - 1)]!;
  for (let attempts = 0; attempts < 4; attempts += 1) {
    if (recent.slice(-2).every((value) => value === candidate) && recent.length >= 2) {
      candidate = pool[randInt(0, pool.length - 1)]!;
      continue;
    }
    break;
  }
  return candidate;
}

function stagePool(memory: Week6Memory, difficulty: Difficulty) {
  if (difficulty === "easy") {
    if (memory.cursor < 8) return [...EARLY_TARGETS];
    if (memory.cursor < 20) return [...MID_TARGETS];
    return [...TARGETS];
  }
  if (difficulty === "medium") {
    if (memory.cursor < 6) return [...MID_TARGETS];
    return [...TARGETS];
  }
  return [...TARGETS];
}

function pickTarget(memory: Week6Memory, difficulty: Difficulty) {
  const pool = stagePool(memory, difficulty);
  const target = chooseRecentSafe(pool, memory.recentTargets);
  pushRecent(memory.recentTargets, target, 5);
  return target;
}

function pickObject(memory: Week6Memory, preferred?: GroundObjectType[]) {
  const pool = preferred ?? OBJECTS;
  const objectType = chooseRecentSafe(pool, memory.recentObjects);
  pushRecent(memory.recentObjects, objectType, 5);
  return objectType;
}

function pickLayout(memory: Week6Memory, quantity: number, preferred?: GroundPatternLayout[]) {
  const pool: GroundPatternLayout[] = preferred
    ? preferred
    : quantity <= 5
      ? ["dice", "domino", "symmetry", "finger", "ten_frame"]
      : ["ten_frame", "domino", "symmetry"];
  const layout = chooseRecentSafe(pool, memory.recentLayouts);
  pushRecent(memory.recentLayouts, layout, 5);
  return layout;
}

function nextKind(memory: Week6Memory) {
  const kind = LESSON1_ROTATION[memory.cursor % LESSON1_ROTATION.length]!;
  memory.cursor += 1;
  pushRecent(memory.recentKinds, kind, 5);
  return kind;
}

function pairKey(parts: number[]) {
  return [...parts].sort((a, b) => a - b).join("+");
}

function chooseParts(total: number, memory?: Week6Memory, avoidKey?: string) {
  const combos: number[][] = [];
  for (let left = 1; left < total; left += 1) {
    const right = total - left;
    combos.push([left, right]);
  }
  const filtered = combos.filter((parts) => pairKey(parts) !== avoidKey);
  const pool = filtered.length > 0 ? filtered : combos;
  const choice = pool[randInt(0, pool.length - 1)]!;
  if (memory) pushRecent(memory.recentPairs, pairKey(choice), 5);
  return choice;
}

function wrongTotal(total: number) {
  const delta = Math.random() < 0.5 ? -1 : 1;
  return Math.max(1, Math.min(10, total + delta));
}

function makePartsOption(memory: Week6Memory, total: number, parts: number[]): GroundMatchTask["options"][number] {
  return {
    id: `parts-${total}-${parts.join("-")}-${Math.random().toString(36).slice(2, 7)}`,
    kind: "pair",
    pairNumeral: total,
    pairParts: parts,
    pairPartObjectTypes: parts.map(() => pickObject(memory)),
    pairPartLayouts: parts.map((part) => pickLayout(memory, part)),
  };
}

function makePairChoices(memory: Week6Memory, total: number, correctParts: number[], count = 3) {
  const options = [makePartsOption(memory, total, correctParts)];
  while (options.length < count) {
    const wrong = wrongTotal(total);
    const parts = chooseParts(Math.max(2, wrong));
    const candidate = makePartsOption(memory, wrong, parts);
    if (options.some((option) => option.id.split("-").slice(0, 3).join("-") === candidate.id.split("-").slice(0, 3).join("-"))) {
      continue;
    }
    options.push(candidate);
  }
  return shuffle(options);
}

function makeBuildTask(task: Omit<GroundBuildTask, "kind">): PracticeTask {
  return { kind: "groundBuild", ...task };
}

function makeMatchTask(task: Omit<GroundMatchTask, "kind">): PracticeTask {
  return { kind: "groundMatch", ...task };
}

function createBuildNumberTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  return makeBuildTask({
    prompt: `Build ${target}.`,
    speakText: `Build ${numberWord(target)}.`,
    targetNumber: target,
    objectType: pickObject(memory),
    compareMode: "exact",
    maxBuild: 10,
    feedback: { correct: `You built ${target}!`, wrong: "Keep building until the whole number matches." },
  });
}

function createFindAnotherWayTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const total = Math.max(3, pickTarget(memory, difficulty));
  const shownParts = chooseParts(total, memory);
  const correctParts = chooseParts(total, memory, pairKey(shownParts));
  const options = makePairChoices(memory, total, correctParts);
  const correctOptionId = options.find((option) => option.pairNumeral === total && pairKey(option.pairParts ?? []) === pairKey(correctParts))?.id ?? options[0]!.id;
  return makeMatchTask({
    prompt: `${shownParts[0]} and ${shownParts[1]} makes ${total}. Can you make ${total} another way?`,
    speakText: `${shownParts[0]} and ${shownParts[1]} makes ${numberWord(total)}. Can you make ${numberWord(total)} another way?`,
    targetNumber: total,
    shownNumeral: total,
    visualType: "ground-number-card",
    promptType: "match_pair",
    options,
    correctOptionId,
    feedback: { correct: "Another great way!", wrong: "Look for a different build that still makes the same whole." },
  });
}

function createPartPartWholeTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const total = Math.max(2, pickTarget(memory, difficulty));
  const correctParts = chooseParts(Math.max(2, total), memory);
  const options = makePairChoices(memory, Math.max(2, total), correctParts);
  const correctOptionId = options.find((option) => option.pairNumeral === total && pairKey(option.pairParts ?? []) === pairKey(correctParts))?.id ?? options[0]!.id;
  return makeMatchTask({
    prompt: `Fill the two parts to make ${total}.`,
    speakText: `Fill the two parts to make ${numberWord(total)}.`,
    targetNumber: total,
    shownNumeral: total,
    visualType: "ground-number-card",
    promptType: "match_pair",
    options,
    correctOptionId,
    feedback: { correct: "You built the whole from two parts!", wrong: "Choose the two parts that join to make the whole." },
  });
}

function createMatchSameTotalTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const total = Math.max(2, pickTarget(memory, difficulty));
  const correctParts = chooseParts(Math.max(2, total), memory);
  const options = makePairChoices(memory, Math.max(2, total), correctParts);
  const correctOptionId = options.find((option) => option.pairNumeral === total && pairKey(option.pairParts ?? []) === pairKey(correctParts))?.id ?? options[0]!.id;
  return makeMatchTask({
    prompt: "Which groups make the same number?",
    speakText: "Which groups make the same number?",
    targetNumber: total,
    shownQuantity: total,
    objectType: pickObject(memory),
    patternLayout: pickLayout(memory, total),
    visualType: "ground-quantity-card",
    promptType: "match_pair",
    options,
    correctOptionId,
    feedback: { correct: "They match the same total!", wrong: "Look for the build that makes the same amount as the whole group." },
  });
}

function createNumbotBuildTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  return makeBuildTask({
    prompt: `Numbot says: build ${target} energy cells!`,
    speakText: `Numbot says: build ${numberWord(target)} energy cells.`,
    targetNumber: target,
    objectType: "energy_orbs",
    compareMode: "exact",
    maxBuild: 10,
    feedback: { correct: "Perfect number build!", wrong: "Build the same total Numbot asked for." },
  });
}

function createBalanceGroupsTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const total = Math.max(3, pickTarget(memory, difficulty));
  const shownParts = chooseParts(total, memory);
  const correctParts = chooseParts(total, memory, pairKey(shownParts));
  const options = makePairChoices(memory, total, correctParts);
  const correctOptionId = options.find((option) => option.pairNumeral === total && pairKey(option.pairParts ?? []) === pairKey(correctParts))?.id ?? options[0]!.id;
  return makeMatchTask({
    prompt: `${shownParts[0]} and ${shownParts[1]} makes ${total}. Which build balances the same total?`,
    speakText: `${shownParts[0]} and ${shownParts[1]} makes ${numberWord(total)}. Which build balances the same total?`,
    targetNumber: total,
    shownNumeral: total,
    visualType: "ground-number-card",
    promptType: "match_pair",
    options,
    correctOptionId,
    feedback: { correct: "Balanced totals!", wrong: "Find another build that still makes the same whole." },
  });
}

function createFillFrameTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const filled = difficulty === "easy" ? randInt(1, 6) : randInt(2, 8);
  const missing = 10 - filled;
  return makeBuildTask({
    prompt: "How many more to make 10?",
    speakText: "How many more to make ten?",
    targetNumber: missing,
    objectType: "dots",
    compareMode: "exact",
    maxBuild: 10,
    referenceGroup: {
      quantity: filled,
      objectType: "dots",
      patternLayout: "ten_frame",
    },
    feedback: { correct: "You filled the frame!", wrong: "Build the missing part that joins to make ten." },
  });
}

function createSplitTheGroupTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const total = Math.max(2, pickTarget(memory, difficulty));
  const correctParts = chooseParts(Math.max(2, total), memory);
  const options = makePairChoices(memory, Math.max(2, total), correctParts);
  const correctOptionId = options.find((option) => option.pairNumeral === total && pairKey(option.pairParts ?? []) === pairKey(correctParts))?.id ?? options[0]!.id;
  return makeMatchTask({
    prompt: `Split ${total} into two smaller groups.`,
    speakText: `Split ${numberWord(total)} into two smaller groups.`,
    targetNumber: total,
    shownQuantity: total,
    objectType: pickObject(memory),
    patternLayout: pickLayout(memory, total),
    visualType: "ground-quantity-card",
    promptType: "match_pair",
    options,
    correctOptionId,
    feedback: { correct: "You split the whole into parts!", wrong: "Choose the two parts that make the whole group." },
  });
}

function createFixTheBuildTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const total = Math.max(3, pickTarget(memory, difficulty));
  const shown = Math.max(1, total - randInt(1, Math.min(3, total - 1)));
  const missing = total - shown;
  return makeBuildTask({
    prompt: `This build has ${shown}. Build ${missing} more to make ${total}.`,
    speakText: `This build has ${numberWord(shown)}. Build ${numberWord(missing)} more to make ${numberWord(total)}.`,
    targetNumber: missing,
    objectType: pickObject(memory),
    compareMode: "exact",
    maxBuild: 10,
    referenceGroup: {
      quantity: shown,
      objectType: pickObject(memory),
      patternLayout: pickLayout(memory, shown),
    },
    feedback: { correct: "You fixed the build!", wrong: "Build the missing part that completes the whole." },
  });
}

function createNumberMachineTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const total = Math.max(2, pickTarget(memory, difficulty));
  const correctParts = chooseParts(Math.max(2, total), memory);
  const options = makePairChoices(memory, Math.max(2, total), correctParts);
  const correctOptionId = options.find((option) => option.pairNumeral === total && pairKey(option.pairParts ?? []) === pairKey(correctParts))?.id ?? options[0]!.id;
  return makeMatchTask({
    prompt: `Feed the Number Machine to make ${total}.`,
    speakText: `Feed the Number Machine to make ${numberWord(total)}.`,
    targetNumber: total,
    shownNumeral: total,
    visualType: "ground-number-card",
    promptType: "match_pair",
    helperVariant: "speech_bubble",
    options,
    correctOptionId,
    feedback: { correct: "Number Machine ready!", wrong: "Pick the build that makes the target number." },
  });
}

function createBuildToTenTask(lessonId: string): PracticeTask {
  const objectMemory = getMemory(lessonId);
  return makeBuildTask({
    prompt: "Build 10 a new way.",
    speakText: "Build ten a new way.",
    targetNumber: 10,
    objectType: pickObject(objectMemory),
    compareMode: "exact",
    maxBuild: 10,
    feedback: { correct: "You made ten!", wrong: "Keep building until the whole is ten." },
  });
}

function createPartMatchTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const total = Math.max(2, pickTarget(memory, difficulty));
  const correctParts = chooseParts(Math.max(2, total), memory);
  const options = makePairChoices(memory, Math.max(2, total), correctParts);
  const correctOptionId = options.find((option) => option.pairNumeral === total && pairKey(option.pairParts ?? []) === pairKey(correctParts))?.id ?? options[0]!.id;
  return makeMatchTask({
    prompt: `Find the parts that join to make ${total}.`,
    speakText: `Find the parts that join to make ${numberWord(total)}.`,
    targetNumber: total,
    shownNumeral: total,
    visualType: "ground-number-card",
    promptType: "match_pair",
    options,
    correctOptionId,
    feedback: { correct: "Parts matched to the whole!", wrong: "Look for the parts that build the whole number." },
  });
}

function generateLesson1Task(lessonId: string, difficulty: Difficulty, kind: (typeof LESSON1_ROTATION)[number]): PracticeTask {
  switch (kind) {
    case "build_number":
      return createBuildNumberTask(lessonId, difficulty);
    case "find_another_way":
      return createFindAnotherWayTask(lessonId, difficulty);
    case "part_part_whole":
      return createPartPartWholeTask(lessonId, difficulty);
    case "match_same_total":
      return createMatchSameTotalTask(lessonId, difficulty);
    case "numbot_build":
      return createNumbotBuildTask(lessonId, difficulty);
    case "balance_groups":
      return createBalanceGroupsTask(lessonId, difficulty);
    case "fill_the_frame":
      return createFillFrameTask(lessonId, difficulty);
    case "split_the_group":
      return createSplitTheGroupTask(lessonId, difficulty);
    case "fix_the_build":
      return createFixTheBuildTask(lessonId, difficulty);
    case "number_machine":
      return createNumberMachineTask(lessonId, difficulty);
    case "build_to_ten":
      return createBuildToTenTask(lessonId);
    case "part_match":
      return createPartMatchTask(lessonId, difficulty);
  }
}

export function generatePrepWeek6Task(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const kind = nextKind(memory);
  return generateLesson1Task(lessonId, difficulty, kind);
}

export function resetPrepWeek6TaskSessionState() {
  memoryByLesson.clear();
}
