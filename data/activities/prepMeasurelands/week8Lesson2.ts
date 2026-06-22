import { makeMixedLesson } from "@/data/activities/prepMeasurelands/week8Shared";
import { buildMeasurelandsWeek4QuizTasks } from "@/data/activities/prepMeasurelands/week4Quiz";
import { buildMeasurelandsWeek6QuizTasks } from "@/data/activities/prepMeasurelands/week6Quiz";

// ── Measurelands · Week 8 · L2 — "Duration and Time Challenge" ──
// Mixed review of Week 4 (duration) and Week 6 (time of day + routine).
// Reuses the existing week builders; no new art.

const lesson = makeMixedLesson({
  sources: [buildMeasurelandsWeek4QuizTasks, buildMeasurelandsWeek6QuizTasks],
  intro: {
    prompt: "The Duration and Time Challenge!",
    speakText:
      "Professor Gauge says keep going! Show what you know about how long things take, and the times of the day. Which takes longer? When does this happen?",
    badgeLabel: "Timewielder Trial",
    introBody: [
      "Time for the Time Challenge!",
      "Which takes longer? Quick or slow?",
      "When does this happen — morning or night?",
      "Show what you've learned!",
    ],
  },
  quiz: () => {
    const d = buildMeasurelandsWeek4QuizTasks();
    const t = buildMeasurelandsWeek6QuizTasks();
    return [d[0]!, t[0]!, d[1]!, t[1]!, d[2]!];
  },
});

export const generatePrepMeasurelandsWeek8Lesson2Task = lesson.generate;
export const resetPrepMeasurelandsWeek8Lesson2TaskSessionState = lesson.reset;
export const buildMeasurelandsWeek8Lesson2QuizTasks = lesson.quiz;
