import assert from "node:assert/strict";
import fs from "node:fs";
import {
  MEASURELANDS_ASSESSMENT_BLUEPRINTS,
  validateMeasurelandsAssessmentBlueprints,
} from "../data/assessments/measurelandsAssessmentBlueprint.ts";

const EXPECTED_CODES = {
  Ground: ["AC9MFM01", "AC9MFM02"],
  "Year 1": ["AC9M1M01", "AC9M1M02", "AC9M1M03"],
  "Year 2": ["AC9M2M01", "AC9M2M02", "AC9M2M03", "AC9M2M04", "AC9M2M05"],
  "Year 3": ["AC9M3M01", "AC9M3M02", "AC9M3M03", "AC9M3M04", "AC9M3M05"],
  "Year 4": ["AC9M4M01", "AC9M4M02", "AC9M4M03", "AC9M4M04"],
  "Year 5": ["AC9M5M01", "AC9M5M02", "AC9M5M03", "AC9M5M04"],
  "Year 6": ["AC9M6M01", "AC9M6M02", "AC9M6M03", "AC9M6M04"],
};

const issues = validateMeasurelandsAssessmentBlueprints();
assert.deepEqual(issues, [], issues.join("\n"));
assert.equal(MEASURELANDS_ASSESSMENT_BLUEPRINTS.length, 7);

const approvalDocument = fs.readFileSync(
  new URL("../docs/measurelands/assessment-blueprint.md", import.meta.url),
  "utf8",
);
assert.match(approvalDocument, /Status: \*\*Approved; independent-bank rebuild pending\*\*/);
assert.doesNotMatch(approvalDocument, /Draft - awaiting explicit approval/);

for (const blueprint of MEASURELANDS_ASSESSMENT_BLUEPRINTS) {
  assert.deepEqual(
    blueprint.descriptors.map((descriptor) => descriptor.code),
    EXPECTED_CODES[blueprint.yearLabel],
    `${blueprint.yearLabel} does not contain the complete AC v9 Measurement descriptor sequence.`,
  );
  assert.equal(blueprint.approvalStatus, "approved");
  for (const descriptor of blueprint.descriptors) {
    assert.match(
      approvalDocument,
      new RegExp(`\\b${descriptor.code}\\b`),
      `${descriptor.code} is missing from the approval document.`,
    );
  }
  for (const coverage of blueprint.crossRealmCoverage ?? []) {
    assert.match(
      approvalDocument,
      new RegExp(`\\b${coverage.code}\\b`),
      `${coverage.code} cross-realm ownership is missing from the approval document.`,
    );
  }
}

const year3 = MEASURELANDS_ASSESSMENT_BLUEPRINTS.find((blueprint) => blueprint.level === 3);
assert(year3);
assert(!year3.descriptors.some((descriptor) => descriptor.code === "AC9M3M06"));
assert.deepEqual(year3.crossRealmCoverage, [
  {
    code: "AC9M3M06",
    ownerRealm: "Number Nexus",
    implementationStatus: "planned-not-verified",
    rationale:
      "Money descriptors are intentionally excluded from Measurelands. These outcomes are assessed within Number Nexus to preserve thematic consistency. Measurelands assesses only physical measurement concepts.",
    coverageRequirement:
      "Number Nexus must teach and assess dollar-cent relationships and equivalent money representations before Year 3 curriculum coverage can be marked complete.",
  },
]);

const year6 = MEASURELANDS_ASSESSMENT_BLUEPRINTS.find((blueprint) => blueprint.level === 6);
assert(year6);
assert(!year6.descriptors.some((descriptor) => /volume|cubic/i.test(descriptor.description)));
assert(!year6.descriptors.some((descriptor) => descriptor.code === "ALL"));

const rows = MEASURELANDS_ASSESSMENT_BLUEPRINTS.flatMap((blueprint) =>
  blueprint.forms.map((form) => ({
    level: blueprint.yearLabel,
    form: form.kind,
    questions: form.questionCount,
    descriptors: blueprint.descriptors.length,
    challenging: form.difficultyMix.challenging,
    reasoning: form.cognitiveDemandMix.reasoning,
    constructedMinimum: form.responseMix.constructedOrManipulatedMinimum,
    status: blueprint.approvalStatus,
  })),
);

console.table(rows);
console.log("Measurelands assessment blueprint audit passed: 13 forms, explicit AC v9 realm ownership, approval gate locked.");
