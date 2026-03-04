alter table public.classes add column if not exists teacher_id uuid;
alter table public.classes add column if not exists class_code text;

update public.classes
set teacher_id = coalesce(teacher_id, teacher_user_id)
where teacher_id is null and teacher_user_id is not null;

update public.classes
set class_code = coalesce(class_code, code)
where class_code is null and code is not null;
