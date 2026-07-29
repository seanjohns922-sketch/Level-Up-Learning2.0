begin;

create table if not exists public.student_explorer_codes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete restrict,
  code text not null,
  code_normalised text not null,
  status text not null default 'active'
    check (status in ('active', 'revoked')),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null,
  revocation_reason text,
  replacement_code_id uuid,
  constraint student_explorer_codes_code_format_check check (
    code ~ '^LUL-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}$'
    and code_normalised = replace(code, '-', '')
  ),
  constraint student_explorer_codes_revocation_check check (
    (
      status = 'active'
      and revoked_at is null
      and revoked_by is null
      and revocation_reason is null
      and replacement_code_id is null
    )
    or (
      status = 'revoked'
      and revoked_at is not null
      and nullif(trim(revocation_reason), '') is not null
      and replacement_code_id is not null
    )
  )
);

alter table public.student_explorer_codes
  drop constraint if exists student_explorer_codes_replacement_code_id_fkey;
alter table public.student_explorer_codes
  add constraint student_explorer_codes_replacement_code_id_fkey
  foreign key (replacement_code_id)
  references public.student_explorer_codes(id)
  on delete restrict
  deferrable initially deferred;

create unique index if not exists student_explorer_codes_code_normalised_key
  on public.student_explorer_codes(code_normalised);
create unique index if not exists student_explorer_codes_one_active_per_student
  on public.student_explorer_codes(student_id)
  where status = 'active';
create index if not exists student_explorer_codes_student_history_idx
  on public.student_explorer_codes(student_id, created_at desc);

create or replace function public.normalise_explorer_code(p_code text)
returns text
language sql
immutable
strict
set search_path = public
as $$
  select regexp_replace(upper(trim(p_code)), '[^A-Z0-9]', '', 'g');
$$;

create or replace function public.generate_explorer_code_candidate()
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_alphabet constant text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  v_bytes bytea;
  v_body text := '';
  v_index integer;
begin
  while length(v_body) < 8 loop
    v_bytes := extensions.gen_random_bytes(16);
    for v_index in 0..15 loop
      -- Reject the upper eight byte values so modulo 31 is unbiased.
      if get_byte(v_bytes, v_index) < 248 then
        v_body := v_body || substr(
          v_alphabet,
          (get_byte(v_bytes, v_index) % length(v_alphabet)) + 1,
          1
        );
      end if;
      exit when length(v_body) = 8;
    end loop;
  end loop;

  return 'LUL-' || substr(v_body, 1, 4) || '-' || substr(v_body, 5, 4);
end;
$$;

create or replace function public.ensure_student_explorer_code_internal(
  p_student_id uuid,
  p_created_by uuid default null
)
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_code text;
begin
  if not exists (
    select 1 from public.students student where student.id = p_student_id
  ) then
    raise exception 'Student not found';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_student_id::text, 0));

  select explorer.code
  into v_code
  from public.student_explorer_codes explorer
  where explorer.student_id = p_student_id
    and explorer.status = 'active'
  limit 1;

  if v_code is not null then
    return v_code;
  end if;

  loop
    v_code := public.generate_explorer_code_candidate();
    begin
      insert into public.student_explorer_codes (
        student_id,
        code,
        code_normalised,
        created_by
      ) values (
        p_student_id,
        v_code,
        public.normalise_explorer_code(v_code),
        p_created_by
      );
      return v_code;
    exception
      when unique_violation then
        select explorer.code
        into v_code
        from public.student_explorer_codes explorer
        where explorer.student_id = p_student_id
          and explorer.status = 'active'
        limit 1;

        if v_code is not null then
          return v_code;
        end if;
    end;
  end loop;
end;
$$;

create or replace function public.ensure_student_explorer_code(
  p_student_id uuid
)
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Login required' using errcode = '42501';
  end if;
  if not public.is_platform_admin()
    and not public.can_manage_student(p_student_id)
  then
    raise exception 'Student access denied' using errcode = '42501';
  end if;

  return public.ensure_student_explorer_code_internal(
    p_student_id,
    auth.uid()
  );
end;
$$;

create or replace function public.assign_explorer_code_after_student_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ensure_student_explorer_code_internal(new.id, auth.uid());
  return new;
end;
$$;

drop trigger if exists students_assign_explorer_code on public.students;
create trigger students_assign_explorer_code
after insert on public.students
for each row execute function public.assign_explorer_code_after_student_insert();

do $$
declare
  v_student record;
  v_created integer := 0;
begin
  for v_student in
    select student.id
    from public.students student
    where not exists (
      select 1
      from public.student_explorer_codes explorer
      where explorer.student_id = student.id
        and explorer.status = 'active'
    )
    order by student.id
  loop
    perform public.ensure_student_explorer_code_internal(v_student.id, null);
    v_created := v_created + 1;
  end loop;

  raise notice 'Explorer Code backfill created % codes', v_created;
end;
$$;

-- The replacement link is deferred so a reset can revoke the old row before
-- inserting its replacement. Resolve backfill trigger events before the later
-- ALTER TABLE statement; PostgreSQL will otherwise reject that ALTER.
set constraints student_explorer_codes_replacement_code_id_fkey immediate;

create or replace function public.get_student_explorer_codes(
  p_student_ids uuid[]
)
returns table (
  student_id uuid,
  explorer_code text
)
language sql
stable
security definer
set search_path = public
as $$
  select explorer.student_id, explorer.code
  from public.student_explorer_codes explorer
  where explorer.status = 'active'
    and explorer.student_id = any(coalesce(p_student_ids, '{}'::uuid[]))
    and public.can_view_student(explorer.student_id)
  order by explorer.student_id;
$$;

create or replace function public.lookup_student_by_explorer_code(
  p_code text
)
returns table (
  student_id uuid,
  display_name text,
  school_id uuid,
  explorer_code text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    student.id,
    student.display_name,
    student.school_id,
    explorer.code
  from public.student_explorer_codes explorer
  join public.students student on student.id = explorer.student_id
  where explorer.status = 'active'
    and explorer.code_normalised = public.normalise_explorer_code(p_code)
    and public.can_view_student(student.id)
  limit 1;
$$;

create or replace function public.get_school_student_directory(
  p_school_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.can_manage_school(p_school_id) then
    raise exception 'School student directory access denied'
      using errcode = '42501';
  end if;

  return (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', student.id,
          'name', student.display_name,
          'yearLevel', coalesce(student.school_year_level, student.year_level),
          'username', student.username,
          'pinStatus', case
            when student.pin is not null
              or exists (
                select 1
                from public.student_access_credentials credential
                where credential.student_id = student.id
                  and credential.credential_type = 'pin'
                  and credential.revoked_at is null
              )
            then 'set'
            else 'not_set'
          end,
          'explorerCode', explorer.code,
          'classes', (
            select coalesce(
              jsonb_agg(distinct class.name order by class.name),
              '[]'::jsonb
            )
            from public.classes class
            where class.school_id = p_school_id
              and (
                class.id = student.class_id
                or exists (
                  select 1
                  from public.class_enrollments enrolment
                  where enrolment.student_id = student.id
                    and enrolment.class_id = class.id
                    and enrolment.status = 'active'
                    and enrolment.ended_at is null
                )
              )
          ),
          'status', case
            when student.archived_at is null then 'active'
            else 'archived'
          end
        )
        order by student.display_name, student.id
      ),
      '[]'::jsonb
    )
    from public.students student
    join public.student_explorer_codes explorer
      on explorer.student_id = student.id
     and explorer.status = 'active'
    where student.school_id = p_school_id
  );
end;
$$;

create or replace function public.reset_student_explorer_code(
  p_school_id uuid,
  p_student_id uuid,
  p_reason text
)
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_school_id uuid;
  v_old_id uuid;
  v_new_id uuid := gen_random_uuid();
  v_new_code text;
  v_reason text := nullif(trim(p_reason), '');
begin
  if v_actor is null then
    raise exception 'Login required' using errcode = '42501';
  end if;
  if v_reason is null then
    raise exception 'Reset reason is required';
  end if;

  select student.school_id
  into v_school_id
  from public.students student
  where student.id = p_student_id;

  if not found then
    raise exception 'Student not found';
  end if;
  if v_school_id is distinct from p_school_id then
    raise exception 'Student does not belong to the active school'
      using errcode = '42501';
  end if;
  if not public.is_platform_admin()
    and not public.can_manage_school(p_school_id)
  then
    raise exception 'Explorer Code reset denied' using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_student_id::text, 0));

  select explorer.id
  into v_old_id
  from public.student_explorer_codes explorer
  where explorer.student_id = p_student_id
    and explorer.status = 'active'
  for update;

  if v_old_id is null then
    raise exception 'Active Explorer Code not found';
  end if;

  loop
    v_new_code := public.generate_explorer_code_candidate();
    exit when not exists (
      select 1
      from public.student_explorer_codes explorer
      where explorer.code_normalised =
        public.normalise_explorer_code(v_new_code)
    );
  end loop;

  update public.student_explorer_codes
  set
    status = 'revoked',
    revoked_at = now(),
    revoked_by = v_actor,
    revocation_reason = v_reason,
    replacement_code_id = v_new_id
  where id = v_old_id;

  insert into public.student_explorer_codes (
    id,
    student_id,
    code,
    code_normalised,
    created_by
  ) values (
    v_new_id,
    p_student_id,
    v_new_code,
    public.normalise_explorer_code(v_new_code),
    v_actor
  );

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
    v_actor,
    'student_explorer_code_reset',
    'student',
    p_student_id::text,
    jsonb_build_object('code_record_id', v_old_id, 'status', 'revoked'),
    jsonb_build_object('code_record_id', v_new_id, 'status', 'active'),
    jsonb_build_object('reason', v_reason)
  );

  return v_new_code;
end;
$$;

alter table public.student_explorer_codes enable row level security;

drop policy if exists "Authorised staff can read Explorer Codes"
  on public.student_explorer_codes;
create policy "Authorised staff can read Explorer Codes"
on public.student_explorer_codes for select to authenticated
using (
  status = 'active'
  and public.can_view_student(student_id)
);

revoke all on public.student_explorer_codes
  from public, anon, authenticated;
revoke all on function public.normalise_explorer_code(text)
  from public, anon;
revoke all on function public.generate_explorer_code_candidate()
  from public, anon, authenticated;
revoke all on function public.ensure_student_explorer_code_internal(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.ensure_student_explorer_code(uuid)
  from public, anon;
revoke all on function public.get_student_explorer_codes(uuid[])
  from public, anon;
revoke all on function public.lookup_student_by_explorer_code(text)
  from public, anon;
revoke all on function public.get_school_student_directory(uuid)
  from public, anon;
revoke all on function public.reset_student_explorer_code(uuid, uuid, text)
  from public, anon;

grant select on public.student_explorer_codes to authenticated;
grant execute on function public.normalise_explorer_code(text)
  to authenticated;
grant execute on function public.ensure_student_explorer_code(uuid)
  to authenticated;
grant execute on function public.get_student_explorer_codes(uuid[])
  to authenticated;
grant execute on function public.lookup_student_by_explorer_code(text)
  to authenticated;
grant execute on function public.get_school_student_directory(uuid)
  to authenticated;
grant execute on function public.reset_student_explorer_code(uuid, uuid, text)
  to authenticated;

commit;
