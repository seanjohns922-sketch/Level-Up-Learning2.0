-- Rex, round two (Sean 2026-11-23): taming pays its 50 XP up to 8 times a day (was 3), and teachers
-- can send Rex to chosen students as well as the whole class.
--
-- Functions: tame_rex_secure is replaced with the same signature (only the daily limit changes), so its
-- grants stay. New send_rex_to_students_secure(student ids): the caller must manage the class of every
-- student named, or nothing is sent. Granted to authenticated only.
-- Schema and data: none changed. Needs 20261125150000_rex_visits.sql first.
-- Rollback: re-run tame_rex_secure from 20261125150000_rex_visits.sql; drop function
-- public.send_rex_to_students_secure(uuid[]).

begin;

create or replace function public.tame_rex_secure(p_student_id uuid, p_visit_id uuid, p_correct integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  rex_xp constant integer := 50;          -- set here; lib/rex.ts shows the same
  rex_questions constant integer := 5;
  rex_paid_per_day constant integer := 8;
  paid_today integer;
  inserted_count integer;
begin
  perform public.assert_student_write(p_student_id);
  if coalesce(p_correct, 0) < rex_questions then
    return 0;
  end if;
  perform pg_advisory_xact_lock(hashtext(p_student_id::text), hashtext('rex'));
  update public.rex_visits set tamed_at = now()
  where id = p_visit_id and student_id = p_student_id and cleared_at is null and tamed_at is null;
  if not found then
    return 0;
  end if;

  select count(*) into paid_today
  from public.student_economy_transactions
  where student_id = p_student_id
    and source_type = 'rex'
    and created_at >= (date_trunc('day', timezone('Australia/Melbourne', now())) at time zone 'Australia/Melbourne');
  if paid_today >= rex_paid_per_day then
    return 0; -- tamed, but today's Rex XP is used up
  end if;

  insert into public.student_economy_transactions(student_id, transaction_type, xp_delta, source_type, source_key, metadata)
  values (p_student_id, 'earn', rex_xp, 'rex', 'rex:' || p_visit_id::text, jsonb_build_object('questions', rex_questions))
  on conflict (student_id, source_type, source_key) do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then
    return 0;
  end if;
  insert into public.student_economy_wallets(student_id, xp_earned)
  values (p_student_id, rex_xp)
  on conflict (student_id) do update set
    xp_earned = public.student_economy_wallets.xp_earned + excluded.xp_earned,
    updated_at = now();
  return rex_xp;
end;
$$;
revoke all on function public.tame_rex_secure(uuid, uuid, integer) from public;
grant execute on function public.tame_rex_secure(uuid, uuid, integer) to anon, authenticated;

create or replace function public.send_rex_to_students_secure(p_student_ids uuid[])
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  sent integer := 0;
begin
  if coalesce(array_length(p_student_ids, 1), 0) = 0 then
    raise exception 'Choose at least one student';
  end if;
  if exists (
    select 1 from unnest(p_student_ids) as picked(id)
    left join public.students s on s.id = picked.id
    where s.id is null or not public.can_manage_class(s.class_id)
  ) then
    raise exception 'Class access required' using errcode = '42501';
  end if;
  insert into public.rex_visits(student_id, source, sent_by)
  select distinct picked.id, 'teacher', auth.uid() from unnest(p_student_ids) as picked(id)
  on conflict (student_id) where cleared_at is null do nothing;
  get diagnostics sent = row_count;
  return sent;
end;
$$;
revoke all on function public.send_rex_to_students_secure(uuid[]) from public, anon;
grant execute on function public.send_rex_to_students_secure(uuid[]) to authenticated;

commit;
