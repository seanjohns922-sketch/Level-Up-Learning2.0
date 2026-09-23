-- Deploy web support before enabling new Pattern Peaks sittings. Existing cycles stay pinned.
begin;
alter table public.whole_math_diagnostic_strand_results drop constraint whole_math_diagnostic_measured_range;
alter table public.whole_math_diagnostic_strand_results add constraint whole_math_diagnostic_measured_range check(measured_level is null or (measured_level>=0 and measured_level<=case when strand in ('number','measurement','space','statistics','algebra') then 8 else 6 end));
alter table public.whole_math_diagnostic_strand_results drop constraint whole_math_diagnostic_draft_index_range;
alter table public.whole_math_diagnostic_strand_results add constraint whole_math_diagnostic_draft_index_range check(draft_question_index>=0 and draft_question_index<=case when strand in ('number','measurement','space','statistics','algebra') and active_level in ('Year 7','Year 8') then 29 else 19 end);
alter table public.whole_math_diagnostic_sittings add column pattern_release_version integer not null default 0 check(pattern_release_version in (0,1));
alter table public.whole_math_diagnostic_sittings alter column pattern_release_version set default 1;
create function public.pin_pattern_release_version() returns trigger language plpgsql security definer set search_path=public as $$
declare previous integer;
begin
 select s.pattern_release_version into previous from public.whole_math_diagnostic_sittings s
 where s.student_id=new.student_id and s.academic_year=new.academic_year order by s.created_at,s.id limit 1;
 new.pattern_release_version:=coalesce(previous,1);
 return new;
end;
$$;
revoke all on function public.pin_pattern_release_version() from public,anon,authenticated;
create trigger trg_pin_pattern_release_version before insert on public.whole_math_diagnostic_sittings for each row execute function public.pin_pattern_release_version();


CREATE OR REPLACE FUNCTION public.get_pending_whole_math_diagnostic_pattern_full(p_student_id uuid)
 RETURNS TABLE(sitting_id uuid, checkpoint text, strand text, starting_level text, status text, active_level text, draft_answers jsonb, draft_probes jsonb, draft_index integer, access_open boolean, number_level1_bank_version integer, number_ground_bank_version integer, number_level2_bank_version integer, number_level4_bank_version integer, number_level5_bank_version integer, number_level6_bank_version integer, number_level3_bank_version integer, number_maximum_level integer, measurement_ground_bank_version integer, measurement_level1_bank_version integer, measurement_level2_bank_version integer, measurement_level5_bank_version integer, measurement_level6_bank_version integer, measurement_release_version integer, space_ground_bank_version integer, space_release_version integer, statistics_release_version integer, pattern_release_version integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  perform public.assert_student_access(p_student_id);
  return query select p.*,s.pattern_release_version
  from public.get_pending_whole_math_diagnostic_statistica_full(p_student_id) p
  join public.whole_math_diagnostic_sittings s on s.id=p.sitting_id;
end;
$function$
;
revoke all on function public.get_pending_whole_math_diagnostic_pattern_full(uuid) from public,anon,authenticated;
grant execute on function public.get_pending_whole_math_diagnostic_pattern_full(uuid) to anon,authenticated;
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
  v_minimum:=case when p_strand='space' and v_sitting.space_ground_bank_version=3 then 0 when p_strand='measurement' and v_sitting.measurement_ground_bank_version=4 then 0 when p_strand='number' and v_sitting.number_ground_bank_version=3 then 0 when p_strand in ('algebra','probability') then 3 else 1 end;
  if jsonb_typeof(p_probe_scores)<>'array' or jsonb_array_length(p_probe_scores)<1 or jsonb_array_length(p_probe_scores)>(case when p_strand='algebra' and v_sitting.pattern_release_version=1 then 8 when p_strand='statistics' and v_sitting.statistics_release_version=1 then 8 when p_strand='space' and v_sitting.space_release_version=1 then 9 when p_strand='space' and v_sitting.space_ground_bank_version=3 then 7 when p_strand='number' and v_sitting.number_ground_bank_version=3 then v_sitting.number_maximum_level+1 when p_strand='measurement' and v_sitting.measurement_release_version=1 then 9 when p_strand='measurement' and v_sitting.measurement_ground_bank_version=4 then 7 else 6 end) then
    raise exception 'Invalid diagnostic probes';
  end if;
  -- Validate every direction before delegating. No client can submit a shortened,
  -- duplicated or synthetic-count probe to the older upward completion routine.
  for v_probe in select value from jsonb_array_elements(p_probe_scores) probe(value) loop
    v_level:=public.number_diagnostic_level_value(coalesce(v_probe->>'level',''));
    v_score:=nullif(v_probe->>'score','')::integer;
    v_total:=nullif(v_probe->>'total','')::integer;
    if v_level is null or v_level<v_minimum or v_level>(case when p_strand='number' then v_sitting.number_maximum_level when p_strand='algebra' and v_sitting.pattern_release_version=1 then 8 when p_strand='statistics' and v_sitting.statistics_release_version=1 then 8 when p_strand='space' and v_sitting.space_release_version=1 then 8 when p_strand='measurement' and v_sitting.measurement_release_version=1 then 8 else 6 end) or v_total<>(case when p_strand in ('number','measurement','space','statistics','algebra') and v_level in (7,8) then 30 else 20 end) or v_score<0 or v_score>v_total
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

  v_measured:=greatest(0,least((case when p_strand='number' then v_sitting.number_maximum_level when p_strand='algebra' and v_sitting.pattern_release_version=1 then 8 when p_strand='statistics' and v_sitting.statistics_release_version=1 then 8 when p_strand='space' and v_sitting.space_release_version=1 then 8 when p_strand='measurement' and v_sitting.measurement_release_version=1 then 8 else 6 end),case when v_terminal_percent>=85 then v_terminal_level
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
  if jsonb_typeof(p_probe_scores) <> 'array' or jsonb_array_length(p_probe_scores) < 1 or jsonb_array_length(p_probe_scores)>(case when p_strand='algebra' and v_sitting.pattern_release_version=1 then 8 when p_strand='statistics' and v_sitting.statistics_release_version=1 then 8 when p_strand='space' and v_sitting.space_release_version=1 then 9 when p_strand='space' and v_sitting.space_ground_bank_version=3 then 7 when p_strand='number' and v_sitting.number_ground_bank_version=3 then v_sitting.number_maximum_level+1 when p_strand='measurement' and v_sitting.measurement_release_version=1 then 9 when p_strand='measurement' and v_sitting.measurement_ground_bank_version=4 then 7 else 6 end) then
    raise exception 'Invalid diagnostic probes';
  end if;

  v_current := public.number_diagnostic_level_value(v_result.starting_level);
  v_expected := v_current; v_last_mastered := v_current; v_recommended := v_current;
  for v_probe in select value from jsonb_array_elements(p_probe_scores) probe(value) loop
    v_level := public.number_diagnostic_level_value(coalesce(v_probe->>'level', ''));
    v_score := nullif(v_probe->>'score', '')::integer;
    v_total := nullif(v_probe->>'total', '')::integer;
    if v_level is null or v_level<(case when p_strand='space' and v_sitting.space_ground_bank_version=3 then 0 when p_strand='measurement' and v_sitting.measurement_ground_bank_version=4 then 0 when p_strand='number' and v_sitting.number_ground_bank_version=3 then 0 when p_strand in ('algebra','probability') then 3 else 1 end) or v_level>(case when p_strand='number' then v_sitting.number_maximum_level when p_strand='algebra' and v_sitting.pattern_release_version=1 then 8 when p_strand='statistics' and v_sitting.statistics_release_version=1 then 8 when p_strand='space' and v_sitting.space_release_version=1 then 8 when p_strand='measurement' and v_sitting.measurement_release_version=1 then 8 else 6 end) or v_level <> v_expected or v_total <> (case when p_strand in ('number','measurement','space','statistics','algebra') and v_level in (7,8) then 30 else 20 end)
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
  if v_terminal_percent >= v_mastery and v_terminal_level < (case when p_strand='number' then v_sitting.number_maximum_level when p_strand='algebra' and v_sitting.pattern_release_version=1 then 8 when p_strand='statistics' and v_sitting.statistics_release_version=1 then 8 when p_strand='space' and v_sitting.space_release_version=1 then 8 when p_strand='measurement' and v_sitting.measurement_release_version=1 then 8 else 6 end) then raise exception 'A mastered level must probe the next level'; end if;

  v_measured := greatest(0, least((case when p_strand='number' then v_sitting.number_maximum_level when p_strand='algebra' and v_sitting.pattern_release_version=1 then 8 when p_strand='statistics' and v_sitting.statistics_release_version=1 then 8 when p_strand='space' and v_sitting.space_release_version=1 then 8 when p_strand='measurement' and v_sitting.measurement_release_version=1 then 8 else 6 end), case
    when v_terminal_percent >= v_mastery then v_terminal_level
    when v_terminal_percent >= v_floor then v_terminal_level - 1 + ((v_terminal_percent - v_floor) / (v_mastery - v_floor))
    else v_terminal_level - 1 - least(0.9, (v_floor - v_terminal_percent) / v_floor) end));
  if p_strand in ('number','measurement','space','statistics','algebra') and v_recommended>6 then v_recommended:=6; v_flag:='extension_ready_to_bridge'; end if;
  v_placement := v_sitting.checkpoint in ('start','mid','end') and v_recommended > v_current and (p_strand<>'number' or v_sitting.number_ground_bank_version<>3 or not v_result.placement_protected) and (p_strand<>'measurement' or v_sitting.measurement_ground_bank_version<>4 or not v_result.placement_protected) and (p_strand<>'space' or v_sitting.space_ground_bank_version<>3 or not v_result.placement_protected);
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
    or (p_active_level not in ('Prep','Year 1','Year 2','Year 3','Year 4','Year 5','Year 6') and not (p_strand in ('number','measurement','space','statistics','algebra') and p_active_level in ('Year 7','Year 8') and exists(select 1 from public.whole_math_diagnostic_sittings s where s.id=p_sitting_id and s.student_id=p_student_id and public.number_diagnostic_level_value(p_active_level)<=case when p_strand='number' then s.number_maximum_level when p_strand='algebra' and s.pattern_release_version=1 then 8 when p_strand='statistics' and s.statistics_release_version=1 then 8 when p_strand='space' and s.space_release_version=1 then 8 when p_strand='measurement' and s.measurement_release_version=1 then 8 else 6 end)))
    or (p_active_level='Prep' and not exists(select 1 from public.whole_math_diagnostic_sittings s where s.id=p_sitting_id and ((s.space_ground_bank_version=3 and p_strand='space') or (s.number_ground_bank_version=3 and p_strand='number') or (s.measurement_ground_bank_version=4 and p_strand='measurement'))))
    or jsonb_typeof(p_answers)<>'object' or jsonb_typeof(p_probe_scores)<>'array'
    or jsonb_array_length(p_probe_scores)>(case when p_strand='statistics' and exists(select 1 from public.whole_math_diagnostic_sittings s where s.id=p_sitting_id and s.statistics_release_version=1) then 8 when p_strand='space' and exists(select 1 from public.whole_math_diagnostic_sittings s where s.id=p_sitting_id and s.space_release_version=1) then 9 when p_strand='space' and exists(select 1 from public.whole_math_diagnostic_sittings s where s.id=p_sitting_id and s.space_ground_bank_version=3) then 7 when p_strand='number' and exists(select 1 from public.whole_math_diagnostic_sittings s where s.id=p_sitting_id and s.number_ground_bank_version=3) then 9 when p_strand='measurement' and exists(select 1 from public.whole_math_diagnostic_sittings s where s.id=p_sitting_id and s.measurement_release_version=1) then 9 when p_strand='measurement' and exists(select 1 from public.whole_math_diagnostic_sittings s where s.id=p_sitting_id and s.measurement_ground_bank_version=4) then 7 else 6 end) or p_question_index not between 0 and (case when p_strand in ('number','measurement','space','statistics','algebra') and p_active_level in ('Year 7','Year 8') then 29 else 19 end) then
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
  v_total integer; v_measured numeric; v_adopted integer:=0; v_pending integer; v_overall numeric;
begin
  select * into v_sitting from public.whole_math_diagnostic_sittings where id=p_sitting_id for update;
  if not found or not public.teacher_owns_student(v_sitting.student_id) then
    raise exception 'Not authorized for this diagnostic' using errcode='42501';
  end if;
  for v_result in select * from public.whole_math_diagnostic_strand_results
    where sitting_id=p_sitting_id and status='pending'
      and draft_answers='{}'::jsonb and draft_probe_scores='[]'::jsonb
      and source_assessment_id is null order by created_at
  loop
    v_total:=case when v_result.realm_id in ('number','measurement','space','statistics','pattern') and v_result.starting_level in ('Year 7','Year 8') then 30 else 20 end;
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
      and (v_result.realm_id<>'measurement' or v_result.starting_level<>'Prep' or not exists(select 1 from jsonb_array_elements(assessment.question_results) evidence where coalesce(evidence->>'question_id','') !~ ('^y0-measurement-(pre|post)-[0-9]{2}-v'||v_sitting.measurement_ground_bank_version::text||'$')))
      and (v_result.realm_id<>'measurement' or v_result.starting_level<>'Year 1' or not exists(select 1 from jsonb_array_elements(assessment.question_results) evidence where coalesce(evidence->>'question_id','') !~ ('^y1-measurement-(pre|post)-[0-9]{2}-v'||v_sitting.measurement_level1_bank_version::text||'$')))
      and (v_result.realm_id<>'measurement' or v_result.starting_level<>'Year 2' or not exists(select 1 from jsonb_array_elements(assessment.question_results) evidence where coalesce(evidence->>'question_id','') !~ ('^y2-measurement-(pre|post)-[0-9]{2}-v'||v_sitting.measurement_level2_bank_version::text||'$')))
      and (v_result.realm_id<>'measurement' or v_result.starting_level<>'Year 5' or not exists(select 1 from jsonb_array_elements(assessment.question_results) evidence where coalesce(evidence->>'question_id','') !~ ('^y5-measurement-(pre|post)-[0-9]{2}-v'||v_sitting.measurement_level5_bank_version::text||'$')))
      and (v_result.realm_id<>'measurement' or v_result.starting_level<>'Year 6' or not exists(select 1 from jsonb_array_elements(assessment.question_results) evidence where coalesce(evidence->>'question_id','') !~ ('^y6-measurement-(pre|post)-[0-9]{2}-v'||v_sitting.measurement_level6_bank_version::text||'$')))
      and (v_result.realm_id<>'measurement' or v_result.starting_level not in ('Year 3','Year 4','Year 7','Year 8') or not exists(select 1 from jsonb_array_elements(assessment.question_results) evidence where coalesce(evidence->>'question_id','') !~ ('^y'||right(v_result.starting_level,1)||'-measurement-(pre|post)-[0-9]{2}-v'||case when v_sitting.measurement_release_version=1 then '4' else '3' end||'$')))
      and (v_result.realm_id<>'space' or not exists (
        select 1 from jsonb_array_elements(assessment.question_results) evidence
        where (coalesce(evidence->>'question_id','') ~ ('^y'||public.number_diagnostic_level_value(v_result.starting_level)||'-starpath-(pretest|posttest)-[0-9]{2}-v9$')) is distinct from (v_sitting.space_release_version=1)))
      and (v_result.realm_id<>'statistics' or not exists (
        select 1 from jsonb_array_elements(assessment.question_results) evidence
        where (coalesce(evidence->>'question_id','') ~ ('^y'||public.number_diagnostic_level_value(v_result.starting_level)||'-statistica-(pretest|posttest)-[0-9]{2}-v3$')) is distinct from (v_sitting.statistics_release_version=1)))
      and (v_result.realm_id<>'pattern' or not exists (
        select 1 from jsonb_array_elements(assessment.question_results) evidence
        where (coalesce(evidence->>'question_id','') ~ ('^y'||public.number_diagnostic_level_value(v_result.starting_level)||'-pattern-(pretest|posttest)-[0-9]{2}-v1$')) is distinct from (v_sitting.pattern_release_version=1)))
      and assessment.total_questions=v_total and assessment.correct_count between 0 and v_total
      and jsonb_typeof(assessment.question_results)='array'
      and jsonb_array_length(assessment.question_results)=v_total
      and (select count(distinct item->>'question_id')
        from jsonb_array_elements(assessment.question_results) item)=v_total
      and assessment.completed_at>=v_sitting.created_at-interval '21 days'
      and not exists (select 1 from public.whole_math_diagnostic_strand_results used where used.source_assessment_id=assessment.id)
    order by assessment.completed_at asc limit 1;
    if not found then continue; end if;
    v_level:=public.number_diagnostic_level_value(v_result.starting_level);
    v_minimum:=case when v_result.strand='space' and v_sitting.space_ground_bank_version=3 then 0 when v_result.strand='measurement' and v_sitting.measurement_ground_bank_version=4 then 0 when v_result.strand='number' and v_sitting.number_ground_bank_version=3 then 0 when v_result.strand in ('algebra','probability') then 3 else 1 end;
    v_percent:=round(v_assessment.correct_count::numeric*100/v_assessment.total_questions,2);
    v_probe:=jsonb_build_object(
      'level',v_result.starting_level,'score',v_assessment.correct_count,'total',v_total,'percent',v_percent,
      'questionIds',(select jsonb_agg(item->>'question_id' order by (item->>'question_number')::integer) from jsonb_array_elements(v_assessment.question_results) item),
      'curriculumCodes',(select coalesce(jsonb_agg(distinct code),'[]'::jsonb) from jsonb_array_elements(v_assessment.question_results) item,
        jsonb_array_elements_text(coalesce(item->'curriculum_codes','[]'::jsonb)) code)
    );
    if v_percent>=85 and v_level<(case when v_result.realm_id='number' then v_sitting.number_maximum_level when v_result.realm_id='pattern' and v_sitting.pattern_release_version=1 then 8 when v_result.realm_id='statistics' and v_sitting.statistics_release_version=1 then 8 when v_result.realm_id='space' and v_sitting.space_release_version=1 then 8 when v_result.realm_id='measurement' and v_sitting.measurement_release_version=1 then 8 else 6 end) then
      update public.whole_math_diagnostic_strand_results set source_assessment_id=v_assessment.id,
        active_level=public.number_diagnostic_level_label(v_level+1),draft_probe_scores=jsonb_build_array(v_probe),probe_direction='up',updated_at=now()
      where id=v_result.id;
    elsif v_percent<=25 and v_level>v_minimum then
      update public.whole_math_diagnostic_strand_results set source_assessment_id=v_assessment.id,
        active_level=public.number_diagnostic_level_label(v_level-1),draft_probe_scores=jsonb_build_array(v_probe),probe_direction='down',flag='review_support',updated_at=now()
      where id=v_result.id;
    else
      v_measured:=greatest(0,least(case when v_result.realm_id='number' then v_sitting.number_maximum_level when v_result.realm_id='pattern' and v_sitting.pattern_release_version=1 then 8 when v_result.realm_id='statistics' and v_sitting.statistics_release_version=1 then 8 when v_result.realm_id='space' and v_sitting.space_release_version=1 then 8 when v_result.realm_id='measurement' and v_sitting.measurement_release_version=1 then 8 else 6 end,case when v_percent>=85 then v_level
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
CREATE OR REPLACE FUNCTION public.prepare_pattern_release_level()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare original_level text;
begin
 if new.strand='algebra' and exists(select 1 from public.whole_math_diagnostic_sittings s where s.id=new.sitting_id and s.pattern_release_version=1) then
  select coalesce((select p.working_level from public.student_realm_progress p where p.student_id=new.student_id and p.realm_id='pattern' and p.is_current order by p.updated_at desc nulls last limit 1),
   (select p.assigned_start_level from public.student_realm_placement p where p.student_id=new.student_id and p.realm_id='pattern'),s.school_year_level,s.year_level) into original_level from public.students s where s.id=new.student_id;
  if original_level in ('Year 7','Year 8') then new.starting_level:=original_level; end if;
 end if;
 return new;
end;
$function$
;
revoke all on function public.prepare_pattern_release_level() from public,anon,authenticated;
create trigger trg_prepare_pattern_release_level before insert on public.whole_math_diagnostic_strand_results for each row execute function public.prepare_pattern_release_level();
CREATE OR REPLACE FUNCTION public.complete_pattern_extension_assessment(p_student_id uuid, p_assessment_type text, p_completion_key uuid, p_attempt jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare actual_student public.students%rowtype; inserted_count integer; total_correct integer; target_level text:=coalesce(p_attempt->>'working_level','Year 7');
begin
 perform public.assert_student_access(p_student_id);
 if target_level not in ('Year 7','Year 8') then raise exception 'Unsupported extension level'; end if;
 select * into actual_student from public.students where id=p_student_id;
 if not found or p_assessment_type not in ('pretest','posttest') or p_completion_key is null then raise exception 'Invalid extension assessment'; end if;
 if not exists(select 1 from public.student_realm_progress where student_id=p_student_id and realm_id='pattern' and is_current and working_level in ('Year 6','Year 7','Year 8')) then raise exception 'Extension assessments require a Level 6 or higher Pattern Peaks placement'; end if;
 if coalesce((p_attempt->>'total_questions')::integer,0)<>30 or jsonb_typeof(p_attempt->'question_results') is distinct from 'array' then raise exception 'Thirty recorded answers are required'; end if;
 if jsonb_array_length(p_attempt->'question_results')<>30 or exists(
  select 1 from generate_series(1,30) n where not exists(select 1 from jsonb_array_elements(p_attempt->'question_results') q where q->>'question_id'='y'||right(target_level,1)||'-pattern-'||p_assessment_type||'-'||lpad(n::text,2,'0')||'-v1')
 ) then raise exception 'Question set does not match the released extension form'; end if;
 select count(*) into total_correct from jsonb_array_elements(p_attempt->'question_results') q where q->>'correct'='true';
 if coalesce((p_attempt->>'correct_count')::integer,-1)<>total_correct then raise exception 'Score does not match recorded answers'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_student_id::text||':pattern:'||target_level,0));
 if p_assessment_type='posttest' and not exists(select 1 from public.student_realm_assessments where student_id=p_student_id and realm_id='pattern' and working_level=target_level and assessment_type='pretest') then raise exception 'Complete this level’s pre-test first'; end if;
 insert into public.student_completion_receipts(student_id,realm_id,activity_type,completion_key) values(p_student_id,'pattern',p_assessment_type,p_completion_key) on conflict do nothing;
 get diagnostics inserted_count=row_count;
 if inserted_count=0 then return false; end if;
 insert into public.student_realm_assessments(student_id,class_id,realm_id,program_key,school_year_level,working_level,assessment_type,correct_count,total_questions,score_percent,passed,placement_result,question_results,completed_at)
 values(p_student_id,actual_student.class_id,'pattern',public.realm_program_key(target_level,'pattern'),actual_student.school_year_level,target_level,p_assessment_type,total_correct,30,round(total_correct*100.0/30),total_correct>=26,
 coalesce(p_attempt->'placement_result','{}'::jsonb)||jsonb_build_object('assessment_evidence',jsonb_build_object('realm','pattern','working_level',target_level,'comparison_group','pattern-'||target_level||'-2026-09-23-v1','comparability_status','blueprint_matched_uncalibrated','calibration_status','uncalibrated','bank_versions',jsonb_build_array('1'),'baseline_only',false)),p_attempt->'question_results',now());
 return true;
end; $function$
;
revoke all on function public.complete_pattern_extension_assessment(uuid,text,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.complete_pattern_extension_assessment(uuid,text,uuid,jsonb) to anon,authenticated;
notify pgrst, 'reload schema';
commit;
