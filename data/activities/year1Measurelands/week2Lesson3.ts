import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { MASS_OBJECTS, type MassObject } from "@/data/activities/year1Measurelands/week2Lesson1";

// ── Measurelands · Level 1 · Week 2 · Lesson 3 — "Fair or Unfair Measure?" ──
// AC9M1M01 (reasoning): a mass measurement is only fair when the SAME unit is
// used every time. Mass analogue of Week 1 L3 (no gaps/overlaps): here the
// fairness rule is uniform units — all balance cubes must be the same.
//   A — Which Is Fair?   (scene "fairChoose", pick the all-same-cubes scale)
//   B — Fair or Unfair?  (scene "fairJudge",  judge one measurement)
//   C — Fix the Measurement (scene "fairFix", swap to identical cubes)

type MassTask = Extract<PracticeTask, { kind: "massMeasure" }>;

const UNIFORM = 26; // px size of a "fair" balance cube
const MIXED_SIZES = [18, 22, 30, 34];

type LessonMemory = { introShown: boolean; cursor: number; lastId: string | null };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"A" | "B" | "C"> = ["A", "B", "C", "A", "C", "B"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, lastId: null };
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

function pickObject(memory: LessonMemory): MassObject {
  const obj = choose(MASS_OBJECTS.filter((o) => o.id !== memory.lastId));
  memory.lastId = obj.id;
  return obj;
}

// All cubes the same size = fair.
function fairUnits(n: number): number[] {
  return Array.from({ length: n }, () => UNIFORM);
}
// Cubes of different sizes = unfair (guaranteed at least two distinct sizes).
function unfairUnits(n: number): number[] {
  let units = Array.from({ length: n }, () => choose(MIXED_SIZES));
  if (units.every((s) => s === units[0])) units[0] = choose(MIXED_SIZES.filter((s) => s !== units[0]));
  return units;
}

function buildIntroTask(): MassTask {
  const a = MASS_OBJECTS.find((o) => o.id === "apple")!;
  return {
    kind: "massMeasure",
    scene: "intro",
    prompt: "A fair measure uses the same cubes.",
    speakText:
      "Professor Gauge says: to measure fairly, we must use the same balance cube every time. If the cubes are different sizes, the measurement is not fair. Let's check the measurements!",
    badgeLabel: "Meazurex Mission",
    teachingItems: [
      { imageSrc: a.image, label: "Apple", cubes: 4, caption: "Fair — every cube is the same." },
    ],
    feedback: { correct: "Let's check for fairness!", wrong: "Let's get ready." },
  };
}

// Activity A — Which measurement is fair?
function buildChooseTask(memory: LessonMemory): MassTask {
  const obj = pickObject(memory);
  const n = 3 + randInt(3); // 3–5 cubes
  const arrangements = shuffle([
    { id: "fair", imageSrc: obj.image, label: obj.label, units: fairUnits(n) },
    { id: "bad1", imageSrc: obj.image, label: obj.label, units: unfairUnits(n) },
    { id: "bad2", imageSrc: obj.image, label: obj.label, units: unfairUnits(n) },
  ]);
  return {
    kind: "massMeasure",
    scene: "fairChoose",
    prompt: "Which measurement is fair?",
    speakText: "A fair measurement uses cubes that are all the same. Which measurement is fair?",
    badgeLabel: "Which Is Fair?",
    fairArrangements: arrangements,
    correctOptionId: "fair",
    feedback: { correct: "Fair — all the cubes are the same!", wrong: "A fair measure uses cubes that are all the same size." },
  };
}

// Activity B — Fair or unfair?
function buildJudgeTask(memory: LessonMemory): MassTask {
  const obj = pickObject(memory);
  const n = 3 + randInt(3);
  const fair = randInt(2) === 0;
  return {
    kind: "massMeasure",
    scene: "fairJudge",
    prompt: "Is this a fair measurement?",
    speakText: "Look at the cubes. Are they all the same? Is this a fair measurement?",
    badgeLabel: "Fair or Unfair?",
    object: { imageSrc: obj.image, label: obj.label, cubes: n },
    fairUnits: fair ? fairUnits(n) : unfairUnits(n),
    fair,
    feedback: { correct: "You checked the cubes!", wrong: "A fair measure needs cubes that are all the same." },
  };
}

// Activity C — Fix the measurement.
function buildFixTask(memory: LessonMemory): MassTask {
  const obj = pickObject(memory);
  const n = 3 + randInt(3);
  return {
    kind: "massMeasure",
    scene: "fairFix",
    prompt: "Make it fair — use the same cubes.",
    speakText: "These cubes are different sizes, so it is not fair. Tap to use the same cubes every time.",
    badgeLabel: "Fix the Measurement",
    object: { imageSrc: obj.image, label: obj.label, cubes: n },
    fairUnits: unfairUnits(n),
    feedback: { correct: "Now it's fair — all the same cubes!", wrong: "Use the same cubes." },
  };
}

export function generateY1MeasurelandsWeek2Lesson3Task(
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
  if (rotation === "A") return buildChooseTask(memory);
  if (rotation === "B") return buildJudgeTask(memory);
  return buildFixTask(memory);
}

export function resetY1MeasurelandsWeek2Lesson3TaskSessionState() {
  lessonMemory.clear();
}

// 5 fixed tasks for the Week 2 weekly quiz (Lesson 3's contribution):
// which is fair, fair (judge), unfair (judge), what's wrong (unfair judge), which is fair.
export function buildY1MeasurelandsWeek2Lesson3QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, lastId: null };
  const judgeFair = (): MassTask => {
    const obj = pickObject(seed);
    const n = 4;
    return {
      kind: "massMeasure", scene: "fairJudge",
      prompt: "Is this a fair measurement?", speakText: "Are all the cubes the same? Is this fair?",
      badgeLabel: "Fair or Unfair?",
      object: { imageSrc: obj.image, label: obj.label, cubes: n },
      fairUnits: fairUnits(n), fair: true,
      feedback: { correct: "Yes — all the same cubes!", wrong: "These cubes are all the same, so it is fair." },
    };
  };
  const judgeUnfair = (prompt: string): MassTask => {
    const obj = pickObject(seed);
    const n = 4;
    return {
      kind: "massMeasure", scene: "fairJudge",
      prompt, speakText: "Are all the cubes the same? Is this fair?",
      badgeLabel: "Fair or Unfair?",
      object: { imageSrc: obj.image, label: obj.label, cubes: n },
      fairUnits: unfairUnits(n), fair: false,
      feedback: { correct: "Right — the cubes are not the same!", wrong: "The cubes are different sizes, so it is not fair." },
    };
  };
  return [
    buildChooseTask(seed),
    judgeFair(),
    judgeUnfair("Is this a fair measurement?"),
    judgeUnfair("Is this measurement fair?"),
    buildChooseTask(seed),
  ];
}
