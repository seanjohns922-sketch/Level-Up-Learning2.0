begin;

-- Manual only. Existing tables, history and RLS stay in place; installation
-- changes no student years, enrolments, working levels or learning records.
create function public.school_year_review_token(p_school_id uuid,p_target_year integer)
returns text language sql stable security definer set search_path=public as $$
  select md5(jsonb_build_object(
    'target',p_target_year,
    'settings',(select to_jsonb(r) from school_year_rollover_settings r where school_id=p_school_id),
    'students',(select jsonb_agg(jsonb_build_array(s.id,s.display_name,s.school_year_level,s.year_level,s.school_year_calendar_year) order by s.id)
      from students s where s.school_id=p_school_id and s.archived_at is null and coalesce(s.identity_status,'active')='active'),
    'exceptions',(select jsonb_agg(to_jsonb(e) order by e.student_id) from school_year_retention_exceptions e where school_id=p_school_id and target_year=p_target_year),
    'history',(select jsonb_agg(to_jsonb(h) order by h.student_id) from school_year_rollover_history h where school_id=p_school_id and target_year=p_target_year)
  )::text);
$$;
revoke all on function public.school_year_review_token(uuid,integer) from public,anon,authenticated,service_role;

create function public.get_school_year_rollover_preview(p_school_id uuid,p_target_year integer default null)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare
  v_year integer := extract(year from now() at time zone 'Australia/Melbourne')::integer;
  v_target integer := coalesce(p_target_year, extract(year from now() at time zone 'Australia/Melbourne')::integer + case when extract(month from now() at time zone 'Australia/Melbourne')>=7 then 1 else 0 end);
  v_result jsonb;
begin
  if auth.uid() is null or not public.can_manage_school(p_school_id) then raise exception 'School management access denied' using errcode='42501'; end if;
  if v_target not between v_year and v_year+1 then raise exception 'Choose this calendar year or next year'; end if;
  v_result := public.get_school_year_rollover(p_school_id);
  return v_result || jsonb_build_object('targetYear',v_target,'prepared',exists(select 1 from school_year_rollover_settings where school_id=p_school_id),'reviewToken',public.school_year_review_token(p_school_id,v_target),
    'students',coalesce((select jsonb_agg(jsonb_build_object(
      'id',s.id,'name',s.display_name,'yearLevel',coalesce(s.school_year_level,s.year_level),
      'calendarYear',s.school_year_calendar_year,
      'processed',exists(select 1 from school_year_rollover_history h where h.student_id=s.id and h.target_year=v_target),
      'retain',exists(select 1 from school_year_retention_exceptions e where e.student_id=s.id and e.school_id=p_school_id and e.target_year=v_target)
    ) order by s.display_name,s.id) from students s where s.school_id=p_school_id and s.archived_at is null and coalesce(s.identity_status,'active')='active'),'[]'::jsonb),
    'lastResults',coalesce((select jsonb_agg(jsonb_build_object('id',s.id,'name',s.display_name,
      'previousYearLevel',h.previous_year_level,'newYearLevel',h.new_year_level,'outcome',h.outcome,'targetYear',h.target_year)
      order by s.display_name,s.id) from school_year_rollover_history h join students s on s.id=h.student_id
      where h.school_id=p_school_id and s.school_id=p_school_id and h.target_year=v_target and s.archived_at is null and coalesce(s.identity_status,'active')='active'),'[]'::jsonb));
end;
$$;

create function public.save_school_year_preparation(p_school_id uuid,p_target_year integer,p_highest_year integer,p_students jsonb,p_review_token text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_year integer := extract(year from now() at time zone 'Australia/Melbourne')::integer;
  v_ids uuid[]; v_row record; v_before integer;
begin
  if auth.uid() is null or not public.can_manage_school(p_school_id) then raise exception 'School management access denied' using errcode='42501'; end if;
  if p_target_year is null or p_target_year not between v_year and v_year+1 or p_highest_year is null or p_highest_year not between 6 and 8 then raise exception 'Choose a valid school and calendar year'; end if;
  if p_students is null or jsonb_typeof(p_students)<>'array' then raise exception 'Student year choices are required'; end if;
  perform 1 from schools where id=p_school_id and status='active' for no key update;
  if not found then raise exception 'School is not active'; end if;
  v_ids := array(select id from students where school_id=p_school_id and archived_at is null and coalesce(identity_status,'active')='active' order by id);
  perform 1 from students where id=any(v_ids) order by id for update;
  if p_review_token is distinct from public.school_year_review_token(p_school_id,p_target_year) then raise exception 'The student list changed. Reload the preview and review it again.'; end if;
  if jsonb_array_length(p_students)<>cardinality(v_ids)
    or (select count(distinct x.id) from jsonb_to_recordset(p_students) x(id uuid))<>cardinality(v_ids)
    or exists(select 1 from jsonb_to_recordset(p_students) x(id uuid,"calendarYear" integer,retain boolean)
      where x.id is null or not(x.id=any(v_ids)) or x."calendarYear" is null or x."calendarYear" not between p_target_year-1 and v_year+1 or x.retain is null) then
    raise exception 'Review the calendar year for every active student';
  end if;
  for v_row in select * from jsonb_to_recordset(p_students) x(id uuid,"calendarYear" integer,retain boolean) loop
    select school_year_calendar_year into v_before from students where id=v_row.id;
    if v_before is distinct from v_row."calendarYear" then
      if exists(select 1 from school_year_rollover_history where student_id=v_row.id and target_year>v_row."calendarYear") then
        raise exception 'A processed student cannot be moved back to an earlier calendar year';
      end if;
      update students set school_year_calendar_year=v_row."calendarYear" where id=v_row.id;
      perform write_school_audit(p_school_id,'school_year_calendar_confirmed','student',v_row.id::text,
        jsonb_build_object('calendarYear',v_before),jsonb_build_object('calendarYear',v_row."calendarYear"),'{}');
    end if;
  end loop;
  insert into school_year_rollover_settings(school_id,highest_year,enabled,first_year,updated_by)
    values(p_school_id,p_highest_year,false,p_target_year,auth.uid())
    on conflict(school_id) do update set highest_year=excluded.highest_year,enabled=false,updated_by=auth.uid(),updated_at=now();
  delete from school_year_retention_exceptions where school_id=p_school_id and target_year=p_target_year;
  insert into school_year_retention_exceptions(student_id,school_id,target_year,created_by)
    select x.id,p_school_id,p_target_year,auth.uid() from jsonb_to_recordset(p_students) x(id uuid,"calendarYear" integer,retain boolean)
    where x.retain and x."calendarYear"<p_target_year;
  perform write_school_audit(p_school_id,'manual_school_year_prepared','school',p_school_id::text,null,
    jsonb_build_object('targetYear',p_target_year,'highestYear',p_highest_year),'{}');
  return get_school_year_rollover_preview(p_school_id,p_target_year);
end;
$$;

create function public.start_school_year(p_school_id uuid,p_target_year integer,p_review_token text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_year integer := extract(year from now() at time zone 'Australia/Melbourne')::integer;
  v_ids uuid[]; v_student record; v_highest integer; v_level integer; v_before text; v_after text; v_outcome text; v_count integer:=0;
begin
  if auth.uid() is null or not public.can_manage_school(p_school_id) then raise exception 'School management access denied' using errcode='42501'; end if;
  if p_target_year is null or p_target_year not between v_year and v_year+1 then raise exception 'Choose this calendar year or next year'; end if;
  perform 1 from schools where id=p_school_id and status='active' for no key update;
  if not found then raise exception 'School is not active'; end if;
  select highest_year into v_highest from school_year_rollover_settings where school_id=p_school_id;
  if v_highest is null then raise exception 'Save and review the school-year preparation first'; end if;
  v_ids := array(select id from students where school_id=p_school_id and archived_at is null and coalesce(identity_status,'active')='active' order by id);
  perform 1 from students where id=any(v_ids) order by id for update;
  if p_review_token is distinct from school_year_review_token(p_school_id,p_target_year) then raise exception 'The student list changed. Reload the preview and review it again.'; end if;
  if exists(select 1 from students where id=any(v_ids) and school_year_calendar_year<p_target_year
    and (school_year_calendar_year<>p_target_year-1 or coalesce(school_year_level,year_level,'') !~ '^(Prep|Year [1-8])$')) then
    raise exception 'Review missing or older student year details before starting the new year';
  end if;
  for v_student in select * from students where id=any(v_ids) and school_year_calendar_year<p_target_year order by id loop
    if exists(select 1 from school_year_rollover_history where student_id=v_student.id and target_year=p_target_year) then continue; end if;
    v_before:=coalesce(v_student.school_year_level,v_student.year_level); v_after:=v_before;
    v_level:=case when v_before='Prep' then 0 else right(v_before,1)::integer end;
    if exists(select 1 from school_year_retention_exceptions where student_id=v_student.id and school_id=p_school_id and target_year=p_target_year) then v_outcome:='retained';
    elsif v_level>=v_highest then v_outcome:='leaver_review';
    else v_after:='Year '||(v_level+1)::text; v_outcome:='promoted'; end if;
    insert into school_year_rollover_history(student_id,school_id,target_year,previous_year_level,new_year_level,outcome)
      values(v_student.id,p_school_id,p_target_year,v_before,v_after,v_outcome);
    update students set school_year_level=v_after,year_level=v_after,school_year_calendar_year=p_target_year where id=v_student.id;
    v_count:=v_count+1;
  end loop;
  perform write_school_audit(p_school_id,'manual_school_year_started','school',p_school_id::text,null,
    jsonb_build_object('targetYear',p_target_year,'processed',v_count),'{}');
  return get_school_year_rollover_preview(p_school_id,p_target_year);
end;
$$;

create function public.retain_student_after_manual_rollover(p_school_id uuid,p_student_id uuid,p_target_year integer)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_student students%rowtype; v_history school_year_rollover_history%rowtype;
  v_year integer:=extract(year from now() at time zone 'Australia/Melbourne')::integer;
begin
  if auth.uid() is null or not can_manage_school(p_school_id) then raise exception 'School management access denied' using errcode='42501'; end if;
  if p_target_year is null or p_target_year not between v_year and v_year+1 then raise exception 'Only this or next calendar year can be corrected'; end if;
  perform 1 from schools where id=p_school_id and status='active' for no key update;
  if not found then raise exception 'School is not active'; end if;
  select * into v_student from students where id=p_student_id and school_id=p_school_id and archived_at is null and coalesce(identity_status,'active')='active' for update;
  if v_student.id is null or v_student.school_year_calendar_year<>p_target_year then raise exception 'The student year has changed; reload and review'; end if;
  select * into v_history from school_year_rollover_history where student_id=p_student_id and school_id=p_school_id and target_year=p_target_year for update;
  if v_history.outcome='retained' then return get_school_year_rollover_preview(p_school_id,p_target_year); end if;
  if v_history.outcome is distinct from 'promoted' or coalesce(v_student.school_year_level,v_student.year_level) is distinct from v_history.new_year_level then raise exception 'The student year has changed; review it in Students instead'; end if;
  update students set school_year_level=v_history.previous_year_level,year_level=v_history.previous_year_level where id=p_student_id;
  update school_year_rollover_history set new_year_level=previous_year_level,outcome='retained',corrected_by=auth.uid() where student_id=p_student_id and target_year=p_target_year;
  perform write_school_audit(p_school_id,'school_year_retention_corrected','student',p_student_id::text,
    jsonb_build_object('yearLevel',v_history.new_year_level),jsonb_build_object('yearLevel',v_history.previous_year_level),'{}');
  return get_school_year_rollover_preview(p_school_id,p_target_year);
end;
$$;

-- Preserve the canonical creation/duplicate/credential path. Calendar metadata
-- is written in the same transaction, only for a genuinely new identity.
create function public.create_school_student_for_year(p_school_id uuid,p_class_id uuid,p_first_name text,p_last_name text,p_school_year_level text,
  p_calendar_year integer,p_username text default null,p_pin text default null,p_idempotency_key text default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_year integer:=extract(year from now() at time zone 'Australia/Melbourne')::integer; v_result jsonb; v_existing jsonb;
  v_key text:=nullif(trim(p_idempotency_key),'');
begin
  if auth.uid() is null or not can_manage_school(p_school_id) then raise exception 'School management access denied' using errcode='42501'; end if;
  if v_key is null then raise exception 'An idempotency key is required'; end if;
  if p_calendar_year is null or p_calendar_year not between v_year and v_year+1 then raise exception 'Choose the calendar year these year groups apply to'; end if;
  perform 1 from schools where id=p_school_id and status='active' for no key update;
  if not found then raise exception 'School is not active'; end if;
  select result into v_existing from school_command_receipts where school_id=p_school_id and actor_user_id=auth.uid() and command_name='create_school_student' and idempotency_key=v_key;
  if v_existing is not null then
    if (v_existing->>'schoolYearCalendarYear')::integer is distinct from p_calendar_year then raise exception 'This creation request has already been used. Reload the student list.'; end if;
    return v_existing;
  end if;
  v_result:=create_school_student(p_school_id,p_class_id,p_first_name,p_last_name,p_school_year_level,p_username,p_pin,v_key);
  update students set school_year_calendar_year=p_calendar_year where id=(v_result->>'studentId')::uuid and school_id=p_school_id;
  v_result:=v_result||jsonb_build_object('schoolYearCalendarYear',p_calendar_year);
  update school_command_receipts set result=v_result where school_id=p_school_id and actor_user_id=auth.uid() and command_name='create_school_student' and idempotency_key=v_key;
  perform write_school_audit(p_school_id,'school_year_calendar_confirmed','student',v_result->>'studentId',null,jsonb_build_object('calendarYear',p_calendar_year),'{}');
  return v_result;
end;
$$;

revoke all on function public.get_school_year_rollover_preview(uuid,integer),public.save_school_year_preparation(uuid,integer,integer,jsonb,text),
 public.start_school_year(uuid,integer,text),public.retain_student_after_manual_rollover(uuid,uuid,integer),
 public.create_school_student_for_year(uuid,uuid,text,text,text,integer,text,text,text) from public,anon;
grant execute on function public.get_school_year_rollover_preview(uuid,integer),public.save_school_year_preparation(uuid,integer,integer,jsonb,text),
 public.start_school_year(uuid,integer,text),public.retain_student_after_manual_rollover(uuid,uuid,integer),
 public.create_school_student_for_year(uuid,uuid,text,text,text,integer,text,text,text) to authenticated;
-- Retired global worker cannot be called by an app service; no schedule is added.
revoke execute on function public.run_school_year_rollover() from service_role;
commit;
