# Whole-Maths Diagnostic — spec & build brief

Status: **planned** (build after all six realms exist — Algebra + Probability realms
are not built yet). This doc is the source of truth for the feature and is written
so it can be handed straight to a coding agent.

## What it is

One formal diagnostic that draws on the genres' (strands') existing level tests to
produce, per student:

- a **year-level for each of the 6 strands** (e.g. Number 4.5 = mid Year 4), and
- a **weighted overall maths level** across all six.

No competitor (EA / Mathletics / Prodigy) gives a single weighted whole-maths level.
This is the "overall look at maths" progression point for teachers and leadership.

Strands ↔ realms: Number↔Number Nexus, Measurement↔Measurelands, Space↔Starpath,
Statistics↔Statistica, Algebra↔Algebra Realm, Probability↔Probability Realm.

## Weighting (already wired in)

The overall level is a **curriculum-point weighted average** — each strand counts in
proportion to its number of AC9 content descriptors across Foundation–Year 6
(verified against the official ACARA F–6 curriculum):

| Strand | Points (F–6) | Weight |
|---|--:|--:|
| Number | 53 | 38% |
| Measurement | 28 | 20% |
| Space | 17 | 12% |
| Statistics | 17 | 12% |
| Algebra | 16 | 12% |
| Probability | 8 | 6% |
| **Total** | **139** | **100%** |

`overall = Σ(strand level × weight) ÷ 139`

Live in `lib/curriculum/ac-standards.ts` → `AC_STRANDS[strand].weight` (the descriptor
count). Do not hard-code weights elsewhere; read them from there.

## Cadence — 3 sittings a year

- **Start / Mid / End** are the official measurement windows. Same instrument each
  time so growth is comparable.
  - Start = baseline + initial placement.
  - Mid = progress check.
  - End = growth evidence.
- A teacher can also trigger an **ad-hoc** diagnostic for a single student and/or a
  single strand.
- Each sitting is persisted as an **immutable record** (checkpoint label, date, the
  per-strand measured levels, and the overall). These are the Start/Mid/End dots on
  the report.

The continuous weekly data (lessons, quizzes, post-tests) is **not** the diagnostic —
it is the live layer between sittings (see "Predicted level").

## The adaptive instrument (per strand)

- Draw **10–20 questions per strand** from the existing realm level tests
  (see `lib/assessment-curriculum.ts` for how questions link to curriculum codes).
- **Start at the student's current working level** for that strand.
- If they **master** a level (`score ≥ MASTERY`), probe the **next level up**, and
  keep climbing (ceiling-finding). Mid/End can be shorter than Start because a prior
  level is known — re-test around it ± a band.
- Map performance to a **year-level** for reporting (e.g. 3.5 = mid Year 3).

## Re-placement (only at a sitting, per strand)

The diagnostic **measures every time**, but only **re-places** at the 3 sittings.
Between sittings a student's placement is stable.

Placement rule — put the student at the **first level where they score below mastery
but above the floor** (their instructional / zone-of-proximal-development level):

- **Promote:** current level mastered (`≥ MASTERY`) AND next level in the
  instructional band (`FLOOR ≤ score < MASTERY`) → set that as the new working level
  for the strand. May jump more than one level (if the next level is also mastered,
  keep climbing).
- **Never auto-demote:** if measured **below** current placement, do NOT drop the
  student — raise a teacher **"review / support"** flag instead.
- **Cliff edge:** next level `< FLOOR` → hold at the mastered level and flag
  "extension / ready to bridge" (don't drop them into something too hard).

Thresholds as named constants in one place: `MASTERY = 85`, `FLOOR = 40`.

Canonical example (Number, mid-test): **90% on Level 3 (mastered) → probe Level 4 →
55% on Level 4 (instructional band) → working level becomes Level 4.** 55% is the
correct trigger — place where the learning edge is, not where they've already
mastered.

Placement is **server-controlled** (students never self-place), same security pattern
as existing RPCs (SECURITY DEFINER + `assert_student_access`). It **coexists with the
normal post-test progression** (unchanged) — the diagnostic is the extra "leapfrog +
re-baseline" lever three times a year.

## Predicted / working level (between sittings)

Show a **live estimate** derived from weekly performance, clearly labelled as a
prediction and visually distinct from the last **official** diagnostic level. On the
report, the 3 diagnostic dots are the spine; the weekly data is the line between them
and can project the next dot. Passing post-tests during term may *provisionally* raise
the working level, reconciled at the next sitting.

## Two audiences

- **Leadership:** the 3 fixed cohort points → clean whole-school growth (the EA
  differentiator).
- **Teachers:** the continuous layer → the intervene-now loop (school-analytics
  Tier 2).

## Integration points

- `lib/curriculum/ac-standards.ts` — strand meta + weights (read, don't duplicate).
- `lib/assessment-curriculum.ts` — question ↔ curriculum-code linking; reuse for
  question selection.
- `lib/school-platform-server.ts`, `components/school/SchoolAnalyticsDashboard.tsx` —
  where cohort/teacher analytics render; the diagnostic feeds these.
- `student_realm_progress` (and siblings) — current working level per strand; the
  placement rule reads/writes here.
- The Start/Mid/End student report already exists as a design (per-strand tracks +
  weighted 3-dot overall) — the diagnostic populates it.

## Acceptance criteria

- Overall recomputes as the curriculum-point weighted average (weights from
  `AC_STRANDS`), sum 139.
- Number, mid-test: 90% L3 → probe L4 → 55% L4 → working level = L4.
- 88% L4 (also mastered) → probe L5 (multi-level leapfrog).
- Next level < 40% → hold at mastered level + "extension" flag (no move).
- Measured below current placement → no demotion; teacher review flag created.
- Placement changes only at Start/Mid/End (or teacher-triggered), never silently from
  weekly practice.
- No demo-only shortcuts — identical rules/persistence for real students.

## Dependencies

Needs all six realms' per-strand level tests to exist. Algebra + Probability realms
are not built yet, so this ships after them.
