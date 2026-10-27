-- RELIQ XP health check (read-only).
-- Paste into the Supabase SQL Editor and run. Nothing here changes data:
-- every statement is a SELECT. Each section returns one result table; run them
-- one at a time if the editor only shows the last result.
--
-- XP is earned in three ways:
--   lesson_completion  40 XP, the first time each lesson is finished
--   quiz_completion    up to 60 XP, first attempt at each weekly quiz, scaled by score
--   brain_break        up to 10 XP per brain break
-- and spent in the Marketplace (transaction_type 'purchase').

-- 1. Is XP firing? XP earned per day and source, last 21 days (Melbourne time).
select (timezone('Australia/Melbourne', created_at))::date as day,
       source_type,
       count(*) as awards,
       count(distinct student_id) as students,
       sum(xp_delta) as xp
from public.student_economy_transactions
where transaction_type = 'earn'
  and created_at > now() - interval '21 days'
group by 1, 2
order by 1 desc, 2;

-- 2. Lessons finished vs lesson XP paid, per day, last 21 days.
--    first_completions should equal lesson_xp_awards. A gap means lessons
--    were finished without XP being banked.
with first_completion as (
  select student_id, realm_id, working_level, week, lesson, min(completed_at) as first_at
  from public.student_lesson_attempts
  where completed
  group by 1, 2, 3, 4, 5
), lesson_xp as (
  select (timezone('Australia/Melbourne', created_at))::date as day, count(*) as awards
  from public.student_economy_transactions
  where source_type = 'lesson_completion' and created_at > now() - interval '21 days'
  group by 1
)
select (timezone('Australia/Melbourne', fc.first_at))::date as day,
       count(*) as first_completions,
       coalesce(max(lx.awards), 0) as lesson_xp_awards
from first_completion fc
left join lesson_xp lx on lx.day = (timezone('Australia/Melbourne', fc.first_at))::date
where fc.first_at > now() - interval '21 days'
group by 1
order by 1 desc;

-- 3. Students who finished a lesson in the last 21 days but have no lesson XP
--    for it (should be empty).
with first_completion as (
  select student_id, realm_id, working_level, week, lesson, min(completed_at) as first_at
  from public.student_lesson_attempts
  where completed
  group by 1, 2, 3, 4, 5
)
select fc.student_id, s.display_name, fc.realm_id, fc.working_level, fc.week, fc.lesson, fc.first_at
from first_completion fc
join public.students s on s.id = fc.student_id
where fc.first_at > now() - interval '21 days'
  and not exists (
    select 1 from public.student_economy_transactions t
    where t.student_id = fc.student_id
      and t.source_type = 'lesson_completion'
      and t.metadata->>'realm_id' = fc.realm_id
      and t.metadata->>'working_level' = fc.working_level
      and (t.metadata->>'week')::int = fc.week
      and (t.metadata->>'lesson')::int = fc.lesson
  )
order by fc.first_at desc
limit 200;

-- 4. Same for weekly quizzes: first attempt in the last 21 days with no quiz XP
--    (a first attempt that scored 0% legitimately pays 0 XP and appears here).
with first_attempt as (
  select student_id, realm_id, working_level, week, quiz_id,
         min(completed_at) as first_at,
         (array_agg(accuracy_percent order by completed_at))[1] as first_percent
  from public.student_weekly_quiz_attempts
  group by 1, 2, 3, 4, 5
)
select fa.student_id, s.display_name, fa.realm_id, fa.working_level, fa.week, fa.first_percent, fa.first_at
from first_attempt fa
join public.students s on s.id = fa.student_id
where fa.first_at > now() - interval '21 days'
  and not exists (
    select 1 from public.student_economy_transactions t
    where t.student_id = fa.student_id
      and t.source_type = 'quiz_completion'
      and t.metadata->>'realm_id' = fa.realm_id
      and t.metadata->>'working_level' = fa.working_level
      and (t.metadata->>'week')::int = fa.week
  )
order by fa.first_at desc
limit 200;

-- 5. Wallets that don't add up: XP earned/spent on the wallet vs the sum of
--    the transaction ledger (should be empty).
select w.student_id, s.display_name,
       w.xp_earned, coalesce(e.earned, 0) as ledger_earned,
       w.xp_spent, coalesce(p.spent, 0) as ledger_spent
from public.student_economy_wallets w
join public.students s on s.id = w.student_id
left join (select student_id, sum(xp_delta) as earned from public.student_economy_transactions where transaction_type = 'earn' group by 1) e on e.student_id = w.student_id
left join (select student_id, -sum(xp_delta) as spent from public.student_economy_transactions where transaction_type = 'purchase' group by 1) p on p.student_id = w.student_id
where w.xp_earned <> coalesce(e.earned, 0) or w.xp_spent <> coalesce(p.spent, 0)
order by abs(w.xp_earned - coalesce(e.earned, 0)) desc
limit 200;

-- 6. Unusual XP: single awards above the normal maximum, or more than 30
--    brain-break awards for one student in a day (should be empty).
select t.student_id, s.display_name, t.source_type, t.xp_delta, t.source_key, t.created_at
from public.student_economy_transactions t
join public.students s on s.id = t.student_id
where t.transaction_type = 'earn'
  and ((t.source_type = 'lesson_completion' and t.xp_delta > 40)
    or (t.source_type = 'quiz_completion' and t.xp_delta > 60)
    or (t.source_type = 'brain_break' and t.xp_delta > 10))
union all
select bb.student_id, s.display_name, 'brain_break (daily count)', bb.awards::int, bb.day::text, null
from (
  select student_id, (timezone('Australia/Melbourne', created_at))::date as day, count(*) as awards
  from public.student_economy_transactions
  where source_type = 'brain_break'
  group by 1, 2
  having count(*) > 30
) bb
join public.students s on s.id = bb.student_id
order by 6 desc nulls last
limit 200;

-- 7. Snapshot: students with any XP, total XP earned and spent, top earners.
select count(*) filter (where xp_earned > 0) as students_with_xp,
       count(*) as wallets,
       sum(xp_earned) as total_earned,
       sum(xp_spent) as total_spent,
       round(avg(xp_earned) filter (where xp_earned > 0)) as avg_earned_per_active_student,
       max(xp_earned) as top_earned
from public.student_economy_wallets;
