-- No browser can permanently delete a student any more. The old RLS policy let a
-- class's teacher delete a student row straight from My Classes, which cascades
-- every result, attempt, reward and placement with no audit and no undo.
--
-- What stays:
--   * Archive and restore (reversible; progress is kept).
--   * School Home "Delete permanently": delete_school_student, a security
--     definer function limited to school admins, requiring DELETE plus a reason
--     and writing a school audit entry. It does not rely on this policy.
--   * Platform Admin deletion (server side, service role).
--
-- Schema: none. RLS: one DELETE policy on public.students dropped. Data: none.
-- Rollback: recreate "Teachers can delete class students" from
-- 20260526090000_add_student_delete_policy.sql.

begin;

drop policy if exists "Teachers can delete class students" on public.students;

do $check$
declare
  v_remaining text;
begin
  select string_agg(policyname, ', ' order by policyname)
  into v_remaining
  from pg_policies
  where schemaname = 'public'
    and tablename = 'students'
    and cmd in ('DELETE', 'ALL');
  if v_remaining is not null then
    raise notice 'Other policies can still delete students: %. Review them before relying on this.', v_remaining;
  end if;
end;
$check$;

commit;
