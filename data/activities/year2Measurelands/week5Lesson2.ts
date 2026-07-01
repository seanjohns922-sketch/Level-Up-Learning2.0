import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import {
  buildClockIntroTask,
  buildReadClockTask,
  getClockMemory,
  type ClockSpec,
} from "@/data/activities/year2Measurelands/week5ClockCore";

// Measurelands · Level 2 · Week 5 · Lesson 2 — Half Past Time.
// The key misconception is the hour hand: at half past it sits between the
// hour and the next number, never exactly on the hour.

const memory = new Map<string, { introShown: boolean; cursor: number }>();

const READ_SEQUENCE: ClockSpec[] = [
  { hour: 4, minute: 30, prompt: "What half past time is shown?" },
  { hour: 8, minute: 30, prompt: "What half past time is shown?" },
  { hour: 2, minute: 30, prompt: "What half past time is shown?" },
  { hour: 11, minute: 30, prompt: "What half past time is shown?" },
  { hour: 6, minute: 30, prompt: "What half past time is shown?" },
  { hour: 1, minute: 30, prompt: "What half past time is shown?" },
];

function buildIntro(): PracticeTask {
  return buildClockIntroTask({
    prompt: "Half past time.",
    speakText:
      "Professor Gauge says: when the minute hand points to six, we say half past. The hour hand is halfway between this hour and the next hour.",
    badgeLabel: "Clockwork Crossing",
    targetHour: 4,
    targetMinute: 30,
    teachingPoints: [
      "The long minute hand points to 6.",
      "That means half past.",
      "The short hour hand is halfway between 4 and 5, so this is half past 4.",
    ],
  });
}

export function generateY2MeasurelandsWeek5Lesson2Task(
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
  return buildReadClockTask({ ...spec, badgeLabel: "Half Past Time" });
}

export function resetY2MeasurelandsWeek5Lesson2TaskSessionState() {
  memory.clear();
}

export function buildY2MeasurelandsWeek5Lesson2QuizTasks(): PracticeTask[] {
  return READ_SEQUENCE.slice(0, 5).map((spec) => buildReadClockTask({ ...spec, badgeLabel: "Half Past Quiz" }));
}
