# Manual school-year start

School administrators use **Administration → Start new school year**. No scheduled rollover runs. Maths working levels, results, rewards and class assignments are unchanged by this action. Existing assessment pathways are unchanged; this feature does not assign or reset tests.

## Preparing Yarrawonga for 2027

When adding students or uploading a roster in **Students**, explicitly choose the calendar year the supplied school year groups describe:

- **2026 — current-year students / trial**: a child currently in Year 2 can advance to Year 3 when the admin starts 2027.
- **2027 — already entered in next year’s groups**: a child entered directly as a 2027 Year 3 stays in Year 3. Starting 2027 skips them.

Upload these cohorts separately. This is school year, not maths working level. Existing students and older creation paths can be classified in the preparation table before starting the year. Do not create another identity for an existing child.

1. Select the calendar year to start (current or next year) and the school's highest supported year (6, 7 or 8).
2. Review each active student's year group and the calendar year it applies to. Correct year-group errors in Students. In preparation, correct the calendar-year classification and tick **Keep same year** for repeat-year exceptions.
3. **Save preparation**. This records classification and exceptions; it does not promote anyone.
4. Check whole-school totals, then **Review and start**, tick the confirmation and **Start … school year**.
5. Review school leavers separately. They are flagged but never automatically archived. Accidental promotions can be corrected using **Keep … in …** in the selected year's results.

A changed roster invalidates the preview. Reload and review again. Existing calendar markers and unique student/year history protect against repeat runs, including transfers. Missing/older year details block a run rather than silently advancing multiple years. Archived/inactive students are excluded.

## Implementation and deployment

Migration `20261106100000_manual_school_year_start.sql` adds guarded RPCs using existing calendar markers, settings, retention and history tables. It changes no student data on installation. Existing table RLS stays unchanged; new public actions require an authenticated school manager. The private review token is not publicly executable. The retired global worker loses service-role EXECUTE; no cron job is added.

Deploy this migration before the app. No start action should be invoked as part of deployment or a production smoke test. Read-only previews are sufficient.

Rollback: revert the application change first. Disable the new RPCs by revoking EXECUTE from authenticated (or drop the newly added functions in dependency order). Keep student calendar markers, audit and history records. Do **not** restore the automatic worker or its schedule, and do not reverse student promotions with a blanket SQL update. Use the guarded retention correction for a verified accidental promotion.

## Verification

- `npm run qa:school-year-manual`: React DOM controls, school API payloads and duplicate review, manual/import calendar selection.
- `npm run qa:school-year-db`: disposable PostgreSQL; mixed cohorts, classification, current/next-year starts, retention, Prep–8, leavers, stale/repeated requests, role boundaries, creation receipt handling and unchanged learning/class fields. Uses a minimal schema and a stub of the unchanged canonical creation function.
- Release checks: `npm run qa:critical`, `npm run lint:qa`, `npm run typecheck`, `npm run build`.

The automatic default preview is next year from July onward, otherwise the current year. Administrators can explicitly select either current or next year. UI tests use a simulated DOM; desktop/mobile visual inspection is separate.
