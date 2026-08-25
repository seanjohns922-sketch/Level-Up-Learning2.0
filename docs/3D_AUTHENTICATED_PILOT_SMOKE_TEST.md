# Authenticated 2D/3D Pilot Smoke Test

Run this checklist with one existing real test student. Do not edit, reset, seed,
backfill, or override that student's learning data to reach a prerequisite.
If the student is not naturally in the required state, mark that test `BLOCKED`
and continue it when the canonical pathway reaches that state.

## Release Preconditions

- [ ] Use the release candidate that passed the automated release/parity suite.
- [ ] Confirm `NEXT_PUBLIC_REALM_3D_DEFAULT` is not `1` (production default stays 2D).
- [ ] Confirm the existing test student is already covered by the controlled-pilot
      access policy. Do not widen school, class, or student allowlists for this test.
- [ ] Confirm a normal, non-allowlisted account still enters the existing 2D flow.
- [ ] Use one student ID for every test below. Never substitute a demo identity.
- [ ] Choose one live realm (`number`, `measurement`, or `space`) and record it.
- [ ] Keep the teacher Student Insights view available as a read-only cross-check.

## Canonical Snapshot

Capture a snapshot before and after every numbered test. Use the teacher/parent
views or read-only database inspection. Do not use telemetry as proof of progress.

| Field | Value to record |
| --- | --- |
| Snapshot ID and timestamp | `S__` / local time |
| Student ID | Stable UUID or test identifier |
| Realm | `number`, `measurement`, or `space` |
| Working level | Canonical `working_level` |
| Placement complete | Canonical `placement_complete` |
| Pathway/status | Canonical `status` |
| Current week | Canonical `current_week` |
| Required weeks | Canonical `required_weeks`, in order |
| Teacher overrides | Existing override IDs only; expect no change |
| Lesson evidence | Latest rows/count in `student_lesson_attempts` for realm/level/week/lesson |
| Quiz evidence | Latest rows/count and best score in `student_weekly_quiz_attempts` |
| Assessment evidence | Latest rows/count in `student_realm_assessments` |
| Global XP | Authoritative wallet total |
| Rewards | Relevant immutable receipt/unlock IDs |
| 2D next destination | Route and activity shown by Continue Learning |
| 3D next destination | Current Mission plus gate/portal state |

Every snapshot must satisfy these invariants:

- The 2D and 3D surfaces resolve the same realm, level, required pathway, and next
  activity from the same canonical state.
- 3D creates no independent progress, attempt, XP, reward, or assessment record.
- Repeating navigation, refresh, Back, or focus creates no completion evidence.
- A completion creates at most one reward receipt even when a retake attempt is
  legitimately recorded.

## Test Sequence

### 1. Baseline And Default Routing

**Before: S01** - Record the complete canonical snapshot. No page is open.

- [ ] Sign in as the test student through the normal login.
- [ ] Confirm the normal entry remains 2D unless the student deliberately selects
      the controlled 3D option.
- [ ] Open 2D Continue Learning and record its exact destination without starting.
- [ ] Open 3D and record Current Mission and the corresponding gate state.

**After: S02** - Expect every canonical field, attempt count, XP total, and reward
receipt to equal S01. Expect the 2D destination and 3D mission to identify the same
next activity.

### 2. Complete One Lesson From 2D

**Before: S03** - Identify current required week `W`, next incomplete lesson `L1`,
its lesson-attempt count `A`, XP `X`, and reward receipt absence/presence `R`.

- [ ] Enter `L1` from the 2D week/program screen.
- [ ] Complete it normally and wait for the saved/completed result.
- [ ] Enter or refocus 3D without manually changing progress.

**After: S04** - Expect one new completed `L1` attempt (`A + 1`), canonical lesson
completion for `L1`, the defined one-time XP/reward effect if this was the first
completion, and no duplicate receipt. Expect 3D to show `L1` complete and advance
Current Mission to the canonical next activity. Required weeks and overrides must
equal S03.

### 3. Complete The Next Lesson Through 3D

**Before: S05** - Record the next incomplete lesson `L2`, attempt count `B`, XP,
receipt state, 3D district/spawn, and the matching 2D destination.

- [ ] Walk to the canonical 3D district/week gate and enter it.
- [ ] Confirm the real existing 2D week screen opens, then start `L2`.
- [ ] Complete `L2` and use its normal completion/return action.
- [ ] Confirm return to the originating 3D district/spawn, not a generic map.
- [ ] Open the 2D program screen.

**After: S06** - Expect one new completed `L2` attempt (`B + 1`), one-time reward
semantics, refreshed 3D gate/mission state, and the same completion visible in 2D.
Expect no 3D-owned record and no change to placement, required weeks, or overrides.

### 4. Browser Back Without Completion

**Before: S07** - Record all attempt counts, XP, rewards, route, return context, and
current mission. Choose an incomplete lesson but do not submit its final answer.

- [ ] Enter the lesson from 3D, then use browser Back before completion.
- [ ] Use browser Forward once, then Back again.
- [ ] Return to 3D using the visible navigation if necessary.

**After: S08** - Expect all canonical values and attempt counts to equal S07.
Expect no XP/reward, no false completion, and a usable return to the same district.

### 5. Refresh And Interrupted Session

**Before: S09** - Record the current incomplete activity, attempt counts, canonical
mission, return district, and XP.

- [ ] Refresh while standing in 3D; confirm the world restores server state.
- [ ] Start the activity, answer at least one item, and refresh once.
- [ ] Follow the product's normal resume/restart behavior without editing storage.
- [ ] Close the tab, reopen the app, sign in again, and return to 3D.

**After: S10** - Before actual completion, expect canonical completion, XP, rewards,
and completed-attempt counts to equal S09. Expect the documented resume/restart
state, canonical Current Mission, and correct district after reopen. If the activity
was subsequently completed, capture a separate S10b and expect exactly one normal
completion transition.

### 6. Weekly Quiz And Return

**Before: S11** - Run only when all three lessons in required week `W` are
canonically complete and its quiz is incomplete. Record quiz attempt count `Q`, best
score, XP, rewards, Current Mission, and district/spawn.

- [ ] Enter the weekly quiz from its 3D gate.
- [ ] Complete all 15 questions and submit once.
- [ ] Use the normal result return.
- [ ] Refresh 3D, then check the 2D week screen.

**After: S12** - Expect one new quiz attempt (`Q + 1`), persisted score/best-score
rules, quiz-complete state, one-time reward semantics, and return to the originating
3D district. Expect both 2D and 3D to resolve the same next required week/activity.

### 7. Targeted Pathway Integrity

**Before: S13** - Run only if this student already has a canonical targeted pathway.
Record the exact ordered `required_weeks`, current week, completed required weeks,
unassigned weeks, override IDs, and next activity.

- [ ] Compare the 2D level/week view with every 3D district/week gate.
- [ ] Enter the current required week from 3D and return without completion.
- [ ] Try only the UI offered for an unassigned/locked week; do not bypass routing.
- [ ] Complete the next naturally assigned activity if one is available.

**After: S14** - Expect required-week order and overrides to equal S13. Unassigned
locked activities must not become writable through 3D. If an assigned activity was
completed, expect only its normal attempt/progress transition and the next resolver
destination from the same targeted pathway.

### 8. Post-Test

**Before: S15** - Run only when all canonical required work is complete and both 2D
Continue Learning and 3D Current Mission resolve to the post-test. Record assessment
count `P`, status, working level, current week, XP, rewards, and return context.

- [ ] Launch the post-test through 3D Quick Start or Current Mission.
- [ ] Complete and submit it once; record the actual score and pass/fail outcome.
- [ ] Use the results return, then inspect 3D and 2D.

**After: S16** - Expect one new post-test assessment (`P + 1`) with the actual score.
Expect canonical status/level progression to follow the real pass/fail rule, not an
assumed pass. Expect one-time rewards only when eligible, exact 3D return context,
and matching next destinations in 2D and 3D. Required weeks and historical attempts
must not be rewritten.

### 9. Two Tabs

**Before: S17** - Open tab A in 2D and tab B in 3D. Record canonical state, both
destinations, attempt counts, XP, and rewards.

- [ ] Complete the next natural activity in tab A.
- [ ] Focus tab B without reloading; wait for its canonical focus restore.
- [ ] Refresh tab B once, then compare tab A after refresh.

**After: S18** - Expect one completion transition, both tabs showing the same server
state, no stale gate after focus/refresh, and no duplicate attempt/reward caused by
having two tabs open.

### 10. Two Devices

**Before: S19** - Sign into device A and device B as the same test student. Record
the canonical snapshot and matching destinations on both.

- [ ] Complete the next natural activity on device A.
- [ ] On device B, focus the existing 3D tab, then refresh if needed.
- [ ] Close and reopen device B and sign in again.

**After: S20** - Expect one server completion transition and identical canonical
state on both devices after restore. Expect no device-specific 3D progress, no
duplicate reward, and the same next activity after device B reopens.

### 11. Chromebook

**Before: S21** - Record canonical state and device/browser model. No learning action
is required for this performance test.

- [ ] Use keyboard movement, camera, district entry, return, Quick Start, refresh,
      tab background/foreground, and full-screen exit for at least five minutes.
- [ ] Record FPS from the realm metrics/available diagnostics and note the lowest
      sustained value, input delay, crash, WebGL reset, and visible asset failures.

**After: S22** - Expect canonical state to equal S21 unless a real activity was
deliberately completed. Acceptance: sustained gameplay at or above 30 FPS, controls
remain usable, no crash/context loss, and 2D fallback remains available.

### 12. iPad

**Before: S23** - Record canonical state, iPad model, iPadOS, Safari version, and
orientation.

- [ ] Test touch movement/camera, portrait-to-landscape rotation, district entry,
      lesson return, refresh, tab background/foreground, and full-screen exit for at
      least five minutes.
- [ ] Record lowest sustained FPS, touch failures, reloads, memory warnings, WebGL
      resets, and overlap/clipping.

**After: S24** - Expect canonical state to equal S23 unless a real activity was
deliberately completed. Acceptance: sustained gameplay at or above 30 FPS, no lost
touch controls, no crash/context loss, legible HUD, and working 2D fallback.

## Final Cross-Check

- [ ] S01-S24 all use the same student ID.
- [ ] Every completed lesson, quiz, and assessment has canonical server evidence.
- [ ] Every non-completion navigation test left canonical state unchanged.
- [ ] 2D and 3D agree after each focus, refresh, reopen, tab, and device boundary.
- [ ] XP and reward receipts are idempotent; attempts remain historically intact.
- [ ] Targeted `required_weeks` and existing overrides were never changed by 3D.
- [ ] Chromebook and iPad each sustain at least 30 FPS without a crash.
- [ ] Record the release candidate SHA/build identifier with the completed sheet.

Any mismatch, unexplained write, duplicate reward, stale cross-device state, broken
fallback, or device crash is a pilot blocker. Preserve the before/after evidence and
investigate the cause; do not repair the student's data merely to mark the test pass.
