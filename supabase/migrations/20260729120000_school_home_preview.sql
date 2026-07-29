begin;

-- Materialise legacy primary-class relationships for the canonical School Home.
insert into public.class_enrollments (
  student_id,
  class_id,
  school_id,
  academic_year_id,
  is_primary,
  status
)
select
  student.id,
  class.id,
  class.school_id,
  class.academic_year_id,
  true,
  'active'
from public.students student
join public.classes class on class.id = student.class_id
where class.school_id is not null
on conflict (student_id, class_id) do update set
  school_id = excluded.school_id,
  academic_year_id = excluded.academic_year_id,
  is_primary = true,
  status = 'active',
  ended_at = null,
  updated_at = now();

alter table public.school_invitations
  add column if not exists requested_class_id uuid
    references public.classes(id) on delete set null,
  add column if not exists updated_at timestamptz not null default now();

create or replace function public.can_create_school_class(p_school_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.can_manage_school(p_school_id)
    or exists (
      select 1
      from public.school_memberships membership
      where membership.school_id = p_school_id
        and membership.user_id = auth.uid()
        and membership.status = 'active'
        and (
          membership.role = 'teacher'
          or (
            membership.role = 'principal'
            and coalesce(
              (membership.permissions->>'can_create_classes')::boolean,
              false
            )
          )
        )
    );
$$;

create or replace function public.get_my_school_contexts()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', school.id,
        'name', school.name,
        'role', coalesce(membership.role, 'platform_admin')
      )
      order by school.name
    ),
    '[]'::jsonb
  )
  from public.schools school
  left join public.school_memberships membership
    on membership.school_id = school.id
   and membership.user_id = auth.uid()
   and membership.status = 'active'
  where school.status = 'active'
    and public.can_view_school(school.id);
$$;

create or replace function public.get_school_home_snapshot(p_school_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_role text;
  v_profile public.user_profiles%rowtype;
  v_school public.schools%rowtype;
begin
  if v_actor is null or not public.can_view_school(p_school_id) then
    raise exception 'School access denied' using errcode = '42501';
  end if;

  select * into v_school
  from public.schools school
  where school.id = p_school_id
    and school.status = 'active';

  if v_school.id is null then
    raise exception 'Active school not found';
  end if;

  select * into v_profile
  from public.user_profiles profile
  where profile.user_id = v_actor
    and profile.status = 'active';

  select coalesce(membership.role, 'platform_admin')
  into v_role
  from (select 1) seed
  left join public.school_memberships membership
    on membership.school_id = p_school_id
   and membership.user_id = v_actor
   and membership.status = 'active';

  return jsonb_build_object(
    'school', jsonb_build_object(
      'id', v_school.id,
      'name', v_school.name,
      'state', v_school.state,
      'sector', v_school.sector,
      'status', v_school.status
    ),
    'actor', jsonb_build_object(
      'id', v_actor,
      'name', coalesce(v_profile.display_name, v_profile.email, 'Educator'),
      'email', v_profile.email,
      'role', v_role
    ),
    'permissions', jsonb_build_object(
      'canManageSchool', public.can_manage_school(p_school_id),
      'canCreateClass', public.can_create_school_class(p_school_id),
      'canInviteStaff', public.can_manage_school(p_school_id),
      'canViewAdministration', public.can_manage_school(p_school_id)
    ),
    'academicYears', (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', year.id,
            'name', year.name,
            'calendarYear', year.calendar_year,
            'status', year.status,
            'startsOn', year.starts_on,
            'endsOn', year.ends_on,
            'activeStudentCount', (
              select count(distinct enrolment.student_id)
              from public.class_enrollments enrolment
              where enrolment.school_id = p_school_id
                and enrolment.academic_year_id = year.id
                and enrolment.status = 'active'
                and enrolment.ended_at is null
            )
          )
          order by year.calendar_year desc
        ),
        '[]'::jsonb
      )
      from public.academic_years year
      where year.school_id = p_school_id
        and year.status in ('planned', 'active', 'closed')
    ),
    'classes', (
      select coalesce(
        jsonb_agg(class_row.payload order by class_row.class_name),
        '[]'::jsonb
      )
      from (
        select
          class.name as class_name,
          jsonb_build_object(
            'id', class.id,
            'name', class.name,
            'code', class.class_code,
            'yearLevels', coalesce(class.year_levels, '{}'::text[]),
            'academicYearId', class.academic_year_id,
            'academicYear', class.academic_year,
            'status', class.status,
            'studentCount', (
              select count(*)
              from public.class_enrollments enrolment
              where enrolment.class_id = class.id
                and enrolment.status = 'active'
                and enrolment.ended_at is null
            ),
            'leadTeacher', (
              select coalesce(profile.display_name, profile.email)
              from public.class_staff_memberships staffing
              join public.user_profiles profile on profile.user_id = staffing.user_id
              where staffing.class_id = class.id
                and staffing.status = 'active'
                and staffing.role = 'lead_teacher'
              order by staffing.assigned_at
              limit 1
            ),
            'coTeachers', (
              select coalesce(
                jsonb_agg(coalesce(profile.display_name, profile.email) order by profile.display_name),
                '[]'::jsonb
              )
              from public.class_staff_memberships staffing
              join public.user_profiles profile on profile.user_id = staffing.user_id
              where staffing.class_id = class.id
                and staffing.status = 'active'
                and staffing.role = 'teacher'
            ),
            'myRole', (
              select staffing.role
              from public.class_staff_memberships staffing
              where staffing.class_id = class.id
                and staffing.user_id = v_actor
                and staffing.status = 'active'
              limit 1
            ),
            'canOpen', public.can_view_class(class.id),
            'canManage', public.can_manage_class(class.id)
          ) as payload
        from public.classes class
        where class.school_id = p_school_id
          and class.status = 'active'
      ) class_row
    ),
    'staff', (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'userId', membership.user_id,
            'name', coalesce(profile.display_name, profile.email, 'Educator'),
            'email', profile.email,
            'role', membership.role,
            'status', membership.status,
            'assignedClasses', (
              select coalesce(
                jsonb_agg(
                  jsonb_build_object(
                    'id', class.id,
                    'name', class.name,
                    'role', staffing.role
                  )
                  order by class.name
                ),
                '[]'::jsonb
              )
              from public.class_staff_memberships staffing
              join public.classes class on class.id = staffing.class_id
              where staffing.user_id = membership.user_id
                and staffing.school_id = p_school_id
                and staffing.status = 'active'
            )
          )
          order by coalesce(profile.display_name, profile.email)
        ),
        '[]'::jsonb
      )
      from public.school_memberships membership
      left join public.user_profiles profile on profile.user_id = membership.user_id
      where membership.school_id = p_school_id
        and membership.status in ('active', 'inactive')
    ),
    'invitations', (
      select case
        when public.can_manage_school(p_school_id) then coalesce(
          jsonb_agg(
            jsonb_build_object(
              'id', invitation.id,
              'email', invitation.email,
              'role', invitation.role,
              'status', invitation.status,
              'expiresAt', invitation.expires_at,
              'requestedClassId', invitation.requested_class_id,
              'createdAt', invitation.created_at
            )
            order by invitation.created_at desc
          ),
          '[]'::jsonb
        )
        else '[]'::jsonb
      end
      from public.school_invitations invitation
      where invitation.school_id = p_school_id
        and invitation.status = 'pending'
    ),
    'recentActivity', (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', activity.id,
            'action', activity.action,
            'targetType', activity.target_type,
            'createdAt', activity.created_at,
            'actorName', coalesce(profile.display_name, profile.email, 'Platform staff')
          )
          order by activity.created_at desc
        ),
        '[]'::jsonb
      )
      from (
        select *
        from public.school_audit_log log
        where log.school_id = p_school_id
          and log.action <> 'school_accessed'
        order by log.created_at desc
        limit 8
      ) activity
      left join public.user_profiles profile on profile.user_id = activity.actor_user_id
    )
  );
end;
$$;

create or replace function public.invite_school_staff_with_class(
  p_school_id uuid,
  p_email text,
  p_role text,
  p_class_id uuid,
  p_idempotency_key text
)
returns table (
  invitation_id uuid,
  invitation_token text,
  repeated_request boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result record;
begin
  if p_class_id is not null and not exists (
    select 1 from public.classes class
    where class.id = p_class_id
      and class.school_id = p_school_id
      and class.status = 'active'
  ) then
    raise exception 'Optional class must belong to this school';
  end if;

  select * into v_result
  from public.invite_school_staff(
    p_school_id,
    p_email,
    p_role,
    p_idempotency_key
  );

  update public.school_invitations
  set requested_class_id = p_class_id, updated_at = now()
  where id = v_result.invitation_id;

  return query
  select
    v_result.invitation_id::uuid,
    v_result.invitation_token::text,
    v_result.repeated_request::boolean;
end;
$$;

create or replace function public.apply_invited_class_assignment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'accepted'
    and old.status is distinct from new.status
    and new.requested_class_id is not null
    and new.accepted_by is not null
  then
    insert into public.class_staff_memberships (
      class_id,
      school_id,
      user_id,
      role,
      status,
      assigned_by
    ) values (
      new.requested_class_id,
      new.school_id,
      new.accepted_by,
      case when new.role = 'support_staff' then 'support_staff' else 'teacher' end,
      'active',
      new.invited_by
    )
    on conflict (class_id, user_id) do update set
      role = excluded.role,
      status = 'active',
      assigned_by = excluded.assigned_by,
      assigned_at = now(),
      ended_at = null,
      updated_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists apply_invited_class_assignment
  on public.school_invitations;
create trigger apply_invited_class_assignment
after update of status on public.school_invitations
for each row execute function public.apply_invited_class_assignment();

create or replace function public.resend_school_invitation(
  p_invitation_id uuid
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation public.school_invitations%rowtype;
  v_token text;
begin
  select * into v_invitation
  from public.school_invitations invitation
  where invitation.id = p_invitation_id
    and invitation.status = 'pending'
  for update;

  if v_invitation.id is null then
    raise exception 'Pending invitation not found';
  end if;
  if not public.can_manage_school(v_invitation.school_id) then
    raise exception 'School administrator access required' using errcode = '42501';
  end if;

  v_token := encode(extensions.gen_random_bytes(24), 'hex');
  update public.school_invitations
  set
    token_hash = encode(extensions.digest(v_token, 'sha256'), 'hex'),
    expires_at = now() + interval '7 days',
    updated_at = now()
  where id = p_invitation_id;

  perform public.write_school_audit(
    v_invitation.school_id,
    'school_invitation_resent',
    'school_invitation',
    p_invitation_id::text,
    jsonb_build_object('expires_at', v_invitation.expires_at),
    jsonb_build_object('expires_at', now() + interval '7 days')
  );

  return v_token;
end;
$$;

create or replace function public.revoke_school_invitation(
  p_invitation_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation public.school_invitations%rowtype;
begin
  select * into v_invitation
  from public.school_invitations invitation
  where invitation.id = p_invitation_id
    and invitation.status = 'pending'
  for update;

  if v_invitation.id is null then
    raise exception 'Pending invitation not found';
  end if;
  if not public.can_manage_school(v_invitation.school_id) then
    raise exception 'School administrator access required' using errcode = '42501';
  end if;

  update public.school_invitations
  set status = 'revoked', updated_at = now()
  where id = p_invitation_id;

  perform public.write_school_audit(
    v_invitation.school_id,
    'school_invitation_revoked',
    'school_invitation',
    p_invitation_id::text,
    jsonb_build_object('status', v_invitation.status),
    jsonb_build_object('status', 'revoked')
  );
end;
$$;

create or replace function public.deactivate_school_member(
  p_school_id uuid,
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member public.school_memberships%rowtype;
begin
  if not public.can_manage_school(p_school_id) then
    raise exception 'School administrator access required' using errcode = '42501';
  end if;

  select * into v_member
  from public.school_memberships membership
  where membership.school_id = p_school_id
    and membership.user_id = p_user_id
    and membership.status = 'active'
  for update;

  if v_member.user_id is null then
    raise exception 'Active school member not found';
  end if;
  if v_member.user_id = auth.uid() then
    raise exception 'You cannot deactivate your own active membership';
  end if;
  if v_member.role = 'school_admin'
    and not exists (
      select 1
      from public.school_memberships membership
      where membership.school_id = p_school_id
        and membership.user_id <> p_user_id
        and membership.role = 'school_admin'
        and membership.status = 'active'
    )
  then
    raise exception 'A school must retain an active school administrator';
  end if;

  update public.school_memberships
  set status = 'inactive', ended_at = now(), updated_at = now()
  where school_id = p_school_id
    and user_id = p_user_id;

  update public.class_staff_memberships
  set status = 'inactive', ended_at = now(), updated_at = now()
  where school_id = p_school_id
    and user_id = p_user_id
    and status = 'active';

  perform public.write_school_audit(
    p_school_id,
    'school_member_deactivated',
    'school_membership',
    p_user_id::text,
    jsonb_build_object('role', v_member.role, 'status', v_member.status),
    jsonb_build_object('role', v_member.role, 'status', 'inactive')
  );
end;
$$;

-- Extend class creation to honour the reviewed principal capability.
create or replace function public.create_class(
  p_school_id uuid,
  p_academic_year_id uuid,
  p_name text,
  p_class_code text,
  p_year_levels text[],
  p_idempotency_key text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_name text := nullif(trim(coalesce(p_name, '')), '');
  v_code text := upper(trim(coalesce(p_class_code, '')));
  v_key text := nullif(trim(coalesce(p_idempotency_key, '')), '');
  v_receipt public.school_command_receipts%rowtype;
  v_class_id uuid;
  v_year integer;
begin
  if v_actor is null or not public.can_create_school_class(p_school_id) then
    raise exception 'Class creation access required' using errcode = '42501';
  end if;
  if v_name is null then raise exception 'Class name is required'; end if;
  if v_code !~ '^[A-Z0-9]{4,10}$' then
    raise exception 'Class code must contain 4 to 10 letters or numbers';
  end if;
  if v_key is null then raise exception 'An idempotency key is required'; end if;

  select * into v_receipt
  from public.school_command_receipts receipt
  where receipt.school_id = p_school_id
    and receipt.actor_user_id = v_actor
    and receipt.command_name = 'create_class'
    and receipt.idempotency_key = v_key;
  if v_receipt.id is not null then
    return (v_receipt.result->>'class_id')::uuid;
  end if;

  select year.calendar_year into v_year
  from public.academic_years year
  where year.id = p_academic_year_id
    and year.school_id = p_school_id
    and year.status in ('planned', 'active');
  if v_year is null then
    raise exception 'Academic year is not available for this school';
  end if;
  if exists (
    select 1 from public.classes class
    where upper(class.class_code) = v_code
      and class.status = 'active'
  ) then
    raise exception 'Class code is already in use';
  end if;

  insert into public.classes (
    name, class_code, teacher_id, year_levels, school_id,
    academic_year, academic_year_id, status, created_by
  ) values (
    v_name, v_code, v_actor, coalesce(p_year_levels, '{}'::text[]),
    p_school_id, v_year, p_academic_year_id, 'active', v_actor
  ) returning id into v_class_id;

  insert into public.class_staff_memberships (
    class_id, school_id, user_id, role, status, assigned_by
  ) values (
    v_class_id, p_school_id, v_actor, 'lead_teacher', 'active', v_actor
  );

  insert into public.school_command_receipts (
    school_id, actor_user_id, command_name, idempotency_key, result
  ) values (
    p_school_id, v_actor, 'create_class', v_key,
    jsonb_build_object('class_id', v_class_id)
  );

  perform public.write_school_audit(
    p_school_id,
    'class_created',
    'class',
    v_class_id::text,
    null,
    jsonb_build_object(
      'name', v_name,
      'class_code', v_code,
      'academic_year_id', p_academic_year_id,
      'lead_teacher', v_actor
    ),
    jsonb_build_object('idempotency_key', v_key)
  );

  return v_class_id;
end;
$$;

revoke all on function public.can_create_school_class(uuid) from public, anon;
revoke all on function public.get_my_school_contexts() from public, anon;
revoke all on function public.get_school_home_snapshot(uuid) from public, anon;
revoke all on function public.invite_school_staff_with_class(uuid, text, text, uuid, text)
  from public, anon;
revoke all on function public.resend_school_invitation(uuid) from public, anon;
revoke all on function public.revoke_school_invitation(uuid) from public, anon;
revoke all on function public.deactivate_school_member(uuid, uuid) from public, anon;

grant execute on function public.can_create_school_class(uuid) to authenticated;
grant execute on function public.get_my_school_contexts() to authenticated;
grant execute on function public.get_school_home_snapshot(uuid) to authenticated;
grant execute on function public.invite_school_staff_with_class(uuid, text, text, uuid, text)
  to authenticated;
grant execute on function public.resend_school_invitation(uuid) to authenticated;
grant execute on function public.revoke_school_invitation(uuid) to authenticated;
grant execute on function public.deactivate_school_member(uuid, uuid) to authenticated;

commit;
