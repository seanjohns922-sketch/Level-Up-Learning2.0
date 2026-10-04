# Level 7 Statistics — Investigation Task: Are Teenagers Faster Than Adults?

**Week 10 · Teacher-marked · AC9M7ST03 (with AC9M7ST01, AC9M7ST02)**

AC9M7ST03 asks students to *plan and conduct statistical investigations* and *report findings in terms of shape and summary statistics*. AC9M7ST02 adds displays *using software where appropriate*. Auto-marked questions can check one calculation at a time, but not a student's own plan, data collection or written report, so this task sits beside the Week 10 lessons. It does not gate the post-test.

Allow two lessons of about 50 minutes: one to plan and collect, one to analyse and report. Students need a 30 cm ruler and a spreadsheet (Excel, Google Sheets or Numbers).

---

## Student task

**The question:** Do teenagers have faster reaction times than adults?

Use the **ruler-drop test**. A partner holds a 30 cm ruler at the 0 cm mark just above your open thumb and finger, then drops it without warning. You catch it as quickly as you can and read the distance in centimetres at the top of your thumb. A shorter distance means a faster reaction.

1. **Plan.** Write your statistical question. Decide who you will test (at least 10 teenagers and 10 adults), how many attempts each person gets, and which conditions you will keep the same (the same hand, the same ruler, the same starting height and so on). Explain why each condition matters.
2. **Collect.** Run the test and record every result in a spreadsheet, with one column per group. Is your variable discrete or continuous? Explain.
3. **Display.** Draw a back-to-back stem-and-leaf plot by hand. Then use the spreadsheet to make a second display, such as a dot plot or column graph.
4. **Summarise.** Use spreadsheet formulas (`=AVERAGE`, `=MEDIAN`, `=MODE`, `=MAX-MIN`) to find the mean, median, mode and range for each group. Check one group's median by hand from your stem-and-leaf plot.
5. **Analyse.** Describe the shape of each distribution (symmetric, positively or negatively skewed, or bimodal) and point out any clusters, gaps or outliers. If there is an unusual value, check it before deciding whether to keep it. Explain which measure of centre best represents each group.
6. **Report.** Answer the question using your summary statistics and displays. State one limitation of your investigation and one change that would make the conclusion more trustworthy.

**Extension (secondary data):** Find a published data set about a group of people, for example from the Australian Bureau of Statistics or the Reconciliation Barometer. Compare two groups in it using a centre and a spread, and explain how the people in the data were chosen.

---

## Marking rubric (out of 15)

| Criterion | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| **Plan** | No plan | A question, but the method is unclear | A clear question and method, with some controlled conditions | A clear question, enough people and attempts, and reasons for each controlled condition |
| **Collect and classify** | No data | Incomplete data | Complete data in a spreadsheet | Complete data, with the variable correctly identified as continuous and a reason given |
| **Display** | No display | One display with errors | A correct back-to-back stem-and-leaf plot, or a correct digital display | Both displays correct, with a key, labels and a common scale |
| **Summarise and analyse** | No statistics | Some statistics correct | All four statistics correct for both groups, and the shape described | Also identifies and handles outliers and justifies the choice of centre |
| **Report** | No conclusion | A conclusion without evidence | A conclusion supported by a centre and a spread | Also states a relevant limitation and a realistic improvement |

---

## Worked solution (for teachers)

**Sample data (catch distance in cm, one attempt each after a practice drop):**

| Group | Distances (cm) |
|---|---|
| Teenagers | 9, 11, 12, 12, 13, 14, 14, 15, 16, 17, 19, 27 |
| Adults | 12, 14, 15, 16, 17, 17, 18, 19, 20, 21, 23, 24 |

**Variable:** catch distance is continuous. It is measured, and rounding to the nearest centimetre does not make it a count.

**Back-to-back stem-and-leaf plot** (key: 1 | 4 = 14 cm on both sides):

| Teenagers | Stem | Adults |
|---:|:---:|:---|
| 9 | 0 | |
| 9 7 6 5 4 4 3 2 2 1 | 1 | 2 4 5 6 7 7 8 9 |
| 7 | 2 | 0 1 3 4 |

**Summary statistics:**

| | Mean | Median | Mode | Range |
|---|---|---|---|---|
| Teenagers | 14.9 cm | 14 cm | 12 and 14 cm | 18 cm |
| Adults | 18 cm | 17.5 cm | 17 cm | 12 cm |

**Shape:** the teenagers' data cluster from 11 to 17 cm, with a possible outlier at 27 cm that gives a slight positive skew and pulls the mean (14.9) above the median (14). The adults' data are roughly symmetric, so their mean and median are close (18 and 17.5).

**Centre:** the median is the fairer comparison, because the teenagers' 27 cm value affects their mean. The 27 cm should be checked (was the ruler dropped early, or did the student look away?) and kept if it is a genuine result.

**Conclusion:** in this sample, teenagers reacted faster. Their median catch distance was 3.5 cm shorter than the adults' (14 cm vs 17.5 cm). The teenagers' results were more spread out (range 18 cm vs 12 cm), but this is mostly because of one value.

**Limitations and improvements:** only 12 people per group, chosen by convenience (classmates and family), and one attempt each. Testing more people chosen at random, giving each person several attempts and using their median, would make the conclusion more trustworthy.
