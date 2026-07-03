import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 3 (Year 3) · Week 2 · Lesson 2 — "Choose cm or m" ──
// AC9M3M01: choose the sensible formal unit (cm or m) for a familiar object.
// Selecting the unit, not calculating. THREE rotating activities:
//   A. whichUnit    — measure this object in centimetres or metres?
//   B. sort         — tap objects into the cm bin / the m bin.
//   C. spotMistake  — is Professor Gauge's unit sensible? (reasoning)

type UnitTask = Extract<PracticeTask, { kind: "unitChoice" }>;

// Familiar objects tagged with the unit a good measurer would choose, PLUS a
// realistic whole-number size range in that unit and a natural verb — so every
// "spot the mistake" statement matches real life (a key is 6 cm, not 23). Emoji
// MATCHES the label. ~half cm, ~half m for a balanced mix.
type ObjectSpec = { label: string; icon: string; unit: "cm" | "m"; size: [number, number]; verb: "long" | "tall" };
const OBJECTS: ObjectSpec[] = [
  // small → centimetres (real cm sizes)
  { label: "pencil", icon: "✏️", unit: "cm", size: [14, 18], verb: "long" },
  { label: "crayon", icon: "🖍️", unit: "cm", size: [8, 11], verb: "long" },
  { label: "ruler", icon: "📏", unit: "cm", size: [20, 30], verb: "long" },
  { label: "spoon", icon: "🥄", unit: "cm", size: [12, 15], verb: "long" },
  { label: "toothbrush", icon: "🪥", unit: "cm", size: [15, 17], verb: "long" },
  { label: "marker", icon: "🖊️", unit: "cm", size: [12, 14], verb: "long" },
  { label: "paintbrush", icon: "🖌️", unit: "cm", size: [15, 18], verb: "long" },
  { label: "pair of scissors", icon: "✂️", unit: "cm", size: [13, 16], verb: "long" },
  { label: "key", icon: "🔑", unit: "cm", size: [5, 8], verb: "long" },
  { label: "book", icon: "📖", unit: "cm", size: [20, 28], verb: "long" },
  // long → metres (real whole-metre sizes)
  { label: "door", icon: "🚪", unit: "m", size: [2, 2], verb: "tall" },
  { label: "broom", icon: "🧹", unit: "m", size: [1, 2], verb: "long" },
  { label: "ladder", icon: "🪜", unit: "m", size: [2, 3], verb: "tall" },
  { label: "tree", icon: "🌳", unit: "m", size: [3, 7], verb: "tall" },
  { label: "goal post", icon: "🥅", unit: "m", size: [2, 3], verb: "tall" },
  { label: "guitar", icon: "🎸", unit: "m", size: [1, 1], verb: "long" },
  { label: "bicycle", icon: "🚲", unit: "m", size: [1, 2], verb: "long" },
  { label: "canoe", icon: "🛶", unit: "m", size: [3, 4], verb: "long" },
  { label: "bed", icon: "🛏️", unit: "m", size: [2, 2], verb: "long" },
  { label: "sofa", icon: "🛋️", unit: "m", size: [2, 2], verb: "long" },
];

const CM_OBJECTS = OBJECTS.filter((o) => o.unit === "cm");
const M_OBJECTS = OBJECTS.filter((o) => o.unit === "m");

type LessonMemory = { introShown: boolean; cursor: number; recent: string[] };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"whichUnit" | "sort" | "spotMistake"> = [
  "whichUnit", "sort", "spotMistake", "whichUnit", "spotMistake", "sort",
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
function between([lo, hi]: [number, number]) {
  return lo + randInt(hi - lo + 1);
}
function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}

function pickObject(memory: LessonMemory, pool = OBJECTS): ObjectSpec {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const obj = pool[randInt(pool.length)]!;
    if (!memory.recent.includes(obj.label)) {
      memory.recent.push(obj.label);
      if (memory.recent.length > 6) memory.recent.shift();
      return obj;
    }
  }
  return pool[randInt(pool.length)]!;
}

function buildIntroTask(): UnitTask {
  return {
    kind: "unitChoice",
    scene: "intro",
    prompt: "Choose the unit that makes the most sense.",
    speakText:
      "Professor Gauge says: good measurers don't always use the same unit. They choose the one that makes the most sense. Use centimetres for small objects like a pencil, and metres for long objects like a door.",
    badgeLabel: "Meazurex Mission",
    feedback: { correct: "Let's choose!", wrong: "Let's choose!" },
  };
}

// Activity A — Which unit: centimetres or metres?
function buildWhichUnitTask(memory: LessonMemory): UnitTask {
  const object = pickObject(memory);
  const correct = object.unit === "m" ? "Metres" : "Centimetres";
  return {
    kind: "unitChoice",
    scene: "whichUnit",
    prompt: `Should we measure a ${object.label} in centimetres or metres?`,
    speakText: `Should we measure a ${object.label} in centimetres or metres? Think about how long it is.`,
    badgeLabel: "Which Unit?",
    object: { label: object.label, icon: object.icon },
    options: ["Centimetres", "Metres"],
    correctOption: correct,
    feedback: {
      correct: object.unit === "m" ? `Yes — a ${object.label} is long, so use metres.` : `Yes — a ${object.label} is small, so use centimetres.`,
      wrong: object.unit === "m" ? `A ${object.label} is long — metres is the sensible unit.` : `A ${object.label} is small — centimetres is the sensible unit.`,
    },
  };
}

// Activity B — Sort a balanced set of objects into the cm and m bins.
function buildSortTask(memory: LessonMemory): UnitTask {
  const cm = shuffle(CM_OBJECTS).slice(0, 3);
  const m = shuffle(M_OBJECTS).slice(0, 3);
  const items = shuffle([...cm, ...m]).map((o) => ({ label: o.label, icon: o.icon, unit: o.unit }));
  memory.recent = items.map((i) => i.label).slice(-6);
  return {
    kind: "unitChoice",
    scene: "sort",
    prompt: "Sort each object into centimetres or metres.",
    speakText: "Sort each object. Tap an object, then tap the centimetres bin or the metres bin.",
    badgeLabel: "Sort the Objects",
    items,
    feedback: { correct: "All sorted — great unit choices!", wrong: "Not that bin — think about the object's size." },
  };
}

// Activity C — Spot Professor Gauge's wrong unit.
function buildSpotMistakeTask(memory: LessonMemory): UnitTask {
  const object = pickObject(memory);
  const rightWord = object.unit === "cm" ? "centimetres" : "metres";
  const wrongWord = object.unit === "cm" ? "metres" : "centimetres";
  const professorCorrect = randInt(2) === 0;
  const verb = object.verb;

  if (professorCorrect) {
    // A believable size in the object's real unit (a key = 6 cm, a door = 2 m).
    const size = between(object.size);
    return {
      kind: "unitChoice",
      scene: "spotMistake",
      prompt: "Is Professor Gauge's measurement sensible?",
      speakText: `Professor Gauge says a ${object.label} is ${size} ${rightWord} ${verb}. Is that sensible?`,
      badgeLabel: "Professor Gauge's Mistake",
      object: { label: object.label, icon: object.icon },
      statement: `The ${object.label} is ${size} ${rightWord} ${verb}.`,
      options: ["Yes, that makes sense", `No — use ${wrongWord}`],
      correctOption: "Yes, that makes sense",
      feedback: {
        correct: `Right — ${rightWord} is the sensible unit for a ${object.label}.`,
        wrong: `That one is fine — a ${object.label} really is measured in ${rightWord}.`,
      },
    };
  }
  // Wrong claim: state the object in the WRONG unit with a clearly-silly size
  // (a small object in metres, or a long object in centimetres).
  const size = object.unit === "cm" ? 2 + randInt(8) /* 2–9 metres */ : 8 + randInt(33); /* 8–40 cm */
  return {
    kind: "unitChoice",
    scene: "spotMistake",
    prompt: "Is Professor Gauge's measurement sensible?",
    speakText: `Professor Gauge says a ${object.label} is ${size} ${wrongWord} ${verb}. Is that sensible?`,
    badgeLabel: "Professor Gauge's Mistake",
    object: { label: object.label, icon: object.icon },
    statement: `The ${object.label} is ${size} ${wrongWord} ${verb}.`,
    options: [`No — use ${rightWord}`, "Yes, that makes sense"],
    correctOption: `No — use ${rightWord}`,
    feedback: {
      correct: `Yes — a ${object.label} should be measured in ${rightWord}, not ${wrongWord}.`,
      wrong: `Look again — ${size} ${wrongWord} is silly for a ${object.label}. Use ${rightWord}.`,
    },
  };
}

export function generateY3MeasurelandsWeek2Lesson2Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "sort") return buildSortTask(memory);
  if (activity === "spotMistake") return buildSpotMistakeTask(memory);
  return buildWhichUnitTask(memory);
}

export function resetY3MeasurelandsWeek2Lesson2TaskSessionState() {
  lessonMemory.clear();
}

// Weekly-quiz contribution: exactly 5 fixed questions (no intro/teaching).
export function buildY3MeasurelandsWeek2Lesson2QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, recent: [] };
  return [
    buildWhichUnitTask(seed),
    buildSpotMistakeTask(seed),
    buildWhichUnitTask(seed),
    buildSpotMistakeTask(seed),
    buildWhichUnitTask(seed),
  ];
}
