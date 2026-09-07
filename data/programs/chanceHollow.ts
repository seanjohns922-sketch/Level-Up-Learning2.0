import { normalizeWeekPlans } from "./buildProgram";
import type { CurriculumCode, Lesson, WeekPlan } from "./year1";

export type ChanceHollowYearLabel = "Year 3" | "Year 4";

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

const LEVEL_4_SEEDS: readonly ChanceWeekSeed[] = [
  {
    topic: "Equally Likely Outcomes",
    purpose: "Recognise when outcomes have the same chance and explain why.",
    curriculum: ["AC9M4P01"],
    lessons: ["Fair or Not Fair?", "Equal Chance Outcomes", "Explain Equal Chance"],
  },
  {
    topic: "Chance Tools",
    purpose: "Use dice, coins, spinners and bags to identify and count possible outcomes.",
    curriculum: ["AC9M4P01"],
    lessons: ["Read the Chance Tool", "Count the Outcomes", "Match Tool to Chance"],
  },
  {
    topic: "Probability as Fractions",
    purpose: "Describe chance using simple fractions of possible outcomes.",
    curriculum: ["AC9M4P01"],
    lessons: ["One Out Of", "Fraction Chance", "Compare Fraction Chances"],
  },
  {
    topic: "Fair Games",
    purpose: "Decide whether a game is fair by checking possible outcomes.",
    curriculum: ["AC9M4P01"],
    lessons: ["Is the Game Fair?", "Fix the Game", "Design a Fair Game"],
  },
  {
    topic: "Compare Chances",
    purpose: "Compare two events using outcome counts and probability language.",
    curriculum: ["AC9M4P01"],
    lessons: ["More Chance or Less Chance?", "Same Chance", "Best Prediction"],
  },
  {
    topic: "Chance Investigation",
    purpose: "Run a simple chance investigation and compare expected with actual results.",
    curriculum: ["AC9M4P01"],
    lessons: ["Predict From the Tool", "Run and Record", "Compare Expected and Actual"],
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
    case "Fair or Not Fair?":
      return "tell if a chance situation is fair.";
    case "Equal Chance Outcomes":
      return "recognise outcomes with the same chance.";
    case "Explain Equal Chance":
      return "explain why outcomes are equally likely.";
    case "Read the Chance Tool":
      return "read possible outcomes from a chance tool.";
    case "Count the Outcomes":
      return "count possible outcomes for a chance tool.";
    case "Match Tool to Chance":
      return "match a chance tool to a probability.";
    case "One Out Of":
      return "describe chance as one outcome out of all outcomes.";
    case "Fraction Chance":
      return "write chance as a simple fraction.";
    case "Compare Fraction Chances":
      return "compare chance fractions.";
    case "Is the Game Fair?":
      return "decide if a game is fair.";
    case "Fix the Game":
      return "change a game so it is fair.";
    case "Design a Fair Game":
      return "design a game with equal chances.";
    case "More Chance or Less Chance?":
      return "compare which event has more chance.";
    case "Same Chance":
      return "recognise different events with the same chance.";
    case "Best Prediction":
      return "choose the best prediction from the outcomes.";
    case "Predict From the Tool":
      return "predict using the chance tool.";
    case "Run and Record":
      return "run a chance trial and record the results.";
    case "Compare Expected and Actual":
      return "compare expected and actual chance results.";
    default:
      return seed.purpose.toLowerCase();
  }
}

function buildChanceProgram(level: 3 | 4, seeds: readonly ChanceWeekSeed[]): WeekPlan[] {
  const raw: WeekPlan[] = seeds.map((seed, weekIndex) => {
    const week = weekIndex + 1;
    return {
      id: `y${level}-chance-w${week}`,
      week,
      topic: seed.topic,
      curriculum: seed.curriculum,
      lessons: seed.lessons.map((title, lessonIndex): Lesson => {
        const lesson = lessonIndex + 1;
        return {
          id: `y${level}-chance-w${week}-l${lesson}`,
          week,
          lesson,
          title,
          focus: lessonFocus(seed, title),
          activityIdeas: [`Chance Hollow Level ${level}`, seed.topic, title],
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

  return normalizeWeekPlans(level, raw);
}

export const CHANCE_HOLLOW_PROGRAMS: Record<3 | 4, WeekPlan[]> = {
  3: buildChanceProgram(3, LEVEL_3_SEEDS),
  4: buildChanceProgram(4, LEVEL_4_SEEDS),
};

export function getChanceHollowProgramForYearLabel(yearLabel: string): WeekPlan[] | null {
  if (yearLabel === "Year 3") return CHANCE_HOLLOW_PROGRAMS[3];
  if (yearLabel === "Year 4") return CHANCE_HOLLOW_PROGRAMS[4];
  return null;
}

export const CHANCE_HOLLOW_META = {
  realm: "Chance Hollow",
  strand: "Probability",
  levels: [3, 4] as const,
  weeks: 6,
  lessonsPerWeek: 3,
  curriculum: {
    3: ["AC9M3P01", "AC9M3P02"],
    4: ["AC9M4P01"],
  },
  outcome: "Students describe chance events, list outcomes, compare likelihoods, use simple probability fractions, and discuss trial results.",
} as const;
