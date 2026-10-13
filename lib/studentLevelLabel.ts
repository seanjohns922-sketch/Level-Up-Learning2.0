export const SCHOOL_YEAR_LEVEL_OPTIONS = ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"] as const;

export function normalizeSchoolYearLabel(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (/^prep$/i.test(trimmed)) return "Prep";
  const match = /year\s*(\d+)/i.exec(trimmed);
  if (match) return `Year ${match[1]}`;
  return trimmed;
}

/** Clean a class's stored year levels for display and matching. Older classes
 * can hold bare numbers ("3") beside "Year 3"; these collapse to one canonical
 * label each, in school order. Stored data is not changed. */
export function normalizeClassYearLevels(values?: readonly (string | null | undefined)[] | null) {
  const labels = new Set<string>();
  for (const value of values ?? []) {
    const trimmed = value?.trim();
    if (!trimmed) continue;
    const label = /^\d+$/.test(trimmed) ? `Year ${Number(trimmed)}` : normalizeSchoolYearLabel(trimmed);
    if (label) labels.add(label);
  }
  const order = (label: string) => {
    const index = (SCHOOL_YEAR_LEVEL_OPTIONS as readonly string[]).indexOf(label);
    return index === -1 ? SCHOOL_YEAR_LEVEL_OPTIONS.length : index;
  };
  return [...labels].sort((a, b) => order(a) - order(b));
}

/** "Year 3", "Years 3–4", "Prep – Year 2", or a list when the years skip. */
export function formatClassYearLevels(values?: readonly (string | null | undefined)[] | null) {
  const labels = normalizeClassYearLevels(values);
  if (labels.length === 0) return "";
  if (labels.length === 1) return labels[0];
  const indexes = labels.map((label) => (SCHOOL_YEAR_LEVEL_OPTIONS as readonly string[]).indexOf(label));
  const consecutive = indexes.every((index, i) => index !== -1 && (i === 0 || index === indexes[i - 1] + 1));
  if (!consecutive) return labels.join(", ");
  const first = labels[0];
  const last = labels[labels.length - 1];
  if (first === "Prep") return `Prep – ${last}`;
  return `Years ${first.replace("Year ", "")}–${last.replace("Year ", "")}`;
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
