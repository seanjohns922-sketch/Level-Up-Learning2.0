import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { pickTime, readOptions, clockOptions, claimedTime, digital } from "@/data/activities/year3Measurelands/clockTimes";

type ClockTask = Extract<PracticeTask, { kind: "clockMinute" }>;

export function buildIntro(prompt: string, speakText: string): ClockTask {
  const { hour, minute } = pickTime(5);
  return { kind: "clockMinute", scene: "intro", prompt, speakText, badgeLabel: "Meazurex Mission", targetHour: hour, targetMinute: minute === 0 ? 10 : minute, feedback: { correct: "Let's read!", wrong: "Let's read!" } };
}

export function buildRead(step: number): ClockTask {
  const { hour, minute } = pickTime(step);
  return {
    kind: "clockMinute", scene: "read",
    prompt: "What time is it?",
    speakText: "Read the clock. Look at the minute hand first, then the hour hand.",
    badgeLabel: "Read the Clock",
    targetHour: hour, targetMinute: minute, minuteStep: step,
    options: readOptions(hour, minute, step), correctOption: digital(hour, minute),
    feedback: { correct: `Yes — it's ${digital(hour, minute)}.`, wrong: `Read the minute hand first — it's ${digital(hour, minute)}.` },
  };
}

export function buildMatchClock(step: number): ClockTask {
  const { hour, minute } = pickTime(step);
  const { options, correctId } = clockOptions(hour, minute, step);
  return {
    kind: "clockMinute", scene: "matchClock",
    prompt: `Which clock shows ${digital(hour, minute)}?`,
    speakText: `Which clock shows ${digital(hour, minute)}? Check both hands.`,
    badgeLabel: "Find the Clock",
    targetHour: hour, targetMinute: minute, minuteStep: step,
    askDigital: digital(hour, minute), clockOptions: options, correctClockId: correctId,
    feedback: { correct: `Yes — that clock shows ${digital(hour, minute)}.`, wrong: `Check both hands — find ${digital(hour, minute)}.` },
  };
}

export function buildSpotTime(step: number): ClockTask {
  const { hour, minute } = pickTime(step);
  const { claim, correct } = claimedTime(hour, minute);
  const real = digital(hour, minute);
  return {
    kind: "clockMinute", scene: "spotTime",
    prompt: "Is Professor Gauge right?",
    speakText: `Professor Gauge says the clock shows ${claim}. Is that right?`,
    badgeLabel: "Is That Right?",
    targetHour: hour, targetMinute: minute, minuteStep: step,
    claimedTime: claim,
    options: ["Yes, that's correct", "No, that's wrong"],
    correctOption: correct ? "Yes, that's correct" : "No, that's wrong",
    feedback: {
      correct: correct ? `Right — it really is ${real}.` : `Correct — it's actually ${real}, not ${claim}.`,
      wrong: correct ? `Look again — it is ${real}.` : `Look again — it's ${real}, not ${claim}.`,
    },
  };
}

export function buildBuild(step: number): ClockTask {
  const { hour, minute } = pickTime(step);
  return {
    kind: "clockMinute", scene: "build",
    prompt: "Build this time on the clock.",
    speakText: `Build ${digital(hour, minute)} using the hour and minute buttons.`,
    badgeLabel: "Build the Time",
    targetHour: hour, targetMinute: minute, minuteStep: step,
    feedback: { correct: "You built it — Time Master!", wrong: "Set both hands to match." },
  };
}
