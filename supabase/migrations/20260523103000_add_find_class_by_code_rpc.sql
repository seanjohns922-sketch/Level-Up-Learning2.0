begin;

create or replace function public.find_class_by_code(input_code text)
returns table(id uuid, name text, class_code text)
language sql
security definer
set search_path = public
as $$
  select c.id, c.name, c.class_code
  from public.classes c
  where c.class_code = upper(regexp_replace(trim(coalesce(input_code, '')), '\\s+', '', 'g'))
  limit 1;
$$;

grant execute on function public.find_class_by_code(text) to anon, authenticated;

commit;
