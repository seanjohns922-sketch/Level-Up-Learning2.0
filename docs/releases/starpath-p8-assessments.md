# Space assessment release — 22 September 2026

The approved Ground–8 review content is frozen as `starpath-v9.json` and used by the student pre-test, post-test and Start/Mid/End diagnostic banks: 45 forms, 1,000 questions. Ground–6 have 20 questions per form; 7–8 have 30.

Interactive responses retain selections, constructions, routes and coordinates. Scoring uses the existing level-specific scorers against the frozen item, not a saved correctness flag. Teacher replay restores the response on the original diagram. Legacy drafts, matched post-tests and existing diagnostic academic-year cycles keep their original bank.

Level 7–8 assessment entry is available from Level 6 Space through Realm Teleport. Extension submissions save assessment evidence and teacher growth reports without changing weekly-program placement. This release does not create Level 7–8 weekly lessons. The combined whole-maths reporting model remains F–6; strand diagnostic probes can reach Level 8.

Deployment order: deploy the web commit first, then apply `20260922190000_starpath_full_release.sql`. Until migration, the pending-diagnostic lookup falls back to the previous endpoint. The migration preserves Number and Measurement release versions and adds Space's version, Level 8 limits, extended completion and student permissions.

Validation:
- `npm run prebuild`: existing release checks plus `qa:starpath-full-release`; all 1,000 Space response fixtures and all five P–8 banks for Number and Measurement.
- `npx tsc --noEmit`; targeted ESLint (no errors).
- Browser: Ground, 2, 4 and 6 student cards; 7–8 extension selection, Back/Next, reload, phone/tablet/desktop layout and full submission; released diagnostic save/resume. Network fixtures are mocked for browser flow tests.
- Production database transaction: real synthetic student login under `anon`; pending release lookup; Number/Measurement/Space 20/30/30 probe completion; missing and cross-student rejection; Space extension pre/post saves, idempotence and secure history. All fixtures rolled back. Reproducible SQL: `supabase/tests/starpath_rebuild/full-release.sql`.
