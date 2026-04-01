# Year 4 Engine Bank Spec

Use this spec before implementing Year 4 lesson generation.

Purpose:
- define the Year 4 engine bank in a strict build format
- keep Year 4 aligned to the 12-week schedule and curriculum
- separate `reuse`, `extend`, and `new` work clearly
- prevent engine drift, vague modes, and random generator behavior

## Working Rule

Do not write implementation code from this document directly by guessing.

Every Year 4 engine should be built from:
- a strict `EngineSpec`
- defined examples
- defined validation rules
- explicit quiz compatibility
- explicit renderer target

## Engine ID Stability Rule

Engine IDs must remain stable once created.

Do not rename engines after they are used in:
- lesson rows
- quiz generation
- analytics tracking
- assessment metadata
- reporting or dashboards

If engine behavior changes, extend the existing engine with variants where possible.
Only create a new engine ID when the interaction or skill family is genuinely different.

## Shared Year 4 Config

Every Year 4 engine should read from a level-aware config rather than hardcoded values.

```ts
type Year4Config = {
  year: 4;
  maxWhole: 999999;
  decimals: ["tenths", "hundredths"];
  roundingTargets: [10, 100, 1000];
  multiplicationFactsMax: 10;
  allowRemainders: true;
  fractionDenominators: [2, 4, 8, 10];
  moneyMode: true;
  measurementMode: true;
};
```

## Strict EngineSpec

Every Year 4 engine definition must follow this structure.

```ts
type EngineSpec = {
  name: string;
  category: "reuse" | "extend" | "new";
  weeks: number[];
  curriculum: string[];
  variants: string[];

  input: {
    range?: [number, number];
    decimals?: boolean;
    allowRemainders?: boolean;
    maxDigits?: number;
    steps?: number;
    contexts?: string[];
    factors?: number[];
    denominators?: number[];
  };

  output: {
    type: "multiple_choice" | "typed" | "drag_drop" | "tap_select" | "number_line" | "visual_builder";
    answerType: "number" | "text" | "expression";
  };

  fallback: {
    useSimplerVariant: boolean;
    fallbackEngine?: string;
  };

  difficulty: {
    weekScaling: boolean;
    rules: string[];
  };

  ui: {
    requiresVisual: boolean;
    requiresInteraction: boolean;
  };

  examples: string[];
  validation: string[];
  quizCompatible: boolean;
  renderer: string;
  notes: string;
};
```

## Difficulty Scaling

Unless a specific engine overrides this, Year 4 engines should follow this progression:

```ts
const YEAR4_DIFFICULTY_RULES = [
  "Week 1: full six-digit whole-number range up to 999,999",
  "Week 2: pure decimal place value, moving from tenths to hundredths with no money or measurement contexts",
  "Week 3: compare, order, and place decimals on number lines after conceptual decimal work in Week 2",
  "Week 4: mix 4-digit, 5-digit, and 6-digit whole numbers; include decimals only where the engine requires them",
  "Week 5-6: introduce inverse logic and mixed representation formats",
  "Week 7-8: use larger whole numbers selectively inside formal methods and multiplicative contexts",
  "Week 9-10: increase visual-to-symbolic fraction and decimal reasoning",
  "Week 11-12: use larger whole numbers selectively in context problems, budgets, populations, distances, and reasonableness checks",
];
```

Whole-number range rule:
- Year 4 whole-number cap is `999,999`
- use six-digit numbers heavily in Weeks `1`, `3`, and `4`
- use them selectively in Weeks `7`, `11`, and `12`
- do not overload decimal, fraction, or fact-fluency weeks with large whole numbers

Decimal sequencing rule:
- Week 2 is concept-only decimal place value
- Week 3 is decimal reasoning and application within abstract number work
- money and measurement decimal contexts should appear later in applied problem-solving weeks, not in the initial decimal introduction

## Engine Clusters

### Place Value Cluster
- `place_value_builder`
- `partition_expand`
- `number_word_form`
- `decimal_place_value`
- `decimal_compare`
- `decimal_number_line`
- `place_value_shift`

### Operations Cluster
- `column_addition`
- `column_subtraction`
- `times_table_recall`
- `missing_factor`
- `unknown_number_equation`
- `division_with_remainder`
- `area_model_multiplication`

### Multiplicative Thinking Cluster
- `fact_family`
- `division_groups`
- `multiplicative_comparison`

### Fractions and Decimals Cluster
- `fraction_model`
- `equivalent_fraction_builder`
- `fraction_compare`
- `fraction_decimal_match`
- `fraction_number_line`
- `fraction_add_same_denominator`

### Problem Solving Cluster
- `mixed_word_problem`
- `financial_problem`
- `multi_step_problem`

### Patterns and Algorithms Cluster
- `number_machine`
- `flowchart_rule`
- `number_pattern`

## Engine Definitions

### `place_value_builder`

```ts
{
  name: "place_value_builder",
  category: "extend",
  weeks: [1],
  curriculum: ["AC9M4N01"],
  variants: ["digit_value", "identify_number", "build_number"],
  input: {
    range: [10000, 100000],
    maxDigits: 6,
  },
  output: {
    type: "tap_select",
    answerType: "number",
  },
  fallback: {
    useSimplerVariant: false,
  },
  difficulty: {
    weekScaling: true,
    rules: YEAR4_DIFFICULTY_RULES,
  },
  ui: {
    requiresVisual: true,
    requiresInteraction: true,
  },
  examples: [
    "What is the value of the 7 in 274,518?",
    "Build 56,203 using place value blocks.",
    "Which digit is in the ten-thousands place?",
  ],
  validation: [
    "Only 5- and 6-digit whole numbers",
    "No decimals in this engine",
    "No negative numbers",
  ],
  quizCompatible: true,
  renderer: "place_value_builder",
  notes: "Extend current place value engine to support 6-digit numbers cleanly.",
}
```

### `partition_expand`

```ts
{
  name: "partition_expand",
  category: "reuse",
  weeks: [1],
  curriculum: ["AC9M4N01"],
  variants: ["standard_to_expanded", "expanded_to_standard", "flexible_partition"],
  input: {
    range: [10000, 100000],
    maxDigits: 6,
  },
  output: {
    type: "typed",
    answerType: "expression",
  },
  fallback: {
    useSimplerVariant: false,
  },
  difficulty: {
    weekScaling: true,
    rules: YEAR4_DIFFICULTY_RULES,
  },
  ui: {
    requiresVisual: false,
    requiresInteraction: true,
  },
  examples: [
    "Write 45,203 in expanded form.",
    "What number is 70,000 + 6,000 + 200 + 30 + 4?",
    "Partition 82,540 in a different way.",
  ],
  validation: [
    "Expanded parts must total the original number",
    "Flexible partitions must stay place-value valid",
  ],
  quizCompatible: true,
  renderer: "typed_response",
  notes: "Existing engine is reusable but should keep support for flexible partitioning.",
}
```

### `number_word_form`

```ts
{
  name: "number_word_form",
  category: "new",
  weeks: [1],
  curriculum: ["AC9M4N01"],
  variants: ["word_to_numeral", "numeral_to_word", "match_form"],
  input: {
    range: [10000, 100000],
    maxDigits: 6,
  },
  output: {
    type: "multiple_choice",
    answerType: "text",
  },
  fallback: {
    useSimplerVariant: true,
    fallbackEngine: "partition_expand",
  },
  difficulty: {
    weekScaling: false,
    rules: ["Stay within 5- and 6-digit whole numbers"],
  },
  ui: {
    requiresVisual: false,
    requiresInteraction: true,
  },
  examples: [
    "Which numeral matches forty-three thousand, two hundred and six?",
    "Write 61,045 in words.",
    "Match the word form to the numeral.",
  ],
  validation: [
    "No ambiguous wording",
    "Use one accepted Australian word form style consistently",
  ],
  quizCompatible: true,
  renderer: "multiple_choice",
  notes: "Needed because Year 4 schedule explicitly includes word form and numerals.",
}
```

### `decimal_place_value`

```ts
{
  name: "decimal_place_value",
  category: "new",
  weeks: [2],
  curriculum: ["AC9M4N01"],
  variants: ["tenths", "hundredths", "money", "measurement"],
  input: {
    range: [0, 10],
    decimals: true,
  },
  output: {
    type: "multiple_choice",
    answerType: "number",
  },
  fallback: {
    useSimplerVariant: true,
    fallbackEngine: "place_value_builder",
  },
  difficulty: {
    weekScaling: true,
    rules: [
      "Start with tenths",
      "Then hundredths",
      "Move from recognition to explanation",
    ],
  },
  ui: {
    requiresVisual: false,
    requiresInteraction: true,
  },
  examples: [
    "What is the value of the 4 in 3.45?",
    "Which amount shows 0.7 dollars?",
    "How many hundredths are in 0.36 m?",
  ],
  validation: [
    "Decimals limited to 2 places",
    "Only tenths and hundredths",
    "No values above hundredths precision",
  ],
  quizCompatible: true,
  renderer: "multiple_choice",
  notes: "Must support both money and measurement contexts.",
}
```

### `decimal_compare`

```ts
{
  name: "decimal_compare",
  category: "new",
  weeks: [2, 3],
  curriculum: ["AC9M4N01"],
  variants: ["compare", "order"],
  input: {
    range: [0, 100000],
    decimals: true,
  },
  output: {
    type: "drag_drop",
    answerType: "expression",
  },
  fallback: {
    useSimplerVariant: true,
    fallbackEngine: "number_order",
  },
  difficulty: {
    weekScaling: true,
    rules: [
      "Compare same-whole decimals first",
      "Then mixed whole-number and decimal comparisons",
      "Then closely spaced hundredths",
    ],
  },
  ui: {
    requiresVisual: false,
    requiresInteraction: true,
  },
  examples: [
    "Which is greater: 0.6 or 0.56?",
    "Put 0.4, 0.75, 0.08 in order from smallest to largest.",
  ],
  validation: [
    "Decimals limited to 2 places",
    "No duplicate equivalent values in order tasks",
  ],
  quizCompatible: true,
  renderer: "number_order",
  notes: "Should align with existing interactive ordering patterns.",
}
```

### `decimal_number_line`

```ts
{
  name: "decimal_number_line",
  category: "new",
  weeks: [2, 3],
  curriculum: ["AC9M4N01"],
  variants: ["tenths_line", "hundredths_line", "placement"],
  input: {
    range: [0, 1],
    decimals: true,
  },
  output: {
    type: "number_line",
    answerType: "number",
  },
  fallback: {
    useSimplerVariant: true,
    fallbackEngine: "number_line",
  },
  difficulty: {
    weekScaling: true,
    rules: [
      "Start with tenths on 0-1 lines",
      "Then hundredths",
      "Then decimal placement without full labels",
    ],
  },
  ui: {
    requiresVisual: true,
    requiresInteraction: true,
  },
  examples: [
    "Place 0.4 on the number line.",
    "Which point shows 0.36?",
  ],
  validation: [
    "Intervals must match decimal precision shown",
    "Only tenths and hundredths",
  ],
  quizCompatible: true,
  renderer: "number_line",
  notes: "Separate from whole-number number line behavior.",
}
```

### `place_value_shift`

```ts
{
  name: "place_value_shift",
  category: "new",
  weeks: [6],
  curriculum: ["AC9M4N05"],
  variants: ["multiply", "divide", "whole_number", "decimal"],
  input: {
    range: [0, 100000],
    decimals: true,
    factors: [10, 100, 1000],
  },
  output: {
    type: "typed",
    answerType: "number",
  },
  fallback: {
    useSimplerVariant: false,
  },
  difficulty: {
    weekScaling: true,
    rules: [
      "Whole numbers first",
      "Then money and measurement examples",
      "Then decimal shifts",
    ],
  },
  ui: {
    requiresVisual: false,
    requiresInteraction: true,
  },
  examples: [
    "What is 43 x 100?",
    "What is 6.4 ÷ 10?",
    "A rope is 3.6 m long. What is its length in tenths of a metre?",
  ],
  validation: [
    "Do not use add-a-zero logic",
    "Answers must reflect digit-value shifts",
    "Decimals limited to 2 places",
  ],
  quizCompatible: true,
  renderer: "typed_response",
  notes: "Must be explicitly place-value based, not shortcut-language based.",
}
```

### `times_table_recall`

```ts
{
  name: "times_table_recall",
  category: "new",
  weeks: [5],
  curriculum: ["AC9M4N06"],
  variants: ["fact", "mixed_recall"],
  input: {
    range: [1, 10],
  },
  output: {
    type: "typed",
    answerType: "number",
  },
  fallback: {
    useSimplerVariant: false,
  },
  difficulty: {
    weekScaling: true,
    rules: [
      "Start with isolated facts",
      "Then mixed recall across 2-10",
    ],
  },
  ui: {
    requiresVisual: false,
    requiresInteraction: true,
  },
  examples: [
    "7 x 6 = ?",
    "What is 9 x 4?",
  ],
  validation: [
    "Factors capped at 10",
    "No unrelated additive distractors",
  ],
  quizCompatible: true,
  renderer: "typed_response",
  notes: "Supports explicit Year 4 multiplication fact fluency.",
}
```

### `missing_factor`

```ts
{
  name: "missing_factor",
  category: "new",
  weeks: [5],
  curriculum: ["AC9M4N06"],
  variants: ["a_x_blank", "blank_x_b", "division_inverse"],
  input: {
    range: [1, 10],
  },
  output: {
    type: "typed",
    answerType: "number",
  },
  fallback: {
    useSimplerVariant: true,
    fallbackEngine: "times_table_recall",
  },
  difficulty: {
    weekScaling: true,
    rules: [
      "Multiplication form first",
      "Then inverse division form",
    ],
  },
  ui: {
    requiresVisual: false,
    requiresInteraction: true,
  },
  examples: [
    "4 x ? = 28",
    "? x 8 = 56",
    "63 ÷ 9 = ?",
  ],
  validation: [
    "Unknown must be whole-number fact answer",
    "Stay within Year 4 fact range",
  ],
  quizCompatible: true,
  renderer: "typed_response",
  notes: "Should align with times table fluency week.",
}
```

### `unknown_number_equation`

```ts
{
  name: "unknown_number_equation",
  category: "new",
  weeks: [5],
  curriculum: ["AC9M4N06"],
  variants: ["addition_unknown", "subtraction_unknown"],
  input: {
    range: [0, 100000],
  },
  output: {
    type: "typed",
    answerType: "number",
  },
  fallback: {
    useSimplerVariant: false,
  },
  difficulty: {
    weekScaling: true,
    rules: [
      "End unknown first",
      "Then start and middle unknowns",
    ],
  },
  ui: {
    requiresVisual: false,
    requiresInteraction: true,
  },
  examples: [
    "? + 37 = 92",
    "84 - ? = 29",
  ],
  validation: [
    "No negative answers",
    "Only one unknown per equation",
  ],
  quizCompatible: true,
  renderer: "typed_response",
  notes: "This is the explicit Year 4 algebra foundation engine.",
}
```

### `column_addition`

```ts
{
  name: "column_addition",
  category: "extend",
  weeks: [7],
  curriculum: ["AC9M4N06"],
  variants: ["with_regrouping", "guided_written_method"],
  input: {
    range: [10, 100000],
    maxDigits: 6,
  },
  output: {
    type: "typed",
    answerType: "number",
  },
  fallback: {
    useSimplerVariant: false,
  },
  difficulty: {
    weekScaling: true,
    rules: [
      "Move from 2-digit and 3-digit examples",
      "Then larger multi-digit examples",
    ],
  },
  ui: {
    requiresVisual: true,
    requiresInteraction: true,
  },
  examples: [
    "458 + 276",
    "3,845 + 2,607",
  ],
  validation: [
    "No negative numbers",
    "Written method must align columns correctly",
  ],
  quizCompatible: true,
  renderer: "typed_response",
  notes: "Extend existing written-method engine rather than rebuilding.",
}
```

### `column_subtraction`

```ts
{
  name: "column_subtraction",
  category: "extend",
  weeks: [7],
  curriculum: ["AC9M4N06"],
  variants: ["with_regrouping", "guided_written_method"],
  input: {
    range: [10, 100000],
    maxDigits: 6,
  },
  output: {
    type: "typed",
    answerType: "number",
  },
  fallback: {
    useSimplerVariant: false,
  },
  difficulty: {
    weekScaling: true,
    rules: [
      "Move from 2-digit and 3-digit examples",
      "Then larger multi-digit examples",
    ],
  },
  ui: {
    requiresVisual: true,
    requiresInteraction: true,
  },
  examples: [
    "704 - 358",
    "4,083 - 1,947",
  ],
  validation: [
    "No negative results unless explicitly enabled",
    "Regrouping steps must be valid",
  ],
  quizCompatible: true,
  renderer: "typed_response",
  notes: "Use the guided subtraction interaction where appropriate.",
}
```

### `area_model_multiplication`

```ts
{
  name: "area_model_multiplication",
  category: "new",
  weeks: [7],
  curriculum: ["AC9M4N06"],
  variants: ["one_digit_by_two_digit", "partitioned_model"],
  input: {
    range: [1, 100],
    maxDigits: 2,
  },
  output: {
    type: "visual_builder",
    answerType: "number",
  },
  fallback: {
    useSimplerVariant: true,
    fallbackEngine: "arrays",
  },
  difficulty: {
    weekScaling: true,
    rules: [
      "Start with one-digit by two-digit",
      "Then use larger partitioned multiplication examples",
    ],
  },
  ui: {
    requiresVisual: true,
    requiresInteraction: true,
  },
  examples: [
    "Use the area model to solve 23 x 4.",
    "Partition 18 x 6 into easier parts.",
  ],
  validation: [
    "Partitions must total the original factor",
    "Area-model sections must remain visually coherent",
  ],
  quizCompatible: true,
  renderer: "arrays",
  notes: "Needed to bridge arrays into efficient multiplication.",
}
```

### `division_with_remainder`

```ts
{
  name: "division_with_remainder",
  category: "new",
  weeks: [8],
  curriculum: ["AC9M4N06"],
  variants: ["sharing", "grouping", "symbolic_remainder"],
  input: {
    range: [1, 100],
    allowRemainders: true,
  },
  output: {
    type: "typed",
    answerType: "expression",
  },
  fallback: {
    useSimplerVariant: true,
    fallbackEngine: "division_groups",
  },
  difficulty: {
    weekScaling: true,
    rules: [
      "Exact division first",
      "Then small remainders",
      "Then contextual interpretation of remainders",
    ],
  },
  ui: {
    requiresVisual: true,
    requiresInteraction: true,
  },
  examples: [
    "23 ÷ 4 = ? remainder ?",
    "There are 23 apples shared between 4 students. How many each and how many left over?",
    "Which is correct? 23 ÷ 4 = 5 r3 / 6 r1 / 4 r3",
  ],
  validation: [
    "Remainder must be less than divisor",
    "No negative numbers",
    "Dividend and divisor must be whole numbers",
  ],
  quizCompatible: true,
  renderer: "typed_response",
  notes: "This is a true new engine, not a small extension.",
}
```

### `multiplicative_comparison`

```ts
{
  name: "multiplicative_comparison",
  category: "new",
  weeks: [8],
  curriculum: ["AC9M4N06", "AC9M4N08"],
  variants: ["times_as_many", "compare_sets"],
  input: {
    range: [1, 100],
    factors: [2, 3, 4, 5, 6, 7, 8, 9, 10],
    steps: 1,
  },
  output: {
    type: "multiple_choice",
    answerType: "number",
  },
  fallback: {
    useSimplerVariant: true,
    fallbackEngine: "mixed_word_problem",
  },
  difficulty: {
    weekScaling: true,
    rules: [
      "Direct multiplicative comparison first",
      "Then contextual multiplicative comparison",
    ],
  },
  ui: {
    requiresVisual: false,
    requiresInteraction: true,
  },
  examples: [
    "A box has 4 times as many pencils as a cup with 6 pencils. How many pencils are in the box?",
    "Which story shows 3 times as many?",
  ],
  validation: [
    "Must be multiplicative comparison, not additive comparison",
    "No negative numbers",
  ],
  quizCompatible: true,
  renderer: "multiple_choice",
  notes: "Important for Year 4 multiplicative thinking.",
}
```

### `fraction_model`

```ts
{
  name: "fraction_model",
  category: "extend",
  weeks: [9],
  curriculum: ["AC9M4N03", "AC9M4N04"],
  variants: ["fraction_wall", "identify_model", "build_model"],
  input: {
    denominators: [2, 4, 8, 10],
  },
  output: {
    type: "tap_select",
    answerType: "text",
  },
  fallback: {
    useSimplerVariant: true,
    fallbackEngine: "area_model_select",
  },
  difficulty: {
    weekScaling: true,
    rules: [
      "Use unit fractions first",
      "Then simple non-unit fractions",
    ],
  },
  ui: {
    requiresVisual: true,
    requiresInteraction: true,
  },
  examples: [
    "Tap the model that shows 3/4.",
    "Build a fraction wall to show halves and quarters.",
  ],
  validation: [
    "All models must keep the same whole size when compared",
    "Denominators restricted to Year 4 set",
  ],
  quizCompatible: true,
  renderer: "area_model_select",
  notes: "Extend current visual fraction model work.",
}
```

### `equivalent_fraction_builder`

```ts
{
  name: "equivalent_fraction_builder",
  category: "new",
  weeks: [9],
  curriculum: ["AC9M4N03"],
  variants: ["match", "build", "yes_no"],
  input: {
    denominators: [2, 4, 8, 10],
  },
  output: {
    type: "visual_builder",
    answerType: "expression",
  },
  fallback: {
    useSimplerVariant: true,
    fallbackEngine: "equivalent_fraction_match",
  },
  difficulty: {
    weekScaling: true,
    rules: [
      "Start with obvious equivalents",
      "Then build the equivalent fraction visually",
      "Then reason about equivalence",
    ],
  },
  ui: {
    requiresVisual: true,
    requiresInteraction: true,
  },
  examples: [
    "Build a fraction equal to 1/2 using more parts.",
    "Are 2/4 and 1/2 equivalent?",
  ],
  validation: [
    "Equivalent pairs must represent the same amount exactly",
    "Denominators restricted to Year 4 set",
  ],
  quizCompatible: true,
  renderer: "equivalent_fraction_build",
  notes: "Core Year 4 fraction engine.",
}
```

### `fraction_compare`

```ts
{
  name: "fraction_compare",
  category: "extend",
  weeks: [9],
  curriculum: ["AC9M4N03"],
  variants: ["greater_less_equal", "order"],
  input: {
    denominators: [2, 4, 8, 10],
  },
  output: {
    type: "drag_drop",
    answerType: "expression",
  },
  fallback: {
    useSimplerVariant: true,
    fallbackEngine: "fraction_model",
  },
  difficulty: {
    weekScaling: true,
    rules: [
      "Same denominator first",
      "Then equivalent-fraction supported comparisons",
    ],
  },
  ui: {
    requiresVisual: true,
    requiresInteraction: true,
  },
  examples: [
    "Which is greater: 3/4 or 2/4?",
    "Put 1/2, 3/4, 1/4 in order.",
  ],
  validation: [
    "Keep the same whole size in visual comparisons",
    "No unsupported denominators",
  ],
  quizCompatible: true,
  renderer: "fraction_compare",
  notes: "Existing fraction compare ideas can be extended here.",
}
```

### `fraction_decimal_match`

```ts
{
  name: "fraction_decimal_match",
  category: "new",
  weeks: [9, 10],
  curriculum: ["AC9M4N03"],
  variants: ["benchmark_match", "sort", "equivalent_pair"],
  input: {
    denominators: [2, 4],
    decimals: true,
  },
  output: {
    type: "multiple_choice",
    answerType: "text",
  },
  fallback: {
    useSimplerVariant: true,
    fallbackEngine: "equivalent_fraction_builder",
  },
  difficulty: {
    weekScaling: true,
    rules: [
      "Use benchmark links only: 1/2, 1/4, 3/4",
      "Start with direct match",
      "Then use mixed sorting tasks",
    ],
  },
  ui: {
    requiresVisual: true,
    requiresInteraction: true,
  },
  examples: [
    "Which decimal matches 3/4?",
    "Match 1/4 to 0.25.",
  ],
  validation: [
    "Only use Year 4 benchmark pairs",
    "No unsupported fraction-decimal pairings",
  ],
  quizCompatible: true,
  renderer: "multiple_choice",
  notes: "Keep this tight to benchmark links, not arbitrary fraction-decimal conversion.",
}
```

### `fraction_number_line`

```ts
{
  name: "fraction_number_line",
  category: "new",
  weeks: [10],
  curriculum: ["AC9M4N04"],
  variants: ["place_fraction", "count_by_fraction", "mixed_numeral"],
  input: {
    denominators: [2, 4, 8, 10],
    steps: 1,
  },
  output: {
    type: "number_line",
    answerType: "number",
  },
  fallback: {
    useSimplerVariant: true,
    fallbackEngine: "fraction_model",
  },
  difficulty: {
    weekScaling: true,
    rules: [
      "Unit fractions first",
      "Then counting by fractions",
      "Then mixed numerals beyond 1",
    ],
  },
  ui: {
    requiresVisual: true,
    requiresInteraction: true,
  },
  examples: [
    "Place 3/4 on the number line.",
    "Mark 1 1/2 on the number line.",
  ],
  validation: [
    "Equal intervals must match denominator",
    "Mixed numerals must align to correct value beyond 1",
  ],
  quizCompatible: true,
  renderer: "number_line_place",
  notes: "Should stay visual-first.",
}
```

### `fraction_add_same_denominator`

```ts
{
  name: "fraction_add_same_denominator",
  category: "new",
  weeks: [10],
  curriculum: ["AC9M4N03", "AC9M4N04"],
  variants: ["combine_to_whole", "same_denominator_add"],
  input: {
    denominators: [2, 4, 8, 10],
  },
  output: {
    type: "visual_builder",
    answerType: "expression",
  },
  fallback: {
    useSimplerVariant: true,
    fallbackEngine: "build_the_whole",
  },
  difficulty: {
    weekScaling: true,
    rules: [
      "Combine unit fractions first",
      "Then same-denominator totals beyond one whole",
    ],
  },
  ui: {
    requiresVisual: true,
    requiresInteraction: true,
  },
  examples: [
    "What is 1/4 + 2/4?",
    "How many quarters make 1 whole?",
  ],
  validation: [
    "Only same-denominator addition",
    "No simplification requirement unless explicitly asked",
  ],
  quizCompatible: true,
  renderer: "build_the_whole",
  notes: "Use visual combining before abstract notation.",
}
```

### `financial_problem`

```ts
{
  name: "financial_problem",
  category: "extend",
  weeks: [8, 11, 12],
  curriculum: ["AC9M4N07", "AC9M4N08"],
  variants: ["budget", "change", "cost_plan"],
  input: {
    decimals: true,
    contexts: ["money"],
    steps: 2,
  },
  output: {
    type: "typed",
    answerType: "number",
  },
  fallback: {
    useSimplerVariant: true,
    fallbackEngine: "mixed_word_problem",
  },
  difficulty: {
    weekScaling: true,
    rules: [
      "Single money decisions first",
      "Then two-step money problems",
      "Then mixed financial planning problems",
    ],
  },
  ui: {
    requiresVisual: false,
    requiresInteraction: true,
  },
  examples: [
    "You have $20. You buy 3 items at $4 each. How much money is left?",
    "Which shopping plan stays under budget?",
  ],
  validation: [
    "Money values limited to two decimal places",
    "No invalid currency formatting",
  ],
  quizCompatible: true,
  renderer: "typed_response",
  notes: "Extend current word-problem engine with explicit money structure.",
}
```

### `multi_step_problem`

```ts
{
  name: "multi_step_problem",
  category: "new",
  weeks: [8, 11, 12],
  curriculum: ["AC9M4N06", "AC9M4N07", "AC9M4N08"],
  variants: ["two_step", "three_step", "reasonableness_check"],
  input: {
    range: [0, 100000],
    steps: 3,
    contexts: ["money", "measurement", "time", "general"],
  },
  output: {
    type: "typed",
    answerType: "number",
  },
  fallback: {
    useSimplerVariant: true,
    fallbackEngine: "mixed_word_problem",
  },
  difficulty: {
    weekScaling: true,
    rules: [
      "Week 8: 2-step problems",
      "Week 11: additive vs multiplicative choice in context",
      "Week 12: 2-3 step harder contexts with reasonableness checks",
    ],
  },
  ui: {
    requiresVisual: false,
    requiresInteraction: true,
  },
  examples: [
    "There are 6 tables with 8 chairs each. Then 7 more chairs are added. How many chairs are there now?",
    "A class has $84. They spend $27 and then raise $45. How much do they have now?",
    "Estimate first, then decide if the final answer is reasonable.",
  ],
  validation: [
    "No single-step leakage when multi-step mode is requested",
    "Operations must fit the story logic",
    "No negative numbers unless explicitly enabled",
  ],
  quizCompatible: false,
  renderer: "typed_response",
  notes: "This is the most important new Year 4 engine.",
}
```

### `number_machine`

```ts
{
  name: "number_machine",
  category: "new",
  weeks: [12],
  curriculum: ["AC9M4N09"],
  variants: ["follow_rule", "find_missing_output", "infer_rule"],
  input: {
    range: [0, 1000],
    steps: 3,
  },
  output: {
    type: "typed",
    answerType: "number",
  },
  fallback: {
    useSimplerVariant: true,
    fallbackEngine: "number_pattern",
  },
  difficulty: {
    weekScaling: true,
    rules: [
      "Single repeated rule first",
      "Then missing-step reasoning",
      "Then create or infer the rule",
    ],
  },
  ui: {
    requiresVisual: false,
    requiresInteraction: true,
  },
  examples: [
    "Start at 5. Add 4 each time. What comes next?",
    "The machine doubles and then adds 3. What is the output for 6?",
  ],
  validation: [
    "Rule must generate the shown outputs consistently",
    "No contradictory step logic",
  ],
  quizCompatible: true,
  renderer: "typed_response",
  notes: "Supports AC9M4N09 without overbuilding algebra.",
}
```

### `flowchart_rule`

```ts
{
  name: "flowchart_rule",
  category: "new",
  weeks: [12],
  curriculum: ["AC9M4N09"],
  variants: ["follow_flowchart", "missing_step", "describe_rule"],
  input: {
    range: [0, 1000],
    steps: 3,
  },
  output: {
    type: "multiple_choice",
    answerType: "expression",
  },
  fallback: {
    useSimplerVariant: true,
    fallbackEngine: "number_machine",
  },
  difficulty: {
    weekScaling: true,
    rules: [
      "Two-step rules first",
      "Then missing-step logic",
      "Then describe full rule path",
    ],
  },
  ui: {
    requiresVisual: true,
    requiresInteraction: true,
  },
  examples: [
    "Follow the flowchart: x2, then +3. What is the output for 6?",
    "Which step is missing from this flowchart?",
  ],
  validation: [
    "Each arrow step must be explicit",
    "Final answer must match full sequence exactly",
  ],
  quizCompatible: true,
  renderer: "multiple_choice",
  notes: "This should stay lightweight, not become full coding logic.",
}
```

### `number_pattern`

```ts
{
  name: "number_pattern",
  category: "extend",
  weeks: [12],
  curriculum: ["AC9M4N09"],
  variants: ["continue_pattern", "describe_rule"],
  input: {
    range: [0, 1000],
    steps: 1,
  },
  output: {
    type: "typed",
    answerType: "text",
  },
  fallback: {
    useSimplerVariant: true,
    fallbackEngine: "number_machine",
  },
  difficulty: {
    weekScaling: true,
    rules: [
      "Simple additive patterns first",
      "Then multiplicative or mixed rule patterns",
    ],
  },
  ui: {
    requiresVisual: false,
    requiresInteraction: true,
  },
  examples: [
    "Continue the pattern: 6, 12, 18, ...",
    "What is the rule for 4, 8, 12, 16?",
  ],
  validation: [
    "Pattern terms must follow the rule exactly",
    "Rule wording must match the generated sequence",
  ],
  quizCompatible: true,
  renderer: "typed_response",
  notes: "Keep this lighter than the main problem-solving engines.",
}
```

## Quiz Compatibility Rule

Weekly quizzes should only pull from engines with:

```ts
quizCompatible: true
```

Default Year 4 note:
- `multi_step_problem` should be lesson/runtime-first and excluded from weekly quiz until a tighter quiz-safe variant exists

## Build Order

### Phase 1: Core
- `place_value_builder`
- `decimal_place_value`
- `decimal_compare`
- `decimal_number_line`
- `place_value_shift`

### Phase 2: Operations
- `times_table_recall`
- `missing_factor`
- `unknown_number_equation`
- `division_with_remainder`
- `multiplicative_comparison`
- `column_addition`
- `column_subtraction`
- `area_model_multiplication`

### Phase 3: Fractions and Decimals
- `fraction_model`
- `equivalent_fraction_builder`
- `fraction_compare`
- `fraction_decimal_match`
- `fraction_number_line`
- `fraction_add_same_denominator`

### Phase 4: Endgame
- `financial_problem`
- `multi_step_problem`
- `number_machine`
- `flowchart_rule`
- `number_pattern`

## Minimum Year 4 Engine Checklist

Before wiring full Year 4 runtime, confirm these exist:
- whole-number place value to `100,000`
- decimal place value to hundredths
- decimal ordering and comparison
- decimal number lines
- place-value shifting by `10`, `100`, `1000`
- fact fluency to `10 x 10`
- inverse and missing-number logic
- multi-digit addition and subtraction
- area model multiplication
- remainder-aware division
- multiplicative comparison
- equivalent fractions
- fraction-decimal linking
- fraction number lines
- same-denominator fraction combining
- money and modelling problems
- number-machine and flowchart rule tasks

## Final Rule

Do not start detailed Year 4 lesson tuning until:
- the required engines exist, or
- the missing engines are explicitly stubbed and tracked as `new`

This is the contract that should guide Year 4 build work.
