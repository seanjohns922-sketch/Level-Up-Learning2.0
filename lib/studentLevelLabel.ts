export const SCHOOL_YEAR_LEVEL_OPTIONS = ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"] as const;

export function normalizeSchoolYearLabel(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (/^prep$/i.test(trimmed)) return "Prep";
  const match = /year\s*(\d+)/i.exec(trimmed);
  if (match) return `Year ${match[1]}`;
  return trimmed;
}

const SCHOOL_YEAR_INDEX_MAX = SCHOOL_YEAR_LEVEL_OPTIONS.length - 1;

/** Read one year token ("Prep", "F", "Year 3", "Yr 3", "3") as an index into
 * SCHOOL_YEAR_LEVEL_OPTIONS, or null when it is not a primary school year. */
function schoolYearIndex(token: string) {
  const trimmed = token.trim();
  if (/^(prep|foundation|f|p)$/i.test(trimmed)) return 0;
  const match = /^(?:years?|yrs?|y)?\s*(\d{1,2})$/i.exec(trimmed);
  if (!match) return null;
  const year = Number(match[1]);
  return year >= 1 && year <= SCHOOL_YEAR_INDEX_MAX ? year : null;
}

/** One stored entry can hold a single year, a list ("Year 3, Year 4") or a
 * range ("Prep – Year 6", "Years 3–4", "3/4"). Expand it to every year it
 * covers so nothing is lost when the list is shown or saved again. */
function expandYearLevelValue(value: string) {
  const labels: string[] = [];
  for (const part of value.split(/[,;]/)) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const ends = trimmed.split(/\s*(?:[-–—/]|\bto\b)\s*/i).filter(Boolean);
    const from = ends.length === 2 ? schoolYearIndex(ends[0]) : null;
    const to = ends.length === 2 ? schoolYearIndex(ends[1]) : null;
    if (from !== null && to !== null) {
      for (let index = Math.min(from, to); index <= Math.max(from, to); index += 1) {
        labels.push(SCHOOL_YEAR_LEVEL_OPTIONS[index]);
      }
      continue;
    }
    const single = schoolYearIndex(trimmed);
    if (single !== null) labels.push(SCHOOL_YEAR_LEVEL_OPTIONS[single]);
    else {
      const label = normalizeSchoolYearLabel(trimmed);
      if (label) labels.push(label);
    }
  }
  return labels;
}

/** Clean a class's stored year levels for display, matching and the class
 * edit form. Older classes can hold bare numbers ("3") beside "Year 3", or a
 * range in one entry; every entry expands to the years it covers, each year
 * appears once, in school order. Unrecognised labels are kept. */
export function normalizeClassYearLevels(values?: readonly (string | null | undefined)[] | null) {
  const labels = new Set<string>();
  for (const value of values ?? []) {
    if (value) expandYearLevelValue(value).forEach((label) => labels.add(label));
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
