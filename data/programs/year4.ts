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
    weekTopic: "Place Value with Larger Numbers",
    focus: "Read, build, and identify digit values in large numbers",
    lesson: 1,
    topic: "Place Value Using Larger Numbers",
    activity: "Identify value of digits in 5- and 6-digit numbers using MAB blocks and charts",
    curriculum: ["AC9M4N01"],
    activities: [
      makeActivity("place_value_builder", 2, {
        min: 10000,
        max: 999999,
        placeValues: ["hundred_thousands", "ten_thousands", "thousands", "hundreds", "tens", "ones"],
        visualMode: "mab",
        mode: "identify_number",
      }),
      makeActivity("place_value_builder", 2, {
        min: 10000,
        max: 999999,
        placeValues: ["hundred_thousands", "ten_thousands", "thousands", "hundreds", "tens", "ones"],
        visualMode: "mab",
        mode: "identify_place",
      }),
      makeActivity("place_value_builder", 1, {
        min: 10000,
        max: 999999,
        placeValues: ["hundred_thousands", "ten_thousands", "thousands", "hundreds", "tens", "ones"],
        visualMode: "mab",
        hideOnePlaceValue: true,
      }),
      makeActivity("multiple_choice", 1, {
        min: 10000,
        max: 999999,
        mode: "identify_place",
        sourceActivityType: "place_value_builder",
      }),
    ],
  },
  {
    week: 1,
    focus: "Convert between expanded and standard form with large numbers",
    lesson: 2,
    topic: "Expanded & Standard Form (Larger Numbers)",
    activity: "Convert between standard and expanded form using digit cards",
    curriculum: ["AC9M4N01"],
    activities: [
      makeActivity("partition_expand", 2, {
        min: 10000,
        max: 999999,
        mode: "expand",
      }),
      makeActivity("typed_response", 1, {
        min: 10000,
        max: 999999,
        mode: "expand",
        sourceActivityType: "partition_expand",
      }),
    ],
  },
  {
    week: 1,
    focus: "Read and write large numbers in words and numerals",
    lesson: 3,
    topic: "Word Form & Numerals (Larger Numbers)",
    activity: "Read and write large numbers in words and match them to numerals, for example one hundred and eighty-six thousand.",
    curriculum: ["AC9M4N01"],
    activities: [
      makeActivity("multiple_choice", 2, {
        min: 10000,
        max: 999999,
        mode: "word_form_match",
      }),
      makeActivity("typed_response", 1, {
        min: 10000,
        max: 999999,
        mode: "write_numeral",
      }),
    ],
  },
  {
    week: 2,
    weekTopic: "Decimal Place Value",
    focus: "Decimal Place Value (Core)",
    lesson: 1,
    topic: "Tenths as Place Value",
    activity: "Read, represent, and identify tenths as place value using decimal models and charts",
    curriculum: ["AC9M4N01"],
    activities: [
      makeActivity("multiple_choice", 2, {
        mode: "tenths_place_value",
      }),
      makeActivity("typed_response", 1, {
        mode: "tenths_place_value",
      }),
    ],
  },
  {
    week: 2,
    focus: "Decimal Place Value (Core)",
    lesson: 2,
    topic: "Hundredths as Place Value",
    activity: "Read, represent, and identify hundredths as place value using decimal models and charts",
    curriculum: ["AC9M4N01"],
    activities: [
      makeActivity("multiple_choice", 2, {
        mode: "hundredths_place_value",
      }),
      makeActivity("typed_response", 1, {
        mode: "hundredths_place_value",
      }),
    ],
  },
  {
    week: 2,
    focus: "Decimal Place Value (Core)",
    lesson: 3,
    topic: "Representing Decimals",
    activity: "Represent decimals with place value charts, digit cards, and decimal models",
    curriculum: ["AC9M4N01"],
    activities: [
      makeActivity("multiple_choice", 2, {
        mode: "represent_decimals",
      }),
      makeActivity("typed_response", 1, {
        mode: "represent_decimals",
      }),
    ],
  },
  {
    week: 3,
    weekTopic: "Decimal Reasoning",
    focus: "Decimal Reasoning",
    lesson: 1,
    topic: "Comparing Decimals",
    activity: "Compare decimals using place value reasoning and symbols",
    curriculum: ["AC9M4N01"],
    activities: [
      makeActivity("multiple_choice", 2, {
        mode: "decimal_compare",
      }),
      makeActivity("typed_response", 1, {
        mode: "decimal_compare",
      }),
    ],
  },
  {
    week: 3,
    focus: "Decimal Reasoning",
    lesson: 2,
    topic: "Ordering Decimals",
    activity: "Order decimals from smallest to largest using place value understanding",
    curriculum: ["AC9M4N01"],
    activities: [
      makeActivity("number_order", 2, {
        min: 0.1,
        max: 9.99,
        count: 4,
        ascending: true,
        step: 0.1,
        mode: "decimal_order",
      }),
      makeActivity("number_order", 1, {
        min: 0.1,
        max: 9.99,
        count: 4,
        ascending: false,
        step: 0.01,
        mode: "decimal_order",
      }),
      makeActivity("multiple_choice", 1, {
        min: 0.1,
        max: 9.99,
        count: 4,
        ascending: true,
        step: 0.1,
        mode: "decimal_order",
        sourceActivityType: "number_order",
      }),
      makeActivity("typed_response", 1, {
        min: 0.1,
        max: 9.99,
        count: 4,
        ascending: false,
        step: 0.01,
        mode: "decimal_order",
        sourceActivityType: "number_order",
      }),
    ],
  },
  {
    week: 3,
    focus: "Decimal Reasoning",
    lesson: 3,
    topic: "Decimals on Number Lines",
    activity: "Place tenths and hundredths accurately on number lines after comparing and ordering decimals",
    curriculum: ["AC9M4N01"],
    activities: [
      makeActivity("number_line", 2, {
        min: 0,
        max: 1,
        step: 0.1,
        mode: "placement",
      }),
      makeActivity("number_line", 1, {
        min: 0,
        max: 1,
        step: 0.01,
        mode: "placement",
      }),
    ],
  },
  {
    week: 4,
    weekTopic: "Comparing, Ordering & Number Lines",
    focus: "Comparing & Ordering Numbers",
    lesson: 1,
    topic: "Compare with < > =",
    activity: "Compare 4-, 5-, and 6-digit whole numbers using <, >, and =",
    curriculum: ["AC9M4N01"],
    activities: [
      makeActivity("multiple_choice", 2, {
        mode: "compare_symbols",
        min: 1000,
        max: 999999,
      }),
      makeActivity("typed_response", 1, {
        mode: "compare_symbols",
        min: 1000,
        max: 999999,
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
        min: 1000,
        max: 999999,
        count: 5,
        ascending: true,
      }),
      makeActivity("number_order", 1, {
        min: 1000,
        max: 999999,
        count: 5,
        ascending: false,
      }),
      makeActivity("multiple_choice", 1, {
        min: 1000,
        max: 999999,
        count: 5,
        ascending: true,
        sourceActivityType: "number_order",
      }),
      makeActivity("typed_response", 1, {
        min: 1000,
        max: 999999,
        count: 5,
        ascending: false,
        sourceActivityType: "number_order",
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
        min: 1000,
        max: 999999,
        step: 1000,
        mode: "placement",
      }),
      makeActivity("number_line", 1, {
        min: 1000,
        max: 999999,
        step: 10000,
        mode: "placement",
      }),
      makeActivity("multiple_choice", 1, {
        min: 1000,
        max: 999999,
        step: 100000,
        mode: "placement",
        sourceActivityType: "number_line",
      }),
    ],
  },
  {
    week: 5,
    weekTopic: "Odd & Even Numbers",
    focus: "Odd & Even Numbers",
    lesson: 1,
    topic: "Classifying Odd & Even",
    activity: "Sort and classify odd/even numbers using counters",
    curriculum: ["AC9M4N02"],
    activities: [
      makeActivity("odd_even_sort", 2, {
        min: 1000,
        max: 999999,
        count: 6,
        mode: "identify",
      }),
      makeActivity("multiple_choice", 1, {
        min: 1000,
        max: 999999,
        mode: "identify",
        sourceActivityType: "odd_even_sort",
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
      makeActivity("odd_even_sort", 2, {
        min: 1,
        max: 50,
        count: 6,
        mode: "odd_even_sums",
      }),
      makeActivity("multiple_choice", 1, {
        min: 1,
        max: 50,
        mode: "sum_rule",
        sourceActivityType: "odd_even_sort",
      }),
      makeActivity("typed_response", 1, {
        min: 1,
        max: 50,
        mode: "sum_rule",
        sourceActivityType: "odd_even_sort",
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
      makeActivity("odd_even_sort", 2, {
        min: 1,
        max: 12,
        count: 6,
        mode: "odd_even_products",
      }),
      makeActivity("multiple_choice", 1, {
        min: 1,
        max: 12,
        mode: "product_rule",
        sourceActivityType: "odd_even_sort",
      }),
      makeActivity("typed_response", 1, {
        min: 1,
        max: 12,
        mode: "product_rule",
        sourceActivityType: "odd_even_sort",
      }),
    ],
  },
  {
    week: 6,
    weekTopic: "Multiplying & Dividing by 10, 100, 1000",
    focus: "Multiplying & Dividing by 10, 100, 1000",
    lesson: 1,
    topic: "Multiplying by 10, 100 & 1000",
    activity: "Use place value shifts to multiply by 10, 100, and 1000",
    curriculum: ["AC9M4N05"],
    activities: [
      makeActivity("typed_response", 2, {
        mode: "multiply_by_powers_recall",
      }),
      makeActivity("multiple_choice", 1, {
        mode: "multiply_by_powers_shift",
      }),
      makeActivity("typed_response", 1, {
        mode: "multiply_by_powers_missing",
      }),
      makeActivity("multiple_choice", 1, {
        mode: "multiply_by_powers_error",
      }),
    ],
  },
  {
    week: 6,
    focus: "Multiplying & Dividing by 10, 100, 1000",
    lesson: 2,
    topic: "Dividing by 10, 100 & 1000",
    activity: "Use place value shifts to divide by 10, 100, and 1000",
    curriculum: ["AC9M4N05"],
    activities: [
      makeActivity("typed_response", 2, {
        mode: "divide_by_powers_recall",
      }),
      makeActivity("multiple_choice", 1, {
        mode: "divide_by_powers_shift",
      }),
      makeActivity("typed_response", 1, {
        mode: "divide_by_powers_missing",
      }),
    ],
  },
  {
    week: 6,
    focus: "Multiplying & Dividing by 10, 100, 1000",
    lesson: 3,
    topic: "Mixed Operations",
    activity: "Apply multiplying and dividing by 10, 100, and 1000",
    curriculum: ["AC9M4N05"],
    activities: [
      makeActivity("typed_response", 2, {
        mode: "powers_of_ten_mixed",
      }),
      makeActivity("multiple_choice", 1, {
        mode: "powers_of_ten_compare",
      }),
      makeActivity("typed_response", 1, {
        mode: "powers_of_ten_word",
      }),
    ],
  },
  {
    week: 7,
    weekTopic: "Multi-Digit Operations & Multiplication",
    focus: "Multi-Digit Operations & Multiplication Strategies",
    lesson: 1,
    topic: "Column Addition & Subtraction",
    activity: "Use column methods with larger numbers",
    curriculum: ["AC9M4N06"],
    activities: [
      makeActivity("typed_response", 2, {
        mode: "column_add_sub_solve",
      }),
      makeActivity("multiple_choice", 1, {
        mode: "column_add_sub_missing",
      }),
      makeActivity("multiple_choice", 1, {
        mode: "column_add_sub_error",
      }),
      makeActivity("multiple_choice", 1, {
        mode: "column_add_sub_mixed",
      }),
    ],
  },
  {
    week: 7,
    focus: "Multi-Digit Operations & Multiplication Strategies",
    lesson: 2,
    topic: "Column Multiplication",
    activity: "Use an efficient written method for multiplication",
    curriculum: ["AC9M4N06"],
    activities: [
      makeActivity("typed_response", 4, {
        mode: "column_multiplication_solve",
      }),
      makeActivity("typed_response", 2, {
        mode: "column_multiplication_partial",
      }),
    ],
  },
  {
    week: 7,
    focus: "Multi-Digit Operations & Multiplication Strategies",
    lesson: 3,
    topic: "Box Method (Area Model)",
    activity: "Break numbers into tens and ones to multiply",
    curriculum: ["AC9M4N06"],
    activities: [
      makeActivity("typed_response", 4, {
        mode: "box_method_total",
      }),
      makeActivity("typed_response", 2, {
        mode: "box_method_partial_typed",
      }),
    ],
  },
  {
    week: 8,
    weekTopic: "Problem Solving with Money & Multiplication",
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
    quizSafe: false,
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
    weekTopic: "Fractions & Decimals",
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
    weekTopic: "Counting by Fractions & Mixed Numerals",
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
    weekTopic: "Problem Solving",
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
    quizSafe: false,
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
    weekTopic: "Advanced Problem Solving",
    focus: "Problem Solving (Advanced)",
    lesson: 1,
    quizSafe: false,
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
    quizSafe: false,
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
    quizSafe: false,
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
