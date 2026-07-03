import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 3 (Year 3) · Week 2 · Lesson 1 — "Meet the Metre" ──
// AC9M3M01: a metre = 100 cm, and you CHOOSE the sensible unit for a length.
// Pure unit sense — no calculation, no reading a scale. THREE rotating activities:
//   A. aboutMetre   — is this object about one metre long? (yes / no)
//   B. whichTool     — measure it with the ruler (cm) or the metre stick (m)?
//   C. compareMetre — is it shorter / about / longer than one metre?
// Every activity draws from a big pool of familiar classroom/school objects with
// a true real-world length (in metres) that drives the correct answer.

type UnitTask = Extract<PracticeTask, { kind: "unitChoice" }>;

// Familiar objects with an approximate real length in METRES. Emoji MATCHES label.
const OBJECTS: Array<{ label: string; icon: string; metres: number }> = [
  { label: "crayon", icon: "🖍️", metres: 0.09 },
  { label: "key", icon: "🔑", metres: 0.06 },
  { label: "pencil", icon: "✏️", metres: 0.15 },
  { label: "pair of scissors", icon: "✂️", metres: 0.16 },
  { label: "spoon", icon: "🥄", metres: 0.18 },
  { label: "toothbrush", icon: "🪥", metres: 0.19 },
  { label: "book", icon: "📖", metres: 0.25 },
  { label: "paintbrush", icon: "🖌️", metres: 0.28 },
  { label: "backpack", icon: "🎒", metres: 0.5 },
  { label: "baseball bat", icon: "🏏", metres: 0.85 },
  { label: "umbrella", icon: "☂️", metres: 0.9 },
  { label: "guitar", icon: "🎸", metres: 1.0 },
  { label: "broom", icon: "🧹", metres: 1.3 },
  { label: "ladder", icon: "🪜", metres: 1.8 },
  { label: "door", icon: "🚪", metres: 2.0 },
];

// Truth helpers — one metre is the benchmark. "About a metre" = 0.8–1.2 m.
function isAboutMetre(m: number) {
  return m >= 0.8 && m <= 1.2;
}
function toolFor(m: number): "ruler" | "metre" {
  return m >= 0.6 ? "metre" : "ruler";
}
function compareToMetre(m: number): "shorter" | "about" | "longer" {
  if (m < 0.8) return "shorter";
  if (m <= 1.2) return "about";
  return "longer";
}

type LessonMemory = { introShown: boolean; cursor: number; recent: string[] };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"aboutMetre" | "whichTool" | "compareMetre"> = [
  "aboutMetre", "whichTool", "compareMetre", "whichTool", "compareMetre", "aboutMetre",
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

/** Pick an object (avoid recent repeats). `filter` narrows to objects that make
 *  a sensible question for the activity (e.g. skip borderline metres for A). */
function pickObject(memory: LessonMemory, filter?: (m: number) => boolean): { label: string; icon: string; metres: number } {
  const pool = filter ? OBJECTS.filter((o) => filter(o.metres)) : OBJECTS;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const obj = pool[randInt(pool.length)]!;
    if (!memory.recent.includes(obj.label)) {
      memory.recent.push(obj.label);
      if (memory.recent.length > 5) memory.recent.shift();
      return obj;
    }
  }
  return pool[randInt(pool.length)]!;
}

function buildIntroTask(): UnitTask {
  return {
    kind: "unitChoice",
    scene: "intro",
    prompt: "Meet a much bigger unit — the metre!",
    speakText:
      "Professor Gauge says: last week we used centimetres. Today we meet a much bigger measuring unit — the metre! One metre is the same as 100 centimetres. Use centimetres for shorter things, and metres for longer things.",
    badgeLabel: "Meazurex Mission",
    feedback: { correct: "Let's choose!", wrong: "Let's choose!" },
  };
}

// Activity A — Is it about one metre?
function buildAboutMetreTask(memory: LessonMemory): UnitTask {
  // Avoid the borderline 0.5–0.8 band so yes/no is unambiguous.
  const object = pickObject(memory, (m) => m <= 0.5 || m >= 0.8);
  const yes = isAboutMetre(object.metres);
  return {
    kind: "unitChoice",
    scene: "aboutMetre",
    prompt: `Is a ${object.label} about one metre long?`,
    speakText: `Is a ${object.label} about one metre long? Think about the metre stick.`,
    badgeLabel: "About One Metre?",
    object: { label: object.label, icon: object.icon },
    options: ["Yes, about 1 metre", "No"],
    correctOption: yes ? "Yes, about 1 metre" : "No",
    feedback: {
      correct: yes ? `Yes — a ${object.label} is about one metre.` : `That's right — a ${object.label} is not about a metre.`,
      wrong: yes ? `Look again — a ${object.label} is about one metre long.` : `A ${object.label} is not about a metre long.`,
    },
  };
}

// Activity B — Which tool: ruler (cm) or metre stick (m)?
function buildWhichToolTask(memory: LessonMemory): UnitTask {
  const object = pickObject(memory);
  const tool = toolFor(object.metres);
  const correct = tool === "metre" ? "Metre stick (m)" : "Ruler (cm)";
  return {
    kind: "unitChoice",
    scene: "whichTool",
    prompt: `Which tool would you use to measure a ${object.label}?`,
    speakText: `Which tool would you use to measure a ${object.label} — the ruler in centimetres, or the metre stick in metres?`,
    badgeLabel: "Which Tool?",
    object: { label: object.label, icon: object.icon },
    options: ["Ruler (cm)", "Metre stick (m)"],
    correctOption: correct,
    feedback: {
      correct: tool === "metre" ? `Yes — a ${object.label} is long, so use the metre stick.` : `Yes — a ${object.label} is short, so the ruler in cm is best.`,
      wrong: tool === "metre" ? `A ${object.label} is longer than a ruler — the metre stick is better.` : `A ${object.label} is short — a ruler in cm measures it easily.`,
    },
  };
}

// Activity C — Shorter / about / longer than one metre?
function buildCompareMetreTask(memory: LessonMemory): UnitTask {
  const object = pickObject(memory);
  const rel = compareToMetre(object.metres);
  const correct = rel === "shorter" ? "Shorter than 1 metre" : rel === "about" ? "About 1 metre" : "Longer than 1 metre";
  const phrase = rel === "about" ? "about one metre" : `${rel} than one metre`;
  return {
    kind: "unitChoice",
    scene: "compareMetre",
    prompt: `Is a ${object.label} shorter, about, or longer than one metre?`,
    speakText: `Compare a ${object.label} to one metre. Is it shorter than a metre, about a metre, or longer than a metre?`,
    badgeLabel: "Compare to One Metre",
    object: { label: object.label, icon: object.icon },
    options: shuffle(["Shorter than 1 metre", "About 1 metre", "Longer than 1 metre"]),
    correctOption: correct,
    feedback: {
      correct: `Yes — a ${object.label} is ${phrase}.`,
      wrong: `Compare it to the metre stick — a ${object.label} is ${phrase}.`,
    },
  };
}

export function generateY3MeasurelandsWeek2Lesson1Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "whichTool") return buildWhichToolTask(memory);
  if (activity === "compareMetre") return buildCompareMetreTask(memory);
  return buildAboutMetreTask(memory);
}

export function resetY3MeasurelandsWeek2Lesson1TaskSessionState() {
  lessonMemory.clear();
}

// Weekly-quiz contribution: exactly 5 fixed questions (no intro/teaching).
export function buildY3MeasurelandsWeek2Lesson1QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, recent: [] };
  return [
    buildAboutMetreTask(seed),
    buildWhichToolTask(seed),
    buildCompareMetreTask(seed),
    buildWhichToolTask(seed),
    buildCompareMetreTask(seed),
  ];
}
