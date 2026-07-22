begin;

create table if not exists public.student_progress_overrides (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  realm_id text not null check (realm_id in ('number', 'measurement')),
  working_level text not null,
  week integer not null check (week between 1 and 12),
  advanced_to_week integer not null check (advanced_to_week between 1 and 12),
  teacher_id uuid not null references auth.users(id),
  reason text not null check (reason in (
    'additional_needs', 'iep', 'professional_judgement',
    'extended_absence', 'technical_issue', 'other'
  )),
  notes text,
  previous_state jsonb not null default '{}'::jsonb,
  new_state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(student_id, realm_id, working_level, week)
);

create index if not exists student_progress_overrides_student_idx
  on public.student_progress_overrides(student_id, realm_id, working_level, week);

alter table public.student_progress_overrides enable row level security;
revoke all on public.student_progress_overrides from public, anon, authenticated;

create or replace function public.can_manage_student_progress(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.teacher_owns_student(p_student_id)
    or exists (
      select 1
      from public.students student
      join public.classes class on class.id = student.class_id
      join public.school_memberships membership on membership.school_id = class.school_id
      where student.id = p_student_id
        and membership.user_id = auth.uid()
        and membership.status = 'active'
        and membership.role in ('teacher', 'school_admin')
    );
$$;

revoke all on function public.can_manage_student_progress(uuid) from public, anon, authenticated;

drop policy if exists "Teachers can read student progress overrides"
  on public.student_progress_overrides;
create policy "Teachers can read student progress overrides"
on public.student_progress_overrides for select
to authenticated
using (public.can_manage_student_progress(student_id));

grant select on public.student_progress_overrides to authenticated;

create or replace function public.teacher_advance_student_week(
  p_student_id uuid,
  p_realm_id text,
  p_working_level text,
  p_week integer,
  p_reason text,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_teacher uuid := auth.uid();
  v_progress public.student_realm_progress%rowtype;
  v_override_id uuid;
  v_last_week integer;
  v_next_week integer;
begin
  if v_teacher is null or not public.can_manage_student_progress(p_student_id) then
    raise exception 'Not authorized for this student' using errcode = '42501';
  end if;
  if p_realm_id not in ('number', 'measurement') then
    raise exception 'Invalid realm';
  end if;
  if p_reason not in (
    'additional_needs', 'iep', 'professional_judgement',
    'extended_absence', 'technical_issue', 'other'
  ) then
    raise exception 'A valid advancement reason is required';
  end if;

  select * into v_progress
  from public.student_realm_progress
  where student_id = p_student_id
    and realm_id = p_realm_id
    and working_level = p_working_level
    and is_current
  for update;

  if v_progress.id is null then
    raise exception 'Canonical student progress was not found';
  end if;
  if v_progress.status <> 'ASSIGNED_PROGRAM' or not v_progress.placement_complete then
    raise exception 'The student must have an active placed program before a week can be advanced';
  end if;
  if p_week is distinct from coalesce(v_progress.current_week, v_progress.assigned_week, 1) then
    raise exception 'Only the student current week can be advanced';
  end if;

  v_last_week := case when p_realm_id = 'measurement' then 8 else 12 end;
  if p_week < 1 or p_week >= v_last_week then
    raise exception 'This week cannot be advanced';
  end if;
  v_next_week := p_week + 1;

  insert into public.student_progress_overrides (
    student_id, realm_id, working_level, week, advanced_to_week,
    teacher_id, reason, notes, previous_state, new_state
  ) values (
    p_student_id, p_realm_id, p_working_level, p_week, v_next_week,
    v_teacher, p_reason, nullif(trim(coalesce(p_notes, '')), ''),
    jsonb_build_object(
      'current_week', v_progress.current_week,
      'assigned_week', v_progress.assigned_week,
      'status', v_progress.status
    ),
    jsonb_build_object(
      'current_week', v_next_week,
      'assigned_week', v_next_week,
      'status', v_progress.status,
      'advancement', 'teacher_override'
    )
  )
  returning id into v_override_id;

  update public.student_realm_progress
  set current_week = v_next_week,
      assigned_week = v_next_week,
      updated_at = now()
  where id = v_progress.id;

  insert into public.teacher_realm_actions (
    teacher_id, student_id, realm_id, action, old_value, new_value
  ) values (
    v_teacher, p_student_id, p_realm_id, 'week_advanced',
    jsonb_build_object(
      'working_level', p_working_level,
      'week', p_week,
      'reason', p_reason,
      'notes', nullif(trim(coalesce(p_notes, '')), '')
    )::text,
    jsonb_build_object(
      'working_level', p_working_level,
      'week', v_next_week,
      'override_id', v_override_id
    )::text
  );

  return v_override_id;
end;
$$;

revoke all on function public.teacher_advance_student_week(uuid, text, text, integer, text, text)
  from public, anon;
grant execute on function public.teacher_advance_student_week(uuid, text, text, integer, text, text)
  to authenticated;

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
  perform public.assert_student_access(p_student_id);
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

revoke all on function public.get_student_progress_overrides_secure(uuid, text) from public;
grant execute on function public.get_student_progress_overrides_secure(uuid, text)
  to anon, authenticated;

commit;
