import { YEAR3_MEASUREMENT_RELEASED_FORMS } from './releases/year3Measurement';
import { YEAR4_MEASUREMENT_RELEASED_FORMS } from './releases/year4Measurement';
import { YEAR7_MEASUREMENT_RELEASED_FORMS } from './releases/year7Measurement';
import { YEAR8_MEASUREMENT_RELEASED_FORMS } from './releases/year8Measurement';
import { YEAR6_MEASUREMENT_RELEASED_FORMS } from './releases/year6Measurement';
import { YEAR5_MEASUREMENT_RELEASED_FORMS } from './releases/year5Measurement';
import { YEAR2_MEASUREMENT_RELEASED_FORMS } from './releases/year2Measurement';
import { YEAR1_MEASUREMENT_RELEASED_FORMS } from './releases/year1Measurement';
import { GROUND_MEASUREMENT_RELEASED_FORMS } from './releases/groundMeasurement';
import { YEAR3_NUMBER_RELEASED_FORMS } from "./revisions/year3NumberReleasedForms";
import { YEAR8_NUMBER_RELEASED_FORMS } from "./revisions/year8NumberReleasedForms";
import { YEAR7_NUMBER_RELEASED_FORMS } from "./revisions/year7NumberReleasedForms";
import { YEAR6_NUMBER_RELEASED_FORMS } from "./revisions/year6NumberReleasedForms";
import { GROUND_NUMBER_V3_FORMS } from "./releases/groundNumber";
import { YEAR1_NUMBER_RELEASED_FORMS } from "./revisions/year1NumberReleasedForms";
import { YEAR4_NUMBER_RELEASED_FORMS } from "./revisions/year4NumberReleasedForms";
import { YEAR5_NUMBER_RELEASED_FORMS } from "./revisions/year5NumberReleasedForms";
import { YEAR2_NUMBER_RELEASED_FORMS } from "./revisions/year2NumberReleasedForms";
import { YEAR1_NUMBER_MATCHED_PRE_ITEMS, YEAR1_NUMBER_MATCHED_POST_ITEMS } from "./revisions/year1NumberMatchedPair";
import { YEAR6_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS, YEAR6_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS } from "./year6NumberNexusIndependentBanks";
import { GROUND_STARPATH_INDEPENDENT_PRETEST_ITEMS } from "./groundStarpathIndependentPosttest";
import { getPretestForYear, type Question as PretestQuestion } from "./pretests";
import { POSTTESTS, type PostTest, type Question as PosttestQuestion } from "./posttests";
import { GROUND_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS, GROUND_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS } from "./groundNumberNexusIndependentPosttest";
import {
  YEAR1_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS,
  YEAR1_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS,
} from "./year1NumberNexusIndependentBanks";
import {
  YEAR2_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS,
  YEAR2_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS,
} from "./year2NumberNexusIndependentBanks";
import {
  YEAR4_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS,
  YEAR4_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS,
} from "./year4NumberNexusIndependentBanks";
import {
  YEAR5_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS,
  YEAR5_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS,
} from "./year5NumberNexusIndependentBanks";
import { getMeasurelandsPosttestForYear, getMeasurelandsPretestForYear } from "./measurelands";
import {
  LEVEL1_STARPATH_INDEPENDENT_POSTTEST_ITEMS,
  LEVEL1_STARPATH_INDEPENDENT_PRETEST_ITEMS,
} from "./level1StarpathIndependentAssessments";
import {
  LEVEL2_STARPATH_INDEPENDENT_POSTTEST_ITEMS,
  LEVEL2_STARPATH_INDEPENDENT_PRETEST_ITEMS,
} from "./level2StarpathIndependentAssessments";
import {
  LEVEL3_STARPATH_INDEPENDENT_POSTTEST_ITEMS,
  LEVEL3_STARPATH_INDEPENDENT_PRETEST_ITEMS,
} from "./level3StarpathIndependentAssessments";
import {
  LEVEL4_STARPATH_INDEPENDENT_POSTTEST_ITEMS,
  LEVEL4_STARPATH_INDEPENDENT_PRETEST_ITEMS,
} from "./level4StarpathIndependentAssessments";
import {
  LEVEL5_STARPATH_INDEPENDENT_POSTTEST_ITEMS,
  LEVEL5_STARPATH_INDEPENDENT_PRETEST_ITEMS,
} from "./level5StarpathIndependentAssessments";
import {
  LEVEL6_STARPATH_INDEPENDENT_POSTTEST_ITEMS,
  LEVEL6_STARPATH_INDEPENDENT_PRETEST_ITEMS,
} from "./level6StarpathIndependentAssessments";
import { getStarpathPosttestForYear } from "@/data/activities/starpath/ground/groundPostTest";
import type { SupportedMathLevel } from "@/data/activities/year2/lessonEngine";
import { isGroundLevelYear } from "@/lib/lesson-routing";
import {
  buildLevel3PosttestFormB,
  buildLevel3PretestFormA,
  validateLevel3AssessmentForms,
} from "./level3Blueprint";
import { validateStarpathAssessmentBlueprintForLevel } from "./starpathAssessmentBlueprint";
import type { LiveRealmId } from "@/lib/realms/realm-registry";
import { getStatisticaIndependentAssessment } from "./statisticaIndependentBanks";
import { getPatternPeaksIndependentAssessment } from "./patternPeaksIndependentBanks";
import { validatePatternPeaksAssessmentBlueprintForLevel } from "./patternPeaksAssessmentBlueprint";
import { getChanceHollowIndependentAssessment } from "./chanceHollowIndependentBanks";
import { validateChanceHollowAssessmentBlueprintForLevel } from "./chanceHollowAssessmentBlueprint";

export type AssessmentQuestion = PretestQuestion | PosttestQuestion;
export type AssessmentRealmId = LiveRealmId | "statistics" | "pattern" | "chance";

function assertAssessmentRealmHandled(realmId: never): never {
  throw new Error(`Assessment resolver is missing for live realm: ${realmId}`);
}

// Resolve the Starpath (space) post-test for a given year label. Ground Level
// (Prep) and Levels 1-6 have full post-tests; later levels fall through.
function getStarpathPosttest(yearLabel: string): PostTest | undefined {
  if (yearLabel === "Year 1") {
    return {
      yearLabel: "Year 1",
      questions: [...LEVEL1_STARPATH_INDEPENDENT_POSTTEST_ITEMS],
    };
  }
  if (yearLabel === "Year 2") {
    return {
      yearLabel: "Year 2",
      questions: [...LEVEL2_STARPATH_INDEPENDENT_POSTTEST_ITEMS],
    };
  }
  if (yearLabel === "Year 3") {
    return {
      yearLabel: "Year 3",
      questions: [...LEVEL3_STARPATH_INDEPENDENT_POSTTEST_ITEMS],
    };
  }
  if (yearLabel === "Year 4") {
    return {
      yearLabel: "Year 4",
      questions: [...LEVEL4_STARPATH_INDEPENDENT_POSTTEST_ITEMS],
    };
  }
  if (yearLabel === "Year 5") {
    return {
      yearLabel: "Year 5",
      questions: [...LEVEL5_STARPATH_INDEPENDENT_POSTTEST_ITEMS],
    };
  }
  if (yearLabel === "Year 6") {
    return {
      yearLabel: "Year 6",
      questions: [...LEVEL6_STARPATH_INDEPENDENT_POSTTEST_ITEMS],
    };
  }
  return getStarpathPosttestForYear(yearLabel);
}

function getStarpathPretest(yearLabel: string): PretestQuestion[] {
  if (isGroundLevelYear(yearLabel)) return [...GROUND_STARPATH_INDEPENDENT_PRETEST_ITEMS] as unknown as PretestQuestion[];
  if (yearLabel === "Year 1") {
    return [...LEVEL1_STARPATH_INDEPENDENT_PRETEST_ITEMS] as unknown as PretestQuestion[];
  }
  if (yearLabel === "Year 2") {
    return [...LEVEL2_STARPATH_INDEPENDENT_PRETEST_ITEMS] as unknown as PretestQuestion[];
  }
  if (yearLabel === "Year 3") {
    return [...LEVEL3_STARPATH_INDEPENDENT_PRETEST_ITEMS] as unknown as PretestQuestion[];
  }
  if (yearLabel === "Year 4") {
    return [...LEVEL4_STARPATH_INDEPENDENT_PRETEST_ITEMS] as unknown as PretestQuestion[];
  }
  if (yearLabel === "Year 5") {
    return [...LEVEL5_STARPATH_INDEPENDENT_PRETEST_ITEMS] as unknown as PretestQuestion[];
  }
  if (yearLabel === "Year 6") {
    return [...LEVEL6_STARPATH_INDEPENDENT_PRETEST_ITEMS] as unknown as PretestQuestion[];
  }
  return [];
}

function yearLabelForLevel(level: SupportedMathLevel): string {
  return `Year ${level}`;
}

export function getPretestForLevel(level: SupportedMathLevel, realmId: AssessmentRealmId = "number"): PretestQuestion[] {
  switch (realmId) {
    case "space":
      return getStarpathPretest(yearLabelForLevel(level));
    case "measurement":
      return getMeasurelandsPretestForYear(yearLabelForLevel(level)) as PretestQuestion[];
    case "statistics":
      return getStatisticaIndependentAssessment(level, "pretest") as unknown as PretestQuestion[];
    case "pattern":
      return getPatternPeaksIndependentAssessment(level, "pretest") as unknown as PretestQuestion[];
    case "chance":
      return getChanceHollowIndependentAssessment(level, "pretest") as unknown as PretestQuestion[];
    case "number":
      break;
    default:
      return assertAssessmentRealmHandled(realmId);
  }
  if (level === 3) {
    return buildLevel3PretestFormA();
  }
  if (level === 2) {
    return [...YEAR2_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS] as unknown as PretestQuestion[];
  }
  if (level === 4) {
    return [...YEAR4_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS] as unknown as PretestQuestion[];
  }
  if (level === 5) {
    return [...YEAR5_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS] as unknown as PretestQuestion[];
  }
  return getPretestForYear(yearLabelForLevel(level));
}

export function getPosttestForLevel(level: SupportedMathLevel, realmId: AssessmentRealmId = "number"): PostTest | undefined {
  switch (realmId) {
    case "space":
      return getStarpathPosttest(yearLabelForLevel(level));
    case "measurement":
      return getMeasurelandsPosttestForYear(yearLabelForLevel(level));
    case "statistics":
      return { yearLabel: yearLabelForLevel(level), questions: getStatisticaIndependentAssessment(level, "posttest") };
    case "pattern":
      return { yearLabel: yearLabelForLevel(level), questions: getPatternPeaksIndependentAssessment(level, "posttest") };
    case "chance":
      return { yearLabel: yearLabelForLevel(level), questions: getChanceHollowIndependentAssessment(level, "posttest") };
    case "number":
      break;
    default:
      return assertAssessmentRealmHandled(realmId);
  }
  if (level === 3) {
    return buildLevel3PosttestFormB();
  }
  if (level === 2) {
    return { yearLabel: "Year 2", questions: [...YEAR2_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS] };
  }
  if (level === 4) {
    return { yearLabel: "Year 4", questions: [...YEAR4_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS] };
  }
  if (level === 5) {
    return { yearLabel: "Year 5", questions: [...YEAR5_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS] };
  }
  return POSTTESTS[yearLabelForLevel(level)];
}

export function getAssessmentYearLabel(level: SupportedMathLevel): string {
  return yearLabelForLevel(level);
}

export function getPretestForYearLabel(yearLabel: string, realmId: AssessmentRealmId = "number", numberLevel1Version: 2 | 3 | 5 = 5, groundNumberVersion: 1 | 3 = 3, numberLevel2Version: 2 | 3 = 3, numberLevel4Version: 2 | 3 = 3, numberLevel5Version: 2 | 3 = 3, numberLevel6Version: 2 | 3 = 3, numberLevel3Version: 2 | 3 = 3, groundMeasurementVersion: 3 | 4 = 4, year1MeasurementVersion:3|4=4, year2MeasurementVersion:3|4=4, year5MeasurementVersion:3|4=4, year6MeasurementVersion:3|4=4,measurementReleaseVersion:0|1=1): PretestQuestion[] {
  switch (realmId) {
    case "space":
      return getStarpathPretest(yearLabel);
    case "measurement":
      return measurementReleaseVersion===1 && ['Year 3','Year 4','Year 7','Year 8'].includes(yearLabel) ? [...({'Year 3':YEAR3_MEASUREMENT_RELEASED_FORMS,'Year 4':YEAR4_MEASUREMENT_RELEASED_FORMS,'Year 7':YEAR7_MEASUREMENT_RELEASED_FORMS,'Year 8':YEAR8_MEASUREMENT_RELEASED_FORMS}[yearLabel as 'Year 3']).pretest] as unknown as PretestQuestion[] : yearLabel==='Year 6' && year6MeasurementVersion===4 ? [...YEAR6_MEASUREMENT_RELEASED_FORMS.pretest] as unknown as PretestQuestion[] : yearLabel==='Year 5' && year5MeasurementVersion===4 ? [...YEAR5_MEASUREMENT_RELEASED_FORMS.pretest] as unknown as PretestQuestion[] : yearLabel==='Year 2' && year2MeasurementVersion===4 ? [...YEAR2_MEASUREMENT_RELEASED_FORMS.pretest] as unknown as PretestQuestion[] : yearLabel==='Year 1' && year1MeasurementVersion===4 ? [...YEAR1_MEASUREMENT_RELEASED_FORMS.pretest] as unknown as PretestQuestion[] : isGroundLevelYear(yearLabel) && groundMeasurementVersion===4 ? [...GROUND_MEASUREMENT_RELEASED_FORMS.pretest] as unknown as PretestQuestion[] : getMeasurelandsPretestForYear(yearLabel) as PretestQuestion[];
    case "statistics":
      return getStatisticaIndependentAssessment(Number(yearLabel.replace(/\D/g, "")), "pretest") as unknown as PretestQuestion[];
    case "pattern":
      return getPatternPeaksIndependentAssessment(Number(yearLabel.replace(/\D/g, "")), "pretest") as unknown as PretestQuestion[];
    case "chance":
      return getChanceHollowIndependentAssessment(Number(yearLabel.replace(/\D/g, "")), "pretest") as unknown as PretestQuestion[];
    case "number":
      break;
    default:
      return assertAssessmentRealmHandled(realmId);
  }
  if (yearLabel === "Year 8") return [...YEAR8_NUMBER_RELEASED_FORMS.pretest] as unknown as PretestQuestion[];
  if (yearLabel === "Year 7") return [...YEAR7_NUMBER_RELEASED_FORMS.pretest] as unknown as PretestQuestion[];
  if (yearLabel === "Year 6") return [...(numberLevel6Version === 2 ? YEAR6_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS : YEAR6_NUMBER_RELEASED_FORMS.pretest)] as unknown as PretestQuestion[];
  if (yearLabel === "Year 3") {
    return numberLevel3Version === 2 ? buildLevel3PretestFormA() : [...YEAR3_NUMBER_RELEASED_FORMS.pretest] as unknown as PretestQuestion[];
  }
  if (yearLabel === "Year 1") {
    return [...(numberLevel1Version === 2 ? YEAR1_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS : numberLevel1Version === 3 ? YEAR1_NUMBER_MATCHED_PRE_ITEMS : YEAR1_NUMBER_RELEASED_FORMS.pretest)] as unknown as PretestQuestion[];
  }
  if (yearLabel === "Year 2") {
    return [...(numberLevel2Version === 2 ? YEAR2_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS : YEAR2_NUMBER_RELEASED_FORMS.pretest)] as unknown as PretestQuestion[];
  }
  if (yearLabel === "Year 4") {
    return [...(numberLevel4Version === 2 ? YEAR4_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS : YEAR4_NUMBER_RELEASED_FORMS.pretest)] as unknown as PretestQuestion[];
  }
  if (yearLabel === "Year 5") {
    return [...(numberLevel5Version === 2 ? YEAR5_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS : YEAR5_NUMBER_RELEASED_FORMS.pretest)] as unknown as PretestQuestion[];
  }
  if (isGroundLevelYear(yearLabel)) return [...(groundNumberVersion===1 ? GROUND_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS : GROUND_NUMBER_V3_FORMS.pretest)] as unknown as PretestQuestion[];
  return getPretestForYear(yearLabel);
}

export function getPosttestForYearLabel(yearLabel: string, realmId: AssessmentRealmId = "number", numberLevel1Version: 2 | 3 | 5 = 5, groundNumberVersion: 1 | 3 = 3, numberLevel2Version: 2 | 3 = 3, numberLevel4Version: 2 | 3 = 3, numberLevel5Version: 2 | 3 = 3, numberLevel6Version: 2 | 3 = 3, numberLevel3Version: 2 | 3 = 3, groundMeasurementVersion: 3 | 4 = 4, year1MeasurementVersion:3|4=4, year2MeasurementVersion:3|4=4, year5MeasurementVersion:3|4=4, year6MeasurementVersion:3|4=4,measurementReleaseVersion:0|1=1): PostTest | undefined {
  switch (realmId) {
    case "space":
      return getStarpathPosttest(yearLabel);
    case "measurement":
      return measurementReleaseVersion===1 && ['Year 3','Year 4','Year 7','Year 8'].includes(yearLabel) ? {yearLabel,questions:[...({'Year 3':YEAR3_MEASUREMENT_RELEASED_FORMS,'Year 4':YEAR4_MEASUREMENT_RELEASED_FORMS,'Year 7':YEAR7_MEASUREMENT_RELEASED_FORMS,'Year 8':YEAR8_MEASUREMENT_RELEASED_FORMS}[yearLabel as 'Year 3']).posttest]} as PostTest : yearLabel==='Year 6' && year6MeasurementVersion===4 ? {yearLabel:'Year 6',questions:[...YEAR6_MEASUREMENT_RELEASED_FORMS.posttest]} as PostTest : yearLabel==='Year 5' && year5MeasurementVersion===4 ? {yearLabel:'Year 5',questions:[...YEAR5_MEASUREMENT_RELEASED_FORMS.posttest]} as PostTest : yearLabel==='Year 2' && year2MeasurementVersion===4 ? {yearLabel:'Year 2',questions:[...YEAR2_MEASUREMENT_RELEASED_FORMS.posttest]} as PostTest : yearLabel==='Year 1' && year1MeasurementVersion===4 ? {yearLabel:'Year 1',questions:[...YEAR1_MEASUREMENT_RELEASED_FORMS.posttest]} as PostTest : isGroundLevelYear(yearLabel) && groundMeasurementVersion===4 ? {yearLabel:'Prep',questions:[...GROUND_MEASUREMENT_RELEASED_FORMS.posttest]} as PostTest : getMeasurelandsPosttestForYear(yearLabel);
    case "statistics":
      return { yearLabel, questions: getStatisticaIndependentAssessment(Number(yearLabel.replace(/\D/g, "")), "posttest") };
    case "pattern":
      return { yearLabel, questions: getPatternPeaksIndependentAssessment(Number(yearLabel.replace(/\D/g, "")), "posttest") };
    case "chance":
      return { yearLabel, questions: getChanceHollowIndependentAssessment(Number(yearLabel.replace(/\D/g, "")), "posttest") };
    case "number":
      break;
    default:
      return assertAssessmentRealmHandled(realmId);
  }
  if (yearLabel === "Year 8") return {yearLabel, questions: [...YEAR8_NUMBER_RELEASED_FORMS.posttest]};
  if (yearLabel === "Year 7") return {yearLabel, questions: [...YEAR7_NUMBER_RELEASED_FORMS.posttest]};
  if (yearLabel === "Year 6") return { yearLabel, questions: [...(numberLevel6Version === 2 ? YEAR6_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS : YEAR6_NUMBER_RELEASED_FORMS.posttest)] };
  if (isGroundLevelYear(yearLabel)) {
    return {
      yearLabel: "Prep",
      questions: [...(groundNumberVersion===1 ? GROUND_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS : GROUND_NUMBER_V3_FORMS.posttest)],
    };
  }
  if (yearLabel === "Year 1") {
    return {
      yearLabel: "Year 1",
      questions: [...(numberLevel1Version === 2 ? YEAR1_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS : numberLevel1Version === 3 ? YEAR1_NUMBER_MATCHED_POST_ITEMS : YEAR1_NUMBER_RELEASED_FORMS.posttest)],
    };
  }
  if (yearLabel === "Year 2") {
    return {
      yearLabel: "Year 2",
      questions: [...(numberLevel2Version === 2 ? YEAR2_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS : YEAR2_NUMBER_RELEASED_FORMS.posttest)] as unknown as PosttestQuestion[],
    };
  }
  if (yearLabel === "Year 3") {
    return numberLevel3Version === 2 ? buildLevel3PosttestFormB() : {yearLabel, questions: [...YEAR3_NUMBER_RELEASED_FORMS.posttest]};
  }
  if (yearLabel === "Year 4") {
    return {
      yearLabel: "Year 4",
      questions: [...(numberLevel4Version === 2 ? YEAR4_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS : YEAR4_NUMBER_RELEASED_FORMS.posttest)],
    };
  }
  if (yearLabel === "Year 5") {
    return {
      yearLabel: "Year 5",
      questions: [...(numberLevel5Version === 2 ? YEAR5_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS : YEAR5_NUMBER_RELEASED_FORMS.posttest)],
    };
  }
  return POSTTESTS[yearLabel];
}

export function validateAssessmentBlueprintForLevel(level: SupportedMathLevel, realmId: AssessmentRealmId = "number"): string[] {
  switch (realmId) {
    case "space":
      return validateStarpathAssessmentBlueprintForLevel(level);
    case "measurement":
      return [];
    case "statistics":
      return [];
    case "pattern":
      return validatePatternPeaksAssessmentBlueprintForLevel(level);
    case "chance":
      return validateChanceHollowAssessmentBlueprintForLevel(level);
    case "number":
      break;
    default:
      return assertAssessmentRealmHandled(realmId);
  }
  if (level === 3) {
    return validateLevel3AssessmentForms();
  }
  return [];
}
