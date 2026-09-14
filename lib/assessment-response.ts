const PREFIX = "__assessment_evidence_v1__:";
export type AssessmentResponseEvidence = { questionId: string; taskKind: string; correct: boolean; response: string; scorerVersion?: string };
export function encodeAssessmentResponse(questionId: string, taskKind: string, correct: boolean, response: string): string {
  return PREFIX + JSON.stringify({ questionId, taskKind, correct, response, scorerVersion: "assessment-2026-09-14-v1" });
}
export function decodeAssessmentResponse(value: unknown): AssessmentResponseEvidence | null {
  if (typeof value !== "string" || !value.startsWith(PREFIX)) return null;
  try {
    const v = JSON.parse(value.slice(PREFIX.length));
    return typeof v.questionId === "string" && typeof v.taskKind === "string" && typeof v.correct === "boolean" && typeof v.response === "string" ? v : null;
  } catch { return null; }
}
