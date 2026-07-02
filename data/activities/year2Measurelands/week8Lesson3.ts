import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { buildY2MeasurelandsWeek1Lesson1QuizTasks } from "@/data/activities/year2Measurelands/week1Lesson1";
import { buildY2MeasurelandsWeek2Lesson2QuizTasks } from "@/data/activities/year2Measurelands/week2Lesson2";
import { buildY2MeasurelandsWeek3Lesson2QuizTasks } from "@/data/activities/year2Measurelands/week3Lesson2";
import { buildY2MeasurelandsWeek4Lesson2QuizTasks } from "@/data/activities/year2Measurelands/week4Lesson2";
import { buildY2MeasurelandsWeek6Lesson3QuizTasks } from "@/data/activities/year2Measurelands/week6Lesson3";
import { buildY2MeasurelandsWeek7Lesson2QuizTasks } from "@/data/activities/year2Measurelands/week7Lesson2";
import { buildY2MeasurelandsWeek7Lesson3QuizTasks } from "@/data/activities/year2Measurelands/week7Lesson3";

// ── Measurelands · Level 2 (Year 2) · Week 8 · Lesson 3 — "Master Measurer Trial" ──
// Final capstone before the post-test. The trial reuses already-taught mechanics
// only: length, mass, capacity, accuracy, clock and calendar.

type ToolTask = Extract<PracticeTask, { kind: "toolChoice" }>;

const CONTAINER_BASE = "/images/measurelands/containers-3d";
const TOOLS_BASE = "/images/measurelands/tools-3d";
const CALENDAR_BASE = "/images/measurelands/calendar-3d";

type LessonMemory = {
  introShown: boolean;
  cursor: number;
  trialTasks: PracticeTask[];
};

const lessonMemory = new Map<string, LessonMemory>();

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex]!, next[index]!];
  }
  return next;
}

function buildIntroTask(): ToolTask {
  return {
    kind: "toolChoice",
    scene: "intro",
    prompt: "Master Measurer Trial",
    speakText:
      "Professor Gauge says: one final trial stands between you and becoming a Master Measurer. Use everything you've learned.",
    badgeLabel: "Final Trial",
    introTools: [
      { id: "length", label: "Length Gate", focus: "compare measured lengths", iconKey: "ruler", imageSrc: `${TOOLS_BASE}/tool-ruler.png` },
      { id: "time", label: "Time Tower", focus: "read clock times", iconKey: "wheel" },
      { id: "capacity", label: "Capacity Chamber", focus: "compare cup counts", iconKey: "bottle", imageSrc: `${CONTAINER_BASE}/bucket.png` },
      { id: "calendar", label: "Calendar Chamber", focus: "count days to events", iconKey: "book", imageSrc: `${CALENDAR_BASE}/today.png` },
    ],
    feedback: {
      correct: "The Master Measurer Trial begins.",
      wrong: "Use the strategy that matches the challenge.",
    },
  };
}

function buildTrialTasks(): PracticeTask[] {
  const lengthGate = buildY2MeasurelandsWeek1Lesson1QuizTasks();
  const timeTower = buildY2MeasurelandsWeek6Lesson3QuizTasks();
  const capacityChamber = buildY2MeasurelandsWeek3Lesson2QuizTasks();
  const massChamber = buildY2MeasurelandsWeek2Lesson2QuizTasks();
  const accuracyChamber = buildY2MeasurelandsWeek4Lesson2QuizTasks();
  const calendarChamber = buildY2MeasurelandsWeek7Lesson2QuizTasks();
  const calendarChallenge = buildY2MeasurelandsWeek7Lesson3QuizTasks();

  const gate: PracticeTask[] = [
    lengthGate[0]!,
    timeTower[0]!,
  ];

  const finalChamber = shuffle<PracticeTask>([
    capacityChamber[1]!,
    massChamber[3]!,
    calendarChamber[0]!,
    accuracyChamber[0]!,
    capacityChamber[3]!,
    calendarChallenge[2]!,
    timeTower[3]!,
    lengthGate[3]!,
  ]);

  return [...gate, ...finalChamber];
}

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = {
    introShown: false,
    cursor: 0,
    trialTasks: buildTrialTasks(),
  };
  lessonMemory.set(lessonId, created);
  return created;
}

export function generateY2MeasurelandsWeek8Lesson3Task(
  lessonId: string,
  _difficulty: Difficulty,
): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }

  const task = memory.trialTasks[memory.cursor % memory.trialTasks.length]!;
  memory.cursor += 1;
  return task;
}

export function resetY2MeasurelandsWeek8Lesson3TaskSessionState() {
  lessonMemory.clear();
}
