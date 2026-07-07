import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { convertTask, matchTask, mistakeTask } from "@/data/activities/year5Measurelands/week6Common";

// ── Measurelands · Level 5 · Week 6 · Lesson 1 — "24-Hour Time" (AC9M5M03) ──
//   A. convert — 12-hour → 24-hour (MCQ).
//   B. match   — analog + digital → 24-hour.
//   C. mistake — spot Professor Gauge's wrong conversion.

type Time24Task = Extract<PracticeTask, { kind: "time24" }>;

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"convert" | "match" | "mistake"> = ["convert", "match", "mistake", "convert", "match", "mistake"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

function buildIntroTask(): Time24Task {
  return {
    kind: "time24",
    scene: "intro",
    prompt: "Many timetables use 24-hour time.",
    speakText:
      "Professor Gauge says: many timetables don't use am and pm — they use 24-hour time. After midday you keep counting: 1 pm is 13 hundred, 2 pm is 14 hundred.",
    badgeLabel: "Meazurex Mission",
    feedback: { correct: "Let's convert!", wrong: "Let's convert!" },
  };
}

export function generateY5MeasurelandsWeek6Lesson1Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) { memory.introShown = true; return buildIntroTask(); }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "match") return matchTask();
  if (activity === "mistake") return mistakeTask();
  return convertTask();
}

export function resetY5MeasurelandsWeek6Lesson1TaskSessionState() {
  lessonMemory.clear();
}

export function buildY5MeasurelandsWeek6Lesson1QuizTasks(): PracticeTask[] {
  return [convertTask(), matchTask(), mistakeTask(), convertTask(), matchTask()];
}
