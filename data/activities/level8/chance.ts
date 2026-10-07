import {
  fraction,
  random,
  rounded,
  table,
  type LessonFactory,
  type QuestionDraft,
} from "./shared";
export const chanceLessons: LessonFactory[] = [
  (seed) => {
    const n = random(seed)(2, 10);
    return {
      prompt: `Cards are numbered 1 to ${n}. Event A is drawing ${n}. How many cards belong to “not A”?`,
      answer: n - 1,
      steps: [
        "The complement contains every outcome outside A.",
        `${n} − 1 = ${n - 1} cards.`,
      ],
      visual: table(
        "Cards",
        ["Numbers"],
        [Array.from({ length: n }, (_, i) => i + 1).join(", ")].map((s) => [s]),
      ),
    };
  },
  (seed) => complement(seed, false),
  (seed) => complement(seed, true),
  (seed) => complement(seed, false),
  (seed) => {
    const r = random(seed),
      red = r(2, 10),
      blue = r(2, 10),
      green = r(2, 10);
    return {
      prompt:
        "One counter is chosen at random. What is the probability it is not red?",
      answer: fraction(blue + green, red + blue + green),
      steps: [
        `Not red means blue or green: ${blue + green} counters.`,
        `Divide by all ${red + blue + green} counters.`,
      ],
      visual: table(
        "Bag contents",
        ["Colour", "Number"],
        [
          ["Red", red],
          ["Blue", blue],
          ["Green", green],
        ],
      ),
    };
  },
  (seed) => {
    const n = random(seed)(2, 12);
    return {
      prompt: `A fair ${n}-section spinner has one section marked “stop”. What is the chance of not stopping?`,
      answer: fraction(n - 1, n),
      steps: [
        `P(stop) = 1/${n}.`,
        `P(not stop) = 1 − 1/${n} = ${fraction(n - 1, n)}.`,
      ],
    };
  },
  (seed) => {
    const r = random(seed),
      a = r(2, 8),
      b = r(2, 8);
    return {
      prompt: `Spinner A lands on ${a}, then spinner B on ${b}. Write the ordered pair A, B.`,
      answer: `${a}, ${b}`,
      input: "list",
      labels: ["Spinner A", "Spinner B"],
      steps: [
        "Keep the order of the events.",
        `First A = ${a}, then B = ${b}.`,
      ],
    };
  },
  (seed) => outcomes(seed, false),
  (seed) => outcomes(seed, true),
  (seed) => twoWay(seed, "missing"),
  (seed) => twoWay(seed, "total"),
  (seed) => twoWay(seed, "probability"),
  (seed) => {
    const r = random(seed),
      a = r(2, 6),
      b = r(2, 6);
    return {
      prompt: `A tree has ${a} first-stage branches. Each has ${b} second-stage branches. How many complete paths are there?`,
      answer: a * b,
      steps: [
        `Every first branch joins ${b} second branches.`,
        `${a} × ${b} = ${a * b} paths.`,
      ],
      visual: table(
        "Tree stages",
        ["Stage", "Choices"],
        [
          ["First", a],
          ["Second, for each first result", b],
        ],
      ),
    };
  },
  (seed) => outcomes(seed, false),
  (seed) => {
    const r = random(seed),
      a = r(2, 6),
      b = r(2, 6);
    return {
      prompt: `Spin a fair ${a}-section spinner and a fair ${b}-section spinner independently. What is the probability of one specified ordered pair?`,
      answer: fraction(1, a * b),
      steps: [
        `There are ${a * b} equally likely ordered pairs.`,
        "Exactly one is the specified pair.",
      ],
    };
  },
  (seed) => venn(seed, "both"),
  (seed) => venn(seed, "either"),
  (seed) => venn(seed, "probability"),
  (seed) => venn(seed, "and"),
  (seed) => venn(seed, "exclusive"),
  (seed) => {
    const r = random(seed),
      a = r(2, 6),
      b = r(2, 6);
    return {
      prompt: `Two independent fair spinners have ${a} and ${b} equally sized sections. Each has one red section. What is the chance of at least one red?`,
      answer: fraction(a * b - (a - 1) * (b - 1), a * b),
      steps: [
        `P(no red) = ${a - 1}/${a} × ${b - 1}/${b}.`,
        "Subtract this from 1 to include one red or two reds.",
      ],
    };
  },
  (seed) => {
    const n = random(seed)(2, 10);
    return {
      prompt: `To simulate a fair ${n}-section spinner, generate equally likely integers from 1 to which number?`,
      answer: n,
      steps: [
        `Use one equally likely integer for each of the ${n} sections.`,
        "Generate a fresh independent value for each new spin.",
      ],
    };
  },
  (seed) => trials(seed, "count"),
  (seed) => trials(seed, "probability"),
  (seed) => {
    const r = random(seed),
      a = r(2, 6),
      b = r(2, 6),
      n = a * b * r(5, 30);
    return {
      prompt: `A compound event has probability 1/${a * b}. In ${n} independent trials, how many successes are expected?`,
      answer: n / (a * b),
      steps: [
        "Expected frequency = trials × theoretical probability.",
        `${n} × 1/${a * b} = ${n / (a * b)}. This is a prediction, not a guarantee.`,
      ],
    };
  },
  (seed) => {
    const r = random(seed),
      small = r(2, 8),
      large = r(45, 55);
    return {
      prompt:
        "The theoretical probability is 0.5. Which batch has experimental probability closer to 0.5? Enter A, B or Equal.",
      answer:
        Math.abs(small / 10 - 0.5) < Math.abs(large / 100 - 0.5)
          ? "A"
          : Math.abs(small / 10 - 0.5) > Math.abs(large / 100 - 0.5)
            ? "B"
            : "Equal",
      steps: [
        `Batch A: ${small}/10 = ${small / 10}.`,
        `Batch B: ${large}/100 = ${large / 100}.`,
        "Compare each distance from 0.5; enter Equal for a tie.",
      ],
      visual: table(
        "Observed batches — enter Equal if tied",
        ["Batch", "Successes", "Trials"],
        [
          ["A", small, 10],
          ["B", large, 100],
        ],
      ),
    };
  },
  (seed) => {
    const n = random(seed)(30, 70);
    return {
      prompt: `A fair coin gives ${n} heads in 100 tosses. What is the theoretical probability of heads on the next toss?`,
      answer: "1/2",
      steps: [
        "The coin remains fair and the next toss is independent.",
        "Earlier frequencies do not change its theoretical probability.",
      ],
    };
  },
  (seed) => twoWay(seed, "probability"),
  (seed) => venn(seed, "probability"),
  (seed) => trials(seed, "probability"),
];
function complement(seed: number, decimal: boolean): QuestionDraft {
  const r = random(seed),
    d = r(3, 20),
    n = r(1, d - 1),
    p = r(1, 99);
  return {
    prompt: decimal
      ? `P(A) = ${p / 100}. Find P(not A).`
      : `P(A) = ${n}/${d}. Find P(not A).`,
    answer: decimal ? rounded(1 - p / 100) : fraction(d - n, d),
    steps: [
      "An event and its complement have probabilities that sum to 1.",
      decimal
        ? `1 − ${p / 100} = ${rounded(1 - p / 100)}.`
        : `${d}/${d} − ${n}/${d} = ${fraction(d - n, d)}.`,
    ],
  };
}
function outcomes(seed: number, condition: boolean): QuestionDraft {
  const r = random(seed),
    a = r(2, 6),
    b = r(2, 6);
  return {
    prompt: condition
      ? "How many pairs have first result 1?"
      : "How many ordered pairs can these two spinners produce?",
    answer: condition ? b : a * b,
    steps: [
      `Pair each of the ${a} first results with each of the ${b} second results.`,
      condition
        ? `Fix the first result at 1: ${b} pairs remain.`
        : `${a} × ${b} = ${a * b} pairs.`,
    ],
    visual: table(
      "Spinner results",
      ["Spinner", "Possible results"],
      [
        ["First", Array.from({ length: a }, (_, i) => i + 1).join(", ")],
        ["Second", Array.from({ length: b }, (_, i) => i + 1).join(", ")],
      ],
    ),
  };
}
function twoWay(seed: number, mode: string): QuestionDraft {
  const r = random(seed),
    a = r(2, 20),
    b = r(2, 20),
    c = r(2, 20),
    d = r(2, 20),
    total = a + b + c + d;
  return {
    prompt:
      mode === "missing"
        ? "Find the missing number in the table."
        : mode === "total"
          ? "How many students play music?"
          : "One student is selected at random. What is the probability they play both music and sport?",
    answer:
      mode === "missing" ? a : mode === "total" ? a + c : fraction(a, total),
    steps:
      mode === "missing"
        ? [`Sport row: ${a + b} − ${b} = ${a}.`]
        : mode === "total"
          ? [`Add the Music column: ${a} + ${c} = ${a + c}.`]
          : [
              `Both: ${a} students. Total: ${total}.`,
              `Probability = ${fraction(a, total)}.`,
            ],
    visual: table(
      "Student activities",
      ["", "Music", "No music", "Total"],
      [
        ["Sport", mode === "missing" ? "?" : a, b, a + b],
        ["No sport", c, d, c + d],
        ["Total", a + c, b + d, total],
      ],
    ),
  };
}
function venn(seed: number, mode: string): QuestionDraft {
  const r = random(seed),
    a = r(2, 15),
    both = r(1, 10),
    b = r(2, 15),
    neither = r(2, 12),
    total = a + both + b + neither;
  const value =
    mode === "both" || mode === "and"
      ? both
      : mode === "exclusive"
        ? a + b
        : a + both + b;
  return {
    prompt:
      mode === "probability"
        ? "Choose one student at random. What is the probability they take at least one club?"
        : mode === "both" || mode === "and"
          ? "How many students take both clubs?"
          : mode === "exclusive"
            ? "How many take exactly one club?"
            : "How many take either club, including students taking both?",
    answer: mode === "probability" ? fraction(value, total) : value,
    steps: [
      mode === "both" || mode === "and"
        ? "Both means the overlap."
        : mode === "exclusive"
          ? "Exactly one excludes the overlap."
          : "Either means every region in at least one set; count the overlap once.",
      mode === "probability"
        ? `Favourable ${value}, total ${total}: ${fraction(value, total)}.`
        : `The required count is ${value}.`,
    ],
    visual: table(
      "Two clubs — disjoint region counts",
      ["Region", "Students"],
      [
        ["Art only", a],
        ["Both Art and Music", both],
        ["Music only", b],
        ["Neither", neither],
      ],
    ),
  };
}
function trials(seed: number, mode: string): QuestionDraft {
  const r = random(seed),
    hh = r(1, 30),
    ht = r(1, 30),
    th = r(1, 30),
    tt = r(1, 30),
    total = hh + ht + th + tt;
  return {
    prompt:
      mode === "count"
        ? "How many trials were recorded?"
        : "What is the experimental probability of exactly one head?",
    answer: mode === "count" ? total : fraction(ht + th, total),
    steps:
      mode === "count"
        ? [`Add all frequencies: ${total}.`]
        : [
            `Exactly one head: HT or TH, ${ht + th} trials.`,
            `Divide by ${total}: ${fraction(ht + th, total)}.`,
          ],
    visual: table(
      "Two-coin experiment",
      ["Outcome", "Frequency"],
      [
        ["HH", hh],
        ["HT", ht],
        ["TH", th],
        ["TT", tt],
      ],
    ),
  };
}
