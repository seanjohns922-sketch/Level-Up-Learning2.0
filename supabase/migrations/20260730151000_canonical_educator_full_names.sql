begin;

-- Educator names are identity data, not classroom honorifics. Normalise legacy
-- values such as "Miss Newey" to "Marika Newey" and apply the same rule when
-- future teacher or administrator accounts are created.
create or replace function public.canonical_educator_display_name(
  p_display_name text,
  p_email text
)
returns text
language plpgsql
immutable
set search_path = public
as $$
declare
  v_name text := nullif(trim(p_display_name), '');
  v_personal_name text;
  v_email_local text := split_part(coalesce(p_email, ''), '@', 1);
  v_email_parts text[];
  v_first_name text;
  v_surname text;
begin
  v_personal_name := nullif(
    trim(
      regexp_replace(
        coalesce(v_name, ''),
        '^(mr|mrs|ms|miss|mx|dr|prof|sir|dame)[.]?[[:space:]]+',
        '',
        'i'
      )
    ),
    ''
  );

  if v_personal_name is not null
    and v_personal_name !~ '@'
    and array_length(
      regexp_split_to_array(v_personal_name, '[[:space:]]+'),
      1
    ) > 1
  then
    return v_personal_name;
  end if;

  v_email_parts := regexp_split_to_array(v_email_local, '[._+-]+');
  v_first_name := nullif(
    initcap(regexp_replace(coalesce(v_email_parts[1], ''), '[^a-zA-Z''-]', '', 'g')),
    ''
  );

  if v_personal_name is not null and v_personal_name !~ '@' then
    v_surname := v_personal_name;
  elsif coalesce(array_length(v_email_parts, 1), 0) > 1 then
    v_surname := nullif(
      initcap(
        regexp_replace(coalesce(v_email_parts[2], ''), '[^a-zA-Z''-]', '', 'g')
      ),
      ''
    );
  end if;

  if v_first_name is not null
    and v_surname is not null
    and lower(v_first_name) <> lower(v_surname)
  then
    return v_first_name || ' ' || v_surname;
  end if;

  return coalesce(v_surname, v_first_name, v_name, p_email, 'Educator');
end;
$$;

update public.user_profiles profile
set
  display_name = public.canonical_educator_display_name(
    profile.display_name,
    profile.email
  ),
  updated_at = now()
where exists (
    select 1
    from public.school_memberships membership
    where membership.user_id = profile.user_id
)
or exists (
  select 1
  from public.platform_roles role
  where role.user_id = profile.user_id
)
or exists (
  select 1
  from public.teachers teacher
  where teacher.id = profile.user_id
);

update public.teachers teacher
set display_name = public.canonical_educator_display_name(
  teacher.display_name,
  teacher.email
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_metadata_name text;
  v_display_name text;
begin
  v_metadata_name := nullif(
    trim(
      concat_ws(
        ' ',
        nullif(trim(new.raw_user_meta_data->>'first_name'), ''),
        nullif(trim(new.raw_user_meta_data->>'last_name'), '')
      )
    ),
    ''
  );
  v_display_name := public.canonical_educator_display_name(
    coalesce(
      v_metadata_name,
      nullif(trim(new.raw_user_meta_data->>'display_name'), '')
    ),
    new.email
  );

  insert into public.user_profiles (
    user_id, email, display_name
  ) values (
    new.id,
    new.email,
    v_display_name
  )
  on conflict (user_id) do update set
    email = excluded.email,
    display_name = excluded.display_name,
    updated_at = now();

  if coalesce(new.raw_user_meta_data->>'role', 'teacher') = 'teacher' then
    insert into public.teachers (id, email, display_name)
    values (
      new.id,
      new.email,
      v_display_name
    )
    on conflict (id) do update set
      email = excluded.email,
      display_name = excluded.display_name;
  end if;

  return new;
end;
$$;

commit;
