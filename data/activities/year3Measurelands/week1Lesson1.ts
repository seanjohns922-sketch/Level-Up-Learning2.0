import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 3 (Year 3) · Week 1 · Lesson 1 — "Meet the Ruler" ──
// AC9M3M01 / AC9M3M02: measure objects in WHOLE centimetres with a ruler that
// always starts at 0. The zero mark is the hero — every misconception in this
// lesson (start at the edge, start at 1, count lines not spaces) is beaten by
// lining the object up to 0 and reading whole centimetres.
// THREE rotating activities:
//   A. startZero — tap the 0 mark: where do we start measuring?
//   B. measure   — read the length of one object aligned to 0 (cm options).
//   C. compare   — two measured objects; tap the longer one.

type RulerTask = Extract<PracticeTask, { kind: "rulerMeasure" }>;

// Object pool — each drawn to scale (width = lengthCm). Emoji MATCHES the label.
// Per-object length range keeps measurements believable while staying 1–20 cm.
const OBJECTS: Array<{ label: string; icon: string; min: number; max: number }> = [
  { label: "pencil", icon: "✏️", min: 8, max: 17 },
  { label: "crayon", icon: "🖍️", min: 4, max: 9 },
  { label: "marker", icon: "🖊️", min: 10, max: 14 },
  { label: "spoon", icon: "🥄", min: 11, max: 17 },
  { label: "toy car", icon: "🚗", min: 5, max: 10 },
  { label: "key", icon: "🔑", min: 4, max: 7 },
  { label: "leaf", icon: "🍃", min: 5, max: 12 },
  { label: "ribbon", icon: "🎀", min: 9, max: 20 },
];

const MAX_RULER = 20; // a 20 cm ruler; the drawn ruler is sized to the object.

type LessonMemory = { introShown: boolean; cursor: number; recent: string[] };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"startZero" | "measure" | "compare"> = [
  "startZero", "measure", "compare", "measure", "compare", "startZero",
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
function remember(memory: LessonMemory, key: string) {
  memory.recent.push(key);
  if (memory.recent.length > 4) memory.recent.shift();
}

/** Pick an object + a random whole-cm length in its range (avoid recent repeats). */
function pickObject(memory: LessonMemory): { label: string; icon: string; lengthCm: number } {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const spec = OBJECTS[randInt(OBJECTS.length)]!;
    const lengthCm = spec.min + randInt(spec.max - spec.min + 1);
    const key = `${spec.label}-${lengthCm}`;
    if (!memory.recent.includes(key)) {
      remember(memory, key);
      return { label: spec.label, icon: spec.icon, lengthCm };
    }
  }
  const spec = OBJECTS[0]!;
  return { label: spec.label, icon: spec.icon, lengthCm: spec.min };
}

/** A ruler a little longer than the object, capped at 20 cm. */
function rulerFor(lengthCm: number): number {
  return Math.min(MAX_RULER, lengthCm + 2 + randInt(3)); // object + 2..4
}

function buildIntroTask(): RulerTask {
  return {
    kind: "rulerMeasure",
    scene: "intro",
    prompt: "You've become a real measurer! Meet your ruler.",
    speakText:
      "Professor Gauge says: you've become a real measurer! Today you'll use your first ruler. Always start measuring at zero. Line the object up with the zero mark, then read the centimetres.",
    badgeLabel: "Meazurex Mission",
    rulerCm: 12,
    object: { label: "pencil", icon: "✏️", lengthCm: 8 },
    feedback: { correct: "Let's measure!", wrong: "Let's measure!" },
  };
}

// Activity A — Start at Zero.
function buildStartZeroTask(memory: LessonMemory): RulerTask {
  const object = pickObject(memory);
  return {
    kind: "rulerMeasure",
    scene: "startZero",
    prompt: `Where should we start measuring the ${object.label}?`,
    speakText: `Where should we start measuring the ${object.label}? Tap the mark a real measurer starts from.`,
    badgeLabel: "Start at Zero",
    rulerCm: rulerFor(object.lengthCm),
    object,
    tickOptions: [0, 1, 2],
    correctTick: 0,
    includeEdgeOption: true,
    feedback: {
      correct: "Yes — always start at the 0 mark!",
      wrong: "Not there. A ruler always starts measuring at 0.",
    },
  };
}

// Activity B — Measure the Object (read whole centimetres).
function buildMeasureTask(memory: LessonMemory): RulerTask {
  const object = pickObject(memory);
  const len = object.lengthCm;
  // Three whole-cm options centred on the true length, clamped to 1..20.
  let opts = [len - 1, len, len + 1];
  if (opts[0]! < 1) opts = [len, len + 1, len + 2];
  return {
    kind: "rulerMeasure",
    scene: "measure",
    prompt: `How long is the ${object.label}?`,
    speakText: `How long is the ${object.label}? Read the centimetres from the 0 mark.`,
    badgeLabel: "Measure the Object",
    rulerCm: rulerFor(len),
    object,
    options: shuffle(opts),
    correctAnswer: len,
    feedback: {
      correct: `Yes — the ${object.label} is ${len} cm long.`,
      wrong: `Look again from 0. The ${object.label} reaches the ${len} mark.`,
    },
  };
}

// Activity C — Which Is Longer? (compare two measured objects).
function buildCompareTask(memory: LessonMemory): RulerTask {
  const a = pickObject(memory);
  let b = pickObject(memory);
  for (let attempt = 0; attempt < 20 && b.lengthCm === a.lengthCm; attempt += 1) {
    b = pickObject(memory);
  }
  if (b.lengthCm === a.lengthCm) b = { ...b, lengthCm: Math.min(MAX_RULER, a.lengthCm + 1) };
  const longer = a.lengthCm > b.lengthCm ? a : b;
  const rulerCm = rulerFor(Math.max(a.lengthCm, b.lengthCm));
  return {
    kind: "rulerMeasure",
    scene: "compare",
    prompt: "Which object is longer?",
    speakText: "Both objects were measured from 0. Which object is longer?",
    badgeLabel: "Which Is Longer?",
    rulerCm,
    compareObjects: shuffle([a, b]),
    compareMode: "longer",
    correctLabel: longer.label,
    feedback: {
      correct: `Yes — the ${longer.label} is longer at ${longer.lengthCm} cm.`,
      wrong: `The ${longer.label} reaches further along the ruler, so it's longer.`,
    },
  };
}

export function generateY3MeasurelandsWeek1Lesson1Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "startZero") return buildStartZeroTask(memory);
  if (activity === "compare") return buildCompareTask(memory);
  return buildMeasureTask(memory);
}

export function resetY3MeasurelandsWeek1Lesson1TaskSessionState() {
  lessonMemory.clear();
}

// Weekly-quiz contribution: exactly 5 fixed questions (no intro/teaching).
export function buildY3MeasurelandsWeek1Lesson1QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, recent: [] };
  return [
    buildStartZeroTask(seed),
    buildMeasureTask(seed),
    buildCompareTask(seed),
    buildMeasureTask(seed),
    buildStartZeroTask(seed),
  ];
}
