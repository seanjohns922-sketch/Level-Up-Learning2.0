export const SCHOOL_YEAR_LEVEL_OPTIONS = ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"] as const;

export function normalizeSchoolYearLabel(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (/^prep$/i.test(trimmed)) return "Prep";
  const match = /year\s*(\d+)/i.exec(trimmed);
  if (match) return `Year ${match[1]}`;
  return trimmed;
}

export function normalizeWorkingLevelLabel(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (/^prep$/i.test(trimmed) || /^ground/i.test(trimmed)) return "Prep";
  const match = /(?:year|level)\s*(\d+)/i.exec(trimmed);
  if (match) return `Year ${match[1]}`;
  return trimmed;
}

export function formatStudentLevelLabel(yearLabel: string) {
  if (yearLabel === "Prep") return "Ground Level";
  const match = /Year\s+(\d+)/i.exec(yearLabel);
  if (match) return `Level ${match[1]}`;
  return yearLabel;
}

export function formatWorkingLevelOptionLabel(yearLabel: string) {
  if (yearLabel === "Prep") return "Ground Level / Prep";
  return formatStudentLevelLabel(yearLabel);
}

export function formatSchoolYearDisplayLabel(yearLabel?: string | null) {
  const normalized = normalizeSchoolYearLabel(yearLabel);
  return normalized ?? "—";
}
