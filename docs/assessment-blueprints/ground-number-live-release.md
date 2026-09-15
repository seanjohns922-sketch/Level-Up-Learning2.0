# Ground Number release v3 — 15 September 2026

Ground Number now uses five fixed forms: pre, post, diagnostic Start, Mid and End. The frozen source is `data/assessments/releases/groundNumberV3.json`. Each form has 20 items with the same blueprint slots and intended demand, using different examples. These are blueprint-matched forms, not statistically calibrated equivalent tests.

Question 18 now asks how many additional stars are needed for the robots, using separate visible collections and a numeric response. All five forms use this task. Raw model responses, item identity and protocol version are retained; correctness is derived from the recorded task, not a submitted correctness flag. Questions with multiple solutions retain their rubric rather than inventing a unique answer.

New pre-tests use v3. Saved v1 assessments resume v1. Post-tests use the version of the saved draft or most recent baseline; historical/unknown baselines retain v1. Growth requires matching versions and learning cycles. Existing attempts and student progress are not reset.

New Number supervised diagnostic cycles support Prep as their minimum, including upward probing from Prep and downward probing from Year 1. Other strands retain their existing minimum levels. Existing cycles retain their original bank/floor; later checkpoints inherit the first sitting's version for that academic year. Protected placements are not changed by a new Ground Number cycle.

Deployment order: deploy the web release, then apply `20260915170000_ground_number_live_assessments.sql`. The new pending RPC preserves the existing access checks and deferred follow-up order. Until the RPC exists, the client falls back to the previous pinned-version endpoint.

Validation: 100 independent worked responses, malformed and stale evidence rejection, Ground Q18 incorrect interpretations, baseline/draft routing, snapshot serialization and matched/mixed growth checks. The SQL migration was tested with synthetic temporary-table fixtures for save/resume, terminal Prep outcomes, upward/downward probing, all seven levels, legacy floor rejection, Prep assignment and protected progress; the test transaction was rolled back. Full release gates, TypeScript and production build are required before push.
