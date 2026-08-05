import type {
  AssessmentCognitiveCategory,
  AssessmentItemDifficulty,
  AssessmentResponseEvidence,
} from "./assessmentItemStandard";

export type AssessmentMasterySummary = {
  correct: number;
  total: number;
  percent: number;
};

export type AssessmentTeacherReport = {
  total: AssessmentMasterySummary;
  descriptorMastery: Record<string, AssessmentMasterySummary>;
  misconceptionFrequency: Record<string, number>;
  cognitivePerformance: Record<AssessmentCognitiveCategory, AssessmentMasterySummary>;
  difficultyPerformance: Record<AssessmentItemDifficulty, AssessmentMasterySummary>;
  reasoningPerformance: AssessmentMasterySummary;
  transferPerformance: AssessmentMasterySummary;
};

const COGNITIVE_CATEGORIES: AssessmentCognitiveCategory[] = [
  "recall",
  "understanding",
  "application",
  "reasoning",
  "transfer",
];

const DIFFICULTIES: AssessmentItemDifficulty[] = [
  "easy",
  "moderate",
  "challenging",
  "very_challenging",
];

function summarize(items: readonly AssessmentResponseEvidence[]): AssessmentMasterySummary {
  const correct = items.filter((item) => item.correct).length;
  const total = items.length;
  return { correct, total, percent: total > 0 ? Math.round((correct / total) * 100) : 0 };
}

export function buildAssessmentTeacherReport(
  evidence: readonly AssessmentResponseEvidence[],
): AssessmentTeacherReport {
  const descriptorCodes = Array.from(new Set(evidence.flatMap((item) => item.descriptor_codes))).sort();
  const misconceptionFrequency: Record<string, number> = {};

  for (const item of evidence) {
    if (item.correct) continue;
    for (const tag of item.misconception_tags) {
      misconceptionFrequency[tag] = (misconceptionFrequency[tag] ?? 0) + 1;
    }
  }

  return {
    total: summarize(evidence),
    descriptorMastery: Object.fromEntries(
      descriptorCodes.map((code) => [
        code,
        summarize(evidence.filter((item) => item.descriptor_codes.includes(code))),
      ]),
    ),
    misconceptionFrequency: Object.fromEntries(
      Object.entries(misconceptionFrequency).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
    ),
    cognitivePerformance: Object.fromEntries(
      COGNITIVE_CATEGORIES.map((category) => [
        category,
        summarize(evidence.filter((item) => item.cognitive_category === category)),
      ]),
    ) as Record<AssessmentCognitiveCategory, AssessmentMasterySummary>,
    difficultyPerformance: Object.fromEntries(
      DIFFICULTIES.map((difficulty) => [
        difficulty,
        summarize(evidence.filter((item) => item.difficulty === difficulty)),
      ]),
    ) as Record<AssessmentItemDifficulty, AssessmentMasterySummary>,
    reasoningPerformance: summarize(
      evidence.filter((item) => item.cognitive_category === "reasoning"),
    ),
    transferPerformance: summarize(
      evidence.filter((item) => item.cognitive_category === "transfer"),
    ),
  };
}
