# Space Level 7 — demo curriculum

36 lessons over 12 weeks, with an untimed opening skill guide and randomly
rotated fluency, reasoning and application questions. Eleven weekly quizzes
contain 15 distinct questions each: five per lesson (two fluency, one reasoning,
two application). Week 12 ends with the existing Level 7 post-test.

Source: the supplied `mathematics-curriculum-content-7-10-v9.docx`, Year 7 Space
AC9M7SP01–04, cross-checked with `level7StarpathFiveForms.ts` and its existing
pre/post-test blueprint. Existing assessment questions and marking are unchanged.

- Weeks 1–3: nets, opposite faces, plans/elevations, hidden cubes and representation limitations (SP01).
- Weeks 4–6: triangle and polygon properties, triangle inequality, overlapping quadrilateral families, regularity and concavity (SP02).
- Weeks 7–9: translations, reflections, rotations about a specified centre, and composition/order (SP03).
- Weeks 10–12: trace, complete, debug and justify classification algorithms; counterexamples and classification after transformations (SP04).

The teacher curriculum explorer and demo week page provide the scope-and-sequence
CSV. Guides reuse controlled Starpath net, cube-model, polygon, coordinate-plane
and flowchart renderers. Diagrams and answer choices have shared read-aloud controls.
Reopening the guide pauses the practice timer. The normal lesson HUD, feedback,
resume, scoring and result-review components are reused.

## Access and progress

Open Demo Review → Space/Starpath → Level 7. All 36 lessons and 11 quizzes are
unlocked for review through server-authorised cavern routes. Public Level 7
lesson and program URLs remain gated. No live student release or RPC changes.
The shared progression helper requires all three lessons and at least 12/15
before the next week; demo access intentionally bypasses those completion gates.
Week 12 uses the existing post-test and its 85% requirement.

Practice and quiz completion use realm-specific progress keys. Demo quiz results
stay local and do not create student records. `review=1` does not mark completion.
The existing quiz reporting structure retains per-lesson skill/code attribution,
answers, feedback, replay snapshots and duration. A live release still requires
an actual student-session end-to-end check; this demo build does not claim one.

## Verification

- `node scripts/space7-lessons-test.mjs`: 21,600 generated variants, independent
  coordinate/numeric calculations, 165 quiz items, quiz balance, uniqueness,
  authenticated routes, tampered links, exact 80% gates and realm isolation.
- `node scripts/generate-space7-scope.mjs --check`: 36 lesson rows, 11 quiz rows,
  existing Week 12 post-test row.
- Number and Measurement lesson regression scripts, TypeScript and prebuild QA.
- Rendered SVG inspection of reused diagram configurations. Browser control was
  unavailable in this session, so a full interactive walkthrough is not claimed.
