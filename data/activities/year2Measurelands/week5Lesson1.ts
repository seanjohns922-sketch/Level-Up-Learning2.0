import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import {
  buildClockIntroTask,
  buildReadClockTask,
  getClockMemory,
  type ClockSpec,
} from "@/data/activities/year2Measurelands/week5ClockCore";

// Measurelands · Level 2 · Week 5 · Lesson 1 — O'Clock Time.
// The first analog-clock lesson isolates one rule: minute hand at 12 means
// o'clock. No half past, no quarters, no hand dragging.

const memory = new Map<string, { introShown: boolean; cursor: number }>();

const READ_SEQUENCE: ClockSpec[] = [
  { hour: 3, minute: 0, prompt: "What o'clock time is shown?" },
  { hour: 7, minute: 0, prompt: "What o'clock time is shown?" },
  { hour: 12, minute: 0, prompt: "What o'clock time is shown?" },
  { hour: 5, minute: 0, prompt: "What o'clock time is shown?" },
  { hour: 9, minute: 0, prompt: "What o'clock time is shown?" },
  { hour: 1, minute: 0, prompt: "What o'clock time is shown?" },
];

function buildIntro(): PracticeTask {
  return buildClockIntroTask({
    prompt: "O'clock time.",
    speakText:
      "Professor Gauge says: when the minute hand points straight up to twelve, we say o'clock. Look at the short hour hand to find the hour.",
    badgeLabel: "Clockwork Crossing",
    targetHour: 3,
    targetMinute: 0,
    teachingPoints: [
      "The long minute hand points to 12.",
      "That means it is o'clock.",
      "The short hour hand tells which o'clock time it is.",
    ],
  });
}

export function generateY2MeasurelandsWeek5Lesson1Task(
  lessonId: string,
  _difficulty: Difficulty,
): PracticeTask {
  const state = getClockMemory(memory, lessonId);
  if (!state.introShown) {
    state.introShown = true;
    return buildIntro();
  }
  const spec = READ_SEQUENCE[state.cursor % READ_SEQUENCE.length]!;
  state.cursor += 1;
  return buildReadClockTask({ ...spec, badgeLabel: "O'Clock Time" });
}

export function resetY2MeasurelandsWeek5Lesson1TaskSessionState() {
  memory.clear();
}

export function buildY2MeasurelandsWeek5Lesson1QuizTasks(): PracticeTask[] {
  return READ_SEQUENCE.slice(0, 5).map((spec) => buildReadClockTask({ ...spec, badgeLabel: "O'Clock Quiz" }));
}
