import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 1 · Week 2 · Lesson 1 — "Measure with Balance Cubes" ──
// AC9M1M01: compare mass directly and indirectly using uniform informal units.
// Ground Level compared heavy/light; Level 1 MEASURES mass — "how many balance
// cubes?" — on a live balance scale, then compares the measured numbers.
//   A — Measure with Cubes   (scene "count",   object balances N cubes, MCQ)
//   B — Count the Measurement(scene "count",   read an existing measurement)
//   C — Who Has Greater Mass?(scene "compare", two measured objects)

type MassTask = Extract<PracticeTask, { kind: "massMeasure" }>;

const BASE = "/images/measurelands/week2-3d";

// `look` = how big the object APPEARS on screen (1 small … 5 large), tracked
// separately from `cubes` (its actual mass). Compare questions are built so the
// heavier object never looks bigger — that forces students to count cubes
// instead of guessing by picture size (breaks "bigger = heavier").
type MassObject = { id: string; label: string; image: string; cubes: number; look: number };

const OBJECTS: MassObject[] = [
  { id: "feather", label: "Feather", image: `${BASE}/feather.png`, cubes: 2, look: 4 },
  { id: "leaf", label: "Leaf", image: `${BASE}/leaf.png`, cubes: 2, look: 4 },
  { id: "coin", label: "Coin", image: `${BASE}/coin.png`, cubes: 3, look: 1 },
  { id: "apple", label: "Apple", image: `${BASE}/apple.png`, cubes: 3, look: 2 },
  { id: "spoon", label: "Spoon", image: `${BASE}/spoon.png`, cubes: 4, look: 3 },
  { id: "boot", label: "Shoe", image: `${BASE}/boot.png`, cubes: 5, look: 3 },
  { id: "bucket", label: "Bucket", image: `${BASE}/bucket.png`, cubes: 5, look: 4 },
  { id: "backpack", label: "Backpack", image: `${BASE}/backpack.png`, cubes: 6, look: 4 },
  { id: "watermelon", label: "Watermelon", image: `${BASE}/watermelon.png`, cubes: 8, look: 5 },
  { id: "rock", label: "Rock", image: `${BASE}/rock.png`, cubes: 9, look: 2 },
  { id: "chair", label: "Chair", image: `${BASE}/chair.png`, cubes: 9, look: 5 },
  { id: "elephant", label: "Elephant", image: `${BASE}/elephant.png`, cubes: 10, look: 5 },
];

const BY_ID: Record<string, MassObject> = Object.fromEntries(OBJECTS.map((o) => [o.id, o]));

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
  const obj = choose(OBJECTS.filter((o) => o.id !== memory.lastId));
  memory.lastId = obj.id;
  return obj;
}

function countOptions(value: number): number[] {
  const candidates = [value - 2, value - 1, value + 1, value + 2].filter((n) => n >= 1 && n <= 12 && n !== value);
  return shuffle([value, ...shuffle(candidates).slice(0, 2)]);
}

function buildIntroTask(): MassTask {
  return {
    kind: "massMeasure",
    scene: "intro",
    prompt: "We can measure mass with balance cubes.",
    speakText:
      "Professor Gauge has reached Balance Basin! Last year we compared heavy and light. Now we can measure mass. If we use the same balance cubes each time, our measurements are fair. The object that needs more cubes has greater mass.",
    badgeLabel: "Meazurex Mission",
    teachingItems: [
      { imageSrc: BY_ID.apple!.image, label: "Apple", cubes: 3, caption: "The apple balances 3 balance cubes." },
      { imageSrc: BY_ID.watermelon!.image, label: "Watermelon", cubes: 8, caption: "The watermelon needs 8 cubes — it has greater mass." },
    ],
    feedback: { correct: "Let's start measuring!", wrong: "Let's get ready." },
  };
}

// Activity A / B — count the balance cubes.
function buildCountTask(memory: LessonMemory, reading: boolean): MassTask {
  const obj = pickObject(memory);
  return {
    kind: "massMeasure",
    scene: "count",
    prompt: `How many balance cubes is the ${obj.label.toLowerCase()}?`,
    speakText: `Look at the balance scale. How many balance cubes is the ${obj.label.toLowerCase()}?`,
    badgeLabel: reading ? "Count the Measurement" : "Measure with Cubes",
    object: { imageSrc: obj.image, label: obj.label, cubes: obj.cubes },
    options: countOptions(obj.cubes),
    correctAnswer: obj.cubes,
    feedback: { correct: "You measured the mass!", wrong: "Count the balance cubes one by one." },
  };
}

// Pick two objects with different mass where the HEAVIER one does not look
// bigger (heavier.look <= lighter.look) — so picture size can't reveal the
// answer and students must count cubes. Falls back to any valid pair.
function pickComparePair(memory: LessonMemory): [MassObject, MassObject] {
  const first = pickObject(memory);
  const candidates = OBJECTS.filter((o) => o.id !== first.id && o.cubes !== first.cubes);
  const busters = candidates.filter((o) => {
    const heavier = first.cubes > o.cubes ? first : o;
    const lighter = first.cubes > o.cubes ? o : first;
    return heavier.look <= lighter.look; // heavier looks the same or smaller
  });
  const partner = busters.length ? choose(busters) : choose(candidates);
  memory.lastId = partner.id;
  return [first, partner];
}

// Activity C — who has greater / less mass?
function buildCompareTask(memory: LessonMemory): MassTask {
  const [a, b] = pickComparePair(memory);
  const greater = randInt(2) === 0;
  const winner = greater
    ? (a.cubes > b.cubes ? a : b)
    : (a.cubes < b.cubes ? a : b);
  const items = shuffle([
    { id: a.id, imageSrc: a.image, label: a.label, cubes: a.cubes },
    { id: b.id, imageSrc: b.image, label: b.label, cubes: b.cubes },
  ]);
  return {
    kind: "massMeasure",
    scene: "compare",
    prompt: greater ? "Which object has greater mass?" : "Which object has less mass?",
    speakText: greater
      ? "Look at the balance cubes. Which object has greater mass?"
      : "Look at the balance cubes. Which object has less mass?",
    badgeLabel: greater ? "Who Has Greater Mass?" : "Who Has Less Mass?",
    items,
    compareMode: greater ? "greater" : "less",
    correctOptionId: winner.id,
    feedback: { correct: "More cubes means greater mass!", wrong: "Count the cubes under each object." },
  };
}

export function generateY1MeasurelandsWeek2Lesson1Task(
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
  if (rotation === "A") return buildCountTask(memory, false);
  if (rotation === "B") return buildCountTask(memory, true);
  return buildCompareTask(memory);
}

export function resetY1MeasurelandsWeek2Lesson1TaskSessionState() {
  lessonMemory.clear();
}

// 5 fixed tasks for the Week 2 weekly quiz (Lesson 1's contribution).
export function buildY1MeasurelandsWeek2Lesson1QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, lastId: null };
  // Q3 — "Which object measures 5 cubes?" (counts hidden so they must count).
  const five = BY_ID.bucket!;
  const distractA = BY_ID.apple!;
  const distractB = BY_ID.watermelon!;
  const whichMeasures: MassTask = {
    kind: "massMeasure",
    scene: "compare",
    prompt: "Which object measures 5 balance cubes?",
    speakText: "Count the balance cubes. Which object measures 5 balance cubes?",
    badgeLabel: "Find the Measurement",
    items: shuffle([
      { id: five.id, imageSrc: five.image, label: five.label, cubes: five.cubes },
      { id: distractA.id, imageSrc: distractA.image, label: distractA.label, cubes: distractA.cubes },
      { id: distractB.id, imageSrc: distractB.image, label: distractB.label, cubes: distractB.cubes },
    ]),
    correctOptionId: five.id,
    hideCounts: true,
    feedback: { correct: "That one measures 5 cubes!", wrong: "Count the cubes on each scale." },
  };
  return [
    buildCountTask(seed, false),
    buildCountTask(seed, true),
    whichMeasures,
    buildCompareTask(seed), // greater or less mass (randomised, stable per build)
    buildCompareTask(seed),
  ];
}
