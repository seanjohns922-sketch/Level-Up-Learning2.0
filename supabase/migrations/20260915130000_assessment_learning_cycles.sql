-- New evidence is grouped into explicit cycles without rewriting historical rows.
-- Pre-test retries before a post-test share a baseline. A new pre-test after a
-- post-test starts a new cycle; post-test retries remain in that cycle.
begin;
create or replace function public.assign_assessment_learning_cycle()
returns trigger language plpgsql security definer set search_path = public as $$
declare previous public.student_realm_assessments%rowtype; cycle_id text;
begin
  -- Serialize cycle allocation for simultaneous requests for the same learner.
  perform pg_advisory_xact_lock(hashtextextended(new.student_id::text || ':' || new.realm_id || ':' || new.working_level, 0));
  select * into previous from public.student_realm_assessments a
  where a.student_id = new.student_id and a.realm_id = new.realm_id and a.working_level = new.working_level
  order by a.completed_at desc, a.id desc limit 1;
  cycle_id := previous.placement_result #>> '{assessment_evidence,learning_cycle_id}';
  if cycle_id is null or (lower(new.assessment_type) in ('pre','pretest','pre-test') and lower(previous.assessment_type) in ('post','posttest','post-test')) then
    cycle_id := gen_random_uuid()::text;
  end if;
  new.placement_result := coalesce(new.placement_result, '{}'::jsonb) || jsonb_build_object('assessment_evidence',
    coalesce(new.placement_result->'assessment_evidence', '{}'::jsonb) || jsonb_build_object('learning_cycle_id', cycle_id));
  return new;
end;
$$;
revoke all on function public.assign_assessment_learning_cycle() from public;
create trigger assign_assessment_learning_cycle before insert on public.student_realm_assessments
for each row execute function public.assign_assessment_learning_cycle();
commit;
