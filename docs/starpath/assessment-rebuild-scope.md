# Starpath assessment rebuild scope

Updated 14 September 2026 following the curriculum review and the product decision to provide a pre-test at every supported level.

## Confirmed product direction

Every supported level should have an entry pre-test and a later post-test so educators can compare a student's starting evidence with subsequent achievement. This includes Ground/Foundation. School year and working level must remain separate: a Prep student can have a Ground Space baseline and a later Ground Space result.

Starpath is the first implementation scope. Repair its assessment validity gaps and add the missing Ground pre-test before extending missing entry tests to other realms. Existing pre-tests in other realms are not removed or redesigned by this scope.

This decision supersedes the older Ground post-test-only assumption in the Starpath blueprint. The Ground pre-test is now implemented locally; database rollout is pending.

## Comparable pre/post evidence

- Each Starpath level, Ground through Level 6, has two independently authored forms measuring the same curriculum descriptors at comparable cognitive demand.
- Pre is baseline evidence. Post is follow-up evidence. Do not intentionally make post substantially harder and then interpret the percentage difference as directly comparable growth.
- Use different examples, arrangements, diagrams and answer orders, while retaining equivalent breadth and response demands. Cosmetic changes to identical tasks are insufficient.
- Preserve neutral read-aloud and accessible visual interaction; do not include answer-bearing narration, target-position previews or incorrect-answer highlights during an independent assessment.
- Keep level, realm, form, bank version, raw score, maximum score, percentage, timestamps and item-level evidence attached to the saved attempt. Do not overwrite an original attempt when a later assessment is taken.
- Growth reporting must pair an entry baseline with a subsequent post-test for the same student, realm and working level. A later pre-test must not silently replace the original baseline for an earlier learning cycle. Incompatible bank revisions must not be presented as directly equivalent growth without qualification.
- Show pre score, post score, percentage-point change and elapsed time, plus descriptor-level evidence where available. A rise from 40% to 88% is +48 percentage points. With the current 20 equally weighted questions, percentages occur in 5-point increments; the product must not manufacture precision to reproduce an illustrative 88% score.
- The user's 12-week example illustrates elapsed time. It does not authorise changing Starpath's existing eight-week curriculum structure or imposing a fixed 12-week retest date.
- A missing historical baseline remains missing. Never infer or backfill a pre-test result from later activity.

## Ground entry behaviour

The purpose of adding Ground pre-testing is to collect baseline evidence. Baseline-only progression is implemented: record the score, then begin all eight Ground weeks. Do not treat this document as authorisation to change existing higher-level placement rules.

## Validity work carried forward

Use [the 14 September review](assessment-curriculum-review-2026-09-14.md) and [the full item inventory](assessment-item-inventory-2026-09-14.md) as the evidence register.

1. Repair square construction validation, ambiguous location scoring and transformation questions with multiple visually valid answers.
2. Remove assessment answer cues from symmetry, cross-sections and read-aloud while preserving appropriate tools in lessons.
3. Improve Ground and Levels 1–2 property/creation evidence and form independence.
4. Replace excessive repeated maps in Level 3 with broader object-making, feature-to-use explanation and map interpretation/creation.
5. Add authentic composite construction to Level 4 and independent symmetry tasks.
6. Broaden Level 5 nets beyond cubes, assess coordinate-system construction and complete-shape transformations, and correct response-mode metadata.
7. Create distinct Level 6 forms with cross-section reasoning, Cartesian movement and actual transformation/tessellation construction.
8. Pilot and calibrate the forms before interpreting the existing 85% threshold as a reliable mastery classification. Do not raise the threshold merely to counteract easy questions.

## Original integration findings (before implementation)

- `data/assessments/api.ts`: Ground Space pre-test currently resolves to an empty list.
- `data/starpath/program-registry.ts`: Ground currently declares `preTest: null`.
- `app/pretest/page.tsx`: Prep currently redirects away; standard completion logic can advance a passing student to another level, which must be considered separately from a baseline-only Ground test.
- `lib/realm-entry.ts`: Ground currently bypasses the Starpath pre-test route.
- `lib/starpath-placement.ts`: Ground pre-test placement commands are currently rejected.
- `lib/realm-progress-compat.ts` and teacher-placement RPCs: Ground entry has special handling that must be checked before enabling the route end to end.
- `lib/student-progress-sync.ts`: existing canonical save accepts a working-level string and a pretest/posttest type; inspect deployed database validation before assuming Ground requires no migration.
- `supabase/migrations/20260826150000_school_analytics_assessment_bands.sql`: current growth pairing uses latest pre/post evidence and needs review for chronological learning-cycle pairing.
- `lib/whole-maths-diagnostic-questions.ts`: the planned Space diagnostic consumes these same banks; test the revised resolver and ensure independent forms remain comparable.

## Completion evidence required

Verify Ground entry, interrupted pre-test resume, save/retry behaviour, persistence of both attempts, chosen progression behaviour, correctly ordered growth pairing, bank-version reporting, and isolation from other realms. Validate mathematical scoring with correct alternative constructions and plausible incorrect responses. Review rendered assessment tasks for answer leakage and curriculum demand, then run the relevant audits, TypeScript and production build.

## Implementation completed locally

- Ground now has separate pre/post forms (20 items each), including independent triangle/square creation. Foundation aliases resolve to the Ground pre-test.
- New entry routing, teacher placement choices, baseline-only completion and result-page messaging are connected. Ground high scores never advance placement automatically.
- Polygon scoring checks real square/rectangle/parallel-side properties, rejects self-intersections and permits valid alternative constructions. Turned-square items also require oblique sides. Ground positional scoring accepts valid alternate layouts and either side for “beside”.
- Symmetry ghosts, repair highlights, rotation-answer badges and folding/slicing previews are disabled during independent tests. Read-aloud retains task instructions without lesson strategies.
- Two Level 3 repeated map tasks per form are replaced by object models and feature-to-purpose explanations (10 object / 10 map items). Post maps change orientation and spatial relationships.
- Level 4 includes actual composite tiling; Level 5 includes prism/pyramid nets, cube-net construction, coordinate-system labelling and complete-shape transformations; Level 6 includes distinct cross-section contexts, signed multi-vertex movement, ordered transformations and actual tessellating patches.
- The 30 new construction interactions retain the student's submitted geometry/model as replay evidence. Existing tasks retain their existing response contract. Replay snapshots now retain question versions.
- Ground banks use version 2; Levels 1–6 use version 4. Both forms at each level share the same intended demand profile. Difficulty labels remain uncalibrated predictions.
- Teacher and student result views pair the original baseline with a later post-test, require matching Space comparison groups, and report percentage-point change. Teacher view includes both dates; comparisons include elapsed days.
- The reset-pretest RPC preserves Space assessment history. Interrupted Space pre-tests resume only against matching question IDs; an obsolete draft cannot be scored against a replacement bank.

## Deployment and verification

Apply these migrations before deploying the app changes:

1. `supabase/migrations/20260914160000_starpath_ground_baseline.sql` — enable Ground pre-testing, update the placement constraint, enforce baseline-only progression server-side and preserve Space baseline history on teacher reset.
2. `supabase/migrations/20260914161000_starpath_comparable_growth.sql` — chronological original-baseline pairing in school analytics, with Space version compatibility.

Neither migration has been applied by this implementation session. Existing learners are not automatically reset and historical baselines are not backfilled. A teacher can deliberately request a pre-test where needed; its date is the actual assessment date.

`qa:starpath-rebuild` checks all 280 live items, valid and invalid geometry, actual tiling solvability, alternative Ground placements, response evidence, original-baseline pairing, chronology and version compatibility. Existing Ground/Levels 1–6 audits, blueprint, classification and release checks are included in validation. Seven rendered examples were checked for readable layout and absence of answer-bearing symmetry/slicing controls.

Local verification passed on 14 September 2026: the rebuild and level-bank audits, weekly shape-quiz compatibility checks, TypeScript, production build (including its prebuild release checks), and `git diff --check`.

A live database save/restore smoke test is still required after migrations are applied. Do not describe local mathematical tests as production persistence verification. Pilot the revised forms before claiming calibrated difficulty or measured pre/post equivalence; the 85% threshold is unchanged.

Follow-up integration verification: [109 isolated PostgreSQL checks passed](database-integration-verification-2026-09-14.md), covering real SQL saves/reloads, duplicate retries, rollback, existing-record preservation, full analytics and higher-level completion parity across six realms. The reporting change is now restricted to Space; other realms retain their prior growth calculation. Production verification remains blocked because the configured database password was rejected. The fixture does not establish production RLS or deployed-schema parity.

Latest status: database access is restored. Both migrations are verified live, and the older reporting definition was corrected to preserve other realms. Seven live rollback-only student-session save/read checks passed with zero synthetic accounts or receipts remaining. See the verification follow-up for the precise coverage and remaining browser/committed-session limits.
