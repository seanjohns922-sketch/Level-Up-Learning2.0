import assert from "node:assert/strict";
import { buildHomeTrendRows } from "../lib/home-trends.ts";
import { formatClassYearLevels, normalizeClassYearLevels, SCHOOL_YEAR_LEVEL_OPTIONS } from "../lib/studentLevelLabel.ts";

// Reporting day is Tuesday 13 Oct 2026 (mid-morning UTC, unfinished).
// Latest completed school week: Mon 5 – Fri 9 Oct; the week before: 28 Sep – 2 Oct.
const at = (iso) => `${iso}T02:30:00Z`;
const topic = (name, yearLevel, averageAccuracy, evidenceCount = 12, students = 8) => ({
  topic: name, yearLevel, realmId: null, strand: null, strandLabel: null, band: null,
  students, evidenceCount, averageAccuracy,
});
const snapshot = (engagementTrend, curriculum = [], generatedAt = at("2026-10-13")) => ({ generatedAt, engagementTrend, curriculum });
const on = (date, activities) => ({ date, activeStudents: 1, activities });
const week = (monday, perDay) => [0, 1, 2, 3, 4].map((i) => on(new Date(Date.parse(`${monday}T00:00:00Z`) + i * 86400000).toISOString().slice(0, 10), perDay));

// Completed school weeks are compared; topics are ranked by accuracy.
{
  const rows = buildHomeTrendRows(
    snapshot(
      [...week("2026-10-05", 10), ...week("2026-09-28", 20)],
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
  assert.equal(rows[0].detail, "50 lessons and quizzes in the school week of 5 Oct, 100 the week before");
}

// The week in progress and weekends never count, so they cannot read as a drop.
{
  const steady = [...week("2026-10-05", 10), ...week("2026-09-28", 10)];
  const noise = [on("2026-10-12", 0), on("2026-10-13", 900), on("2026-10-10", 400), on("2026-10-11", 400), on("2026-10-03", 0)];
  assert.deepEqual(buildHomeTrendRows(snapshot([...steady, ...noise]), "class"), []);
}

// Which week is "completed": on Friday the current week is still running;
// from Saturday it is finished and becomes the latest week.
{
  const data = [...week("2026-10-12", 30), ...week("2026-10-05", 20), ...week("2026-09-28", 10)];
  assert.deepEqual(buildHomeTrendRows(snapshot(data, [], at("2026-10-16")), "class").map((r) => r.value), ["+100%"]);
  assert.deepEqual(buildHomeTrendRows(snapshot(data, [], at("2026-10-17")), "class").map((r) => r.value), ["+50%"]);
  assert.deepEqual(buildHomeTrendRows(snapshot(data, [], at("2026-10-18")), "class").map((r) => r.value), ["+50%"]);
  assert.deepEqual(buildHomeTrendRows(snapshot(data, [], at("2026-10-19")), "class").map((r) => r.value), ["+50%"]);
}

// Class scope drops the year label; thin evidence or activity shows nothing.
{
  const rows = buildHomeTrendRows(snapshot([on("2026-10-06", 3)], [topic("Fractions", "Year 4", 48)]), "class");
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
