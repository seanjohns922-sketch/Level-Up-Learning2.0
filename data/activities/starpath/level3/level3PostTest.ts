import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { PostTest, Question } from "@/data/assessments/posttests";

// Legacy Level 3 Starpath form. Retained for historical replay only; production
// resolves the independent Version 1.0 banks from data/assessments/api.ts.
import { fiveFrom } from "@/data/activities/starpath/level1/quizUtils";
import { buildLevelThreeWeek1VoyageQuiz } from "./week1Quiz";
import { buildLevelThreeWeek2VoyageQuiz } from "./week2Quiz";
import { buildLevelThreeWeek3VoyageQuiz } from "./week3Quiz";
import { buildLevelThreeWeek4VoyageQuiz } from "./week4Quiz";
import { buildLevelThreeWeek5VoyageQuiz } from "./week5Quiz";
import { buildLevelThreeWeek6VoyageQuiz } from "./week6Quiz";
import { buildLevelThreeWeek7VoyageQuiz } from "./week7Quiz";
import { createFinalMissionTaskSet, createMapMasterTaskSet, createObjectsReviewTaskSet } from "./week8";

export const STARPATH_LEVEL_THREE_POSTTEST_ID = "y3-space-post-01";
const CORRECT_TOKEN = "__starpath_task_correct__";

type Selection = { week: number; skillId: string; skillLabel: string; build: () => PracticeTask[]; indices: number[] };

const SELECTIONS: Selection[] = [
  { week: 1, skillId: "object_recognition", skillLabel: "Recognise 3D Objects", build: buildLevelThreeWeek1VoyageQuiz, indices: [0, 10] },
  { week: 2, skillId: "object_classification", skillLabel: "Compare and Classify Objects", build: buildLevelThreeWeek2VoyageQuiz, indices: [5, 10] },
  { week: 3, skillId: "object_design", skillLabel: "Build and Choose Objects", build: buildLevelThreeWeek3VoyageQuiz, indices: [0, 5, 10] },
  { week: 4, skillId: "map_interpretation", skillLabel: "Interpret Space Maps", build: buildLevelThreeWeek4VoyageQuiz, indices: [0, 5, 10] },
  { week: 5, skillId: "map_creation", skillLabel: "Create Space Maps", build: buildLevelThreeWeek5VoyageQuiz, indices: [0, 5, 10] },
  { week: 6, skillId: "landmark_navigation", skillLabel: "Navigate by Landmarks", build: buildLevelThreeWeek6VoyageQuiz, indices: [0, 10] },
  { week: 7, skillId: "cosmic_missions", skillLabel: "Integrate Objects and Maps", build: buildLevelThreeWeek7VoyageQuiz, indices: [0, 10] },
  {
    week: 8,
    skillId: "cosmic_navigator",
    skillLabel: "Cosmic Navigator Mastery",
    build: () => [fiveFrom(createObjectsReviewTaskSet())[0]!, fiveFrom(createMapMasterTaskSet())[0]!, fiveFrom(createFinalMissionTaskSet())[0]!],
    indices: [0, 1, 2],
  },
];

function promptFor(task: PracticeTask, fallback: string): string {
  return "prompt" in task && typeof task.prompt === "string" ? task.prompt : fallback;
}

function feedbackFor(task: PracticeTask, fallback: string): string {
  return "feedback" in task && task.feedback && typeof task.feedback.wrong === "string" ? task.feedback.wrong : `Review ${fallback.toLowerCase()} and try again.`;
}

export function buildLevelThreePostTestQuestions(): Question[] {
  let number = 0;
  const questions = SELECTIONS.flatMap(({ week, skillId, skillLabel, build, indices }) => {
    const tasks = build();
    return indices.map((index) => {
      const practiceTask = tasks[index];
      if (!practiceTask) throw new Error(`Starpath Level 3 post-test is missing Week ${week} task ${index}.`);
      number += 1;
      return {
        id: `${STARPATH_LEVEL_THREE_POSTTEST_ID}-q${String(number).padStart(2, "0")}`,
        type: "starpathTask",
        prompt: promptFor(practiceTask, skillLabel),
        correctAnswer: CORRECT_TOKEN,
        answer: CORRECT_TOKEN,
        skillId,
        skillLabel,
        linkedWeeks: [week],
        linkedLessons: [1, 2, 3],
        strand: "Space",
        curriculumCodes: week <= 3 ? ["AC9M3SP01"] : week <= 6 ? ["AC9M3SP02"] : ["AC9M3SP01", "AC9M3SP02"],
        difficultyBand: "year3-space-post",
        reviewFeedback: feedbackFor(practiceTask, skillLabel),
        practiceTask,
      } satisfies Question;
    });
  });
  if (questions.length !== 20) throw new Error(`Starpath Level 3 post-test must build 20 questions; received ${questions.length}.`);
  return questions;
}

export function getLevelThreePosttest(): PostTest {
  return { yearLabel: "Year 3", questions: buildLevelThreePostTestQuestions() };
}

export const STARPATH_LEVEL_THREE_POSTTEST_CORRECT_TOKEN = CORRECT_TOKEN;
