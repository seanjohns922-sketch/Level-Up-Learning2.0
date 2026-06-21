import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import {
  WEEK2_MASS_OBJECTS,
  WEEK2_QUAD_SETS,
  WEEK2_TRIO_SETS,
  type Week2MassSet,
  type Week2MassThing,
  toWeek2MassCompareObject,
} from "./week2MassObjects";

// ── Measurelands · Ground Level · Week 2 · Lesson 2 — "Order by Mass" ──
// AC9MFM01: order objects by mass from lightest to heaviest using obvious
// visual comparisons and touch-friendly sorting. Reuses the shared
// measurementCompare scenes:
//   A — Lightest to Heaviest (order 3)
//   B — Balance Bridge       (sequence: which comes next?)
//   C — Mass Sorting Line    (order 4)

type CompareTask = Extract<PracticeTask, { kind: "measurementCompare" }>;
type MObj = CompareTask["objects"][number];
type Accent = MObj["accent"];

type LessonMemory = {
  introShown: boolean;
  cursor: number;
  lastSetId: string | null;
};

const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"A" | "B" | "C"> = ["A", "B", "C", "A", "C", "B"];
const ACCENTS: Accent[] = ["rose", "gold", "teal", "sky", "violet", "leaf"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, lastSetId: null };
  lessonMemory.set(lessonId, created);
  return created;
}

function randInt(maxExclusive: number) {
  return Math.floor(Math.random() * maxExclusive);
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}

function choose<T>(items: T[]): T {
  return items[randInt(items.length)]!;
}

function chooseMassSet(pool: Week2MassSet[], memory: LessonMemory): Week2MassSet {
  let set = choose(pool);
  let guard = 0;
  while (set.setId === memory.lastSetId && guard++ < 20) {
    set = choose(pool);
  }
  memory.lastSetId = set.setId;
  return set;
}

function buildAscendingObjects(set: Week2MassSet): MObj[] {
  const accents = shuffle(ACCENTS).slice(0, set.items.length);
  return set.items
    .slice()
    .sort((a, b) => a.weight - b.weight)
    .map((item, index) => toWeek2MassCompareObject(item, accents[index]!));
}

const TEACHING_MOMENTS: NonNullable<CompareTask["teachingMoments"]> = [
  {
    id: "feather-apple-backpack",
    title: "Lightest to Heaviest",
    objects: [
      { ...toWeek2MassCompareObject(WEEK2_MASS_OBJECTS.feather, "sky") },
      { ...toWeek2MassCompareObject(WEEK2_MASS_OBJECTS.apple, "rose") },
      { ...toWeek2MassCompareObject(WEEK2_MASS_OBJECTS.backpack, "gold") },
    ],
    left: { ...toWeek2MassCompareObject(WEEK2_MASS_OBJECTS.feather, "sky") },
    right: { ...toWeek2MassCompareObject(WEEK2_MASS_OBJECTS.backpack, "gold") },
    narration: "Feather is lightest. Apple goes in the middle. Backpack is heaviest.",
  },
  {
    id: "leaf-boot-rock",
    title: "Put Them in Order",
    objects: [
      { ...toWeek2MassCompareObject(WEEK2_MASS_OBJECTS.leaf, "leaf") },
      { ...toWeek2MassCompareObject(WEEK2_MASS_OBJECTS.boot, "violet") },
      { ...toWeek2MassCompareObject(WEEK2_MASS_OBJECTS.rock, "teal") },
    ],
    left: { ...toWeek2MassCompareObject(WEEK2_MASS_OBJECTS.leaf, "leaf") },
    right: { ...toWeek2MassCompareObject(WEEK2_MASS_OBJECTS.rock, "teal") },
    narration: "Leaf goes first. Boot goes next. Rock goes last because it is heaviest.",
  },
  {
    id: "coin-chair-elephant",
    title: "Heaviest Goes Last",
    objects: [
      { ...toWeek2MassCompareObject(WEEK2_MASS_OBJECTS.coin, "rose") },
      { ...toWeek2MassCompareObject(WEEK2_MASS_OBJECTS.chair, "gold") },
      { ...toWeek2MassCompareObject(WEEK2_MASS_OBJECTS.elephant, "leaf") },
    ],
    left: { ...toWeek2MassCompareObject(WEEK2_MASS_OBJECTS.coin, "rose") },
    right: { ...toWeek2MassCompareObject(WEEK2_MASS_OBJECTS.elephant, "leaf") },
    narration: "Coin is lightest. Elephant is heaviest. We line them up from lightest to heaviest.",
  },
];

function buildIntroTask(): CompareTask {
  return {
    kind: "measurementCompare",
    scene: "intro",
    prompt: "Let’s line up heavy and light objects!",
    speakText:
      "Welcome back to Balance Basin! Today we will put objects in order from lightest to heaviest. Feather comes first, because it is light. Heavy things go at the end. Let's line them up with Meazurex.",
    badgeLabel: "Meazurex Mission",
    introIcon: "⚖️",
    introBody: [
      "The scales are wobbling because the mass order is mixed up.",
      "Lightest goes first.",
      "Heaviest goes last.",
    ],
    objects: [],
    teachingMoments: TEACHING_MOMENTS,
    correctOptionId: "continue",
    feedback: { correct: "Let's start sorting!", wrong: "Let's get ready." },
  };
}

function buildLightestToHeaviestTask(memory: LessonMemory): CompareTask {
  const set = chooseMassSet(WEEK2_TRIO_SETS, memory);
  const ordered = buildAscendingObjects(set);
  return {
    kind: "measurementCompare",
    scene: "order",
    targetMode: "lightest",
    prompt: "Put the objects in order: lightest to heaviest.",
    speakText: "Put the objects in order, from lightest to heaviest.",
    badgeLabel: "Lightest to Heaviest",
    objects: shuffle(ordered),
    orderedIds: ordered.map((item) => item.id),
    correctOptionId: ordered[ordered.length - 1]!.id,
    feedback: { correct: "Great ordering!", wrong: "Try the lightest one first." },
  };
}

function buildBalanceBridgeTask(memory: LessonMemory): CompareTask {
  const set = chooseMassSet(WEEK2_QUAD_SETS, memory);
  const ordered = buildAscendingObjects(set);
  const prefix = [ordered[0]!, ordered[1]!, ordered[2]!];
  const correct = ordered[3]!;
  const distractorA = toWeek2MassCompareObject(set.items[0]!, choose(ACCENTS), "-dA");
  const distractorB = toWeek2MassCompareObject(set.items[1]!, choose(ACCENTS), "-dB");

  return {
    kind: "measurementCompare",
    scene: "sequence",
    targetMode: "heaviest",
    prompt: "Which object comes next?",
    speakText: "Look at the bridge. The objects are getting heavier. Which object comes next?",
    badgeLabel: "Balance Bridge",
    sequencePrefix: prefix,
    objects: shuffle([correct, distractorA, distractorB]),
    correctOptionId: correct.id,
    feedback: { correct: "You crossed the bridge!", wrong: "Look for the heaviest object that comes next." },
  };
}

function buildMassSortingLineTask(memory: LessonMemory): CompareTask {
  const set = chooseMassSet(WEEK2_QUAD_SETS, memory);
  const ordered = buildAscendingObjects(set);
  return {
    kind: "measurementCompare",
    scene: "order",
    targetMode: "lightest",
    prompt: "Put the objects in order: lightest to heaviest.",
    speakText: "Put the objects in order, from lightest to heaviest.",
    badgeLabel: "Mass Sorting Line",
    objects: shuffle(ordered),
    orderedIds: ordered.map((item) => item.id),
    correctOptionId: ordered[ordered.length - 1]!.id,
    feedback: { correct: "Fantastic sorting!", wrong: "Start with the lightest object." },
  };
}

export function buildMeasurelandsWeek2Lesson2QuizTasks(): PracticeTask[] {
  const q1Set = buildAscendingObjects(WEEK2_TRIO_SETS[0]!);
  const q2Set = buildAscendingObjects(WEEK2_TRIO_SETS[1]!);
  const q3Set = buildAscendingObjects(WEEK2_TRIO_SETS[2]!);
  const q4Set = buildAscendingObjects(WEEK2_QUAD_SETS[0]!);
  const q5Set = buildAscendingObjects(WEEK2_QUAD_SETS[1]!);

  const q4Correct = q4Set[3]!;
  const q4DistractorA = { ...q4Set[0]!, id: `${q4Set[0]!.id}-qa` };
  const q4DistractorB = { ...q4Set[1]!, id: `${q4Set[1]!.id}-qb` };

  return [
    {
      kind: "measurementCompare",
      scene: "order",
      targetMode: "lightest",
      prompt: "Put the objects in order: lightest to heaviest.",
      speakText: "Put the objects in order, from lightest to heaviest.",
      badgeLabel: "Mass Quiz",
      objects: shuffle(q1Set),
      orderedIds: q1Set.map((item) => item.id),
      correctOptionId: q1Set[2]!.id,
      feedback: { correct: "Great ordering!", wrong: "Try the lightest one first." },
    },
    {
      kind: "measurementCompare",
      scene: "trio",
      targetMode: "lightest",
      prompt: "Tap the lightest.",
      speakText: "Tap the lightest object.",
      badgeLabel: "Mass Quiz",
      objects: shuffle(q2Set),
      correctOptionId: q2Set[0]!.id,
      feedback: { correct: "You found the lightest object!", wrong: "Look for the object with the smallest weight bar." },
    },
    {
      kind: "measurementCompare",
      scene: "trio",
      targetMode: "heaviest",
      prompt: "Tap the heaviest.",
      speakText: "Tap the heaviest object.",
      badgeLabel: "Mass Quiz",
      objects: shuffle(q3Set),
      correctOptionId: q3Set[2]!.id,
      feedback: { correct: "You found the heaviest object!", wrong: "Look for the object that would push the scale down the most." },
    },
    {
      kind: "measurementCompare",
      scene: "sequence",
      targetMode: "heaviest",
      prompt: "Which object comes next?",
      speakText: "The objects are getting heavier. Which one comes next?",
      badgeLabel: "Mass Quiz",
      sequencePrefix: [q4Set[0]!, q4Set[1]!, q4Set[2]!],
      objects: shuffle([q4Correct, q4DistractorA, q4DistractorB]),
      correctOptionId: q4Correct.id,
      feedback: { correct: "Nice pattern!", wrong: "They are getting heavier. Choose the next heavier object." },
    },
    {
      kind: "measurementCompare",
      scene: "order",
      targetMode: "lightest",
      prompt: "Put the objects in order: lightest to heaviest.",
      speakText: "Put the four objects in order, from lightest to heaviest.",
      badgeLabel: "Mass Quiz",
      objects: shuffle(q5Set),
      orderedIds: q5Set.map((item) => item.id),
      correctOptionId: q5Set[3]!.id,
      feedback: { correct: "Excellent ordering!", wrong: "Start with the lightest object." },
    },
  ];
}

export function generatePrepMeasurelandsWeek2Lesson2Task(
  lessonId: string,
  difficulty: Difficulty,
): PracticeTask {
  void difficulty;
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }

  const rotation = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;

  if (rotation === "A") return buildLightestToHeaviestTask(memory);
  if (rotation === "B") return buildBalanceBridgeTask(memory);
  return buildMassSortingLineTask(memory);
}

export function resetPrepMeasurelandsWeek2Lesson2TaskSessionState() {
  lessonMemory.clear();
}
