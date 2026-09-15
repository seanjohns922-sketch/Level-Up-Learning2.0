import { groundNumberReleaseItem } from "./releases/groundNumber";
import { parsePrepNumberSubmission, scorePrepNumberSubmission } from "./candidates/prep-number/scoring";
import { decodeAssessmentResponse } from "@/lib/assessment-response";
import { decodeStarpathResponse } from "@/lib/starpath-assessment-response";
export type AssessmentQuestionMetadata = {
  id: string;
  skillId?: string;
  skillLabel?: string;
  linkedWeeks?: number[];
  linkedLessons?: number[];
  strand?: string;
  difficultyBand?: string;
};

export type AssessmentSkillSummary = {
  skillId: string;
  skillLabel: string;
  linkedWeeks: number[];
  linkedLessons?: number[];
  strand: string;
  difficultyBand?: string;
  incorrectCount: number;
  correctCount: number;
  total: number;
};

export type AssessmentResultProfile = {
  studentId?: string | null;
  yearLevel: number;
  testType: "pre" | "post";
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  strengths: AssessmentSkillSummary[];
  weakAreas: AssessmentSkillSummary[];
  recommendedWeeks: number[];
  recommendedLessonTargets: Array<{ week: number; lessons?: number[] }>;
  assignedWeek?: number;
  generatedAt: string;
};

type GenericAssessmentQuestion = AssessmentQuestionMetadata & {
  type?: string;
  correctAnswer?: string | number;
  answer?: unknown;
  answerOptionId?: string;
  prompt?: string;
  visual?: unknown;
};

function parseNumericAssessmentValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/,/g, "").trim();
  if (!cleaned.length) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

// Full fraction answers and mixed numbers are values; a missing numerator is
// handled separately below because its denominator is part of the question.
function parseRationalAssessmentValue(value: unknown): number | null {
  const numeric = parseNumericAssessmentValue(value);
  if (numeric != null) return numeric;
  if (typeof value !== "string") return null;
  const text = value.trim().replace(/−/g, "-");
  const fraction = text.match(/^([+-]?\d+)\s*\/\s*(\d+)$/);
  if (fraction) {
    const numerator = Number(fraction[1]);
    const denominator = Number(fraction[2]);
    return Number.isSafeInteger(numerator) && Number.isSafeInteger(denominator) && denominator > 0
      ? numerator / denominator : null;
  }
  const mixed = text.match(/^([+-]?)(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (!mixed) return null;
  const whole = Number(mixed[2]);
  const numerator = Number(mixed[3]);
  const denominator = Number(mixed[4]);
  if (![whole, numerator, denominator].every(Number.isSafeInteger) || denominator <= 0 || numerator >= denominator) return null;
  return (mixed[1] === "-" ? -1 : 1) * (whole + numerator / denominator);
}

function parseCoordinateAssessmentValue(
  value: unknown
): { x: number; y: number } | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  const match = trimmed.match(/^\(?\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)?$/);
  if (!match) return null;
  const x = Number(match[1]);
  const y = Number(match[2]);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return { x, y };
}

function fractionAnswerParts(value: unknown): { numerator: number; denominator: number } | null {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^(-?\d+)\s*\/\s*(\d+)$/);
  if (!match) return null;
  const numerator = Number(match[1]);
  const denominator = Number(match[2]);
  if (!Number.isFinite(numerator) || !Number.isInteger(denominator) || denominator <= 0) return null;
  return { numerator, denominator };
}

function missingNumeratorDenominator(question: GenericAssessmentQuestion): number | null {
  const visual = question.visual;
  if (!visual || typeof visual !== "object" || Array.isArray(visual)) return null;
  const record = visual as Record<string, unknown>;

  if (typeof record.answerDenominator === "number" && Number.isInteger(record.answerDenominator) && record.answerDenominator > 0) {
    return record.answerDenominator;
  }

  const strings = [record.expression, record.statement]
    .concat(Array.isArray(record.values) ? record.values : [])
    .filter((value): value is string => typeof value === "string");
  for (const value of strings) {
    const match = value.match(/[?□]\s*\/\s*(\d+)/);
    if (match) return Number(match[1]);
  }

  if (record.type === "number_y4_fraction_equivalence" && Array.isArray(record.right)) {
    const [numerator, denominator] = record.right;
    if (numerator == null && typeof denominator === "number" && Number.isInteger(denominator) && denominator > 0) {
      return denominator;
    }
  }

  return null;
}

export function isAssessmentAnswerCorrect(
  question: GenericAssessmentQuestion,
  chosen: string | undefined
): boolean {
  if (question.type === "prepNumberTask") {
    const item=groundNumberReleaseItem(question);
    return item !== null && scorePrepNumberSubmission(item,parsePrepNumberSubmission(item,chosen ?? null)).score===1;
  }
  const response = decodeAssessmentResponse(chosen);
  if (response) return question.type?.endsWith("Task") === true && response.questionId === question.id && response.correct;
  const evidence = decodeStarpathResponse(chosen);
  if (evidence && question.type === "starpathTask") return evidence.questionId === question.id && evidence.correct;
  const expected = question.answerOptionId ?? question.correctAnswer ?? question.answer;
  if (expected == null || chosen == null) return false;

  if (question.type === "numeric" && question.visual && typeof question.visual === "object" && "answerTolerance" in question.visual) {
    const tolerance = question.visual.answerTolerance;
    const expectedNumber = parseNumericAssessmentValue(expected);
    const chosenNumber = parseNumericAssessmentValue(chosen);
    return typeof tolerance === "number" && Number.isFinite(tolerance) && tolerance >= 0
      && expectedNumber != null && chosenNumber != null && Math.abs(expectedNumber - chosenNumber) <= tolerance;
  }
  if (question.type === "numeric" && question.visual && typeof question.visual === "object" && "reasonOptions" in question.visual) {
    const parts = chosen.split("||"); const expectedParts = String(expected).split("||");
    return parts.length === 2 && expectedParts.length === 2 && parts[1] === expectedParts[1]
      && isAssessmentAnswerCorrect({ ...question, visual: undefined, correctAnswer: expectedParts[0], answer: expectedParts[0], answerOptionId: undefined }, parts[0]);
  }
  if (question.type === "numeric" || question.type === "numberLine" || question.type === "mab") {
    const expectedValue = parseNumericAssessmentValue(expected);
    const chosenValue = parseNumericAssessmentValue(chosen);
    if (expectedValue != null && chosenValue != null) {
      return Math.abs(expectedValue - chosenValue) < 1e-9;
    }

    const chosenFraction = fractionAnswerParts(chosen);
    const expectedDenominator = missingNumeratorDenominator(question);
    if (expectedValue != null && chosenFraction && expectedDenominator != null) {
      return (
        Math.abs(expectedValue - chosenFraction.numerator) < 1e-9 &&
        chosenFraction.denominator === expectedDenominator
      );
    }

    if (expectedDenominator == null) {
      const expectedRational = parseRationalAssessmentValue(expected);
      const chosenRational = parseRationalAssessmentValue(chosen);
      if (expectedRational != null && chosenRational != null) {
        return Math.abs(expectedRational - chosenRational) < 1e-9;
      }
    }

    const expectedCoordinate = parseCoordinateAssessmentValue(expected);
    const chosenCoordinate = parseCoordinateAssessmentValue(chosen);
    if (expectedCoordinate && chosenCoordinate) {
      return (
        Math.abs(expectedCoordinate.x - chosenCoordinate.x) < 1e-9 &&
        Math.abs(expectedCoordinate.y - chosenCoordinate.y) < 1e-9
      );
    }

    return false;
  }

  return chosen === String(expected);
}

export function analyzeAssessmentResult({
  questions,
  answers,
  yearLevel,
  testType,
  passThreshold = 90,
  studentId,
}: {
  questions: GenericAssessmentQuestion[];
  answers: Record<string, string | undefined>;
  yearLevel: number;
  testType: "pre" | "post";
  passThreshold?: number;
  studentId?: string | null;
}): AssessmentResultProfile {
  const groups = new Map<string, AssessmentSkillSummary>();
  let score = 0;

  for (const question of questions) {
    const chosen = answers[question.id];
    const isCorrect = isAssessmentAnswerCorrect(question, chosen);
    if (isCorrect) score += 1;

    const skillId = question.skillId ?? "general";
    const entry = groups.get(skillId) ?? {
      skillId,
      skillLabel: question.skillLabel ?? "General Maths",
      linkedWeeks: question.linkedWeeks ?? [],
      linkedLessons: question.linkedLessons,
      strand: question.strand ?? "number",
      difficultyBand: question.difficultyBand,
      incorrectCount: 0,
      correctCount: 0,
      total: 0,
    };

    entry.total += 1;
    if (isCorrect) entry.correctCount += 1;
    else entry.incorrectCount += 1;
    groups.set(skillId, entry);
  }

  const total = questions.length;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = percentage >= passThreshold;
  const summaries = [...groups.values()];

  const strengths = summaries
    .filter((item) => item.correctCount > 0)
    .sort((a, b) => {
      const aRate = a.correctCount / Math.max(1, a.total);
      const bRate = b.correctCount / Math.max(1, b.total);
      return bRate - aRate || b.correctCount - a.correctCount;
    })
    .slice(0, 3);

  const allWeakAreas = summaries
    .filter((item) => item.incorrectCount >= 1)
    .sort((a, b) => b.incorrectCount - a.incorrectCount || a.correctCount - b.correctCount);

  const weakAreas = allWeakAreas.slice(0, 3);

  const recommendedWeeks = [...new Set(allWeakAreas.flatMap((item) => item.linkedWeeks))].sort((a, b) => a - b);
  const assignedWeek = recommendedWeeks.length > 0 ? Math.min(...recommendedWeeks) : undefined;
  const recommendedLessonTargets = allWeakAreas.flatMap((item) =>
    item.linkedWeeks.map((week) => ({
      week,
      lessons: item.linkedLessons,
    }))
  );

  return {
    studentId,
    yearLevel,
    testType,
    score,
    total,
    percentage,
    passed,
    strengths,
    weakAreas,
    recommendedWeeks,
    recommendedLessonTargets,
    assignedWeek,
    generatedAt: new Date().toISOString(),
  };
}

export function getLatestPosttestProfile(rawQuizScores: unknown): AssessmentResultProfile | null {
  if (!rawQuizScores || typeof rawQuizScores !== "object") return null;
  const posttest = "posttest" in rawQuizScores ? rawQuizScores.posttest : undefined;
  if (!posttest || typeof posttest !== "object") return null;
  const profile = "latest" in posttest ? posttest.latest : undefined;
  if (!profile || typeof profile !== "object") return null;
  return profile as AssessmentResultProfile;
}
