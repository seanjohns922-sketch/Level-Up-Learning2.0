# Statistica assessment release — 23 September 2026

Approved Levels 1–8 are frozen in `statistica-v3.json`: 40 forms and 900 questions. Levels 1–6 have 20 questions per form; Levels 7–8 have 30. Each level includes pre-test, post-test and independent Start/Mid/End diagnostics. Statistics begins at Level 1.

Level 8 wording is shorter across all five forms. Unnecessary instructions were removed and options shortened while retaining sampling methods, denominators, uncertainty, four plausible choices and the original calculations.

Student cards reuse the approved review diagrams and interactions. Saved responses include raw choices, frequencies, sorting placements and stem-and-leaf entries; scoring uses the frozen item rather than a submitted correctness flag. Teacher replay restores the original diagram and response. Existing drafts, legacy pre/post pairs and diagnostic academic-year cycles retain their bank versions.

Levels 7–8 assessments are accessible through Realm Teleport from Level 6 Statistics. Extension results are saved for teacher replay/growth without assigning nonexistent weekly programs. Existing weekly lessons remain Levels 1–6; this release completes assessment access, not secondary weekly lessons. Whole-maths aggregation remains the existing F–6 model; strand probes can reach Level 8.

Deploy web support first, then apply `20260923190000_statistica_full_release.sql`. The new pending-diagnostic lookup falls back to the previous endpoint until migration. Number, Measurement and Space release flags, permissions and routes are preserved.

Validation: full prebuild regression suite, TypeScript and targeted lint; 900 worked response fixtures, all 40 live banks, legacy bank selection, replay and invalid-response rejection. Browser checks cover student navigation, reload, extension submission and diagnostic save/resume; these browser network fixtures are mocked. `supabase/tests/statistica/full-release.sql` verifies actual anon student login, all four released strands, Levels 1–8 assessment saves, idempotence, cycle pinning, secure history and missing/cross-student rejection. Synthetic database fixtures always roll back.
