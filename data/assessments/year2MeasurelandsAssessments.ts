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
      selectTask(weeks[1]!, 0, 2, 1, "mass_measure", "Read an Informal Mass Measurement"),
      selectTask(weeks[2]!, 0, 3, 1, "capacity_measure", "Read a Capacity Measurement"),
      selectTask(weeks[3]!, 0, 4, 1, "measurement_accuracy", "Recognise Accurate Measurement"),
      selectTask(weeks[3]!, 5, 4, 2, "measurement_accuracy", "Measure More Accurately"),
      selectTask(weeks[3]!, 11, 4, 3, "informal_units", "Measure with an Informal Unit"),
      selectTask(weeks[4]!, 10, 5, 3, "fraction_half", "Recognise One Half"),
      selectTask(weeks[4]!, 11, 5, 3, "fraction_quarter", "Recognise One Quarter"),
      selectTask(weeks[4]!, 12, 5, 3, "fraction_eighth", "Recognise One Eighth"),
      selectTask(weeks[4]!, 0, 5, 1, "clock_oclock", "Read O'Clock Time"),
      selectTask(weeks[4]!, 5, 5, 2, "clock_half_past", "Read Half-Past Time"),
      selectTask(weeks[5]!, 0, 6, 1, "clock_quarter_past", "Read Quarter-Past Time"),
      selectTask(weeks[5]!, 5, 6, 2, "clock_quarter_to", "Read Quarter-To Time"),
      selectTask(weeks[6]!, 0, 7, 1, "calendar_read", "Read a Calendar"),
      selectTask(weeks[6]!, 5, 7, 2, "calendar_count", "Count Days to an Event"),
      selectTask(weeks[6]!, 10, 7, 3, "calendar_problem", "Solve a Calendar Problem"),
      selectTask(weeks[6]!, 14, 7, 3, "calendar_problem", "Reason About Calendar Days"),
      selectTask(weeks[5]!, 10, 6, 3, "quarter_turn", "Recognise a Quarter Turn"),
      selectTask(weeks[5]!, 11, 6, 3, "half_turn", "Recognise a Half Turn"),
      selectTask(weeks[5]!, 12, 6, 3, "three_quarter_turn", "Recognise a Three-Quarter Turn"),
    ];
  }

  return [
    selectTask(weeks[0]!, 4, 1, 1, "length_difference", "Find a Length Difference"),
    selectTask(weeks[1]!, 4, 2, 1, "mass_measure", "Read an Informal Mass Measurement"),
    selectTask(weeks[2]!, 4, 3, 1, "capacity_measure", "Read a Capacity Measurement"),
    selectTask(weeks[3]!, 4, 4, 1, "measurement_accuracy", "Choose an Accurate Measurement"),
    selectTask(weeks[3]!, 9, 4, 2, "measurement_accuracy", "Measure More Accurately"),
    selectTask(weeks[3]!, 13, 4, 3, "informal_units", "Measure with an Informal Unit"),
    selectTask(weeks[4]!, 10, 5, 3, "fraction_half", "Reason About Equal Halves"),
    selectTask(weeks[4]!, 11, 5, 3, "fraction_quarter", "Reason About Equal Quarters"),
    selectTask(weeks[4]!, 12, 5, 3, "fraction_eighth", "Reason About Equal Eighths"),
    selectTask(weeks[4]!, 4, 5, 1, "clock_oclock", "Read O'Clock Time"),
    selectTask(weeks[4]!, 9, 5, 2, "clock_half_past", "Read Half-Past Time"),
    selectTask(weeks[5]!, 4, 6, 1, "clock_quarter_past", "Build Quarter-Past Time"),
    selectTask(weeks[5]!, 9, 6, 2, "clock_quarter_to", "Reason About Quarter-To Time"),
    selectTask(weeks[6]!, 0, 7, 1, "calendar_read", "Read a Calendar"),
    selectTask(weeks[6]!, 9, 7, 2, "calendar_count", "Count Days to an Event"),
    selectTask(weeks[6]!, 10, 7, 3, "calendar_problem", "Solve a Calendar Problem"),
    selectTask(weeks[6]!, 14, 7, 3, "calendar_problem", "Solve a Calendar Problem"),
    selectTask(weeks[5]!, 12, 6, 3, "three_quarter_turn", "Apply a Three-Quarter Turn"),
    selectTask(weeks[5]!, 13, 6, 3, "full_turn", "Apply a Full Turn"),
    selectTask(weeks[5]!, 14, 6, 3, "quarter_turn", "Track a Quarter Turn"),
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
