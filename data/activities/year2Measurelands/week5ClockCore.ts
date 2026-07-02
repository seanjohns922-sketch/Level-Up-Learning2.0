import type { PracticeTask } from "@/data/activities/year1/practice-task";

export type ClockMinute = 0 | 15 | 30 | 45;
export type ClockTask = Extract<PracticeTask, { kind: "analogClock" }>;

export type ClockSpec = {
  hour: number;
  minute: ClockMinute;
  prompt?: string;
  badgeLabel?: string;
  showDigital?: boolean;
  speakText?: string;
};

export function normalizeHour(hour: number) {
  const normalized = ((Math.round(hour) - 1) % 12) + 1;
  return normalized <= 0 ? normalized + 12 : normalized;
}

export function timeLabel(hour: number, minute: ClockMinute) {
  const h = normalizeHour(hour);
  if (minute === 0) return `${h} o'clock`;
  if (minute === 30) return `Half past ${h}`;
  if (minute === 15) return `Quarter past ${h}`;
  return `Quarter to ${normalizeHour(h + 1)}`;
}

export function displayHourForTime(hour: number, minute: ClockMinute) {
  return minute === 45 ? normalizeHour(hour + 1) : normalizeHour(hour);
}

export function internalHourForDisplay(displayHour: number, minute: ClockMinute) {
  return minute === 45 ? normalizeHour(displayHour - 1) : normalizeHour(displayHour);
}

function option(id: string, hour: number, minute: ClockMinute) {
  return { id, label: timeLabel(hour, minute), hour: normalizeHour(hour), minute };
}

function distractorHours(targetHour: number) {
  const h = normalizeHour(targetHour);
  return [normalizeHour(h + 1), normalizeHour(h - 1)];
}

export function buildReadClockTask(spec: ClockSpec): ClockTask {
  const [nextHour, prevHour] = distractorHours(spec.hour);
  const correct = option("correct", spec.hour, spec.minute);
  let options: ClockTask["options"];
  if (spec.minute === 0) {
    options = [correct, option("next-hour", nextHour, 0), option("prev-hour", prevHour, 0)];
  } else if (spec.minute === 15) {
    options = [correct, option("half-past", spec.hour, 30), option("oclock", spec.hour, 0)];
  } else if (spec.minute === 45) {
    options = [
      correct,
      option("quarter-past-next", displayHourForTime(spec.hour, spec.minute), 15),
      option("half-past-next", displayHourForTime(spec.hour, spec.minute), 30),
    ];
  } else {
    options = [correct, option("wrong-minute", spec.hour, 0), option("next-hour", nextHour, 30)];
  }

  return {
    kind: "analogClock",
    scene: "read",
    mode: "read",
    granularity: spec.minute === 0 ? "hour" : spec.minute === 30 ? "halfHour" : "quarterHour",
    targetHour: normalizeHour(spec.hour),
    targetMinute: spec.minute,
    prompt: spec.prompt ?? "What time does the clock show?",
    speakText: spec.speakText ?? spec.prompt ?? "What time does the clock show?",
    badgeLabel: spec.badgeLabel ?? "Read the Clock",
    options,
    correctOptionId: correct.id,
    showDigital: spec.showDigital,
    feedback: {
      correct: `Yes — the clock shows ${correct.label}.`,
      wrong: `Correct answer: ${correct.label}. Look at the minute hand first, then the hour hand.`,
    },
  };
}

export function buildBuildClockTask(spec: ClockSpec): ClockTask {
  const label = timeLabel(spec.hour, spec.minute);
  return {
    kind: "analogClock",
    scene: "build",
    mode: "build",
    granularity: spec.minute === 0 || spec.minute === 30 ? "halfHour" : "quarterHour",
    targetHour: normalizeHour(spec.hour),
    targetMinute: spec.minute,
    prompt: spec.prompt ?? `Build ${label}.`,
    speakText: spec.speakText ?? spec.prompt ?? `Build ${label}. Choose the hour, then choose the minute hand position.`,
    badgeLabel: spec.badgeLabel ?? "Build the Time",
    feedback: {
      correct: `Yes — you built ${label}.`,
      wrong: `Correct answer: ${label}. Choose the hour, then choose the matching minute hand position.`,
    },
  };
}

export function buildChooseClockTask({
  prompt,
  speakText,
  badgeLabel,
  clocks,
  correctIndex,
}: {
  prompt: string;
  speakText?: string;
  badgeLabel: string;
  clocks: ClockSpec[];
  correctIndex: number;
}): ClockTask {
  const correct = clocks[correctIndex]!;
  return {
    kind: "analogClock",
    scene: "chooseClock",
    mode: "read",
    granularity: "quarterHour",
    targetHour: normalizeHour(correct.hour),
    targetMinute: correct.minute,
    prompt,
    speakText: speakText ?? prompt,
    badgeLabel,
    options: clocks.map((clock, index) => ({
      id: index === correctIndex ? "correct" : `clock-${index + 1}`,
      label: timeLabel(clock.hour, clock.minute),
      hour: normalizeHour(clock.hour),
      minute: clock.minute,
    })),
    correctOptionId: "correct",
    feedback: {
      correct: `Yes — that clock shows ${timeLabel(correct.hour, correct.minute)}.`,
      wrong: `Correct answer: ${timeLabel(correct.hour, correct.minute)}. Check the long minute hand first.`,
    },
  };
}

export function buildClockIntroTask({
  prompt,
  speakText,
  targetHour,
  targetMinute,
  teachingPoints,
  teachingSteps,
  badgeLabel,
}: {
  prompt: string;
  speakText: string;
  targetHour: number;
  targetMinute: ClockMinute;
  teachingPoints: string[];
  teachingSteps?: ClockTask["teachingSteps"];
  badgeLabel: string;
}): ClockTask {
  return {
    kind: "analogClock",
    scene: "intro",
    mode: "read",
    granularity: targetMinute === 0 ? "hour" : "halfHour",
    targetHour: normalizeHour(targetHour),
    targetMinute,
    prompt,
    speakText,
    badgeLabel,
    teachingPoints,
    teachingSteps,
    feedback: { correct: "Let's read the clock!", wrong: "Let's get ready." },
  };
}

export type ClockMemory = { introShown: boolean; cursor: number };

export function getClockMemory(store: Map<string, ClockMemory>, lessonId: string): ClockMemory {
  const existing = store.get(lessonId);
  if (existing) return existing;
  const created = { introShown: false, cursor: 0 };
  store.set(lessonId, created);
  return created;
}
