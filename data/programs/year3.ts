import type { WeekPlan } from "./year1";
import type { LessonActivity } from "./types";
import { normalizeWeekPlans } from "./buildProgram";

function makeActivity(
  activityType: LessonActivity["activityType"],
  weight: number,
  config: Record<string, unknown>
): LessonActivity {
  return { activityType, weight, config };
}

function lessonIdeas(core: string, application: string) {
  return [
    "Fluency (2-3 mins): addition facts, doubles/near doubles, skip counting, multiplication recall",
    `Core concept: ${core}`,
    "Reasoning prompt: Explain why / How do you know / Is this reasonable?",
    `Application task: ${application}`,
  ];
}

const YEAR3_PROGRAM_RAW: WeekPlan[] = [
  {
    id: "y3-w1",
    week: 1,
    topic: "Place Value, Partitioning & Comparing beyond 10,000",
    curriculum: ["AC9M3N01"],
    lessons: [
      {
        id: "y3-w1-l1",
        week: 1,
        lesson: 1,
        title: "Place Value beyond 10,000",
        focus: "Represent numbers beyond 10,000 with place value charts and number lines",
        activityIdeas: lessonIdeas(
          "Represent numbers to 10,000 using MAB/place-value chart and place on 0-10,000 number line",
          "Model numbers used in real contexts such as population or distances"
        ),
        activities: [
          makeActivity("place_value_builder", 2, {
            min: 10001,
            max: 99999,
            placeValues: ["ten_thousands", "thousands", "hundreds", "tens", "ones"],
            visualMode: "mab",
            mode: "identify_number",
            rotationRole: "fast_thinking",
          }),
          makeActivity("number_line", 1, {
            min: 0,
            max: 100000,
            step: 5000,
            mode: "placement",
            rotationRole: "reasoning",
          }),
          makeActivity("typed_response", 1, {
            min: 10001,
            max: 99999,
            mode: "identify_number",
            sourceActivityType: "place_value_builder",
            rotationRole: "apply_create",
          }),
        ],
        curriculum: ["AC9M3N01"],
      },
      {
        id: "y3-w1-l2",
        week: 1,
        lesson: 2,
        title: "Partitioning 5-digit Numbers",
        focus: "Expanded form and flexible partitioning",
        activityIdeas: lessonIdeas(
          "Expand and flexibly partition numbers (e.g. 72,345 = 70,000 + 2,000 + 300 + 40 + 5 and 72,000 + 345)",
          "Apply partitioning to money or measurement contexts"
        ),
        activities: [
          makeActivity("partition_expand", 2, {
            min: 10001,
            max: 99999,
            mode: "expand",
          }),
          makeActivity("partition_expand", 1, {
            min: 10001,
            max: 99999,
            mode: "flexible_partition",
          }),
          makeActivity("typed_response", 1, {
            min: 10001,
            max: 99999,
            mode: "flexible_partition",
            sourceActivityType: "partition_expand",
          }),
        ],
        curriculum: ["AC9M3N01"],
      },
      {
        id: "y3-w1-l3",
        week: 1,
        lesson: 3,
        title: "Comparing & Reasoning",
        focus: "Compare and order 5-digit numbers with justification",
        activityIdeas: lessonIdeas(
          "Compare, order, and reason about proximity to benchmark values",
          "Solve closest-to-50,000 style reasoning tasks with written justification"
        ),
        activities: [
          makeActivity("number_order", 2, {
            min: 10001,
            max: 99999,
            count: 5,
            ascending: true,
          }),
          makeActivity("number_line", 1, {
            min: 0,
            max: 100000,
            step: 5000,
            mode: "estimate",
          }),
          makeActivity("typed_response", 1, {
            min: 10001,
            max: 99999,
            count: 5,
            sourceActivityType: "number_order",
          }),
        ],
        curriculum: ["AC9M3N01"],
      },
    ],
  },
  {
    id: "y3-w2",
    week: 2,
    topic: "Rounding & Reasoning",
    curriculum: ["AC9M3N05"],
    lessons: [
      {
        id: "y3-w2-l1",
        week: 2,
        lesson: 1,
        title: "Estimate Collections",
        focus: "Estimate quantities in collections using benchmarks",
        activityIdeas: lessonIdeas(
          "Estimate a collection before checking its exact quantity",
          "Use groups of about 10 as a visual benchmark"
        ),
        activities: [
          makeActivity("mixed_word_problem", 2, {
            min: 20,
            max: 100,
            mode: "quantity_estimation",
            collectionEstimate: true,
          }),
          makeActivity("mixed_word_problem", 1, {
            min: 20,
            max: 100,
            mode: "quantity_estimation",
            collectionEstimate: true,
          }),
          makeActivity("multiple_choice", 1, {
            min: 20,
            max: 100,
            mode: "quantity_estimation",
            sourceActivityType: "mixed_word_problem",
          }),
        ],
        curriculum: ["AC9M3N05"],
      },
      {
        id: "y3-w2-l2",
        week: 2,
        lesson: 2,
        title: "Rounding to Nearest 100",
        focus: "Round to nearest 100 with estimation and place-value reasoning",
        activityIdeas: lessonIdeas(
          "Round to nearest 100 using benchmark numbers and number lines",
          "Estimate totals using rounded hundreds"
        ),
        activities: [
          makeActivity("number_line", 2, {
            min: 0,
            max: 10000,
            step: 100,
            mode: "rounding",
            targets: [100],
          }),
          makeActivity("number_line", 1, {
            min: 0,
            max: 10000,
            step: 100,
            mode: "estimate",
          }),
          makeActivity("multiple_choice", 1, {
            min: 0,
            max: 10000,
            step: 100,
            mode: "rounding",
            targets: [100],
            sourceActivityType: "number_line",
          }),
        ],
        curriculum: ["AC9M3N05"],
      },
      {
        id: "y3-w2-l3",
        week: 2,
        lesson: 3,
        title: "Apply & Reason",
        focus: "Apply rounding in real-world contexts and evaluate reasonableness",
        activityIdeas: lessonIdeas(
          "Solve applied rounding problems and defend answers",
          "Check if rounded answers are reasonable in context"
        ),
        activities: [
          makeActivity("number_line", 2, {
            min: 0,
            max: 10000,
            step: 100,
            mode: "rounding",
            targets: [10, 100],
          }),
          makeActivity("number_line", 1, {
            min: 0,
            max: 10000,
            step: 100,
            mode: "estimate",
          }),
          makeActivity("typed_response", 1, {
            min: 0,
            max: 10000,
            step: 100,
            mode: "rounding",
            targets: [10, 100],
            sourceActivityType: "number_line",
          }),
        ],
        curriculum: ["AC9M3N05"],
      },
    ],
  },
  {
    id: "y3-w3",
    week: 3,
    topic: "Addition Strategies",
    curriculum: ["AC9M3N03"],
    lessons: [
      {
        id: "y3-w3-l1",
        week: 3,
        lesson: 1,
        title: "Doubles & Near Doubles",
        focus: "Use known facts to add efficiently",
        activityIdeas: lessonIdeas(
          "Use doubles and near doubles for mental addition",
          "Apply fact-based strategies to short word problems"
        ),
        activities: [
          makeActivity("addition_strategy", 2, {
            min: 20,
            max: 100,
            mode: "doubles",
          }),
          makeActivity("addition_strategy", 2, {
            min: 20,
            max: 100,
            mode: "near_doubles",
          }),
          makeActivity("typed_response", 1, {
            min: 20,
            max: 100,
            mode: "near_doubles",
            sourceActivityType: "addition_strategy",
          }),
        ],
        curriculum: ["AC9M3N03"],
      },
      {
        id: "y3-w3-l2",
        week: 3,
        lesson: 2,
        title: "Bridge to 10 / Make 10",
        focus: "Use make-10 strategy with partitioning and number lines",
        activityIdeas: lessonIdeas(
          "Bridge through 10 and use partitioning to solve additions",
          "Choose make-10 in contextual addition tasks"
        ),
        activities: [
          makeActivity("addition_strategy", 2, {
            min: 10,
            max: 200,
            mode: "split",
          }),
          makeActivity("number_line", 1, {
            min: 0,
            max: 200,
            step: 10,
            mode: "placement",
          }),
          makeActivity("multiple_choice", 1, {
            min: 10,
            max: 200,
            mode: "split",
            sourceActivityType: "addition_strategy",
          }),
        ],
        curriculum: ["AC9M3N03"],
      },
      {
        id: "y3-w3-l3",
        week: 3,
        lesson: 3,
        title: "Compensation & Strategy Choice",
        focus: "Choose efficient addition strategy and justify",
        activityIdeas: lessonIdeas(
          "Use compensation (e.g. 49 + 32) and compare strategy efficiency",
          "Solve and justify best-strategy choice across mixed additions"
        ),
        activities: [
          makeActivity("addition_strategy", 2, {
            min: 20,
            max: 240,
            mode: "friendly_numbers",
          }),
          makeActivity("multiple_choice", 1, {
            min: 20,
            max: 240,
            mode: "friendly_numbers",
            sourceActivityType: "addition_strategy",
          }),
          makeActivity("typed_response", 1, {
            min: 20,
            max: 240,
            mode: "friendly_numbers",
            sourceActivityType: "addition_strategy",
          }),
        ],
        curriculum: ["AC9M3N03"],
      },
    ],
  },
  {
    id: "y3-w4",
    week: 4,
    topic: "Subtraction Strategies",
    curriculum: ["AC9M3N03"],
    lessons: [
      {
        id: "y3-w4-l1",
        week: 4,
        lesson: 1,
        title: "Count Back vs Count Up",
        focus: "Compare subtraction strategies",
        activityIdeas: lessonIdeas(
          "Use and compare count-back and count-up approaches",
          "Apply both strategies and explain which is more efficient"
        ),
        activities: [
          makeActivity("subtraction_strategy", 2, {
            min: 90,
            max: 220,
            mode: "jump",
          }),
          makeActivity("multiple_choice", 1, {
            min: 90,
            max: 220,
            mode: "jump",
            sourceActivityType: "subtraction_strategy",
          }),
          makeActivity("typed_response", 1, {
            min: 90,
            max: 220,
            mode: "jump",
            sourceActivityType: "subtraction_strategy",
          }),
        ],
        curriculum: ["AC9M3N03"],
      },
      {
        id: "y3-w4-l2",
        week: 4,
        lesson: 2,
        title: "Difference vs Takeaway",
        focus: "Interpret subtraction as both difference and takeaway",
        activityIdeas: lessonIdeas(
          "Solve subtraction using difference and takeaway interpretations",
          "Use real contexts to decide which interpretation fits"
        ),
        activities: [
          makeActivity("subtraction_strategy", 2, {
            min: 90,
            max: 220,
            mode: "split",
          }),
          makeActivity("typed_response", 1, {
            min: 90,
            max: 220,
            mode: "split",
            sourceActivityType: "subtraction_strategy",
          }),
          makeActivity("multiple_choice", 1, {
            min: 90,
            max: 220,
            mode: "split",
            sourceActivityType: "subtraction_strategy",
          }),
        ],
        curriculum: ["AC9M3N03"],
      },
      {
        id: "y3-w4-l3",
        week: 4,
        lesson: 3,
        title: "Fact Families & Reasoning",
        focus: "Use related facts and explain method choices",
        activityIdeas: lessonIdeas(
          "Use inverse fact families to solve subtraction",
          "Explain strategy selection and verify with related addition facts"
        ),
        activities: [
          makeActivity("subtraction_strategy", 2, {
            min: 90,
            max: 220,
            mode: "fact_strategy",
          }),
          makeActivity("multiple_choice", 1, {
            min: 90,
            max: 220,
            mode: "fact_strategy",
            sourceActivityType: "subtraction_strategy",
          }),
          makeActivity("typed_response", 1, {
            min: 90,
            max: 220,
            mode: "fact_strategy",
            sourceActivityType: "subtraction_strategy",
          }),
        ],
        curriculum: ["AC9M3N03"],
      },
    ],
  },
  {
    id: "y3-w5",
    week: 5,
    topic: "Written Addition & Subtraction",
    curriculum: ["AC9M3N03"],
    lessons: [
      {
        id: "y3-w5-l1",
        week: 5,
        lesson: 1,
        title: "Long Addition (With Regrouping)",
        focus: "Complete long addition with regrouping using the written method",
        activityIdeas: lessonIdeas(
          "Complete vertical long addition with carrying",
          "Mix 2-digit and selected 3-digit additions that require regrouping"
        ),
        activities: [
          makeActivity("typed_response", 2, {
            min: 20,
            max: 99,
            mode: "split",
            sourceActivityType: "addition_strategy",
          }),
          makeActivity("typed_response", 1, {
            min: 120,
            max: 999,
            mode: "split",
            sourceActivityType: "addition_strategy",
          }),
          makeActivity("typed_response", 1, {
            min: 20,
            max: 999,
            mode: "split",
            sourceActivityType: "addition_strategy",
          }),
        ],
        curriculum: ["AC9M3N03"],
      },
      {
        id: "y3-w5-l2",
        week: 5,
        lesson: 2,
        title: "Long Subtraction (With Regrouping)",
        focus: "Complete long subtraction with regrouping using the written method",
        activityIdeas: lessonIdeas(
          "Complete vertical long subtraction with borrowing",
          "Mix 2-digit and selected 3-digit subtractions that require regrouping"
        ),
        activities: [
          makeActivity("typed_response", 2, {
            min: 20,
            max: 99,
            mode: "split",
            sourceActivityType: "subtraction_strategy",
          }),
          makeActivity("typed_response", 1, {
            min: 120,
            max: 999,
            mode: "split",
            sourceActivityType: "subtraction_strategy",
          }),
          makeActivity("typed_response", 1, {
            min: 20,
            max: 999,
            mode: "split",
            sourceActivityType: "subtraction_strategy",
          }),
        ],
        curriculum: ["AC9M3N03"],
      },
      {
        id: "y3-w5-l3",
        week: 5,
        lesson: 3,
        title: "Subtraction Across Zeros",
        focus: "Subtract from numbers with zeros using the written method, then check",
        activityIdeas: lessonIdeas(
          "Regroup across zeros in the standard written subtraction method",
          "Check each answer by adding it back to the number taken away"
        ),
        activities: [
          makeActivity("typed_response", 2, {
            min: 100,
            max: 999,
            mode: "split",
            sourceActivityType: "subtraction_strategy",
          }),
          makeActivity("typed_response", 1, {
            min: 200,
            max: 999,
            mode: "split",
            sourceActivityType: "subtraction_strategy",
          }),
          makeActivity("typed_response", 1, {
            min: 100,
            max: 999,
            mode: "split",
            sourceActivityType: "subtraction_strategy",
          }),
        ],
        curriculum: ["AC9M3N03"],
      },
    ],
  },
  {
    id: "y3-w6",
    week: 6,
    topic: "Problem Solving",
    curriculum: ["AC9M3N03", "AC9M3N05", "AC9M3N06"],
    lessons: [
      {
        id: "y3-w6-l1",
        week: 6,
        lesson: 1,
        title: "Choose the Operation",
        focus: "Read word problems, decide the operation, then solve",
        activityIdeas: lessonIdeas(
          "Read real-world addition and subtraction problems and choose the operation",
          "Solve medium and slight-stretch word problems with clear justification"
        ),
        activities: [
          makeActivity("mixed_word_problem", 2, {
            min: 120,
            max: 420,
            mode: "two_step_add_sub",
            operations: ["+", "-"],
          }),
          makeActivity("mixed_word_problem", 1, {
            min: 60,
            max: 220,
            mode: "two_step_add_sub",
            operations: ["+", "-"],
          }),
          makeActivity("mixed_word_problem", 1, {
            min: 120,
            max: 420,
            mode: "two_step_add_sub",
            operations: ["+", "-"],
          }),
        ],
        curriculum: ["AC9M3N03", "AC9M3N06"],
      },
      {
        id: "y3-w6-l2",
        week: 6,
        lesson: 2,
        title: "Two-Step Problems",
        focus: "Plan and solve 2-step word problems in the correct order",
        activityIdeas: lessonIdeas(
          "Work out which operation happens first and which happens second",
          "Solve 2-step addition and subtraction problems with clear planning"
        ),
        activities: [
          makeActivity("mixed_word_problem", 2, {
            min: 150,
            max: 500,
            mode: "two_step_add_sub",
            operations: ["+", "-"],
          }),
          makeActivity("mixed_word_problem", 1, {
            min: 150,
            max: 500,
            mode: "two_step_add_sub",
            operations: ["+", "-"],
          }),
          makeActivity("mixed_word_problem", 1, {
            min: 150,
            max: 500,
            mode: "two_step_add_sub",
            operations: ["+", "-"],
          }),
        ],
        curriculum: ["AC9M3N03", "AC9M3N06"],
      },
      {
        id: "y3-w6-l3",
        week: 6,
        lesson: 3,
        title: "Estimation & Reasoning",
        focus: "Estimate, then solve 2-step word problems and check reasonableness",
        activityIdeas: lessonIdeas(
          "Estimate the result before solving both steps",
          "Check whether the final answer makes sense in context"
        ),
        activities: [
          makeActivity("mixed_word_problem", 2, {
            min: 120,
            max: 500,
            mode: "two_step_add_sub",
            operations: ["+", "-"],
          }),
          makeActivity("mixed_word_problem", 1, {
            min: 80,
            max: 260,
            mode: "two_step_add_sub",
            operations: ["+", "-"],
          }),
          makeActivity("mixed_word_problem", 1, {
            min: 120,
            max: 500,
            mode: "two_step_add_sub",
            operations: ["+", "-"],
          }),
        ],
        curriculum: ["AC9M3N03", "AC9M3N05", "AC9M3N06"],
      },
    ],
  },
  {
    id: "y3-w7",
    week: 7,
    topic: "Multiplication - Intro",
    curriculum: ["AC9M3N04"],
    lessons: [
      {
        id: "y3-w7-l1",
        week: 7,
        lesson: 1,
        title: "Equal Groups & Repeated Addition",
        focus: "Model multiplication with equal groups and repeated addition",
        activityIdeas: lessonIdeas(
          "Build equal groups and connect to repeated addition",
          "Use objects/visuals to model multiplication situations"
        ),
        activities: [
          makeActivity("equal_groups", 2, {
            minGroups: 2,
            maxGroups: 8,
            minItemsPerGroup: 2,
            maxItemsPerGroup: 9,
            mode: "equal_groups",
          }),
          makeActivity("arrays", 1, {
            minRows: 2,
            maxRows: 8,
            minColumns: 2,
            maxColumns: 9,
            mode: "repeated_addition",
          }),
          makeActivity("multiple_choice", 1, {
            minGroups: 2,
            maxGroups: 8,
            minItemsPerGroup: 2,
            maxItemsPerGroup: 9,
            mode: "equal_groups",
            sourceActivityType: "equal_groups",
          }),
        ],
        curriculum: ["AC9M3N04"],
      },
      {
        id: "y3-w7-l2",
        week: 7,
        lesson: 2,
        title: "Arrays & Grouping",
        focus: "Build, interpret, and reason about arrays",
        activityIdeas: lessonIdeas(
          "Construct and interpret arrays as multiplication models",
          "Describe rows, columns, and total relation"
        ),
        activities: [
          makeActivity("arrays", 2, {
            minRows: 2,
            maxRows: 8,
            minColumns: 2,
            maxColumns: 9,
            mode: "arrays",
          }),
          makeActivity("equal_groups", 1, {
            minGroups: 2,
            maxGroups: 8,
            minItemsPerGroup: 2,
            maxItemsPerGroup: 9,
            mode: "equal_groups",
          }),
          makeActivity("typed_response", 1, {
            minRows: 2,
            maxRows: 8,
            minColumns: 2,
            maxColumns: 9,
            mode: "arrays",
            sourceActivityType: "arrays",
          }),
        ],
        curriculum: ["AC9M3N04"],
      },
      {
        id: "y3-w7-l3",
        week: 7,
        lesson: 3,
        title: "Commutative Property & Division Link",
        focus: "Use commutativity and connect multiplication to division",
        activityIdeas: lessonIdeas(
          "Explore commutative property and inverse links",
          "Use related division facts to verify multiplication"
        ),
        activities: [
          makeActivity("division_groups", 2, {
            minTotal: 12,
            maxTotal: 48,
            mode: "inverse_link",
          }),
          makeActivity("equal_groups", 1, {
            minGroups: 2,
            maxGroups: 8,
            minItemsPerGroup: 2,
            maxItemsPerGroup: 9,
            mode: "equal_groups",
          }),
          makeActivity("multiple_choice", 1, {
            minTotal: 12,
            maxTotal: 48,
            mode: "inverse_link",
            sourceActivityType: "division_groups",
          }),
        ],
        curriculum: ["AC9M3N04"],
      },
    ],
  },
  {
    id: "y3-w8",
    week: 8,
    topic: "Multiplication & Division Strategies",
    curriculum: ["AC9M3N04"],
    lessons: [
      {
        id: "y3-w8-l1",
        week: 8,
        lesson: 1,
        title: "Division Models and Related Facts",
        focus: "Use sharing, grouping, and fact families to solve division facts",
        activityIdeas: lessonIdeas(
          "Solve division using sharing and grouping models",
          "Connect division facts to related multiplication facts and fact families"
        ),
        activities: [
          makeActivity("division_groups", 2, {
            minTotal: 12,
            maxTotal: 60,
            mode: "sharing",
          }),
          makeActivity("division_groups", 1, {
            minTotal: 12,
            maxTotal: 60,
            mode: "grouping",
          }),
          makeActivity("fact_family", 1, {
            min: 12,
            max: 60,
            mode: "write_sentences",
          }),
        ],
        curriculum: ["AC9M3N04"],
      },
      {
        id: "y3-w8-l2",
        week: 8,
        lesson: 2,
        title: "Apply Multiplication & Division Relationships",
        focus: "Use inverse relationships and missing numbers to apply multiplication and division facts",
        activityIdeas: lessonIdeas(
          "Switch between multiplication and division using the same fact set",
          "Use missing-number and inverse questions to apply 2, 3, 4, 5, and 10 facts"
        ),
        activities: [
          makeActivity("fact_family", 2, {
            min: 12,
            max: 60,
            mode: "recognise",
          }),
          makeActivity("division_groups", 1, {
            minTotal: 12,
            maxTotal: 60,
            mode: "inverse_link",
          }),
          makeActivity("typed_response", 1, {
            min: 12,
            max: 60,
            mode: "recognise",
            sourceActivityType: "fact_family",
          }),
        ],
        curriculum: ["AC9M3N04"],
      },
      {
        id: "y3-w8-l3",
        week: 8,
        lesson: 3,
        title: "Multiplication & Division Problems",
        focus: "Mixed multiplication and division practice",
        activityIdeas: lessonIdeas(
          "Mix multiplication and division fact practice with strong 3s and 4s coverage",
          "Use fact knowledge in mixed reasoning and simple 2-step problems"
        ),
        activities: [
          makeActivity("mixed_word_problem", 2, {
            min: 20,
            max: 200,
            mode: "mult_div_problems",
            operations: ["x", "/"],
          }),
          makeActivity("fact_family", 1, {
            min: 12,
            max: 60,
            mode: "word_problems",
          }),
          makeActivity("typed_response", 1, {
            min: 20,
            max: 200,
            mode: "mult_div_problems",
            operations: ["x", "/"],
            sourceActivityType: "mixed_word_problem",
          }),
        ],
        curriculum: ["AC9M3N04"],
      },
    ],
  },
  {
    id: "y3-w9",
    week: 9,
    topic: "Money Representation & Financial Modelling",
    curriculum: ["AC9M3N06", "AC9M3M06"],
    lessons: [
      {
        id: "y3-w9-l1",
        week: 9,
        lesson: 1,
        title: "Dollars and Cents Lab",
        focus: "Connect dollars and cents and represent the same value in different ways",
        activityIdeas: lessonIdeas(
          "Use 100 cents = 1 dollar and decode Australian money collections",
          "Represent one amount with different combinations of notes and coins"
        ),
        activities: [
          makeActivity("mixed_word_problem", 2, {
            mode: "money_equivalence",
          }),
          makeActivity("mixed_word_problem", 1, {
            mode: "money_equivalence",
          }),
          makeActivity("mixed_word_problem", 1, {
            mode: "money_equivalence",
          }),
        ],
        curriculum: ["AC9M3M06"],
      },
      {
        id: "y3-w9-l2",
        week: 9,
        lesson: 2,
        title: "Model a Purchase",
        focus: "Formulate and solve additive financial situations",
        activityIdeas: lessonIdeas(
          "Choose addition or subtraction from the relationships in a purchase",
          "Write a matching number sentence and interpret the total or change"
        ),
        activities: [
          makeActivity("mixed_word_problem", 2, {
            mode: "financial_additive_model",
            operations: ["+", "-"],
          }),
          makeActivity("mixed_word_problem", 1, {
            mode: "financial_additive_model",
            operations: ["+", "-"],
          }),
          makeActivity("mixed_word_problem", 1, {
            mode: "financial_additive_model",
            operations: ["+", "-"],
          }),
        ],
        curriculum: ["AC9M3N06", "AC9M3M06"],
      },
      {
        id: "y3-w9-l3",
        week: 9,
        lesson: 3,
        title: "Financial Mission",
        focus: "Model multiplicative purchases and communicate a contextual solution",
        activityIdeas: lessonIdeas(
          "Use equal groups to calculate repeated prices and compare with a payment",
          "Explain what the calculated result means in the purchase situation"
        ),
        activities: [
          makeActivity("mixed_word_problem", 2, {
            mode: "financial_multiplicative_model",
            operations: ["x", "-"],
          }),
          makeActivity("mixed_word_problem", 1, {
            mode: "financial_multiplicative_model",
            operations: ["x", "-"],
          }),
          makeActivity("mixed_word_problem", 1, {
            mode: "financial_multiplicative_model",
            operations: ["x", "-"],
          }),
        ],
        curriculum: ["AC9M3N06", "AC9M3M06"],
      },
    ],
  },
  {
    id: "y3-w10",
    week: 10,
    topic: "Number Algorithms",
    curriculum: ["AC9M3N07"],
    lessons: [
      {
        id: "y3-w10-l1",
        week: 10,
        lesson: 1,
        title: "Follow the Number Machine",
        focus: "Follow a sequence of number steps and describe the outputs",
        activityIdeas: lessonIdeas(
          "Run doubling, halving and additive algorithms in the correct order",
          "Describe the pattern produced by repeated runs"
        ),
        activities: [
          makeActivity("skip_count", 2, {
            mode: "algorithm_follow",
          }),
          makeActivity("skip_count", 1, {
            mode: "algorithm_follow",
          }),
          makeActivity("skip_count", 1, {
            mode: "algorithm_follow",
          }),
        ],
        curriculum: ["AC9M3N07"],
      },
      {
        id: "y3-w10-l2",
        week: 10,
        lesson: 2,
        title: "Decision Paths",
        focus: "Follow algorithm decisions to sort and transform numbers",
        activityIdeas: lessonIdeas(
          "Apply yes/no decisions for multiples of 2, 5 and 10",
          "Track the branch taken and explain the emerging classifications"
        ),
        activities: [
          makeActivity("skip_count", 2, {
            mode: "algorithm_decision",
          }),
          makeActivity("skip_count", 1, {
            mode: "algorithm_decision",
          }),
          makeActivity("skip_count", 1, {
            mode: "algorithm_decision",
          }),
        ],
        curriculum: ["AC9M3N07"],
      },
      {
        id: "y3-w10-l3",
        week: 10,
        lesson: 3,
        title: "Algorithm Builder",
        focus: "Create, test and explain a number-generating algorithm",
        activityIdeas: lessonIdeas(
          "Arrange precise instructions so another student can generate a number pattern",
          "Test the algorithm and describe the pattern in its outputs"
        ),
        activities: [
          makeActivity("skip_count", 2, {
            mode: "algorithm_create",
          }),
          makeActivity("skip_count", 1, {
            mode: "algorithm_create",
          }),
          makeActivity("skip_count", 1, {
            mode: "algorithm_create",
          }),
        ],
        curriculum: ["AC9M3N07"],
      },
    ],
  },
  {
    id: "y3-w11",
    week: 11,
    topic: "Fractions Foundations",
    curriculum: ["AC9M3N02"],
    lessons: [
      {
        id: "y3-w11-l1",
        week: 11,
        lesson: 1,
        title: "Recognising Unit Fractions",
        focus: "Recognise unit fractions as one out of equal parts",
        activityIdeas: lessonIdeas(
          "Recognise unit fractions in shaded shapes and equal parts",
          "Match fraction labels to the correct visual model"
        ),
        activities: [
          makeActivity("area_model_select", 2, {
            mode: "shade_fraction",
          }),
          makeActivity("area_model_select", 1, {
            mode: "pick_model",
          }),
          makeActivity("area_model_select", 1, {
            mode: "match_model",
          }),
        ],
        curriculum: ["AC9M3N02"],
      },
      {
        id: "y3-w11-l2",
        week: 11,
        lesson: 2,
        title: "Fractions of Sets",
        focus: "Share collections into equal groups and connect one group to a unit fraction",
        activityIdeas: lessonIdeas(
          "Share collections into equal groups and identify one group",
          "Introduce 1/2, 1/3, 1/4, and 1/5 as labels for one equal share"
        ),
        activities: [
          makeActivity("set_model_select", 2, {
            mode: "tap_fraction",
          }),
          makeActivity("set_model_select", 1, {
            mode: "pick_set",
          }),
          makeActivity("set_model_select", 1, {
            mode: "label_shared_group",
          }),
        ],
        curriculum: ["AC9M3N02"],
      },
      {
        id: "y3-w11-l3",
        week: 11,
        lesson: 3,
        title: "Build a Whole",
        focus: "Use inverse thinking to build the whole from one fractional part",
        activityIdeas: lessonIdeas(
          "Build a complete whole from one known fraction part",
          "Work out the whole when one fraction part is given"
        ),
        activities: [
          makeActivity("build_the_whole", 2, {
            mode: "build_whole",
          }),
          makeActivity("build_the_whole", 1, {
            mode: "fill_total",
          }),
          makeActivity("build_the_whole", 1, {
            mode: "pick_whole",
          }),
        ],
        curriculum: ["AC9M3N02"],
      },
    ],
  },
  {
    id: "y3-w12",
    week: 12,
    topic: "Fraction Reasoning",
    curriculum: ["AC9M3N02"],
    lessons: [
      {
        id: "y3-w12-l1",
        week: 12,
        lesson: 1,
        title: "Make One Whole",
        focus: "Combine unit fractions with the same denominator to make one whole",
        activityIdeas: lessonIdeas(
          "Count how many equal parts make one whole",
          "Combine same-denominator parts and compare unit fractions"
        ),
        activities: [
          makeActivity("build_the_whole", 2, {
            mode: "build_whole",
          }),
          makeActivity("area_model_select", 1, {
            mode: "pick_model",
          }),
          makeActivity("fraction_compare", 1, {
          }),
        ],
        curriculum: ["AC9M3N02"],
      },
      {
        id: "y3-w12-l2",
        week: 12,
        lesson: 2,
        title: "Fractions on Number Lines",
        focus: "Place and order fractions as positions on a number line",
        activityIdeas: lessonIdeas(
          "Place simple fractions correctly between 0 and 1",
          "Order benchmark fractions on a number line"
        ),
        activities: [
          makeActivity("number_line_place", 2, {
            mode: "place_fraction",
            denominators: [2, 3, 4, 5, 10],
          }),
          makeActivity("number_line_place", 1, {
            mode: "pick_point",
            denominators: [2, 3, 4, 5, 10],
          }),
          makeActivity("number_line_place", 1, {
            mode: "order_fractions",
            denominators: [2, 3, 4, 5, 10],
          }),
        ],
        curriculum: ["AC9M3N02"],
      },
      {
        id: "y3-w12-l3",
        week: 12,
        lesson: 3,
        title: "Comparing Fractions",
        focus: "Compare fractions using visuals, symbols, and reasoning",
        activityIdeas: lessonIdeas(
          "Compare simple fractions using the same whole",
          "Explain whether fraction statements are true or false"
        ),
        activities: [
          makeActivity("fraction_compare", 2, {
            mode: "symbol_compare",
          }),
          makeActivity("fraction_compare", 1, {
            mode: "visual_compare",
          }),
          makeActivity("fraction_compare", 1, {
            mode: "true_false",
          }),
        ],
        curriculum: ["AC9M3N02"],
      },
    ],
  },
];

export const YEAR3_PROGRAM: WeekPlan[] = normalizeWeekPlans(3, YEAR3_PROGRAM_RAW);
