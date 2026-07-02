import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import {
  buildBuildClockTask,
  buildChooseClockTask,
  buildClockIntroTask,
  buildReadClockTask,
  getClockMemory,
  normalizeHour,
  type ClockSpec,
} from "@/data/activities/year2Measurelands/week5ClockCore";

// Measurelands · Level 2 · Week 6 · Lesson 2 — Quarter To Time.
// The key misconception is naming the hour the hand came from instead of the
// hour it is nearly reaching.

const memory = new Map<string, { introShown: boolean; cursor: number }>();

const READ_SEQUENCE: ClockSpec[] = [
  { hour: 3, minute: 45, prompt: "What time is shown?" },
  { hour: 7, minute: 45, prompt: "What time is shown?" },
  { hour: 11, minute: 45, prompt: "What time is shown?" },
  { hour: 1, minute: 45, prompt: "What time is shown?" },
];

const FIND_SEQUENCE = [
  [
    { hour: 2, minute: 15 },
    { hour: 2, minute: 45 },
    { hour: 2, minute: 30 },
  ],
  [
    { hour: 8, minute: 0 },
    { hour: 8, minute: 30 },
    { hour: 8, minute: 45 },
  ],
  [
    { hour: 10, minute: 45 },
    { hour: 10, minute: 15 },
    { hour: 10, minute: 0 },
  ],
] satisfies ClockSpec[][];

const BUILD_SEQUENCE: ClockSpec[] = [
  { hour: 3, minute: 45, prompt: "Build quarter to 4." },
  { hour: 8, minute: 45, prompt: "Build quarter to 9." },
];

function buildIntro(): PracticeTask {
  return buildClockIntroTask({
    prompt: "Quarter to time.",
    speakText:
      "Professor Gauge says: when the long minute hand points to 9, say quarter to. Then look at the short hour hand. Name the hour it is nearly reaching.",
    badgeLabel: "Clock Tower II",
    targetHour: 3,
    targetMinute: 45,
    teachingPoints: [
      "Look at the long minute hand first.",
      "If it points to 9, say quarter to.",
      "Now look where the short hand is going.",
      "This clock shows quarter to 4.",
    ],
    teachingSteps: [
      { label: "Minute hand", text: "Look at the long hand first.", focus: "minute" },
      { label: "Quarter to", text: "It points to 9. Say quarter to.", focus: "minute" },
      { label: "Next hour", text: "The short hand is nearly at 4.", focus: "hour" },
      { label: "Read it", text: "This clock shows quarter to 4.", focus: "time" },
    ],
  });
}

function buildFindTask(index: number): PracticeTask {
  const clocks = FIND_SEQUENCE[index % FIND_SEQUENCE.length]!;
  const correctIndex = clocks.findIndex((clock) => clock.minute === 45);
  return buildChooseClockTask({
    prompt: "Tap the clock that shows quarter to.",
    speakText: "Tap the clock with the long minute hand pointing to 9.",
    badgeLabel: "Find Quarter To",
    clocks,
    correctIndex,
  });
}

function buildMovingTowardTask(spec: ClockSpec): PracticeTask {
  const nextHour = normalizeHour(spec.hour + 1);
  return {
    kind: "analogClock",
    scene: "read",
    mode: "read",
    granularity: "quarterHour",
    targetHour: normalizeHour(spec.hour),
    targetMinute: 45,
    prompt: "The hour hand is moving toward...",
    speakText: "Look at the short hour hand. Which hour is it moving toward?",
    badgeLabel: "Next Hour",
    options: [
      { id: "came-from", label: String(normalizeHour(spec.hour)), hour: normalizeHour(spec.hour), minute: 45 },
      { id: "correct", label: String(nextHour), hour: nextHour, minute: 45 },
      { id: "after-next", label: String(normalizeHour(nextHour + 1)), hour: normalizeHour(nextHour + 1), minute: 45 },
    ],
    correctOptionId: "correct",
    feedback: {
      correct: `Yes — the hour hand is moving toward ${nextHour}.`,
      wrong: `Correct answer: ${nextHour}. For quarter to, name the hour the short hand is nearly reaching.`,
    },
  };
}

export function generateY2MeasurelandsWeek6Lesson2Task(
  lessonId: string,
  _difficulty: Difficulty,
): PracticeTask {
  const state = getClockMemory(memory, lessonId);
  if (!state.introShown) {
    state.introShown = true;
    return buildIntro();
  }
  const index = state.cursor % 11;
  state.cursor += 1;
  if (index < 4) return buildReadClockTask({ ...READ_SEQUENCE[index]!, badgeLabel: "Quarter To Time" });
  if (index < 7) return buildFindTask(index - 4);
  if (index < 9) return buildMovingTowardTask(READ_SEQUENCE[index - 7]!);
  return buildBuildClockTask({ ...BUILD_SEQUENCE[index - 9]!, badgeLabel: "Build Quarter To" });
}

export function resetY2MeasurelandsWeek6Lesson2TaskSessionState() {
  memory.clear();
}

export function buildY2MeasurelandsWeek6Lesson2QuizTasks(): PracticeTask[] {
  return [
    buildReadClockTask({ ...READ_SEQUENCE[0]!, badgeLabel: "Quarter To Quiz" }),
    buildFindTask(0),
    buildMovingTowardTask(READ_SEQUENCE[0]!),
    buildReadClockTask({ ...READ_SEQUENCE[1]!, badgeLabel: "Quarter To Quiz" }),
    buildBuildClockTask({ ...BUILD_SEQUENCE[0]!, badgeLabel: "Quarter To Quiz" }),
  ];
}
