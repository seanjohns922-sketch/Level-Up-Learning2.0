import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { buildY2MeasurelandsWeek1Lesson1QuizTasks } from "@/data/activities/year2Measurelands/week1Lesson1";
import { buildY2MeasurelandsWeek2Lesson2QuizTasks } from "@/data/activities/year2Measurelands/week2Lesson2";
import { buildY2MeasurelandsWeek3Lesson2QuizTasks } from "@/data/activities/year2Measurelands/week3Lesson2";
import { buildY2MeasurelandsWeek4Lesson2QuizTasks } from "@/data/activities/year2Measurelands/week4Lesson2";
import { buildY2MeasurelandsWeek4Lesson3QuizTasks } from "@/data/activities/year2Measurelands/week4Lesson3";
import { buildY2MeasurelandsWeek6Lesson3QuizTasks } from "@/data/activities/year2Measurelands/week6Lesson3";
import { buildY2MeasurelandsWeek7Lesson2QuizTasks } from "@/data/activities/year2Measurelands/week7Lesson2";
import { buildY2MeasurelandsWeek7Lesson3QuizTasks } from "@/data/activities/year2Measurelands/week7Lesson3";

// ── Measurelands · Level 2 (Year 2) · Week 8 · Lesson 2 — "Measurement Missions" ──
// Capstone application lesson. No new mechanics or curriculum: students read a
// real-world situation, choose the measurement strategy, then solve mixed tasks.

type ToolTask = Extract<PracticeTask, { kind: "toolChoice" }>;

const MASS_BASE = "/images/measurelands/week2-3d";
const CONTAINER_BASE = "/images/measurelands/containers-3d";
const LENGTH_BASE = "/images/measurelands/measure-objects-3d";
const TOOLS_BASE = "/images/measurelands/tools-3d";
const CALENDAR_BASE = "/images/measurelands/calendar-3d";

type LessonMemory = {
  introShown: boolean;
  cursor: number;
  strategyCursor: number;
  missionCursor: number;
  missions: PracticeTask[];
};

const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"strategy" | "mission"> = [
  "strategy",
  "mission",
  "mission",
  "strategy",
  "mission",
  "mission",
  "mission",
];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = {
    introShown: false,
    cursor: 0,
    strategyCursor: 0,
    missionCursor: 0,
    missions: buildMissionChain(),
  };
  lessonMemory.set(lessonId, created);
  return created;
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex]!, next[index]!];
  }
  return next;
}

function option(id: string, label: string, iconKey: string, imageSrc?: string) {
  return { id, label, iconKey, imageSrc };
}

function buildIntroTask(): ToolTask {
  return {
    kind: "toolChoice",
    scene: "intro",
    prompt: "Measurement Missions",
    speakText:
      "Professor Gauge says: real measurers do not always know what type of problem is coming. Read the mission, choose the measurement skill, then solve it.",
    badgeLabel: "Master Measurer",
    introTools: [
      { id: "length", label: "Length", focus: "How long?", iconKey: "ruler", imageSrc: `${TOOLS_BASE}/tool-ruler.png` },
      { id: "mass", label: "Mass", focus: "How heavy?", iconKey: "cubes", imageSrc: `${TOOLS_BASE}/tool-cubes.png` },
      { id: "capacity", label: "Capacity", focus: "How much fits?", iconKey: "bottle", imageSrc: `${CONTAINER_BASE}/measuring-jug.png` },
      { id: "time", label: "Time", focus: "Clock hands", iconKey: "wheel" },
      { id: "calendar", label: "Calendar", focus: "Dates and events", iconKey: "book", imageSrc: `${CALENDAR_BASE}/today.png` },
    ],
    feedback: {
      correct: "Mission accepted.",
      wrong: "Read the whole problem first. Then choose the measuring skill.",
    },
  };
}

const STRATEGY_TASKS: ToolTask[] = [
  {
    kind: "toolChoice",
    scene: "best",
    prompt: "Professor Gauge wants to know how much water fits inside a watering can. What should he measure?",
    speakText: "Professor Gauge wants to know how much water fits inside a watering can. What should he measure?",
    badgeLabel: "Help Professor Gauge",
    object: { label: "Watering Can", iconKey: "bottle", imageSrc: `${CONTAINER_BASE}/watering-can.png` },
    tools: shuffle([
      option("capacity", "Capacity", "bottle", `${CONTAINER_BASE}/cup.png`),
      option("length", "Length", "ruler", `${TOOLS_BASE}/tool-ruler.png`),
      option("mass", "Mass", "cubes", `${TOOLS_BASE}/tool-cubes.png`),
    ]),
    correctToolId: "capacity",
    feedback: {
      correct: "Capacity tells how much liquid fits inside.",
      wrong: "The clue is 'how much water fits inside' — that is capacity.",
    },
  },
  {
    kind: "toolChoice",
    scene: "best",
    prompt: "Professor Gauge wants to know how heavy a pumpkin is. What should he measure?",
    speakText: "Professor Gauge wants to know how heavy a pumpkin is. What should he measure?",
    badgeLabel: "Help Professor Gauge",
    object: { label: "Pumpkin", iconKey: "rock", imageSrc: `${MASS_BASE}/pumpkin.png` },
    tools: shuffle([
      option("mass", "Mass", "cubes", `${TOOLS_BASE}/tool-cubes.png`),
      option("capacity", "Capacity", "bottle", `${CONTAINER_BASE}/cup.png`),
      option("time", "Time", "wheel"),
    ]),
    correctToolId: "mass",
    feedback: {
      correct: "Mass tells how heavy an object is.",
      wrong: "The clue is 'how heavy' — that is mass.",
    },
  },
  {
    kind: "toolChoice",
    scene: "best",
    prompt: "Professor Gauge wants to know how long a rope is. What should he measure?",
    speakText: "Professor Gauge wants to know how long a rope is. What should he measure?",
    badgeLabel: "Help Professor Gauge",
    object: { label: "Rope", iconKey: "ruler", imageSrc: `${LENGTH_BASE}/vine.png` },
    tools: shuffle([
      option("length", "Length", "ruler", `${TOOLS_BASE}/tool-ruler.png`),
      option("mass", "Mass", "cubes", `${TOOLS_BASE}/tool-cubes.png`),
      option("calendar", "Calendar", "book", `${CALENDAR_BASE}/today.png`),
    ]),
    correctToolId: "length",
    feedback: {
      correct: "Length tells how long an object is.",
      wrong: "The clue is 'how long' — that is length.",
    },
  },
  {
    kind: "toolChoice",
    scene: "best",
    prompt: "Professor Gauge wants to know how many days until Sports Day. What should he use?",
    speakText: "Professor Gauge wants to know how many days until Sports Day. What should he use?",
    badgeLabel: "Help Professor Gauge",
    object: { label: "Sports Day", iconKey: "book", imageSrc: `${CALENDAR_BASE}/tomorrow.png` },
    tools: shuffle([
      option("calendar", "Calendar", "book", `${CALENDAR_BASE}/today.png`),
      option("clock", "Clock", "wheel"),
      option("capacity", "Capacity", "bottle", `${CONTAINER_BASE}/cup.png`),
    ]),
    correctToolId: "calendar",
    feedback: {
      correct: "A calendar helps count days until an event.",
      wrong: "The clue is 'how many days until' — use calendar skills.",
    },
  },
  {
    kind: "toolChoice",
    scene: "best",
    prompt: "Professor Gauge wants to read 3:30 on a clock. What skill does he need?",
    speakText: "Professor Gauge wants to read 3:30 on a clock. What skill does he need?",
    badgeLabel: "Help Professor Gauge",
    object: { label: "Clock Time", iconKey: "wheel" },
    tools: shuffle([
      option("time", "Time", "wheel"),
      option("length", "Length", "ruler", `${TOOLS_BASE}/tool-ruler.png`),
      option("mass", "Mass", "cubes", `${TOOLS_BASE}/tool-cubes.png`),
    ]),
    correctToolId: "time",
    feedback: {
      correct: "Clock hands show time.",
      wrong: "3:30 is a clock time, so use time skills.",
    },
  },
];

function buildMissionChain(): PracticeTask[] {
  return [
    buildY2MeasurelandsWeek1Lesson1QuizTasks()[0]!,
    buildY2MeasurelandsWeek2Lesson2QuizTasks()[2]!,
    buildY2MeasurelandsWeek3Lesson2QuizTasks()[1]!,
    buildY2MeasurelandsWeek7Lesson2QuizTasks()[0]!,
    buildY2MeasurelandsWeek6Lesson3QuizTasks()[0]!,
    buildY2MeasurelandsWeek4Lesson2QuizTasks()[0]!,
    buildY2MeasurelandsWeek3Lesson2QuizTasks()[3]!,
    buildY2MeasurelandsWeek7Lesson3QuizTasks()[2]!,
    buildY2MeasurelandsWeek6Lesson3QuizTasks()[3]!,
    buildY2MeasurelandsWeek4Lesson3QuizTasks()[1]!,
    buildY2MeasurelandsWeek1Lesson1QuizTasks()[3]!,
    buildY2MeasurelandsWeek2Lesson2QuizTasks()[3]!,
  ];
}

function nextFrom<T>(items: T[], cursor: number): T {
  return items[cursor % items.length]!;
}

export function generateY2MeasurelandsWeek8Lesson2Task(
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

  if (activity === "strategy") {
    const task = nextFrom(STRATEGY_TASKS, memory.strategyCursor);
    memory.strategyCursor += 1;
    return task;
  }

  const task = nextFrom(memory.missions, memory.missionCursor);
  memory.missionCursor += 1;
  return task;
}

export function resetY2MeasurelandsWeek8Lesson2TaskSessionState() {
  lessonMemory.clear();
}
