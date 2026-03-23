import type { WeekPlan } from "./year1";
import type { LessonActivity } from "./types";

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

export const YEAR3_PROGRAM: WeekPlan[] = [
  {
    id: "y3-w1",
    week: 1,
    topic: "Numbers to 10,000 - Place Value",
    curriculum: ["ALL"],
    lessons: [
      {
        id: "y3-w1-l1",
        week: 1,
        lesson: 1,
        title: "Place Value to 10,000",
        focus: "Represent numbers to 10,000 with place value charts and number lines",
        activityIdeas: lessonIdeas(
          "Represent numbers to 10,000 using MAB/place-value chart and place on 0-10,000 number line",
          "Model numbers used in real contexts such as population or distances"
        ),
        activities: [
          makeActivity("place_value_builder", 2, {
            min: 1000,
            max: 10000,
            placeValues: ["ten_thousands", "thousands", "hundreds", "tens", "ones"],
            visualMode: "mab",
            mode: "identify_number",
          }),
          makeActivity("number_line", 1, {
            min: 0,
            max: 10000,
            step: 500,
            mode: "placement",
          }),
          makeActivity("typed_response", 1, {
            min: 1000,
            max: 10000,
            mode: "identify_number",
            sourceActivityType: "place_value_builder",
          }),
        ],
        curriculum: ["ALL"],
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
            min: 1000,
            max: 10000,
            mode: "expand",
          }),
          makeActivity("partition_expand", 1, {
            min: 1000,
            max: 10000,
            mode: "flexible_partition",
          }),
          makeActivity("typed_response", 1, {
            min: 1000,
            max: 10000,
            mode: "flexible_partition",
            sourceActivityType: "partition_expand",
          }),
        ],
        curriculum: ["ALL"],
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
            min: 1000,
            max: 10000,
            count: 5,
            ascending: true,
          }),
          makeActivity("number_line", 1, {
            min: 0,
            max: 10000,
            step: 500,
            mode: "estimate",
          }),
          makeActivity("typed_response", 1, {
            min: 1000,
            max: 10000,
            count: 5,
            sourceActivityType: "number_order",
          }),
        ],
        curriculum: ["ALL"],
      },
    ],
  },
  {
    id: "y3-w2",
    week: 2,
    topic: "Rounding, Ordering & Comparing",
    curriculum: ["ALL"],
    lessons: [
      {
        id: "y3-w2-l1",
        week: 2,
        lesson: 1,
        title: "Rounding to Nearest 10",
        focus: "Use number lines and place value to round to nearest 10",
        activityIdeas: lessonIdeas(
          "Round to nearest 10 and justify decisions on a number line",
          "Use rounded values in quick estimation scenarios"
        ),
        activities: [
          makeActivity("number_line", 2, {
            min: 0,
            max: 10000,
            step: 10,
            mode: "rounding",
            targets: [10],
          }),
          makeActivity("number_line", 1, {
            min: 0,
            max: 10000,
            step: 10,
            mode: "placement",
          }),
          makeActivity("typed_response", 1, {
            min: 0,
            max: 10000,
            step: 10,
            mode: "rounding",
            targets: [10],
            sourceActivityType: "number_line",
          }),
        ],
        curriculum: ["ALL"],
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
        curriculum: ["ALL"],
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
        curriculum: ["ALL"],
      },
    ],
  },
  {
    id: "y3-w3",
    week: 3,
    topic: "Addition Strategies",
    curriculum: ["ALL"],
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
        curriculum: ["ALL"],
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
        curriculum: ["ALL"],
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
        curriculum: ["ALL"],
      },
    ],
  },
  {
    id: "y3-w4",
    week: 4,
    topic: "Subtraction Strategies",
    curriculum: ["ALL"],
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
        curriculum: ["ALL"],
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
        curriculum: ["ALL"],
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
        curriculum: ["ALL"],
      },
    ],
  },
  {
    id: "y3-w5",
    week: 5,
    topic: "Written Strategies",
    curriculum: ["ALL"],
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
        curriculum: ["ALL"],
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
        curriculum: ["ALL"],
      },
      {
        id: "y3-w5-l3",
        week: 5,
        lesson: 3,
        title: "Long Subtraction (With Regrouping)",
        focus: "Continue long subtraction with regrouping using the written method",
        activityIdeas: lessonIdeas(
          "Continue vertical subtraction with borrowing",
          "Mix moderate and harder regrouping examples, including selected 3-digit subtraction"
        ),
        activities: [
          makeActivity("typed_response", 2, {
            min: 20,
            max: 99,
            mode: "split",
            sourceActivityType: "subtraction_strategy",
          }),
          makeActivity("typed_response", 1, {
            min: 140,
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
        curriculum: ["ALL"],
      },
    ],
  },
  {
    id: "y3-w6",
    week: 6,
    topic: "Problem Solving",
    curriculum: ["ALL"],
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
            min: 40,
            max: 320,
            mode: "choose_operation",
            operations: ["+", "-"],
          }),
          makeActivity("typed_response", 1, {
            min: 40,
            max: 320,
            mode: "choose_operation",
            operations: ["+", "-"],
            sourceActivityType: "mixed_word_problem",
          }),
        ],
        curriculum: ["ALL"],
      },
      {
        id: "y3-w6-l2",
        week: 6,
        lesson: 2,
        title: "Two-Step Problems",
        focus: "Solve multi-step problems combining operations",
        activityIdeas: lessonIdeas(
          "Plan and solve two-step problems",
          "Explain sequence of operations and decisions"
        ),
        activities: [
          makeActivity("mixed_word_problem", 2, {
            min: 20,
            max: 170,
            mode: "two_step_add_sub",
            operations: ["+", "-"],
          }),
          makeActivity("subtraction_strategy", 1, {
            min: 20,
            max: 170,
            mode: "jump",
          }),
          makeActivity("multiple_choice", 1, {
            min: 20,
            max: 170,
            mode: "two_step_add_sub",
            operations: ["+", "-"],
            sourceActivityType: "mixed_word_problem",
          }),
        ],
        curriculum: ["ALL"],
      },
      {
        id: "y3-w6-l3",
        week: 6,
        lesson: 3,
        title: "Estimation & Reasoning",
        focus: "Estimate before solving and evaluate reasonableness",
        activityIdeas: lessonIdeas(
          "Estimate outcomes before exact calculation",
          "Check whether final answers make sense in context"
        ),
        activities: [
          makeActivity("mixed_word_problem", 2, {
            min: 20,
            max: 170,
            mode: "choose_operation",
            operations: ["+", "-", "x", "/"],
          }),
          makeActivity("number_line", 1, {
            min: 0,
            max: 1000,
            step: 100,
            mode: "estimate",
          }),
          makeActivity("typed_response", 1, {
            min: 20,
            max: 170,
            mode: "choose_operation",
            operations: ["+", "-", "x", "/"],
            sourceActivityType: "mixed_word_problem",
          }),
        ],
        curriculum: ["ALL"],
      },
    ],
  },
  {
    id: "y3-w7",
    week: 7,
    topic: "Multiplication - Intro",
    curriculum: ["ALL"],
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
        curriculum: ["ALL"],
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
        curriculum: ["ALL"],
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
        curriculum: ["ALL"],
      },
    ],
  },
  {
    id: "y3-w8",
    week: 8,
    topic: "Multiplication Facts",
    curriculum: ["ALL"],
    lessons: [
      {
        id: "y3-w8-l1",
        week: 8,
        lesson: 1,
        title: "2s, 5s, 10s Fluency",
        focus: "Skip count and recall multiplication facts",
        activityIdeas: lessonIdeas(
          "Fluent recall of 2s, 5s, and 10s",
          "Apply fact recall in quick-response tasks"
        ),
        activities: [
          makeActivity("skip_count", 2, {
            min: 0,
            max: 200,
            step: 10,
            mode: "forward",
          }),
          makeActivity("skip_count", 1, {
            min: 0,
            max: 200,
            step: 5,
            mode: "forward",
          }),
          makeActivity("typed_response", 1, {
            min: 0,
            max: 200,
            step: 2,
            mode: "forward",
            sourceActivityType: "skip_count",
          }),
        ],
        curriculum: ["ALL"],
      },
      {
        id: "y3-w8-l2",
        week: 8,
        lesson: 2,
        title: "Apply Facts",
        focus: "Apply multiplication facts to simple problems",
        activityIdeas: lessonIdeas(
          "Use known facts to solve one-step multiplication problems",
          "Transfer fact recall into word problems"
        ),
        activities: [
          makeActivity("equal_groups", 2, {
            minGroups: 2,
            maxGroups: 9,
            minItemsPerGroup: 2,
            maxItemsPerGroup: 10,
            mode: "equal_groups",
          }),
          makeActivity("arrays", 1, {
            minRows: 2,
            maxRows: 9,
            minColumns: 2,
            maxColumns: 10,
            mode: "arrays",
          }),
          makeActivity("multiple_choice", 1, {
            minGroups: 2,
            maxGroups: 9,
            minItemsPerGroup: 2,
            maxItemsPerGroup: 10,
            mode: "equal_groups",
            sourceActivityType: "equal_groups",
          }),
        ],
        curriculum: ["ALL"],
      },
      {
        id: "y3-w8-l3",
        week: 8,
        lesson: 3,
        title: "Mixed Practice",
        focus: "Mixed multiplication and division practice",
        activityIdeas: lessonIdeas(
          "Mix multiplication and division fact practice",
          "Select operation and justify answer"
        ),
        activities: [
          makeActivity("mixed_word_problem", 2, {
            min: 20,
            max: 180,
            mode: "mult_div_problems",
            operations: ["x", "/"],
          }),
          makeActivity("division_groups", 1, {
            minTotal: 12,
            maxTotal: 60,
            mode: "grouping",
          }),
          makeActivity("multiple_choice", 1, {
            min: 20,
            max: 180,
            mode: "mult_div_problems",
            operations: ["x", "/"],
            sourceActivityType: "mixed_word_problem",
          }),
        ],
        curriculum: ["ALL"],
      },
    ],
  },
  {
    id: "y3-w9",
    week: 9,
    topic: "Patterns & Skip Counting",
    curriculum: ["ALL"],
    lessons: [
      {
        id: "y3-w9-l1",
        week: 9,
        lesson: 1,
        title: "Skip Counting (100s, 1000s)",
        focus: "Skip count by 100s and 1000s from non-friendly starts",
        activityIdeas: lessonIdeas(
          "Skip count from non-friendly numbers such as 340 and 2,450",
          "Apply jumps to distance/population-style contexts"
        ),
        activities: [
          makeActivity("skip_count", 2, {
            min: 340,
            max: 20000,
            step: 100,
            mode: "forward",
          }),
          makeActivity("skip_count", 1, {
            min: 2450,
            max: 50000,
            step: 1000,
            mode: "forward",
          }),
          makeActivity("typed_response", 1, {
            min: 340,
            max: 20000,
            step: 100,
            mode: "forward",
            sourceActivityType: "skip_count",
          }),
        ],
        curriculum: ["ALL"],
      },
      {
        id: "y3-w9-l2",
        week: 9,
        lesson: 2,
        title: "Patterns",
        focus: "Create, extend, and justify number patterns",
        activityIdeas: lessonIdeas(
          "Build and complete additive/multiplicative patterns",
          "Explain pattern rule and predict future terms"
        ),
        activities: [
          makeActivity("number_order", 2, {
            min: 1000,
            max: 50000,
            count: 5,
            ascending: true,
          }),
          makeActivity("skip_count", 1, {
            min: 400,
            max: 12000,
            step: 100,
            mode: "forward",
          }),
          makeActivity("multiple_choice", 1, {
            min: 1000,
            max: 50000,
            count: 5,
            sourceActivityType: "number_order",
          }),
        ],
        curriculum: ["ALL"],
      },
      {
        id: "y3-w9-l3",
        week: 9,
        lesson: 3,
        title: "Estimating Totals",
        focus: "Use rounding and estimation in real contexts",
        activityIdeas: lessonIdeas(
          "Estimate totals using rounding strategies",
          "Check reasonableness of estimated and exact answers"
        ),
        activities: [
          makeActivity("number_line", 2, {
            min: 0,
            max: 10000,
            step: 1000,
            mode: "rounding",
            targets: [100, 1000],
          }),
          makeActivity("mixed_word_problem", 1, {
            min: 40,
            max: 200,
            mode: "choose_operation",
            operations: ["+", "-"],
          }),
          makeActivity("typed_response", 1, {
            min: 0,
            max: 10000,
            step: 1000,
            mode: "rounding",
            targets: [100, 1000],
            sourceActivityType: "number_line",
          }),
        ],
        curriculum: ["ALL"],
      },
    ],
  },
  {
    id: "y3-w10",
    week: 10,
    topic: "Fact Families & Number Relationships",
    curriculum: ["ALL"],
    lessons: [
      {
        id: "y3-w10-l1",
        week: 10,
        lesson: 1,
        title: "Fact Families",
        focus: "Build full multiplication/division fact-family sets",
        activityIdeas: lessonIdeas(
          "Generate full fact-family sets (e.g. 3x5, 5x3, 15/3, 15/5)",
          "Use inverse relationships to verify answers"
        ),
        activities: [
          makeActivity("fact_family", 2, {
            min: 12,
            max: 48,
            mode: "write_sentences",
          }),
          makeActivity("division_groups", 1, {
            minTotal: 12,
            maxTotal: 60,
            mode: "inverse_link",
          }),
          makeActivity("multiple_choice", 1, {
            min: 12,
            max: 48,
            mode: "recognise",
            sourceActivityType: "fact_family",
          }),
        ],
        curriculum: ["ALL"],
      },
      {
        id: "y3-w10-l2",
        week: 10,
        lesson: 2,
        title: "Mixed Problems",
        focus: "Apply number relationships across mixed operations",
        activityIdeas: lessonIdeas(
          "Solve mixed-operation problems using known relationships",
          "Choose strategy and justify operation choice"
        ),
        activities: [
          makeActivity("mixed_word_problem", 2, {
            min: 40,
            max: 220,
            mode: "choose_operation",
            operations: ["+", "-", "x", "/"],
          }),
          makeActivity("fact_family", 1, {
            min: 12,
            max: 48,
            mode: "word_problems",
          }),
          makeActivity("typed_response", 1, {
            min: 40,
            max: 220,
            mode: "choose_operation",
            operations: ["+", "-", "x", "/"],
            sourceActivityType: "mixed_word_problem",
          }),
        ],
        curriculum: ["ALL"],
      },
      {
        id: "y3-w10-l3",
        week: 10,
        lesson: 3,
        title: "Ordering & Reasoning",
        focus: "Order numbers and justify with place-value reasoning",
        activityIdeas: lessonIdeas(
          "Order values and compare magnitude efficiently",
          "Provide evidence-based ordering justifications"
        ),
        activities: [
          makeActivity("number_order", 2, {
            min: 1000,
            max: 10000,
            count: 5,
            ascending: true,
          }),
          makeActivity("number_line", 1, {
            min: 0,
            max: 10000,
            step: 500,
            mode: "estimate",
          }),
          makeActivity("typed_response", 1, {
            min: 1000,
            max: 10000,
            count: 5,
            sourceActivityType: "number_order",
          }),
        ],
        curriculum: ["ALL"],
      },
    ],
  },
  {
    id: "y3-w11",
    week: 11,
    topic: "Fractions - Part 1",
    curriculum: ["ALL"],
    lessons: [
      {
        id: "y3-w11-l1",
        week: 11,
        lesson: 1,
        title: "Recognising Unit Fractions",
        focus: "Recognise 1/2, 1/3, 1/4 using models",
        activityIdeas: lessonIdeas(
          "Identify and model unit fractions",
          "Match fraction models to real contexts"
        ),
        activities: [
          makeActivity("division_groups", 2, {
            minTotal: 12,
            maxTotal: 48,
            mode: "sharing",
          }),
          makeActivity("equal_groups", 1, {
            minGroups: 2,
            maxGroups: 4,
            minItemsPerGroup: 2,
            maxItemsPerGroup: 10,
            mode: "equal_groups",
          }),
          makeActivity("multiple_choice", 1, {
            minTotal: 12,
            maxTotal: 48,
            mode: "sharing",
            sourceActivityType: "division_groups",
          }),
        ],
        curriculum: ["ALL"],
      },
      {
        id: "y3-w11-l2",
        week: 11,
        lesson: 2,
        title: "Fractions on Number Lines",
        focus: "Place fractions correctly on number lines",
        activityIdeas: lessonIdeas(
          "Locate simple fractions on number lines",
          "Use benchmark fractions to reason about placement"
        ),
        activities: [
          makeActivity("number_line", 2, {
            min: 0,
            max: 100,
            step: 5,
            mode: "placement",
          }),
          makeActivity("number_line", 1, {
            min: 0,
            max: 100,
            step: 5,
            mode: "estimate",
          }),
          makeActivity("typed_response", 1, {
            min: 0,
            max: 100,
            step: 5,
            mode: "placement",
            sourceActivityType: "number_line",
          }),
        ],
        curriculum: ["ALL"],
      },
      {
        id: "y3-w11-l3",
        week: 11,
        lesson: 3,
        title: "Comparing Fractions",
        focus: "Compare simple fractions and justify reasoning",
        activityIdeas: lessonIdeas(
          "Compare fractions such as 1/2 and 1/4 using models/lines",
          "Explain comparisons with reference to same whole"
        ),
        activities: [
          makeActivity("division_groups", 2, {
            minTotal: 12,
            maxTotal: 48,
            mode: "grouping",
          }),
          makeActivity("mixed_word_problem", 1, {
            min: 40,
            max: 180,
            mode: "choose_operation",
            operations: ["/"],
          }),
          makeActivity("multiple_choice", 1, {
            minTotal: 12,
            maxTotal: 48,
            mode: "grouping",
            sourceActivityType: "division_groups",
          }),
        ],
        curriculum: ["ALL"],
      },
    ],
  },
  {
    id: "y3-w12",
    week: 12,
    topic: "Fractions - Part 2",
    curriculum: ["ALL"],
    lessons: [
      {
        id: "y3-w12-l1",
        week: 12,
        lesson: 1,
        title: "Equivalent Fractions",
        focus: "Recognise and build simple equivalent fractions",
        activityIdeas: lessonIdeas(
          "Explore simple equivalence (e.g. 1/2 = 2/4)",
          "Use visual models to justify equivalence"
        ),
        activities: [
          makeActivity("division_groups", 2, {
            minTotal: 12,
            maxTotal: 60,
            mode: "inverse_link",
          }),
          makeActivity("equal_groups", 1, {
            minGroups: 2,
            maxGroups: 6,
            minItemsPerGroup: 2,
            maxItemsPerGroup: 10,
            mode: "equal_groups",
          }),
          makeActivity("typed_response", 1, {
            minTotal: 12,
            maxTotal: 60,
            mode: "inverse_link",
            sourceActivityType: "division_groups",
          }),
        ],
        curriculum: ["ALL"],
      },
      {
        id: "y3-w12-l2",
        week: 12,
        lesson: 2,
        title: "Whole & Fraction Models",
        focus: "Build one whole from fractional parts",
        activityIdeas: lessonIdeas(
          "Compose and decompose whole using fraction parts",
          "Apply part-whole fraction reasoning in practical contexts"
        ),
        activities: [
          makeActivity("equal_groups", 2, {
            minGroups: 2,
            maxGroups: 8,
            minItemsPerGroup: 2,
            maxItemsPerGroup: 10,
            mode: "equal_groups",
          }),
          makeActivity("arrays", 1, {
            minRows: 2,
            maxRows: 6,
            minColumns: 2,
            maxColumns: 10,
            mode: "arrays",
          }),
          makeActivity("multiple_choice", 1, {
            minGroups: 2,
            maxGroups: 8,
            minItemsPerGroup: 2,
            maxItemsPerGroup: 10,
            mode: "equal_groups",
            sourceActivityType: "equal_groups",
          }),
        ],
        curriculum: ["ALL"],
      },
      {
        id: "y3-w12-l3",
        week: 12,
        lesson: 3,
        title: "Fraction Word Problems",
        focus: "Apply fractions in real-life contexts",
        activityIdeas: lessonIdeas(
          "Solve fraction-based word problems",
          "Explain solutions and check reasonableness"
        ),
        activities: [
          makeActivity("mixed_word_problem", 2, {
            min: 40,
            max: 220,
            mode: "choose_operation",
            operations: ["+", "-", "x", "/"],
          }),
          makeActivity("division_groups", 1, {
            minTotal: 12,
            maxTotal: 60,
            mode: "sharing",
          }),
          makeActivity("typed_response", 1, {
            min: 40,
            max: 220,
            mode: "choose_operation",
            operations: ["+", "-", "x", "/"],
            sourceActivityType: "mixed_word_problem",
          }),
        ],
        curriculum: ["ALL"],
      },
    ],
  },
];
