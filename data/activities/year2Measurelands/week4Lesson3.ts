import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 2 (Year 2) · Week 4 · Lesson 3
// "Measure with Different Informal Units"
// AC9M2M01 — students measure and compare with uniform informal units, then
// reason that different-sized units produce different counts.

type ToolTask = Extract<PracticeTask, { kind: "toolChoice" }>;

type UnitId = "paperclips" | "crayons" | "blocks" | "pencils";
type Unit = { id: UnitId; label: string; focus: string; iconKey: string; imageSrc?: string; unitSize: number };
type Obj = {
  id: string;
  label: string;
  imageSrc?: string;
  iconKey: string;
  lengthUnits: number;
  bestUnitId: UnitId;
};

const MEASURE_OBJECT_BASE = "/images/measurelands/measure-objects-3d";
const EVERYDAY_BASE = "/images/measurelands/everyday-3d";
const TOOL_BASE = "/images/measurelands/tools-3d";

const UNITS: Record<UnitId, Unit> = {
  paperclips: { id: "paperclips", label: "Paper Clips", focus: "small lengths", iconKey: "paperclips", unitSize: 1 },
  crayons: { id: "crayons", label: "Crayons", focus: "books", iconKey: "crayons", imageSrc: `${MEASURE_OBJECT_BASE}/crayon.png`, unitSize: 2 },
  blocks: { id: "blocks", label: "Blocks", focus: "short objects", iconKey: "blocks", imageSrc: `${TOOL_BASE}/tool-cubes.png`, unitSize: 2 },
  pencils: { id: "pencils", label: "Pencils", focus: "longer objects", iconKey: "pencils", imageSrc: `${MEASURE_OBJECT_BASE}/pencil.png`, unitSize: 4 },
};

const UNIT_ORDER: UnitId[] = ["paperclips", "crayons", "blocks", "pencils"];

const OBJECTS: Obj[] = [
  { id: "pencil", label: "Pencil", imageSrc: `${MEASURE_OBJECT_BASE}/pencil.png`, iconKey: "pencil", lengthUnits: 6, bestUnitId: "paperclips" },
  { id: "book", label: "Book", imageSrc: `${EVERYDAY_BASE}/object-book.png`, iconKey: "book", lengthUnits: 12, bestUnitId: "crayons" },
  { id: "desk", label: "Desk", imageSrc: `${EVERYDAY_BASE}/object-desk.png`, iconKey: "desk", lengthUnits: 24, bestUnitId: "pencils" },
  { id: "rope", label: "Rope", imageSrc: `${MEASURE_OBJECT_BASE}/vine.png`, iconKey: "rope", lengthUnits: 28, bestUnitId: "pencils" },
];

type LessonMemory = { introShown: boolean; cursor: number; recent: string[] };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"chooseUnit" | "differentCounts" | "bestUnit"> = [
  "chooseUnit",
  "differentCounts",
  "bestUnit",
  "chooseUnit",
  "differentCounts",
  "bestUnit",
];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, recent: [] };
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

function pickObject(memory: LessonMemory): Obj {
  const pool = OBJECTS.filter((object) => !memory.recent.includes(object.id));
  const object = (pool.length ? pool : OBJECTS)[randInt((pool.length ? pool : OBJECTS).length)]!;
  memory.recent = [object.id, ...memory.recent].slice(0, 3);
  return object;
}

function unitOption(id: UnitId) {
  const unit = UNITS[id];
  return { id, label: unit.label, iconKey: unit.iconKey, imageSrc: unit.imageSrc };
}

function objectCard(object: Obj) {
  return { label: object.label, iconKey: object.iconKey, imageSrc: object.imageSrc };
}

function countWithUnit(object: Obj, unitId: UnitId) {
  return Math.round(object.lengthUnits / UNITS[unitId].unitSize);
}

function buildIntroTask(): ToolTask {
  return {
    kind: "toolChoice",
    scene: "intro",
    prompt: "Measure with different informal units.",
    speakText:
      "Professor Gauge says: You do not always need measuring blocks. Lots of everyday objects can be measuring units, like paper clips, crayons, blocks, and pencils.",
    badgeLabel: "Meazurex Mission",
    introTools: UNIT_ORDER.map((id) => {
      const unit = UNITS[id];
      return { id, label: unit.label, focus: unit.focus, iconKey: unit.iconKey, imageSrc: unit.imageSrc };
    }),
    feedback: { correct: "Let's measure with different units.", wrong: "Let's get ready." },
  };
}

function buildChooseUnitTask(memory: LessonMemory): ToolTask {
  const object = pickObject(memory);
  const correctUnit = object.bestUnitId;
  const tools = shuffle(UNIT_ORDER.filter((id) => id !== correctUnit).slice(0, 2).concat(correctUnit).map(unitOption));
  const count = countWithUnit(object, correctUnit);
  return {
    kind: "toolChoice",
    scene: "best",
    prompt: `Choose a measuring unit for the ${object.label.toLowerCase()}.`,
    speakText: `Choose a measuring unit for the ${object.label.toLowerCase()}.`,
    badgeLabel: "Choose the Unit",
    object: objectCard(object),
    tools,
    correctToolId: correctUnit,
    feedback: {
      correct: `Good choice. The ${object.label.toLowerCase()} measures about ${count} ${UNITS[correctUnit].label.toLowerCase()}.`,
      wrong: `Correct answer: ${UNITS[correctUnit].label}. That unit is a sensible size for the ${object.label.toLowerCase()}.`,
    },
  };
}

function buildDifferentCountsTask(memory: LessonMemory): ToolTask {
  const object = pickObject(memory);
  const smallUnit: UnitId = object.id === "pencil" ? "paperclips" : "crayons";
  const largeUnit: UnitId = object.id === "pencil" ? "crayons" : "pencils";
  const smallCount = countWithUnit(object, smallUnit);
  const largeCount = countWithUnit(object, largeUnit);
  return {
    kind: "toolChoice",
    scene: "whyBad",
    prompt: `${object.label} = ${smallCount} ${UNITS[smallUnit].label.toLowerCase()} but ${largeCount} ${UNITS[largeUnit].label.toLowerCase()}. Why are the numbers different?`,
    speakText: `${object.label} is ${smallCount} ${UNITS[smallUnit].label.toLowerCase()} but ${largeCount} ${UNITS[largeUnit].label.toLowerCase()}. Why are the numbers different?`,
    badgeLabel: "How Many?",
    object: objectCard(object),
    wrongTool: unitOption(smallUnit),
    reasonOptions: shuffle(["The units are different sizes", "The object changed size", "The numbers do not matter"]),
    correctReason: "The units are different sizes",
    feedback: {
      correct: "Yes. Smaller units make a bigger count; larger units make a smaller count.",
      wrong: "Correct answer: the units are different sizes. A smaller unit needs more repeats.",
    },
  };
}

function buildBestUnitTask(memory: LessonMemory): ToolTask {
  const object = pickObject(memory);
  const correctUnit = object.bestUnitId;
  const distractors = UNIT_ORDER.filter((id) => id !== correctUnit);
  const tools = shuffle([correctUnit, ...shuffle(distractors).slice(0, 2)].map(unitOption));
  return {
    kind: "toolChoice",
    scene: "best",
    prompt: `Best unit challenge: measure the ${object.label.toLowerCase()}.`,
    speakText: `Best unit challenge. Which informal unit is most practical for measuring the ${object.label.toLowerCase()}?`,
    badgeLabel: "Best Unit Challenge",
    object: objectCard(object),
    tools,
    correctToolId: correctUnit,
    feedback: {
      correct: `Yes. ${UNITS[correctUnit].label} are practical for measuring the ${object.label.toLowerCase()}.`,
      wrong: `Correct answer: ${UNITS[correctUnit].label}. Choose a unit that is not too tiny and not too large.`,
    },
  };
}

export function generateY2MeasurelandsWeek4Lesson3Task(
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
  if (rotation === "differentCounts") return buildDifferentCountsTask(memory);
  if (rotation === "bestUnit") return buildBestUnitTask(memory);
  return buildChooseUnitTask(memory);
}

export function resetY2MeasurelandsWeek4Lesson3TaskSessionState() {
  lessonMemory.clear();
}

export function buildY2MeasurelandsWeek4Lesson3QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, recent: [] };
  return [
    buildChooseUnitTask(seed),
    buildDifferentCountsTask(seed),
    buildBestUnitTask(seed),
    buildChooseUnitTask(seed),
    buildDifferentCountsTask(seed),
  ];
}
