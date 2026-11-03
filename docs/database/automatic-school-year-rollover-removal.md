# Automatic school-year rollover removal

Verified on 4 November 2026 against production project `dqncplrxjxvjqbmwcyia`.

Migration `20261102173000_remove_automatic_school_year_rollover.sql` was already
recorded in the production migration ledger when inspected. No reapplication or
student-data mutation was necessary. Production verification returned:

- Named `reliq-school-year-rollover` schedules: **0**.
- Any cron schedule whose command calls `run_school_year_rollover`: **0**.
- Ledger entries for migration `20261102173000`: **1**.

The migration removes only that named cron job. It does not change tables,
functions, grants, RLS, school settings, student years, retention exceptions or
rollover history. The screen now describes preparation settings and explicitly
states that saving does not advance student years. This change does not add a
manual "run rollover" action.

Validation: tested the exact migration twice inside a rolled-back local pg_cron
transaction. The named job was removed, the second execution was a no-op, and an
unrelated test job remained. Existing isolated rollover database regressions
passed, covering authorization, retention, duplicate-run prevention and preserved
working levels/rewards/classes. UI regressions check the preparation wording and
that saving settings does not invoke a rollover run.

Read-only production verification:

```sql
select
  (select count(*) from cron.job
   where jobname = 'reliq-school-year-rollover') as named_schedule_count,
  (select count(*) from cron.job
   where command ilike '%run_school_year_rollover%') as rollover_schedule_count,
  (select count(*) from supabase_migrations.schema_migrations
   where version = '20261102173000') as migration_recorded;
```

Rollback of the UI is a normal application revert. Restoring automatic execution
is a separate deliberate operational change: re-register the original job using
`cron.schedule('reliq-school-year-rollover', '15 16 * * *',
'select public.run_school_year_rollover();')`. Do not perform that rollback unless
the owner explicitly resumes automatic rollover. Do not delete the removal's
migration ledger entry or rewrite either historical migration.
