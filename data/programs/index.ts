import { YEAR1_PROGRAM, type WeekPlan } from "./year1";

export const PROGRAMS_BY_YEAR: Record<string, WeekPlan[]> = {
  "Year 1": YEAR1_PROGRAM,
};

export function getProgramForYear(yearLabel: string): WeekPlan[] {
  return PROGRAMS_BY_YEAR[yearLabel] ?? [];
}
