import { STARPATH_WEEK_COUNT, getStarpathProgram } from "@/data/starpath/program-registry";
import type { StarpathLevelId } from "@/lib/starpath-levels";

export const STARPATH_MASTERY_THRESHOLD = 85 as const;
export const STARPATH_TARGETED_THRESHOLD = 50 as const;

export type StarpathPathwayDecision =
  | { pathway: "mastered"; requiredWeeks: []; preTestPercent: number }
  | { pathway: "targeted"; requiredWeeks: number[]; preTestPercent: number }
  | { pathway: "full"; requiredWeeks: number[]; preTestPercent: number | null };

export type StarpathProgramAccess = {
  realmId: "space";
  level: StarpathLevelId;
  weekCount: 8;
  lessonCountPerWeek: 3;
  quizWeeks: readonly [1, 2, 3, 4, 5, 6, 7];
  preTestRequired: boolean;
  postTestUnlockAfterLessonId: string;
  persistenceReady: false;
  playable: false;
};

const ALL_WEEKS = Array.from({ length: STARPATH_WEEK_COUNT }, (_, index) => index + 1);

export function getStarpathProgramAccess(level: StarpathLevelId): StarpathProgramAccess {
  const program = getStarpathProgram(level);
  return {
    realmId: "space",
    level,
    weekCount: STARPATH_WEEK_COUNT,
    lessonCountPerWeek: 3,
    quizWeeks: [1, 2, 3, 4, 5, 6, 7],
    preTestRequired: program.assessments.preTest !== null,
    postTestUnlockAfterLessonId: program.assessments.postTest.unlockAfterLessonId,
    persistenceReady: false,
    playable: false,
  };
}

export function resolveStarpathPathway(
  preTestPercent: number | null,
  weakSkillWeeks: readonly number[] = [],
): StarpathPathwayDecision {
  if (preTestPercent == null) {
    return { pathway: "full", requiredWeeks: [...ALL_WEEKS], preTestPercent: null };
  }
  if (!Number.isFinite(preTestPercent) || preTestPercent < 0 || preTestPercent > 100) {
    throw new Error(`Invalid Starpath pre-test percentage: ${preTestPercent}`);
  }
  if (preTestPercent >= STARPATH_MASTERY_THRESHOLD) {
    return { pathway: "mastered", requiredWeeks: [], preTestPercent };
  }
  if (preTestPercent >= STARPATH_TARGETED_THRESHOLD) {
    const requiredWeeks = [...new Set(weakSkillWeeks)]
      .filter((week) => Number.isInteger(week) && week >= 1 && week <= STARPATH_WEEK_COUNT)
      .sort((a, b) => a - b);
    return {
      pathway: "targeted",
      requiredWeeks: requiredWeeks.length > 0 ? requiredWeeks : [...ALL_WEEKS],
      preTestPercent,
    };
  }
  return { pathway: "full", requiredWeeks: [...ALL_WEEKS], preTestPercent };
}

export function canUnlockStarpathPostTest(completedLessonIds: ReadonlySet<string>, level: StarpathLevelId): boolean {
  return completedLessonIds.has(getStarpathProgram(level).assessments.postTest.unlockAfterLessonId);
}
