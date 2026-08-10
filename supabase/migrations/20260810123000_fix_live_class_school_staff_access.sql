begin;

-- Live Class predates the school membership model. Replace its legacy
-- primary-teacher-only policies so authorised school staff can monitor classes
-- they are allowed to view or manage.
drop policy if exists "Teachers can read live class sessions"
  on public.live_class_sessions;
drop policy if exists "Teachers can manage own live class sessions"
  on public.live_class_sessions;

create policy "Authorised staff can read live class sessions"
on public.live_class_sessions for select to authenticated
using (public.can_view_class(class_id));

create policy "Authorised staff can manage live class sessions"
on public.live_class_sessions for all to authenticated
using (public.can_manage_class(class_id))
with check (public.can_manage_class(class_id));

drop policy if exists "Teachers can read live student activity"
  on public.live_student_activity;
drop policy if exists "Students can read live student activity"
  on public.live_student_activity;
drop policy if exists "Students can insert live student activity"
  on public.live_student_activity;
drop policy if exists "Students can update live student activity"
  on public.live_student_activity;

create policy "Authorised staff can read live student activity"
on public.live_student_activity for select to authenticated
using (public.can_view_class(class_id));

drop policy if exists "Teachers can read live activity events"
  on public.live_activity_events;
drop policy if exists "Students can insert live activity events"
  on public.live_activity_events;

create policy "Authorised staff can read live activity events"
on public.live_activity_events for select to authenticated
using (public.can_view_class(class_id));

-- Student telemetry writes go through the session-validated SECURITY DEFINER
-- RPCs. Direct anonymous table access is neither required nor permitted.
revoke all on public.live_class_sessions from anon;
revoke all on public.live_student_activity from anon;
revoke all on public.live_activity_events from anon;

grant select, insert, update on public.live_class_sessions to authenticated;
grant select on public.live_student_activity to authenticated;
grant select on public.live_activity_events to authenticated;

commit;
