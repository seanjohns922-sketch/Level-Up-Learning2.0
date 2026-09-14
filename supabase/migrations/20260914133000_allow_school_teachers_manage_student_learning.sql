begin;

-- Active educators may cover any class in their school. This permission is
-- deliberately limited to student learning operations (placements,
-- progression overrides and diagnostics); it does not grant school,
-- staffing, billing or student-directory administration rights.
create or replace function public.can_manage_school_student_learning(
  p_student_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.students student
    where student.id = p_student_id
      and (
        public.is_platform_admin()
        or exists (
          select 1
          from public.school_memberships membership
          join public.schools school
            on school.id = membership.school_id
           and school.status = 'active'
          where membership.user_id = auth.uid()
            and membership.status = 'active'
            and membership.role in ('teacher', 'principal', 'school_admin')
            and (
              membership.school_id = student.school_id
              or exists (
                select 1
                from public.classes legacy_class
                where legacy_class.id = student.class_id
                  and legacy_class.school_id = membership.school_id
                  and legacy_class.status = 'active'
              )
              or exists (
                select 1
                from public.class_enrollments enrollment
                join public.classes enrolled_class
                  on enrolled_class.id = enrollment.class_id
                 and enrolled_class.school_id = membership.school_id
                 and enrolled_class.status = 'active'
                where enrollment.student_id = student.id
                  and enrollment.status = 'active'
                  and enrollment.ended_at is null
              )
            )
        )
        or exists (
          -- Preserve direct ownership for legacy classes that have not yet
          -- been attached to a school tenant.
          select 1
          from public.classes legacy_class
          where legacy_class.id = student.class_id
            and legacy_class.school_id is null
            and public.teacher_belongs_to_auth(legacy_class.teacher_id)
        )
      )
  );
$$;

revoke all on function public.can_manage_school_student_learning(uuid)
  from public, anon;
grant execute on function public.can_manage_school_student_learning(uuid)
  to authenticated;

-- Older realm RPCs still call teacher_owns_student. Keep that compatibility
-- name, but route it through the canonical same-school learning boundary.
create or replace function public.teacher_owns_student(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.can_manage_school_student_learning(p_student_id);
$$;

revoke all on function public.teacher_owns_student(uuid) from public, anon;
grant execute on function public.teacher_owns_student(uuid) to authenticated;

create or replace function public.can_override_student_progress(
  p_student_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.can_manage_school_student_learning(p_student_id);
$$;

revoke all on function public.can_override_student_progress(uuid)
  from public, anon;
grant execute on function public.can_override_student_progress(uuid)
  to authenticated;

create or replace function public.can_manage_student_progress(
  p_student_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.can_manage_school_student_learning(p_student_id);
$$;

revoke all on function public.can_manage_student_progress(uuid)
  from public, anon;
grant execute on function public.can_manage_student_progress(uuid)
  to authenticated;

commit;
