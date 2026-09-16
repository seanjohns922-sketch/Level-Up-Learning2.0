# Ground Starpath diagnostic integration

Ground has five 20-question forms (100 questions): Pre-Test, Post-Test, Start, Mid and End. The checkpoints use independent v3 IDs; the existing pre/post IDs stay unchanged.

The review menu exposes all three Ground checkpoints. Student diagnostics render the native lesson interactions, record answer evidence, resume saved responses and support Ground-to-Level-1 probing. New Ground assignments retain Ground rather than being clamped to Level 1. Higher working levels and protected placements are preserved.

Deploy the web change before applying `20260917110000_starpath_ground_diagnostic.sql`. The client falls back to the previous lookup when the new endpoint is absent. Existing diagnostic cycles remain on version 0; new cycles use version 3, pinned across the student's academic year so saved responses never change banks mid-cycle. No assessment results are rewritten.

Verification includes the prebuild audits, production build, all five review forms, the three student checkpoints with save/resume, and a rollback-only database test. Database checks run as `anon` with valid `x-student-session` headers for every active student, reject missing/cross-student sessions, verify Ground assignment/save/completion/probing and preserve existing records. Fixture sessions and results are rolled back.
