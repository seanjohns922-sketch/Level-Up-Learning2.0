# Space Level 7 — demo curriculum

30 lessons over 10 weeks, with an untimed opening skill guide and randomly
rotated fluency, reasoning and application questions. Nine weekly quizzes
contain 15 distinct questions each: five per lesson (two fluency, one reasoning,
two application). Week 10 ends with the existing Level 7 post-test.

Source: the supplied `mathematics-curriculum-content-7-10-v9.docx`, Year 7 Space
AC9M7SP01–04, cross-checked with `level7StarpathFiveForms.ts` and its existing
pre/post-test blueprint. Existing assessment questions and marking are unchanged.

- Weeks 1–3: nets, opposite faces, plans/elevations, hidden cubes and representation limitations (SP01).
- Weeks 4–5: triangle and polygon properties, triangle inequality, overlapping quadrilateral families, regularity and concavity (SP02).
- Weeks 6–8: translations, reflections, rotations about a specified centre, and composition/order (SP03).
- Weeks 9–10: trace, complete, debug and justify classification algorithms; counterexamples and classification after transformations (SP04).

The teacher curriculum explorer and demo week page provide the scope-and-sequence
CSV. Guides reuse controlled Starpath net, cube-model, polygon, coordinate-plane
and flowchart renderers. Diagrams and answer choices have shared read-aloud controls.
Untimed explorations let learners construct cube nets, edit cube models, place
transformed vertices and complete classification decisions. The 30 lessons retain
all 36 original skill groups, with related skills combined rather than omitted.
Reopening the guide pauses the practice timer. The normal lesson HUD, feedback,
resume, scoring and result-review components are reused.

## Access and progress

Open Demo Review → Space/Starpath → Level 7. All 30 lessons and 9 quizzes are
unlocked for review through server-authorised cavern routes. Public Level 7
lesson and program URLs remain gated. No live student release or RPC changes.
The shared progression helper requires all three lessons and at least 12/15
before the next week; demo access intentionally bypasses those completion gates.
Week 10 uses the existing post-test and its 85% requirement.

Practice and quiz completion use realm-specific progress keys. Demo quiz results
stay local and do not create student records. `review=1` does not mark completion.
The existing quiz reporting structure retains per-lesson skill/code attribution,
answers, feedback, replay snapshots and duration. A live release still requires
an actual student-session end-to-end check; this demo build does not claim one.

## Verification

- `node scripts/space7-lessons-test.mjs`: 18,000 generated variants, independent
  coordinate/numeric calculations, 135 quiz items, quiz balance, uniqueness,
  and coverage of all 36 original skill groups.
- `node scripts/cave7-access-test.mjs`: authenticated routes, tampered links,
  realm-specific week bounds, exact 80% gates and realm isolation.
- `node scripts/generate-space7-scope.mjs --check`: 30 lesson rows, 9 quiz rows,
  existing Week 10 post-test row.
- Number and Measurement lesson regression scripts, TypeScript and prebuild QA.
- Rendered SVG inspection of reused diagram configurations. Browser control was
  unavailable in this session, so a full interactive walkthrough is not claimed.
