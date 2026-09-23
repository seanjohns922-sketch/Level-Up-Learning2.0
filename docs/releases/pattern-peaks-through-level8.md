# Pattern Peaks live assessments, Levels 3–8

The approved 30 forms (700 questions) are frozen in `pattern-v1.json`. Levels 3–6 contain 20 questions per form and Levels 7–8 contain 30. Levels below 3 remain outside Pattern Peaks.

Pre-tests, post-tests and new Start/Mid/End diagnostic cycles use the approved questions and shared question card, including guided Year 7 formula comparisons and Year 8 graph investigations. Responses are bound to the question ID and scored from structured evidence. Teacher replay retains the original visual, response and scorer version.

Existing drafts and pre/post comparison groups retain their legacy bank. Diagnostic cycles are pinned by academic year. New cycles use release 1; already-started cycles keep their existing version. Level 7–8 extension assessments save evidence without assigning a nonexistent weekly programme. Their entry links appear for students at Pattern Level 6 or above.

Deploy the web support before applying migration `20260923210000_pattern_peaks_full_release.sql`. The client falls back to the previous diagnostic RPC while the migration is pending. The migration preserves student session authorization and explicitly grants the new endpoints to anon/authenticated. It extends Algebra diagnostic counts and bounds through Level 8, preserves bank pinning, and adds the extension completion endpoint.

Checks: 700 released question responses and malformed-response rejection; all six curriculum-level forms; live selection, structured snapshots and legacy selection; TypeScript, lint, full prebuild suite; browser navigation/reload/completion; transactional database tests under anon with validated student-session headers, missing/cross-student rejection, Levels 3–8 saving, duplicate submission handling and existing-realm diagnostic regression. Database fixtures are rolled back.

Weekly Level 7–8 lessons remain future work. This release does not mark them complete or change Chance Hollow.
