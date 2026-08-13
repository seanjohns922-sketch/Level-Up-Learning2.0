begin;

create or replace function public.parent_set_home_starting_levels(
  p_student_id uuid,
  p_number_level text,
  p_measurement_level text,
  p_space_level text
)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  perform public.assert_parent_role();
  if not public.parent_can_manage_home_student(p_student_id) then
    raise exception 'Home student management has transferred to the school' using errcode = '42501';
  end if;

  -- These calls share this transaction. Any invalid or disallowed placement
  -- rolls back all three realms instead of leaving onboarding partly complete.
  perform public.parent_change_home_starting_level(p_student_id, 'number', p_number_level);
  perform public.parent_change_home_starting_level(p_student_id, 'measurement', p_measurement_level);
  perform public.parent_change_home_starting_level(p_student_id, 'space', p_space_level);

  insert into public.student_identity_audit_events (
    actor_user_id, action, student_id, after_state
  ) values (
    auth.uid(), 'home_starting_levels_confirmed', p_student_id,
    jsonb_build_object(
      'number', p_number_level,
      'measurement', p_measurement_level,
      'space', p_space_level
    )
  );
end;
$$;

revoke all on function public.parent_set_home_starting_levels(uuid,text,text,text)
  from public, anon;
grant execute on function public.parent_set_home_starting_levels(uuid,text,text,text)
  to authenticated;

commit;
