import { computeWholeMathsLevel } from "@/lib/whole-maths-diagnostic";
import type { AcStrand } from "@/lib/curriculum/ac-standards";

export const LIVE_PROGRESSION_QUIZ_WEEK_CREDIT = 1;
export const LIVE_PROGRESSION_LESSON_WEEK_CREDIT = 0.4;
export const LIVE_PROGRESSION_LESSONS_PER_WEEK = 3;
export const LIVE_PROGRESSION_MAX_CONFIDENCE = 95;
export const LIVE_PROGRESSION_ASSESSMENT_MASTERY = 85;
export const LIVE_PROGRESSION_ASSESSMENT_FLOOR = 40;

export type ProgressionCheckpointSource = "diagnostic" | "pretest" | "posttest" | "placement";

export type LiveProgressionEstimateInput = {
  checkpointLevel: number;
  checkpointSource: ProgressionCheckpointSource;
  workingLevel: number;
  totalWeeks: number;
  passedQuizWeeks: number;
  completedUnconfirmedLessons: number;
};

export type LiveProgressionEstimate = {
  predictedLevel: number;
  confidence: number;
  confirmedWeekEquivalents: number;
};

const SOURCE_CONFIDENCE: Record<ProgressionCheckpointSource, number> = {
  diagnostic: 70,
  pretest: 60,
  posttest: 70,
  placement: 25,
};

export function measuredCheckpointForAssessment(level: number, percent: number): number {
  if (!Number.isFinite(level) || !Number.isFinite(percent)) {
    throw new Error("Assessment checkpoint inputs must be finite.");
  }
  const boundedLevel = Math.max(0, Math.min(6, level));
  const boundedPercent = Math.max(0, Math.min(100, percent));
  const measured = boundedPercent >= LIVE_PROGRESSION_ASSESSMENT_MASTERY
    ? boundedLevel
    : boundedPercent >= LIVE_PROGRESSION_ASSESSMENT_FLOOR
      ? boundedLevel - 1 + (
        (boundedPercent - LIVE_PROGRESSION_ASSESSMENT_FLOOR) /
        (LIVE_PROGRESSION_ASSESSMENT_MASTERY - LIVE_PROGRESSION_ASSESSMENT_FLOOR)
      )
      : boundedLevel - 1 - Math.min(
        0.9,
        (LIVE_PROGRESSION_ASSESSMENT_FLOOR - boundedPercent) /
          LIVE_PROGRESSION_ASSESSMENT_FLOOR,
      );
  return Math.round(Math.max(0, Math.min(6, measured)) * 100) / 100;
}

export function estimateLiveProgression(input: LiveProgressionEstimateInput): LiveProgressionEstimate {
  if (!Number.isFinite(input.totalWeeks) || input.totalWeeks <= 0) {
    throw new Error("A live progression estimate requires a positive week count.");
  }
  const quizzes = Math.max(0, Math.trunc(input.passedQuizWeeks));
  const lessons = Math.max(0, Math.trunc(input.completedUnconfirmedLessons));
  const partialLessonWeeks =
    (lessons / LIVE_PROGRESSION_LESSONS_PER_WEEK) * LIVE_PROGRESSION_LESSON_WEEK_CREDIT;
  const confirmedWeekEquivalents =
    quizzes * LIVE_PROGRESSION_QUIZ_WEEK_CREDIT + partialLessonWeeks;
  const baseline = input.checkpointLevel;
  const predictedLevel = Math.min(
    6,
    Math.round((baseline + confirmedWeekEquivalents / input.totalWeeks) * 100) / 100,
  );
  const confidence = Math.min(
    LIVE_PROGRESSION_MAX_CONFIDENCE,
    SOURCE_CONFIDENCE[input.checkpointSource] + Math.min(25, quizzes * 4 + lessons),
  );
  return { predictedLevel, confidence, confirmedWeekEquivalents };
}

export function computePredictedWholeMathsLevel(
  predictedLevels: Partial<Record<AcStrand, number | null>>,
) {
  return computeWholeMathsLevel(predictedLevels);
}

export function formatProgressionPoint(value: number | null | undefined): string {
  return value == null || !Number.isFinite(value) ? "—" : value.toFixed(2);
}
