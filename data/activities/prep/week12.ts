import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { generatePrepWeek10TaskByKind } from "@/data/activities/prep/week10";
import { generatePrepWeek11TaskByKind } from "@/data/activities/prep/week11";

type GroundObjectType = Extract<PracticeTask, { kind: "groundBuild" }>["objectType"];
type GroundPatternLayout = NonNullable<Extract<PracticeTask, { kind: "groundFlash" }>["patternLayout"]>;

type Lesson1Kind =
  | "quick_image_flash"
  | "representation_switch"
  | "teen_number_builder"
  | "number_image_memory";

type Week12Memory = {
  cursor: number;
  recentTargets: number[];
  recentObjects: GroundObjectType[];
  recentLayouts: GroundPatternLayout[];
};

const LESSON1_ROTATION: Lesson1Kind[] = [
  "quick_image_flash",
  "representation_switch",
  "number_image_memory",
  "quick_image_flash",
  "representation_switch",
  "teen_number_builder",
];

const OBJECTS: GroundObjectType[] = [
  "energy_orbs",
  "crystals",
  "robot_tokens",
  "stars",
  "number_orbs",
  "planets",
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

function chooseVariant<T>(options: readonly T[]) {
  return options[randInt(0, options.length - 1)]!;
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

function nextKind(memory: Week12Memory) {
  const kind = LESSON1_ROTATION[memory.cursor % LESSON1_ROTATION.length]!;
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

export function generatePrepWeek12Task(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const kind = nextKind(memory);
  return clonePracticeTask(createLesson1Task(lessonId, difficulty, kind));
}

export function generatePrepWeek12TaskByKind(
  lessonId: string,
  difficulty: Difficulty,
  kind: Lesson1Kind
): PracticeTask {
  return clonePracticeTask(createLesson1Task(lessonId, difficulty, kind));
}

export function resetPrepWeek12TaskSessionState() {
  memoryByLesson.clear();
}
