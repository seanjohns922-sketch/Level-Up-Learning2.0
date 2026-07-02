import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import {
  buildBuildClockTask,
  buildChooseClockTask,
  buildClockIntroTask,
  buildReadClockTask,
  getClockMemory,
  type ClockSpec,
} from "@/data/activities/year2Measurelands/week5ClockCore";

// Measurelands · Level 2 · Week 6 · Lesson 1 — Quarter Past Time.
// Isolates the rule: minute hand at 3 means quarter past.

const memory = new Map<string, { introShown: boolean; cursor: number }>();

const READ_SEQUENCE: ClockSpec[] = [
  { hour: 3, minute: 15, prompt: "What time is shown?" },
  { hour: 6, minute: 15, prompt: "What time is shown?" },
  { hour: 11, minute: 15, prompt: "What time is shown?" },
  { hour: 1, minute: 15, prompt: "What time is shown?" },
];

const FIND_SEQUENCE = [
  [
    { hour: 4, minute: 15 },
    { hour: 4, minute: 0 },
    { hour: 4, minute: 30 },
  ],
  [
    { hour: 8, minute: 0 },
    { hour: 8, minute: 15 },
    { hour: 8, minute: 30 },
  ],
  [
    { hour: 12, minute: 30 },
    { hour: 12, minute: 0 },
    { hour: 12, minute: 15 },
  ],
] satisfies ClockSpec[][];

const BUILD_SEQUENCE: ClockSpec[] = [
  { hour: 5, minute: 15, prompt: "Build quarter past 5." },
  { hour: 9, minute: 15, prompt: "Build quarter past 9." },
];

function buildIntro(): PracticeTask {
  return buildClockIntroTask({
    prompt: "Quarter past time.",
    speakText:
      "Professor Gauge says: look at the long minute hand first. If it points to 3, say quarter past. Then look at the short hour hand. Read quarter past the hour.",
    badgeLabel: "Clock Tower II",
    targetHour: 3,
    targetMinute: 15,
    teachingPoints: [
      "Look at the long minute hand first.",
      "If it points to 3, say quarter past.",
      "Now look at the short hour hand.",
      "This clock shows quarter past 3.",
    ],
    teachingSteps: [
      { label: "Minute hand", text: "Look at the long hand first.", focus: "minute" },
      { label: "Quarter past", text: "It points to 3. Say quarter past.", focus: "minute" },
      { label: "Hour hand", text: "Now look at the short hand.", focus: "hour" },
      { label: "Read it", text: "This clock shows quarter past 3.", focus: "time" },
    ],
  });
}

function buildFindTask(index: number): PracticeTask {
  const clocks = FIND_SEQUENCE[index % FIND_SEQUENCE.length]!;
  const correctIndex = clocks.findIndex((clock) => clock.minute === 15);
  return buildChooseClockTask({
    prompt: "Tap the clock that shows quarter past.",
    speakText: "Tap the clock with the long minute hand pointing to 3.",
    badgeLabel: "Find Quarter Past",
    clocks,
    correctIndex,
  });
}

export function generateY2MeasurelandsWeek6Lesson1Task(
  lessonId: string,
  _difficulty: Difficulty,
): PracticeTask {
  const state = getClockMemory(memory, lessonId);
  if (!state.introShown) {
    state.introShown = true;
    return buildIntro();
  }
  const index = state.cursor % 9;
  state.cursor += 1;
  if (index < 4) return buildReadClockTask({ ...READ_SEQUENCE[index]!, badgeLabel: "Quarter Past Time" });
  if (index < 7) return buildFindTask(index - 4);
  return buildBuildClockTask({ ...BUILD_SEQUENCE[index - 7]!, badgeLabel: "Build Quarter Past" });
}

export function resetY2MeasurelandsWeek6Lesson1TaskSessionState() {
  memory.clear();
}

export function buildY2MeasurelandsWeek6Lesson1QuizTasks(): PracticeTask[] {
  return [
    buildReadClockTask({ ...READ_SEQUENCE[0]!, badgeLabel: "Quarter Past Quiz" }),
    buildFindTask(0),
    buildReadClockTask({ ...READ_SEQUENCE[1]!, badgeLabel: "Quarter Past Quiz" }),
    buildFindTask(1),
    buildBuildClockTask({ ...BUILD_SEQUENCE[0]!, badgeLabel: "Quarter Past Quiz" }),
  ];
}
