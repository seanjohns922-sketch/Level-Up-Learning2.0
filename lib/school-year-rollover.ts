export type RolloverStudent = { id: string; name: string; yearLevel: string | null; calendarYear: number; processed: boolean; retain: boolean };
export type RolloverResult = { id: string; name: string; previousYearLevel: string | null; newYearLevel: string | null; outcome: "promoted" | "retained" | "leaver_review" | "year_review"; targetYear: number };
export type SchoolYearRollover = {
  calendarYear: number; targetYear: number; highestYear: number; enabled: boolean; firstYear: number; reviewToken: string; prepared: boolean;
  students: RolloverStudent[]; lastResults: RolloverResult[];
};
export function previewSchoolYear(year: string | null, highestYear: number, retain: boolean) {
  const level = year === "Prep" ? 0 : /^Year [1-8]$/.test(year ?? "") ? Number(year!.slice(-1)) : null;
  if (level === null) return "Review year level";
  if (retain) return year!;
  if (level >= highestYear) return "School leaver — review";
  return `Year ${level + 1}`;
}
export function rolloverOutcome(student: RolloverStudent, targetYear: number, highestYear: number) {
  if (student.calendarYear >= targetYear || student.processed) return "already";
  if (student.calendarYear !== targetYear - 1 || previewSchoolYear(student.yearLevel, highestYear, student.retain) === "Review year level") return "review";
  if (student.retain) return "retained";
  return previewSchoolYear(student.yearLevel, highestYear, false) === "School leaver — review" ? "leaver" : "promoted";
}
export function schoolCalendarYear() {
  return Number(new Intl.DateTimeFormat("en-AU", { year: "numeric", timeZone: "Australia/Melbourne" }).format(new Date()));
}
