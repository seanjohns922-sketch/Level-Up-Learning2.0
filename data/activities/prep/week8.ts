import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

type GroundObjectType = Extract<PracticeTask, { kind: "groundTapCount" }>["objectType"];
type GroundPatternLayout = NonNullable<Extract<PracticeTask, { kind: "groundFlash" }>["patternLayout"]>;
type GroundSequenceTask = Extract<PracticeTask, { kind: "groundSequence" }>;
type GroundOrderTapTask = Extract<PracticeTask, { kind: "groundOrderTap" }>;
type GroundMatchTask = Extract<PracticeTask, { kind: "groundMatch" }>;
type GroundCompareTask = Extract<PracticeTask, { kind: "groundCompare" }>;
type GroundFlashTask = Extract<PracticeTask, { kind: "groundFlash" }>;

type Week8Memory = {
  cursor: number;
  recentStarts: number[];
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
];
const LESSON1_ROTATION = [
  "missing_forward",
  "what_comes_next",
  "what_comes_before",
  "number_path",
  "complete_row",
  "numbot_trail",
  "count_forward",
  "count_backward",
  "ten_path",
  "number_ladder",
  "which_missing",
  "drag_missing",
  "quick_flash",
  "same_path",
  "build_path",
] as const;
const LESSON2_ROTATION = [
  "follow_path",
  "broken_trail",
  "stepping_stones",
  "count_forward_path",
  "count_backward_path",
  "number_maze",
  "what_next_trail",
  "what_before_trail",
  "number_line_hops",
  "complete_trail",
  "portal_countdown",
  "same_path_trails",
  "river_crossing",
  "quick_path_flash",
  "build_trail",
] as const;

const memoryByLesson = new Map<string, Week8Memory>();

function getMemory(lessonId: string) {
  const existing = memoryByLesson.get(lessonId);
  if (existing) return existing;
  const created: Week8Memory = {
    cursor: 0,
    recentStarts: [],
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
    "zero","one","two","three","four","five","six","seven","eight","nine","ten",
    "eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty",
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

function stageForwardPool(memory: Week8Memory, difficulty: Difficulty) {
  if (difficulty === "easy") {
    if (memory.cursor < 5) return [0, 1, 2, 3, 4, 5, 6, 7];
    if (memory.cursor < 12) return [6, 7, 8, 9, 10, 11, 12, 13];
    return [10, 11, 12, 13, 14, 15, 16, 17];
  }
  if (difficulty === "medium") return [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  return [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
}

function stageBackwardPool(memory: Week8Memory, difficulty: Difficulty) {
  if (difficulty === "easy") return [8, 9, 10, 11, 12, 13, 14];
  if (difficulty === "medium") return [11, 12, 13, 14, 15, 16, 17, 18];
  return [14, 15, 16, 17, 18, 19, 20];
}

function pickForwardStart(memory: Week8Memory, difficulty: Difficulty, span = 4) {
  const pool = stageForwardPool(memory, difficulty).filter((value) => value + span <= 20);
  const start = chooseRecentSafe(pool, memory.recentStarts);
  pushRecent(memory.recentStarts, start, 6);
  return start;
}

function pickBackwardStart(memory: Week8Memory, difficulty: Difficulty, span = 3) {
  const pool = stageBackwardPool(memory, difficulty).filter((value) => value - span >= 0);
  const start = chooseRecentSafe(pool, memory.recentStarts);
  pushRecent(memory.recentStarts, start, 6);
  return start;
}

function pickObject(memory: Week8Memory, preferred?: GroundObjectType[]) {
  const objectType = chooseRecentSafe(preferred ?? OBJECTS, memory.recentObjects);
  pushRecent(memory.recentObjects, objectType, 6);
  return objectType;
}

function pickLayout(memory: Week8Memory, preferred?: GroundPatternLayout[]) {
  const pool: GroundPatternLayout[] = preferred ?? ["ten_frame", "symmetry", "domino"];
  const layout = chooseRecentSafe(pool, memory.recentLayouts);
  pushRecent(memory.recentLayouts, layout, 6);
  return layout;
}

function nextLesson1Kind(memory: Week8Memory) {
  const kind = LESSON1_ROTATION[memory.cursor % LESSON1_ROTATION.length]!;
  memory.cursor += 1;
  pushRecent(memory.recentKinds, kind, 6);
  return kind;
}

function nextLesson2Kind(memory: Week8Memory) {
  const kind = LESSON2_ROTATION[memory.cursor % LESSON2_ROTATION.length]!;
  memory.cursor += 1;
  pushRecent(memory.recentKinds, kind, 6);
  return kind;
}

function chooseAnswerPosition(memory: Week8Memory, optionCount: number) {
  const position = chooseRecentSafe(Array.from({ length: optionCount }, (_, index) => index), memory.recentPositions);
  pushRecent(memory.recentPositions, position, 5);
  return position;
}

function numeralOptions(target: number, memory: Week8Memory, optionCount = 3) {
  const nearby = shuffle(Array.from({ length: 21 }, (_, index) => index).filter((value) => value !== target && Math.abs(value - target) <= 2));
  const fallback = shuffle(Array.from({ length: 21 }, (_, index) => index).filter((value) => value !== target));
  const distractors = (nearby.length >= optionCount - 1 ? nearby : fallback).slice(0, optionCount - 1);
  const correctPosition = chooseAnswerPosition(memory, optionCount);
  const ordered = new Array<number>(optionCount);
  ordered[correctPosition] = target;
  const positions = Array.from({ length: optionCount }, (_, index) => index).filter((index) => index !== correctPosition);
  positions.forEach((position, index) => {
    ordered[position] = distractors[index]!;
  });
  return ordered.map((numeral, index) => ({ id: `num-${target}-${index}-${numeral}`, numeral }));
}

function makeSequenceTask(task: Omit<GroundSequenceTask, "kind">): PracticeTask {
  return { kind: "groundSequence", ...task };
}

function makeOrderTapTask(task: Omit<GroundOrderTapTask, "kind">): PracticeTask {
  return { kind: "groundOrderTap", ...task };
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

function createMissingForwardTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const start = pickForwardStart(memory, difficulty, 3);
  const target = start + 2;
  const options = numeralOptions(target, memory);
  return makeSequenceTask({
    prompt: "What number is missing?",
    speakText: "What number is missing?",
    targetNumber: target,
    sequence: [start, start + 1, "__", start + 3],
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "You found the missing number!", wrong: "Count on carefully." },
  });
}

function createWhatComesNextTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const start = pickForwardStart(memory, difficulty, 3);
  const target = start + 3;
  const options = numeralOptions(target, memory);
  return makeSequenceTask({
    prompt: "What comes next?",
    speakText: "What comes next?",
    targetNumber: target,
    sequence: [start, start + 1, start + 2, "__"],
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "Great detective work!", wrong: "Keep counting forward." },
  });
}

function createWhatComesBeforeTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = pickForwardStart(memory, difficulty, 1) + 1;
  const options = numeralOptions(target - 1, memory);
  return makeMatchTask({
    prompt: `What comes before ${target}?`,
    speakText: `What comes before ${numberWord(target)}?`,
    targetNumber: target - 1,
    visualType: "ground-number-card",
    promptType: "number_to_numeral",
    shownNumeral: target,
    options: options.map((option) => ({ id: option.id, kind: "numeral" as const, numeral: option.numeral })),
    correctOptionId: options.find((option) => option.numeral === target - 1)!.id,
    feedback: { correct: "Yes, that comes before!", wrong: "Think about the number just before it." },
  });
}

function createNumberPathTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const start = pickForwardStart(memory, difficulty, 3);
  const target = start + 2;
  const options = numeralOptions(target, memory);
  return makeSequenceTask({
    prompt: "Fix the number path.",
    speakText: "Fix the number path.",
    targetNumber: target,
    sequence: [start, start + 1, "__", start + 3],
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "You fixed the path!", wrong: "Follow the path one step at a time." },
  });
}

function createCompleteRowTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const start = pickForwardStart(memory, difficulty, 4);
  const target = start + 3;
  const options = numeralOptions(target, memory);
  return makeSequenceTask({
    prompt: "Complete the row.",
    speakText: "Complete the row.",
    targetNumber: target,
    sequence: [start, start + 1, start + 2, "__", start + 4],
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "Row complete!", wrong: "Look at the numbers on both sides." },
  });
}

function createNumbotTrailTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const start = pickForwardStart(memory, difficulty, 4);
  const target = start + 1;
  const options = numeralOptions(target, memory);
  return makeSequenceTask({
    prompt: "Numbot says the path is broken!",
    speakText: "Numbot says the path is broken. What number is missing?",
    targetNumber: target,
    sequence: [start, "__", start + 2, start + 3],
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "You repaired Numbot's trail!", wrong: "Find the number that fits the path." },
  });
}

function createCountForwardTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const start = pickForwardStart(memory, difficulty, 4);
  const target = start + 4;
  const options = numeralOptions(target, memory);
  return makeSequenceTask({
    prompt: "Count forward.",
    speakText: "Count forward.",
    targetNumber: target,
    sequence: [start, start + 1, start + 2, start + 3, "__"],
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "Great counting forward!", wrong: "Count on one each time." },
  });
}

function createCountBackwardTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const start = pickBackwardStart(memory, difficulty, 3);
  const target = start - 2;
  const options = numeralOptions(target, memory);
  return makeSequenceTask({
    prompt: "Count backward.",
    speakText: "Count backward.",
    targetNumber: target,
    sequence: [start, start - 1, "__", start - 3],
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "Great countdown!", wrong: "Count back one each time." },
  });
}

function createTenPathTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const extras = chooseRecentSafe(difficulty === "hard" ? [4, 5, 6, 7, 8, 9] : [1, 2, 3, 4, 5, 6, 7, 8], memory.recentStarts);
  pushRecent(memory.recentStarts, extras, 6);
  const target = 10 + extras;
  const options = numeralOptions(target - 1, memory);
  return makeSequenceTask({
    prompt: "Fill the ten path.",
    speakText: "Fill the ten path.",
    targetNumber: target - 1,
    sequence: [10, 11, 12, "__", target],
    options,
    correctOptionId: options.find((option) => option.numeral === target - 1)!.id,
    feedback: { correct: "You completed the teen path!", wrong: "Count on after ten." },
  });
}

function createNumberLadderTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const start = pickForwardStart(memory, difficulty, 4);
  const target = start + 2;
  const options = numeralOptions(target, memory);
  return makeSequenceTask({
    prompt: "Climb the number ladder.",
    speakText: "Climb the number ladder.",
    targetNumber: target,
    sequence: [start, start + 1, "__", start + 3, start + 4],
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "You climbed the ladder!", wrong: "Look at the steps before and after the gap." },
  });
}

function createWhichMissingTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  return createMissingForwardTask(lessonId, difficulty);
}

function createDragMissingTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  return createCompleteRowTask(lessonId, difficulty);
}

function createQuickFlashTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const start = pickForwardStart(memory, difficulty, 3);
  const target = start + 2;
  const options = numeralOptions(target, memory);
  return makeFlashTask({
    prompt: "Quick number flash. What number is missing?",
    speakText: "Quick number flash. What number is missing?",
    targetNumber: target,
    displayNumber: start + 3,
    objectType: pickObject(memory),
    patternLayout: pickLayout(memory, ["ten_frame", "symmetry"] as GroundPatternLayout[]),
    revealType: "numeral",
    revealMs: difficulty === "hard" ? 1100 : 1500,
    promptAfterReveal: `${start}, ${start + 1}, ?, ${start + 3}`,
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "You spotted the missing number!", wrong: "Think about the number path you saw." },
  });
}

function createSamePathTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const start = pickForwardStart(memory, difficulty, 3);
  const same = Math.random() < 0.5;
  const left = start + 3;
  const right = same ? left : Math.min(20, left + 1);
  return makeCompareTask({
    prompt: "Do these paths land on the same number?",
    speakText: "Do these paths land on the same number?",
    targetNumber: left,
    comparisonType: "equal",
    helperVariant: "flash",
    groups: [
      { id: `path-left-${start}`, quantity: left, objectType: pickObject(memory), patternLayout: pickLayout(memory, ["domino", "symmetry"] as GroundPatternLayout[]) },
      { id: `path-right-${start}`, quantity: right, objectType: pickObject(memory), patternLayout: pickLayout(memory, ["domino", "symmetry"] as GroundPatternLayout[]) },
    ],
    feedback: { correct: same ? "Yes, both paths land together!" : "Correct, the paths land on different numbers!", wrong: "Check where each path lands." },
  });
}

function createBuildPathTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const start = difficulty === "easy" ? randInt(0, 2) : difficulty === "medium" ? randInt(4, 8) : randInt(10, 14);
  const values = [start, start + 1, start + 2, start + 3].filter((value) => value <= 20);
  pushRecent(memory.recentStarts, start, 6);
  const tiles = shuffle(values.map((numeral) => ({ id: `path-${lessonId}-${start}-${numeral}`, numeral })));
  return makeOrderTapTask({
    prompt: "Build the path.",
    speakText: "Build the path in order.",
    targetNumber: values[values.length - 1] ?? start,
    direction: "ASC",
    tiles,
    feedback: { correct: "Path complete!", wrong: "Tap the numbers in the right order." },
  });
}

function createFollowPathTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const start = pickForwardStart(memory, difficulty, 3);
  const target = start + 2;
  const options = numeralOptions(target, memory);
  return makeSequenceTask({
    prompt: "Follow the number path.",
    speakText: "Follow the number path.",
    targetNumber: target,
    sequence: [start, start + 1, "__", start + 3],
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "You followed the path perfectly!", wrong: "Step along the trail one number at a time." },
  });
}

function createBrokenTrailTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const start = pickForwardStart(memory, difficulty, 4);
  const target = start + 1;
  const options = numeralOptions(target, memory);
  return makeSequenceTask({
    prompt: "Fix the broken trail.",
    speakText: "Fix the broken trail.",
    targetNumber: target,
    sequence: [start, "__", start + 2, start + 3],
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "You fixed the trail!", wrong: "Find the number that repairs the route." },
  });
}

function createSteppingStonesTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const start = pickForwardStart(memory, difficulty, 3);
  const tiles = shuffle(Array.from({ length: 4 }, (_, index) => ({ id: `stones-${lessonId}-${start}-${index}`, numeral: start + index })));
  pushRecent(memory.recentStarts, start, 6);
  return makeOrderTapTask({
    prompt: "Jump across the stepping stones.",
    speakText: "Jump across the stepping stones in order.",
    targetNumber: start + 3,
    direction: "ASC",
    tiles,
    feedback: { correct: "Great stepping!", wrong: "Follow the stones in the right order." },
  });
}

function createForwardPathTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const start = pickForwardStart(memory, difficulty, 4);
  const target = start + 4;
  const options = numeralOptions(target, memory);
  return makeSequenceTask({
    prompt: "Follow the forward path.",
    speakText: "Follow the forward path.",
    targetNumber: target,
    sequence: [start, start + 1, start + 2, start + 3, "__"],
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "Forward path complete!", wrong: "Keep moving forward one step each time." },
  });
}

function createBackwardPathTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const start = pickBackwardStart(memory, difficulty, 3);
  const target = start - 2;
  const options = numeralOptions(target, memory);
  return makeSequenceTask({
    prompt: "Follow the backward path.",
    speakText: "Follow the backward path.",
    targetNumber: target,
    sequence: [start, start - 1, "__", start - 3],
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "Backward trail complete!", wrong: "Step back one number each time." },
  });
}

function createNumberMazeTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const start = pickForwardStart(memory, difficulty, 4);
  const tiles = shuffle(Array.from({ length: 5 }, (_, index) => ({ id: `maze-${lessonId}-${start}-${index}`, numeral: start + index })));
  pushRecent(memory.recentStarts, start, 6);
  return makeOrderTapTask({
    prompt: "Find the path through the maze.",
    speakText: "Find the path through the maze.",
    targetNumber: start + 4,
    direction: "ASC",
    tiles,
    feedback: { correct: "Maze solved!", wrong: "Choose the route that counts on in order." },
  });
}

function createWhatNextTrailTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const start = pickForwardStart(memory, difficulty, 3);
  const target = start + 3;
  const options = numeralOptions(target, memory);
  return makeSequenceTask({
    prompt: "What comes next on the trail?",
    speakText: "What comes next on the trail?",
    targetNumber: target,
    sequence: [start, start + 1, start + 2, "__"],
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "You found the next step!", wrong: "Look for the next number on the trail." },
  });
}

function createWhatBeforeTrailTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const target = pickForwardStart(memory, difficulty, 1) + 1;
  const options = numeralOptions(target - 1, memory);
  return makeMatchTask({
    prompt: `What comes before ${target} on the trail?`,
    speakText: `What comes before ${numberWord(target)} on the trail?`,
    targetNumber: target - 1,
    visualType: "ground-number-card",
    promptType: "number_to_numeral",
    shownNumeral: target,
    options: options.map((option) => ({ id: option.id, kind: "numeral" as const, numeral: option.numeral })),
    correctOptionId: options.find((option) => option.numeral === target - 1)!.id,
    feedback: { correct: "That step comes before!", wrong: "Think about the step just before it." },
  });
}

function createNumberLineHopsTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const start = pickForwardStart(memory, difficulty, 4);
  const target = start + 2;
  const options = numeralOptions(target, memory);
  return makeSequenceTask({
    prompt: "Complete the number line hops.",
    speakText: "Complete the number line hops.",
    targetNumber: target,
    sequence: [start, start + 1, "__", start + 3],
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "Hop path complete!", wrong: "Follow the hops in order." },
  });
}

function createCompleteTrailTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const start = pickForwardStart(memory, difficulty, 4);
  const target = start + 3;
  const options = numeralOptions(target, memory);
  return makeSequenceTask({
    prompt: "Complete the trail.",
    speakText: "Complete the trail.",
    targetNumber: target,
    sequence: [start, start + 1, start + 2, "__", start + 4],
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "Trail complete!", wrong: "Use the path around the missing step." },
  });
}

function createPortalCountdownTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const start = pickBackwardStart(memory, difficulty, 4);
  const target = start - 4;
  const options = numeralOptions(target, memory);
  return makeSequenceTask({
    prompt: "Count back to the portal.",
    speakText: "Count back to the portal.",
    targetNumber: target,
    sequence: [start, start - 1, start - 2, start - 3, "__"],
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "Portal countdown complete!", wrong: "Keep stepping back one each time." },
  });
}

function createSamePathTrailsTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  return createSamePathTask(lessonId, difficulty);
}

function createRiverCrossingTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const descending = difficulty === "hard" || Math.random() < 0.4;
  const start = descending ? pickBackwardStart(memory, difficulty, 3) : pickForwardStart(memory, difficulty, 3);
  const values = descending
    ? [start, start - 1, start - 2, start - 3]
    : [start, start + 1, start + 2, start + 3];
  pushRecent(memory.recentStarts, start, 6);
  return makeOrderTapTask({
    prompt: "Cross the number river.",
    speakText: descending ? "Cross the number river counting back." : "Cross the number river counting on.",
    targetNumber: values[values.length - 1] ?? start,
    direction: descending ? "DESC" : "ASC",
    tiles: shuffle(values.map((numeral, index) => ({ id: `river-${lessonId}-${start}-${index}`, numeral }))),
    feedback: { correct: "River crossed!", wrong: "Follow the stepping stones in the correct order." },
  });
}

function createQuickPathFlashTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const descending = difficulty === "hard" && Math.random() < 0.5;
  const start = descending ? pickBackwardStart(memory, difficulty, 3) : pickForwardStart(memory, difficulty, 3);
  const target = descending ? start - 2 : start + 2;
  const options = numeralOptions(target, memory);
  return makeFlashTask({
    prompt: "Quick path flash. Which step is missing?",
    speakText: "Quick path flash. Which step is missing?",
    targetNumber: target,
    displayNumber: descending ? start - 3 : start + 3,
    objectType: pickObject(memory),
    patternLayout: pickLayout(memory, ["symmetry", "domino"] as GroundPatternLayout[]),
    revealType: "numeral",
    revealMs: difficulty === "hard" ? 1000 : 1400,
    promptAfterReveal: descending
      ? `${start}, ${start - 1}, ?, ${start - 3}`
      : `${start}, ${start + 1}, ?, ${start + 3}`,
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "You spotted the missing trail step!", wrong: "Think about the path you just saw." },
  });
}

function createBuildTrailTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const descending = difficulty === "hard" || Math.random() < 0.5;
  const start = descending ? pickBackwardStart(memory, difficulty, 4) : pickForwardStart(memory, difficulty, 4);
  const values = descending
    ? [start, start - 1, start - 2, start - 3, start - 4].filter((value) => value >= 0)
    : [start, start + 1, start + 2, start + 3, start + 4].filter((value) => value <= 20);
  pushRecent(memory.recentStarts, start, 6);
  return makeOrderTapTask({
    prompt: "Build the number trail.",
    speakText: descending ? "Build the number trail counting back." : "Build the number trail counting on.",
    targetNumber: values[values.length - 1] ?? start,
    direction: descending ? "DESC" : "ASC",
    tiles: shuffle(values.map((numeral, index) => ({ id: `trail-${lessonId}-${start}-${index}`, numeral }))),
    feedback: { correct: "Number trail built!", wrong: "Place the trail in the correct order." },
  });
}

function generateLesson2Task(lessonId: string, difficulty: Difficulty, kind: (typeof LESSON2_ROTATION)[number]): PracticeTask {
  switch (kind) {
    case "follow_path":
      return createFollowPathTask(lessonId, difficulty);
    case "broken_trail":
      return createBrokenTrailTask(lessonId, difficulty);
    case "stepping_stones":
      return createSteppingStonesTask(lessonId, difficulty);
    case "count_forward_path":
      return createForwardPathTask(lessonId, difficulty);
    case "count_backward_path":
      return createBackwardPathTask(lessonId, difficulty);
    case "number_maze":
      return createNumberMazeTask(lessonId, difficulty);
    case "what_next_trail":
      return createWhatNextTrailTask(lessonId, difficulty);
    case "what_before_trail":
      return createWhatBeforeTrailTask(lessonId, difficulty);
    case "number_line_hops":
      return createNumberLineHopsTask(lessonId, difficulty);
    case "complete_trail":
      return createCompleteTrailTask(lessonId, difficulty);
    case "portal_countdown":
      return createPortalCountdownTask(lessonId, difficulty);
    case "same_path_trails":
      return createSamePathTrailsTask(lessonId, difficulty);
    case "river_crossing":
      return createRiverCrossingTask(lessonId, difficulty);
    case "quick_path_flash":
      return createQuickPathFlashTask(lessonId, difficulty);
    case "build_trail":
      return createBuildTrailTask(lessonId, difficulty);
  }
}

function generateLesson1Task(lessonId: string, difficulty: Difficulty, kind: (typeof LESSON1_ROTATION)[number]): PracticeTask {
  switch (kind) {
    case "missing_forward":
      return createMissingForwardTask(lessonId, difficulty);
    case "what_comes_next":
      return createWhatComesNextTask(lessonId, difficulty);
    case "what_comes_before":
      return createWhatComesBeforeTask(lessonId, difficulty);
    case "number_path":
      return createNumberPathTask(lessonId, difficulty);
    case "complete_row":
      return createCompleteRowTask(lessonId, difficulty);
    case "numbot_trail":
      return createNumbotTrailTask(lessonId, difficulty);
    case "count_forward":
      return createCountForwardTask(lessonId, difficulty);
    case "count_backward":
      return createCountBackwardTask(lessonId, difficulty);
    case "ten_path":
      return createTenPathTask(lessonId, difficulty);
    case "number_ladder":
      return createNumberLadderTask(lessonId, difficulty);
    case "which_missing":
      return createWhichMissingTask(lessonId, difficulty);
    case "drag_missing":
      return createDragMissingTask(lessonId, difficulty);
    case "quick_flash":
      return createQuickFlashTask(lessonId, difficulty);
    case "same_path":
      return createSamePathTask(lessonId, difficulty);
    case "build_path":
      return createBuildPathTask(lessonId, difficulty);
  }
}

export function generatePrepWeek8Task(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (lessonId === "y0-w8-l2") {
    const kind = nextLesson2Kind(memory);
    return generateLesson2Task(lessonId, difficulty, kind);
  }
  const kind = nextLesson1Kind(memory);
  return generateLesson1Task(lessonId, difficulty, kind);
}

export function resetPrepWeek8TaskSessionState() {
  memoryByLesson.clear();
}
