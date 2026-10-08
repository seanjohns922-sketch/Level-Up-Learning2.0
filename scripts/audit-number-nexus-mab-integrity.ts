import assert from "node:assert/strict";
import {
  buildLessonActivityPool,
  derivePlaceValueBuilderAnswer,
  missingMabPrompt,
  generateQuestion,
  type MABVisualData,
  type PlaceValueBuilderQuestion,
  type PlaceValueName,
  type Year2QuestionData,
} from "../data/activities/year2/lessonEngine";
import { programs } from "../data/programs";
import type { LessonActivity } from "../data/programs/types";

const levels = [2, 3, 4, 5] as const;
type MABCountField =
  | "hundredThousands"
  | "tenThousands"
  | "thousands"
  | "hundreds"
  | "tens"
  | "ones";

const placeFields: Record<PlaceValueName, MABCountField> = {
  hundred_thousands: "hundredThousands",
  ten_thousands: "tenThousands",
  thousands: "thousands",
  hundreds: "hundreds",
  tens: "tens",
  ones: "ones",
};

let generatedQuestions = 0;
let mabQuestions = 0;

function expectsMab(activity: LessonActivity) {
  return (
    activity.activityType === "place_value_builder" ||
    activity.config.sourceActivityType === "place_value_builder"
  );
}

function mabFromQuestion(question: Year2QuestionData): MABVisualData | PlaceValueBuilderQuestion | null {
  if (question.kind === "place_value_builder") return question;
  if (
    (question.kind === "multiple_choice" || question.kind === "typed_response") &&
    question.visual?.type === "mab"
  ) {
    return question.visual;
  }
  return null;
}

function assertValidMab(
  mab: MABVisualData | PlaceValueBuilderQuestion,
  context: string,
  missingPart: boolean
) {
  assert(mab.placeValues.length > 0, `${context} generated an MAB with no place-value columns.`);

  const values = mab.placeValues.map((place) => mab[placeFields[place]] as number | null);
  for (const value of values) {
    assert(
      value === null || (Number.isInteger(value) && value >= 0 && value <= 9),
      `${context} generated an invalid MAB block count: ${String(value)}.`
    );
  }
  assert(values.some((value) => value === null || value > 0), `${context} generated an empty MAB model.`);

  const hiddenCount = values.filter((value) => value === null).length;
  assert.equal(
    hiddenCount,
    missingPart ? 1 : 0,
    `${context} ${missingPart ? "must hide exactly one" : "must not hide a"} place value.`
  );
}

// Regression: the renderer receives null for hidden blocks. Null must not be
// marked as zero; use the target number to recover that place's value.
for (const [targetNumber, place, expected] of [
  [596, "ones", 6], [596, "tens", 90], [596, "hundreds", 500],
  [506, "tens", 0], [1000, "thousands", 1000],
  [123456, "ten_thousands", 20000], [123456, "hundred_thousands", 100000],
] as const) {
  assert.equal(derivePlaceValueBuilderAnswer({
    targetNumber, mode: "missing_mab_part", place,
    hundredThousands: null, tenThousands: null, thousands: null,
    hundreds: null, tens: null, ones: null,
  }), expected, `Hidden ${place} in ${targetNumber}`);
}
assert.equal(missingMabPrompt(596, "ones"), "The number is 596. How many ones are missing?");
assert.match(missingMabPrompt(596, "tens"), /total value of the missing tens/);

// Reproduce the photographed typed question with the last place (ones) hidden.
const originalRandom = Math.random;
try {
  Math.random = () => 0.999;
  const photographedQuestion = generateQuestion(2, programs[2][0]!.lessons[1]!, {
    activityType: "typed_response",
    weight: 1,
    config: { min: 596, max: 596, mode: "missing_mab_part", sourceActivityType: "place_value_builder", hideOnePlaceValue: true },
  });
  assert.equal(photographedQuestion.kind, "typed_response");
  assert.equal(photographedQuestion.answer, "6");
  const visual = mabFromQuestion(photographedQuestion);
  assert(visual);
  assert.equal(visual.hundreds, 5);
  assert.equal(visual.tens, 9);
  assert.equal(visual.ones, null);
} finally {
  Math.random = originalRandom;
}

const thousandBoundaryLesson = programs[2][0]!.lessons[0]!;
const thousandBoundaryActivity: LessonActivity = {
  activityType: "typed_response",
  weight: 1,
  config: {
    min: 1000,
    max: 1000,
    mode: "identify_number",
    sourceActivityType: "place_value_builder",
  },
};
const thousandBoundaryQuestion = generateQuestion(2, thousandBoundaryLesson, thousandBoundaryActivity);
const thousandBoundaryMab = mabFromQuestion(thousandBoundaryQuestion);
assert(thousandBoundaryMab, "The 1,000 boundary did not generate an MAB model.");
assert(thousandBoundaryMab.placeValues.includes("thousands"), "The 1,000 boundary omitted its thousands column.");
assert.equal(thousandBoundaryMab.thousands, 1, "The 1,000 boundary did not render one thousands block.");

for (const level of levels) {
  for (const week of programs[level]) {
    for (const lesson of week.lessons) {
      const pool = buildLessonActivityPool(level, lesson);
      assert.equal(
        pool.violations.length,
        0,
        `${lesson.id} has invalid activity configuration: ${pool.violations.map((item) => item.message).join(" | ")}`
      );

      for (const activity of pool.activities) {
        for (let sample = 0; sample < 25; sample += 1) {
          const question = generateQuestion(level, lesson, activity);
          const context = `${lesson.id} ${activity.activityType} sample ${sample + 1}`;
          const mab = mabFromQuestion(question);
          const intendedMab = expectsMab(activity);

          assert.equal(Boolean(mab), intendedMab, `${context} generated the wrong visual family.`);
          if (/\bMAB\b/i.test(question.prompt)) {
            assert(mab, `${context} refers to MAB without displaying a model.`);
          }

          if (mab) {
            const missingPart =
              question.kind === "place_value_builder"
                ? question.mode === "missing_mab_part"
                : activity.config.mode === "missing_mab_part";
            assertValidMab(mab, context, missingPart);
            if (missingPart) {
              assert("answer" in question, `${context}: missing answer key`);
              const target = question.kind === "place_value_builder"
                ? question.targetNumber
                : Number(question.prompt.match(/The number is (\d+)/)?.[1]);
              assert(Number.isFinite(target), `${context}: missing target number`);
              const multipliers = {hundred_thousands: 100000, ten_thousands: 10000, thousands: 1000, hundreds: 100, tens: 10, ones: 1};
              const visibleTotal = mab.placeValues.reduce((sum, place) =>
                sum + (mab[placeFields[place]] ?? 0) * multipliers[place], 0);
              assert.equal(Number(question.answer), target - visibleTotal, `${context}: incorrect missing value`);
              if (question.kind === "place_value_builder") {
                assert.equal(derivePlaceValueBuilderAnswer(question), target - visibleTotal, `${context}: renderer marking differs from question key`);
              }
            }
            mabQuestions += 1;
          }
          generatedQuestions += 1;
        }
      }
    }
  }
}

console.log("Number Nexus MAB integrity audit passed.");
console.log(`Generated questions checked: ${generatedQuestions}.`);
console.log(`MAB questions checked: ${mabQuestions}; all models present, valid and non-revealing.`);
