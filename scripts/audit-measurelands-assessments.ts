import {
  MEASURELANDS_POSTTESTS_BY_YEAR,
  MEASURELANDS_PRETESTS_BY_YEAR,
  getMeasurelandsPosttestForYear,
  getMeasurelandsPretestForYear,
} from "../data/assessments/measurelands";

type AssessmentType = "pretest" | "posttest";
type YearLabel = "Prep" | "Year 1" | "Year 2" | "Year 3" | "Year 4" | "Year 5" | "Year 6";

type AuditRow = {
  year: YearLabel;
  assessmentType: AssessmentType;
  questionCount: number;
  uniqueIdCount: number;
  duplicateIds: string[];
  missingWeeks: number[];
  weekCounts: Record<string, number>;
  invalidOptionQuestions: string[];
  multipleCorrectQuestions: string[];
  nonMcqQuestions: string[];
};

const YEARS: YearLabel[] = ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];
const EXPECTED_COUNT: Record<YearLabel, Partial<Record<AssessmentType, number>>> = {
  Prep: { posttest: 20 },
  "Year 1": { pretest: 20, posttest: 20 },
  "Year 2": { pretest: 20, posttest: 20 },
  "Year 3": { pretest: 20, posttest: 20 },
  "Year 4": { pretest: 20, posttest: 20 },
  "Year 5": { pretest: 20, posttest: 20 },
  "Year 6": { pretest: 20, posttest: 20 },
};

function listDuplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates].sort();
}

function countWeeks(linkedWeeks: number[]): Record<string, number> {
  const counts = new Map<number, number>();
  for (const week of linkedWeeks) {
    counts.set(week, (counts.get(week) ?? 0) + 1);
  }
  return Object.fromEntries([...counts.entries()].sort((a, b) => a[0] - b[0]).map(([week, count]) => [`Week ${week}`, count]));
}

function auditAssessment(year: YearLabel, assessmentType: AssessmentType): AuditRow | null {
  const questions =
    assessmentType === "pretest"
      ? getMeasurelandsPretestForYear(year)
      : getMeasurelandsPosttestForYear(year)?.questions ?? [];

  if (!questions.length) {
    return null;
  }

  const ids = questions.map((question) => question.id);
  const allWeeks = [...new Set(questions.flatMap((question) => question.linkedWeeks ?? []))].sort((a, b) => a - b);
  const missingWeeks = [1, 2, 3, 4, 5, 6, 7, 8].filter((week) => !allWeeks.includes(week));
  const invalidOptionQuestions: string[] = [];
  const multipleCorrectQuestions: string[] = [];
  const nonMcqQuestions: string[] = [];

  for (const question of questions) {
    if (question.type !== "mcq") {
      nonMcqQuestions.push(question.id);
      continue;
    }
    const options = Array.isArray(question.options) ? question.options : [];
    const correctMatches = options.filter((option) => option === question.correctAnswer).length;
    if (options.length < 2 || !question.correctAnswer) {
      invalidOptionQuestions.push(question.id);
    }
    if (correctMatches !== 1) {
      multipleCorrectQuestions.push(question.id);
    }
  }

  return {
    year,
    assessmentType,
    questionCount: questions.length,
    uniqueIdCount: new Set(ids).size,
    duplicateIds: listDuplicates(ids),
    missingWeeks,
    weekCounts: countWeeks(questions.flatMap((question) => question.linkedWeeks ?? [])),
    invalidOptionQuestions,
    multipleCorrectQuestions,
    nonMcqQuestions,
  };
}

const rows = YEARS.flatMap((year) => {
  const types: AssessmentType[] = year === "Prep" ? ["posttest"] : ["pretest", "posttest"];
  return types.map((assessmentType) => auditAssessment(year, assessmentType)).filter((row): row is AuditRow => row !== null);
});

const allIds = rows.flatMap((row) => {
  const questions =
    row.assessmentType === "pretest"
      ? getMeasurelandsPretestForYear(row.year)
      : getMeasurelandsPosttestForYear(row.year)?.questions ?? [];
  return questions.map((question) => question.id);
});
const globalDuplicateIds = listDuplicates(allIds);

let hasFailure = false;

if (Object.prototype.hasOwnProperty.call(MEASURELANDS_PRETESTS_BY_YEAR, "Prep")) {
  console.error("FAIL: Prep should not have a Measurement pretest bank.");
  hasFailure = true;
}

for (const row of rows) {
  const expectedCount = EXPECTED_COUNT[row.year][row.assessmentType];
  if (expectedCount !== undefined && row.questionCount !== expectedCount) {
    console.error(`FAIL: ${row.year} ${row.assessmentType} has ${row.questionCount} questions, expected ${expectedCount}.`);
    hasFailure = true;
  }
  if (row.uniqueIdCount !== row.questionCount) {
    console.error(`FAIL: ${row.year} ${row.assessmentType} has duplicate IDs: ${row.duplicateIds.join(", ") || "unknown"}.`);
    hasFailure = true;
  }
  if (row.invalidOptionQuestions.length > 0) {
    console.error(`FAIL: ${row.year} ${row.assessmentType} has invalid option sets: ${row.invalidOptionQuestions.join(", ")}.`);
    hasFailure = true;
  }
  if (row.multipleCorrectQuestions.length > 0) {
    console.error(`FAIL: ${row.year} ${row.assessmentType} has questions without exactly one correct answer: ${row.multipleCorrectQuestions.join(", ")}.`);
    hasFailure = true;
  }
  if (row.nonMcqQuestions.length > 0) {
    console.error(`FAIL: ${row.year} ${row.assessmentType} contains non-MCQ questions: ${row.nonMcqQuestions.join(", ")}.`);
    hasFailure = true;
  }
  if (row.missingWeeks.length > 0) {
    console.error(`FAIL: ${row.year} ${row.assessmentType} is missing curriculum week coverage for: ${row.missingWeeks.join(", ")}.`);
    hasFailure = true;
  }
}

if (globalDuplicateIds.length > 0) {
  console.error(`FAIL: duplicate question IDs across Measurement assessments: ${globalDuplicateIds.join(", ")}.`);
  hasFailure = true;
}

console.log(JSON.stringify({
  prepHasPretest: Object.prototype.hasOwnProperty.call(MEASURELANDS_PRETESTS_BY_YEAR, "Prep"),
  posttestLevels: Object.keys(MEASURELANDS_POSTTESTS_BY_YEAR),
  rows,
  globalDuplicateIds,
}, null, 2));

if (hasFailure) {
  process.exitCode = 1;
}
