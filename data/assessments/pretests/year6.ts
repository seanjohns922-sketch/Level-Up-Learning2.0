import type { Question } from "./prep";

export type { Question };

const strand = "Number";
const difficultyBand = "year6";

function mcqQuestion(
  id: string,
  prompt: string,
  options: string[],
  answer: string,
  skillId: string,
  skillLabel: string,
  linkedWeeks: number[],
  linkedLessons: number[] = [1, 2, 3],
  visual?: Question["visual"]
): Question {
  return {
    type: "mcq",
    id,
    prompt,
    options,
    answer,
    correctAnswer: answer,
    skillId,
    skillLabel,
    linkedWeeks,
    linkedLessons,
    strand,
    difficultyBand,
    visual,
  };
}

function numericQuestion(
  id: string,
  prompt: string,
  answer: string,
  skillId: string,
  skillLabel: string,
  linkedWeeks: number[],
  linkedLessons: number[] = [1, 2, 3],
  visual?: Question["visual"]
): Question {
  return {
    type: "numeric",
    id,
    prompt,
    answer,
    correctAnswer: answer,
    skillId,
    skillLabel,
    linkedWeeks,
    linkedLessons,
    strand,
    difficultyBand,
    visual,
  };
}

export const YEAR6_PRETEST: Question[] = [
  mcqQuestion(
    "y6-q1",
    "In 0.407, what is the value of the digit 4?",
    ["4", "0.4", "0.04", "0.004"],
    "0.4",
    "decimal_place_value",
    "Decimal Place Value",
    [1],
    [1]
  ),
  mcqQuestion(
    "y6-q2",
    "Which list shows the decimals in order from smallest to largest?",
    [
      "0.05, 0.5, 0.505, 0.55",
      "0.5, 0.05, 0.505, 0.55",
      "0.05, 0.505, 0.5, 0.55",
      "0.55, 0.505, 0.5, 0.05",
    ],
    "0.05, 0.5, 0.505, 0.55",
    "decimal_place_value",
    "Decimal Place Value",
    [1],
    [1]
  ),
  numericQuestion(
    "y6-q3",
    "Calculate: 14.75 + 2.8",
    "17.55",
    "decimal_operations",
    "Decimal Operations",
    [1],
    [2]
  ),
  numericQuestion(
    "y6-q4",
    "Calculate: 34.08 ÷ 100",
    "0.3408",
    "decimal_scaling",
    "Decimal Scaling",
    [3],
    [2, 3]
  ),
  mcqQuestion(
    "y6-q5",
    "Which list shows the integers in order from smallest to largest?",
    ["-6, -2, 0, 3", "-2, -6, 0, 3", "0, -2, 3, -6", "3, 0, -2, -6"],
    "-6, -2, 0, 3",
    "integer_reasoning",
    "Integer Reasoning",
    [4],
    [1]
  ),
  numericQuestion(
    "y6-q6",
    "Calculate: -4 + 9",
    "5",
    "integer_reasoning",
    "Integer Reasoning",
    [4],
    [2]
  ),
  mcqQuestion(
    "y6-q7",
    "Which number is a factor of 36 and also a multiple of 3?",
    ["4", "6", "8", "10"],
    "6",
    "factors_multiples",
    "Factors & Multiples",
    [2],
    [2]
  ),
  mcqQuestion(
    "y6-q8",
    "Which of these is a square number?",
    ["18", "25", "27", "30"],
    "25",
    "factors_multiples",
    "Square Numbers & Patterns",
    [2],
    [3]
  ),
  mcqQuestion(
    "y6-q9",
    "Which fraction is greatest?",
    ["2/3", "3/4", "5/8", "7/10"],
    "3/4",
    "fraction_comparison",
    "Fraction Comparison",
    [5],
    [2]
  ),
  mcqQuestion(
    "y6-q10",
    "Convert 2 3/5 to an improper fraction.",
    ["8/5", "10/5", "13/5", "15/5"],
    "13/5",
    "fraction_conversion",
    "Fraction Conversion",
    [5],
    [3]
  ),
  mcqQuestion(
    "y6-q11",
    "Calculate: 1/3 + 1/6",
    ["2/9", "1/2", "2/6", "1/9"],
    "1/2",
    "fraction_operations",
    "Fraction Operations",
    [6],
    [2]
  ),
  numericQuestion(
    "y6-q12",
    "What is 15% of 240?",
    "36",
    "percent_quantity",
    "Percent of a Quantity",
    [7],
    [2]
  ),
  mcqQuestion(
    "y6-q13",
    "A game costs $140. It has a 20% discount. What is the final price?",
    ["$28", "$112", "$118", "$120"],
    "$112",
    "financial_maths",
    "Financial Maths",
    [7, 8, 12],
    [1, 2],
    {
      type: "rule_box",
      title: "Budget Decision",
      steps: ["Original price: $140", "Discount: 20% off", "20% of 140 = 28"],
      decisionLabel: "Subtract the discount from the original price",
    }
  ),
  mcqQuestion(
    "y6-q14",
    "Pack A: $24 for 6 drinks. Pack B: $27 for 9 drinks. Which pack is better value?",
    ["Pack A", "Pack B", "Same value", "Cannot tell"],
    "Pack B",
    "unit_rate_best_buy",
    "Best Value & Unit Rates",
    [8, 12],
    [1, 2],
    {
      type: "best_buy_card_comparison",
      title: "Quantity Comparison",
      cards: [
        {
          label: "Pack A",
          productName: "Drink Pack A",
          price: 24,
          quantityLabel: "6 drinks",
          unitRateLabel: "Cost each",
          unitRate: 4,
        },
        {
          label: "Pack B",
          productName: "Drink Pack B",
          price: 27,
          quantityLabel: "9 drinks",
          unitRateLabel: "Cost each",
          unitRate: 3,
        },
      ],
    }
  ),
  mcqQuestion(
    "y6-q15",
    "Input → Output: 3 → 12, 5 → 20, 7 → 28. What is the rule?",
    ["×4", "+4", "×7", "+12"],
    "×4",
    "patterns_rules",
    "Patterns & Rules",
    [9, 10, 12],
    [1, 2, 3],
    {
      type: "input_output_table",
      title: "Pattern Rule",
      pairs: [
        { input: "3", output: "12" },
        { input: "5", output: "20" },
        { input: "7", output: "28" },
      ],
    }
  ),
  numericQuestion(
    "y6-q16",
    "Solve: x + 18 = 47",
    "29",
    "equations_unknowns",
    "Equations & Unknown Values",
    [11, 12],
    [1, 2],
    {
      type: "balance_equation_card",
      title: "Equation Balance",
      left: "x + 18",
      right: "47",
      unknownSymbol: "x",
    }
  ),
  mcqQuestion(
    "y6-q17",
    "Which coordinate is shown?",
    ["(-2, -3)", "(2, 3)", "(-3, -2)", "(3, -2)"],
    "(-2, -3)",
    "coordinates_movement",
    "Coordinates & Movement",
    [10, 11, 12],
    [2, 3],
    {
      type: "cartesian_grid",
      title: "Coordinate Plane",
      xMin: -5,
      xMax: 5,
      yMin: -5,
      yMax: 5,
      points: [{ x: -2, y: -3, label: "P" }],
    }
  ),
  numericQuestion(
    "y6-q18",
    "Start at (1, -2). Move left 5. What is the new coordinate?",
    "(-4,-2)",
    "coordinates_movement",
    "Coordinates & Movement",
    [10, 11, 12],
    [2, 3],
    {
      type: "cartesian_grid",
      title: "Coordinate Movement",
      xMin: -5,
      xMax: 5,
      yMin: -5,
      yMax: 5,
      points: [{ x: 1, y: -2, label: "Start" }],
      subtitle: "Move left 5. Left changes x only.",
    }
  ),
  numericQuestion(
    "y6-q19",
    "A class has $650. They spend $210 on tickets, $140 on food, and $90 on transport. How much money remains?",
    "210",
    "financial_maths",
    "Financial Maths",
    [8, 12],
    [1, 3],
    {
      type: "rule_box",
      title: "Budget Decision",
      steps: ["Budget: $650", "Tickets: $210", "Food: $140", "Transport: $90"],
      decisionLabel: "Add the costs, then subtract from the budget",
    }
  ),
  mcqQuestion(
    "y6-q20",
    "Evaluate: 30 ÷ 5 + 7",
    ["13", "6", "12", "1"],
    "13",
    "order_of_operations",
    "Order of Operations",
    [11, 12],
    [1, 3],
    {
      type: "expression_flow",
      title: "Order of Operations",
      cards: [
        {
          tokens: ["30", "÷", "5", "+", "7"],
          highlightRange: [0, 2],
          result: "6 + 7",
          note: "Divide first, then add.",
        },
      ],
    }
  ),
];
