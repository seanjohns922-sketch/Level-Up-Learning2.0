-- School/home pupils authenticate with a validated student-session header under
-- the anon API role. Keep the underlying assert_student_access guard intact.
begin;
grant execute on function public.get_pending_whole_math_diagnostic_measurement(uuid) to anon, authenticated;
grant execute on function public.get_pending_whole_math_diagnostic_measurement1(uuid) to anon, authenticated;
notify pgrst, 'reload schema';
commit;
