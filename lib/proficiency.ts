import { ASSESSMENT_THRESHOLDS } from "@/lib/assessment-rules";
import { AC_STRANDS, strandForRealm, type AcStrand } from "@/lib/curriculum/ac-standards";

/** Where students sit against their school year, in four levels styled after
 * NAPLAN's proficiency standards (not NAPLAN results):
 *   needs      working below their school year
 *   developing working at their school year, accuracy below the weekly target
 *   strong     working at their school year, accuracy at or above the target
 *   exceeding  working above their school year
 * When accuracy isn't available (before the analytics update), "at" is used
 * for anyone working at their school year. */

export type Proficiency = "needs" | "developing" | "strong" | "exceeding";
export type ProficiencyOrAt = Proficiency | "at";

export const PROFICIENCY_META: Record<ProficiencyOrAt, { label: string; meaning: string; bg: string; fg: string }> = {
  needs: { label: "Needs support", meaning: "working below their school year", bg: "#F2998D", fg: "#4A0F09" },
  developing: { label: "Developing", meaning: "at their year, still building accuracy", bg: "#FFD866", fg: "#3F2E00" },
  strong: { label: "Strong", meaning: `at their year, ${ASSESSMENT_THRESHOLDS.weeklyQuizPassPercent}%+ accuracy`, bg: "#B9F23F", fg: "#121314" },
  exceeding: { label: "Exceeding", meaning: "working above their school year", bg: "#121314", fg: "#FFFFFF" },
  at: { label: "At level", meaning: "working at their school year", bg: "#B9F23F", fg: "#121314" },
};

export const LEVEL_ORDER = ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6", "Year 7", "Year 8"];
const levelIndex = (level: string | null | undefined) => (level ? LEVEL_ORDER.indexOf(level) : -1);

export type RealmEvidence = {
  realmId: string;
  currentLevel: string | null;
  pretestScore: number | null;
  averageAccuracy?: number | null;
};
export type StudentEvidence = { yearLevel: string | null; classId?: string | null; realms: RealmEvidence[] };

// Pattern Peaks (Algebra) and Chance Hollow (Probability) start at Level 3 and
// assign everyone there by default, so only a sat pre-test is evidence. A
// pre-test below the targeted minimum means not yet working at that level.
const PRETEST_GATED = new Set(["pattern", "pattern-peaks", "chance", "chance-hollow"]);

/** The level a realm placement shows a student working at, or undefined when
 * the placement isn't evidence yet. */
export function evidencedLevel(realm: RealmEvidence): string | null | undefined {
  if (!PRETEST_GATED.has(realm.realmId)) return realm.currentLevel;
  if (realm.pretestScore === null || realm.pretestScore === undefined) return undefined;
  if (realm.pretestScore < ASSESSMENT_THRESHOLDS.pretestTargetedMinimumPercent) {
    const index = levelIndex(realm.currentLevel);
    return index > 0 ? LEVEL_ORDER[index - 1] : realm.currentLevel;
  }
  return realm.currentLevel;
}

export function hasAccuracyEvidence(students: StudentEvidence[]) {
  return students.some((student) => student.realms.some((realm) => realm.averageAccuracy !== undefined));
}

/** Proficiency for one realm placement, or null when there is no evidence. */
export function realmProficiency(yearLevel: string | null, realm: RealmEvidence, useAccuracy: boolean): ProficiencyOrAt | null {
  const level = evidencedLevel(realm);
  const grade = levelIndex(yearLevel);
  const working = levelIndex(level ?? null);
  if (level === undefined || grade < 0 || working < 0) return null;
  if (working < grade) return "needs";
  if (working > grade) return "exceeding";
  if (!useAccuracy) return "at";
  return (realm.averageAccuracy ?? 0) >= ASSESSMENT_THRESHOLDS.weeklyQuizPassPercent ? "strong" : "developing";
}

const SCORE: Record<ProficiencyOrAt, number> = { needs: 0, developing: 1, at: 1.5, strong: 2, exceeding: 3 };

/** One overall level per student across their strands, weighted by each
 * strand's share of the curriculum (Number counts most). */
export function overallProficiency(student: StudentEvidence, useAccuracy: boolean): ProficiencyOrAt | null {
  let weight = 0;
  let total = 0;
  for (const realm of student.realms) {
    const strand = strandForRealm(realm.realmId);
    const level = realmProficiency(student.yearLevel, realm, useAccuracy);
    if (!strand || !level) continue;
    weight += AC_STRANDS[strand].weight;
    total += SCORE[level] * AC_STRANDS[strand].weight;
  }
  if (!weight) return null;
  const score = total / weight;
  if (!useAccuracy) return score < 0.75 ? "needs" : score >= 2.25 ? "exceeding" : "at";
  return score < 0.5 ? "needs" : score < 1.5 ? "developing" : score < 2.5 ? "strong" : "exceeding";
}

export type Distribution = { counts: Record<ProficiencyOrAt, number>; total: number };
const emptyCounts = (): Record<ProficiencyOrAt, number> => ({ needs: 0, developing: 0, strong: 0, exceeding: 0, at: 0 });

export function categoriesFor(useAccuracy: boolean): ProficiencyOrAt[] {
  return useAccuracy ? ["needs", "developing", "strong", "exceeding"] : ["needs", "at", "exceeding"];
}

/** Whole-group distribution (each student once), by school year, by strand
 * (each student once per strand) and by class. */
export function buildDistributions(students: StudentEvidence[], useAccuracy: boolean) {
  const overall: Distribution = { counts: emptyCounts(), total: 0 };
  const byYear = new Map<string, Distribution>();
  const byClass = new Map<string, Distribution>();
  const byStrand = new Map<AcStrand, Distribution>();
  for (const strand of Object.keys(AC_STRANDS) as AcStrand[]) byStrand.set(strand, { counts: emptyCounts(), total: 0 });

  for (const student of students) {
    const level = overallProficiency(student, useAccuracy);
    if (level) {
      overall.counts[level] += 1;
      overall.total += 1;
      const year = student.yearLevel ?? "Not recorded";
      const yearRow = byYear.get(year) ?? { counts: emptyCounts(), total: 0 };
      yearRow.counts[level] += 1;
      yearRow.total += 1;
      byYear.set(year, yearRow);
      if (student.classId) {
        const classRow = byClass.get(student.classId) ?? { counts: emptyCounts(), total: 0 };
        classRow.counts[level] += 1;
        classRow.total += 1;
        byClass.set(student.classId, classRow);
      }
    }
    for (const realm of student.realms) {
      const strand = strandForRealm(realm.realmId);
      const realmLevel = realmProficiency(student.yearLevel, realm, useAccuracy);
      if (!strand || !realmLevel) continue;
      const row = byStrand.get(strand)!;
      row.counts[realmLevel] += 1;
      row.total += 1;
    }
  }

  const years = [...byYear.entries()].sort((a, b) => levelIndex(a[0]) - levelIndex(b[0]));
  const strands = [...byStrand.entries()].sort((a, b) => AC_STRANDS[a[0]].order - AC_STRANDS[b[0]].order);
  return { overall, years, strands, byClass };
}

export const share = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);
