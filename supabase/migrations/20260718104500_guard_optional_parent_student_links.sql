begin;

-- Some school-only deployments predate parent_student_links. Keep linked-home
-- access when that table exists without making student token validation depend
-- on an optional relation being present.
create or replace function public.can_access_student(target_student_id uuid)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  supplied_token text := public.request_student_session_token();
  matched_session_id uuid;
  linked_user_has_access boolean := false;
begin
  if exists (
    select 1
    from public.students s
    where s.id = target_student_id
      and public.teacher_owns_class(s.class_id)
  ) then
    return true;
  end if;

  if auth.uid() is not null
    and to_regclass('public.parent_student_links') is not null then
    execute $linked_access$
      select exists (
        select 1
        from public.parent_student_links psl
        where psl.student_id = $1
          and psl.parent_user_id = $2
          and psl.status = 'active'
      )
    $linked_access$
    into linked_user_has_access
    using target_student_id, auth.uid();

    if linked_user_has_access then
      return true;
    end if;
  end if;

  if supplied_token is null then
    return false;
  end if;

  select sas.id into matched_session_id
  from public.student_access_sessions sas
  where sas.student_id = target_student_id
    and sas.token_hash = encode(extensions.digest(supplied_token, 'sha256'), 'hex')
    and sas.revoked_at is null
    and sas.expires_at > now()
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

revoke all on function public.can_access_student(uuid) from public, anon, authenticated;

commit;
