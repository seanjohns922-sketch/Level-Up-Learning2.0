export type Difficulty = "easy" | "medium" | "hard";

export type LessonKey = `W${number}_L${1 | 2 | 3}`;

export type LessonConfig = {
  week: number;
  lesson: 1 | 2 | 3;
  key: LessonKey;
  title: string;
  allowedActivityIds: string[];
  activitiesPerSession: number;
  timing: {
    totalSeconds: 540;
    easyUntil: 270;
    mediumUntil: 440;
    hardUntil: 540;
  };
  difficultyHints?: {
    easy?: Record<string, any>;
    medium?: Record<string, any>;
    hard?: Record<string, any>;
  };
};

export type WeeklyQuizConfig = {
  week: number;
  totalQuestions: 15;
  passPercent: 80;
  questionsPerLesson: 5;
  lessonKeys: [LessonKey, LessonKey, LessonKey];
};

/** Determine difficulty gate from elapsed seconds (strict time-based) */
export function getDifficultyFromTime(elapsedSeconds: number): Difficulty {
  if (elapsedSeconds < 270) return "easy";
  if (elapsedSeconds < 440) return "medium";
  return "hard";
}

/** Look up a lesson config by week + lesson number */
export function getLessonConfig(week: number, lesson: number): LessonConfig | undefined {
  return YEAR1_LESSON_CONFIG.find(
    (c) => c.week === week && c.lesson === lesson
  );
}

/** Look up a weekly quiz config */
export function getWeeklyQuizConfig(week: number): WeeklyQuizConfig | undefined {
  return YEAR1_WEEKLY_QUIZZES.find((q) => q.week === week);
}

export const YEAR1_LESSON_CONFIG: LessonConfig[] = [
  // WEEK 1
  {
    week: 1, lesson: 1, key: "W1_L1",
    title: "Recognise and Read Numbers to 50",
    allowedActivityIds: ["W1L1_NumberID_MC", "W1L1_NumberWordMatch", "W1L1_QuickRead"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 },
    difficultyHints: {
      easy: { numberMax: 30 },
      medium: { numberMin: 31, numberMax: 50 },
      hard: { numberMax: 50, includeTrickWords: true }
    }
  },
  {
    week: 1, lesson: 2, key: "W1_L2",
    title: "Count Objects to 50",
    allowedActivityIds: ["W1L2_CountObjects", "W1L2_CountCompare", "W1L2_CountInOrder"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 },
    difficultyHints: {
      easy: { countMax: 20 },
      medium: { countMin: 21, countMax: 35 },
      hard: { countMin: 36, countMax: 50, messyLayout: true }
    }
  },
  {
    week: 1, lesson: 3, key: "W1_L3",
    title: "Order and Write Numbers to 50",
    allowedActivityIds: ["W1L3_OrderNumbers", "W1L3_MissingNumberLine", "W1L3_TypeTheNumber"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 },
    difficultyHints: {
      easy: { numberMax: 30 },
      medium: { numberMax: 50 },
      hard: { numberMax: 50, includeBackward: true }
    }
  },
  // WEEK 2
  {
    week: 2, lesson: 1, key: "W2_L1",
    title: "Tens and Ones",
    allowedActivityIds: ["W2L1_BuildTheNumber_MAB", "W2L1_BreakApart_TensOnes", "W2L1_QuickTens"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 },
    difficultyHints: {
      easy: { numberMax: 40 },
      medium: { numberMax: 80 },
      hard: { numberMax: 120 }
    }
  },
  {
    week: 2, lesson: 2, key: "W2_L2",
    title: "Compare Place Value",
    allowedActivityIds: ["W2L2_WhichIsBigger", "W2L2_TensFirst", "W2L2_SameTens"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 }
  },
  {
    week: 2, lesson: 3, key: "W2_L3",
    title: "Place Value Practice",
    allowedActivityIds: ["W2L3_MatchBuildToNumber", "W2L3_NumberToTensOnes", "W2L3_MixedPlaceValue"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 }
  },
  // WEEK 3
  {
    week: 3, lesson: 1, key: "W3_L1",
    title: "Add Within 20 (Concrete)",
    allowedActivityIds: ["W3L1_AddTwoGroups", "W3L1_CountOn", "W3L1_AddAndCheck"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 },
    difficultyHints: {
      easy: { sumMax: 10 },
      medium: { sumMax: 15 },
      hard: { sumMax: 20 }
    }
  },
  {
    week: 3, lesson: 2, key: "W3_L2",
    title: "Addition Stories",
    allowedActivityIds: ["W3L2_StoryProblem_Add", "W3L2_PictureStory_Add", "W3L2_MissingAddend"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 }
  },
  {
    week: 3, lesson: 3, key: "W3_L3",
    title: "Addition Fluency",
    allowedActivityIds: ["W3L3_QuickAdd", "W3L3_Make10", "W3L3_MixedAddTo20"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 }
  },
  // WEEK 4
  {
    week: 4, lesson: 1, key: "W4_L1",
    title: "Take Away (Concrete)",
    allowedActivityIds: ["W4L1_RemoveCounters", "W4L1_CountBack", "W4L1_SubtractAndCheck"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 }
  },
  {
    week: 4, lesson: 2, key: "W4_L2",
    title: "Subtraction Stories",
    allowedActivityIds: ["W4L2_StoryProblem_Sub", "W4L2_PictureStory_Sub", "W4L2_MissingSubtrahend"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 }
  },
  {
    week: 4, lesson: 3, key: "W4_L3",
    title: "Subtraction Fluency",
    allowedActivityIds: ["W4L3_QuickSubtract", "W4L3_RelatedFacts", "W4L3_MixedSubTo20"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 }
  },
  // WEEK 5
  {
    week: 5, lesson: 1, key: "W5_L1",
    title: "Choose the Operation",
    allowedActivityIds: ["W5L1_StorySort_Op", "W5L1_DragToBox_Op", "W5L1_MissingOperation"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 }
  },
  {
    week: 5, lesson: 2, key: "W5_L2",
    title: "Solve Mixed Stories",
    allowedActivityIds: ["W5L2_ReadAndSolve", "W5L2_VisualStory_Mixed", "W5L2_TwoStep_OpThenSolve"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 }
  },
  {
    week: 5, lesson: 3, key: "W5_L3",
    title: "Review",
    allowedActivityIds: ["W5L3_MixedFacts", "W5L3_MissingNumber_Mixed", "W5L3_QuickCheck_Timed"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 }
  },
  // WEEK 6
  {
    week: 6, lesson: 1, key: "W6_L1",
    title: "Subtraction Facts",
    allowedActivityIds: ["W6L1_TakeAwayVisuals", "W6L1_CountBack", "W6L1_SubFluency"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 }
  },
  {
    week: 6, lesson: 2, key: "W6_L2",
    title: "Subtraction Stories",
    allowedActivityIds: ["W6L2_StoryProblems_Sub", "W6L2_PictureStories_Sub", "W6L2_MissingSubtrahend"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 }
  },
  {
    week: 6, lesson: 3, key: "W6_L3",
    title: "Review",
    allowedActivityIds: ["W6L3_MixedSubtraction", "W6L3_EquationMatch", "W6L3_TimedFacts"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 }
  },
  // WEEK 7
  {
    week: 7, lesson: 1, key: "W7_L1",
    title: "Choose Operation for Story Problems",
    allowedActivityIds: ["W7L1_OperationSort", "W7L1_DragStoryToOp", "W7L1_MissingOperation"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 }
  },
  {
    week: 7, lesson: 2, key: "W7_L2",
    title: "Apply to Real Life",
    allowedActivityIds: ["W7L2_PlayShop_Mixed", "W7L2_ParkStory_Mixed", "W7L2_ChooseAndSolve"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 }
  },
  {
    week: 7, lesson: 3, key: "W7_L3",
    title: "Simple Money",
    allowedActivityIds: ["W7L3_MakeAmount_Coins", "W7L3_IsThisEnough_YN", "W7L3_MoneyCompareOrChange"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 }
  },
  // WEEK 8
  {
    week: 8, lesson: 1, key: "W8_L1",
    title: "Model Additive Situations",
    allowedActivityIds: ["W8L1_BuildTheStory", "W8L1_TwoMats_ActItOut", "W8L1_WhatHappened"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 }
  },
  {
    week: 8, lesson: 2, key: "W8_L2",
    title: "Use Diagrams",
    allowedActivityIds: ["W8L2_PartPartWhole", "W8L2_BarModel", "W8L2_CompareBars_Difference"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 }
  },
  {
    week: 8, lesson: 3, key: "W8_L3",
    title: "Money Problems (≤ $20)",
    allowedActivityIds: ["W8L3_AddTwoPrices", "W8L3_HowMuchMore_CountUp", "W8L3_SimpleChange_To20"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 }
  },
  // WEEK 9
  {
    week: 9, lesson: 1, key: "W9_L1",
    title: "Share Objects into Equal Groups",
    allowedActivityIds: ["W9L1_DragToShare", "W9L1_TapToDeal", "W9L1_IsItFair_YN"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 }
  },
  {
    week: 9, lesson: 2, key: "W9_L2",
    title: "Diagrams for Sharing",
    allowedActivityIds: ["W9L2_FillGroupBoxes", "W9L2_DrawEqualGroups", "W9L2_MissingGroupSize"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 }
  },
  {
    week: 9, lesson: 3, key: "W9_L3",
    title: "Model Sharing with Materials",
    allowedActivityIds: ["W9L3_PackTheBoxes", "W9L3_GroupGrabBags", "W9L3_HowManyGroups"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 }
  },
  // WEEK 10
  {
    week: 10, lesson: 1, key: "W10_L1",
    title: "Group Using Skip Counting",
    allowedActivityIds: ["W10L1_TapGroups_SkipCount", "W10L1_BuildGroups_SkipCount", "W10L1_ChooseSkipPattern"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 }
  },
  {
    week: 10, lesson: 2, key: "W10_L2",
    title: "Diagrams to Model Grouping",
    allowedActivityIds: ["W10L2_ArrayBuilder", "W10L2_BarGroupModel", "W10L2_MissingGroupCount"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 }
  },
  {
    week: 10, lesson: 3, key: "W10_L3",
    title: "Word Problems with Grouping",
    allowedActivityIds: ["W10L3_RealLifeGrouping", "W10L3_HowManyGroups_Story", "W10L3_TwoStepGrouping"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 }
  },
  // WEEK 11
  {
    week: 11, lesson: 1, key: "W11_L1",
    title: "Recall Facts to 10 and 20",
    allowedActivityIds: ["W11L1_FlashFacts_60s", "W11L1_Make10or20", "W11L1_MissingNumber_Equation"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 }
  },
  {
    week: 11, lesson: 2, key: "W11_L2",
    title: "Doubles and Near Doubles",
    allowedActivityIds: ["W11L2_DoubleIt", "W11L2_NearDouble", "W11L2_DoubleDetective_Strategy"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 }
  },
  {
    week: 11, lesson: 3, key: "W11_L3",
    title: "Games",
    allowedActivityIds: ["W11L3_GridRace", "W11L3_FactMatch", "W11L3_ClimbTheLadder"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 }
  },
  // WEEK 12
  {
    week: 12, lesson: 1, key: "W12_L1",
    title: "Check Understanding",
    allowedActivityIds: ["W12L1_MixedReviewSprint", "W12L1_StrategyChoice", "W12L1_ErrorSpotter"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 }
  },
  {
    week: 12, lesson: 2, key: "W12_L2",
    title: "Targeted Revision",
    allowedActivityIds: ["W12L2_ChoosePracticeArea", "W12L2_FixTheMistake", "W12L2_MissingStep"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 }
  },
  {
    week: 12, lesson: 3, key: "W12_L3",
    title: "Fun Games & Consolidation",
    allowedActivityIds: ["W12L3_FluencyTournament", "W12L3_GridChallenge", "W12L3_BossLevel"],
    activitiesPerSession: 3,
    timing: { totalSeconds: 540, easyUntil: 270, mediumUntil: 440, hardUntil: 540 }
  }
];

export const YEAR1_WEEKLY_QUIZZES: WeeklyQuizConfig[] = Array.from({ length: 12 }, (_, i) => {
  const week = i + 1;
  return {
    week,
    totalQuestions: 15 as const,
    passPercent: 80 as const,
    questionsPerLesson: 5 as const,
    lessonKeys: [`W${week}_L1`, `W${week}_L2`, `W${week}_L3`] as [LessonKey, LessonKey, LessonKey],
  };
});
