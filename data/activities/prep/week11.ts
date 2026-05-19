import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { generatePrepWeek10TaskByKind } from "@/data/activities/prep/week10";

type GroundObjectType = Extract<PracticeTask, { kind: "groundBuild" }>["objectType"];
type GroundPatternLayout = NonNullable<Extract<PracticeTask, { kind: "groundFlash" }>["patternLayout"]>;
type GroundSequenceTask = Extract<PracticeTask, { kind: "groundSequence" }>;
type GroundCompareTask = Extract<PracticeTask, { kind: "groundCompare" }>;

type Lesson1Kind =
  | "tap_number"
  | "quick_count_flash"
  | "what_comes_next"
  | "what_comes_before"
  | "count_backward"
  | "match_collection"
  | "which_is_bigger"
  | "which_is_smaller"
  | "order_the_numbers"
  | "number_path_review"
  | "teen_number_match"
  | "build_the_number"
  | "same_or_different"
  | "who_is_first"
  | "review_bonus_round";

type Week11Memory = {
  cursor: number;
  recentTargets: number[];
  recentKinds: string[];
  recentPositions: number[];
  recentObjects: GroundObjectType[];
  recentLayouts: GroundPatternLayout[];
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

const ROTATION: Lesson1Kind[] = [
  "tap_number",
  "quick_count_flash",
  "what_comes_next",
  "what_comes_before",
  "count_backward",
  "match_collection",
  "which_is_bigger",
  "which_is_smaller",
  "order_the_numbers",
  "number_path_review",
  "teen_number_match",
  "build_the_number",
  "same_or_different",
  "who_is_first",
  "review_bonus_round",
];

const memoryByLesson = new Map<string, Week11Memory>();

function getMemory(lessonId: string) {
  const existing = memoryByLesson.get(lessonId);
  if (existing) return existing;
  const created: Week11Memory = {
    cursor: 0,
    recentTargets: [],
    recentKinds: [],
    recentPositions: [],
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

function stageTargets(memory: Week11Memory, difficulty: Difficulty) {
  if (difficulty === "easy") {
    if (memory.cursor < 5) return [8, 9, 10, 11, 12, 13, 14];
    if (memory.cursor < 10) return [10, 11, 12, 13, 14, 15, 16];
    return [11, 12, 13, 14, 15, 16, 17, 18];
  }
  if (difficulty === "medium") return [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  return [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
}

function pickTarget(memory: Week11Memory, difficulty: Difficulty) {
  const target = chooseRecentSafe(stageTargets(memory, difficulty), memory.recentTargets);
  pushRecent(memory.recentTargets, target, 6);
  return target;
}

function pickObject(memory: Week11Memory) {
  const objectType = chooseRecentSafe(OBJECTS, memory.recentObjects);
  pushRecent(memory.recentObjects, objectType, 6);
  return objectType;
}

function pickLayout(memory: Week11Memory, preferred?: GroundPatternLayout[]) {
  const pool: GroundPatternLayout[] = preferred ?? ["dice", "domino", "symmetry", "ten_frame"];
  const layout = chooseRecentSafe(pool, memory.recentLayouts);
  pushRecent(memory.recentLayouts, layout, 6);
  return layout;
}

function chooseAnswerPosition(memory: Week11Memory, optionCount: number) {
  const position = chooseRecentSafe(Array.from({ length: optionCount }, (_, index) => index), memory.recentPositions);
  pushRecent(memory.recentPositions, position, 5);
  return position;
}

function numeralOptions(target: number, memory: Week11Memory, optionCount = 3) {
  const nearby = shuffle(
    Array.from({ length: 21 }, (_, index) => index).filter((value) => value !== target && Math.abs(value - target) <= 3)
  );
  const distractors = nearby.slice(0, optionCount - 1);
  const correctPosition = chooseAnswerPosition(memory, optionCount);
  const ordered = new Array<number>(optionCount);
  ordered[correctPosition] = target;
  const openPositions = Array.from({ length: optionCount }, (_, index) => index).filter((index) => index !== correctPosition);
  openPositions.forEach((position, index) => {
    ordered[position] = distractors[index] ?? target + index + 1;
  });
  return ordered.map((numeral, index) => ({ id: `w11-n-${target}-${index}-${numeral}`, numeral }));
}

function makeSequenceTask(task: Omit<GroundSequenceTask, "kind">): PracticeTask {
  return { kind: "groundSequence", ...task };
}

function makeCompareTask(task: Omit<GroundCompareTask, "kind">): PracticeTask {
  return { kind: "groundCompare", ...task };
}

function normalizeReviewCopy(task: PracticeTask, overrides?: { prompt?: string; speakText?: string }) {
  const reviewIntro = "Review run.";
  switch (task.kind) {
    case "groundHunt":
      return {
        ...task,
        prompt: overrides?.prompt ?? task.prompt,
        speakText: overrides?.speakText ?? task.speakText,
        introPrompt: reviewIntro,
        feedback: { correct: "Great reviewing!", wrong: "Check the number again." },
      } satisfies PracticeTask;
    case "groundFlash":
      return {
        ...task,
        prompt: overrides?.prompt ?? task.prompt,
        speakText: overrides?.speakText ?? task.speakText,
        introPrompt: "Watch and remember.",
        feedback: { correct: "You remembered it!", wrong: "Try that review flash again." },
      } satisfies PracticeTask;
    case "groundMatch":
      return {
        ...task,
        prompt: overrides?.prompt ?? task.prompt,
        speakText: overrides?.speakText ?? task.speakText,
        introPrompt: reviewIntro,
        feedback: { correct: "Matched perfectly!", wrong: "Check the quantity again." },
      } satisfies PracticeTask;
    case "groundCompare":
      return {
        ...task,
        prompt: overrides?.prompt ?? task.prompt,
        speakText: overrides?.speakText ?? task.speakText,
        introPrompt: "Compare carefully.",
        feedback: { correct: "Great comparing!", wrong: "Compare those groups again." },
      } satisfies PracticeTask;
    case "groundOrderTap":
      return {
        ...task,
        prompt: overrides?.prompt ?? task.prompt,
        speakText: overrides?.speakText ?? task.speakText,
        introPrompt: "Put them in order.",
        badgeLabel: "Review Sort",
        feedback: { correct: "Sorted nicely!", wrong: "Try the order again." },
      } satisfies PracticeTask;
    case "groundBuild":
      return {
        ...task,
        prompt: overrides?.prompt ?? task.prompt,
        speakText: overrides?.speakText ?? task.speakText,
        introPrompt: "Build and check.",
        showExample: false,
        feedback: { correct: "Built just right!", wrong: "Try the target amount again." },
      } satisfies PracticeTask;
    case "groundOrdinal":
      return {
        ...task,
        prompt: overrides?.prompt ?? task.prompt,
        speakText: overrides?.speakText ?? task.speakText,
        introPrompt: "Quick position review.",
        feedback: { correct: "You found the position!", wrong: "Check that place again." },
      } satisfies PracticeTask;
    default:
      return task;
  }
}

function createTapNumberTask(difficulty: Difficulty): PracticeTask {
  const task = generatePrepWeek10TaskByKind("y0-w10-l1", difficulty, "tap_number_quiz");
  if (task.kind !== "groundHunt") return task;
  return normalizeReviewCopy(task, {
    prompt: `Tap ${task.targetNumber}.`,
    speakText: `Tap ${numberWord(task.targetNumber)}.`,
  });
}

function createQuickCountFlashTask(difficulty: Difficulty): PracticeTask {
  return normalizeReviewCopy(
    generatePrepWeek10TaskByKind("y0-w10-l1", difficulty, "quick_count_flash"),
    { prompt: "Quick count flash!", speakText: "Quick count flash." }
  );
}

function createWhatComesNextTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const start = Math.max(0, pickTarget(memory, difficulty) - 2);
  const target = start + 3;
  const options = numeralOptions(target, memory, 3);
  return makeSequenceTask({
    prompt: "What comes next?",
    speakText: "What comes next?",
    introPrompt: "Count on.",
    targetNumber: target,
    sequence: [start, start + 1, start + 2, "__"],
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "Sequence solved!", wrong: "Count on one more." },
  });
}

function createWhatComesBeforeTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = Math.max(0, pickTarget(memory, difficulty) - 1);
  const options = numeralOptions(target, memory, 3);
  return makeSequenceTask({
    prompt: "What comes before?",
    speakText: "What comes before?",
    introPrompt: "Think back one.",
    targetNumber: target,
    sequence: ["__", target + 1] as GroundSequenceTask["sequence"],
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "You found it!", wrong: "Look one step back." },
  });
}

function createCountBackwardTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const start = Math.max(3, pickTarget(memory, difficulty) + 2);
  const target = start - 2;
  const options = numeralOptions(target, memory, 3);
  return makeSequenceTask({
    prompt: "Count backward.",
    speakText: "Count backward.",
    introPrompt: "Step back.",
    targetNumber: target,
    sequence: [start, start - 1, "__", start - 3],
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "Backward path solved!", wrong: "Count back carefully." },
  });
}

function createMatchCollectionTask(difficulty: Difficulty): PracticeTask {
  return normalizeReviewCopy(
    generatePrepWeek10TaskByKind("y0-w10-l1", difficulty, "match_collection"),
    { prompt: "Match the collection.", speakText: "Match the collection." }
  );
}

function createWhichIsBiggerTask(difficulty: Difficulty): PracticeTask {
  return normalizeReviewCopy(
    generatePrepWeek10TaskByKind("y0-w10-l1", difficulty, "find_biggest"),
    { prompt: "Which is bigger?", speakText: "Which is bigger?" }
  );
}

function createWhichIsSmallerTask(difficulty: Difficulty): PracticeTask {
  return normalizeReviewCopy(
    generatePrepWeek10TaskByKind("y0-w10-l1", difficulty, "find_smallest"),
    { prompt: "Which is smaller?", speakText: "Which is smaller?" }
  );
}

function createOrderTheNumbersTask(difficulty: Difficulty): PracticeTask {
  return normalizeReviewCopy(
    generatePrepWeek10TaskByKind("y0-w10-l1", difficulty, "order_numbers"),
    { prompt: "Order the numbers.", speakText: "Order the numbers." }
  );
}

function createNumberPathReviewTask(difficulty: Difficulty): PracticeTask {
  return normalizeReviewCopy(
    generatePrepWeek10TaskByKind("y0-w10-l1", difficulty, "number_path_rush"),
    { prompt: "Number path review.", speakText: "Number path review." }
  );
}

function createTeenNumberMatchTask(difficulty: Difficulty): PracticeTask {
  return normalizeReviewCopy(
    generatePrepWeek10TaskByKind("y0-w10-l1", difficulty, "teen_number_match"),
    { prompt: "Match the teen number.", speakText: "Match the teen number." }
  );
}

function createBuildTheNumberTask(difficulty: Difficulty): PracticeTask {
  return normalizeReviewCopy(
    generatePrepWeek10TaskByKind("y0-w10-l3", difficulty, "build_number_lab"),
    { prompt: "Build the number.", speakText: "Build the number." }
  );
}

function createSameOrDifferentTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const a = pickTarget(memory, difficulty);
  const same = randInt(0, 1) === 0;
  const difference = randInt(1, 2);
  const b = same ? a : Math.max(0, Math.min(20, a + (randInt(0, 1) === 0 ? difference : -difference)));
  return makeCompareTask({
    prompt: "Same or different?",
    speakText: "Same or different?",
    introPrompt: "Check both groups.",
    targetNumber: same ? a : b,
    comparisonType: "different",
    helperVariant: "flash",
    groups: [
      { id: `same-a-${a}`, quantity: a, objectType: pickObject(memory), patternLayout: pickLayout(memory, a >= 10 ? ["ten_frame", "symmetry"] : undefined) },
      { id: `same-b-${b}`, quantity: b, objectType: pickObject(memory), patternLayout: pickLayout(memory, b >= 10 ? ["ten_frame", "symmetry"] : undefined) },
    ],
    correctGroupId: same ? "same" : "different",
    feedback: { correct: "Nice checking!", wrong: "Count and compare again." },
  });
}

function createWhoIsFirstTask(difficulty: Difficulty): PracticeTask {
  return normalizeReviewCopy(
    generatePrepWeek10TaskByKind("y0-w10-l1", difficulty, "who_is_first"),
    { prompt: "Who is first?", speakText: "Who is first?" }
  );
}

function createReviewBonusRoundTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const pick = randInt(0, 3);
  if (pick === 0) return createWhichIsBiggerTask(difficulty);
  if (pick === 1) return createNumberPathReviewTask(difficulty);
  if (pick === 2) return createBuildTheNumberTask(difficulty);
  return createSameOrDifferentTask(lessonId, difficulty);
}

function nextKind(memory: Week11Memory) {
  const kind = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  pushRecent(memory.recentKinds, kind, 6);
  return kind;
}

function generateLesson1Task(lessonId: string, difficulty: Difficulty, kind: Lesson1Kind): PracticeTask {
  switch (kind) {
    case "tap_number":
      return createTapNumberTask(difficulty);
    case "quick_count_flash":
      return createQuickCountFlashTask(difficulty);
    case "what_comes_next":
      return createWhatComesNextTask(lessonId, difficulty);
    case "what_comes_before":
      return createWhatComesBeforeTask(lessonId, difficulty);
    case "count_backward":
      return createCountBackwardTask(lessonId, difficulty);
    case "match_collection":
      return createMatchCollectionTask(difficulty);
    case "which_is_bigger":
      return createWhichIsBiggerTask(difficulty);
    case "which_is_smaller":
      return createWhichIsSmallerTask(difficulty);
    case "order_the_numbers":
      return createOrderTheNumbersTask(difficulty);
    case "number_path_review":
      return createNumberPathReviewTask(difficulty);
    case "teen_number_match":
      return createTeenNumberMatchTask(difficulty);
    case "build_the_number":
      return createBuildTheNumberTask(difficulty);
    case "same_or_different":
      return createSameOrDifferentTask(lessonId, difficulty);
    case "who_is_first":
      return createWhoIsFirstTask(difficulty);
    case "review_bonus_round":
      return createReviewBonusRoundTask(lessonId, difficulty);
  }
}

export function generatePrepWeek11Task(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const kind = nextKind(memory);
  return generateLesson1Task(lessonId, difficulty, kind);
}

export function resetPrepWeek11TaskSessionState() {
  memoryByLesson.clear();
}
