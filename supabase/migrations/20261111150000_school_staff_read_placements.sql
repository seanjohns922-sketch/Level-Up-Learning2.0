-- Placements saved by school staff who don't own the student's class (a school
-- admin, a second teacher) could not be read back, so the save looked like it
-- failed ("Saved placements could not be verified"). Saving already allows any
-- staff member who can manage the student's learning; every progress table got a
-- matching "School staff can read" policy in 20260729110000, but placements were
-- missed. This adds it.
--
-- Schema: one read policy. Data: none changed. Security: read-only, the same rule
-- as realm progress (can_view_student_learning). The class-owner policy stays.
-- Rollback: drop policy "School staff can read realm placement".

begin;

drop policy if exists "School staff can read realm placement" on public.student_realm_placement;
create policy "School staff can read realm placement"
on public.student_realm_placement for select to authenticated
using (public.can_view_student_learning(student_id));

commit;
