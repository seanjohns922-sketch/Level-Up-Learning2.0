-- Defer follow-up level tests so students move on to a fresh realm after each 20-question test.
-- A realm with saved probe scores has a follow-up level waiting (one level lower after 25% or
-- less, one level higher after 85% or more). Those realms now queue behind realms that have not
-- had their first test, keeping the fixed strand order within each group. Scoring, probe
-- sequencing and completion rules are unchanged.
create or replace function public.get_pending_whole_math_diagnostic(p_student_id uuid)
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
  order by sitting.created_at,
    case when jsonb_typeof(result.draft_probe_scores)='array' and jsonb_array_length(result.draft_probe_scores)>0 then 1 else 0 end,
    case result.strand when 'number' then 1 when 'measurement' then 2 when 'space' then 3 when 'statistics' then 4 when 'algebra' then 5 when 'probability' then 6 else 9 end
  limit 1;
end;
$$;

revoke all on function public.get_pending_whole_math_diagnostic(uuid) from public,anon,authenticated;
grant execute on function public.get_pending_whole_math_diagnostic(uuid) to anon,authenticated;
