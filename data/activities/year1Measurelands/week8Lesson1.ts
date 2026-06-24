import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

type RoutineTask = Extract<PracticeTask, { kind: "routineSequence" }>;
type RoutineItem = NonNullable<RoutineTask["items"]>[number];

const ROUTINES: RoutineItem[] = [
  { id: "wakeup", label: "Wake Up", icon: "wakeup", order: 0 },
  { id: "breakfast", label: "Breakfast", icon: "breakfast", order: 1 },
  { id: "school", label: "School", icon: "school", order: 2 },
  { id: "sport", label: "Sport", icon: "sport", order: 3 },
  { id: "art", label: "Art", icon: "art", order: 4 },
  { id: "reading", label: "Reading", icon: "reading", order: 5 },
  { id: "dinner", label: "Dinner", icon: "dinner", order: 6 },
  { id: "bath", label: "Bath", icon: "bath", order: 7 },
  { id: "bed", label: "Bed", icon: "bed", order: 8 },
];

const FIRST_SETS = [
  ["wakeup", "breakfast", "school"],
  ["breakfast", "school", "dinner"],
  ["wakeup", "sport", "bed"],
  ["school", "dinner", "bed"],
  ["wakeup", "reading", "bed"],
] as const;

const BUILD_SETS = [
  ["wakeup", "breakfast", "school", "dinner"],
  ["wakeup", "breakfast", "sport", "bath"],
  ["wakeup", "school", "reading", "bed"],
  ["breakfast", "school", "dinner", "bed"],
  ["wakeup", "art", "dinner", "bed"],
] as const;

type LessonMemory = { introShown: boolean; cursor: number; firstCursor: number; buildCursor: number; fixCursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"A" | "B" | "C"> = ["A", "B", "C", "A", "B", "C"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, firstCursor: 0, buildCursor: 0, fixCursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}

function byId(id: string): RoutineItem {
  const item = ROUTINES.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`[Y1MeasurelandsW8L1] Unknown routine id: ${id}`);
  return item;
}

function buildSet(ids: readonly string[]) {
  return ids.map(byId);
}

function buildIntroTask(): RoutineTask {
  return {
    kind: "routineSequence",
    scene: "intro",
    prompt: "We can put our day in order.",
    speakText:
      "In Year 1, we order familiar events using first, next, and last. Wake up happens first. Then breakfast. Then school.",
    badgeLabel: "Meazurex Mission",
    items: buildSet(["wakeup", "breakfast", "school"]),
    feedback: { correct: "Let's build a routine!", wrong: "Let's get ready." },
  };
}

function buildFirstTask(memory: LessonMemory): RoutineTask {
  const set = buildSet(FIRST_SETS[memory.firstCursor % FIRST_SETS.length]!);
  memory.firstCursor += 1;
  return {
    kind: "routineSequence",
    scene: "first",
    prompt: "What comes first?",
    speakText: "Look at the routine cards. What comes first?",
    badgeLabel: "What Comes First?",
    items: shuffle(set),
    feedback: { correct: "Yes — that happens first!", wrong: "Think about what happens earliest in the day." },
  };
}

function buildBuildTask(memory: LessonMemory): RoutineTask {
  const set = buildSet(BUILD_SETS[memory.buildCursor % BUILD_SETS.length]!);
  memory.buildCursor += 1;
  return {
    kind: "routineSequence",
    scene: "build",
    prompt: "Build the routine in order.",
    speakText: "Tap the routine cards in order. Start with what happens first.",
    badgeLabel: "Build the Timeline",
    buildItems: shuffle(set),
    feedback: { correct: "Great sequencing!", wrong: "Start with the earliest routine event." },
  };
}

function scrambleSet(items: RoutineItem[]) {
  const reversed = [...items].reverse();
  if (!reversed.every((item, index) => item.id === items[index]?.id)) return reversed;
  return [items[1]!, items[0]!, ...items.slice(2)];
}

function buildFixTask(memory: LessonMemory): RoutineTask {
  const set = buildSet(BUILD_SETS[memory.fixCursor % BUILD_SETS.length]!);
  memory.fixCursor += 1;
  return {
    kind: "routineSequence",
    scene: "fix",
    prompt: "Fix the timeline.",
    speakText: "This routine is mixed up. Tap the events in the correct order to fix it.",
    badgeLabel: "Fix the Timeline",
    brokenItems: scrambleSet(set),
    feedback: { correct: "You fixed the routine!", wrong: "Think about what happens first, next, and last." },
  };
}

function buildMeaningTask(): RoutineTask {
  return {
    kind: "routineSequence",
    scene: "meaning",
    prompt: "How did you know what happened first?",
    speakText: "How did you know what happened first?",
    badgeLabel: "How Did You Know?",
    textOptions: shuffle([
      "I thought about my day.",
      "I picked the biggest picture.",
      "I guessed.",
    ]),
    correctTextOption: "I thought about my day.",
    feedback: { correct: "Yes — routines help us think about order.", wrong: "Think about the order the events really happen in." },
  };
}

export function generateY1MeasurelandsWeek8Lesson1Task(
  lessonId: string,
  _difficulty: Difficulty,
): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const rotation = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (rotation === "A") return buildFirstTask(memory);
  if (rotation === "B") return buildBuildTask(memory);
  return buildFixTask(memory);
}

export function resetY1MeasurelandsWeek8Lesson1TaskSessionState() {
  lessonMemory.clear();
}
