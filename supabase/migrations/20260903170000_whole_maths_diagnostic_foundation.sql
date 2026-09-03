begin;

-- Whole-Maths Diagnostic foundation. Four strands are operational today;
-- Algebra and Probability are explicit unavailable records until their realm
-- level-test banks exist. Completed sittings are immutable checkpoints.

create table if not exists public.whole_math_diagnostic_sittings (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  checkpoint text not null check (checkpoint in ('start', 'mid', 'end', 'ad_hoc')),
  status text not null default 'assigned' check (status in ('assigned', 'in_progress', 'completed')),
  initiated_by uuid null,
  overall_level numeric(4,2) null,
  started_at timestamptz null,
  completed_at timestamptz null,
  created_at timestamptz not null default now(),
  constraint whole_math_diagnostic_overall_range check (overall_level is null or overall_level between 0 and 6)
);

create table if not exists public.whole_math_diagnostic_strand_results (
  id uuid primary key default gen_random_uuid(),
  sitting_id uuid not null references public.whole_math_diagnostic_sittings(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  strand text not null check (strand in ('number', 'algebra', 'measurement', 'space', 'statistics', 'probability')),
  realm_id text null,
  status text not null check (status in ('pending', 'completed', 'unavailable')),
  unavailable_reason text null,
  starting_level text null,
  measured_level numeric(4,2) null,
  recommended_level text null,
  placement_applied boolean not null default false,
  flag text null check (flag is null or flag in ('review_support', 'extension_ready_to_bridge')),
  probe_scores jsonb not null default '[]'::jsonb,
  curriculum_codes jsonb not null default '[]'::jsonb,
  completed_at timestamptz null,
  created_at timestamptz not null default now(),
  unique (sitting_id, strand),
  constraint whole_math_diagnostic_measured_range check (measured_level is null or measured_level between 0 and 6),
  constraint whole_math_diagnostic_availability_consistent check (
    (status = 'unavailable' and unavailable_reason is not null and realm_id is null)
    or status <> 'unavailable'
  )
);

create index if not exists whole_math_diagnostic_sittings_student_created_idx
  on public.whole_math_diagnostic_sittings(student_id, created_at desc);
create index if not exists whole_math_diagnostic_sittings_class_created_idx
  on public.whole_math_diagnostic_sittings(class_id, created_at desc);
create index if not exists whole_math_diagnostic_results_sitting_idx
  on public.whole_math_diagnostic_strand_results(sitting_id, strand);

alter table public.whole_math_diagnostic_sittings enable row level security;
alter table public.whole_math_diagnostic_strand_results enable row level security;

revoke all on table public.whole_math_diagnostic_sittings from public, anon, authenticated;
revoke all on table public.whole_math_diagnostic_strand_results from public, anon, authenticated;

create or replace function public.teacher_start_whole_math_diagnostic(
  p_student_id uuid,
  p_checkpoint text,
  p_strands text[] default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sitting_id uuid;
  v_class_id uuid;
  v_school_year text;
  v_strand text;
  v_realm_id text;
  v_starting_level text;
  v_requested text[] := p_strands;
begin
  if not public.teacher_owns_student(p_student_id) then
    raise exception 'Not authorized for this student' using errcode = '42501';
  end if;
  if p_checkpoint not in ('start', 'mid', 'end', 'ad_hoc') then
    raise exception 'Invalid diagnostic checkpoint';
  end if;
  -- The complete six-strand instrument is deliberately not launchable yet.
  -- During development, an explicit subset of the four available strands is
  -- required. Remove this guard only when Algebra and Probability have real
  -- level-test banks and the 139-point overall can be persisted.
  if v_requested is null then
    raise exception 'Whole-Maths Diagnostic is staged until all six strand tests are available';
  end if;
  if cardinality(v_requested) = 0 or exists (
    select 1 from unnest(v_requested) requested(strand)
    where requested.strand not in ('number', 'algebra', 'measurement', 'space', 'statistics', 'probability')
  ) then
    raise exception 'Invalid diagnostic strand selection';
  end if;
  if exists (
    select 1 from unnest(v_requested) requested(strand)
    where requested.strand in ('algebra', 'probability')
  ) then
    raise exception 'Algebra and Probability diagnostics are not available yet';
  end if;
  if exists (
    select 1 from public.whole_math_diagnostic_sittings sitting
    where sitting.student_id = p_student_id and sitting.status <> 'completed'
  ) then
    raise exception 'This student already has an active diagnostic';
  end if;

  select student.class_id, coalesce(student.school_year_level, student.year_level, 'Year 1')
  into v_class_id, v_school_year
  from public.students student
  where student.id = p_student_id and student.archived_at is null;
  if v_class_id is null then raise exception 'Student class context is missing'; end if;

  insert into public.whole_math_diagnostic_sittings (
    student_id, class_id, checkpoint, status, initiated_by
  ) values (
    p_student_id, v_class_id, p_checkpoint, 'assigned', auth.uid()
  ) returning id into v_sitting_id;

  foreach v_strand in array v_requested loop
    v_realm_id := case
      when v_strand in ('number', 'measurement', 'space', 'statistics') then v_strand
      else null
    end;

    if v_realm_id is null then
      insert into public.whole_math_diagnostic_strand_results (
        sitting_id, student_id, strand, realm_id, status, unavailable_reason
      ) values (
        v_sitting_id, p_student_id, v_strand, null, 'unavailable',
        case when v_strand = 'algebra'
          then 'Algebra level tests are not built yet.'
          else 'Probability level tests are not built yet.' end
      );
    else
      select progress.working_level
      into v_starting_level
      from public.student_realm_progress progress
      where progress.student_id = p_student_id
        and progress.realm_id = v_realm_id
        and progress.is_current
      order by progress.updated_at desc nulls last
      limit 1;

      v_starting_level := coalesce(v_starting_level, v_school_year);
      if v_starting_level not in ('Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6') then
        v_starting_level := 'Year 1';
      end if;

      insert into public.whole_math_diagnostic_strand_results (
        sitting_id, student_id, strand, realm_id, status, starting_level
      ) values (
        v_sitting_id, p_student_id, v_strand, v_realm_id, 'pending', v_starting_level
      );
    end if;
  end loop;

  return v_sitting_id;
end;
$$;

create or replace function public.get_pending_whole_math_diagnostic(p_student_id uuid)
returns table (
  sitting_id uuid,
  checkpoint text,
  strand text,
  starting_level text,
  status text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_access(p_student_id);
  return query
  select sitting.id, sitting.checkpoint, result.strand, result.starting_level, sitting.status
  from public.whole_math_diagnostic_sittings sitting
  join public.whole_math_diagnostic_strand_results result on result.sitting_id = sitting.id
  where sitting.student_id = p_student_id
    and sitting.status in ('assigned', 'in_progress')
    and result.status = 'pending'
  order by sitting.created_at, case result.strand
    when 'number' then 1 when 'measurement' then 2 when 'space' then 3 when 'statistics' then 4 else 9 end
  limit 1;
end;
$$;

create or replace function public.get_teacher_whole_math_diagnostics(p_class_id uuid)
returns table (
  id uuid,
  student_id uuid,
  checkpoint text,
  status text,
  overall_level numeric,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz,
  strand_results jsonb
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.classes class
    where class.id = p_class_id and public.teacher_belongs_to_auth(class.teacher_id)
  ) then
    raise exception 'Not authorized for this class' using errcode = '42501';
  end if;

  return query
  select
    sitting.id,
    sitting.student_id,
    sitting.checkpoint,
    sitting.status,
    sitting.overall_level,
    sitting.started_at,
    sitting.completed_at,
    sitting.created_at,
    coalesce(jsonb_agg(jsonb_build_object(
      'strand', result.strand,
      'status', result.status,
      'starting_level', result.starting_level,
      'measured_level', result.measured_level,
      'recommended_level', result.recommended_level,
      'placement_applied', result.placement_applied,
      'flag', result.flag,
      'probe_scores', result.probe_scores,
      'curriculum_codes', result.curriculum_codes,
      'unavailable_reason', result.unavailable_reason
    ) order by case result.strand
      when 'number' then 1 when 'algebra' then 2 when 'measurement' then 3
      when 'space' then 4 when 'statistics' then 5 when 'probability' then 6 else 9 end), '[]'::jsonb)
  from public.whole_math_diagnostic_sittings sitting
  left join public.whole_math_diagnostic_strand_results result on result.sitting_id = sitting.id
  where sitting.class_id = p_class_id
  group by sitting.id
  order by sitting.created_at desc;
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
  v_probe jsonb;
  v_normalized jsonb := '[]'::jsonb;
  v_codes jsonb := '[]'::jsonb;
  v_score integer;
  v_total integer;
  v_percent numeric;
  v_level integer;
  v_expected integer;
  v_current integer;
  v_last_mastered integer;
  v_recommended integer;
  v_terminal_level integer;
  v_terminal_percent numeric;
  v_flag text := null;
  v_placement boolean := false;
  v_pending integer;
  v_full_weeks jsonb;
  v_class_id uuid;
  v_school_year text;
begin
  perform public.assert_student_access(p_student_id);
  select * into v_sitting from public.whole_math_diagnostic_sittings
  where id = p_sitting_id and student_id = p_student_id for update;
  if not found or v_sitting.status = 'completed' then raise exception 'Diagnostic sitting is not active'; end if;

  select * into v_result from public.whole_math_diagnostic_strand_results
  where sitting_id = p_sitting_id and student_id = p_student_id and strand = p_strand for update;
  if not found or v_result.status <> 'pending' or v_result.realm_id is null then
    raise exception 'Diagnostic strand is not available';
  end if;
  if jsonb_typeof(p_probe_scores) <> 'array' or jsonb_array_length(p_probe_scores) < 1 or jsonb_array_length(p_probe_scores) > 7 then
    raise exception 'Invalid diagnostic probes';
  end if;

  v_current := substring(v_result.starting_level from '[0-9]+')::integer;
  v_expected := v_current;
  v_last_mastered := v_current;
  v_recommended := v_current;

  for v_probe in select value from jsonb_array_elements(p_probe_scores) probe(value) loop
    v_level := substring(coalesce(v_probe->>'level', '') from '[0-9]+')::integer;
    v_score := nullif(v_probe->>'score', '')::integer;
    v_total := nullif(v_probe->>'total', '')::integer;
    if v_level is null or v_level <> v_expected or v_total < 10 or v_total > 20 or v_score < 0 or v_score > v_total then
      raise exception 'Invalid diagnostic probe sequence';
    end if;
    v_percent := round((v_score::numeric * 100) / v_total, 2);
    v_terminal_level := v_level;
    v_terminal_percent := v_percent;
    v_normalized := v_normalized || jsonb_build_array(jsonb_build_object(
      'level', 'Year ' || v_level,
      'score', v_score,
      'total', v_total,
      'percent', v_percent,
      'questionIds', coalesce(v_probe->'questionIds', '[]'::jsonb),
      'curriculumCodes', coalesce(v_probe->'curriculumCodes', '[]'::jsonb)
    ));
    v_codes := v_codes || coalesce(v_probe->'curriculumCodes', '[]'::jsonb);

    if v_percent >= v_mastery then
      v_last_mastered := greatest(v_last_mastered, v_level);
      v_recommended := v_last_mastered;
      v_expected := v_level + 1;
    elsif v_percent >= v_floor then
      v_recommended := greatest(v_current, v_level);
      exit;
    else
      v_recommended := greatest(v_current, v_last_mastered);
      v_flag := case when v_level = v_current then 'review_support' else 'extension_ready_to_bridge' end;
      exit;
    end if;
  end loop;

  if v_terminal_percent >= v_mastery and v_terminal_level < 6 then
    raise exception 'A mastered level must probe the next level';
  end if;

  v_placement := v_recommended > v_current;
  update public.whole_math_diagnostic_strand_results
  set status = 'completed',
      measured_level = greatest(0, least(6,
        case
          when v_terminal_percent >= v_mastery then v_terminal_level + 0.9
          when v_terminal_percent >= v_floor then v_terminal_level + ((v_terminal_percent - v_floor) / (v_mastery - v_floor))
          else v_terminal_level - least(0.9, (v_floor - v_terminal_percent) / v_floor)
        end
      )),
      recommended_level = 'Year ' || v_recommended,
      placement_applied = v_placement,
      flag = v_flag,
      probe_scores = v_normalized,
      curriculum_codes = (select coalesce(jsonb_agg(distinct code), '[]'::jsonb) from jsonb_array_elements_text(v_codes) code),
      completed_at = now()
  where id = v_result.id;

  if v_placement then
    select student.class_id, coalesce(student.school_year_level, student.year_level)
    into v_class_id, v_school_year from public.students student where student.id = p_student_id;
    v_full_weeks := case
      when v_result.realm_id = 'number' then '[1,2,3,4,5,6,7,8,9,10,11,12]'::jsonb
      when v_result.realm_id = 'statistics' then '[1,2,3,4,5,6]'::jsonb
      else '[1,2,3,4,5,6,7,8]'::jsonb
    end;

    update public.student_realm_progress set is_current = false
    where student_id = p_student_id and realm_id = v_result.realm_id and is_current;
    insert into public.student_realm_progress (
      student_id, class_id, realm_id, program_key, school_year_level, working_level,
      is_current, status, current_week, assigned_week, placement_complete, required_weeks, optional_weeks
    ) values (
      p_student_id, v_class_id, v_result.realm_id,
      public.realm_program_key('Year ' || v_recommended, v_result.realm_id),
      v_school_year, 'Year ' || v_recommended, true, 'ASSIGNED_PROGRAM', 1, 1, true,
      v_full_weeks, '[]'::jsonb
    ) on conflict (student_id, realm_id, working_level) do update set
      class_id = excluded.class_id,
      program_key = excluded.program_key,
      school_year_level = excluded.school_year_level,
      is_current = true,
      status = excluded.status,
      current_week = coalesce(public.student_realm_progress.current_week, 1),
      assigned_week = coalesce(public.student_realm_progress.assigned_week, 1),
      placement_complete = true,
      required_weeks = case when public.student_realm_progress.required_weeks = '[]'::jsonb then excluded.required_weeks else public.student_realm_progress.required_weeks end,
      updated_at = now();

    insert into public.student_realm_placement (
      student_id, realm_id, assigned_start_level, assigned_entry_mode, placement_source,
      placement_assigned_by, placement_assigned_at, updated_at
    ) values (
      p_student_id, v_result.realm_id, 'Year ' || v_recommended, 'full_level', 'diagnostic',
      v_sitting.initiated_by, now(), now()
    ) on conflict (student_id, realm_id) do update set
      assigned_start_level = excluded.assigned_start_level,
      assigned_entry_mode = excluded.assigned_entry_mode,
      placement_source = excluded.placement_source,
      placement_assigned_by = excluded.placement_assigned_by,
      placement_assigned_at = excluded.placement_assigned_at,
      updated_at = now();
  end if;

  update public.whole_math_diagnostic_sittings
  set status = 'in_progress', started_at = coalesce(started_at, now())
  where id = p_sitting_id;
  select count(*) into v_pending from public.whole_math_diagnostic_strand_results
  where sitting_id = p_sitting_id and status = 'pending';
  if v_pending = 0 then
    update public.whole_math_diagnostic_sittings
    set status = 'completed', completed_at = now(), overall_level = null
    where id = p_sitting_id;
  end if;

  return jsonb_build_object(
    'sitting_complete', v_pending = 0,
    'measured_level', greatest(0, least(6, case
      when v_terminal_percent >= v_mastery then v_terminal_level + 0.9
      when v_terminal_percent >= v_floor then v_terminal_level + ((v_terminal_percent - v_floor) / (v_mastery - v_floor))
      else v_terminal_level - least(0.9, (v_floor - v_terminal_percent) / v_floor) end)),
    'recommended_level', 'Year ' || v_recommended,
    'placement_applied', v_placement,
    'flag', v_flag
  );
end;
$$;

revoke all on function public.teacher_start_whole_math_diagnostic(uuid, text, text[]) from public, anon, authenticated;
grant execute on function public.teacher_start_whole_math_diagnostic(uuid, text, text[]) to authenticated;
revoke all on function public.get_teacher_whole_math_diagnostics(uuid) from public, anon, authenticated;
grant execute on function public.get_teacher_whole_math_diagnostics(uuid) to authenticated;
revoke all on function public.get_pending_whole_math_diagnostic(uuid) from public, anon, authenticated;
grant execute on function public.get_pending_whole_math_diagnostic(uuid) to anon, authenticated;
revoke all on function public.complete_whole_math_diagnostic_strand(uuid, uuid, text, jsonb) from public, anon, authenticated;
grant execute on function public.complete_whole_math_diagnostic_strand(uuid, uuid, text, jsonb) to anon, authenticated;

commit;
