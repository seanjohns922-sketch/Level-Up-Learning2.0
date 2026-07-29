begin;

-- A leading teacher remains a teacher for tenancy and class permissions, but
-- can inspect the school-wide overview. This avoids granting principal or
-- school-administrator powers such as staff management.
create or replace function public.can_view_school_administration(
  p_school_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_platform_admin()
    or public.has_school_role(
      p_school_id,
      array['school_admin', 'principal']
    )
    or exists (
      select 1
      from public.school_memberships membership
      join public.schools school on school.id = membership.school_id
      where membership.school_id = p_school_id
        and membership.user_id = auth.uid()
        and membership.status = 'active'
        and membership.role = 'teacher'
        and school.status = 'active'
        and membership.permissions
          @> '{"can_view_school_overview": true}'::jsonb
    );
$$;

revoke all on function public.can_view_school_administration(uuid)
  from public, anon;
grant execute on function public.can_view_school_administration(uuid)
  to authenticated;

do $$
declare
  v_school_id uuid;
  v_account_key text;
  v_aliases text[];
  v_user_id uuid;
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

  foreach v_account_key in array array[
    'amy.hollisters',
    'marika.newey',
    'miranda.johns'
  ]
  loop
    v_aliases := case v_account_key
      when 'amy.hollisters' then array['amy.hollisters', 'amy.hollister']
      when 'marika.newey' then array['marika.newey', 'mairkia.newey']
      else array['miranda.johns']
    end;

    select
      count(*),
      (array_agg(teacher.id order by teacher.id))[1]
    into v_match_count, v_user_id
    from public.teachers teacher
    where lower(split_part(coalesce(teacher.email, ''), '@', 1))
        = any(v_aliases)
      or regexp_replace(
          lower(coalesce(teacher.display_name, '')),
          '[^a-z0-9]+',
          '',
          'g'
        ) = any(
        select regexp_replace(alias, '[^a-z0-9]+', '', 'g')
        from unnest(v_aliases) alias
      );

    if v_match_count <> 1 then
      raise exception
        'Expected one teacher account for %, found %',
        v_account_key,
        v_match_count;
    end if;

    update public.school_memberships membership
    set
      role = 'teacher',
      status = 'active',
      permissions = case
        when v_account_key = 'miranda.johns'
          then coalesce(membership.permissions, '{}'::jsonb)
            || jsonb_build_object('can_view_school_overview', true)
        else coalesce(membership.permissions, '{}'::jsonb)
          - 'can_view_school_overview'
      end,
      accepted_at = coalesce(membership.accepted_at, now()),
      ended_at = null,
      updated_at = now()
    where membership.school_id = v_school_id
      and membership.user_id = v_user_id;

    if not found then
      raise exception
        'Active Cobram Primary membership not found for %',
        v_account_key;
    end if;

    insert into public.school_audit_log (
      school_id,
      actor_user_id,
      action,
      target_type,
      target_id,
      previous_state,
      new_state,
      metadata
    ) values (
      v_school_id,
      null,
      'school_role_configured',
      'school_membership',
      v_user_id::text,
      null,
      jsonb_build_object(
        'role', 'teacher',
        'can_view_school_overview',
        v_account_key = 'miranda.johns'
      ),
      jsonb_build_object(
        'migration', '20260729122000_configure_cobram_school_roles',
        'account', v_account_key
      )
    );
  end loop;
end;
$$;

commit;
