import { getStarpathLevelForYear } from "@/lib/starpath-levels";
import { buildStarpathLessonHref } from "@/lib/starpath-routes";
import type { LiveRealmId } from "@/lib/realms/realm-registry";

export type StudentRealmId = LiveRealmId;

function assertLessonRealmHandled(realmId: never): never {
  throw new Error(`Lesson routing is missing for live realm: ${realmId}`);
}

export function normalizeStudentYearLabel(yearLabel: string): string {
  const trimmed = yearLabel.trim();
  const lowered = trimmed.toLowerCase();
  if (lowered === "prep" || lowered === "foundation" || lowered === "ground" || lowered === "ground level") {
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
  const normalizedRealm = (input.realmId == null || input.realmId === ""
    ? "number"
    : input.realmId) as StudentRealmId;
  switch (normalizedRealm) {
    case "space": {
      const level = getStarpathLevelForYear(normalizedYear as Parameters<typeof getStarpathLevelForYear>[0]);
      return `y${level.levelNumber}-space-w${input.week}-l${input.lessonNumber}`;
    }
    case "measurement":
      return `y${parseStudentYearNumber(normalizedYear)}-measurement-w${input.week}-l${input.lessonNumber}`;
    case "number":
      return `y${parseStudentYearNumber(normalizedYear)}-w${input.week}-l${input.lessonNumber}`;
    default:
      return assertLessonRealmHandled(normalizedRealm);
  }
}

export function buildLessonRoute(input: {
  yearLabel: string;
  week: number;
  lessonNumber: number;
  realmId?: string;
}): string {
  const normalizedYear = normalizeStudentYearLabel(input.yearLabel);
  if (input.realmId === "space") {
    const level = getStarpathLevelForYear(normalizedYear as Parameters<typeof getStarpathLevelForYear>[0]);
    return buildStarpathLessonHref(
      { selectedLevel: level.id },
      input.week,
      input.lessonNumber,
    );
  }
  const lessonId = buildLessonId(input);
  const realmParam = input.realmId === "measurement" ? `&realm_id=${encodeURIComponent("measurement")}` : "";
  return `/lesson?year=${encodeURIComponent(normalizedYear)}&week=${input.week}&lessonId=${lessonId}${realmParam}`;
}
