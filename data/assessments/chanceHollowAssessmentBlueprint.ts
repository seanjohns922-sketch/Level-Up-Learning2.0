import { CHANCE_HOLLOW_PROGRAMS, type ChanceHollowYearLabel } from "@/data/programs/chanceHollow";
import { ASSESSMENT_THRESHOLDS } from "@/lib/assessment-rules";

export type ChanceHollowLevel = 3 | 4 | 5 | 6;
export type ChanceHollowAssessmentKind = "pretest" | "posttest";
export type ChanceHollowDifficulty = "accessible" | "moderate" | "challenging";
export type ChanceHollowCognitiveDemand = "recall" | "understanding" | "application" | "reasoning" | "transfer";

export type ChanceHollowFormBlueprint = {
  kind: ChanceHollowAssessmentKind;
  questionCount: 20;
  passPercent: 85;
  difficultyMix: Record<ChanceHollowDifficulty, number>;
  cognitiveMix: Record<ChanceHollowCognitiveDemand, number>;
  selectedResponseMaximum: number;
  constructedOrManipulatedMinimum: number;
};

export type ChanceHollowDescriptorBlueprint = {
  code: string;
  description: string;
  weeks: readonly number[];
  misconceptionIds: readonly string[];
  allocation: { pretest: number; posttest: number };
};

export type ChanceHollowAssessmentBlueprint = {
  level: ChanceHollowLevel;
  yearLabel: ChanceHollowYearLabel;
  curriculumSource: string;
  descriptors: readonly ChanceHollowDescriptorBlueprint[];
  forms: readonly ChanceHollowFormBlueprint[];
};

const DESCRIPTIONS: Record<string, string> = {
  AC9M3P01: "Identify chance in familiar situations, describe possible outcomes and compare their likelihood.",
  AC9M3P02: "Conduct repeated chance experiments and describe variation between the results.",
  AC9M4P01: "List possible outcomes and compare equally likely and unequally likely chance events.",
  AC9M4P02: "Conduct repeated chance experiments and examine how one event may affect another.",
  AC9M5P01: "List equally and unequally likely outcomes and describe probability using fractions.",
  AC9M5P02: "Run repeated chance experiments, record frequencies and compare variation between trials.",
  AC9M6P01: "Represent probabilities from zero to one and determine probabilities from equally likely outcomes.",
  AC9M6P02: "Run simulations and compare observed frequencies with expected frequencies as trial counts increase.",
};

const MISCONCEPTIONS: Record<string, readonly string[]> = {
  AC9M3P01: ["chance-word-extremes", "possible-means-likely", "missing-possible-outcome"],
  AC9M3P02: ["prediction-must-match", "variation-means-error", "single-trial-certainty"],
  AC9M4P01: ["possible-means-equal", "colour-controls-chance", "fair-means-alternating"],
  AC9M4P02: ["replacement-changes-chance", "removal-never-changes-chance", "previous-result-controls-next"],
  AC9M5P01: ["outcomes-not-complete", "fraction-order-reversed", "grouped-outcomes-equal"],
  AC9M5P02: ["frequency-denominator-error", "short-run-proves-bias", "frequency-is-future-certainty"],
  AC9M6P01: ["probability-scale-form-error", "complement-not-one", "unequal-outcomes-counted-equally"],
  AC9M6P02: ["expected-must-equal-observed", "larger-sample-removes-variation", "invalid-simulation-model"],
};

const ALLOCATIONS: Record<ChanceHollowLevel, Record<string, number>> = {
  3: { AC9M3P01: 11, AC9M3P02: 9 },
  4: { AC9M4P01: 15, AC9M4P02: 5 },
  5: { AC9M5P01: 10, AC9M5P02: 10 },
  6: { AC9M6P01: 10, AC9M6P02: 10 },
};

function form(
  kind: ChanceHollowAssessmentKind,
  difficultyMix: Record<ChanceHollowDifficulty, number>,
  cognitiveMix: Record<ChanceHollowCognitiveDemand, number>,
  selectedResponseMaximum: number,
): ChanceHollowFormBlueprint {
  return {
    kind,
    questionCount: 20,
    passPercent: kind === "pretest"
      ? ASSESSMENT_THRESHOLDS.pretestPassPercent
      : ASSESSMENT_THRESHOLDS.posttestPassPercent,
    difficultyMix,
    cognitiveMix,
    selectedResponseMaximum,
    constructedOrManipulatedMinimum: 20 - selectedResponseMaximum,
  };
}

const FORM_PROFILES: Record<ChanceHollowLevel, readonly ChanceHollowFormBlueprint[]> = {
  3: [
    form("pretest", { accessible: 7, moderate: 9, challenging: 4 }, { recall: 2, understanding: 6, application: 7, reasoning: 4, transfer: 1 }, 14),
    form("posttest", { accessible: 5, moderate: 10, challenging: 5 }, { recall: 1, understanding: 5, application: 8, reasoning: 5, transfer: 1 }, 14),
  ],
  4: [
    form("pretest", { accessible: 6, moderate: 10, challenging: 4 }, { recall: 2, understanding: 5, application: 7, reasoning: 5, transfer: 1 }, 12),
    form("posttest", { accessible: 4, moderate: 10, challenging: 6 }, { recall: 1, understanding: 4, application: 8, reasoning: 5, transfer: 2 }, 12),
  ],
  5: [
    form("pretest", { accessible: 5, moderate: 10, challenging: 5 }, { recall: 1, understanding: 5, application: 7, reasoning: 5, transfer: 2 }, 11),
    form("posttest", { accessible: 3, moderate: 10, challenging: 7 }, { recall: 1, understanding: 3, application: 7, reasoning: 6, transfer: 3 }, 11),
  ],
  6: [
    form("pretest", { accessible: 4, moderate: 10, challenging: 6 }, { recall: 1, understanding: 4, application: 7, reasoning: 5, transfer: 3 }, 8),
    form("posttest", { accessible: 2, moderate: 9, challenging: 9 }, { recall: 0, understanding: 3, application: 6, reasoning: 7, transfer: 4 }, 8),
  ],
};

function buildBlueprint(level: ChanceHollowLevel): ChanceHollowAssessmentBlueprint {
  const yearLabel = `Year ${level}` as ChanceHollowYearLabel;
  const program = CHANCE_HOLLOW_PROGRAMS[level];
  const codes = [...new Set(program.flatMap((week) => week.curriculum))];
  return {
    level,
    yearLabel,
    curriculumSource: "Australian Curriculum: Mathematics, Version 9.0, Probability strand, Years 3-6",
    descriptors: codes.map((code) => ({
      code,
      description: DESCRIPTIONS[code] ?? code,
      weeks: program.filter((week) => week.curriculum.includes(code)).map((week) => week.week),
      misconceptionIds: MISCONCEPTIONS[code] ?? [],
      allocation: {
        pretest: ALLOCATIONS[level][code] ?? 0,
        posttest: ALLOCATIONS[level][code] ?? 0,
      },
    })),
    forms: FORM_PROFILES[level],
  };
}

export const CHANCE_HOLLOW_ASSESSMENT_BLUEPRINTS = ([3, 4, 5, 6] as const).map(buildBlueprint);

export function getChanceHollowAssessmentBlueprint(level: number) {
  return CHANCE_HOLLOW_ASSESSMENT_BLUEPRINTS.find((entry) => entry.level === level) ?? null;
}

export function validateChanceHollowAssessmentBlueprintForLevel(level: number): string[] {
  const blueprint = getChanceHollowAssessmentBlueprint(level);
  if (!blueprint) return [`Chance Hollow has no assessment blueprint for Year ${level}.`];
  const issues: string[] = [];
  for (const formBlueprint of blueprint.forms) {
    const descriptorTotal = blueprint.descriptors.reduce(
      (sum, descriptor) => sum + descriptor.allocation[formBlueprint.kind],
      0,
    );
    const difficultyTotal = Object.values(formBlueprint.difficultyMix).reduce((sum, count) => sum + count, 0);
    const cognitiveTotal = Object.values(formBlueprint.cognitiveMix).reduce((sum, count) => sum + count, 0);
    if (descriptorTotal !== formBlueprint.questionCount) issues.push(`${formBlueprint.kind}: descriptor allocation totals ${descriptorTotal}.`);
    if (difficultyTotal !== formBlueprint.questionCount) issues.push(`${formBlueprint.kind}: difficulty allocation totals ${difficultyTotal}.`);
    if (cognitiveTotal !== formBlueprint.questionCount) issues.push(`${formBlueprint.kind}: cognitive allocation totals ${cognitiveTotal}.`);
  }
  return issues;
}
