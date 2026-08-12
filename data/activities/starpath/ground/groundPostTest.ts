import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { PostTest, Question } from "@/data/assessments/posttests";
import { GROUND_STARPATH_INDEPENDENT_POSTTEST_ITEMS } from "@/data/assessments/groundStarpathIndependentPosttest";
import { buildGroundWeek1VoyageQuiz } from "@/data/activities/starpath/ground/week1Quiz";
import { buildGroundWeek2VoyageQuiz } from "@/data/activities/starpath/ground/week2Quiz";
import { buildGroundWeek3VoyageQuiz } from "@/data/activities/starpath/ground/week3Quiz";
import { buildGroundWeek4VoyageQuiz } from "@/data/activities/starpath/ground/week4Quiz";
import { buildGroundWeek5VoyageQuiz } from "@/data/activities/starpath/ground/week5Quiz";
import { buildGroundWeek6VoyageQuiz } from "@/data/activities/starpath/ground/week6Quiz";
import { buildGroundWeek7VoyageQuiz } from "@/data/activities/starpath/ground/week7Quiz";
import { oddShapeTask } from "@/data/activities/starpath/ground/week3Tasks";
import { whichPictureTask } from "@/data/activities/starpath/ground/week4Tasks";
import type { PositionRelation } from "@/data/activities/starpath/ground/position-objects";

export const STARPATH_GROUND_POSTTEST_ID = "ground-space-post-01";

const CORRECT_TOKEN = "__starpath_task_correct__";
const ASSESSMENT_SEED = 0x53504143;
const POSITION_RELATIONS: PositionRelation[] = [
  "above",
  "below",
  "beside",
  "behind",
  "in-front",
  "inside",
];

type TaskSelection = {
  week: number;
  skillId: string;
  skillLabel: string;
  build: () => PracticeTask[];
  indices: number[];
};

const TASK_SELECTIONS: TaskSelection[] = [
  {
    week: 1,
    skillId: "shape_recognition",
    skillLabel: "Recognise Familiar Shapes",
    build: buildGroundWeek1VoyageQuiz,
    indices: [0, 6],
  },
  {
    week: 2,
    skillId: "shape_creation",
    skillLabel: "Create with Familiar Shapes",
    build: buildGroundWeek2VoyageQuiz,
    indices: [0, 5, 10],
  },
  {
    week: 3,
    skillId: "shape_sort_compare",
    skillLabel: "Sort and Compare Familiar Shapes",
    build: buildGroundWeek3VoyageQuiz,
    indices: [0, 5, 10],
  },
  {
    week: 4,
    skillId: "position_language",
    skillLabel: "Describe Object Positions",
    build: buildGroundWeek4VoyageQuiz,
    indices: [0, 5, 10],
  },
  {
    week: 5,
    skillId: "people_positions",
    skillLabel: "Describe People and Object Positions",
    build: buildGroundWeek5VoyageQuiz,
    indices: [0, 5, 10],
  },
  {
    week: 6,
    skillId: "positional_clues",
    skillLabel: "Follow Positional Clues",
    build: buildGroundWeek6VoyageQuiz,
    indices: [0, 10],
  },
  {
    week: 7,
    skillId: "shape_position_application",
    skillLabel: "Apply Shapes and Position",
    build: buildGroundWeek7VoyageQuiz,
    indices: [0, 10],
  },
  {
    week: 8,
    skillId: "space_mastery",
    skillLabel: "Shape and Position Reasoning",
    build: () => [
      oddShapeTask(8, 1),
      whichPictureTask(8, 2, POSITION_RELATIONS),
    ],
    indices: [0, 1],
  },
];

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

function getTaskPrompt(task: PracticeTask, fallback: string): string {
  return "prompt" in task && typeof task.prompt === "string" ? task.prompt : fallback;
}

function getReviewFeedback(task: PracticeTask, skillLabel: string): string {
  if ("feedback" in task && task.feedback && typeof task.feedback.wrong === "string") {
    return task.feedback.wrong;
  }
  return `Review ${skillLabel.toLowerCase()} and try again.`;
}

// Legacy lesson-reuse form retained for historical replay and audit only.
// Production resolution must use GROUND_STARPATH_INDEPENDENT_POSTTEST_ITEMS.
export function buildGroundPostTestQuestions(): Question[] {
  let questionNumber = 0;

  return TASK_SELECTIONS.flatMap(({ week, skillId, skillLabel, build, indices }) => {
    const tasks = buildStableTasks(build, week);
    return indices.map((taskIndex) => {
      const practiceTask = tasks[taskIndex];
      if (!practiceTask) {
        throw new Error(`Starpath Ground post-test is missing Week ${week} task ${taskIndex}.`);
      }

      questionNumber += 1;
      return {
        id: `${STARPATH_GROUND_POSTTEST_ID}-q${String(questionNumber).padStart(2, "0")}`,
        type: "starpathTask",
        prompt: getTaskPrompt(practiceTask, skillLabel),
        correctAnswer: CORRECT_TOKEN,
        answer: CORRECT_TOKEN,
        skillId,
        skillLabel,
        linkedWeeks: [week],
        linkedLessons: [1, 2, 3],
        strand: "Space",
        difficultyBand: "foundation-space-post",
        reviewFeedback: getReviewFeedback(practiceTask, skillLabel),
        practiceTask,
      } satisfies Question;
    });
  });
}

export function buildGroundPostTest(): PracticeTask[] {
  return GROUND_STARPATH_INDEPENDENT_POSTTEST_ITEMS.flatMap((question) =>
    question.practiceTask ? [question.practiceTask] : []
  );
}

export function getStarpathPosttestForYear(yearLabel: string): PostTest | undefined {
  if (yearLabel !== "Prep") return undefined;
  return {
    yearLabel: "Prep",
    questions: [...GROUND_STARPATH_INDEPENDENT_POSTTEST_ITEMS],
  };
}

export function getStarpathPostTestTasks(levelPrefix: string): PracticeTask[] | null {
  return levelPrefix === "ground" ? buildGroundPostTest() : null;
}

export const STARPATH_GROUND_POSTTEST_CORRECT_TOKEN = CORRECT_TOKEN;
