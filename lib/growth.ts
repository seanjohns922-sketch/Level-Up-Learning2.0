import { AC_STRANDS, strandForRealm, type AcStrand } from "@/lib/curriculum/ac-standards";
import { termIndex, type LatestTest, type SchoolYearDates } from "@/lib/proficiency";

/** Growth through the school year, from tests only.
 *
 * A pre-test (or the start diagnostic) sets the base; the post-tests and
 * diagnostics after it show the growth. In each strand the base is the test
 * just before the first post-test or diagnostic (the settled placement, so
 * a chain of placement pre-tests counts as its last one). Growth is the
 * latest post-test or diagnostic minus the base. Later pre-tests for a new
 * level don't count: they check content not yet taught. The expectation is a
 * quarter of a level for each term between the base and the latest test, so
 * a base in Term 1 and a post-test in Term 3 expects 0.5. A student's growth is the curriculum-weighted
 * average of the strands that have growth (Number most).
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

function termsBetween(from: number, to: number): number {
  const a = termIndex(new Date(from).toISOString());
  const b = termIndex(new Date(to).toISOString());
  return a === null || b === null ? 0 : Math.max(0, b - a);
}
const DAY = 86400000;

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

export type StrandGrowth = { gained: number; expected: number; first: number; latest: number };
export type StudentGrowth = StrandGrowth & { strands: Map<AcStrand, StrandGrowth>; tests: number };

/** One student's growth using the tests sat by `at`, or null before any
 * strand has a post-test or diagnostic after its base. */
export function studentGrowthAt(history: LatestTest[] | undefined, at: number): StudentGrowth | null {
  const strands = new Map<AcStrand, StrandGrowth>();
  let weight = 0;
  let tests = 0;
  const sum = { gained: 0, expected: 0, first: 0, latest: 0 };
  for (const [strand, points] of tracks(history)) {
    const sat = points.filter((point) => point.at <= at);
    tests += sat.length;
    const firstGrowth = sat.findIndex((point, index) => index > 0 && measuresGrowth(point));
    if (firstGrowth < 0) continue;
    const first = sat[firstGrowth - 1];
    const latest = sat.filter((point, index) => index >= firstGrowth && measuresGrowth(point)).at(-1)!;
    const growth = {
      gained: latest.measured - first.measured,
      // A quarter of a level for each term between the two tests.
      expected: TERM * termsBetween(first.at, latest.at),
      first: first.measured,
      latest: latest.measured,
    };
    strands.set(strand, growth);
    const w = AC_STRANDS[strand].weight;
    weight += w;
    sum.gained += growth.gained * w;
    sum.expected += growth.expected * w;
    sum.first += growth.first * w;
    sum.latest += growth.latest * w;
  }
  if (!weight) return null;
  return {
    gained: sum.gained / weight,
    expected: sum.expected / weight,
    first: sum.first / weight,
    latest: sum.latest / weight,
    strands,
    tests,
  };
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
  /** Students with growth (a post-test or diagnostic after their base) in at least one strand. */
  followed: number;
  /** Students with a base test but no post-test or diagnostic after it yet. */
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
    if (!growth) {
      if ((student.testHistory ?? []).some((test) => Date.parse(test.testedAt) <= at)) waiting += 1;
      tests += (student.testHistory ?? []).filter((test) => Date.parse(test.testedAt) <= at).length;
      continue;
    }
    current.push(growth);
    tests += growth.tests;
    pace[paceFor(growth.gained, growth.expected)] += 1;
    for (const [strand, strandGrowth] of growth.strands) byStrand.set(strand, [...(byStrand.get(strand) ?? []), strandGrowth]);
  }

  const series = withStart(students, times.map((time) => {
    const rows = students.flatMap((student) => {
      const growth = studentGrowthAt(student.testHistory, time);
      return growth ? [growth] : [];
    });
    return { at: time, gained: mean(rows.map((row) => row.gained)), expected: mean(rows.map((row) => row.expected)), students: rows.length };
  }));

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
