begin;

-- First educator association is invitation-only. The school code identifies
-- the tenant, while the signed-in email must match an unexpired invitation.
create or replace function public.activate_school_membership_with_code(
  p_school_code text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_email text;
  v_code text := upper(trim(coalesce(p_school_code, '')));
  v_school public.schools%rowtype;
  v_invitation public.school_invitations%rowtype;
begin
  if v_actor is null then
    raise exception 'Login required' using errcode = '42501';
  end if;
  if v_code !~ '^[A-Z0-9]{5,16}$' then
    raise exception 'Enter the valid school code from your invitation';
  end if;

  select lower(email)
  into v_email
  from auth.users
  where id = v_actor;

  select *
  into v_school
  from public.schools school
  where upper(school.school_code) = v_code
    and school.status = 'active';

  if v_school.id is null then
    raise exception 'School code not recognised';
  end if;

  if exists (
    select 1
    from public.school_memberships membership
    where membership.school_id = v_school.id
      and membership.user_id = v_actor
      and membership.status = 'active'
  ) then
    return v_school.id;
  end if;

  select *
  into v_invitation
  from public.school_invitations invitation
  where invitation.school_id = v_school.id
    and lower(invitation.email) = v_email
    and invitation.status = 'pending'
    and invitation.expires_at > now()
  order by invitation.created_at desc
  limit 1
  for update;

  if v_invitation.id is null then
    raise exception
      'No active school invitation matches this email and school code'
      using errcode = '42501';
  end if;

  insert into public.school_memberships (
    school_id,
    user_id,
    role,
    status,
    invited_by,
    accepted_at
  ) values (
    v_school.id,
    v_actor,
    v_invitation.role,
    'active',
    v_invitation.invited_by,
    now()
  )
  on conflict (school_id, user_id) do update set
    role = excluded.role,
    status = 'active',
    invited_by = excluded.invited_by,
    accepted_at = now(),
    ended_at = null,
    updated_at = now();

  update public.school_invitations
  set
    status = 'accepted',
    accepted_by = v_actor,
    accepted_at = now(),
    updated_at = now()
  where id = v_invitation.id;

  perform public.write_school_audit(
    v_school.id,
    'school_invitation_accepted_by_code',
    'school_membership',
    v_actor::text,
    null,
    jsonb_build_object(
      'role', v_invitation.role,
      'status', 'active'
    ),
    jsonb_build_object(
      'invitation_id', v_invitation.id,
      'activation_method', 'school_code'
    )
  );

  return v_school.id;
end;
$$;

revoke all on function public.activate_school_membership_with_code(text)
  from public, anon;
grant execute on function public.activate_school_membership_with_code(text)
  to authenticated;

do $$
declare
  v_school_id uuid;
  v_miranda_id uuid;
  v_match_count integer;
begin
  select school.id
  into v_school_id
  from public.schools school
  where regexp_replace(
    lower(school.name),
    '[^a-z0-9]+',
    '',
    'g'
  ) in ('cobramprimary', 'cobramprimaryschool')
    and school.status = 'active'
  order by (
    select count(*)
    from public.classes class
    where class.school_id = school.id
      and class.status = 'active'
  ) desc,
  school.created_at,
  school.id
  limit 1;

  if v_school_id is null then
    raise exception 'Active Cobram Primary school tenant not found';
  end if;

  if exists (
    select 1
    from public.schools school
    where upper(school.school_code) = 'COB2026'
      and school.id <> v_school_id
  ) then
    raise exception 'School code COB2026 is already assigned to another school';
  end if;

  update public.schools
  set school_code = 'COB2026', updated_at = now()
  where id = v_school_id;

  select
    count(*),
    (array_agg(teacher.id order by teacher.id))[1]
  into v_match_count, v_miranda_id
  from public.teachers teacher
  where lower(split_part(coalesce(teacher.email, ''), '@', 1))
      = 'miranda.johns'
    or regexp_replace(
      lower(coalesce(teacher.display_name, '')),
      '[^a-z0-9]+',
      '',
      'g'
    ) = 'mirandajohns';

  if v_match_count <> 1 then
    raise exception
      'Expected one Miranda Johns account, found %',
      v_match_count;
  end if;

  update public.school_memberships
  set
    role = 'school_admin',
    status = 'active',
    permissions = permissions - 'can_view_school_overview',
    accepted_at = coalesce(accepted_at, now()),
    ended_at = null,
    updated_at = now()
  where school_id = v_school_id
    and user_id = v_miranda_id;

  if not found then
    raise exception 'Cobram Primary membership not found for Miranda Johns';
  end if;

  perform public.write_school_audit(
    v_school_id,
    'school_administrator_configured',
    'school_membership',
    v_miranda_id::text,
    null,
    jsonb_build_object('role', 'school_admin', 'status', 'active'),
    jsonb_build_object(
      'migration', '20260729123000_final_school_login_admin_model'
    )
  );
end;
$$;

commit;
