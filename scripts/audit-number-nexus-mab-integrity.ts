import assert from "node:assert/strict";
import {
  buildLessonActivityPool,
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
