const CURRICULUM_YEARS = ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"] as const;

export type CurriculumYear = (typeof CURRICULUM_YEARS)[number];

/**
 * Resolve the curriculum year used to build class-level strand navigation.
 * Mixed cohorts use their lower year (for example, Year 3/4 -> Year 3), so a
 * strand that begins at that boundary is never accidentally hidden.
 */
export function normalizeClassCurriculumYear(raw: string | null | undefined): CurriculumYear {
  const value = (raw ?? "").trim();
  const lowered = value.toLowerCase();
  if (lowered === "prep" || lowered === "foundation" || lowered === "ground" || lowered === "ground level") {
    return "Prep";
  }

  const yearMatch = /(?:^|\b)(?:year\s*)?([1-6])(?=\b|\s*[/&-])/.exec(value);
  return yearMatch ? `Year ${yearMatch[1]}` as CurriculumYear : "Year 1";
}

/** Choose the highest represented school year when deciding which strand tabs
 * a mixed class needs. Individual placement rules still protect lower-year
 * students from entering a realm before its first supported level. */
export function highestRosterCurriculumYear(
  classYear: string | null | undefined,
  studentYears: readonly (string | null | undefined)[],
): CurriculumYear {
  const candidates = [classYear, ...studentYears]
    .filter((value): value is string => Boolean(value?.trim()))
    .map(normalizeClassCurriculumYear);
  if (candidates.length === 0) return "Year 1";
  return candidates.reduce((highest, candidate) =>
    CURRICULUM_YEARS.indexOf(candidate) > CURRICULUM_YEARS.indexOf(highest) ? candidate : highest
  );
}
