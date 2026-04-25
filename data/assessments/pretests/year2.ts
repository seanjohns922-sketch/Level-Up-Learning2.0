import type { Question } from "./prep";

export type { Question };

const strand = "Number";
const difficultyBand = "year2";

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

export const YEAR2_PRETEST: Question[] = [
  mcqQuestion("y2-q1", "Write this number in digits: Seven hundred and thirty-two", ["723", "732", "7032", "7302"], "732", "place_value", "Place Value", [1]),
  mcqQuestion("y2-q2", "What is the value of 4 in 546?", ["4", "40", "400", "54"], "40", "place_value", "Place Value", [1]),
  mcqQuestion("y2-q3", "Expand this number: 382", ["300 + 80 + 2", "30 + 8 + 2", "300 + 82", "380 + 2 + 20"], "300 + 80 + 2", "place_value", "Place Value", [1]),
  mcqQuestion("y2-q4", "What number comes before 600?", ["601", "599", "590", "598"], "599", "number_patterns", "Number Patterns", [1]),
  mcqQuestion("y2-q5", "What number is 10 more than 215?", ["205", "216", "225", "315"], "225", "number_patterns", "Number Patterns", [1]),
  mcqQuestion("y2-q6", "Is 274 an odd or even number?", ["Odd", "Even"], "Even", "odd_even", "Odd and Even Numbers", [2]),
  mcqQuestion("y2-q7", "Circle the odd number: 108, 207, 402", ["108", "207", "402"], "207", "odd_even", "Odd and Even Numbers", [2]),
  mcqQuestion("y2-q8", "Place these numbers in order: 145, 451, 154", ["451, 154, 145", "145, 154, 451", "154, 145, 451", "145, 451, 154"], "145, 154, 451", "ordering_numbers", "Order Numbers", [1]),
  mcqQuestion("y2-q9", "What number is halfway between 100 and 200?", ["150", "120", "100", "200"], "150", "number_patterns", "Number Patterns", [1, 2]),
  mcqQuestion("y2-q10", "Round 178 to the nearest 10", ["170", "178", "180", "190"], "180", "rounding", "Rounding", [2]),
  mcqQuestion("y2-q11", "Which strategy would you use to solve 54 + 29?", ["Split or jump strategy", "Only skip counting by 2s", "Guess and check", "Use division first"], "Split or jump strategy", "addition_strategy", "Addition Strategies", [3]),
  mcqQuestion("y2-q12", "Solve: 47 + 30 using friendly numbers", ["40 + 30 + 7 = 77", "50 + 30 + 7 = 87", "47 + 3 = 50", "70 + 7 = 67"], "50 + 30 + 7 = 87", "addition_strategy", "Addition Strategies", [3]),
  mcqQuestion("y2-q13", "Which number sentence is part of the fact family: 6 + 3 = 9", ["9 - 6 = 3", "9 + 6 = 3", "6 - 3 = 9", "3 + 9 = 6"], "9 - 6 = 3", "fact_families", "Fact Families", [3]),
  mcqQuestion("y2-q14", "Solve: 83 - 40 using a jump strategy", ["53", "43", "47", "123"], "43", "subtraction_strategy", "Subtraction Strategies", [3]),
  mcqQuestion("y2-q15", "What multiplication sentence matches: 3 groups of 5?", ["3 x 5", "3 + 5", "5 - 3", "5 / 3"], "3 x 5", "multiplication_groups", "Multiplication as Groups", [5]),
  mcqQuestion("y2-q16", "Draw or describe an array for: 4 x 2", ["4 rows of 2 or 2 rows of 4", "4 rows of 4", "2 rows of 2", "8 rows of 1 only"], "4 rows of 2 or 2 rows of 4", "arrays", "Arrays", [5]),
  mcqQuestion("y2-q17", "What is 5 more than 3 tens?", ["8", "35", "53", "25"], "35", "place_value", "Place Value", [1]),
  mcqQuestion("y2-q18", "Skip count by 10s starting at 60 (write next 3 numbers)", ["61, 62, 63", "70, 80, 90", "65, 75, 85", "100, 110, 120"], "70, 80, 90", "skip_counting", "Skip Counting", [2]),
  mcqQuestion("y2-q19", "Which operation would you use to share 12 cookies equally between 3 friends?", ["Addition", "Subtraction", "Multiplication", "Division"], "Division", "sharing_division", "Sharing Equally", [6]),
  mcqQuestion("y2-q20", "Solve: 10 ÷ 2", ["2", "4", "5", "8"], "5", "sharing_division", "Sharing Equally", [6]),
];
