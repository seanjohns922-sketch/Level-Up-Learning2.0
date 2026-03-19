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

/* ─── Fluency helper: adds a rapid-recall typed_response activity ─── */
function fluencyActivity(
  sourceActivityType: ActivityType,
  config: Record<string, unknown>
): LessonActivity {
  return makeActivity("typed_response", 1, {
    ...config,
    sourceActivityType,
    fluency: true,
  });
}

/* ─── Reasoning helper: adds an MCQ with reasoning prompt ─── */
function reasoningMCQ(
  sourceActivityType: ActivityType,
  config: Record<string, unknown>
): LessonActivity {
  return makeActivity("multiple_choice", 1, {
    ...config,
    sourceActivityType,
    reasoning: true,
  });
}

export const year2NumberRows: ProgramRow[] = [
  // ═══════════════════════════════════════════════════════════
  // WEEK 1 – PLACE VALUE TO 1000
  // ═══════════════════════════════════════════════════════════
  {
    week: 1,
    focus: "Place Value to 1000",
    lesson: 1,
    topic: "Read numbers to 1000",
    activity: "Create a number with a dice or numbot rolling it, dragging MAB to match.",
    activities: [
      makeActivity("place_value_builder", 2, {
        min: 100,
        max: 1000,
        placeValues: ["hundreds", "tens", "ones"],
        visualMode: "mab",
        mode: "identify_number",
      }),
      makeActivity("skip_count", 1, {
        min: 0,
        max: 1000,
        step: 10,
        mode: "forward",
      }),
      makeActivity("multiple_choice", 1, {
        min: 100,
        max: 1000,
        mode: "identify_number",
        sourceActivityType: "place_value_builder",
      }),
      fluencyActivity("addition_strategy", {
        min: 0,
        max: 20,
        mode: "jump",
      }),
    ],
    curriculum: ["AC9M2N01"],
  },
  {
    week: 1,
    focus: "Place Value to 1000",
    lesson: 2,
    topic: "Using MAB identify unknown numbers",
    activity: "Build numbers using place value blocks. Trading blocks (10 ones = 1 ten, 10 tens = 1 hundred).",
    activities: [
      makeActivity("place_value_builder", 2, {
        min: 100,
        max: 1000,
        placeValues: ["hundreds", "tens", "ones"],
        visualMode: "mab",
        hideOnePlaceValue: true,
      }),
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
      fluencyActivity("skip_count", {
        min: 0,
        max: 100,
        step: 2,
        mode: "forward",
      }),
    ],
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
      reasoningMCQ("number_order", {
        min: 100,
        max: 1000,
        count: 4,
        reasoning: true,
      }),
      fluencyActivity("addition_strategy", {
        min: 0,
        max: 20,
        mode: "jump",
      }),
    ],
    curriculum: ["AC9M2N01"],
  },

  // ═══════════════════════════════════════════════════════════
  // WEEK 2 – PARTITIONING & EXPANDING
  // ═══════════════════════════════════════════════════════════
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
      fluencyActivity("skip_count", {
        min: 0,
        max: 100,
        step: 5,
        mode: "forward",
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
    activities: [
      ...interactiveActivities(
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
      fluencyActivity("addition_strategy", {
        min: 0,
        max: 20,
        mode: "split",
      }),
    ],
    curriculum: ["AC9M2N02"],
  },
  {
    week: 2,
    focus: "Partitioning & Expanding",
    lesson: 3,
    topic: "Partition numbers in different ways",
    activity: "Use partitioning mats. Renaming numbers (e.g. 130 = 13 tens).",
    activities: [
      makeActivity("partition_expand", 2, {
        min: 100,
        max: 999,
        mode: "flexible_partition",
      }),
      makeActivity("multiple_choice", 1, {
        min: 100,
        max: 999,
        mode: "flexible_partition",
        sourceActivityType: "partition_expand",
      }),
      makeActivity("typed_response", 1, {
        min: 100,
        max: 999,
        mode: "flexible_partition",
        sourceActivityType: "partition_expand",
        reasoning: true,
      }),
      fluencyActivity("skip_count", {
        min: 0,
        max: 100,
        step: 10,
        mode: "forward",
      }),
    ],
    curriculum: ["AC9M2N02"],
  },

  // ═══════════════════════════════════════════════════════════
  // WEEK 3 – NUMBER LINES & ROUNDING
  // ═══════════════════════════════════════════════════════════
  {
    week: 3,
    focus: "Number Lines & Rounding",
    lesson: 1,
    topic: "Place numbers on a number line",
    activity: "Estimate and place numbers on line.",
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
        step: 50,
        mode: "estimate",
      }),
      makeActivity("multiple_choice", 1, {
        min: 0,
        max: 1000,
        step: 10,
        mode: "placement",
        sourceActivityType: "number_line",
      }),
      fluencyActivity("addition_strategy", {
        min: 0,
        max: 30,
        mode: "jump",
      }),
    ],
    curriculum: ["AC9M2N01", "AC9M2N02"],
  },
  {
    week: 3,
    focus: "Number Lines & Rounding",
    lesson: 2,
    topic: "Round to the nearest 10 and 100",
    activity: "Round numbers with number line support.",
    activities: [
      ...interactiveActivities(
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
      fluencyActivity("skip_count", {
        min: 0,
        max: 100,
        step: 2,
        mode: "forward",
      }),
    ],
    curriculum: ["AC9M2N01", "AC9M2N02"],
  },
  {
    week: 3,
    focus: "Number Lines & Rounding",
    lesson: 3,
    topic: "Estimate numbers on number lines",
    activity: "Play rounding estimation games. Is your answer reasonable?",
    activities: [
      makeActivity("number_line", 2, {
        min: 0,
        max: 1000,
        step: 50,
        mode: "estimate",
      }),
      reasoningMCQ("number_line", {
        min: 0,
        max: 1000,
        step: 50,
        mode: "estimate",
        reasoning: true,
      }),
      makeActivity("typed_response", 1, {
        min: 0,
        max: 1000,
        step: 50,
        mode: "estimate",
        sourceActivityType: "number_line",
      }),
      fluencyActivity("addition_strategy", {
        min: 0,
        max: 30,
        mode: "friendly_numbers",
      }),
    ],
    curriculum: ["AC9M2N01", "AC9M2N02"],
  },

  // ═══════════════════════════════════════════════════════════
  // WEEK 4 – ODD & EVEN NUMBERS
  // ═══════════════════════════════════════════════════════════
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
      fluencyActivity("skip_count", {
        min: 0,
        max: 100,
        step: 2,
        mode: "forward",
      }),
    ],
    curriculum: ["AC9M2N03"],
  },
  {
    week: 4,
    focus: "Odd & Even Numbers",
    lesson: 2,
    topic: "Sort and explain odd/even patterns",
    activity: "Use hundreds charts to find patterns. Predict next numbers.",
    activities: [
      makeActivity("odd_even_sort", 2, {
        min: 0,
        max: 40,
        count: 6,
        mode: "pattern",
      }),
      makeActivity("multiple_choice", 1, {
        min: 0,
        max: 40,
        mode: "pattern",
        sourceActivityType: "odd_even_sort",
        reasoning: true,
      }),
      makeActivity("typed_response", 1, {
        min: 0,
        max: 40,
        mode: "pattern",
        sourceActivityType: "odd_even_sort",
      }),
      fluencyActivity("addition_strategy", {
        min: 0,
        max: 20,
        mode: "jump",
      }),
    ],
    curriculum: ["AC9M2N03"],
  },
  {
    week: 4,
    focus: "Odd & Even Numbers",
    lesson: 3,
    topic: "Add odd/even and explore results",
    activity: "Test sums of odd/even numbers. odd + odd = ? even + even = ? Explain why.",
    activities: [
      makeActivity("odd_even_sort", 2, {
        min: 0,
        max: 50,
        count: 6,
        mode: "odd_even_sums",
      }),
      reasoningMCQ("odd_even_sort", {
        min: 0,
        max: 50,
        mode: "odd_even_sums",
        reasoning: true,
      }),
      makeActivity("typed_response", 1, {
        min: 0,
        max: 50,
        mode: "odd_even_sums",
        sourceActivityType: "odd_even_sort",
      }),
      fluencyActivity("skip_count", {
        min: 0,
        max: 100,
        step: 5,
        mode: "forward",
      }),
    ],
    curriculum: ["AC9M2N03"],
  },

  // ═══════════════════════════════════════════════════════════
  // WEEK 5 – ADDITION STRATEGIES
  // ═══════════════════════════════════════════════════════════
  {
    week: 5,
    focus: "Addition Strategies",
    lesson: 1,
    topic: "Use jump strategy on open number lines",
    activity: "Draw jumps on number lines",
    activities: [
      ...interactiveActivities(
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
      fluencyActivity("skip_count", {
        min: 0,
        max: 100,
        step: 10,
        mode: "forward",
      }),
    ],
    curriculum: ["AC9M2N04"],
  },
  {
    week: 5,
    focus: "Addition Strategies",
    lesson: 2,
    topic: "Use split strategy to add 2-digit numbers",
    activity: "Split tens and ones to add",
    activities: [
      ...interactiveActivities(
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
      fluencyActivity("addition_strategy", {
        min: 0,
        max: 20,
        mode: "jump",
      }),
    ],
    curriculum: ["AC9M2N04"],
  },
  {
    week: 5,
    focus: "Addition Strategies",
    lesson: 3,
    topic: "Use friendly numbers for addition",
    activity: "Add to friendly tens (e.g. 40 + 3). Estimate before solving.",
    activities: [
      makeActivity("addition_strategy", 2, {
        min: 10,
        max: 99,
        mode: "friendly_numbers",
      }),
      makeActivity("number_line", 1, {
        min: 0,
        max: 100,
        step: 10,
        mode: "estimate",
      }),
      makeActivity("multiple_choice", 1, {
        min: 10,
        max: 99,
        mode: "friendly_numbers",
        sourceActivityType: "addition_strategy",
      }),
      fluencyActivity("addition_strategy", {
        min: 0,
        max: 20,
        mode: "split",
      }),
    ],
    curriculum: ["AC9M2N04"],
  },

  // ═══════════════════════════════════════════════════════════
  // WEEK 6 – SUBTRACTION STRATEGIES
  // ═══════════════════════════════════════════════════════════
  {
    week: 6,
    focus: "Subtraction Strategies",
    lesson: 1,
    topic: "Use jump strategy for subtraction",
    activity: "Jump back on number line",
    activities: [
      ...interactiveActivities(
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
      fluencyActivity("addition_strategy", {
        min: 0,
        max: 30,
        mode: "jump",
      }),
    ],
    curriculum: ["AC9M2N04"],
  },
  {
    week: 6,
    focus: "Subtraction Strategies",
    lesson: 2,
    topic: "Use split strategy to subtract 2-digit numbers",
    activity: "Split and subtract each place",
    activities: [
      ...interactiveActivities(
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
      fluencyActivity("subtraction_strategy", {
        min: 0,
        max: 20,
        mode: "jump",
      }),
    ],
    curriculum: ["AC9M2N04"],
  },
  {
    week: 6,
    focus: "Subtraction Strategies",
    lesson: 3,
    topic: "Use fact strategies to subtract",
    activity: "Subtract using known facts. Connect addition ↔ subtraction (inverse thinking).",
    activities: [
      makeActivity("subtraction_strategy", 2, {
        min: 0,
        max: 100,
        mode: "fact_strategy",
      }),
      makeActivity("fact_family", 1, {
        min: 4,
        max: 30,
        mode: "recognise",
      }),
      makeActivity("multiple_choice", 1, {
        min: 0,
        max: 100,
        mode: "fact_strategy",
        sourceActivityType: "subtraction_strategy",
      }),
      fluencyActivity("addition_strategy", {
        min: 0,
        max: 20,
        mode: "friendly_numbers",
      }),
    ],
    curriculum: ["AC9M2N04"],
  },

  // ═══════════════════════════════════════════════════════════
  // WEEK 7 – FACT FAMILIES & INVERSE
  // ═══════════════════════════════════════════════════════════
  {
    week: 7,
    focus: "Fact Families",
    lesson: 1,
    topic: "Recognise fact families for + and -",
    activity: "Use triangle cards",
    activities: [
      ...interactiveActivities(
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
      fluencyActivity("addition_strategy", {
        min: 0,
        max: 20,
        mode: "jump",
      }),
    ],
    curriculum: ["AC9M2N05"],
  },
  {
    week: 7,
    focus: "Fact Families",
    lesson: 2,
    topic: "Write 4 number sentences from a fact family",
    activity: "Write related facts from 3 numbers",
    activities: [
      ...interactiveActivities(
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
      fluencyActivity("subtraction_strategy", {
        min: 0,
        max: 20,
        mode: "fact_strategy",
      }),
    ],
    curriculum: ["AC9M2N05"],
  },
  {
    week: 7,
    focus: "Fact Families",
    lesson: 3,
    topic: "Use fact families to solve word problems",
    activity: "Match fact families to word problems. Strengthen inverse relationships explicitly.",
    activities: [
      makeActivity("fact_family", 2, {
        min: 12,
        max: 100,
        mode: "word_problems",
      }),
      makeActivity("subtraction_strategy", 1, {
        min: 0,
        max: 50,
        mode: "fact_strategy",
      }),
      reasoningMCQ("fact_family", {
        min: 12,
        max: 100,
        mode: "word_problems",
        reasoning: true,
      }),
      fluencyActivity("addition_strategy", {
        min: 0,
        max: 30,
        mode: "split",
      }),
    ],
    curriculum: ["AC9M2N05"],
  },

  // ═══════════════════════════════════════════════════════════
  // WEEK 8 – MULTIPLICATION FLUENCY (Skip Counting 2s, 5s, 10s)
  // ═══════════════════════════════════════════════════════════
  {
    week: 8,
    focus: "Multiplication - 2s, 5s, 10s",
    lesson: 1,
    topic: "Model multiplication as equal groups",
    activity: "Make groups with counters. Use language: 'equal groups'.",
    activities: [
      makeActivity("equal_groups", 2, {
        minGroups: 2,
        maxGroups: 5,
        minItemsPerGroup: 2,
        maxItemsPerGroup: 5,
        mode: "equal_groups",
      }),
      makeActivity("arrays", 1, {
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
      fluencyActivity("skip_count", {
        min: 0,
        max: 100,
        step: 2,
        mode: "forward",
      }),
    ],
    curriculum: ["AC9M2N05"],
  },
  {
    week: 8,
    focus: "Multiplication - 2s, 5s, 10s",
    lesson: 2,
    topic: "Model multiplication as arrays",
    activity: "Build arrays with rows and columns. Explain what the array shows.",
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
        mode: "repeated_addition",
      }),
      reasoningMCQ("arrays", {
        minRows: 2,
        maxRows: 5,
        minColumns: 2,
        maxColumns: 5,
        mode: "arrays",
        reasoning: true,
      }),
      fluencyActivity("skip_count", {
        min: 0,
        max: 100,
        step: 5,
        mode: "forward",
      }),
    ],
    curriculum: ["AC9M2N05"],
  },
  {
    week: 8,
    focus: "Multiplication - 2s, 5s, 10s",
    lesson: 3,
    topic: "Link multiplication to repeated addition",
    activity: "Write repeated addition sentences from arrays.",
    activities: [
      makeActivity("arrays", 2, {
        minRows: 2,
        maxRows: 5,
        minColumns: 2,
        maxColumns: 5,
        mode: "repeated_addition",
      }),
      makeActivity("equal_groups", 1, {
        minGroups: 2,
        maxGroups: 5,
        minItemsPerGroup: 2,
        maxItemsPerGroup: 5,
        mode: "equal_groups",
      }),
      makeActivity("typed_response", 1, {
        minRows: 2,
        maxRows: 5,
        minColumns: 2,
        maxColumns: 5,
        mode: "repeated_addition",
        sourceActivityType: "arrays",
      }),
      fluencyActivity("skip_count", {
        min: 0,
        max: 100,
        step: 10,
        mode: "forward",
      }),
    ],
    curriculum: ["AC9M2N05"],
  },

  // ═══════════════════════════════════════════════════════════
  // WEEK 9 – MULTIPLICATION (GROUPS & ARRAYS)
  // ═══════════════════════════════════════════════════════════
  {
    week: 9,
    focus: "Multiplication - Groups & Arrays",
    lesson: 1,
    topic: "Recall and skip count by 2s",
    activity: "Skip count using number lines. Fluency drills and pattern recognition.",
    activities: [
      makeActivity("skip_count", 2, {
        min: 0,
        max: 100,
        step: 2,
        mode: "forward",
      }),
      makeActivity("multiple_choice", 1, {
        min: 0,
        max: 100,
        step: 2,
        mode: "forward",
        sourceActivityType: "skip_count",
      }),
      makeActivity("typed_response", 1, {
        min: 0,
        max: 100,
        step: 2,
        mode: "forward",
        sourceActivityType: "skip_count",
      }),
      fluencyActivity("equal_groups", {
        minGroups: 2,
        maxGroups: 5,
        minItemsPerGroup: 2,
        maxItemsPerGroup: 2,
        mode: "equal_groups",
      }),
    ],
    curriculum: ["AC9M2N03"],
  },
  {
    week: 9,
    focus: "Multiplication - Groups & Arrays",
    lesson: 2,
    topic: "Recall and skip count by 5s",
    activity: "Chant and recall facts with music. Fluency drills.",
    activities: [
      makeActivity("skip_count", 2, {
        min: 0,
        max: 100,
        step: 5,
        mode: "forward",
      }),
      makeActivity("multiple_choice", 1, {
        min: 0,
        max: 100,
        step: 5,
        mode: "forward",
        sourceActivityType: "skip_count",
      }),
      makeActivity("typed_response", 1, {
        min: 0,
        max: 100,
        step: 5,
        mode: "forward",
        sourceActivityType: "skip_count",
      }),
      fluencyActivity("equal_groups", {
        minGroups: 2,
        maxGroups: 5,
        minItemsPerGroup: 5,
        maxItemsPerGroup: 5,
        mode: "equal_groups",
      }),
    ],
    curriculum: ["AC9M2N03"],
  },
  {
    week: 9,
    focus: "Multiplication - Groups & Arrays",
    lesson: 3,
    topic: "Recall and skip count by 10s",
    activity: "Write and recall fact families. Pattern recognition in counting.",
    activities: [
      makeActivity("skip_count", 2, {
        min: 0,
        max: 1000,
        step: 10,
        mode: "forward",
      }),
      makeActivity("multiple_choice", 1, {
        min: 0,
        max: 1000,
        step: 10,
        mode: "forward",
        sourceActivityType: "skip_count",
      }),
      makeActivity("typed_response", 1, {
        min: 0,
        max: 1000,
        step: 10,
        mode: "forward",
        sourceActivityType: "skip_count",
      }),
      fluencyActivity("arrays", {
        minRows: 2,
        maxRows: 5,
        minColumns: 10,
        maxColumns: 10,
        mode: "arrays",
      }),
    ],
    curriculum: ["AC9M2N03"],
  },

  // ═══════════════════════════════════════════════════════════
  // WEEK 10 – DIVISION (EQUAL GROUPS)
  // ═══════════════════════════════════════════════════════════
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
      fluencyActivity("skip_count", {
        min: 0,
        max: 100,
        step: 2,
        mode: "forward",
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
      makeActivity("equal_groups", 1, {
        minGroups: 2,
        maxGroups: 5,
        minItemsPerGroup: 2,
        maxItemsPerGroup: 5,
        mode: "equal_groups",
      }),
      makeActivity("typed_response", 1, {
        minTotal: 6,
        maxTotal: 24,
        mode: "grouping",
        sourceActivityType: "division_groups",
      }),
      fluencyActivity("skip_count", {
        min: 0,
        max: 100,
        step: 5,
        mode: "forward",
      }),
    ],
    curriculum: ["AC9M2N06"],
  },
  {
    week: 10,
    focus: "Division - Equal Groups",
    lesson: 3,
    topic: "Link division to multiplication",
    activity: "Use inverse to check answers. Explicitly connect division ↔ multiplication.",
    activities: [
      makeActivity("division_groups", 2, {
        minTotal: 6,
        maxTotal: 24,
        mode: "inverse_link",
      }),
      makeActivity("equal_groups", 1, {
        minGroups: 2,
        maxGroups: 5,
        minItemsPerGroup: 2,
        maxItemsPerGroup: 5,
        mode: "equal_groups",
      }),
      reasoningMCQ("division_groups", {
        minTotal: 6,
        maxTotal: 24,
        mode: "inverse_link",
        reasoning: true,
      }),
      fluencyActivity("arrays", {
        minRows: 2,
        maxRows: 5,
        minColumns: 2,
        maxColumns: 5,
        mode: "arrays",
      }),
    ],
    curriculum: ["AC9M2N06"],
  },

  // ═══════════════════════════════════════════════════════════
  // WEEK 11 – MIXED OPERATIONS
  // ═══════════════════════════════════════════════════════════
  {
    week: 11,
    focus: "Mixed Operations",
    lesson: 1,
    topic: "Choose operation to solve problem",
    activity: "Read problem and underline clues. Estimate BEFORE solving.",
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
      fluencyActivity("skip_count", {
        min: 0,
        max: 100,
        step: 5,
        mode: "forward",
      }),
    ],
    curriculum: ["AC9M2N06"],
  },
  {
    week: 11,
    focus: "Mixed Operations",
    lesson: 2,
    topic: "Solve 2-step problems with + and -",
    activity: "Draw steps in a 2-step problem. Does this make sense?",
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
      reasoningMCQ("mixed_word_problem", {
        min: 0,
        max: 100,
        mode: "two_step_add_sub",
        operations: ["+", "-"],
        reasoning: true,
      }),
      fluencyActivity("addition_strategy", {
        min: 0,
        max: 50,
        mode: "split",
      }),
    ],
    curriculum: ["AC9M2N06"],
  },
  {
    week: 11,
    focus: "Mixed Operations",
    lesson: 3,
    topic: "Solve problems with x and /",
    activity: "Use operation mats to solve. Is this always true?",
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
      reasoningMCQ("mixed_word_problem", {
        min: 0,
        max: 50,
        mode: "mult_div_problems",
        operations: ["x", "/"],
        reasoning: true,
      }),
      fluencyActivity("equal_groups", {
        minGroups: 2,
        maxGroups: 5,
        minItemsPerGroup: 2,
        maxItemsPerGroup: 5,
        mode: "equal_groups",
      }),
    ],
    curriculum: ["AC9M2N06"],
  },

  // ═══════════════════════════════════════════════════════════
  // WEEK 12 – REVIEW & QUIZ
  // ═══════════════════════════════════════════════════════════
  {
    week: 12,
    focus: "Review & Quiz",
    lesson: 1,
    topic: "Revision stations",
    activity: "Rotate through revision tasks. Mixed fluency included.",
    activities: [
      makeActivity("review_quiz", 2, {
        mode: "revision_stations",
        reviewActivities: [
          "skip_count",
          "arrays",
          "fact_family",
          "number_line",
          "addition_strategy",
          "subtraction_strategy",
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
      fluencyActivity("addition_strategy", {
        min: 0,
        max: 30,
        mode: "jump",
      }),
    ],
    curriculum: ["AC9M2N06"],
  },
  {
    week: 12,
    focus: "Review & Quiz",
    lesson: 2,
    topic: "Math games and group challenges",
    activity: "Compete in team math games. Include reasoning questions.",
    activities: [
      makeActivity("review_quiz", 2, {
        mode: "team_challenges",
        reviewActivities: [
          "division_groups",
          "fact_family",
          "addition_strategy",
          "odd_even_sort",
          "equal_groups",
        ],
      }),
      makeActivity("division_groups", 1, {
        minTotal: 6,
        maxTotal: 24,
        mode: "grouping",
      }),
      reasoningMCQ("fact_family", {
        min: 0,
        max: 20,
        mode: "recognise",
        reasoning: true,
      }),
      fluencyActivity("subtraction_strategy", {
        min: 0,
        max: 30,
        mode: "fact_strategy",
      }),
    ],
    curriculum: ["AC9M2N06"],
  },
  {
    week: 12,
    focus: "Review & Quiz",
    lesson: 3,
    topic: "End-of-unit quiz",
    activity: "Complete individual review quiz with mixed fluency and reasoning.",
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
          "equal_groups",
          "fact_family",
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
          "equal_groups",
          "fact_family",
        ],
      }),
      fluencyActivity("skip_count", {
        min: 0,
        max: 100,
        step: 10,
        mode: "forward",
      }),
    ],
    curriculum: ["AC9M2N06"],
  },
];
