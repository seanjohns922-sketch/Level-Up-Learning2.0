# Level 1 Number: existing pre/post audit

Status: targeted v3 release authorised by the owner. The table records the original v2 audit; the release section records the resulting corrections. This is not a full curriculum-coverage sign-off. Source: supplied Australian Curriculum Mathematics F–6 v9 PDF, Year 1 descriptors (pages 12–14), and `year1NumberNexusIndependentBanks.ts`. This report concerns the existing student banks, not the replacement candidate preview.

## Item decisions

All 40 current answer keys are mathematically consistent with their prompts. “Keep” below means no content defect identified in this desk review, not completed device/audio verification.

| Slot | Evidence | Decision |
|---|---|---|
| 1 | N01: 46 / 73 from tens and ones | Tweak visual: vertical rods with ten square units equal in size to ones. Implemented. |
| 2 | N02: 30+8 / 60+4 | Keep. |
| 3 | N03: four / five groups of five | Keep; review workload when matching checkpoints. |
| 4 | N04: 8+6 / 9+7 | Keep; both bridge ten. |
| 5 | N05: 6+5 books / 7+4 seedlings | Seedling icon corrected. Book colours corrected to match red/blue wording. |
| 6 | N06: 12 / 15 shared among three | Keep; same sharing demand. |
| 7 | A01: next term in twos | Keep. |
| 8 | A02: continue AB pattern | Keep. |
| 9 | N01: missing 120 / 119 | Keep; review boundary demand across matched forms. |
| 10 | N04: 12−5 / 18−11 | Tweak pending: pre crosses ten, post does not. |
| 11 | N02: 47=20+27 / 64=30+34 | Keep; nonstandard partition. |
| 12 | N03: 12×10 / 24×5 makes 120 | Wrong hard-coded display corrected to match each option. Content amendment pending: post changes grouping unit and count range. |
| 13 | N04: 17−9 / 18−9 | Keep. |
| 14 | N05: $4+$3 / $6+$5 | Tweak pending: only post bridges ten. |
| 15 | N06: 16÷4 / 18÷3 | Equivalence review pending: divisor and group count both change. |
| 16 | A01: missing interior multiple of five / next multiple | Tweak pending: match position and surrounding evidence. |
| 17 | A02: extend AAB by two symbols | Keep. |
| 18 | N01: order three numbers near 100–120 | Keep; match place-value comparison demand. |
| 19 | N05: more coins does not mean more money | Keep counterexample; coin-value evidence is valid. |
| 20 | N06: unequal 6/4 / equal 5/5 shares | Review pending: opposite yes/no cases; “challenging” label unsupported by response demand alone. |

## Coverage and difficulty

All eight assigned codes appear, but this does not establish full descriptor coverage. Missing or weak evidence includes N01 number lines, N02 one-digit partitioning with materials, N03 child-chosen grouping strategies, A01 tens sequences and creating sequences, and A02 identifying the repeating unit and creating a pattern. N05/N06 mostly supply the model: results must not imply independent modelling mastery.

Resolve gaps through the smallest justified amendments and document what remains unassessed. Do not automatically add multi-part construction tasks to every slot. Current metadata labels ten items easy, eight moderate and two challenging; these labels are not empirical difficulty estimates. The paired differences above must be resolved before declaring growth forms comparable.

## Preservation and remaining checks

Implemented bank changes are visual payload only. Item IDs, prompts, keys, options, score rules and bank versions are retained. No resolver, persistence, progression or migration changes are included. Existing candidate preview remains a reference; only its MAB rendering is shared with the corrected display.

Content amendments require explicit version/cycle handling before student release. Next: correct remaining presentation issues, resolve the flagged pair differences, and derive diagnostic variants from that corrected pair. Verify actual rendered desktop/tablet/mobile questions and audio, then save/resume, first submission, historical attempts and teacher reports. Owner review follows those checks; this document is not a claim that they have passed.


## Targeted difficulty revision (v3 release)

`data/assessments/revisions/year1NumberMatchedPair.ts` retains every pre-test prompt and answer, and changes only post-test slots 10, 12, 14, 15, 16 and 20:

- Missing part: 13−6, so both forms bridge ten.
- Grouping: 110 as 11 groups of ten, retaining the pre-test grouping unit and similar distractor demands.
- Money: $5+$3, so neither form requires bridging ten.
- Grouping division: 20 into groups of four; both forms use the same divisor and a nearby group count.
- Skip counting: five-term sequence with an interior missing term in the same position.
- Equal sharing: 7/3, retaining two unequal groups totalling ten. Both keys are “No”; different examples alone do not establish empirical equivalence.

Both forms relabel missing-part demand moderate, coin-value reasoning moderate, and simple equal-sharing recognition easy. No claim of empirical calibration is made. Existing v2 banks remain intact; draft IDs and bank metadata use v3. The v3 pair has its own comparison group, separate from v2. Existing baselines and interrupted sittings retain v2; fresh baselines and Demo Review use v3. The revision does not yet resolve every curriculum evidence gap or provide independent diagnostic forms.

Validation: `scripts/audit-year1-number-matched-pair.ts` checks 40 independently calculated answers, incorrect choices, empty responses, matching descriptor/response/difficulty profiles, relevant numerical demands and preservation of released v2 questions.

Release integration: pre-test resume selects the saved question version before restoring answers. Post-tests select from recorded baseline metadata or saved draft IDs; missing historical metadata retains v2. Completed results still use the existing snapshot/save path and idempotent completion IDs. No migration or historical-result rewrite is included. Real diagnostic sittings continue to resolve v2 until their checkpoint forms are version-pinned.

Browser evidence: inspected all six amended post-test questions on desktop, tested numeric entry and selected responses, and confirmed the answer 8 on question 14 survived a reload alongside the revised prompt. Fixed an existing nested answer/read-aloud button error and preview hydration mismatch found during review. Tablet/mobile and audible playback were not verified in this pass. Automated tests cover independent keys, distractors, version selection, snapshot serialization and teacher growth calculations; they are not a production database roundtrip test.
