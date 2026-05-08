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
};

function parseNumericAssessmentValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/,/g, "").trim();
  if (!cleaned.length) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
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

export function isAssessmentAnswerCorrect(
  question: GenericAssessmentQuestion,
  chosen: string | undefined
): boolean {
  const expected = question.answerOptionId ?? question.correctAnswer ?? question.answer;
  if (expected == null || chosen == null) return false;

  if (question.type === "numeric" || question.type === "numberLine" || question.type === "mab") {
    const expectedValue = parseNumericAssessmentValue(expected);
    const chosenValue = parseNumericAssessmentValue(chosen);
    if (expectedValue != null && chosenValue != null) {
      return Math.abs(expectedValue - chosenValue) < 1e-9;
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
