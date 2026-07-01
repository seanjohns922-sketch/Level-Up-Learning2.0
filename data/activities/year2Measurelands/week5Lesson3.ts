import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import {
  buildBuildClockTask,
  buildClockIntroTask,
  buildReadClockTask,
  getClockMemory,
  type ClockSpec,
} from "@/data/activities/year2Measurelands/week5ClockCore";

// Measurelands · Level 2 · Week 5 · Lesson 3 — Build the Time.
// Students build a snapped clock using large hour + minute choices. No drag.

const memory = new Map<string, { introShown: boolean; cursor: number }>();

const BUILD_SEQUENCE: ClockSpec[] = [
  { hour: 5, minute: 0, prompt: "Build 5 o'clock." },
  { hour: 4, minute: 30, prompt: "Build half past 4." },
  { hour: 10, minute: 0, prompt: "Build 10 o'clock." },
  { hour: 7, minute: 30, prompt: "Build half past 7." },
  { hour: 12, minute: 0, prompt: "Build 12 o'clock." },
  { hour: 2, minute: 30, prompt: "Build half past 2." },
];

const REVIEW_SEQUENCE: ClockSpec[] = [
  { hour: 6, minute: 0, prompt: "What time did you build?", showDigital: true },
  { hour: 9, minute: 30, prompt: "What time did you build?", showDigital: true },
];

function buildIntro(): PracticeTask {
  return buildClockIntroTask({
    prompt: "Build the time.",
    speakText:
      "Professor Gauge says: now you can build a clock. Choose the hour first. Then choose o'clock or half past. The clock hands will move into place.",
    badgeLabel: "Clockwork Crossing",
    targetHour: 5,
    targetMinute: 0,
    teachingPoints: [
      "Choose the hour number.",
      "Choose whether the minute hand points to 12 or 6.",
      "The clock shows your time without dragging tiny hands.",
    ],
  });
}

export function generateY2MeasurelandsWeek5Lesson3Task(
  lessonId: string,
  _difficulty: Difficulty,
): PracticeTask {
  const state = getClockMemory(memory, lessonId);
  if (!state.introShown) {
    state.introShown = true;
    return buildIntro();
  }
  const index = state.cursor % (BUILD_SEQUENCE.length + REVIEW_SEQUENCE.length);
  state.cursor += 1;
  if (index < BUILD_SEQUENCE.length) {
    const spec = BUILD_SEQUENCE[index]!;
    return buildBuildClockTask({ ...spec, badgeLabel: "Build the Time" });
  }
  const review = REVIEW_SEQUENCE[index - BUILD_SEQUENCE.length]!;
  return buildReadClockTask({ ...review, badgeLabel: "Check the Clock" });
}

export function resetY2MeasurelandsWeek5Lesson3TaskSessionState() {
  memory.clear();
}

export function buildY2MeasurelandsWeek5Lesson3QuizTasks(): PracticeTask[] {
  return [
    buildBuildClockTask({ ...BUILD_SEQUENCE[0]!, badgeLabel: "Build the Time Quiz" }),
    buildBuildClockTask({ ...BUILD_SEQUENCE[1]!, badgeLabel: "Build the Time Quiz" }),
    buildReadClockTask({ ...REVIEW_SEQUENCE[0]!, badgeLabel: "Build the Time Quiz" }),
    buildBuildClockTask({ ...BUILD_SEQUENCE[3]!, badgeLabel: "Build the Time Quiz" }),
    buildReadClockTask({ ...REVIEW_SEQUENCE[1]!, badgeLabel: "Build the Time Quiz" }),
  ];
}
