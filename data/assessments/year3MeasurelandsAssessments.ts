import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { getY3MeasurelandsLessonQuizContribution } from "@/data/activities/year3Measurelands/registry";
import type { Question } from "@/data/assessments/posttests";

const CORRECT_TOKEN = "__measurelands_task_correct__";

type AssessmentTaskSpec = {
  task: PracticeTask;
  week: number;
  lesson: number;
  skillId: string;
  skillLabel: string;
};

type TaskSelection = Omit<AssessmentTaskSpec, "task"> & {
  index: number;
};

const PRETEST_SELECTIONS: TaskSelection[] = [
  { week: 1, lesson: 1, index: 0, skillId: "ruler_zero", skillLabel: "Start a Ruler at Zero" },
  { week: 1, lesson: 2, index: 0, skillId: "measure_cm", skillLabel: "Measure in Centimetres" },
  { week: 1, lesson: 3, index: 0, skillId: "length_difference", skillLabel: "Compare Centimetre Lengths" },
  { week: 2, lesson: 1, index: 0, skillId: "metre_benchmark", skillLabel: "Recognise One Metre" },
  { week: 2, lesson: 2, index: 0, skillId: "choose_cm_or_m", skillLabel: "Choose Centimetres or Metres" },
  { week: 2, lesson: 3, index: 0, skillId: "estimate_length", skillLabel: "Estimate a Metric Length" },
  { week: 3, lesson: 1, index: 0, skillId: "choose_g_or_kg", skillLabel: "Choose Grams or Kilograms" },
  { week: 3, lesson: 2, index: 0, skillId: "read_mass_scale", skillLabel: "Read a Mass Scale" },
  { week: 3, lesson: 3, index: 0, skillId: "compare_mass", skillLabel: "Compare Formal Masses" },
  { week: 4, lesson: 1, index: 0, skillId: "choose_ml_or_l", skillLabel: "Choose Millilitres or Litres" },
  { week: 4, lesson: 2, index: 0, skillId: "read_measuring_jug", skillLabel: "Read a Measuring Jug" },
  { week: 5, lesson: 2, index: 0, skillId: "estimate_duration", skillLabel: "Estimate Duration" },
  { week: 5, lesson: 3, index: 0, skillId: "compare_duration", skillLabel: "Compare Durations" },
  { week: 6, lesson: 1, index: 0, skillId: "read_five_minute_time", skillLabel: "Read Five-Minute Time" },
  { week: 6, lesson: 2, index: 0, skillId: "read_minute_time", skillLabel: "Read Time to the Minute" },
  { week: 7, lesson: 1, index: 0, skillId: "recognise_perimeter", skillLabel: "Recognise Perimeter" },
  { week: 7, lesson: 2, index: 0, skillId: "trace_perimeter", skillLabel: "Trace a Boundary" },
  { week: 7, lesson: 3, index: 0, skillId: "compare_perimeter", skillLabel: "Compare Perimeters" },
  { week: 8, lesson: 1, index: 1, skillId: "count_area", skillLabel: "Count Square Units" },
  { week: 8, lesson: 2, index: 1, skillId: "compare_area", skillLabel: "Compare Areas" },
];

const POSTTEST_SELECTIONS: TaskSelection[] = [
  { week: 1, lesson: 2, index: 4, skillId: "measure_cm", skillLabel: "Measure in Centimetres" },
  { week: 1, lesson: 3, index: 2, skillId: "ruler_error", skillLabel: "Find a Ruler Error" },
  { week: 1, lesson: 3, index: 3, skillId: "length_difference", skillLabel: "Find a Length Difference" },
  { week: 2, lesson: 1, index: 4, skillId: "metre_benchmark", skillLabel: "Compare a Length to One Metre" },
  { week: 2, lesson: 2, index: 3, skillId: "choose_cm_or_m", skillLabel: "Check a Metric Unit" },
  { week: 2, lesson: 3, index: 4, skillId: "estimate_length", skillLabel: "Estimate a Metric Length" },
  { week: 3, lesson: 2, index: 3, skillId: "read_mass_scale", skillLabel: "Read a Mass Scale" },
  { week: 3, lesson: 3, index: 1, skillId: "order_mass", skillLabel: "Order Formal Masses" },
  { week: 3, lesson: 3, index: 4, skillId: "mass_difference", skillLabel: "Find a Mass Difference" },
  { week: 4, lesson: 2, index: 3, skillId: "read_measuring_jug", skillLabel: "Match a Measuring Jug" },
  { week: 4, lesson: 3, index: 3, skillId: "capacity_difference", skillLabel: "Find a Capacity Difference" },
  { week: 5, lesson: 2, index: 4, skillId: "estimate_duration", skillLabel: "Estimate Duration" },
  { week: 5, lesson: 3, index: 3, skillId: "duration_difference", skillLabel: "Find a Duration Difference" },
  { week: 6, lesson: 2, index: 3, skillId: "spot_minute_time", skillLabel: "Find a Minute Time" },
  { week: 6, lesson: 3, index: 4, skillId: "read_mixed_time", skillLabel: "Read Mixed Analog Time" },
  { week: 7, lesson: 2, index: 4, skillId: "trace_perimeter", skillLabel: "Trace an Irregular Boundary" },
  { week: 7, lesson: 3, index: 2, skillId: "compare_perimeter", skillLabel: "Compare Perimeters" },
  { week: 7, lesson: 3, index: 3, skillId: "recognise_perimeter", skillLabel: "Recognise a Perimeter Path" },
  { week: 8, lesson: 2, index: 4, skillId: "count_area", skillLabel: "Count Square Units" },
  { week: 8, lesson: 3, index: 4, skillId: "same_area", skillLabel: "Build the Same Area" },
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
  const lessonId = `y3-measurement-w${selection.week}-l${selection.lesson}`;
  const tasks = getY3MeasurelandsLessonQuizContribution(lessonId);
  const task = tasks[selection.index];
  if (!task) {
    throw new Error(
      `[Year3MeasurelandsAssessment] Missing Week ${selection.week} Lesson ${selection.lesson} task at index ${selection.index}.`,
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
    id: `y3-measurement-${mode}-${number}`,
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
    difficultyBand: `year3-measurement-${mode}`,
  };
}

function buildQuestions(mode: "pre" | "post", seed: number): Question[] {
  return withSeed(seed, () => {
    const selections = mode === "pre" ? PRETEST_SELECTIONS : POSTTEST_SELECTIONS;
    const questions = selections.map(selectTask).map((spec, index) => toQuestion(spec, index, mode));
    if (questions.length !== 20) {
      throw new Error(`[Year3MeasurelandsAssessment] Expected 20 ${mode} tasks, received ${questions.length}.`);
    }
    return questions;
  });
}

export const YEAR3_MEASURELANDS_PRETEST = buildQuestions("pre", 0x59335052);
export const YEAR3_MEASURELANDS_POSTTEST = buildQuestions("post", 0x59335054);
