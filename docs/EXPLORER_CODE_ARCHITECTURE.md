# Explorer Code Architecture

## Purpose

An Explorer Code is a public linking identifier for one permanent student
identity. It is not a login secret, database key, entitlement, or proof of a
relationship.

- Canonical identity: `students.id`
- Public linking identifier: `LUL-7Q4M-X9KP`

Knowing a code never grants access to the student, progression, school,
inventory, or account.

## Schema

`student_explorer_codes` stores an immutable history:

- one globally unique `code_normalised` across active and revoked records;
- one active record per student through a partial unique index;
- revoked records retain actor, timestamp, reason, and replacement record ID;
- a reset creates a new row and never edits or reuses the old code.

The student foreign key is restrictive so deleting a student cannot silently
erase the historical code reservation.

## Format And Normalisation

Canonical display format:

```text
LUL-XXXX-XXXX
```

The alphabet excludes `0`, `O`, `1`, `I`, and `L`. Eight characters are
generated from PostgreSQL cryptographic random bytes. Generation occurs only
in a `SECURITY DEFINER` database function and retries after a unique collision.

Input normalisation uppercases and removes separators. These values resolve to
the same canonical code:

```text
LUL-7Q4M-X9KP
lul7q4mx9kp
LUL 7Q4M X9KP
```

## Assignment

`students_assign_explorer_code` runs after every canonical student insert. If
code assignment fails, the student insert transaction fails too.

`ensure_student_explorer_code_internal` is idempotent and transaction-locked
per student. The deployment migration calls it for every student without an
active code and reports the created count as a PostgreSQL notice. Re-running
the backfill creates no additional active records.

This trigger covers manual creation, class creation, imports, home profiles,
platform administration, and any future canonical creation command without
requiring each UI to remember a second write.

## Visibility

- School administrators and principals can view their school directory.
- Teachers can request active codes only for students allowed by
  `can_view_student`.
- Platform administrators may operate through the reviewed command boundary.
- No anonymous or public code table access exists.
- Exact lookup returns a result only when the caller can already view that
  student.
- Revoked codes never resolve.

Codes may appear in an explicitly authorised school export later. Such exports
must be school-scoped and audited. PINs and other authentication secrets must
not be included merely because Explorer Codes are included.

## Reset

`reset_student_explorer_code` requires:

- an authenticated school manager or platform administrator;
- the active school tenant ID;
- the student to belong to that school;
- a non-empty reason.

The command revokes the active row, creates a globally unique replacement,
keeps the same `students.id`, and records `student_explorer_code_reset` in
`school_audit_log`. Audit JSON stores record IDs and the reason, not raw codes.
Teachers do not receive reset permission by default.

Resetting has no effect on progression, XP, assessments, classes, inventory,
avatars, legends, parent links, credentials, or entitlements.

## Future Uses

Parent linking, school/home profile reconciliation, QR linking, friends,
battles, teams, trading, and social features are intentionally deferred. Each
future workflow must add independent verification and rate limiting. Explorer
Code knowledge alone is never sufficient authority.

