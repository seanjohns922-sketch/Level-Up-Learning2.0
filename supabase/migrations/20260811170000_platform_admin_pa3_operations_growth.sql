begin;

create extension if not exists pg_trgm with schema extensions;

-- PA3 reads canonical completion evidence. These indexes match the reporting
-- predicates and avoid loading learning rows into the application server.
create index if not exists student_lesson_attempts_pa3_activity_idx
  on public.student_lesson_attempts (completed_at desc, student_id)
  where completed = true;
create index if not exists student_weekly_quiz_attempts_pa3_activity_idx
  on public.student_weekly_quiz_attempts (completed_at desc, student_id);
create index if not exists student_realm_assessments_pa3_activity_idx
  on public.student_realm_assessments (completed_at desc, student_id);
create index if not exists parent_student_links_pa3_active_idx
  on public.parent_student_links (student_id, linked_at desc)
  where status = 'active';
create index if not exists user_profiles_pa3_email_idx
  on public.user_profiles using gin (lower(email) extensions.gin_trgm_ops);
create index if not exists user_profiles_pa3_name_idx
  on public.user_profiles using gin (lower(display_name) extensions.gin_trgm_ops);
create index if not exists students_pa3_name_idx
  on public.students using gin (lower(display_name) extensions.gin_trgm_ops);
create index if not exists students_pa3_username_idx
  on public.students using gin (lower(username) extensions.gin_trgm_ops);

create or replace function public.get_platform_admin_operations_snapshot()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if not public.is_platform_owner() then
    raise exception 'Platform owner access required' using errcode = '42501';
  end if;

  with boundaries as (
    select
      date_trunc('day', now() at time zone 'Australia/Melbourne') at time zone 'Australia/Melbourne' as today_start,
      (date_trunc('day', now() at time zone 'Australia/Melbourne') + interval '1 day') at time zone 'Australia/Melbourne' as tomorrow_start
  ),
  current_licence as (
    select distinct on (licence.school_id) licence.*
    from public.school_licence_entitlements licence
    join public.academic_years year on year.id = licence.academic_year_id
    order by licence.school_id,
      (year.calendar_year = extract(year from (now() at time zone 'Australia/Melbourne'))::integer) desc,
      year.calendar_year desc
  ),
  school_students as (
    select entitlement.school_id, entitlement.student_id
    from public.student_access_entitlements entitlement
    join current_licence licence
      on licence.school_id = entitlement.school_id
     and licence.academic_year_id = entitlement.academic_year_id
    join public.students student on student.id = entitlement.student_id
    where entitlement.access_source = 'school'
      and entitlement.status = 'active'
      and entitlement.starts_at <= now()
      and (entitlement.ends_at is null or entitlement.ends_at >= now())
      and student.archived_at is null
    group by entitlement.school_id, entitlement.student_id
  ),
  home_students as (
    select distinct entitlement.student_id
    from public.student_access_entitlements entitlement
    join public.students student on student.id = entitlement.student_id
    where entitlement.access_source = 'home'
      and entitlement.status = 'active'
      and entitlement.starts_at <= now()
      and (entitlement.ends_at is null or entitlement.ends_at >= now())
      and student.archived_at is null
  ),
  segments as (
    select student.id,
      exists (select 1 from school_students school where school.student_id = student.id) as school_access,
      exists (select 1 from home_students home where home.student_id = student.id) as home_access,
      exists (select 1 from public.parent_student_links link where link.student_id = student.id and link.status = 'active') as parent_linked
    from public.students student
  ),
  meaningful_activity as (
    select attempt.student_id, attempt.completed_at, 'lesson'::text as event_type
    from public.student_lesson_attempts attempt where attempt.completed = true
    union all
    select attempt.student_id, attempt.completed_at, 'quiz'::text
    from public.student_weekly_quiz_attempts attempt
    union all
    select attempt.student_id, attempt.completed_at, 'assessment'::text
    from public.student_realm_assessments attempt
  ),
  activity as (
    select
      count(distinct event.student_id) filter (where event.completed_at >= boundary.today_start and event.completed_at < boundary.tomorrow_start)::integer as active_today,
      count(distinct event.student_id) filter (where event.completed_at >= boundary.today_start - interval '6 days' and event.completed_at < boundary.tomorrow_start)::integer as active_7d,
      count(distinct event.student_id) filter (where event.completed_at >= boundary.today_start - interval '29 days' and event.completed_at < boundary.tomorrow_start)::integer as active_30d,
      count(distinct event.student_id) filter (where event.completed_at >= boundary.today_start - interval '13 days' and event.completed_at < boundary.today_start - interval '6 days')::integer as previous_7d,
      count(distinct event.student_id) filter (where event.completed_at >= boundary.today_start - interval '59 days' and event.completed_at < boundary.today_start - interval '29 days')::integer as previous_30d,
      count(*) filter (where event.event_type = 'lesson' and event.completed_at >= boundary.today_start - interval '6 days' and event.completed_at < boundary.tomorrow_start)::integer as lessons_7d,
      count(*) filter (where event.event_type = 'lesson' and event.completed_at >= boundary.today_start and event.completed_at < boundary.tomorrow_start)::integer as lessons_today,
      count(*) filter (where event.event_type = 'quiz' and event.completed_at >= boundary.today_start - interval '6 days' and event.completed_at < boundary.tomorrow_start)::integer as quizzes_7d,
      count(*) filter (where event.event_type = 'assessment' and event.completed_at >= boundary.today_start - interval '29 days' and event.completed_at < boundary.tomorrow_start)::integer as assessments_30d
    from meaningful_activity event cross join boundaries boundary
  ),
  school_rollup as (
    select school.id, school.name, school.status as operational_status,
      coalesce(licence.status, school.status) as access_status,
      licence.seat_limit, licence.end_date,
      count(distinct students.student_id)::integer as students,
      count(distinct membership.user_id) filter (where membership.status = 'active')::integer as educators,
      count(distinct membership.user_id) filter (where membership.status = 'active' and membership.role in ('school_admin', 'principal'))::integer as admins,
      count(distinct link.student_id) filter (where link.status = 'active')::integer as parent_linked,
      count(distinct home.student_id)::integer as home_activated,
      count(distinct students.student_id) filter (
        where link.status = 'active' and home.student_id is null
      )::integer as parent_linked_no_home,
      max(event.completed_at) as last_activity
    from public.schools school
    left join current_licence licence on licence.school_id = school.id
    left join school_students students on students.school_id = school.id
    left join public.school_memberships membership on membership.school_id = school.id
    left join public.parent_student_links link on link.student_id = students.student_id
    left join home_students home on home.student_id = students.student_id
    left join meaningful_activity event on event.student_id = students.student_id
    group by school.id, school.name, school.status, licence.status, licence.seat_limit, licence.end_date
  ),
  attention as (
    select school.id, school.name, signal.severity, signal.category, signal.detail
    from school_rollup school
    cross join lateral (
      values
        ('critical'::text, 'No administrators'::text, 'No active school administrator is assigned.'::text, school.admins = 0),
        ('attention', 'Seat capacity', concat(round(100.0 * school.students / nullif(school.seat_limit, 0), 1), '% of seats are in use.'), school.seat_limit > 0 and 100.0 * school.students / school.seat_limit > 90),
        ('attention', 'No recent learning activity', 'No canonical lesson, quiz or assessment activity in 14 days.', school.students > 0 and (school.last_activity is null or school.last_activity < now() - interval '14 days')),
        ('attention', 'Trial ending', concat('Trial ends ', school.end_date, '.'), school.access_status = 'trial' and school.end_date between (now() at time zone 'Australia/Melbourne')::date and (now() at time zone 'Australia/Melbourne')::date + 30),
        ('information', 'Low parent link rate', concat(round(100.0 * school.parent_linked / nullif(school.students, 0), 1), '% linked.'), school.students >= 5 and 100.0 * school.parent_linked / nullif(school.students, 0) < 20),
        ('positive', 'Parent linked, home not activated', concat(school.parent_linked_no_home, ' linked students can activate home access.'), school.parent_linked_no_home > 0)
    ) signal(severity, category, detail, applies)
    where school.operational_status <> 'archived' and signal.applies
  ),
  changes as (
    select audit.created_at, audit.action as title, audit.entity_type as source, audit.entity_id, audit.reason
    from public.platform_admin_audit_log audit
    union all
    select link.linked_at, 'parent_student_linked', 'parent_link', link.id::text, null::text
    from public.parent_student_links link where link.status = 'active'
    union all
    select entitlement.created_at, 'home_access_activated', 'home_entitlement', entitlement.id::text, null::text
    from public.student_access_entitlements entitlement
    where entitlement.access_source = 'home' and entitlement.status = 'active'
  )
  select jsonb_build_object(
    'generatedAt', now(), 'timezone', 'Australia/Melbourne',
    'scale', jsonb_build_object(
      'schools', (select count(*) from school_rollup where operational_status <> 'archived'),
      'students', (select count(*) from segments),
      'educators', (select count(distinct membership.user_id) from public.school_memberships membership where membership.status = 'active'),
      'parents', (select count(distinct link.parent_user_id) from public.parent_student_links link where link.status = 'active'),
      'schoolSeats', (select coalesce(sum(seat_limit), 0) from school_rollup where operational_status <> 'archived'),
      'seatsUsed', (select coalesce(sum(students), 0) from school_rollup where operational_status <> 'archived')
    ),
    'userMix', jsonb_build_object(
      'schoolOnly', (select count(*) from segments where school_access and not home_access),
      'schoolAndHome', (select count(*) from segments where school_access and home_access),
      'homeOnly', (select count(*) from segments where not school_access and home_access),
      'inactive', (select count(*) from segments where not school_access and not home_access)
    ),
    'growth', jsonb_build_object(
      'schoolStudents', (select count(*) from segments where school_access),
      'parentLinked', (select count(*) from segments where school_access and parent_linked),
      'homeActivated', (select count(*) from segments where school_access and home_access),
      'parentLinkedNoHome', (select count(*) from segments where school_access and parent_linked and not home_access)
    ),
    'activity', jsonb_build_object(
      'activeToday', activity.active_today, 'active7d', activity.active_7d, 'active30d', activity.active_30d,
      'previous7d', activity.previous_7d, 'previous30d', activity.previous_30d,
      'lessonsToday', activity.lessons_today, 'lessons7d', activity.lessons_7d, 'quizzes7d', activity.quizzes_7d, 'assessments30d', activity.assessments_30d,
      'newStudents7d', (select count(*) from public.students student cross join boundaries boundary where student.created_at >= boundary.today_start - interval '6 days' and student.created_at < boundary.tomorrow_start),
      'newStudents30d', (select count(*) from public.students student cross join boundaries boundary where student.created_at >= boundary.today_start - interval '29 days' and student.created_at < boundary.tomorrow_start),
      'newParentLinks7d', (select count(*) from public.parent_student_links link cross join boundaries boundary where link.status = 'active' and link.linked_at >= boundary.today_start - interval '6 days' and link.linked_at < boundary.tomorrow_start),
      'newHomeActivations7d', (select count(*) from public.student_access_entitlements entitlement cross join boundaries boundary where entitlement.access_source = 'home' and entitlement.status = 'active' and entitlement.created_at >= boundary.today_start - interval '6 days' and entitlement.created_at < boundary.tomorrow_start)
    ),
    'attention', (select coalesce(jsonb_agg(jsonb_build_object('schoolId', id, 'schoolName', name, 'severity', severity, 'category', category, 'detail', detail) order by case severity when 'critical' then 1 when 'attention' then 2 when 'information' then 3 else 4 end, name), '[]'::jsonb) from attention),
    'recentChanges', (select coalesce(jsonb_agg(to_jsonb(item) order by item."createdAt" desc), '[]'::jsonb) from (select created_at as "createdAt", title, source, entity_id as "entityId", reason from changes order by created_at desc limit 12) item)
  ) into v_result
  from activity;
  return v_result;
end;
$$;

create or replace function public.get_platform_admin_growth_snapshot()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_result jsonb;
begin
  if not public.is_platform_owner() then raise exception 'Platform owner access required' using errcode = '42501'; end if;
  with current_licence as (
    select distinct on (licence.school_id) licence.* from public.school_licence_entitlements licence
    join public.academic_years year on year.id = licence.academic_year_id
    order by licence.school_id, (year.calendar_year = extract(year from (now() at time zone 'Australia/Melbourne'))::integer) desc, year.calendar_year desc
  ), school_students as (
    select entitlement.school_id, entitlement.student_id from public.student_access_entitlements entitlement
    join current_licence licence on licence.school_id = entitlement.school_id and licence.academic_year_id = entitlement.academic_year_id
    join public.students student on student.id = entitlement.student_id and student.archived_at is null
    where entitlement.access_source = 'school' and entitlement.status = 'active'
    group by entitlement.school_id, entitlement.student_id
  ), rows as (
    select school.id, school.name, count(distinct ss.student_id)::integer as school_students,
      count(distinct link.student_id) filter (where link.status = 'active')::integer as parent_linked,
      count(distinct home.student_id) filter (where home.status = 'active')::integer as home_activated,
      count(distinct ss.student_id) filter (where link.status = 'active' and home.student_id is null)::integer as parent_linked_no_home,
      count(distinct ss.student_id) filter (where home.student_id is null)::integer as school_only
    from public.schools school left join school_students ss on ss.school_id = school.id
    left join public.parent_student_links link on link.student_id = ss.student_id
    left join public.student_access_entitlements home on home.student_id = ss.student_id and home.access_source = 'home'
    where school.status <> 'archived' group by school.id, school.name
  ), totals as (select coalesce(sum(school_students),0)::integer school_students, coalesce(sum(parent_linked),0)::integer parent_linked, coalesce(sum(home_activated),0)::integer home_activated, coalesce(sum(parent_linked_no_home),0)::integer parent_linked_no_home from rows),
  home_only as (select count(distinct home.student_id)::integer count from public.student_access_entitlements home join public.students s on s.id=home.student_id and s.archived_at is null where home.access_source='home' and home.status='active' and not exists(select 1 from school_students ss where ss.student_id=home.student_id))
  select jsonb_build_object('generatedAt',now(),'timezone','Australia/Melbourne','funnel',jsonb_build_object(
    'schoolStudents',totals.school_students,'parentLinked',totals.parent_linked,'homeActivated',totals.home_activated,
    'parentLinkRate',case when totals.school_students=0 then 0 else round(100.0*totals.parent_linked/totals.school_students,1) end,
    'homeActivationRate',case when totals.school_students=0 then 0 else round(100.0*totals.home_activated/totals.school_students,1) end,
    'parentLinkedNoHome',totals.parent_linked_no_home,'homeOnly',(select count from home_only)),
    'schools',(select coalesce(jsonb_agg(jsonb_build_object('schoolId',id,'schoolName',name,'schoolStudents',school_students,'parentLinked',parent_linked,'homeActivated',home_activated,'parentLinkedNoHome',parent_linked_no_home,'schoolOnly',school_only,'parentLinkRate',case when school_students=0 then 0 else round(100.0*parent_linked/school_students,1) end,'homeActivationRate',case when school_students=0 then 0 else round(100.0*home_activated/school_students,1) end) order by name),'[]'::jsonb) from rows)) into v_result from totals;
  return v_result;
end; $$;

create or replace function public.get_platform_admin_engagement_snapshot()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_result jsonb;
begin
  if not public.is_platform_owner() then raise exception 'Platform owner access required' using errcode = '42501'; end if;
  with boundary as (select (date_trunc('day',now() at time zone 'Australia/Melbourne')+interval '1 day') at time zone 'Australia/Melbourne' as tomorrow),
  current_licence as (
    select distinct on (licence.school_id) licence.*
    from public.school_licence_entitlements licence
    join public.academic_years year on year.id=licence.academic_year_id
    order by licence.school_id,
      (year.calendar_year=extract(year from (now() at time zone 'Australia/Melbourne'))::integer) desc,
      year.calendar_year desc
  ), school_students as (
    select entitlement.school_id,entitlement.student_id
    from public.student_access_entitlements entitlement
    join current_licence licence on licence.school_id=entitlement.school_id and licence.academic_year_id=entitlement.academic_year_id
    join public.students student on student.id=entitlement.student_id and student.archived_at is null
    where entitlement.access_source='school' and entitlement.status='active'
      and entitlement.starts_at<=now() and (entitlement.ends_at is null or entitlement.ends_at>=now())
    group by entitlement.school_id,entitlement.student_id
  ),
  events as (
    select assigned.school_id,attempt.student_id,attempt.completed_at,'lesson'::text kind from public.student_lesson_attempts attempt join school_students assigned on assigned.student_id=attempt.student_id where attempt.completed=true
    union all select assigned.school_id,attempt.student_id,attempt.completed_at,'quiz' from public.student_weekly_quiz_attempts attempt join school_students assigned on assigned.student_id=attempt.student_id
    union all select assigned.school_id,attempt.student_id,attempt.completed_at,'assessment' from public.student_realm_assessments attempt join school_students assigned on assigned.student_id=attempt.student_id
  ), school_counts as (select school_id,count(*)::integer students from school_students group by school_id), rows as (
    select school.id,school.name,coalesce(sc.students,0) students,
      count(distinct e.student_id) filter(where e.completed_at>=b.tomorrow-interval '7 days' and e.completed_at<b.tomorrow)::integer active_7d,
      count(*) filter(where e.kind='lesson' and e.completed_at>=b.tomorrow-interval '7 days' and e.completed_at<b.tomorrow)::integer lessons_7d,
      count(*) filter(where e.kind='quiz' and e.completed_at>=b.tomorrow-interval '7 days' and e.completed_at<b.tomorrow)::integer quizzes_7d,
      count(*) filter(where e.kind='assessment' and e.completed_at>=b.tomorrow-interval '30 days' and e.completed_at<b.tomorrow)::integer assessments_30d,max(e.completed_at) last_activity
    from public.schools school cross join boundary b left join school_counts sc on sc.school_id=school.id left join events e on e.school_id=school.id where school.status<>'archived' group by school.id,school.name,sc.students
  ) select jsonb_build_object('generatedAt',now(),'timezone','Australia/Melbourne','thresholds',jsonb_build_object('strong',60,'healthy',30,'low',1,'inactiveDays',30),'schools',coalesce(jsonb_agg(jsonb_build_object('schoolId',id,'schoolName',name,'students',students,'active7d',active_7d,'activePercent',case when students=0 then 0 else round(100.0*active_7d/students,1) end,'lessons7d',lessons_7d,'quizzes7d',quizzes_7d,'assessments30d',assessments_30d,'lessonsPerActive',case when active_7d=0 then 0 else round(1.0*lessons_7d/active_7d,1) end,'lastActivity',last_activity,'status',case when last_activity is null or last_activity<now()-interval '30 days' then 'Inactive' when students>0 and 100.0*active_7d/students>=60 then 'Strong' when students>0 and 100.0*active_7d/students>=30 then 'Healthy' else 'Low' end) order by name),'[]'::jsonb)) into v_result from rows;
  return v_result;
end; $$;

create or replace function public.get_platform_admin_home_only_snapshot()
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare v_result jsonb;
begin
  if not public.is_platform_owner() then raise exception 'Platform owner access required' using errcode='42501'; end if;
  with home_only as (
    select distinct home.student_id
    from public.student_access_entitlements home
    join public.students student on student.id=home.student_id and student.archived_at is null
    where home.access_source='home' and home.status='active'
      and home.starts_at<=now() and (home.ends_at is null or home.ends_at>=now())
      and not exists(select 1 from public.student_access_entitlements school where school.student_id=home.student_id and school.access_source='school' and school.status='active' and school.starts_at<=now() and (school.ends_at is null or school.ends_at>=now()))
  ), events as (
    select attempt.student_id,attempt.completed_at from public.student_lesson_attempts attempt join home_only student on student.student_id=attempt.student_id where attempt.completed=true
    union all select attempt.student_id,attempt.completed_at from public.student_weekly_quiz_attempts attempt join home_only student on student.student_id=attempt.student_id
    union all select attempt.student_id,attempt.completed_at from public.student_realm_assessments attempt join home_only student on student.student_id=attempt.student_id
  )
  select jsonb_build_object(
    'generatedAt',now(),'timezone','Australia/Melbourne',
    'students',(select count(*) from home_only),
    'active7d',(select count(distinct student_id) from events where completed_at>=now()-interval '7 days'),
    'parents',(select count(distinct link.parent_user_id) from public.parent_student_links link join home_only student on student.student_id=link.student_id where link.status='active'),
    'events7d',(select count(*) from events where completed_at>=now()-interval '7 days'),
    'averageActivity7d',case when (select count(*) from home_only)=0 then 0 else round((select count(*) from events where completed_at>=now()-interval '7 days')::numeric/(select count(*) from home_only),1) end
  ) into v_result;
  return v_result;
end; $$;

create or replace function public.search_platform_admin_users(p_query text default '',p_user_type text default 'all',p_segment text default 'all',p_activity text default 'all',p_school_id uuid default null,p_page integer default 1,p_page_size integer default 25)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare v_result jsonb; v_query text:=lower(trim(coalesce(p_query,''))); v_page integer:=greatest(p_page,1); v_size integer:=least(greatest(p_page_size,1),100);
begin
  if not public.is_platform_owner() then raise exception 'Platform owner access required' using errcode='42501'; end if;
  with last_activity as (
    select student_id,max(completed_at) completed_at from (
      select student_id,completed_at from public.student_lesson_attempts where completed=true union all
      select student_id,completed_at from public.student_weekly_quiz_attempts union all
      select student_id,completed_at from public.student_realm_assessments
    ) e group by student_id
  ), student_rows as (
    select s.id,'student'::text user_type,s.display_name name,s.username identifier,coalesce(code.code,'') explorer_code,coalesce(code.code_normalised,'') code_normalised,coalesce(s.school_year_level,s.year_level) detail,school.name school_name,array_remove(array[s.school_id],null::uuid) school_ids,
      (select string_agg(distinct class.name,', ' order by class.name) from public.class_enrollments enrolment join public.classes class on class.id=enrolment.class_id where enrolment.student_id=s.id and enrolment.status='active' and enrolment.ended_at is null) class_name,
      exists(select 1 from public.parent_student_links l where l.student_id=s.id and l.status='active') parent_linked,
      case when s.archived_at is not null then 'inactive' when school_ent.student_id is not null and home_ent.student_id is not null then 'school_and_home' when school_ent.student_id is not null then 'school_only' when home_ent.student_id is not null then 'home_only' else 'inactive' end segment,
      s.archived_at is null active,la.completed_at last_activity
    from public.students s left join public.schools school on school.id=s.school_id
    left join lateral(select code.code,code.code_normalised from public.student_explorer_codes code where code.student_id=s.id and code.status='active' order by code.created_at desc limit 1) code on true
    left join lateral(select e.student_id from public.student_access_entitlements e where e.student_id=s.id and e.access_source='school' and e.status='active' limit 1) school_ent on true
    left join lateral(select e.student_id from public.student_access_entitlements e where e.student_id=s.id and e.access_source='home' and e.status='active' limit 1) home_ent on true
    left join last_activity la on la.student_id=s.id
  ), adult_rows as (
    select profile.user_id id,case when exists(select 1 from public.parent_student_links l where l.parent_user_id=profile.user_id) then 'parent' else 'educator' end user_type,
      coalesce(profile.display_name,profile.email,'User') name,profile.email identifier,'' explorer_code,'' code_normalised,
      case when exists(select 1 from public.parent_student_links l where l.parent_user_id=profile.user_id) then 'Parent' else coalesce((select string_agg(distinct m.role,', ') from public.school_memberships m where m.user_id=profile.user_id),'Educator') end detail,
      coalesce((select string_agg(distinct school.name,', ' order by school.name) from public.school_memberships m join public.schools school on school.id=m.school_id where m.user_id=profile.user_id),(select string_agg(distinct school.name,', ' order by school.name) from public.parent_student_links l join public.students child on child.id=l.student_id left join public.schools school on school.id=child.school_id where l.parent_user_id=profile.user_id)) school_name,
      coalesce((select array_agg(distinct m.school_id) from public.school_memberships m where m.user_id=profile.user_id),(select array_agg(distinct child.school_id) from public.parent_student_links l join public.students child on child.id=l.student_id where l.parent_user_id=profile.user_id and child.school_id is not null),'{}'::uuid[]) school_ids,
      null::text class_name,exists(select 1 from public.parent_student_links l where l.parent_user_id=profile.user_id) parent_linked,
      case when exists(select 1 from public.parent_student_links l where l.parent_user_id=profile.user_id) then 'parent_linked' else 'educator' end segment,profile.status='active' active,auth_user.last_sign_in_at last_activity
    from public.user_profiles profile
    left join auth.users auth_user on auth_user.id=profile.user_id
    where exists(select 1 from public.parent_student_links l where l.parent_user_id=profile.user_id) or exists(select 1 from public.school_memberships m where m.user_id=profile.user_id)
  ), users as (select * from student_rows union all select * from adult_rows), filtered as (
    select * from users where (p_user_type='all' or user_type=p_user_type)
      and (p_school_id is null or p_school_id=any(school_ids))
      and (p_segment='all' or segment=p_segment or (p_segment='parent_linked' and parent_linked) or (p_segment='no_parent_linked' and user_type='student' and not parent_linked) or (p_segment='home_active' and user_type='student' and segment in ('school_and_home','home_only')) or (p_segment='no_home_access' and user_type='student' and segment in ('school_only','inactive')))
      and (p_activity='all' or (p_activity='active_7d' and last_activity>=now()-interval '7 days') or (p_activity='inactive_14d' and (last_activity is null or last_activity<now()-interval '14 days')) or (p_activity='inactive' and not active))
      and (v_query='' or lower(coalesce(name,'')) like '%'||v_query||'%' or lower(coalesce(identifier,'')) like '%'||v_query||'%' or code_normalised=public.normalise_explorer_code(v_query))
  ), paged as (select * from filtered order by lower(name),id offset (v_page-1)*v_size limit v_size)
  select jsonb_build_object('items',coalesce((select jsonb_agg(jsonb_build_object('id',id,'userType',user_type,'name',name,'identifier',identifier,'explorerCode',nullif(explorer_code,''),'detail',detail,'schoolName',school_name,'className',class_name,'segment',segment,'parentLinked',parent_linked,'active',active,'lastActivity',last_activity) order by lower(name),id) from paged),'[]'::jsonb),'total',(select count(*) from filtered),'page',v_page,'pageSize',v_size,'schools',(select coalesce(jsonb_agg(jsonb_build_object('id',school.id,'name',school.name) order by school.name),'[]'::jsonb) from public.schools school where school.status<>'archived')) into v_result;
  return v_result;
end; $$;

create or replace function public.get_platform_admin_student_detail(p_student_id uuid)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare v_result jsonb;
begin
  if not public.is_platform_owner() then raise exception 'Platform owner access required' using errcode='42501'; end if;
  select jsonb_build_object(
    'id',s.id,'name',s.display_name,'username',s.username,'explorerCode',code.code,
    'yearLevel',coalesce(s.school_year_level,s.year_level),'status',case when s.archived_at is null then 'active' else 'inactive' end,
    'createdAt',s.created_at,
    'school',case when school.id is null then null else jsonb_build_object('id',school.id,'name',school.name) end,
    'classes',(select coalesce(jsonb_agg(jsonb_build_object('id',class.id,'name',class.name,'primary',enrolment.is_primary,'status',enrolment.status,'academicYear',year.name) order by enrolment.is_primary desc,class.name),'[]'::jsonb) from public.class_enrollments enrolment join public.classes class on class.id=enrolment.class_id left join public.academic_years year on year.id=enrolment.academic_year_id where enrolment.student_id=s.id and enrolment.status='active' and enrolment.ended_at is null),
    'entitlements',(select coalesce(jsonb_agg(jsonb_build_object('source',entitlement.access_source,'status',entitlement.status,'billingStatus',entitlement.billing_status,'startsAt',entitlement.starts_at,'endsAt',entitlement.ends_at,'schoolId',entitlement.school_id,'academicYearId',entitlement.academic_year_id) order by entitlement.access_source),'[]'::jsonb) from public.student_access_entitlements entitlement where entitlement.student_id=s.id),
    'segment',case
      when exists(select 1 from public.student_access_entitlements entitlement where entitlement.student_id=s.id and entitlement.access_source='school' and entitlement.status='active') and exists(select 1 from public.student_access_entitlements entitlement where entitlement.student_id=s.id and entitlement.access_source='home' and entitlement.status='active') then 'school_and_home'
      when exists(select 1 from public.student_access_entitlements entitlement where entitlement.student_id=s.id and entitlement.access_source='school' and entitlement.status='active') then 'school_only'
      when exists(select 1 from public.student_access_entitlements entitlement where entitlement.student_id=s.id and entitlement.access_source='home' and entitlement.status='active') then 'home_only'
      else 'inactive' end,
    'parents',(select coalesce(jsonb_agg(jsonb_build_object('id',p.user_id,'name',p.display_name,'email',p.email,'relationship',l.relationship,'linkedAt',l.linked_at)),'[]'::jsonb) from public.parent_student_links l left join public.user_profiles p on p.user_id=l.parent_user_id where l.student_id=s.id and l.status='active'),
    'realms',(select coalesce(jsonb_agg(jsonb_build_object('realmId',progress.realm_id,'programKey',progress.program_key,'workingLevel',progress.working_level,'currentWeek',progress.current_week,'pathway',progress.status,'placementComplete',progress.placement_complete,'requiredWeeks',progress.required_weeks,'updatedAt',progress.updated_at,'lastActivity',(select max(event.completed_at) from (select attempt.completed_at from public.student_lesson_attempts attempt where attempt.student_id=s.id and attempt.realm_id=progress.realm_id and attempt.completed=true union all select attempt.completed_at from public.student_weekly_quiz_attempts attempt where attempt.student_id=s.id and attempt.realm_id=progress.realm_id union all select attempt.completed_at from public.student_realm_assessments attempt where attempt.student_id=s.id and attempt.realm_id=progress.realm_id) event)) order by progress.program_key),'[]'::jsonb) from public.student_realm_progress progress where progress.student_id=s.id and progress.is_current=true),
    'activity',jsonb_build_object(
      'lastActive',(select max(completed_at) from (select completed_at from public.student_lesson_attempts where student_id=s.id and completed=true union all select completed_at from public.student_weekly_quiz_attempts where student_id=s.id union all select completed_at from public.student_realm_assessments where student_id=s.id) events),
      'lessons7d',(select count(*) from public.student_lesson_attempts attempt where attempt.student_id=s.id and attempt.completed=true and attempt.completed_at>=now()-interval '7 days'),
      'quizzes7d',(select count(*) from public.student_weekly_quiz_attempts attempt where attempt.student_id=s.id and attempt.completed_at>=now()-interval '7 days'),
      'assessments30d',(select count(*) from public.student_realm_assessments attempt where attempt.student_id=s.id and attempt.completed_at>=now()-interval '30 days')
    )
  ) into v_result
  from public.students s
  left join public.schools school on school.id=s.school_id
  left join lateral(select c.code from public.student_explorer_codes c where c.student_id=s.id and c.status='active' order by c.created_at desc limit 1) code on true
  where s.id=p_student_id;
  if v_result is null then raise exception 'Student not found'; end if; return v_result;
end; $$;

create or replace function public.get_platform_admin_adult_detail(p_user_id uuid)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare v_result jsonb;
begin
  if not public.is_platform_owner() then raise exception 'Platform owner access required' using errcode='42501'; end if;
  select jsonb_build_object('id',p.user_id,'name',p.display_name,'email',p.email,'status',p.status,'createdAt',p.created_at,'lastActive',auth_user.last_sign_in_at,
    'schools',(select coalesce(jsonb_agg(jsonb_build_object('id',s.id,'name',s.name,'role',m.role,'status',m.status) order by s.name),'[]'::jsonb) from public.school_memberships m join public.schools s on s.id=m.school_id where m.user_id=p.user_id),
    'children',(select coalesce(jsonb_agg(jsonb_build_object('id',s.id,'name',s.display_name,'relationship',l.relationship,'status',l.status,'schoolName',school.name,'homeActive',exists(select 1 from public.student_access_entitlements entitlement where entitlement.student_id=s.id and entitlement.access_source='home' and entitlement.status='active')) order by s.display_name),'[]'::jsonb) from public.parent_student_links l join public.students s on s.id=l.student_id left join public.schools school on school.id=s.school_id where l.parent_user_id=p.user_id)
  ) into v_result from public.user_profiles p left join auth.users auth_user on auth_user.id=p.user_id where p.user_id=p_user_id;
  if v_result is null then raise exception 'User not found'; end if; return v_result;
end; $$;

revoke all on function public.get_platform_admin_operations_snapshot() from public,anon;
revoke all on function public.get_platform_admin_growth_snapshot() from public,anon;
revoke all on function public.get_platform_admin_engagement_snapshot() from public,anon;
revoke all on function public.get_platform_admin_home_only_snapshot() from public,anon;
revoke all on function public.search_platform_admin_users(text,text,text,text,uuid,integer,integer) from public,anon;
revoke all on function public.get_platform_admin_student_detail(uuid) from public,anon;
revoke all on function public.get_platform_admin_adult_detail(uuid) from public,anon;
grant execute on function public.get_platform_admin_operations_snapshot() to authenticated;
grant execute on function public.get_platform_admin_growth_snapshot() to authenticated;
grant execute on function public.get_platform_admin_engagement_snapshot() to authenticated;
grant execute on function public.get_platform_admin_home_only_snapshot() to authenticated;
grant execute on function public.search_platform_admin_users(text,text,text,text,uuid,integer,integer) to authenticated;
grant execute on function public.get_platform_admin_student_detail(uuid) to authenticated;
grant execute on function public.get_platform_admin_adult_detail(uuid) to authenticated;

commit;
