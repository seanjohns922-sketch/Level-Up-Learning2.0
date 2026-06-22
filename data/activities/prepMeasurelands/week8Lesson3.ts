import { makeMixedLesson } from "@/data/activities/prepMeasurelands/week8Shared";
import { buildMeasurelandsWeek3QuizTasks } from "@/data/activities/prepMeasurelands/week3Quiz";
import { buildMeasurelandsWeek4QuizTasks } from "@/data/activities/prepMeasurelands/week4Quiz";
import { buildMeasurelandsWeek5QuizTasks } from "@/data/activities/prepMeasurelands/week5Quiz";
import { buildMeasurelandsWeek7QuizTasks } from "@/data/activities/prepMeasurelands/week7Quiz";

// ── Measurelands · Week 8 · L3 — "Measurelands Adventure Challenge" ──
// The grand finale: combines calendar + day sequencing + measurement across the
// whole realm (capacity, duration, days, calendar). Reuses existing builders.

const lesson = makeMixedLesson({
  sources: [
    buildMeasurelandsWeek7QuizTasks, // today / yesterday / tomorrow
    buildMeasurelandsWeek5QuizTasks, // days of the week
    buildMeasurelandsWeek4QuizTasks, // duration
    buildMeasurelandsWeek3QuizTasks, // capacity
  ],
  intro: {
    prompt: "The Measurelands Adventure Challenge!",
    speakText:
      "Professor Gauge says this is the final challenge! Days, calendars, time and measurement — all together. You are a true Measurelands explorer. Let's finish strong!",
    badgeLabel: "Final Challenge",
    introBody: [
      "The final Measurelands challenge!",
      "Days, calendars, time and measurement.",
      "All the things you've learned, together.",
      "Let's finish strong, explorer!",
    ],
  },
  quiz: () => {
    const cal = buildMeasurelandsWeek7QuizTasks();
    const days = buildMeasurelandsWeek5QuizTasks();
    const dur = buildMeasurelandsWeek4QuizTasks();
    const cap = buildMeasurelandsWeek3QuizTasks();
    return [cal[0]!, days[0]!, dur[0]!, cap[0]!, cal[1]!];
  },
});

export const generatePrepMeasurelandsWeek8Lesson3Task = lesson.generate;
export const resetPrepMeasurelandsWeek8Lesson3TaskSessionState = lesson.reset;
export const buildMeasurelandsWeek8Lesson3QuizTasks = lesson.quiz;
