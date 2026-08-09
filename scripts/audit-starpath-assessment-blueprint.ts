import assert from "node:assert/strict";
import fs from "node:fs";
import {
  STARPATH_ASSESSMENT_BLUEPRINTS,
  validateStarpathAssessmentBlueprints,
} from "../data/assessments/starpathAssessmentBlueprint";
import { STARPATH_MISCONCEPTION_LIBRARY } from "../data/assessments/starpathMisconceptions";

const EXPECTED_CODES: Record<string, string[]> = {
  Foundation: ["AC9MFSP01", "AC9MFSP02"],
  "Year 1": ["AC9M1SP01", "AC9M1SP02"],
  "Year 2": ["AC9M2SP01", "AC9M2SP02"],
  "Year 3": ["AC9M3SP01", "AC9M3SP02"],
  "Year 4": ["AC9M4SP01", "AC9M4SP02", "AC9M4SP03"],
  "Year 5": ["AC9M5SP01", "AC9M5SP02", "AC9M5SP03"],
  "Year 6": ["AC9M6SP01", "AC9M6SP02", "AC9M6SP03"],
};

const EXPECTED_ALLOCATIONS: Record<string, number[]> = {
  Foundation: [10, 10],
  "Year 1": [12, 8],
  "Year 2": [10, 10],
  "Year 3": [8, 12],
  "Year 4": [7, 6, 7],
  "Year 5": [7, 6, 7],
  "Year 6": [6, 6, 8],
};

const issues = validateStarpathAssessmentBlueprints();
assert.deepEqual(issues, [], issues.join("\n"));
assert.equal(STARPATH_ASSESSMENT_BLUEPRINTS.length, 7);
assert.equal(STARPATH_ASSESSMENT_BLUEPRINTS.reduce((sum, blueprint) => sum + blueprint.forms.length, 0), 13);
assert.equal(STARPATH_ASSESSMENT_BLUEPRINTS.reduce((sum, blueprint) => sum + blueprint.descriptors.length, 0), 17);
assert(STARPATH_MISCONCEPTION_LIBRARY.length >= 30);

const review = fs.readFileSync(new URL("../docs/starpath/assessment-blueprint.md", import.meta.url), "utf8");
assert.match(review, /Conditionally approved - assessment generation remains blocked/);
assert.match(review, /mathematics-curriculum-content-f-6-v9 \(4\)\.pdf/);
assert.match(review, /existing Ground Starpath post-test remains a legacy implementation/);

for (const blueprint of STARPATH_ASSESSMENT_BLUEPRINTS) {
  assert.deepEqual(blueprint.descriptors.map((item) => item.code), EXPECTED_CODES[blueprint.yearLabel]);
  assert.deepEqual(blueprint.descriptors.map((item) => item.allocation.posttest), EXPECTED_ALLOCATIONS[blueprint.yearLabel]);
  assert.equal(blueprint.approvalStatus, "conditionally-approved");
  assert.equal(blueprint.releaseBlocked, true);
  assert.equal(blueprint.forms.length, blueprint.level === 0 ? 1 : 2);
  for (const form of blueprint.forms) {
    assert.equal(form.questionCount, 20);
    assert.equal(form.passPercent, 85);
  }
  for (const item of blueprint.descriptors) {
    assert.match(review, new RegExp(`\\b${item.code}\\b`));
    assert.equal(item.curriculumMapping.implementationStatus, "mapped-unverified");
  }
}

const rows = STARPATH_ASSESSMENT_BLUEPRINTS.flatMap((blueprint) => blueprint.forms.map((form) => ({
  level: blueprint.yearLabel,
  form: form.kind,
  descriptors: blueprint.descriptors.length,
  constructedMinimum: form.responseMix.constructedOrManipulatedMinimum,
  selectedMaximum: form.responseMix.selectedResponseMaximum,
  reasoning: form.cognitiveDemandMix.reasoning,
  transfer: form.cognitiveDemandMix.transfer,
  curriculumBlockers: blueprint.descriptors.filter((item) => item.curriculumMapping.implementationStatus !== "aligned").length,
})));

console.table(rows);
console.log(`Starpath assessment blueprint audit passed: 7 levels, 13 forms, 17 ACv9 Space descriptors and ${STARPATH_MISCONCEPTION_LIBRARY.length} canonical misconceptions.`);
