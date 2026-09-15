-- Apply after the web release. Existing sittings retain v2; new cycles use v5.
-- Additive RPC preserves the old app contract and the existing access/session gates.
begin;
alter table public.whole_math_diagnostic_sittings
  add column if not exists number_level1_bank_version integer not null default 2
  check (number_level1_bank_version in (2,5));
alter table public.whole_math_diagnostic_sittings alter column number_level1_bank_version set default 5;

create or replace function public.pin_number_level1_diagnostic_version()
returns trigger language plpgsql security definer set search_path=public as $$
declare prior_version integer;
begin
  select s.number_level1_bank_version into prior_version
  from public.whole_math_diagnostic_sittings s
  where s.student_id=new.student_id and s.academic_year=new.academic_year
  order by s.created_at,s.id limit 1;
  new.number_level1_bank_version:=coalesce(prior_version,5);
  return new;
end;
$$;
revoke all on function public.pin_number_level1_diagnostic_version() from public,anon,authenticated;
drop trigger if exists trg_pin_number_level1_diagnostic_version on public.whole_math_diagnostic_sittings;
create trigger trg_pin_number_level1_diagnostic_version before insert on public.whole_math_diagnostic_sittings
for each row execute function public.pin_number_level1_diagnostic_version();

create or replace function public.get_pending_whole_math_diagnostic_versioned(p_student_id uuid)
returns table (
  sitting_id uuid, checkpoint text, strand text, starting_level text, status text,
  active_level text, draft_answers jsonb, draft_probes jsonb, draft_index integer,
  access_open boolean, number_level1_bank_version integer
)
language plpgsql security definer set search_path=public as $$
begin
  -- The original RPC enforces assert_student_access and preserves deferred follow-ups.
  return query select pending.*, sitting.number_level1_bank_version
  from public.get_pending_whole_math_diagnostic(p_student_id) pending
  join public.whole_math_diagnostic_sittings sitting on sitting.id=pending.sitting_id;
end;
$$;
revoke all on function public.get_pending_whole_math_diagnostic_versioned(uuid) from public,anon,authenticated;
grant execute on function public.get_pending_whole_math_diagnostic_versioned(uuid) to anon,authenticated;

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
      and (v_result.realm_id <> 'number' or v_result.starting_level <> 'Year 1'
        or not exists (
          select 1 from jsonb_array_elements(assessment.question_results) evidence
          where coalesce(evidence->>'question_id','') !~
            ('^y1-number-(pre|post)-[0-9]{2}-v' || v_sitting.number_level1_bank_version::text || '$')
        ))
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
notify pgrst, 'reload schema';
commit;
