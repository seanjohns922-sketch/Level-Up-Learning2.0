import { GROUND_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS } from "../groundNumberNexusIndependentPosttest";
type QuestionOption = number | string | { label?: string; value?: string; id?: string; groups?: number[] };

type QuestionVisual = {
  type?: string;
  leftTarget?: number;
  rightTarget?: number;
  maxDots?: number;
  totalCounters?: number;
  groups?: number;
  groupSize?: number;
  selectTarget?: number;
  [key: string]: unknown;
};

export type Question = {
  type?: string;
  id: string;
  prompt: string;
  options?: QuestionOption[];
  answer?: string | number | boolean | null;
  answerIndex?: number;
  answerOptionId?: string;
  correctAnswer?: string;
  skillId?: string;
  skillLabel?: string;
  linkedWeeks?: number[];
  linkedLessons?: number[];
  strand?: string;
  difficultyBand?: string;
  visual?: QuestionVisual | null;
  min?: number;
  max?: number;
  target?: number;
  maxTens?: number;
  maxOnes?: number;
  numberLine?: {
    min: number;
    max: number;
    answer: number;
  };
  /** Existing lesson interaction reused in assessment mode. */
  practiceTask?: import("@/data/activities/year1/practice-task").PracticeTask;
};

export const PREP_PRETEST: Question[] = [...GROUND_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS] as unknown as Question[];
