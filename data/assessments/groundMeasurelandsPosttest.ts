import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { Question } from "./posttests";
import { buildMeasurelandsWeek1QuizTasks } from "@/data/activities/prepMeasurelands/week1Quiz";
import { buildMeasurelandsWeek2QuizTasks } from "@/data/activities/prepMeasurelands/week2Quiz";
import { buildMeasurelandsWeek3QuizTasks } from "@/data/activities/prepMeasurelands/week3Quiz";
import { buildMeasurelandsWeek4QuizTasks } from "@/data/activities/prepMeasurelands/week4Quiz";
import { buildMeasurelandsWeek5QuizTasks } from "@/data/activities/prepMeasurelands/week5Quiz";
import { buildMeasurelandsWeek6QuizTasks } from "@/data/activities/prepMeasurelands/week6Quiz";
import { buildMeasurelandsWeek7QuizTasks } from "@/data/activities/prepMeasurelands/week7Quiz";
import { buildMeasurelandsWeek8QuizTasks } from "@/data/activities/prepMeasurelands/week8Quiz";

const CORRECT_TOKEN = "__measurelands_task_correct__";
const ASSESSMENT_SEED = 0x4d454153;

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function buildStableTasks(build: () => PracticeTask[], week: number): PracticeTask[] {
  const originalRandom = Math.random;
  Math.random = createSeededRandom(ASSESSMENT_SEED + week);
  try {
    return build();
  } finally {
    Math.random = originalRandom;
  }
}

type TaskSelection = {
  week: number;
  skillId: string;
  skillLabel: string;
  build: () => PracticeTask[];
  indices: number[];
};

// Three tasks from each core comparison week and two from each time/application
// week preserve the existing 20-question assessment standard.
const TASK_SELECTIONS: TaskSelection[] = [
  { week: 1, skillId: "length", skillLabel: "Length", build: buildMeasurelandsWeek1QuizTasks, indices: [0, 5, 10] },
  { week: 2, skillId: "mass", skillLabel: "Mass", build: buildMeasurelandsWeek2QuizTasks, indices: [0, 2, 10] },
  { week: 3, skillId: "capacity", skillLabel: "Capacity", build: buildMeasurelandsWeek3QuizTasks, indices: [0, 5, 10] },
  { week: 4, skillId: "duration", skillLabel: "Duration", build: buildMeasurelandsWeek4QuizTasks, indices: [0, 5, 10] },
  { week: 5, skillId: "days", skillLabel: "Days of the Week", build: buildMeasurelandsWeek5QuizTasks, indices: [0, 5] },
  { week: 6, skillId: "time_of_day", skillLabel: "Time of Day", build: buildMeasurelandsWeek6QuizTasks, indices: [0, 10] },
  { week: 7, skillId: "calendar", skillLabel: "Calendar Language", build: buildMeasurelandsWeek7QuizTasks, indices: [0, 5] },
  { week: 8, skillId: "sequence", skillLabel: "Measurement Application", build: buildMeasurelandsWeek8QuizTasks, indices: [0, 10] },
];

export function buildGroundMeasurelandsPosttestQuestions(): Question[] {
  let questionNumber = 0;

  return TASK_SELECTIONS.flatMap(({ week, skillId, skillLabel, build, indices }) => {
    // Weekly quiz builders randomise lesson content. A fixed seed keeps each
    // assessment ID tied to the same task across refresh and save/resume.
    const tasks = buildStableTasks(build, week);
    return indices.map((taskIndex) => {
      const practiceTask = tasks[taskIndex];
      if (!practiceTask) {
        throw new Error(`Ground Measurelands post-test is missing Week ${week} task ${taskIndex}.`);
      }

      questionNumber += 1;
      const prompt = "prompt" in practiceTask ? practiceTask.prompt : skillLabel;
      return {
        id: `y0-measurement-pt-${String(questionNumber).padStart(2, "0")}`,
        type: "measurelandsTask",
        prompt,
        correctAnswer: CORRECT_TOKEN,
        answer: CORRECT_TOKEN,
        skillId,
        skillLabel,
        linkedWeeks: [week],
        linkedLessons: [1, 2, 3],
        strand: "Measurement",
        difficultyBand: "prep-measurement",
        practiceTask,
      } satisfies Question;
    });
  });
}

export const GROUND_MEASURELANDS_CORRECT_TOKEN = CORRECT_TOKEN;
