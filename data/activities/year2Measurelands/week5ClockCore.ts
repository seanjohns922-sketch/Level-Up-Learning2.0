import type { PracticeTask } from "@/data/activities/year1/practice-task";

export type ClockMinute = 0 | 15 | 30 | 45;
export type ClockTask = Extract<PracticeTask, { kind: "analogClock" }>;

export type ClockSpec = {
  hour: number;
  minute: ClockMinute;
  prompt?: string;
  badgeLabel?: string;
  showDigital?: boolean;
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
  const options =
    spec.minute === 0
      ? [
          correct,
          option("next-hour", nextHour, 0),
          option("prev-hour", prevHour, 0),
        ]
      : [
          correct,
          option("wrong-minute", spec.hour, 0),
          option("next-half", nextHour, 30),
        ];

  return {
    kind: "analogClock",
    scene: "read",
    mode: "read",
    granularity: spec.minute === 0 ? "hour" : "halfHour",
    targetHour: normalizeHour(spec.hour),
    targetMinute: spec.minute,
    prompt: spec.prompt ?? "What time does the clock show?",
    speakText: spec.prompt ?? "What time does the clock show?",
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
    granularity: "halfHour",
    targetHour: normalizeHour(spec.hour),
    targetMinute: spec.minute,
    prompt: spec.prompt ?? `Build ${label}.`,
    speakText: spec.prompt ?? `Build ${label}. Choose the hour, then choose o'clock or half past.`,
    badgeLabel: spec.badgeLabel ?? "Build the Time",
    feedback: {
      correct: `Yes — you built ${label}.`,
      wrong: `Correct answer: ${label}. Choose the hour, then choose ${spec.minute === 0 ? "o'clock" : "half past"}.`,
    },
  };
}

export function buildClockIntroTask({
  prompt,
  speakText,
  targetHour,
  targetMinute,
  teachingPoints,
  badgeLabel,
}: {
  prompt: string;
  speakText: string;
  targetHour: number;
  targetMinute: ClockMinute;
  teachingPoints: string[];
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
