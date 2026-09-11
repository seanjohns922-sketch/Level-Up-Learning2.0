begin;

-- Complete the six-strand Whole-Maths Diagnostic now that every realm and
-- level-test bank is live. Pending work is resumable; completed results remain
-- immutable and the official overall is calculated only from six outcomes.
alter table public.whole_math_diagnostic_strand_results
  add column if not exists active_level text null,
  add column if not exists draft_answers jsonb not null default '{}'::jsonb,
  add column if not exists draft_probe_scores jsonb not null default '[]'::jsonb,
  add column if not exists draft_question_index integer not null default 0,
  add column if not exists updated_at timestamptz not null default now();

alter table public.whole_math_diagnostic_strand_results
  drop constraint if exists whole_math_diagnostic_draft_index_range;
alter table public.whole_math_diagnostic_strand_results
  add constraint whole_math_diagnostic_draft_index_range
    check (draft_question_index between 0 and 19);

create or replace function public.whole_math_strand_curriculum_points(
  p_strand text,
  p_measured_level numeric
)
returns numeric
language plpgsql
immutable
set search_path = public
as $$
declare
  v_level numeric := greatest(0, least(6, p_measured_level));
  v_band integer;
  v_fraction numeric;
  v_counts integer[];
  v_total numeric := 0;
  v_index integer;
begin
  v_counts := case p_strand
    when 'number' then array[6,6,6,7,9,10,9]
    when 'measurement' then array[2,3,5,6,4,4,4]
    when 'space' then array[2,2,2,2,3,3,3]
    when 'statistics' then array[1,2,2,3,3,3,3]
    when 'algebra' then array[1,2,3,3,2,2,3]
    when 'probability' then array[0,0,0,2,2,2,2]
    else null
  end;
  if v_counts is null then raise exception 'Invalid diagnostic strand'; end if;
  if v_level = 6 then
    return (select sum(value) from unnest(v_counts) value);
  end if;
  v_band := floor(v_level)::integer;
  v_fraction := v_level - v_band;
  if v_band > 0 then
    for v_index in 1..v_band loop v_total := v_total + v_counts[v_index]; end loop;
  end if;
  return v_total + (v_fraction * v_counts[v_band + 1]);
end;
$$;

create or replace function public.whole_math_level_for_sitting(p_sitting_id uuid)
returns numeric
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_points numeric;
  v_level numeric;
begin
  select count(distinct result.strand),
         sum(public.whole_math_strand_curriculum_points(result.strand, result.measured_level))
  into v_count, v_points
  from public.whole_math_diagnostic_strand_results result
  where result.sitting_id = p_sitting_id
    and result.status = 'completed'
    and result.measured_level is not null;
  if v_count <> 6 then return null; end if;

  v_level := case
    when v_points <= 12 then v_points / 12
    when v_points <= 27 then 1 + ((v_points - 12) / 15)
    when v_points <= 45 then 2 + ((v_points - 27) / 18)
    when v_points <= 68 then 3 + ((v_points - 45) / 23)
    when v_points <= 91 then 4 + ((v_points - 68) / 23)
    when v_points <= 115 then 5 + ((v_points - 91) / 24)
    else 6
  end;
  return round(greatest(0, least(6, v_level)), 2);
end;
$$;

drop function if exists public.get_pending_whole_math_diagnostic(uuid);
create function public.get_pending_whole_math_diagnostic(p_student_id uuid)
returns table (
  sitting_id uuid,
  checkpoint text,
  strand text,
  starting_level text,
  status text,
  active_level text,
  draft_answers jsonb,
  draft_probes jsonb,
  draft_index integer
)
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_access(p_student_id);
  return query
  select sitting.id, sitting.checkpoint, result.strand, result.starting_level, sitting.status,
         coalesce(result.active_level, result.starting_level), result.draft_answers,
         result.draft_probe_scores, result.draft_question_index
  from public.whole_math_diagnostic_sittings sitting
  join public.whole_math_diagnostic_strand_results result on result.sitting_id = sitting.id
  where sitting.student_id = p_student_id
    and sitting.status in ('assigned', 'in_progress')
    and result.status = 'pending'
  order by sitting.created_at, case result.strand
    when 'number' then 1 when 'measurement' then 2 when 'space' then 3
    when 'statistics' then 4 when 'algebra' then 5 when 'probability' then 6 else 9 end
  limit 1;
end;
$$;

create or replace function public.save_whole_math_diagnostic_progress(
  p_student_id uuid,
  p_sitting_id uuid,
  p_strand text,
  p_active_level text,
  p_answers jsonb,
  p_probe_scores jsonb,
  p_question_index integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_access(p_student_id);
  if p_strand not in ('number','measurement','space','statistics','algebra','probability')
    or p_active_level not in ('Year 1','Year 2','Year 3','Year 4','Year 5','Year 6')
    or jsonb_typeof(p_answers) <> 'object'
    or jsonb_typeof(p_probe_scores) <> 'array'
    or jsonb_array_length(p_probe_scores) > 6
    or p_question_index not between 0 and 19 then
    raise exception 'Invalid diagnostic progress';
  end if;

  update public.whole_math_diagnostic_strand_results result
  set active_level = p_active_level,
      draft_answers = p_answers,
      draft_probe_scores = p_probe_scores,
      draft_question_index = p_question_index,
      updated_at = now()
  from public.whole_math_diagnostic_sittings sitting
  where result.sitting_id = p_sitting_id
    and sitting.id = result.sitting_id
    and result.student_id = p_student_id
    and result.strand = p_strand
    and result.status = 'pending'
    and sitting.status in ('assigned','in_progress');
  if not found then raise exception 'Diagnostic strand is not active'; end if;

  update public.whole_math_diagnostic_sittings
  set status = 'in_progress', started_at = coalesce(started_at, now())
  where id = p_sitting_id and student_id = p_student_id;
end;
$$;

create or replace function public.complete_whole_math_diagnostic_strand(
  p_student_id uuid,
  p_sitting_id uuid,
  p_strand text,
  p_probe_scores jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
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
  if jsonb_typeof(p_probe_scores) <> 'array' or jsonb_array_length(p_probe_scores) < 1 or jsonb_array_length(p_probe_scores) > 6 then
    raise exception 'Invalid diagnostic probes';
  end if;

  v_current := substring(v_result.starting_level from '[0-9]+')::integer;
  v_expected := v_current; v_last_mastered := v_current; v_recommended := v_current;
  for v_probe in select value from jsonb_array_elements(p_probe_scores) probe(value) loop
    v_level := substring(coalesce(v_probe->>'level', '') from '[0-9]+')::integer;
    v_score := nullif(v_probe->>'score', '')::integer;
    v_total := nullif(v_probe->>'total', '')::integer;
    if v_level is null or v_level <> v_expected or v_total < 10 or v_total > 20
      or v_score < 0 or v_score > v_total
      or jsonb_typeof(coalesce(v_probe->'questionIds','[]'::jsonb)) <> 'array'
      or jsonb_array_length(coalesce(v_probe->'questionIds','[]'::jsonb)) <> v_total then
      raise exception 'Invalid diagnostic probe sequence';
    end if;
    v_percent := round((v_score::numeric * 100) / v_total, 2);
    v_terminal_level := v_level; v_terminal_percent := v_percent;
    v_normalized := v_normalized || jsonb_build_array(jsonb_build_object(
      'level', 'Year ' || v_level, 'score', v_score, 'total', v_total, 'percent', v_percent,
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
  if v_terminal_percent >= v_mastery and v_terminal_level < 6 then raise exception 'A mastered level must probe the next level'; end if;

  v_measured := greatest(0, least(6, case
    when v_terminal_percent >= v_mastery then v_terminal_level
    when v_terminal_percent >= v_floor then v_terminal_level - 1 + ((v_terminal_percent - v_floor) / (v_mastery - v_floor))
    else v_terminal_level - 1 - least(0.9, (v_floor - v_terminal_percent) / v_floor) end));
  v_placement := v_sitting.checkpoint in ('start','mid','end') and v_recommended > v_current;
  update public.whole_math_diagnostic_strand_results
  set status='completed', measured_level=v_measured, recommended_level='Year ' || v_recommended,
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
      p_student_id,v_class_id,v_result.realm_id,public.realm_program_key('Year '||v_recommended,v_result.realm_id),
      v_school_year,'Year '||v_recommended,true,'ASSIGNED_PROGRAM',1,1,true,v_full_weeks,'[]'::jsonb
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
      p_student_id,v_result.realm_id,'Year '||v_recommended,'full_level','diagnostic',v_sitting.initiated_by,now(),now()
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
    'recommended_level','Year '||v_recommended,'placement_applied',v_placement,'flag',v_flag,'overall_level',v_overall);
end;
$$;

revoke all on function public.whole_math_strand_curriculum_points(text,numeric) from public, anon, authenticated;
revoke all on function public.whole_math_level_for_sitting(uuid) from public, anon, authenticated;
revoke all on function public.get_pending_whole_math_diagnostic(uuid) from public, anon, authenticated;
grant execute on function public.get_pending_whole_math_diagnostic(uuid) to anon, authenticated;
revoke all on function public.save_whole_math_diagnostic_progress(uuid,uuid,text,text,jsonb,jsonb,integer) from public, anon, authenticated;
grant execute on function public.save_whole_math_diagnostic_progress(uuid,uuid,text,text,jsonb,jsonb,integer) to anon, authenticated;
revoke all on function public.complete_whole_math_diagnostic_strand(uuid,uuid,text,jsonb) from public, anon, authenticated;
grant execute on function public.complete_whole_math_diagnostic_strand(uuid,uuid,text,jsonb) to anon, authenticated;

-- Repair complete six-strand records created while the staged implementation
-- intentionally withheld the persisted overall.
update public.whole_math_diagnostic_sittings sitting
set overall_level = public.whole_math_level_for_sitting(sitting.id)
where sitting.status = 'completed'
  and sitting.overall_level is null
  and public.whole_math_level_for_sitting(sitting.id) is not null;

commit;
