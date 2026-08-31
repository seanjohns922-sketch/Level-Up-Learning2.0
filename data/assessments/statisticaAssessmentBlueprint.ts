import { STATISTICA_PROGRAMS } from "@/data/programs/statistica";
import { STATISTICA_MISCONCEPTION_LIBRARY } from "./statisticaMisconceptions";

export type StatisticaLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type StatisticaAssessmentKind = "pretest" | "posttest";
export type StatisticaDifficulty = "accessible" | "moderate" | "challenging";
export type StatisticaCognitiveDemand = "recall" | "understanding" | "application" | "reasoning" | "transfer";

export type StatisticaDescriptorBlueprint = {
  code: string;
  description: string;
  weeks: readonly number[];
  misconceptionIds: readonly string[];
  allocation: { pretest: number; posttest: number };
  pretestArchetypes: readonly string[];
  posttestArchetypes: readonly string[];
};

export type StatisticaFormBlueprint = {
  kind: StatisticaAssessmentKind;
  questionCount: 20;
  passPercent: 85;
  difficultyMix: Record<StatisticaDifficulty, number>;
  cognitiveMix: Record<StatisticaCognitiveDemand, number>;
  selectedResponseMaximum: number;
  constructedOrManipulatedMinimum: number;
};

export type StatisticaAssessmentBlueprint = {
  level: StatisticaLevel;
  yearLabel: `Year ${StatisticaLevel}`;
  curriculumSource: string;
  descriptors: readonly StatisticaDescriptorBlueprint[];
  forms: readonly StatisticaFormBlueprint[];
};

const SOURCE = "Australian Curriculum: Mathematics, Version 9.0, Statistics strand, Years 1-6";

const form = (
  kind: StatisticaAssessmentKind,
  difficultyMix: Record<StatisticaDifficulty, number>,
  cognitiveMix: Record<StatisticaCognitiveDemand, number>,
  selectedResponseMaximum: number,
): StatisticaFormBlueprint => ({
  kind,
  questionCount: 20,
  passPercent: 85,
  difficultyMix,
  cognitiveMix,
  selectedResponseMaximum,
  constructedOrManipulatedMinimum: 20 - selectedResponseMaximum,
});

const FORM_PROFILES: Record<StatisticaLevel, readonly StatisticaFormBlueprint[]> = {
  1: [form("posttest", { accessible: 10, moderate: 8, challenging: 2 }, { recall: 3, understanding: 7, application: 7, reasoning: 3, transfer: 0 }, 12)],
  2: [
    form("pretest", { accessible: 11, moderate: 7, challenging: 2 }, { recall: 4, understanding: 7, application: 6, reasoning: 3, transfer: 0 }, 11),
    form("posttest", { accessible: 8, moderate: 8, challenging: 4 }, { recall: 2, understanding: 6, application: 7, reasoning: 4, transfer: 1 }, 10),
  ],
  3: [
    form("pretest", { accessible: 9, moderate: 8, challenging: 3 }, { recall: 3, understanding: 6, application: 7, reasoning: 4, transfer: 0 }, 10),
    form("posttest", { accessible: 7, moderate: 8, challenging: 5 }, { recall: 2, understanding: 5, application: 7, reasoning: 5, transfer: 1 }, 9),
  ],
  4: [
    form("pretest", { accessible: 8, moderate: 9, challenging: 3 }, { recall: 2, understanding: 6, application: 7, reasoning: 4, transfer: 1 }, 9),
    form("posttest", { accessible: 6, moderate: 9, challenging: 5 }, { recall: 1, understanding: 5, application: 7, reasoning: 5, transfer: 2 }, 8),
  ],
  5: [
    form("pretest", { accessible: 7, moderate: 9, challenging: 4 }, { recall: 2, understanding: 5, application: 7, reasoning: 5, transfer: 1 }, 8),
    form("posttest", { accessible: 5, moderate: 9, challenging: 6 }, { recall: 1, understanding: 4, application: 7, reasoning: 6, transfer: 2 }, 7),
  ],
  6: [
    form("pretest", { accessible: 6, moderate: 9, challenging: 5 }, { recall: 1, understanding: 5, application: 6, reasoning: 6, transfer: 2 }, 7),
    form("posttest", { accessible: 4, moderate: 8, challenging: 8 }, { recall: 0, understanding: 4, application: 6, reasoning: 7, transfer: 3 }, 6),
  ],
};

const DESCRIPTIONS: Record<string, string> = {
  AC9M1ST01: "Acquire and record categorical data for a question of interest.",
  AC9M1ST02: "Represent and interpret data using one-to-one displays.",
  AC9M2ST01: "Acquire categorical data and create relevant categories.",
  AC9M2ST02: "Create, compare and interpret different displays of categorical data.",
  AC9M3ST01: "Acquire and record categorical or discrete numerical data.",
  AC9M3ST02: "Create and compare displays and interpret variation in the data.",
  AC9M3ST03: "Conduct a statistical investigation to answer a question of interest.",
  AC9M4ST01: "Construct and interpret many-to-one displays and column graphs.",
  AC9M4ST02: "Describe and compare distributions in terms of shape and variation.",
  AC9M4ST03: "Plan and conduct statistical investigations and communicate findings.",
  AC9M5ST01: "Identify data types, validate data and describe distributions using mode and shape.",
  AC9M5ST02: "Interpret and represent change over time using line graphs.",
  AC9M5ST03: "Plan and conduct investigations using appropriate data and displays.",
  AC9M6ST01: "Compare distributions using mode, range, shape and side-by-side displays.",
  AC9M6ST02: "Critique statistical claims and potentially misleading representations.",
  AC9M6ST03: "Plan, conduct and communicate statistical investigations with defensible conclusions.",
};

function allocations(codes: readonly string[]) {
  if (codes.length === 2) return [10, 10];
  return [7, 7, 6];
}

function blueprint(level: StatisticaLevel): StatisticaAssessmentBlueprint {
  const program = STATISTICA_PROGRAMS[level];
  const codes = [...new Set(program.flatMap((week) => week.curriculum))];
  const counts = allocations(codes);
  return {
    level,
    yearLabel: `Year ${level}`,
    curriculumSource: SOURCE,
    descriptors: codes.map((code, index) => ({
      code,
      description: DESCRIPTIONS[code] ?? code,
      weeks: program.filter((week) => week.curriculum.includes(code)).map((week) => week.week),
      misconceptionIds: STATISTICA_MISCONCEPTION_LIBRARY.filter((item) => item.descriptorCodes.includes(code)).map((item) => item.id),
      allocation: { pretest: level === 1 ? 0 : counts[index]!, posttest: counts[index]! },
      pretestArchetypes: ["Read an unfamiliar data representation", "Choose or construct a valid response", "Diagnose a likely misconception"],
      posttestArchetypes: ["Analyse an unfamiliar data representation", "Construct or repair a representation", "Use evidence to justify a conclusion"],
    })),
    forms: FORM_PROFILES[level],
  };
}

export const STATISTICA_ASSESSMENT_BLUEPRINTS = ([1, 2, 3, 4, 5, 6] as const).map(blueprint);

export function getStatisticaAssessmentBlueprint(level: number) {
  return STATISTICA_ASSESSMENT_BLUEPRINTS.find((entry) => entry.level === level) ?? null;
}
