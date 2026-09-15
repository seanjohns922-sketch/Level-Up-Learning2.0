# Number Level 1: approved five-form release

Review entry: `/demo-review/number-level-1`. In Demo Review select Number Nexus and Level 1, then **Review all five forms**. The form buttons keep the same question number so corresponding examples are easy to compare. Every question is reachable without completing earlier answers. Answer checks are behind **Review details**. Review responses stay in component memory and do not write student data.

## Benchmark and scope

The benchmark is the original Level 1 post-test (`YEAR1_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS`), before the recent v3 changes lowered or changed some of its demands. Fourteen prompts, answers, options and visuals remain unchanged in this review's Post-Test. Following owner feedback, Q4, Q5, Q13, Q14, Q19 and Q20 are strengthened in all five forms (review version 5.0.0-review.1). Pre-Test, Start, Mid and End contain different examples of the same tasks. The previously drafted checkpoint forms and the redesigned Level 1 candidate are superseded for this review.

All five forms contain 20 equally weighted questions, 100 questions total. Each corresponding question has the same curriculum code, skill, response format, scoring rule and visual family. The intended profile is 9 accessible, 7 moderate and 4 challenging items in each form. The challenging items require finding an unknown or reasoning with coin values/equal redistribution. No yes/no sharing question remains. These are reasoned difficulty judgements, not claims that student-calibrated difficulty is numerically identical.

The supplied Australian Curriculum Mathematics F–6 v9 PDF, Year 1 pages 12–14, was checked against the retained skill coverage:

| Q | Curriculum | Same demand in every form |
|---|---|---|
| 1 | AC9M1N01 | Read a two-digit number from vertical tens rods and ones. |
| 2 | AC9M1N02 | Combine a whole number of tens and a one-digit part. |
| 3 | AC9M1N03 | Count supplied equal groups of five. |
| 4 | AC9M1N04 | Find the missing addend in a sum of 15–17; known and missing addends are 7–9. |
| 5 | AC9M1N05 | Find an unknown increase from before/after seedling collections: 7–9 initially, 15–17 finally, 7–8 added. |
| 6 | AC9M1N06 | Share a collection equally among three plates; give the size of one share. |
| 7 | AC9M1A01 | Continue four-term skip counting in twos; the fourth term is missing. |
| 8 | AC9M1A02 | Continue an AB pattern by one token, using the same three-token palette. |
| 9 | AC9M1N01 | Supply the third term of a consecutive three-digit number path; the missing number ends in nine and the final number crosses the decade. |
| 10 | AC9M1N04 | Find a missing part: two-digit whole minus two-digit known part, without borrowing. |
| 11 | AC9M1N02 | Nonstandard two-digit partition: remove whole tens, leaving three tens and ones. |
| 12 | AC9M1N03 | Identify a collection of 120–140 counters grouped in fives; compare three group-count choices with the same distractor principles. |
| 13 | AC9M1N04 | Find the unknown starting number in subtraction: ? − 7–9 = 7–9, with a starting total of 15–17. |
| 14 | AC9M1N05 | Calculate change from $20 after buying two items. Each costs $5–$9; total $11–$14; change $6–$9. Explicit payment and price labels. |
| 15 | AC9M1N06 | Form groups of three; give the number of groups. The visual supplies the collection, not the completed grouping. |
| 16 | AC9M1A01 | Continue four-term skip counting in fives; the fourth term is missing. |
| 17 | AC9M1A02 | Continue an AAB pattern by two tokens. |
| 18 | AC9M1N01 | Order three numbers: one in the nineties, one from 100–109, and 120. |
| 19 | AC9M1N05 | Find how many more dollars the second person has. More $1 coins ($7–$9 total) versus fewer $2 coins ($12–$14 total); difference $3–$6. Numeric response, not generic yes/no reasoning. |
| 20 | AC9M1N06 | Determine how many counters to move from Tray A to Tray B to make equal shares: total 14–18, difference 6–8, transfer 3–4. Numeric response; simply entering the difference is incorrect. |

## Difficulty, wording and visual audit

The owner-requested changes are confined to six corresponding slots. All five forms use the same unknown positions, number ranges, operations, visuals and scoring for those slots. Q4/Q13 remain within the AC9M1N04 limit of 20; added demand comes from unknown positions. Q5/Q14/Q19 model practical additive situations (AC9M1N05), and Q20 models equal sharing (AC9M1N06). The remaining fourteen slots retain their previous demand.

Quantities vary within bounded ranges without adding operations, response steps or new representations. Across the three collection-counting tasks (Q3/Q6/Q15), displayed quantities total 63, 58, 53, 56 and 60 respectively for Pre/Post/Start/Mid/End, all within 10% of the benchmark's 58. This is a workload safeguard, not an empirical difficulty estimate; it avoids making End systematically longer by always choosing larger collections. Each slot has five genuinely different visual examples, rather than merely changing IDs or shuffling answer choices.

All 100 prompts are at most 15 words. The same question card and Number Nexus shell render every form. Shared visual types include: MAB, part-whole, counters, sharing plates, number sequences, symbolic equations, before/after seedlings, labelled shop prices and payment, coin collections, unequal labelled trays, repeating patterns and number cards. Equations use a symbolic display intentionally; decorative pictures would not add mathematical evidence. MAB rods remain vertical with ten square units matching the ones. The grouped-choice task uses the benchmark's labelled group descriptions; it does not claim to observe the child's own grouping strategy.

No new lesson interactions or progressively harder End format have been introduced. Buying two items and calculating change is one coherent practical money task. Browser automation was not used for this pass, as requested. Three simple visual layouts were added to the shared Year 1 renderer; the owner's manual review is the remaining visual/usability review.

## What these results measure

All eight assigned codes are represented in each form. Code coverage is not evidence of every verb in a descriptor. The retained post-test does not independently assess number-line placement, child-created grouping/model construction, one-digit partition construction, creating tens sequences or explicitly naming the repeating unit. Those limitations apply equally to all five forms. These refinements do not claim full descriptor mastery. They strengthen six tasks within the assigned curriculum codes while keeping all five forms comparable.

Repeated correct values can occur naturally in different arithmetic examples. They are not duplicate items: all five visual inputs differ at each slot. Accepted numerical answers, ordering and pattern response encodings use the existing scorer. Every form remains out of 20 with one mark per question; no partial-credit or denominator change is introduced.

## Verification and release boundary

`npm run qa:year1-number-five-forms` verifies 100 separately worked keys, independently solves each visual, tests blank/wrong answers and all multiple-choice distractors, checks curriculum/format/visual/scoring alignment and the numerical demand rules above, and confirms the other fourteen original post-test questions are retained. Q19/Q20 use numeric scoring and constructed-response metadata across all five forms. It also verifies five distinct examples per slot, the bounded workload, access protection and absence of student writes in the review component.

The owner approved live activation following the Q5/Q14/Q19 refinements. Q5 now asks how many more were planted, Q14 displays actual currency for payment and prices, and Q19 asks how much more money. `year1NumberReleasedForms.ts` assigns production v5 identities distinct from review answers. New pre-tests and their matching post-tests use v5. Saved v2/v3 attempts retain their banks; post-tests without a recorded v5 baseline keep the historical version. Comparison groups prevent mixing versions in growth figures.

Migration `20260915160000_number_level1_five_form_release.sql` is applied **after** the web deployment. It keeps existing diagnostic sittings at v2, defaults new cycles to v5, and inherits the first sitting's version for later checkpoints in the same academic year. The additive pending-sitting RPC preserves existing access/session/ordering checks. The client falls back to the original RPC only while the new RPC is unavailable. Recent assessment adoption accepts matching Number Level 1 versions only. No existing scores or answer records are rewritten.

Normal demo pre/post screens now use the new default bank; the diagnostic preview explicitly loads v5. Exiting demo assessments returns to Demo Review with realm/level retained. Student exit destinations are unchanged. `qa:year1-number-release` checks release/review content equality, legacy resume, pinned diagnostic forms, snapshots and version-safe growth.
