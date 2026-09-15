# Number Level 8 release — 16 September 2026

All five approved forms contain 30 questions, matched by skill, curriculum code, response type and intended difficulty. Production identities use `y8-number-{pre|post|start|mid|end}-XX-v1`. Difficulty remains author assessed, not empirically calibrated.

- Student pre/post assessments use the extension runner with per-level browser drafts, completion receipts, question snapshots and separate pre/post learning cycles. Existing Level 7 draft keys remain valid.
- Teacher extension reports show Levels 7 and 8 separately. The Number strand tracker supports Level 8; weekly lesson placement stays capped at Level 6 pending the advanced pathway.
- New diagnostic cycles can probe through Level 8. Existing academic-year cycles retain their saved ceiling (6 or 7); all existing results remain unchanged. Number Levels 7–8 use 30 questions; other released levels use 20.
- Demo Review selects Ground–8 from the normal Number dropdown. The standard pre/post and Start/Mid/End buttons open the selected assessment. Extra candidate sections are removed. Extension weekly lessons are not yet offered.
- Student pre/post and diagnostic routes already supported “I don’t know”. The protected five-form review now supports it too, with blank response controls and a visible status after skipping. Snapshots retain `dont_know` rather than a correct answer.
- Q1 has explicit square-area wording, equal-side marks and an unknown side label. Q3 labels circumference and diameter, removes irrelevant lengths, and avoids revealing pi in the visible heading.

Migration: `20260916100000_number_level8_release.sql`.

Validation: independently checked 150 Level 8 answers; release routing, diagnostic ceiling, skipped-answer replay and growth-group audits; existing pre-build audits; temporary-table database save/resume, 30-question completion, invalid-input rejection, receipt deduplication, paired baselines and unchanged lesson placement. The migration dry run compares existing live sitting/result rows before and after, then rolls back.
