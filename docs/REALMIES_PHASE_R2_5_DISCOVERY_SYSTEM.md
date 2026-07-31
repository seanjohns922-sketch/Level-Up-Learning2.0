# Realmies Phase R2.5 Discovery System

## Rules

| Rule | Threshold | Scope |
| --- | ---: | --- |
| First completed lesson | 1 | each live realm |
| Lesson milestones | 10 and 50 | each realm |
| Passed weekly quizzes | 5 at 80%+ | each realm |
| First fog discovery | 3 lessons | global |
| Learning streak | 7 days | global |
| Learning streak | 30 days | global |
| Special event | configured payload | future server event |

## Canonical eligibility

Lesson evidence comes from completed `student_lesson_attempts`. Quiz evidence
comes from passed `student_weekly_quiz_attempts`. Streak dates are the distinct
Australia/Melbourne calendar dates represented by those canonical completions.

Attempt summaries marked as demo, review-only or teacher-advanced are excluded.
Telemetry and browser caches are never queried.

## Idempotency

Ownership is unique by student and Realmie. Receipts use a stable source key.
Re-evaluating an attempt, retrying the evaluator or rerunning the backfill cannot
create duplicate ownership.

## Live evaluation

Deferred constraint triggers run after canonical lesson and weekly quiz inserts.
They evaluate the committed row set at the end of the transaction while keeping
the canonical save and unlock atomic.

## Backfill

The internal backfill loops over students with canonical evidence and invokes
the same evaluator used by live writes. It is safe to rerun and does not:

- modify attempts or scores
- award XP or Gems
- unlock Cards
- alter progression
- fabricate activity

## Special events

The evaluator supports `special_event` with an explicit event key in server
context. No client-executable special-event grant exists. Event rules must be
added deliberately to `realmie_discovery_rules`.

## Reporting

The correction report records retired rows, preserved historical records,
active catalogue/rule counts and backfill results. Product telemetry records
collection interactions only and has no authority over discovery.
