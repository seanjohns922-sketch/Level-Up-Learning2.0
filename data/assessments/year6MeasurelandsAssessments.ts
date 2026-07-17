import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { getY6MeasurelandsLessonQuizContribution } from "@/data/activities/year6Measurelands/registry";
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

// The pre-test samples the entry skill from every taught Level 6 content area.
const PRETEST_SELECTIONS: TaskSelection[] = [
  { week: 1, lesson: 1, index: 0, skillId: "area_formula", skillLabel: "Discover the Area Formula" },
  { week: 1, lesson: 2, index: 0, skillId: "calculate_rectangle_area", skillLabel: "Calculate Rectangle Area" },
  { week: 1, lesson: 3, index: 0, skillId: "area_investigation", skillLabel: "Apply the Area Formula" },
  { week: 2, lesson: 1, index: 0, skillId: "split_composite_shape", skillLabel: "Split a Composite Shape" },
  { week: 2, lesson: 2, index: 0, skillId: "calculate_composite_area", skillLabel: "Calculate Composite Area" },
  { week: 2, lesson: 3, index: 0, skillId: "composite_area_problem", skillLabel: "Solve a Composite Area Problem" },
  { week: 3, lesson: 1, index: 0, skillId: "count_cubic_units", skillLabel: "Count Cubic Units" },
  { week: 3, lesson: 2, index: 0, skillId: "volume_layers", skillLabel: "Calculate Volume in Layers" },
  { week: 3, lesson: 3, index: 0, skillId: "volume_problem", skillLabel: "Solve a Volume Problem" },
  { week: 4, lesson: 1, index: 0, skillId: "convert_length", skillLabel: "Convert Metric Length" },
  { week: 4, lesson: 2, index: 0, skillId: "convert_mass_capacity", skillLabel: "Convert Mass and Capacity" },
  { week: 4, lesson: 3, index: 0, skillId: "decimal_conversion", skillLabel: "Solve Decimal Conversions" },
  { week: 5, lesson: 1, index: 0, skillId: "interpret_timetable", skillLabel: "Interpret a Timetable" },
  { week: 5, lesson: 2, index: 0, skillId: "elapsed_time", skillLabel: "Solve Elapsed-Time Problems" },
  { week: 5, lesson: 3, index: 0, skillId: "advanced_time", skillLabel: "Solve Advanced Time Problems" },
  { week: 6, lesson: 1, index: 0, skillId: "straight_line_angles", skillLabel: "Angles on a Straight Line" },
  { week: 6, lesson: 2, index: 0, skillId: "angles_around_point", skillLabel: "Angles Around a Point" },
  { week: 7, lesson: 1, index: 0, skillId: "choose_measurement_strategy", skillLabel: "Choose a Measurement Strategy" },
  { week: 7, lesson: 2, index: 0, skillId: "optimise_measurement_solution", skillLabel: "Optimise a Measurement Solution" },
  { week: 6, lesson: 3, index: 0, skillId: "mixed_angle_reasoning", skillLabel: "Investigate Missing Angles" },
];

// The post-test assesses the same curriculum through later, more applied variants.
const POSTTEST_SELECTIONS: TaskSelection[] = PRETEST_SELECTIONS.map((selection) => ({
  ...selection,
  // The capacity variant states its volume before asking for the answer. Use the
  // packing calculation instead so the assessment never gives the answer away.
  index: selection.week === 3 && selection.lesson === 3 ? 1 : 4,
}));

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
  const lessonId = `y6-measurement-w${selection.week}-l${selection.lesson}`;
  const tasks = getY6MeasurelandsLessonQuizContribution(lessonId);
  const task = tasks[selection.index];
  if (!task) {
    throw new Error(
      `[Year6MeasurelandsAssessment] Missing Week ${selection.week} Lesson ${selection.lesson} task at index ${selection.index}.`,
    );
  }
  return { ...selection, task };
}

function toQuestion(spec: AssessmentTaskSpec, index: number, mode: "pre" | "post"): Question {
  const number = String(index + 1).padStart(2, "0");
  return {
    id: `y6-measurement-${mode}-${number}`,
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
    difficultyBand: `year6-measurement-${mode}`,
  };
}

function buildQuestions(mode: "pre" | "post", seed: number): Question[] {
  return withSeed(seed, () => {
    const selections = mode === "pre" ? PRETEST_SELECTIONS : POSTTEST_SELECTIONS;
    const questions = selections.map(selectTask).map((spec, index) => toQuestion(spec, index, mode));
    if (questions.length !== 20) {
      throw new Error(`[Year6MeasurelandsAssessment] Expected 20 ${mode} tasks, received ${questions.length}.`);
    }
    return questions;
  });
}

export const YEAR6_MEASURELANDS_PRETEST = buildQuestions("pre", 0x59365052);
export const YEAR6_MEASURELANDS_POSTTEST = buildQuestions("post", 0x59365054);
