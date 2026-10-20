import { ASSESSMENT_THRESHOLDS } from "@/lib/assessment-rules";
import { AC_STRANDS, strandForRealm, type AcStrand } from "@/lib/curriculum/ac-standards";

/** Where students sit against where they should be, from each student's
 * latest independent test per strand (whole-maths diagnostic, pre-test or
 * post-test), until a newer test replaces it.
 *
 * Levels use the shared mastery scale: a Level N test spans N-1 (previous
 * level complete) to N (this level complete). A student in school year N is
 * expected to gain a quarter of a level each term (school year Jan-Dec):
 *   Term 1 (Jan-Mar) N-0.75 · Term 2 (Apr-Jun) N-0.5
 *   Term 3 (Jul-Sep) N-0.25 · Term 4 (Oct-Dec) N
 * Prep is expected at Ground (0) all year. Each test is compared with the
 * expectation for the term it was sat in:
 *   above      more than 0.25 ahead (more than a term)
 *   at         within 0.25 either side (within a term)
 *   below      0.25 to 1.0 behind (a term to a year)
 *   wellBelow  a full level or more behind (a year or more)
 * Before tests are available (older analytics), the current working level
 * against the school year gives Below / At level / Above only. */

export type Standing = "wellBelow" | "below" | "at" | "above";

export const STANDING_ORDER: Standing[] = ["wellBelow", "below", "at", "above"];

export const STANDING_META: Record<Standing, { label: string; meaning: string; bg: string; fg: string }> = {
  wellBelow: { label: "Well below", meaning: "a year or more behind", bg: "#F2998D", fg: "#4A0F09" },
  below: { label: "Below level", meaning: "a term to a year behind", bg: "#FFD866", fg: "#3F2E00" },
  at: { label: "At level", meaning: "within a term of where they should be", bg: "#83E300", fg: "#121314" },
  above: { label: "Above level", meaning: "more than a term ahead", bg: "#121314", fg: "#FFFFFF" },
};

export const LEVEL_ORDER = ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6", "Year 7", "Year 8"];
const levelIndex = (level: string | null | undefined) => (level ? LEVEL_ORDER.indexOf(level) : -1);

export type LatestTest = { strand: string; measured: number; testedAt: string; source: string };
export type RealmEvidence = { realmId: string; currentLevel: string | null; pretestScore: number | null };
export type StudentEvidence = { yearLevel: string | null; classId?: string | null; realms: RealmEvidence[]; tests?: LatestTest[] };
export type SchoolYearDates = { startsOn: string; endsOn: string };

// Pattern Peaks (Algebra) and Chance Hollow (Probability) start at Level 3 and
// assign everyone there by default, so only a sat pre-test is evidence. A
// pre-test below the targeted minimum means not yet working at that level.
const PRETEST_GATED = new Set(["pattern", "pattern-peaks", "chance", "chance-hollow"]);

/** Working level a realm placement shows (used by the placement views), or
 * undefined when the placement isn't evidence yet. */
export function evidencedLevel(realm: RealmEvidence): string | null | undefined {
  if (!PRETEST_GATED.has(realm.realmId)) return realm.currentLevel;
  if (realm.pretestScore === null || realm.pretestScore === undefined) return undefined;
  if (realm.pretestScore < ASSESSMENT_THRESHOLDS.pretestTargetedMinimumPercent) {
    const index = levelIndex(realm.currentLevel);
    return index > 0 ? LEVEL_ORDER[index - 1] : realm.currentLevel;
  }
  return realm.currentLevel;
}

const MELBOURNE_PARTS = new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Melbourne", year: "numeric", month: "numeric" });

/** The school term (1-4) and calendar year a date falls in, in Victoria:
 * Term 1 Jan-Mar, Term 2 Apr-Jun, Term 3 Jul-Sep, Term 4 Oct-Dec. */
export function schoolTerm(iso: string): { year: number; term: 1 | 2 | 3 | 4 } | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const parts = MELBOURNE_PARTS.formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  return { year, term: (Math.floor((month - 1) / 3) + 1) as 1 | 2 | 3 | 4 };
}

/** Terms since a fixed point, so two dates' terms can be subtracted. */
export function termIndex(iso: string): number | null {
  const term = schoolTerm(iso);
  return term ? term.year * 4 + term.term : null;
}

/** Expected level for a school year in the term a test was sat: a quarter of
 * a level each term, from N-0.75 in Term 1 to N in Term 4. A test from an
 * earlier year is judged against that year's level (one lower per year
 * back); a test after the school year holds at N. Prep stays at Ground (0). */
export function expectedLevel(schoolYear: string | null, testedAt: string, year: SchoolYearDates): number | null {
  const n = levelIndex(schoolYear);
  const term = schoolTerm(testedAt);
  const academicYear = Number(year.startsOn.slice(0, 4));
  if (n < 0 || !term || !Number.isFinite(academicYear)) return null;
  if (term.year > academicYear) return n;
  const yearsBack = academicYear - term.year;
  return Math.max(0, n - yearsBack - 1 + 0.25 * term.term);
}

export function standingForGap(gap: number): Standing {
  if (gap > 0.25) return "above";
  if (gap >= -0.25) return "at";
  if (gap > -1) return "below";
  return "wellBelow";
}

/** Gap (latest test minus expected) for one strand, or null without a test. */
export function testGap(schoolYear: string | null, test: LatestTest, year: SchoolYearDates): number | null {
  const expected = expectedLevel(schoolYear, test.testedAt, year);
  return expected === null ? null : test.measured - expected;
}

/** Standing per strand and overall (gaps weighted by each strand's share of
 * the curriculum, Number most) for one student. */
export function studentStandings(student: StudentEvidence, year: SchoolYearDates | null) {
  const strands = new Map<AcStrand, Standing>();
  let weight = 0;
  let total = 0;
  if (year && student.tests) {
    for (const test of student.tests) {
      const strand = strandForRealm(test.strand);
      const gap = strand ? testGap(student.yearLevel, test, year) : null;
      if (!strand || gap === null) continue;
      strands.set(strand, standingForGap(gap));
      weight += AC_STRANDS[strand].weight;
      total += gap * AC_STRANDS[strand].weight;
    }
    return { strands, overall: weight ? standingForGap(total / weight) : null };
  }
  // Fallback before tests are available: working level against school year.
  const grade = levelIndex(student.yearLevel);
  for (const realm of student.realms) {
    const strand = strandForRealm(realm.realmId);
    const working = levelIndex(evidencedLevel(realm) ?? null);
    if (!strand || grade < 0 || working < 0 || evidencedLevel(realm) === undefined) continue;
    const gap = working - grade;
    strands.set(strand, gap < 0 ? "below" : gap > 0 ? "above" : "at");
    weight += AC_STRANDS[strand].weight;
    total += gap * AC_STRANDS[strand].weight;
  }
  const mean = weight ? total / weight : null;
  return { strands, overall: mean === null ? null : mean <= -0.5 ? "below" : mean >= 0.5 ? "above" : ("at" as Standing) };
}

export type Distribution = { counts: Record<Standing, number>; total: number };
const emptyCounts = (): Record<Standing, number> => ({ wellBelow: 0, below: 0, at: 0, above: 0 });

/** Standings shown: four with test evidence, three before it. */
export function standingsFor(usingTests: boolean): Standing[] {
  return usingTests ? STANDING_ORDER : ["below", "at", "above"];
}

export function usesTests(snapshot: { academicYear?: SchoolYearDates; analysisStudents: StudentEvidence[] }) {
  return Boolean(snapshot.academicYear && snapshot.analysisStudents.some((student) => student.tests !== undefined));
}

/** Each student once overall, by school year and by class; once per strand. */
export function buildDistributions(students: StudentEvidence[], year: SchoolYearDates | null) {
  const overall: Distribution = { counts: emptyCounts(), total: 0 };
  const byYear = new Map<string, Distribution>();
  const byClass = new Map<string, Distribution>();
  const byStrand = new Map<AcStrand, Distribution>();
  for (const strand of Object.keys(AC_STRANDS) as AcStrand[]) byStrand.set(strand, { counts: emptyCounts(), total: 0 });
  const add = (map: Map<string, Distribution>, key: string, standing: Standing) => {
    const row = map.get(key) ?? { counts: emptyCounts(), total: 0 };
    row.counts[standing] += 1;
    row.total += 1;
    map.set(key, row);
  };

  for (const student of students) {
    const { strands, overall: standing } = studentStandings(student, year);
    if (standing) {
      overall.counts[standing] += 1;
      overall.total += 1;
      add(byYear, student.yearLevel ?? "Not recorded", standing);
      if (student.classId) add(byClass, student.classId, standing);
    }
    for (const [strand, strandStanding] of strands) {
      const row = byStrand.get(strand)!;
      row.counts[strandStanding] += 1;
      row.total += 1;
    }
  }

  const years = [...byYear.entries()].sort((a, b) => levelIndex(a[0]) - levelIndex(b[0]));
  const strands = [...byStrand.entries()].sort((a, b) => AC_STRANDS[a[0]].order - AC_STRANDS[b[0]].order);
  return { overall, years, strands, byClass };
}

export const share = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);
