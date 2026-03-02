import { Question } from "./prep";

import { PREP_PRETEST } from "./prep";
import { YEAR1_PRETEST } from "./year1";
import { YEAR2_PRETEST } from "./year2";
import { YEAR3_PRETEST } from "./year3";
import { YEAR4_PRETEST } from "./year4";
import { YEAR5_PRETEST } from "./year5";
import { YEAR6_PRETEST } from "./year6";

export type { Question };

export const PRETESTS_BY_YEAR: Record<string, Question[]> = {
  Prep: PREP_PRETEST,
  "Year 1": YEAR1_PRETEST,
  "Year 2": YEAR2_PRETEST,
  "Year 3": YEAR3_PRETEST,
  "Year 4": YEAR4_PRETEST,
  "Year 5": YEAR5_PRETEST,
  "Year 6": YEAR6_PRETEST,
};

export function getPretestForYear(yearLabel: string): Question[] {
  return PRETESTS_BY_YEAR[yearLabel] ?? [];
}
