import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 4 (Year 4) · Week 1 · Lesson 1 — "Reading Between the Marks" ──
// AC9M4M01: interpret scaled instruments and read measurements that fall BETWEEN
// whole units. The ruler is the reusable Level 3 Precision Ruler, now showing
// millimetre graduations with a longer 5 mm mark; every object in this lesson
// ends on a half centimetre (X.5) so students practise reading the half.
// Halves only — no millimetre answers yet. Decimal notation ("7.5 cm").
//
// Philosophy: Interpret → Solve → Apply.
// THREE rotating activities:
//   A. read        — read the length of one object (half-cm options).
//   B. whichReading — choose the correct reading; options BRACKET the half
//                     (whole below · the half · whole above) to beat round-down.
//   C. spotAccurate — Professor Gauge states a reading; is he correct? (mix of
//                     correct answers and the classic round-to-whole error.)

type RulerTask = Extract<PracticeTask, { kind: "rulerMeasure" }>;

// Object pool — each drawn to scale (width = lengthCm). Emoji MATCHES the label.
// Whole-cm range per object keeps sizes believable; the reading is base + 0.5.
// No "ruler" object (a 30 cm ruler is odd to measure and exceeds the scale).
const OBJECTS: Array<{ label: string; icon: string; min: number; max: number }> = [
  { label: "pencil", icon: "✏️", min: 14, max: 17 },
  { label: "crayon", icon: "🖍️", min: 7, max: 9 },
  { label: "marker", icon: "🖊️", min: 11, max: 13 },
  { label: "spoon", icon: "🥄", min: 11, max: 13 },
  { label: "toy car", icon: "🚗", min: 6, max: 8 },
  { label: "paintbrush", icon: "🖌️", min: 17, max: 19 },
  { label: "toothbrush", icon: "🪥", min: 16, max: 18 },
  { label: "scissors", icon: "✂️", min: 13, max: 15 },
  { label: "leaf", icon: "🍃", min: 7, max: 11 },
  { label: "feather", icon: "🪶", min: 9, max: 12 },
  { label: "key", icon: "🔑", min: 5, max: 6 },
  { label: "ribbon", icon: "🎀", min: 12, max: 15 },
];

const MAX_RULER = 20;

type LessonMemory = { introShown: boolean; cursor: number; recent: string[] };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"read" | "whichReading" | "spotAccurate"> = [
  "read", "whichReading", "spotAccurate", "whichReading", "read", "spotAccurate",
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

/** Pick an object + a half-centimetre length (whole cm + 0.5), avoiding repeats. */
function pickObject(memory: LessonMemory): { label: string; icon: string; lengthCm: number } {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const spec = OBJECTS[randInt(OBJECTS.length)]!;
    const whole = spec.min + randInt(spec.max - spec.min + 1);
    const lengthCm = whole + 0.5;
    const key = `${spec.label}-${lengthCm}`;
    if (!memory.recent.includes(key)) {
      remember(memory, key);
      return { label: spec.label, icon: spec.icon, lengthCm };
    }
  }
  const spec = OBJECTS[0]!;
  return { label: spec.label, icon: spec.icon, lengthCm: spec.min + 0.5 };
}

/** A ruler a little longer than the object, capped at 20 cm. */
function rulerFor(lengthCm: number): number {
  return Math.min(MAX_RULER, Math.ceil(lengthCm) + 1 + randInt(3)); // object + ~2..4
}

function buildIntroTask(): RulerTask {
  return {
    kind: "rulerMeasure",
    scene: "intro",
    precision: true,
    prompt: "Real measurements aren't always whole numbers.",
    speakText:
      "Professor Gauge says: last level we measured whole centimetres. But real objects don't always finish exactly on a whole number. The ruler hasn't changed — we're just reading the smaller marks more carefully. The longer middle mark is the half.",
    badgeLabel: "Meazurex Mission",
    rulerCm: 12,
    object: { label: "pencil", icon: "✏️", lengthCm: 8.5 },
    feedback: { correct: "Let's measure!", wrong: "Let's measure!" },
  };
}

// Activity A — Read the Measurement (half-cm options).
function buildReadTask(memory: LessonMemory): RulerTask {
  const object = pickObject(memory);
  const len = object.lengthCm;
  const opts = [len - 1, len, len + 1].filter((v) => v >= 1);
  const options = opts.length === 3 ? opts : [len, len + 1, len + 2];
  return {
    kind: "rulerMeasure",
    scene: "measure",
    precision: true,
    prompt: `How long is the ${object.label}?`,
    speakText: `How long is the ${object.label}? Read carefully — look at the smaller marks.`,
    badgeLabel: "Read the Measurement",
    rulerCm: rulerFor(len),
    object,
    options: shuffle(options),
    correctAnswer: len,
    feedback: {
      correct: `Yes — the ${object.label} is ${len} cm long.`,
      wrong: `Look again from 0. The end lands on the half mark — it's ${len} cm.`,
    },
  };
}

// Activity B — Which Reading Is Correct? (options bracket the half).
function buildWhichReadingTask(memory: LessonMemory): RulerTask {
  const object = pickObject(memory);
  const len = object.lengthCm; // e.g. 7.5
  const options = shuffle([Math.floor(len), len, Math.ceil(len)]); // 7 · 7.5 · 8
  return {
    kind: "rulerMeasure",
    scene: "measure",
    precision: true,
    prompt: `Which reading is correct for the ${object.label}?`,
    speakText: `Which reading is correct for the ${object.label}? Don't round — read the mark it lands on.`,
    badgeLabel: "Which Reading Is Correct?",
    rulerCm: rulerFor(len),
    object,
    options,
    correctAnswer: len,
    feedback: {
      correct: `Yes — it lands on the half mark, so it's ${len} cm.`,
      wrong: `Not a whole number — the end sits on the half mark. It's ${len} cm.`,
    },
  };
}

// Activity C — Spot the Accurate Measurement (Professor Gauge checks himself).
function buildSpotAccurateTask(memory: LessonMemory): RulerTask {
  const object = pickObject(memory);
  const len = object.lengthCm; // X.5
  const gaugeCorrect = randInt(2) === 0;
  const claim = gaugeCorrect ? len : Math.floor(len); // when wrong, he rounds down
  const yes = `Yes — ${claim} cm is right`;
  const no = `No — it is ${len} cm`;
  const detectiveOptions = shuffle([yes, no]);
  return {
    kind: "rulerMeasure",
    scene: "measure",
    precision: true,
    prompt: "Is Professor Gauge correct?",
    speakText: `Professor Gauge measured the ${object.label} and wrote ${claim} centimetres. Is he correct?`,
    badgeLabel: "Spot the Accurate Measurement",
    rulerCm: rulerFor(len),
    object,
    displayedMeasurement: claim,
    detectiveOptions,
    correctDetectiveAnswer: gaugeCorrect ? yes : no,
    feedback: {
      correct: gaugeCorrect
        ? `Right — the end is on the half mark, so ${len} cm is spot on.`
        : `Right — he ignored the half mark. It's really ${len} cm.`,
      wrong: gaugeCorrect
        ? `Look again — the end is exactly on the half mark. ${len} cm is correct.`
        : `Look at the smaller marks — the end is past ${claim}. It's ${len} cm.`,
    },
  };
}

export function generateY4MeasurelandsWeek1Lesson1Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "whichReading") return buildWhichReadingTask(memory);
  if (activity === "spotAccurate") return buildSpotAccurateTask(memory);
  return buildReadTask(memory);
}

export function resetY4MeasurelandsWeek1Lesson1TaskSessionState() {
  lessonMemory.clear();
}

// Weekly-quiz contribution: exactly 5 fixed questions (no intro/teaching).
export function buildY4MeasurelandsWeek1Lesson1QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, recent: [] };
  return [
    buildReadTask(seed),
    buildWhichReadingTask(seed),
    buildSpotAccurateTask(seed),
    buildWhichReadingTask(seed),
    buildReadTask(seed),
  ];
}
