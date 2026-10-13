import assert from "node:assert/strict";
import { buildHomeTrendRows } from "../lib/home-trends.ts";
import { formatClassYearLevels, normalizeClassYearLevels, SCHOOL_YEAR_LEVEL_OPTIONS } from "../lib/studentLevelLabel.ts";

// Reporting moment is mid-morning UTC, so the reporting day is unfinished.
const generatedAt = "2026-10-13T02:30:00Z";
const reportingDay = Date.parse("2026-10-13T00:00:00Z");
const daysBack = (n) => new Date(reportingDay - n * 86400000).toISOString().slice(0, 10);
const topic = (name, yearLevel, averageAccuracy, evidenceCount = 12, students = 8) => ({
  topic: name, yearLevel, realmId: null, strand: null, strandLabel: null, band: null,
  students, evidenceCount, averageAccuracy,
});
const snapshot = (engagementTrend, curriculum = []) => ({ generatedAt, engagementTrend, curriculum });
const day = (n, activities) => ({ date: daysBack(n), activeStudents: 1, activities });

// Activity compares two complete seven-day periods; topics are ranked by accuracy.
{
  const rows = buildHomeTrendRows(
    snapshot(
      [day(1, 10), day(2, 10), day(3, 10), day(8, 20), day(9, 20), day(10, 20)],
      [topic("Fractions", "Year 4", 48), topic("Time", "Year 3", 55), topic("Area", "Year 4", 70),
       topic("Place value", "Year 3", 91), topic("Rare topic", "Year 3", 10, 2)],
    ),
    "school",
  );
  assert.deepEqual(rows.map((r) => [r.tone, r.title, r.value]), [
    ["down", "Learning activity", "−50%"],
    ["watch", "Fractions · Year 4", "48%"],
    ["watch", "Time · Year 3", "55%"],
    ["up", "Place value · Year 3", "91%"],
  ]);
  assert.match(rows[0].detail, /last 7 full days.*7 days before/);
}

// The unfinished reporting day never counts, so a quiet morning is not a decline.
{
  const steady = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((n) => day(n, 10));
  assert.deepEqual(buildHomeTrendRows(snapshot([day(0, 1), ...steady]), "class"), []);
  assert.deepEqual(buildHomeTrendRows(snapshot([day(0, 500), ...steady]), "class"), []);
}

// Period edges: days 1–7 are recent, days 8–14 are previous, day 15+ is ignored.
{
  const rows = buildHomeTrendRows(snapshot([day(7, 30), day(8, 10), day(14, 10), day(15, 900)]), "class");
  assert.deepEqual(rows.map((r) => r.value), ["+50%"]);
}

// Class scope drops the year label; thin evidence or activity shows nothing.
{
  const rows = buildHomeTrendRows(snapshot([day(9, 3)], [topic("Fractions", "Year 4", 48)]), "class");
  assert.deepEqual(rows.map((r) => r.title), ["Fractions"]);
  assert.deepEqual(buildHomeTrendRows(snapshot([], [topic("Fractions", "Year 4", 48, 3)]), "school"), []);
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
