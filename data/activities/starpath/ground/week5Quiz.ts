import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { quizPositionFindTask, quizPositionPictureTask, quizPositionWordTask } from "@/data/activities/starpath/ground/quizTasks";
import type { PositionRelation } from "./position-objects";

const RELATIONS: PositionRelation[] = ["above", "below", "beside", "behind", "in-front"];

// Independent 5-5-5 quiz bank matching Where Am I, Where Are We and Position Mission.
export function buildGroundWeek5VoyageQuiz(): PracticeTask[] {
  const tasks: PracticeTask[] = [];
  let target = 0;
  for (let i = 0; i < 5; i += 1) tasks.push(quizPositionWordTask(i, ++target, RELATIONS));
  for (let i = 0; i < 5; i += 1) tasks.push(quizPositionPictureTask(i + 2, ++target, RELATIONS));
  for (let i = 0; i < 5; i += 1) tasks.push(quizPositionFindTask(i + 4, ++target, RELATIONS));
  return tasks;
}
