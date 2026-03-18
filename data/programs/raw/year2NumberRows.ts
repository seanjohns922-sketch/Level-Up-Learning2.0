import type { ProgramRow } from "../buildProgram";
import type { ActivityType, LessonActivity } from "../types";

function makeActivity(
  activityType: ActivityType,
  weight: number,
  config: Record<string, unknown>
): LessonActivity {
  return { activityType, weight, config };
}

function interactiveActivities(
  primaryType: ActivityType,
  primaryConfig: Record<string, unknown>,
  extras: LessonActivity[]
): LessonActivity[] {
  return [makeActivity(primaryType, 2, primaryConfig), ...extras];
}

function genericActivities(
  sourceActivityType: ActivityType,
  sourceConfig: Record<string, unknown>
): LessonActivity[] {
  return [
    makeActivity("multiple_choice", 2, {
      ...sourceConfig,
      sourceActivityType,
    }),
    makeActivity("typed_response", 1, {
      ...sourceConfig,
      sourceActivityType,
    }),
  ];
}

export const year2NumberRows: ProgramRow[] = [
  {
    week: 1,
    focus: "Place Value to 1000",
    lesson: 1,
    topic: "Read numbers to 1000",
    activity: "Create a number with a dice or numbot rolling it, dragging MAB to match.",
    activities: interactiveActivities(
      "place_value_builder",
      {
        min: 100,
        max: 1000,
        placeValues: ["hundreds", "tens", "ones"],
        visualMode: "mab",
        mode: "identify_number",
      },
      [
        makeActivity("multiple_choice", 1, {
          min: 100,
          max: 1000,
          mode: "identify_number",
          sourceActivityType: "place_value_builder",
        }),
        makeActivity("typed_response", 1, {
          min: 100,
          max: 1000,
          mode: "identify_number",
          sourceActivityType: "place_value_builder",
        }),
      ]
    ),
    curriculum: ["AC9M2N01"],
  },
  {
    week: 1,
    focus: "Place Value to 1000",
    lesson: 2,
    topic: "Using MAB identify unknown numbers",
    activity: "Build numbers using place value blocks.",
    activities: interactiveActivities(
      "place_value_builder",
      {
        min: 100,
        max: 1000,
        placeValues: ["hundreds", "tens", "ones"],
        visualMode: "mab",
        hideOnePlaceValue: true,
      },
      [
        makeActivity("multiple_choice", 1, {
          min: 100,
          max: 1000,
          mode: "missing_mab_part",
          sourceActivityType: "place_value_builder",
          hideOnePlaceValue: true,
        }),
        makeActivity("typed_response", 1, {
          min: 100,
          max: 1000,
          mode: "missing_mab_part",
          sourceActivityType: "place_value_builder",
          hideOnePlaceValue: true,
        }),
      ]
    ),
    curriculum: ["AC9M2N01"],
  },
  {
    week: 1,
    focus: "Place Value to 1000",
    lesson: 3,
    topic: "Order numbers up to 1000",
    activity: "Put 2 numbers together and talk about bigger or smaller, then order 4-5 numbers.",
    activities: [
      makeActivity("number_order", 2, {
        min: 100,
        max: 1000,
        count: 4,
        ascending: true,
      }),
      makeActivity("number_line", 1, {
        min: 100,
        max: 1000,
        step: 50,
        mode: "placement",
      }),
      makeActivity("multiple_choice", 1, {
        min: 100,
        max: 1000,
        count: 4,
        sourceActivityType: "number_order",
      }),
    ],
    curriculum: ["AC9M2N01"],
  },
  {
    week: 2,
    focus: "Partitioning & Expanding",
    lesson: 1,
    topic: "Break numbers into hundreds, tens, and ones",
    activity: "Use place value charts to break numbers.",
    activities: [
      makeActivity("partition_expand", 2, {
        min: 100,
        max: 999,
        mode: "partition",
        placeValues: ["hundreds", "tens", "ones"],
      }),
      makeActivity("place_value_builder", 1, {
        min: 100,
        max: 999,
        placeValues: ["hundreds", "tens", "ones"],
        visualMode: "mab",
        mode: "identify_place",
      }),
      makeActivity("multiple_choice", 1, {
        min: 100,
        max: 999,
        mode: "partition",
        sourceActivityType: "partition_expand",
      }),
    ],
    curriculum: ["AC9M2N02"],
  },
  {
    week: 2,
    focus: "Partitioning & Expanding",
    lesson: 2,
    topic: "Expand numbers",
    activity: "Expand numbers with arrows.",
    activities: interactiveActivities(
      "partition_expand",
      {
        min: 100,
        max: 999,
        mode: "expand",
      },
      genericActivities("partition_expand", {
        min: 100,
        max: 999,
        mode: "expand",
      })
    ),
    curriculum: ["AC9M2N02"],
  },
  {
    week: 2,
    focus: "Partitioning & Expanding",
    lesson: 3,
    topic: "Partition numbers in different ways",
    activity: "Use partitioning mats.",
    activities: interactiveActivities(
      "partition_expand",
      {
        min: 100,
        max: 999,
        mode: "flexible_partition",
      },
      genericActivities("partition_expand", {
        min: 100,
        max: 999,
        mode: "flexible_partition",
      })
    ),
    curriculum: ["AC9M2N02"],
  },
  {
    week: 3,
    focus: "Number Lines & Rounding",
    lesson: 1,
    topic: "Place numbers on a number line",
    activity: "Estimate and place numbers on line.",
    activities: interactiveActivities(
      "number_line",
      {
        min: 0,
        max: 1000,
        step: 10,
        mode: "placement",
      },
      genericActivities("number_line", {
        min: 0,
        max: 1000,
        step: 10,
        mode: "placement",
      })
    ),
    curriculum: ["AC9M2N01", "AC9M2N02"],
  },
  {
    week: 3,
    focus: "Number Lines & Rounding",
    lesson: 2,
    topic: "Round to the nearest 10 and 100",
    activity: "Round numbers with number line support.",
    activities: interactiveActivities(
      "number_line",
      {
        min: 0,
        max: 1000,
        step: 10,
        mode: "rounding",
        targets: [10, 100],
      },
      genericActivities("number_line", {
        min: 0,
        max: 1000,
        step: 10,
        mode: "rounding",
        targets: [10, 100],
      })
    ),
    curriculum: ["AC9M2N01", "AC9M2N02"],
  },
  {
    week: 3,
    focus: "Number Lines & Rounding",
    lesson: 3,
    topic: "Estimate numbers on number lines",
    activity: "Play rounding estimation games.",
    activities: interactiveActivities(
      "number_line",
      {
        min: 0,
        max: 1000,
        step: 50,
        mode: "estimate",
      },
      genericActivities("number_line", {
        min: 0,
        max: 1000,
        step: 50,
        mode: "estimate",
      })
    ),
    curriculum: ["AC9M2N01", "AC9M2N02"],
  },
  {
    week: 4,
    focus: "Odd & Even Numbers",
    lesson: 1,
    topic: "Identify odd and even numbers",
    activity: "Use counters to sort odd/even",
    activities: [
      makeActivity("odd_even_sort", 2, {
        min: 0,
        max: 30,
        count: 6,
        mode: "identify",
      }),
      makeActivity("typed_response", 1, {
        min: 0,
        max: 30,
        mode: "identify",
        sourceActivityType: "odd_even_sort",
      }),
      makeActivity("multiple_choice", 1, {
        min: 0,
        max: 30,
        mode: "identify",
        sourceActivityType: "odd_even_sort",
      }),
    ],
    curriculum: ["AC9M2N03"],
  },
  {
    week: 4,
    focus: "Odd & Even Numbers",
    lesson: 2,
    topic: "Sort and explain odd/even patterns",
    activity: "Use hundreds charts to find patterns",
    activities: [
      makeActivity("odd_even_sort", 2, {
        min: 0,
        max: 40,
        count: 6,
        mode: "identify",
      }),
      makeActivity("multiple_choice", 1, {
        min: 0,
        max: 40,
        mode: "pattern",
        sourceActivityType: "odd_even_sort",
      }),
      makeActivity("typed_response", 1, {
        min: 0,
        max: 40,
        mode: "pattern",
        sourceActivityType: "odd_even_sort",
      }),
    ],
    curriculum: ["AC9M2N03"],
  },
  {
    week: 4,
    focus: "Odd & Even Numbers",
    lesson: 3,
    topic: "Add odd/even and explore results",
    activity: "Test sums of odd/even numbers",
    activities: [
      makeActivity("odd_even_sort", 2, {
        min: 0,
        max: 50,
        count: 6,
        mode: "odd_even_sums",
      }),
      makeActivity("typed_response", 1, {
        min: 0,
        max: 50,
        mode: "odd_even_sums",
        sourceActivityType: "odd_even_sort",
      }),
      makeActivity("multiple_choice", 1, {
        min: 0,
        max: 50,
        mode: "odd_even_sums",
        sourceActivityType: "odd_even_sort",
      }),
    ],
    curriculum: ["AC9M2N03"],
  },
  {
    week: 5,
    focus: "Addition Strategies",
    lesson: 1,
    topic: "Use jump strategy on open number lines",
    activity: "Draw jumps on number lines",
    activities: interactiveActivities(
      "addition_strategy",
      {
        min: 0,
        max: 100,
        mode: "jump",
      },
      genericActivities("addition_strategy", {
        min: 0,
        max: 100,
        mode: "jump",
      })
    ),
    curriculum: ["AC9M2N04"],
  },
  {
    week: 5,
    focus: "Addition Strategies",
    lesson: 2,
    topic: "Use split strategy to add 2-digit numbers",
    activity: "Split tens and ones to add",
    activities: interactiveActivities(
      "addition_strategy",
      {
        min: 10,
        max: 99,
        mode: "split",
      },
      genericActivities("addition_strategy", {
        min: 10,
        max: 99,
        mode: "split",
      })
    ),
    curriculum: ["AC9M2N04"],
  },
  {
    week: 5,
    focus: "Addition Strategies",
    lesson: 3,
    topic: "Use friendly numbers for addition",
    activity: "Add to friendly tens (e.g. 40 + 3)",
    activities: interactiveActivities(
      "addition_strategy",
      {
        min: 10,
        max: 99,
        mode: "friendly_numbers",
      },
      genericActivities("addition_strategy", {
        min: 10,
        max: 99,
        mode: "friendly_numbers",
      })
    ),
    curriculum: ["AC9M2N04"],
  },
  {
    week: 6,
    focus: "Subtraction Strategies",
    lesson: 1,
    topic: "Use jump strategy for subtraction",
    activity: "Jump back on number line",
    activities: interactiveActivities(
      "subtraction_strategy",
      {
        min: 0,
        max: 100,
        mode: "jump",
      },
      genericActivities("subtraction_strategy", {
        min: 0,
        max: 100,
        mode: "jump",
      })
    ),
    curriculum: ["AC9M2N04"],
  },
  {
    week: 6,
    focus: "Subtraction Strategies",
    lesson: 2,
    topic: "Use split strategy to subtract 2-digit numbers",
    activity: "Split and subtract each place",
    activities: interactiveActivities(
      "subtraction_strategy",
      {
        min: 10,
        max: 99,
        mode: "split",
      },
      genericActivities("subtraction_strategy", {
        min: 10,
        max: 99,
        mode: "split",
      })
    ),
    curriculum: ["AC9M2N04"],
  },
  {
    week: 6,
    focus: "Subtraction Strategies",
    lesson: 3,
    topic: "Use fact strategies to subtract",
    activity: "Subtract using known facts",
    activities: interactiveActivities(
      "subtraction_strategy",
      {
        min: 0,
        max: 100,
        mode: "fact_strategy",
      },
      genericActivities("subtraction_strategy", {
        min: 0,
        max: 100,
        mode: "fact_strategy",
      })
    ),
    curriculum: ["AC9M2N04"],
  },
  {
    week: 7,
    focus: "Fact Families",
    lesson: 1,
    topic: "Recognise fact families for + and -",
    activity: "Use triangle cards",
    activities: interactiveActivities(
      "fact_family",
      {
        min: 8,
        max: 30,
        mode: "recognise",
      },
      genericActivities("fact_family", {
        min: 8,
        max: 30,
        mode: "recognise",
      })
    ),
    curriculum: ["AC9M2N05"],
  },
  {
    week: 7,
    focus: "Fact Families",
    lesson: 2,
    topic: "Write 4 number sentences from a fact family",
    activity: "Write related facts from 3 numbers",
    activities: interactiveActivities(
      "fact_family",
      {
        min: 10,
        max: 100,
        mode: "write_sentences",
      },
      genericActivities("fact_family", {
        min: 10,
        max: 100,
        mode: "write_sentences",
      })
    ),
    curriculum: ["AC9M2N05"],
  },
  {
    week: 7,
    focus: "Fact Families",
    lesson: 3,
    topic: "Use fact families to solve word problems",
    activity: "Match fact families to word problems",
    activities: interactiveActivities(
      "fact_family",
      {
        min: 12,
        max: 100,
        mode: "word_problems",
      },
      genericActivities("fact_family", {
        min: 12,
        max: 100,
        mode: "word_problems",
      })
    ),
    curriculum: ["AC9M2N05"],
  },
  {
    week: 9,
    focus: "Multiplication - Groups & Arrays",
    lesson: 1,
    topic: "Model multiplication as equal groups",
    activity: "Make groups with counters",
    activities: [
      makeActivity("equal_groups", 2, {
        minGroups: 2,
        maxGroups: 5,
        minItemsPerGroup: 2,
        maxItemsPerGroup: 5,
        mode: "equal_groups",
      }),
      makeActivity("skip_count", 1, {
        minRows: 2,
        maxRows: 5,
        minColumns: 2,
        maxColumns: 6,
        mode: "arrays",
      }),
      makeActivity("multiple_choice", 1, {
        minGroups: 2,
        maxGroups: 5,
        minItemsPerGroup: 2,
        maxItemsPerGroup: 5,
        mode: "equal_groups",
        sourceActivityType: "equal_groups",
      }),
    ],
    curriculum: ["AC9M2N05"],
  },
  {
    week: 9,
    focus: "Multiplication - Groups & Arrays",
    lesson: 2,
    topic: "Model multiplication as arrays",
    activity: "Build arrays with rows and columns",
    activities: [
      makeActivity("arrays", 2, {
        minRows: 2,
        maxRows: 5,
        minColumns: 2,
        maxColumns: 5,
        mode: "arrays",
      }),
      makeActivity("arrays", 1, {
        minRows: 2,
        maxRows: 4,
        minColumns: 2,
        maxColumns: 6,
        mode: "arrays",
      }),
      makeActivity("multiple_choice", 1, {
        minRows: 2,
        maxRows: 5,
        minColumns: 2,
        maxColumns: 5,
        mode: "arrays",
        sourceActivityType: "arrays",
      }),
    ],
    curriculum: ["AC9M2N05"],
  },
  {
    week: 9,
    focus: "Multiplication - Groups & Arrays",
    lesson: 3,
    topic: "Link multiplication to repeated addition",
    activity: "Write repeated addition sentences",
    activities: [
      makeActivity("arrays", 2, {
        minRows: 2,
        maxRows: 5,
        minColumns: 2,
        maxColumns: 5,
        mode: "repeated_addition",
      }),
      makeActivity("fact_family", 1, {
        min: 0,
        max: 20,
        mode: "recognise",
      }),
      makeActivity("typed_response", 1, {
        minRows: 2,
        maxRows: 5,
        minColumns: 2,
        maxColumns: 5,
        mode: "repeated_addition",
        sourceActivityType: "arrays",
      }),
    ],
    curriculum: ["AC9M2N05"],
  },
  {
    week: 8,
    focus: "Multiplication - 2s, 5s, 10s",
    lesson: 1,
    topic: "Recall and skip count by 2s",
    activity: "Skip count using number lines",
    activities: interactiveActivities(
      "skip_count",
      {
        min: 0,
        max: 100,
        step: 2,
        mode: "forward",
      },
      genericActivities("skip_count", {
        min: 0,
        max: 100,
        step: 2,
        mode: "forward",
      })
    ),
    curriculum: ["AC9M2N03"],
  },
  {
    week: 8,
    focus: "Multiplication - 2s, 5s, 10s",
    lesson: 2,
    topic: "Recall and skip count by 5s",
    activity: "Chant and recall facts with music",
    activities: interactiveActivities(
      "skip_count",
      {
        min: 0,
        max: 100,
        step: 5,
        mode: "forward",
      },
      genericActivities("skip_count", {
        min: 0,
        max: 100,
        step: 5,
        mode: "forward",
      })
    ),
    curriculum: ["AC9M2N03"],
  },
  {
    week: 8,
    focus: "Multiplication - 2s, 5s, 10s",
    lesson: 3,
    topic: "Recall and skip count by 10s",
    activity: "Write and recall fact families",
    activities: interactiveActivities(
      "skip_count",
      {
        min: 0,
        max: 1000,
        step: 10,
        mode: "forward",
      },
      genericActivities("skip_count", {
        min: 0,
        max: 1000,
        step: 10,
        mode: "forward",
      })
    ),
    curriculum: ["AC9M2N03"],
  },
  {
    week: 10,
    focus: "Division - Equal Groups",
    lesson: 1,
    topic: "Model division as sharing",
    activity: "Share items equally in groups",
    activities: [
      makeActivity("division_groups", 2, {
        minTotal: 6,
        maxTotal: 24,
        mode: "sharing",
      }),
      makeActivity("arrays", 1, {
        minRows: 2,
        maxRows: 4,
        minColumns: 2,
        maxColumns: 5,
        mode: "arrays",
      }),
      makeActivity("multiple_choice", 1, {
        minTotal: 6,
        maxTotal: 24,
        mode: "sharing",
        sourceActivityType: "division_groups",
      }),
    ],
    curriculum: ["AC9M2N06"],
  },
  {
    week: 10,
    focus: "Division - Equal Groups",
    lesson: 2,
    topic: "Model division as grouping",
    activity: "Draw groups to match division",
    activities: [
      makeActivity("division_groups", 2, {
        minTotal: 6,
        maxTotal: 24,
        mode: "grouping",
      }),
      makeActivity("arrays", 1, {
        minRows: 2,
        maxRows: 4,
        minColumns: 2,
        maxColumns: 6,
        mode: "arrays",
      }),
      makeActivity("typed_response", 1, {
        minTotal: 6,
        maxTotal: 24,
        mode: "grouping",
        sourceActivityType: "division_groups",
      }),
    ],
    curriculum: ["AC9M2N06"],
  },
  {
    week: 10,
    focus: "Division - Equal Groups",
    lesson: 3,
    topic: "Link division to multiplication",
    activity: "Use inverse to check answers",
    activities: [
      makeActivity("division_groups", 2, {
        minTotal: 6,
        maxTotal: 24,
        mode: "inverse_link",
      }),
      makeActivity("fact_family", 1, {
        min: 0,
        max: 20,
        mode: "recognise",
      }),
      makeActivity("multiple_choice", 1, {
        minTotal: 6,
        maxTotal: 24,
        mode: "inverse_link",
        sourceActivityType: "division_groups",
      }),
    ],
    curriculum: ["AC9M2N06"],
  },
  {
    week: 11,
    focus: "Mixed Operations",
    lesson: 1,
    topic: "Choose operation to solve problem",
    activity: "Read problem and underline clues",
    activities: [
      makeActivity("mixed_word_problem", 2, {
        min: 0,
        max: 100,
        mode: "choose_operation",
        operations: ["+", "-", "x", "/"],
      }),
      makeActivity("addition_strategy", 1, {
        min: 0,
        max: 100,
        mode: "jump",
      }),
      makeActivity("multiple_choice", 1, {
        min: 0,
        max: 100,
        mode: "choose_operation",
        operations: ["+", "-", "x", "/"],
        sourceActivityType: "mixed_word_problem",
      }),
    ],
    curriculum: ["AC9M2N06"],
  },
  {
    week: 11,
    focus: "Mixed Operations",
    lesson: 2,
    topic: "Solve 2-step problems with + and -",
    activity: "Draw steps in a 2-step problem",
    activities: [
      makeActivity("mixed_word_problem", 2, {
        min: 0,
        max: 100,
        mode: "two_step_add_sub",
        operations: ["+", "-"],
      }),
      makeActivity("subtraction_strategy", 1, {
        min: 0,
        max: 100,
        mode: "jump",
      }),
      makeActivity("typed_response", 1, {
        min: 0,
        max: 100,
        mode: "two_step_add_sub",
        operations: ["+", "-"],
        sourceActivityType: "mixed_word_problem",
      }),
    ],
    curriculum: ["AC9M2N06"],
  },
  {
    week: 11,
    focus: "Mixed Operations",
    lesson: 3,
    topic: "Solve problems with x and /",
    activity: "Use operation mats to solve",
    activities: [
      makeActivity("mixed_word_problem", 2, {
        min: 0,
        max: 50,
        mode: "mult_div_problems",
        operations: ["x", "/"],
      }),
      makeActivity("division_groups", 1, {
        minTotal: 6,
        maxTotal: 24,
        mode: "inverse_link",
      }),
      makeActivity("multiple_choice", 1, {
        min: 0,
        max: 50,
        mode: "mult_div_problems",
        operations: ["x", "/"],
        sourceActivityType: "mixed_word_problem",
      }),
    ],
    curriculum: ["AC9M2N06"],
  },
  {
    week: 12,
    focus: "Review & Quiz",
    lesson: 1,
    topic: "Revision stations",
    activity: "Rotate through revision tasks",
    activities: [
      makeActivity("review_quiz", 2, {
        mode: "revision_stations",
        reviewActivities: [
          "skip_count",
          "arrays",
          "fact_family",
          "number_line",
        ],
      }),
      makeActivity("skip_count", 1, {
        min: 0,
        max: 100,
        step: 5,
        mode: "forward",
      }),
      makeActivity("arrays", 1, {
        minRows: 2,
        maxRows: 5,
        minColumns: 2,
        maxColumns: 5,
        mode: "arrays",
      }),
    ],
    curriculum: ["AC9M2N06"],
  },
  {
    week: 12,
    focus: "Review & Quiz",
    lesson: 2,
    topic: "Math games and group challenges",
    activity: "Compete in team math games",
    activities: [
      makeActivity("review_quiz", 2, {
        mode: "team_challenges",
        reviewActivities: [
          "division_groups",
          "fact_family",
          "addition_strategy",
          "odd_even_sort",
        ],
      }),
      makeActivity("division_groups", 1, {
        minTotal: 6,
        maxTotal: 24,
        mode: "grouping",
      }),
      makeActivity("fact_family", 1, {
        min: 0,
        max: 20,
        mode: "recognise",
      }),
    ],
    curriculum: ["AC9M2N06"],
  },
  {
    week: 12,
    focus: "Review & Quiz",
    lesson: 3,
    topic: "End-of-unit quiz",
    activity: "Complete individual review quiz",
    activities: [
      makeActivity("review_quiz", 2, {
        mode: "final_quiz",
        reviewActivities: [
          "skip_count",
          "arrays",
          "division_groups",
          "mixed_word_problem",
          "addition_strategy",
          "subtraction_strategy",
        ],
      }),
      makeActivity("mixed_word_problem", 1, {
        min: 0,
        max: 60,
        mode: "choose_operation",
        operations: ["+", "-", "x", "/"],
      }),
      makeActivity("typed_response", 1, {
        mode: "final_quiz",
        sourceActivityType: "review_quiz",
        reviewActivities: [
          "skip_count",
          "arrays",
          "division_groups",
          "mixed_word_problem",
          "addition_strategy",
          "subtraction_strategy",
        ],
      }),
    ],
    curriculum: ["AC9M2N06"],
  },
];
