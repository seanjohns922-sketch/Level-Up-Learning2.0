# Whole-Maths Diagnostic — spec & build brief

Status: **staged foundation — not live**. Number, Measurement, Space and Statistics
are wired to their existing level-test banks, curriculum links and secure persistence.
The teacher Diagnostic tab is visible as a readiness/reporting surface, but the full
launch is deliberately locked. Algebra + Probability remain explicit unavailable
dependencies; no four-strand result is renormalised or presented as a Whole-Maths
overall. This doc remains the source of truth for the completed six-strand feature.

Current implementation:

- `lib/whole-maths-diagnostic.ts` owns the adaptive rules, named thresholds and
  weighted-overall calculation; `lib/whole-maths-diagnostic-questions.ts` owns
  deterministic level-test selection and curriculum linking.
- `components/teacher/WholeMathsDiagnosticPanel.tsx` is the staged teacher tab.
- `app/diagnostic/page.tsx` is the unlinked student instrument used while building
  and verifying the four available strands.
- `supabase/migrations/20260903170000_whole_maths_diagnostic_foundation.sql` owns
  immutable sittings and server-controlled placement. Full six-strand assignment is
  rejected until the two missing test banks exist.
- `scripts/whole-maths-diagnostic-audit.ts` prevents partial results being labelled
  as the official 139-point overall.

## What it is

One formal diagnostic that draws on the genres' (strands') existing level tests to
produce, per student:

- a **year-level for each of the 6 strands** (e.g. Number 4.5 = mid Year 4), and
- a **level-aware overall maths progression point** across all six.

No competitor (EA / Mathletics / Prodigy) gives a single weighted whole-maths level.
This is the "overall look at maths" progression point for teachers and leadership.

Strands ↔ realms: Number↔Number Nexus, Measurement↔Measurelands, Space↔Starpath,
Statistics↔Statistica, Algebra↔Algebra Realm, Probability↔Probability Realm.

## Level-aware curriculum-point calculation (already wired in)

The overall level is a **curriculum-point progression measure**. It counts the AC9
content descriptors reached at the student's measured level in each strand, adds
those reached points, then maps the sum back onto the F–6 progression. This is
deliberately level-aware: a mixed profile does not use one fixed F–6 coefficient
for all of the student's strand results.

Exact descriptor counts from ACARA's official machine-readable Mathematics
curriculum (2024/04 release, updated 7 June 2024):

| Strand | F | L1 | L2 | L3 | L4 | L5 | L6 | F–6 |
|---|--:|--:|--:|--:|--:|--:|--:|--:|
| Number | 6 | 6 | 6 | 7 | 9 | 10 | 9 | 53 |
| Measurement | 2 | 3 | 5 | 6 | 4 | 4 | 4 | 28 |
| Space | 2 | 2 | 2 | 2 | 3 | 3 | 3 | 17 |
| Statistics | 1 | 2 | 2 | 3 | 3 | 3 | 3 | 17 |
| Algebra | 1 | 2 | 3 | 3 | 2 | 2 | 3 | 16 |
| Probability | 0 | 0 | 0 | 2 | 2 | 2 | 2 | 8 |
| **Total** | **12** | **15** | **18** | **23** | **23** | **24** | **24** | **139** |

The F–6 totals still describe each strand's overall curriculum share:

| Strand | Points (F–6) | Weight |
|---|--:|--:|
| Number | 53 | 38% |
| Measurement | 28 | 20% |
| Space | 17 | 12% |
| Statistics | 17 | 12% |
| Algebra | 16 | 12% |
| Probability | 8 | 6% |
| **Total** | **139** | **100%** |

For a measured strand level `L + fraction`, reached points are all descriptors
below `L`, plus `fraction × descriptors at L`. The overall is the position of the
combined reached points on the cumulative whole-maths curve. Level 6 is the
primary reporting ceiling and represents the completed F–6 continuum.

Live in `lib/curriculum/ac-standards.ts` → `AC_DESCRIPTOR_COUNTS_BY_LEVEL` and
`AC_STRANDS`. Do not hard-code counts elsewhere.

Probability has zero curriculum points before Level 3 and must never be treated as
failed content at Foundation–Level 2. The official Whole-Maths score is still
withheld until all six formal strand outcomes are recorded, so missing evidence can
never masquerade as an official evaluation. AC9 Algebra does have content
from Foundation; until the dedicated Algebra realm begins at Level 3, its earlier
evidence must come from Algebra-coded questions in the Number realm.

## Cadence — 3 official Whole-Maths diagnostics a year

- **Start-of-year / Mid-year / End-of-year** are the official measurement windows.
  The same six-strand adaptive instrument is used so growth is comparable.
  - Start-of-year diagnostic = official baseline + initial placement.
  - Mid-year diagnostic = official progress checkpoint and live-score reset.
  - End-of-year diagnostic = official final achievement and growth evidence.
- A teacher can also trigger an **ad-hoc** diagnostic for a single student and/or a
  single strand. It recalibrates the live realm checkpoint but is not a fourth
  official school reporting point.
- Each sitting is persisted as an **immutable record** (checkpoint label, date, the
  per-strand measured levels, and the overall). These are the Start/Mid/End dots on
  the report.

The continuous weekly data (lessons, quizzes, post-tests) is **not** the diagnostic —
it is the live layer between sittings (see "Predicted level").

Do not call a realm's end-of-level assessment the “post diagnostic”. It is a
**realm post-test**: completing the scheduled pathway and sitting it updates the
live realm checkpoint. Passing at 85% confirms the next level; a lower result still
recalibrates the live score but does not promote the student's working level.

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

Canonical example (Number): **85% on Level 3 (mastered) → probe Level 4 → 60% on
Level 4 (instructional band) → working level becomes Level 4 and the recorded
diagnostic strand point is 4.44.** The next-level result contributes to the official
diagnostic calculation and establishes the new realm placement. If the student had
scored below 85% on the starting Level 3 probe, that result would still contribute
to the diagnostic point but their existing Level 3 realm placement would not change.

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

The live tracker implementation keeps three values separate:

- **Official level:** the latest completed Whole-Maths strand diagnostic only. It is
  nullable until a complete formal sitting exists; realm assessments never populate it.
- **Verified realm checkpoint:** the newest Whole-Maths strand result, realm pre-test
  or realm post-test. A teacher placement is labelled as an unmeasured fallback.
- **Working level:** the curriculum level currently assigned to the student. Normal
  post-test progression may advance it without rewriting the official measurement.
- **Predicted level:** the server-recomputed live estimate displayed beside the
  verified checkpoint.

Prediction v1 uses canonical evidence recorded after the verified checkpoint. A passed
weekly quiz (the existing 80% threshold) confirms one week of movement. Completed
lessons in an unconfirmed week contribute at most 0.4 of a week while its quiz is
pending. Evidence is deduplicated by realm + working level + week (+ lesson), so
repeating an activity cannot farm progression. When a quiz passes, its full-week
credit replaces rather than stacks with that week’s provisional lesson credit.

`student_live_maths_progression` is recomputed by database triggers after canonical
lesson, quiz, assessment, diagnostic or working-level changes. A realm pre/post-test
recalibrates `checkpoint_level`; practice evidence can change `predicted_level` and
confidence only; neither can update `official_level`.

Realm assessment recalibration uses the named `MASTERY = 85` and `FLOOR = 40`
thresholds. At 85%+, the next level boundary is confirmed (Level 3 → 4.00). From
40–84%, the score is placed proportionally within the tested level (a Level 2 result
of 60% → 2.44). Below 40%, the checkpoint may move below the tested level while the
student's assigned working level remains unchanged for support/review.
Predicted strand levels will use the same level-aware descriptor calculation for the
live overall after all six strands exist. Until then, the four available strand
predictions remain separate and the predicted Whole-Maths overall is `null`.

Evidence status is strict and separate from the maths:

- **Official overall:** calculate only when all six formal strand diagnostic tests
  in the sitting are complete. Otherwise store and display `null`.
- **Live overall:** calculate from all six current realm prediction/working levels,
  even if a new formal diagnostic sitting has not yet been completed. Label it
  “Live estimate”; it must never be shown or exported as the official result.
- A partial set of realm levels produces neither value. There is no denominator
  renormalisation and no imputation of an unmeasured strand.

Worked live-only example: a Year 3 student at Number 3, Algebra 3, Statistics 3,
Space 3, Probability 4 and Measurement 2 has reached 42 curriculum points. That
maps to a live progression point of 2.83 (display 2.8). It is not an official
diagnostic result unless those values came from all six completed formal strand
tests in the same sitting.

If that student later masters the Level 3 Number post-test at 85%, Number is
checkpointed at 4.00. If a subsequent Level 2 Measurement post-test scores 60%,
Measurement is checkpointed at 2.44 rather than advanced. With the other four realm
levels unchanged, the live whole-maths estimate recalculates to 3.27 (display 3.3).
The earlier optimistic lesson/quiz projection is replaced by the newer assessment
evidence; the official Whole-Maths diagnostic remains unchanged.

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

## Future state and territory curriculum crosswalks

Do **not** build jurisdiction-specific reporting until all six maths realms are
complete and the Australian Curriculum v9 Whole-Maths Diagnostic has been verified
end to end. AC9 remains the canonical question, scoring and placement framework.

After the six-strand AC9 release is stable, add state and territory curricula as a
versioned reporting layer:

`diagnostic question → AC9 descriptor → jurisdiction descriptor(s)`

This crosswalk must:

- cover NSW, Victoria, Queensland, Western Australia, South Australia, Tasmania,
  the ACT and the Northern Territory;
- reuse the existing questions and diagnostic scores rather than duplicate banks;
- support one-to-many, many-to-one and partial alignments instead of assuming every
  jurisdiction descriptor is a direct match;
- store the jurisdiction, curriculum version and effective dates so syllabus
  changes never rewrite historical reports;
- use authoritative jurisdiction curriculum sources and undergo curriculum review
  before release; and
- affect reporting only — jurisdiction mappings must not alter the adaptive rules,
  `MASTERY`, `FLOOR`, strand placement or the 139-point AC9 progression calculation.

Release order is therefore fixed:

1. Complete all six realm level-test banks.
2. Validate AC9 question links, adaptive measurement, placement and level-aware overall.
3. Release the six-strand AC9 Whole-Maths Diagnostic.
4. Build and validate the jurisdiction crosswalks.
5. Enable state/territory reporting based on each school’s selected curriculum.

## Acceptance criteria

- Overall recomputes from the level-aware descriptor matrix in
  `AC_DESCRIPTOR_COUNTS_BY_LEVEL`; every row and column reconciles to 139.
- Equal strand levels reproduce the same whole-maths level; advancing any one
  strand can never reduce the overall level.
- Probability contributes no curriculum points below Level 3, but all six formal
  strand outcomes are still required for an official score; early Algebra evidence
  is drawn from Algebra-coded Number-realm questions until its dedicated realm begins.
- A live overall may use six current realm estimates, but must remain visibly and
  structurally distinct from the official six-test diagnostic result.
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
