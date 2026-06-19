export type StudentRealmId = "number" | "measurement";

export function normalizeStudentYearLabel(yearLabel: string): string {
  const trimmed = yearLabel.trim();
  const lowered = trimmed.toLowerCase();
  if (lowered === "prep" || lowered === "foundation" || lowered === "ground level") {
    return "Prep";
  }
  return trimmed;
}

export function isGroundLevelYear(yearLabel: string): boolean {
  return normalizeStudentYearLabel(yearLabel) === "Prep";
}

export function parseStudentYearNumber(yearLabel: string): number {
  const normalized = normalizeStudentYearLabel(yearLabel);
  if (normalized === "Prep") return 0;
  return parseInt(normalized.replace(/\D/g, ""), 10) || 1;
}

export function buildLessonId(input: {
  yearLabel: string;
  week: number;
  lessonNumber: number;
  realmId?: string;
}): string {
  const normalizedYear = normalizeStudentYearLabel(input.yearLabel);
  const normalizedRealm = input.realmId === "measurement" ? "measurement" : "number";
  if (normalizedRealm === "measurement" && normalizedYear === "Prep") {
    return `y0-measurement-w${input.week}-l${input.lessonNumber}`;
  }
  return `y${parseStudentYearNumber(normalizedYear)}-w${input.week}-l${input.lessonNumber}`;
}

export function buildLessonRoute(input: {
  yearLabel: string;
  week: number;
  lessonNumber: number;
  realmId?: string;
}): string {
  const normalizedYear = normalizeStudentYearLabel(input.yearLabel);
  const lessonId = buildLessonId(input);
  const realmParam = input.realmId === "measurement" ? `&realm_id=${encodeURIComponent("measurement")}` : "";
  return `/lesson?year=${encodeURIComponent(normalizedYear)}&week=${input.week}&lessonId=${lessonId}${realmParam}`;
}
