export type Question = {
  id: string;
  type?: string;
  prompt: string;
  options?: unknown[];
  correctAnswer: string;
  answer?: unknown;
  answerOptionId?: string;
  skillId?: string;
  skillLabel?: string;
  linkedWeeks?: number[];
  linkedLessons?: number[];
  strand?: string;
  difficultyBand?: string;
  visual?: unknown;
};

export type PostTest = {
  yearLabel: string;
  questions: Question[];
};

const YEAR1_POSTTEST_QUESTIONS: Question[] = [
  {
    id: "y1-pt-01",
    prompt: "Which number is 48?",
    options: ["38", "48", "58", "84"],
    correctAnswer: "48",
  },
  {
    id: "y1-pt-02",
    prompt: "What number comes after 79?",
    options: ["78", "80", "81", "89"],
    correctAnswer: "80",
  },
  {
    id: "y1-pt-03",
    prompt: "Put these numbers in order from smallest to largest: 23, 17, 41",
    options: ["17, 23, 41", "23, 17, 41", "41, 23, 17", "17, 41, 23"],
    correctAnswer: "17, 23, 41",
  },
  {
    id: "y1-pt-04",
    prompt: "Which is the largest number?",
    options: ["64", "46", "56", "36"],
    correctAnswer: "64",
  },
  {
    id: "y1-pt-05",
    prompt: "How many tens and ones are in 73?",
    options: ["7 tens and 3 ones", "3 tens and 7 ones", "73 tens and 0 ones", "6 tens and 13 ones"],
    correctAnswer: "7 tens and 3 ones",
  },
  {
    id: "y1-pt-06",
    prompt: "Which shows 45 in expanded form?",
    options: ["40 + 5", "4 + 5", "30 + 15", "50 - 10"],
    correctAnswer: "40 + 5",
  },
  {
    id: "y1-pt-07",
    prompt: "Skip count by 2s: 2, 4, 6, __, 10",
    options: ["7", "8", "9", "12"],
    correctAnswer: "8",
  },
  {
    id: "y1-pt-08",
    prompt: "Skip count by 5s: 5, 10, 15, __",
    options: ["18", "20", "25", "30"],
    correctAnswer: "20",
  },
  {
    id: "y1-pt-09",
    prompt: "Which number is odd?",
    options: ["24", "36", "51", "68"],
    correctAnswer: "51",
  },
  {
    id: "y1-pt-10",
    prompt: "What is 9 + 6?",
    options: ["14", "15", "16", "17"],
    correctAnswer: "15",
  },
  {
    id: "y1-pt-11",
    prompt: "What is 13 + 5?",
    options: ["17", "18", "19", "20"],
    correctAnswer: "18",
  },
  {
    id: "y1-pt-12",
    prompt: "What is 16 - 7?",
    options: ["8", "9", "10", "11"],
    correctAnswer: "9",
  },
  {
    id: "y1-pt-13",
    prompt: "What number makes this true: 6 + __ = 14?",
    options: ["6", "7", "8", "9"],
    correctAnswer: "8",
  },
  {
    id: "y1-pt-14",
    prompt: "You have $5. You spend $2. How much money is left?",
    options: ["$1", "$2", "$3", "$7"],
    correctAnswer: "$3",
  },
  {
    id: "y1-pt-15",
    prompt: "Which coins make $1.00 exactly?",
    options: [
      "50c + 20c + 20c + 10c",
      "50c + 20c + 20c + 5c",
      "20c + 20c + 20c + 20c",
      "50c + 50c + 20c",
    ],
    correctAnswer: "50c + 20c + 20c + 10c",
  },
  {
    id: "y1-pt-16",
    prompt: "What multiplication sentence matches 3 groups of 2?",
    options: ["3 + 2", "2 + 2 + 2", "3 × 2", "2 × 2"],
    correctAnswer: "3 × 2",
  },
  {
    id: "y1-pt-17",
    prompt: "What is 4 × 2?",
    options: ["6", "8", "10", "12"],
    correctAnswer: "8",
  },
  {
    id: "y1-pt-18",
    prompt: "Share 12 counters between 3 friends. How many does each friend get?",
    options: ["2", "3", "4", "6"],
    correctAnswer: "4",
  },
  {
    id: "y1-pt-19",
    prompt: "How many groups of 5 are in 15?",
    options: ["2", "3", "4", "5"],
    correctAnswer: "3",
  },
  {
    id: "y1-pt-20",
    prompt: "Which number sentence matches this story: There are 7 birds in one tree and 5 birds in another tree. How many birds altogether?",
    options: ["7 - 5", "7 + 5", "5 + 5", "12 - 7"],
    correctAnswer: "7 + 5",
  },
];

const YEAR2_POSTTEST_QUESTIONS: Question[] = [
  { id: "y2-pt-01", prompt: "Write this number in digits: Seven hundred and thirty-two", options: ["723", "732", "372", "237"], correctAnswer: "732" },
  { id: "y2-pt-02", prompt: "What is the value of 4 in 546?", options: ["4", "40", "400", "46"], correctAnswer: "40" },
  { id: "y2-pt-03", prompt: "Expand this number: 382", options: ["300 + 80 + 2", "380 + 2", "3 + 8 + 2", "30 + 80 + 2"], correctAnswer: "300 + 80 + 2" },
  { id: "y2-pt-04", prompt: "What number comes before 600?", options: ["601", "599", "500", "610"], correctAnswer: "599" },
  { id: "y2-pt-05", prompt: "What number is 10 more than 215?", options: ["216", "220", "225", "315"], correctAnswer: "225" },
  { id: "y2-pt-06", prompt: "Is 274 odd or even?", options: ["Odd", "Even"], correctAnswer: "Even" },
  { id: "y2-pt-07", prompt: "Circle the odd number: 108, 207, 402", options: ["108", "207", "402"], correctAnswer: "207" },
  { id: "y2-pt-08", prompt: "Put in order from smallest to largest: 145, 451, 154", options: ["145, 154, 451", "154, 145, 451", "451, 154, 145", "145, 451, 154"], correctAnswer: "145, 154, 451" },
  { id: "y2-pt-09", prompt: "What is halfway between 100 and 200?", options: ["125", "140", "150", "175"], correctAnswer: "150" },
  { id: "y2-pt-10", prompt: "Round 178 to the nearest 10", options: ["170", "180", "200", "175"], correctAnswer: "180" },
  { id: "y2-pt-11", prompt: "Solve: 54 + 29", options: ["73", "83", "93", "82"], correctAnswer: "83" },
  { id: "y2-pt-12", prompt: "Solve: 47 + 30", options: ["50", "67", "77", "80"], correctAnswer: "77" },
  { id: "y2-pt-13", prompt: "Which is a related fact to 6 + 3 = 9?", options: ["6 − 3 = 3", "9 − 6 = 3", "3 + 9 = 12", "9 + 3 = 12"], correctAnswer: "9 − 6 = 3" },
  { id: "y2-pt-14", prompt: "Solve: 83 − 40", options: ["40", "43", "53", "33"], correctAnswer: "43" },
  { id: "y2-pt-15", prompt: "What multiplication sentence matches 3 groups of 5?", options: ["5 × 3", "3 × 5", "3 + 5", "5 + 5 + 5"], correctAnswer: "3 × 5" },
  { id: "y2-pt-16", prompt: "Solve: 4 × 2", options: ["6", "8", "10", "2"], correctAnswer: "8" },
  { id: "y2-pt-17", prompt: "What is 5 more than 3 tens?", options: ["15", "35", "53", "8"], correctAnswer: "35" },
  { id: "y2-pt-18", prompt: "What is 60 + 30?", options: ["80", "90", "93", "63"], correctAnswer: "90" },
  { id: "y2-pt-19", prompt: "Solve: 12 ÷ 3", options: ["3", "4", "6", "9"], correctAnswer: "4" },
  { id: "y2-pt-20", prompt: "Solve: 10 ÷ 2", options: ["2", "3", "5", "8"], correctAnswer: "5" },
];

const strandYear4 = "Number";
const difficultyYear4 = "year4";
const strandYear5 = "Number";
const difficultyYear5 = "year5";

function buildPostMcqQuestion(
  id: string,
  prompt: string,
  options: string[],
  correctAnswer: string,
  skillId: string,
  skillLabel: string,
  linkedWeeks: number[],
  strand: string,
  difficultyBand: string,
  linkedLessons: number[] = [1, 2, 3]
): Question {
  return {
    id,
    type: "mcq",
    prompt,
    options,
    correctAnswer,
    answer: correctAnswer,
    skillId,
    skillLabel,
    linkedWeeks,
    linkedLessons,
    strand,
    difficultyBand,
  };
}

function buildPostNumericQuestion(
  id: string,
  prompt: string,
  correctAnswer: string,
  skillId: string,
  skillLabel: string,
  linkedWeeks: number[],
  strand: string,
  difficultyBand: string,
  linkedLessons: number[] = [1, 2, 3]
): Question {
  return {
    id,
    type: "numeric",
    prompt,
    correctAnswer,
    answer: correctAnswer,
    skillId,
    skillLabel,
    linkedWeeks,
    linkedLessons,
    strand,
    difficultyBand,
  };
}

const YEAR4_POSTTEST_QUESTIONS: Question[] = [
  buildPostMcqQuestion(
    "y4-pt-01",
    "What is the value of 8 in 28,431?",
    ["8", "80", "800", "8,000"],
    "8,000",
    "place_value_rounding",
    "Place Value & Rounding",
    [1, 2],
    strandYear4,
    difficultyYear4
  ),
  buildPostNumericQuestion(
    "y4-pt-02",
    "What is 1,000 more than 6,725?",
    "7725",
    "place_value_rounding",
    "Place Value & Rounding",
    [1, 2],
    strandYear4,
    difficultyYear4
  ),
  buildPostMcqQuestion(
    "y4-pt-03",
    "Round 52,481 to the nearest 1,000.",
    ["52,000", "52,400", "52,500", "53,000"],
    "52,000",
    "place_value_rounding",
    "Place Value & Rounding",
    [1, 3],
    strandYear4,
    difficultyYear4
  ),
  buildPostNumericQuestion(
    "y4-pt-04",
    "What is 100 less than 9,002?",
    "8902",
    "place_value_rounding",
    "Place Value & Rounding",
    [1, 3],
    strandYear4,
    difficultyYear4
  ),
  buildPostNumericQuestion(
    "y4-pt-05",
    "4,587 + 368 =",
    "4955",
    "addition_subtraction",
    "Addition & Subtraction",
    [2, 3, 12],
    strandYear4,
    difficultyYear4
  ),
  buildPostNumericQuestion(
    "y4-pt-06",
    "8,401 - 299 =",
    "8102",
    "addition_subtraction",
    "Addition & Subtraction",
    [2, 3, 12],
    strandYear4,
    difficultyYear4
  ),
  buildPostMcqQuestion(
    "y4-pt-07",
    "What is 6,000 - 2,998?",
    ["2,998", "3,002", "3,102", "4,002"],
    "3,002",
    "addition_subtraction",
    "Addition & Subtraction",
    [2, 3, 12],
    strandYear4,
    difficultyYear4
  ),
  buildPostNumericQuestion(
    "y4-pt-08",
    "7,250 - 475 =",
    "6775",
    "addition_subtraction",
    "Addition & Subtraction",
    [2, 3, 12],
    strandYear4,
    difficultyYear4
  ),
  buildPostNumericQuestion(
    "y4-pt-09",
    "36 × 7 =",
    "252",
    "multiplication_division",
    "Multiplication & Division",
    [5, 6, 12],
    strandYear4,
    difficultyYear4
  ),
  buildPostNumericQuestion(
    "y4-pt-10",
    "945 ÷ 9 =",
    "105",
    "multiplication_division",
    "Multiplication & Division",
    [5, 6, 12],
    strandYear4,
    difficultyYear4
  ),
  buildPostMcqQuestion(
    "y4-pt-11",
    "What is 125 × 4?",
    ["250", "375", "500", "625"],
    "500",
    "multiplication_division",
    "Multiplication & Division",
    [5, 6, 12],
    strandYear4,
    difficultyYear4
  ),
  buildPostNumericQuestion(
    "y4-pt-12",
    "924 ÷ 7 =",
    "132",
    "multiplication_division",
    "Multiplication & Division",
    [5, 6, 12],
    strandYear4,
    difficultyYear4
  ),
  buildPostMcqQuestion(
    "y4-pt-13",
    "Which number is a multiple of 8?",
    ["42", "48", "54", "58"],
    "48",
    "factors_multiples",
    "Factors, Multiples & Divisibility",
    [4],
    strandYear4,
    difficultyYear4
  ),
  buildPostMcqQuestion(
    "y4-pt-14",
    "Which number is NOT divisible by 3?",
    ["33", "45", "52", "81"],
    "52",
    "factors_multiples",
    "Factors, Multiples & Divisibility",
    [4],
    strandYear4,
    difficultyYear4
  ),
  buildPostMcqQuestion(
    "y4-pt-15",
    "Which pair are both factors of 36?",
    ["4 and 9", "5 and 7", "6 and 7", "8 and 9"],
    "4 and 9",
    "factors_multiples",
    "Factors, Multiples & Divisibility",
    [4],
    strandYear4,
    difficultyYear4
  ),
  buildPostMcqQuestion(
    "y4-pt-16",
    "Which number does NOT belong?",
    ["16", "24", "31", "40"],
    "31",
    "factors_multiples",
    "Factors, Multiples & Divisibility",
    [4],
    strandYear4,
    difficultyYear4
  ),
  buildPostMcqQuestion(
    "y4-pt-17",
    "Which fraction is equivalent to 2/3?",
    ["3/6", "4/6", "5/8", "6/10"],
    "4/6",
    "fractions_decimals_percent",
    "Fractions, Decimals & Percentages",
    [7, 8, 9, 10],
    strandYear4,
    difficultyYear4
  ),
  buildPostMcqQuestion(
    "y4-pt-18",
    "Which decimal is equal to 3/5?",
    ["0.3", "0.5", "0.6", "0.8"],
    "0.6",
    "fractions_decimals_percent",
    "Fractions, Decimals & Percentages",
    [7, 8, 9],
    strandYear4,
    difficultyYear4
  ),
  buildPostMcqQuestion(
    "y4-pt-19",
    "Which fraction is greater than 3/4?",
    ["5/8", "6/8", "7/8", "2/3"],
    "7/8",
    "fractions_decimals_percent",
    "Fractions, Decimals & Percentages",
    [7, 8, 9],
    strandYear4,
    difficultyYear4
  ),
  buildPostNumericQuestion(
    "y4-pt-20",
    "What is 50% of 18?",
    "9",
    "fractions_decimals_percent",
    "Fractions, Decimals & Percentages",
    [9, 10],
    strandYear4,
    difficultyYear4
  ),
];

const YEAR5_POSTTEST_QUESTIONS: Question[] = [
  buildPostMcqQuestion(
    "y5-pt-01",
    "Round 367,812 to the nearest 10,000.",
    ["360,000", "368,000", "370,000", "400,000"],
    "370,000",
    "place_value_decimals",
    "Place Value & Decimals",
    [1, 2],
    strandYear5,
    difficultyYear5
  ),
  buildPostNumericQuestion(
    "y5-pt-02",
    "What is 1,000 less than 402,030?",
    "401030",
    "place_value_decimals",
    "Place Value & Decimals",
    [1, 2],
    strandYear5,
    difficultyYear5
  ),
  buildPostMcqQuestion(
    "y5-pt-03",
    "Round 7.361 to the nearest tenth.",
    ["7.3", "7.4", "7.36", "7.6"],
    "7.4",
    "place_value_decimals",
    "Place Value & Decimals",
    [1, 2],
    strandYear5,
    difficultyYear5
  ),
  buildPostNumericQuestion(
    "y5-pt-04",
    "4.8 + 2.35 =",
    "7.15",
    "place_value_decimals",
    "Place Value & Decimals",
    [1, 2, 11],
    strandYear5,
    difficultyYear5
  ),
  buildPostMcqQuestion(
    "y5-pt-05",
    "Which number is divisible by both 3 and 5?",
    ["95", "120", "124", "142"],
    "120",
    "factors_multiples_divisibility",
    "Factors, Multiples & Divisibility",
    [4],
    strandYear5,
    difficultyYear5
  ),
  buildPostMcqQuestion(
    "y5-pt-06",
    "Which number is NOT a factor of 60?",
    ["5", "6", "10", "14"],
    "14",
    "factors_multiples_divisibility",
    "Factors, Multiples & Divisibility",
    [4],
    strandYear5,
    difficultyYear5
  ),
  buildPostMcqQuestion(
    "y5-pt-07",
    "Which number is a common multiple of 3 and 8?",
    ["12", "18", "24", "30"],
    "24",
    "factors_multiples_divisibility",
    "Factors, Multiples & Divisibility",
    [4],
    strandYear5,
    difficultyYear5
  ),
  buildPostMcqQuestion(
    "y5-pt-08",
    "Which number does NOT belong?",
    ["15", "30", "45", "52"],
    "52",
    "factors_multiples_divisibility",
    "Factors, Multiples & Divisibility",
    [4],
    strandYear5,
    difficultyYear5
  ),
  buildPostNumericQuestion(
    "y5-pt-09",
    "324 × 3 =",
    "972",
    "multiplication_division",
    "Multiplication & Division",
    [5, 6, 12],
    strandYear5,
    difficultyYear5
  ),
  buildPostNumericQuestion(
    "y5-pt-10",
    "1,125 × 4 =",
    "4500",
    "multiplication_division",
    "Multiplication & Division",
    [5, 6, 12],
    strandYear5,
    difficultyYear5
  ),
  buildPostNumericQuestion(
    "y5-pt-11",
    "36 × 28 =",
    "1008",
    "multiplication_division",
    "Multiplication & Division",
    [5, 6, 12],
    strandYear5,
    difficultyYear5
  ),
  buildPostNumericQuestion(
    "y5-pt-12",
    "1,248 ÷ 8 =",
    "156",
    "multiplication_division",
    "Multiplication & Division",
    [5, 6, 12],
    strandYear5,
    difficultyYear5
  ),
  buildPostMcqQuestion(
    "y5-pt-13",
    "Which pair is NOT equivalent?",
    ["1/2 and 4/8", "3/4 and 6/8", "2/5 and 5/10", "1/3 and 2/6"],
    "2/5 and 5/10",
    "fractions_decimal_percent",
    "Fractions, Decimals & Percentages",
    [7, 8, 9],
    strandYear5,
    difficultyYear5
  ),
  buildPostMcqQuestion(
    "y5-pt-14",
    "Which is larger?",
    ["3/4", "7/10", "They are equal", "Not enough information"],
    "3/4",
    "fractions_decimal_percent",
    "Fractions, Decimals & Percentages",
    [7, 8, 9],
    strandYear5,
    difficultyYear5
  ),
  buildPostNumericQuestion(
    "y5-pt-15",
    "Write 40% as a decimal.",
    "0.4",
    "fractions_decimal_percent",
    "Fractions, Decimals & Percentages",
    [9],
    strandYear5,
    difficultyYear5
  ),
  buildPostNumericQuestion(
    "y5-pt-16",
    "What is 2/5 of 30?",
    "12",
    "fractions_decimal_percent",
    "Fractions, Decimals & Percentages",
    [8, 9],
    strandYear5,
    difficultyYear5
  ),
  buildPostNumericQuestion(
    "y5-pt-17",
    "What is 35% of 80?",
    "28",
    "percentages_problem_solving",
    "Percentages & Multi-Step Problems",
    [10],
    strandYear5,
    difficultyYear5
  ),
  buildPostNumericQuestion(
    "y5-pt-18",
    "A $60 item is 15% off. How much is the discount?",
    "9",
    "percentages_problem_solving",
    "Percentages & Multi-Step Problems",
    [10],
    strandYear5,
    difficultyYear5
  ),
  buildPostMcqQuestion(
    "y5-pt-19",
    "A test has 40 questions. 75% are correct. How many are correct?",
    ["25", "28", "30", "35"],
    "30",
    "percentages_problem_solving",
    "Percentages & Multi-Step Problems",
    [10, 11],
    strandYear5,
    difficultyYear5
  ),
  buildPostMcqQuestion(
    "y5-pt-20",
    "A $150 item is reduced by 20%. What is the final price?",
    ["$110", "$115", "$120", "$130"],
    "$120",
    "percentages_problem_solving",
    "Percentages & Multi-Step Problems",
    [10, 11],
    strandYear5,
    difficultyYear5
  ),
];

export const POSTTESTS: Record<string, PostTest> = {
  "Year 1": {
    yearLabel: "Year 1",
    questions: YEAR1_POSTTEST_QUESTIONS,
  },
  "Year 2": {
    yearLabel: "Year 2",
    questions: YEAR2_POSTTEST_QUESTIONS,
  },
  "Year 3": {
    yearLabel: "Year 3",
    questions: [
      {
        id: "y3-pt-01",
        prompt: "What is 400 + 300?",
        options: ["500", "600", "700", "800"],
        correctAnswer: "700",
      },
      {
        id: "y3-pt-02",
        prompt: "What is 12 × 3?",
        options: ["24", "36", "48", "60"],
        correctAnswer: "36",
      },
    ],
  },
  "Year 4": {
    yearLabel: "Year 4",
    questions: YEAR4_POSTTEST_QUESTIONS,
  },
  "Year 5": {
    yearLabel: "Year 5",
    questions: YEAR5_POSTTEST_QUESTIONS,
  },
};
