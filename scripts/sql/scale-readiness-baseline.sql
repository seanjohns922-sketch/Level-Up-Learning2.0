-- Read-only capacity baseline. No student rows, credentials or query text are returned.
-- Run against the target database using an administrator connection.
begin read only;
set local statement_timeout = '10s';
set local search_path = pg_catalog, extensions, public;

select now() as collected_at, current_database() as database,
       pg_size_pretty(pg_database_size(current_database())) as database_size,
       current_setting('max_connections') as max_connections;

select backend_type, coalesce(state, 'not applicable') as state, count(*) as connections
from pg_stat_activity where datname = current_database()
group by backend_type, state order by connections desc;

select stats_reset, xact_commit, xact_rollback, deadlocks, temp_bytes,
       blks_hit, blks_read, tup_inserted, tup_updated, tup_deleted
from pg_stat_database where datname = current_database();

select relname, n_live_tup as estimated_rows, seq_scan, idx_scan,
       n_dead_tup, last_autovacuum, last_autoanalyze,
       pg_size_pretty(pg_total_relation_size(relid)) as total_size
from pg_stat_user_tables
where schemaname = 'public'
order by pg_total_relation_size(relid) desc limit 20;

-- pg_stat_statements must already be installed; do not enable extensions here.
-- Counters are cumulative since their last reset, not a timed load test.
select queryid, calls,
       round(total_exec_time::numeric, 1) as total_exec_ms,
       round(mean_exec_time::numeric, 2) as mean_exec_ms,
       round(max_exec_time::numeric, 2) as maximum_exec_ms,
       rows, shared_blks_hit, shared_blks_read, temp_blks_written
from pg_stat_statements
where dbid = (select oid from pg_database where datname = current_database())
order by total_exec_time desc limit 20;
rollback;
