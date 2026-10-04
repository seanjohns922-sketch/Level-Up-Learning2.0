# Level 7 Probability — Investigation Task: Does the Die Settle Down?

**Week 8 · Teacher-marked · AC9M7P02 (with AC9M7P01)**

AC9M7P02 asks students to *conduct repeated chance experiments and run simulations with a large number of trials using digital tools; compare predictions about outcomes with observed results, explaining the differences*. Auto-marked questions can check single calculations, but not a student's own simulation or their explanation, so this task sits beside the Week 8 lessons. It does not gate the post-test.

Allow about 50 minutes. Students need a real die and a spreadsheet (Excel, Google Sheets or Numbers).

---

## Student task

**The question:** If you roll a fair die many times, how close does the share of 6s get to the probability?

1. **Predict.** List the sample space for one roll. What is the probability of rolling a 6? How many 6s do you expect in 30 rolls, 300 rolls and 3000 rolls?
2. **Experiment.** Roll a real die 30 times and record every result in a frequency table. How many 6s did you get? Compare with your prediction.
3. **Simulate.** In a spreadsheet, put `=RANDBETWEEN(1,6)` in cells A1 to A3000. Use `=COUNTIF(A1:A30,6)`, `=COUNTIF(A1:A300,6)` and `=COUNTIF(A1:A3000,6)` to count the 6s in the first 30, 300 and 3000 rolls. Work out the relative frequency of a 6 for each.
4. **Repeat.** Press recalculate (or re-enter a cell) three times and record the new counts. What changes, and what stays about the same?
5. **Explain.** Draw a table or graph of relative frequency against number of trials. Describe what happens as the number of trials grows. Explain why your 30 real rolls might be far from the prediction, even with a fair die.
6. **Challenge.** Change the formula to simulate an event with probability 1/4 (for example, `=RANDBETWEEN(1,4)`), and show the same pattern.

**Extension:** ACARA's elaborations suggest exploring First Nations Australian children's instructive games, such as Koara from the Jawi and Bardi Peoples of Sunday Island, Western Australia, to predict outcomes and compare them with results over more and more trials. If your class explores Koara, learn the game from local community members or reputable cultural sources first, and treat it with respect.

---

## Marking rubric (out of 12)

| Criterion | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| **Predict** | No prediction | Sample space or probability correct | Probability and one expected count correct | Sample space, probability and all three expected counts correct |
| **Experiment and simulate** | No results | Real or simulated results only | Both, with relative frequencies mostly correct | Both, with correct counts and relative frequencies for 30, 300 and 3000 trials, plus repeated runs |
| **Display and describe** | No display | Display without a description | Clear display with a description of the trend | Also notes that runs still vary and larger runs usually settle closer to 1/6 |
| **Explain and extend** | No explanation | Says results differ | Explains differences as random variation | Also completes the 1/4 challenge and explains why one short run cannot prove a die is unfair |

---

## Worked solution (for teachers)

**Predictions:** sample space 1, 2, 3, 4, 5, 6. P(6) = 1/6. Expected 6s: 30 × 1/6 = 5; 300 × 1/6 = 50; 3000 × 1/6 = 500.

**Sample results** (simulated; students' numbers will differ):

| Trials | 6s counted | Relative frequency of a 6 |
|---|---|---|
| 30 (real die) | 8 | 8/30 ≈ 0.27 |
| 30 (spreadsheet) | 3 | 0.10 |
| 300 | 46 | ≈ 0.153 |
| 3000 | 507 | 0.169 |

1/6 ≈ 0.167.

**What students should notice:** short runs can be far from 1/6 (0.10 and 0.27 here). As the number of trials grows, the relative frequency usually settles closer to 1/6. Each recalculation gives different counts, but the 3000-trial share stays close to 0.17. This is the law of large numbers: more trials give a more reliable estimate, not a guaranteed exact match.

**Common misconceptions to listen for:**
- "8 sixes in 30 means the die is biased" (a short run can vary a lot).
- "After no 6s, a 6 is due" (rolls are independent).
- "3000 rolls must give exactly 500 sixes" (expected counts are not guarantees).

**1/4 challenge:** `=RANDBETWEEN(1,4)` and counting one value gives relative frequencies that settle near 0.25 as trials grow.
