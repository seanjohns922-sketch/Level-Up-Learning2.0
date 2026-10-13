import assert from "node:assert/strict";
import { buildDistributions, evidencedLevel, expectedLevel, standingForGap, studentStandings, usesTests } from "../lib/proficiency.ts";
import { buildLeaderSignals } from "../lib/leader-signals.ts";

const year = { startsOn: "2026-01-28", endsOn: "2026-12-18" };

// Australian school years run January to December; schools are set up 1 Jan to 31 Dec.
const calendarYear = { startsOn: "2026-01-01", endsOn: "2026-12-31" };
assert.equal(expectedLevel("Year 4", "2026-01-01T00:00:00Z", calendarYear), 3);
assert.ok(Math.abs(expectedLevel("Year 4", "2026-07-02T12:00:00Z", calendarYear) - 3.5) < 0.01);
assert.ok(expectedLevel("Year 4", "2026-12-31T12:00:00Z", calendarYear) > 3.99);
assert.equal(expectedLevel("Year 4", "2025-12-15T00:00:00Z", calendarYear) > 2.95, true); // last year's Year 3 finishing at 3
const close = (a, b) => assert.ok(Math.abs(a - b) < 0.02, `${a} ≈ ${b}`);

// Expected level moves through the year: Year 4 = 3 at the start, 3.5 mid-year, 4 at the end.
close(expectedLevel("Year 4", "2026-01-28T00:00:00Z", year), 3);
close(expectedLevel("Year 4", "2026-07-08T12:00:00Z", year), 3.5);
close(expectedLevel("Year 4", "2026-12-18T23:00:00Z", year), 4);
close(expectedLevel("Year 4", "2027-02-01T00:00:00Z", year), 4); // after the year: holds at 4
close(expectedLevel("Year 4", "2025-07-08T12:00:00Z", year), 2.5); // last year: last year's mid-year
close(expectedLevel("Year 4", "2026-01-10T00:00:00Z", year), 3); // summer holidays hold at last year's end
assert.equal(expectedLevel("Prep", "2026-11-01T00:00:00Z", year), 0); // Prep: Ground all year
assert.equal(expectedLevel(null, "2026-03-01T00:00:00Z", year), null);

// Bands: within a term = at, a term to a year behind = below, a year+ = well below, a term+ ahead = above.
assert.equal(standingForGap(0.3), "above");
assert.equal(standingForGap(0.25), "at");
assert.equal(standingForGap(-0.25), "at");
assert.equal(standingForGap(-0.5), "below");
assert.equal(standingForGap(-1), "wellBelow");

// The spec example: Year 4 mid-year (expected 3.5).
const mid = "2026-07-08T12:00:00Z";
const one = (measured) => studentStandings({ yearLevel: "Year 4", realms: [], tests: [{ strand: "number", measured, testedAt: mid, source: "diagnostic" }] }, year).overall;
assert.deepEqual([one(3.4), one(3.0), one(2.4), one(3.9)], ["at", "below", "wellBelow", "above"]);
// The same 3.2 reads differently through the year.
const at = (testedAt) => studentStandings({ yearLevel: "Year 4", realms: [], tests: [{ strand: "number", measured: 3.2, testedAt, source: "pretest" }] }, year).overall;
assert.deepEqual([at("2026-01-30T00:00:00Z"), at(mid), at("2026-12-10T00:00:00Z")], ["at", "below", "below"]); // 0.3 behind mid-year is more than a term

// Overall weights strands by curriculum share (Number counts most); strands without a test don't count.
const mixed = studentStandings({ yearLevel: "Year 4", realms: [], tests: [
  { strand: "number", measured: 3.5, testedAt: mid, source: "diagnostic" },
  { strand: "algebra", measured: 3.0, testedAt: mid, source: "pretest" },
] }, year);
assert.equal(mixed.strands.get("number"), "at");
assert.equal(mixed.strands.get("algebra"), "below");
assert.equal(mixed.overall, "at"); // Number's weight keeps a half-year Algebra gap from pulling the student below
const farBehind = studentStandings({ yearLevel: "Year 4", realms: [], tests: [
  { strand: "number", measured: 3.5, testedAt: mid, source: "diagnostic" },
  { strand: "algebra", measured: 1.5, testedAt: mid, source: "pretest" },
] }, year);
assert.equal(farBehind.strands.get("algebra"), "wellBelow");
assert.equal(studentStandings({ yearLevel: "Year 4", realms: [], tests: [] }, year).overall, null);

// Fallback before tests exist: working level vs school year, three standings.
assert.equal(usesTests({ analysisStudents: [{ yearLevel: "Year 4", realms: [] }] }), false);
assert.equal(studentStandings({ yearLevel: "Year 4", realms: [{ realmId: "number", currentLevel: "Year 3", pretestScore: 50 }] }, null).overall, "below");
assert.equal(evidencedLevel({ realmId: "pattern", currentLevel: "Year 3", pretestScore: null }), undefined);

// Distributions and signals (never ranking classes).
const test = (measured) => [{ strand: "number", measured, testedAt: mid, source: "diagnostic" }];
const students = [
  ...Array.from({ length: 6 }, () => ({ yearLevel: "Year 4", classId: "a", realms: [], tests: test(2.3) })),
  ...Array.from({ length: 6 }, () => ({ yearLevel: "Year 3", classId: "b", realms: [], tests: test(3.4) })),
];
const d = buildDistributions(students, year);
assert.deepEqual([d.overall.total, d.overall.counts.wellBelow, d.overall.counts.above], [12, 6, 6]);
assert.equal(d.strands.length, 6);
const signals = buildLeaderSignals(d, { students: 12, activeThisWeek: 3 }, "school");
assert.deepEqual(signals.map((s) => [s.tone, s.headline]), [
  ["concern", "Year 4: 100% below level"],
  ["concern", "Number: 50% below level"],
  ["watch", "Algebra, Measurement, Space, Statistics and Probability: no tests yet"],
  ["watch", "25% of students used RELIQ in the last 7 days"],
  ["strength", "Year 3: 100% above level"],
]);
assert.match(signals[0].detail, /6 of them a year or more behind/);
assert.ok(buildLeaderSignals(d, { students: 12, activeThisWeek: 12 }, "class").every((s) => !s.key.startsWith("year-")));

console.log("PASS expected levels, standings and where-to-look signals");
