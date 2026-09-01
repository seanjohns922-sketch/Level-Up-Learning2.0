import type { CurriculumCode, Lesson, WeekPlan } from "./year1";

type PatternPeaksLessonSeed = {
  title: string;
  focus: string;
  mechanic: string;
  curriculum: CurriculumCode[];
};

type PatternPeaksWeekSeed = {
  topic: string;
  purpose: string;
  lessons: [PatternPeaksLessonSeed, PatternPeaksLessonSeed, PatternPeaksLessonSeed];
};

const level3Seeds: PatternPeaksWeekSeed[] = [
  {
    topic: "Spot Patterns",
    purpose: "Notice, describe and explain how doubling and halving sequences change.",
    lessons: [
      { title: "What Changes?", focus: "Identify the operation and amount of change between consecutive terms.", mechanic: "Pattern scanner", curriculum: ["AC9M3A01"] },
      { title: "Double or Halve", focus: "Recognise extended sequences formed by repeated doubling or halving.", mechanic: "Crystal chain", curriculum: ["AC9M3A01"] },
      { title: "Find the Broken Step", focus: "Locate and repair a term that does not follow a doubling or halving rule.", mechanic: "Fault finder", curriculum: ["AC9M3A01"] },
    ],
  },
  {
    topic: "Continue and Create",
    purpose: "Continue, complete and create extended doubling and halving sequences.",
    lessons: [
      { title: "Continue the Sequence", focus: "Apply a doubling or halving rule across several steps.", mechanic: "Sequence bridge", curriculum: ["AC9M3A01"] },
      { title: "Missing Terms", focus: "Reason forwards and backwards to restore missing sequence terms.", mechanic: "Missing rune slots", curriculum: ["AC9M3A01"] },
      { title: "Create a Pattern", focus: "Choose a valid start and rule, then explain the resulting sequence.", mechanic: "Pattern forge", curriculum: ["AC9M3A01"] },
    ],
  },
  {
    topic: "Rules and Function Machines",
    purpose: "Connect a simple operation rule with its inputs, outputs and sequence.",
    lessons: [
      { title: "Inputs and Outputs", focus: "Apply one-step double, halve, add or subtract rules to inputs.", mechanic: "Function machine", curriculum: ["AC9M3A01", "AC9M3A02"] },
      { title: "Discover the Rule", focus: "Infer a consistent rule from several input-output pairs.", mechanic: "Rule decoder", curriculum: ["AC9M3A01", "AC9M3A02"] },
      { title: "Build a Rule Machine", focus: "Create and test a one-step rule that produces specified outputs.", mechanic: "Machine builder", curriculum: ["AC9M3A01", "AC9M3A02"] },
    ],
  },
  {
    topic: "Inverse Relationships",
    purpose: "Use inverse operations to connect facts and check results.",
    lessons: [
      { title: "Addition and Subtraction", focus: "Explain how addition and subtraction undo each other.", mechanic: "Inverse portals", curriculum: ["AC9M3A02"] },
      { title: "Related Multiplication Facts", focus: "Connect known multiplication facts for 3, 4, 5 and 10 with related division facts.", mechanic: "Fact-family vault", curriculum: ["AC9M3A03"] },
      { title: "Check with the Inverse", focus: "Select and apply an inverse operation to verify an answer.", mechanic: "Balance check", curriculum: ["AC9M3A02", "AC9M3A03"] },
    ],
  },
  {
    topic: "Equivalent Number Sentences",
    purpose: "Partition numbers and generate different number sentences with the same value.",
    lessons: [
      { title: "Balance Both Sides", focus: "Decide whether two additive number sentences have equal values.", mechanic: "Equation scales", curriculum: ["AC9M3A02"] },
      { title: "True or False?", focus: "Test and explain equivalence without relying on the equals sign as an answer cue.", mechanic: "Truth gates", curriculum: ["AC9M3A02"] },
      { title: "Make an Equivalent Sentence", focus: "Partition a number to create a different but equivalent additive sentence.", mechanic: "Equation builder", curriculum: ["AC9M3A02"] },
    ],
  },
  {
    topic: "Find the Unknown",
    purpose: "Use inverse reasoning and known facts to determine missing values.",
    lessons: [
      { title: "Missing Addends", focus: "Find an unknown part in addition and subtraction number sentences.", mechanic: "Hidden-rune equations", curriculum: ["AC9M3A02"] },
      { title: "Missing Fact Values", focus: "Use known multiplication and related division facts to find a missing value.", mechanic: "Fact lock", curriculum: ["AC9M3A03"] },
      { title: "Explain the Unknown", focus: "Choose a strategy and justify why the missing value makes the sentence true.", mechanic: "Reasoning chamber", curriculum: ["AC9M3A02", "AC9M3A03"] },
    ],
  },
  {
    topic: "Properties and Structure",
    purpose: "Use patterns in known facts to calculate efficiently with larger numbers.",
    lessons: [
      { title: "Patterns in Addition Facts", focus: "Use patterns in facts to 20 to derive related calculations with larger numbers.", mechanic: "Fact ladder", curriculum: ["AC9M3A03"] },
      { title: "Multiplication Fact Patterns", focus: "Recognise and explain patterns in the 3, 4, 5 and 10 multiplication facts.", mechanic: "Array observatory", curriculum: ["AC9M3A03"] },
      { title: "Choose an Efficient Fact", focus: "Select a known or related fact that reduces the calculation effort.", mechanic: "Strategy sorter", curriculum: ["AC9M3A03"] },
    ],
  },
  {
    topic: "Pattern Investigation",
    purpose: "Apply, compare and justify pattern and inverse reasoning in an investigation.",
    lessons: [
      { title: "Plan and Test", focus: "Plan a sequence or number-sentence investigation and record results systematically.", mechanic: "Investigation board", curriculum: ["AC9M3A01", "AC9M3A02"] },
      { title: "Compare Two Rules", focus: "Compare the behaviour of two rules and explain where their outputs differ or coincide.", mechanic: "Dual-rule race", curriculum: ["AC9M3A01", "AC9M3A03"] },
      { title: "Justify and Diagnose", focus: "Evaluate another learner's claim, identify an error and support a correction with evidence.", mechanic: "Pattern trial", curriculum: ["AC9M3A01", "AC9M3A02", "AC9M3A03"] },
    ],
  },
];

export const PATTERN_PEAKS_SPINE = level3Seeds.map((week, index) => ({
  week: index + 1,
  topic: week.topic,
  purpose: week.purpose,
}));

function buildLevel3Program(): WeekPlan[] {
  return level3Seeds.map((week, weekIndex) => {
    const weekNumber = weekIndex + 1;
    const lessons = week.lessons.map((lesson, lessonIndex): Lesson => ({
      id: `y3-algebra-w${weekNumber}-l${lessonIndex + 1}`,
      week: weekNumber,
      lesson: lessonIndex + 1,
      title: lesson.title,
      focus: lesson.focus,
      activityIdeas: [lesson.mechanic],
      curriculum: lesson.curriculum,
      activityType: "pattern-peaks-blueprint",
      config: {
        realmId: "pattern",
        mechanic: lesson.mechanic,
        implementationStatus: "blueprint",
      },
    }));
    const curriculum = [...new Set(lessons.flatMap((lesson) => lesson.curriculum))];
    return {
      id: `y3-algebra-w${weekNumber}`,
      week: weekNumber,
      topic: week.topic,
      curriculum,
      lessons,
    };
  });
}

export const PATTERN_PEAKS_LEVEL3_PROGRAM = buildLevel3Program();

export const PATTERN_PEAKS_LEVEL3_WEEK_PURPOSES = Object.fromEntries(
  PATTERN_PEAKS_SPINE.map((week) => [week.week, week.purpose]),
) as Record<number, string>;

export function getPatternPeaksProgramForYearLabel(yearLabel: string): WeekPlan[] | null {
  return yearLabel === "Year 3" ? PATTERN_PEAKS_LEVEL3_PROGRAM : null;
}
