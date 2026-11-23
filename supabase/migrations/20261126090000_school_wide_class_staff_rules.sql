-- School admins and co-teachers can do the class jobs that were still owner-only:
-- add a student to a legacy (non-school) class, regenerate a student's QR login,
-- open, close and read the whole-maths diagnostic window and its results, and read
-- the live maths tracker. Before this, each check was "the class's own teacher",
-- so a school admin or a second teacher got "Unauthorized" or "Not authorized
-- for this class".
--
-- One new rule, can_teach_class: the class's teacher (including the legacy
-- teachers-table mapping in teacher_belongs_to_auth), or anyone can_manage_class
-- already allows (platform admin, school admin of the class's school, active
-- lead or co-teacher on the class). It is a strict superset of the old checks,
-- so nobody loses access.
--
-- The seven functions are patched in place from their live definitions: only the
-- ownership test is swapped, the rest of each body, its grants and security
-- settings stay as they are. If a live body does not contain the expected test
-- exactly once, the whole migration stops and nothing changes.
--
-- Schema: one helper function. RLS: unchanged. Data: none.
-- Rollback: run the same replacements in reverse (new text back to old), then
-- drop function public.can_teach_class(uuid).

begin;

create or replace function public.can_teach_class(p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.can_manage_class(p_class_id)
    or exists (
      select 1
      from public.classes c
      where c.id = p_class_id
        and public.teacher_belongs_to_auth(c.teacher_id)
    );
$$;

revoke all on function public.can_teach_class(uuid) from public, anon;
grant execute on function public.can_teach_class(uuid) to authenticated;

do $migration$
declare
  v_patch record;
  v_definition text;
  v_matches integer;
begin
  for v_patch in
    select *
    from (values
      ('public.create_student_for_class(uuid,text,text)'::regprocedure,
       'c.id = class_uuid and c.teacher_id = auth.uid()',
       'c.id = class_uuid and public.can_teach_class(c.id)'),
      ('public.regenerate_student_qr(uuid)'::regprocedure,
       'where s.id = student_uuid and c.teacher_id = auth.uid()',
       'where s.id = student_uuid and public.can_teach_class(c.id)'),
      ('public.teacher_open_whole_math_diagnostic_session(uuid,text,integer)'::regprocedure,
       'public.teacher_belongs_to_auth(class.teacher_id)',
       'public.can_teach_class(class.id)'),
      ('public.teacher_close_whole_math_diagnostic_session(uuid)'::regprocedure,
       'public.teacher_belongs_to_auth(class.teacher_id)',
       'public.can_teach_class(class.id)'),
      ('public.get_teacher_whole_math_diagnostic_session(uuid)'::regprocedure,
       'public.teacher_belongs_to_auth(class.teacher_id)',
       'public.can_teach_class(class.id)'),
      ('public.get_teacher_whole_math_diagnostics(uuid)'::regprocedure,
       'public.teacher_belongs_to_auth(class.teacher_id)',
       'public.can_teach_class(class.id)'),
      ('public.get_teacher_live_maths_progression(uuid)'::regprocedure,
       'public.teacher_belongs_to_auth(class.teacher_id)',
       'public.can_teach_class(class.id)')
    ) as patch(fn, old_text, new_text)
  loop
    v_definition := pg_get_functiondef(v_patch.fn);
    v_matches := (length(v_definition) - length(replace(v_definition, v_patch.old_text, '')))
      / length(v_patch.old_text);
    if v_matches <> 1 then
      raise exception '% has % copies of the owner-only check (expected 1); nothing was changed',
        v_patch.fn, v_matches;
    end if;
    execute replace(v_definition, v_patch.old_text, v_patch.new_text);
  end loop;
end;
$migration$;

commit;
