import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Ground Level · Week 1 · Lesson 2 — "Ordering Lengths" ──
// AC9MFM01: order objects by length, shortest↔longest, and continue a length
// sequence. Three rotating activities on the measurementCompare task:
//   A — Line Them Up      (scene "order", shortest → longest)
//   B — Sorting Machine   (scene "order", random direction)
//   C — Which Comes Next? (scene "sequence", MCQ)

type MeasurelandsTask = Extract<PracticeTask, { kind: "measurementCompare" }>;
type MeasurelandsObject = MeasurelandsTask["objects"][number];
type Accent = MeasurelandsObject["accent"];
const WEEK1_BASE = "/images/measurelands/week1-3d";
const WEEK1_IMAGES = {
  ladder: `${WEEK1_BASE}/ladder.png`,
  pencil: `${WEEK1_BASE}/pencil.png`,
  road: `${WEEK1_BASE}/road.png`,
  rocket: `${WEEK1_BASE}/rocket.png`,
  snake: `${WEEK1_BASE}/snake.png`,
  tree: `${WEEK1_BASE}/tree.png`,
  vine: `${WEEK1_BASE}/vine.png`,
} as const;

type LessonMemory = {
  introShown: boolean;
  cursor: number;
  lastSetId: string | null;
};

const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"A" | "B" | "C"> = ["A", "B", "C", "A", "C", "B"];

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

const ACCENTS: Accent[] = ["rose", "gold", "teal", "sky", "violet", "leaf"];

// Same object grown to three clearly different sizes (for ordering + sequences).
type Family = { setId: string; label: string; icon: string; imageSrc?: string; axis: "length" | "height" };

const FAMILIES: Family[] = [
  { setId: "pencil", label: "Pencil", icon: "✏️", imageSrc: WEEK1_IMAGES.pencil, axis: "length" },
  { setId: "snake", label: "Snake", icon: "🐍", imageSrc: WEEK1_IMAGES.snake, axis: "length" },
  { setId: "road", label: "Road", icon: "🛣️", imageSrc: WEEK1_IMAGES.road, axis: "length" },
  { setId: "ladder", label: "Ladder", icon: "🪜", imageSrc: WEEK1_IMAGES.ladder, axis: "length" },
  { setId: "vine", label: "Vine", icon: "🌿", imageSrc: WEEK1_IMAGES.vine, axis: "length" },
  { setId: "rocket", label: "Rocket", icon: "🚀", imageSrc: WEEK1_IMAGES.rocket, axis: "length" },
  { setId: "tree", label: "Tree", icon: "🌳", imageSrc: WEEK1_IMAGES.tree, axis: "height" },
];

// Three different creatures/objects naturally ordered by length (smallest → biggest).
const CREATURE_SETS: Array<Array<{ label: string; icon: string }>> = [
  [{ label: "Worm", icon: "🪱" }, { label: "Snake", icon: "🐍" }, { label: "Dragon", icon: "🐉" }],
  [{ label: "Twig", icon: "🌱" }, { label: "Stick", icon: "🪵" }, { label: "Log", icon: "🌳" }],
  [{ label: "Mouse", icon: "🐭" }, { label: "Cat", icon: "🐈" }, { label: "Horse", icon: "🐎" }],
  [{ label: "Canoe", icon: "🛶" }, { label: "Boat", icon: "⛵" }, { label: "Ship", icon: "🚢" }],
];

// Value triples with clear gaps so Prep students can see the difference easily.
const VALUE_TRIPLES: Array<[number, number, number]> = [
  [3, 6, 10],
  [2, 5, 9],
  [4, 7, 10],
  [3, 7, 10],
];

// Four-step progressions for "Which comes next?" — three shown + the next one.
// Equal, clearly visible steps so the growing pattern is unmistakable.
const VALUE_QUADS: Array<[number, number, number, number]> = [
  [2, 4, 6, 8],
  [3, 5, 7, 9],
  [2, 4, 6, 10],
  [1, 4, 7, 10],
];

function buildFamilyTrio(family: Family): MeasurelandsObject[] {
  const values = choose(VALUE_TRIPLES);
  const accents = shuffle(ACCENTS).slice(0, 3);
  const sizeTags = ["short", "mid", "long"];
  return values.map((value, i) => ({
    id: `${family.setId}-${sizeTags[i]}`,
    label: family.label,
    icon: family.icon,
    imageSrc: family.imageSrc,
    compareValue: value,
    axis: family.axis,
    accent: accents[i]!,
  }));
}

// Ascending 4-size set of the same object (tiny → small → medium → large).
function buildFamilyQuad(family: Family): MeasurelandsObject[] {
  const values = choose(VALUE_QUADS);
  const accents = shuffle(ACCENTS).slice(0, 4);
  const sizeTags = ["xs", "s", "m", "l"];
  return values.map((value, i) => ({
    id: `${family.setId}-${sizeTags[i]}`,
    label: family.label,
    icon: family.icon,
    imageSrc: family.imageSrc,
    compareValue: value,
    axis: family.axis,
    accent: accents[i]!,
  }));
}

function buildCreatureTrio(): { setId: string; objects: MeasurelandsObject[] } {
  const set = choose(CREATURE_SETS);
  const values = choose(VALUE_TRIPLES);
  const accents = shuffle(ACCENTS).slice(0, 3);
  const setId = `creature-${set.map((c) => c.label).join("-")}`;
  const objects = set.map((creature, i) => ({
    id: `${creature.label.toLowerCase()}`,
    label: creature.label,
    icon: creature.icon,
    compareValue: values[i]!,
    axis: "length" as const,
    accent: accents[i]!,
  }));
  return { setId, objects };
}

const TEACHING_MOMENTS: NonNullable<MeasurelandsTask["teachingMoments"]> = [
  {
    id: "pencil-order",
    title: "Shortest and Longest",
    left: { label: "Short Pencil", icon: "✏️", imageSrc: WEEK1_IMAGES.pencil, compareValue: 4, axis: "length", accent: "rose" },
    right: { label: "Long Pencil", icon: "✏️", imageSrc: WEEK1_IMAGES.pencil, compareValue: 10, axis: "length", accent: "teal" },
    narration: "This pencil is the shortest. This pencil is the longest.",
  },
  {
    id: "road-order",
    title: "Putting Things In Order",
    left: { label: "Short Road", icon: "🛣️", imageSrc: WEEK1_IMAGES.road, compareValue: 4, axis: "length", accent: "gold" },
    right: { label: "Long Road", icon: "🛣️", imageSrc: WEEK1_IMAGES.road, compareValue: 9, axis: "length", accent: "violet" },
    narration: "We can place objects in order from shortest to longest.",
  },
];

function buildIntroTask(): MeasurelandsTask {
  return {
    kind: "measurementCompare",
    scene: "intro",
    prompt: "Let’s put lengths in order!",
    speakText:
      "Length Lands is in trouble! The Fog of Forgetfulness has mixed everything up. We need to put objects back in the correct order, from shortest to longest, and longest to shortest. Let's help Meazurex sort Length Lands.",
    badgeLabel: "Meazurex Mission",
    objects: [],
    teachingMoments: TEACHING_MOMENTS,
    correctOptionId: "continue",
    feedback: { correct: "Let's start sorting!", wrong: "Let's get ready." },
  };
}

// Activity A — Line Them Up: always shortest → longest.
function buildLineThemUpTask(memory: LessonMemory): MeasurelandsTask {
  const useCreature = Math.random() < 0.5;
  let setId: string;
  let trio: MeasurelandsObject[];
  if (useCreature) {
    const built = buildCreatureTrio();
    setId = built.setId;
    trio = built.objects;
  } else {
    const family = choose(FAMILIES.filter((f) => f.setId !== memory.lastSetId));
    setId = family.setId;
    trio = buildFamilyTrio(family);
  }
  memory.lastSetId = setId;

  const orderedIds = [...trio]
    .sort((a, b) => a.compareValue - b.compareValue)
    .map((o) => o.id);
  const longest = trio.reduce((best, cur) => (cur.compareValue > best.compareValue ? cur : best));

  return {
    kind: "measurementCompare",
    scene: "order",
    prompt: "Put the objects in order: shortest to longest.",
    speakText: "Put the objects in order, from shortest to longest.",
    badgeLabel: "Line Them Up",
    targetMode: "shortest",
    objects: shuffle(trio),
    orderedIds,
    correctOptionId: longest.id,
    feedback: { correct: "Excellent sorting!", wrong: "Let's try again." },
  };
}

// Activity B — Meazurex's Sorting Machine: random direction (introduces reverse).
function buildSortingMachineTask(difficulty: Difficulty, memory: LessonMemory): MeasurelandsTask {
  const family = choose(FAMILIES.filter((f) => f.setId !== memory.lastSetId));
  memory.lastSetId = family.setId;
  const trio = buildFamilyTrio(family);
  const descending = Math.random() < 0.5; // longest → shortest

  const orderedIds = [...trio]
    .sort((a, b) => (descending ? b.compareValue - a.compareValue : a.compareValue - b.compareValue))
    .map((o) => o.id);
  const target = trio.reduce((best, cur) =>
    descending
      ? cur.compareValue > best.compareValue ? cur : best
      : cur.compareValue < best.compareValue ? cur : best
  );

  return {
    kind: "measurementCompare",
    scene: "order",
    prompt: descending
      ? "Sort the machine: longest to shortest."
      : "Sort the machine: shortest to longest.",
    speakText: descending
      ? "Put the objects in order, from longest to shortest."
      : "Put the objects in order, from shortest to longest.",
    badgeLabel: "Meazurex's Sorting Machine",
    targetMode: descending ? "longest" : "shortest",
    objects: shuffle(trio),
    orderedIds,
    correctOptionId: target.id,
    feedback: {
      correct: "Wonderful sorting!",
      wrong: difficulty === "hard" ? "Check the order carefully and try again." : "Let's try again.",
    },
  };
}

// Activity C — Which Comes Next?: continue the growing length sequence.
function buildWhichComesNextTask(memory: LessonMemory): MeasurelandsTask {
  const family = choose(FAMILIES.filter((f) => f.setId !== memory.lastSetId));
  memory.lastSetId = family.setId;

  // A full four-step growing progression, ascending: tiny → small → medium → large.
  const quad = buildFamilyQuad(family).sort((a, b) => a.compareValue - b.compareValue);

  // Show the first THREE (so the "getting bigger" pattern is unambiguous), then
  // ask for the fourth. The correct answer is the only option larger than the
  // last shown item — both distractors are smaller — so there is exactly one
  // defensible answer.
  const prefix = [quad[0]!, quad[1]!, quad[2]!];
  const correct = quad[3]!;

  const distractorA: MeasurelandsObject = { ...quad[0]!, id: `${family.setId}-dA` };
  const distractorB: MeasurelandsObject = { ...quad[1]!, id: `${family.setId}-dB` };

  return {
    kind: "measurementCompare",
    scene: "sequence",
    prompt: "Which object comes next?",
    speakText: "Look at the pattern. They are getting bigger. Which object comes next?",
    badgeLabel: "Which Comes Next?",
    targetMode: "longest",
    sequencePrefix: prefix,
    objects: shuffle([correct, distractorA, distractorB]),
    correctOptionId: correct.id,
    feedback: { correct: "Great pattern spotting!", wrong: "Look — they keep getting bigger." },
  };
}

export function generatePrepMeasurelandsWeek1Lesson2Task(
  lessonId: string,
  difficulty: Difficulty,
): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }

  const rotation = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;

  if (rotation === "A") return buildLineThemUpTask(memory);
  if (rotation === "B") return buildSortingMachineTask(difficulty, memory);
  return buildWhichComesNextTask(memory);
}

export function resetPrepMeasurelandsWeek1Lesson2TaskSessionState() {
  lessonMemory.clear();
}
