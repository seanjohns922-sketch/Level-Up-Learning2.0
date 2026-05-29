alter table public.students
  add column if not exists first_name text,
  add column if not exists last_name text;

with parsed as (
  select
    id,
    trim(display_name) as display_name_trimmed,
    regexp_split_to_array(trim(display_name), '\s+') as parts
  from public.students
  where coalesce(trim(display_name), '') <> ''
)
update public.students s
set
  first_name = coalesce(
    s.first_name,
    case
      when array_length(parsed.parts, 1) is null then null
      when array_length(parsed.parts, 1) <= 1 then parsed.display_name_trimmed
      else array_to_string(parsed.parts[1:array_length(parsed.parts, 1) - 1], ' ')
    end
  ),
  last_name = coalesce(
    s.last_name,
    case
      when array_length(parsed.parts, 1) is null then null
      when array_length(parsed.parts, 1) <= 1 then null
      else parsed.parts[array_length(parsed.parts, 1)]
    end
  )
from parsed
where s.id = parsed.id;
