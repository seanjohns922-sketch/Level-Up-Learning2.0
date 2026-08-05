import {
  MEASURELANDS_ASSESSMENT_BLUEPRINTS,
  type MeasurelandsAssessmentKind,
  type MeasurelandsLevel,
} from "./measurelandsAssessmentBlueprint";
import {
  CONSTRUCTED_ASSESSMENT_RESPONSE_MODES,
  type AssessmentCognitiveCategory,
  type AssessmentFormKind,
  type AssessmentItemDifficulty,
  type IndependentAssessmentItem,
} from "./assessmentItemStandard";
import { getMeasurelandsMisconception } from "./measurelandsMisconceptions";

type MeasurelandsInstructionalLevel = Exclude<MeasurelandsLevel, 0>;
export type MeasurelandsFormKey =
  | "0:posttest"
  | `${MeasurelandsInstructionalLevel}:${MeasurelandsAssessmentKind}`;

export type MeasurelandsIndependentFormStandard = {
  key: MeasurelandsFormKey;
  level: MeasurelandsLevel;
  yearLabel: string;
  kind: MeasurelandsAssessmentKind;
  bankId: string;
  questionCount: 20;
  passPercent: 85;
  descriptorAllocation: Readonly<Record<string, number>>;
  difficultyMix: Readonly<Record<AssessmentItemDifficulty, number>>;
  cognitiveMix: Readonly<Record<AssessmentCognitiveCategory, number>>;
  selectedResponseMaximum: number;
  constructedOrManipulatedMinimum: number;
  transferTaskMinimum: number;
  reasoningJustificationMinimum: number;
  misconceptionDiagnosisMinimum: number;
};

export type MeasurelandsFormMigration = {
  key: MeasurelandsFormKey;
  liveStatus: "legacy_lesson_reuse";
  replacementStatus: "blueprint_approved_bank_not_authored" | "candidate_authored_uncalibrated";
  productionReleaseGate: "blocked";
  blockingReasons: readonly string[];
};

const VERY_CHALLENGING_QUOTAS: Record<MeasurelandsFormKey, number> = {
  "0:posttest": 1,
  "1:pretest": 0,
  "1:posttest": 1,
  "2:pretest": 0,
  "2:posttest": 1,
  "3:pretest": 1,
  "3:posttest": 2,
  "4:pretest": 1,
  "4:posttest": 2,
  "5:pretest": 1,
  "5:posttest": 3,
  "6:pretest": 2,
  "6:posttest": 4,
};

const TRANSFER_QUOTAS: Record<MeasurelandsFormKey, number> = {
  "0:posttest": 1,
  "1:pretest": 0,
  "1:posttest": 1,
  "2:pretest": 0,
  "2:posttest": 1,
  "3:pretest": 1,
  "3:posttest": 2,
  "4:pretest": 1,
  "4:posttest": 2,
  "5:pretest": 1,
  "5:posttest": 3,
  "6:pretest": 2,
  "6:posttest": 4,
};

function formKey(level: MeasurelandsLevel, kind: MeasurelandsAssessmentKind): MeasurelandsFormKey {
  return `${level}:${kind}` as MeasurelandsFormKey;
}

export const MEASURELANDS_INDEPENDENT_FORM_STANDARDS: readonly MeasurelandsIndependentFormStandard[] =
  MEASURELANDS_ASSESSMENT_BLUEPRINTS.flatMap((blueprint) =>
    blueprint.forms.map((form) => {
      const key = formKey(blueprint.level, form.kind);
      const veryChallenging = VERY_CHALLENGING_QUOTAS[key];
      const transfer = TRANSFER_QUOTAS[key];
      return {
        key,
        level: blueprint.level,
        yearLabel: blueprint.yearLabel,
        kind: form.kind,
        bankId: `measurelands-level-${blueprint.level}-${form.kind}-v1`,
        questionCount: form.questionCount,
        passPercent: form.passPercent,
        descriptorAllocation: Object.fromEntries(
          blueprint.descriptors.map((descriptor) => [descriptor.code, descriptor.allocation[form.kind]]),
        ),
        difficultyMix: {
          easy: form.difficultyMix.accessible,
          moderate: form.difficultyMix.moderate,
          challenging: form.difficultyMix.challenging - veryChallenging,
          very_challenging: veryChallenging,
        },
        cognitiveMix: {
          recall: form.cognitiveDemandMix.recall,
          understanding: form.cognitiveDemandMix.understanding,
          application: form.cognitiveDemandMix.application,
          reasoning: form.cognitiveDemandMix.reasoning - transfer,
          transfer,
        },
        selectedResponseMaximum: form.responseMix.selectedResponseMaximum,
        constructedOrManipulatedMinimum: form.responseMix.constructedOrManipulatedMinimum,
        transferTaskMinimum:
          form.kind === "posttest" && blueprint.level >= 5 ? 2 : 0,
        reasoningJustificationMinimum:
          form.kind === "posttest" && blueprint.level >= 5 ? 2 : 0,
        misconceptionDiagnosisMinimum:
          form.kind === "posttest" && blueprint.level >= 5 ? 2 : 0,
      } satisfies MeasurelandsIndependentFormStandard;
    }),
  );

export const MEASURELANDS_FORM_MIGRATIONS: readonly MeasurelandsFormMigration[] =
  MEASURELANDS_INDEPENDENT_FORM_STANDARDS.map((standard) => {
    const hasAuthoredCandidate = standard.level === 1 || standard.level === 2 || standard.level === 3 || standard.level === 4 || standard.level === 5 || standard.level === 6;
    return {
      key: standard.key,
      liveStatus: "legacy_lesson_reuse",
      replacementStatus: hasAuthoredCandidate
        ? "candidate_authored_uncalibrated"
        : "blueprint_approved_bank_not_authored",
      productionReleaseGate: "blocked",
      blockingReasons: hasAuthoredCandidate
        ? standard.level === 6
          ? [
              "The live form still reuses lesson or weekly-quiz PracticeTask interactions.",
              "The educator-approved independent candidate has not completed representative pilot calibration.",
            ]
          : [
            "The live form still reuses lesson or weekly-quiz PracticeTask interactions.",
            "The independent candidate has not passed educator review or representative pilot calibration.",
          ]
        : [
            "The live form reuses lesson or weekly-quiz PracticeTask interactions.",
            "The independent assessment-authored item bank has not been written or approved.",
            "Item calibration statistics have not been collected.",
          ],
    };
  });

// Phase 1 intentionally defines the registry without populating or serving it.
// Phase 2 onward may add approved banks here after content and review gates pass.
export const MEASURELANDS_INDEPENDENT_ITEM_BANKS: Readonly<
  Partial<Record<MeasurelandsFormKey, readonly IndependentAssessmentItem[]>>
> = {};

function tally<T extends string>(values: readonly T[]): Record<T, number> {
  const result = {} as Record<T, number>;
  for (const value of values) result[value] = (result[value] ?? 0) + 1;
  return result;
}

function mixIssues<T extends string>(
  scope: string,
  actual: Partial<Record<T, number>>,
  expected: Readonly<Record<T, number>>,
): string[] {
  return (Object.keys(expected) as T[]).flatMap((key) =>
    (actual[key] ?? 0) === expected[key]
      ? []
      : [`${scope} has ${actual[key] ?? 0} ${key} items; expected ${expected[key]}.`],
  );
}

export function validateIndependentMeasurelandsForm(
  standard: MeasurelandsIndependentFormStandard,
  items: readonly IndependentAssessmentItem[],
): string[] {
  const scope = `${standard.yearLabel} ${standard.kind}`;
  const issues: string[] = [];
  if (items.length !== standard.questionCount) {
    issues.push(`${scope} has ${items.length} items; expected ${standard.questionCount}.`);
  }
  if (new Set(items.map((item) => item.id)).size !== items.length) {
    issues.push(`${scope} contains duplicate item IDs.`);
  }

  for (const item of items) {
    const itemScope = `${scope} ${item.id}`;
    if (item.schemaVersion !== 1 || !item.version.trim()) issues.push(`${itemScope} has invalid version metadata.`);
    if (item.realm !== "measurement" || item.level !== standard.level || item.form !== standard.kind) {
      issues.push(`${itemScope} is assigned to the wrong realm, level or form.`);
    }
    if (item.origin !== "assessment_authored" || item.sourcePool !== standard.kind) {
      issues.push(`${itemScope} is not independently authored in the ${standard.kind} pool.`);
    }
    if (item.bankId !== standard.bankId) issues.push(`${itemScope} is assigned to the wrong bank.`);
    if (!item.descriptorCodes.includes(item.primaryDescriptorCode) || item.descriptorCodes.length === 0) {
      issues.push(`${itemScope} has invalid descriptor metadata.`);
    }
    if (!(item.primaryDescriptorCode in standard.descriptorAllocation)) {
      issues.push(`${itemScope} uses descriptor ${item.primaryDescriptorCode} outside the approved blueprint.`);
    }
    if (
      item.curriculumLessonMapping.length === 0
      || item.curriculumLessonMapping.some(
        (mapping) => !Number.isInteger(mapping.week) || mapping.week < 1
          || (mapping.lesson !== undefined && (!Number.isInteger(mapping.lesson) || mapping.lesson < 1)),
      )
    ) {
      issues.push(`${itemScope} must map to its curriculum lesson origin.`);
    }
    if (item.misconceptionTags.length === 0 || item.misconceptionTags.some((tag) => !tag.trim())) {
      issues.push(`${itemScope} must tag at least one explicit misconception.`);
    }
    for (const tag of item.misconceptionTags) {
      const misconception = getMeasurelandsMisconception(tag);
      if (!misconception) issues.push(`${itemScope} uses unknown misconception tag ${tag}.`);
      else if (!misconception.descriptorCodes.includes(item.primaryDescriptorCode)) {
        issues.push(`${itemScope} uses misconception ${tag} outside ${item.primaryDescriptorCode}.`);
      }
    }
    if (item.isTransfer !== (item.cognitiveCategory === "transfer")) {
      issues.push(`${itemScope} has inconsistent transfer metadata.`);
    }
    if (
      item.requiresReasoning
      !== (item.cognitiveCategory === "reasoning" || item.cognitiveCategory === "transfer")
    ) {
      issues.push(`${itemScope} has inconsistent reasoning metadata.`);
    }
    if (!item.contextKey.trim() || !item.structureKey.trim()) {
      issues.push(`${itemScope} must identify its context and interaction structure.`);
    }
    if (!item.prompt.trim() || !item.renderer.type.trim()) issues.push(`${itemScope} has incomplete item content.`);
    if (item.statistics.expectedDifficulty !== item.difficulty) {
      issues.push(`${itemScope} statistics do not match its authored difficulty.`);
    }
    if (item.statistics.sampleSize < 0) issues.push(`${itemScope} has a negative calibration sample size.`);
    if (
      item.statistics.observedDifficulty !== null
      && (item.statistics.observedDifficulty < 0 || item.statistics.observedDifficulty > 1)
    ) {
      issues.push(`${itemScope} observed difficulty must be between 0 and 1.`);
    }
    if (
      item.statistics.discriminationIndex !== null
      && (item.statistics.discriminationIndex < -1 || item.statistics.discriminationIndex > 1)
    ) {
      issues.push(`${itemScope} discrimination must be between -1 and 1.`);
    }
  }

  issues.push(
    ...mixIssues(scope, tally(items.map((item) => item.primaryDescriptorCode)), standard.descriptorAllocation),
    ...mixIssues(scope, tally(items.map((item) => item.difficulty)), standard.difficultyMix),
    ...mixIssues(scope, tally(items.map((item) => item.cognitiveCategory)), standard.cognitiveMix),
  );

  const constructed = items.filter((item) => CONSTRUCTED_ASSESSMENT_RESPONSE_MODES.has(item.responseMode)).length;
  const selected = items.length - constructed;
  if (selected > standard.selectedResponseMaximum) {
    issues.push(`${scope} has ${selected} selected responses; maximum is ${standard.selectedResponseMaximum}.`);
  }
  if (constructed < standard.constructedOrManipulatedMinimum) {
    issues.push(`${scope} has ${constructed} constructed/manipulated responses; minimum is ${standard.constructedOrManipulatedMinimum}.`);
  }

  const transferTasks = items.filter((item) => item.isTransfer).length;
  const reasoningJustifications = items.filter(
    (item) => item.requiresReasoning
      && ["justification", "explanation", "choose_and_explain"].includes(item.responseMode),
  ).length;
  const misconceptionDiagnoses = items.filter((item) => item.misconceptionDiagnosis).length;
  if (transferTasks < standard.transferTaskMinimum) {
    issues.push(`${scope} has ${transferTasks} transfer tasks; minimum is ${standard.transferTaskMinimum}.`);
  }
  if (reasoningJustifications < standard.reasoningJustificationMinimum) {
    issues.push(
      `${scope} has ${reasoningJustifications} reasoning tasks requiring justification; minimum is ${standard.reasoningJustificationMinimum}.`,
    );
  }
  if (misconceptionDiagnoses < standard.misconceptionDiagnosisMinimum) {
    issues.push(
      `${scope} has ${misconceptionDiagnoses} misconception-diagnosis tasks; minimum is ${standard.misconceptionDiagnosisMinimum}.`,
    );
  }

  if (new Set(items.map((item) => item.contextKey)).size !== items.length) {
    issues.push(`${scope} repeats a context within the form.`);
  }
  if (new Set(items.map((item) => item.structureKey)).size !== items.length) {
    issues.push(`${scope} repeats an interaction structure within the form.`);
  }

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    if (index < 4 && (item.difficulty === "challenging" || item.difficulty === "very_challenging")) {
      issues.push(`${scope} places a challenging item in the 4-question entry section.`);
    }
    if (index < 10 && item.difficulty === "very_challenging") {
      issues.push(`${scope} places a very challenging item before the second half.`);
    }
    if (index > 0 && item.contextKey === items[index - 1].contextKey) {
      issues.push(`${scope} repeats context ${item.contextKey} consecutively.`);
    }
    if (
      index > 1
      && item.primaryDescriptorCode === items[index - 1].primaryDescriptorCode
      && item.primaryDescriptorCode === items[index - 2].primaryDescriptorCode
    ) {
      issues.push(`${scope} places more than 2 ${item.primaryDescriptorCode} items consecutively.`);
    }
    if (
      item.responseMode === "selected_response"
      && item.selectedAnswerPosition !== undefined
      && index > 1
      && item.selectedAnswerPosition === items[index - 1].selectedAnswerPosition
      && item.selectedAnswerPosition === items[index - 2].selectedAnswerPosition
    ) {
      issues.push(`${scope} repeats the same correct-answer position 3 times consecutively.`);
    }
  }

  return Array.from(new Set(issues));
}

export function validateParallelMeasurelandsForms(
  pretest: readonly IndependentAssessmentItem[],
  posttest: readonly IndependentAssessmentItem[],
): string[] {
  const issues: string[] = [];
  const preIds = new Set(pretest.map((item) => item.id));
  const preContexts = new Set(pretest.map((item) => item.contextKey));
  const preStructures = new Set(pretest.map((item) => item.structureKey));
  if (posttest.some((item) => preIds.has(item.id))) issues.push("Parallel forms reuse item IDs.");
  if (posttest.some((item) => preContexts.has(item.contextKey))) issues.push("Parallel forms reuse contexts.");
  if (posttest.some((item) => preStructures.has(item.structureKey))) {
    issues.push("Parallel forms reuse assessment interaction structures.");
  }
  return issues;
}

export function legacyMeasurelandsFormIssues(
  questions: readonly { type?: string; practiceTask?: unknown }[],
): string[] {
  const issues: string[] = [];
  if (questions.some((question) => question.type === "measurelandsTask" || question.practiceTask != null)) {
    issues.push("Form reuses lesson or weekly-quiz PracticeTask interactions.");
  }
  if (questions.length > 0) {
    issues.push("Form does not expose canonical independent-item quality metadata.");
  }
  return issues;
}

export function getMeasurelandsFormStandard(
  level: MeasurelandsLevel,
  kind: AssessmentFormKind,
): MeasurelandsIndependentFormStandard | undefined {
  return MEASURELANDS_INDEPENDENT_FORM_STANDARDS.find(
    (standard) => standard.level === level && standard.kind === kind,
  );
}
