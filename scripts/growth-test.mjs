import assert from "node:assert/strict";
import { paceFor, seriesTimes, studentGrowthAt, summariseGrowth, yearBounds } from "../lib/growth.ts";

// Australian school years run January to December.
const year = { startsOn: "2026-01-01", endsOn: "2026-12-31" };
const { length } = yearBounds(year);
const now = Date.parse("2026-10-14T00:00:00Z");
const test = (strand, measured, testedAt, source = "posttest") => ({ strand, measured, testedAt, source });

// Pace: a term (0.25) either side of expected growth; backwards is a term below the first test.
assert.equal(paceFor(0.5, 0.5), "onPace");
assert.equal(paceFor(0.2, 0.5), "slower");
assert.equal(paceFor(0.8, 0.5), "faster");
assert.equal(paceFor(-0.3, 0.5), "backwards");
assert.equal(paceFor(-0.2, 0), "onPace"); // a small dip right after the first test

// One test is a starting point, not growth.
assert.equal(studentGrowthAt([test("number", 3.1, "2026-02-10T00:00:00Z", "pretest")], now, length), null);

// Pre-test in Feb, then May and Aug: expected growth is the time between them.
const steady = [test("number", 3.0, "2026-02-01T00:00:00Z", "pretest"), test("number", 3.2, "2026-05-01T00:00:00Z"), test("number", 3.45, "2026-08-01T00:00:00Z", "diagnostic")];
const growth = studentGrowthAt(steady, now, length);
assert.ok(Math.abs(growth.gained - 0.45) < 1e-9);
assert.ok(Math.abs(growth.expected - 181 / 365) < 0.01);
assert.ok(Math.abs(growth.first - 3) < 1e-9);
assert.ok(Math.abs(growth.latest - 3.45) < 1e-9);
assert.equal(growth.tests, 3);
// Before the third test only the first two count.
assert.ok(Math.abs(studentGrowthAt(steady, Date.parse("2026-06-01T00:00:00Z"), length).gained - 0.2) < 1e-9);

// Strands are weighted by the curriculum (Number most); un-retested strands don't count.
const mixed = [
  test("number", 3.0, "2026-02-01T00:00:00Z", "pretest"), test("number", 3.5, "2026-08-01T00:00:00Z"),
  test("space", 3.0, "2026-02-01T00:00:00Z", "pretest"), test("space", 3.0, "2026-08-01T00:00:00Z"),
  test("algebra", 2.0, "2026-03-01T00:00:00Z", "pretest"),
];
const weighted = studentGrowthAt(mixed, now, length);
assert.ok(weighted.gained > 0.25 && weighted.gained < 0.5, `weighted ${weighted.gained}`);
assert.equal(weighted.strands.size, 2);
assert.equal(weighted.tests, 5);

// Month ends through the year, then today.
const times = seriesTimes(year, now);
assert.equal(times.length, 10);
assert.equal(new Date(times[0]).toISOString(), "2026-01-31T23:59:59.999Z");
assert.equal(times.at(-1), now);

const summary = summariseGrowth([
  { yearLevel: "Year 4", testHistory: steady },
  { yearLevel: "Year 4", testHistory: mixed },
  { yearLevel: "Year 4", testHistory: [test("number", 3.4, "2026-02-01T00:00:00Z", "pretest"), test("number", 3.0, "2026-09-01T00:00:00Z")] },
  { yearLevel: "Year 4", testHistory: [test("number", 2.9, "2026-02-01T00:00:00Z", "pretest")] },
  { yearLevel: "Year 4", testHistory: [] },
], year, now);
assert.equal(summary.followed, 3);
assert.equal(summary.waiting, 1);
assert.equal(summary.tests, 11);
assert.equal(summary.pace.backwards, 1);
assert.equal(summary.pace.onPace, 2); // the mixed student is just within a term of expected
assert.equal(summary.pace.slower, 0);
const number = summary.strands.find(([strand]) => strand === "number")[1];
assert.equal(number.students, 3);
assert.equal(summary.strands.find(([strand]) => strand === "algebra")[1].students, 0);
// The series steps up only as tests come in: nothing in Feb–Apr, three students by today.
assert.equal(summary.series[0].gained, 0); // the line starts at 0 on the first test (1 Feb)
assert.equal(new Date(summary.series[0].at).toISOString(), "2026-02-01T00:00:00.000Z");
assert.equal(summary.series[1].students, 0);
assert.equal(summary.series[4].students, 1); // end of May: one student retested on 1 May
assert.equal(summary.series.at(-1).students, 3);

console.log("PASS growth from the first test through every later test this year");
