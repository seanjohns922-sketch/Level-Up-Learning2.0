import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

type GroundObjectType = Extract<PracticeTask, { kind: "groundBuild" }>['objectType'];
type GroundPatternLayout = Extract<PracticeTask, { kind: "groundFlash" }>['patternLayout'];
type GroundCompareTask = Extract<PracticeTask, { kind: "groundCompare" }>;
type GroundBuildTask = Extract<PracticeTask, { kind: "groundBuild" }>;

type Week5Memory = {
  cursor: number;
  recentTargets: number[];
  recentKinds: string[];
  recentObjects: GroundObjectType[];
  recentLayouts: GroundPatternLayout[];
};

const TARGETS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
const LOW_TARGETS = [1, 2, 3, 4, 5, 6] as const;
const MID_TARGETS = [3, 4, 5, 6, 7, 8, 9] as const;
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
const ROTATION = [
  "which_more",
  "which_less",
  "same_or_different",
  "quick_compare",
  "numbot_compare",
  "group_battle",
  "ten_frame_compare",
  "match_biggest",
  "match_smallest",
  "build_more",
  "build_less",
  "equal_builder",
  "sort_groups",
  "true_false",
] as const;

const memoryByLesson = new Map<string, Week5Memory>();

function getMemory(lessonId: string) {
  const existing = memoryByLesson.get(lessonId);
  if (existing) return existing;
  const created: Week5Memory = {
    cursor: 0,
    recentTargets: [],
    recentKinds: [],
    recentObjects: [],
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

function chooseRecentSafe<T>(pool: readonly T[] | T[], recent: T[]) {
  let candidate = pool[randInt(0, pool.length - 1)]!;
  for (let attempts = 0; attempts < 2; attempts += 1) {
    const lastTwo = recent.slice(-2);
    if (lastTwo.length === 2 && lastTwo.every((value) => value === candidate)) {
      candidate = pool[randInt(0, pool.length - 1)]!;
      continue;
    }
    break;
  }
  return candidate;
}

function stagePool(memory: Week5Memory, difficulty: Difficulty) {
  if (difficulty === "easy") {
    if (memory.cursor < 10) return [...LOW_TARGETS];
    if (memory.cursor < 24) return [...MID_TARGETS];
    return [...TARGETS];
  }
  if (difficulty === "medium") {
    if (memory.cursor < 8) return [...MID_TARGETS];
    return [...TARGETS];
  }
  return [...TARGETS];
}

function pickTarget(memory: Week5Memory, difficulty: Difficulty) {
  const pool = stagePool(memory, difficulty);
  const target = chooseRecentSafe(pool, memory.recentTargets);
  pushRecent(memory.recentTargets, target, 4);
  return target;
}

function pickObject(memory: Week5Memory) {
  const objectType = chooseRecentSafe(OBJECTS, memory.recentObjects);
  pushRecent(memory.recentObjects, objectType, 4);
  return objectType;
}

function pickLayout(memory: Week5Memory, quantity: number, preferred?: GroundPatternLayout[]) {
  const pool: GroundPatternLayout[] = preferred
    ? preferred
    : quantity <= 5
      ? ["dice", "domino", "symmetry", "finger", "ten_frame"]
      : ["ten_frame", "domino", "symmetry"];
  const layout = chooseRecentSafe(pool, memory.recentLayouts);
  pushRecent(memory.recentLayouts, layout, 4);
  return layout;
}

function nextKind(memory: Week5Memory) {
  const kind = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  pushRecent(memory.recentKinds, kind, 4);
  return kind;
}

function comparePair(memory: Week5Memory, difficulty: Difficulty, relation: "more" | "less" | "equal") {
  const base = pickTarget(memory, difficulty);
  if (relation === "equal") return [base, base] as const;
  const maxDiff = difficulty === "easy" ? 3 : difficulty === "medium" ? 2 : 1;
  const diff = randInt(1, maxDiff);
  const lower = Math.max(1, base - diff);
  const upper = Math.min(10, base + diff);
  if (relation === "more") {
    if (upper === base) return [base, lower] as const;
    return Math.random() < 0.5 ? [upper, base] as const : [base, upper] as const;
  }
  if (lower === base) return [upper, base] as const;
  return Math.random() < 0.5 ? [lower, base] as const : [base, lower] as const;
}

function compareTriple(memory: Week5Memory, difficulty: Difficulty) {
  const anchor = pickTarget(memory, difficulty);
  const candidates = shuffle(TARGETS.filter((value) => Math.abs(value - anchor) <= (difficulty === "easy" ? 4 : 2)));
  const triple = Array.from(new Set([anchor, ...candidates])).slice(0, 3).sort((a, b) => a - b);
  while (triple.length < 3) {
    const extra = TARGETS.find((value) => !triple.includes(value));
    if (!extra) break;
    triple.push(extra);
  }
  return shuffle(triple.slice(0, 3));
}

function makeGroup(memory: Week5Memory, quantity: number, objectType?: GroundObjectType, layout?: GroundPatternLayout) {
  const chosenObject = objectType ?? pickObject(memory);
  const chosenLayout = layout ?? pickLayout(memory, quantity);
  return {
    id: `${chosenObject}-${quantity}-${Math.random().toString(36).slice(2, 7)}`,
    quantity,
    objectType: chosenObject,
    patternLayout: chosenLayout,
  };
}

function makeCompareTask(task: Omit<GroundCompareTask, "kind">): PracticeTask {
  return { kind: "groundCompare", ...task };
}

function makeBuildTask(task: Omit<GroundBuildTask, "kind">): PracticeTask {
  return { kind: "groundBuild", ...task };
}

function createWhichHasMoreTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const [a, b] = comparePair(memory, difficulty, "more");
  const left = makeGroup(memory, a);
  const right = makeGroup(memory, b);
  const correct = left.quantity > right.quantity ? left.id : right.id;
  return makeCompareTask({
    prompt: "Which group has more?",
    speakText: "Which group has more?",
    targetNumber: Math.max(a, b),
    comparisonType: "more",
    groups: [left, right],
    correctGroupId: correct,
    feedback: { correct: "You spotted the bigger group!", wrong: "Look for the group with more." },
  });
}

function createWhichHasLessTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const [a, b] = comparePair(memory, difficulty, "less");
  const left = makeGroup(memory, a);
  const right = makeGroup(memory, b);
  const correct = left.quantity < right.quantity ? left.id : right.id;
  return makeCompareTask({
    prompt: "Which group has less?",
    speakText: "Which group has less?",
    targetNumber: Math.min(a, b),
    comparisonType: "less",
    groups: [left, right],
    correctGroupId: correct,
    feedback: { correct: "Quick comparing!", wrong: "Look for the smaller group." },
  });
}

function createEqualTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const [a, b] = Math.random() < 0.5 ? comparePair(memory, difficulty, "equal") : comparePair(memory, difficulty, Math.random() < 0.5 ? "more" : "less");
  return makeCompareTask({
    prompt: "Are these equal?",
    speakText: "Are these equal?",
    targetNumber: a,
    comparisonType: "equal",
    groups: [makeGroup(memory, a), makeGroup(memory, b)],
    feedback: { correct: "You noticed if they were the same!", wrong: "Check whether both groups show the same amount." },
  });
}

function createQuickCompareTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const [a, b] = comparePair(memory, difficulty, Math.random() < 0.5 ? "more" : "less");
  const left = makeGroup(memory, a, pickObject(memory), pickLayout(memory, a));
  const right = makeGroup(memory, b, pickObject(memory), pickLayout(memory, b));
  return makeCompareTask({
    prompt: left.quantity > right.quantity ? "Quick eyes! Which has more?" : "Quick eyes! Which has less?",
    speakText: left.quantity > right.quantity ? "Quick eyes! Which group has more?" : "Quick eyes! Which group has less?",
    targetNumber: Math.max(a, b),
    comparisonType: left.quantity > right.quantity ? "more" : "less",
    helperVariant: "flash",
    groups: [left, right],
    correctGroupId: left.quantity > right.quantity ? left.id : right.id,
    feedback: { correct: "Amazing noticing!", wrong: "Quick eyes. Look again." },
  });
}

function createNumbotCompareTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const wantsMore = Math.random() < 0.5;
  const [a, b] = comparePair(memory, difficulty, wantsMore ? "more" : "less");
  const left = makeGroup(memory, a, "energy_orbs", pickLayout(memory, a, ["ten_frame", "domino", "symmetry"]));
  const right = makeGroup(memory, b, "energy_orbs", pickLayout(memory, b, ["ten_frame", "domino", "symmetry"]));
  return makeCompareTask({
    prompt: wantsMore ? "Numbot needs MORE energy!" : "Numbot needs LESS energy!",
    speakText: wantsMore ? "Numbot needs more energy." : "Numbot needs less energy.",
    targetNumber: wantsMore ? Math.max(a, b) : Math.min(a, b),
    comparisonType: wantsMore ? "more" : "less",
    helperVariant: "numbot",
    groups: [left, right],
    correctGroupId: wantsMore ? (left.quantity > right.quantity ? left.id : right.id) : (left.quantity < right.quantity ? left.id : right.id),
    feedback: { correct: "Numbot is powered up!", wrong: "Think about which group has more or less energy." },
  });
}

function createGroupBattleTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const [a, b] = comparePair(memory, difficulty, "more");
  const left = makeGroup(memory, a, "robot_tokens", pickLayout(memory, a, ["domino", "symmetry", "ten_frame"]));
  const right = makeGroup(memory, b, "robot_tokens", pickLayout(memory, b, ["domino", "symmetry", "ten_frame"]));
  return makeCompareTask({
    prompt: "Which team has more robots?",
    speakText: "Which team has more robots?",
    targetNumber: Math.max(a, b),
    comparisonType: "more",
    helperVariant: "battle",
    groups: [left, right],
    correctGroupId: left.quantity > right.quantity ? left.id : right.id,
    feedback: { correct: "Robot battle won!", wrong: "Look for the team with more robots." },
  });
}

function createTenFrameCompareTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const [a, b] = comparePair(memory, difficulty, Math.random() < 0.5 ? "more" : "less");
  const left = makeGroup(memory, a, "dots", "ten_frame");
  const right = makeGroup(memory, b, "dots", "ten_frame");
  const wantsMore = left.quantity > right.quantity;
  return makeCompareTask({
    prompt: wantsMore ? "Which ten frame has more?" : "Which ten frame has less?",
    speakText: wantsMore ? "Which ten frame has more?" : "Which ten frame has less?",
    targetNumber: wantsMore ? Math.max(a, b) : Math.min(a, b),
    comparisonType: wantsMore ? "more" : "less",
    helperVariant: "ten_frame",
    groups: [left, right],
    correctGroupId: wantsMore ? (left.quantity > right.quantity ? left.id : right.id) : (left.quantity < right.quantity ? left.id : right.id),
    feedback: { correct: "Ten frame compare complete!", wrong: "Look at which frame has more filled spaces." },
  });
}

function createBiggestTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const values = compareTriple(memory, difficulty);
  const groups = values.map((value) => makeGroup(memory, value));
  const biggest = groups.reduce((best, group) => (group.quantity > best.quantity ? group : best));
  return makeCompareTask({
    prompt: "Tap the biggest group.",
    speakText: "Tap the biggest group.",
    targetNumber: biggest.quantity,
    comparisonType: "biggest",
    groups,
    correctGroupId: biggest.id,
    feedback: { correct: "You found the biggest group!", wrong: "Look for the group with the most." },
  });
}

function createSmallestTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const values = compareTriple(memory, difficulty);
  const groups = values.map((value) => makeGroup(memory, value));
  const smallest = groups.reduce((best, group) => (group.quantity < best.quantity ? group : best));
  return makeCompareTask({
    prompt: "Tap the smallest group.",
    speakText: "Tap the smallest group.",
    targetNumber: smallest.quantity,
    comparisonType: "smallest",
    groups,
    correctGroupId: smallest.id,
    feedback: { correct: "You found the smaller group!", wrong: "Look for the group with less." },
  });
}

function createBuildMoreTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const base = pickTarget(memory, difficulty === "easy" ? "easy" : difficulty);
  const capped = Math.min(base, 8);
  return makeBuildTask({
    prompt: `Build MORE than ${capped}.`,
    speakText: `Build more than ${numberWord(capped)}.`,
    targetNumber: capped + 1,
    objectType: pickObject(memory),
    compareMode: "more_than",
    compareBase: capped,
    maxBuild: 10,
    feedback: { correct: "Yes — that is more!", wrong: "Build a group with more than the first one." },
  });
}

function createBuildLessTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const base = Math.max(3, pickTarget(memory, difficulty));
  return makeBuildTask({
    prompt: `Build LESS than ${base}.`,
    speakText: `Build less than ${numberWord(base)}.`,
    targetNumber: base - 1,
    objectType: pickObject(memory),
    compareMode: "less_than",
    compareBase: base,
    maxBuild: 10,
    feedback: { correct: "Yes — that is less!", wrong: "Build a smaller group." },
  });
}

function createEqualBuilderTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  return makeBuildTask({
    prompt: `Make the SAME amount as ${target}.`,
    speakText: `Make the same amount as ${numberWord(target)}.`,
    targetNumber: target,
    objectType: pickObject(memory),
    compareMode: "exact",
    maxBuild: 10,
    feedback: { correct: "You made an equal group!", wrong: "Match the same amount." },
  });
}

function createSortGroupsTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const values = compareTriple(memory, difficulty);
  const groups = values.map((value) => makeGroup(memory, value));
  return makeCompareTask({
    prompt: "Sort the groups from least to most.",
    speakText: "Tap the groups from least to most.",
    targetNumber: groups[0]?.quantity ?? 1,
    comparisonType: "order",
    groups,
    correctOrderIds: [...groups].sort((a, b) => a.quantity - b.quantity).map((group) => group.id),
    feedback: { correct: "You sorted the groups!", wrong: "Start with the smallest group." },
  });
}

function createTrueFalseTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const wantsTrue = Math.random() < 0.5;
  const [a, b] = wantsTrue ? comparePair(memory, difficulty, "more") : comparePair(memory, difficulty, Math.random() < 0.5 ? "equal" : "less");
  return makeCompareTask({
    prompt: "This group has more. Yes or no?",
    speakText: "Does the first group have more?",
    targetNumber: Math.max(a, b),
    comparisonType: "statement",
    statementRelation: "more",
    groups: [makeGroup(memory, a), makeGroup(memory, b)],
    feedback: { correct: "Great reasoning!", wrong: "Compare the first group to the second group." },
  });
}

export function generatePrepWeek5Task(lessonId: string, difficulty: Difficulty = "easy"): PracticeTask {
  const memory = getMemory(lessonId);
  const kind = nextKind(memory);

  switch (kind) {
    case "which_more":
      return createWhichHasMoreTask(lessonId, difficulty);
    case "which_less":
      return createWhichHasLessTask(lessonId, difficulty);
    case "same_or_different":
      return createEqualTask(lessonId, difficulty);
    case "quick_compare":
      return createQuickCompareTask(lessonId, difficulty);
    case "numbot_compare":
      return createNumbotCompareTask(lessonId, difficulty);
    case "group_battle":
      return createGroupBattleTask(lessonId, difficulty);
    case "ten_frame_compare":
      return createTenFrameCompareTask(lessonId, difficulty);
    case "match_biggest":
      return createBiggestTask(lessonId, difficulty);
    case "match_smallest":
      return createSmallestTask(lessonId, difficulty);
    case "build_more":
      return createBuildMoreTask(lessonId, difficulty);
    case "build_less":
      return createBuildLessTask(lessonId, difficulty);
    case "equal_builder":
      return createEqualBuilderTask(lessonId, difficulty);
    case "sort_groups":
      return createSortGroupsTask(lessonId, difficulty);
    case "true_false":
      return createTrueFalseTask(lessonId, difficulty);
    default:
      return createWhichHasMoreTask(lessonId, difficulty);
  }
}

export function resetPrepWeek5TaskSessionState() {
  memoryByLesson.clear();
}
