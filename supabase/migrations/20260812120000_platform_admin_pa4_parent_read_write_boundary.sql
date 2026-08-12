begin;

-- PA4 final security hardening: parent links are read relationships only.
-- Ordinary student writes must be authorised by the canonical student/session,
-- teacher/class ownership, or an administrative management path. A parent link
-- alone must never satisfy a write predicate.

create or replace function public.can_access_student_read(target_student_id uuid)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  supplied_token text := public.request_student_session_token();
  matched_session_id uuid;
begin
  if not exists (
    select 1
    from public.students student
    where student.id = target_student_id
      and student.archived_at is null
      and coalesce(student.identity_status, 'active') = 'active'
  ) then
    return false;
  end if;

  if exists (
    select 1
    from public.students student
    where student.id = target_student_id
      and (
        public.teacher_owns_class(student.class_id)
        or public.can_view_student(student.id)
        or exists (
          select 1
          from public.parent_student_links link
          where link.student_id = student.id
            and link.parent_user_id = auth.uid()
            and link.status = 'active'
        )
      )
  ) then
    return true;
  end if;

  if supplied_token is null then
    return false;
  end if;

  select session.id
  into matched_session_id
  from public.student_access_sessions session
  where session.student_id = target_student_id
    and session.token_hash = encode(extensions.digest(supplied_token, 'sha256'), 'hex')
    and session.revoked_at is null
    and session.expires_at > now()
  limit 1;

  if matched_session_id is null then
    return false;
  end if;

  update public.student_access_sessions
  set last_used_at = now()
  where id = matched_session_id
    and last_used_at < now() - interval '5 minutes';

  return true;
end;
$$;

create or replace function public.can_write_student(target_student_id uuid)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  supplied_token text := public.request_student_session_token();
  matched_session_id uuid;
begin
  if not exists (
    select 1
    from public.students student
    where student.id = target_student_id
      and student.archived_at is null
      and coalesce(student.identity_status, 'active') = 'active'
  ) then
    return false;
  end if;

  if exists (
    select 1
    from public.students student
    where student.id = target_student_id
      and (
        public.teacher_owns_class(student.class_id)
        or public.can_manage_student(student.id)
      )
  ) then
    return true;
  end if;

  if supplied_token is null then
    return false;
  end if;

  select session.id
  into matched_session_id
  from public.student_access_sessions session
  where session.student_id = target_student_id
    and session.token_hash = encode(extensions.digest(supplied_token, 'sha256'), 'hex')
    and session.revoked_at is null
    and session.expires_at > now()
  limit 1;

  if matched_session_id is null then
    return false;
  end if;

  update public.student_access_sessions
  set last_used_at = now()
  where id = matched_session_id
    and last_used_at < now() - interval '5 minutes';

  return true;
end;
$$;

create or replace function public.can_access_student(target_student_id uuid)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  return public.can_access_student_read(target_student_id);
end;
$$;

create or replace function public.assert_student_read(target_student_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if not public.can_access_student_read(target_student_id) then
    raise exception 'Student read access denied' using errcode = '42501';
  end if;
end;
$$;

create or replace function public.assert_student_write(target_student_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if not public.can_write_student(target_student_id) then
    raise exception 'Student write access denied' using errcode = '42501';
  end if;
end;
$$;

-- Preserve the legacy assertion name as the write gate because write-capable
-- RPCs already call it. Read RPCs below are explicitly moved to assert_student_read.
create or replace function public.assert_student_access(target_student_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  perform public.assert_student_write(target_student_id);
end;
$$;

revoke all on function public.can_access_student_read(uuid) from public, anon, authenticated;
revoke all on function public.can_write_student(uuid) from public, anon, authenticated;
revoke all on function public.can_access_student(uuid) from public, anon, authenticated;
revoke all on function public.assert_student_read(uuid) from public, anon, authenticated;
revoke all on function public.assert_student_write(uuid) from public, anon, authenticated;
revoke all on function public.assert_student_access(uuid) from public, anon, authenticated;

create or replace function public.get_student_runtime_context_secure(p_student_id uuid)
returns table(
  class_id uuid,
  school_year_level text,
  has_seen_intro boolean,
  display_name text,
  first_name text,
  last_name text,
  brain_break_frequency text,
  class_brain_break_frequency text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_read(p_student_id);
  return query
  select
    student.class_id,
    student.school_year_level,
    student.has_seen_intro,
    student.display_name,
    student.first_name,
    student.last_name,
    student.brain_break_frequency,
    class.brain_break_frequency as class_brain_break_frequency
  from public.students student
  left join public.classes class on class.id = student.class_id
  where student.id = p_student_id
  limit 1;
end;
$$;

create or replace function public.get_student_realm_progress_compat_secure(
  p_student_id uuid,
  p_realm_id text
)
returns table(
  student_id uuid,
  class_id uuid,
  realm_id text,
  program_key text,
  school_year_level text,
  working_level text,
  is_current boolean,
  status text,
  current_week integer,
  assigned_week integer,
  placement_complete boolean,
  pretest_score integer,
  pretest_completed_at timestamptz,
  posttest_score integer,
  posttest_completed_at timestamptz,
  required_weeks jsonb,
  optional_weeks jsonb,
  unlocked_legends jsonb,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_read(p_student_id);
  if p_realm_id not in ('number', 'measurement', 'space') then
    raise exception 'Invalid realm';
  end if;
  return query select * from public.get_student_realm_progress_compat(p_student_id, p_realm_id);
end;
$$;

create or replace function public.get_student_realm_lesson_attempts_secure(
  p_student_id uuid,
  p_realm_id text,
  p_working_level text default null
)
returns setof public.student_lesson_attempts
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_read(p_student_id);
  return query select * from public.get_student_realm_lesson_attempts(p_student_id, p_realm_id, p_working_level);
end;
$$;

create or replace function public.get_student_realm_weekly_quiz_attempts_secure(
  p_student_id uuid,
  p_realm_id text,
  p_working_level text default null
)
returns setof public.student_weekly_quiz_attempts
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_read(p_student_id);
  return query select * from public.get_student_realm_weekly_quiz_attempts(p_student_id, p_realm_id, p_working_level);
end;
$$;

create or replace function public.get_student_realm_assessments_secure(
  p_student_id uuid,
  p_realm_id text,
  p_working_level text default null
)
returns setof public.student_realm_assessments
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_read(p_student_id);
  return query select * from public.get_student_realm_assessments(p_student_id, p_realm_id, p_working_level);
end;
$$;

create or replace function public.get_student_activity_daily_secure(p_student_id uuid)
returns table(
  activity_date date,
  class_id uuid,
  questions_answered integer,
  correct_answers integer,
  lessons_completed integer,
  quizzes_completed integer,
  seconds_active integer,
  minutes_active integer,
  xp_earned integer,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_read(p_student_id);
  return query select * from public.get_student_activity_daily(p_student_id);
end;
$$;

create or replace function public.get_student_progress_snapshot_secure(p_student_id uuid)
returns table(
  year text,
  pretest_score integer,
  status text,
  week integer,
  placement_complete boolean,
  assigned_week integer,
  required_weeks jsonb,
  optional_weeks jsonb,
  unlocked_legends jsonb,
  completed_lesson_ids jsonb,
  quiz_scores jsonb,
  lesson_attempts jsonb,
  has_seen_intro boolean,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_read(p_student_id);
  return query select * from public.get_student_progress_snapshot(p_student_id);
end;
$$;

create or replace function public.get_live_student_activity_secure(p_student_id uuid, p_class_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_read(p_student_id);
  if not exists(select 1 from public.students s where s.id = p_student_id and s.class_id = p_class_id) then
    raise exception 'Student context does not match';
  end if;
  return public.get_live_student_activity(p_student_id, p_class_id);
end;
$$;

create or replace function public.get_student_global_xp_secure(p_student_id uuid)
returns table(
  xp_earned integer,
  xp_spent integer,
  xp_balance integer,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_read(p_student_id);
  insert into public.student_economy_wallets(student_id) values (p_student_id) on conflict do nothing;
  return query
  select
    wallet.xp_earned,
    wallet.xp_spent,
    wallet.xp_earned - wallet.xp_spent,
    wallet.updated_at
  from public.student_economy_wallets wallet
  where wallet.student_id = p_student_id;
end;
$$;

create or replace function public.get_student_economy_secure(p_student_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  perform public.assert_student_read(p_student_id);
  insert into public.student_economy_wallets(student_id) values (p_student_id) on conflict do nothing;
  select jsonb_build_object(
    'wallet', jsonb_build_object(
      'xp_earned', wallet.xp_earned,
      'xp_spent', wallet.xp_spent,
      'xp_balance', wallet.xp_earned - wallet.xp_spent,
      'essence', wallet.essence
    ),
    'items', coalesce((select jsonb_agg(to_jsonb(item) order by item.sort_order, item.name) from public.economy_items item where item.active), '[]'::jsonb),
    'inventory', coalesce((select jsonb_agg(jsonb_build_object(
      'item_key', inventory.item_key,
      'acquired_at', inventory.acquired_at,
      'acquisition_type', inventory.acquisition_type
    ) order by inventory.acquired_at desc) from public.student_inventory inventory where inventory.student_id = p_student_id), '[]'::jsonb),
    'equipped', coalesce((select jsonb_object_agg(equipped.slot, equipped.item_key) from public.student_equipped_items equipped where equipped.student_id = p_student_id), '{}'::jsonb)
  ) into result
  from public.student_economy_wallets wallet
  where wallet.student_id = p_student_id;
  return result;
end;
$$;

create or replace function public.get_gem_vault_secure(p_student_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v jsonb;
  t jsonb;
begin
  perform public.assert_student_read(p_student_id);
  t := public.gem_student_totals(p_student_id);
  select jsonb_build_object(
    'definitions', coalesce((
      select jsonb_agg(
        to_jsonb(definition)
        || jsonb_build_object('current', public.gem_current_value(t, definition.milestone_type, definition.realm_id))
        || jsonb_build_object('target', case when definition.milestone_type = 'all_live_legends'
             then coalesce((t->>'all_live_expected')::int, 0) else definition.threshold end)
        order by definition.display_order, definition.slug)
      from public.gem_definitions definition
      where definition.is_active
    ), '[]'::jsonb),
    'owned', coalesce((
      select jsonb_agg(jsonb_build_object(
        'gem_id', gem.gem_id,
        'slug', definition.slug,
        'earned_at', gem.earned_at,
        'source_type', gem.source_type))
      from public.student_gems gem
      join public.gem_definitions definition on definition.id = gem.gem_id
      where gem.student_id = p_student_id
    ), '[]'::jsonb),
    'favourite_gem_id', (select favourite_gem_id from public.student_gem_display where student_id = p_student_id),
    'totals', t
  ) into v;
  return v;
end;
$$;

create or replace function public.get_student_progress_overrides_secure(
  p_student_id uuid,
  p_realm_id text
)
returns table(
  working_level text,
  week integer,
  advanced_to_week integer,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_read(p_student_id);
  return query
  select
    override_row.working_level,
    override_row.week,
    override_row.advanced_to_week,
    override_row.created_at
  from public.student_progress_overrides override_row
  where override_row.student_id = p_student_id
    and override_row.realm_id = p_realm_id
  order by override_row.created_at;
end;
$$;

grant execute on function public.get_student_runtime_context_secure(uuid) to anon, authenticated;
grant execute on function public.get_student_realm_progress_compat_secure(uuid, text) to anon, authenticated;
grant execute on function public.get_student_realm_lesson_attempts_secure(uuid, text, text) to anon, authenticated;
grant execute on function public.get_student_realm_weekly_quiz_attempts_secure(uuid, text, text) to anon, authenticated;
grant execute on function public.get_student_realm_assessments_secure(uuid, text, text) to anon, authenticated;
grant execute on function public.get_student_activity_daily_secure(uuid) to anon, authenticated;
grant execute on function public.get_student_progress_snapshot_secure(uuid) to anon, authenticated;
grant execute on function public.get_live_student_activity_secure(uuid, uuid) to anon, authenticated;
grant execute on function public.get_student_global_xp_secure(uuid) to anon, authenticated;
grant execute on function public.get_student_economy_secure(uuid) to anon, authenticated;
grant execute on function public.get_gem_vault_secure(uuid) to anon, authenticated;
grant execute on function public.get_student_progress_overrides_secure(uuid, text) to anon, authenticated;

commit;
