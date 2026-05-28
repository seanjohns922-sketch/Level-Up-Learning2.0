import { normalizeWorkingLevelLabel } from "@/lib/studentLevelLabel";

function yearKey(yearLabel: string): number {
  if (yearLabel === "Prep") return 0;
  const match = /Year\s+(\d+)/i.exec(yearLabel);
  return match ? Number(match[1]) : 0;
}

export function normalizeLessonId(
  yearOrLevel: string,
  weekNumber: number,
  lessonNumber: number,
) {
  const normalizedYear = normalizeWorkingLevelLabel(yearOrLevel) ?? yearOrLevel;
  return `y${yearKey(normalizedYear)}-w${weekNumber}-l${lessonNumber}`;
}

export function parseLessonNumberFromId(lessonId?: string | null) {
  if (!lessonId) return null;
  const match = /-l(\d+)$/i.exec(lessonId);
  return match ? Number(match[1]) : null;
}
