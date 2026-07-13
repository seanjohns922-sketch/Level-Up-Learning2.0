// Pure program-length logic with ZERO app imports, so it is safe to import from
// standalone scripts (tsx) as well as the app. Program length is realm-specific:
// Number Nexus runs 12 weeks, Measurelands 8. Resolve the final week from the
// active realm — never infer 12 for Measurelands.

export const NUMBER_PROGRAM_WEEK_COUNT = 12;
export const MEASURELANDS_PROGRAM_WEEK_COUNT = 8;

export function getProgramWeekCount(realmId?: string | null): number {
  return realmId === "measurement" ? MEASURELANDS_PROGRAM_WEEK_COUNT : NUMBER_PROGRAM_WEEK_COUNT;
}

export function getProgramWeeks(realmId?: string | null): number[] {
  return Array.from({ length: getProgramWeekCount(realmId) }, (_, index) => index + 1);
}

export function getLastProgramWeek(realmId?: string | null): number {
  return getProgramWeekCount(realmId);
}
