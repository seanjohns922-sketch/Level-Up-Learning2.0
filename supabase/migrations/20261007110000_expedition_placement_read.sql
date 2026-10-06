begin;
-- Read only; use the same validated student-session boundary as other student RPCs.
create or replace function public.get_student_expedition_placements_secure(p_student_id uuid)
returns table(student_id uuid, realm_id text, assigned_start_level text)
language plpgsql stable security definer set search_path = public as $$
begin
 perform public.assert_student_access(p_student_id);
 return query select p.student_id,p.realm_id,p.assigned_start_level
 from public.student_realm_placement p where p.student_id=p_student_id;
end;
$$;
revoke all on function public.get_student_expedition_placements_secure(uuid) from public, anon, authenticated;
grant execute on function public.get_student_expedition_placements_secure(uuid) to anon, authenticated;
commit;
