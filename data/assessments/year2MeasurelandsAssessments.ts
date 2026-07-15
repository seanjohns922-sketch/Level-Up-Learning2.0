import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { buildY2MeasurelandsWeek1QuizTasks } from "@/data/activities/year2Measurelands/week1Quiz";
import { buildY2MeasurelandsWeek2QuizTasks } from "@/data/activities/year2Measurelands/week2Quiz";
import { buildY2MeasurelandsWeek3QuizTasks } from "@/data/activities/year2Measurelands/week3Quiz";
import { buildY2MeasurelandsWeek4Lesson1QuizTasks } from "@/data/activities/year2Measurelands/week4Lesson1";
import { buildY2MeasurelandsWeek4Lesson2QuizTasks } from "@/data/activities/year2Measurelands/week4Lesson2";
import { buildY2MeasurelandsWeek4Lesson3QuizTasks } from "@/data/activities/year2Measurelands/week4Lesson3";
import { buildY2MeasurelandsWeek5QuizTasks } from "@/data/activities/year2Measurelands/week5Quiz";
import { buildY2MeasurelandsWeek6QuizTasks } from "@/data/activities/year2Measurelands/week6Quiz";
import { buildY2MeasurelandsWeek7QuizTasks } from "@/data/activities/year2Measurelands/week7Quiz";
import {
  generateY2MeasurelandsWeek8Lesson1Task,
  resetY2MeasurelandsWeek8Lesson1TaskSessionState,
} from "@/data/activities/year2Measurelands/week8Lesson1";
import {
  generateY2MeasurelandsWeek8Lesson2Task,
  resetY2MeasurelandsWeek8Lesson2TaskSessionState,
} from "@/data/activities/year2Measurelands/week8Lesson2";
import {
  generateY2MeasurelandsWeek8Lesson3Task,
  resetY2MeasurelandsWeek8Lesson3TaskSessionState,
} from "@/data/activities/year2Measurelands/week8Lesson3";
import type { Question } from "@/data/assessments/posttests";

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
    throw new Error(`[Year2MeasurelandsAssessment] Missing Week ${week} task at index ${index}.`);
  }
  const assessmentTask =
    task.kind === "analogClock" && task.scene === "build"
      ? { ...task, assessmentMode: true }
      : task;
  return { task: assessmentTask, week, lesson, skillId, skillLabel };
}

function buildWeek4Tasks(): PracticeTask[] {
  return [
    ...buildY2MeasurelandsWeek4Lesson1QuizTasks(),
    ...buildY2MeasurelandsWeek4Lesson2QuizTasks(),
    ...buildY2MeasurelandsWeek4Lesson3QuizTasks(),
  ];
}

function buildWeek8Tasks(mode: "pre" | "post"): AssessmentTaskSpec[] {
  resetY2MeasurelandsWeek8Lesson1TaskSessionState();
  resetY2MeasurelandsWeek8Lesson2TaskSessionState();
  resetY2MeasurelandsWeek8Lesson3TaskSessionState();

  const l1Id = `y2-measurement-${mode}-w8-l1`;
  const l2Id = `y2-measurement-${mode}-w8-l2`;
  const l3Id = `y2-measurement-${mode}-w8-l3`;

  // Consume each teaching scene, then use only interactions already practised
  // in the Level 2 capstone lessons.
  generateY2MeasurelandsWeek8Lesson1Task(l1Id, "easy");
  const identifySkill = generateY2MeasurelandsWeek8Lesson1Task(l1Id, "easy");

  generateY2MeasurelandsWeek8Lesson2Task(l2Id, "easy");
  const chooseStrategy = generateY2MeasurelandsWeek8Lesson2Task(l2Id, "easy");

  generateY2MeasurelandsWeek8Lesson3Task(l3Id, "easy");
  const lengthGate = generateY2MeasurelandsWeek8Lesson3Task(l3Id, "medium");
  const timeTower = generateY2MeasurelandsWeek8Lesson3Task(l3Id, "medium");

  resetY2MeasurelandsWeek8Lesson1TaskSessionState();
  resetY2MeasurelandsWeek8Lesson2TaskSessionState();
  resetY2MeasurelandsWeek8Lesson3TaskSessionState();

  if (mode === "pre") {
    return [
      { task: identifySkill, week: 8, lesson: 1, skillId: "measurement_skill", skillLabel: "Identify a Measurement Skill" },
      { task: chooseStrategy, week: 8, lesson: 2, skillId: "measurement_strategy", skillLabel: "Choose a Measurement Strategy" },
    ];
  }

  return [
    { task: lengthGate, week: 8, lesson: 3, skillId: "measurement_mission", skillLabel: "Solve a Length Mission" },
    { task: timeTower, week: 8, lesson: 3, skillId: "measurement_mission", skillLabel: "Solve a Time Mission" },
  ];
}

function buildTaskSpecs(mode: "pre" | "post"): AssessmentTaskSpec[] {
  const weeks = [
    buildY2MeasurelandsWeek1QuizTasks(),
    buildY2MeasurelandsWeek2QuizTasks(),
    buildY2MeasurelandsWeek3QuizTasks(),
    buildWeek4Tasks(),
    buildY2MeasurelandsWeek5QuizTasks(),
    buildY2MeasurelandsWeek6QuizTasks(),
    buildY2MeasurelandsWeek7QuizTasks(),
  ];

  if (mode === "pre") {
    return [
      selectTask(weeks[0]!, 0, 1, 1, "length_difference", "Compare Measured Lengths"),
      selectTask(weeks[0]!, 5, 1, 2, "length_order", "Order Measured Lengths"),
      selectTask(weeks[0]!, 10, 1, 3, "length_tool", "Choose a Length Tool"),
      selectTask(weeks[1]!, 0, 2, 1, "mass_measure", "Read an Informal Mass Measurement"),
      selectTask(weeks[1]!, 5, 2, 2, "mass_compare", "Compare Measured Masses"),
      selectTask(weeks[1]!, 10, 2, 3, "mass_reasoning", "Reason About Mass"),
      selectTask(weeks[2]!, 0, 3, 1, "capacity_measure", "Read a Capacity Measurement"),
      selectTask(weeks[2]!, 5, 3, 2, "capacity_order", "Order Measured Capacities"),
      selectTask(weeks[2]!, 10, 3, 3, "capacity_unit", "Choose a Capacity Unit"),
      selectTask(weeks[3]!, 0, 4, 1, "measurement_accuracy", "Recognise Accurate Measurement"),
      selectTask(weeks[3]!, 5, 4, 2, "measurement_accuracy", "Measure More Accurately"),
      selectTask(weeks[3]!, 11, 4, 3, "informal_units", "Measure with an Informal Unit"),
      selectTask(weeks[4]!, 0, 5, 1, "clock_oclock", "Read O'Clock Time"),
      selectTask(weeks[4]!, 5, 5, 2, "clock_half_past", "Read Half-Past Time"),
      selectTask(weeks[5]!, 0, 6, 1, "clock_quarter_past", "Read Quarter-Past Time"),
      selectTask(weeks[5]!, 5, 6, 2, "clock_quarter_to", "Read Quarter-To Time"),
      selectTask(weeks[6]!, 0, 7, 1, "calendar_read", "Read a Calendar"),
      selectTask(weeks[6]!, 5, 7, 2, "calendar_count", "Count Days to an Event"),
      ...buildWeek8Tasks("pre"),
    ];
  }

  return [
    selectTask(weeks[0]!, 4, 1, 1, "length_difference", "Find a Length Difference"),
    selectTask(weeks[0]!, 9, 1, 2, "length_order", "Order Measured Lengths"),
    selectTask(weeks[0]!, 13, 1, 3, "length_tool", "Choose a Length Tool"),
    selectTask(weeks[1]!, 4, 2, 1, "mass_measure", "Read an Informal Mass Measurement"),
    selectTask(weeks[1]!, 9, 2, 2, "mass_difference", "Compare Measured Masses"),
    selectTask(weeks[1]!, 14, 2, 3, "mass_reasoning", "Predict and Check Mass"),
    selectTask(weeks[2]!, 4, 3, 1, "capacity_measure", "Read a Capacity Measurement"),
    selectTask(weeks[2]!, 9, 3, 2, "capacity_equivalence", "Compare and Match Capacities"),
    selectTask(weeks[2]!, 14, 3, 3, "capacity_unit", "Justify a Capacity Unit"),
    selectTask(weeks[3]!, 4, 4, 1, "measurement_accuracy", "Choose an Accurate Measurement"),
    selectTask(weeks[3]!, 9, 4, 2, "measurement_accuracy", "Measure More Accurately"),
    selectTask(weeks[3]!, 13, 4, 3, "informal_units", "Measure with an Informal Unit"),
    selectTask(weeks[4]!, 4, 5, 1, "clock_oclock", "Read O'Clock Time"),
    selectTask(weeks[4]!, 9, 5, 2, "clock_half_past", "Read Half-Past Time"),
    selectTask(weeks[5]!, 4, 6, 1, "clock_quarter_past", "Build Quarter-Past Time"),
    selectTask(weeks[5]!, 9, 6, 2, "clock_quarter_to", "Reason About Quarter-To Time"),
    selectTask(weeks[6]!, 9, 7, 2, "calendar_count", "Count Days to an Event"),
    selectTask(weeks[6]!, 14, 7, 3, "calendar_problem", "Solve a Calendar Problem"),
    ...buildWeek8Tasks("post"),
  ];
}

function toQuestion(spec: AssessmentTaskSpec, index: number, mode: "pre" | "post"): Question {
  const number = String(index + 1).padStart(2, "0");
  return {
    id: `y2-measurement-${mode}-${number}`,
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
    difficultyBand: `year2-measurement-${mode}`,
  };
}

function buildQuestions(mode: "pre" | "post", seed: number): Question[] {
  return withSeed(seed, () => {
    const specs = buildTaskSpecs(mode);
    if (specs.length !== 20) {
      throw new Error(`[Year2MeasurelandsAssessment] Expected 20 ${mode} tasks, received ${specs.length}.`);
    }
    return specs.map((spec, index) => toQuestion(spec, index, mode));
  });
}

export const YEAR2_MEASURELANDS_PRETEST = buildQuestions("pre", 0x59325052);
export const YEAR2_MEASURELANDS_POSTTEST = buildQuestions("post", 0x59325054);
