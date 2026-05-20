import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { generatePrepWeek10TaskByKind } from "@/data/activities/prep/week10";
import { generatePrepWeek11TaskByKind } from "@/data/activities/prep/week11";
import { generatePrepWeek6TaskByKind } from "@/data/activities/prep/week6";

type GroundObjectType = Extract<PracticeTask, { kind: "groundBuild" }>["objectType"];
type GroundPatternLayout = NonNullable<Extract<PracticeTask, { kind: "groundFlash" }>["patternLayout"]>;
type GroundBuildVisualStyle = NonNullable<Extract<PracticeTask, { kind: "groundBuild" }>["visualStyle"]>;
type GroundOrderTapTask = Extract<PracticeTask, { kind: "groundOrderTap" }>;
type GroundSequenceTask = Extract<PracticeTask, { kind: "groundSequence" }>;

type Lesson1Kind =
  | "quick_image_flash"
  | "representation_switch"
  | "teen_number_builder"
  | "number_image_memory";

type Lesson2Kind =
  | "flexible_builder"
  | "missing_part_challenge"
  | "make_ten_twenty"
  | "same_whole_different_parts";

type Lesson3Kind =
  | "ordering_mastery"
  | "multi_missing_reasoning"
  | "flexible_number_building"
  | "practical_application";

type Week12Memory = {
  cursor: number;
  recentTargets: number[];
  recentObjects: GroundObjectType[];
  recentLayouts: GroundPatternLayout[];
  recentStyles: GroundBuildVisualStyle[];
};

const LESSON1_ROTATION: Lesson1Kind[] = [
  "quick_image_flash",
  "representation_switch",
  "number_image_memory",
  "quick_image_flash",
  "representation_switch",
  "teen_number_builder",
];

const LESSON2_ROTATION: Lesson2Kind[] = [
  "flexible_builder",
  "missing_part_challenge",
  "make_ten_twenty",
  "same_whole_different_parts",
  "flexible_builder",
  "missing_part_challenge",
];

const LESSON3_ROTATION: Lesson3Kind[] = [
  "ordering_mastery",
  "multi_missing_reasoning",
  "flexible_number_building",
  "practical_application",
  "ordering_mastery",
  "multi_missing_reasoning",
];

const OBJECTS: GroundObjectType[] = [
  "energy_orbs",
  "crystals",
  "robot_tokens",
  "stars",
  "number_orbs",
  "planets",
];

const BUILD_STYLES: GroundBuildVisualStyle[] = [
  "double_ten_frame",
  "reactor_cells",
  "build_trays",
  "collection_shelves",
];

const memoryByLesson = new Map<string, Week12Memory>();

function getMemory(lessonId: string) {
  const existing = memoryByLesson.get(lessonId);
  if (existing) return existing;
  const created: Week12Memory = {
    cursor: 0,
    recentTargets: [],
    recentObjects: [],
    recentLayouts: [],
    recentStyles: [],
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

function numberWord(value: number) {
  const words = [
    "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
  ];
  return words[value] ?? String(value);
}

function stageTargets(memory: Week12Memory, difficulty: Difficulty) {
  if (difficulty === "easy") {
    if (memory.cursor < 4) return [8, 9, 10, 11, 12, 13];
    if (memory.cursor < 8) return [11, 12, 13, 14, 15, 16];
    return [12, 13, 14, 15, 16, 17, 18];
  }
  if (difficulty === "medium") return [10, 11, 12, 13, 14, 15, 16, 17, 18];
  return [11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
}

function pickTarget(memory: Week12Memory, difficulty: Difficulty) {
  const target = chooseRecentSafe(stageTargets(memory, difficulty), memory.recentTargets);
  pushRecent(memory.recentTargets, target, 6);
  return target;
}

function pickObject(memory: Week12Memory) {
  const objectType = chooseRecentSafe(OBJECTS, memory.recentObjects);
  pushRecent(memory.recentObjects, objectType, 6);
  return objectType;
}

function pickLayout(memory: Week12Memory, preferred?: GroundPatternLayout[]) {
  const pool: GroundPatternLayout[] = preferred ?? ["ten_frame", "symmetry", "dice", "domino"];
  const layout = chooseRecentSafe(pool, memory.recentLayouts);
  pushRecent(memory.recentLayouts, layout, 6);
  return layout;
}

function pickBuildStyle(memory: Week12Memory, preferred?: GroundBuildVisualStyle[]) {
  const pool = preferred ?? BUILD_STYLES;
  const style = chooseRecentSafe(pool, memory.recentStyles);
  pushRecent(memory.recentStyles, style, 6);
  return style;
}

function chooseVariant<T>(options: readonly T[]) {
  return options[randInt(0, options.length - 1)]!;
}

function shuffle<T>(items: readonly T[] | T[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex]!, next[index]!];
  }
  return next;
}

function sequenceBundleOptions(correct: number[]) {
  const targetSum = correct.reduce((sum, value) => sum + value, 0);
  const distractors = shuffle([
    correct.map((value, index) => (index === 0 ? value - 1 : value)),
    correct.map((value, index) => (index === correct.length - 1 ? value + 1 : value)),
    correct.map((value) => value + 1),
    correct.map((value) => value - 1),
  ])
    .map((values) => values.map((value) => Math.max(0, Math.min(20, value))))
    .filter((values, index, arr) => values.join(",") !== correct.join(",") && arr.findIndex((other) => other.join(",") === values.join(",")) === index)
    .slice(0, 2);
  const optionCount = distractors.length + 1;
  const correctPosition = randInt(0, optionCount - 1);
  const options: Array<{ id: string; numerals: number[] }> = [];
  for (let index = 0, distractorIndex = 0; index < optionCount; index += 1) {
    if (index === correctPosition) options.push({ id: `w12-bundle-${targetSum}-correct`, numerals: correct });
    else options.push({ id: `w12-bundle-${targetSum}-${index}`, numerals: distractors[distractorIndex++]! });
  }
  return { options, correctOptionId: options[correctPosition]!.id };
}

function makeOrderTapTask(task: Omit<GroundOrderTapTask, "kind">): PracticeTask {
  return { kind: "groundOrderTap", ...task };
}

function makeSequenceTask(task: Omit<GroundSequenceTask, "kind">): PracticeTask {
  return { kind: "groundSequence", ...task };
}

function clonePracticeTask<T extends PracticeTask>(task: T): T {
  const clone = { ...task } as T & Record<string, unknown>;
  if ("options" in task && Array.isArray(task.options)) {
    clone.options = task.options.map((option) =>
      typeof option === "object" && option !== null ? { ...option } : option
    );
  }
  if ("groups" in task && Array.isArray((task as { groups?: unknown[] }).groups)) {
    clone.groups = (task as { groups: Record<string, unknown>[] }).groups.map((group) => ({ ...group }));
  }
  if ("tiles" in task && Array.isArray((task as { tiles?: unknown[] }).tiles)) {
    clone.tiles = (task as { tiles: Record<string, unknown>[] }).tiles.map((tile) => ({ ...tile }));
  }
  if ("cards" in task && Array.isArray((task as { cards?: unknown[] }).cards)) {
    clone.cards = [...(task as { cards: unknown[] }).cards];
  }
  if ("shownSequence" in task && Array.isArray((task as { shownSequence?: unknown[] }).shownSequence)) {
    clone.shownSequence = [...(task as { shownSequence: unknown[] }).shownSequence];
  }
  return clone as T;
}

function tightenFlashTask(task: PracticeTask, memory: Week12Memory, difficulty: Difficulty, mode: "flash" | "memory") {
  if (task.kind !== "groundFlash") return task;
  const target = Math.max(4, pickTarget(memory, difficulty));
  const baseReveal = mode === "memory" ? 1350 : 1280;
  const scaledReveal = difficulty === "hard" ? baseReveal - 80 : difficulty === "easy" ? baseReveal + 120 : baseReveal;
  return {
    ...task,
    prompt: mode === "memory" ? "Remember the quantity." : "How many did you see?",
    speakText: mode === "memory" ? "Remember the quantity." : "How many did you see?",
    introPrompt: mode === "memory" ? "Hold the number image." : "See it fast.",
    targetNumber: target,
    displayNumber: target,
    objectType: pickObject(memory),
    patternLayout: target > 10
      ? pickLayout(memory, ["ten_frame", "symmetry"])
      : pickLayout(memory, ["dice", "domino", "symmetry", "ten_frame"]),
    revealMs: Math.max(560, scaledReveal),
    feedback: {
      correct: mode === "memory" ? "You held the number image!" : "Legend reflexes!",
      wrong: mode === "memory" ? "Picture the structure again." : "Look for the structure, not each dot.",
    },
  } satisfies PracticeTask;
}

function createQuickImageFlashTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const task = generatePrepWeek11TaskByKind("y0-w11-l2", difficulty, "quick_image_flash");
  return tightenFlashTask(task, getMemory(lessonId), difficulty, "flash");
}

function createNumberImageMemoryTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const task = generatePrepWeek11TaskByKind("y0-w11-l2", difficulty, "number_image_memory");
  return tightenFlashTask(task, getMemory(lessonId), difficulty, "memory");
}

function createRepresentationSwitchTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const options = [
    generatePrepWeek11TaskByKind("y0-w11-l2", difficulty, "double_ten_frame_match"),
    generatePrepWeek10TaskByKind("y0-w10-l1", difficulty, "teen_number_match"),
    generatePrepWeek10TaskByKind("y0-w10-l1", difficulty, "match_collection"),
  ] as const;
  const task = chooseVariant(options);
  if (task.kind === "groundMatch") {
    const teenTarget = Math.max(11, pickTarget(memory, difficulty));
    return {
      ...task,
      prompt: chooseVariant(["Which number matches?", "Find the matching number."]),
      speakText: "Which number matches?",
      introPrompt: "Switch the representation.",
      targetNumber: teenTarget,
      feedback: { correct: "Switch complete!", wrong: "Match the structure to the number." },
    } satisfies PracticeTask;
  }
  return task;
}

function createTeenNumberBuilderTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const task = generatePrepWeek10TaskByKind("y0-w10-l3", difficulty, "teen_builder");
  if (task.kind !== "groundBuild") return task;
  const targetNumber = Math.max(11, pickTarget(memory, difficulty));
  return {
    ...task,
    prompt: `Build ${targetNumber}.`,
    speakText: `Build ${numberWord(targetNumber)}.`,
    introPrompt: "Build with ten and extras.",
    targetNumber,
    showExample: false,
    hideSplitSupport: true,
    feedback: { correct: "Teen structure built!", wrong: "Use ten and extras to build it." },
  } satisfies PracticeTask;
}

function createFlexibleBuilderTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const task = generatePrepWeek10TaskByKind("y0-w10-l3", difficulty, "teen_builder");
  if (task.kind !== "groundBuild") return task;
  const targetNumber = Math.max(12, pickTarget(memory, difficulty));
  return {
    ...task,
    prompt: `Build ${targetNumber} another way.`,
    speakText: `Build ${numberWord(targetNumber)} another way.`,
    introPrompt: "Forge the whole in new parts.",
    targetNumber,
    objectType: pickObject(memory),
    visualStyle: pickBuildStyle(memory, ["double_ten_frame", "reactor_cells", "build_trays"]),
    showExample: false,
    hideSplitSupport: true,
    feedback: { correct: "Flexible thinking!", wrong: "Build the whole in a different way." },
  } satisfies PracticeTask;
}

function createMissingPartChallengeTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const variant = chooseVariant(["ten", "teen", "twenty"] as const);
  if (variant === "ten") {
    const task = generatePrepWeek6TaskByKind("y0-w6-l3", difficulty, "build_missing_part_whole");
    if (task.kind !== "groundBuild") return task;
    return {
      ...task,
      prompt: "What part is missing to make 10?",
      speakText: "What part is missing to make ten?",
      introPrompt: "Find the missing part.",
      objectType: pickObject(memory),
      visualStyle: pickBuildStyle(memory, ["reactor_cells", "build_trays", "collection_shelves"]),
      showExample: false,
      hideSplitSupport: true,
      feedback: { correct: "Missing part found!", wrong: "Look for the spaces still needed." },
    } satisfies PracticeTask;
  }

  const task = generatePrepWeek10TaskByKind("y0-w10-l3", difficulty, "build_missing_part");
  if (task.kind !== "groundBuild") return task;
  const targetNumber = variant === "twenty" ? 20 : Math.max(14, pickTarget(memory, difficulty));
  const shownAmount = variant === "twenty" ? randInt(12, 18) : Math.max(10, targetNumber - randInt(2, 6));
  return {
    ...task,
    prompt: variant === "twenty" ? "How many more to make 20?" : `What part is missing to make ${targetNumber}?`,
    speakText: variant === "twenty" ? "How many more to make twenty?" : `What part is missing to make ${numberWord(targetNumber)}?`,
    introPrompt: "Spot the hidden amount.",
    targetNumber,
    startingBuilt: shownAmount,
    objectType: pickObject(memory),
    visualStyle: pickBuildStyle(memory, ["double_ten_frame", "reactor_cells", "collection_shelves"]),
    showExample: false,
    hideSplitSupport: true,
    feedback: { correct: "Great missing-part reasoning!", wrong: "Find the amount that completes the whole." },
  } satisfies PracticeTask;
}

function createMakeTenTwentyTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const variant = chooseVariant(["ten", "twenty"] as const);
  if (variant === "ten") {
    const task = generatePrepWeek6TaskByKind("y0-w6-l2", difficulty, "make_10_another_way");
    if (task.kind !== "groundBuild") return task;
    return {
      ...task,
      prompt: "Make 10 another way.",
      speakText: "Make ten another way.",
      introPrompt: "Forge ten with two parts.",
      objectType: pickObject(memory),
      visualStyle: pickBuildStyle(memory, ["reactor_cells", "build_trays", "collection_shelves"]),
      showExample: false,
      hideSplitSupport: true,
      feedback: { correct: "Ten forged another way!", wrong: "Use two parts that still make ten." },
    } satisfies PracticeTask;
  }

  const task = generatePrepWeek10TaskByKind("y0-w10-l3", difficulty, "teen_builder");
  if (task.kind !== "groundBuild") return task;
  return {
    ...task,
    prompt: "Make 20 with two parts.",
    speakText: "Make twenty with two parts.",
    introPrompt: "Think in tens and extras.",
    targetNumber: 20,
    objectType: pickObject(memory),
    visualStyle: pickBuildStyle(memory, ["double_ten_frame", "reactor_cells"]),
    showExample: false,
    hideSplitSupport: true,
    feedback: { correct: "Twenty complete!", wrong: "Use two parts to build the whole of twenty." },
  } satisfies PracticeTask;
}

function createSameWholeDifferentPartsTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const variant = chooseVariant(["ten", "teen"] as const);
  if (variant === "ten") {
    const task = generatePrepWeek6TaskByKind("y0-w6-l3", difficulty, "same_whole");
    if (task.kind !== "groundBuild") return task;
    return {
      ...task,
      prompt: "Build the same whole another way.",
      speakText: "Build the same whole another way.",
      introPrompt: "Same whole, new parts.",
      objectType: pickObject(memory),
      visualStyle: pickBuildStyle(memory, ["build_trays", "reactor_cells", "collection_shelves"]),
      showExample: false,
      hideSplitSupport: true,
      feedback: { correct: "Same whole, different parts!", wrong: "Use different parts that still make the same whole." },
    } satisfies PracticeTask;
  }

  const task = generatePrepWeek10TaskByKind("y0-w10-l3", difficulty, "build_same_amount");
  if (task.kind !== "groundBuild") return task;
  const targetNumber = Math.max(12, pickTarget(memory, difficulty));
  return {
    ...task,
    prompt: "Build the same whole in a new way.",
    speakText: "Build the same whole in a new way.",
    introPrompt: "Match the whole, not the look.",
    targetNumber,
    objectType: pickObject(memory),
    visualStyle: pickBuildStyle(memory, ["double_ten_frame", "reactor_cells", "build_trays"]),
    showExample: false,
    hideSplitSupport: true,
    feedback: { correct: "You rebuilt the whole!", wrong: "Keep the whole the same, even with new parts." },
  } satisfies PracticeTask;
}

function createOrderingMasteryTask(lessonId: string): PracticeTask {
  const memory = getMemory(lessonId);
  const direction: "ASC" | "DESC" = randInt(0, 1) === 0 ? "ASC" : "DESC";
  const count = memory.cursor >= 5 ? 6 : 5;
  const patterns: number[][] = [
    [1, 4, 6, 8, 15, 18],
    [19, 13, 17, 12, 15],
    [14, 16, 15, 12, 18],
    [18, 17, 16, 15, 12],
    [3, 7, 11, 14, 19],
  ];
  let numerals: number[] = [...chooseVariant(patterns)];
  if (numerals.length > count) numerals = numerals.slice(0, count);
  if (numerals.length < count) {
    const extras = shuffle(Array.from({ length: 20 }, (_, index) => index + 1).filter((value) => !numerals.includes(value))).slice(0, count - numerals.length);
    numerals = [...numerals, ...extras];
  }
  const shuffled = shuffle(numerals);
  const ordered = [...numerals].sort((a, b) => (direction === "ASC" ? a - b : b - a));
  return makeOrderTapTask({
    prompt: direction === "ASC" ? "Order the numbers from smallest to largest." : "Order the numbers from largest to smallest.",
    speakText: direction === "ASC" ? "Order the numbers from smallest to largest." : "Order the numbers from largest to smallest.",
    introPrompt: "Mastery floor: sort without hints.",
    targetNumber: ordered[0]!,
    direction,
    uiMode: "order",
    badgeLabel: "Ordering Mastery",
    tiles: shuffled.map((numeral, index) => ({ id: `w12-order-${numeral}-${index}`, numeral })),
    feedback: { correct: "Ordering mastery complete!", wrong: "Check the full order again." },
  });
}

function createMultiMissingReasoningTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const variant = chooseVariant(["forward", "backward", "between"] as const);
  if (variant === "forward") {
    const start = Math.max(10, pickTarget(memory, difficulty) - 3);
    const correct = [start + 1, start + 2];
    const bundle = sequenceBundleOptions(correct);
    return makeSequenceTask({
      prompt: "Fill the missing numbers.",
      speakText: "Fill the missing numbers.",
      introPrompt: "Track both missing steps.",
      targetNumber: correct[1],
      sequence: [start, "__", "__", start + 3, start + 4],
      options: bundle.options,
      correctOptionId: bundle.correctOptionId,
      feedback: { correct: "You tracked both gaps!", wrong: "Check each missing step carefully." },
    });
  }
  if (variant === "backward") {
    const mid = Math.max(17, pickTarget(memory, difficulty));
    const correct = [mid + 1, mid - 2];
    const bundle = sequenceBundleOptions(correct);
    return makeSequenceTask({
      prompt: "Count backward and fill the gaps.",
      speakText: "Count backward and fill the gaps.",
      introPrompt: "Step back each time.",
      targetNumber: mid,
      sequence: ["__", mid, mid - 1, "__", mid - 3],
      options: bundle.options,
      correctOptionId: bundle.correctOptionId,
      feedback: { correct: "Backward reasoning solved!", wrong: "Count back one step at a time." },
    });
  }
  const base = Math.max(14, pickTarget(memory, difficulty));
  const correct = [base + 1, base + 3];
  const bundle = sequenceBundleOptions(correct);
  return makeSequenceTask({
    prompt: "Fill the two missing numbers.",
    speakText: "Fill the two missing numbers.",
    introPrompt: "Look for the pattern across the whole path.",
    targetNumber: correct[0],
    sequence: [base, "__", base + 2, "__", base + 4],
    options: bundle.options,
    correctOptionId: bundle.correctOptionId,
    feedback: { correct: "You found both missing numbers!", wrong: "Use all the numbers you can see." },
  });
}

function createFlexibleNumberBuildingMasteryTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const pick = randInt(0, 3);
  if (pick === 0) {
    const task = createFlexibleBuilderTask(lessonId, difficulty);
    return task.kind === "groundBuild" ? { ...task, introPrompt: "Mastery forge.", feedback: { correct: "You rebuilt the number!", wrong: "Try a different split for the same whole." } } satisfies PracticeTask : task;
  }
  if (pick === 1) {
    const task = createMissingPartChallengeTask(lessonId, difficulty);
    return task.kind === "groundBuild" ? { ...task, introPrompt: "Mastery forge.", feedback: { correct: "Missing-part mastery!", wrong: "Find the hidden part that completes the whole." } } satisfies PracticeTask : task;
  }
  if (pick === 2) {
    const task = createMakeTenTwentyTask(lessonId, difficulty);
    return task.kind === "groundBuild" ? { ...task, introPrompt: "Mastery forge.", feedback: { correct: "Whole completed!", wrong: "Use the parts to make the target whole." } } satisfies PracticeTask : task;
  }
  const task = createSameWholeDifferentPartsTask(lessonId, difficulty);
  return task.kind === "groundBuild" ? { ...task, introPrompt: "Mastery forge.", feedback: { correct: "Same whole mastered!", wrong: "Keep the whole the same with new parts." } } satisfies PracticeTask : task;
}

function createPracticalApplicationTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const pick = randInt(0, 3);
  if (pick === 0) {
    const task = generatePrepWeek10TaskByKind("y0-w10-l3", difficulty, "which_is_bigger");
    if (task.kind === "groundCompare") {
      return {
        ...task,
        prompt: "Which reactor has more energy?",
        speakText: "Which reactor has more energy?",
        introPrompt: "Portal chamber.",
        referenceGroup: undefined,
        feedback: { correct: "Reactor comparison solved!", wrong: "These collections are close. Compare again." },
      } satisfies PracticeTask;
    }
    return task;
  }
  if (pick === 1) {
    const task = generatePrepWeek10TaskByKind("y0-w10-l1", difficulty, "match_collection");
    if (task.kind === "groundMatch") {
      const memory = getMemory(lessonId);
      const target = Math.max(12, pickTarget(memory, difficulty));
      return {
        ...task,
        prompt: `Which collection matches ${target}?`,
        speakText: `Which collection matches ${numberWord(target)}?`,
        introPrompt: "Portal chamber.",
        targetNumber: target,
        feedback: { correct: "Collection chosen correctly!", wrong: "Choose the collection that matches the number." },
      } satisfies PracticeTask;
    }
    return task;
  }
  if (pick === 2) {
    const task = generatePrepWeek10TaskByKind("y0-w10-l3", difficulty, "balance_groups");
    return task.kind === "groundBuild" ? {
      ...task,
      prompt: "Can both robots have the same amount?",
      speakText: "Can both robots have the same amount?",
      introPrompt: "Robot lab.",
      showExample: false,
      hideSplitSupport: true,
      feedback: { correct: "Equal sharing solved!", wrong: "Make both groups show the same amount." },
    } satisfies PracticeTask : task;
  }
  const task = generatePrepWeek11TaskByKind("y0-w11-l3", difficulty, "master_floor");
  switch (task.kind) {
    case "groundOrderTap":
      return { ...task, prompt: "Challenge room: Order the numbers.", speakText: "Challenge room. Order the numbers.", introPrompt: "Mastery chamber.", badgeLabel: "Mixed Challenge" } satisfies PracticeTask;
    case "groundSequence":
      return { ...task, prompt: "Challenge room: Solve the path.", speakText: "Challenge room. Solve the path.", introPrompt: "Mastery chamber." } satisfies PracticeTask;
    case "groundBuild":
      return { ...task, introPrompt: "Mastery chamber.", showExample: false, hideSplitSupport: true } satisfies PracticeTask;
    case "groundCompare":
      return { ...task, introPrompt: "Mastery chamber.", referenceGroup: undefined } satisfies PracticeTask;
    default:
      return task;
  }
}

function nextKind(memory: Week12Memory, lessonId: string) {
  const rotation = lessonId === "y0-w12-l3" ? LESSON3_ROTATION : lessonId === "y0-w12-l2" ? LESSON2_ROTATION : LESSON1_ROTATION;
  const kind = rotation[memory.cursor % rotation.length]!;
  memory.cursor += 1;
  return kind;
}

function createLesson1Task(lessonId: string, difficulty: Difficulty, kind: Lesson1Kind): PracticeTask {
  switch (kind) {
    case "quick_image_flash":
      return createQuickImageFlashTask(lessonId, difficulty);
    case "representation_switch":
      return createRepresentationSwitchTask(lessonId, difficulty);
    case "teen_number_builder":
      return createTeenNumberBuilderTask(lessonId, difficulty);
    case "number_image_memory":
      return createNumberImageMemoryTask(lessonId, difficulty);
  }
}

function createLesson2Task(lessonId: string, difficulty: Difficulty, kind: Lesson2Kind): PracticeTask {
  switch (kind) {
    case "flexible_builder":
      return createFlexibleBuilderTask(lessonId, difficulty);
    case "missing_part_challenge":
      return createMissingPartChallengeTask(lessonId, difficulty);
    case "make_ten_twenty":
      return createMakeTenTwentyTask(lessonId, difficulty);
    case "same_whole_different_parts":
      return createSameWholeDifferentPartsTask(lessonId, difficulty);
  }
}

function createLesson3Task(lessonId: string, difficulty: Difficulty, kind: Lesson3Kind): PracticeTask {
  switch (kind) {
    case "ordering_mastery":
      return createOrderingMasteryTask(lessonId);
    case "multi_missing_reasoning":
      return createMultiMissingReasoningTask(lessonId, difficulty);
    case "flexible_number_building":
      return createFlexibleNumberBuildingMasteryTask(lessonId, difficulty);
    case "practical_application":
      return createPracticalApplicationTask(lessonId, difficulty);
  }
}

export function generatePrepWeek12Task(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const kind = nextKind(memory, lessonId);
  if (lessonId === "y0-w12-l3") {
    return clonePracticeTask(createLesson3Task(lessonId, difficulty, kind as Lesson3Kind));
  }
  if (lessonId === "y0-w12-l2") {
    return clonePracticeTask(createLesson2Task(lessonId, difficulty, kind as Lesson2Kind));
  }
  return clonePracticeTask(createLesson1Task(lessonId, difficulty, kind as Lesson1Kind));
}

export function generatePrepWeek12TaskByKind(
  lessonId: string,
  difficulty: Difficulty,
  kind: Lesson1Kind | Lesson2Kind
): PracticeTask {
  if (lessonId === "y0-w12-l3") {
    return clonePracticeTask(createLesson3Task(lessonId, difficulty, kind as Lesson3Kind));
  }
  if (lessonId === "y0-w12-l2") {
    return clonePracticeTask(createLesson2Task(lessonId, difficulty, kind as Lesson2Kind));
  }
  return clonePracticeTask(createLesson1Task(lessonId, difficulty, kind as Lesson1Kind));
}

export function resetPrepWeek12TaskSessionState() {
  memoryByLesson.clear();
}
