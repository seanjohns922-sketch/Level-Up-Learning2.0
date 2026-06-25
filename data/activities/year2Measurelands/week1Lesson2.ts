import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 2 (Year 2) · Week 1 · Lesson 2 — "Order by Count" ──
// AC9M2M01. Year 2 thinking: Ground asked "which is longer?"; Level 1 asked
// "how many blocks long?"; Level 2 COMPARES, ORDERS AND REASONS using the
// counts. The lift beyond Level 1 (which already compared/ordered/equalled):
//   A — Order by Count   (order 3 AND 4 objects — Level 1 only ordered 3)
//   B — Trust the Count  (compare; the count decides, not the picture)
//   C — Find the Equal Length (equivalence: same count = same length)
//   D — How Much Longer? (reasoning beat: the measurement difference)
// Reuses the measurePath card (order / compare / same / difference scenes);
// objects are the 8 image-backed length illustrations (no new artwork).

type MeasurePathTask = Extract<PracticeTask, { kind: "measurePath" }>;

const BASE = "/images/measurelands/measure-objects-3d";

type Family = { id: string; label: string; image: string; lengths: number[] };
// Overlapping length ranges (3–12) so equal-length pairs always exist across
// families and the pool is wide from day one.
const FAMILIES: Family[] = [
  { id: "crayon", label: "Crayon", image: `${BASE}/crayon.png`, lengths: [3, 4, 5] },
  { id: "worm", label: "Worm", image: `${BASE}/worm.png`, lengths: [4, 5, 6] },
  { id: "carrot", label: "Carrot", image: `${BASE}/carrot.png`, lengths: [5, 6, 7] },
  { id: "pencil", label: "Pencil", image: `${BASE}/pencil.png`, lengths: [6, 7, 8] },
  { id: "cucumber", label: "Cucumber", image: `${BASE}/cucumber.png`, lengths: [7, 8, 9] },
  { id: "snake", label: "Snake", image: `${BASE}/snake.png`, lengths: [8, 9, 10] },
  { id: "vine", label: "Vine", image: `${BASE}/vine.png`, lengths: [9, 10, 11] },
  { id: "plank", label: "Plank", image: `${BASE}/plank.png`, lengths: [10, 11, 12] },
];

type Obj = { id: string; familyId: string; label: string; image: string; blocks: number };
const OBJECTS: Obj[] = FAMILIES.flatMap((f) =>
  f.lengths.map((blocks) => ({ id: `${f.id}-${blocks}`, familyId: f.id, label: f.label, image: f.image, blocks })),
);

type LessonMemory = { introShown: boolean; cursor: number; orderSize: 3 | 4; lastKey: string | null };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"order" | "compare" | "same" | "difference"> = [
  "order", "compare", "same", "order", "difference", "same",
];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, orderSize: 3, lastKey: null };
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
function toPath(o: Obj) {
  return { id: o.id, length: o.blocks, unitEmoji: "block", unitLabel: "blocks", objectImageSrc: o.image, objectLabel: o.label };
}

// n objects with distinct families AND distinct block counts (no ties).
function pickDistinct(n: number): Obj[] {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const picked: Obj[] = [];
    const usedFamilies = new Set<string>();
    const usedLengths = new Set<number>();
    for (const o of shuffle(OBJECTS)) {
      if (usedFamilies.has(o.familyId) || usedLengths.has(o.blocks)) continue;
      picked.push(o);
      usedFamilies.add(o.familyId);
      usedLengths.add(o.blocks);
      if (picked.length === n) return picked;
    }
  }
  return shuffle(OBJECTS).slice(0, n);
}

function diffOptions(correct: number): number[] {
  const candidates = [correct + 1, correct - 1, correct + 2, correct - 2].filter(
    (x) => x >= 1 && x <= 12 && x !== correct,
  );
  return shuffle([correct, ...shuffle([...new Set(candidates)]).slice(0, 2)]);
}

function buildIntroTask(): MeasurePathTask {
  const pencil = OBJECTS.find((o) => o.id === "pencil-7")!;
  const crayon = OBJECTS.find((o) => o.id === "crayon-5")!;
  return {
    kind: "measurePath",
    scene: "intro",
    prompt: "Compare and order measurements.",
    speakText:
      "Measuring tells us how long something is. Now we compare our measurements. The pencil is seven blocks. The crayon is five blocks. The pencil is longer because it measures more blocks. Trust the count, not the picture!",
    badgeLabel: "Meazurex Mission",
    teachingPaths: [
      { length: pencil.blocks, unitEmoji: "block", caption: `The pencil is ${pencil.blocks} blocks.`, objectImageSrc: pencil.image, objectLabel: "Pencil" },
      { length: crayon.blocks, unitEmoji: "block", caption: `The crayon is ${crayon.blocks} blocks.`, objectImageSrc: crayon.image, objectLabel: "Crayon" },
    ],
    feedback: { correct: "Let's compare and order!", wrong: "Let's get ready." },
  };
}

// Activity A — order 3 or 4 objects shortest -> longest.
function buildOrderTask(memory: LessonMemory, size: 3 | 4): MeasurePathTask {
  let picked = pickDistinct(size);
  let key = picked.map((o) => o.id).sort().join("|");
  if (key === memory.lastKey) {
    picked = pickDistinct(size);
    key = picked.map((o) => o.id).sort().join("|");
  }
  memory.lastKey = key;
  const ordered = [...picked].sort((a, b) => a.blocks - b.blocks);
  return {
    kind: "measurePath",
    scene: "order",
    prompt: "Put the measurements in order: shortest to longest.",
    speakText: "Tap the cards in order, from the shortest measurement to the longest.",
    badgeLabel: "Order by Count",
    paths: shuffle(picked.map(toPath)),
    correctOrderIds: ordered.map((o) => o.id),
    feedback: { correct: "In order — by the count!", wrong: "Look at the blocks: fewest first, most last." },
  };
}

// Activity B — which is longer/shorter; the count decides, not the picture.
function buildCompareTask(memory: LessonMemory): MeasurePathTask {
  const [a, b] = pickDistinct(2);
  memory.lastKey = [a!.id, b!.id].sort().join("|");
  const asks = Math.random() < 0.5 ? "longer" : "shorter";
  const target = asks === "longer" ? (a!.blocks > b!.blocks ? a! : b!) : a!.blocks < b!.blocks ? a! : b!;
  return {
    kind: "measurePath",
    scene: "compare",
    prompt: `Which is ${asks}? Trust the blocks, not the picture.`,
    speakText: `Which one is ${asks}? Count the blocks — do not be tricked by the picture.`,
    badgeLabel: "Trust the Count",
    paths: shuffle([toPath(a!), toPath(b!)]),
    correctPathId: target.id,
    feedback: {
      correct: `Yes — it measures ${asks === "longer" ? "more" : "fewer"} blocks!`,
      wrong: "Count the blocks under each one — that is the real length.",
    },
  };
}

// Activity C — find the object with the SAME length (equivalence).
function buildSameTask(memory: LessonMemory): MeasurePathTask {
  // reference length must be shared by another family (lengths 4..11 are).
  const refPool = OBJECTS.filter((o) => o.blocks >= 4 && o.blocks <= 11);
  const ref = choose(refPool);
  const L = ref.blocks;
  const equal = choose(OBJECTS.filter((o) => o.familyId !== ref.familyId && o.blocks === L));
  const distractorPool = OBJECTS.filter(
    (o) => o.blocks !== L && o.familyId !== ref.familyId && o.familyId !== equal.familyId,
  );
  // two distractors with distinct lengths
  const distractors: Obj[] = [];
  for (const o of shuffle(distractorPool)) {
    if (distractors.some((d) => d.blocks === o.blocks)) continue;
    distractors.push(o);
    if (distractors.length === 2) break;
  }
  memory.lastKey = `same-${ref.id}-${equal.id}`;
  return {
    kind: "measurePath",
    scene: "same",
    prompt: `Which object is the same length as the ${ref.label.toLowerCase()}?`,
    speakText: `The ${ref.label.toLowerCase()} is ${L} blocks. Which other object measures ${L} blocks too?`,
    badgeLabel: "Find the Equal Length",
    objectImageSrc: ref.image,
    objectLabel: ref.label,
    unitLabel: "blocks",
    unitEmoji: "block",
    pathLength: L,
    paths: shuffle([toPath(equal), ...distractors.map(toPath)]),
    correctPathId: equal.id,
    feedback: { correct: `Yes — both measure ${L} blocks, so they are equal!`, wrong: "Find the object with the same number of blocks." },
  };
}

// Activity D — reasoning beat: how much longer is the longest than the shortest?
function buildDifferenceTask(memory: LessonMemory): MeasurePathTask {
  const [a, b] = pickDistinct(2);
  const longer = a!.blocks > b!.blocks ? a! : b!;
  const shorter = a!.blocks > b!.blocks ? b! : a!;
  const diff = longer.blocks - shorter.blocks;
  memory.lastKey = [a!.id, b!.id].sort().join("|");
  return {
    kind: "measurePath",
    scene: "difference",
    prompt: `How much longer is the ${longer.label.toLowerCase()} than the ${shorter.label.toLowerCase()}?`,
    speakText: `How many more blocks is the ${longer.label.toLowerCase()} than the ${shorter.label.toLowerCase()}?`,
    badgeLabel: "How Much Longer?",
    paths: [toPath(longer), toPath(shorter)],
    options: diffOptions(diff),
    correctAnswer: diff,
    feedback: { correct: `Yes — ${diff} ${diff === 1 ? "block" : "blocks"} longer!`, wrong: "Count each one, then find the difference." },
  };
}

export function generateY2MeasurelandsWeek1Lesson2Task(
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
  if (rotation === "order") {
    const size = memory.orderSize;
    memory.orderSize = size === 3 ? 4 : 3; // alternate 3- and 4-object ordering
    return buildOrderTask(memory, size);
  }
  if (rotation === "compare") return buildCompareTask(memory);
  if (rotation === "difference") return buildDifferenceTask(memory);
  return buildSameTask(memory);
}

export function resetY2MeasurelandsWeek1Lesson2TaskSessionState() {
  lessonMemory.clear();
}
