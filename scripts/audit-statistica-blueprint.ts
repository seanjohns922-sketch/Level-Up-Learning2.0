import assert from "node:assert/strict";
import { getAllRealms, getCurriculumPlan, getGenresForYear } from "../data/programs/genres";
import { STATISTICA_META, STATISTICA_PROGRAMS } from "../data/programs/statistica";
import { REALM_REGISTRY } from "../lib/realms/realm-registry";

assert.equal(STATISTICA_META.realm, "Statistica");
assert.equal(STATISTICA_META.strand, "Statistics");
assert.deepEqual(STATISTICA_META.levels, [1, 2, 3, 4, 5, 6]);
assert.equal(REALM_REGISTRY.statistics.totalWeeks, 6);
assert.deepEqual(REALM_REGISTRY.statistics.levelLabels, ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"]);

const catalogueEntry = getAllRealms().find((realm) => realm.id === "statistics");
assert(catalogueEntry, "Statistica must exist in the realm catalogue.");
assert.equal(catalogueEntry.realm, "Statistica");
assert.equal(catalogueEntry.hasContent, false, "Statistica remains preview-only until quizzes and assessments pass release gates.");

for (const level of STATISTICA_META.levels) {
  const yearLabel = `Year ${level}`;
  const direct = STATISTICA_PROGRAMS[level];
  const resolved = getCurriculumPlan(yearLabel, "statistics");
  const genre = getGenresForYear(yearLabel).find((candidate) => candidate.id === "statistics");
  assert(genre, `Statistics genre missing for ${yearLabel}.`);
  assert.equal(genre.available, false, "Statistica must remain preview-only during assessment construction.");
  assert.equal(direct.length, 6, `${yearLabel} must have six focused weeks.`);
  assert.deepEqual(resolved, direct, `${yearLabel} does not resolve to the canonical Statistica program.`);

  direct.forEach((week, weekIndex) => {
    assert.equal(week.week, weekIndex + 1);
    assert.equal(week.lessons.length, 3, `${yearLabel} Week ${week.week} must contain three lessons.`);
    assert(week.curriculum.length > 0 && !week.curriculum.includes("ALL"), `${yearLabel} Week ${week.week} needs explicit AC9 curriculum codes.`);
    week.lessons.forEach((lesson, lessonIndex) => {
      assert.equal(lesson.id, `y${level}-statistics-w${week.week}-l${lessonIndex + 1}`);
      assert.equal(lesson.config?.realmId, "statistics");
      assert.equal(lesson.activityType, "statistica");
      assert(lesson.focus.includes("Statistics:"), `${lesson.id} needs teacher-readable focus text.`);
    });
  });
}

assert.equal(getCurriculumPlan("Prep", "statistics").length, 0, "Statistica starts at Level 1 and has no Prep curriculum.");

console.log("Statistica blueprint audit passed: Levels 1-6 use one canonical six-week program; Prep is excluded.");
