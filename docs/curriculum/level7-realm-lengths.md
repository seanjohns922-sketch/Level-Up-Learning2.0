# Level 7 cave lessons — demo release

The supplied mathematics-curriculum-content-7-10-v9.docx and existing Level 7
pre/post-test blueprints guide the scope and difficulty. Lesson counts follow the
content of each strand. Number and Measurement retain their existing lengths.

| Realm | Weeks | Lessons | Weekly quizzes | Final assessment |
| --- | ---: | ---: | ---: | --- |
| Number Nexus | 12 | 36 | 11 | Existing post-test, week 12 |
| Measurelands | 12 | 36 | 11 | Existing post-test, week 12 |
| Starpath / Space | 10 | 30 | 9 | Existing post-test, week 10 |
| Pattern Peaks / Algebra | 12 | 36 | 11 | Existing post-test, week 12 |
| Statistica | 10 | 30 | 9 | Existing post-test, week 10 |
| Chance Hollow / Probability | 8 | 24 | 7 | Existing post-test, week 8 |

Every week has three lessons. Each weekly quiz contains fifteen distinct questions,
five from each lesson: two fluency, one reasoning and two application. Normal
progression requires the three lessons and at least 12/15; demo reviewers can open
every lesson and quiz without completing earlier weeks. The final week has the
existing post-test, retaining its 85% threshold, rather than a weekly quiz.

## Curriculum coverage

- Algebra AC9M7A01–06: variables and substitution, expressions and brackets,
  linear equations and checking solutions, interpreting graphs, growing patterns,
  functions and tables, plotting, and systematic digital formula investigations.
- Statistics AC9M7ST01–03: numerical data and collection rules, centre and spread,
  outliers, ordered stem-and-leaf and dot plots, distribution comparisons,
  planning investigations, analysing observations and reporting limitations.
- Probability AC9M7P01–02: single-stage sample spaces and events, equal and unequal
  likelihood, probabilities and predicted frequencies, actual versus expected
  results, digital simulations, larger trials and investigation design.
- Space AC9M7SP01–04: representations of solids, shape properties and families,
  transformations and classification algorithms. All original skill groups remain.

Opening skill guides provide worked examples and an untimed exploration. Learners
can reopen guides during practice, pausing the practice timer. Shared lesson UI,
realm colours, cave backgrounds, crystal streaks and read-aloud are retained.
Explorations include graph construction, formula tables, statistical plot
construction and genuine random probability trials.

Teacher curriculum previews and downloadable scope-and-sequence CSVs use the same
lesson definitions. The generic lesson and quiz reporting context retains realm,
level, week, lesson, curriculum codes, answers, timing and replay snapshots.
Demo results remain local; they do not create real student records.

## Access and verification

This is a demo-only release through server-authorised cavern routes. Public Level 7
lesson/program routes remain gated. No assessment content or student RPC changes.
An actual student-session reporting walkthrough remains necessary before a live
student release; preserving the shared reporting contract is not that walkthrough.

- cave7-content-test: 54,000 variants plus 405 balanced quiz items, independent
  numeric calculations, equivalent-answer rejection and distinct question checks.
- space7-lessons-test: 18,000 variants plus 135 quiz items and original-skill coverage.
- cave7-access-test: all 192 lessons and 58 quizzes across six realms, authenticated
  access, tampered URLs, week limits, post-test routing and exact 80% boundaries.
- Existing Number and Measurement question regressions and the full prebuild QA suite.
- TypeScript, scoped ESLint, 120 server-rendered guides and controlled SVG inspection.

Full browser interaction was unavailable in this session; no full visual walkthrough
or live student-to-teacher dashboard test is claimed.
