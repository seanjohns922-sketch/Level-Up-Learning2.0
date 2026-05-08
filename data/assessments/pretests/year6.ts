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
  numericQuestion(
    "y6-q2",
    "Write 35% as a decimal.",
    "0.35",
    "fractions_decimals_percentages",
    "Fractions, Decimals & Percentages",
    [1, 6, 12],
    [1, 3],
    {
      type: "decimal_model",
      model: "place_value_chart",
      ones: 0,
      tenths: 3,
      hundredths: 5,
    }
  ),
  mcqQuestion(
    "y6-q3",
    "Which number is prime?",
    ["27", "31", "33", "51"],
    "31",
    "prime_composite",
    "Prime & Composite Numbers",
    [2],
    [1, 2],
    {
      type: "rule_box",
      title: "Strategy Selection",
      steps: ["Prime numbers have exactly 2 factors", "Test small factor pairs"],
      decisionLabel: "Look for a number with no extra factor pairs",
    }
  ),
  mcqQuestion(
    "y6-q4",
    "Which fraction is equal to 0.25?",
    ["1/4", "1/25", "2/5", "Both 1/4 and 25/100"],
    "Both 1/4 and 25/100",
    "fractions_decimals_percentages",
    "Fractions, Decimals & Percentages",
    [5, 6],
    [1, 2],
    {
      type: "decimal_model",
      model: "tenths_bar",
      numerator: 25,
      denominator: 100,
    }
  ),
  numericQuestion(
    "y6-q5",
    "A pack has 7 items. How many items are in 5 packs?",
    "35",
    "multiplicative_reasoning",
    "Multiplication & Equal Groups",
    [10, 12],
    [1, 2],
    {
      type: "rule_box",
      title: "Quantity Comparison",
      steps: ["5 equal packs", "7 items in each pack"],
      decisionLabel: "Use multiplication for equal groups",
    }
  ),
  mcqQuestion(
    "y6-q6",
    "A game costs $140. It has a 20% discount. What is the final price?",
    ["$28", "$112", "$118", "$120"],
    "$112",
    "financial_maths",
    "Financial Maths",
    [7, 12],
    [1, 2],
    {
      type: "rule_box",
      title: "Budget Decision",
      steps: ["Original price: $140", "Discount: 20% off", "20% of 140 = 28"],
      decisionLabel: "Subtract the discount from the original price",
    }
  ),
  numericQuestion(
    "y6-q7",
    "Budget: $450. Spent: $160 on transport and $90 on tickets. How much money remains?",
    "200",
    "financial_maths",
    "Financial Maths",
    [7, 12],
    [1, 2],
    {
      type: "rule_box",
      title: "Budget Decision",
      steps: ["Budget: $450", "Transport: $160", "Tickets: $90"],
      decisionLabel: "Subtract the total spending from the budget",
    }
  ),
  mcqQuestion(
    "y6-q8",
    "Pack A: $24 for 6 drinks. Pack B: $27 for 9 drinks. Which pack is better value?",
    ["Pack A", "Pack B", "Same value", "Cannot tell"],
    "Pack B",
    "unit_rate_best_buy",
    "Best Value & Unit Rates",
    [12],
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
    "y6-q9",
    "Which operation should be used first? 20 − 4 × 2",
    ["subtraction", "multiplication", "addition", "estimation"],
    "multiplication",
    "order_of_operations",
    "Order of Operations",
    [11, 12],
    [1, 3],
    {
      type: "expression_flow",
      title: "Choose the First Step",
      cards: [
        {
          tokens: ["20", "−", "4", "×", "2"],
          highlightRange: [2, 4],
          note: "Multiplication happens before subtraction.",
        },
      ],
    }
  ),
  numericQuestion(
    "y6-q10",
    "What is 25% of 200?",
    "50",
    "fractions_decimals_percentages",
    "Fractions, Decimals & Percentages",
    [6, 12],
    [1, 3],
    {
      type: "decimal_model",
      model: "tenths_bar",
      numerator: 25,
      denominator: 100,
    }
  ),
  numericQuestion(
    "y6-q11",
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
    "y6-q12",
    "Solve: 6 × y = 54",
    ["6", "8", "9", "48"],
    "9",
    "equations_unknowns",
    "Equations & Unknown Values",
    [11, 12],
    [1, 2],
    {
      type: "balance_equation_card",
      title: "Equation Balance",
      left: "6 × y",
      right: "54",
      unknownSymbol: "y",
    }
  ),
  mcqQuestion(
    "y6-q13",
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
    "y6-q14",
    "Rule: multiply by 7. What is the output for input 8?",
    "56",
    "patterns_rules",
    "Patterns & Rules",
    [9, 10, 12],
    [1, 2, 3],
    {
      type: "function_machine_card",
      title: "Pattern Rule",
      input: "8",
      rule: "×7",
      output: "?",
    }
  ),
  mcqQuestion(
    "y6-q15",
    "Which statement is true?",
    [
      "Equations must stay balanced",
      "The equal sign means write the answer",
      "Patterns never use multiplication",
      "Operation order does not matter",
    ],
    "Equations must stay balanced",
    "equations_unknowns",
    "Equations & Unknown Values",
    [11, 12],
    [1, 2],
    {
      type: "rule_box",
      title: "Strategy Selection",
      steps: ["The equal sign shows both sides are the same", "Solve by keeping the balance true"],
      decisionLabel: "Balanced equations stay equal",
    }
  ),
  mcqQuestion(
    "y6-q16",
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
    "y6-q17",
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
  mcqQuestion(
    "y6-q18",
    "Which quadrant contains (4, -3)?",
    ["Quadrant I", "Quadrant II", "Quadrant III", "Quadrant IV"],
    "Quadrant IV",
    "coordinates_movement",
    "Coordinates & Movement",
    [10, 11, 12],
    [2, 3],
    {
      type: "cartesian_grid",
      title: "Quadrant Check",
      xMin: -5,
      xMax: 5,
      yMin: -5,
      yMax: 5,
      points: [{ x: 4, y: -3, label: "Q" }],
    }
  ),
  numericQuestion(
    "y6-q19",
    "A class has $650. They spend $210 on tickets, $140 on food, and $90 on transport. How much money remains?",
    "210",
    "financial_maths",
    "Financial Maths",
    [7, 12],
    [1, 2],
    {
      type: "rule_box",
      title: "Budget Decision",
      steps: ["Budget: $650", "Tickets: $210", "Food: $140", "Transport: $90"],
      decisionLabel: "Add the costs, then subtract from the budget",
    }
  ),
  mcqQuestion(
    "y6-q20",
    "Which skill is MOST important when solving multi-step problems?",
    [
      "Choosing a strategy before solving",
      "Guessing quickly",
      "Ignoring operation order",
      "Using the biggest numbers first",
    ],
    "Choosing a strategy before solving",
    "problem_solving_reasoning",
    "Problem Solving & Reasoning",
    [11, 12],
    [1, 2, 3],
    {
      type: "rule_box",
      title: "Readiness Check",
      steps: ["Read the whole problem", "Choose a strategy", "Follow the steps in order"],
      decisionLabel: "Strong problem-solvers choose a strategy first",
    }
  ),
];
