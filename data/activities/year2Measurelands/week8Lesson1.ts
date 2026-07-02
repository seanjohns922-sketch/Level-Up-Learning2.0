import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { buildY2MeasurelandsWeek1Lesson1QuizTasks } from "@/data/activities/year2Measurelands/week1Lesson1";
import { buildY2MeasurelandsWeek2Lesson1QuizTasks } from "@/data/activities/year2Measurelands/week2Lesson1";
import { buildY2MeasurelandsWeek3Lesson1QuizTasks } from "@/data/activities/year2Measurelands/week3Lesson1";
import { buildY2MeasurelandsWeek6Lesson3QuizTasks } from "@/data/activities/year2Measurelands/week6Lesson3";
import { buildY2MeasurelandsWeek7Lesson2QuizTasks } from "@/data/activities/year2Measurelands/week7Lesson2";

// ── Measurelands · Level 2 (Year 2) · Week 8 · Lesson 1 — "Measurement Mission" ──
// AC9M2M01/02/03 capstone: no new content. Students decide what is being
// measured, choose an already-taught strategy, then complete mixed mini tasks.

type ToolTask = Extract<PracticeTask, { kind: "toolChoice" }>;

const MASS_BASE = "/images/measurelands/week2-3d";
const CONTAINER_BASE = "/images/measurelands/containers-3d";
const LENGTH_BASE = "/images/measurelands/measure-objects-3d";
const TOOLS_BASE = "/images/measurelands/tools-3d";
const CALENDAR_BASE = "/images/measurelands/calendar-3d";

type LessonMemory = {
  introShown: boolean;
  cursor: number;
  skillCursor: number;
  methodCursor: number;
  mixedCursor: number;
  mixedTasks: PracticeTask[];
};

const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"skill" | "method" | "mixed"> = [
  "skill",
  "method",
  "mixed",
  "skill",
  "mixed",
  "method",
  "mixed",
];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = {
    introShown: false,
    cursor: 0,
    skillCursor: 0,
    methodCursor: 0,
    mixedCursor: 0,
    mixedTasks: buildMixedMissionTasks(),
  };
  lessonMemory.set(lessonId, created);
  return created;
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}

function skillOption(id: string, label: string, iconKey: string) {
  return { id, label, iconKey };
}

function methodOption(id: string, label: string, iconKey: string, imageSrc?: string) {
  return { id, label, iconKey, imageSrc };
}

function buildIntroTask(): ToolTask {
  return {
    kind: "toolChoice",
    scene: "intro",
    prompt: "Master Measurer Mission",
    speakText:
      "Professor Gauge says: you've travelled all across Measurelands. Today every challenge is different. First decide what you are measuring. Then choose the best strategy.",
    badgeLabel: "Master Measurer",
    introTools: [
      { id: "length", label: "Length", focus: "blocks and tools", iconKey: "ruler", imageSrc: `${TOOLS_BASE}/tool-ruler.png` },
      { id: "mass", label: "Mass", focus: "balance cubes", iconKey: "cubes", imageSrc: `${TOOLS_BASE}/tool-cubes.png` },
      { id: "capacity", label: "Capacity", focus: "cups and jugs", iconKey: "bottle", imageSrc: `${CONTAINER_BASE}/measuring-jug.png` },
      { id: "time", label: "Time", focus: "clock hands", iconKey: "wheel" },
      { id: "calendar", label: "Calendar", focus: "dates and events", iconKey: "book", imageSrc: `${CALENDAR_BASE}/today.png` },
    ],
    feedback: {
      correct: "Mission started.",
      wrong: "First decide what you are measuring.",
    },
  };
}

const SKILL_TASKS: ToolTask[] = [
  {
    kind: "toolChoice",
    scene: "best",
    prompt: "What are we measuring for the rock?",
    speakText: "What are we measuring for the rock?",
    badgeLabel: "Which Skill?",
    object: { label: "Rock", iconKey: "rock", imageSrc: `${MASS_BASE}/rock.png` },
    tools: shuffle([
      skillOption("mass", "Mass", "cubes"),
      skillOption("length", "Length", "ruler"),
      skillOption("capacity", "Capacity", "bottle"),
    ]),
    correctToolId: "mass",
    feedback: { correct: "A rock is measured by mass.", wrong: "A rock challenge uses mass. Think heavy and light." },
  },
  {
    kind: "toolChoice",
    scene: "best",
    prompt: "What are we measuring for the bucket?",
    speakText: "What are we measuring for the bucket?",
    badgeLabel: "Which Skill?",
    object: { label: "Bucket", iconKey: "bottle", imageSrc: `${CONTAINER_BASE}/bucket.png` },
    tools: shuffle([
      skillOption("capacity", "Capacity", "bottle"),
      skillOption("time", "Time", "wheel"),
      skillOption("mass", "Mass", "cubes"),
    ]),
    correctToolId: "capacity",
    feedback: { correct: "A bucket can be measured by capacity.", wrong: "A bucket challenge usually asks how much it holds." },
  },
  {
    kind: "toolChoice",
    scene: "best",
    prompt: "What are we measuring for the pencil?",
    speakText: "What are we measuring for the pencil?",
    badgeLabel: "Which Skill?",
    object: { label: "Pencil", iconKey: "pencil", imageSrc: `${LENGTH_BASE}/pencil.png` },
    tools: shuffle([
      skillOption("length", "Length", "ruler"),
      skillOption("capacity", "Capacity", "bottle"),
      skillOption("time", "Time", "wheel"),
    ]),
    correctToolId: "length",
    feedback: { correct: "A pencil length can be measured.", wrong: "For a pencil, think how long it is." },
  },
  {
    kind: "toolChoice",
    scene: "best",
    prompt: "What are we measuring on this clock?",
    speakText: "What are we measuring on this clock?",
    badgeLabel: "Which Skill?",
    object: { label: "Clock", iconKey: "wheel" },
    tools: shuffle([
      skillOption("time", "Time", "wheel"),
      skillOption("length", "Length", "ruler"),
      skillOption("mass", "Mass", "cubes"),
    ]),
    correctToolId: "time",
    feedback: { correct: "A clock shows time.", wrong: "Use time skills for a clock." },
  },
  {
    kind: "toolChoice",
    scene: "best",
    prompt: "What are we using for this calendar?",
    speakText: "What are we using for this calendar?",
    badgeLabel: "Which Skill?",
    object: { label: "Calendar", iconKey: "book", imageSrc: `${CALENDAR_BASE}/today.png` },
    tools: shuffle([
      skillOption("calendar", "Calendar / Time", "book"),
      skillOption("capacity", "Capacity", "bottle"),
      skillOption("length", "Length", "ruler"),
    ]),
    correctToolId: "calendar",
    feedback: { correct: "A calendar helps solve date and days-between problems.", wrong: "A calendar challenge uses dates and events." },
  },
];

const METHOD_TASKS: ToolTask[] = [
  {
    kind: "toolChoice",
    scene: "best",
    prompt: "Choose the best method to measure a carrot.",
    speakText: "Choose the best method to measure a carrot.",
    badgeLabel: "Best Method",
    object: { label: "Carrot", iconKey: "pencil", imageSrc: `${LENGTH_BASE}/carrot.png` },
    tools: shuffle([
      methodOption("blocks", "Blocks", "cubes", `${TOOLS_BASE}/tool-cubes.png`),
      methodOption("cups", "Cups", "bottle", `${CONTAINER_BASE}/cup.png`),
      methodOption("balance-cubes", "Balance Cubes", "cubes", `${TOOLS_BASE}/tool-cubes.png`),
    ]),
    correctToolId: "blocks",
    feedback: { correct: "Blocks measure the carrot's length.", wrong: "A carrot length needs a length strategy, like blocks." },
  },
  {
    kind: "toolChoice",
    scene: "best",
    prompt: "Choose the best method to measure a watering can.",
    speakText: "Choose the best method to measure a watering can.",
    badgeLabel: "Best Method",
    object: { label: "Watering Can", iconKey: "bottle", imageSrc: `${CONTAINER_BASE}/watering-can.png` },
    tools: shuffle([
      methodOption("cups", "Cups", "bottle", `${CONTAINER_BASE}/cup.png`),
      methodOption("blocks", "Blocks", "cubes", `${TOOLS_BASE}/tool-cubes.png`),
      methodOption("paperclips", "Paper Clips", "paperclips"),
    ]),
    correctToolId: "cups",
    feedback: { correct: "Cups measure capacity.", wrong: "A watering can holds liquid, so use capacity units." },
  },
  {
    kind: "toolChoice",
    scene: "best",
    prompt: "Choose the best method to measure a rock.",
    speakText: "Choose the best method to measure a rock.",
    badgeLabel: "Best Method",
    object: { label: "Rock", iconKey: "rock", imageSrc: `${MASS_BASE}/rock.png` },
    tools: shuffle([
      methodOption("balance-cubes", "Balance Cubes", "cubes", `${TOOLS_BASE}/tool-cubes.png`),
      methodOption("cups", "Cups", "bottle", `${CONTAINER_BASE}/cup.png`),
      methodOption("dominoes", "Dominoes", "dominoes"),
    ]),
    correctToolId: "balance-cubes",
    feedback: { correct: "Balance cubes measure mass.", wrong: "A rock's heaviness is measured with balance cubes." },
  },
  {
    kind: "toolChoice",
    scene: "best",
    prompt: "Choose the best tool to measure a playground.",
    speakText: "Choose the best tool to measure a playground.",
    badgeLabel: "Best Method",
    object: { label: "Playground", iconKey: "playground", imageSrc: "/images/measurelands/everyday-3d/object-playground.png" },
    tools: shuffle([
      methodOption("wheel", "Trundle Wheel", "wheel", `${TOOLS_BASE}/tool-wheel.png`),
      methodOption("ruler", "Ruler", "ruler", `${TOOLS_BASE}/tool-ruler.png`),
      methodOption("cubes", "Cubes", "cubes", `${TOOLS_BASE}/tool-cubes.png`),
    ]),
    correctToolId: "wheel",
    feedback: { correct: "A trundle wheel suits a large space.", wrong: "For a very large length, choose a large measuring tool." },
  },
];

function buildMixedMissionTasks(): PracticeTask[] {
  return [
    buildY2MeasurelandsWeek1Lesson1QuizTasks()[1]!,
    buildY2MeasurelandsWeek2Lesson1QuizTasks()[1]!,
    buildY2MeasurelandsWeek3Lesson1QuizTasks()[1]!,
    buildY2MeasurelandsWeek6Lesson3QuizTasks()[0]!,
    buildY2MeasurelandsWeek7Lesson2QuizTasks()[0]!,
    buildY2MeasurelandsWeek1Lesson1QuizTasks()[0]!,
    buildY2MeasurelandsWeek3Lesson1QuizTasks()[2]!,
    buildY2MeasurelandsWeek6Lesson3QuizTasks()[3]!,
    buildY2MeasurelandsWeek7Lesson2QuizTasks()[2]!,
  ];
}

function nextFrom<T>(items: T[], cursor: number): T {
  return items[cursor % items.length]!;
}

export function generateY2MeasurelandsWeek8Lesson1Task(
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

  if (activity === "skill") {
    const task = nextFrom(SKILL_TASKS, memory.skillCursor);
    memory.skillCursor += 1;
    return task;
  }
  if (activity === "method") {
    const task = nextFrom(METHOD_TASKS, memory.methodCursor);
    memory.methodCursor += 1;
    return task;
  }

  const task = nextFrom(memory.mixedTasks, memory.mixedCursor);
  memory.mixedCursor += 1;
  return task;
}

export function resetY2MeasurelandsWeek8Lesson1TaskSessionState() {
  lessonMemory.clear();
}
