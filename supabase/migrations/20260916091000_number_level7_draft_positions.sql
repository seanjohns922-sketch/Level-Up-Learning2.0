-- Match the table constraint to the released 30-question Number Level 7 RPC.
begin;
alter table public.whole_math_diagnostic_strand_results
 drop constraint whole_math_diagnostic_draft_index_range;
alter table public.whole_math_diagnostic_strand_results
 add constraint whole_math_diagnostic_draft_index_range check (
  draft_question_index >= 0 and draft_question_index <=
  case when strand='number' and active_level='Year 7' then 29 else 19 end
 );
commit;
