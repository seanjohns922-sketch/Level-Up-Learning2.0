export type LearningScore = {
  correct: number;
  total: number;
  accuracy: number;
};

function finiteNonNegativeInteger(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.max(0, Math.round(value));
}

export function calculateAccuracy(
  correct: number | null | undefined,
  total: number | null | undefined,
  precision = 2,
): number | null {
  const normalizedTotal = finiteNonNegativeInteger(total);
  const normalizedCorrect = finiteNonNegativeInteger(correct);
  if (!normalizedTotal || normalizedCorrect == null) return null;

  const factor = 10 ** Math.max(0, precision);
  return Math.round((Math.min(normalizedCorrect, normalizedTotal) / normalizedTotal) * 100 * factor) / factor;
}

export function normalizeLearningScore(
  correct: number | null | undefined,
  total: number | null | undefined,
): LearningScore | null {
  const normalizedTotal = finiteNonNegativeInteger(total);
  const normalizedCorrect = finiteNonNegativeInteger(correct);
  if (!normalizedTotal || normalizedCorrect == null) return null;

  const boundedCorrect = Math.min(normalizedCorrect, normalizedTotal);
  return {
    correct: boundedCorrect,
    total: normalizedTotal,
    accuracy: calculateAccuracy(boundedCorrect, normalizedTotal) ?? 0,
  };
}

export function aggregateLearningScores(
  scores: Array<Pick<LearningScore, "correct" | "total"> | null | undefined>,
): LearningScore | null {
  const totals = scores.reduce<{ correct: number; total: number }>(
    (result, score) => {
      const normalized = normalizeLearningScore(score?.correct, score?.total);
      if (!normalized) return result;
      result.correct += normalized.correct;
      result.total += normalized.total;
      return result;
    },
    { correct: 0, total: 0 },
  );

  return normalizeLearningScore(totals.correct, totals.total);
}

export function formatAccuracy(
  correct: number | null | undefined,
  total: number | null | undefined,
  fallback = "—",
  precision = 2,
) {
  return formatPercentage(calculateAccuracy(correct, total), fallback, precision);
}

export function formatPercentage(
  value: number | null | undefined,
  fallback = "—",
  precision = 2,
) {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  const factor = 10 ** Math.max(0, precision);
  return `${Math.round(value * factor) / factor}%`;
}
