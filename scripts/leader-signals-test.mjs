import assert from "node:assert/strict";
import { buildLeaderSignals, weeklyUsage } from "../lib/leader-signals.ts";

const topic = (name, yearLevel, averageAccuracy, evidenceCount = 12, students = 8) => ({
  topic: name, yearLevel, realmId: null, strand: null, strandLabel: null, band: null, students, evidenceCount, averageAccuracy,
});
const cls = (id, name, students, weeklyTargetMet) => ({
  id, name, students, activeStudents: students, weeklyTargetMet, masteredLevels: 0, averageAccuracy: null, averageGrowth: null,
});
const cell = (strand, year, below, total) => ({ strand, strandLabel: strand === "number" ? "Number" : "Measurement", year, below, total });
const snapshot = (overrides = {}) => ({
  generatedAt: "2026-10-14T02:00:00Z",
  overview: { students: 70, activeThisWeek: 50, weeklyTargetMet: 35, onTrack: 0, levelsMastered: 4, averageGrowth: null, matchedGrowthPairs: 0 },
  curriculum: [],
  classes: [],
  engagementTrend: [],
  ...overrides,
});

// Ranked: below-level hotspots, weakest topic, lagging class, then one strength.
{
  const signals = buildLeaderSignals(
    snapshot({
      curriculum: [topic("Fractions", "Year 4", 48), topic("Time", "Year 3", 55), topic("Thin", "Year 3", 10, 3)],
      classes: [cls("a", "3/4H", 23, 14), cls("b", "3/4N", 23, 5), cls("c", "3/4J", 24, 16)],
    }),
    [cell("measurement", "Year 4", 12, 20), cell("number", "Year 3", 2, 25), cell("number", "Year 4", 3, 3)],
  );
  assert.deepEqual(signals.map((s) => [s.tone, s.headline]), [
    ["concern", "Year 4 Measurement: 60% below their year level"],
    ["watch", "Year 4 · Fractions: 48% accuracy"],
    ["watch", "3/4N: 22% met the weekly target"],
    ["strength", "Year 3 Number: 92% at or above level"],
  ]);
  assert.deepEqual(signals[0].filter, { yearLevel: "Year 4", strand: "measurement" });
  assert.equal(signals[2].detail, "The school average is 50%.");
}

// Low participation is called out; small groups and thin evidence are not.
{
  const signals = buildLeaderSignals(snapshot({ overview: { ...snapshot().overview, activeThisWeek: 20 } }), [cell("number", "Year 2", 4, 4)]);
  assert.deepEqual(signals.map((s) => s.key), ["participation"]);
  assert.match(signals[0].headline, /^29% of students used RELIQ in the last 7 days$/);
}

// Weekly usage: Monday weeks, empty weeks filled, part weeks flagged.
{
  const trend = [
    { date: "2026-09-30", activeStudents: 3, activities: 4 },
    { date: "2026-10-06", activeStudents: 5, activities: 10 },
    { date: "2026-10-08", activeStudents: 5, activities: 6 },
    { date: "2026-10-13", activeStudents: 2, activities: 2 },
  ];
  const weeks = weeklyUsage(trend, "2026-10-14T02:00:00Z", 21);
  assert.deepEqual(weeks.map((w) => [w.weekStart, w.activities, w.partial]), [
    ["2026-09-21", 0, true],
    ["2026-09-28", 4, false],
    ["2026-10-05", 16, false],
    ["2026-10-12", 2, true],
  ]);
  // On a Sunday the current week is complete.
  assert.equal(weeklyUsage(trend, "2026-10-18T02:00:00Z", 7).at(-1).partial, false);
}

console.log("PASS leader signals and weekly usage");
