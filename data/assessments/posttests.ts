export type Question = {
  id: string;
  type?: string;
  prompt: string;
  options?: unknown[];
  correctAnswer: string;
  answer?: unknown;
  answerOptionId?: string;
  min?: number;
  max?: number;
  target?: number;
  maxTens?: number;
  maxOnes?: number;
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

function buildPostQuestion(params: Question): Question {
  return params;
}

const YEAR1_POSTTEST_QUESTIONS: Question[] = [
  buildPostQuestion({ id: "y1-pt-01", type: "mcq", prompt: "Circle the number 58 from this group: 35, 48, 58, 68", options: ["35", "48", "58", "68"], correctAnswer: "58", answer: "58", skillId: "number_identification", skillLabel: "Recognise Numbers", linkedWeeks: [1], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year1" }),
  buildPostQuestion({ id: "y1-pt-02", type: "mcq", prompt: "What number comes after 79?", options: ["78", "80", "81", "89"], correctAnswer: "80", answer: "80", skillId: "number_identification", skillLabel: "Recognise Numbers", linkedWeeks: [1], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year1" }),
  buildPostQuestion({ id: "y1-pt-03", type: "mcq", prompt: "Put these numbers in order from smallest to largest: 23, 17, 41", options: ["17, 23, 41", "23, 17, 41", "41, 23, 17", "17, 41, 23"], correctAnswer: "17, 23, 41", answer: "17, 23, 41", skillId: "ordering_numbers", skillLabel: "Order Numbers", linkedWeeks: [1], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year1" }),
  buildPostQuestion({ id: "y1-pt-04", type: "numberLine", prompt: "Choose the correct spot 72 would be on this 0–100 number line.", options: [24, 51, 72, 93], correctAnswer: "72", answer: 72, skillId: "number_line_position", skillLabel: "Place Numbers on a Number Line", linkedWeeks: [1], linkedLessons: [1, 2], strand: "Number", difficultyBand: "year1", min: 0, max: 100 }),
  buildPostQuestion({ id: "y1-pt-05", type: "mcq", prompt: "Which is the largest number?", options: ["64", "46", "56", "36"], correctAnswer: "64", answer: "64", skillId: "compare_numbers", skillLabel: "Compare Numbers", linkedWeeks: [1], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year1" }),
  buildPostQuestion({ id: "y1-pt-06", type: "mcq", prompt: "How many tens and ones are in 73?", options: ["7 tens and 3 ones", "3 tens and 7 ones", "73 tens and 0 ones", "6 tens and 13 ones"], correctAnswer: "7 tens and 3 ones", answer: "7 tens and 3 ones", skillId: "place_value", skillLabel: "Tens and Ones", linkedWeeks: [1, 2], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year1" }),
  buildPostQuestion({ id: "y1-pt-07", type: "mcq", prompt: "Which shows 45 in expanded form?", options: ["40 + 5", "4 + 5", "30 + 15", "50 - 10"], correctAnswer: "40 + 5", answer: "40 + 5", skillId: "place_value", skillLabel: "Tens and Ones", linkedWeeks: [1, 2], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year1" }),
  buildPostQuestion({ id: "y1-pt-08", type: "mab", prompt: "Show 46 using tens and ones blocks.", correctAnswer: "46", answer: 46, skillId: "place_value_blocks", skillLabel: "Build Numbers with Blocks", linkedWeeks: [1, 2], linkedLessons: [1, 2], strand: "Number", difficultyBand: "year1", target: 46, maxTens: 10, maxOnes: 10 }),
  buildPostQuestion({ id: "y1-pt-09", type: "mcq", prompt: "Skip count by 2s: 2, 4, 6, __, 10", options: ["7", "8", "9", "12"], correctAnswer: "8", answer: "8", skillId: "skip_counting", skillLabel: "Skip Counting", linkedWeeks: [2], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year1" }),
  buildPostQuestion({ id: "y1-pt-10", type: "mcq", prompt: "Skip count by 5s: 5, 10, 15, __", options: ["18", "20", "25", "30"], correctAnswer: "20", answer: "20", skillId: "skip_counting", skillLabel: "Skip Counting", linkedWeeks: [2], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year1" }),
  buildPostQuestion({ id: "y1-pt-11", type: "groups", prompt: "Which option shows equal groups?", options: [{ id: "A", label: "4 groups of 3", groups: [3, 3, 3, 3] }, { id: "B", label: "5, 4, and 3", groups: [5, 4, 3] }, { id: "C", label: "2 groups of 6 and 1", groups: [6, 6, 1] }, { id: "D", label: "1 group of 9", groups: [9] }], answerOptionId: "A", correctAnswer: "A", skillId: "equal_groups", skillLabel: "Equal Groups", linkedWeeks: [6], linkedLessons: [1, 2], strand: "Number", difficultyBand: "year1" }),
  buildPostQuestion({ id: "y1-pt-12", type: "mcq", prompt: "What is 9 + 6?", options: ["14", "15", "16", "17"], correctAnswer: "15", answer: "15", skillId: "addition_subtraction", skillLabel: "Addition and Subtraction", linkedWeeks: [3], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year1" }),
  buildPostQuestion({ id: "y1-pt-13", type: "mcq", prompt: "What is 16 - 7?", options: ["8", "9", "10", "11"], correctAnswer: "9", answer: "9", skillId: "addition_subtraction", skillLabel: "Addition and Subtraction", linkedWeeks: [3], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year1" }),
  buildPostQuestion({ id: "y1-pt-14", type: "mcq", prompt: "What number makes this true: 6 + __ = 14?", options: ["6", "7", "8", "9"], correctAnswer: "8", answer: "8", skillId: "addition_subtraction", skillLabel: "Addition and Subtraction", linkedWeeks: [3], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year1" }),
  buildPostQuestion({ id: "y1-pt-15", type: "mcq", prompt: "You have $5. You spend $2. How much money is left?", options: ["$1", "$2", "$3", "$7"], correctAnswer: "$3", answer: "$3", skillId: "money", skillLabel: "Money and Change", linkedWeeks: [4], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year1" }),
  buildPostQuestion({ id: "y1-pt-16", type: "mcq", prompt: "Which coins make $1.00 exactly?", options: ["50c + 20c + 20c + 10c", "50c + 20c + 20c + 5c", "20c + 20c + 20c + 20c", "50c + 50c + 20c"], correctAnswer: "50c + 20c + 20c + 10c", answer: "50c + 20c + 20c + 10c", skillId: "money", skillLabel: "Money and Change", linkedWeeks: [4], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year1" }),
  buildPostQuestion({ id: "y1-pt-17", type: "mcq", prompt: "Draw a picture to show 3 + 4 = ? (Choose the answer.)", options: ["5", "6", "7", "8"], correctAnswer: "7", answer: "7", skillId: "addition_visual", skillLabel: "Visual Addition", linkedWeeks: [3], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year1", visual: { type: "dot_add", leftTarget: 3, rightTarget: 4, maxDots: 10 } }),
  buildPostQuestion({ id: "y1-pt-18", type: "mcq", prompt: "Share 12 counters between 3 friends. How many does each friend get?", options: ["2", "3", "4", "6"], correctAnswer: "4", answer: "4", skillId: "sharing_division", skillLabel: "Sharing Equally", linkedWeeks: [6], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year1" }),
  buildPostQuestion({ id: "y1-pt-19", type: "mcq", prompt: "Group 15 counters into sets of 5. How many groups?", options: ["2", "3", "4", "5"], correctAnswer: "3", answer: "3", skillId: "sharing_division", skillLabel: "Sharing Equally", linkedWeeks: [6], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year1", visual: { type: "group_counters", totalCounters: 15, groups: 0, groupSize: 5, selectTarget: 15 } }),
  buildPostQuestion({ id: "y1-pt-20", type: "groups", prompt: "Which grouping shows sharing is equal?", options: [{ id: "A", label: "12 shared into 4 groups of 3", groups: [3, 3, 3, 3] }, { id: "B", label: "12 shared into 6 and 6", groups: [6, 6] }, { id: "C", label: "12 shared into 5, 4, and 3", groups: [5, 4, 3] }, { id: "D", label: "12 shared into 8 and 4", groups: [8, 4] }], answerOptionId: "A", correctAnswer: "A", skillId: "sharing_division", skillLabel: "Sharing Equally", linkedWeeks: [6], linkedLessons: [1, 2], strand: "Number", difficultyBand: "year1" }),
];

const YEAR2_POSTTEST_QUESTIONS: Question[] = [
  buildPostQuestion({ id: "y2-pt-01", type: "mcq", prompt: "Write this number in digits: Seven hundred and thirty-two", options: ["723", "732", "372", "237"], correctAnswer: "732", answer: "732", skillId: "place_value", skillLabel: "Place Value", linkedWeeks: [1], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year2" }),
  buildPostQuestion({ id: "y2-pt-02", type: "mcq", prompt: "What is the value of 4 in 546?", options: ["4", "40", "400", "46"], correctAnswer: "40", answer: "40", skillId: "place_value", skillLabel: "Place Value", linkedWeeks: [1], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year2" }),
  buildPostQuestion({ id: "y2-pt-03", type: "mcq", prompt: "Expand this number: 382", options: ["300 + 80 + 2", "380 + 2", "3 + 8 + 2", "30 + 80 + 2"], correctAnswer: "300 + 80 + 2", answer: "300 + 80 + 2", skillId: "place_value", skillLabel: "Place Value", linkedWeeks: [1], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year2" }),
  buildPostQuestion({ id: "y2-pt-04", type: "mcq", prompt: "What number comes before 600?", options: ["601", "599", "500", "610"], correctAnswer: "599", answer: "599", skillId: "number_patterns", skillLabel: "Number Patterns", linkedWeeks: [1], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year2" }),
  buildPostQuestion({ id: "y2-pt-05", type: "mcq", prompt: "What number is 10 more than 215?", options: ["216", "220", "225", "315"], correctAnswer: "225", answer: "225", skillId: "number_patterns", skillLabel: "Number Patterns", linkedWeeks: [1], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year2" }),
  buildPostQuestion({ id: "y2-pt-06", type: "mcq", prompt: "Is 274 odd or even?", options: ["Odd", "Even"], correctAnswer: "Even", answer: "Even", skillId: "odd_even", skillLabel: "Odd and Even Numbers", linkedWeeks: [2], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year2" }),
  buildPostQuestion({ id: "y2-pt-07", type: "mcq", prompt: "Circle the odd number: 108, 207, 402", options: ["108", "207", "402"], correctAnswer: "207", answer: "207", skillId: "odd_even", skillLabel: "Odd and Even Numbers", linkedWeeks: [2], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year2" }),
  buildPostQuestion({ id: "y2-pt-08", type: "mcq", prompt: "Put in order from smallest to largest: 145, 451, 154", options: ["145, 154, 451", "154, 145, 451", "451, 154, 145", "145, 451, 154"], correctAnswer: "145, 154, 451", answer: "145, 154, 451", skillId: "ordering_numbers", skillLabel: "Order Numbers", linkedWeeks: [1], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year2" }),
  buildPostQuestion({ id: "y2-pt-09", type: "mcq", prompt: "What is halfway between 100 and 200?", options: ["125", "140", "150", "175"], correctAnswer: "150", answer: "150", skillId: "number_patterns", skillLabel: "Number Patterns", linkedWeeks: [1, 2], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year2" }),
  buildPostQuestion({ id: "y2-pt-10", type: "mcq", prompt: "Round 178 to the nearest 10", options: ["170", "180", "200", "175"], correctAnswer: "180", answer: "180", skillId: "rounding", skillLabel: "Rounding", linkedWeeks: [2], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year2" }),
  buildPostQuestion({ id: "y2-pt-11", type: "mcq", prompt: "Solve: 54 + 29", options: ["73", "83", "93", "82"], correctAnswer: "83", answer: "83", skillId: "addition_strategy", skillLabel: "Addition Strategies", linkedWeeks: [3], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year2" }),
  buildPostQuestion({ id: "y2-pt-12", type: "mcq", prompt: "Solve: 47 + 30", options: ["50", "67", "77", "80"], correctAnswer: "77", answer: "77", skillId: "addition_strategy", skillLabel: "Addition Strategies", linkedWeeks: [3], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year2" }),
  buildPostQuestion({ id: "y2-pt-13", type: "mcq", prompt: "Which is a related fact to 6 + 3 = 9?", options: ["6 − 3 = 3", "9 − 6 = 3", "3 + 9 = 12", "9 + 3 = 12"], correctAnswer: "9 − 6 = 3", answer: "9 − 6 = 3", skillId: "fact_families", skillLabel: "Fact Families", linkedWeeks: [3], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year2" }),
  buildPostQuestion({ id: "y2-pt-14", type: "mcq", prompt: "Solve: 83 − 40", options: ["40", "43", "53", "33"], correctAnswer: "43", answer: "43", skillId: "subtraction_strategy", skillLabel: "Subtraction Strategies", linkedWeeks: [3], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year2" }),
  buildPostQuestion({ id: "y2-pt-15", type: "mcq", prompt: "What multiplication sentence matches 3 groups of 5?", options: ["5 × 3", "3 × 5", "3 + 5", "5 + 5 + 5"], correctAnswer: "3 × 5", answer: "3 × 5", skillId: "multiplication_groups", skillLabel: "Multiplication as Groups", linkedWeeks: [5], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year2" }),
  buildPostQuestion({ id: "y2-pt-16", type: "mcq", prompt: "Solve: 4 × 2", options: ["6", "8", "10", "2"], correctAnswer: "8", answer: "8", skillId: "arrays", skillLabel: "Arrays", linkedWeeks: [5], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year2" }),
  buildPostQuestion({ id: "y2-pt-17", type: "mcq", prompt: "What is 5 more than 3 tens?", options: ["15", "35", "53", "8"], correctAnswer: "35", answer: "35", skillId: "place_value", skillLabel: "Place Value", linkedWeeks: [1], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year2" }),
  buildPostQuestion({ id: "y2-pt-18", type: "mcq", prompt: "What is 60 + 30?", options: ["80", "90", "93", "63"], correctAnswer: "90", answer: "90", skillId: "skip_counting", skillLabel: "Skip Counting", linkedWeeks: [2], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year2" }),
  buildPostQuestion({ id: "y2-pt-19", type: "mcq", prompt: "Solve: 12 ÷ 3", options: ["3", "4", "6", "9"], correctAnswer: "4", answer: "4", skillId: "sharing_division", skillLabel: "Sharing Equally", linkedWeeks: [6], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year2" }),
  buildPostQuestion({ id: "y2-pt-20", type: "mcq", prompt: "Solve: 10 ÷ 2", options: ["2", "3", "5", "8"], correctAnswer: "5", answer: "5", skillId: "sharing_division", skillLabel: "Sharing Equally", linkedWeeks: [6], linkedLessons: [1, 2, 3], strand: "Number", difficultyBand: "year2" }),
];

const strandYear4 = "Number";
const difficultyYear4 = "year4";
const strandYear5 = "Number";
const difficultyYear5 = "year5";
const strandYear6 = "Number";
const difficultyYear6 = "year6";

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
  linkedLessons: number[] = [1, 2, 3],
  extras: Partial<Question> = {}
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
    ...extras,
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
  linkedLessons: number[] = [1, 2, 3],
  extras: Partial<Question> = {}
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
    ...extras,
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

const YEAR6_POSTTEST_QUESTIONS: Question[] = [
  buildPostMcqQuestion(
    "y6-pt-01",
    "Evaluate: 24 ÷ 6 + 5",
    ["9", "4", "14", "1"],
    "9",
    "order_of_operations",
    "Order of Operations",
    [11, 12],
    strandYear6,
    difficultyYear6,
    [1, 3],
    {
      visual: {
        type: "expression_flow",
        title: "Order of Operations",
        cards: [
          {
            tokens: ["24", "÷", "6", "+", "5"],
            highlightRange: [0, 2],
            result: "4 + 5",
            note: "Divide first, then add.",
          },
        ],
      },
    }
  ),
  buildPostNumericQuestion(
    "y6-pt-02",
    "Write 45% as a decimal.",
    "0.45",
    "fractions_decimals_percentages",
    "Fractions, Decimals & Percentages",
    [1, 6, 12],
    strandYear6,
    difficultyYear6,
    [1, 3],
    {
      visual: {
        type: "decimal_model",
        model: "place_value_chart",
        ones: 0,
        tenths: 4,
        hundredths: 5,
      },
    }
  ),
  buildPostMcqQuestion(
    "y6-pt-03",
    "Which number is prime?",
    ["21", "29", "35", "39"],
    "29",
    "prime_composite",
    "Prime & Composite Numbers",
    [2],
    strandYear6,
    difficultyYear6,
    [1, 2],
    {
      visual: {
        type: "rule_box",
        title: "Strategy Selection",
        steps: ["Prime numbers have exactly 2 factors", "Test small factor pairs"],
        decisionLabel: "Look for a number with no other factor pairs",
      },
    }
  ),
  buildPostMcqQuestion(
    "y6-pt-04",
    "Which fraction is equal to 0.5?",
    ["1/2", "1/5", "5/10", "Both 1/2 and 5/10"],
    "Both 1/2 and 5/10",
    "fractions_decimals_percentages",
    "Fractions, Decimals & Percentages",
    [5, 6],
    strandYear6,
    difficultyYear6,
    [1, 2],
    {
      visual: {
        type: "decimal_model",
        model: "tenths_bar",
        numerator: 5,
        denominator: 10,
      },
    }
  ),
  buildPostNumericQuestion(
    "y6-pt-05",
    "A pack has 8 items. How many items are in 6 packs?",
    "48",
    "multiplicative_reasoning",
    "Multiplication & Equal Groups",
    [10, 12],
    strandYear6,
    difficultyYear6,
    [1, 2],
    {
      visual: {
        type: "rule_box",
        title: "Quantity Comparison",
        steps: ["6 equal packs", "8 items in each pack"],
        decisionLabel: "Use multiplication for equal groups",
      },
    }
  ),
  buildPostMcqQuestion(
    "y6-pt-06",
    "A game costs $120. It has a 25% discount. What is the final price?",
    ["$30", "$90", "$100", "$95"],
    "$90",
    "financial_maths",
    "Financial Maths",
    [7, 12],
    strandYear6,
    difficultyYear6,
    [1, 2],
    {
      visual: {
        type: "rule_box",
        title: "Budget Decision",
        steps: ["Original price: $120", "Discount: 25% off", "25% of 120 = 30"],
        decisionLabel: "Subtract the discount from the original price",
      },
    }
  ),
  buildPostNumericQuestion(
    "y6-pt-07",
    "Budget: $500. Spent: $175 on transport and $125 on tickets. How much money remains?",
    "200",
    "financial_maths",
    "Financial Maths",
    [7, 12],
    strandYear6,
    difficultyYear6,
    [1, 2],
    {
      visual: {
        type: "rule_box",
        title: "Budget Decision",
        steps: ["Budget: $500", "Transport: $175", "Tickets: $125"],
        decisionLabel: "Subtract the total spending from the budget",
      },
    }
  ),
  buildPostMcqQuestion(
    "y6-pt-08",
    "Pack A: $18 for 6 drinks. Pack B: $28 for 8 drinks. Which pack is better value?",
    ["Pack A", "Pack B", "Same value", "Cannot tell"],
    "Pack A",
    "unit_rate_best_buy",
    "Best Value & Unit Rates",
    [12],
    strandYear6,
    difficultyYear6,
    [1, 2],
    {
      visual: {
        type: "best_buy_card_comparison",
        title: "Quantity Comparison",
        cards: [
          {
            label: "Pack A",
            productName: "Drink Pack A",
            price: 18,
            quantityLabel: "6 drinks",
            unitRateLabel: "Cost each",
            unitRate: 3,
          },
          {
            label: "Pack B",
            productName: "Drink Pack B",
            price: 28,
            quantityLabel: "8 drinks",
            unitRateLabel: "Cost each",
            unitRate: 3.5,
          },
        ],
      },
    }
  ),
  buildPostMcqQuestion(
    "y6-pt-09",
    "Which operation should be used first? 18 − 3 × 4",
    ["subtraction", "multiplication", "addition", "estimation"],
    "multiplication",
    "order_of_operations",
    "Order of Operations",
    [11, 12],
    strandYear6,
    difficultyYear6,
    [1, 3],
    {
      visual: {
        type: "expression_flow",
        title: "Choose the First Step",
        cards: [
          {
            tokens: ["18", "−", "3", "×", "4"],
            highlightRange: [2, 4],
            note: "Multiplication happens before subtraction.",
          },
        ],
      },
    }
  ),
  buildPostNumericQuestion(
    "y6-pt-10",
    "What is 50% of 240?",
    "120",
    "fractions_decimals_percentages",
    "Fractions, Decimals & Percentages",
    [6, 12],
    strandYear6,
    difficultyYear6,
    [1, 3],
    {
      visual: {
        type: "decimal_model",
        model: "tenths_bar",
        numerator: 5,
        denominator: 10,
      },
    }
  ),
  buildPostNumericQuestion(
    "y6-pt-11",
    "Solve: x + 14 = 39",
    "25",
    "equations_unknowns",
    "Equations & Unknown Values",
    [11, 12],
    strandYear6,
    difficultyYear6,
    [1, 2],
    {
      visual: {
        type: "balance_equation_card",
        title: "Equation Balance",
        left: "x + 14",
        right: "39",
        unknownSymbol: "x",
      },
    }
  ),
  buildPostMcqQuestion(
    "y6-pt-12",
    "Solve: 5 × y = 45",
    ["5", "8", "9", "40"],
    "9",
    "equations_unknowns",
    "Equations & Unknown Values",
    [11, 12],
    strandYear6,
    difficultyYear6,
    [1, 2],
    {
      visual: {
        type: "balance_equation_card",
        title: "Equation Balance",
        left: "5 × y",
        right: "45",
        unknownSymbol: "y",
      },
    }
  ),
  buildPostMcqQuestion(
    "y6-pt-13",
    "Input → Output: 2 → 10, 4 → 20, 6 → 30. What is the rule?",
    ["×5", "+5", "×10", "+10"],
    "×5",
    "patterns_rules",
    "Patterns & Rules",
    [9, 10, 12],
    strandYear6,
    difficultyYear6,
    [1, 2, 3],
    {
      visual: {
        type: "input_output_table",
        title: "Pattern Rule",
        pairs: [
          { input: "2", output: "10" },
          { input: "4", output: "20" },
          { input: "6", output: "30" },
        ],
      },
    }
  ),
  buildPostNumericQuestion(
    "y6-pt-14",
    "Rule: multiply by 6. What is the output for input 7?",
    "42",
    "patterns_rules",
    "Patterns & Rules",
    [9, 10, 12],
    strandYear6,
    difficultyYear6,
    [1, 2, 3],
    {
      visual: {
        type: "function_machine_card",
        title: "Pattern Rule",
        input: "7",
        rule: "×6",
        output: "?",
      },
    }
  ),
  buildPostMcqQuestion(
    "y6-pt-15",
    "Which statement is true?",
    [
      "Equations must stay balanced",
      "The equal sign means write the answer",
      "Patterns never repeat",
      "Multiplication always comes last",
    ],
    "Equations must stay balanced",
    "equations_unknowns",
    "Equations & Unknown Values",
    [11, 12],
    strandYear6,
    difficultyYear6,
    [1, 2],
    {
      visual: {
        type: "rule_box",
        title: "Strategy Selection",
        steps: ["The equal sign shows both sides are the same", "Solve by keeping the balance true"],
        decisionLabel: "Balanced equations stay equal",
      },
    }
  ),
  buildPostMcqQuestion(
    "y6-pt-16",
    "Which coordinate is shown?",
    ["(3, -2)", "(-3, 2)", "(2, -3)", "(-2, 3)"],
    "(3, -2)",
    "coordinates_movement",
    "Coordinates & Movement",
    [10, 11, 12],
    strandYear6,
    difficultyYear6,
    [2, 3],
    {
      visual: {
        type: "cartesian_grid",
        title: "Coordinate Plane",
        xMin: -5,
        xMax: 5,
        yMin: -5,
        yMax: 5,
        points: [{ x: 3, y: -2, label: "P" }],
      },
    }
  ),
  buildPostNumericQuestion(
    "y6-pt-17",
    "Start at (-1, 4). Move right 3. What is the new coordinate?",
    "(2,4)",
    "coordinates_movement",
    "Coordinates & Movement",
    [10, 11, 12],
    strandYear6,
    difficultyYear6,
    [2, 3],
    {
      visual: {
        type: "cartesian_grid",
        title: "Coordinate Movement",
        xMin: -5,
        xMax: 5,
        yMin: -5,
        yMax: 5,
        points: [{ x: -1, y: 4, label: "Start" }],
        subtitle: "Move right 3. Right changes x only.",
      },
    }
  ),
  buildPostMcqQuestion(
    "y6-pt-18",
    "Which quadrant contains (-4, 3)?",
    ["Quadrant I", "Quadrant II", "Quadrant III", "Quadrant IV"],
    "Quadrant II",
    "coordinates_movement",
    "Coordinates & Movement",
    [10, 11, 12],
    strandYear6,
    difficultyYear6,
    [2, 3],
    {
      visual: {
        type: "cartesian_grid",
        title: "Quadrant Check",
        xMin: -5,
        xMax: 5,
        yMin: -5,
        yMax: 5,
        points: [{ x: -4, y: 3, label: "Q" }],
      },
    }
  ),
  buildPostNumericQuestion(
    "y6-pt-19",
    "A class has $600. They spend $220 on tickets, $150 on food, and $80 on transport. How much money remains?",
    "150",
    "financial_maths",
    "Financial Maths",
    [7, 12],
    strandYear6,
    difficultyYear6,
    [1, 2],
    {
      visual: {
        type: "rule_box",
        title: "Budget Decision",
        steps: ["Budget: $600", "Tickets: $220", "Food: $150", "Transport: $80"],
        decisionLabel: "Add the costs, then subtract from the budget",
      },
    }
  ),
  buildPostMcqQuestion(
    "y6-pt-20",
    "Calculate: (18 ÷ 3) + 7 × 2",
    [
      "20",
      "14",
      "26",
      "34",
    ],
    "20",
    "problem_solving_reasoning",
    "Problem Solving & Reasoning",
    [11, 12],
    strandYear6,
    difficultyYear6,
    [1, 2, 3],
    {
      visual: {
        type: "expression_flow",
        title: "Expression",
        cards: [
          {
            tokens: ["(", "18", "÷", "3", ")", "+", "7", "×", "2"],
          },
        ],
      },
    }
  ),
];


function shufflePostItems<T>(items: T[]): T[] {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex]!, next[index]!];
  }
  return next;
}

function pickPostItem<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function orderAnswer(values: number[]) {
  return values.map(String).join("||");
}

function nearbyNumberOptions(target: number, min: number, max: number, extra: number[] = []): string[] {
  const set = new Set<number>([target, ...extra]);
  let delta = 1;
  while (set.size < 4 && delta < 6) {
    if (target - delta >= min) set.add(target - delta);
        if (target + delta <= max) set.add(target + delta);
    delta += 1;
  }
  return shufflePostItems([...set].slice(0, 4)).map(String);
}

export function buildPrepPosttest(): PostTest {
  const countTarget = pickPostItem([12, 13, 14, 15]);
  const matchTarget = pickPostItem([16, 17, 18]);
  const numeralTarget = pickPostItem([11, 12, 13, 14, 15, 16, 17, 18, 19]);
  const missingStart = pickPostItem([11, 12, 13, 14]);
  const teenExtras = pickPostItem([6, 7, 8, 9]);
  const orderSetA = pickPostItem([
    [1, 4, 6, 8, 15, 18],
    [2, 5, 7, 9, 14, 17],
    [3, 6, 8, 10, 13, 16],
  ] as const);
  const orderSetB = pickPostItem([
    [19, 13, 17, 12, 15],
    [18, 14, 16, 11, 19],
    [17, 12, 18, 15, 13],
  ] as const);
  const doubleGapForward = pickPostItem([
    { prompt: '12, __, __, 15, 16', answer: '13, 14', options: ['13, 14', '11, 13', '13, 15', '14, 15'] },
    { prompt: '14, __, __, 17, 18', answer: '15, 16', options: ['15, 16', '14, 16', '15, 17', '16, 17'] },
    { prompt: '11, __, __, 14, 15', answer: '12, 13', options: ['12, 13', '11, 12', '12, 14', '13, 14'] },
  ] as const);
  const doubleGapBackward = pickPostItem([
    { prompt: '__, 18, 17, __, 15', answer: '19 and 16', options: ['19 and 16', '16 and 14', '20 and 16', '19 and 15'] },
    { prompt: '20, __, 18, __, 16', answer: '19 and 17', options: ['19 and 17', '18 and 17', '19 and 16', '18 and 16'] },
    { prompt: '__, 17, 16, __, 14', answer: '18 and 15', options: ['18 and 15', '17 and 15', '18 and 14', '19 and 15'] },
  ] as const);
  const descendingSet = pickPostItem([
    [18, 17, 16, 15],
    [20, 19, 18, 17],
    [16, 15, 14, 13],
  ] as const);
  const missingWhole = pickPostItem([
    { total: 14, shown: 10 },
    { total: 15, shown: 10 },
    { total: 16, shown: 10 },
    { total: 18, shown: 10 },
  ] as const);
  const makeTwentyShown = pickPostItem([12, 14, 15, 16, 17, 18]);
  const sameWhole = pickPostItem([
    { left: '7 + 7', right: '10 + 4', same: true },
    { left: '9 + 5', right: '8 + 6', same: true },
    { left: '10 + 6', right: '7 + 8', same: false },
    { left: '6 + 6', right: '10 + 2', same: true },
  ] as const);
  const comparePair = pickPostItem([
    { left: 14, right: 15 },
    { left: 17, right: 18 },
    { left: 12, right: 13 },
  ] as const);
  const makeTwentyParts = pickPostItem([
    { correct: '10 and 10', options: ['10 and 10', '12 and 7', '15 and 4', '9 and 9'] },
    { correct: '12 and 8', options: ['12 and 8', '11 and 8', '13 and 6', '9 and 9'] },
    { correct: '14 and 6', options: ['14 and 6', '13 and 6', '15 and 4', '12 and 7'] },
  ] as const);
  const raceA = pickPostItem([
    [
      { name: 'Alien', icon: '👽', place: 'First' },
      { name: 'Rocket', icon: '🚀', place: 'Second' },
      { name: 'Numbot', icon: '🤖', place: 'Third' },
      { name: 'Hover Pod', icon: '🛸', place: 'Fourth' },
    ],
    [
      { name: 'Rocket', icon: '🚀', place: 'First' },
      { name: 'Numbot', icon: '🤖', place: 'Second' },
      { name: 'Alien', icon: '👽', place: 'Third' },
      { name: 'Hover Pod', icon: '🛸', place: 'Fourth' },
    ],
  ] as const);
  const raceB = pickPostItem([
    [
      { name: 'Rocket', icon: '🚀', place: 'First' },
      { name: 'Alien', icon: '👽', place: 'Second' },
      { name: 'Numbot', icon: '🤖', place: 'Third' },
      { name: 'Hover Pod', icon: '🛸', place: 'Fourth' },
    ],
    [
      { name: 'Alien', icon: '👽', place: 'First' },
      { name: 'Numbot', icon: '🤖', place: 'Second' },
      { name: 'Rocket', icon: '🚀', place: 'Third' },
      { name: 'Hover Pod', icon: '🛸', place: 'Fourth' },
    ],
  ] as const);
  const spatialBetween = pickPostItem([
    {
      items: [
        { row: 0, col: 0, label: 'Robot', icon: '🤖' },
        { row: 0, col: 1, label: 'Crystal', icon: '✦' },
        { row: 0, col: 2, label: 'Alien', icon: '👽' },
      ],
      prompt: 'Who is between the robot and the alien?',
      answer: 'Crystal',
      options: ['Crystal', 'Robot', 'Alien', 'Portal'],
    },
    {
      items: [
        { row: 0, col: 0, label: 'Rocket', icon: '🚀' },
        { row: 0, col: 1, label: 'Portal', icon: '◉' },
        { row: 0, col: 2, label: 'Numbot', icon: '🤖' },
      ],
      prompt: 'Who is between the rocket and Numbot?',
      answer: 'Portal',
      options: ['Portal', 'Rocket', 'Numbot', 'Alien'],
    },
  ] as const);
  const spatialAbove = pickPostItem([
    {
      items: [
        { row: 0, col: 1, label: 'Rocket', icon: '🚀' },
        { row: 1, col: 0, label: 'Robot', icon: '🤖' },
        { row: 1, col: 1, label: 'Portal', icon: '◉' },
        { row: 1, col: 2, label: 'Alien', icon: '👽' },
      ],
      prompt: 'What is above the portal?',
      answer: 'Rocket',
      options: ['Rocket', 'Robot', 'Alien', 'Portal'],
    },
    {
      items: [
        { row: 0, col: 1, label: 'Crystal', icon: '✦' },
        { row: 1, col: 0, label: 'Robot', icon: '🤖' },
        { row: 1, col: 1, label: 'Portal', icon: '◉' },
        { row: 1, col: 2, label: 'Rocket', icon: '🚀' },
      ],
      prompt: 'What is above the portal?',
      answer: 'Crystal',
      options: ['Crystal', 'Robot', 'Rocket', 'Portal'],
    },
  ] as const);
  const matchEighteen = pickPostItem([
    [17, 18, 19],
    [18, 16, 20],
    [19, 18, 17],
  ] as const);

  const questions: Question[] = [
    buildPostQuestion({ id: 'prep-pt-01', type: 'mcq', prompt: 'How many are there?', options: nearbyNumberOptions(countTarget, 10, 20), correctAnswer: String(countTarget), answer: String(countTarget), skillId: 'count_collections', skillLabel: 'Count Collections', linkedWeeks: [1, 2, 10, 11, 12], linkedLessons: [1, 2, 3], strand: 'Number', difficultyBand: 'prep', visual: { type: 'prep_collection', quantity: countTarget, object: pickPostItem(['crystal', 'energy', 'rocket']), layout: countTarget > 10 ? 'double_ten_frame' : 'ten_frame' } }),
    buildPostQuestion({ id: 'prep-pt-02', type: 'mcq', prompt: 'Which number matches this collection?', options: nearbyNumberOptions(matchTarget, 10, 20), correctAnswer: String(matchTarget), answer: String(matchTarget), skillId: 'teen_recognition', skillLabel: 'Teen Number Recognition', linkedWeeks: [2, 10, 11, 12], linkedLessons: [1, 2, 3], strand: 'Number', difficultyBand: 'prep', visual: { type: 'prep_collection', quantity: matchTarget, object: pickPostItem(['energy', 'crystal', 'robot']), layout: 'double_ten_frame' } }),
    buildPostQuestion({ id: 'prep-pt-03', type: 'mcq', prompt: `Tap the numeral ${numeralTarget}.`, options: nearbyNumberOptions(numeralTarget, 10, 20), correctAnswer: String(numeralTarget), answer: String(numeralTarget), skillId: 'numeral_recognition', skillLabel: 'Numeral Recognition', linkedWeeks: [1, 2, 10, 11, 12], linkedLessons: [1, 2, 3], strand: 'Number', difficultyBand: 'prep' }),
    buildPostQuestion({ id: 'prep-pt-04', type: 'mcq', prompt: `${missingStart}, __, ${missingStart + 2}`, options: nearbyNumberOptions(missingStart + 1, 1, 20), correctAnswer: String(missingStart + 1), answer: String(missingStart + 1), skillId: 'count_forward_backward', skillLabel: 'Forward and Backward Counting', linkedWeeks: [3, 11, 12], linkedLessons: [1, 2, 3], strand: 'Number', difficultyBand: 'prep' }),
    buildPostQuestion({ id: 'prep-pt-05', type: 'mcq', prompt: `Which teen number is 10 and ${teenExtras} more?`, options: nearbyNumberOptions(10 + teenExtras, 10, 20), correctAnswer: String(10 + teenExtras), answer: String(10 + teenExtras), skillId: 'teen_structure', skillLabel: 'Teen Number Structure', linkedWeeks: [10, 11, 12], linkedLessons: [1, 2], strand: 'Number', difficultyBand: 'prep' }),
    buildPostQuestion({ id: 'prep-pt-06', type: 'number_order', prompt: 'Order the numbers from smallest to largest.', options: orderSetA.map(String), correctAnswer: orderAnswer([...orderSetA].sort((a, b) => a - b)), answer: orderAnswer([...orderSetA].sort((a, b) => a - b)), skillId: 'ordering_numbers', skillLabel: 'Order Numbers', linkedWeeks: [3, 9, 11, 12], linkedLessons: [1, 2, 3], strand: 'Number', difficultyBand: 'prep' }),
    buildPostQuestion({ id: 'prep-pt-07', type: 'number_order', prompt: 'Order the teen numbers from smallest to largest.', options: orderSetB.map(String), correctAnswer: orderAnswer([...orderSetB].sort((a, b) => a - b)), answer: orderAnswer([...orderSetB].sort((a, b) => a - b)), skillId: 'ordering_numbers', skillLabel: 'Order Numbers', linkedWeeks: [10, 11, 12], linkedLessons: [1, 2, 3], strand: 'Number', difficultyBand: 'prep' }),
    buildPostQuestion({ id: 'prep-pt-08', type: 'mcq', prompt: `Which numbers are missing? ${doubleGapForward.prompt}`, options: [...doubleGapForward.options], correctAnswer: doubleGapForward.answer, answer: doubleGapForward.answer, skillId: 'multi_missing_reasoning', skillLabel: 'Multi-Missing Reasoning', linkedWeeks: [11, 12], linkedLessons: [1, 3], strand: 'Number', difficultyBand: 'prep' }),
    buildPostQuestion({ id: 'prep-pt-09', type: 'mcq', prompt: `Which numbers are missing? ${doubleGapBackward.prompt}`, options: [...doubleGapBackward.options], correctAnswer: doubleGapBackward.answer, answer: doubleGapBackward.answer, skillId: 'multi_missing_reasoning', skillLabel: 'Multi-Missing Reasoning', linkedWeeks: [11, 12], linkedLessons: [1, 3], strand: 'Number', difficultyBand: 'prep' }),
    buildPostQuestion({ id: 'prep-pt-10', type: 'number_order', prompt: 'Order the numbers from largest to smallest.', options: descendingSet.map(String), correctAnswer: orderAnswer([...descendingSet].sort((a, b) => b - a)), answer: orderAnswer([...descendingSet].sort((a, b) => b - a)), skillId: 'ordering_numbers', skillLabel: 'Order Numbers', linkedWeeks: [11, 12], linkedLessons: [1, 3], strand: 'Number', difficultyBand: 'prep' }),
    buildPostQuestion({ id: 'prep-pt-11', type: 'mcq', prompt: `${missingWhole.total} = ${missingWhole.shown} + __`, options: nearbyNumberOptions(missingWhole.total - missingWhole.shown, 0, 10), correctAnswer: String(missingWhole.total - missingWhole.shown), answer: String(missingWhole.total - missingWhole.shown), skillId: 'missing_parts', skillLabel: 'Missing Parts', linkedWeeks: [6, 11, 12], linkedLessons: [2, 3], strand: 'Number', difficultyBand: 'prep', visual: { type: 'prep_collection', quantity: missingWhole.total, object: pickPostItem(['energy', 'crystal']), layout: 'double_ten_frame' } }),
    buildPostQuestion({ id: 'prep-pt-12', type: 'mcq', prompt: 'How many more to make 20?', options: nearbyNumberOptions(20 - makeTwentyShown, 0, 10), correctAnswer: String(20 - makeTwentyShown), answer: String(20 - makeTwentyShown), skillId: 'make_twenty', skillLabel: 'Make 20', linkedWeeks: [10, 11, 12], linkedLessons: [2, 3], strand: 'Number', difficultyBand: 'prep', visual: { type: 'prep_collection', quantity: makeTwentyShown, object: pickPostItem(['energy', 'rocket']), layout: 'double_ten_frame' } }),
    buildPostQuestion({ id: 'prep-pt-13', type: 'mcq', prompt: `One build is ${sameWhole.left}. Another build is ${sameWhole.right}. Do they make the same whole?`, options: ['Yes', 'No'], correctAnswer: sameWhole.same ? 'Yes' : 'No', answer: sameWhole.same ? 'Yes' : 'No', skillId: 'same_whole_different_parts', skillLabel: 'Same Whole, Different Parts', linkedWeeks: [6, 12], linkedLessons: [2, 3], strand: 'Number', difficultyBand: 'prep' }),
    buildPostQuestion({ id: 'prep-pt-14', type: 'mcq', prompt: 'Which reactor has more energy?', options: ['Left reactor', 'Right reactor', 'They are the same'], correctAnswer: comparePair.left > comparePair.right ? 'Left reactor' : 'Right reactor', answer: comparePair.left > comparePair.right ? 'Left reactor' : 'Right reactor', skillId: 'compare_quantities', skillLabel: 'Compare Quantities', linkedWeeks: [5, 10, 11, 12], linkedLessons: [1, 2, 3], strand: 'Number', difficultyBand: 'prep', visual: { type: 'prep_compare_collections', groups: [ { id: 'left', label: 'Left reactor', quantity: comparePair.left, object: 'energy', layout: 'double_ten_frame' }, { id: 'right', label: 'Right reactor', quantity: comparePair.right, object: 'crystal', layout: 'double_ten_frame' } ] } }),
    buildPostQuestion({ id: 'prep-pt-15', type: 'mcq', prompt: 'Which two parts make 20?', options: [...makeTwentyParts.options], correctAnswer: makeTwentyParts.correct, answer: makeTwentyParts.correct, skillId: 'flexible_building', skillLabel: 'Flexible Number Building', linkedWeeks: [6, 10, 11, 12], linkedLessons: [2, 3], strand: 'Number', difficultyBand: 'prep' }),
    buildPostQuestion({ id: 'prep-pt-16', type: 'mcq', prompt: 'Who came third?', options: raceA.map((item) => item.name), correctAnswer: raceA[2].name, answer: raceA[2].name, skillId: 'ordinal_positions', skillLabel: 'Ordinal Positions', linkedWeeks: [9, 12], linkedLessons: [1, 2, 3], strand: 'Space', difficultyBand: 'prep', visual: { type: 'prep_race_finish', finishers: raceA } }),
    buildPostQuestion({ id: 'prep-pt-17', type: 'mcq', prompt: spatialBetween.prompt, options: [...spatialBetween.options], correctAnswer: spatialBetween.answer, answer: spatialBetween.answer, skillId: 'spatial_language', skillLabel: 'Spatial Language', linkedWeeks: [9, 12], linkedLessons: [3], strand: 'Space', difficultyBand: 'prep', visual: { type: 'prep_spatial_scene', rows: 1, cols: 3, items: spatialBetween.items } }),
    buildPostQuestion({ id: 'prep-pt-18', type: 'mcq', prompt: spatialAbove.prompt, options: [...spatialAbove.options], correctAnswer: spatialAbove.answer, answer: spatialAbove.answer, skillId: 'spatial_language', skillLabel: 'Spatial Language', linkedWeeks: [9, 12], linkedLessons: [3], strand: 'Space', difficultyBand: 'prep', visual: { type: 'prep_spatial_scene', rows: 2, cols: 3, items: spatialAbove.items } }),
    buildPostQuestion({ id: 'prep-pt-19', type: 'mcq', prompt: 'Who finished before Numbot?', options: raceB.map((item) => item.name), correctAnswer: raceB[raceB.findIndex((item) => item.name === 'Numbot') - 1].name, answer: raceB[raceB.findIndex((item) => item.name === 'Numbot') - 1].name, skillId: 'ordinal_positions', skillLabel: 'Ordinal Positions', linkedWeeks: [9, 12], linkedLessons: [2, 3], strand: 'Space', difficultyBand: 'prep', visual: { type: 'prep_race_finish', finishers: raceB } }),
    buildPostQuestion({ id: 'prep-pt-20', type: 'mcq', prompt: 'Which collection matches 18?', options: ['Reactor A', 'Reactor B', 'Reactor C'], correctAnswer: `Reactor ${['A', 'B', 'C'][matchEighteen.findIndex((value) => value === 18)]}`, answer: `Reactor ${['A', 'B', 'C'][matchEighteen.findIndex((value) => value === 18)]}`, skillId: 'practical_application', skillLabel: 'Practical Application', linkedWeeks: [10, 11, 12], linkedLessons: [2, 3], strand: 'Number', difficultyBand: 'prep', visual: { type: 'prep_compare_collections', groups: [ { id: 'A', label: 'Reactor A', quantity: matchEighteen[0], object: 'rocket', layout: 'double_ten_frame' }, { id: 'B', label: 'Reactor B', quantity: matchEighteen[1], object: 'energy', layout: 'double_ten_frame' }, { id: 'C', label: 'Reactor C', quantity: matchEighteen[2], object: 'crystal', layout: 'double_ten_frame' } ] } }),
  ];

  return {
    yearLabel: 'Prep',
    questions,
  };
}

export const POSTTESTS: Record<string, PostTest> = {
  Prep: buildPrepPosttest(),
  "Year 1": {
    yearLabel: "Year 1",
    questions: YEAR1_POSTTEST_QUESTIONS,
  },
  "Year 2": {
    yearLabel: "Year 2",
    questions: YEAR2_POSTTEST_QUESTIONS,
  },
  "Year 4": {
    yearLabel: "Year 4",
    questions: YEAR4_POSTTEST_QUESTIONS,
  },
  "Year 5": {
    yearLabel: "Year 5",
    questions: YEAR5_POSTTEST_QUESTIONS,
  },
  "Year 6": {
    yearLabel: "Year 6",
    questions: YEAR6_POSTTEST_QUESTIONS,
  },
};
