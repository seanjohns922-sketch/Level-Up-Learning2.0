begin;

-- Calendar-year metadata only: installing this migration does not promote anyone.
alter table public.students add column school_year_calendar_year integer not null
  default extract(year from now() at time zone 'Australia/Melbourne')::integer;

create table public.school_year_rollover_settings (
  school_id uuid primary key references public.schools(id) on delete cascade,
  highest_year integer not null default 6 check (highest_year between 6 and 8),
  enabled boolean not null default false,
  first_year integer not null default (extract(year from now() at time zone 'Australia/Melbourne')::integer + 1),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
create table public.school_year_retention_exceptions (
  student_id uuid not null references public.students(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  target_year integer not null,
  created_by uuid references auth.users(id) on delete set null,
  primary key(student_id,target_year)
);
create table public.school_year_rollover_history (
  student_id uuid not null references public.students(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  target_year integer not null,
  previous_year_level text,
  new_year_level text,
  outcome text not null check(outcome in ('promoted','retained','leaver_review','year_review')),
  processed_at timestamptz not null default now(),
  corrected_by uuid references auth.users(id) on delete set null,
  primary key(student_id,target_year)
);
create index school_year_retention_school_year_idx on public.school_year_retention_exceptions(school_id,target_year);
create index school_year_rollover_history_school_year_idx on public.school_year_rollover_history(school_id,target_year);
alter table public.school_year_rollover_settings enable row level security;
alter table public.school_year_retention_exceptions enable row level security;
alter table public.school_year_rollover_history enable row level security;
revoke all on public.school_year_rollover_settings, public.school_year_retention_exceptions,
  public.school_year_rollover_history from public, anon, authenticated;

-- An explicit year edit or school transfer is already stated in current-year terms.
-- Keep its marker current so the next scheduled run cannot promote it again.
create function public.stamp_student_school_year() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  if new.school_id is distinct from old.school_id
     or new.school_year_level is distinct from old.school_year_level
     or new.year_level is distinct from old.year_level then
    new.school_year_calendar_year := greatest(new.school_year_calendar_year,
      extract(year from now() at time zone 'Australia/Melbourne')::integer);
  end if;
  return new;
end;
$$;
create trigger stamp_student_school_year_trigger
before update of school_id,school_year_level,year_level on public.students
for each row execute function public.stamp_student_school_year();
revoke all on function public.stamp_student_school_year() from public,anon,authenticated;

create function public.get_school_year_rollover(p_school_id uuid) returns jsonb
language plpgsql stable security definer set search_path=public as $$
declare
  v_year integer := extract(year from now() at time zone 'Australia/Melbourne')::integer;
  v_settings public.school_year_rollover_settings%rowtype;
begin
  if auth.uid() is null or not public.can_manage_school(p_school_id) then
    raise exception 'School management access denied' using errcode='42501';
  end if;
  select * into v_settings from public.school_year_rollover_settings where school_id=p_school_id;
  return jsonb_build_object(
    'calendarYear',v_year,'targetYear',v_year+1,
    'highestYear',coalesce(v_settings.highest_year,6),'enabled',coalesce(v_settings.enabled,false),
    'firstYear',coalesce(v_settings.first_year,v_year+1),
    'students',coalesce((select jsonb_agg(jsonb_build_object(
      'id',s.id,'name',s.display_name,'yearLevel',coalesce(s.school_year_level,s.year_level),
      'retain',exists(select 1 from public.school_year_retention_exceptions e
        where e.student_id=s.id and e.school_id=p_school_id and e.target_year=v_year+1)
    ) order by s.display_name,s.id) from public.students s
      where s.school_id=p_school_id and s.archived_at is null and coalesce(s.identity_status,'active')='active'),'[]'::jsonb),
    'lastResults',coalesce((select jsonb_agg(jsonb_build_object(
      'id',h.student_id,'name',s.display_name,'previousYearLevel',h.previous_year_level,
      'newYearLevel',h.new_year_level,'outcome',h.outcome,'targetYear',h.target_year
    ) order by s.display_name,h.student_id) from public.school_year_rollover_history h
      join public.students s on s.id=h.student_id
      where h.school_id=p_school_id and s.school_id=p_school_id and s.archived_at is null
        and coalesce(s.identity_status,'active')='active' and h.target_year=v_year),'[]'::jsonb));
end;
$$;

create function public.save_school_year_rollover(
  p_school_id uuid,p_highest_year integer,p_enabled boolean,p_target_year integer,
  p_retained_student_ids uuid[] default '{}'::uuid[]
) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_year integer := extract(year from now() at time zone 'Australia/Melbourne')::integer;
begin
  if auth.uid() is null or not public.can_manage_school(p_school_id) then
    raise exception 'School management access denied' using errcode='42501';
  end if;
  if p_highest_year is null or p_highest_year not between 6 and 8 or p_enabled is null
    or p_target_year is distinct from v_year+1 then
    raise exception 'Choose the final school year and next calendar year';
  end if;
  perform 1 from public.schools where id=p_school_id and status='active' for no key update;
  if not found then raise exception 'School is not active'; end if;
  -- Lock the same student rows used by transfers so exceptions stay school-scoped.
  perform 1 from public.students where id=any(coalesce(p_retained_student_ids,'{}'::uuid[])) order by id for update;
  if exists(select 1 from unnest(coalesce(p_retained_student_ids,'{}'::uuid[])) requested(id)
    where not exists(select 1 from public.students s where s.id=requested.id
      and s.school_id=p_school_id and s.archived_at is null and coalesce(s.identity_status,'active')='active')) then
    raise exception 'A retained student is no longer active in this school';
  end if;
  insert into public.school_year_rollover_settings(school_id,highest_year,enabled,first_year,updated_by)
  values(p_school_id,p_highest_year,p_enabled,v_year+1,auth.uid())
  on conflict(school_id) do update set highest_year=excluded.highest_year,
    enabled=excluded.enabled,updated_by=auth.uid(),updated_at=now();
  delete from public.school_year_retention_exceptions where school_id=p_school_id and target_year=p_target_year;
  insert into public.school_year_retention_exceptions(student_id,school_id,target_year,created_by)
  select distinct id,p_school_id,p_target_year,auth.uid() from unnest(coalesce(p_retained_student_ids,'{}'::uuid[])) requested(id);
  perform public.write_school_audit(p_school_id,'school_year_rollover_configured','school',p_school_id::text,
    null,jsonb_build_object('highestYear',p_highest_year,'enabled',p_enabled,'targetYear',p_target_year),
    jsonb_build_object('retainedStudentIds',coalesce(p_retained_student_ids,'{}'::uuid[])));
  return public.get_school_year_rollover(p_school_id);
end;
$$;

-- Private worker. Caller supplies the real local year; no client can choose a
-- future year. Separate parameter supports deterministic isolated SQL tests.
create function public.process_school_year_rollover(p_calendar_year integer) returns integer
language plpgsql security definer set search_path=public as $$
declare
  v_school record; v_student record; v_y integer; v_level integer;
  v_before text; v_after text; v_outcome text; v_count integer := 0;
begin
  for v_school in select r.* from public.school_year_rollover_settings r
    join public.schools s on s.id=r.school_id where r.enabled and s.status='active'
      and r.first_year<=p_calendar_year order by r.school_id
  loop
    -- Same lock order as configuration saves: school, then settings/students.
    perform 1 from public.schools where id=v_school.school_id and status='active' for no key update;
    if not found then continue; end if;
    select r.* into v_school from public.school_year_rollover_settings r
      where r.school_id=v_school.school_id and r.enabled and r.first_year<=p_calendar_year for share;
    if not found then continue; end if;
    for v_student in select s.* from public.students s
      where s.school_id=v_school.school_id and s.archived_at is null
        and coalesce(s.identity_status,'active')='active'
        and s.school_year_calendar_year<p_calendar_year order by s.id for update
    loop
      v_before := coalesce(v_student.school_year_level,v_student.year_level);
      for v_y in greatest(v_student.school_year_calendar_year+1,v_school.first_year)..p_calendar_year loop
        if exists(select 1 from public.school_year_rollover_history where student_id=v_student.id and target_year=v_y) then
          continue;
        end if;
        v_level := case when v_before='Prep' then 0 when v_before ~ '^Year [1-8]$' then right(v_before,1)::integer else null end;
        v_after := v_before;
        if v_level is null then v_outcome := 'year_review';
        elsif exists(select 1 from public.school_year_retention_exceptions e where e.student_id=v_student.id
          and e.school_id=v_school.school_id and e.target_year=v_y) then v_outcome := 'retained';
        elsif v_level>=v_school.highest_year then v_outcome := 'leaver_review';
        else v_after := 'Year '||(v_level+1)::text; v_outcome := 'promoted';
        end if;
        insert into public.school_year_rollover_history(student_id,school_id,target_year,previous_year_level,new_year_level,outcome)
          values(v_student.id,v_school.school_id,v_y,v_before,v_after,v_outcome);
        v_before := v_after;
        v_count := v_count+1;
      end loop;
      -- Deliberately do not touch working levels, classes, enrolments or learning data.
      update public.students set school_year_level=v_before,year_level=v_before,
        school_year_calendar_year=p_calendar_year where id=v_student.id;
    end loop;
  end loop;
  return v_count;
end;
$$;
revoke all on function public.process_school_year_rollover(integer) from public,anon,authenticated,service_role;

create function public.run_school_year_rollover() returns integer
language sql security definer set search_path=public as $$
  select public.process_school_year_rollover(extract(year from now() at time zone 'Australia/Melbourne')::integer);
$$;
revoke all on function public.run_school_year_rollover() from public,anon,authenticated;
grant execute on function public.run_school_year_rollover() to service_role;

create function public.retain_student_after_rollover(p_school_id uuid,p_student_id uuid,p_target_year integer)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_student public.students%rowtype; v_history public.school_year_rollover_history%rowtype;
begin
  if auth.uid() is null or not public.can_manage_school(p_school_id) then
    raise exception 'School management access denied' using errcode='42501';
  end if;
  if p_target_year is distinct from extract(year from now() at time zone 'Australia/Melbourne')::integer then
    raise exception 'Only the current school year can be corrected';
  end if;
  select * into v_student from public.students where id=p_student_id and school_id=p_school_id
    and archived_at is null and coalesce(identity_status,'active')='active' for update;
  if v_student.id is null then raise exception 'Student is not active in this school'; end if;
  select * into v_history from public.school_year_rollover_history where student_id=p_student_id
    and school_id=p_school_id and target_year=p_target_year for update;
  if v_history.outcome='retained' then return public.get_school_year_rollover(p_school_id); end if;
  if v_history.outcome is distinct from 'promoted'
    or coalesce(v_student.school_year_level,v_student.year_level) is distinct from v_history.new_year_level then
    raise exception 'The student year has changed; review it in Students instead';
  end if;
  update public.students set school_year_level=v_history.previous_year_level,year_level=v_history.previous_year_level
    where id=p_student_id;
  update public.school_year_rollover_history set new_year_level=previous_year_level,outcome='retained',corrected_by=auth.uid()
    where student_id=p_student_id and target_year=p_target_year;
  perform public.write_school_audit(p_school_id,'school_year_retention_corrected','student',p_student_id::text,
    jsonb_build_object('yearLevel',v_history.new_year_level),jsonb_build_object('yearLevel',v_history.previous_year_level),'{}');
  return public.get_school_year_rollover(p_school_id);
end;
$$;
revoke all on function public.get_school_year_rollover(uuid),
  public.save_school_year_rollover(uuid,integer,boolean,integer,uuid[]),
  public.retain_student_after_rollover(uuid,uuid,integer) from public,anon;
grant execute on function public.get_school_year_rollover(uuid),
  public.save_school_year_rollover(uuid,integer,boolean,integer,uuid[]),
  public.retain_student_after_rollover(uuid,uuid,integer) to authenticated;
commit;
