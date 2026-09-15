-- Release Number Level 8. Existing diagnostic cycles retain their original ceiling.
begin;
alter table public.whole_math_diagnostic_sittings drop constraint whole_math_diagnostic_sittings_number_maximum_level_check;
alter table public.whole_math_diagnostic_sittings add constraint whole_math_diagnostic_sittings_number_maximum_level_check check(number_maximum_level in (6,7,8));
alter table public.whole_math_diagnostic_sittings alter column number_maximum_level set default 8;
alter table public.whole_math_diagnostic_strand_results drop constraint whole_math_diagnostic_measured_range;
alter table public.whole_math_diagnostic_strand_results add constraint whole_math_diagnostic_measured_range check(measured_level is null or (measured_level>=0 and measured_level<=case when strand='number' then 8 else 6 end));
alter table public.whole_math_diagnostic_strand_results drop constraint whole_math_diagnostic_draft_index_range;
alter table public.whole_math_diagnostic_strand_results add constraint whole_math_diagnostic_draft_index_range check(draft_question_index>=0 and draft_question_index<=case when strand='number' and active_level in ('Year 7','Year 8') then 29 else 19 end);
alter table public.student_live_maths_progression drop constraint student_live_maths_progression_official_level_check;
alter table public.student_live_maths_progression add constraint student_live_maths_progression_official_level_check check(official_level>=0 and official_level<=case when realm_id='number' then 8 else 6 end);
alter table public.student_live_maths_progression drop constraint student_live_maths_progression_predicted_level_check;
alter table public.student_live_maths_progression add constraint student_live_maths_progression_predicted_level_check check(predicted_level>=0 and predicted_level<=case when realm_id='number' then 8 else 6 end);
alter table public.student_live_maths_progression drop constraint student_live_maths_progression_checkpoint_level_check;
alter table public.student_live_maths_progression add constraint student_live_maths_progression_checkpoint_level_check check(checkpoint_level>=0 and checkpoint_level<=case when realm_id='number' then 8 else 6 end);
create or replace function public.pin_number_extension_cycle() returns trigger language plpgsql security definer set search_path=public as $$
declare previous public.whole_math_diagnostic_sittings%rowtype;
begin
 select * into previous from public.whole_math_diagnostic_sittings
 where student_id=new.student_id and academic_year=new.academic_year order by created_at,id limit 1;
 new.number_level3_bank_version:=coalesce(previous.number_level3_bank_version,3);
 new.number_maximum_level:=coalesce(previous.number_maximum_level,8);
 return new;
end; $$;

CREATE OR REPLACE FUNCTION public.number_diagnostic_level_value(value text)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
AS $function$
 select case when value='Prep' then 0 when value ~ '^Year [1-8]$' then substring(value from '[0-9]+')::integer else null end;
$function$
;

CREATE OR REPLACE FUNCTION public.complete_whole_math_diagnostic_strand(p_student_id uuid, p_sitting_id uuid, p_strand text, p_probe_scores jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  v_minimum:=case when p_strand='number' and v_sitting.number_ground_bank_version=3 then 0 when p_strand in ('algebra','probability') then 3 else 1 end;
  if jsonb_typeof(p_probe_scores)<>'array' or jsonb_array_length(p_probe_scores)<1 or jsonb_array_length(p_probe_scores)>(case when p_strand='number' and v_sitting.number_ground_bank_version=3 then v_sitting.number_maximum_level+1 else 6 end) then
    raise exception 'Invalid diagnostic probes';
  end if;
  -- Validate every direction before delegating. No client can submit a shortened,
  -- duplicated or synthetic-count probe to the older upward completion routine.
  for v_probe in select value from jsonb_array_elements(p_probe_scores) probe(value) loop
    v_level:=public.number_diagnostic_level_value(coalesce(v_probe->>'level',''));
    v_score:=nullif(v_probe->>'score','')::integer;
    v_total:=nullif(v_probe->>'total','')::integer;
    if v_level is null or v_level<v_minimum or v_level>(case when p_strand='number' then v_sitting.number_maximum_level else 6 end) or v_total<>(case when p_strand='number' and v_level in (7,8) then 30 else 20 end) or v_score<0 or v_score>v_total
      or jsonb_typeof(coalesce(v_probe->'questionIds','[]'::jsonb))<>'array'
      or jsonb_array_length(coalesce(v_probe->'questionIds','[]'::jsonb))<>v_total
      or (select count(distinct question_id)
          from jsonb_array_elements_text(v_probe->'questionIds') question(question_id))<>v_total then
      raise exception 'Every diagnostic level requires its full set of distinct recorded questions';
    end if;
  end loop;
  if (
      jsonb_array_length(p_probe_scores)=1
      and (
        round(((p_probe_scores->0->>'score')::numeric*100)/(p_probe_scores->0->>'total')::numeric,2)>25
        or public.number_diagnostic_level_value(p_probe_scores->0->>'level')=v_minimum
      )
    ) or (
      jsonb_array_length(p_probe_scores)>1
      and public.number_diagnostic_level_value(p_probe_scores->1->>'level')
        > public.number_diagnostic_level_value(p_probe_scores->0->>'level')
    ) then
    return public.complete_whole_math_diagnostic_strand_upward_v1(p_student_id,p_sitting_id,p_strand,p_probe_scores);
  end if;
  for v_probe in select value from jsonb_array_elements(p_probe_scores) probe(value) loop
    v_index:=v_index+1; v_level:=public.number_diagnostic_level_value(coalesce(v_probe->>'level',''));
    v_score:=nullif(v_probe->>'score','')::integer; v_total:=nullif(v_probe->>'total','')::integer;
    v_percent:=round(v_score::numeric*100/v_total,2);
    if v_index=1 then
      if v_level<>public.number_diagnostic_level_value(v_result.starting_level) then raise exception 'Probe must begin at the assigned level'; end if;
    elsif v_level<>v_previous_level-1 then raise exception 'Invalid downward diagnostic sequence'; end if;
    if v_index>1 and v_terminal_percent>25 then raise exception 'A lower probe requires 25 percent or less on the preceding level'; end if;
    v_previous_level:=v_level; v_terminal_level:=v_level; v_terminal_percent:=v_percent;
  end loop;

  if v_terminal_percent<=25 and v_terminal_level>v_minimum then raise exception 'A result of 25 percent or less must probe the next lower level'; end if;

  v_measured:=greatest(0,least((case when p_strand='number' then v_sitting.number_maximum_level else 6 end),case when v_terminal_percent>=85 then v_terminal_level
    when v_terminal_percent>=40 then v_terminal_level-1+((v_terminal_percent-40)/45)
    else v_terminal_level-1-least(0.9,(40-v_terminal_percent)/40) end));
  v_recommended:=case when v_result.placement_protected then v_result.starting_level else public.number_diagnostic_level_label(least(6,v_terminal_level)) end;
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
$function$
;

CREATE OR REPLACE FUNCTION public.complete_whole_math_diagnostic_strand_upward_v1(p_student_id uuid, p_sitting_id uuid, p_strand text, p_probe_scores jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_mastery constant integer := 85;
  v_floor constant integer := 40;
  v_result public.whole_math_diagnostic_strand_results%rowtype;
  v_sitting public.whole_math_diagnostic_sittings%rowtype;
  v_probe jsonb; v_normalized jsonb := '[]'::jsonb; v_codes jsonb := '[]'::jsonb;
  v_score integer; v_total integer; v_percent numeric; v_level integer; v_expected integer;
  v_current integer; v_last_mastered integer; v_recommended integer;
  v_terminal_level integer; v_terminal_percent numeric; v_measured numeric;
  v_flag text := null; v_placement boolean := false; v_pending integer;
  v_full_weeks jsonb; v_class_id uuid; v_school_year text; v_overall numeric;
begin
  perform public.assert_student_access(p_student_id);
  select * into v_sitting from public.whole_math_diagnostic_sittings
  where id = p_sitting_id and student_id = p_student_id for update;
  if not found or v_sitting.status = 'completed' then raise exception 'Diagnostic sitting is not active'; end if;
  select * into v_result from public.whole_math_diagnostic_strand_results
  where sitting_id = p_sitting_id and student_id = p_student_id and strand = p_strand for update;
  if not found or v_result.status <> 'pending' or v_result.realm_id is null then raise exception 'Diagnostic strand is not available'; end if;
  if jsonb_typeof(p_probe_scores) <> 'array' or jsonb_array_length(p_probe_scores) < 1 or jsonb_array_length(p_probe_scores)>(case when p_strand='number' and v_sitting.number_ground_bank_version=3 then v_sitting.number_maximum_level+1 else 6 end) then
    raise exception 'Invalid diagnostic probes';
  end if;

  v_current := public.number_diagnostic_level_value(v_result.starting_level);
  v_expected := v_current; v_last_mastered := v_current; v_recommended := v_current;
  for v_probe in select value from jsonb_array_elements(p_probe_scores) probe(value) loop
    v_level := public.number_diagnostic_level_value(coalesce(v_probe->>'level', ''));
    v_score := nullif(v_probe->>'score', '')::integer;
    v_total := nullif(v_probe->>'total', '')::integer;
    if v_level is null or v_level<(case when p_strand='number' and v_sitting.number_ground_bank_version=3 then 0 when p_strand in ('algebra','probability') then 3 else 1 end) or v_level>(case when p_strand='number' then v_sitting.number_maximum_level else 6 end) or v_level <> v_expected or v_total <> (case when p_strand='number' and v_level in (7,8) then 30 else 20 end)
      or v_score < 0 or v_score > v_total
      or jsonb_typeof(coalesce(v_probe->'questionIds','[]'::jsonb)) <> 'array'
      or jsonb_array_length(coalesce(v_probe->'questionIds','[]'::jsonb)) <> v_total then
      raise exception 'Invalid diagnostic probe sequence';
    end if;
    v_percent := round((v_score::numeric * 100) / v_total, 2);
    v_terminal_level := v_level; v_terminal_percent := v_percent;
    v_normalized := v_normalized || jsonb_build_array(jsonb_build_object(
      'level', public.number_diagnostic_level_label(v_level), 'score', v_score, 'total', v_total, 'percent', v_percent,
      'questionIds', v_probe->'questionIds',
      'curriculumCodes', coalesce(v_probe->'curriculumCodes', '[]'::jsonb)
    ));
    v_codes := v_codes || coalesce(v_probe->'curriculumCodes', '[]'::jsonb);
    if v_percent >= v_mastery then
      v_last_mastered := greatest(v_last_mastered, v_level); v_recommended := v_last_mastered; v_expected := v_level + 1;
    elsif v_percent >= v_floor then
      v_recommended := greatest(v_current, v_level); exit;
    else
      v_recommended := greatest(v_current, v_last_mastered);
      v_flag := case when v_level = v_current then 'review_support' else 'extension_ready_to_bridge' end; exit;
    end if;
  end loop;
  if v_terminal_percent >= v_mastery and v_terminal_level < (case when p_strand='number' then v_sitting.number_maximum_level else 6 end) then raise exception 'A mastered level must probe the next level'; end if;

  v_measured := greatest(0, least((case when p_strand='number' then v_sitting.number_maximum_level else 6 end), case
    when v_terminal_percent >= v_mastery then v_terminal_level
    when v_terminal_percent >= v_floor then v_terminal_level - 1 + ((v_terminal_percent - v_floor) / (v_mastery - v_floor))
    else v_terminal_level - 1 - least(0.9, (v_floor - v_terminal_percent) / v_floor) end));
  if p_strand='number' and v_recommended>6 then v_recommended:=6; v_flag:='extension_ready_to_bridge'; end if;
  v_placement := v_sitting.checkpoint in ('start','mid','end') and v_recommended > v_current and (p_strand<>'number' or v_sitting.number_ground_bank_version<>3 or not v_result.placement_protected);
  update public.whole_math_diagnostic_strand_results
  set status='completed', measured_level=v_measured, recommended_level=public.number_diagnostic_level_label(v_recommended),
      placement_applied=v_placement, flag=v_flag, probe_scores=v_normalized,
      curriculum_codes=(select coalesce(jsonb_agg(distinct code),'[]'::jsonb) from jsonb_array_elements_text(v_codes) code),
      active_level=null, draft_answers='{}'::jsonb, draft_probe_scores='[]'::jsonb,
      draft_question_index=0, completed_at=now(), updated_at=now()
  where id=v_result.id;

  if v_placement then
    select student.class_id, coalesce(student.school_year_level, student.year_level)
    into v_class_id, v_school_year from public.students student where student.id=p_student_id;
    v_full_weeks := case when v_result.realm_id='number' then '[1,2,3,4,5,6,7,8,9,10,11,12]'::jsonb
      when v_result.realm_id in ('statistics','chance') then '[1,2,3,4,5,6]'::jsonb else '[1,2,3,4,5,6,7,8]'::jsonb end;
    update public.student_realm_progress set is_current=false where student_id=p_student_id and realm_id=v_result.realm_id and is_current;
    insert into public.student_realm_progress (
      student_id,class_id,realm_id,program_key,school_year_level,working_level,is_current,status,
      current_week,assigned_week,placement_complete,required_weeks,optional_weeks
    ) values (
      p_student_id,v_class_id,v_result.realm_id,public.realm_program_key(public.number_diagnostic_level_label(v_recommended),v_result.realm_id),
      v_school_year,public.number_diagnostic_level_label(v_recommended),true,'ASSIGNED_PROGRAM',1,1,true,v_full_weeks,'[]'::jsonb
    ) on conflict (student_id,realm_id,working_level) do update set
      class_id=excluded.class_id,program_key=excluded.program_key,school_year_level=excluded.school_year_level,
      is_current=true,status=excluded.status,current_week=coalesce(public.student_realm_progress.current_week,1),
      assigned_week=coalesce(public.student_realm_progress.assigned_week,1),placement_complete=true,
      required_weeks=case when public.student_realm_progress.required_weeks='[]'::jsonb then excluded.required_weeks else public.student_realm_progress.required_weeks end,
      updated_at=now();
    insert into public.student_realm_placement (
      student_id,realm_id,assigned_start_level,assigned_entry_mode,placement_source,
      placement_assigned_by,placement_assigned_at,updated_at
    ) values (
      p_student_id,v_result.realm_id,public.number_diagnostic_level_label(v_recommended),'full_level','diagnostic',v_sitting.initiated_by,now(),now()
    ) on conflict (student_id,realm_id) do update set
      assigned_start_level=excluded.assigned_start_level,assigned_entry_mode=excluded.assigned_entry_mode,
      placement_source=excluded.placement_source,placement_assigned_by=excluded.placement_assigned_by,
      placement_assigned_at=excluded.placement_assigned_at,updated_at=now();
  end if;

  update public.whole_math_diagnostic_sittings set status='in_progress',started_at=coalesce(started_at,now()) where id=p_sitting_id;
  select count(*) into v_pending from public.whole_math_diagnostic_strand_results where sitting_id=p_sitting_id and status='pending';
  if v_pending=0 then
    v_overall := public.whole_math_level_for_sitting(p_sitting_id);
    if v_sitting.checkpoint in ('start','mid','end') and v_overall is null then raise exception 'Official diagnostic requires all six completed strands'; end if;
    update public.whole_math_diagnostic_sittings set status='completed',completed_at=now(),overall_level=v_overall where id=p_sitting_id;
  end if;
  return jsonb_build_object('sitting_complete',v_pending=0,'measured_level',v_measured,
    'recommended_level',public.number_diagnostic_level_label(v_recommended),'placement_applied',v_placement,'flag',v_flag,'overall_level',v_overall);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.save_whole_math_diagnostic_progress(p_student_id uuid, p_sitting_id uuid, p_strand text, p_active_level text, p_answers jsonb, p_probe_scores jsonb, p_question_index integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  perform public.assert_student_access(p_student_id);
  if not public.whole_math_diagnostic_session_is_open(p_student_id,p_sitting_id) then
    raise exception 'The supervised school diagnostic session is closed' using errcode='42501';
  end if;
  if p_strand not in ('number','measurement','space','statistics','algebra','probability')
    or (p_active_level not in ('Prep','Year 1','Year 2','Year 3','Year 4','Year 5','Year 6') and not (p_strand='number' and p_active_level in ('Year 7','Year 8') and exists(select 1 from public.whole_math_diagnostic_sittings s where s.id=p_sitting_id and s.student_id=p_student_id and public.number_diagnostic_level_value(p_active_level)<=s.number_maximum_level)))
    or (p_active_level='Prep' and not exists(select 1 from public.whole_math_diagnostic_sittings s where s.id=p_sitting_id and s.number_ground_bank_version=3 and p_strand='number'))
    or jsonb_typeof(p_answers)<>'object' or jsonb_typeof(p_probe_scores)<>'array'
    or jsonb_array_length(p_probe_scores)>(case when p_strand='number' and exists(select 1 from public.whole_math_diagnostic_sittings s where s.id=p_sitting_id and s.number_ground_bank_version=3) then 9 else 6 end) or p_question_index not between 0 and (case when p_strand='number' and p_active_level in ('Year 7','Year 8') then 29 else 19 end) then
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
$function$
;

CREATE OR REPLACE FUNCTION public.teacher_adopt_recent_diagnostic_assessments(p_sitting_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      and (v_result.realm_id <> 'number' or v_result.starting_level <> 'Year 1'
        or not exists (
          select 1 from jsonb_array_elements(assessment.question_results) evidence
          where coalesce(evidence->>'question_id','') !~
            ('^y1-number-(pre|post)-[0-9]{2}-v' || v_sitting.number_level1_bank_version::text || '$')
        ))
      and (v_result.realm_id<>'number' or v_result.starting_level<>'Prep' or not exists(select 1 from jsonb_array_elements(assessment.question_results) evidence where coalesce(evidence->>'question_id','') !~ ('^y0-number-(pre|post)-[0-9]{2}-v'||v_sitting.number_ground_bank_version::text||'$')))
      and (v_result.realm_id<>'number' or v_result.starting_level<>'Year 2' or not exists(select 1 from jsonb_array_elements(assessment.question_results) evidence where coalesce(evidence->>'question_id','') !~ ('^y2-number-(pre|post)-[0-9]{2}-v'||v_sitting.number_level2_bank_version::text||'$')))
      and (v_result.realm_id<>'number' or v_result.starting_level<>'Year 4' or not exists(select 1 from jsonb_array_elements(assessment.question_results) evidence where coalesce(evidence->>'question_id','') !~ ('^y4-number-(pre|post)-[0-9]{2}-v'||v_sitting.number_level4_bank_version::text||'$')))
      and (v_result.realm_id<>'number' or v_result.starting_level<>'Year 5' or not exists(select 1 from jsonb_array_elements(assessment.question_results) evidence where coalesce(evidence->>'question_id','') !~ ('^y5-number-(pre|post)-[0-9]{2}-v'||v_sitting.number_level5_bank_version::text||'$')))
      and (v_result.realm_id<>'number' or v_result.starting_level<>'Year 6' or not exists(select 1 from jsonb_array_elements(assessment.question_results) evidence where coalesce(evidence->>'question_id','') !~ ('^y6-number-(pre|post)-[0-9]{2}-v'||v_sitting.number_level6_bank_version::text||'$')))
      and (v_result.realm_id<>'number' or v_result.starting_level<>'Year 3' or not exists(select 1 from jsonb_array_elements(assessment.question_results) evidence where (coalesce(evidence->>'question_id','') ~ '^y3-number-(pre|post)-[0-9]{2}-v3$') is distinct from (v_sitting.number_level3_bank_version=3)))
      and assessment.total_questions=20 and assessment.correct_count between 0 and 20
      and jsonb_typeof(assessment.question_results)='array'
      and jsonb_array_length(assessment.question_results)=20
      and (select count(distinct item->>'question_id')
        from jsonb_array_elements(assessment.question_results) item)=20
      and assessment.completed_at>=v_sitting.created_at-interval '21 days'
      and not exists (select 1 from public.whole_math_diagnostic_strand_results used where used.source_assessment_id=assessment.id)
    order by assessment.completed_at asc limit 1;
    if not found then continue; end if;
    v_level:=public.number_diagnostic_level_value(v_result.starting_level);
    v_minimum:=case when v_result.strand='number' and v_sitting.number_ground_bank_version=3 then 0 when v_result.strand in ('algebra','probability') then 3 else 1 end;
    v_percent:=round(v_assessment.correct_count::numeric*100/v_assessment.total_questions,2);
    v_probe:=jsonb_build_object(
      'level',v_result.starting_level,'score',v_assessment.correct_count,'total',20,'percent',v_percent,
      'questionIds',(select jsonb_agg(item->>'question_id' order by (item->>'question_number')::integer) from jsonb_array_elements(v_assessment.question_results) item),
      'curriculumCodes',(select coalesce(jsonb_agg(distinct code),'[]'::jsonb) from jsonb_array_elements(v_assessment.question_results) item,
        jsonb_array_elements_text(coalesce(item->'curriculum_codes','[]'::jsonb)) code)
    );
    if v_percent>=85 and v_level<(case when v_result.realm_id='number' then v_sitting.number_maximum_level else 6 end) then
      update public.whole_math_diagnostic_strand_results set source_assessment_id=v_assessment.id,
        active_level=public.number_diagnostic_level_label(v_level+1),draft_probe_scores=jsonb_build_array(v_probe),probe_direction='up',updated_at=now()
      where id=v_result.id;
    elsif v_percent<=25 and v_level>v_minimum then
      update public.whole_math_diagnostic_strand_results set source_assessment_id=v_assessment.id,
        active_level=public.number_diagnostic_level_label(v_level-1),draft_probe_scores=jsonb_build_array(v_probe),probe_direction='down',flag='review_support',updated_at=now()
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
$function$
;

CREATE OR REPLACE FUNCTION public.refresh_student_live_maths_progression(p_student_id uuid, p_realm_id text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_quiz_pass constant integer := 80;
  v_mastery constant integer := 85;
  v_floor constant integer := 40;
  v_lesson_week_credit constant numeric := 0.4;
  v_lessons_per_week constant integer := 3;
  v_max_confidence constant integer := 95;
  v_progress public.student_realm_progress%rowtype;
  v_working_number integer;
  v_total_weeks integer;
  v_official numeric;
  v_official_at timestamptz;
  v_checkpoint numeric;
  v_checkpoint_source text;
  v_checkpoint_at timestamptz;
  v_assessment_type text;
  v_assessment_level integer;
  v_assessment_score numeric;
  v_assessment_at timestamptz;
  v_passed_quiz_weeks integer := 0;
  v_unconfirmed_lessons integer := 0;
  v_week_equivalents numeric := 0;
  v_predicted numeric;
  v_confidence integer;
begin
  if p_realm_id not in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance') then return; end if;

  select progress.* into v_progress
  from public.student_realm_progress progress
  where progress.student_id = p_student_id
    and progress.realm_id = p_realm_id
    and progress.is_current
  order by progress.updated_at desc
  limit 1;

  if not found or v_progress.class_id is null then
    delete from public.student_live_maths_progression
    where student_id = p_student_id and realm_id = p_realm_id;
    return;
  end if;

  v_working_number := public.maths_progression_level_number(v_progress.working_level);
  if v_working_number is null then return; end if;
  v_total_weeks := case
    when p_realm_id = 'number' then 12
    when p_realm_id in ('statistics', 'chance') then 6
    else 8
  end;

  -- Only a completed Whole-Maths strand result is official. Realm assessments
  -- are verified checkpoints for the live estimate, never official results.
  select result.measured_level, result.completed_at
  into v_official, v_official_at
  from public.whole_math_diagnostic_strand_results result
  join public.whole_math_diagnostic_sittings sitting on sitting.id = result.sitting_id
  where result.student_id = p_student_id
    and result.realm_id = p_realm_id
    and result.status = 'completed'
    and result.measured_level is not null
    and sitting.status = 'completed'
    and sitting.checkpoint in ('start', 'mid', 'end')
    and (
      select count(distinct completed_result.strand)
      from public.whole_math_diagnostic_strand_results completed_result
      where completed_result.sitting_id = sitting.id
        and completed_result.status = 'completed'
        and completed_result.measured_level is not null
    ) = 6
  order by result.completed_at desc
  limit 1;

  -- Any completed strand diagnostic, including a teacher-triggered ad-hoc
  -- check, may be the latest verified realm checkpoint. Ad-hoc checks never
  -- populate official_level.
  select result.measured_level, result.completed_at
  into v_checkpoint, v_checkpoint_at
  from public.whole_math_diagnostic_strand_results result
  join public.whole_math_diagnostic_sittings sitting on sitting.id = result.sitting_id
  where result.student_id = p_student_id
    and result.realm_id = p_realm_id
    and result.status = 'completed'
    and result.measured_level is not null
    and sitting.status = 'completed'
  order by result.completed_at desc
  limit 1;
  if v_checkpoint is not null then
    v_checkpoint_source := 'diagnostic';
  end if;

  -- The newest realm pre/post-test is a verified live checkpoint. Mastery at
  -- 85% confirms the next level boundary; a non-passing score still
  -- recalibrates position within (or just below) the tested level.
  select
    lower(assessment.assessment_type),
    case when p_realm_id='number' and assessment.working_level in ('Year 7','Year 8') then public.number_diagnostic_level_value(assessment.working_level) else public.maths_progression_level_number(assessment.working_level) end,
    assessment.score_percent,
    assessment.completed_at
  into v_assessment_type, v_assessment_level, v_assessment_score, v_assessment_at
  from public.student_realm_assessments assessment
  where assessment.student_id = p_student_id
    and assessment.realm_id = p_realm_id
    and lower(assessment.assessment_type) in ('pretest', 'posttest')
  order by assessment.completed_at desc
  limit 1;

  if not found then
    select historical.assessment_type, historical.assessment_level,
      historical.assessment_score, historical.assessment_at
    into v_assessment_type, v_assessment_level, v_assessment_score, v_assessment_at
    from (
      select 'pretest'::text as assessment_type,
        public.maths_progression_level_number(progress.working_level) as assessment_level,
        progress.pretest_score::numeric as assessment_score,
        progress.pretest_completed_at as assessment_at
      from public.student_realm_progress progress
      where progress.student_id = p_student_id and progress.realm_id = p_realm_id
        and progress.pretest_score is not null and progress.pretest_completed_at is not null
      union all
      select 'posttest'::text,
        public.maths_progression_level_number(progress.working_level),
        progress.posttest_score::numeric,
        progress.posttest_completed_at
      from public.student_realm_progress progress
      where progress.student_id = p_student_id and progress.realm_id = p_realm_id
        and progress.posttest_score is not null and progress.posttest_completed_at is not null
    ) historical
    order by historical.assessment_at desc
    limit 1;
  end if;

  if found and v_assessment_level is not null and v_assessment_score is not null
    and (v_checkpoint_at is null or v_assessment_at > v_checkpoint_at) then
    v_checkpoint := greatest(0, least(case when p_realm_id='number' then 8 else 6 end, case
      when v_assessment_score >= v_mastery then v_assessment_level
      when v_assessment_score >= v_floor then v_assessment_level - 1 + ((v_assessment_score - v_floor) / (v_mastery - v_floor))
      else v_assessment_level - 1 - least(0.9, (v_floor - v_assessment_score) / v_floor)
    end));
    v_checkpoint_source := v_assessment_type;
    v_checkpoint_at := v_assessment_at;
  end if;

  -- A teacher placement is a transparent fallback, not verified evidence.
  if v_checkpoint is null then
    v_checkpoint := greatest(0, v_working_number - 1);
    v_checkpoint_source := 'placement';
    v_checkpoint_at := coalesce(v_progress.created_at, v_progress.updated_at, now());
  end if;

  select count(*) into v_passed_quiz_weeks
  from (
    select attempt.week
    from public.student_weekly_quiz_attempts attempt
    where attempt.student_id = p_student_id
      and attempt.realm_id = p_realm_id
      and attempt.working_level = v_progress.working_level
      and attempt.completed_at > v_checkpoint_at
    group by attempt.week
    having max(attempt.accuracy_percent) >= v_quiz_pass or bool_or(attempt.passed)
  ) passed_weeks;

  select count(*) into v_unconfirmed_lessons
  from (
    select attempt.week, attempt.lesson
    from public.student_lesson_attempts attempt
    where attempt.student_id = p_student_id
      and attempt.realm_id = p_realm_id
      and attempt.working_level = v_progress.working_level
      and attempt.completed
      and attempt.completed_at > v_checkpoint_at
      and not exists (
        select 1 from public.student_weekly_quiz_attempts quiz
        where quiz.student_id = attempt.student_id
          and quiz.realm_id = attempt.realm_id
          and quiz.working_level = attempt.working_level
          and quiz.week = attempt.week
          and quiz.completed_at > v_checkpoint_at
          and (quiz.accuracy_percent >= v_quiz_pass or quiz.passed)
      )
    group by attempt.week, attempt.lesson
  ) unconfirmed_lessons;

  v_week_equivalents := v_passed_quiz_weeks
    + (v_unconfirmed_lessons::numeric / v_lessons_per_week) * v_lesson_week_credit;
  v_predicted := least(case when p_realm_id='number' then 8 else 6 end, round((v_checkpoint + v_week_equivalents / v_total_weeks)::numeric, 2));
  v_confidence := least(
    v_max_confidence,
    case v_checkpoint_source when 'diagnostic' then 70 when 'posttest' then 70 when 'pretest' then 60 else 25 end
      + least(25, v_passed_quiz_weeks * 4 + v_unconfirmed_lessons)
  );

  insert into public.student_live_maths_progression (
    student_id, class_id, realm_id, strand, current_working_level,
    official_level, official_at, checkpoint_level, checkpoint_source, checkpoint_at, predicted_level,
    prediction_confidence, evidence, updated_at
  ) values (
    p_student_id, v_progress.class_id, p_realm_id,
    case
      when p_realm_id = 'pattern' then 'algebra'
      when p_realm_id = 'chance' then 'probability'
      else p_realm_id
    end,
    v_progress.working_level,
    round(v_official, 2), v_official_at, round(v_checkpoint, 2), v_checkpoint_source, v_checkpoint_at, v_predicted,
    v_confidence,
    jsonb_build_object(
      'passedQuizWeeks', v_passed_quiz_weeks,
      'completedUnconfirmedLessons', v_unconfirmed_lessons,
      'confirmedWeekEquivalents', round(v_week_equivalents, 2),
      'totalWeeks', v_total_weeks,
      'quizPassPercent', v_quiz_pass,
      'lessonWeekCredit', v_lesson_week_credit
    ),
    now()
  ) on conflict (student_id, realm_id) do update set
    class_id = excluded.class_id,
    strand = excluded.strand,
    current_working_level = excluded.current_working_level,
    official_level = excluded.official_level,
    official_at = excluded.official_at,
    checkpoint_level = excluded.checkpoint_level,
    checkpoint_source = excluded.checkpoint_source,
    checkpoint_at = excluded.checkpoint_at,
    predicted_level = excluded.predicted_level,
    prediction_confidence = excluded.prediction_confidence,
    evidence = excluded.evidence,
    updated_at = now();
end;
$function$
;

create or replace function public.complete_number_extension_assessment(p_student_id uuid,p_assessment_type text,p_completion_key uuid,p_attempt jsonb)
returns boolean language plpgsql security definer set search_path=public as $$
declare actual_student public.students%rowtype; inserted_count integer; total_correct integer; target_level text:=coalesce(p_attempt->>'working_level','Year 7');
begin
 perform public.assert_student_access(p_student_id);
 if target_level not in ('Year 7','Year 8') then raise exception 'Unsupported extension level'; end if;
 select * into actual_student from public.students where id=p_student_id;
 if not found or p_assessment_type not in ('pretest','posttest') or p_completion_key is null then raise exception 'Invalid extension assessment'; end if;
 if not exists(select 1 from public.student_realm_progress where student_id=p_student_id and realm_id='number' and is_current and working_level in ('Year 6','Year 7','Year 8')) then raise exception 'Extension assessments require a Level 6 or higher Number placement'; end if;
 if coalesce((p_attempt->>'total_questions')::integer,0)<>30 or jsonb_typeof(p_attempt->'question_results') is distinct from 'array' then raise exception 'Thirty recorded answers are required'; end if;
 if jsonb_array_length(p_attempt->'question_results')<>30 or exists(
  select 1 from generate_series(1,30) n where not exists(select 1 from jsonb_array_elements(p_attempt->'question_results') q where q->>'question_id'='y'||right(target_level,1)||'-number-'||(case when p_assessment_type='pretest' then 'pre' else 'post' end)||'-'||lpad(n::text,2,'0')||'-v1')
 ) then raise exception 'Question set does not match the released extension form'; end if;
 select count(*) into total_correct from jsonb_array_elements(p_attempt->'question_results') q where q->>'correct'='true';
 if coalesce((p_attempt->>'correct_count')::integer,-1)<>total_correct then raise exception 'Score does not match recorded answers'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_student_id::text||':number:'||target_level,0));
 if p_assessment_type='posttest' and not exists(select 1 from public.student_realm_assessments where student_id=p_student_id and realm_id='number' and working_level=target_level and assessment_type='pretest') then raise exception 'Complete this level’s pre-test first'; end if;
 insert into public.student_completion_receipts(student_id,realm_id,activity_type,completion_key) values(p_student_id,'number',p_assessment_type,p_completion_key) on conflict do nothing;
 get diagnostics inserted_count=row_count;
 if inserted_count=0 then return false; end if;
 insert into public.student_realm_assessments(student_id,class_id,realm_id,program_key,school_year_level,working_level,assessment_type,correct_count,total_questions,score_percent,passed,placement_result,question_results,completed_at)
 values(p_student_id,actual_student.class_id,'number',public.realm_program_key(target_level,'number'),actual_student.school_year_level,target_level,p_assessment_type,total_correct,30,round(total_correct*100.0/30),total_correct>=26,
 coalesce(p_attempt->'placement_result','{}'::jsonb)||jsonb_build_object('assessment_evidence',jsonb_build_object('realm','number','working_level',target_level,'comparison_group','paired-number-'||target_level||'-2026-09-16-v1','comparability_status','blueprint_matched_uncalibrated','calibration_status','uncalibrated','bank_versions',jsonb_build_array('1'),'baseline_only',false)),p_attempt->'question_results',now());
 return true;
end; $$;
commit;
