import { normalizeWeekPlans } from "./buildProgram";
import type { CurriculumCode, Lesson, WeekPlan } from "./year1";

export type ChanceHollowYearLabel = "Year 3" | "Year 4" | "Year 5" | "Year 6";

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

const LEVEL_5_SEEDS: readonly ChanceWeekSeed[] = [
  {
    topic: "Outcome Sets",
    purpose: "List complete outcome sets and decide whether their outcomes are equally likely.",
    curriculum: ["AC9M5P01"],
    lessons: ["Choose the Outcome Lens", "List Every Outcome", "Equally Likely or Not?"],
  },
  {
    topic: "Unequal Outcomes",
    purpose: "Compare chance tools whose outcomes have equal or unequal chances.",
    curriculum: ["AC9M5P01"],
    lessons: ["Equal Regions, Equal Chances", "Unequal Regions, Unequal Chances", "Expose the Hidden Bias"],
  },
  {
    topic: "Roller's Race",
    purpose: "Use all two-dice combinations to explain why grouped outcomes may have different chances.",
    curriculum: ["AC9M5P01"],
    lessons: ["Two Dice, Many Pairs", "Differences Are Not Equal", "Repair the Race"],
  },
  {
    topic: "Relative Frequency",
    purpose: "Run repeated experiments and describe outcome frequencies as fractions of all trials.",
    curriculum: ["AC9M5P02"],
    lessons: ["Run and Record", "Frequency as a Fraction", "Compare Trial Runs"],
  },
  {
    topic: "Evidence and Likelihood",
    purpose: "Use chance-tool design and experimental frequency to estimate and compare likelihoods.",
    curriculum: ["AC9M5P01", "AC9M5P02"],
    lessons: ["Predict From the Design", "Estimate From Results", "Fair or Loaded?"],
  },
  {
    topic: "Roller's Grand Trial",
    purpose: "Plan, run and explain a repeated chance investigation using frequency evidence.",
    curriculum: ["AC9M5P01", "AC9M5P02"],
    lessons: ["Plan the Investigation", "Run the Investigation", "Defend the Verdict"],
  },
];

const LEVEL_6_SEEDS: readonly ChanceWeekSeed[] = [
  {
    topic: "Probability Scales",
    purpose: "Represent and estimate probability from zero to one and zero to one hundred percent.",
    curriculum: ["AC9M6P01"],
    lessons: ["Calibrate the Scale", "Three Forms, One Chance", "Estimate the Event"],
  },
  {
    topic: "Calculate Probability",
    purpose: "Calculate probabilities and build chance tools with a target probability.",
    curriculum: ["AC9M6P01"],
    lessons: ["Count the Winning Outcomes", "Complete the Whole", "Build the Probability"],
  },
  {
    topic: "Expected and Observed",
    purpose: "Compare expected frequencies with observed results from repeated simulations.",
    curriculum: ["AC9M6P02"],
    lessons: ["Predict the Frequency", "Expected Versus Observed", "Explain the Difference"],
  },
  {
    topic: "Trial-Size Effect",
    purpose: "Investigate how increasing trial counts affects variation in relative frequency.",
    curriculum: ["AC9M6P02"],
    lessons: ["Climb the Trial Ladder", "Convergence Chase", "Survive the Variation Storm"],
  },
  {
    topic: "Simulation Engineering",
    purpose: "Select, debug and audit digital simulations for probability investigations.",
    curriculum: ["AC9M6P01", "AC9M6P02"],
    lessons: ["Choose the Simulator", "Debug Chanzia's Machine", "Probability Audit"],
  },
  {
    topic: "Master's Grand Trial",
    purpose: "Plan, run and defend a probability investigation using expected and observed evidence.",
    curriculum: ["AC9M6P01", "AC9M6P02"],
    lessons: ["Plan the Investigation", "Run the Investigation", "Challenge Chanzia Master"],
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
    case "Choose the Outcome Lens":
      return "list outcomes that match the question being asked.";
    case "List Every Outcome":
      return "list every possible outcome once.";
    case "Equally Likely or Not?":
      return "decide whether all outcomes have the same chance.";
    case "Equal Regions, Equal Chances":
      return "connect equal regions and counts to equal chances.";
    case "Unequal Regions, Unequal Chances":
      return "explain how unequal regions or counts change chance.";
    case "Expose the Hidden Bias":
      return "use outcome counts to find a hidden advantage.";
    case "Two Dice, Many Pairs":
      return "organise all possible outcomes for two dice.";
    case "Differences Are Not Equal":
      return "compare how often different two-dice differences can occur.";
    case "Repair the Race":
      return "change race rules so both players have equal chances.";
    case "Frequency as a Fraction":
      return "write an outcome frequency as a fraction of all trials.";
    case "Compare Trial Runs":
      return "compare frequencies from repeated trials.";
    case "Predict From the Design":
      return "estimate likelihood by inspecting a chance tool.";
    case "Estimate From Results":
      return "use recorded frequencies to estimate likelihood.";
    case "Fair or Loaded?":
      return "use results to judge whether a tool may be biased.";
    case "Plan the Investigation":
      return "plan a fair repeated chance investigation.";
    case "Run the Investigation":
      return "run an investigation and record every result.";
    case "Defend the Verdict":
      return "use frequency evidence to defend a probability conclusion.";
    case "Calibrate the Scale":
      return "place probabilities on scales from zero to one.";
    case "Three Forms, One Chance":
      return "connect equivalent fractions, decimals and percentages.";
    case "Estimate the Event":
      return "estimate an event's probability from useful information.";
    case "Count the Winning Outcomes":
      return "calculate probability from winning and total outcomes.";
    case "Complete the Whole":
      return "use complements to complete one whole probability.";
    case "Build the Probability":
      return "build a chance tool with a target probability.";
    case "Predict the Frequency":
      return "predict an expected frequency before running trials.";
    case "Expected Versus Observed":
      return "compare expected and observed frequencies.";
    case "Explain the Difference":
      return "explain variation without assuming a tool is biased.";
    case "Climb the Trial Ladder":
      return "compare variation across increasing trial counts.";
    case "Convergence Chase":
      return "track relative frequency as more trials are run.";
    case "Survive the Variation Storm":
      return "draw careful conclusions about larger samples.";
    case "Choose the Simulator":
      return "choose a simulation that matches a chance event.";
    case "Debug Chanzia's Machine":
      return "repair errors in a probability simulation.";
    case "Probability Audit":
      return "check outcomes and probabilities form one whole.";
    case "Challenge Chanzia Master":
      return "defend a complete probability investigation.";
    default:
      return seed.purpose.toLowerCase();
  }
}

function buildChanceProgram(level: 3 | 4 | 5 | 6, seeds: readonly ChanceWeekSeed[]): WeekPlan[] {
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

export const CHANCE_HOLLOW_PROGRAMS: Record<3 | 4 | 5 | 6, WeekPlan[]> = {
  3: buildChanceProgram(3, LEVEL_3_SEEDS),
  4: buildChanceProgram(4, LEVEL_4_SEEDS),
  5: buildChanceProgram(5, LEVEL_5_SEEDS),
  6: buildChanceProgram(6, LEVEL_6_SEEDS),
};

export function getChanceHollowProgramForYearLabel(yearLabel: string): WeekPlan[] | null {
  if (yearLabel === "Year 3") return CHANCE_HOLLOW_PROGRAMS[3];
  if (yearLabel === "Year 4") return CHANCE_HOLLOW_PROGRAMS[4];
  if (yearLabel === "Year 5") return CHANCE_HOLLOW_PROGRAMS[5];
  if (yearLabel === "Year 6") return CHANCE_HOLLOW_PROGRAMS[6];
  return null;
}

export const CHANCE_HOLLOW_META = {
  realm: "Chance Hollow",
  strand: "Probability",
  levels: [3, 4, 5, 6] as const,
  weeks: 6,
  lessonsPerWeek: 3,
  curriculum: {
    3: ["AC9M3P01", "AC9M3P02"],
    4: ["AC9M4P01"],
    5: ["AC9M5P01", "AC9M5P02"],
    6: ["AC9M6P01", "AC9M6P02"],
  },
  outcome: "Students represent probability, compare expected and observed frequencies, and investigate variation with digital simulations.",
} as const;
