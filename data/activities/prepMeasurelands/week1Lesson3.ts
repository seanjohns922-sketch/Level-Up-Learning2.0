import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Ground Level · Week 1 · Lesson 3 — "Measuring Paths" ──
// AC9MFM01 (Ground): measure & compare paths using equal informal units —
// footsteps, blocks, stars, flowers, stepping stones. No cm/m, no formal units.
//   A — Count the Footsteps  (scene "count",   MCQ on path length)
//   B — Which Path Is Longer? (scene "compare", tap the longer path)
//   C — Build the Path        (scene "build",   place N equal units)

type MeasurePathTask = Extract<PracticeTask, { kind: "measurePath" }>;

type LessonMemory = {
  introShown: boolean;
  cursor: number;
  lastUnitId: string | null;
};

const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"A" | "B" | "C"> = ["A", "B", "C", "A", "C", "B"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, lastUnitId: null };
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

type Unit = { id: string; emoji: string; singular: string; plural: string };

const UNITS: Unit[] = [
  { id: "footstep", emoji: "👣", singular: "footstep", plural: "footsteps" },
  { id: "block", emoji: "🟦", singular: "block", plural: "blocks" },
  { id: "star", emoji: "⭐", singular: "star", plural: "stars" },
  { id: "flower", emoji: "🌸", singular: "flower", plural: "flowers" },
  { id: "stone", emoji: "🪨", singular: "stepping stone", plural: "stepping stones" },
];

function pickUnit(memory: LessonMemory): Unit {
  const unit = choose(UNITS.filter((u) => u.id !== memory.lastUnitId));
  memory.lastUnitId = unit.id;
  return unit;
}

function buildIntroTask(): MeasurePathTask {
  return {
    kind: "measurePath",
    scene: "intro",
    prompt: "We measure paths with equal pieces.",
    speakText:
      "Meazurex has reached the Pathway Gardens. The Fog of Forgetfulness has broken all the paths. We can measure paths using equal pieces, and we count the pieces to find the length. Let's repair the paths!",
    badgeLabel: "Meazurex Mission",
    teachingPaths: [
      { length: 4, unitEmoji: "👣", caption: "This path is 4 footsteps long." },
      { length: 6, unitEmoji: "👣", caption: "This path is 6 footsteps long." },
    ],
    feedback: { correct: "Let's start measuring!", wrong: "Let's get ready." },
  };
}

// Activity A — Count the Footsteps.
function buildCountTask(memory: LessonMemory): MeasurePathTask {
  const unit = pickUnit(memory);
  const length = 3 + randInt(6); // 3–8 units

  const candidates = [length - 2, length - 1, length + 1, length + 2].filter(
    (n) => n >= 2 && n <= 9 && n !== length,
  );
  const distractors = shuffle(candidates).slice(0, 2);
  const options = shuffle([length, ...distractors]);

  return {
    kind: "measurePath",
    scene: "count",
    prompt: `How many ${unit.plural} long is the path?`,
    speakText: `How many ${unit.plural} long is the path?`,
    badgeLabel: "Count the Footsteps",
    unitEmoji: unit.emoji,
    unitLabel: unit.plural,
    pathLength: length,
    options,
    correctAnswer: length,
    feedback: { correct: "You counted the path!", wrong: "Count each piece one by one." },
  };
}

// Activity B — Which Path Is Longer?
function buildCompareTask(memory: LessonMemory): MeasurePathTask {
  const unit = pickUnit(memory);
  const shortLen = 2 + randInt(4); // 2–5
  const longLen = shortLen + 2 + randInt(3); // at least 2 longer, up to 8-ish

  const shortPath = { id: "p-short", length: shortLen, unitEmoji: unit.emoji, unitLabel: unit.plural };
  const longPath = { id: "p-long", length: longLen, unitEmoji: unit.emoji, unitLabel: unit.plural };
  const paths = shuffle([shortPath, longPath]);

  return {
    kind: "measurePath",
    scene: "compare",
    prompt: "Which path is longer?",
    speakText: "Which path is longer?",
    badgeLabel: "Which Path Is Longer?",
    paths,
    correctPathId: longPath.id,
    feedback: { correct: "That path is longer!", wrong: "Count the pieces in each path." },
  };
}

// Activity C — Build the Path.
function buildBuildTask(memory: LessonMemory, difficulty: Difficulty): MeasurePathTask {
  const unit = pickUnit(memory);
  const maxTarget = difficulty === "hard" ? 8 : 7;
  const target = 3 + randInt(maxTarget - 2); // 3 … maxTarget

  return {
    kind: "measurePath",
    scene: "build",
    prompt: `Build a path ${target} ${unit.plural} long.`,
    speakText: `Build a path ${target} ${unit.plural} long.`,
    badgeLabel: "Build the Path",
    unitEmoji: unit.emoji,
    unitLabel: unit.plural,
    targetLength: target,
    maxUnits: target + 3,
    feedback: { correct: "Path repaired!", wrong: "Count your pieces and try again." },
  };
}

export function generatePrepMeasurelandsWeek1Lesson3Task(
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

  if (rotation === "A") return buildCountTask(memory);
  if (rotation === "B") return buildCompareTask(memory);
  return buildBuildTask(memory, difficulty);
}

export function resetPrepMeasurelandsWeek1Lesson3TaskSessionState() {
  lessonMemory.clear();
}
