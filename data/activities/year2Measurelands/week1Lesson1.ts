import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 2 (Year 2) · Week 1 · Lesson 1 — "How Many More?" ──
// AC9M2M01. Year 2 thinking: Level 1 measured a length and judged "which is
// longer"; Level 2 QUANTIFIES THE DIFFERENCE — "how many more / fewer units".
// Both objects are shown measured in uniform blocks; the child reads each count
// and works out the gap. Reuses the measurePath card's new "difference" scene.
// (Ordering 3 objects and unit-size reasoning are Lesson 2 and Lesson 3.)

type MeasurePathTask = Extract<PracticeTask, { kind: "measurePath" }>;

const BASE = "/images/measurelands/measure-objects-3d";

// Wide object pool from day one (all 8 length illustrations, multiple lengths
// each) so the lesson never feels like "measuring the same thing again".
type Family = { id: string; label: string; image: string; lengths: number[] };
const FAMILIES: Family[] = [
  { id: "crayon", label: "Crayon", image: `${BASE}/crayon.png`, lengths: [3, 4, 5] },
  { id: "worm", label: "Worm", image: `${BASE}/worm.png`, lengths: [3, 4, 5] },
  { id: "carrot", label: "Carrot", image: `${BASE}/carrot.png`, lengths: [4, 5, 6] },
  { id: "pencil", label: "Pencil", image: `${BASE}/pencil.png`, lengths: [5, 6, 7] },
  { id: "cucumber", label: "Cucumber", image: `${BASE}/cucumber.png`, lengths: [6, 7, 8] },
  { id: "snake", label: "Snake", image: `${BASE}/snake.png`, lengths: [7, 8, 9, 10] },
  { id: "plank", label: "Plank", image: `${BASE}/plank.png`, lengths: [7, 8, 9] },
  { id: "vine", label: "Vine", image: `${BASE}/vine.png`, lengths: [8, 9, 10, 11] },
];

type Obj = { id: string; familyId: string; label: string; image: string; blocks: number };
const OBJECTS: Obj[] = FAMILIES.flatMap((f) =>
  f.lengths.map((blocks) => ({ id: `${f.id}-${blocks}`, familyId: f.id, label: f.label, image: f.image, blocks })),
);

type LessonMemory = { introShown: boolean; cursor: number; lastKey: string | null };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"more" | "fewer"> = ["more", "fewer", "more", "fewer"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, lastKey: null };
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

// Two objects from different families, different counts, gap 1..5; avoid an
// immediate repeat of the same pair.
function pickPair(memory: LessonMemory): [Obj, Obj] {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const a = choose(OBJECTS);
    const pool = OBJECTS.filter(
      (o) => o.familyId !== a.familyId && o.blocks !== a.blocks && Math.abs(o.blocks - a.blocks) <= 5,
    );
    if (pool.length === 0) continue;
    const b = choose(pool);
    const key = [a.id, b.id].sort().join("|");
    if (key !== memory.lastKey) {
      memory.lastKey = key;
      return a.blocks > b.blocks ? [a, b] : [b, a]; // [longer, shorter]
    }
  }
  return [OBJECTS.find((o) => o.id === "vine-10")!, OBJECTS.find((o) => o.id === "crayon-4")!];
}

function diffOptions(correct: number): number[] {
  const candidates = [correct + 1, correct - 1, correct + 2, correct - 2].filter(
    (n) => n >= 1 && n <= 10 && n !== correct,
  );
  return shuffle([correct, ...shuffle([...new Set(candidates)]).slice(0, 2)]);
}

function toPath(o: Obj) {
  return { id: o.id, length: o.blocks, unitEmoji: "block", unitLabel: "blocks", objectImageSrc: o.image, objectLabel: o.label };
}

function buildIntroTask(): MeasurePathTask {
  const longer = OBJECTS.find((o) => o.id === "snake-9")!;
  const shorter = OBJECTS.find((o) => o.id === "crayon-4")!;
  return {
    kind: "measurePath",
    scene: "intro",
    prompt: "How many more?",
    speakText:
      "In Level 1 we measured how many blocks long something is. Now we go further: we find HOW MANY MORE. The snake is nine blocks. The crayon is four blocks. Nine is five more than four, so the snake is five blocks longer.",
    badgeLabel: "Meazurex Mission",
    teachingPaths: [
      { length: longer.blocks, unitEmoji: "block", caption: `The snake is ${longer.blocks} blocks long.`, objectImageSrc: longer.image, objectLabel: "Snake" },
      { length: shorter.blocks, unitEmoji: "block", caption: `The crayon is ${shorter.blocks} blocks long.`, objectImageSrc: shorter.image, objectLabel: "Crayon" },
    ],
    feedback: { correct: "Let's find how many more!", wrong: "Let's get ready." },
  };
}

function buildDifferenceTask(memory: LessonMemory, mode: "more" | "fewer"): MeasurePathTask {
  const [longer, shorter] = pickPair(memory);
  const diff = longer.blocks - shorter.blocks;
  const prompt =
    mode === "more"
      ? `How many more blocks is the ${longer.label.toLowerCase()} than the ${shorter.label.toLowerCase()}?`
      : `How many fewer blocks is the ${shorter.label.toLowerCase()} than the ${longer.label.toLowerCase()}?`;
  return {
    kind: "measurePath",
    scene: "difference",
    prompt,
    speakText: prompt,
    badgeLabel: mode === "more" ? "How Many More?" : "How Many Fewer?",
    paths: [toPath(longer), toPath(shorter)],
    options: diffOptions(diff),
    correctAnswer: diff,
    feedback: {
      correct: `Yes — ${diff} ${diff === 1 ? "block" : "blocks"}!`,
      wrong: "Count the blocks for each, then find the difference.",
    },
  };
}

export function generateY2MeasurelandsWeek1Lesson1Task(
  lessonId: string,
  _difficulty: Difficulty,
): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const mode = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  return buildDifferenceTask(memory, mode);
}

export function resetY2MeasurelandsWeek1Lesson1TaskSessionState() {
  lessonMemory.clear();
}

// 5 fixed tasks for the weekly quiz / post-test: how-many-more / fewer.
export function buildY2MeasurelandsWeek1Lesson1QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, lastKey: null };
  return [
    buildDifferenceTask(seed, "more"),
    buildDifferenceTask(seed, "fewer"),
    buildDifferenceTask(seed, "more"),
    buildDifferenceTask(seed, "fewer"),
    buildDifferenceTask(seed, "more"),
  ];
}
