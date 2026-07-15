import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { getY4MeasurelandsLessonQuizContribution } from "@/data/activities/year4Measurelands/registry";
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

// The pre-test samples the entry skill from every taught Level 4 content area.
const PRETEST_SELECTIONS: TaskSelection[] = [
  { week: 1, lesson: 1, index: 0, skillId: "read_partial_length", skillLabel: "Read Between Ruler Marks" },
  { week: 1, lesson: 2, index: 0, skillId: "measure_precisely", skillLabel: "Measure a Precise Length" },
  { week: 1, lesson: 3, index: 0, skillId: "compare_precise_length", skillLabel: "Compare Precise Lengths" },
  { week: 2, lesson: 1, index: 0, skillId: "read_mass_scale", skillLabel: "Read a Mass Scale" },
  { week: 2, lesson: 2, index: 0, skillId: "read_measuring_jug", skillLabel: "Read a Measuring Jug" },
  { week: 2, lesson: 3, index: 0, skillId: "compare_mass_capacity", skillLabel: "Compare Measured Mass" },
  { week: 3, lesson: 1, index: 0, skillId: "read_temperature", skillLabel: "Read a Thermometer" },
  { week: 3, lesson: 2, index: 0, skillId: "read_temperature_scale", skillLabel: "Read Temperature Between Marks" },
  { week: 3, lesson: 3, index: 0, skillId: "compare_temperature", skillLabel: "Compare Temperatures" },
  { week: 4, lesson: 1, index: 0, skillId: "measure_boundary", skillLabel: "Measure the Outside" },
  { week: 4, lesson: 2, index: 0, skillId: "find_perimeter", skillLabel: "Find a Perimeter" },
  {
    week: 4,
    lesson: 3,
    index: 0,
    linkedWeeks: [4, 8],
    skillId: "perimeter_problem",
    skillLabel: "Apply Perimeter in an Investigation",
  },
  { week: 5, lesson: 1, index: 0, skillId: "measure_area", skillLabel: "Measure Area in Squares" },
  { week: 5, lesson: 2, index: 0, skillId: "compare_area", skillLabel: "Compare Areas" },
  { week: 5, lesson: 3, index: 0, skillId: "area_problem", skillLabel: "Solve an Area Problem" },
  { week: 6, lesson: 1, index: 0, skillId: "convert_time", skillLabel: "Convert Time Units" },
  { week: 6, lesson: 2, index: 0, skillId: "elapsed_time", skillLabel: "Find Elapsed Time" },
  { week: 6, lesson: 3, index: 0, skillId: "time_problem", skillLabel: "Solve a Time Problem" },
  { week: 7, lesson: 1, index: 0, skillId: "recognise_angles", skillLabel: "Recognise Angles" },
  { week: 7, lesson: 2, index: 0, skillId: "compare_angles", skillLabel: "Compare Angles" },
];

// The post-test assesses the same curriculum through later, more applied lesson variants.
const POSTTEST_SELECTIONS: TaskSelection[] = [
  { week: 1, lesson: 1, index: 4, skillId: "read_partial_length", skillLabel: "Read Between Ruler Marks" },
  { week: 1, lesson: 2, index: 4, skillId: "measure_precisely", skillLabel: "Choose a Precise Measurement" },
  { week: 1, lesson: 3, index: 2, skillId: "check_precise_length", skillLabel: "Check a Precise Measurement" },
  { week: 2, lesson: 1, index: 3, skillId: "read_mass_scale", skillLabel: "Read a Mass Scale" },
  { week: 2, lesson: 2, index: 3, skillId: "read_measuring_jug", skillLabel: "Read a Measuring Jug" },
  { week: 2, lesson: 3, index: 2, skillId: "mass_difference", skillLabel: "Find a Mass Difference" },
  { week: 3, lesson: 2, index: 3, skillId: "read_temperature_scale", skillLabel: "Read Temperature Between Marks" },
  { week: 3, lesson: 3, index: 1, skillId: "order_temperature", skillLabel: "Order Temperatures" },
  { week: 3, lesson: 3, index: 4, skillId: "temperature_context", skillLabel: "Use Temperature in Context" },
  { week: 4, lesson: 1, index: 4, skillId: "measure_boundary", skillLabel: "Measure the Outside" },
  { week: 4, lesson: 2, index: 3, skillId: "check_perimeter", skillLabel: "Check a Perimeter" },
  { week: 4, lesson: 3, index: 3, skillId: "perimeter_problem", skillLabel: "Solve a Perimeter Mission" },
  { week: 5, lesson: 1, index: 4, skillId: "measure_area", skillLabel: "Measure Area in Squares" },
  { week: 5, lesson: 2, index: 4, skillId: "equal_area", skillLabel: "Recognise Equal Areas" },
  {
    week: 5,
    lesson: 3,
    index: 2,
    linkedWeeks: [5, 8],
    skillId: "area_design",
    skillLabel: "Apply Area in a Design Investigation",
  },
  { week: 6, lesson: 1, index: 4, skillId: "convert_time", skillLabel: "Convert Time Units" },
  { week: 6, lesson: 2, index: 4, skillId: "finish_time", skillLabel: "Find a Finish Time" },
  { week: 6, lesson: 3, index: 2, skillId: "time_planning", skillLabel: "Solve a Time Planning Problem" },
  { week: 7, lesson: 2, index: 4, skillId: "classify_angles", skillLabel: "Classify an Angle" },
  { week: 7, lesson: 3, index: 2, skillId: "angle_reasoning", skillLabel: "Solve an Angle Challenge" },
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
  const lessonId = `y4-measurement-w${selection.week}-l${selection.lesson}`;
  const tasks = getY4MeasurelandsLessonQuizContribution(lessonId);
  const task = tasks[selection.index];
  if (!task) {
    throw new Error(
      `[Year4MeasurelandsAssessment] Missing Week ${selection.week} Lesson ${selection.lesson} task at index ${selection.index}.`,
    );
  }
  const assessmentTask =
    task.kind === "analogClock" && task.scene === "build"
      ? { ...task, assessmentMode: true }
      : task;
  return { ...selection, task: assessmentTask };
}

function toQuestion(spec: AssessmentTaskSpec, index: number, mode: "pre" | "post"): Question {
  const number = String(index + 1).padStart(2, "0");
  return {
    id: `y4-measurement-${mode}-${number}`,
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
    difficultyBand: `year4-measurement-${mode}`,
  };
}

function buildQuestions(mode: "pre" | "post", seed: number): Question[] {
  return withSeed(seed, () => {
    const selections = mode === "pre" ? PRETEST_SELECTIONS : POSTTEST_SELECTIONS;
    const questions = selections.map(selectTask).map((spec, index) => toQuestion(spec, index, mode));
    if (questions.length !== 20) {
      throw new Error(`[Year4MeasurelandsAssessment] Expected 20 ${mode} tasks, received ${questions.length}.`);
    }
    return questions;
  });
}

export const YEAR4_MEASURELANDS_PRETEST = buildQuestions("pre", 0x59345052);
export const YEAR4_MEASURELANDS_POSTTEST = buildQuestions("post", 0x59345054);
