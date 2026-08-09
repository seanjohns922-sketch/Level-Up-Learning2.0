import { buildProgram, type ProgramRow } from "./buildProgram";
import type { CurriculumCode } from "./year1";
import type { LessonActivity } from "./types";

function activity(activityType: LessonActivity["activityType"], mode: string, config: Record<string, unknown> = {}): LessonActivity {
  return { activityType, weight: 1, config: { ...config, mode } };
}

function row(
  week: number,
  lesson: number,
  weekTopic: string,
  topic: string,
  focus: string,
  description: string,
  curriculum: CurriculumCode[],
  activities: LessonActivity[],
): ProgramRow {
  return { week, lesson, weekTopic, topic, focus, activity: description, curriculum, activities };
}

const year4Rows: ProgramRow[] = [
  row(1, 1, "Decimal Place Value", "Tenths", "Name and represent tenths using decimal notation", "Build, read and locate tenths.", ["AC9M4N01"], [
    activity("number_line", "placement", { min: 0, max: 1, step: 0.1 }),
    activity("multiple_choice", "tenths_place_value"),
    activity("typed_response", "tenths_place_value"),
  ]),
  row(1, 2, "Decimal Place Value", "Hundredths", "Name and represent hundredths using decimal notation", "Build, read and locate hundredths.", ["AC9M4N01"], [
    activity("number_line", "placement", { min: 0, max: 1, step: 0.01 }),
    activity("multiple_choice", "hundredths_place_value"),
    activity("typed_response", "hundredths_place_value"),
  ]),
  row(1, 3, "Decimal Place Value", "Representing Decimals", "Connect decimal notation, place-value charts and models", "Represent tenths and hundredths in different ways.", ["AC9M4N01"], [
    activity("number_line", "placement", { min: 0, max: 2, step: 0.1 }),
    activity("multiple_choice", "represent_decimals"),
    activity("typed_response", "represent_decimals"),
  ]),

  row(2, 1, "Decimal Reasoning", "Comparing Decimals", "Compare decimals using place value", "Compare from the highest place value first.", ["AC9M4N01"], [
    activity("number_order", "decimal_order", { min: 0.1, max: 9.99, count: 4, ascending: true, step: 0.01 }),
    activity("multiple_choice", "decimal_compare"),
    activity("typed_response", "decimal_compare"),
  ]),
  row(2, 2, "Decimal Reasoning", "Ordering Decimals", "Order decimals to hundredths", "Arrange decimal values and explain their order.", ["AC9M4N01"], [
    activity("number_order", "decimal_order", { min: 0.1, max: 9.99, count: 5, ascending: true, step: 0.01 }),
    activity("multiple_choice", "decimal_order"),
    activity("typed_response", "decimal_order"),
  ]),
  row(2, 3, "Decimal Reasoning", "Decimals on Number Lines", "Locate tenths and hundredths on number lines", "Use equal intervals to place decimal values.", ["AC9M4N01"], [
    activity("number_line", "placement", { min: 0, max: 1, step: 0.1 }),
    activity("number_line", "placement", { min: 0, max: 1, step: 0.01 }),
    activity("number_line", "placement", { min: 1, max: 2, step: 0.1 }),
  ]),

  row(3, 1, "Odd and Even Properties", "Classifying Odd and Even", "Classify natural numbers as odd or even", "Use number structure to classify values.", ["AC9M4N02"], [
    activity("odd_even_sort", "identify", { min: 0, max: 10000 }),
    activity("multiple_choice", "identify", { sourceActivityType: "odd_even_sort" }),
    activity("multiple_choice", "identify", { sourceActivityType: "odd_even_sort" }),
  ]),
  row(3, 2, "Odd and Even Properties", "Parity of Sums", "Explain odd and even addition properties", "Predict and justify the parity of sums.", ["AC9M4N02"], [
    activity("odd_even_sort", "odd_even_sums", { min: 0, max: 1000 }),
    activity("multiple_choice", "sum_rule", { sourceActivityType: "odd_even_sort" }),
    activity("typed_response", "sum_rule", { sourceActivityType: "odd_even_sort" }),
  ]),
  row(3, 3, "Odd and Even Properties", "Parity of Products", "Explain odd and even multiplication properties", "Predict and justify the parity of products.", ["AC9M4N02"], [
    activity("odd_even_sort", "odd_even_products", { min: 0, max: 1000 }),
    activity("multiple_choice", "product_rule", { sourceActivityType: "odd_even_sort" }),
    activity("typed_response", "product_rule", { sourceActivityType: "odd_even_sort" }),
  ]),

  row(4, 1, "Multiplicative Place Value", "Multiplying by 10, 100 and 1000", "Use place value to multiply natural numbers by powers of 10", "Predict the size, calculate and explain the place-value shift.", ["AC9M4N05"], [
    activity("multiple_choice", "multiply_by_powers_shift"),
    activity("multiple_choice", "multiply_by_powers_error"),
    activity("typed_response", "multiply_by_powers_recall"),
  ]),
  row(4, 2, "Multiplicative Place Value", "Dividing by 10, 100 and 1000", "Use place value to divide natural numbers by powers of 10", "Predict the size and divide using place-value relationships.", ["AC9M4N05"], [
    activity("multiple_choice", "divide_by_powers_shift"),
    activity("typed_response", "divide_by_powers_recall"),
    activity("typed_response", "divide_by_powers_missing"),
  ]),
  row(4, 3, "Multiplicative Place Value", "Powers of 10 Reasoning", "Choose and explain multiplication or division by a power of 10", "Compare results and diagnose direction errors.", ["AC9M4N05"], [
    activity("multiple_choice", "powers_of_ten_compare"),
    activity("typed_response", "powers_of_ten_mixed"),
    activity("typed_response", "powers_of_ten_word"),
  ]),

  row(5, 1, "Efficient Addition and Subtraction", "Written Addition and Subtraction", "Use efficient written strategies for addition and subtraction", "Solve and complete written calculations accurately.", ["AC9M4N06"], [
    activity("multiple_choice", "column_add_sub_missing"),
    activity("multiple_choice", "column_add_sub_error"),
    activity("typed_response", "column_add_sub_solve"),
  ]),
  row(5, 2, "Efficient Addition and Subtraction", "Partition and Compensate", "Use partitioning and compensation efficiently", "Select and apply a strategy that fits the numbers.", ["AC9M4N06"], [
    activity("addition_strategy", "friendly_numbers", { min: 100, max: 10000 }),
    activity("subtraction_strategy", "split", { min: 100, max: 10000 }),
    activity("typed_response", "friendly_numbers", { min: 100, max: 10000, sourceActivityType: "addition_strategy" }),
  ]),
  row(5, 3, "Efficient Addition and Subtraction", "Choosing an Efficient Strategy", "Compare strategies and check additive calculations", "Choose, solve and justify an efficient method.", ["AC9M4N06"], [
    activity("multiple_choice", "strategy_selection"),
    activity("addition_strategy", "split", { min: 100, max: 10000 }),
    activity("subtraction_strategy", "fact_strategy", { min: 100, max: 10000 }),
  ]),

  row(6, 1, "Efficient Multiplication and Division", "Written Multiplication", "Multiply natural numbers using efficient written strategies", "Use partial products and a written method.", ["AC9M4N06"], [
    activity("typed_response", "column_multiplication_solve"),
    activity("typed_response", "column_multiplication_partial"),
    activity("multiple_choice", "column_multiplication_error"),
  ]),
  row(6, 2, "Efficient Multiplication and Division", "Area and Box Methods", "Use partitioning to multiply natural numbers", "Connect an area model to partial products and the total.", ["AC9M4N06"], [
    activity("arrays", "arrays", { minRows: 2, maxRows: 9, minColumns: 2, maxColumns: 12 }),
    activity("typed_response", "box_method_total"),
    activity("typed_response", "box_method_partial_typed"),
  ]),
  row(6, 3, "Efficient Multiplication and Division", "Division without Remainders", "Divide natural numbers with no remainder", "Use grouping, inverse facts and efficient written thinking.", ["AC9M4N06"], [
    activity("division_groups", "grouping", { minTotal: 24, maxTotal: 144 }),
    activity("multiple_choice", "division_inverse", { min: 24, max: 144 }),
    activity("typed_response", "division_inverse", { min: 24, max: 144 }),
  ]),

  row(7, 1, "Estimation and Reasonableness", "Rounding for Estimation", "Round natural numbers to useful benchmarks", "Choose a benchmark and produce a useful estimate.", ["AC9M4N07"], [
    activity("number_line", "rounding", { min: 0, max: 100000, step: 100, targets: [10, 100, 1000] }),
    activity("multiple_choice", "quick_estimate"),
    activity("multiple_choice", "estimate_closer"),
  ]),
  row(7, 2, "Estimation and Reasonableness", "Checking Calculations", "Use estimates to check operation results", "Judge whether addition, subtraction, multiplication and division results are reasonable.", ["AC9M4N07"], [
    activity("multiple_choice", "multiplication_estimation_check"),
    activity("multiple_choice", "division_estimate_check"),
    activity("multiple_choice", "problem_reasonableness"),
  ]),
  row(7, 3, "Estimation and Reasonableness", "Checking Financial Transactions", "Use rounding to check financial calculations", "Estimate a transaction and explain whether a reported result is reasonable.", ["AC9M4N07"], [
    activity("multiple_choice", "financial_reasonableness"),
    activity("typed_response", "financial_reasonableness"),
    activity("multiple_choice", "financial_reasonableness"),
  ]),

  row(8, 1, "Mathematical Modelling", "Budgeting Problems", "Model practical additive and multiplicative budget problems", "Choose operations, solve and interpret a budget result.", ["AC9M4N08"], [
    activity("mixed_word_problem", "budgeting", { operations: ["+", "-", "x"] }),
    activity("typed_response", "budgeting", { sourceActivityType: "mixed_word_problem" }),
    activity("typed_response", "budgeting", { sourceActivityType: "mixed_word_problem" }),
  ]),
  row(8, 2, "Mathematical Modelling", "Shop Transactions", "Model financial transactions", "Choose an operation and solve an unfamiliar shop problem.", ["AC9M4N08"], [
    activity("multiple_choice", "shop_transactions", { sourceActivityType: "mixed_word_problem" }),
    activity("mixed_word_problem", "shop_transactions", { operations: ["+", "-", "x"] }),
    activity("multiple_choice", "shop_transactions", { sourceActivityType: "mixed_word_problem" }),
  ]),
  row(8, 3, "Mathematical Modelling", "Multi-Step Models", "Formulate and solve multi-step practical problems", "Represent, solve and communicate a contextual conclusion.", ["AC9M4N08"], [
    activity("mixed_word_problem", "two_step_problem", { operations: ["+", "-", "x"] }),
    activity("typed_response", "two_step_problem", { sourceActivityType: "mixed_word_problem" }),
    activity("typed_response", "two_step_problem", { sourceActivityType: "mixed_word_problem" }),
  ]),

  row(9, 1, "Equivalent Fractions and Decimals", "Building Equivalent Fractions", "Find equivalent fractions with related denominators", "Build and verify equivalent fractions by scaling both parts.", ["AC9M4N03"], [
    activity("area_model_select", "match_equivalent", { denominators: [2, 3, 4, 5, 6, 8, 10, 12] }),
    activity("equivalent_fraction_build", "build", { denominators: [2, 3, 4, 5, 6, 8, 10, 12] }),
    activity("multiple_choice", "equivalent_fraction_reasoning"),
  ]),
  row(9, 2, "Equivalent Fractions and Decimals", "Fractions and Decimal Notation", "Connect familiar fractions with decimal notation", "Match and generate equivalent fraction and decimal representations.", ["AC9M4N03"], [
    activity("area_model_select", "pick_model", { denominators: [2, 4, 5, 10] }),
    activity("multiple_choice", "fraction_decimal_match"),
    activity("typed_response", "fraction_decimal_match"),
  ]),
  row(9, 3, "Equivalent Fractions and Decimals", "Reasoning about Equivalence", "Explain and diagnose fraction equivalence", "Use related denominators and models to justify equivalence.", ["AC9M4N03"], [
    activity("equivalent_fraction_yes_no", "equivalent_fraction_reasoning"),
    activity("multiple_choice", "equivalent_fraction_reasoning"),
    activity("equivalent_fraction_build", "build", { denominators: [2, 3, 4, 5, 6, 8, 10, 12] }),
  ]),

  row(10, 1, "Fraction Sequences", "Counting by Fractions", "Count by fractions using a constant fractional step", "Continue and explain fraction sequences.", ["AC9M4N04"], [
    activity("number_line_place", "skip_count_fraction", { denominators: [2, 3, 4, 5, 8, 10] }),
    activity("multiple_choice", "skip_count_fraction"),
    activity("typed_response", "skip_count_fraction"),
  ]),
  row(10, 2, "Fraction Sequences", "Mixed Numerals", "Count through whole numbers using mixed numerals", "Read, write and continue mixed-numeral sequences.", ["AC9M4N04"], [
    activity("number_line_place", "mixed_numerals", { denominators: [2, 3, 4, 5] }),
    activity("multiple_choice", "mixed_numerals"),
    activity("typed_response", "mixed_numerals"),
  ]),
  row(10, 3, "Fraction Sequences", "Fractions on Number Lines", "Locate and represent proper and mixed fractions", "Use equal intervals to place fractions accurately.", ["AC9M4N04"], [
    activity("number_line_place", "place_fraction", { denominators: [2, 3, 4, 5, 8, 10] }),
    activity("number_line_place", "pick_point", { denominators: [2, 3, 4, 5, 8, 10] }),
    activity("number_line_place", "order_fractions", { denominators: [2, 3, 4, 5, 8, 10] }),
  ]),

  row(11, 1, "Number Algorithms", "Addition Algorithms", "Use the starting number as output 1, then follow repeated addition steps", "Generate four outputs and describe how they change.", ["AC9M4N09"], [
    activity("skip_count", "algorithm_follow", { operation: "addition" }),
    activity("skip_count", "algorithm_follow", { operation: "addition" }),
    activity("skip_count", "algorithm_follow", { operation: "addition" }),
  ]),
  row(11, 2, "Number Algorithms", "Multiplication Algorithms", "Use the starting number as output 1, then follow repeated multiplication steps", "Generate four outputs and describe how they change.", ["AC9M4N09"], [
    activity("skip_count", "algorithm_follow", { operation: "multiplication" }),
    activity("skip_count", "algorithm_follow", { operation: "multiplication" }),
    activity("skip_count", "algorithm_follow", { operation: "multiplication" }),
  ]),
  row(11, 3, "Number Algorithms", "Algorithm Builder", "Arrange instructions that generate four outputs", "Build a rule, test its four outputs and describe the pattern.", ["AC9M4N09"], [
    activity("skip_count", "algorithm_create", { operation: "addition" }),
    activity("skip_count", "algorithm_create", { operation: "multiplication" }),
    activity("skip_count", "algorithm_create", { operation: "mixed" }),
  ]),

  row(12, 1, "Level 4 Integration", "Fraction and Decimal Connections", "Integrate equivalent fractions, decimals and number lines", "Translate and reason across fraction and decimal representations.", ["AC9M4N03", "AC9M4N04"], [
    activity("area_model_select", "match_equivalent", { denominators: [2, 4, 5, 8, 10] }),
    activity("multiple_choice", "fraction_decimal_match"),
    activity("number_line_place", "mixed_numerals", { denominators: [2, 4, 5] }),
  ]),
  row(12, 2, "Level 4 Integration", "Model, Solve and Check", "Model practical problems and check solutions", "Choose efficient operations and use estimation to verify the conclusion.", ["AC9M4N06", "AC9M4N07", "AC9M4N08"], [
    activity("mixed_word_problem", "two_step_add_sub", { operations: ["+", "-"] }),
    activity("multiple_choice", "problem_reasonableness"),
    activity("multiple_choice", "financial_reasonableness"),
  ]),
  row(12, 3, "Level 4 Integration", "Algorithm and Place-Value Challenge", "Integrate powers of 10 with number-generating algorithms", "Create, test and explain an algorithm using addition or multiplication.", ["AC9M4N05", "AC9M4N09"], [
    activity("skip_count", "algorithm_create", { operation: "multiplication" }),
    activity("typed_response", "powers_of_ten_mixed"),
    activity("multiple_choice", "powers_of_ten_compare"),
  ]),
];

export const YEAR4_PROGRAM = buildProgram(4, "Number", year4Rows);
