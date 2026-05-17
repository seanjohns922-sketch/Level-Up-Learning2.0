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
  "move_forward",
  "move_backward",
  "choose_next_step",
  "portal_target",
  "countdown_portal",
  "number_line_hops",
  "wrong_tile_avoider",
  "direction_sort",
  "audio_move",
  "board_roll_backward",
  "path_trace_forward",
  "river_crossing_backward",
  "bridge_builder_forward",
  "same_journey",
  "fast_path_challenge",
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

function buildTrailValues(startNumber: number, steps: number, direction: "ASC" | "DESC") {
  return Array.from({ length: steps }, (_, index) =>
    direction === "DESC" ? startNumber - (index + 1) : startNumber + (index + 1)
  ).filter((value) => value >= 0 && value <= 20);
}

function buildMovementDistractors(
  startNumber: number,
  steps: number,
  direction: "ASC" | "DESC",
  pathNumerals: number[],
  count: number,
) {
  const target = pathNumerals[pathNumerals.length - 1] ?? startNumber;
  const lessSteps = Math.max(1, steps - 1);
  const candidates = [
    startNumber,
    direction === "ASC" ? startNumber - 1 : startNumber + 1,
    direction === "ASC" ? startNumber + lessSteps : startNumber - lessSteps,
    direction === "ASC" ? startNumber + steps + 1 : startNumber - (steps + 1),
    direction === "ASC" ? target + 1 : target - 1,
    direction === "ASC" ? target - 1 : target + 1,
    direction === "ASC" ? startNumber + steps + 2 : startNumber - (steps + 2),
  ];

  const filtered = candidates.filter((value, index, list) => {
    if (value < 0 || value > 20) return false;
    if (pathNumerals.includes(value)) return false;
    return list.indexOf(value) === index;
  });

  return filtered.slice(0, count);
}

function buildMovementOptions(
  startNumber: number,
  steps: number,
  direction: "ASC" | "DESC",
  difficulty: Difficulty,
  memory: Week8Memory,
) {
  const target = direction === "DESC" ? startNumber - steps : startNumber + steps;
  const optionCount = difficulty === "hard" ? 4 : 3;
  const candidates = [
    target,
    startNumber,
    direction === "ASC" ? startNumber + Math.max(1, steps - 1) : startNumber - Math.max(1, steps - 1),
    direction === "ASC" ? startNumber - 1 : startNumber + 1,
    direction === "ASC" ? startNumber + steps + 1 : startNumber - (steps + 1),
    direction === "ASC" ? target + 1 : target - 1,
    direction === "ASC" ? target - 1 : target + 1,
  ].filter((value, index, list) => value >= 0 && value <= 20 && list.indexOf(value) === index);

  const distractors = candidates.filter((value) => value !== target).slice(0, optionCount - 1);
  const correctPosition = chooseAnswerPosition(memory, optionCount);
  const ordered = new Array<number>(optionCount);
  ordered[correctPosition] = target;
  const positions = Array.from({ length: optionCount }, (_, index) => index).filter((index) => index !== correctPosition);
  positions.forEach((position, index) => {
    ordered[position] = distractors[index] ?? target;
  });
  return ordered.map((numeral, index) => ({ id: `move-${startNumber}-${steps}-${direction}-${index}-${numeral}`, numeral }));
}

function createMoveTrailTask({
  lessonId,
  startNumber,
  steps,
  direction,
  prompt,
  speakText,
  feedback,
  difficulty,
}: {
  lessonId: string;
  startNumber: number;
  steps: number;
  direction: "ASC" | "DESC";
  prompt: string;
  speakText: string;
  feedback: { correct: string; wrong: string };
  difficulty: Difficulty;
}): PracticeTask {
  const values = buildTrailValues(startNumber, steps, direction);
  const distractorCount = values.length <= 2 ? (difficulty === "hard" ? 3 : 2) : difficulty === "hard" ? 2 : 1;
  const distractors = buildMovementDistractors(startNumber, steps, direction, values, distractorCount);
  const tiles = shuffle(
    [...values, ...distractors].map((numeral, index) => ({ id: `trail-${lessonId}-${startNumber}-${direction}-${index}-${numeral}`, numeral }))
  );
  return makeOrderTapTask({
    prompt,
    speakText,
    targetNumber: values[values.length - 1] ?? startNumber,
    startNumber,
    pathNumerals: values,
    direction,
    tiles,
    feedback,
  });
}

function createMoveForwardTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const steps = difficulty === "easy" ? randInt(1, 2) : randInt(2, 4);
  const startNumber = pickForwardStart(memory, difficulty, steps);
  pushRecent(memory.recentStarts, startNumber, 6);
  return createMoveTrailTask({
    lessonId,
    startNumber,
    steps,
    direction: "ASC",
    prompt: `Move Numbot forward ${steps}.`,
    speakText: `Move forward ${numberWord(steps)}.`,
    feedback: { correct: "Great navigating!", wrong: "Follow the trail forward one step at a time." },
    difficulty,
  });
}

function createMoveBackwardTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const steps = difficulty === "easy" ? randInt(1, 2) : randInt(2, 4);
  const startNumber = pickBackwardStart(memory, difficulty, steps);
  pushRecent(memory.recentStarts, startNumber, 6);
  return createMoveTrailTask({
    lessonId,
    startNumber,
    steps,
    direction: "DESC",
    prompt: `Move Numbot back ${steps}.`,
    speakText: `Move back ${numberWord(steps)}.`,
    feedback: { correct: "Backward trail complete!", wrong: "Step back along the trail in order." },
    difficulty,
  });
}

function createChooseNextStepTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const moveBackward = difficulty === "hard" && Math.random() < 0.5;
  const startNumber = moveBackward ? pickBackwardStart(memory, difficulty, 2) : pickForwardStart(memory, difficulty, 2);
  pushRecent(memory.recentStarts, startNumber, 6);
  const target = moveBackward ? startNumber - 1 : startNumber + 1;
  const options = buildMovementOptions(startNumber, 1, moveBackward ? "DESC" : "ASC", difficulty, memory);
  return makeMatchTask({
    prompt: moveBackward ? `Numbot is on ${startNumber}. Move back one.` : `Numbot is on ${startNumber}. Move forward one.`,
    speakText: moveBackward ? `Numbot is on ${numberWord(startNumber)}. Move back one.` : `Numbot is on ${numberWord(startNumber)}. Move forward one.`,
    targetNumber: target,
    visualType: "ground-number-card",
    promptType: "number_to_numeral",
    shownNumeral: startNumber,
    options: options.map((option) => ({ id: option.id, kind: "numeral" as const, numeral: option.numeral })),
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "You chose the next step!", wrong: "Think about which direction Numbot is moving." },
  });
}

function createDirectionSortTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const moveBackward = difficulty !== "easy" || Math.random() < 0.5;
  const startNumber = moveBackward ? pickBackwardStart(memory, difficulty, 3) : pickForwardStart(memory, difficulty, 3);
  const endNumber = moveBackward ? startNumber - 3 : startNumber + 3;

  pushRecent(memory.recentStarts, startNumber, 6);

  return makeMatchTask({
    prompt: `From ${startNumber} to ${endNumber}, which way do we move?`,
    speakText: `From ${numberWord(startNumber)} to ${numberWord(endNumber)}, which way do we move?`,
    targetNumber: endNumber,
    visualType: "ground-number-card",
    promptType: "number_to_numeral",
    shownSequence: [startNumber, "__", endNumber],
    options: shuffle([
      { id: `dir-forward-${startNumber}`, kind: "word" as const, word: "forward" },
      { id: `dir-backward-${startNumber}`, kind: "word" as const, word: "backward" },
    ]),
    correctOptionId: moveBackward ? `dir-backward-${startNumber}` : `dir-forward-${startNumber}`,
    feedback: {
      correct: "Yes, that is the right direction!",
      wrong: "Check whether the numbers are moving up or down.",
    },
  });
}

function createPortalTargetTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const steps = difficulty === "easy" ? randInt(3, 4) : randInt(4, 5);
  const startNumber = pickForwardStart(memory, difficulty, steps);
  pushRecent(memory.recentStarts, startNumber, 6);
  const portal = startNumber + steps;
  return createMoveTrailTask({
    lessonId,
    startNumber,
    steps,
    direction: "ASC",
    prompt: `Help Numbot reach ${portal}.`,
    speakText: `Help Numbot reach ${numberWord(portal)}.`,
    feedback: { correct: "Portal reached!", wrong: "Guide Numbot along the path to the portal." },
    difficulty,
  });
}

function createCountdownPortalTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const steps = difficulty === "easy" ? randInt(3, 4) : randInt(4, 5);
  const startNumber = pickBackwardStart(memory, difficulty, steps);
  pushRecent(memory.recentStarts, startNumber, 6);
  const portal = startNumber - steps;
  return createMoveTrailTask({
    lessonId,
    startNumber,
    steps,
    direction: "DESC",
    prompt: `Count back to ${portal}.`,
    speakText: `Count back to ${numberWord(portal)}.`,
    feedback: { correct: "Countdown portal reached!", wrong: "Count back one step at a time." },
    difficulty,
  });
}

function createNumberLineHopsTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const steps = difficulty === "hard" ? randInt(3, 4) : randInt(2, 3);
  const startNumber = pickForwardStart(memory, difficulty, steps);
  pushRecent(memory.recentStarts, startNumber, 6);
  return createMoveTrailTask({
    lessonId,
    startNumber,
    steps,
    direction: "ASC",
    prompt: `Hop forward ${steps} from ${startNumber}.`,
    speakText: `Hop forward ${numberWord(steps)} from ${numberWord(startNumber)}.`,
    feedback: { correct: "Great hopping!", wrong: "Follow each hop forward along the line." },
    difficulty,
  });
}

function createWrongTileTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const moveBackward = difficulty === "hard" && Math.random() < 0.5;
  const startNumber = moveBackward ? pickBackwardStart(memory, difficulty, 3) : pickForwardStart(memory, difficulty, 3);
  const wrongTile = moveBackward ? startNumber + 2 : startNumber + 5;
  const sequence = moveBackward
    ? [startNumber, startNumber - 1, wrongTile, startNumber - 3]
    : [startNumber, startNumber + 1, wrongTile, startNumber + 3];
  const options = [wrongTile, sequence[1]!, sequence[3]!].map((numeral, index) => ({ id: `wrong-${startNumber}-${index}-${numeral}`, numeral }));
  pushRecent(memory.recentStarts, startNumber, 6);
  return makeMatchTask({
    prompt: "Tap the tile that breaks the path.",
    speakText: "Tap the tile that breaks the path.",
    targetNumber: wrongTile,
    visualType: "ground-number-card",
    promptType: "number_to_numeral",
    shownSequence: sequence,
    options: shuffle(options).map((option) => ({ id: option.id, kind: "numeral" as const, numeral: option.numeral })),
    correctOptionId: options.find((option) => option.numeral === wrongTile)!.id,
    feedback: { correct: "You found the broken tile!", wrong: "Look for the number that breaks the journey." },
  });
}

function createAudioMoveTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const moveBackward = difficulty === "hard" || Math.random() < 0.4;
  const steps = randInt(1, 3);
  const startNumber = moveBackward ? pickBackwardStart(memory, difficulty, steps) : pickForwardStart(memory, difficulty, steps);
  pushRecent(memory.recentStarts, startNumber, 6);
  const target = moveBackward ? startNumber - steps : startNumber + steps;
  const options = buildMovementOptions(startNumber, 1, moveBackward ? "DESC" : "ASC", difficulty, memory);
  return makeMatchTask({
    prompt: "Follow Hannah's instruction.",
    speakText: moveBackward
      ? `Start at ${numberWord(startNumber)}. Move back ${numberWord(steps)}.`
      : `Start at ${numberWord(startNumber)}. Move forward ${numberWord(steps)}.`,
    targetNumber: target,
    visualType: "ground-number-card",
    promptType: "number_to_numeral",
    shownNumeral: startNumber,
    options: options.map((option) => ({ id: option.id, kind: "numeral" as const, numeral: option.numeral })),
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "You followed the instruction!", wrong: "Listen to the direction and number of steps." },
  });
}

function createBackwardRollTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const steps = randInt(2, 3);
  const startNumber = pickBackwardStart(memory, difficulty, steps);
  pushRecent(memory.recentStarts, startNumber, 6);
  return createMoveTrailTask({
    lessonId,
    startNumber,
    steps,
    direction: "DESC",
    prompt: `Numbot rolled back ${steps}.`,
    speakText: `Move Numbot back ${numberWord(steps)}.`,
    feedback: { correct: "Great backwards move!", wrong: "Move Numbot back the exact number of spaces." },
    difficulty,
  });
}

function createBackwardRiverCrossingTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const steps = 4;
  const startNumber = pickBackwardStart(memory, difficulty, steps);
  pushRecent(memory.recentStarts, startNumber, 6);
  return createMoveTrailTask({
    lessonId,
    startNumber,
    steps,
    direction: "DESC",
    prompt: "Cross the number river counting back.",
    speakText: "Cross the number river counting back.",
    feedback: { correct: "River crossed!", wrong: "Step back across the stones in the right order." },
    difficulty,
  });
}

function createBridgeBuilderTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const moveBackward = difficulty === "hard" && Math.random() < 0.5;
  const steps = 4;
  const startNumber = moveBackward ? pickBackwardStart(memory, difficulty, steps) : pickForwardStart(memory, difficulty, steps);
  pushRecent(memory.recentStarts, startNumber, 6);
  return createMoveTrailTask({
    lessonId,
    startNumber,
    steps,
    direction: moveBackward ? "DESC" : "ASC",
    prompt: "Build the bridge path.",
    speakText: moveBackward ? "Build the bridge path counting back." : "Build the bridge path counting on.",
    feedback: { correct: "Bridge complete!", wrong: "Place the stones in the order Numbot needs." },
    difficulty,
  });
}

function createPathTraceTask(lessonId: string, difficulty: Difficulty, direction: "ASC" | "DESC"): PracticeTask {
  const memory = getMemory(lessonId);
  const steps = 4;
  const startNumber =
    direction === "DESC" ? pickBackwardStart(memory, difficulty, steps) : pickForwardStart(memory, difficulty, steps);
  pushRecent(memory.recentStarts, startNumber, 6);
  return createMoveTrailTask({
    lessonId,
    startNumber,
    steps,
    direction,
    prompt: direction === "DESC" ? "Trace the path back." : "Trace the path forward.",
    speakText: direction === "DESC" ? "Trace the path back." : "Trace the path forward.",
    feedback: { correct: "Trail traced!", wrong: "Keep your trail moving one number at a time." },
    difficulty,
  });
}

function createSameJourneyTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const startNumber = pickForwardStart(memory, difficulty, 3);
  const correct = Math.random() < 0.5;
  const shownSequence = correct
    ? [startNumber, startNumber + 1, startNumber + 2, startNumber + 3]
    : [startNumber, startNumber + 1, startNumber + 3, startNumber + 4];
  pushRecent(memory.recentStarts, startNumber, 6);
  return makeMatchTask({
    prompt: "Is this journey correct?",
    speakText: "Is this journey correct?",
    targetNumber: shownSequence[shownSequence.length - 1] as number,
    visualType: "ground-number-card",
    promptType: "number_to_numeral",
    shownSequence,
    options: shuffle([
      { id: `journey-yes-${startNumber}`, kind: "word" as const, word: "yes" },
      { id: `journey-no-${startNumber}`, kind: "word" as const, word: "no" },
    ]),
    correctOptionId: correct ? `journey-yes-${startNumber}` : `journey-no-${startNumber}`,
    feedback: {
      correct: correct ? "Yes, that trail counts correctly!" : "Correct, that trail breaks the journey!",
      wrong: "Look closely at each step in the path.",
    },
  });
}

function createQuickPathFlashTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const moveBackward = difficulty === "hard" && Math.random() < 0.5;
  const startNumber = moveBackward ? pickBackwardStart(memory, difficulty, 3) : pickForwardStart(memory, difficulty, 3);
  const target = moveBackward ? startNumber - 1 : startNumber + 1;
  const options = buildMovementOptions(startNumber, 1, moveBackward ? "DESC" : "ASC", difficulty, memory);
  pushRecent(memory.recentStarts, startNumber, 6);
  return makeFlashTask({
    prompt: "Fast path challenge.",
    speakText: moveBackward ? `Start at ${numberWord(startNumber)}. Back one.` : `Start at ${numberWord(startNumber)}. Forward one.`,
    targetNumber: target,
    displayNumber: target,
    objectType: pickObject(memory),
    patternLayout: pickLayout(memory, ["symmetry", "domino"] as GroundPatternLayout[]),
    revealType: "numeral",
    revealMs: difficulty === "hard" ? 950 : 1300,
    promptAfterReveal: moveBackward ? `${startNumber}, back 1` : `${startNumber}, forward 1`,
    options,
    correctOptionId: options.find((option) => option.numeral === target)!.id,
    feedback: { correct: "Quick move complete!", wrong: "Think about the next step fast." },
  });
}

function createFastPathChallengeTask(lessonId: string, difficulty: Difficulty): PracticeTask {
  return createQuickPathFlashTask(lessonId, difficulty);
}

function generateLesson2Task(lessonId: string, difficulty: Difficulty, kind: (typeof LESSON2_ROTATION)[number]): PracticeTask {
  switch (kind) {
    case "move_forward":
      return createMoveForwardTask(lessonId, difficulty);
    case "move_backward":
      return createMoveBackwardTask(lessonId, difficulty);
    case "choose_next_step":
      return createChooseNextStepTask(lessonId, difficulty);
    case "portal_target":
      return createPortalTargetTask(lessonId, difficulty);
    case "countdown_portal":
      return createCountdownPortalTask(lessonId, difficulty);
    case "number_line_hops":
      return createNumberLineHopsTask(lessonId, difficulty);
    case "wrong_tile_avoider":
      return createWrongTileTask(lessonId, difficulty);
    case "direction_sort":
      return createDirectionSortTask(lessonId, difficulty);
    case "audio_move":
      return createAudioMoveTask(lessonId, difficulty);
    case "board_roll_backward":
      return createBackwardRollTask(lessonId, difficulty);
    case "path_trace_forward":
      return createPathTraceTask(lessonId, difficulty, "ASC");
    case "river_crossing_backward":
      return createBackwardRiverCrossingTask(lessonId, difficulty);
    case "bridge_builder_forward":
      return createBridgeBuilderTask(lessonId, difficulty);
    case "same_journey":
      return createSameJourneyTask(lessonId, difficulty);
    case "fast_path_challenge":
      return createFastPathChallengeTask(lessonId, difficulty);
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
