import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 1 · Week 3 · Lesson 1 — "Fill with Cups" ──
// AC9M1M01: measure & compare capacity using uniform informal units (cups).
// Ground Level compared "which holds more?"; Level 1 MEASURES — "how many cups?"
// — then compares the counts. `look` (apparent height/size) is tracked apart
// from `cups` so the taller-looking container never holds more (height bias).
//   A — Fill with Cups    (scene "count",   container holds N cups, MCQ)
//   B — Count the Cups     (scene "count",   read an existing measurement)
//   C — Which Holds More?  (scene "compare", two measured containers)

type CapacityTask = Extract<PracticeTask, { kind: "capacityMeasure" }>;

const BASE = "/images/measurelands/containers-3d";

type Container = { id: string; label: string; image: string; cups: number; look: number };

// `cups` = capacity (2–10). `look` = how big the container APPEARS on screen
// (1 small … 5 large), calibrated to the actual art. Compare questions pair
// containers of SIMILAR apparent size with different cup counts, so size can't
// reveal the answer — students must count the cups.
const CONTAINERS: Container[] = [
  { id: "cup", label: "Cup", image: `${BASE}/cup.png`, cups: 2, look: 1 },
  { id: "mug", label: "Mug", image: `${BASE}/mug.png`, cups: 3, look: 2 },
  { id: "bottle", label: "Bottle", image: `${BASE}/bottle.png`, cups: 4, look: 2 },
  { id: "jug", label: "Jug", image: `${BASE}/jug.png`, cups: 5, look: 3 },
  { id: "kettle", label: "Kettle", image: `${BASE}/kettle.png`, cups: 5, look: 3 },
  { id: "watering-can", label: "Watering Can", image: `${BASE}/watering-can.png`, cups: 6, look: 3 },
  { id: "bucket", label: "Bucket", image: `${BASE}/bucket.png`, cups: 7, look: 4 },
  { id: "fish-tank", label: "Fish Tank", image: `${BASE}/fish-tank.png`, cups: 9, look: 5 },
  { id: "bathtub", label: "Bathtub", image: `${BASE}/bathtub.png`, cups: 10, look: 5 },
];

const BY_ID: Record<string, Container> = Object.fromEntries(CONTAINERS.map((c) => [c.id, c]));

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

function pickContainer(memory: LessonMemory): Container {
  const c = choose(CONTAINERS.filter((o) => o.id !== memory.lastId));
  memory.lastId = c.id;
  return c;
}

function countOptions(value: number): number[] {
  const candidates = [value - 2, value - 1, value + 1, value + 2].filter((n) => n >= 1 && n <= 12 && n !== value);
  return shuffle([value, ...shuffle(candidates).slice(0, 2)]);
}

const toItem = (c: Container) => ({ id: c.id, imageSrc: c.image, label: c.label, cups: c.cups });

// Two containers of SIMILAR apparent size but different capacity, so the answer
// can't be read off the picture — students must count the cups. (With this art,
// apparent size roughly tracks capacity, so we make size ambiguous rather than
// inverted.)
function pickBusterPair(memory: LessonMemory): [Container, Container] {
  const first = pickContainer(memory);
  const candidates = CONTAINERS.filter((o) => o.id !== first.id && o.cups !== first.cups);
  const ambiguous = candidates.filter((o) => Math.abs(o.look - first.look) <= 1);
  const partner = ambiguous.length ? choose(ambiguous) : choose(candidates);
  memory.lastId = partner.id;
  return [first, partner];
}

function buildIntroTask(): CapacityTask {
  return {
    kind: "capacityMeasure",
    scene: "intro",
    prompt: "We can measure how much a container holds.",
    speakText:
      "Professor Gauge has reached Capacity Springs! Last year we compared containers. Now we can measure how much they hold. Fill with the same cup each time and count the cups. You can't always tell just by looking — count the cups to be sure!",
    badgeLabel: "Meazurex Mission",
    teachingItems: [
      { imageSrc: BY_ID.jug!.image, label: "Jug", cups: 5, caption: "The jug holds 5 cups." },
      { imageSrc: BY_ID["watering-can"]!.image, label: "Watering Can", cups: 6, caption: "The watering can looks similar but holds 6 cups — count the cups to be sure!" },
    ],
    feedback: { correct: "Let's start measuring!", wrong: "Let's get ready." },
  };
}

// Activity A / B — count the cups.
function buildCountTask(memory: LessonMemory, reading: boolean): CapacityTask {
  const c = pickContainer(memory);
  return {
    kind: "capacityMeasure",
    scene: "count",
    prompt: `How many cups does the ${c.label.toLowerCase()} hold?`,
    speakText: `Count the cups. How many cups does the ${c.label.toLowerCase()} hold?`,
    badgeLabel: reading ? "Count the Cups" : "Fill with Cups",
    container: { imageSrc: c.image, label: c.label, cups: c.cups },
    options: countOptions(c.cups),
    correctAnswer: c.cups,
    feedback: { correct: "You measured the capacity!", wrong: "Count the cups one by one." },
  };
}

// Activity C — which holds more / less?
function buildCompareTask(memory: LessonMemory): CapacityTask {
  const [a, b] = pickBusterPair(memory);
  const more = randInt(2) === 0;
  const winner = more ? (a.cups > b.cups ? a : b) : (a.cups < b.cups ? a : b);
  return {
    kind: "capacityMeasure",
    scene: "compare",
    prompt: more ? "Which container holds more?" : "Which container holds less?",
    speakText: more ? "Count the cups. Which container holds more?" : "Count the cups. Which container holds less?",
    badgeLabel: more ? "Which Holds More?" : "Which Holds Less?",
    items: shuffle([toItem(a), toItem(b)]),
    compareMode: more ? "more" : "less",
    correctOptionId: winner.id,
    feedback: { correct: "More cups means it holds more!", wrong: "Count the cups for each container." },
  };
}

export function generateY1MeasurelandsWeek3Lesson1Task(
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

export function resetY1MeasurelandsWeek3Lesson1TaskSessionState() {
  lessonMemory.clear();
}

// 5 fixed tasks for the Week 3 weekly quiz (Lesson 1's contribution).
export function buildY1MeasurelandsWeek3Lesson1QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, lastId: null };
  const five = BY_ID.jug!; // holds 5
  const distractA = BY_ID.mug!;
  const distractB = BY_ID.bathtub!;
  const whichHolds: CapacityTask = {
    kind: "capacityMeasure",
    scene: "compare",
    prompt: "Which container holds 5 cups?",
    speakText: "Count the cups. Which container holds 5 cups?",
    badgeLabel: "Find the Capacity",
    items: shuffle([toItem(five), toItem(distractA), toItem(distractB)]),
    correctOptionId: five.id,
    hideCounts: true,
    feedback: { correct: "That one holds 5 cups!", wrong: "Count the cups for each container." },
  };
  return [
    buildCountTask(seed, false),
    buildCountTask(seed, true),
    whichHolds,
    buildCompareTask(seed),
    buildCompareTask(seed),
  ];
}
