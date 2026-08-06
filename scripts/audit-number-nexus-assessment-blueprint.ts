import assert from "node:assert/strict";
import fs from "node:fs";
import {
  NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS,
  validateNumberNexusAssessmentBlueprints,
} from "../data/assessments/numberNexusAssessmentBlueprint";
import { NUMBER_NEXUS_MISCONCEPTION_LIBRARY } from "../data/assessments/numberNexusMisconceptions";
import { PROGRAMS_BY_YEAR } from "../data/programs";

const EXPECTED_CODES: Record<string, string[]> = {
  Ground: ["AC9MFN01", "AC9MFN02", "AC9MFN03", "AC9MFN04", "AC9MFN05", "AC9MFN06", "AC9MFA01"],
  "Year 1": ["AC9M1N01", "AC9M1N02", "AC9M1N03", "AC9M1N04", "AC9M1N05", "AC9M1N06", "AC9M1A01", "AC9M1A02"],
  "Year 2": ["AC9M2N01", "AC9M2N02", "AC9M2N03", "AC9M2N04", "AC9M2N05", "AC9M2N06", "AC9M2A01", "AC9M2A02", "AC9M2A03"],
  "Year 3": ["AC9M3N01", "AC9M3N02", "AC9M3N03", "AC9M3N04", "AC9M3N05", "AC9M3N06", "AC9M3N07", "AC9M3M06"],
  "Year 4": ["AC9M4N01", "AC9M4N02", "AC9M4N03", "AC9M4N04", "AC9M4N05", "AC9M4N06", "AC9M4N07", "AC9M4N08", "AC9M4N09"],
  "Year 5": ["AC9M5N01", "AC9M5N02", "AC9M5N03", "AC9M5N04", "AC9M5N05", "AC9M5N06", "AC9M5N07", "AC9M5N08", "AC9M5N09", "AC9M5N10"],
  "Year 6": ["AC9M6N01", "AC9M6N02", "AC9M6N03", "AC9M6N04", "AC9M6N05", "AC9M6N06", "AC9M6N07", "AC9M6N08", "AC9M6N09"],
};

const issues = validateNumberNexusAssessmentBlueprints();
assert.deepEqual(issues, [], issues.join("\n"));
assert.equal(NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS.length, 7);
assert(NUMBER_NEXUS_MISCONCEPTION_LIBRARY.length >= 40);

const review = fs.readFileSync(new URL("../docs/number-nexus/assessment-blueprint.md", import.meta.url), "utf8");
assert.match(review, /Conditionally approved - assessment generation remains blocked/);
assert.doesNotMatch(review, /Status: \*\*Approved/);
assert.match(review, /Level 3-Level 6 Algebra is owned by Pattern Peaks/);

for (const blueprint of NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS) {
  assert.deepEqual(blueprint.descriptors.map((item) => item.code), EXPECTED_CODES[blueprint.yearLabel]);
  assert.equal(blueprint.approvalStatus, "conditionally-approved");
  assert.equal(blueprint.releaseBlocked, true);
  for (const item of blueprint.descriptors) assert.match(review, new RegExp(`\\b${item.code}\\b`));
  if (blueprint.level >= 3) {
    assert.equal(blueprint.descriptors.some((item) => /AC9M[3-6]A/.test(item.code)), false, `${blueprint.yearLabel} leaks Algebra into Number Nexus.`);
    assert(blueprint.crossRealmCoverage?.every((boundary) => boundary.ownerRealm === "Pattern Peaks (Algebra)"));
    const boundaryCodes = new Set(blueprint.crossRealmCoverage?.flatMap((boundary) => boundary.codes) ?? []);
    const liveAlgebraCodes = new Set(
      (PROGRAMS_BY_YEAR[blueprint.yearLabel.replace("Ground", "Prep")] ?? [])
        .flatMap((week) => week.lessons)
        .flatMap((lesson) => lesson.curriculum)
        .filter((code) => /^AC9M[3-6]A/.test(code)),
    );
    for (const code of liveAlgebraCodes) assert(boundaryCodes.has(code), `${blueprint.yearLabel} live program uses ${code} without a Pattern Peaks relocation boundary.`);
  }
}

const year3 = NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS.find((blueprint) => blueprint.level === 3);
assert(year3?.descriptors.some((item) => item.code === "AC9M3M06"));
assert.equal(year3?.descriptors.find((item) => item.code === "AC9M3M06")?.curriculumMapping.implementationStatus, "missing");
assert.equal(NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS[0]?.descriptors.some((item) => item.code.includes("SP")), false, "Ground Number Nexus blueprint contains Space content.");

const rows = NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS.flatMap((blueprint) => blueprint.forms.map((form) => ({
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
console.log(`Number Nexus assessment blueprint audit passed: ${NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS.length} levels, ${NUMBER_NEXUS_MISCONCEPTION_LIBRARY.length} canonical misconceptions, Algebra ownership split enforced.`);
