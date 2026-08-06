import assert from "node:assert/strict";
import { NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS } from "../data/assessments/numberNexusAssessmentBlueprint";
import { generatePrepWeek4Task, resetPrepWeek4TaskSessionState } from "../data/activities/prep/week4";
import { generatePrepWeek9Task, resetPrepWeek9TaskSessionState } from "../data/activities/prep/week9";
import { generatePrepWeek10Task, resetPrepWeek10TaskSessionState } from "../data/activities/prep/week10";
import { generatePrepWeek11Task, resetPrepWeek11TaskSessionState } from "../data/activities/prep/week11";
import { PROGRAMS_BY_YEAR } from "../data/programs";

const ground = NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS.find((blueprint) => blueprint.level === 0);
assert(ground);

const scopedCodes = ["AC9MFN02", "AC9MFN05", "AC9MFN06", "AC9MFA01"];
for (const code of scopedCodes) {
  assert.equal(
    ground.descriptors.find((descriptor) => descriptor.code === code)?.curriculumMapping.implementationStatus,
    "aligned",
    `${code} must be aligned before Phase N1 can pass.`,
  );
}

const prepWeeks = PROGRAMS_BY_YEAR.Prep;
const expectedWeekCodes: Record<number, string> = {
  4: "AC9MFN02",
  9: "AC9MFN05",
  10: "AC9MFN06",
  11: "AC9MFA01",
};
for (const [weekNumber, code] of Object.entries(expectedWeekCodes)) {
  const week = prepWeeks.find((item) => item.week === Number(weekNumber));
  assert(week?.curriculum.includes(code as never), `Ground Week ${weekNumber} must carry ${code}.`);
  assert(week?.lessons.every((lesson) => lesson.curriculum.includes(code as never)), `Every Ground Week ${weekNumber} lesson must carry ${code}.`);
}

resetPrepWeek4TaskSessionState();
for (const lesson of [1, 2, 3]) {
  for (let index = 0; index < 60; index += 1) {
    const task = generatePrepWeek4Task(`y0-w4-l${lesson}`, "hard");
    const values = [
      "targetNumber" in task ? task.targetNumber : undefined,
      "shownQuantity" in task ? task.shownQuantity : undefined,
      "shownSecondQuantity" in task ? task.shownSecondQuantity : undefined,
    ].filter((value): value is number => typeof value === "number");
    assert(values.length > 0, `Week 4 lesson ${lesson} generated a task without a quantity.`);
    assert(values.every((value) => value >= 1 && value <= 5), `Week 4 lesson ${lesson} exceeded the AC9MFN02 subitising boundary: ${values.join(", ")}`);
  }
}

resetPrepWeek9TaskSessionState();
for (const lesson of [1, 2, 3]) {
  const seen = new Set<string>();
  for (let index = 0; index < 60; index += 1) {
    const task = generatePrepWeek9Task(`y0-w9-l${lesson}`, "hard");
    assert.equal(task.kind, "groundFoundation");
    assert(task.mode === "add_to" || task.mode === "take_away");
    seen.add(task.mode);
    if (task.mode === "add_to") assert(task.start > 0 && task.change > 0 && task.start + task.change <= 10);
    if (task.mode === "take_away") assert(task.change > 0 && task.change < task.total && task.total <= 10);
  }
  if (lesson === 1) assert.deepEqual([...seen], ["add_to"]);
  if (lesson === 2) assert.deepEqual([...seen], ["take_away"]);
  if (lesson === 3) assert.deepEqual([...seen].sort(), ["add_to", "take_away"]);
}

resetPrepWeek10TaskSessionState();
for (const lesson of [1, 2, 3]) {
  const seen = new Set<string>();
  for (let index = 0; index < 60; index += 1) {
    const task = generatePrepWeek10Task(`y0-w10-l${lesson}`, "hard");
    assert.equal(task.kind, "groundFoundation");
    assert(task.mode === "equal_share" || task.mode === "equal_group");
    seen.add(task.mode);
    if (task.mode === "equal_share") assert.equal(task.total % task.groups, 0);
    if (task.mode === "equal_group") assert.equal(task.total % task.groupSize, 0);
  }
  if (lesson === 1) assert.deepEqual([...seen], ["equal_share"]);
  if (lesson === 2) assert.deepEqual([...seen], ["equal_group"]);
  if (lesson === 3) assert.deepEqual([...seen].sort(), ["equal_group", "equal_share"]);
}

resetPrepWeek11TaskSessionState();
for (const lesson of [1, 2, 3]) {
  for (let index = 0; index < 60; index += 1) {
    const task = generatePrepWeek11Task(`y0-w11-l${lesson}`, "hard");
    assert.equal(task.kind, "groundFoundation");
    if (lesson < 3) {
      assert.equal(task.mode, "continue_pattern");
      assert.equal(task.sequence.at(-1), "?");
      assert(task.options.includes(task.answer));
    } else {
      assert.equal(task.mode, "create_pattern");
      assert(task.repeatUnit.length >= 2);
      assert(task.repeats >= 2);
    }
  }
}

console.log("Number Nexus Curriculum Completion Phase N1 passed and remains frozen: AC9MFN02, AC9MFN05, AC9MFN06 and AC9MFA01 lesson coverage is aligned, bounded and repeatedly solvable. Weekly quizzes remain outside this audit.");
