import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { PostTest, Question } from "@/data/assessments/posttests";
import { buildLevelOneWeek1VoyageQuiz } from "./week1Quiz";
import { buildLevelOneWeek2VoyageQuiz } from "./week2Quiz";
import { buildLevelOneWeek3VoyageQuiz } from "./week3Quiz";
import { buildLevelOneWeek4VoyageQuiz } from "./week4Quiz";
import { buildLevelOneWeek5VoyageQuiz } from "./week5Quiz";
import { buildLevelOneWeek6VoyageQuiz } from "./week6Quiz";
import { buildLevelOneWeek7VoyageQuiz } from "./week7Quiz";
import { belongsTask } from "./week2Lessons";
import { routeBuildTask } from "./route-tasks";

export const STARPATH_LEVEL_ONE_POSTTEST_ID = "y1-space-post-01";

const CORRECT_TOKEN = "__starpath_task_correct__";
const ASSESSMENT_SEED = 0x53504131; // "SPA1"

type TaskSelection = {
  week: number;
  skillId: string;
  skillLabel: string;
  build: () => PracticeTask[];
  indices: number[];
};

const TASK_SELECTIONS: TaskSelection[] = [
  { week: 1, skillId: "shape_recognition", skillLabel: "Recognise and Compare Shapes", build: buildLevelOneWeek1VoyageQuiz, indices: [0, 6] },
  { week: 2, skillId: "shape_classification", skillLabel: "Classify Shapes into Families", build: buildLevelOneWeek2VoyageQuiz, indices: [0, 5, 10] },
  { week: 3, skillId: "shape_decomposition", skillLabel: "Find Shapes in Pictures", build: buildLevelOneWeek3VoyageQuiz, indices: [0, 5, 10] },
  { week: 4, skillId: "shapes_in_world", skillLabel: "Shapes in the World", build: buildLevelOneWeek4VoyageQuiz, indices: [0, 5, 10] },
  { week: 5, skillId: "shape_composition", skillLabel: "Make Shapes from Parts", build: buildLevelOneWeek5VoyageQuiz, indices: [0, 5, 10] },
  { week: 6, skillId: "give_directions", skillLabel: "Build a Route", build: buildLevelOneWeek6VoyageQuiz, indices: [0, 10] },
  { week: 7, skillId: "fix_routes", skillLabel: "Test and Fix Routes", build: buildLevelOneWeek7VoyageQuiz, indices: [0, 10] },
  {
    week: 8,
    skillId: "pathfinder_reasoning",
    skillLabel: "Shape and Route Reasoning",
    build: () => [belongsTask(0, 1), routeBuildTask(1, 2, "build")],
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

export function buildLevelOnePostTestQuestions(): Question[] {
  let questionNumber = 0;
  return TASK_SELECTIONS.flatMap(({ week, skillId, skillLabel, build, indices }) => {
    const tasks = buildStableTasks(build, week);
    return indices.map((taskIndex) => {
      const practiceTask = tasks[taskIndex];
      if (!practiceTask) {
        throw new Error(`Starpath Level 1 post-test is missing Week ${week} task ${taskIndex}.`);
      }
      questionNumber += 1;
      return {
        id: `${STARPATH_LEVEL_ONE_POSTTEST_ID}-q${String(questionNumber).padStart(2, "0")}`,
        type: "starpathTask",
        prompt: getTaskPrompt(practiceTask, skillLabel),
        correctAnswer: CORRECT_TOKEN,
        answer: CORRECT_TOKEN,
        skillId,
        skillLabel,
        linkedWeeks: [week],
        linkedLessons: [1, 2, 3],
        strand: "Space",
        difficultyBand: "year1-space-post",
        reviewFeedback: getReviewFeedback(practiceTask, skillLabel),
        practiceTask,
      } satisfies Question;
    });
  });
}

export function buildLevelOnePostTest(): PracticeTask[] {
  return buildLevelOnePostTestQuestions().flatMap((question) =>
    question.practiceTask ? [question.practiceTask] : []
  );
}

export function getLevelOnePosttest(): PostTest {
  return { yearLabel: "Year 1", questions: buildLevelOnePostTestQuestions() };
}
