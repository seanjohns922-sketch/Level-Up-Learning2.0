# Canonical Progression Architecture

## Core Rule

The server is the source of truth for student progression. Browser state is a
replaceable cache. Live telemetry describes current activity only.

This contract applies to Number Nexus, Measurelands, Starpath, and every future
realm.

## Canonical Data

The following tables own durable learning state:

- `student_realm_progress`: placement, current level, current week, assigned
  pathway, and assessment state.
- `student_lesson_attempts`: every saved lesson attempt and its actual question
  totals, accuracy, duration, summary, and insight.
- `student_weekly_quiz_attempts`: every weekly quiz attempt, its fixed question
  total, score, pass state, and lesson breakdown.
- `student_realm_assessments`: pre-test and post-test evidence.
- `student_completion_receipts`: idempotency boundary for completion rewards.
- `student_progress_overrides`: immutable teacher-authorised advancement records.

Canonical completion RPCs write the attempt, realm progress, daily activity,
XP, and first-completion receipt in one server-controlled flow. Retakes may be
recorded, but they must not mint the same completion reward again.

Completion request UUIDs make retries of one submission idempotent. Reward
eligibility is separately scoped to the logical activity:

- lesson: student, realm, working level, week, and lesson
- weekly quiz: student, realm, working level, week, and quiz ID

The first valid completion of that exact activity earns its completion XP.
Later reviews remain valid attempt evidence with zero completion XP. A
different lesson or quiz has a different logical identity and earns its own
first-completion reward.

## Lesson Length

Timed lessons are open-ended. A student answers as many generated questions as
they can before the lesson timer expires.

- A timed lesson must not end after an assumed number of questions.
- Question totals must store the actual number answered.
- Different students may legitimately complete different totals in the same
  lesson.
- Lesson progress telemetry is based on elapsed time, not a question ceiling.
- Weekly quizzes are separate fixed assessments and currently contain 15
  questions.

Future lesson engines may expose configuration such as `mode`,
`targetMinutes`, and an optional `maxQuestions`. The default timed lesson has no
question maximum. A maximum may only be added for a curriculum activity that
explicitly requires one.

## Browser Cache

`program_progress_v1` is a performance cache populated from canonical server
rows. It may improve rendering and same-session navigation, but it must never
be the origin of a real student's progression.

At login, realm entry, lesson entry, and return from a completion:

1. Fetch canonical rows for the active student and realm.
2. Validate that the active student session has not changed.
3. Replace that realm's browser cache from the returned rows.
4. Make routing and unlock decisions from that restored state.

The browser must never independently decide or persist a real student's:

- current week or level
- lesson completion
- quiz completion or pass state
- lesson, quiz, or post-test unlock
- placement result
- review eligibility

Demo preview state may remain local because it is not student progression.

Every real-student browser progress record carries the student ID, realm ID,
canonical cache version, and refresh timestamp. A mismatched or legacy record
is rejected and rebuilt from the server.

## Teacher Progress Overrides

A teacher or active school administrator may advance a student's current week
for a documented educational reason. The override moves only the canonical
`current_week` and `assigned_week` pointers and records the previous and new
state in `student_progress_overrides`.

An override never creates lesson attempts, quiz attempts, scores, percentages,
XP, gems, or completion receipts. Normally completed weeks and teacher-advanced
weeks are reported separately. Override records are append-only audit evidence;
they are not edited to revise history.

## Teacher Dashboard

Teacher progression views read canonical realm progress, lesson attempts, quiz
attempts, and assessments. A canonical read failure must be shown as an error;
it must not silently replace valid results with empty, legacy, browser, or
telemetry-derived data.

The current class roster is resolved through `students.class_id`. Attempt-row
`class_id` remains historical audit context and must not cause a current class
teacher to lose visibility of canonical work.

## Live Telemetry

`live_student_activity` and `live_activity_events` answer: "What is happening
right now?"

Allowed uses include:

- current question and activity
- current lesson label
- elapsed/current-session counts
- idle/active state
- immediate teacher intervention signals

Telemetry must never:

- mark a lesson or week complete
- override canonical current week or level
- unlock a lesson, quiz, assessment, or realm
- reconstruct historical attempts
- award XP

Append-only events remain useful for operational diagnosis, but they are not a
progress ledger.

## Analytics

Analytics and learning insights are projections of canonical attempts. They may
aggregate, compare, or explain canonical evidence, but they do not write
progression and they do not become an alternate source of truth.

## Realm Compliance Checklist

Before a realm is released:

- lesson and quiz completions use canonical secure RPCs
- completion retries are idempotent
- timed lessons preserve actual uncapped question totals
- browser state is rebuilt from the server before routing
- teacher views use canonical rows only for durable status
- telemetry is limited to current activity
- review mode never changes placement
- XP is student-global and first-completion gated
- refresh, logout/login, and device changes preserve the same progression
