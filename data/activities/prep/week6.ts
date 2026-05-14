import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

type GroundObjectType = Extract<PracticeTask, { kind: "groundBuild" }>["objectType"];
type GroundPatternLayout = NonNullable<Extract<PracticeTask, { kind: "groundFlash" }>["patternLayout"]>;
type GroundBuildTask = Extract<PracticeTask, { kind: "groundBuild" }>;

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
  "dots",
  "energy_orbs",
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
  const target = chooseRecentSafe(stagePool(memory, difficulty), memory.recentTargets);
  pushRecent(memory.recentTargets, target, 5);
  return target;
}

function pickObject(memory: Week6Memory) {
  const objectType = chooseRecentSafe(OBJECTS, memory.recentObjects);
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
    combos.push([left, total - left]);
  }
  const filtered = combos.filter((parts) => pairKey(parts) !== avoidKey);
  const pool = filtered.length > 0 ? filtered : combos;
  const choice = pool[randInt(0, pool.length - 1)]!;
  if (memory) pushRecent(memory.recentPairs, pairKey(choice), 5);
  return choice;
}

function makeBuildTask(task: Omit<GroundBuildTask, "kind">): PracticeTask {
  return { kind: "groundBuild", ...task };
}

function createSingleBuildTask({
  lessonId,
  prompt,
  speakText,
  target,
  objectType,
  referenceGroup,
  feedback,
}: {
  lessonId: string;
  prompt: string;
  speakText: string;
  target: number;
  objectType?: GroundObjectType;
  referenceGroup?: GroundBuildTask["referenceGroup"];
  feedback: NonNullable<GroundBuildTask["feedback"]>;
}): PracticeTask {
  const memory = getMemory(lessonId);
  return makeBuildTask({
    prompt,
    speakText,
    targetNumber: target,
    objectType: objectType ?? pickObject(memory),
    compareMode: "exact",
    maxBuild: 10,
    referenceGroup,
    feedback,
  });
}

function createSplitBuildTask({
  lessonId,
  prompt,
  speakText,
  total,
  exampleParts,
  requireDifferentFromExample,
  feedback,
}: {
  lessonId: string;
  prompt: string;
  speakText: string;
  total: number;
  exampleParts: number[];
  requireDifferentFromExample: boolean;
  feedback: NonNullable<GroundBuildTask["feedback"]>;
}): PracticeTask {
  const memory = getMemory(lessonId);
  const wholeObject = pickObject(memory);
  const splitObjectTypes: GroundObjectType[] = [pickObject(memory), pickObject(memory)];
  const splitPartLayouts: GroundPatternLayout[] = [
    pickLayout(memory, exampleParts[0] ?? 1),
    pickLayout(memory, exampleParts[1] ?? 1),
  ];
  const exampleObjectTypes: GroundObjectType[] = [pickObject(memory), pickObject(memory)];
  const examplePartLayouts: GroundPatternLayout[] = [
    pickLayout(memory, exampleParts[0] ?? 1),
    pickLayout(memory, exampleParts[1] ?? 1),
  ];

  return makeBuildTask({
    prompt,
    speakText,
    targetNumber: total,
    objectType: wholeObject,
    compareMode: "exact",
    maxBuild: 10,
    buildMode: "split",
    exampleParts,
    exampleObjectTypes,
    examplePartLayouts,
    splitObjectTypes,
    splitPartLayouts,
    requireDifferentFromExample,
    referenceGroup: {
      quantity: total,
      objectType: wholeObject,
      patternLayout: pickLayout(memory, total),
    },
    feedback,
  });
}

function createBuildNumberTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  return createSingleBuildTask({
    lessonId,
    prompt: `Build ${target}.`,
    speakText: `Build ${numberWord(target)}.`,
    target,
    feedback: { correct: `You built ${target}!`, wrong: "Keep building until the whole number matches." },
  });
}

function createFindAnotherWayTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const total = Math.max(3, pickTarget(memory, difficulty));
  const exampleParts = chooseParts(total, memory);
  return createSplitBuildTask({
    lessonId,
    prompt: `Can you make ${total} another way?`,
    speakText: `Can you make ${numberWord(total)} another way?`,
    total,
    exampleParts,
    requireDifferentFromExample: true,
    feedback: { correct: "Another great way!", wrong: "Build the same total in a different way." },
  });
}

function createPartPartWholeTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const total = Math.max(2, pickTarget(memory, difficulty));
  const exampleParts = chooseParts(total, memory);
  return createSplitBuildTask({
    lessonId,
    prompt: `Build ${total} with two parts.`,
    speakText: `Build ${numberWord(total)} with two parts.`,
    total,
    exampleParts,
    requireDifferentFromExample: false,
    feedback: { correct: "You built the whole from two parts!", wrong: "Use two parts that join to make the whole." },
  });
}

function createMatchSameTotalTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const total = Math.max(2, pickTarget(memory, difficulty));
  const exampleParts = chooseParts(total, memory);
  return createSplitBuildTask({
    lessonId,
    prompt: `Can you build the same total as ${total}?`,
    speakText: `Can you build the same total as ${numberWord(total)}?`,
    total,
    exampleParts,
    requireDifferentFromExample: false,
    feedback: { correct: "They match the same total!", wrong: "Build two parts that make the same whole." },
  });
}

function createNumbotBuildTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = pickTarget(memory, difficulty);
  return createSingleBuildTask({
    lessonId,
    prompt: `Numbot says: build ${target} energy cells!`,
    speakText: `Numbot says: build ${numberWord(target)} energy cells.`,
    target,
    objectType: "energy_orbs",
    feedback: { correct: "Perfect number build!", wrong: "Build the same total Numbot asked for." },
  });
}

function createBalanceGroupsTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const total = Math.max(3, pickTarget(memory, difficulty));
  const exampleParts = chooseParts(total, memory);
  return createSplitBuildTask({
    lessonId,
    prompt: `Can you balance ${total} with a new build?`,
    speakText: `Can you balance ${numberWord(total)} with a new build?`,
    total,
    exampleParts,
    requireDifferentFromExample: true,
    feedback: { correct: "Balanced totals!", wrong: "Build the same total in a different way." },
  });
}

function createFillFrameTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const filled = difficulty === "easy" ? randInt(1, 6) : randInt(2, 8);
  const missing = 10 - filled;
  return createSingleBuildTask({
    lessonId,
    prompt: "How many more to make 10?",
    speakText: "How many more to make ten?",
    target: missing,
    objectType: "dots",
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
  const exampleParts = chooseParts(total, memory);
  return createSplitBuildTask({
    lessonId,
    prompt: `Split ${total} into two smaller groups.`,
    speakText: `Split ${numberWord(total)} into two smaller groups.`,
    total,
    exampleParts,
    requireDifferentFromExample: false,
    feedback: { correct: "You split the whole into parts!", wrong: "Build two smaller groups that still make the whole." },
  });
}

function createFixTheBuildTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const total = Math.max(3, pickTarget(memory, difficulty));
  const shown = Math.max(1, total - randInt(1, Math.min(3, total - 1)));
  const missing = total - shown;
  return createSingleBuildTask({
    lessonId,
    prompt: `This build has ${shown}. Build ${missing} more to make ${total}.`,
    speakText: `This build has ${numberWord(shown)}. Build ${numberWord(missing)} more to make ${numberWord(total)}.`,
    target: missing,
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
  const exampleParts = chooseParts(total, memory);
  return createSplitBuildTask({
    lessonId,
    prompt: `Feed the Number Machine to make ${total}.`,
    speakText: `Feed the Number Machine to make ${numberWord(total)}.`,
    total,
    exampleParts,
    requireDifferentFromExample: false,
    feedback: { correct: "Number Machine ready!", wrong: "Build two parts that join to make the target number." },
  });
}

function createBuildToTenTask(lessonId: string): PracticeTask {
  return createSingleBuildTask({
    lessonId,
    prompt: "Build 10 a new way.",
    speakText: "Build ten a new way.",
    target: 10,
    feedback: { correct: "You made ten!", wrong: "Keep building until the whole is ten." },
  });
}

function createPartMatchTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const total = Math.max(2, pickTarget(memory, difficulty));
  const exampleParts = chooseParts(total, memory);
  return createSplitBuildTask({
    lessonId,
    prompt: `Build the two parts that make ${total}.`,
    speakText: `Build the two parts that make ${numberWord(total)}.`,
    total,
    exampleParts,
    requireDifferentFromExample: false,
    feedback: { correct: "Parts matched to the whole!", wrong: "Build two parts that join to make the whole number." },
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
