begin;

-- Add the free "Character" choice (Boy / Girl body silhouette) to the avatar
-- base look. The client sends { body: "neutral" | "dress" }; whitelist the new
-- `body` key so set_student_avatar_base_secure persists it alongside skin/hair.
create or replace function public.set_student_avatar_base_secure(
  p_student_id uuid,
  p_base jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_clean jsonb;
begin
  perform public.assert_student_access(p_student_id);
  v_clean := coalesce((
    select jsonb_object_agg(e.key, e.value)
    from jsonb_each(coalesce(p_base, '{}'::jsonb)) e
    where e.key in (
      'body', 'skin', 'skinShade', 'hair', 'hairShade', 'hairStyle',
      'shirt', 'shirtTrim', 'pants', 'shoes'
    )
      and jsonb_typeof(e.value) = 'string'
      and length(e.value #>> '{}') <= 24
  ), '{}'::jsonb);

  insert into public.student_avatar_base(student_id, base)
  values (p_student_id, v_clean)
  on conflict (student_id) do update set base = excluded.base, updated_at = now();

  return public.get_student_economy_secure(p_student_id);
end;
$$;

revoke all on function public.set_student_avatar_base_secure(uuid, jsonb) from public;
grant execute on function public.set_student_avatar_base_secure(uuid, jsonb) to anon, authenticated;

commit;
