import { getPretestForYear, type Question as PretestQuestion } from "./pretests";
import { POSTTESTS, type PostTest, type Question as PosttestQuestion } from "./posttests";
import type { SupportedMathLevel } from "@/data/activities/year2/lessonEngine";
import {
  buildLevel3PosttestFormB,
  buildLevel3PretestFormA,
  validateLevel3AssessmentForms,
} from "./level3Blueprint";

export type AssessmentQuestion = PretestQuestion | PosttestQuestion;

function yearLabelForLevel(level: SupportedMathLevel): string {
  return `Year ${level}`;
}

export function getPretestForLevel(level: SupportedMathLevel): PretestQuestion[] {
  if (level === 3) {
    return buildLevel3PretestFormA();
  }
  return getPretestForYear(yearLabelForLevel(level));
}

export function getPosttestForLevel(level: SupportedMathLevel): PostTest | undefined {
  if (level === 3) {
    return buildLevel3PosttestFormB();
  }
  return POSTTESTS[yearLabelForLevel(level)];
}

export function getAssessmentYearLabel(level: SupportedMathLevel): string {
  return yearLabelForLevel(level);
}

export function getPretestForYearLabel(yearLabel: string): PretestQuestion[] {
  if (yearLabel === "Year 3") {
    return buildLevel3PretestFormA();
  }
  return getPretestForYear(yearLabel);
}

export function getPosttestForYearLabel(yearLabel: string): PostTest | undefined {
  if (yearLabel === "Year 3") {
    return buildLevel3PosttestFormB();
  }
  return POSTTESTS[yearLabel];
}

export function validateAssessmentBlueprintForLevel(level: SupportedMathLevel): string[] {
  if (level === 3) {
    return validateLevel3AssessmentForms();
  }
  return [];
}
