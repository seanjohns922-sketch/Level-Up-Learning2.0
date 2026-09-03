import {
  getPosttestForYearLabel,
  getPretestForYearLabel,
  type AssessmentQuestion,
} from "@/data/assessments/api";
import { curriculumCodesForAssessmentQuestion } from "@/lib/assessment-curriculum";
import type { AcStrand } from "@/lib/curriculum/ac-standards";
import {
  DIAGNOSTIC_QUESTIONS_PER_LEVEL,
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
): LinkedDiagnosticQuestion[] {
  const definition = DIAGNOSTIC_STRANDS.find((candidate) => candidate.strand === strand);
  if (!definition?.available || !definition.realmId) return [];
  const pretest = getPretestForYearLabel(level, definition.realmId);
  const levelTest = pretest.length > 0
    ? pretest
    : (getPosttestForYearLabel(level, definition.realmId)?.questions ?? []);
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
    .slice(0, DIAGNOSTIC_QUESTIONS_PER_LEVEL);
}
