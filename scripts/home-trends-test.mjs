import assert from "node:assert/strict";
import { buildHomeTrendRows } from "../lib/home-trends.ts";
import { formatClassYearLevels, normalizeClassYearLevels, SCHOOL_YEAR_LEVEL_OPTIONS } from "../lib/studentLevelLabel.ts";

const topic = (name, yearLevel, averageAccuracy, evidenceCount = 12, students = 8) => ({
  topic: name, yearLevel, realmId: null, strand: null, strandLabel: null, band: null,
  students, evidenceCount, averageAccuracy,
});
const snapshot = (curriculum, engagementTrend = []) => ({ generatedAt: "2026-10-13T02:30:00Z", engagementTrend, curriculum });

// Weakest topics (below 60%) then the strongest (at or above the 80% quiz
// target); topics with fewer than five pieces of evidence are ignored.
{
  const rows = buildHomeTrendRows(
    snapshot([topic("Fractions", "Year 4", 48), topic("Time", "Year 3", 55), topic("Area", "Year 4", 70),
      topic("Money", "Year 3", 58), topic("Place value", "Year 3", 91), topic("Rare topic", "Year 3", 10, 2)]),
    "school",
  );
  assert.deepEqual(rows.map((r) => [r.tone, r.title, r.value]), [
    ["watch", "Fractions · Year 4", "48%"],
    ["watch", "Time · Year 3", "55%"],
    ["up", "Place value · Year 3", "91%"],
  ]);
}

// Activity changes are not shown at all: a big drop in lessons adds no row.
{
  const busyThenQuiet = [{ date: "2026-10-01", activeStudents: 9, activities: 200 }, { date: "2026-10-12", activeStudents: 1, activities: 1 }];
  assert.deepEqual(buildHomeTrendRows(snapshot([], busyThenQuiet), "school"), []);
}

// Class scope drops the year label; thin evidence shows nothing.
{
  assert.deepEqual(buildHomeTrendRows(snapshot([topic("Fractions", "Year 4", 48)]), "class").map((r) => r.title), ["Fractions"]);
  assert.deepEqual(buildHomeTrendRows(snapshot([topic("Fractions", "Year 4", 48, 3)]), "school"), []);
}

// Year levels: separate entries, stray numbers, lists and ranges all expand fully.
const ALL = [...SCHOOL_YEAR_LEVEL_OPTIONS];
assert.deepEqual(normalizeClassYearLevels(["3", "Year 3", "Year 4"]), ["Year 3", "Year 4"]);
assert.deepEqual(normalizeClassYearLevels(["Year 6", "Prep", " year 2 ", null, ""]), ["Prep", "Year 2", "Year 6"]);
assert.deepEqual(normalizeClassYearLevels(["Prep – Year 6"]), ALL);
assert.deepEqual(normalizeClassYearLevels(["Prep-6"]), ALL);
assert.deepEqual(normalizeClassYearLevels(["Foundation to Year 2"]), ["Prep", "Year 1", "Year 2"]);
assert.deepEqual(normalizeClassYearLevels(["Years 3–4"]), ["Year 3", "Year 4"]);
assert.deepEqual(normalizeClassYearLevels(["Year 3–4"]), ["Year 3", "Year 4"]);
assert.deepEqual(normalizeClassYearLevels(["3/4"]), ["Year 3", "Year 4"]);
assert.deepEqual(normalizeClassYearLevels(["F/1"]), ["Prep", "Year 1"]);
assert.deepEqual(normalizeClassYearLevels(["Year 3, Year 4"]), ["Year 3", "Year 4"]);
assert.deepEqual(normalizeClassYearLevels(["Year 5-6", "Year 4"]), ["Year 4", "Year 5", "Year 6"]);
assert.deepEqual(normalizeClassYearLevels(["Mixed group", "Year 2"]), ["Year 2", "Mixed group"]);

assert.equal(formatClassYearLevels(["3", "Year 3", "Year 4"]), "Years 3–4");
assert.equal(formatClassYearLevels(["Prep – Year 6"]), "Prep – Year 6");
assert.equal(formatClassYearLevels(["Years 3–4"]), "Years 3–4");
assert.equal(formatClassYearLevels(["Year 5"]), "Year 5");
assert.equal(formatClassYearLevels(["Year 2", "Year 5"]), "Year 2, Year 5");
assert.equal(formatClassYearLevels([]), "");

// Saving from the class edit form: the form is seeded exactly as in
// app/teacher/classes/page.tsx (startClassEdit), then the teacher's ticks are
// applied to that list. A stored range must reach the save with every year.
{
  const seed = (cls) => normalizeClassYearLevels(cls.year_levels ?? (cls.year_level ? [cls.year_level] : []));
  assert.deepEqual(seed({ year_levels: ["Prep – Year 6"], year_level: null }), ALL);
  assert.deepEqual(seed({ year_levels: null, year_level: "Years 3–4" }), ["Year 3", "Year 4"]);
  // Unticking one year keeps every other year in the saved list.
  const saved = seed({ year_levels: ["Prep – Year 6"], year_level: null }).filter((y) => y !== "Year 6");
  assert.deepEqual(saved, ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"]);
}

console.log("PASS home trends and class year levels");
