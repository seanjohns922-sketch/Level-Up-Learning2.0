# Level 7 Number weekly lessons

This demo curriculum has 12 weeks, with three lessons and a 15-question quiz in every week, including Week 12. The supplied Australian Curriculum v9 Mathematics 7–10 document, Year 7 Number AC9M7N01–N09, is the content source. The canonical sequence is `data/activities/year7Number/curriculum.ts`; the quiz samples five questions from each of that week's three lessons.

Each lesson reuses the existing Number lesson home, active shell, nine-minute engine, HUD, read-aloud, feedback, coach, reflection, mistake review and resume system. An untimed skill guide comes before practice. Reopening the guide pauses the practice timer. Level 7 uses the cave artwork and a Crystal Streak in the existing streak position. Streak thresholds and scoring are unchanged.

## Progression

Complete lessons in order, then take the weekly quiz. At least 12 out of 15 correct (80%) passes. Earlier lessons and quizzes must be complete before entering later weeks. The cards and direct lesson/quiz routes check the same demo progress. Best passing quiz results remain available for progression after a later retry. Week 12 has a quiz; the Level 7 post-test remains separate and keeps the existing 85% requirement.

## Teacher planning and reporting

Teacher Dashboard → Curriculum → Y7 → Number displays the canonical 36 lessons. Download Schedule exports the scope and sequence, including all 12 quizzes, curriculum codes, learning intentions and worked examples. The same download is linked from the demo week page. Teacher lesson previews explicitly bypass demo learning locks for review; reviewing a lesson does not mark it completed.

The implementation reuses the shared lesson/session routes and their existing summary shapes, student session saving functions, live-class events, quiz results and teacher curriculum lookup. It does not introduce an alternative student progress store or a new RPC. Live student access remains disabled: authenticated demo routes are required, public Year 7 lesson/session routes are blocked, and demo attempts never write to real student records. Live student-to-teacher reporting is not claimed as runtime verified by this demo release; that requires student release and actual-session verification before widening access.

## Validation

`node scripts/number7-lessons-test.mjs` independently calculates answers from generated prompts and checks distractors, 36 guides, all 180 quiz items, exact 80% boundaries, direct-access prerequisites, no skipped weeks, and the 48-row export. Existing release checks and TypeScript/lint apply as well. Question difficulty is authored, not statistically calibrated.
