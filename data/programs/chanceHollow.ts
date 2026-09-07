import { normalizeWeekPlans } from "./buildProgram";
import type { CurriculumCode, Lesson, WeekPlan } from "./year1";

export type ChanceHollowYearLabel = "Year 3";

type ChanceWeekSeed = {
  topic: string;
  purpose: string;
  curriculum: CurriculumCode[];
  lessons: readonly [string, string, string];
};

const LEVEL_3_OUTCOME =
  "Students identify everyday chance events, describe possible outcomes with chance language, conduct repeated chance experiments, record results, and discuss variation.";

const LEVEL_3_SEEDS: readonly ChanceWeekSeed[] = [
  {
    topic: "Chance Words",
    purpose: "Use certain, impossible, likely and unlikely to describe everyday chance events.",
    curriculum: ["AC9M3P01"],
    lessons: ["Certain or Impossible", "Likely or Unlikely", "Explain the Chance Word"],
  },
  {
    topic: "Everyday Chance Events",
    purpose: "Classify practical activities and real events by likelihood and explain the reason.",
    curriculum: ["AC9M3P01"],
    lessons: ["Chance Around Us", "Sort Event Cards", "Give a Reason"],
  },
  {
    topic: "Possible Outcomes",
    purpose: "Identify and list possible outcomes before predicting what could happen next.",
    curriculum: ["AC9M3P01"],
    lessons: ["What Could Happen?", "List All Outcomes", "Match Event to Outcome"],
  },
  {
    topic: "Predict and Test",
    purpose: "Make predictions for simple chance activities and test what happens.",
    curriculum: ["AC9M3P01", "AC9M3P02"],
    lessons: ["Make a Prediction", "Test the Prediction", "Did It Match?"],
  },
  {
    topic: "Repeated Experiments",
    purpose: "Run repeated chance experiments and record results with tally charts.",
    curriculum: ["AC9M3P02"],
    lessons: ["Coin, Dice and Spinner Trials", "Record With Tallies", "Compare Trial Results"],
  },
  {
    topic: "Variation Investigation",
    purpose: "Recognise and discuss variation between repeated trials and class results.",
    curriculum: ["AC9M3P02"],
    lessons: ["Same Experiment, New Results", "Compare Class Results", "Explain Variation"],
  },
];

function lessonFocus(seed: ChanceWeekSeed, title: string) {
  return `Probability: ${title.toLowerCase()} within ${seed.topic.toLowerCase()}. ${seed.purpose} ${LEVEL_3_OUTCOME}`;
}

function buildLevel3Program(): WeekPlan[] {
  const raw: WeekPlan[] = LEVEL_3_SEEDS.map((seed, weekIndex) => {
    const week = weekIndex + 1;
    return {
      id: `y3-chance-w${week}`,
      week,
      topic: seed.topic,
      curriculum: seed.curriculum,
      lessons: seed.lessons.map((title, lessonIndex): Lesson => {
        const lesson = lessonIndex + 1;
        return {
          id: `y3-chance-w${week}-l${lesson}`,
          week,
          lesson,
          title,
          focus: lessonFocus(seed, title),
          activityIdeas: [`Chance Hollow Level 3`, seed.topic, title],
          curriculum: seed.curriculum,
          activityType: "chance-hollow",
          config: {
            realmId: "chance",
            mechanic: seed.topic,
          },
        };
      }),
    };
  });

  return normalizeWeekPlans(3, raw);
}

export const CHANCE_HOLLOW_PROGRAMS: Record<3, WeekPlan[]> = {
  3: buildLevel3Program(),
};

export function getChanceHollowProgramForYearLabel(yearLabel: string): WeekPlan[] | null {
  return yearLabel === "Year 3" ? CHANCE_HOLLOW_PROGRAMS[3] : null;
}

export const CHANCE_HOLLOW_META = {
  realm: "Chance Hollow",
  strand: "Probability",
  levels: [3] as const,
  weeks: 6,
  lessonsPerWeek: 3,
  curriculum: {
    3: ["AC9M3P01", "AC9M3P02"],
  },
  outcome: LEVEL_3_OUTCOME,
} as const;
