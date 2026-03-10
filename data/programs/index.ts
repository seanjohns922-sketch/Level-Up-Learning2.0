import { YEAR1_PROGRAM, type WeekPlan } from "./year1";
import { year2Number } from "./year2Number";

export const programs = {
  1: YEAR1_PROGRAM,
  2: year2Number,
};

export const PROGRAMS_BY_YEAR: Record<string, WeekPlan[]> = {
  "Year 1": YEAR1_PROGRAM,
  "Year 2": year2Number,
};

export function getProgramForYear(yearLabel: string): WeekPlan[] {
  return PROGRAMS_BY_YEAR[yearLabel] ?? [];
}
