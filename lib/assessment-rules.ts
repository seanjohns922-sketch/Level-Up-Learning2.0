export const ASSESSMENT_THRESHOLDS = {
  pretestPassPercent: 85,
  pretestTargetedMinimumPercent: 50,
  weeklyQuizPassPercent: 80,
  posttestPassPercent: 85,
} as const;

export function pretestPathwayForPercent(percent: number) {
  if (percent >= ASSESSMENT_THRESHOLDS.pretestPassPercent) return "pass" as const;
  if (percent >= ASSESSMENT_THRESHOLDS.pretestTargetedMinimumPercent) return "targeted" as const;
  return "full" as const;
}

export function weeklyQuizPassed(percent: number) {
  return percent >= ASSESSMENT_THRESHOLDS.weeklyQuizPassPercent;
}

export function posttestPassed(percent: number) {
  return percent >= ASSESSMENT_THRESHOLDS.posttestPassPercent;
}
