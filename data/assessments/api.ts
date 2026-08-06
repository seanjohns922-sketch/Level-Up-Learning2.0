import { getPretestForYear, type Question as PretestQuestion } from "./pretests";
import { POSTTESTS, type PostTest, type Question as PosttestQuestion } from "./posttests";
import { GROUND_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS } from "./groundNumberNexusIndependentPosttest";
import {
  YEAR1_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS,
  YEAR1_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS,
} from "./year1NumberNexusIndependentBanks";
import { getMeasurelandsPosttestForYear, getMeasurelandsPretestForYear } from "./measurelands";
import { getStarpathPosttestForYear } from "@/data/activities/starpath/ground/groundPostTest";
import { getLevelOnePosttest } from "@/data/activities/starpath/level1/level1PostTest";
import { getLevelTwoPosttest } from "@/data/activities/starpath/level2/level2PostTest";
import { getLevelThreePosttest } from "@/data/activities/starpath/level3/level3PostTest";
import type { SupportedMathLevel } from "@/data/activities/year2/lessonEngine";
import { isGroundLevelYear } from "@/lib/lesson-routing";
import {
  buildLevel3PosttestFormB,
  buildLevel3PretestFormA,
  validateLevel3AssessmentForms,
} from "./level3Blueprint";

export type AssessmentQuestion = PretestQuestion | PosttestQuestion;
export type AssessmentRealmId = "number" | "measurement" | "space";

// Resolve the Starpath (space) post-test for a given year label. Ground Level
// (Prep) and Level 1 (Year 1) have full post-tests; later levels fall through.
function getStarpathPosttest(yearLabel: string): PostTest | undefined {
  if (yearLabel === "Year 1") return getLevelOnePosttest();
  if (yearLabel === "Year 2") return getLevelTwoPosttest();
  if (yearLabel === "Year 3") return getLevelThreePosttest();
  return getStarpathPosttestForYear(yearLabel);
}

function yearLabelForLevel(level: SupportedMathLevel): string {
  return `Year ${level}`;
}

export function getPretestForLevel(level: SupportedMathLevel, realmId: AssessmentRealmId = "number"): PretestQuestion[] {
  if (realmId === "space") {
    return [];
  }
  if (realmId === "measurement") {
    return getMeasurelandsPretestForYear(yearLabelForLevel(level)) as PretestQuestion[];
  }
  if (level === 3) {
    return buildLevel3PretestFormA();
  }
  return getPretestForYear(yearLabelForLevel(level));
}

export function getPosttestForLevel(level: SupportedMathLevel, realmId: AssessmentRealmId = "number"): PostTest | undefined {
  if (realmId === "space") {
    return getStarpathPosttest(yearLabelForLevel(level));
  }
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
  if (realmId === "space") {
    return [];
  }
  if (realmId === "measurement") {
    return getMeasurelandsPretestForYear(yearLabel) as PretestQuestion[];
  }
  if (yearLabel === "Year 3") {
    return buildLevel3PretestFormA();
  }
  if (yearLabel === "Year 1") {
    return [...YEAR1_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS] as unknown as PretestQuestion[];
  }
  return getPretestForYear(yearLabel);
}

export function getPosttestForYearLabel(yearLabel: string, realmId: AssessmentRealmId = "number"): PostTest | undefined {
  if (realmId === "space") {
    return getStarpathPosttest(yearLabel);
  }
  if (realmId === "measurement") {
    return getMeasurelandsPosttestForYear(yearLabel);
  }
  if (isGroundLevelYear(yearLabel)) {
    return {
      yearLabel: "Prep",
      questions: [...GROUND_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS],
    };
  }
  if (yearLabel === "Year 1") {
    return {
      yearLabel: "Year 1",
      questions: [...YEAR1_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS],
    };
  }
  if (yearLabel === "Year 3") {
    return buildLevel3PosttestFormB();
  }
  return POSTTESTS[yearLabel];
}

export function validateAssessmentBlueprintForLevel(level: SupportedMathLevel, realmId: AssessmentRealmId = "number"): string[] {
  if (realmId === "space") {
    return [];
  }
  if (realmId === "measurement") {
    return [];
  }
  if (level === 3) {
    return validateLevel3AssessmentForms();
  }
  return [];
}
