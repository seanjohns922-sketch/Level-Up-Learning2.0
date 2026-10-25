import { AC_STRANDS, strandForRealm, type AcStrand } from "@/lib/curriculum/ac-standards";
import { type LatestTest, type SchoolYearDates } from "@/lib/proficiency";
import { availableStrands } from "@/lib/whole-maths-diagnostic";

/** Growth through the school year, from tests only.
 *
 * A pre-test (or the start diagnostic) sets the base; the post-tests and
 * diagnostics after it show the growth. In each strand the base is the test
 * just before the first post-test or diagnostic (the settled placement, so
 * a chain of placement pre-tests counts as its last one). Growth is the
 * latest post-test or diagnostic minus the base. Later pre-tests for a new
 * level don't count: they check content not yet taught. The expectation rises
 * steadily at a quarter of a level per term (a level a year), counted by date
 * from the base: to the latest test for a student's pace, and to each point in
 * time for the "expected" line, so the line climbs smoothly between tests. A student's growth is the curriculum-weighted
 * average of the strands that have growth (Number most).
 *
 * A student counts in whole-school, year and class growth once every strand
 * available to them has growth: Number, Measurement, Space and Statistics,
 * plus Algebra and Probability from Year 3 or once they've moved into them.
 * A newly joined strand adds a starting point, not growth. Until then they
 * show as waiting, with what's missing. Growth by strand still uses every
 * student with growth in that strand.
 *   backwards  more than a term (0.25) below their starting test
 *   slower     more than a term behind the expected growth
 *   onPace     within a term of it
 *   faster     more than a term ahead of it */

export type Pace = "backwards" | "slower" | "onPace" | "faster";

export const PACE_ORDER: Pace[] = ["backwards", "slower", "onPace", "faster"];

export const PACE_META: Record<Pace, { label: string; meaning: string; bg: string; fg: string }> = {
  backwards: { label: "Going backwards", meaning: "more than a term below their starting test", bg: "#F2998D", fg: "#4A0F09" },
  slower: { label: "Slower than expected", meaning: "more than a term behind pace", bg: "#FFD866", fg: "#3F2E00" },
  onPace: { label: "On pace", meaning: "within a term of expected growth", bg: "#83E300", fg: "#121314" },
  faster: { label: "Faster than expected", meaning: "more than a term ahead of pace", bg: "#121314", fg: "#FFFFFF" },
};

const TERM = 0.25;

const DAY = 86400000;
// A school term is a quarter of the year; expected growth rises steadily through it.
const TERM_MS = (365.25 / 4) * DAY;

/** Terms elapsed between two times, counted steadily by date (not in whole-term steps). */
function termsBetween(from: number, to: number): number {
  return Math.max(0, (to - from) / TERM_MS);
}

export function paceFor(gained: number, expected: number): Pace {
  if (gained < -TERM) return "backwards";
  const gap = gained - expected;
  if (gap < -TERM) return "slower";
  if (gap <= TERM) return "onPace";
  return "faster";
}

export type GrowthStudent = { yearLevel?: string | null; classId?: string | null; testHistory?: LatestTest[] };

type Point = { measured: number; at: number; source: string };

/** Post-tests and diagnostics measure growth; pre-tests only set the base. */
const measuresGrowth = (point: Point) => point.source === "posttest" || point.source === "diagnostic";

export function yearBounds(year: SchoolYearDates) {
  const start = Date.parse(`${year.startsOn}T00:00:00Z`);
  const end = Date.parse(`${year.endsOn}T00:00:00Z`) + DAY;
  return { start, end, length: end - start };
}

function tracks(history: LatestTest[] | undefined) {
  const byStrand = new Map<AcStrand, Point[]>();
  for (const test of history ?? []) {
    const strand = strandForRealm(test.strand);
    const at = Date.parse(test.testedAt);
    if (!strand || Number.isNaN(at) || !Number.isFinite(test.measured)) continue;
    const points = byStrand.get(strand) ?? [];
    points.push({ measured: test.measured, at, source: test.source });
    byStrand.set(strand, points);
  }
  for (const points of byStrand.values()) points.sort((a, b) => a.at - b.at);
  return byStrand;
}

/** `expected` runs to the latest test (for pace); `expectedNow` runs to the time asked about (for the line). */
export type StrandGrowth = { gained: number; expected: number; expectedNow: number; first: number; latest: number };
export type StudentGrowth = StrandGrowth & { strands: Map<AcStrand, StrandGrowth>; tests: number };

/** One student's growth using the tests sat by `at`, or null before any
 * strand has a post-test or diagnostic after its base. */
export function studentGrowthAt(history: LatestTest[] | undefined, at: number): StudentGrowth | null {
  const strands = new Map<AcStrand, StrandGrowth>();
  let weight = 0;
  let tests = 0;
  const sum = { gained: 0, expected: 0, expectedNow: 0, first: 0, latest: 0 };
  for (const [strand, points] of tracks(history)) {
    const sat = points.filter((point) => point.at <= at);
    tests += sat.length;
    const firstGrowth = sat.findIndex((point, index) => index > 0 && measuresGrowth(point));
    if (firstGrowth < 0) continue;
    const first = sat[firstGrowth - 1];
    const latest = sat.filter((point, index) => index >= firstGrowth && measuresGrowth(point)).at(-1)!;
    const growth = {
      gained: latest.measured - first.measured,
      // A quarter of a level per term, steadily, from the base.
      expected: TERM * termsBetween(first.at, latest.at),
      expectedNow: TERM * termsBetween(first.at, at),
      first: first.measured,
      latest: latest.measured,
    };
    strands.set(strand, growth);
    const w = AC_STRANDS[strand].weight;
    weight += w;
    sum.gained += growth.gained * w;
    sum.expected += growth.expected * w;
    sum.expectedNow += growth.expectedNow * w;
    sum.first += growth.first * w;
    sum.latest += growth.latest * w;
  }
  if (!weight) return null;
  return {
    gained: sum.gained / weight,
    expected: sum.expected / weight,
    expectedNow: sum.expectedNow / weight,
    first: sum.first / weight,
    latest: sum.latest / weight,
    strands,
    tests,
  };
}

export type GrowthGap = { strand: AcStrand; need: "start" | "post" };
export type GrowthCoverage = { complete: boolean; missing: GrowthGap[] };

/** Whether a student has growth in every strand available to them by `at`. */
export function growthCoverage(history: LatestTest[] | undefined, at: number, yearLevel?: string | null): GrowthCoverage {
  const satByStrand = new Map<AcStrand, Point[]>();
  for (const [strand, points] of tracks(history)) {
    const sat = points.filter((point) => point.at <= at);
    if (sat.length) satByStrand.set(strand, sat);
  }
  const missing: GrowthGap[] = [];
  for (const strand of availableStrands(yearLevel, satByStrand.keys())) {
    const sat = satByStrand.get(strand);
    if (!sat) { missing.push({ strand, need: "start" }); continue; }
    const hasGrowth = sat.some((point, index) => index > 0 && measuresGrowth(point));
    if (!hasGrowth) missing.push({ strand, need: "post" });
  }
  return { complete: missing.length === 0, missing };
}

/** "needs a Statistics post-test", "needs Algebra and Space starting tests". */
export function describeGrowthGaps(missing: GrowthGap[]): string {
  const names = (need: GrowthGap["need"]) => missing.filter((gap) => gap.need === need).map((gap) => AC_STRANDS[gap.strand].label);
  const list = (items: string[]) => (items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`);
  const parts: string[] = [];
  const posts = names("post");
  const starts = names("start");
  const article = (items: string[]) => (items.length === 1 ? (/^[AEIOU]/.test(items[0]) ? "an " : "a ") : "");
  if (posts.length) parts.push(`${article(posts)}${list(posts)} post-test${posts.length === 1 ? "" : "s"}`);
  if (starts.length) parts.push(`${article(starts)}${list(starts)} starting test${starts.length === 1 ? "" : "s"}`);
  return parts.length ? `needs ${parts.join(" and ")}` : "";
}

/** Month ends from the start of the school year to `now`, then `now`. */
export function seriesTimes(year: SchoolYearDates, now: number) {
  const { start, end } = yearBounds(year);
  const until = Math.min(now, end);
  const times: number[] = [];
  const first = new Date(start);
  for (let month = 1; month <= 12; month += 1) {
    const boundary = Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + month, 1) - 1;
    if (boundary >= until) break;
    times.push(boundary);
  }
  times.push(until);
  return times;
}

export type SeriesPoint = { at: number; gained: number | null; expected: number | null; students: number };

export type GrowthSummary = {
  /** Students with growth (a post-test or diagnostic after their base) in every strand available to them. */
  followed: number;
  /** Students with tests but not yet growth in every strand available to them. */
  waiting: number;
  tests: number;
  gained: number | null;
  expected: number | null;
  first: number | null;
  latest: number | null;
  pace: Record<Pace, number>;
  series: SeriesPoint[];
  strands: Array<[AcStrand, { gained: number | null; expected: number | null; students: number }]>;
};

/** Growth is 0 at the starting test by definition, so the line starts there:
 * the earliest test among the students it follows. */
export function withStart(students: GrowthStudent[], series: SeriesPoint[]): SeriesPoint[] {
  const followedAt = series.find((point) => point.gained !== null)?.at;
  if (followedAt === undefined) return series;
  const firsts = students
    .flatMap((student) => (student.testHistory ?? []).map((test) => Date.parse(test.testedAt)))
    .filter((at) => !Number.isNaN(at) && at < followedAt);
  if (!firsts.length) return series;
  const start = Math.min(...firsts);
  return [{ at: start, gained: 0, expected: 0, students: 0 }, ...series.filter((point) => point.at > start)];
}

const mean = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : null);

export function summariseGrowth(students: GrowthStudent[], year: SchoolYearDates, now: number): GrowthSummary {
  const times = seriesTimes(year, now);
  const at = times[times.length - 1];
  const pace: Record<Pace, number> = { backwards: 0, slower: 0, onPace: 0, faster: 0 };
  const current: StudentGrowth[] = [];
  let waiting = 0;
  let tests = 0;
  const byStrand = new Map<AcStrand, StrandGrowth[]>();

  for (const student of students) {
    const growth = studentGrowthAt(student.testHistory, at);
    tests += (student.testHistory ?? []).filter((test) => Date.parse(test.testedAt) <= at).length;
    // Growth by strand uses every student with growth in that strand.
    for (const [strand, strandGrowth] of growth?.strands ?? []) byStrand.set(strand, [...(byStrand.get(strand) ?? []), strandGrowth]);
    if (!growth || !growthCoverage(student.testHistory, at, student.yearLevel).complete) {
      if ((student.testHistory ?? []).some((test) => Date.parse(test.testedAt) <= at)) waiting += 1;
      continue;
    }
    current.push(growth);
    pace[paceFor(growth.gained, growth.expected)] += 1;
  }

  const measured = withStart(students, times.map((time) => {
    const rows = students.flatMap((student) => {
      const growth = studentGrowthAt(student.testHistory, time);
      return growth && growthCoverage(student.testHistory, time, student.yearLevel).complete ? [growth] : [];
    });
    return { at: time, gained: mean(rows.map((row) => row.gained)), expected: mean(rows.map((row) => row.expectedNow)), students: rows.length };
  }));
  // The chart's expected line is one steady climb, a quarter of a level per
  // term from the group's first test, so students joining later don't bend it.
  // Each student's pace still uses their own starting test.
  const lineStart = measured[0]?.gained === 0 ? measured[0].at : null;
  const series = lineStart === null
    ? measured
    : measured.map((point) => (point.expected === null && point.at !== lineStart ? point : { ...point, expected: TERM * termsBetween(lineStart, point.at) }));

  const strands = (Object.keys(AC_STRANDS) as AcStrand[])
    .sort((a, b) => AC_STRANDS[a].order - AC_STRANDS[b].order)
    .map((strand) => {
      const rows = byStrand.get(strand) ?? [];
      return [strand, { gained: mean(rows.map((row) => row.gained)), expected: mean(rows.map((row) => row.expected)), students: rows.length }] as [AcStrand, { gained: number | null; expected: number | null; students: number }];
    });

  return {
    followed: current.length,
    waiting,
    tests,
    gained: mean(current.map((row) => row.gained)),
    expected: mean(current.map((row) => row.expected)),
    first: mean(current.map((row) => row.first)),
    latest: mean(current.map((row) => row.latest)),
    pace,
    series,
    strands,
  };
}

export function usesTestHistory(snapshot: { academicYear?: SchoolYearDates; analysisStudents: GrowthStudent[] }) {
  return Boolean(snapshot.academicYear && snapshot.analysisStudents.some((student) => student.testHistory !== undefined));
}

export const formatGrowth = (value: number | null) =>
  value === null ? "—" : `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(2)}`;
