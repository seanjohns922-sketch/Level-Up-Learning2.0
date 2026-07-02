import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import {
  buildBuildClockTask,
  buildChooseClockTask,
  buildClockIntroTask,
  buildReadClockTask,
  getClockMemory,
  timeLabel,
  type ClockSpec,
} from "@/data/activities/year2Measurelands/week5ClockCore";

// Measurelands · Level 2 · Week 6 · Lesson 3 — Build Any Time.
// Mixed snapped practice across o'clock, half past, quarter past and quarter to.

const memory = new Map<string, { introShown: boolean; cursor: number }>();

const READ_SEQUENCE: ClockSpec[] = [
  { hour: 2, minute: 0, prompt: "What time is shown?" },
  { hour: 5, minute: 15, prompt: "What time is shown?" },
  { hour: 6, minute: 30, prompt: "What time is shown?" },
  { hour: 8, minute: 45, prompt: "What time is shown?" },
];

const MATCH_SEQUENCE = [
  [
    { hour: 1, minute: 0 },
    { hour: 1, minute: 15 },
    { hour: 1, minute: 30 },
  ],
  [
    { hour: 4, minute: 15 },
    { hour: 4, minute: 45 },
    { hour: 4, minute: 0 },
  ],
  [
    { hour: 9, minute: 30 },
    { hour: 9, minute: 45 },
    { hour: 9, minute: 15 },
  ],
] satisfies ClockSpec[][];

const BUILD_SEQUENCE: ClockSpec[] = [
  { hour: 10, minute: 0, prompt: "Build 10 o'clock." },
  { hour: 7, minute: 30, prompt: "Build half past 7." },
  { hour: 4, minute: 15, prompt: "Build quarter past 4." },
  { hour: 2, minute: 45, prompt: "Build quarter to 3." },
  { hour: 11, minute: 45, prompt: "Build quarter to 12." },
];

function buildIntro(): PracticeTask {
  return buildClockIntroTask({
    prompt: "Build any time.",
    speakText:
      "Professor Gauge says: check the minute hand first. Then use the hour hand to finish the time. You can build o'clock, half past, quarter past, and quarter to.",
    badgeLabel: "Clock Tower II",
    targetHour: 4,
    targetMinute: 15,
    teachingPoints: [
      "Check the long minute hand first.",
      "Choose the hour.",
      "Choose o'clock, half past, quarter past, or quarter to.",
      "The clock hands move into place.",
    ],
  });
}

function buildMatchTask(index: number): PracticeTask {
  const clocks = MATCH_SEQUENCE[index % MATCH_SEQUENCE.length]!;
  const correctIndex = index % clocks.length;
  const correct = clocks[correctIndex]!;
  return buildChooseClockTask({
    prompt: `Tap the clock that shows ${timeLabel(correct.hour, correct.minute)}.`,
    badgeLabel: "Match the Time",
    clocks,
    correctIndex,
  });
}

export function generateY2MeasurelandsWeek6Lesson3Task(
  lessonId: string,
  _difficulty: Difficulty,
): PracticeTask {
  const state = getClockMemory(memory, lessonId);
  if (!state.introShown) {
    state.introShown = true;
    return buildIntro();
  }
  const index = state.cursor % 12;
  state.cursor += 1;
  if (index < 4) return buildReadClockTask({ ...READ_SEQUENCE[index]!, badgeLabel: "Read Any Time" });
  if (index < 7) return buildMatchTask(index - 4);
  return buildBuildClockTask({ ...BUILD_SEQUENCE[index - 7]!, badgeLabel: "Build Any Time" });
}

export function resetY2MeasurelandsWeek6Lesson3TaskSessionState() {
  memory.clear();
}

export function buildY2MeasurelandsWeek6Lesson3QuizTasks(): PracticeTask[] {
  return [
    buildReadClockTask({ ...READ_SEQUENCE[1]!, badgeLabel: "Build Any Time Quiz" }),
    buildReadClockTask({ ...READ_SEQUENCE[3]!, badgeLabel: "Build Any Time Quiz" }),
    buildMatchTask(1),
    buildBuildClockTask({ ...BUILD_SEQUENCE[2]!, badgeLabel: "Build Any Time Quiz" }),
    buildBuildClockTask({ ...BUILD_SEQUENCE[3]!, badgeLabel: "Build Any Time Quiz" }),
  ];
}
