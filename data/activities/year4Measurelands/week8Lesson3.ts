import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { pull } from "@/data/activities/year4Measurelands/week8Common";
import { buildY4MeasurelandsWeek1Lesson3QuizTasks } from "@/data/activities/year4Measurelands/week1Lesson3";
import { buildY4MeasurelandsWeek2Lesson2QuizTasks } from "@/data/activities/year4Measurelands/week2Lesson2";
import { buildY4MeasurelandsWeek3Lesson3QuizTasks } from "@/data/activities/year4Measurelands/week3Lesson3";
import { buildY4MeasurelandsWeek4Lesson3QuizTasks } from "@/data/activities/year4Measurelands/week4Lesson3";
import { buildY4MeasurelandsWeek5Lesson3QuizTasks } from "@/data/activities/year4Measurelands/week5Lesson3";
import { buildY4MeasurelandsWeek6Lesson3QuizTasks } from "@/data/activities/year4Measurelands/week6Lesson3";
import { buildY4MeasurelandsWeek7Lesson2QuizTasks } from "@/data/activities/year4Measurelands/week7Lesson2";

// ── Measurelands · Level 4 · Week 8 · Lesson 3 — "Master Surveyor Mission" ────
// The final capstone lesson. Mixed authentic scenarios that each draw on the
// Level 4 skills — length, capacity, temperature, perimeter, area, time and a
// light angle judgement. No new mechanics: every task is pulled from an earlier
// week's render-safe builder. Completing this lesson unlocks the Level 4
// Post-Test (there is NO Week 8 weekly quiz).
//   A. camp   — Adventure Camp: time / capacity / temperature.
//   B. build  — Build the Campsite: perimeter / area / length.
//   C. final  — Final Mission: mixed scenarios, including one angle judgement.

type ToolTask = Extract<PracticeTask, { kind: "toolChoice" }>;

type LessonMemory = {
  introShown: boolean;
  cursor: number;
  campCursor: number;
  buildCursor: number;
  finalCursor: number;
};
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"camp" | "build" | "final"> = ["camp", "build", "final", "camp", "build", "final"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, campCursor: 0, buildCursor: 0, finalCursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

function buildIntroTask(): ToolTask {
  return {
    kind: "toolChoice",
    scene: "intro",
    prompt: "The Master Surveyor Mission",
    speakText:
      "Professor Gauge says: one final mission before you become a Master Surveyor. These challenges mix everything you have learned — length, capacity, temperature, perimeter, area, time and angles. Read each one, decide what to measure, then solve it.",
    badgeLabel: "Meazurex Mission",
    introLines: [
      "One final mission before you become a Master Surveyor!",
      "These challenges mix everything — length, area, capacity, temperature, time and angles. Read each one, decide what to measure, then solve it.",
    ],
    introTools: [
      { id: "length", label: "Length", focus: "How long?", iconKey: "m-length" },
      { id: "area", label: "Area", focus: "Space covered", iconKey: "m-area" },
      { id: "capacity", label: "Capacity", focus: "How much fits?", iconKey: "m-capacity" },
      { id: "time", label: "Time", focus: "How long it takes", iconKey: "m-time" },
      { id: "perimeter", label: "Perimeter", focus: "Around the edge", iconKey: "m-perimeter" },
    ],
    feedback: {
      correct: "Mission accepted!",
      wrong: "Read the whole mission, decide what to measure, then solve it.",
    },
  };
}

// Activity A — Adventure Camp: travel time / water / temperature.
const CAMP_BUILDERS: Array<() => PracticeTask[]> = [
  buildY4MeasurelandsWeek6Lesson3QuizTasks, // time (travel / duration)
  buildY4MeasurelandsWeek2Lesson2QuizTasks, // capacity (water)
  buildY4MeasurelandsWeek3Lesson3QuizTasks, // temperature (weather)
];

function buildCampTask(memory: LessonMemory): PracticeTask {
  const build = CAMP_BUILDERS[memory.campCursor % CAMP_BUILDERS.length]!;
  memory.campCursor += 1;
  return pull(build);
}

// Activity B — Build the Campsite: perimeter / area / length.
const BUILD_BUILDERS: Array<() => PracticeTask[]> = [
  buildY4MeasurelandsWeek4Lesson3QuizTasks, // perimeter (fence)
  buildY4MeasurelandsWeek5Lesson3QuizTasks, // area (play space)
  buildY4MeasurelandsWeek1Lesson3QuizTasks, // length (equipment)
];

function buildCampsiteTask(memory: LessonMemory): PracticeTask {
  const build = BUILD_BUILDERS[memory.buildCursor % BUILD_BUILDERS.length]!;
  memory.buildCursor += 1;
  return pull(build);
}

// Activity C — Final Mission: mixed, guaranteeing an angle judgement each cycle.
const FINAL_BUILDERS: Array<() => PracticeTask[]> = [
  buildY4MeasurelandsWeek7Lesson2QuizTasks, // angle (compare to a right angle)
  buildY4MeasurelandsWeek6Lesson3QuizTasks, // time
  buildY4MeasurelandsWeek5Lesson3QuizTasks, // area
  buildY4MeasurelandsWeek4Lesson3QuizTasks, // perimeter
];

function buildFinalTask(memory: LessonMemory): PracticeTask {
  const build = FINAL_BUILDERS[memory.finalCursor % FINAL_BUILDERS.length]!;
  memory.finalCursor += 1;
  return pull(build);
}

export function generateY4MeasurelandsWeek8Lesson3Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "build") return buildCampsiteTask(memory);
  if (activity === "final") return buildFinalTask(memory);
  return buildCampTask(memory);
}

export function resetY4MeasurelandsWeek8Lesson3TaskSessionState() {
  lessonMemory.clear();
}

// Week 8 has NO weekly quiz — completing this lesson unlocks the Level 4
// Post-Test. This builder exists only to satisfy the registry contract.
export function buildY4MeasurelandsWeek8Lesson3QuizTasks(): PracticeTask[] {
  return [];
}
