import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { assertWeeklyQuizQuestionCount } from "@/lib/weekly-quiz-contract";
import { diagonalCompleteTask, horizontalCompleteTask, lineCreateTask, lineRepairTask, lineTestTask, rotationCompleteTask, rotationCreateTask, rotationRecordTask, rotationRepairTask, rotationTestTask, verticalCompleteTask } from "./symmetry";

const five = (start: number, target: number, generators: Array<(round: number, target: number) => PracticeTask>) => Array.from({ length: 5 }, (_, i) => generators[i % generators.length]!(start + i, target + i));
export function buildLevelFourWeek6VoyageQuiz() { return assertWeeklyQuizQuestionCount([...five(201, 1, [lineTestTask, lineRepairTask]), ...five(211, 6, [verticalCompleteTask, horizontalCompleteTask, diagonalCompleteTask]), ...five(221, 11, [lineCreateTask, lineRepairTask])], "Starpath Level 4 Week 6"); }
export function buildLevelFourWeek7VoyageQuiz() { return assertWeeklyQuizQuestionCount([...five(231, 1, [rotationTestTask, rotationRepairTask]), ...five(241, 6, [rotationRecordTask, rotationTestTask]), ...five(251, 11, [rotationCompleteTask, rotationCreateTask, rotationRepairTask])], "Starpath Level 4 Week 7"); }
