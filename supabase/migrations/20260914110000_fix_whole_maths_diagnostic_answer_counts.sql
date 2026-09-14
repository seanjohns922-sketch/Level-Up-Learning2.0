begin;

-- PostgreSQL has jsonb_array_length but no jsonb_object_length. The original
-- reporting functions therefore failed as soon as they tried to count saved
-- answer keys. Recreate both read functions with a portable key count.

create or replace function public.get_student_whole_math_diagnostic_journey(p_student_id uuid)
returns table(strand text,status text,starting_level text,active_level text,answered_count integer,measured_level numeric)
language plpgsql
security definer
set search_path=public
as $$
declare v_sitting_id uuid;
begin
  perform public.assert_student_access(p_student_id);
  select sitting.id into v_sitting_id
  from public.whole_math_diagnostic_sittings sitting
  where sitting.student_id=p_student_id
    and sitting.status in ('assigned','in_progress')
  order by sitting.created_at
  limit 1;

  if v_sitting_id is null then return; end if;

  return query
  select
    result.strand,
    result.status,
    result.starting_level,
    coalesce(result.active_level,result.starting_level),
    (select count(*)::integer
      from jsonb_object_keys(coalesce(result.draft_answers,'{}'::jsonb))),
    result.measured_level
  from public.whole_math_diagnostic_strand_results result
  where result.sitting_id=v_sitting_id
  order by case result.strand
    when 'number' then 1
    when 'measurement' then 2
    when 'space' then 3
    when 'statistics' then 4
    when 'algebra' then 5
    when 'probability' then 6
    else 9
  end;
end;
$$;

create or replace function public.get_teacher_whole_math_diagnostics(p_class_id uuid)
returns table (
  id uuid, student_id uuid, checkpoint text, status text, overall_level numeric,
  started_at timestamptz, completed_at timestamptz, created_at timestamptz,
  strand_results jsonb
)
language plpgsql
security definer
set search_path=public
as $$
begin
  if not exists (
    select 1
    from public.classes class
    where class.id=p_class_id
      and public.teacher_belongs_to_auth(class.teacher_id)
  ) then
    raise exception 'Not authorized for this class' using errcode='42501';
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
      'strand',result.strand,
      'status',result.status,
      'starting_level',result.starting_level,
      'active_level',coalesce(result.active_level,result.starting_level),
      'answered_count',(select count(*)::integer
        from jsonb_object_keys(coalesce(result.draft_answers,'{}'::jsonb))),
      'measured_level',result.measured_level,
      'recommended_level',result.recommended_level,
      'placement_applied',result.placement_applied,
      'placement_protected',result.placement_protected,
      'probe_direction',result.probe_direction,
      'source_assessment_id',result.source_assessment_id,
      'flag',result.flag,
      'probe_scores',result.probe_scores,
      'curriculum_codes',result.curriculum_codes,
      'unavailable_reason',result.unavailable_reason
    ) order by case result.strand
      when 'number' then 1
      when 'measurement' then 2
      when 'space' then 3
      when 'statistics' then 4
      when 'algebra' then 5
      when 'probability' then 6
      else 9
    end),'[]'::jsonb)
  from public.whole_math_diagnostic_sittings sitting
  left join public.whole_math_diagnostic_strand_results result
    on result.sitting_id=sitting.id
  where sitting.class_id=p_class_id
  group by sitting.id
  order by sitting.created_at desc;
end;
$$;

revoke all on function public.get_student_whole_math_diagnostic_journey(uuid)
  from public,anon,authenticated;
grant execute on function public.get_student_whole_math_diagnostic_journey(uuid)
  to authenticated;
revoke all on function public.get_teacher_whole_math_diagnostics(uuid)
  from public,anon,authenticated;
grant execute on function public.get_teacher_whole_math_diagnostics(uuid)
  to authenticated;

commit;
