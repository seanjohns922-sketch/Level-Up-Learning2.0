# Starpath Level 2 Curriculum and Assessment Audit

## Scope

Year 2 Starpath was checked against the supplied Australian Curriculum v9 Mathematics document and the established Starpath audit standard. The audit covers the full eight-week sequence, 24 lessons, seven weekly quizzes, curriculum mappings, and independent 20-item Pre-Test and Post-Test candidate forms.

## Curriculum Alignment

- `AC9M2SP01`: recognise, compare and classify shapes, referencing the number of sides and using spatial terms such as opposite, parallel, curved and straight
- `AC9M2SP02`: locate positions in two-dimensional representations of a familiar space; move positions by following directions and pathways
- Weeks 1-4 assess `AC9M2SP01`.
- Weeks 5-7 assess `AC9M2SP02`.
- Week 8 integrates both descriptors.
- All 24 registry lessons have playable content and implemented reporting skills.

## Weekly Quiz Audit

- Seven weekly quizzes contain exactly 15 questions each.
- Every quiz allocates five questions to each of its three lessons.
- All 105 tasks pass task-safety, prompt, read-aloud and option-ID checks.
- Duplicate lesson-local tracking targets discovered in Weeks 1-4 and 7 were replaced with unique form-level targets.

## Independent Assessment Candidates

The previous Level 2 Post-Test reused weekly quiz generators. It has been retired from production resolution and replaced by the independent form.

Two independent Version 1.0 production banks now exist:

- Pre-Test: 20 items, split 10/10 across the two descriptors.
- Post-Test: 20 items, split 10/10 across the two descriptors.
- Each form uses 14 manipulated responses and six selected responses.
- Pre-Test difficulty: eight easy, nine moderate, three challenging.
- Post-Test difficulty: six easy, nine moderate, five challenging.
- Prompts, contexts and structures are unique within each form and prompts are not reused across forms.
- Feedback is neutral and all tasks include read-aloud text.
- Route bounds, destinations, checkpoints, hazards, step budgets and map answers are validated automatically.
- The candidate source imports no Level 2 lesson, quiz or legacy assessment content.

## Production Release

`data/assessments/api.ts` resolves both Year 2 Space routes to the independent Version 1.0 banks. The Pre-Test is now available to Year 2 Starpath placement and the Post-Test no longer uses weekly quiz content.

## Automated Evidence

- Curriculum audit: 188 passed, 0 failed.
- Weekly-quiz audit: 567 passed, 0 failed.
- Independent-bank audit: 656 passed, 0 failed.
- Starpath assessment blueprint audit: passed.
- TypeScript: passed.
- Targeted ESLint: passed with no errors.

## Verdict

Curriculum and weekly quizzes: **PASS**

Independent banks: **PASS - VERSION 1.0 PRODUCTION**

Production assessment replacement: **APPROVED**
