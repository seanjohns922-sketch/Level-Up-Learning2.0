import type { Question } from "./prep";

export type { Question };

const strand = "Number";
const difficultyBand = "year5";

function mcqQuestion(
  id: string,
  prompt: string,
  options: string[],
  answer: string,
  skillId: string,
  skillLabel: string,
  linkedWeeks: number[],
  linkedLessons: number[] = [1, 2, 3]
): Question {
  return {
    type: "mcq",
    id,
    prompt,
    options,
    answer,
    skillId,
    skillLabel,
    linkedWeeks,
    linkedLessons,
    strand,
    difficultyBand,
  };
}

function numericQuestion(
  id: string,
  prompt: string,
  answer: string,
  skillId: string,
  skillLabel: string,
  linkedWeeks: number[],
  linkedLessons: number[] = [1, 2, 3]
): Question {
  return {
    type: "numeric",
    id,
    prompt,
    answer,
    skillId,
    skillLabel,
    linkedWeeks,
    linkedLessons,
    strand,
    difficultyBand,
  };
}

export const YEAR5_PRETEST: Question[] = [
  mcqQuestion(
    "y5-q1",
    "Round 482,691 to the nearest 10,000.",
    ["480,000", "482,000", "490,000", "500,000"],
    "480,000",
    "place_value_decimals",
    "Place Value & Decimals",
    [1, 2]
  ),
  numericQuestion(
    "y5-q2",
    "What is 1,000 less than 305,040?",
    "304040",
    "place_value_decimals",
    "Place Value & Decimals",
    [1, 2]
  ),
  mcqQuestion(
    "y5-q3",
    "Round 6.482 to the nearest tenth.",
    ["6.4", "6.5", "6.48", "6.8"],
    "6.5",
    "place_value_decimals",
    "Place Value & Decimals",
    [1, 2]
  ),
  numericQuestion(
    "y5-q4",
    "3.75 + 0.48 =",
    "4.23",
    "place_value_decimals",
    "Place Value & Decimals",
    [1, 2, 11]
  ),
  mcqQuestion(
    "y5-q5",
    "Which number is divisible by both 3 and 5?",
    ["45", "62", "74", "91"],
    "45",
    "factors_multiples_divisibility",
    "Factors, Multiples & Divisibility",
    [4]
  ),
  mcqQuestion(
    "y5-q6",
    "Which number is NOT a factor of 48?",
    ["3", "6", "8", "10"],
    "10",
    "factors_multiples_divisibility",
    "Factors, Multiples & Divisibility",
    [4]
  ),
  mcqQuestion(
    "y5-q7",
    "Which number is a common multiple of 4 and 6?",
    ["12", "18", "20", "22"],
    "12",
    "factors_multiples_divisibility",
    "Factors, Multiples & Divisibility",
    [4]
  ),
  mcqQuestion(
    "y5-q8",
    "Which number does NOT belong?",
    ["12", "18", "24", "25"],
    "25",
    "factors_multiples_divisibility",
    "Factors, Multiples & Divisibility",
    [4]
  ),
  numericQuestion(
    "y5-q9",
    "243 × 4 =",
    "972",
    "multiplication_division",
    "Multiplication & Division",
    [5, 6, 12]
  ),
  numericQuestion(
    "y5-q10",
    "1,204 × 3 =",
    "3612",
    "multiplication_division",
    "Multiplication & Division",
    [5, 6, 12]
  ),
  numericQuestion(
    "y5-q11",
    "48 × 26 =",
    "1248",
    "multiplication_division",
    "Multiplication & Division",
    [5, 6, 12]
  ),
  numericQuestion(
    "y5-q12",
    "936 ÷ 6 =",
    "156",
    "multiplication_division",
    "Multiplication & Division",
    [5, 6, 12]
  ),
  mcqQuestion(
    "y5-q13",
    "Which pair is NOT equivalent?",
    ["1/2 and 2/4", "2/3 and 4/6", "3/5 and 5/10", "1/4 and 2/8"],
    "3/5 and 5/10",
    "fractions_decimal_percent",
    "Fractions, Decimals & Percentages",
    [7, 8, 9]
  ),
  mcqQuestion(
    "y5-q14",
    "Which is larger?",
    ["2/3", "3/5", "They are equal", "Not enough information"],
    "2/3",
    "fractions_decimal_percent",
    "Fractions, Decimals & Percentages",
    [7, 8, 9]
  ),
  numericQuestion(
    "y5-q15",
    "Write 25% as a decimal.",
    "0.25",
    "fractions_decimal_percent",
    "Fractions, Decimals & Percentages",
    [9]
  ),
  numericQuestion(
    "y5-q16",
    "What is 3/4 of 20?",
    "15",
    "fractions_decimal_percent",
    "Fractions, Decimals & Percentages",
    [8, 9]
  ),
  numericQuestion(
    "y5-q17",
    "What is 30% of 70?",
    "21",
    "percentages_problem_solving",
    "Percentages & Multi-Step Problems",
    [10]
  ),
  numericQuestion(
    "y5-q18",
    "A $80 item is 25% off. How much is the discount?",
    "20",
    "percentages_problem_solving",
    "Percentages & Multi-Step Problems",
    [10]
  ),
  mcqQuestion(
    "y5-q19",
    "A test has 50 questions. 80% are correct. How many are correct?",
    ["30", "35", "40", "45"],
    "40",
    "percentages_problem_solving",
    "Percentages & Multi-Step Problems",
    [10, 11]
  ),
  mcqQuestion(
    "y5-q20",
    "A $120 item is reduced by 25%. What is the final price?",
    ["$80", "$90", "$95", "$100"],
    "$90",
    "percentages_problem_solving",
    "Percentages & Multi-Step Problems",
    [10, 11]
  ),
];
