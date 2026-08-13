import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { reasonTask as cartReasonTask, changeWhichTask, crossAxisTask, quadrantTask, readSignedTask, reverseTask } from "./cartesianTasks";
import { constantTask, explainTask, predictTask, prismTask, sliceChangeTask, sliceShapeTask } from "./crossTasks";
import { evidenceTask, explainFitTask, noticeRuleTask, patternRuleTask, varyTask, willTessellateTask } from "./tessellationTasks";
import { findChainTask, orderMattersTask, transformInOrderTask } from "./transformChainTasks";

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

export const buildLevelSixWeek1VoyageQuiz = () => build([sliceShapeTask, sliceChangeTask, predictTask], 11);
export const buildLevelSixWeek2VoyageQuiz = () => build([prismTask, constantTask, explainTask], 21);
export const buildLevelSixWeek3VoyageQuiz = () => build([readSignedTask, quadrantTask, cartReasonTask], 31);
export const buildLevelSixWeek4VoyageQuiz = () => build([changeWhichTask, crossAxisTask, reverseTask], 41);
export const buildLevelSixWeek5VoyageQuiz = () => build([transformInOrderTask, orderMattersTask, findChainTask], 51);
export const buildLevelSixWeek6VoyageQuiz = () => build([willTessellateTask, patternRuleTask, explainFitTask], 61);
export const buildLevelSixWeek7VoyageQuiz = () => build([noticeRuleTask, varyTask, evidenceTask], 71);

export const buildLevelSixCoordinateReasoningReview = () => build([readSignedTask, quadrantTask, cartReasonTask], 81);
