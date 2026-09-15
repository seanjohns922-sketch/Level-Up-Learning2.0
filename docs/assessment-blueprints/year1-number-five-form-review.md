# Number Level 1: five forms ready for manual review

Review entry: `/demo-review/number-level-1`. In Demo Review select Number Nexus and Level 1, then **Review all five forms**. The form buttons keep the same question number so corresponding examples are easy to compare. Every question is reachable without completing earlier answers. Answer checks are behind **Review details**. Review responses stay in component memory and do not write student data.

## Benchmark and scope

The benchmark is the original Level 1 post-test (`YEAR1_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS`), before the recent v3 changes lowered or changed some of its demands. Its 20 prompts, answers, options and visuals are retained in this review's Post-Test. Pre-Test, Start, Mid and End contain different examples of the same tasks. The previously drafted checkpoint forms and the redesigned Level 1 candidate are superseded for this review.

All five forms contain 20 equally weighted questions, 100 questions total. Each corresponding question has the same curriculum code, skill, response format, scoring rule and visual family. The intended profile is 10 accessible and 10 moderate items in each form. In particular, a simple yes/no equal-share judgement is not labelled challenging. These are reasoned difficulty judgements, not claims that student-calibrated difficulty is numerically identical.

The supplied Australian Curriculum Mathematics F–6 v9 PDF, Year 1 pages 12–14, was checked against the retained skill coverage:

| Q | Curriculum | Same demand in every form |
|---|---|---|
| 1 | AC9M1N01 | Read a two-digit number from vertical tens rods and ones. |
| 2 | AC9M1N02 | Combine a whole number of tens and a one-digit part. |
| 3 | AC9M1N03 | Count supplied equal groups of five. |
| 4 | AC9M1N04 | Add two one-digit numbers, crossing ten, within 20. |
| 5 | AC9M1N05 | Combine two pictured seedling collections, crossing ten. |
| 6 | AC9M1N06 | Share a collection equally among three plates; give the size of one share. |
| 7 | AC9M1A01 | Continue four-term skip counting in twos; the fourth term is missing. |
| 8 | AC9M1A02 | Continue an AB pattern by one token, using the same three-token palette. |
| 9 | AC9M1N01 | Supply the third term of a consecutive three-digit number path; the missing number ends in nine and the final number crosses the decade. |
| 10 | AC9M1N04 | Find a missing part: two-digit whole minus two-digit known part, without borrowing. |
| 11 | AC9M1N02 | Nonstandard two-digit partition: remove whole tens, leaving three tens and ones. |
| 12 | AC9M1N03 | Identify a collection of 120–140 counters grouped in fives; compare three group-count choices with the same distractor principles. |
| 13 | AC9M1N04 | Subtract a one-digit number from a teen number, crossing ten. |
| 14 | AC9M1N05 | Add two whole-dollar prices, crossing ten, supported by the same currency visuals. |
| 15 | AC9M1N06 | Form groups of three; give the number of groups. The visual supplies the collection, not the completed grouping. |
| 16 | AC9M1A01 | Continue four-term skip counting in fives; the fourth term is missing. |
| 17 | AC9M1A02 | Continue an AAB pattern by two tokens. |
| 18 | AC9M1N01 | Order three numbers: one in the nineties, one from 100–109, and 120. |
| 19 | AC9M1N05 | Reject “more coins always means more money” using a counterexample with more $1 coins but less value than the $2 collection. |
| 20 | AC9M1N06 | Recognise two equal shares; same yes/no response and equal-case structure. |

## Difficulty, wording and visual audit

The six previously mismatched families now follow the original post-test: Q10 does not borrow; Q12 uses groups of five; Q14 crosses ten; Q15 divides into groups of three; Q16 asks for the next term; Q20 shows equal shares. The other families retain their original format.

Quantities vary within bounded ranges without adding operations, response steps or new representations. Across the three collection-counting tasks (Q3/Q6/Q15), displayed quantities total 63, 58, 53, 56 and 60 respectively for Pre/Post/Start/Mid/End, all within 10% of the benchmark's 58. This is a workload safeguard, not an empirical difficulty estimate; it avoids making End systematically longer by always choosing larger collections. Each slot has five genuinely different visual examples, rather than merely changing IDs or shuffling answer choices.

All 100 prompts are at most 15 words. The same question card and Number Nexus shell render every form. The same existing visual types are used: MAB, part-whole, counters, sharing plates, number sequences, symbolic equations, seedlings, money, repeating patterns and number cards. Equations use a symbolic display intentionally; decorative pictures would not add mathematical evidence. MAB rods remain vertical with ten square units matching the ones. The grouped-choice task uses the benchmark's labelled group descriptions; it does not claim to observe the child's own grouping strategy.

No new lesson interactions, large compound tasks or progressively harder End format have been introduced. Browser automation was not used for this pass, as requested. Existing renderers are reused; the owner's manual review is the remaining visual/usability review.

## What these results measure

All eight assigned codes are represented in each form. Code coverage is not evidence of every verb in a descriptor. The retained post-test does not independently assess number-line placement, child-created grouping/model construction, one-digit partition construction, creating tens sequences or explicitly naming the repeating unit. Those limitations apply equally to all five forms. This release does not add new task types to claim full descriptor mastery; it aligns the tests to the owner's post-test benchmark.

Repeated correct values can occur naturally in different arithmetic examples. They are not duplicate items: all five visual inputs differ at each slot. Accepted numerical answers, ordering and pattern response encodings use the existing scorer. Every form remains out of 20 with one mark per question; no partial-credit or denominator change is introduced.

## Verification and release boundary

`npm run qa:year1-number-five-forms` verifies 100 separately worked keys, independently solves each visual, tests blank/wrong answers and all multiple-choice distractors, checks curriculum/format/visual/scoring alignment and the numerical demand rules above, and confirms the original post-test is retained. It also verifies five distinct examples per slot, the bounded workload, access protection and absence of student writes in the review component.

The complete set is for manual review. Student v2/v3 banks, recorded attempts, learning cycles, progress and active diagnostics remain unchanged. After review, activation needs a new compatible form group and versions pinned to student sittings; review IDs must never be substituted into an existing attempt. Level 2 starts after this set is reviewed.
