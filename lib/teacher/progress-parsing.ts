import { calculateAccuracy } from "@/lib/learning-score";
import type { TeacherInsight, TeacherInsightStatus } from "@/lib/teacher-insights";

/**
 * Parsing for a realm progress row's lesson attempts and weekly quiz scores,
 * shared by the teacher Students tab and the printed strand report so both
 * read a student's results the same way.
 */

export type JsonObject = Record<string, unknown>;
export type InsightCarrier = {
  latestInsight?: TeacherInsight | null | undefined;
  latestSummary?: {
    timeSpentSeconds?: number | null;
    accuracy?: number | null;
    questionsAnswered?: number | null;
    totalQuestions?: number | null;
    correctAnswers?: number | null;
    correctCount?: number | null;
    incorrectAnswers?: number | null;
    accuracyPercent?: number | null;
    completedAt?: string | null;
    at?: string | null;
    title?: string | null;
    topicSummaries?: Array<{
      label?: string | null;
      correct?: number | null;
      total?: number | null;
      accuracy?: number | null;
    }> | null;
    areasToImprove?: Array<{
      label?: string | null;
      correct?: number | null;
      total?: number | null;
      accuracy?: number | null;
    }> | null;
    struggledQuestionTypes?: string[] | null;
  } | null;
  attempts?: unknown[] | null;
};

export function parseQuizScores(raw: unknown): Record<string, JsonObject> {
  if (raw && typeof raw === "object") return raw as Record<string, JsonObject>;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? (parsed as Record<string, JsonObject>) : {};
    } catch {
      return {};
    }
  }
  return {};
}

export function parseLessonAttempts(raw: unknown): Record<string, InsightCarrier> {
  if (raw && typeof raw === "object") return raw as Record<string, InsightCarrier>;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? (parsed as Record<string, InsightCarrier>) : {};
    } catch {
      return {};
    }
  }
  return {};
}

export function getQuizPercent(quiz: JsonObject | undefined): number | null {
  return calculateAccuracy(getQuizScore(quiz), getQuizTotal(quiz));
}

export function latestLessonAccuracy(carrier: InsightCarrier | undefined): number | null {
  const attempts = Array.isArray(carrier?.attempts)
    ? carrier!.attempts.filter((entry): entry is NonNullable<InsightCarrier["latestSummary"]> => Boolean(entry) && typeof entry === "object")
    : [];
  const latest = [...attempts].reverse().find((entry) => Boolean(entry.completedAt ?? entry.at)) ?? carrier?.latestSummary ?? null;
  if (!latest) return null;
  return calculateAccuracy(
    numberOrNull(latest.correctCount ?? latest.correctAnswers),
    numberOrNull(latest.totalQuestions ?? latest.questionsAnswered),
  );
}

export function getQuizScore(quiz: JsonObject | undefined): number | null {
  const value = quiz?.score;
  return typeof value === "number" ? value : null;
}

export function getQuizTotal(quiz: JsonObject | undefined): number | null {
  const value = quiz?.total;
  return typeof value === "number" ? value : null;
}

export function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export const INSIGHT_SEVERITY: Record<TeacherInsightStatus, number> = {
  "Needs Support": 3,
  "Quick Check-in Recommended": 2,
  "On Track": 1,
  "Ready to Move On": 0,
};

export function pickPrimaryInsight(insights: TeacherInsight[]): TeacherInsight | null {
  if (insights.length === 0) return null;
  return [...insights].sort((left, right) => {
    const severityGap = INSIGHT_SEVERITY[right.status] - INSIGHT_SEVERITY[left.status];
    if (severityGap !== 0) return severityGap;
    return left.needsSupport.localeCompare(right.needsSupport);
  })[0] ?? null;
}
