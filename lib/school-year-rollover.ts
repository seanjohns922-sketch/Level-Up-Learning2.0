export type RolloverStudent = { id: string; name: string; yearLevel: string | null; retain: boolean };
export type RolloverResult = { id: string; name: string; previousYearLevel: string | null; newYearLevel: string | null; outcome: "promoted" | "retained" | "leaver_review" | "year_review"; targetYear: number };
export type SchoolYearRollover = {
  calendarYear: number; targetYear: number; highestYear: number; enabled: boolean; firstYear: number;
  students: RolloverStudent[]; lastResults: RolloverResult[];
};
export function previewSchoolYear(year: string | null, highestYear: number, retain: boolean) {
  const level = year === "Prep" ? 0 : /^Year [1-8]$/.test(year ?? "") ? Number(year!.slice(-1)) : null;
  if (level === null) return "Review year level";
  if (retain) return year!;
  if (level >= highestYear) return "School leaver — review";
  return `Year ${level + 1}`;
}
