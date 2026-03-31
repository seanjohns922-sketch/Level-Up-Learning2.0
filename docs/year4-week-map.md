# Year 4 Week Map

Use this as the source of truth for Year 4 lesson generation.

Rules:
- this is a schedule-to-engine map only
- do not add implementation code here
- weekly quiz generation must only pull from `quizSafe: true` lessons
- if a lesson is marked `quizSafe: false`, it must not flow into the standard 15-question weekly quiz

## Week 1

Focus: Place Value to 100,000

| Lesson | Topic | Primary Engine | Secondary Engine | Quiz Safe |
| --- | --- | --- | --- | --- |
| 1 | Digit Values | `place_value_builder` | `place_value_chart` | `true` |
| 2 | Expanded Form | `partition_expand` | — | `true` |
| 3 | Word Form | `number_word_form` | — | `true` |

## Week 2

Focus: Decimals (Tenths and Hundredths)

| Lesson | Topic | Primary Engine | Secondary Engine | Quiz Safe |
| --- | --- | --- | --- | --- |
| 1 | Tenths (Money) | `decimal_place_value` | `money_visual` | `true` |
| 2 | Hundredths (Measurement) | `decimal_place_value` | `measurement_visual` | `true` |
| 3 | Decimal Number Line | `decimal_number_line` | — | `true` |

## Week 3

Focus: Rounding and Estimating

| Lesson | Topic | Primary Engine | Secondary Engine | Quiz Safe |
| --- | --- | --- | --- | --- |
| 1 | Rounding | `rounding_numbers` | `number_line` | `true` |
| 2 | Estimate Totals | `estimate_sum` | — | `true` |
| 3 | Real-World Estimation | `mixed_word_problem` | — | `true` |

## Week 4

Focus: Comparing and Ordering

| Lesson | Topic | Primary Engine | Secondary Engine | Quiz Safe |
| --- | --- | --- | --- | --- |
| 1 | Compare Numbers | `decimal_compare` | — | `true` |
| 2 | Ordering | `number_order` | — | `true` |
| 3 | Number Line Placement | `number_line` | — | `true` |

## Week 5

Focus: Multiplicative Thinking Foundations

| Lesson | Topic | Primary Engine | Secondary Engine | Quiz Safe |
| --- | --- | --- | --- | --- |
| 1 | Times Tables | `times_table_recall` | — | `true` |
| 2 | Missing Factor | `missing_factor` | — | `true` |
| 3 | Unknown Numbers | `unknown_number_equation` | — | `true` |

## Week 6

Focus: Multiply and Divide by 10, 100, 1000

| Lesson | Topic | Primary Engine | Secondary Engine | Quiz Safe |
| --- | --- | --- | --- | --- |
| 1 | Multiply by 10, 100, 1000 | `place_value_shift` | — | `true` |
| 2 | Divide by 10, 100, 1000 | `place_value_shift` | — | `true` |
| 3 | Mixed Scaling | `place_value_shift` | `mixed_word_problem` | `true` |

## Week 7

Focus: Multi-Digit Operations

| Lesson | Topic | Primary Engine | Secondary Engine | Quiz Safe |
| --- | --- | --- | --- | --- |
| 1 | Column Addition | `column_addition` | — | `true` |
| 2 | Column Subtraction | `column_subtraction` | — | `true` |
| 3 | Multiplication Strategy | `area_model_multiplication` | — | `true` |

## Week 8

Focus: Division and Multiplicative Problems

| Lesson | Topic | Primary Engine | Secondary Engine | Quiz Safe |
| --- | --- | --- | --- | --- |
| 1 | Division with Remainders | `division_with_remainder` | — | `true` |
| 2 | Multiplicative Comparison | `multiplicative_comparison` | — | `true` |
| 3 | Intro Multi-Step Problems | `multi_step_problem` | — | `false` |

Note:
- Week 8 Lesson 3 must stay out of the standard weekly quiz

## Week 9

Focus: Fractions Foundations

| Lesson | Topic | Primary Engine | Secondary Engine | Quiz Safe |
| --- | --- | --- | --- | --- |
| 1 | Fraction Models | `fraction_model` | — | `true` |
| 2 | Equivalent Fractions | `equivalent_fraction_builder` | — | `true` |
| 3 | Fraction Compare | `fraction_compare` | — | `true` |

## Week 10

Focus: Fractions and Decimals

| Lesson | Topic | Primary Engine | Secondary Engine | Quiz Safe |
| --- | --- | --- | --- | --- |
| 1 | Fraction to Decimal | `fraction_decimal_match` | — | `true` |
| 2 | Fraction Number Line | `fraction_number_line` | — | `true` |
| 3 | Add Fractions | `fraction_add_same_denominator` | — | `true` |

## Week 11

Focus: Problem Solving (Core)

| Lesson | Topic | Primary Engine | Secondary Engine | Quiz Safe |
| --- | --- | --- | --- | --- |
| 1 | Real-World Problems | `mixed_word_problem` | — | `true` |
| 2 | Financial Maths | `financial_problem` | — | `true` |
| 3 | Multi-Step Problems | `multi_step_problem` | — | `false` |

Note:
- Week 11 Lesson 3 must stay out of the standard weekly quiz

## Week 12

Focus: Problem Solving (Advanced / Boss Level)

| Lesson | Topic | Primary Engine | Secondary Engine | Quiz Safe |
| --- | --- | --- | --- | --- |
| 1 | Advanced Multi-Step | `multi_step_problem` | — | `false` |
| 2 | Strategy Selection | `multi_step_problem` | `mixed_word_problem` | `false` |
| 3 | Reasonableness and Estimation | `multi_step_problem` | `estimate_sum` | `false` |

Notes:
- Week 12 should not use the standard weekly quiz path
- if Year 4 gets a Week 12 quiz later, it should be a custom boss quiz rather than the normal `5 + 5 + 5` structure

## Quiz System Rule

Standard weekly quizzes for Year 4 must:
- contain 15 questions total
- pull 5 questions from Lesson 1
- pull 5 questions from Lesson 2
- pull 5 questions from Lesson 3
- only use lessons where `quizSafe: true`

If a lesson is `quizSafe: false`:
- exclude it from the standard weekly quiz builder
- do not substitute a different skill silently
- only include it later through a custom quiz path if explicitly designed

## Final Notes

This map is the schedule-level source of truth for:
- lesson generation alignment
- weekly quiz safety
- future assessment coverage planning

Known missing engines to build before full Year 4 runtime:
- `rounding_numbers`
- `estimate_sum`
