import { makeMixedLesson } from "@/data/activities/prepMeasurelands/week8Shared";
import { buildMeasurelandsWeek1QuizTasks } from "@/data/activities/prepMeasurelands/week1Quiz";
import { buildMeasurelandsWeek2QuizTasks } from "@/data/activities/prepMeasurelands/week2Quiz";
import { buildMeasurelandsWeek3QuizTasks } from "@/data/activities/prepMeasurelands/week3Quiz";

// ── Measurelands · Week 8 · L1 — "Length, Mass and Capacity Challenge" ──
// Mixed review of Weeks 1-3 (compare / order / measure across the three size
// attributes). Reuses the existing week builders; no new art.

const lesson = makeMixedLesson({
  sources: [
    buildMeasurelandsWeek1QuizTasks,
    buildMeasurelandsWeek2QuizTasks,
    buildMeasurelandsWeek3QuizTasks,
  ],
  intro: {
    prompt: "The Length, Mass and Capacity Challenge!",
    speakText:
      "Professor Gauge says it's time for the Timewielder Trial! Show what you know about length, mass and capacity. Which is longer? Which is heavier? Which holds more?",
    badgeLabel: "Timewielder Trial",
    introBody: [
      "Time for the Measurement Challenge!",
      "Which is longer? Which is heavier?",
      "Which holds more?",
      "Show what you've learned!",
    ],
  },
  quiz: () => {
    const l = buildMeasurelandsWeek1QuizTasks();
    const m = buildMeasurelandsWeek2QuizTasks();
    const c = buildMeasurelandsWeek3QuizTasks();
    return [l[0]!, m[0]!, c[0]!, l[1]!, m[1]!];
  },
});

export const generatePrepMeasurelandsWeek8Lesson1Task = lesson.generate;
export const resetPrepMeasurelandsWeek8Lesson1TaskSessionState = lesson.reset;
export const buildMeasurelandsWeek8Lesson1QuizTasks = lesson.quiz;
