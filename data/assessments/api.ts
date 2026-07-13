import { getPretestForYear, type Question as PretestQuestion } from "./pretests";
import { POSTTESTS, buildPrepPosttest, type PostTest, type Question as PosttestQuestion } from "./posttests";
import { getMeasurelandsPosttestForYear, getMeasurelandsPretestForYear } from "./measurelands";
import type { SupportedMathLevel } from "@/data/activities/year2/lessonEngine";
import {
  buildLevel3PosttestFormB,
  buildLevel3PretestFormA,
  validateLevel3AssessmentForms,
} from "./level3Blueprint";

export type AssessmentQuestion = PretestQuestion | PosttestQuestion;
export type AssessmentRealmId = "number" | "measurement";

function yearLabelForLevel(level: SupportedMathLevel): string {
  return `Year ${level}`;
}

export function getPretestForLevel(level: SupportedMathLevel, realmId: AssessmentRealmId = "number"): PretestQuestion[] {
  if (realmId === "measurement") {
    return getMeasurelandsPretestForYear(yearLabelForLevel(level)) as PretestQuestion[];
  }
  if (level === 3) {
    return buildLevel3PretestFormA();
  }
  return getPretestForYear(yearLabelForLevel(level));
}

export function getPosttestForLevel(level: SupportedMathLevel, realmId: AssessmentRealmId = "number"): PostTest | undefined {
  if (realmId === "measurement") {
    return getMeasurelandsPosttestForYear(yearLabelForLevel(level));
  }
  if (level === 3) {
    return buildLevel3PosttestFormB();
  }
  return POSTTESTS[yearLabelForLevel(level)];
}

export function getAssessmentYearLabel(level: SupportedMathLevel): string {
  return yearLabelForLevel(level);
}

export function getPretestForYearLabel(yearLabel: string, realmId: AssessmentRealmId = "number"): PretestQuestion[] {
  if (realmId === "measurement") {
    return getMeasurelandsPretestForYear(yearLabel) as PretestQuestion[];
  }
  if (yearLabel === "Year 3") {
    return buildLevel3PretestFormA();
  }
  return getPretestForYear(yearLabel);
}

export function getPosttestForYearLabel(yearLabel: string, realmId: AssessmentRealmId = "number"): PostTest | undefined {
  if (realmId === "measurement") {
    return getMeasurelandsPosttestForYear(yearLabel);
  }
  if (yearLabel === "Prep") {
    return buildPrepPosttest();
  }
  if (yearLabel === "Year 3") {
    return buildLevel3PosttestFormB();
  }
  return POSTTESTS[yearLabel];
}

export function validateAssessmentBlueprintForLevel(level: SupportedMathLevel, realmId: AssessmentRealmId = "number"): string[] {
  if (realmId === "measurement") {
    return [];
  }
  if (level === 3) {
    return validateLevel3AssessmentForms();
  }
  return [];
}
