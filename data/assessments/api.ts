import { getPretestForYear, type Question as PretestQuestion } from "./pretests";
import { POSTTESTS, type PostTest, type Question as PosttestQuestion } from "./posttests";
import type { SupportedMathLevel } from "@/data/activities/year2/lessonEngine";

export type AssessmentQuestion = PretestQuestion | PosttestQuestion;

function yearLabelForLevel(level: SupportedMathLevel): string {
  return `Year ${level}`;
}

export function getPretestForLevel(level: SupportedMathLevel): PretestQuestion[] {
  return getPretestForYear(yearLabelForLevel(level));
}

export function getPosttestForLevel(level: SupportedMathLevel): PostTest | undefined {
  return POSTTESTS[yearLabelForLevel(level)];
}

export function getAssessmentYearLabel(level: SupportedMathLevel): string {
  return yearLabelForLevel(level);
}
