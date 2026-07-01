import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 2 (Year 2) · Week 4 · Lesson 3
// "Different Units, Different Counts"
// AC9M2M01 — same object, different uniform informal units. Students learn that
// smaller units produce a bigger count and larger units produce a smaller count.

type ToolTask = Extract<PracticeTask, { kind: "toolChoice" }>;

type UnitId = "paperclips" | "blocks" | "crayons" | "pencils";
type Unit = { id: UnitId; label: string; focus: string; iconKey: string; imageSrc?: string; unitSize: number };
type Obj = { id: string; label: string; iconKey: string; imageSrc?: string; lengthUnits: number };

const MEASURE_OBJECT_BASE = "/images/measurelands/measure-objects-3d";
const EVERYDAY_BASE = "/images/measurelands/everyday-3d";
const TOOL_BASE = "/images/measurelands/tools-3d";

const UNITS: Record<UnitId, Unit> = {
  paperclips: { id: "paperclips", label: "Paper Clips", focus: "small units", iconKey: "paperclips", unitSize: 1 },
  blocks: { id: "blocks", label: "Blocks", focus: "medium units", iconKey: "blocks", imageSrc: `${TOOL_BASE}/tool-cubes.png`, unitSize: 2 },
  crayons: { id: "crayons", label: "Crayons", focus: "longer units", iconKey: "crayons", imageSrc: `${MEASURE_OBJECT_BASE}/crayon.png`, unitSize: 3 },
  pencils: { id: "pencils", label: "Pencils", focus: "large units", iconKey: "pencils", imageSrc: `${MEASURE_OBJECT_BASE}/pencil.png`, unitSize: 4 },
};

const UNIT_ORDER: UnitId[] = ["paperclips", "blocks", "crayons", "pencils"];

const OBJECTS: Obj[] = [
  { id: "pencil", label: "Pencil", iconKey: "pencil", imageSrc: `${MEASURE_OBJECT_BASE}/pencil.png`, lengthUnits: 12 },
  { id: "book", label: "Book", iconKey: "book", imageSrc: `${EVERYDAY_BASE}/object-book.png`, lengthUnits: 16 },
  { id: "rope", label: "Rope", iconKey: "rope", imageSrc: `${MEASURE_OBJECT_BASE}/vine.png`, lengthUnits: 24 },
];

type LessonMemory = { introShown: boolean; cursor: number; recent: string[] };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"measureUnit" | "sameObject" | "completeMeasure"> = [
  "measureUnit",
  "sameObject",
  "completeMeasure",
  "measureUnit",
  "sameObject",
  "completeMeasure",
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
  memory.recent = [object.id, ...memory.recent].slice(0, 2);
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

function measurementRow(object: Obj, unitId: UnitId) {
  const unit = UNITS[unitId];
  return {
    id: unitId,
    unitLabel: unit.label,
    unitIconKey: unit.iconKey,
    unitImageSrc: unit.imageSrc,
    count: countWithUnit(object, unitId),
  };
}

function introTools() {
  return UNIT_ORDER.map((id) => {
    const unit = UNITS[id];
    return { id, label: unit.label, focus: unit.focus, iconKey: unit.iconKey, imageSrc: unit.imageSrc };
  });
}

function buildIntroTask(): ToolTask {
  return {
    kind: "toolChoice",
    scene: "intro",
    prompt: "Different units can measure the same object.",
    speakText:
      "Professor Gauge says: The same object can be measured with different informal units. Smaller units make a bigger count. Larger units make a smaller count.",
    badgeLabel: "Meazurex Mission",
    introTools: introTools(),
    feedback: { correct: "Let's measure the same object in different ways.", wrong: "Let's get ready." },
  };
}

function buildMeasureUnitTask(memory: LessonMemory): ToolTask {
  const object = pickObject(memory);
  const correctUnit: UnitId = "paperclips";
  const options: UnitId[] = object.id === "pencil" ? ["paperclips", "blocks", "crayons"] : ["paperclips", "blocks", "pencils"];
  return {
    kind: "toolChoice",
    scene: "measureUnit",
    prompt: `Which unit gives the biggest count for the ${object.label.toLowerCase()}?`,
    speakText: `The same ${object.label.toLowerCase()} is measured with different units. Which unit gives the biggest count?`,
    badgeLabel: "How Many Long?",
    object: objectCard(object),
    tools: shuffle(options.map(unitOption)),
    correctToolId: correctUnit,
    measurementRows: options.map((id) => measurementRow(object, id)),
    feedback: {
      correct: `Yes. Paper clips are the smallest unit, so they make the biggest count.`,
      wrong: `Correct answer: Paper Clips. Smaller units make a bigger count for the same object.`,
    },
  };
}

function buildSameObjectTask(memory: LessonMemory): ToolTask {
  const object = pickObject(memory);
  const first: UnitId = "blocks";
  const second: UnitId = "paperclips";
  return {
    kind: "toolChoice",
    scene: "sameObject",
    prompt: `Could both measurements be correct?`,
    speakText: `${object.label}: ${countWithUnit(object, first)} blocks and ${countWithUnit(object, second)} paper clips. Could both measurements be correct?`,
    badgeLabel: "Same Object",
    object: objectCard(object),
    measurementRows: [measurementRow(object, first), measurementRow(object, second)],
    reasonOptions: shuffle(["Yes, the units are different sizes", "No, only one number can be right", "No, the object changed size"]),
    correctReason: "Yes, the units are different sizes",
    feedback: {
      correct: "Yes. Both can be correct because the units are different sizes.",
      wrong: "Correct answer: yes. The same object can have different counts when the units are different sizes.",
    },
  };
}

function buildCompleteMeasureTask(memory: LessonMemory): ToolTask {
  const object = pickObject(memory);
  const unitId: UnitId = "paperclips";
  const targetCount = countWithUnit(object, unitId);
  const shownCount = Math.max(3, targetCount - 3);
  const unit = UNITS[unitId];
  return {
    kind: "toolChoice",
    scene: "completeMeasure",
    prompt: `Complete the ${object.label.toLowerCase()} measurement.`,
    speakText: `Complete the ${object.label.toLowerCase()} measurement. Add paper clips until the measure is complete.`,
    badgeLabel: "Complete the Measurement",
    object: objectCard(object),
    completeMeasurement: {
      unitLabel: unit.label,
      unitIconKey: unit.iconKey,
      unitImageSrc: unit.imageSrc,
      shownCount,
      targetCount,
    },
    correctCount: targetCount,
    feedback: {
      correct: `Correct. The ${object.label.toLowerCase()} is ${targetCount} paper clips long.`,
      wrong: `Correct answer: ${targetCount} paper clips. Fill every space with the same unit.`,
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
  if (rotation === "sameObject") return buildSameObjectTask(memory);
  if (rotation === "completeMeasure") return buildCompleteMeasureTask(memory);
  return buildMeasureUnitTask(memory);
}

export function resetY2MeasurelandsWeek4Lesson3TaskSessionState() {
  lessonMemory.clear();
}

export function buildY2MeasurelandsWeek4Lesson3QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, recent: [] };
  return [
    buildMeasureUnitTask(seed),
    buildSameObjectTask(seed),
    buildCompleteMeasureTask(seed),
    buildMeasureUnitTask(seed),
    buildSameObjectTask(seed),
  ];
}
