# Level 7 Algebra — Investigation Task: Phone Plan Spreadsheet

**Week 12 · Teacher-marked · AC9M7A06 (with AC9M7A01, AC9M7A05)**

AC9M7A06 asks students to *manipulate formulas involving several variables using digital tools, and describe the effect of systematic variation*. Auto-marked questions can check single values but not a student's own spreadsheet or their explanation, so this task sits beside the Week 12 lessons. It does not gate the post-test.

Allow about 50 minutes. Students need a spreadsheet (Excel, Google Sheets or Numbers).

---

## Student task

Two phone plans charge for data each month:

| Plan | Monthly fee | Price per gigabyte (GB) |
|---|---|---|
| Plan A | $20 | $2.50 |
| Plan B | $8 | $4.00 |

1. **Set up.** Write a formula for the monthly cost C of each plan when n GB are used. Put n = 0, 1, 2, …, 12 in column A and use spreadsheet formulas (for example `=20+2.5*A2`) to fill the costs for both plans.
2. **Vary systematically.** Describe how each plan's cost changes as n increases by 1. Which part of each formula causes this change?
3. **Interpret.** For which amounts of data is Plan B cheaper? When do the plans cost the same? Check your answer by solving an equation.
4. **Justify.** Recommend a plan for a student who uses about 5 GB a month and for one who uses about 11 GB. Then change Plan B's price per GB to $3.50 in your spreadsheet. What happens to the break-even point, and why?

---

## Marking rubric (out of 12)

| Criterion | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| **Set up** | No working formulas | One correct formula or partial table | Both formulas correct; table mostly correct | Both formulas correct as algebra and as spreadsheet formulas; complete table |
| **Vary systematically** | No description | Notices costs increase | States each plan's increase per GB | Links each increase to the coefficient and explains the fixed fee does not change it |
| **Interpret** | No comparison | Identifies one cheaper plan | Identifies the break-even point from the table | Also confirms it by solving 2.5n + 20 = 4n + 8 and states the cheaper plan on each side |
| **Justify and communicate** | No recommendation | Recommendation without reasons | Recommendations justified for both students | Also explains how changing the price moves the break-even point |

---

## Worked solution (for teachers)

**Formulas:** Plan A: C = 2.5n + 20. Plan B: C = 4n + 8.

**Table (selected rows):**

| n (GB) | Plan A ($) | Plan B ($) |
|---|---|---|
| 0 | 20.00 | 8.00 |
| 4 | 30.00 | 24.00 |
| 7 | 37.50 | 36.00 |
| 8 | 40.00 | 40.00 |
| 9 | 42.50 | 44.00 |
| 12 | 50.00 | 56.00 |

**Change:** each extra GB adds $2.50 to Plan A and $4.00 to Plan B; the fixed fees do not affect the step.

**Break-even:** 2.5n + 20 = 4n + 8 → 12 = 1.5n → n = 8. Plan B is cheaper below 8 GB, the plans are equal at 8 GB, and Plan A is cheaper above 8 GB.

**Recommendations:** 5 GB → Plan B ($28 vs $32.50). 11 GB → Plan A ($47.50 vs $52).

**Changing Plan B to $3.50 per GB:** 2.5n + 20 = 3.5n + 8 → n = 12. The break-even point moves from 8 GB to 12 GB because the gap in price per GB shrinks from $1.50 to $1.00, so it takes more data to make up the $12 difference in fees.
