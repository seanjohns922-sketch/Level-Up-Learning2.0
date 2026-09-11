import {
  getPosttestForYearLabel,
  getPretestForYearLabel,
  type AssessmentQuestion,
} from "@/data/assessments/api";
import { curriculumCodesForAssessmentQuestion } from "@/lib/assessment-curriculum";
import type { AcStrand } from "@/lib/curriculum/ac-standards";
import type { DiagnosticCheckpoint } from "@/lib/whole-maths-diagnostic";
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
  checkpoint: DiagnosticCheckpoint = "start",
): LinkedDiagnosticQuestion[] {
  const definition = DIAGNOSTIC_STRANDS.find((candidate) => candidate.strand === strand);
  if (!definition?.available || !definition.realmId) return [];
  const pretest = getPretestForYearLabel(level, definition.realmId);
  const posttest = getPosttestForYearLabel(level, definition.realmId)?.questions ?? [];
  const levelTest = checkpoint === "start"
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
    .slice(0, DIAGNOSTIC_QUESTIONS_PER_LEVEL);
}
