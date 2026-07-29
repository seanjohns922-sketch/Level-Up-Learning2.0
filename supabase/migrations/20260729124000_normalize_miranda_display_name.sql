begin;

-- Keep the canonical school-platform profile human-readable. The previous
-- honorific-only value caused the home page to greet Miranda as "Mrs".
do $$
declare
  v_miranda_id uuid;
  v_match_count integer;
begin
  select
    count(*),
    (array_agg(teacher.id order by teacher.id))[1]
  into v_match_count, v_miranda_id
  from public.teachers teacher
  where lower(split_part(coalesce(teacher.email, ''), '@', 1))
      = 'miranda.johns'
    or regexp_replace(
      lower(coalesce(teacher.display_name, '')),
      '[^a-z0-9]+',
      '',
      'g'
    ) = 'mirandajohns';

  if v_match_count <> 1 then
    raise exception
      'Expected one Miranda Johns account, found %',
      v_match_count;
  end if;

  update public.user_profiles
  set
    display_name = 'Miranda Johns',
    updated_at = now()
  where user_id = v_miranda_id;

  if not found then
    raise exception 'Canonical profile not found for Miranda Johns';
  end if;

  update public.teachers
  set display_name = 'Miranda Johns'
  where id = v_miranda_id;
end;
$$;

commit;
