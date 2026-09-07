import { normalizeWeekPlans } from "./buildProgram";
import type { CurriculumCode, Lesson, WeekPlan } from "./year1";

export type ChanceHollowYearLabel = "Year 3";

type ChanceWeekSeed = {
  topic: string;
  purpose: string;
  curriculum: CurriculumCode[];
  lessons: readonly [string, string, string];
};

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
  switch (title) {
    case "Certain or Impossible":
      return "tell if an event is certain or impossible.";
    case "Likely or Unlikely":
      return "tell if an event is likely or unlikely.";
    case "Explain the Chance Word":
      return "explain why a chance word matches an event.";
    case "Chance Around Us":
      return "find chance events in everyday life.";
    case "Sort Event Cards":
      return "sort events using chance words.";
    case "Give a Reason":
      return "give a reason for my chance word.";
    case "What Could Happen?":
      return "name what could happen in a chance event.";
    case "List All Outcomes":
      return "list all possible outcomes.";
    case "Match Event to Outcome":
      return "match an event to its possible outcomes.";
    case "Make a Prediction":
      return "make a sensible prediction before testing.";
    case "Test the Prediction":
      return "test a prediction with a simple experiment.";
    case "Did It Match?":
      return "compare my prediction with the result.";
    case "Coin, Dice and Spinner Trials":
      return "run chance trials with coins, dice and spinners.";
    case "Record With Tallies":
      return "record chance results with tallies.";
    case "Compare Trial Results":
      return "compare results from repeated trials.";
    case "Same Experiment, New Results":
      return "notice that chance results can change.";
    case "Compare Class Results":
      return "compare chance results across the class.";
    case "Explain Variation":
      return "explain variation in repeated chance trials.";
    default:
      return seed.purpose.toLowerCase();
  }
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
  outcome: "Students describe chance events, list outcomes, run trials, record results, and discuss variation.",
} as const;
