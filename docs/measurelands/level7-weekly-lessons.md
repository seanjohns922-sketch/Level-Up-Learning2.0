# Measurement Level 7 weekly lessons

Source: the supplied Australian Curriculum v9 Mathematics 7–10 document, Year 7 Measurement AC9M7M01–M06, cross-checked against the existing Level 7 Measurement pre/post-test blueprint. Assessment questions and post-test content are unchanged.

The sequence has 12 weeks with three lessons per week. Weeks 1–2 cover triangle/parallelogram area; 3–4 prism volume and capacity; 5–6 circles and pi; 7–8 parallel-line angles; 9–10 triangle/polygon angle sums; 11–12 ratio modelling. Weeks 1–11 finish with 15 questions, five from each lesson (two fluency, one reasoning, two application). Week 12 links to the existing post-test, retaining its 85% requirement.

Each lesson begins with an untimed skill guide, a worked example, three explanation steps, a common misconception, and expandable reasoning/application examples. Read-aloud controls cover the explanations and diagrams. Reopening the guide pauses the nine-minute practice timer. Practice randomly rotates the three activity roles.

The existing lesson engine, feedback, hint, HUD, resume, completion summaries, quiz scoring and reporting shapes are reused. Existing Measurement geometry renderers and the volume builder's projection supply diagrams, with Measurement cave artwork and amber/purple lesson colours. Scoring and streak thresholds are unchanged.

Demo review exposes all 36 lessons, 11 quizzes and the existing post-test without prerequisites. Shared lesson and quiz routes require an authenticated demo session and validated realm/week/lesson parameters; adding teacher_preview to a public route cannot grant access. Student progression retains ordered lessons and at least 12/15 per weekly quiz, with progress isolated by realm. No RPC, migration or live-student access changes are included. Live student-to-teacher reporting requires actual-session verification before release; demo activity does not write student records.

Teacher Curriculum → Year 7 → Measurement lists the sequence. The teacher download and cave week page both use `public/curriculum/measurement-level7-scope-and-sequence.csv`, including all lessons, quiz composition, worked examples, curriculum codes and the Week 12 post-test.

Validation: `node scripts/measurement7-lessons-test.mjs` checks 21,600 generated practice variants, 165 quiz items, guide coverage, distinct answers, the five-per-lesson split, realm-isolated exact 80% progression, demo access and 23 protected routes. `node scripts/generate-measurement7-scope.mjs --check` validates the export. The Number Level 7 suite protects existing behaviour. Difficulty is curriculum-aligned and authored, not statistically calibrated.
