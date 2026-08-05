import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { assertWeeklyQuizQuestionCount } from "@/lib/weekly-quiz-contract";
import { alternateShapeTask, componentScanTask, constructShapeTask, evaluateModelTask, hiddenStructureTask, modelTask, simplifyTask, solidAssemblyTask, viewBuildTask } from "./composite";

const five = (start: number, target: number, generators: Array<(round: number, target: number) => PracticeTask>) => Array.from({ length: 5 }, (_, i) => generators[i % generators.length]!(start + i, target + i));
export function buildLevelFourWeek1VoyageQuiz() { return assertWeeklyQuizQuestionCount([...five(101, 1, [componentScanTask, constructShapeTask]), ...five(111, 6, [constructShapeTask, modelTask]), ...five(121, 11, [alternateShapeTask, evaluateModelTask])], "Starpath Level 4 Week 1"); }
export function buildLevelFourWeek2VoyageQuiz() { return assertWeeklyQuizQuestionCount([...five(131, 1, [solidAssemblyTask, hiddenStructureTask]), ...five(141, 6, [viewBuildTask]), ...five(151, 11, [hiddenStructureTask, viewBuildTask])], "Starpath Level 4 Week 2"); }
export function buildLevelFourWeek3VoyageQuiz() { return assertWeeklyQuizQuestionCount([...five(161, 1, [simplifyTask, evaluateModelTask]), ...five(171, 6, [modelTask, evaluateModelTask]), ...five(181, 11, [evaluateModelTask, modelTask])], "Starpath Level 4 Week 3"); }
