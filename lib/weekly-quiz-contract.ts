export const WEEKLY_QUIZ_LESSON_COUNT = 3;
export const WEEKLY_QUIZ_QUESTIONS_PER_LESSON = 5;
export const WEEKLY_QUIZ_QUESTION_COUNT =
  WEEKLY_QUIZ_LESSON_COUNT * WEEKLY_QUIZ_QUESTIONS_PER_LESSON;

export function assertWeeklyQuizQuestionCount<T>(
  questions: T[],
  context: string
): T[] {
  if (questions.length !== WEEKLY_QUIZ_QUESTION_COUNT) {
    throw new Error(
      `[WeeklyQuiz] ${context} must contain exactly ${WEEKLY_QUIZ_QUESTION_COUNT} questions; received ${questions.length}.`
    );
  }

  return questions;
}
