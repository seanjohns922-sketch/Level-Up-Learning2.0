begin;

-- The economy foundation initially seeded wallets from student_activity_daily.
-- Older students can have canonical realm attempts without matching daily rows.
-- Reconstruct a conservative lifetime floor across every realm without adding
-- the same historical completion twice.
with lesson_totals as (
  select
    completed.student_id,
    count(*)::integer * 40 as xp
  from (
    select distinct
      sla.student_id,
      sla.realm_id,
      sla.working_level,
      sla.lesson_id
    from public.student_lesson_attempts sla
    where sla.completed
  ) completed
  group by completed.student_id
),
quiz_best as (
  select
    swqa.student_id,
    swqa.realm_id,
    swqa.working_level,
    swqa.quiz_id,
    max(greatest(0, least(100, swqa.accuracy_percent))) as accuracy_percent
  from public.student_weekly_quiz_attempts swqa
  group by swqa.student_id, swqa.realm_id, swqa.working_level, swqa.quiz_id
),
quiz_totals as (
  select
    qb.student_id,
    sum(round(qb.accuracy_percent::numeric * 60 / 100))::integer as xp
  from quiz_best qb
  group by qb.student_id
),
historical_totals as (
  select
    s.id as student_id,
    coalesce(lt.xp, 0) + coalesce(qt.xp, 0) as canonical_xp
  from public.students s
  left join lesson_totals lt on lt.student_id = s.id
  left join quiz_totals qt on qt.student_id = s.id
)
insert into public.student_economy_wallets(student_id, xp_earned)
select ht.student_id, ht.canonical_xp
from historical_totals ht
on conflict (student_id) do update set
  xp_earned = greatest(
    public.student_economy_wallets.xp_earned,
    excluded.xp_earned
  ),
  updated_at = case
    when excluded.xp_earned > public.student_economy_wallets.xp_earned then now()
    else public.student_economy_wallets.updated_at
  end;

-- Record a single audit marker for students whose wallet now has historical XP.
-- The fixed source key makes this migration idempotent if it is replayed.
insert into public.student_economy_transactions(
  student_id,
  transaction_type,
  xp_delta,
  source_type,
  source_key,
  metadata
)
select
  w.student_id,
  'earn',
  0,
  'legacy_global_xp_backfill',
  'canonical_attempts_v1',
  jsonb_build_object(
    'method', 'wallet_floor_from_distinct_completed_lessons_and_best_quizzes',
    'wallet_xp_after_backfill', w.xp_earned
  )
from public.student_economy_wallets w
where w.xp_earned > 0
on conflict (student_id, source_type, source_key) do nothing;

commit;
