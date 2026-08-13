import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { GRID_8, commandsTask, errorTask, moveAxisTask, orderTask, readTask, routeTask } from "./coordinateTasks";
import { buildTask, chooseNetTask, classifyTask, countTask, foldPredictTask, reasonTask, relationTask, selectValidTask, trackCellTask } from "./netTasks";
import { checkTask, compareTask, describeTask, translateTapTask, reflectTapTask, rotateTapTask } from "./transformTasks";

type TaskFactory = (round: number, target: number) => PracticeTask;

function build(factories: readonly [TaskFactory, TaskFactory, TaskFactory], seed: number): PracticeTask[] {
  const tasks: PracticeTask[] = [];
  let target = 0;
  factories.forEach((factory, lessonIndex) => {
    for (let i = 0; i < 5; i += 1) {
      target += 1;
      tasks.push(factory(seed + lessonIndex * 10 + i, target));
    }
  });
  return tasks;
}

export const buildLevelFiveWeek1VoyageQuiz = () => build([chooseNetTask, foldPredictTask, reasonTask], 11);
export const buildLevelFiveWeek2VoyageQuiz = () => build([trackCellTask, countTask, relationTask], 21);
export const buildLevelFiveWeek3VoyageQuiz = () => build([classifyTask, buildTask, selectValidTask], 31);
export const buildLevelFiveWeek4VoyageQuiz = () => build([orderTask, readTask, errorTask], 41);
export const buildLevelFiveWeek5VoyageQuiz = () => build([
  (round, target) => moveAxisTask(round, target, GRID_8),
  (round, target) => commandsTask(round, target, GRID_8),
  (round, target) => routeTask(round, target, GRID_8),
], 51);
export const buildLevelFiveWeek6VoyageQuiz = () => build([translateTapTask, describeTask, checkTask], 61);
export const buildLevelFiveWeek7VoyageQuiz = () => build([reflectTapTask, rotateTapTask, compareTask], 71);
