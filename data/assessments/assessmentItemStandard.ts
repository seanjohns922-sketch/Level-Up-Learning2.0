import type { LiveRealmId } from "@/lib/realms/realm-registry";

export type AssessmentRealm = LiveRealmId | "statistics" | "pattern";
export type AssessmentPool = "lesson" | "weekly_quiz" | "pretest" | "posttest";
export type AssessmentFormKind = "pretest" | "posttest";

export type AssessmentCognitiveCategory =
  | "recall"
  | "understanding"
  | "application"
  | "reasoning"
  | "transfer";

export type AssessmentItemDifficulty =
  | "easy"
  | "moderate"
  | "challenging"
  | "very_challenging";

export type AssessmentResponseMode =
  | "selected_response"
  | "constructed_response"
  | "manipulated_response"
  | "explanation"
  | "choose_and_explain"
  | "spot_the_mistake"
  | "comparison"
  | "justification";

export type AssessmentCalibrationStatus = "uncalibrated" | "pilot" | "calibrated" | "retired";

export type AssessmentItemStatistics = {
  calibrationStatus: AssessmentCalibrationStatus;
  expectedDifficulty: AssessmentItemDifficulty;
  observedDifficulty: number | null;
  discriminationIndex: number | null;
  responseFrequency: Readonly<Record<string, number>>;
  sampleSize: number;
};

export type IndependentAssessmentItem = {
  schemaVersion: 1;
  id: string;
  version: string;
  realm: AssessmentRealm;
  level: number;
  form: AssessmentFormKind;
  origin: "assessment_authored";
  sourcePool: Extract<AssessmentPool, "pretest" | "posttest">;
  bankId: string;
  primaryDescriptorCode: string;
  descriptorCodes: readonly string[];
  curriculumLessonMapping: readonly {
    week: number;
    lesson?: number;
  }[];
  cognitiveCategory: AssessmentCognitiveCategory;
  difficulty: AssessmentItemDifficulty;
  isTransfer: boolean;
  requiresReasoning: boolean;
  misconceptionDiagnosis: boolean;
  responseMode: AssessmentResponseMode;
  misconceptionTags: readonly string[];
  contextKey: string;
  structureKey: string;
  selectedAnswerPosition?: number;
  prompt: string;
  renderer: {
    type: string;
    payload: unknown;
  };
  scoring: {
    kind: "exact" | "numeric_tolerance" | "set" | "rubric" | "interaction";
    correctResponse: unknown;
    tolerance?: number;
    rubricId?: string;
  };
  statistics: AssessmentItemStatistics;
};

export type AssessmentResponseEvidence = {
  schema_version: 2;
  question_id: string;
  question_version: string;
  descriptor_codes: string[];
  cognitive_category: AssessmentCognitiveCategory;
  difficulty: AssessmentItemDifficulty;
  response_mode: AssessmentResponseMode;
  misconception_tags: string[];
  student_answer: unknown;
  correct: boolean;
  response_status: "correct" | "incorrect" | "skipped" | "dont_know";
  answered_at: string;
};

export const CONSTRUCTED_ASSESSMENT_RESPONSE_MODES = new Set<AssessmentResponseMode>([
  "constructed_response",
  "manipulated_response",
  "explanation",
  "choose_and_explain",
]);

export function createUncalibratedItemStatistics(
  expectedDifficulty: AssessmentItemDifficulty,
): AssessmentItemStatistics {
  return {
    calibrationStatus: "uncalibrated",
    expectedDifficulty,
    observedDifficulty: null,
    discriminationIndex: null,
    responseFrequency: {},
    sampleSize: 0,
  };
}
