alter table public.students
  add column if not exists school_year_level text,
  add column if not exists working_level text;

update public.students
set working_level = coalesce(working_level, year_level)
where working_level is null
  and year_level is not null;
