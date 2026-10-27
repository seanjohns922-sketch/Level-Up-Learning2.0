-- RELIQ XP health summary (read-only, one result table).
-- Paste the whole thing into the Supabase SQL Editor and press Run.
-- For detail behind any number, see scripts/sql/xp-health-check.sql.
with first_lesson as (
  select student_id, realm_id, working_level, week, lesson, min(completed_at) as first_at
  from public.student_lesson_attempts where completed
  group by 1, 2, 3, 4, 5
), first_pass as (
  select student_id, realm_id, working_level, week, quiz_id, min(completed_at) as first_at
  from public.student_weekly_quiz_attempts where passed
  group by 1, 2, 3, 4, 5
), ledger as (
  select student_id,
         sum(xp_delta) filter (where transaction_type = 'earn') as earned,
         -sum(xp_delta) filter (where transaction_type = 'purchase') as spent
  from public.student_economy_transactions group by 1
)
select 1 as n, 'Lesson XP awards, last 7 days' as check_name, count(*)::text as result
  from public.student_economy_transactions where source_type = 'lesson_completion' and created_at > now() - interval '7 days'
union all
select 2, 'Quiz XP awards, last 7 days', count(*)::text
  from public.student_economy_transactions where source_type = 'quiz_completion' and created_at > now() - interval '7 days'
union all
select 3, 'Brain-break XP awards, last 7 days', count(*)::text
  from public.student_economy_transactions where source_type = 'brain_break' and created_at > now() - interval '7 days'
union all
select 4, 'Students who earned XP, last 7 days', count(distinct student_id)::text
  from public.student_economy_transactions
  where transaction_type = 'earn' and xp_delta > 0
    and source_type not in ('opening_balance', 'legacy_global_xp_backfill')
    and created_at > now() - interval '7 days'
union all
select 5, 'Lessons finished (first time, last 7 days)', count(*)::text
  from first_lesson where first_at > now() - interval '7 days'
union all
select 6, 'PROBLEM if > 0: lessons finished in last 7 days with no lesson XP', count(*)::text
  from first_lesson fl
  where fl.first_at > now() - interval '7 days'
    and not exists (
      select 1 from public.student_economy_transactions t
      where t.student_id = fl.student_id and t.source_type = 'lesson_completion'
        and t.metadata->>'realm_id' = fl.realm_id and t.metadata->>'working_level' = fl.working_level
        and (t.metadata->>'week')::int = fl.week and (t.metadata->>'lesson')::int = fl.lesson)
union all
select 7, 'PROBLEM if > 0: quizzes first passed since today''s XP update with no quiz XP', count(*)::text
  from first_pass fp
  where fp.first_at > (date_trunc('day', timezone('Australia/Melbourne', now())) at time zone 'Australia/Melbourne')
    and not exists (
      select 1 from public.student_economy_transactions t
      where t.student_id = fp.student_id and t.source_type = 'quiz_completion'
        and t.metadata->>'realm_id' = fp.realm_id and t.metadata->>'working_level' = fp.working_level
        and (t.metadata->>'week')::int = fp.week)
union all
select 8, 'PROBLEM if > 0: wallets that don''t match the XP ledger', count(*)::text
  from public.student_economy_wallets w left join ledger l on l.student_id = w.student_id
  where w.xp_earned <> coalesce(l.earned, 0) or w.xp_spent <> coalesce(l.spent, 0)
union all
select 9, 'PROBLEM if > 0: single awards above the normal maximum', count(*)::text
  from public.student_economy_transactions
  where transaction_type = 'earn'
    and ((source_type = 'lesson_completion' and xp_delta > 40)
      or (source_type = 'quiz_completion' and xp_delta > 60)
      or (source_type = 'brain_break' and xp_delta > 10))
union all
select 10, 'Students with any XP', count(*)::text from public.student_economy_wallets where xp_earned > 0
union all
select 11, 'Total XP earned (all time)', coalesce(sum(xp_earned), 0)::text from public.student_economy_wallets
union all
select 12, 'Total XP spent (all time)', coalesce(sum(xp_spent), 0)::text from public.student_economy_wallets
union all
select 13, 'Most XP held by one student', coalesce(max(xp_earned), 0)::text from public.student_economy_wallets
order by 1;
