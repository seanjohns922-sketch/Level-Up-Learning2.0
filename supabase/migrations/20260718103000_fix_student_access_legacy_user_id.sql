begin;

-- School-only students authenticate with an opaque student session. Home-linked
-- access is represented by parent_student_links; the production students table
-- does not consistently contain the legacy user_id column.
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
begin
  if exists (
    select 1
    from public.students s
    where s.id = target_student_id
      and (
        public.teacher_owns_class(s.class_id)
        or exists (
          select 1
          from public.parent_student_links psl
          where psl.student_id = s.id
            and psl.parent_user_id = auth.uid()
            and psl.status = 'active'
        )
      )
  ) then
    return true;
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
