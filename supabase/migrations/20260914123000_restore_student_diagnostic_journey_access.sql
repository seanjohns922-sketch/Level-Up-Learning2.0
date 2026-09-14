begin;

-- Students authenticate through the scoped x-student-session header while the
-- PostgREST database role remains anon. The answer-count correction recreated
-- this function with authenticated-only execute access, which prevented an
-- assigned student from loading the diagnostic journey screen.
revoke all on function public.get_student_whole_math_diagnostic_journey(uuid)
  from public,anon,authenticated;
grant execute on function public.get_student_whole_math_diagnostic_journey(uuid)
  to anon,authenticated;

commit;
