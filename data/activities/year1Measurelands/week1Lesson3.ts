import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 1 (Year 1) · Week 1 · Lesson 3 — "No Gaps, No Overlaps" ──
// AC9M1M02: informal units must be uniform and placed end-to-end with no gaps
// and no overlaps. This is the Year 1 jump Ground Level never touched —
// students EVALUATE whether a measurement is fair, not just measure/compare.
//   A — Which Is Correct?  (scene "choose",   pick the fair arrangement)
//   B — Find the Problem   (scene "diagnose", name the flaw: gap / overlap / none)
//   C — Fix the Measurement(scene "fix",      snap the blocks back together)

type ValidityTask = Extract<PracticeTask, { kind: "measureValidity" }>;
type Flaw = "none" | "gap" | "overlap";

const BASE = "/images/measurelands/measure-objects-3d";

type MeasureObject = { id: string; label: string; image: string; blocks: number };

const OBJECTS: MeasureObject[] = [
  { id: "crayon", label: "Crayon", image: `${BASE}/crayon.png`, blocks: 4 },
  { id: "carrot", label: "Carrot", image: `${BASE}/carrot.png`, blocks: 5 },
  { id: "pencil", label: "Pencil", image: `${BASE}/pencil.png`, blocks: 6 },
  { id: "cucumber", label: "Cucumber", image: `${BASE}/cucumber.png`, blocks: 6 },
  { id: "plank", label: "Plank", image: `${BASE}/plank.png`, blocks: 7 },
];

type LessonMemory = { introShown: boolean; cursor: number; lastObjectId: string | null };

const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"A" | "B" | "C"> = ["A", "B", "C", "A", "C", "B"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, lastObjectId: null };
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

function pickObject(memory: LessonMemory): MeasureObject {
  const obj = choose(OBJECTS.filter((o) => o.id !== memory.lastObjectId));
  memory.lastObjectId = obj.id;
  return obj;
}

// A flaw position that isn't right at the very ends (reads more clearly).
function flawPosition(length: number): number {
  return 1 + randInt(Math.max(1, length - 1));
}

function buildIntroTask(): ValidityTask {
  const obj = OBJECTS.find((o) => o.id === "pencil")!;
  return {
    kind: "measureValidity",
    scene: "intro",
    prompt: "Only one explorer measured correctly.",
    speakText:
      "Professor Gauge found a broken measuring station. Three explorers measured the same pencil. Blocks must touch end to end — no gaps and no overlaps. Only then is the measurement fair. Let's find the correct one!",
    badgeLabel: "Meazurex Mission",
    objectImageSrc: obj.image,
    objectLabel: obj.label,
    length: obj.blocks,
    teachingArrangements: [
      { flaw: "none", caption: "Correct — blocks touch end to end." },
      { flaw: "gap", flawIndex: 2, caption: "Not fair — there is a gap." },
      { flaw: "overlap", flawIndex: 3, caption: "Not fair — the blocks overlap." },
    ],
    feedback: { correct: "Let's start checking!", wrong: "Let's get ready." },
  };
}

// Activity A — Which measurement is correct?
function buildChooseTask(memory: LessonMemory): ValidityTask {
  const obj = pickObject(memory);
  const arrangements = shuffle([
    { id: "ok", flaw: "none" as Flaw },
    { id: "gap", flaw: "gap" as Flaw, flawIndex: flawPosition(obj.blocks) },
    { id: "over", flaw: "overlap" as Flaw, flawIndex: flawPosition(obj.blocks) },
  ]);
  return {
    kind: "measureValidity",
    scene: "choose",
    prompt: "Which measurement is correct?",
    speakText: "Which measurement is correct? The blocks must touch with no gaps and no overlaps.",
    badgeLabel: "Which Is Correct?",
    objectImageSrc: obj.image,
    objectLabel: obj.label,
    length: obj.blocks,
    arrangements,
    correctArrangementId: "ok",
    feedback: { correct: "Great measuring!", wrong: "Look carefully. The blocks must touch but not overlap." },
  };
}

// Activity B — Find the problem.
function buildDiagnoseTask(memory: LessonMemory, forced?: Flaw): ValidityTask {
  const obj = pickObject(memory);
  const flaw = forced ?? choose(["none", "gap", "overlap"] as Flaw[]);
  return {
    kind: "measureValidity",
    scene: "diagnose",
    prompt: "What is wrong with this measurement?",
    speakText: "Look at the blocks. What is wrong with this measurement?",
    badgeLabel: "Find the Problem",
    objectImageSrc: obj.image,
    objectLabel: obj.label,
    length: obj.blocks,
    flaw,
    flawIndex: flaw === "none" ? undefined : flawPosition(obj.blocks),
    diagnoseOptions: ["gap", "overlap", "none"],
    feedback: { correct: "You spotted it!", wrong: "Check if the blocks have a gap or overlap." },
  };
}

// Activity C — Fix the measurement.
function buildFixTask(memory: LessonMemory): ValidityTask {
  const obj = pickObject(memory);
  const flaw = choose(["gap", "overlap"] as Flaw[]);
  return {
    kind: "measureValidity",
    scene: "fix",
    prompt: flaw === "gap" ? "Fix the gap — snap the blocks together." : "Fix the overlap — line the blocks up.",
    speakText: "Snap the blocks together so they touch end to end with no gaps and no overlaps.",
    badgeLabel: "Fix the Measurement",
    objectImageSrc: obj.image,
    objectLabel: obj.label,
    length: obj.blocks,
    flaw,
    flawIndex: flawPosition(obj.blocks),
    feedback: { correct: "Fixed! Now it's a fair measurement.", wrong: "Snap the blocks together." },
  };
}

export function generateY1MeasurelandsWeek1Lesson3Task(
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
  if (rotation === "B") return buildDiagnoseTask(memory);
  return buildFixTask(memory);
}

export function resetY1MeasurelandsWeek1Lesson3TaskSessionState() {
  lessonMemory.clear();
}

// 5 fixed tasks for the Week 1 weekly quiz (Lesson 3's contribution).
export function buildY1MeasurelandsWeek1Lesson3QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, lastObjectId: null };
  return [
    buildChooseTask(seed),
    buildDiagnoseTask(seed, "gap"),
    buildDiagnoseTask(seed, "overlap"),
    buildDiagnoseTask(seed, "none"),
    buildChooseTask(seed),
  ];
}
