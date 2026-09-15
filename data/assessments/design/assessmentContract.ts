/** Apply to every realm/level: preserve sound released items; drafts are references. */
export const ASSESSMENT_MAINTENANCE_POLICY = {
  basis: "audit-existing-pre-post",
  decisions: ["keep", "tweak", "replace", "gap"],
  sequence: ["audit-pair", "targeted-corrections", "align-diagnostic-forms", "verify-content-ui-persistence", "owner-review"],
  candidateDraftsAreMandatory: false,
} as const;

/** Authoring contract, deliberately separate from released banks and placement rules. */
export const ASSESSMENT_DESIGN_VERSION = "2026-09-15-blueprint-1";
export const ASSESSMENT_FORMS = ["pretest", "posttest", "diagnostic-start", "diagnostic-mid", "diagnostic-end"] as const;
export type DesignedForm = typeof ASSESSMENT_FORMS[number];
export type DesignedRealm = "number" | "measurement" | "space" | "statistics" | "pattern" | "chance";
export const ASSESSMENT_LEVELS: Record<DesignedRealm, readonly number[]> = {
  number: [0, 1, 2, 3, 4, 5, 6], measurement: [0, 1, 2, 3, 4, 5, 6], space: [0, 1, 2, 3, 4, 5, 6],
  statistics: [1, 2, 3, 4, 5, 6], pattern: [3, 4, 5, 6], chance: [3, 4, 5, 6],
};
export type SkillSlot = {
  id: string;
  descriptor: string;
  evidence: string;
  response: "number" | "selection" | "selection-and-reason" | "number-and-reason" | "construction" | "ordering";
  cognitiveDemand: "understanding" | "application" | "reasoning";
  expectedDifficulty: "accessible" | "moderate" | "challenging";
  representation: { required: boolean; specification: string };
  invariants: readonly string[];
  scoring: string;
};
export const FORM_EQUIVALENCE_RULES = [
  "All five forms use the same descriptor allocation and skill-slot contracts; checkpoint does not increase difficulty.",
  "Change examples, not required operations, regrouping, number range, decimal places, fraction relationships, reasoning steps or unit demands.",
  "Use distinct item identities and independently authored examples across all five forms; changing IDs or shuffling the same questions is not a new form.",
  "Keep response mechanisms, tool availability, scale resolution, scaffolding and scoring equivalent at corresponding slots.",
  "Compare difficulty empirically after piloting; blueprint matching alone does not establish calibrated equivalence.",
] as const;
export const RELEASE_EVIDENCE = [
  "descriptor-and-skill-coverage", "independent-answer-key-check", "five-form-equivalence-review",
  "difficulty-and-workload-review",
  "rendered-desktop-review", "rendered-tablet-review", "rendered-mobile-review", "read-aloud-review",
  "first-submission-scoring", "resume-same-item-version", "save-retry-idempotency",
  "teacher-report-roundtrip", "version-and-cycle-comparison", "owner-child-view-review",
] as const;
export const RECORDING_CONTRACT = {
  immutable: ["blueprintVersion", "formVersion", "itemId", "itemVersion", "skillSlotId", "curriculumCodes", "questionSnapshot", "submittedResponse", "scorerVersion", "score", "maximumScore", "completedAt"],
  attempt: ["studentId", "realm", "workingLevel", "assessmentPurpose", "checkpoint", "attemptId", "learningCycleId", "comparisonGroup"],
  rules: [
    "Pin the full form version at attempt start; resuming must not replace questions after a release.",
    "Save retries use one idempotency key and never create duplicate attempts or rewards.",
    "Never silently rescore historical results or compare incompatible forms as matched growth.",
    "Report missing evidence as not assessed, not zero or failure.",
    "Retain raw scores, denominators and signed percentage-point change; distinguish same-level growth from level progression.",
    "Prep reports Number, Measurement and Space separately; omitted Foundation Statistics does not become a zero or block progression.",
  ],
} as const;
