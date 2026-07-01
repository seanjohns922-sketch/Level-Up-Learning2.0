import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 2 (Year 2) · Week 4 · Lesson 3 — "Choose the Right Tool" ──
// AC9M2M01 — the APPLY step of the accuracy arc: pick the sensible unit/tool for
// the job (tiny cubes for a pencil, a trundle wheel for a playground) and say
// why. Uses the existing `toolChoice` mechanic + real everyday-object and tool
// art, so it looks nothing like L1/L2. THREE rotating activities, each drawing
// from a big object pool (eraser → bridge), so the questions are endless:
//   1. best    — object → tap the best tool of 3.
//   2. whyBad  — object + a wrong tool → pick why it's a bad fit.
//   3. whyBest — object + its best tool → justify "just right".

type ToolTask = Extract<PracticeTask, { kind: "toolChoice" }>;

const TOOLS: Record<string, { label: string; reach: number }> = {
  cubes: { label: "Cubes", reach: 0 },
  ruler: { label: "Ruler", reach: 1 },
  tape: { label: "Tape Measure", reach: 2 },
  feet: { label: "Footsteps", reach: 2 },
  wheel: { label: "Trundle Wheel", reach: 3 },
};

type Obj = { id: string; label: string; size: 1 | 2 | 3 };
const OBJECTS: Obj[] = [
  { id: "eraser", label: "Eraser", size: 1 },
  { id: "pencil", label: "Pencil", size: 1 },
  { id: "book", label: "Book", size: 1 },
  { id: "crayon", label: "Crayon", size: 1 },
  { id: "pencilcase", label: "Pencil Case", size: 1 },
  { id: "bottle", label: "Drink Bottle", size: 1 },
  { id: "chair", label: "Chair", size: 2 },
  { id: "desk", label: "Desk", size: 2 },
  { id: "door", label: "Door", size: 2 },
  { id: "bed", label: "Bed", size: 2 },
  { id: "classroom", label: "Classroom", size: 2 },
  { id: "car", label: "Car", size: 2 },
  { id: "playground", label: "Playground", size: 3 },
  { id: "oval", label: "School Oval", size: 3 },
  { id: "hallway", label: "Hallway", size: 3 },
  { id: "court", label: "Basketball Court", size: 3 },
  { id: "bridge", label: "Bridge", size: 3 },
];

const BEST_BY_SIZE: Record<1 | 2 | 3, string> = { 1: "ruler", 2: "tape", 3: "wheel" };
const DISTRACTORS_BY_SIZE: Record<1 | 2 | 3, string[]> = {
  1: ["wheel", "feet"],
  2: ["ruler", "wheel"],
  3: ["ruler", "cubes"],
};

type LessonMemory = { introShown: boolean; cursor: number; recent: string[] };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"best" | "whyBad" | "whyBest"> = ["best", "whyBad", "best", "whyBest", "whyBad", "best"];

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
function pickObject(memory: LessonMemory): Obj {
  const pool = OBJECTS.filter((o) => !memory.recent.includes(o.id));
  const obj = (pool.length ? pool : OBJECTS)[randInt((pool.length ? pool : OBJECTS).length)]!;
  memory.recent = [obj.id, ...memory.recent].slice(0, 4);
  return obj;
}

const TOOLS_BASE = "/images/measurelands/tools-3d";
const EVERYDAY_BASE = "/images/measurelands/everyday-3d";
function toolImg(id: string) {
  return `${TOOLS_BASE}/tool-${id}.png`;
}
function toolOption(id: string) {
  return { id, label: TOOLS[id]!.label, iconKey: id, imageSrc: toolImg(id) };
}
function toObject(obj: Obj) {
  return { label: obj.label, iconKey: obj.id, imageSrc: `${EVERYDAY_BASE}/object-${obj.id}.png` };
}

function buildIntroTask(): ToolTask {
  return {
    kind: "toolChoice",
    scene: "intro",
    prompt: "Choose the right tool.",
    speakText:
      "A pencil and a playground are both lengths, but we would not measure them the same way. Tiny things need small units; huge things need big ones. A good measurer chooses the right tool for the job!",
    badgeLabel: "Meazurex Mission",
    feedback: { correct: "Let's choose the right tool!", wrong: "Let's get ready." },
  };
}

function buildBestTask(memory: LessonMemory): ToolTask {
  const obj = pickObject(memory);
  const best = BEST_BY_SIZE[obj.size];
  const tools = shuffle([best, ...DISTRACTORS_BY_SIZE[obj.size]].map(toolOption));
  return {
    kind: "toolChoice",
    scene: "best",
    prompt: `Which tool is best to measure the ${obj.label.toLowerCase()}?`,
    speakText: `Which tool is best to measure the ${obj.label.toLowerCase()}?`,
    badgeLabel: "Choose the Right Tool",
    object: toObject(obj),
    tools,
    correctToolId: best,
    feedback: { correct: `Yes — a ${TOOLS[best]!.label.toLowerCase()} is just right!`, wrong: "Think about the size of the object, then match the tool." },
  };
}

function buildWhyBadTask(memory: LessonMemory): ToolTask {
  const obj = pickObject(memory);
  const best = BEST_BY_SIZE[obj.size];
  const wrongId = shuffle(Object.keys(TOOLS).filter((id) => id !== best))[0]!;
  const wrongReach = TOOLS[wrongId]!.reach;
  const reason = wrongReach < obj.size ? "Too small" : wrongReach > obj.size ? "Too big" : "Hard to use";
  return {
    kind: "toolChoice",
    scene: "whyBad",
    prompt: `Why is a ${TOOLS[wrongId]!.label.toLowerCase()} a bad tool for the ${obj.label.toLowerCase()}?`,
    speakText: `Why is a ${TOOLS[wrongId]!.label.toLowerCase()} a bad tool for the ${obj.label.toLowerCase()}?`,
    badgeLabel: "Why Not That One?",
    object: toObject(obj),
    wrongTool: { label: TOOLS[wrongId]!.label, iconKey: wrongId, imageSrc: toolImg(wrongId) },
    reasonOptions: ["Too small", "Too big", "Hard to use"],
    correctReason: reason,
    feedback: { correct: "Good thinking!", wrong: "Think about the tool's size next to the object's size." },
  };
}

function buildWhyBestTask(memory: LessonMemory): ToolTask {
  const obj = pickObject(memory);
  const best = BEST_BY_SIZE[obj.size];
  return {
    kind: "toolChoice",
    scene: "whyBest",
    prompt: `A ${TOOLS[best]!.label.toLowerCase()} is the right tool for the ${obj.label.toLowerCase()}. Why?`,
    speakText: `A ${TOOLS[best]!.label.toLowerCase()} is the right tool for the ${obj.label.toLowerCase()}. Why is it the best?`,
    badgeLabel: "Why It's Best",
    object: toObject(obj),
    reasonOptions: shuffle(["Just the right size", "Too small to reach", "Too big to use"]),
    correctReason: "Just the right size",
    feedback: { correct: "Yes — the right tool is fast and easy!", wrong: "The best tool fits the object just right." },
  };
}

export function generateY2MeasurelandsWeek4Lesson3Task(
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
  if (rotation === "whyBad") return buildWhyBadTask(memory);
  if (rotation === "whyBest") return buildWhyBestTask(memory);
  return buildBestTask(memory);
}

export function resetY2MeasurelandsWeek4Lesson3TaskSessionState() {
  lessonMemory.clear();
}

export function buildY2MeasurelandsWeek4Lesson3QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, recent: [] };
  return [
    buildBestTask(seed),
    buildWhyBadTask(seed),
    buildWhyBestTask(seed),
    buildBestTask(seed),
    buildWhyBadTask(seed),
  ];
}
