import assert from "node:assert/strict";
import { buildDistributions, evidencedLevel, overallProficiency, realmProficiency } from "../lib/proficiency.ts";
import { buildLeaderSignals } from "../lib/leader-signals.ts";

const realm = (realmId, currentLevel, pretestScore = 60, averageAccuracy = 70) => ({ realmId, currentLevel, pretestScore, averageAccuracy });

// Pre-test gating for Pattern Peaks / Chance Hollow.
assert.equal(evidencedLevel(realm("pattern", "Year 3", null)), undefined);
assert.equal(evidencedLevel(realm("chance", "Year 4", 40)), "Year 3");
assert.equal(evidencedLevel(realm("pattern", "Year 4", 70)), "Year 4");
assert.equal(evidencedLevel(realm("number", "Year 4", null)), "Year 4");

// Four levels against the school year; accuracy splits "at".
assert.equal(realmProficiency("Year 4", realm("number", "Year 3"), true), "needs");
assert.equal(realmProficiency("Year 4", realm("number", "Year 4", 60, 72), true), "developing");
assert.equal(realmProficiency("Year 4", realm("number", "Year 4", 60, 85), true), "strong");
assert.equal(realmProficiency("Year 4", realm("number", "Year 5"), true), "exceeding");
assert.equal(realmProficiency("Year 4", realm("number", "Year 4"), false), "at");
assert.equal(realmProficiency("Year 4", realm("pattern", "Year 4", null), true), null);
assert.equal(realmProficiency(null, realm("number", "Year 4"), true), null);

// Overall: weighted by curriculum share (Number counts most).
const mostlyStrongNumber = { yearLevel: "Year 4", realms: [realm("number", "Year 4", 60, 90), realm("statistics", "Year 3")] };
assert.equal(overallProficiency(mostlyStrongNumber, true), "strong");
const belowInNumber = { yearLevel: "Year 4", realms: [realm("number", "Year 3"), realm("statistics", "Year 3")] };
assert.equal(overallProficiency(belowInNumber, true), "needs");
assert.equal(overallProficiency({ yearLevel: "Year 4", realms: [realm("pattern", "Year 4", null)] }, true), null);

// Distributions count each student once overall, once per strand; every strand listed.
const students = [
  ...Array.from({ length: 6 }, () => ({ yearLevel: "Year 4", classId: "a", realms: [realm("number", "Year 3"), realm("pattern", "Year 4", null)] })),
  ...Array.from({ length: 4 }, () => ({ yearLevel: "Year 3", classId: "b", realms: [realm("number", "Year 4"), realm("pattern", "Year 3", 90)] })),
];
const d = buildDistributions(students, true);
assert.equal(d.overall.total, 10);
assert.deepEqual([d.overall.counts.needs, d.overall.counts.exceeding], [6, 4]);
assert.deepEqual(d.years.map(([y, r]) => [y, r.total]), [["Year 3", 4], ["Year 4", 6]]);
assert.equal(d.strands.length, 6);
assert.deepEqual(d.strands.find(([s]) => s === "algebra")[1].total, 4);
assert.equal(d.byClass.get("a").counts.needs, 6);

// Signals: year and strand needing support, thin strands, participation, one strength; never classes.
const signals = buildLeaderSignals(d, { students: 10, activeThisWeek: 3 }, "school");
// Year 3 has only 4 students, so the strength comes from Number instead.
assert.deepEqual(signals.map((s) => [s.tone, s.headline]), [
  ["concern", "Year 4: 100% needs support"],
  ["concern", "Number: 60% needs support"],
  ["watch", "Algebra, Measurement, Space, Statistics and Probability: few students tested"],
  ["watch", "30% of students used RELIQ in the last 7 days"],
  ["strength", "Number: 40% exceeding"],
]);
assert.match(signals[2].detail, /^Algebra 4 · Measurement 0 · Space 0 · Statistics 0 · Probability 0\. Ask teachers/);
// Class scope: no school-year signals.
assert.ok(buildLeaderSignals(d, { students: 10, activeThisWeek: 9 }, "class").every((s) => !s.key.startsWith("year-")));

console.log("PASS proficiency levels and where-to-look signals");
