import assert from "node:assert/strict";
import { generateQuestionForLessonActivity } from "../data/activities/year2/lessonEngine";
import { NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS } from "../data/assessments/numberNexusAssessmentBlueprint";
import { PROGRAMS_BY_YEAR } from "../data/programs";

const year2Blueprint = NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS.find((blueprint) => blueprint.level === 2);
assert(year2Blueprint);
assert(
  year2Blueprint.descriptors.every(
    (descriptor) => descriptor.curriculumMapping.implementationStatus === "aligned",
  ),
  "Year 2 still has a curriculum blocker.",
);

const year2Weeks = PROGRAMS_BY_YEAR["Year 2"];
const targetLessons = [
  year2Weeks.find((week) => week.week === 8)?.lessons.find((lesson) => lesson.lesson === 1),
  year2Weeks.find((week) => week.week === 10)?.lessons.find((lesson) => lesson.lesson === 3),
];

for (const lesson of targetLessons) {
  assert(lesson, "The AC9M2A03 teaching sequence is incomplete.");
  assert(lesson.curriculum.includes("AC9M2A03"), `${lesson.id} must carry AC9M2A03.`);
  const deriveActivity = lesson.activities?.find(
    (activity) => activity.activityType === "fact_family" && activity.config.mode === "derive_twos",
  );
  assert(deriveActivity, `${lesson.id} must explicitly derive twos facts through doubling and halving.`);

  for (let index = 0; index < 100; index += 1) {
    const question = generateQuestionForLessonActivity(lesson, deriveActivity);
    assert.equal(question.kind, "fact_family");
    assert.equal(question.mode, "derive_twos");
    assert.equal(question.familyType, "mult_div");
    assert.equal(question.family[0], 2);
    assert.match(question.prompt, /Double \d+ is \d+\./);
    assert.match(question.prompt, /Halve \d+ into 2 equal groups\./);
    assert.equal(question.answers.length, 1);
    assert(question.options.includes(question.answers[0]));
    assert.equal(new Set(question.options).size, question.options.length);
    if (lesson.week === 8) {
      assert.equal(question.visual, undefined, "Week 8 recall tasks must not add a dot array.");
    } else {
      assert.equal(question.visual?.rows, 2);
      assert.equal(question.visual?.columns, question.family[1]);
    }
    assert.equal(question.family[0] * question.family[1], question.family[2]);
  }
}

console.log(
  "Number Nexus Year 2 Curriculum Completion passed: all 9 descriptors are aligned; Weeks 8 and 10 explicitly derive related twos division facts through doubling and halving; Week 8 remains recall-focused while Week 10 retains its array model; 200 generated tasks were valid.",
);
