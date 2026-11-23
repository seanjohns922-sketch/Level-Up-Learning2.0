-- Rex the maths T-rex (agreed with Sean 2026-11-23).
--
-- A teacher sends Rex to their class, or a parent to their child; otherwise he wakes by himself after
-- 15 minutes in the hub without a lesson. He chases the explorer until they answer 5 easy questions,
-- which tames him and pays 50 XP; then he stays until they finish a lesson, which sends him away.
--
-- Schema: one new table, public.rex_visits (one open visit per student at a time), read and written
-- only through the functions below (RLS on, no policies, no table grants).
-- Functions:
--   send_rex_secure(class | child)  teachers who manage the class, or a parent linked to the child.
--   wake_rex_secure(student)        the student's own session or a teacher; at most once every
--                                   15 minutes after the last visit ended.
--   get_rex_visit_secure(student)   read access (adds parents); pays nothing.
--   tame_rex_secure(student, visit) the student's own session or a teacher; needs 5 right; pays
--                                   50 XP, at most 3 times per Melbourne day. Ledger row source_type
--                                   'rex', source_key 'rex:<visit id>' (idempotent).
-- Trigger: finishing a lesson (a new student_completion_receipts lesson row) ends a tamed visit.
-- Data: none changed.
-- Rollback: drop trigger rex_leaves_after_lesson on public.student_completion_receipts; drop the five
-- functions; drop table public.rex_visits. XP already paid stays in the ledger (source_type 'rex').

begin;

create table if not exists public.rex_visits (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  source text not null check (source in ('teacher', 'parent', 'timer')),
  sent_by uuid,
  created_at timestamptz not null default now(),
  tamed_at timestamptz,
  cleared_at timestamptz
);
create unique index if not exists rex_visits_one_open on public.rex_visits(student_id) where cleared_at is null;
create index if not exists rex_visits_student_idx on public.rex_visits(student_id, created_at desc);
alter table public.rex_visits enable row level security;
revoke all on public.rex_visits from public, anon, authenticated;

create or replace function public.send_rex_secure(p_class_id uuid default null, p_student_id uuid default null)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  sent integer := 0;
begin
  if p_class_id is not null then
    if not public.can_manage_class(p_class_id) then
      raise exception 'Class access required' using errcode = '42501';
    end if;
    insert into public.rex_visits(student_id, source, sent_by)
    select s.id, 'teacher', auth.uid() from public.students s where s.class_id = p_class_id
    on conflict (student_id) where cleared_at is null do nothing;
    get diagnostics sent = row_count;
  elsif p_student_id is not null then
    perform public.assert_parent_role();
    if not exists (
      select 1 from public.parent_student_links link
      where link.parent_user_id = auth.uid() and link.student_id = p_student_id and link.status = 'active'
    ) then
      raise exception 'Parent access required' using errcode = '42501';
    end if;
    insert into public.rex_visits(student_id, source, sent_by)
    values (p_student_id, 'parent', auth.uid())
    on conflict (student_id) where cleared_at is null do nothing;
    get diagnostics sent = row_count;
  else
    raise exception 'Choose a class or a child';
  end if;
  return sent;
end;
$$;
revoke all on function public.send_rex_secure(uuid, uuid) from public, anon;
grant execute on function public.send_rex_secure(uuid, uuid) to authenticated;

create or replace function public.get_rex_visit_secure(p_student_id uuid)
returns table(id uuid, source text, tamed boolean, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_read(p_student_id);
  return query
  select v.id, v.source, v.tamed_at is not null, v.created_at
  from public.rex_visits v
  where v.student_id = p_student_id and v.cleared_at is null;
end;
$$;
revoke all on function public.get_rex_visit_secure(uuid) from public;
-- Student sessions run as anon with the validated x-student-session header.
grant execute on function public.get_rex_visit_secure(uuid) to anon, authenticated;

create or replace function public.wake_rex_secure(p_student_id uuid)
returns table(id uuid, source text, tamed boolean, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_write(p_student_id);
  perform pg_advisory_xact_lock(hashtext(p_student_id::text), hashtext('rex'));
  -- He wakes by himself at most once every 15 minutes after his last visit ended.
  if not exists (select 1 from public.rex_visits v where v.student_id = p_student_id and v.cleared_at is null)
    and not exists (
      select 1 from public.rex_visits v
      where v.student_id = p_student_id and v.cleared_at > now() - interval '15 minutes'
    ) then
    insert into public.rex_visits(student_id, source) values (p_student_id, 'timer');
  end if;
  return query
  select v.id, v.source, v.tamed_at is not null, v.created_at
  from public.rex_visits v
  where v.student_id = p_student_id and v.cleared_at is null;
end;
$$;
revoke all on function public.wake_rex_secure(uuid) from public;
grant execute on function public.wake_rex_secure(uuid) to anon, authenticated;

create or replace function public.tame_rex_secure(p_student_id uuid, p_visit_id uuid, p_correct integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  rex_xp constant integer := 50;          -- set here; lib/rex.ts shows the same
  rex_questions constant integer := 5;
  rex_paid_per_day constant integer := 3;
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

-- Finishing a lesson sends a tamed Rex away.
create or replace function public.rex_leaves_after_lesson()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.activity_type = 'lesson' then
    update public.rex_visits set cleared_at = now()
    where student_id = new.student_id and cleared_at is null and tamed_at is not null;
  end if;
  return new;
end;
$$;
revoke all on function public.rex_leaves_after_lesson() from public, anon, authenticated;
drop trigger if exists rex_leaves_after_lesson on public.student_completion_receipts;
create trigger rex_leaves_after_lesson
after insert on public.student_completion_receipts
for each row execute function public.rex_leaves_after_lesson();

commit;
