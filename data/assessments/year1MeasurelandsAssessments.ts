import type { Question } from "@/data/assessments/posttests";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { buildY1MeasurelandsWeek1QuizTasks } from "@/data/activities/year1Measurelands/week1Quiz";
import { buildY1MeasurelandsWeek2QuizTasks } from "@/data/activities/year1Measurelands/week2Quiz";
import { buildY1MeasurelandsWeek3QuizTasks } from "@/data/activities/year1Measurelands/week3Quiz";
import { buildY1MeasurelandsWeek4QuizTasks } from "@/data/activities/year1Measurelands/week4Quiz";
import { buildY1MeasurelandsWeek5QuizTasks } from "@/data/activities/year1Measurelands/week5Quiz";
import { buildY1MeasurelandsWeek6QuizTasks } from "@/data/activities/year1Measurelands/week6Quiz";
import { buildY1MeasurelandsWeek7QuizTasks } from "@/data/activities/year1Measurelands/week7Quiz";
import {
  generateY1MeasurelandsWeek8Lesson1Task,
  resetY1MeasurelandsWeek8Lesson1TaskSessionState,
} from "@/data/activities/year1Measurelands/week8Lesson1";
import {
  generateY1MeasurelandsWeek8Lesson2Task,
  resetY1MeasurelandsWeek8Lesson2TaskSessionState,
} from "@/data/activities/year1Measurelands/week8Lesson2";
import {
  generateY1MeasurelandsWeek8Lesson3Task,
  resetY1MeasurelandsWeek8Lesson3TaskSessionState,
} from "@/data/activities/year1Measurelands/week8Lesson3";

const CORRECT_TOKEN = "__measurelands_task_correct__";

type AssessmentTaskSpec = {
  task: PracticeTask;
  week: number;
  lesson: number;
  skillId: string;
  skillLabel: string;
};

function createSeededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function withSeed<T>(seed: number, build: () => T): T {
  const originalRandom = Math.random;
  Math.random = createSeededRandom(seed);
  try {
    return build();
  } finally {
    Math.random = originalRandom;
  }
}

function selectTask(
  tasks: PracticeTask[],
  index: number,
  week: number,
  lesson: number,
  skillId: string,
  skillLabel: string,
): AssessmentTaskSpec {
  const task = tasks[index];
  if (!task) {
    throw new Error(`[Year1MeasurelandsAssessment] Missing Week ${week} task at index ${index}.`);
  }
  return { task, week, lesson, skillId, skillLabel };
}

function buildWeek8Tasks(mode: "pre" | "post"): AssessmentTaskSpec[] {
  resetY1MeasurelandsWeek8Lesson1TaskSessionState();
  resetY1MeasurelandsWeek8Lesson2TaskSessionState();
  resetY1MeasurelandsWeek8Lesson3TaskSessionState();

  const l1Id = `y1-measurement-${mode}-w8-l1`;
  const l2Id = `y1-measurement-${mode}-w8-l2`;
  const l3Id = `y1-measurement-${mode}-w8-l3`;

  // First call is each lesson's teaching scene. Subsequent calls are the same
  // interactive practice scenes students already use in Week 8.
  generateY1MeasurelandsWeek8Lesson1Task(l1Id, "easy");
  const firstRoutine = generateY1MeasurelandsWeek8Lesson1Task(l1Id, "easy");

  generateY1MeasurelandsWeek8Lesson2Task(l2Id, "easy");
  generateY1MeasurelandsWeek8Lesson2Task(l2Id, "easy");
  const buildDay = generateY1MeasurelandsWeek8Lesson2Task(l2Id, "medium");

  generateY1MeasurelandsWeek8Lesson3Task(l3Id, "easy");
  const firstStory = generateY1MeasurelandsWeek8Lesson3Task(l3Id, "easy");
  const buildStory = generateY1MeasurelandsWeek8Lesson3Task(l3Id, "medium");

  resetY1MeasurelandsWeek8Lesson1TaskSessionState();
  resetY1MeasurelandsWeek8Lesson2TaskSessionState();
  resetY1MeasurelandsWeek8Lesson3TaskSessionState();

  if (mode === "pre") {
    return [
      { task: firstRoutine, week: 8, lesson: 1, skillId: "routine_first", skillLabel: "Sequence Familiar Routines" },
      { task: firstStory, week: 8, lesson: 3, skillId: "event_sequence", skillLabel: "Sequence Events" },
    ];
  }

  return [
    { task: buildDay, week: 8, lesson: 2, skillId: "routine_sequence", skillLabel: "Build a Daily Sequence" },
    { task: buildStory, week: 8, lesson: 3, skillId: "event_sequence", skillLabel: "Sequence Events" },
  ];
}

function buildTaskSpecs(mode: "pre" | "post"): AssessmentTaskSpec[] {
  const weeks = [
    buildY1MeasurelandsWeek1QuizTasks(),
    buildY1MeasurelandsWeek2QuizTasks(),
    buildY1MeasurelandsWeek3QuizTasks(),
    buildY1MeasurelandsWeek4QuizTasks(),
    buildY1MeasurelandsWeek5QuizTasks(),
    buildY1MeasurelandsWeek6QuizTasks(),
    buildY1MeasurelandsWeek7QuizTasks(),
  ];

  if (mode === "pre") {
    return [
      selectTask(weeks[0]!, 0, 1, 1, "length_measure", "Measure Length with Equal Units"),
      selectTask(weeks[0]!, 5, 1, 2, "length_compare", "Compare Measured Lengths"),
      selectTask(weeks[0]!, 10, 1, 3, "length_fair_units", "Measure with No Gaps or Overlaps"),
      selectTask(weeks[1]!, 0, 2, 1, "mass_measure", "Measure Mass with Balance Cubes"),
      selectTask(weeks[1]!, 5, 2, 2, "mass_compare", "Compare Measured Mass"),
      selectTask(weeks[1]!, 10, 2, 3, "mass_fair_units", "Use Equal Mass Units"),
      selectTask(weeks[2]!, 0, 3, 1, "capacity_measure", "Measure Capacity with Cups"),
      selectTask(weeks[2]!, 5, 3, 2, "capacity_compare", "Compare Measured Capacity"),
      selectTask(weeks[2]!, 10, 3, 3, "capacity_units", "Choose Sensible Capacity Units"),
      selectTask(weeks[3]!, 0, 4, 1, "duration_units", "Recognise Hour, Day and Week"),
      selectTask(weeks[3]!, 5, 4, 2, "duration_compare", "Compare Durations"),
      selectTask(weeks[3]!, 10, 4, 3, "duration_sort", "Sort Activities by Duration"),
      selectTask(weeks[4]!, 0, 5, 1, "week_cycle", "Recognise Seven Days in a Week"),
      selectTask(weeks[4]!, 5, 5, 2, "month_structure", "Connect Weeks and Months"),
      selectTask(weeks[5]!, 0, 6, 1, "calendar_dates", "Find Dates on a Calendar"),
      selectTask(weeks[5]!, 5, 6, 2, "calendar_navigation", "Navigate Calendar Dates"),
      selectTask(weeks[6]!, 0, 7, 1, "yesterday", "Recognise Yesterday"),
      selectTask(weeks[6]!, 10, 7, 3, "tomorrow_sequence", "Predict What Happens Tomorrow"),
      ...buildWeek8Tasks("pre"),
    ];
  }

  return [
    selectTask(weeks[0]!, 4, 1, 1, "length_measure", "Measure Length with Equal Units"),
    selectTask(weeks[0]!, 7, 1, 2, "length_order", "Order Measured Lengths"),
    selectTask(weeks[0]!, 12, 1, 3, "length_fair_units", "Diagnose Gaps and Overlaps"),
    selectTask(weeks[1]!, 2, 2, 1, "mass_measure", "Read a Balance-Cube Measurement"),
    selectTask(weeks[1]!, 7, 2, 2, "mass_order", "Order Measured Masses"),
    selectTask(weeks[1]!, 12, 2, 3, "mass_fair_units", "Judge Fair Mass Measurement"),
    selectTask(weeks[2]!, 2, 3, 1, "capacity_measure", "Read a Cup Measurement"),
    selectTask(weeks[2]!, 7, 3, 2, "capacity_order", "Order Measured Capacities"),
    selectTask(weeks[2]!, 12, 3, 3, "capacity_units", "Fix an Unsuitable Capacity Unit"),
    selectTask(weeks[3]!, 4, 4, 1, "duration_order", "Order Hour, Day and Week Activities"),
    selectTask(weeks[3]!, 9, 4, 2, "duration_sequence", "Order Duration Measurements"),
    selectTask(weeks[3]!, 13, 4, 3, "duration_sort", "Sort Activities by Duration"),
    selectTask(weeks[4]!, 4, 5, 1, "week_cycle", "Complete a Week Sequence"),
    selectTask(weeks[4]!, 12, 5, 3, "month_sequence", "Complete a Month Sequence"),
    selectTask(weeks[5]!, 2, 6, 1, "calendar_dates", "Read a Date on a Calendar"),
    selectTask(weeks[5]!, 12, 6, 3, "calendar_events", "Compare Calendar Events"),
    selectTask(weeks[6]!, 3, 7, 1, "yesterday_sequence", "Build a Yesterday Sequence"),
    selectTask(weeks[6]!, 12, 7, 3, "tomorrow_sequence", "Predict What Happens Tomorrow"),
    ...buildWeek8Tasks("post"),
  ];
}

function toQuestion(spec: AssessmentTaskSpec, index: number, mode: "pre" | "post"): Question {
  const number = String(index + 1).padStart(2, "0");
  return {
    id: `y1-measurement-${mode}-${number}`,
    type: "measurelandsTask",
    prompt: "prompt" in spec.task ? String(spec.task.prompt) : spec.skillLabel,
    correctAnswer: CORRECT_TOKEN,
    answer: CORRECT_TOKEN,
    practiceTask: spec.task,
    skillId: spec.skillId,
    skillLabel: spec.skillLabel,
    linkedWeeks: [spec.week],
    linkedLessons: [spec.lesson],
    strand: "Measurement",
    difficultyBand: `year1-measurement-${mode}`,
  };
}

function buildQuestions(mode: "pre" | "post", seed: number): Question[] {
  return withSeed(seed, () => {
    const specs = buildTaskSpecs(mode);
    if (specs.length !== 20) {
      throw new Error(`[Year1MeasurelandsAssessment] Expected 20 ${mode} tasks, received ${specs.length}.`);
    }
    return specs.map((spec, index) => toQuestion(spec, index, mode));
  });
}

export const YEAR1_MEASURELANDS_PRETEST = buildQuestions("pre", 0x59315052);
export const YEAR1_MEASURELANDS_POSTTEST = buildQuestions("post", 0x59315054);
