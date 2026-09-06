import { PATTERN_PEAKS_PROGRAMS, type PatternPeaksYearLabel } from "@/data/programs/patternPeaks";
import { getPatternPeaksMisconceptions } from "./patternPeaksMisconceptions";
import { ASSESSMENT_THRESHOLDS } from "@/lib/assessment-rules";

export type PatternPeaksLevel = 3 | 4 | 5 | 6;
export type PatternPeaksAssessmentKind = "pretest" | "posttest";
export type PatternPeaksDifficulty = "accessible" | "moderate" | "challenging";
export type PatternPeaksCognitiveDemand = "recall" | "understanding" | "application" | "reasoning" | "transfer";

export type PatternPeaksFormBlueprint = {
  kind: PatternPeaksAssessmentKind;
  questionCount: 20;
  passPercent: 85;
  difficultyMix: Record<PatternPeaksDifficulty, number>;
  cognitiveMix: Record<PatternPeaksCognitiveDemand, number>;
  selectedResponseMaximum: number;
  constructedOrManipulatedMinimum: number;
};

export type PatternPeaksDescriptorBlueprint = {
  code: string;
  description: string;
  weeks: readonly number[];
  misconceptionIds: readonly string[];
  allocation: { pretest: number; posttest: number };
};

export type PatternPeaksAssessmentBlueprint = {
  level: PatternPeaksLevel;
  yearLabel: PatternPeaksYearLabel;
  curriculumSource: string;
  descriptors: readonly PatternPeaksDescriptorBlueprint[];
  forms: readonly PatternPeaksFormBlueprint[];
};

const DESCRIPTIONS: Record<string, string> = {
  AC9M3A01: "Recognise addition and subtraction as inverse operations, partition numbers and find unknown values in number sentences.",
  AC9M3A02: "Extend and apply addition and subtraction facts to 20 to calculate efficiently with larger numbers.",
  AC9M3A03: "Recall multiplication facts for 3, 4, 5 and 10 and apply the related division facts.",
  AC9M3A04: "Describe, follow and create algorithms to investigate numbers, including odd, even and multiples patterns.",
  AC9M4A01: "Find unknown values in equivalent addition and subtraction equations.",
  AC9M4A02: "Recall and use multiplication facts and related division facts.",
  AC9M5A01: "Continue and create extended additive sequences with natural numbers, fractions and decimals, and explain emerging patterns.",
  AC9M5A02: "Find unknown values in equivalent multiplication and division number sentences using properties, inverse operations, factors and multiples.",
  AC9M5A03: "Use algorithms and digital tools to explore factors and multiples and explain emerging patterns.",
  AC9M6A01: "Recognise and use rules that generate visually growing patterns and number patterns involving rational numbers.",
  AC9M6A02: "Find unknown values in numerical equations involving brackets and combinations of arithmetic operations, using number properties.",
  AC9M6A03: "Create and use multi-step and decision algorithms that generate number sets, then interpret emerging patterns.",
};

const ALLOCATIONS: Record<PatternPeaksLevel, number[]> = {
  3: [5, 5, 5, 5],
  4: [10, 10],
  5: [6, 8, 6],
  // Program discovery order is A01, A03, A02; this yields A01=7, A03=7, A02=6.
  6: [7, 7, 6],
};

const form = (
  kind: PatternPeaksAssessmentKind,
  difficultyMix: Record<PatternPeaksDifficulty, number>,
  cognitiveMix: Record<PatternPeaksCognitiveDemand, number>,
  selectedResponseMaximum: number,
): PatternPeaksFormBlueprint => ({
  kind,
  questionCount: 20,
  passPercent: kind === "pretest" ? ASSESSMENT_THRESHOLDS.pretestPassPercent : ASSESSMENT_THRESHOLDS.posttestPassPercent,
  difficultyMix,
  cognitiveMix,
  selectedResponseMaximum,
  constructedOrManipulatedMinimum: 20 - selectedResponseMaximum,
});

const FORM_PROFILES: Record<PatternPeaksLevel, readonly PatternPeaksFormBlueprint[]> = {
  3: [form("posttest", { accessible: 5, moderate: 9, challenging: 6 }, { recall: 1, understanding: 5, application: 7, reasoning: 5, transfer: 2 }, 4)],
  4: [
    form("pretest", { accessible: 6, moderate: 10, challenging: 4 }, { recall: 2, understanding: 5, application: 7, reasoning: 5, transfer: 1 }, 3),
    form("posttest", { accessible: 4, moderate: 9, challenging: 7 }, { recall: 1, understanding: 4, application: 7, reasoning: 6, transfer: 2 }, 3),
  ],
  5: [
    form("pretest", { accessible: 5, moderate: 10, challenging: 5 }, { recall: 1, understanding: 5, application: 7, reasoning: 5, transfer: 2 }, 2),
    form("posttest", { accessible: 3, moderate: 9, challenging: 8 }, { recall: 1, understanding: 3, application: 6, reasoning: 7, transfer: 3 }, 2),
  ],
  6: [
    form("pretest", { accessible: 4, moderate: 10, challenging: 6 }, { recall: 1, understanding: 4, application: 6, reasoning: 6, transfer: 3 }, 1),
    form("posttest", { accessible: 2, moderate: 8, challenging: 10 }, { recall: 0, understanding: 3, application: 6, reasoning: 7, transfer: 4 }, 1),
  ],
};

function buildBlueprint(level: PatternPeaksLevel): PatternPeaksAssessmentBlueprint {
  const yearLabel = `Year ${level}` as PatternPeaksYearLabel;
  const program = PATTERN_PEAKS_PROGRAMS[yearLabel];
  const codes = [...new Set(program.flatMap((week) => week.curriculum))];
  return {
    level,
    yearLabel,
    curriculumSource: "Australian Curriculum: Mathematics, Version 9.0, Algebra strand, Years 3–6",
    descriptors: codes.map((code, index) => ({
      code,
      description: DESCRIPTIONS[code] ?? code,
      weeks: program.filter((week) => week.curriculum.includes(code)).map((week) => week.week),
      misconceptionIds: getPatternPeaksMisconceptions(code).map((item) => item.id),
      allocation: { pretest: level === 3 ? 0 : ALLOCATIONS[level][index]!, posttest: ALLOCATIONS[level][index]! },
    })),
    forms: FORM_PROFILES[level],
  };
}

export const PATTERN_PEAKS_ASSESSMENT_BLUEPRINTS = ([3, 4, 5, 6] as const).map(buildBlueprint);

export function getPatternPeaksAssessmentBlueprint(level: number) {
  return PATTERN_PEAKS_ASSESSMENT_BLUEPRINTS.find((entry) => entry.level === level) ?? null;
}

export function validatePatternPeaksAssessmentBlueprintForLevel(level: number): string[] {
  const blueprint = getPatternPeaksAssessmentBlueprint(level);
  if (!blueprint) return [`Pattern Peaks has no assessment blueprint for Year ${level}.`];
  const issues: string[] = [];
  for (const formBlueprint of blueprint.forms) {
    const descriptorTotal = blueprint.descriptors.reduce((sum, descriptor) => sum + descriptor.allocation[formBlueprint.kind], 0);
    const difficultyTotal = Object.values(formBlueprint.difficultyMix).reduce((sum, count) => sum + count, 0);
    const cognitiveTotal = Object.values(formBlueprint.cognitiveMix).reduce((sum, count) => sum + count, 0);
    if (descriptorTotal !== formBlueprint.questionCount) issues.push(`${formBlueprint.kind}: descriptor allocation totals ${descriptorTotal}.`);
    if (difficultyTotal !== formBlueprint.questionCount) issues.push(`${formBlueprint.kind}: difficulty allocation totals ${difficultyTotal}.`);
    if (cognitiveTotal !== formBlueprint.questionCount) issues.push(`${formBlueprint.kind}: cognitive allocation totals ${cognitiveTotal}.`);
  }
  return issues;
}
