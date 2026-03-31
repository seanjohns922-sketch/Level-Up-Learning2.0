import { buildProgram, type ProgramRow } from "./buildProgram";
import type { LessonActivity } from "./types";

function makeActivity(
  activityType: LessonActivity["activityType"],
  weight: number,
  config: Record<string, unknown>
): LessonActivity {
  return { activityType, weight, config };
}

const year4Rows: ProgramRow[] = [
  {
    week: 1,
    focus: "Place Value to 100,000",
    lesson: 1,
    topic: "Digit Values",
    activity: "Identify value of digits in 5- and 6-digit numbers using MAB blocks and charts",
    curriculum: ["AC9M4N01"],
    activities: [
      makeActivity("place_value_builder", 2, {
        min: 10000,
        max: 100000,
        placeValues: ["hundred_thousands", "ten_thousands", "thousands", "hundreds", "tens", "ones"],
        visualMode: "mab",
        mode: "digit_value",
      }),
      makeActivity("typed_response", 1, {
        min: 10000,
        max: 100000,
        mode: "digit_value",
        sourceActivityType: "place_value_builder",
      }),
    ],
  },
  {
    week: 1,
    focus: "Place Value to 100,000",
    lesson: 2,
    topic: "Expanded & Standard Form",
    activity: "Convert between standard and expanded form using digit cards",
    curriculum: ["AC9M4N01"],
    activities: [
      makeActivity("partition_expand", 2, {
        min: 10000,
        max: 100000,
        mode: "expand",
      }),
      makeActivity("typed_response", 1, {
        min: 10000,
        max: 100000,
        mode: "expand",
        sourceActivityType: "partition_expand",
      }),
    ],
  },
  {
    week: 1,
    focus: "Place Value to 100,000",
    lesson: 3,
    topic: "Word Form & Numerals",
    activity: "Match numbers in word form and numerals; write large numbers",
    curriculum: ["AC9M4N01"],
    activities: [
      makeActivity("multiple_choice", 2, {
        min: 10000,
        max: 100000,
        mode: "word_form_match",
      }),
      makeActivity("typed_response", 1, {
        min: 10000,
        max: 100000,
        mode: "write_numeral",
      }),
    ],
  },
  {
    week: 2,
    focus: "Place Value incl. Tenths & Hundredths",
    lesson: 1,
    topic: "Tenths in Money",
    activity: "Use coins to represent decimals like 0.1 and 0.2",
    curriculum: ["AC9M4N01"],
    activities: [
      makeActivity("multiple_choice", 2, {
        mode: "decimal_money",
        decimals: ["0.1", "0.2", "0.5", "0.9"],
      }),
      makeActivity("typed_response", 1, {
        mode: "decimal_money",
      }),
    ],
  },
  {
    week: 2,
    focus: "Place Value incl. Tenths & Hundredths",
    lesson: 2,
    topic: "Hundredths in Measurement",
    activity: "Use rulers and measuring tapes to show hundredths of a metre",
    curriculum: ["AC9M4N01"],
    activities: [
      makeActivity("number_line", 2, {
        min: 0,
        max: 1,
        step: 0.01,
        mode: "decimal_measurement",
      }),
      makeActivity("typed_response", 1, {
        mode: "decimal_measurement",
        sourceActivityType: "number_line",
      }),
    ],
  },
  {
    week: 2,
    focus: "Place Value incl. Tenths & Hundredths",
    lesson: 3,
    topic: "Decimals on Number Lines",
    activity: "Place tenths and hundredths accurately on number lines",
    curriculum: ["AC9M4N01"],
    activities: [
      makeActivity("number_line", 2, {
        min: 0,
        max: 1,
        step: 0.1,
        mode: "decimal_placement",
      }),
      makeActivity("number_line", 1, {
        min: 0,
        max: 1,
        step: 0.01,
        mode: "decimal_placement",
      }),
    ],
  },
  {
    week: 3,
    focus: "Rounding & Estimating",
    lesson: 1,
    topic: "Round to Nearest 10, 100, 1000",
    activity: "Round large numbers using number lines and charts",
    curriculum: ["AC9M4N07"],
    activities: [
      makeActivity("number_line", 2, {
        min: 1000,
        max: 100000,
        mode: "rounding",
        targets: [10, 100, 1000],
      }),
      makeActivity("typed_response", 1, {
        min: 1000,
        max: 100000,
        mode: "rounding",
        targets: [10, 100, 1000],
        sourceActivityType: "number_line",
      }),
    ],
  },
  {
    week: 3,
    focus: "Rounding & Estimating",
    lesson: 2,
    topic: "Estimate Totals",
    activity: "Estimate sums in real-world problems; justify estimates",
    curriculum: ["AC9M4N07"],
    activities: [
      makeActivity("mixed_word_problem", 2, {
        mode: "estimate_total",
        operations: ["addition"],
      }),
      makeActivity("multiple_choice", 1, {
        mode: "estimate_total",
        sourceActivityType: "mixed_word_problem",
      }),
    ],
  },
  {
    week: 3,
    focus: "Rounding & Estimating",
    lesson: 3,
    topic: "Real-World Estimating",
    activity: "Apply rounding/estimating to shopping list totals and distances",
    curriculum: ["AC9M4N07"],
    activities: [
      makeActivity("mixed_word_problem", 2, {
        mode: "real_world_estimate",
        operations: ["addition", "subtraction"],
      }),
      makeActivity("typed_response", 1, {
        mode: "real_world_estimate",
        sourceActivityType: "mixed_word_problem",
      }),
    ],
  },
  {
    week: 4,
    focus: "Comparing & Ordering Numbers",
    lesson: 1,
    topic: "Compare with < > =",
    activity: "Use symbols to compare multi-digit and decimal numbers",
    curriculum: ["AC9M4N01"],
    activities: [
      makeActivity("multiple_choice", 2, {
        mode: "compare_symbols",
        min: 0,
        max: 100000,
      }),
      makeActivity("typed_response", 1, {
        mode: "compare_symbols",
      }),
    ],
  },
  {
    week: 4,
    focus: "Comparing & Ordering Numbers",
    lesson: 2,
    topic: "Ordering Numbers",
    activity: "Sort numbers in ascending/descending order",
    curriculum: ["AC9M4N01"],
    activities: [
      makeActivity("number_order", 2, {
        min: 0,
        max: 100000,
        count: 4,
        ascending: true,
      }),
      makeActivity("number_order", 1, {
        min: 0,
        max: 100000,
        count: 4,
        ascending: false,
      }),
    ],
  },
  {
    week: 4,
    focus: "Comparing & Ordering Numbers",
    lesson: 3,
    topic: "Number Line Placement",
    activity: "Place numbers accurately on large number lines",
    curriculum: ["AC9M4N01"],
    activities: [
      makeActivity("number_line", 2, {
        min: 0,
        max: 100000,
        step: 1000,
        mode: "placement",
      }),
      makeActivity("number_line", 1, {
        min: 0,
        max: 100000,
        step: 10000,
        mode: "estimate",
      }),
    ],
  },
  {
    week: 5,
    focus: "Odd & Even Numbers",
    lesson: 1,
    topic: "Classifying Odd & Even",
    activity: "Sort and classify odd/even numbers using counters",
    curriculum: ["AC9M4N02"],
    activities: [
      makeActivity("odd_even_sort", 2, {
        min: 0,
        max: 1000,
        mode: "classify",
      }),
      makeActivity("multiple_choice", 1, {
        mode: "odd_even_reasoning",
      }),
    ],
  },
  {
    week: 5,
    focus: "Odd & Even Numbers",
    lesson: 2,
    topic: "Odd/Even Addition",
    activity: "Investigate patterns in adding odd and even numbers",
    curriculum: ["AC9M4N02"],
    activities: [
      makeActivity("addition_strategy", 2, {
        min: 10,
        max: 1000,
        mode: "odd_even_patterns",
      }),
      makeActivity("multiple_choice", 1, {
        mode: "odd_even_patterns",
      }),
    ],
  },
  {
    week: 5,
    focus: "Odd & Even Numbers",
    lesson: 3,
    topic: "Odd/Even Multiplication",
    activity: "Explore multiplication of odd/even numbers and outcomes",
    curriculum: ["AC9M4N02"],
    activities: [
      makeActivity("arrays", 2, {
        mode: "odd_even_multiplication",
      }),
      makeActivity("multiple_choice", 1, {
        mode: "odd_even_multiplication",
      }),
    ],
  },
  {
    week: 6,
    focus: "Multiplying & Dividing by 10, 100, 1000",
    lesson: 1,
    topic: "Multiplying by 10",
    activity: "Shift digits using place value sliders and money examples",
    curriculum: ["AC9M4N05"],
    activities: [
      makeActivity("typed_response", 2, {
        mode: "multiply_by_powers_of_ten",
        factors: [10, 100, 1000],
      }),
      makeActivity("multiple_choice", 1, {
        mode: "multiply_by_powers_of_ten",
      }),
    ],
  },
  {
    week: 6,
    focus: "Multiplying & Dividing by 10, 100, 1000",
    lesson: 2,
    topic: "Dividing by 10",
    activity: "Use arrays and charts to divide by 10, 100, 1000",
    curriculum: ["AC9M4N05"],
    activities: [
      makeActivity("typed_response", 2, {
        mode: "divide_by_powers_of_ten",
        factors: [10, 100, 1000],
      }),
      makeActivity("multiple_choice", 1, {
        mode: "divide_by_powers_of_ten",
      }),
    ],
  },
  {
    week: 6,
    focus: "Multiplying & Dividing by 10, 100, 1000",
    lesson: 3,
    topic: "Mixed Operations",
    activity: "Apply scaling with money and measurement contexts",
    curriculum: ["AC9M4N05"],
    activities: [
      makeActivity("mixed_word_problem", 2, {
        mode: "scaling_contexts",
        operations: ["multiplication", "division"],
      }),
      makeActivity("typed_response", 1, {
        mode: "scaling_contexts",
        sourceActivityType: "mixed_word_problem",
      }),
    ],
  },
  {
    week: 7,
    focus: "Strategies for Multi-Digit Operations",
    lesson: 1,
    topic: "Column Addition",
    activity: "Add multi-digit numbers using regrouping algorithms",
    curriculum: ["AC9M4N06"],
    activities: [
      makeActivity("typed_response", 2, {
        mode: "written_addition",
        operation: "addition",
        regrouping: true,
      }),
      makeActivity("multiple_choice", 1, {
        mode: "written_addition",
      }),
    ],
  },
  {
    week: 7,
    focus: "Strategies for Multi-Digit Operations",
    lesson: 2,
    topic: "Column Subtraction",
    activity: "Subtract using regrouping with vertical format",
    curriculum: ["AC9M4N06"],
    activities: [
      makeActivity("typed_response", 2, {
        mode: "written_subtraction",
        operation: "subtraction",
        regrouping: true,
      }),
      makeActivity("multiple_choice", 1, {
        mode: "written_subtraction",
      }),
    ],
  },
  {
    week: 7,
    focus: "Strategies for Multi-Digit Operations",
    lesson: 3,
    topic: "Efficient Multiplication",
    activity: "Use area models and short multiplication strategies",
    curriculum: ["AC9M4N06"],
    activities: [
      makeActivity("arrays", 2, {
        mode: "area_model",
      }),
      makeActivity("typed_response", 1, {
        mode: "short_multiplication",
      }),
    ],
  },
  {
    week: 8,
    focus: "Problem Solving with Money & Multiplication",
    lesson: 1,
    topic: "Budgeting Problems",
    activity: "Plan a shopping trip with a set budget",
    curriculum: ["AC9M4N06", "AC9M4N08"],
    activities: [
      makeActivity("mixed_word_problem", 2, {
        mode: "budgeting",
        operations: ["addition", "subtraction"],
      }),
      makeActivity("typed_response", 1, {
        mode: "budgeting",
        sourceActivityType: "mixed_word_problem",
      }),
    ],
  },
  {
    week: 8,
    focus: "Problem Solving with Money & Multiplication",
    lesson: 2,
    topic: "Shop Role-Plays",
    activity: "Simulate purchases with coins and notes; calculate change",
    curriculum: ["AC9M4N06", "AC9M4N08"],
    activities: [
      makeActivity("mixed_word_problem", 2, {
        mode: "shop_transactions",
        operations: ["addition", "subtraction"],
      }),
      makeActivity("multiple_choice", 1, {
        mode: "shop_transactions",
        sourceActivityType: "mixed_word_problem",
      }),
    ],
  },
  {
    week: 8,
    focus: "Problem Solving with Money & Multiplication",
    lesson: 3,
    topic: "Multi-Step Problems",
    activity: "Solve word problems with 2+ steps involving multiplication",
    curriculum: ["AC9M4N06", "AC9M4N08"],
    activities: [
      makeActivity("mixed_word_problem", 2, {
        mode: "two_step_problem",
        operations: ["multiplication", "addition", "subtraction"],
      }),
      makeActivity("typed_response", 1, {
        mode: "two_step_problem",
        sourceActivityType: "mixed_word_problem",
      }),
    ],
  },
  {
    week: 9,
    focus: "Fractions & Decimals",
    lesson: 1,
    topic: "Fraction Walls",
    activity: "Build fraction walls to explore halves, quarters, eighths",
    curriculum: ["AC9M4N03", "AC9M4N04"],
    activities: [
      makeActivity("area_model_select", 2, {
        mode: "fraction_wall",
        denominators: [2, 4, 8],
      }),
      makeActivity("equivalent_fraction_match", 1, {
        denominators: [2, 4, 8],
      }),
    ],
  },
  {
    week: 9,
    focus: "Fractions & Decimals",
    lesson: 2,
    topic: "Fractions to Decimals",
    activity: "Link fractions (1/2, 1/4, 3/4) to decimals (0.5, 0.25, 0.75)",
    curriculum: ["AC9M4N03"],
    activities: [
      makeActivity("equivalent_fraction_match", 2, {
        mode: "fraction_decimal_match",
        allowedPairs: [
          ["1/2", "0.5"],
          ["1/4", "0.25"],
          ["3/4", "0.75"],
        ],
      }),
      makeActivity("multiple_choice", 1, {
        mode: "fraction_decimal_match",
      }),
    ],
  },
  {
    week: 9,
    focus: "Fractions & Decimals",
    lesson: 3,
    topic: "Fractions on Number Lines",
    activity: "Place unit fractions on number lines and count by them",
    curriculum: ["AC9M4N04"],
    activities: [
      makeActivity("number_line_place", 2, {
        denominators: [2, 4, 8],
      }),
      makeActivity("fraction_compare", 1, {
        mode: "order",
        denominators: [2, 4, 8],
      }),
    ],
  },
  {
    week: 10,
    focus: "Counting by Fractions & Mixed Numerals",
    lesson: 1,
    topic: "Skip Counting Fractions",
    activity: "Skip count by halves, quarters; use visual models",
    curriculum: ["AC9M4N04"],
    activities: [
      makeActivity("number_line_place", 2, {
        mode: "skip_count_fraction",
        denominators: [2, 4],
      }),
      makeActivity("area_model_select", 1, {
        mode: "skip_count_fraction",
        denominators: [2, 4],
      }),
    ],
  },
  {
    week: 10,
    focus: "Counting by Fractions & Mixed Numerals",
    lesson: 2,
    topic: "Mixed Numerals",
    activity: "Represent and count using mixed numerals",
    curriculum: ["AC9M4N04"],
    activities: [
      makeActivity("number_line_place", 2, {
        mode: "mixed_numerals",
        denominators: [2, 4],
      }),
      makeActivity("multiple_choice", 1, {
        mode: "mixed_numerals",
      }),
    ],
  },
  {
    week: 10,
    focus: "Counting by Fractions & Mixed Numerals",
    lesson: 3,
    topic: "Combining Unit Fractions",
    activity: "Add fractions with the same denominator to form a whole",
    curriculum: ["AC9M4N03", "AC9M4N04"],
    activities: [
      makeActivity("build_the_whole", 2, {
        denominators: [2, 4, 8],
      }),
      makeActivity("fraction_compare", 1, {
        mode: "same_denominator_combine",
        denominators: [2, 4, 8],
      }),
    ],
  },
  {
    week: 11,
    focus: "Problem Solving (Core)",
    lesson: 1,
    topic: "Additive vs Multiplicative Problems",
    activity: "Solve real-world problems by deciding whether the situation is additive or multiplicative",
    curriculum: ["AC9M4N06", "AC9M4N08"],
    activities: [
      makeActivity("mixed_word_problem", 2, {
        mode: "operation_choice_problem_solving",
        operations: ["addition", "subtraction", "multiplication"],
      }),
      makeActivity("multiple_choice", 1, {
        mode: "operation_choice_problem_solving",
        sourceActivityType: "mixed_word_problem",
      }),
    ],
  },
  {
    week: 11,
    focus: "Problem Solving (Core)",
    lesson: 2,
    topic: "Financial Transactions",
    activity: "Use money contexts to calculate totals, change, and simple budgets",
    curriculum: ["AC9M4N07", "AC9M4N08"],
    activities: [
      makeActivity("mixed_word_problem", 2, {
        mode: "financial_problem_solving",
        operations: ["addition", "subtraction", "multiplication"],
      }),
      makeActivity("typed_response", 1, {
        mode: "financial_problem_solving",
        sourceActivityType: "mixed_word_problem",
      }),
    ],
  },
  {
    week: 11,
    focus: "Problem Solving (Core)",
    lesson: 3,
    topic: "Multi-Step Problems",
    activity: "Solve two-step word problems by choosing the order of operations and tracking the steps",
    curriculum: ["AC9M4N06", "AC9M4N08"],
    activities: [
      makeActivity("mixed_word_problem", 2, {
        mode: "core_two_step_problem",
        operations: ["addition", "subtraction", "multiplication", "division"],
      }),
      makeActivity("typed_response", 1, {
        mode: "core_two_step_problem",
        sourceActivityType: "mixed_word_problem",
      }),
    ],
  },
  {
    week: 12,
    focus: "Problem Solving (Advanced)",
    lesson: 1,
    topic: "Multi-Step Problems (Harder)",
    activity: "Solve harder multi-step problems with larger numbers and less obvious solution paths",
    curriculum: ["AC9M4N06", "AC9M4N08"],
    activities: [
      makeActivity("mixed_word_problem", 2, {
        mode: "advanced_two_step_problem",
        operations: ["addition", "subtraction", "multiplication", "division"],
      }),
      makeActivity("typed_response", 1, {
        mode: "advanced_two_step_problem",
        sourceActivityType: "mixed_word_problem",
      }),
    ],
  },
  {
    week: 12,
    focus: "Problem Solving (Advanced)",
    lesson: 2,
    topic: "Mixed Contexts",
    activity: "Solve multi-step problems in money, measurement, and time contexts",
    curriculum: ["AC9M4N07", "AC9M4N08"],
    activities: [
      makeActivity("mixed_word_problem", 2, {
        mode: "mixed_context_problem",
        operations: ["addition", "subtraction", "multiplication", "division"],
      }),
      makeActivity("typed_response", 1, {
        mode: "mixed_context_problem",
        sourceActivityType: "mixed_word_problem",
      }),
    ],
  },
  {
    week: 12,
    focus: "Problem Solving (Advanced)",
    lesson: 3,
    topic: "Strategy Selection & Reasonableness",
    activity: "Choose a sensible method, solve, and check whether the answer is reasonable",
    curriculum: ["AC9M4N06", "AC9M4N07", "AC9M4N08"],
    activities: [
      makeActivity("mixed_word_problem", 2, {
        mode: "reasonableness_check",
        operations: ["addition", "subtraction", "multiplication", "division"],
      }),
      makeActivity("multiple_choice", 1, {
        mode: "reasonableness_check",
        sourceActivityType: "mixed_word_problem",
      }),
    ],
  },
];

export const YEAR4_PROGRAM = buildProgram(4, "Number", year4Rows);
