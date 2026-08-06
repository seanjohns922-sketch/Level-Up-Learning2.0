import assert from "node:assert/strict";
import { NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS } from "../data/assessments/numberNexusAssessmentBlueprint";
import { PROGRAMS_BY_YEAR } from "../data/programs";
import {
  PATTERN_PEAKS_RELOCATION_LESSON_IDS,
  curriculumRealmFor,
  ownsAlgebraInNumberNexus,
} from "../data/programs/curriculumOwnership";
import { getGenresForYear } from "../data/programs/genres";

const yearLabelFor = (level: number) => level === 0 ? "Prep" : `Year ${level}`;
const algebraCode = (code: string) => /^AC9M(?:F|[1-6])A\d{2}$/.test(code);

assert.equal(ownsAlgebraInNumberNexus(2), true);
assert.equal(ownsAlgebraInNumberNexus(3), false);
assert.equal(curriculumRealmFor("AC9M3M06", 3), "Number Nexus");
assert.equal(curriculumRealmFor("AC9M3A01", 3), "Pattern Peaks");
assert.equal(getGenresForYear("Year 3").find((genre) => genre.id === "algebra")?.realm, "Pattern Peaks");

const rows = NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS.map((blueprint) => {
  const yearLabel = yearLabelFor(blueprint.level);
  const lessons = PROGRAMS_BY_YEAR[yearLabel]?.flatMap((week) => week.lessons) ?? [];
  const liveCodes = new Set<string>(lessons.flatMap((lesson) => lesson.curriculum));
  const staleMetadata = blueprint.descriptors.filter(
    (descriptor) => descriptor.curriculumMapping.implementationStatus === "incorrect-metadata",
  );
  assert.deepEqual(staleMetadata, [], `${blueprint.yearLabel} still contains incorrect-metadata findings.`);

  for (const descriptor of blueprint.descriptors) {
    if (descriptor.curriculumMapping.implementationStatus === "aligned") {
      assert(liveCodes.has(descriptor.code), `${blueprint.yearLabel} marks ${descriptor.code} aligned but no lesson carries the code.`);
    }
  }

  if (blueprint.level >= 3) {
    const actualRelocations = lessons
      .filter((lesson) => lesson.curriculum.some(algebraCode))
      .map((lesson) => lesson.id)
      .sort();
    const expectedRelocations = [...PATTERN_PEAKS_RELOCATION_LESSON_IDS[blueprint.level as 3 | 4 | 5 | 6]].sort();
    assert.deepEqual(actualRelocations, expectedRelocations, `${blueprint.yearLabel} Pattern Peaks relocation manifest is stale.`);
  }

  return {
    level: blueprint.yearLabel,
    aligned: blueprint.descriptors.filter((item) => item.curriculumMapping.implementationStatus === "aligned").length,
    partial: blueprint.descriptors.filter((item) => item.curriculumMapping.implementationStatus === "partial").length,
    missing: blueprint.descriptors.filter((item) => item.curriculumMapping.implementationStatus === "missing").length,
    incorrectMetadata: staleMetadata.length,
    patternPeaksRelocations: blueprint.level >= 3
      ? PATTERN_PEAKS_RELOCATION_LESSON_IDS[blueprint.level as 3 | 4 | 5 | 6].length
      : 0,
  };
});

console.table(rows);
console.log("Number Nexus Phase N1 curriculum audit passed: zero stale metadata findings; Pattern Peaks ownership manifest is current; assessment generation remains blocked by partial and missing coverage.");
