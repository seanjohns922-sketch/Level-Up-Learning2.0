# Assessment repair database regression

Use an isolated, disposable Supabase schema-only clone with no real student data. These scripts create synthetic identities through the existing Ground fixtures; do not run them against production.

The schema must include the prior migrations through `20260915100000_ground_number_measurement_baselines.sql`. Apply the three repair migrations in order:

1. `20260915120000_preserve_all_realm_assessment_history.sql`
2. `20260915130000_assessment_learning_cycles.sql`
3. `20260915140000_version_safe_assessment_growth.sql`

Use `psql -v ON_ERROR_STOP=1` for all scripts. In one connection, run `supabase/tests/ground_baselines/before.sql` followed by `supabase/tests/ground_baselines/after.sql`; they share temporary tables. When testing the Ground migration itself, run `before.sql` before applying that migration, then apply the repairs before `after.sql`.

After those fixtures, run `preservation.sql` and `cycles.sql`. Each starts a transaction and rolls back its test changes. The fixture role must be able to switch to `authenticated` and `anon`, as in a local Supabase administrator connection.

- `preservation.sql`: higher-level reset preserves every original assessment row/score, leaves placement incomplete, and keeps history visible through the authenticated reader (3 assertions).
- `cycles.sql`: retries retain the original baseline; a new pre-test after a post-test creates a new cycle; awaiting a new post-test suppresses old growth; the new pair reports its own growth; historical rows are unchanged (6 assertions).

These tests passed on an isolated PostgreSQL 17.6 schema clone. They validate the database functions with synthetic data; they do not constitute a production migration or restore previously deleted records.
