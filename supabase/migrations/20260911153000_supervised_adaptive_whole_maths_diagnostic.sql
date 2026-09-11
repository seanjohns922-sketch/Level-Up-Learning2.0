begin;

alter table public.whole_math_diagnostic_sittings
  add column if not exists academic_year integer not null default extract(year from current_date)::integer;
alter table public.whole_math_diagnostic_strand_results
  add column if not exists placement_protected boolean not null default false,
  add column if not exists probe_direction text null,
  add column if not exists source_assessment_id uuid null references public.student_realm_assessments(id) on delete set null;

-- Formal checkpoints are always whole-maths checkpoints. Keep the existing
-- implementation private behind a strict six-strand boundary; ad-hoc reviews
-- may still deliberately target a subset.
alter function public.teacher_start_whole_math_diagnostic(uuid,text,text[])
  rename to teacher_start_whole_math_diagnostic_v1;
revoke all on function public.teacher_start_whole_math_diagnostic_v1(uuid,text,text[]) from public,anon,authenticated;

create function public.teacher_start_whole_math_diagnostic(
  p_student_id uuid,p_checkpoint text,p_strands text[] default null
)
returns uuid language plpgsql security definer set search_path=public
as $$
declare v_strands text[]:=coalesce(p_strands,array['number','measurement','space','statistics','algebra','probability']::text[]);
begin
  if p_checkpoint in ('start','mid','end') and (
    cardinality(v_strands)<>6
    or (select count(distinct strand) from unnest(v_strands) requested(strand))<>6
    or exists (select 1 from unnest(v_strands) requested(strand)
      where strand not in ('number','measurement','space','statistics','algebra','probability'))
  ) then raise exception 'Start, Mid and End diagnostics require all six maths strands'; end if;
  return public.teacher_start_whole_math_diagnostic_v1(p_student_id,p_checkpoint,v_strands);
end;
$$;

create table if not exists public.whole_math_diagnostic_school_sessions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  checkpoint text not null check (checkpoint in ('start','mid','end')),
  academic_year integer not null,
  opened_by uuid not null,
  opened_at timestamptz not null default now(),
  closes_at timestamptz not null,
  closed_at timestamptz null,
  created_at timestamptz not null default now(),
  check (closes_at > opened_at)
);
create index if not exists whole_math_diagnostic_open_session_idx
  on public.whole_math_diagnostic_school_sessions(class_id, checkpoint, academic_year, closes_at desc)
  where closed_at is null;
alter table public.whole_math_diagnostic_school_sessions enable row level security;
revoke all on table public.whole_math_diagnostic_school_sessions from public, anon, authenticated;

create or replace function public.whole_math_diagnostic_session_is_open(p_student_id uuid, p_sitting_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.whole_math_diagnostic_sittings sitting
    join public.students student on student.id = sitting.student_id
    join public.whole_math_diagnostic_school_sessions school_session
      on school_session.class_id = student.class_id
     and school_session.checkpoint = sitting.checkpoint
     and school_session.academic_year = sitting.academic_year
    where sitting.id = p_sitting_id
      and sitting.student_id = p_student_id
      and school_session.closed_at is null
      and school_session.opened_at <= now()
      and school_session.closes_at > now()
  );
$$;

create or replace function public.teacher_open_whole_math_diagnostic_session(
  p_class_id uuid,
  p_checkpoint text,
  p_duration_minutes integer default 120
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_id uuid;
begin
  if p_checkpoint not in ('start','mid','end') or p_duration_minutes not between 15 and 480 then
    raise exception 'Invalid diagnostic session';
  end if;
  if not exists (
    select 1 from public.classes class
    where class.id=p_class_id and public.teacher_belongs_to_auth(class.teacher_id)
  ) then raise exception 'Not authorized for this class' using errcode='42501'; end if;
  update public.whole_math_diagnostic_school_sessions
  set closed_at=now()
  where class_id=p_class_id and checkpoint=p_checkpoint
    and academic_year=extract(year from current_date)::integer and closed_at is null;
  insert into public.whole_math_diagnostic_school_sessions(
    class_id,checkpoint,academic_year,opened_by,closes_at
  ) values (
    p_class_id,p_checkpoint,extract(year from current_date)::integer,auth.uid(),now()+(p_duration_minutes||' minutes')::interval
  ) returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.teacher_close_whole_math_diagnostic_session(p_class_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.classes class
    where class.id=p_class_id and public.teacher_belongs_to_auth(class.teacher_id)
  ) then raise exception 'Not authorized for this class' using errcode='42501'; end if;
  update public.whole_math_diagnostic_school_sessions set closed_at=now()
  where class_id=p_class_id and closed_at is null;
end;
$$;

create or replace function public.get_teacher_whole_math_diagnostic_session(p_class_id uuid)
returns table(id uuid, checkpoint text, opened_at timestamptz, closes_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.classes class
    where class.id=p_class_id and public.teacher_belongs_to_auth(class.teacher_id)
  ) then raise exception 'Not authorized for this class' using errcode='42501'; end if;
  return query select session.id,session.checkpoint,session.opened_at,session.closes_at
  from public.whole_math_diagnostic_school_sessions session
  where session.class_id=p_class_id and session.closed_at is null and session.closes_at>now()
  order by session.opened_at desc limit 1;
end;
$$;

create or replace function public.guard_whole_math_diagnostic_sitting_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.academic_year := coalesce(new.academic_year, extract(year from current_date)::integer);
  if new.checkpoint in ('start','mid','end') and exists (
    select 1 from public.whole_math_diagnostic_sittings sitting
    where sitting.student_id=new.student_id and sitting.checkpoint=new.checkpoint
      and sitting.academic_year=new.academic_year
  ) then raise exception 'This student already has this diagnostic checkpoint for the academic year'; end if;
  return new;
end;
$$;
drop trigger if exists trg_guard_whole_math_diagnostic_sitting_insert on public.whole_math_diagnostic_sittings;
create trigger trg_guard_whole_math_diagnostic_sitting_insert
before insert on public.whole_math_diagnostic_sittings
for each row execute function public.guard_whole_math_diagnostic_sitting_insert();

create or replace function public.capture_whole_math_diagnostic_placement_protection()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.placement_protected := exists (
    select 1 from public.student_realm_progress progress
    where progress.student_id=new.student_id and progress.realm_id=new.realm_id and progress.is_current
  ) or exists (
    select 1 from public.student_realm_placement placement
    where placement.student_id=new.student_id and placement.realm_id=new.realm_id
  );
  return new;
end;
$$;
drop trigger if exists trg_capture_whole_math_diagnostic_placement on public.whole_math_diagnostic_strand_results;
create trigger trg_capture_whole_math_diagnostic_placement
before insert on public.whole_math_diagnostic_strand_results
for each row execute function public.capture_whole_math_diagnostic_placement_protection();

create or replace function public.teacher_adopt_recent_diagnostic_assessments(p_sitting_id uuid)
returns integer
language plpgsql security definer set search_path=public
as $$
declare
  v_sitting public.whole_math_diagnostic_sittings%rowtype;
  v_result public.whole_math_diagnostic_strand_results%rowtype;
  v_assessment public.student_realm_assessments%rowtype;
  v_probe jsonb; v_percent numeric; v_level integer; v_minimum integer;
  v_measured numeric; v_adopted integer:=0; v_pending integer; v_overall numeric;
begin
  select * into v_sitting from public.whole_math_diagnostic_sittings where id=p_sitting_id for update;
  if not found or not public.teacher_owns_student(v_sitting.student_id) then
    raise exception 'Not authorized for this diagnostic' using errcode='42501';
  end if;
  for v_result in select * from public.whole_math_diagnostic_strand_results
    where sitting_id=p_sitting_id and status='pending' order by created_at
  loop
    select assessment.* into v_assessment from public.student_realm_assessments assessment
    where assessment.student_id=v_result.student_id and assessment.realm_id=v_result.realm_id
      and assessment.working_level=v_result.starting_level
      and lower(assessment.assessment_type) in ('pretest','posttest')
      and assessment.total_questions=20 and assessment.correct_count between 0 and 20
      and jsonb_typeof(assessment.question_results)='array'
      and jsonb_array_length(assessment.question_results)=20
      and (select count(distinct item->>'question_id')
        from jsonb_array_elements(assessment.question_results) item)=20
      and assessment.completed_at>=v_sitting.created_at-interval '21 days'
      and not exists (select 1 from public.whole_math_diagnostic_strand_results used where used.source_assessment_id=assessment.id)
    order by assessment.completed_at asc limit 1;
    if not found then continue; end if;
    v_level:=substring(v_result.starting_level from '[0-9]+')::integer;
    v_minimum:=case when v_result.strand in ('algebra','probability') then 3 else 1 end;
    v_percent:=round(v_assessment.correct_count::numeric*100/v_assessment.total_questions,2);
    v_probe:=jsonb_build_object(
      'level',v_result.starting_level,'score',v_assessment.correct_count,'total',20,'percent',v_percent,
      'questionIds',(select jsonb_agg(item->>'question_id' order by (item->>'question_number')::integer) from jsonb_array_elements(v_assessment.question_results) item),
      'curriculumCodes',(select coalesce(jsonb_agg(distinct code),'[]'::jsonb) from jsonb_array_elements(v_assessment.question_results) item,
        jsonb_array_elements_text(coalesce(item->'curriculum_codes','[]'::jsonb)) code)
    );
    if v_percent>=85 and v_level<6 then
      update public.whole_math_diagnostic_strand_results set source_assessment_id=v_assessment.id,
        active_level='Year '||(v_level+1),draft_probe_scores=jsonb_build_array(v_probe),probe_direction='up',updated_at=now()
      where id=v_result.id;
    elsif v_percent<=25 and v_level>v_minimum then
      update public.whole_math_diagnostic_strand_results set source_assessment_id=v_assessment.id,
        active_level='Year '||(v_level-1),draft_probe_scores=jsonb_build_array(v_probe),probe_direction='down',flag='review_support',updated_at=now()
      where id=v_result.id;
    else
      v_measured:=greatest(0,least(6,case when v_percent>=85 then v_level
        when v_percent>=40 then v_level-1+((v_percent-40)/45)
        else v_level-1-least(0.9,(40-v_percent)/40) end));
      update public.whole_math_diagnostic_strand_results set source_assessment_id=v_assessment.id,status='completed',
        measured_level=v_measured,recommended_level=v_result.starting_level,placement_applied=false,
        flag=case when v_percent<40 then 'review_support' else null end,probe_scores=jsonb_build_array(v_probe),
        curriculum_codes=v_probe->'curriculumCodes',completed_at=now(),updated_at=now()
      where id=v_result.id;
    end if;
    v_adopted:=v_adopted+1;
  end loop;
  select count(*) into v_pending from public.whole_math_diagnostic_strand_results where sitting_id=p_sitting_id and status='pending';
  if v_pending=0 then
    v_overall:=public.whole_math_level_for_sitting(p_sitting_id);
    update public.whole_math_diagnostic_sittings set status='completed',started_at=coalesce(started_at,now()),completed_at=now(),overall_level=v_overall where id=p_sitting_id;
  end if;
  return v_adopted;
end;
$$;

drop function if exists public.get_pending_whole_math_diagnostic(uuid);
create function public.get_pending_whole_math_diagnostic(p_student_id uuid)
returns table (
  sitting_id uuid, checkpoint text, strand text, starting_level text, status text,
  active_level text, draft_answers jsonb, draft_probes jsonb, draft_index integer,
  access_open boolean
)
language plpgsql security definer set search_path=public
as $$
begin
  perform public.assert_student_access(p_student_id);
  return query
  select sitting.id,sitting.checkpoint,result.strand,result.starting_level,sitting.status,
    coalesce(result.active_level,result.starting_level),result.draft_answers,result.draft_probe_scores,result.draft_question_index,
    public.whole_math_diagnostic_session_is_open(p_student_id,sitting.id)
  from public.whole_math_diagnostic_sittings sitting
  join public.whole_math_diagnostic_strand_results result on result.sitting_id=sitting.id
  where sitting.student_id=p_student_id and sitting.status in ('assigned','in_progress') and result.status='pending'
  order by sitting.created_at,case result.strand when 'number' then 1 when 'measurement' then 2 when 'space' then 3 when 'statistics' then 4 when 'algebra' then 5 when 'probability' then 6 else 9 end
  limit 1;
end;
$$;

create or replace function public.get_student_whole_math_diagnostic_journey(p_student_id uuid)
returns table(strand text,status text,starting_level text,active_level text,answered_count integer,measured_level numeric)
language plpgsql security definer set search_path=public
as $$
declare v_sitting_id uuid;
begin
  perform public.assert_student_access(p_student_id);
  select sitting.id into v_sitting_id from public.whole_math_diagnostic_sittings sitting
  where sitting.student_id=p_student_id and sitting.status in ('assigned','in_progress')
  order by sitting.created_at limit 1;
  if v_sitting_id is null then return; end if;
  return query select result.strand,result.status,result.starting_level,
    coalesce(result.active_level,result.starting_level),jsonb_object_length(result.draft_answers),result.measured_level
  from public.whole_math_diagnostic_strand_results result where result.sitting_id=v_sitting_id
  order by case result.strand when 'number' then 1 when 'measurement' then 2 when 'space' then 3 when 'statistics' then 4 when 'algebra' then 5 when 'probability' then 6 else 9 end;
end;
$$;

create or replace function public.get_teacher_whole_math_diagnostics(p_class_id uuid)
returns table (
  id uuid, student_id uuid, checkpoint text, status text, overall_level numeric,
  started_at timestamptz, completed_at timestamptz, created_at timestamptz,
  strand_results jsonb
)
language plpgsql security definer set search_path=public
as $$
begin
  if not exists (
    select 1 from public.classes class
    where class.id=p_class_id and public.teacher_belongs_to_auth(class.teacher_id)
  ) then raise exception 'Not authorized for this class' using errcode='42501'; end if;
  return query
  select sitting.id,sitting.student_id,sitting.checkpoint,sitting.status,sitting.overall_level,
    sitting.started_at,sitting.completed_at,sitting.created_at,
    coalesce(jsonb_agg(jsonb_build_object(
      'strand',result.strand,'status',result.status,'starting_level',result.starting_level,
      'active_level',coalesce(result.active_level,result.starting_level),
      'answered_count',jsonb_object_length(result.draft_answers),
      'measured_level',result.measured_level,'recommended_level',result.recommended_level,
      'placement_applied',result.placement_applied,'placement_protected',result.placement_protected,
      'probe_direction',result.probe_direction,'source_assessment_id',result.source_assessment_id,
      'flag',result.flag,'probe_scores',result.probe_scores,
      'curriculum_codes',result.curriculum_codes,'unavailable_reason',result.unavailable_reason
    ) order by case result.strand when 'number' then 1 when 'measurement' then 2
      when 'space' then 3 when 'statistics' then 4 when 'algebra' then 5
      when 'probability' then 6 else 9 end),'[]'::jsonb)
  from public.whole_math_diagnostic_sittings sitting
  left join public.whole_math_diagnostic_strand_results result on result.sitting_id=sitting.id
  where sitting.class_id=p_class_id
  group by sitting.id order by sitting.created_at desc;
end;
$$;

create or replace function public.save_whole_math_diagnostic_progress(
  p_student_id uuid,p_sitting_id uuid,p_strand text,p_active_level text,
  p_answers jsonb,p_probe_scores jsonb,p_question_index integer
)
returns void language plpgsql security definer set search_path=public
as $$
begin
  perform public.assert_student_access(p_student_id);
  if not public.whole_math_diagnostic_session_is_open(p_student_id,p_sitting_id) then
    raise exception 'The supervised school diagnostic session is closed' using errcode='42501';
  end if;
  if p_strand not in ('number','measurement','space','statistics','algebra','probability')
    or p_active_level not in ('Year 1','Year 2','Year 3','Year 4','Year 5','Year 6')
    or jsonb_typeof(p_answers)<>'object' or jsonb_typeof(p_probe_scores)<>'array'
    or jsonb_array_length(p_probe_scores)>6 or p_question_index not between 0 and 19 then
    raise exception 'Invalid diagnostic progress';
  end if;
  update public.whole_math_diagnostic_strand_results result set
    active_level=p_active_level,draft_answers=p_answers,draft_probe_scores=p_probe_scores,
    draft_question_index=p_question_index,updated_at=now()
  from public.whole_math_diagnostic_sittings sitting
  where result.sitting_id=p_sitting_id and sitting.id=result.sitting_id
    and result.student_id=p_student_id and result.strand=p_strand and result.status='pending'
    and sitting.status in ('assigned','in_progress');
  if not found then raise exception 'Diagnostic strand is not active'; end if;
  update public.whole_math_diagnostic_sittings set status='in_progress',started_at=coalesce(started_at,now())
  where id=p_sitting_id and student_id=p_student_id;
end;
$$;

alter function public.complete_whole_math_diagnostic_strand(uuid,uuid,text,jsonb)
  rename to complete_whole_math_diagnostic_strand_upward_v1;
revoke all on function public.complete_whole_math_diagnostic_strand_upward_v1(uuid,uuid,text,jsonb) from public,anon,authenticated;

create function public.complete_whole_math_diagnostic_strand(
  p_student_id uuid,p_sitting_id uuid,p_strand text,p_probe_scores jsonb
)
returns jsonb language plpgsql security definer set search_path=public
as $$
declare
  v_result public.whole_math_diagnostic_strand_results%rowtype;
  v_sitting public.whole_math_diagnostic_sittings%rowtype;
  v_probe jsonb; v_previous_level integer; v_level integer; v_score integer; v_total integer;
  v_percent numeric; v_terminal_percent numeric; v_terminal_level integer;
  v_minimum integer; v_index integer:=0; v_pending integer; v_overall numeric; v_measured numeric;
  v_recommended text; v_placement boolean:=false; v_full_weeks jsonb;
  v_class_id uuid; v_school_year text;
begin
  perform public.assert_student_access(p_student_id);
  if not public.whole_math_diagnostic_session_is_open(p_student_id,p_sitting_id) then
    raise exception 'The supervised school diagnostic session is closed' using errcode='42501';
  end if;
  select * into v_result from public.whole_math_diagnostic_strand_results
  where sitting_id=p_sitting_id and student_id=p_student_id and strand=p_strand for update;
  if not found or v_result.status<>'pending' then raise exception 'Diagnostic strand is not active'; end if;
  select * into v_sitting from public.whole_math_diagnostic_sittings
  where id=p_sitting_id and student_id=p_student_id for update;
  if not found or v_sitting.status='completed' then raise exception 'Diagnostic sitting is not active'; end if;
  v_minimum:=case when p_strand in ('algebra','probability') then 3 else 1 end;
  if jsonb_typeof(p_probe_scores)<>'array' or jsonb_array_length(p_probe_scores)<1 or jsonb_array_length(p_probe_scores)>6 then
    raise exception 'Invalid diagnostic probes';
  end if;
  -- Validate every direction before delegating. No client can submit a shortened,
  -- duplicated or synthetic-count probe to the older upward completion routine.
  for v_probe in select value from jsonb_array_elements(p_probe_scores) probe(value) loop
    v_level:=substring(coalesce(v_probe->>'level','') from '[0-9]+')::integer;
    v_score:=nullif(v_probe->>'score','')::integer;
    v_total:=nullif(v_probe->>'total','')::integer;
    if v_level is null or v_total<>20 or v_score<0 or v_score>20
      or jsonb_typeof(coalesce(v_probe->'questionIds','[]'::jsonb))<>'array'
      or jsonb_array_length(coalesce(v_probe->'questionIds','[]'::jsonb))<>20
      or (select count(distinct question_id)
          from jsonb_array_elements_text(v_probe->'questionIds') question(question_id))<>20 then
      raise exception 'Every diagnostic level requires 20 distinct recorded questions';
    end if;
  end loop;
  if (
      jsonb_array_length(p_probe_scores)=1
      and (
        round(((p_probe_scores->0->>'score')::numeric*100)/(p_probe_scores->0->>'total')::numeric,2)>25
        or substring(p_probe_scores->0->>'level' from '[0-9]+')::integer=v_minimum
      )
    ) or (
      jsonb_array_length(p_probe_scores)>1
      and substring(p_probe_scores->1->>'level' from '[0-9]+')::integer
        > substring(p_probe_scores->0->>'level' from '[0-9]+')::integer
    ) then
    return public.complete_whole_math_diagnostic_strand_upward_v1(p_student_id,p_sitting_id,p_strand,p_probe_scores);
  end if;
  for v_probe in select value from jsonb_array_elements(p_probe_scores) probe(value) loop
    v_index:=v_index+1; v_level:=substring(coalesce(v_probe->>'level','') from '[0-9]+')::integer;
    v_score:=nullif(v_probe->>'score','')::integer; v_total:=nullif(v_probe->>'total','')::integer;
    v_percent:=round(v_score::numeric*100/v_total,2);
    if v_index=1 then
      if v_level<>substring(v_result.starting_level from '[0-9]+')::integer then raise exception 'Probe must begin at the assigned level'; end if;
    elsif v_level<>v_previous_level-1 then raise exception 'Invalid downward diagnostic sequence'; end if;
    if v_index>1 and v_terminal_percent>25 then raise exception 'A lower probe requires 25 percent or less on the preceding level'; end if;
    v_previous_level:=v_level; v_terminal_level:=v_level; v_terminal_percent:=v_percent;
  end loop;

  if v_terminal_percent<=25 and v_terminal_level>v_minimum then raise exception 'A result of 25 percent or less must probe the next lower level'; end if;

  v_measured:=greatest(0,least(6,case when v_terminal_percent>=85 then v_terminal_level
    when v_terminal_percent>=40 then v_terminal_level-1+((v_terminal_percent-40)/45)
    else v_terminal_level-1-least(0.9,(40-v_terminal_percent)/40) end));
  v_recommended:=case when v_result.placement_protected then v_result.starting_level else 'Year '||v_terminal_level end;
  v_placement:=not v_result.placement_protected and v_sitting.checkpoint in ('start','mid','end');
  update public.whole_math_diagnostic_strand_results set
    status='completed',measured_level=v_measured,recommended_level=v_recommended,
    placement_applied=v_placement,flag='review_support',probe_scores=p_probe_scores,probe_direction='down',
    curriculum_codes=(select coalesce(jsonb_agg(distinct code),'[]'::jsonb)
      from jsonb_array_elements(p_probe_scores) probe,
      jsonb_array_elements_text(coalesce(probe->'curriculumCodes','[]'::jsonb)) code),
    active_level=null,draft_answers='{}'::jsonb,draft_probe_scores='[]'::jsonb,
    draft_question_index=0,completed_at=now(),updated_at=now()
  where id=v_result.id;
  if v_placement then
    select student.class_id,coalesce(student.school_year_level,student.year_level)
    into v_class_id,v_school_year from public.students student where student.id=p_student_id;
    v_full_weeks:=case when v_result.realm_id='number' then '[1,2,3,4,5,6,7,8,9,10,11,12]'::jsonb
      when v_result.realm_id in ('statistics','chance') then '[1,2,3,4,5,6]'::jsonb
      else '[1,2,3,4,5,6,7,8]'::jsonb end;
    update public.student_realm_progress set is_current=false
    where student_id=p_student_id and realm_id=v_result.realm_id and is_current;
    insert into public.student_realm_progress(
      student_id,class_id,realm_id,program_key,school_year_level,working_level,is_current,status,
      current_week,assigned_week,placement_complete,required_weeks,optional_weeks
    ) values (
      p_student_id,v_class_id,v_result.realm_id,public.realm_program_key(v_recommended,v_result.realm_id),
      v_school_year,v_recommended,true,'ASSIGNED_PROGRAM',1,1,true,v_full_weeks,'[]'::jsonb
    ) on conflict (student_id,realm_id,working_level) do update set
      class_id=excluded.class_id,program_key=excluded.program_key,school_year_level=excluded.school_year_level,
      is_current=true,status=excluded.status,current_week=coalesce(public.student_realm_progress.current_week,1),
      assigned_week=coalesce(public.student_realm_progress.assigned_week,1),placement_complete=true,
      required_weeks=case when public.student_realm_progress.required_weeks='[]'::jsonb then excluded.required_weeks else public.student_realm_progress.required_weeks end,
      updated_at=now();
    insert into public.student_realm_placement(
      student_id,realm_id,assigned_start_level,assigned_entry_mode,placement_source,
      placement_assigned_by,placement_assigned_at,updated_at
    ) values (
      p_student_id,v_result.realm_id,v_recommended,'full_level','diagnostic',v_sitting.initiated_by,now(),now()
    ) on conflict (student_id,realm_id) do update set
      assigned_start_level=excluded.assigned_start_level,assigned_entry_mode=excluded.assigned_entry_mode,
      placement_source=excluded.placement_source,placement_assigned_by=excluded.placement_assigned_by,
      placement_assigned_at=excluded.placement_assigned_at,updated_at=now();
  end if;
  update public.whole_math_diagnostic_sittings set status='in_progress',started_at=coalesce(started_at,now()) where id=p_sitting_id;
  select count(*) into v_pending from public.whole_math_diagnostic_strand_results where sitting_id=p_sitting_id and status='pending';
  if v_pending=0 then
    v_overall:=public.whole_math_level_for_sitting(p_sitting_id);
    update public.whole_math_diagnostic_sittings set status='completed',completed_at=now(),overall_level=v_overall where id=p_sitting_id;
  end if;
  return jsonb_build_object('sitting_complete',v_pending=0,'measured_level',v_measured,
    'recommended_level',v_recommended,'placement_applied',v_placement,'flag','review_support','overall_level',v_overall);
end;
$$;

revoke all on function public.whole_math_diagnostic_session_is_open(uuid,uuid) from public,anon,authenticated;
revoke all on function public.teacher_start_whole_math_diagnostic(uuid,text,text[]) from public,anon,authenticated;
grant execute on function public.teacher_start_whole_math_diagnostic(uuid,text,text[]) to authenticated;
revoke all on function public.teacher_adopt_recent_diagnostic_assessments(uuid) from public,anon,authenticated;
grant execute on function public.teacher_adopt_recent_diagnostic_assessments(uuid) to authenticated;
revoke all on function public.teacher_open_whole_math_diagnostic_session(uuid,text,integer) from public,anon,authenticated;
grant execute on function public.teacher_open_whole_math_diagnostic_session(uuid,text,integer) to authenticated;
revoke all on function public.teacher_close_whole_math_diagnostic_session(uuid) from public,anon,authenticated;
grant execute on function public.teacher_close_whole_math_diagnostic_session(uuid) to authenticated;
revoke all on function public.get_teacher_whole_math_diagnostic_session(uuid) from public,anon,authenticated;
grant execute on function public.get_teacher_whole_math_diagnostic_session(uuid) to authenticated;
revoke all on function public.get_teacher_whole_math_diagnostics(uuid) from public,anon,authenticated;
grant execute on function public.get_teacher_whole_math_diagnostics(uuid) to authenticated;
revoke all on function public.get_pending_whole_math_diagnostic(uuid) from public,anon,authenticated;
grant execute on function public.get_pending_whole_math_diagnostic(uuid) to anon,authenticated;
revoke all on function public.get_student_whole_math_diagnostic_journey(uuid) from public,anon,authenticated;
grant execute on function public.get_student_whole_math_diagnostic_journey(uuid) to anon,authenticated;
revoke all on function public.save_whole_math_diagnostic_progress(uuid,uuid,text,text,jsonb,jsonb,integer) from public,anon,authenticated;
grant execute on function public.save_whole_math_diagnostic_progress(uuid,uuid,text,text,jsonb,jsonb,integer) to anon,authenticated;
revoke all on function public.complete_whole_math_diagnostic_strand(uuid,uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.complete_whole_math_diagnostic_strand(uuid,uuid,text,jsonb) to anon,authenticated;

commit;
