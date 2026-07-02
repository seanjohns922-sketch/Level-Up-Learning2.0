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
    prompt: "Read o'clock time.",
    speakText:
      "Professor Gauge says: look at the long minute hand first. If it points to twelve, it is o'clock. Now look at the short hour hand. The short hand tells the hour. This clock shows three o'clock.",
    badgeLabel: "Clockwork Crossing",
    targetHour: 3,
    targetMinute: 0,
    teachingPoints: [
      "Look at the long minute hand first.",
      "If it points to 12, it is o'clock.",
      "Now look at the short hour hand.",
      "This clock shows 3 o'clock.",
    ],
    teachingSteps: [
      { label: "Minute hand", text: "Look at the long hand first.", focus: "minute" },
      { label: "O'clock", text: "It points to 12. It is o'clock.", focus: "minute" },
      { label: "Hour hand", text: "Now look at the short hand.", focus: "hour" },
      { label: "Read it", text: "This clock shows 3 o'clock.", focus: "time" },
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
