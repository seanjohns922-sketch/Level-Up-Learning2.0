import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  assertWeeklyQuizQuestionCount,
  WEEKLY_QUIZ_QUESTION_COUNT,
  WEEKLY_QUIZ_QUESTIONS_PER_LESSON,
} from "../lib/weekly-quiz-contract.ts";

assert.equal(WEEKLY_QUIZ_QUESTION_COUNT, 15);
assert.equal(WEEKLY_QUIZ_QUESTIONS_PER_LESSON, 5);

const validQuiz = Array.from({ length: WEEKLY_QUIZ_QUESTION_COUNT }, (_, index) => index);
assert.equal(assertWeeklyQuizQuestionCount(validQuiz, "valid quiz"), validQuiz);

for (const invalidLength of [14, 16]) {
  assert.throws(
    () =>
      assertWeeklyQuizQuestionCount(
        Array.from({ length: invalidLength }, (_, index) => index),
        `${invalidLength}-question quiz`,
      ),
    new RegExp(`must contain exactly 15 questions; received ${invalidLength}`),
  );
}

const sessionSource = readFileSync(new URL("../app/session/page.tsx", import.meta.url), "utf8");
const starpathSource = readFileSync(
  new URL("../data/activities/starpath/ground/week1Quiz.ts", import.meta.url),
  "utf8",
);

assert.match(
  sessionSource,
  /const questions = assertWeeklyQuizQuestionCount\(\s*buildQuizQuestions\(\)/,
);
assert.match(
  sessionSource,
  /const recovered = assertWeeklyQuizQuestionCount\(\s*buildQuizQuestions\(\)/,
);
assert.match(
  sessionSource,
  /return assertWeeklyQuizQuestionCount\(\s*recovered,/,
);
assert.match(
  sessionSource,
  /const questionsPerLesson = WEEKLY_QUIZ_QUESTIONS_PER_LESSON/,
);
assert.match(
  starpathSource,
  /return assertWeeklyQuizQuestionCount\(\s*builder\(\),/,
);

console.log(
  "Weekly quiz contract passed: all realms require exactly 15 questions, with 5 questions from each lesson.",
);
