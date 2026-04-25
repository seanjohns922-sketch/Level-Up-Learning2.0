import type { Question } from "./prep";

export type { Question };

const strand = "Number";
const difficultyBand = "year4";

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

export const YEAR4_PRETEST: Question[] = [
  mcqQuestion(
    "y4-q1",
    "What is the value of 6 in 46,218?",
    ["6", "60", "600", "6,000"],
    "6,000",
    "place_value_rounding",
    "Place Value & Rounding",
    [1, 2]
  ),
  numericQuestion(
    "y4-q2",
    "What is 1,000 more than 7,450?",
    "8450",
    "place_value_rounding",
    "Place Value & Rounding",
    [1, 2]
  ),
  mcqQuestion(
    "y4-q3",
    "Round 38,649 to the nearest 1,000.",
    ["38,000", "38,600", "39,000", "40,000"],
    "39,000",
    "place_value_rounding",
    "Place Value & Rounding",
    [1, 3]
  ),
  numericQuestion(
    "y4-q4",
    "What is 10 less than 5,003?",
    "4993",
    "place_value_rounding",
    "Place Value & Rounding",
    [1, 3]
  ),
  numericQuestion(
    "y4-q5",
    "3,786 + 249 =",
    "4035",
    "addition_subtraction",
    "Addition & Subtraction",
    [2, 3, 12]
  ),
  numericQuestion(
    "y4-q6",
    "6,302 - 198 =",
    "6104",
    "addition_subtraction",
    "Addition & Subtraction",
    [2, 3, 12]
  ),
  mcqQuestion(
    "y4-q7",
    "What is 5,000 - 1,999?",
    ["2,999", "3,001", "3,009", "4,001"],
    "3,001",
    "addition_subtraction",
    "Addition & Subtraction",
    [2, 3, 12]
  ),
  numericQuestion(
    "y4-q8",
    "9,415 - 586 =",
    "8829",
    "addition_subtraction",
    "Addition & Subtraction",
    [2, 3, 12]
  ),
  numericQuestion(
    "y4-q9",
    "48 × 6 =",
    "288",
    "multiplication_division",
    "Multiplication & Division",
    [5, 6, 12]
  ),
  numericQuestion(
    "y4-q10",
    "864 ÷ 8 =",
    "108",
    "multiplication_division",
    "Multiplication & Division",
    [5, 6, 12]
  ),
  mcqQuestion(
    "y4-q11",
    "What is 25 × 12?",
    ["250", "275", "300", "325"],
    "300",
    "multiplication_division",
    "Multiplication & Division",
    [5, 6, 12]
  ),
  numericQuestion(
    "y4-q12",
    "735 ÷ 5 =",
    "147",
    "multiplication_division",
    "Multiplication & Division",
    [5, 6, 12]
  ),
  mcqQuestion(
    "y4-q13",
    "Which number is a multiple of 9?",
    ["45", "54", "58", "62"],
    "54",
    "factors_multiples",
    "Factors, Multiples & Divisibility",
    [4]
  ),
  mcqQuestion(
    "y4-q14",
    "Which number is NOT divisible by 4?",
    ["24", "36", "46", "64"],
    "46",
    "factors_multiples",
    "Factors, Multiples & Divisibility",
    [4]
  ),
  mcqQuestion(
    "y4-q15",
    "Which pair are both factors of 24?",
    ["4 and 6", "5 and 6", "3 and 9", "2 and 7"],
    "4 and 6",
    "factors_multiples",
    "Factors, Multiples & Divisibility",
    [4]
  ),
  mcqQuestion(
    "y4-q16",
    "Which number does NOT belong with the others?",
    ["18", "27", "35", "45"],
    "35",
    "factors_multiples",
    "Factors, Multiples & Divisibility",
    [4]
  ),
  mcqQuestion(
    "y4-q17",
    "Which fraction is equivalent to 3/4?",
    ["4/8", "6/8", "8/10", "9/16"],
    "6/8",
    "fractions_decimals_percent",
    "Fractions, Decimals & Percentages",
    [7, 8, 9, 10]
  ),
  mcqQuestion(
    "y4-q18",
    "Which decimal is equal to 7/10?",
    ["0.07", "0.7", "7.0", "0.17"],
    "0.7",
    "fractions_decimals_percent",
    "Fractions, Decimals & Percentages",
    [7, 8, 9]
  ),
  mcqQuestion(
    "y4-q19",
    "Which fraction is greater than 1/2?",
    ["2/5", "4/8", "5/8", "3/7"],
    "5/8",
    "fractions_decimals_percent",
    "Fractions, Decimals & Percentages",
    [7, 8, 9]
  ),
  numericQuestion(
    "y4-q20",
    "What is 25% of 40?",
    "10",
    "fractions_decimals_percent",
    "Fractions, Decimals & Percentages",
    [9, 10]
  ),
];
