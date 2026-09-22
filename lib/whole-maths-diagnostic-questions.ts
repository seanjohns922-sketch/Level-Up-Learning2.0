import {releasedStarpathQuestions} from '@/data/assessments/releases/starpath';
import { GROUND_STARPATH_FIVE_FORMS } from '@/data/assessments/revisions/groundStarpathFiveForms';
import { YEAR3_MEASUREMENT_RELEASED_FORMS } from '@/data/assessments/releases/year3Measurement';
import { YEAR4_MEASUREMENT_RELEASED_FORMS } from '@/data/assessments/releases/year4Measurement';
import { YEAR7_MEASUREMENT_RELEASED_FORMS } from '@/data/assessments/releases/year7Measurement';
import { YEAR8_MEASUREMENT_RELEASED_FORMS } from '@/data/assessments/releases/year8Measurement';
import { YEAR6_MEASUREMENT_RELEASED_FORMS } from '@/data/assessments/releases/year6Measurement';
import { YEAR5_MEASUREMENT_RELEASED_FORMS } from '@/data/assessments/releases/year5Measurement';
import { YEAR2_MEASUREMENT_RELEASED_FORMS } from '@/data/assessments/releases/year2Measurement';
import { YEAR1_MEASUREMENT_RELEASED_FORMS } from '@/data/assessments/releases/year1Measurement';
import { GROUND_MEASUREMENT_RELEASED_FORMS } from '@/data/assessments/releases/groundMeasurement';
import { YEAR3_NUMBER_RELEASED_FORMS } from "@/data/assessments/revisions/year3NumberReleasedForms";
import { YEAR8_NUMBER_RELEASED_FORMS } from "@/data/assessments/revisions/year8NumberReleasedForms";
import { YEAR7_NUMBER_RELEASED_FORMS } from "@/data/assessments/revisions/year7NumberReleasedForms";
import { YEAR6_NUMBER_RELEASED_FORMS } from "@/data/assessments/revisions/year6NumberReleasedForms";
import { GROUND_NUMBER_V3_FORMS } from "@/data/assessments/releases/groundNumber";
import { YEAR1_NUMBER_RELEASED_FORMS } from "@/data/assessments/revisions/year1NumberReleasedForms";
import { YEAR4_NUMBER_RELEASED_FORMS } from "@/data/assessments/revisions/year4NumberReleasedForms";
import { YEAR5_NUMBER_RELEASED_FORMS } from "@/data/assessments/revisions/year5NumberReleasedForms";
import { YEAR2_NUMBER_RELEASED_FORMS } from "@/data/assessments/revisions/year2NumberReleasedForms";
import {
  getPosttestForYearLabel,
  getPretestForYearLabel,
  type AssessmentQuestion,
} from "@/data/assessments/api";
import { curriculumCodesForAssessmentQuestion } from "@/lib/assessment-curriculum";
import type { AcStrand } from "@/lib/curriculum/ac-standards";
import type { DiagnosticCheckpoint } from "@/lib/whole-maths-diagnostic";
import {
  diagnosticQuestionCount,
  DIAGNOSTIC_STRANDS,
} from "@/lib/whole-maths-diagnostic";

function seededOrder(seed: string, value: string): number {
  let hash = 2166136261;
  const input = `${seed}:${value}`;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export type LinkedDiagnosticQuestion = {
  question: AssessmentQuestion;
  curriculumCodes: string[];
};

export function getDiagnosticQuestions(
  strand: AcStrand,
  level: string,
  sittingId: string,
  checkpoint: DiagnosticCheckpoint = "start",
  numberLevel1Version: 2 | 5 = 2,
  groundNumberVersion: 1 | 3 = 1,
  numberLevel2Version: 2 | 3 = 2,
  numberLevel4Version: 2 | 3 = 2,
  numberLevel5Version: 2 | 3 = 2,
  numberLevel6Version: 2 | 3 = 2,
  numberLevel3Version: 2 | 3 = 2,
  numberMaximumLevel: 6 | 7 | 8 = 6,
  groundMeasurementVersion: 3 | 4 = 3,
  year1MeasurementVersion:3|4=3,
  year2MeasurementVersion:3|4=3,
  year5MeasurementVersion:3|4=3,
  year6MeasurementVersion:3|4=3,
  measurementReleaseVersion:0|1=0,
  spaceGroundVersion: 0 | 3 = 0,
  spaceReleaseVersion:0|1=0,
): LinkedDiagnosticQuestion[] {
  const definition = DIAGNOSTIC_STRANDS.find((candidate) => candidate.strand === strand);
  if (!definition?.available || !definition.realmId) return [];
  if (strand === "number" && Number(level.replace(/\D/g, "")) > numberMaximumLevel) return [];
  if (strand === "measurement" && Number(level.replace(/\D/g,"")) > (measurementReleaseVersion===1?8:6)) return [];
  // Retain existing diagnostic sittings until independent checkpoint forms are version-pinned.
  const pretest = getPretestForYearLabel(level, definition.realmId, 2, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 0, 0);
  const posttest = getPosttestForYearLabel(level, definition.realmId, 2, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 0, 0)?.questions ?? [];
  const levelTest = strand==='space' && spaceReleaseVersion===1 ? releasedStarpathQuestions(level,checkpoint==='ad_hoc'?'start':checkpoint) : strand === "space" && level === "Prep" && spaceGroundVersion === 3
    ? GROUND_STARPATH_FIVE_FORMS[checkpoint === "ad_hoc" ? "start" : checkpoint] as unknown as AssessmentQuestion[]
    : strand === "measurement" && measurementReleaseVersion===1 && ["Year 3","Year 4","Year 7","Year 8"].includes(level)
    ? ({"Year 3":YEAR3_MEASUREMENT_RELEASED_FORMS,"Year 4":YEAR4_MEASUREMENT_RELEASED_FORMS,"Year 7":YEAR7_MEASUREMENT_RELEASED_FORMS,"Year 8":YEAR8_MEASUREMENT_RELEASED_FORMS}[level as "Year 3"])[checkpoint==="ad_hoc"?"start":checkpoint]
    : strand === "measurement" && level === "Year 6" && year6MeasurementVersion===4
    ? YEAR6_MEASUREMENT_RELEASED_FORMS[checkpoint === "ad_hoc" ? "start" : checkpoint]
    : strand === "measurement" && level === "Year 5" && year5MeasurementVersion===4
    ? YEAR5_MEASUREMENT_RELEASED_FORMS[checkpoint === "ad_hoc" ? "start" : checkpoint]
    : strand === "measurement" && level === "Year 2" && year2MeasurementVersion===4
    ? YEAR2_MEASUREMENT_RELEASED_FORMS[checkpoint === "ad_hoc" ? "start" : checkpoint]
    : strand === "measurement" && level === "Year 1" && year1MeasurementVersion===4
    ? YEAR1_MEASUREMENT_RELEASED_FORMS[checkpoint === "ad_hoc" ? "start" : checkpoint]
    : strand === "measurement" && level === "Prep" && groundMeasurementVersion===4
    ? GROUND_MEASUREMENT_RELEASED_FORMS[checkpoint === "ad_hoc" ? "start" : checkpoint]
    : strand === "number" && level === "Year 8" && numberMaximumLevel === 8
    ? YEAR8_NUMBER_RELEASED_FORMS[checkpoint === "ad_hoc" ? "start" : checkpoint] as unknown as AssessmentQuestion[]
    : strand === "number" && level === "Year 7" && numberMaximumLevel >= 7
    ? YEAR7_NUMBER_RELEASED_FORMS[checkpoint === "ad_hoc" ? "start" : checkpoint] as unknown as AssessmentQuestion[]
    : strand === "number" && level === "Year 3" && numberLevel3Version === 3
    ? YEAR3_NUMBER_RELEASED_FORMS[checkpoint === "ad_hoc" ? "start" : checkpoint] as unknown as AssessmentQuestion[]
    : strand === "number" && level === "Prep" && groundNumberVersion===3
    ? GROUND_NUMBER_V3_FORMS[({start:"diagnostic-start",mid:"diagnostic-mid",end:"diagnostic-end",ad_hoc:"diagnostic-start"} as const)[checkpoint]]
    : strand === "number" && level === "Year 1" && numberLevel1Version === 5
    ? YEAR1_NUMBER_RELEASED_FORMS[checkpoint === "ad_hoc" ? "start" : checkpoint]
    : strand === "number" && level === "Year 2" && numberLevel2Version === 3
    ? YEAR2_NUMBER_RELEASED_FORMS[checkpoint === "ad_hoc" ? "start" : checkpoint] as unknown as AssessmentQuestion[]
    : strand === "number" && level === "Year 4" && numberLevel4Version === 3
    ? YEAR4_NUMBER_RELEASED_FORMS[checkpoint === "ad_hoc" ? "start" : checkpoint] as unknown as AssessmentQuestion[]
    : strand === "number" && level === "Year 5" && numberLevel5Version === 3
    ? YEAR5_NUMBER_RELEASED_FORMS[checkpoint === "ad_hoc" ? "start" : checkpoint] as unknown as AssessmentQuestion[]
    : strand === "number" && level === "Year 6" && numberLevel6Version === 3
    ? YEAR6_NUMBER_RELEASED_FORMS[checkpoint === "ad_hoc" ? "start" : checkpoint] as unknown as AssessmentQuestion[]
    : checkpoint === "start"
    ? (pretest.length > 0 ? pretest : posttest)
    : checkpoint === "mid"
      ? (posttest.length > 0 ? posttest : pretest)
      : [...pretest.filter((_, index) => index % 2 === 0), ...posttest.filter((_, index) => index % 2 === 1)];
  return levelTest
    .map((question) => ({
      question,
      curriculumCodes: curriculumCodesForAssessmentQuestion(
        definition.realmId!,
        level,
        question,
      ),
    }))
    .sort(
      (left, right) =>
        seededOrder(sittingId, left.question.id) - seededOrder(sittingId, right.question.id),
    )
    .slice(0, diagnosticQuestionCount(strand, level));
}
