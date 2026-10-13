import assert from "node:assert/strict";
import { buildHomeTrendRows } from "../lib/home-trends.ts";
import { formatClassYearLevels, normalizeClassYearLevels } from "../lib/studentLevelLabel.ts";

const now = Date.parse("2026-10-13T00:00:00Z");
const daysAgo = (n) => new Date(now - n * 86400000).toISOString().slice(0, 10);
const topic = (name, yearLevel, averageAccuracy, evidenceCount = 12, students = 8) => ({
  topic: name, yearLevel, realmId: null, strand: null, strandLabel: null, band: null,
  students, evidenceCount, averageAccuracy,
});
const snapshot = (engagementTrend, curriculum) => ({ engagementTrend, curriculum });

// Activity falling week on week, two weak topics, one strong topic.
{
  const rows = buildHomeTrendRows(
    snapshot(
      [...[1, 2, 3].map((d) => ({ date: daysAgo(d), activeStudents: 5, activities: 10 })),
       ...[8, 9, 10].map((d) => ({ date: daysAgo(d), activeStudents: 9, activities: 20 }))],
      [topic("Fractions", "Year 4", 48), topic("Time", "Year 3", 55), topic("Area", "Year 4", 70),
       topic("Place value", "Year 3", 91), topic("Rare topic", "Year 3", 10, 2)],
    ),
    "school",
    now,
  );
  assert.deepEqual(rows.map((r) => [r.tone, r.title, r.value]), [
    ["down", "Learning activity", "−50%"],
    ["watch", "Fractions · Year 4", "48%"],
    ["watch", "Time · Year 3", "55%"],
    ["up", "Place value · Year 3", "91%"],
  ]);
}

// Class scope drops the year label; too little activity or evidence shows nothing.
{
  const rows = buildHomeTrendRows(
    snapshot([{ date: daysAgo(9), activeStudents: 1, activities: 3 }], [topic("Fractions", "Year 4", 48)]),
    "class",
    now,
  );
  assert.deepEqual(rows.map((r) => r.title), ["Fractions"]);
  assert.deepEqual(buildHomeTrendRows(snapshot([], [topic("Fractions", "Year 4", 48, 3)]), "school", now), []);
}

// Year levels: stray bare numbers collapse, order is school order, ranges read naturally.
assert.deepEqual(normalizeClassYearLevels(["3", "Year 3", "Year 4"]), ["Year 3", "Year 4"]);
assert.deepEqual(normalizeClassYearLevels(["Year 6", "Prep", " year 2 ", null, ""]), ["Prep", "Year 2", "Year 6"]);
assert.equal(formatClassYearLevels(["3", "Year 3", "Year 4"]), "Years 3–4");
assert.equal(formatClassYearLevels(["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"]), "Prep – Year 6");
assert.equal(formatClassYearLevels(["Year 5"]), "Year 5");
assert.equal(formatClassYearLevels(["Year 2", "Year 5"]), "Year 2, Year 5");
assert.equal(formatClassYearLevels([]), "");

console.log("PASS home trends and class year levels");
