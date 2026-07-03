import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 3 · Week 1 · Lesson 2 — "Measure in Centimetres" ──
// Students now actively read whole-centimetre measurements from the reusable
// Measurelands ruler. All objects start exactly at 0 and use whole cm only.

type RulerTask = Extract<PracticeTask, { kind: "rulerMeasure" }>;

const OBJECTS: Array<{ label: string; icon: string; min: number; max: number }> = [
  { label: "pencil", icon: "✏️", min: 8, max: 17 },
  { label: "crayon", icon: "🖍️", min: 4, max: 9 },
  { label: "glue stick", icon: "🧴", min: 7, max: 12 },
  { label: "spoon", icon: "🥄", min: 11, max: 17 },
  { label: "paintbrush", icon: "🖌️", min: 10, max: 18 },
  { label: "marker", icon: "🖊️", min: 10, max: 14 },
  { label: "toy car", icon: "🚗", min: 5, max: 10 },
  { label: "ruler", icon: "📏", min: 12, max: 20 },
  { label: "scissors", icon: "✂️", min: 9, max: 16 },
  { label: "toothbrush", icon: "🪥", min: 11, max: 18 },
  { label: "leaf", icon: "🍃", min: 5, max: 12 },
  { label: "stick", icon: "🪵", min: 8, max: 20 },
  { label: "feather", icon: "🪶", min: 6, max: 15 },
];

const MAX_RULER = 20;
const ROTATION: Array<"measure" | "zero" | "compare"> = [
  "measure",
  "zero",
  "measure",
  "compare",
  "measure",
  "compare",
];

type LessonMemory = { introShown: boolean; cursor: number; recent: string[] };
const lessonMemory = new Map<string, LessonMemory>();

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created = { introShown: false, cursor: 0, recent: [] };
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
  if (memory.recent.length > 5) memory.recent.shift();
}

function pickObject(memory: LessonMemory): { label: string; icon: string; lengthCm: number } {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const spec = OBJECTS[randInt(OBJECTS.length)]!;
    const lengthCm = spec.min + randInt(spec.max - spec.min + 1);
    const key = `${spec.label}-${lengthCm}`;
    if (!memory.recent.includes(key)) {
      remember(memory, key);
      return { label: spec.label, icon: spec.icon, lengthCm };
    }
  }
  const fallback = OBJECTS[0]!;
  return { label: fallback.label, icon: fallback.icon, lengthCm: fallback.min };
}

function rulerFor(lengthCm: number): number {
  return Math.min(MAX_RULER, Math.max(lengthCm + 2, lengthCm + randInt(4) + 2));
}

function optionsAround(answer: number): number[] {
  const candidates = new Set<number>([answer]);
  [answer - 2, answer - 1, answer + 1, answer + 2].forEach((value) => {
    if (value >= 1 && value <= MAX_RULER) candidates.add(value);
  });
  let fill = 1;
  while (candidates.size < 3) {
    candidates.add(Math.min(MAX_RULER, Math.max(1, answer + fill)));
    fill += 1;
  }
  return shuffle(Array.from(candidates).slice(0, 3));
}

function buildIntroTask(): RulerTask {
  return {
    kind: "rulerMeasure",
    scene: "intro",
    prompt: "Measure in centimetres.",
    speakText:
      "Professor Gauge says: today you'll become a real measurer. Always start at zero. Then read where the object finishes.",
    badgeLabel: "Measure in cm",
    rulerCm: 12,
    object: { label: "pencil", icon: "✏️", lengthCm: 8 },
    feedback: { correct: "Start at zero, then read the end.", wrong: "Start at zero, then read the end." },
  };
}

function buildMeasureTask(memory: LessonMemory): RulerTask {
  const object = pickObject(memory);
  return {
    kind: "rulerMeasure",
    scene: "measure",
    prompt: `How long is the ${object.label}?`,
    speakText: `How long is the ${object.label}? Start at zero, then read where the object finishes.`,
    badgeLabel: "Measure It",
    rulerCm: rulerFor(object.lengthCm),
    object,
    options: optionsAround(object.lengthCm),
    correctAnswer: object.lengthCm,
    feedback: {
      correct: `Yes — the ${object.label} is ${object.lengthCm} cm long.`,
      wrong: `Start at 0 and read the end. The ${object.label} reaches ${object.lengthCm} cm.`,
    },
  };
}

function buildZeroCheckTask(memory: LessonMemory): RulerTask {
  const object = pickObject(memory);
  return {
    kind: "rulerMeasure",
    scene: "startZero",
    prompt: `Before measuring the ${object.label}, where should it start?`,
    speakText: `Before measuring the ${object.label}, where should it start? Tap the correct mark.`,
    badgeLabel: "Start at Zero",
    rulerCm: rulerFor(object.lengthCm),
    object,
    tickOptions: [0, 1, 2],
    correctTick: 0,
    includeEdgeOption: true,
    feedback: {
      correct: "Yes — line the object up with 0 before you read the end.",
      wrong: "Not there. A correct centimetre measurement starts at the 0 mark.",
    },
  };
}

function buildCompareTask(memory: LessonMemory): RulerTask {
  const a = pickObject(memory);
  let b = pickObject(memory);
  for (let attempt = 0; attempt < 30 && Math.abs(a.lengthCm - b.lengthCm) < 2; attempt += 1) {
    b = pickObject(memory);
  }
  if (a.lengthCm === b.lengthCm) {
    b = { ...b, lengthCm: Math.min(MAX_RULER, b.lengthCm + 2) };
  }
  const longer = a.lengthCm > b.lengthCm ? a : b;
  return {
    kind: "rulerMeasure",
    scene: "compare",
    prompt: "Which object is longer?",
    speakText: "Both objects start at zero. Which one reaches the larger centimetre number?",
    badgeLabel: "Which Is Longer?",
    rulerCm: rulerFor(Math.max(a.lengthCm, b.lengthCm)),
    compareObjects: shuffle([a, b]),
    compareMode: "longer",
    correctLabel: longer.label,
    feedback: {
      correct: `Yes — the ${longer.label} is longer at ${longer.lengthCm} cm.`,
      wrong: `Compare the centimetre numbers. The ${longer.label} reaches ${longer.lengthCm} cm, so it is longer.`,
    },
  };
}

export function generateY3MeasurelandsWeek1Lesson2Task(
  lessonId: string,
  _difficulty: Difficulty,
): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }

  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "zero") return buildZeroCheckTask(memory);
  if (activity === "compare") return buildCompareTask(memory);
  return buildMeasureTask(memory);
}

export function resetY3MeasurelandsWeek1Lesson2TaskSessionState() {
  lessonMemory.clear();
}

export function buildY3MeasurelandsWeek1Lesson2QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, recent: [] };
  return [
    buildMeasureTask(seed),
    buildZeroCheckTask(seed),
    buildMeasureTask(seed),
    buildCompareTask(seed),
    buildMeasureTask(seed),
  ];
}
