import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { getY5MeasurelandsLessonQuizContribution } from "@/data/activities/year5Measurelands/registry";
import type { Question } from "@/data/assessments/posttests";

const CORRECT_TOKEN = "__measurelands_task_correct__";

type AssessmentTaskSpec = {
  task: PracticeTask;
  week: number;
  lesson: number;
  linkedWeeks?: number[];
  skillId: string;
  skillLabel: string;
};

type TaskSelection = Omit<AssessmentTaskSpec, "task"> & {
  index: number;
};

// The pre-test samples the entry skill from every taught Level 5 content area.
const PRETEST_SELECTIONS: TaskSelection[] = [
  { week: 1, lesson: 1, index: 0, skillId: "choose_metric_unit", skillLabel: "Choose an Appropriate Metric Unit" },
  { week: 1, lesson: 2, index: 0, skillId: "measurement_accuracy", skillLabel: "Choose Units for Accuracy" },
  { week: 2, lesson: 1, index: 0, skillId: "read_decimal_length", skillLabel: "Read a Decimal Length" },
  { week: 2, lesson: 2, index: 0, skillId: "read_decimal_mass_capacity", skillLabel: "Read Decimal Mass and Capacity" },
  { week: 2, lesson: 3, index: 0, skillId: "compare_decimal_measure", skillLabel: "Compare Decimal Measurements" },
  { week: 3, lesson: 1, index: 0, skillId: "efficient_perimeter", skillLabel: "Calculate Perimeter Efficiently" },
  { week: 3, lesson: 2, index: 0, skillId: "irregular_perimeter", skillLabel: "Find an Irregular Perimeter" },
  {
    week: 3,
    lesson: 3,
    index: 0,
    linkedWeeks: [3, 8],
    skillId: "perimeter_problem",
    skillLabel: "Solve a Perimeter Problem",
  },
  { week: 4, lesson: 1, index: 0, skillId: "rectangle_area", skillLabel: "Calculate Rectangle Area" },
  { week: 4, lesson: 2, index: 0, skillId: "irregular_area", skillLabel: "Find an Irregular Area" },
  {
    week: 4,
    lesson: 3,
    index: 0,
    linkedWeeks: [4, 8],
    skillId: "area_design",
    skillLabel: "Solve an Area Design Problem",
  },
  { week: 5, lesson: 1, index: 0, skillId: "area_or_perimeter", skillLabel: "Choose Area or Perimeter" },
  { week: 5, lesson: 2, index: 0, skillId: "same_area_perimeter", skillLabel: "Reason About Area and Perimeter" },
  {
    week: 5,
    lesson: 3,
    index: 0,
    linkedWeeks: [5, 8],
    skillId: "garden_design",
    skillLabel: "Apply Area and Perimeter",
  },
  { week: 6, lesson: 1, index: 0, skillId: "time_24_hour", skillLabel: "Read and Convert 24-Hour Time" },
  { week: 6, lesson: 2, index: 0, skillId: "timetable", skillLabel: "Read a Timetable" },
  {
    week: 6,
    lesson: 3,
    index: 0,
    linkedWeeks: [6, 8],
    skillId: "timetable_problem",
    skillLabel: "Solve a Timetable Problem",
  },
  { week: 7, lesson: 1, index: 0, skillId: "measure_angle", skillLabel: "Read an Angle" },
  { week: 7, lesson: 2, index: 0, skillId: "construct_angle", skillLabel: "Construct an Angle" },
  { week: 7, lesson: 3, index: 0, skillId: "estimate_angle", skillLabel: "Estimate an Angle" },
];

// The post-test assesses the same curriculum through later, more applied variants.
const POSTTEST_SELECTIONS: TaskSelection[] = [
  { week: 1, lesson: 1, index: 4, skillId: "choose_metric_unit", skillLabel: "Choose an Appropriate Metric Unit" },
  { week: 1, lesson: 2, index: 4, skillId: "measurement_accuracy", skillLabel: "Choose Units for Accuracy" },
  { week: 2, lesson: 1, index: 4, skillId: "read_decimal_length", skillLabel: "Read a Decimal Length" },
  { week: 2, lesson: 2, index: 4, skillId: "read_decimal_mass_capacity", skillLabel: "Read Decimal Mass and Capacity" },
  { week: 2, lesson: 3, index: 4, skillId: "compare_decimal_measure", skillLabel: "Compare Decimal Measurements" },
  { week: 3, lesson: 1, index: 4, skillId: "efficient_perimeter", skillLabel: "Calculate Perimeter Efficiently" },
  { week: 3, lesson: 2, index: 4, skillId: "irregular_perimeter", skillLabel: "Find an Irregular Perimeter" },
  {
    week: 3,
    lesson: 3,
    index: 4,
    linkedWeeks: [3, 8],
    skillId: "perimeter_problem",
    skillLabel: "Solve a Perimeter Problem",
  },
  { week: 4, lesson: 1, index: 4, skillId: "rectangle_area", skillLabel: "Calculate Rectangle Area" },
  { week: 4, lesson: 2, index: 4, skillId: "irregular_area", skillLabel: "Find an Irregular Area" },
  {
    week: 4,
    lesson: 3,
    index: 4,
    linkedWeeks: [4, 8],
    skillId: "area_design",
    skillLabel: "Solve an Area Design Problem",
  },
  { week: 5, lesson: 1, index: 4, skillId: "area_or_perimeter", skillLabel: "Choose Area or Perimeter" },
  { week: 5, lesson: 2, index: 4, skillId: "same_area_perimeter", skillLabel: "Reason About Area and Perimeter" },
  {
    week: 5,
    lesson: 3,
    index: 4,
    linkedWeeks: [5, 8],
    skillId: "garden_design",
    skillLabel: "Apply Area and Perimeter",
  },
  { week: 6, lesson: 1, index: 4, skillId: "time_24_hour", skillLabel: "Read and Convert 24-Hour Time" },
  { week: 6, lesson: 2, index: 4, skillId: "timetable", skillLabel: "Read a Timetable" },
  {
    week: 6,
    lesson: 3,
    index: 4,
    linkedWeeks: [6, 8],
    skillId: "timetable_problem",
    skillLabel: "Solve a Timetable Problem",
  },
  { week: 7, lesson: 1, index: 4, skillId: "measure_angle", skillLabel: "Read an Angle" },
  { week: 7, lesson: 2, index: 4, skillId: "construct_angle", skillLabel: "Construct an Angle" },
  { week: 7, lesson: 3, index: 4, skillId: "estimate_angle", skillLabel: "Estimate an Angle" },
];

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

function selectTask(selection: TaskSelection): AssessmentTaskSpec {
  const lessonId = `y5-measurement-w${selection.week}-l${selection.lesson}`;
  const tasks = getY5MeasurelandsLessonQuizContribution(lessonId);
  const task = tasks[selection.index];
  if (!task) {
    throw new Error(
      `[Year5MeasurelandsAssessment] Missing Week ${selection.week} Lesson ${selection.lesson} task at index ${selection.index}.`,
    );
  }
  return { ...selection, task };
}

function toQuestion(spec: AssessmentTaskSpec, index: number, mode: "pre" | "post"): Question {
  const number = String(index + 1).padStart(2, "0");
  return {
    id: `y5-measurement-${mode}-${number}`,
    type: "measurelandsTask",
    prompt: "prompt" in spec.task ? String(spec.task.prompt) : spec.skillLabel,
    correctAnswer: CORRECT_TOKEN,
    answer: CORRECT_TOKEN,
    practiceTask: spec.task,
    skillId: spec.skillId,
    skillLabel: spec.skillLabel,
    linkedWeeks: spec.linkedWeeks ?? [spec.week],
    linkedLessons: [spec.lesson],
    strand: "Measurement",
    difficultyBand: `year5-measurement-${mode}`,
  };
}

function buildQuestions(mode: "pre" | "post", seed: number): Question[] {
  return withSeed(seed, () => {
    const selections = mode === "pre" ? PRETEST_SELECTIONS : POSTTEST_SELECTIONS;
    const questions = selections.map(selectTask).map((spec, index) => toQuestion(spec, index, mode));
    if (questions.length !== 20) {
      throw new Error(`[Year5MeasurelandsAssessment] Expected 20 ${mode} tasks, received ${questions.length}.`);
    }
    return questions;
  });
}

export const YEAR5_MEASURELANDS_PRETEST = buildQuestions("pre", 0x59355052);
export const YEAR5_MEASURELANDS_POSTTEST = buildQuestions("post", 0x59355054);
