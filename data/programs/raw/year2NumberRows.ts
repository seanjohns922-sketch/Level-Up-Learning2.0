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

function scopedActivity(
  core: string,
  fluency: string,
  reasoning: string
) {
  return `${core} Fluency (2-3 min): ${fluency}. Reasoning prompt: ${reasoning}`;
}

export const year2NumberRows: ProgramRow[] = [
  {
    week: 1,
    focus: "Place Value to 1000",
    lesson: 1,
    topic: "Read numbers to 1000",
    activity: scopedActivity(
      "Create, read, and compare 3-digit numbers with MAB visuals.",
      "Count forwards and backwards from any 3-digit starting number.",
      "How do you know this number is greater/smaller?"
    ),
    activities: [
      makeActivity("place_value_builder", 2, {
        min: 100,
        max: 1000,
        placeValues: ["hundreds", "tens", "ones"],
        visualMode: "mab",
        mode: "identify_number",
      }),
      makeActivity("number_order", 1, {
        min: 100,
        max: 1000,
        count: 5,
        ascending: false,
      }),
      makeActivity("typed_response", 1, {
        min: 100,
        max: 1000,
        mode: "identify_number",
        sourceActivityType: "place_value_builder",
      }),
    ],
    curriculum: ["AC9M2N01"],
  },
  {
    week: 1,
    focus: "Place Value to 1000",
    lesson: 2,
    topic: "Using MAB identify unknown numbers",
    activity: scopedActivity(
      "Build and decode numbers using MAB blocks including missing parts.",
      "Rapid place-value drills with hundreds/tens/ones.",
      "If you trade 10 ones for 1 ten, what changes and what stays the same?"
    ),
    activities: [
      makeActivity("place_value_builder", 2, {
        min: 100,
        max: 1000,
        placeValues: ["hundreds", "tens", "ones"],
        visualMode: "mab",
        hideOnePlaceValue: true,
        mode: "missing_mab_part",
      }),
      makeActivity("partition_expand", 1, {
        min: 100,
        max: 999,
        mode: "flexible_partition",
      }),
      makeActivity("typed_response", 1, {
        min: 100,
        max: 1000,
        mode: "missing_mab_part",
        sourceActivityType: "place_value_builder",
        hideOnePlaceValue: true,
      }),
    ],
    curriculum: ["AC9M2N01"],
  },
  {
    week: 1,
    focus: "Place Value to 1000",
    lesson: 3,
    topic: "Order numbers up to 1000",
    activity: scopedActivity(
      "Order 3-digit numbers and justify largest/smallest choices.",
      "Quick compare-and-order sets of numbers.",
      "Which number is largest and why?"
    ),
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
      makeActivity("typed_response", 1, {
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
    activity: scopedActivity(
      "Use place value charts to partition 3-digit numbers.",
      "Quick partition warm-ups into H/T/O.",
      "How do you know your partition still equals the original number?"
    ),
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
    activity: scopedActivity(
      "Expand numbers into place-value sums.",
      "Rapid expanded-form recall.",
      "Explain why expanded form and standard form are equivalent."
    ),
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
    activity: scopedActivity(
      "Use flexible partitioning and renaming (e.g. 130 = 13 tens).",
      "Quick renaming challenges using tens and hundreds.",
      "Show two different valid partitions and explain both."
    ),
    activities: [
      makeActivity("partition_expand", 2, {
        min: 100,
        max: 999,
        mode: "flexible_partition",
      }),
      makeActivity("place_value_builder", 1, {
        min: 100,
        max: 999,
        placeValues: ["hundreds", "tens", "ones"],
        visualMode: "mab",
        mode: "identify_place",
      }),
      makeActivity("typed_response", 1, {
        min: 100,
        max: 999,
        mode: "flexible_partition",
        sourceActivityType: "partition_expand",
      }),
    ],
    curriculum: ["AC9M2N02"],
  },
  {
    week: 3,
    focus: "Number Lines & Rounding",
    lesson: 1,
    topic: "Place numbers on a number line",
    activity: scopedActivity(
      "Estimate first, then place numbers on number lines.",
      "Fast placement fluency with benchmark numbers.",
      "How close was your estimate and why?"
    ),
    activities: [
      makeActivity("number_line", 2, {
        min: 0,
        max: 1000,
        step: 10,
        mode: "placement",
      }),
      makeActivity("number_line", 1, {
        min: 0,
        max: 1000,
        step: 10,
        mode: "estimate",
      }),
      makeActivity("multiple_choice", 1, {
        min: 0,
        max: 1000,
        step: 10,
        mode: "placement",
        sourceActivityType: "number_line",
      }),
    ],
    curriculum: ["AC9M2N01", "AC9M2N02"],
  },
  {
    week: 3,
    focus: "Number Lines & Rounding",
    lesson: 2,
    topic: "Round to the nearest 10 and 100",
    activity: scopedActivity(
      "Round numbers to nearest 10 and 100 using number-line reasoning.",
      "Rapid round-to-10 and round-to-100 drills.",
      "Explain why this rounded value is reasonable."
    ),
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
    activity: scopedActivity(
      "Estimate and justify positions on number lines.",
      "Quick estimate checks against nearby benchmarks.",
      "Is your answer reasonable? Explain."
    ),
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
    activity: scopedActivity(
      "Sort and identify odd/even numbers.",
      "Quick odd/even recall warm-up.",
      "How do you know this number is odd or even?"
    ),
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
    activity: scopedActivity(
      "Sort odd/even and identify repeating parity patterns.",
      "Rapid parity pattern drills.",
      "Predict the next numbers in an odd/even pattern and explain."
    ),
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
    activity: scopedActivity(
      "Explore odd+odd, even+even, and odd+even sums.",
      "Fast sum-parity fluency checks.",
      "Is this always true? Explain why."
    ),
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
    activity: scopedActivity(
      "Use jump strategy on open number lines.",
      "Quick addition fact fluency and doubles.",
      "Why does your jump path make sense?"
    ),
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
    activity: scopedActivity(
      "Use split strategy for 2-digit addition.",
      "Rapid split-and-add fluency.",
      "Explain how tens and ones were combined."
    ),
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
    activity: scopedActivity(
      "Use friendly numbers and estimate before solving.",
      "Near-doubles and friendly-ten fluency.",
      "Estimate first, then explain why the final answer is reasonable."
    ),
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
    activity: scopedActivity(
      "Use jump strategy for subtraction.",
      "Quick subtraction fact fluency.",
      "Why are your jumps efficient?"
    ),
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
    activity: scopedActivity(
      "Use split strategy for 2-digit subtraction.",
      "Rapid split-and-subtract fluency.",
      "Explain your regrouping/partition decisions."
    ),
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
    activity: scopedActivity(
      "Use fact strategies and inverse thinking for subtraction.",
      "Fact recall and related subtraction facts.",
      "How does addition help check subtraction?"
    ),
    activities: [
      makeActivity("subtraction_strategy", 2, {
        min: 0,
        max: 100,
        mode: "fact_strategy",
      }),
      makeActivity("fact_family", 1, {
        min: 8,
        max: 30,
        mode: "recognise",
      }),
      makeActivity("typed_response", 1, {
        min: 0,
        max: 100,
        mode: "fact_strategy",
        sourceActivityType: "subtraction_strategy",
      }),
    ],
    curriculum: ["AC9M2N04"],
  },
  {
    week: 7,
    focus: "Fact Families & Inverse",
    lesson: 1,
    topic: "Recognise fact families for + and -",
    activity: scopedActivity(
      "Recognise related fact families.",
      "Rapid fact-family recall.",
      "How are these facts connected?"
    ),
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
    focus: "Fact Families & Inverse",
    lesson: 2,
    topic: "Write 4 number sentences from a fact family",
    activity: scopedActivity(
      "Write complete fact family sets from 3 numbers.",
      "Quick write-and-check fluency.",
      "Explain why each equation belongs in the same family."
    ),
    activities: interactiveActivities(
      "fact_family",
      {
        min: 10,
        max: 40,
        mode: "write_sentences",
      },
      genericActivities("fact_family", {
        min: 10,
        max: 40,
        mode: "write_sentences",
      })
    ),
    curriculum: ["AC9M2N05"],
  },
  {
    week: 7,
    focus: "Fact Families & Inverse",
    lesson: 3,
    topic: "Use fact families to solve word problems",
    activity: scopedActivity(
      "Apply fact families in word problems with explicit inverse links.",
      "Rapid inverse fact checks.",
      "Which inverse fact proves your answer?"
    ),
    activities: interactiveActivities(
      "fact_family",
      {
        min: 12,
        max: 40,
        mode: "word_problems",
      },
      genericActivities("fact_family", {
        min: 12,
        max: 40,
        mode: "word_problems",
      })
    ),
    curriculum: ["AC9M2N05"],
  },
  {
    week: 8,
    focus: "Multiplication Fluency",
    lesson: 1,
    topic: "Recall and skip count by 2s",
    activity: scopedActivity(
      "Skip count by 2s with fluency and pattern recognition.",
      "Rapid recall drills by 2s.",
      "What pattern do you notice in the ones digits?"
    ),
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
    focus: "Multiplication Fluency",
    lesson: 2,
    topic: "Recall and skip count by 5s",
    activity: scopedActivity(
      "Skip count by 5s with fluency and pattern recognition.",
      "Rapid recall drills by 5s.",
      "How do number endings help you predict the next term?"
    ),
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
    focus: "Multiplication Fluency",
    lesson: 3,
    topic: "Recall and skip count by 10s",
    activity: scopedActivity(
      "Skip count by 10s with fluency and pattern recognition.",
      "Rapid recall drills by 10s.",
      "Explain why this pattern grows predictably."
    ),
    activities: interactiveActivities(
      "skip_count",
      {
        min: 0,
        max: 200,
        step: 10,
        mode: "forward",
      },
      genericActivities("skip_count", {
        min: 0,
        max: 200,
        step: 10,
        mode: "forward",
      })
    ),
    curriculum: ["AC9M2N03"],
  },
  {
    week: 9,
    focus: "Multiplication - Groups & Arrays",
    lesson: 1,
    topic: "Model multiplication as equal groups",
    activity: scopedActivity(
      "Model multiplication as equal groups.",
      "Quick multiplication fact fluency linked to groups.",
      "Explain what equal groups means in this model."
    ),
    activities: [
      makeActivity("equal_groups", 2, {
        allowedGroupSizes: [2, 3, 5, 10],
        mode: "equal_groups",
      }),
      makeActivity("arrays", 1, {
        allowedGroupSizes: [2, 3, 5, 10],
        mode: "arrays",
      }),
      makeActivity("multiple_choice", 1, {
        allowedGroupSizes: [2, 3, 5, 10],
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
    activity: scopedActivity(
      "Model multiplication as arrays using rows and columns.",
      "Rapid recall of row/column totals.",
      "Explain what the array shows and how you know."
    ),
    activities: [
      makeActivity("arrays", 2, {
        allowedGroupSizes: [2, 3, 5, 10],
        mode: "arrays",
      }),
      makeActivity("arrays", 1, {
        allowedGroupSizes: [2, 3, 5, 10],
        mode: "arrays",
      }),
      makeActivity("multiple_choice", 1, {
        allowedGroupSizes: [2, 3, 5, 10],
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
    activity: scopedActivity(
      "Link arrays to repeated addition sentences.",
      "Quick repeated-addition fluency.",
      "How does the repeated addition sentence match the array?"
    ),
    activities: [
      makeActivity("arrays", 2, {
        allowedGroupSizes: [2, 3, 5, 10],
        mode: "repeated_addition",
      }),
      makeActivity("fact_family", 1, {
        min: 0,
        max: 20,
        mode: "recognise",
      }),
      makeActivity("typed_response", 1, {
        allowedGroupSizes: [2, 3, 5, 10],
        mode: "repeated_addition",
        sourceActivityType: "arrays",
      }),
    ],
    curriculum: ["AC9M2N05"],
  },
  {
    week: 10,
    focus: "Division - Equal Groups",
    lesson: 1,
    topic: "Model division as sharing",
    activity: scopedActivity(
      "Model division as sharing into equal groups.",
      "Quick sharing facts and skip-count checks.",
      "How is sharing different from grouping?"
    ),
    activities: [
      makeActivity("division_groups", 2, {
        minTotal: 6,
        maxTotal: 30,
        allowedGroupSizes: [2, 3, 5, 10],
        mode: "sharing",
      }),
      makeActivity("arrays", 1, {
        allowedGroupSizes: [2, 3, 5, 10],
        mode: "arrays",
      }),
      makeActivity("multiple_choice", 1, {
        minTotal: 6,
        maxTotal: 30,
        allowedGroupSizes: [2, 3, 5, 10],
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
    activity: scopedActivity(
      "Model division as grouping and count the number of groups.",
      "Fast grouping fluency checks.",
      "Explain why your grouping answer is correct."
    ),
    activities: [
      makeActivity("division_groups", 2, {
        minTotal: 6,
        maxTotal: 30,
        allowedGroupSizes: [2, 3, 5, 10],
        mode: "grouping",
      }),
      makeActivity("arrays", 1, {
        allowedGroupSizes: [2, 3, 5, 10],
        mode: "arrays",
      }),
      makeActivity("typed_response", 1, {
        minTotal: 6,
        maxTotal: 30,
        allowedGroupSizes: [2, 3, 5, 10],
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
    activity: scopedActivity(
      "Link division to multiplication using inverse facts.",
      "Rapid inverse fact recall.",
      "Which multiplication fact checks this division result?"
    ),
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
    activity: scopedActivity(
      "Choose the correct operation for word problems.",
      "Quick operation-selection fluency.",
      "Estimate first: does your chosen operation make sense?"
    ),
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
    activity: scopedActivity(
      "Solve two-step add/subtract problems.",
      "Rapid two-step structure drills.",
      "Estimate before solving and check if your answer is reasonable."
    ),
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
    activity: scopedActivity(
      "Solve mixed multiplication/division problems.",
      "Fast mult/div recall and inverse checks.",
      "Does your final answer make sense in the context?"
    ),
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
    activity: scopedActivity(
      "Rotate through mixed revision stations.",
      "Mixed fluency block across core facts.",
      "Explain one strategy you used successfully."
    ),
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
    activity: scopedActivity(
      "Collaborative revision through team math challenges.",
      "Mixed fluency sprint across prior skills.",
      "How do you know your team strategy works?"
    ),
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
    activity: scopedActivity(
      "Complete end-of-unit mixed quiz.",
      "Short mixed fluency warm-up before final quiz.",
      "Check: is your answer reasonable and why?"
    ),
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
