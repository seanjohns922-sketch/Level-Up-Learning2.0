import { YEAR1_PROGRAM, type WeekPlan } from "./year1";
import { year2Number } from "./year2Number";
import { YEAR3_PROGRAM } from "./year3";

export const programs = {
  1: YEAR1_PROGRAM,
  2: year2Number,
  3: YEAR3_PROGRAM,
};

export const PROGRAMS_BY_YEAR: Record<string, WeekPlan[]> = {
  "Year 1": YEAR1_PROGRAM,
  "Year 2": year2Number,
  "Year 3": YEAR3_PROGRAM,
};

export function getProgramForYear(yearLabel: string): WeekPlan[] {
  return PROGRAMS_BY_YEAR[yearLabel] ?? [];
}
