import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { PostTest, Question } from "@/data/assessments/posttests";
import { buildLevelTwoWeek1VoyageQuiz } from "./week1Quiz";
import { buildLevelTwoWeek2VoyageQuiz } from "./week2Quiz";
import { buildLevelTwoWeek3VoyageQuiz } from "./week3Quiz";
import { buildLevelTwoWeek4VoyageQuiz } from "./week4Quiz";
import { buildLevelTwoWeek5VoyageQuiz } from "./week5Quiz";
import { buildLevelTwoWeek6VoyageQuiz } from "./week6Quiz";
import { buildLevelTwoWeek7VoyageQuiz } from "./week7Quiz";
import { compareTask } from "./shapeWeeks";
import { findTask } from "./week4StarMaps";

export const STARPATH_LEVEL_TWO_POSTTEST_ID = "y2-space-post-01";

const CORRECT_TOKEN = "__starpath_task_correct__";
const ASSESSMENT_SEED = 0x53504132; // "SPA2"

type TaskSelection = {
  week: number;
  skillId: string;
  skillLabel: string;
  build: () => PracticeTask[];
  indices: number[];
};

const TASK_SELECTIONS: TaskSelection[] = [
  { week: 1, skillId: "edges", skillLabel: "Straight and Curved", build: buildLevelTwoWeek1VoyageQuiz, indices: [0, 5, 10] },
  { week: 2, skillId: "count_sides", skillLabel: "Count the Sides", build: buildLevelTwoWeek2VoyageQuiz, indices: [0, 5, 10] },
  { week: 3, skillId: "parallel", skillLabel: "Parallel and Opposite", build: buildLevelTwoWeek3VoyageQuiz, indices: [0, 5, 10] },
  { week: 4, skillId: "compare_shapes", skillLabel: "Compare Shapes", build: buildLevelTwoWeek4VoyageQuiz, indices: [0, 5, 10] },
  { week: 5, skillId: "map_reading", skillLabel: "Read a Star Map", build: buildLevelTwoWeek5VoyageQuiz, indices: [0, 10] },
  { week: 6, skillId: "follow_pathways", skillLabel: "Follow Map Pathways", build: buildLevelTwoWeek6VoyageQuiz, indices: [0, 10] },
  { week: 7, skillId: "give_directions", skillLabel: "Give Map Directions", build: buildLevelTwoWeek7VoyageQuiz, indices: [0, 10] },
  {
    week: 8,
    skillId: "space_mapper",
    skillLabel: "Shape and Map Reasoning",
    build: () => [compareTask(0, 1, "same"), findTask(1, 2)],
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

export function buildLevelTwoPostTestQuestions(): Question[] {
  let questionNumber = 0;
  return TASK_SELECTIONS.flatMap(({ week, skillId, skillLabel, build, indices }) => {
    const tasks = buildStableTasks(build, week);
    return indices.map((taskIndex) => {
      const practiceTask = tasks[taskIndex];
      if (!practiceTask) {
        throw new Error(`Starpath Level 2 post-test is missing Week ${week} task ${taskIndex}.`);
      }
      questionNumber += 1;
      return {
        id: `${STARPATH_LEVEL_TWO_POSTTEST_ID}-q${String(questionNumber).padStart(2, "0")}`,
        type: "starpathTask",
        prompt: getTaskPrompt(practiceTask, skillLabel),
        correctAnswer: CORRECT_TOKEN,
        answer: CORRECT_TOKEN,
        skillId,
        skillLabel,
        linkedWeeks: [week],
        linkedLessons: [1, 2, 3],
        strand: "Space",
        difficultyBand: "year2-space-post",
        reviewFeedback: getReviewFeedback(practiceTask, skillLabel),
        practiceTask,
      } satisfies Question;
    });
  });
}

export function buildLevelTwoPostTest(): PracticeTask[] {
  return buildLevelTwoPostTestQuestions().flatMap((question) =>
    question.practiceTask ? [question.practiceTask] : []
  );
}

export function getLevelTwoPosttest(): PostTest {
  return { yearLabel: "Year 2", questions: buildLevelTwoPostTestQuestions() };
}
