# Level 7 Number weekly lessons

This demo curriculum has 12 weeks, with three lessons each. Weeks 1–11 each end with a 15-question quiz; Week 12 ends with the existing Level 7 post-test. The supplied Australian Curriculum v9 Mathematics 7–10 document, Year 7 Number AC9M7N01–N09, is the content source. The canonical sequence is `data/activities/year7Number/curriculum.ts`; the quiz samples five questions from each of that week's three lessons.

Each lesson reuses the existing Number lesson home, active shell, nine-minute engine, HUD, read-aloud, feedback, coach, reflection, mistake review and resume system. An untimed skill guide comes before practice, with expandable worked reasoning and application examples. Each lesson randomly rotates fluency, reasoning and application questions; there is no ordered difficulty ladder. Reopening the guide pauses the practice timer. Level 7 uses the cave artwork and a Crystal Streak in the existing streak position. Streak thresholds and scoring are unchanged.

## Progression

Complete lessons in order, then take the weekly quiz. At least 12 out of 15 correct (80%) passes. Earlier lessons and quizzes must be complete before entering later weeks. These are the retained student progression rules. Demo mode bypasses prerequisites on both the cards and direct routes: all 12 weeks, 36 lessons and 11 quizzes are available immediately for review. Best passing quiz results remain available for progression after a later retry. Week 12 has no weekly quiz; it uses the existing Level 7 post-test and its unchanged 85% requirement.

## Teacher planning and reporting

Teacher Dashboard → Curriculum → Y7 → Number displays the canonical 36 lessons. Download Schedule exports the scope and sequence, including all 11 quizzes and the Week 12 post-test, curriculum codes, learning intentions and worked examples. The same download is linked from the demo week page. All demo and teacher lesson previews bypass learning locks for review; reviewing a lesson does not mark it completed.

The implementation reuses the shared lesson/session routes and their existing summary shapes, student session saving functions, live-class events, quiz results and teacher curriculum lookup. It does not introduce an alternative student progress store or a new RPC. Live student access remains disabled: authenticated demo routes are required, public Year 7 lesson/session routes are blocked, and demo attempts never write to real student records. Live student-to-teacher reporting is not claimed as runtime verified by this demo release; that requires student release and actual-session verification before widening access.

## Validation

`node scripts/number7-lessons-test.mjs` independently checks 21,600 generated practice questions, distractors, 36 guides, all 165 quiz items, exact 80% student boundaries, demo access and protected routes. Every quiz has five questions per lesson: two fluency, one reasoning and two application. Week 5 reuses the shared fraction number-line visual and includes diagram narration. `node scripts/generate-number7-scope.mjs --check` verifies the 48-row downloadable scope and sequence, including worked reasoning/application examples. Existing release checks and TypeScript/lint apply as well. Question difficulty is authored, not statistically calibrated.
