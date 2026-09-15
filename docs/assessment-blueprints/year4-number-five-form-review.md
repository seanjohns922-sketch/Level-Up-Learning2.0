# Level 4 Number — matched five-form review

Review route: `/demo-review/number-level-4`; choose Number Nexus, Level 4, **Review all five forms**. This is an owner review release. The current student pre/post banks and diagnostic version routing are unchanged; no migration is required. Responses in this screen are held in memory, not saved to student records.

## Curriculum and benchmark

The supplied Australian Curriculum Mathematics F–6 v9 PDF, pages 38–41, supplies AC9M4N01–N09. The existing repaired Level 4 post-test is the benchmark. All five forms sample the same nine Number descriptors through 20 equally weighted slots, using different examples. Difficulty is matched by intended demand, not statistically calibrated.

| Q | Code | Same task in all five forms |
|---|---|---|
| 1 | N01 | Identify the value of the hundredths digit with zero tenths. |
| 2 | N01 | Order four decimals from smallest to largest, mixing tenths and hundredths with the same whole part. |
| 3 | N02 | Count odd numbers in a set of six two-digit numbers. |
| 4 | N02 | Identify whether a product of two two-digit odd numbers is odd or even, with short response choices. |
| 5 | N03 | Complete equivalent fractions from eighths to twenty-fourths: numerator multiplied by 3. |
| 6 | N03 | Convert a proper fraction in tenths to decimal notation. All five use denominator 10. |
| 7 | N04 | Continue a quarter-count sequence, including values above one, by entering a missing numerator. |
| 8 | N04 | Read a marked quarter point between consecutive whole numbers as a decimal. |
| 9 | N05 | Multiply a two-digit number by 100. |
| 10 | N06 | Add two four-digit numbers; the same three lower-column carries are required under a column method. |
| 11 | N06 | Multiply a two-digit number ending in 7 by 8, producing a three-digit answer. |
| 12 | N06 | Select the multiplication check for a three-digit division with divisor 8 and a three-digit quotient containing a zero. |
| 13 | N07 | Round a three-digit number ending in 46 to the nearest hundred. |
| 14 | N07 | Estimate a bill by rounding a $48 unit price to the nearest ten dollars and multiplying by the quantity. |
| 15 | N08 | Find a budget remainder after buying five equal-priced supplies. |
| 16 | N08 | Calculate the cost of multiple tickets plus one booking fee. |
| 17 | N08 | Find travellers from vans × seats, minus empty seats. |
| 18 | N08 | Find a budget remainder after buying two different quantities of meals and passes. |
| 19 | N09 | Continue a doubling pattern by supplying the missing third displayed number. |
| 20 | N09 | Supply the next number after four terms of an additive sequence, with no rule provided. |

## Targeted changes from the current post-test

- Q2 uses decimal ordering instead of lengthy comparison choices. Q4 uses a short odd/even product question and two-digit operands.
- Q5 retains the post-test's ×3 equivalent-fraction demand in every form.
- Following owner review, Q6 uses tenths consistently across all five forms instead of denominator 25. It samples the basic fraction/decimal connection.
- Q14 replaces yes/no guessing about an estimate with calculating the estimate, without supplying the rounded unit price or total.
- Q18 restores the original two-item financial model that an earlier paired override had reduced to a basic multiplication fact.
- Q19 says “missing number”, avoiding ambiguity about whether the starting number counted as an output. Q20 is a next-number sequence instead of instruction ordering.

The remaining slots retain their task structure from the existing post-test. Each corresponding form uses the same primary code, response mode, visual family and intended difficulty. Repeated correct answers can occur naturally (for example, parity counts and the budget-remainder slot); the supplied quantities/examples differ. End is not intentionally harder than Start.

## Visuals and usability

Reuse the existing Level 4 assessment visuals and the weekly money asset renderer. New review budget questions clearly separate Quantity to buy and Price for ONE, with “each” beside the price. Cash pictures have been removed from those unit-price cards because they were mistaken for the complete purchase amount. Other money visuals retain the established Australian assets. Q17 shows the actual number of illustrated vans, seats in EACH van, and empty seats altogether across all vans. Fractions use clear stacked notation, with no shaded comparison aids. Number lines preserve equal intervals and do not label the marked answer. Prices and budgets shown are problem inputs; totals and remainders are not displayed.

Read-aloud includes visual facts such as prices, quantities, fraction notation, algorithm steps and number-line intervals. The supplied division result in Q12 is intentional: the task is to select an inverse check, not compute the quotient. Author answers stay behind Review details. Form switching retains the current slot; all questions are reachable in author review; Exit returns to Level 4 in Demo Review. These review navigation controls do not change student sequential navigation.

## Evidence limits

All nine Number descriptors are sampled; this is not exhaustive proof of every verb in each descriptor. These questions do not directly record a child's strategy explanation, their independent choice of digital tools, division by powers of ten, or creation of an algorithm. Q20 now observes numerical pattern continuation rather than ordering instructions. Q14 samples forming an estimate, not a full written explanation of reasonableness. Recognition tasks and constructed numeric responses provide different evidence, which is kept consistent between forms. A future student release must retain older banks for historical baselines and in-progress diagnostics; these revised scores should not be silently compared with old versions.

## Validation

`node --no-warnings --experimental-strip-types --experimental-loader ./scripts/typescript-alias-loader.mjs scripts/audit-year4-number-five-forms.ts`

The audit checks 100 independently worked answers, wrong/blank rejection, distinct examples, all nine codes, matching response formats and intended difficulty, fraction scales, budget structure and protected review routing. The JSON inventory records every prompt, visual, option, answer and code for owner review. Existing release audits, TypeScript, lint and production build are also checked. The child's-view manual review is the next step.
