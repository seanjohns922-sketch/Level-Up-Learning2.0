import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { quizPositionFindTask, quizPositionPictureTask, quizPositionWordTask } from "@/data/activities/starpath/ground/quizTasks";
import type { PositionRelation } from "./position-objects";

const RELATIONS: PositionRelation[] = ["above", "below", "beside", "behind", "in-front", "inside"];

// Independent 5-5-5 quiz bank matching Find the Explorer, Help Geospin and Hidden Treasure.
export function buildGroundWeek6VoyageQuiz(): PracticeTask[] {
  const tasks: PracticeTask[] = [];
  let target = 0;
  for (let i = 0; i < 5; i += 1) tasks.push(quizPositionFindTask(i + 1, ++target, RELATIONS));
  for (let i = 0; i < 5; i += 1) tasks.push(quizPositionWordTask(i + 3, ++target, RELATIONS));
  for (let i = 0; i < 5; i += 1) tasks.push(quizPositionPictureTask(i + 6, ++target, RELATIONS));
  return tasks;
}
