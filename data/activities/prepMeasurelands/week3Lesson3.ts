import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Ground Level · Week 3 · Lesson 3 — "Filling the Springs" ──
// Foundation Measurement (AC9MFM01, everyday capacity language): describe how
// full a container is — empty, nearly empty, half full, nearly full, full.
//
// One consistent fillable container (the gauge) is used everywhere so the WATER
// LEVEL is the only thing that changes. Fill levels are fixed + well separated,
// so no state is ever ambiguous. Reuses the shared measurementCompare scenes:
//   A — How Full?       (sort  — pick the matching word)
//   B — Find the ___    (trio  — pick the gauge that matches a word)
//   C — Empty to Full   (order — arrange gauges by fullness)

type CompareTask = Extract<PracticeTask, { kind: "measurementCompare" }>;
type MObj = CompareTask["objects"][number];
type Accent = MObj["accent"];

type LessonMemory = {
  introShown: boolean;
  cursor: number;
  lastStateId: string | null;
};

const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"A" | "B" | "C"> = ["A", "B", "C", "A", "C", "B"];
const ACCENTS: Accent[] = ["sky", "teal", "violet", "gold", "rose", "leaf"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, lastStateId: null };
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

// Five fixed, well-separated fill states. Gaps are large enough (>=0.18) that no
// level can reasonably be read as two labels. `full` reaches the brim; `nearly
// full` sits clearly below it; `nearly empty` is a thin visible layer.
type FillState = { id: string; label: string; waterLevel: number };
const FILL_STATES: FillState[] = [
  { id: "empty", label: "Empty", waterLevel: 0 },
  { id: "nearly-empty", label: "Nearly Empty", waterLevel: 0.18 },
  { id: "half-full", label: "Half Full", waterLevel: 0.5 },
  { id: "nearly-full", label: "Nearly Full", waterLevel: 0.82 },
  { id: "full", label: "Full", waterLevel: 1 },
];

const STATE_BY_ID: Record<string, FillState> = Object.fromEntries(
  FILL_STATES.map((s) => [s.id, s]),
);

// The gauge ignores compareValue/icon/imageSrc and draws a fixed fillable
// container from `waterLevel`, so every spring looks identical except the level.
function toSpring(state: FillState, accent: Accent, suffix = ""): MObj {
  return {
    id: `${state.id}${suffix}`,
    label: "Spring",
    icon: "",
    compareValue: 5,
    axis: "capacity",
    waterLevel: state.waterLevel,
    accent,
  };
}

function fillBins(): NonNullable<CompareTask["bins"]> {
  return FILL_STATES.map((s) => ({ id: s.id, label: s.label, icon: "", fill: s.waterLevel }));
}

function chooseStateWithoutRepeat(memory: LessonMemory): FillState {
  let picked = choose(FILL_STATES);
  let guard = 0;
  while (picked.id === memory.lastStateId && guard++ < 20) {
    picked = choose(FILL_STATES);
  }
  memory.lastStateId = picked.id;
  return picked;
}

function buildIntroTask(): CompareTask {
  return {
    kind: "measurementCompare",
    scene: "intro",
    prompt: "Let's learn how full a container is!",
    speakText:
      "Professor Gauge says we can describe how full a container is. It can be empty, nearly empty, half full, nearly full, or full. Let's fill the springs of Measurelands.",
    badgeLabel: "Professor Gauge",
    introIcon: "",
    introBody: [
      "We can say how full a container is.",
      "Empty has nothing in it. Full goes right to the top.",
      "Half full is filled to the middle.",
      "Nearly empty has just a little. Nearly full is almost to the top.",
      "Let's fill the springs!",
    ],
    objects: [],
    correctOptionId: "continue",
    feedback: { correct: "Let's start filling!", wrong: "Let's get ready." },
  };
}

// ── Activity A — How Full? (sort: pick the matching word) ───────────────────
function buildDescribeTask(memory: LessonMemory): CompareTask {
  const state = chooseStateWithoutRepeat(memory);
  const accent = choose(ACCENTS);
  return {
    kind: "measurementCompare",
    scene: "sort",
    fillState: true,
    prompt: "How full is the spring?",
    speakText: "How full is the spring?",
    badgeLabel: "Fill Check",
    objects: [toSpring(state, accent)],
    bins: fillBins(),
    correctOptionId: state.id,
    feedback: { correct: `Yes! It is ${state.label.toLowerCase()}.`, wrong: "Look at the water level." },
  };
}

// ── Activity B — Find the ___ (trio: pick the gauge that matches a word) ─────
function buildFindTask(memory: LessonMemory): CompareTask {
  const target = chooseStateWithoutRepeat(memory);
  const others = shuffle(FILL_STATES.filter((s) => s.id !== target.id)).slice(0, 2);
  const accents = shuffle(ACCENTS);
  const objects = shuffle([
    toSpring(target, accents[0]!, "-t"),
    toSpring(others[0]!, accents[1]!, "-a"),
    toSpring(others[1]!, accents[2]!, "-b"),
  ]);
  return {
    kind: "measurementCompare",
    scene: "trio",
    fillState: true,
    prompt: `Find the ${target.label.toLowerCase()} spring.`,
    speakText: `Find the ${target.label.toLowerCase()} spring.`,
    badgeLabel: "Find the Spring",
    objects,
    correctOptionId: `${target.id}-t`,
    feedback: { correct: "Great find!", wrong: "Look again at how full each one is." },
  };
}

// ── Activity C — Empty to Full (order: arrange gauges by fullness) ───────────
function buildOrderTask(memory: LessonMemory): CompareTask {
  // Always anchor with empty + full, then add two distinct middle states.
  const middles = shuffle(
    FILL_STATES.filter((s) => s.id !== "empty" && s.id !== "full"),
  ).slice(0, 2);
  const ordered = [STATE_BY_ID.empty, ...middles, STATE_BY_ID.full]
    .slice()
    .sort((a, b) => a.waterLevel - b.waterLevel);
  const accents = shuffle(ACCENTS);
  const orderedObjects = ordered.map((s, i) => toSpring(s, accents[i]!, `-${i}`));
  memory.lastStateId = null; // ordering uses a set, not a single state
  return {
    kind: "measurementCompare",
    scene: "order",
    fillState: true,
    prompt: "Put the springs in order: empty to full.",
    speakText: "Put the springs in order, from empty to full.",
    badgeLabel: "Empty to Full",
    objects: shuffle(orderedObjects),
    orderedIds: orderedObjects.map((o) => o.id),
    correctOptionId: orderedObjects[orderedObjects.length - 1]!.id,
    feedback: { correct: "Perfect order!", wrong: "Start with the empty spring." },
  };
}

export function buildMeasurelandsWeek3Lesson3QuizTasks(): PracticeTask[] {
  const full = STATE_BY_ID.full;
  const empty = STATE_BY_ID.empty;
  const half = STATE_BY_ID["half-full"];
  const nearlyFull = STATE_BY_ID["nearly-full"];
  const nearlyEmpty = STATE_BY_ID["nearly-empty"];

  const findObjects = shuffle([
    toSpring(nearlyFull, "sky", "-q4t"),
    toSpring(nearlyEmpty, "rose", "-q4a"),
    toSpring(half, "violet", "-q4b"),
  ]);
  const orderStates = [empty, half, full];
  const orderObjects = orderStates.map((s, i) => toSpring(s, ACCENTS[i]!, `-q5-${i}`));

  return [
    {
      kind: "measurementCompare",
      scene: "sort",
      fillState: true,
      prompt: "How full is the spring?",
      speakText: "How full is the spring?",
      badgeLabel: "Fill Check",
      objects: [toSpring(full, "sky", "-q1")],
      bins: fillBins(),
      correctOptionId: "full",
      feedback: { correct: "Yes!", wrong: "Look at the water level." },
    },
    {
      kind: "measurementCompare",
      scene: "sort",
      fillState: true,
      prompt: "How full is the spring?",
      speakText: "How full is the spring?",
      badgeLabel: "Fill Check",
      objects: [toSpring(empty, "teal", "-q2")],
      bins: fillBins(),
      correctOptionId: "empty",
      feedback: { correct: "Yes!", wrong: "Look at the water level." },
    },
    {
      kind: "measurementCompare",
      scene: "sort",
      fillState: true,
      prompt: "How full is the spring?",
      speakText: "How full is the spring?",
      badgeLabel: "Fill Check",
      objects: [toSpring(half, "gold", "-q3")],
      bins: fillBins(),
      correctOptionId: "half-full",
      feedback: { correct: "Yes!", wrong: "Half full is filled to the middle." },
    },
    {
      kind: "measurementCompare",
      scene: "trio",
      fillState: true,
      prompt: "Find the nearly full spring.",
      speakText: "Find the nearly full spring.",
      badgeLabel: "Find the Spring",
      objects: findObjects,
      correctOptionId: "nearly-full-q4t",
      feedback: { correct: "Great find!", wrong: "Nearly full is almost to the top." },
    },
    {
      kind: "measurementCompare",
      scene: "order",
      fillState: true,
      prompt: "Put the springs in order: empty to full.",
      speakText: "Put the springs in order, from empty to full.",
      badgeLabel: "Empty to Full",
      objects: shuffle(orderObjects),
      orderedIds: orderObjects.map((o) => o.id),
      correctOptionId: orderObjects[orderObjects.length - 1]!.id,
      feedback: { correct: "Perfect order!", wrong: "Start with the empty spring." },
    },
  ];
}

export function generatePrepMeasurelandsWeek3Lesson3Task(
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

  if (rotation === "A") return buildDescribeTask(memory);
  if (rotation === "B") return buildFindTask(memory);
  return buildOrderTask(memory);
}

export function resetPrepMeasurelandsWeek3Lesson3TaskSessionState() {
  lessonMemory.clear();
}
