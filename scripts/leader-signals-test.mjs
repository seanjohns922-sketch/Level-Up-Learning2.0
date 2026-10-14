import assert from "node:assert/strict";
import { buildDistributions, evidencedLevel, expectedLevel, standingForGap, studentStandings, usesTests } from "../lib/proficiency.ts";
import { buildLeaderSignals } from "../lib/leader-signals.ts";


// Australian school years run January to December. The expectation rises a
// quarter of a level each term: a Year 4 is expected at 3.25 in Term 1
// (Jan-Mar), 3.5 in Term 2 (Apr-Jun), 3.75 in Term 3 (Jul-Sep), 4 in Term 4.
const calendarYear = { startsOn: "2026-01-01", endsOn: "2026-12-31" };
assert.equal(expectedLevel("Year 4", "2026-02-10T00:00:00Z", calendarYear), 3.25);
assert.equal(expectedLevel("Year 4", "2026-05-20T00:00:00Z", calendarYear), 3.5);
assert.equal(expectedLevel("Year 4", "2026-08-20T00:00:00Z", calendarYear), 3.75);
assert.equal(expectedLevel("Year 4", "2026-11-20T00:00:00Z", calendarYear), 4);
// Brody: a Year 3 in September is expected at 2.75, so 2.0 is a term to a year behind.
assert.equal(expectedLevel("Year 3", "2026-09-05T00:00:00Z", calendarYear), 2.75);
assert.equal(standingForGap(2.0 - expectedLevel("Year 3", "2026-09-05T00:00:00Z", calendarYear)), "below");
// Terms follow Melbourne time: 31 March 11pm UTC is already April (Term 2) in Melbourne.
assert.equal(expectedLevel("Year 4", "2026-03-31T15:00:00Z", calendarYear), 3.5);
assert.equal(expectedLevel("Year 4", "2025-11-20T00:00:00Z", calendarYear), 3); // last year's Year 3 in Term 4
assert.equal(expectedLevel("Year 4", "2025-08-20T00:00:00Z", calendarYear), 2.75); // last year's Term 3
assert.equal(expectedLevel("Year 4", "2027-02-01T00:00:00Z", calendarYear), 4); // after the year: holds at 4
assert.equal(expectedLevel("Prep", "2026-11-01T00:00:00Z", calendarYear), 0); // Prep: Ground all year
assert.equal(expectedLevel(null, "2026-03-01T00:00:00Z", calendarYear), null);
const year = calendarYear;

// Bands: within a term = at, a term to a year behind = below, a year+ = well below, a term+ ahead = above.
assert.equal(standingForGap(0.3), "above");
assert.equal(standingForGap(0.25), "at");
assert.equal(standingForGap(-0.25), "at");
assert.equal(standingForGap(-0.5), "below");
assert.equal(standingForGap(-1), "wellBelow");

// The spec example: Year 4 in Term 2 (expected 3.5).
const mid = "2026-05-20T02:00:00Z";
const one = (measured) => studentStandings({ yearLevel: "Year 4", realms: [], tests: [{ strand: "number", measured, testedAt: mid, source: "diagnostic" }] }, year).overall;
assert.deepEqual([one(3.4), one(3.0), one(2.4), one(3.9)], ["at", "below", "wellBelow", "above"]);
// The same 3.2 reads differently through the year.
const at = (testedAt) => studentStandings({ yearLevel: "Year 4", realms: [], tests: [{ strand: "number", measured: 3.2, testedAt, source: "pretest" }] }, year).overall;
assert.deepEqual([at("2026-01-30T00:00:00Z"), at(mid), at("2026-12-10T00:00:00Z")], ["at", "below", "below"]); // 3.2: at level in Term 1 (3.25), 0.3 behind in Term 2, 0.8 behind in Term 4

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
