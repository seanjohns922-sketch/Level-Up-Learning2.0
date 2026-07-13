import { getLastProgramWeek } from "./program-weeks";

// Single source of truth for where an assessment (pre/post-test) returns to.
// Realm-aware: Measurelands returns to its 8-week program in realm_id=measurement;
// Number Nexus returns to its 12-week program. NEVER hardcode Week 12 or drop the
// realm — that leaks a Number Nexus assumption into Measurelands navigation.

export type AssessmentReturnOptions = {
  year: string;
  /** Raw realm_id from the URL ("measurement" or undefined/"number"). */
  realmId?: string | null;
  /** Override the target week; defaults to the realm's final program week. */
  week?: number;
  /** Append &legacy=1 (default true, matching the program page's expectations). */
  legacy?: boolean;
};

/**
 * Builds the program-return route used by the pre/post-test Back and Exit
 * handlers. For a post-test this lands on the realm's final week
 * (Measurelands → Week 8, Number Nexus → Week 12).
 */
export function buildAssessmentReturnRoute({ year, realmId, week, legacy = true }: AssessmentReturnOptions): string {
  const targetWeek = week ?? getLastProgramWeek(realmId);
  const legacyParam = legacy ? "&legacy=1" : "";
  const realmParam = realmId ? `&realm_id=${encodeURIComponent(realmId)}` : "";
  return `/program?year=${encodeURIComponent(year)}&week=${targetWeek}${legacyParam}${realmParam}`;
}
