import { YEAR1_PROGRAM, type WeekPlan } from "./year1";
import { year2Number } from "./year2Number";
import { YEAR3_PROGRAM } from "./year3";
import { YEAR4_PROGRAM } from "./year4";
import { YEAR5_PROGRAM } from "./year5";
import { YEAR6_PROGRAM } from "./year6";

export const programs = {
  1: YEAR1_PROGRAM,
  2: year2Number,
  3: YEAR3_PROGRAM,
  4: YEAR4_PROGRAM,
  5: YEAR5_PROGRAM,
  6: YEAR6_PROGRAM,
};

export const PROGRAMS_BY_YEAR: Record<string, WeekPlan[]> = {
  "Year 1": YEAR1_PROGRAM,
  "Year 2": year2Number,
  "Year 3": YEAR3_PROGRAM,
  "Year 4": YEAR4_PROGRAM,
  "Year 5": YEAR5_PROGRAM,
  "Year 6": YEAR6_PROGRAM,
};

export function getProgramForYear(yearLabel: string): WeekPlan[] {
  return PROGRAMS_BY_YEAR[yearLabel] ?? [];
}
