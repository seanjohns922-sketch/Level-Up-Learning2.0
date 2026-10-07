# Production migration audit — 15 September 2026

## Result

Current assessment release functions match the repository's expected latest versions. Five manually applied assessment migrations now have verified history entries. A genuinely missing archived-student migration was applied after a rollback test. The entire historical migration set is **not yet reconciled**; do not treat absent history entries as instructions to replay old SQL.

## Checks performed

- Inventoried all 182 local SQL migration files: unique 14-digit versions, no malformed names or duplicate versions.
- Compared with live `supabase_migrations.schema_migrations`: initially 45 entries, now 51. All recorded versions exist locally. 131 local versions remain unrecorded; this does **not** mean 131 migrations are unapplied.
- Screened 277 latest locally declared function names against live definitions: 255 matching normalised bodies after the repair, 11 textual differences and 11 absent names. This is a function-body screen, not proof of every historical migration's data effects, privileges or overloads.
- Screened created table names and triggers. No genuine missing created table was identified. The auth-user trigger exists and is enabled. The missing archive trigger is now installed.
- Individually checked current assessment-history, learning-cycle, analytics, pending-diagnostic and version-pinning definitions. The history repair additionally checked security-definer/search-path settings, required RPC grants, enabled triggers and the Level 2 version constraint/default.

## Changes made in production

History-only reconciliation, with no replay of the SQL and no student-result changes:

| Version | Verified migration |
| --- | --- |
| 20260915113000 | Defer whole-maths diagnostic follow-ups |
| 20260915120000 | Preserve all realm assessment history |
| 20260915130000 | Assessment learning cycles |
| 20260915140000 | Version-safe assessment growth |
| 20260915180000 | Number Level 2 five-form release |

Applied `20260806100000_sync_archived_student_enrolments.sql` and recorded it:

- Installed the archive/restore enrolment trigger and updated the school directory function.
- Closed one stale active enrolment belonging to an already-archived student.
- Compared every enrolment before/after: only the expected row's status, primary flag and timestamps changed.
- Compared assessment-record counts and aggregate content hashes before/after: unchanged.
- Tested archive and restoration with temporary fixtures; dry-run changes were rolled back before application.
- Final read-only verification: zero stale active enrolments for archived students.

Ground, Level 1 and Level 4 release migrations already had history entries. Level 4's default, trigger, released RPC and adoption guard were verified during its release. Level 5 is a review-only content update and needs no student-release migration yet.

## Outstanding findings

1. **Brain-break XP is not installed.** `award_brain_break_xp_secure` is absent and there are zero `brain_break` economy transactions. The application calls this RPC and logs failures without blocking lessons. The local migration grants anonymous/authenticated execution to a security-definer function without checking access to the supplied student. Do not deploy it unchanged. A hardened replacement should verify student access and validate reward eligibility/source keys before activation.
2. **Legacy class-code helper is absent.** `generate_class_code` is still called by the class-creation page, which has a local fallback. The old migration is recorded, so this is schema drift rather than just missing history. Review the intended current class-code contract before restoring it.
3. **Other absent legacy identities:** seven older QR/PIN/claim helpers have no direct references in current `app`, `components` or `lib` sources. Do not resurrect obsolete login mechanisms automatically.
4. **Two absent Realmie functions were intentionally dropped** by `20260731103000_correct_realmies_to_discovery_model.sql`; their absence is expected.
5. **Eleven older function bodies differ textually.** Two are case-only differences (`get_student_progress_snapshot`, `mark_student_intro_seen`). Others include legacy progress persistence/backfill implementations and a corrected whitespace regex in `find_class_by_code`. No blanket rollback to the old SQL was performed. Full list appears in the JSON inventory.
6. **131 history entries still need historical reconciliation.** Many current functions prove that manual migrations or their successors are present. One-off backfills, catalogue edits, later deletions and superseded definitions cannot be certified solely by current function names. Do not mark all of these applied without migration-specific evidence or an explicitly documented schema baseline.

## Next safe database work

Prepare and test a hardened brain-break reward migration; resolve the legacy class-code helper; then reconcile older schema/history in a controlled baseline, preserving live function definitions and completed data corrections. Avoid an unreviewed bulk `supabase db push` while the historical ledger has these gaps.

No assessment content, student scores, progress or diagnostic placements were modified by this audit. Production changes were confined to verified history entries and the documented archive-enrolment repair.
