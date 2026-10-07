import {
  random,
  rounded,
  table,
  type LessonFactory,
  type QuestionDraft,
} from "./shared";
const cases = [
  "travel to school",
  "lunchtime activities",
  "library use",
  "homework time",
  "school lunch preferences",
  "sports participation",
];
export const statisticsLessons: LessonFactory[] = [
  (seed) => {
    const r = random(seed),
      n = r(3, 12) * 100,
      m = r(2, 10) * 10;
    return {
      prompt: `A school has ${n} students and asks ${m} about ${cases[seed % cases.length]}. Is this a census or sample?`,
      answer: "Sample",
      steps: [
        "A census collects data from the whole population.",
        "Only part of this school was asked, so this is a sample.",
      ],
    };
  },
  (seed) => {
    const r = random(seed),
      n = r(10, 40),
      experiment = seed % 2 === 0;
    return {
      prompt: experiment
        ? `${n} plants are randomly given different water amounts. Is this an experiment or observation?`
        : `The heights of ${n} existing trees are recorded without changing their conditions. Is this an experiment or observation?`,
      answer: experiment ? "Experiment" : "Observation",
      steps: [
        experiment
          ? "A treatment is deliberately changed."
          : "Conditions are recorded without intervention.",
        experiment ? "This is an experiment." : "This is observational data.",
      ],
    };
  },
  (seed) => {
    const r = random(seed),
      n = r(100, 400),
      seconds = r(2, 9) * 10;
    return {
      prompt: `Surveying one person takes ${seconds} seconds. How many minutes would a census of ${n} people take? Round to 2 decimal places.`,
      answer: rounded((n * seconds) / 60),
      unit: "min",
      steps: [
        `Total seconds: ${n} × ${seconds} = ${n * seconds}.`,
        "Divide by 60; round to 2 decimal places if needed.",
      ],
    };
  },
  (seed) => {
    const n = random(seed)(20, 60);
    return {
      prompt: `Which method best gives every student a chance of selection for a sample of ${n}?`,
      answer: "Randomly draw from the complete student list",
      choices: [
        "Randomly draw from the complete student list",
        "Ask only friends",
        "Ask only the sports team",
        "Ask the first students arriving",
      ],
      steps: [
        "Start with a list of the entire target population.",
        "Random selection avoids deliberately favouring one group.",
      ],
    };
  },
  (seed) => {
    const n = random(seed)(10, 60);
    return {
      prompt: `To estimate school sports participation, ${n} sports-team members are surveyed. What type of bias is the main problem? Type selection or measurement.`,
      answer: "Selection",
      steps: [
        "Sports-team members are more likely to participate in sport.",
        "The selected group does not fairly represent the whole school.",
      ],
    };
  },
  (seed) => {
    const n = random(seed)(20, 90);
    return {
      prompt: `A length is recorded as ${n} cm to the nearest centimetre. What is the largest rounding error in cm?`,
      answer: 0.5,
      unit: "cm",
      steps: [
        "The rounding interval has width 1 cm.",
        "Half of one centimetre is 0.5 cm.",
      ],
    };
  },
  (seed) => {
    const n = random(seed)(20, 80),
      primary = seed % 2 === 0;
    return {
      prompt: primary
        ? `You collect ${n} responses yourself. Is this a primary or secondary source for you?`
        : `You use a published report containing ${n} responses collected by someone else. Is this primary or secondary data for you?`,
      answer: primary ? "Primary" : "Secondary",
      steps: [
        primary
          ? "You collected the original data for this investigation."
          : "You are reusing data collected by another investigator.",
      ],
    };
  },
  (seed) => {
    const n = random(seed)(10, 60);
    return {
      prompt: `A survey link accepts the first ${n} volunteers. Is this a random or non-random sample?`,
      answer: "Non-random",
      steps: [
        "People decide for themselves whether to respond.",
        "Volunteers may differ from non-responders; selection is not random.",
      ],
    };
  },
  (seed) => {
    const r = random(seed),
      a = r(4, 12),
      b = r(4, 12);
    return {
      prompt: `A school has ${a} classes of ${b * 5} students. Sample 5 randomly from each class. How many students are sampled?`,
      answer: a * 5,
      steps: [
        `Each of ${a} classes contributes 5 students.`,
        `Total = ${a * 5}. Sampling within every class improves representation.`,
      ],
    };
  },
  (seed) => dataTask(seed, "frequency"),
  (seed) => dataTask(seed, "range"),
  (seed) => dataTask(seed, "median"),
  (seed) => samples(seed, "means"),
  (seed) => samples(seed, "proportions"),
  (seed) => samples(seed, "estimate"),
  (seed) => {
    const r = random(seed),
      size = r(10, 30),
      runs = r(5, 20);
    return {
      prompt: `A simulation takes ${runs} independent samples of ${size} people, replacing them between samples. How many selections does it record?`,
      answer: runs * size,
      steps: [
        `Each run records ${size} selections.`,
        `${runs} × ${size} = ${runs * size}. Individuals can appear in more than one run.`,
      ],
    };
  },
  (seed) => {
    const r = random(seed),
      a = r(20, 35),
      b = r(2, 8);
    return {
      prompt: "Which set of estimates varies less? Enter A or B.",
      answer: "B",
      steps: [
        `A ranges over ${a * 2} percentage points.`,
        `B ranges over ${b * 2} percentage points.`,
        "The smaller range indicates less variation in these runs.",
      ],
      visual: table(
        "Repeated estimates (%)",
        ["Batch", "Run 1", "Run 2", "Run 3"],
        [
          ["A", 50 - a, 50, 50 + a],
          ["B", 50 - b, 50, 50 + b],
        ],
      ),
    };
  },
  (seed) => {
    const n = random(seed)(20, 80);
    return {
      prompt: `${n}% of a random sample chose cycling. Must exactly ${n}% of the population choose cycling? Type yes or no.`,
      answer: "No",
      steps: [
        "Random samples vary.",
        "The sample percentage is an estimate, not an exact population result.",
      ],
    };
  },
  (seed) => {
    const r = random(seed),
      n = r(3, 8),
      mean = r(10, 30),
      added = r(1, 8);
    return {
      prompt: `A dataset has mean ${mean}. Add ${added} to each of its ${n} values. What is the new mean?`,
      answer: mean + added,
      steps: [
        `Adding ${added} to every value adds ${added} to the mean.`,
        `New mean = ${mean + added}.`,
      ],
    };
  },
  (seed) => dataTask(seed, "outlier"),
  (seed) => dataTask(seed, "summary"),
  (seed) => {
    const n = random(seed)(3, 12);
    return {
      prompt: `An investigation asks how all ${n * 100} students at one school travel there. What is the population size?`,
      answer: n * 100,
      steps: [
        "The population includes every student the question is about.",
        `That is all ${n * 100} students, not just those sampled.`,
      ],
    };
  },
  (seed) => {
    const n = random(seed)(20, 80);
    return {
      prompt: `A survey of ${n} students asks about travel to school. Which information should be omitted because it is unnecessary?`,
      answer: "Home address",
      choices: [
        "Home address",
        "Travel method",
        "Travel time in minutes",
        "Whether the journey was today",
      ],
      steps: [
        "Collect only information needed for the investigation.",
        "Exact home addresses are unnecessary for summarising methods and travel times.",
      ],
    };
  },
  (seed) => {
    const n = random(seed)(3, 12);
    return {
      prompt: `Record travel times for ${n} students. Which unit makes the data directly comparable?`,
      answer: "Minutes for every student",
      choices: [
        "Minutes for every student",
        "Any unit without labels",
        "Words such as short or long only",
        "Different unlabeled units",
      ],
      steps: [
        "Use the same defined unit for every observation.",
        "Minutes provide a consistent numerical measure.",
      ],
    };
  },
  (seed) => dataTask(seed, "frequency"),
  (seed) => dataTask(seed, "mean"),
  (seed) => samples(seed, "estimate"),
  (seed) => {
    const n = random(seed)(15, 70);
    return {
      prompt: `An online survey of ${n} volunteers claims to represent everyone. Which limitation should the report state?`,
      answer: "Volunteers may differ from non-responders",
      choices: [
        "Volunteers may differ from non-responders",
        "A sample always equals the population",
        "All online data must be false",
        "A larger sample eliminates every bias",
      ],
      steps: [
        "Voluntary response can create selection bias.",
        "The conclusion should acknowledge who might be missing.",
      ],
    };
  },
  (seed) => samples(seed, "proportions"),
  (seed) => samples(seed, "estimate"),
];
function dataTask(seed: number, mode: string): QuestionDraft {
  const r = random(seed),
    a = r(5, 20),
    values = [a, a + 1, a + 2, a + 2, a + 5],
    sum = values.reduce((x, y) => x + y, 0);
  const visual = {
    kind: "data" as const,
    title: "Recorded times",
    values,
    unit: "minutes",
  };
  if (mode === "frequency")
    return {
      prompt: `How often does ${a + 2} occur?`,
      answer: 2,
      steps: [`${a + 2} appears twice; its frequency is 2.`],
      visual,
    };
  if (mode === "range")
    return {
      prompt: "What is the range?",
      answer: 5,
      unit: "min",
      steps: [`Maximum ${a + 5} − minimum ${a} = 5.`],
      visual,
    };
  if (mode === "median")
    return {
      prompt: "What is the median?",
      answer: a + 2,
      unit: "min",
      steps: [
        "The five values are already ordered.",
        `The third value is ${a + 2}.`,
      ],
      visual,
    };
  if (mode === "outlier")
    return {
      prompt: `Replace the largest value with ${a + 50}. What is the new median?`,
      answer: a + 2,
      unit: "min",
      steps: [
        "The middle position does not change.",
        `The median remains ${a + 2}; an extreme value affects the mean more.`,
      ],
      visual,
    };
  if (mode === "summary")
    return {
      prompt: `A single very large outlier is added. Which is usually more resistant: mean or median?`,
      answer: "Median",
      steps: [
        "The mean uses every magnitude.",
        "The median depends on the middle position, so it is usually more resistant.",
      ],
      visual,
    };
  return {
    prompt: "What is the mean?",
    answer: sum / 5,
    unit: "min",
    steps: [`Sum = ${sum}.`, `Divide by 5 values: ${sum / 5}.`],
    visual,
  };
}
function samples(seed: number, mode: string): QuestionDraft {
  const r = random(seed),
    n = r(3, 12) * 10,
    a = r(1, n - 1),
    population = n * r(5, 20);
  if (mode === "means") {
    const m = r(10, 30),
      d = r(1, 7);
    return {
      prompt: "How much higher is sample B’s mean than sample A’s mean?",
      answer: d,
      steps: [
        `Subtract the sample means: ${m + d} − ${m} = ${d}.`,
        "Equal sample sizes can still give different estimates.",
      ],
      visual: table(
        "Random samples",
        ["Sample", "Size", "Mean"],
        [
          ["A", n, m],
          ["B", n, m + d],
        ],
      ),
    };
  }
  return {
    prompt:
      mode === "estimate"
        ? `${a} of ${n} sampled students cycle. Estimate how many of ${population} students cycle.`
        : `${a} of ${n} sampled students cycle. What percentage is this? Round to 2 decimal places.`,
    answer: mode === "estimate" ? (population * a) / n : rounded((100 * a) / n),
    unit: mode === "estimate" ? "students" : "%",
    steps: [
      `Sample proportion = ${a}/${n}.`,
      mode === "estimate"
        ? `Multiply by population ${population}: ${(population * a) / n}. This is an estimate.`
        : `Multiply by 100: ${rounded((100 * a) / n)}%.`,
    ],
  };
}
