begin;

-- Existing classes predate class_staff_memberships and still identify their
-- owning educator through classes.teacher_id. Preserve that ownership while
-- school staffing records are progressively reconciled.
create or replace function public.can_manage_class(p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.classes c
    where c.id = p_class_id
      and (
        public.is_platform_admin()
        or c.teacher_id = auth.uid()
        or (
          c.school_id is not null
          and public.can_manage_school(c.school_id)
        )
        or exists (
          select 1
          from public.class_staff_memberships csm
          join public.school_memberships sm
            on sm.school_id = csm.school_id
           and sm.user_id = csm.user_id
          where csm.class_id = c.id
            and csm.user_id = auth.uid()
            and csm.status = 'active'
            and csm.role in ('lead_teacher', 'teacher')
            and sm.status = 'active'
        )
      )
  );
$$;

revoke all on function public.can_manage_class(uuid) from public, anon;
grant execute on function public.can_manage_class(uuid) to authenticated;

commit;
