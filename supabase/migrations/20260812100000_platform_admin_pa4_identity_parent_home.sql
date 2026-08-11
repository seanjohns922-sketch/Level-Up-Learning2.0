begin;

-- PA4: one student identity across school and home. Relationships, access and
-- commercial state remain separate records and every identity mutation is audited.

alter table public.parent_student_links
  add column if not exists link_method text not null default 'legacy_claim_code',
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by uuid references auth.users(id) on delete set null,
  add column if not exists ended_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

alter table public.students
  add column if not exists identity_status text not null default 'active',
  add column if not exists merged_into_student_id uuid references public.students(id) on delete restrict,
  add column if not exists merged_at timestamptz,
  add column if not exists merged_by uuid references auth.users(id) on delete set null;

alter table public.students drop constraint if exists students_identity_status_check;
alter table public.students add constraint students_identity_status_check
  check (identity_status in ('active', 'merged'));
alter table public.students drop constraint if exists students_merge_state_check;
alter table public.students add constraint students_merge_state_check check (
  (identity_status = 'active' and merged_into_student_id is null and merged_at is null)
  or (identity_status = 'merged' and merged_into_student_id is not null and merged_at is not null)
);

create table if not exists public.student_school_memberships (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete restrict,
  school_id uuid not null references public.schools(id) on delete restrict,
  academic_year_id uuid references public.academic_years(id) on delete restrict,
  status text not null default 'active' check (status in ('active','ended')),
  starts_at timestamptz not null default now(),
  ended_at timestamptz,
  link_method text not null default 'existing_record',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (ended_at is null or ended_at >= starts_at)
);
create unique index if not exists student_school_one_active_idx
  on public.student_school_memberships(student_id) where status = 'active';
create index if not exists student_school_history_idx
  on public.student_school_memberships(school_id, academic_year_id, status, student_id);

insert into public.student_school_memberships(student_id, school_id, academic_year_id, link_method)
select student.id, student.school_id, year.id, 'backfill'
from public.students student
left join public.academic_years year
  on year.school_id = student.school_id
 and year.calendar_year = extract(year from current_date)::integer
where student.school_id is not null
  and student.archived_at is null
  and coalesce(student.identity_status, 'active') = 'active'
on conflict (student_id) where status = 'active' do nothing;

create table if not exists public.student_school_transfer_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete restrict,
  from_school_id uuid references public.schools(id) on delete restrict,
  to_school_id uuid not null references public.schools(id) on delete restrict,
  requested_by uuid references auth.users(id) on delete set null,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.parent_link_attempts (
  id bigint generated always as identity primary key,
  parent_user_id uuid not null references auth.users(id) on delete cascade,
  code_fingerprint text not null,
  outcome text not null check (outcome in ('matched','not_matched','linked','throttled')),
  attempted_at timestamptz not null default now()
);
create index if not exists parent_link_attempt_rate_idx
  on public.parent_link_attempts(parent_user_id, attempted_at desc);

create table if not exists public.student_identity_link_requests (
  id uuid primary key default gen_random_uuid(),
  request_type text not null check (request_type in ('parent_link','school_link','duplicate_review','recovery')),
  student_id uuid references public.students(id) on delete restrict,
  requested_by uuid not null references auth.users(id) on delete restrict,
  school_id uuid references public.schools(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending','approved','rejected','cancelled')),
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_identity_merge_requests (
  id uuid primary key default gen_random_uuid(),
  survivor_student_id uuid not null references public.students(id) on delete restrict,
  duplicate_student_id uuid not null references public.students(id) on delete restrict,
  requested_by uuid not null references auth.users(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reason text not null,
  preview jsonb not null default '{}'::jsonb,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  check (survivor_student_id <> duplicate_student_id)
);

create table if not exists public.student_identity_audit_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  student_id uuid references public.students(id) on delete restrict,
  related_student_id uuid references public.students(id) on delete restrict,
  school_id uuid references public.schools(id) on delete restrict,
  before_state jsonb,
  after_state jsonb,
  reason text,
  created_at timestamptz not null default now()
);
create index if not exists student_identity_audit_student_idx
  on public.student_identity_audit_events(student_id, created_at desc);

create or replace function public.reject_identity_audit_mutation()
returns trigger language plpgsql set search_path = public as $$
begin raise exception 'Identity audit records are immutable' using errcode = '42501'; end;
$$;
drop trigger if exists student_identity_audit_immutable on public.student_identity_audit_events;
create trigger student_identity_audit_immutable before update or delete
  on public.student_identity_audit_events for each row execute function public.reject_identity_audit_mutation();

alter table public.student_school_memberships enable row level security;
alter table public.student_school_transfer_events enable row level security;
alter table public.parent_link_attempts enable row level security;
alter table public.student_identity_link_requests enable row level security;
alter table public.student_identity_merge_requests enable row level security;
alter table public.student_identity_audit_events enable row level security;
revoke all on public.student_school_memberships, public.student_school_transfer_events,
  public.parent_link_attempts, public.student_identity_link_requests,
  public.student_identity_merge_requests, public.student_identity_audit_events
  from public, anon, authenticated;

-- Parent access is read-only and only available through scoped PA4 snapshots.
drop policy if exists "Parents can update linked progress" on public.progress;
drop policy if exists "Parents can insert linked progress" on public.progress;

create or replace function public.assert_parent_role()
returns void language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Login required' using errcode = '42501'; end if;
  if not exists (
    select 1 from public.user_profiles profile
    where profile.user_id = auth.uid() and profile.status = 'active'
  ) then raise exception 'Account unavailable' using errcode = '42501'; end if;
  if coalesce(auth.jwt()->'user_metadata'->>'role', '') <> 'parent'
    and not exists (
      select 1 from public.parent_student_links link
      where link.parent_user_id = auth.uid() and link.status = 'active'
    ) then raise exception 'Parent access required' using errcode = '42501'; end if;
end;
$$;

create or replace function public.preview_parent_child_link(p_explorer_code text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  v_student public.students%rowtype;
  v_code text := public.normalise_explorer_code(p_explorer_code);
  v_attempts integer;
begin
  perform public.assert_parent_role();
  select count(*) into v_attempts from public.parent_link_attempts
  where parent_user_id = auth.uid() and attempted_at > now() - interval '15 minutes';
  if v_attempts >= 8 then
    insert into public.parent_link_attempts(parent_user_id, code_fingerprint, outcome)
    values (auth.uid(), encode(extensions.digest(v_code, 'sha256'), 'hex'), 'throttled');
    raise exception 'Too many attempts. Try again later.' using errcode = 'P0001';
  end if;

  select student.* into v_student
  from public.student_explorer_codes code
  join public.students student on student.id = code.student_id
  where code.code_normalised = v_code and code.status = 'active'
    and student.archived_at is null and coalesce(student.identity_status, 'active') = 'active';

  insert into public.parent_link_attempts(parent_user_id, code_fingerprint, outcome)
  values (auth.uid(), encode(extensions.digest(v_code, 'sha256'), 'hex'),
    case when v_student.id is null then 'not_matched' else 'matched' end);
  if v_student.id is null then
    raise exception 'That Explorer Code could not be verified.' using errcode = 'P0001';
  end if;

  return jsonb_build_object(
    'studentId', v_student.id,
    'firstName', coalesce(nullif(v_student.first_name, ''), split_part(v_student.display_name, ' ', 1)),
    'lastInitial', case when nullif(v_student.last_name, '') is null then null else left(v_student.last_name, 1) end,
    'yearLevel', coalesce(v_student.school_year_level, v_student.year_level),
    'schoolName', (select school.name from public.schools school where school.id = v_student.school_id),
    'alreadyLinked', exists(select 1 from public.parent_student_links link
      where link.parent_user_id = auth.uid() and link.student_id = v_student.id and link.status = 'active')
  );
end;
$$;

create or replace function public.confirm_parent_child_link(
  p_explorer_code text,
  p_relationship text default 'guardian'
)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare v_preview jsonb; v_student_id uuid; v_link_id uuid;
begin
  v_preview := public.preview_parent_child_link(p_explorer_code);
  v_student_id := (v_preview->>'studentId')::uuid;
  insert into public.parent_student_links(
    parent_user_id, student_id, relationship, status, link_method, approved_at, approved_by, ended_at, updated_at
  ) values (
    auth.uid(), v_student_id, coalesce(nullif(trim(p_relationship),''),'guardian'),
    'active', 'explorer_code', now(), auth.uid(), null, now()
  ) on conflict (parent_user_id, student_id) do update set
    relationship = excluded.relationship, status = 'active', link_method = 'explorer_code',
    approved_at = now(), approved_by = auth.uid(), ended_at = null, updated_at = now()
  returning id into v_link_id;
  insert into public.parent_link_attempts(parent_user_id, code_fingerprint, outcome)
  values (auth.uid(), encode(extensions.digest(public.normalise_explorer_code(p_explorer_code), 'sha256'), 'hex'), 'linked');
  insert into public.student_identity_audit_events(actor_user_id, action, student_id, after_state)
  values (auth.uid(), 'parent_linked', v_student_id,
    jsonb_build_object('linkId',v_link_id,'relationship',p_relationship,'method','explorer_code'));
  return v_preview || jsonb_build_object('linked', true, 'linkId', v_link_id);
end;
$$;

create or replace function public.activate_free_home_access(p_student_id uuid)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare v_id uuid;
begin
  perform public.assert_parent_role();
  if not exists(select 1 from public.parent_student_links where parent_user_id=auth.uid()
    and student_id=p_student_id and status='active') then
    raise exception 'Child access denied' using errcode='42501';
  end if;
  insert into public.student_access_entitlements(
    student_id, access_source, status, billing_status, starts_at, notes, created_by, updated_by
  ) values (p_student_id,'home','active','free',now(),'2026 free Home access',auth.uid(),auth.uid())
  on conflict (student_id) where access_source='home' do update set
    status='active', billing_status='free', ends_at=null, updated_by=auth.uid(), updated_at=now()
  returning id into v_id;
  insert into public.student_identity_audit_events(actor_user_id,action,student_id,after_state)
  values(auth.uid(),'home_access_activated',p_student_id,jsonb_build_object('entitlementId',v_id,'billingStatus','free'));
  return jsonb_build_object('active',true,'billingStatus','free');
end;
$$;

create or replace function public.get_parent_home_snapshot()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_result jsonb;
begin
  perform public.assert_parent_role();
  select jsonb_build_object(
    'children', coalesce(jsonb_agg(jsonb_build_object(
      'studentId', student.id,
      'displayName', student.display_name,
      'firstName', coalesce(nullif(student.first_name,''),split_part(student.display_name,' ',1)),
      'yearLevel', student.year_level,
      'explorerCode', code.code,
      'homeAccess', coalesce(home.status='active',false),
      'billingStatus', home.billing_status,
      'schoolName', school.name,
      'lastActiveAt', greatest(
        (select max(attempt.completed_at) from public.student_lesson_attempts attempt where attempt.student_id=student.id),
        (select max(attempt.completed_at) from public.student_weekly_quiz_attempts attempt where attempt.student_id=student.id),
        (select max(attempt.completed_at) from public.student_realm_assessments attempt where attempt.student_id=student.id)
      ),
      'realms', coalesce((select jsonb_agg(jsonb_build_object(
        'realmId', progress.realm_id, 'workingLevel', progress.working_level,
        'currentWeek', progress.current_week, 'requiredWeeks', progress.required_weeks,
        'optionalWeeks', progress.optional_weeks, 'status', progress.status,
        'currentFocus', (select attempt.topic_focus from public.student_lesson_attempts attempt
          where attempt.student_id=student.id and attempt.realm_id=progress.realm_id
          order by attempt.completed_at desc limit 1),
        'requiredCompleted', (select count(*) from jsonb_array_elements_text(progress.required_weeks) required(week)
          where exists (select 1 from public.student_weekly_quiz_attempts quiz
            where quiz.student_id=student.id and quiz.realm_id=progress.realm_id
              and quiz.working_level=progress.working_level and quiz.week=required.week::integer and quiz.passed))
      ) order by progress.realm_id) from public.student_realm_progress progress
        where progress.student_id=student.id and progress.is_current), '[]'::jsonb),
      'recentAchievements', coalesce((select jsonb_agg(item) from (
        select jsonb_build_object('name',definition.name,'earnedAt',gem.earned_at,'rarity',definition.rarity) item
        from public.student_gems gem join public.gem_definitions definition on definition.id=gem.gem_id
        where gem.student_id=student.id order by gem.earned_at desc limit 3
      ) recent), '[]'::jsonb)
    ) order by student.display_name), '[]'::jsonb)
  ) into v_result
  from public.parent_student_links link
  join public.students student on student.id=link.student_id
  left join public.schools school on school.id=student.school_id
  left join public.student_explorer_codes code on code.student_id=student.id and code.status='active'
  left join public.student_access_entitlements home on home.student_id=student.id and home.access_source='home'
  where link.parent_user_id=auth.uid() and link.status='active'
    and coalesce(student.identity_status,'active')='active';
  return coalesce(v_result,jsonb_build_object('children','[]'::jsonb));
end;
$$;

create or replace function public.get_parent_child_realm_snapshot(p_student_id uuid,p_realm_id text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_result jsonb; v_progress public.student_realm_progress%rowtype;
begin
  perform public.assert_parent_role();
  if not exists(select 1 from public.parent_student_links where parent_user_id=auth.uid()
    and student_id=p_student_id and status='active') then raise exception 'Child access denied' using errcode='42501'; end if;
  select * into v_progress from public.student_realm_progress progress
  where progress.student_id=p_student_id and progress.realm_id=p_realm_id and progress.is_current
  order by progress.updated_at desc limit 1;
  select jsonb_build_object(
    'studentId',student.id,'displayName',student.display_name,'realmId',p_realm_id,
    'placementStatus',case when v_progress.id is null then 'Not Placed' else 'Placed' end,
    'current',case when v_progress.id is null then null else jsonb_build_object(
      'workingLevel',v_progress.working_level,'currentWeek',v_progress.current_week,
      'status',v_progress.status,'requiredWeeks',v_progress.required_weeks,
      'optionalWeeks',v_progress.optional_weeks,
      'currentFocus',(select lesson.topic_focus from public.student_lesson_attempts lesson
        where lesson.student_id=student.id and lesson.realm_id=p_realm_id
        order by lesson.completed_at desc limit 1)) end,
    'weeks',case when v_progress.id is null then '[]'::jsonb else coalesce((
      select jsonb_agg(jsonb_build_object(
        'week',week_number,
        'required',exists(
          select 1
          from jsonb_array_elements_text(v_progress.required_weeks) required_week(value)
          where required_week.value::integer = week_number
        ),
        'focus',(select lesson.topic_focus from public.student_lesson_attempts lesson
          where lesson.student_id=student.id and lesson.realm_id=p_realm_id
            and lesson.working_level=v_progress.working_level and lesson.week=week_number
          order by lesson.completed_at desc limit 1),
        'lessons',coalesce((select jsonb_agg(item order by lesson_number) from (
          select latest.lesson lesson_number, jsonb_build_object(
            'lesson',latest.lesson,'lessonName',coalesce(latest.topic_focus,'Lesson '||latest.lesson),
            'focus',latest.topic_focus,'correct',latest.correct_count,'attempted',latest.total_questions,
            'accuracy',latest.accuracy_percent,'attempts',(select count(*) from public.student_lesson_attempts all_attempts
              where all_attempts.student_id=student.id and all_attempts.realm_id=p_realm_id
                and all_attempts.working_level=v_progress.working_level and all_attempts.week=week_number
                and all_attempts.lesson=latest.lesson),
            'status',case when latest.completed then 'Completed' else 'Developing' end
          ) item from (
            select distinct on (lesson.lesson) lesson.* from public.student_lesson_attempts lesson
            where lesson.student_id=student.id and lesson.realm_id=p_realm_id
              and lesson.working_level=v_progress.working_level and lesson.week=week_number
            order by lesson.lesson, lesson.completed_at desc
          ) latest
        ) lesson_items),'[]'::jsonb),
        'quiz',(select jsonb_build_object(
          'correct',quiz.correct_count,'attempted',quiz.total_questions,'accuracy',quiz.accuracy_percent,
          'attempts',(select count(*) from public.student_weekly_quiz_attempts all_quizzes
            where all_quizzes.student_id=student.id and all_quizzes.realm_id=p_realm_id
              and all_quizzes.working_level=v_progress.working_level and all_quizzes.week=week_number),
          'status',case when quiz.passed then 'Completed' when quiz.accuracy_percent>=60 then 'Developing' else 'Needs More Practice' end)
          from public.student_weekly_quiz_attempts quiz where quiz.student_id=student.id and quiz.realm_id=p_realm_id
            and quiz.working_level=v_progress.working_level and quiz.week=week_number
          order by quiz.completed_at desc limit 1)
      ) order by week_number)
      from (select distinct value::integer week_number
        from jsonb_array_elements_text(v_progress.required_weeks||v_progress.optional_weeks)) weeks
    ),'[]'::jsonb) end,
    'assessments',coalesce((select jsonb_agg(jsonb_build_object(
      'id',assessment.id,'type',assessment.assessment_type,'correct',assessment.correct_count,
      'attempted',assessment.total_questions,'score',assessment.score_percent,
      'status',case when assessment.score_percent>=85 then 'Mastered' when assessment.score_percent>=70 then 'On Track'
        when assessment.score_percent>=50 then 'Developing' else 'Needs More Practice' end,
      'completedAt',assessment.completed_at) order by assessment.completed_at desc)
      from public.student_realm_assessments assessment
      where assessment.student_id=student.id and assessment.realm_id=p_realm_id),'[]'::jsonb),
    'passThreshold',85
  ) into v_result from public.students student
  where student.id=p_student_id and coalesce(student.identity_status,'active')='active';
  return v_result;
end;
$$;

create or replace function public.get_platform_identity_centre()
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_platform_owner() then raise exception 'Platform owner access required' using errcode='42501'; end if;
  return jsonb_build_object(
    'pendingLinks',coalesce((select jsonb_agg(jsonb_build_object(
      'id',request.id,'requestType',request.request_type,'studentId',request.student_id,
      'studentName',student.display_name,'schoolId',request.school_id,'schoolName',school.name,
      'reason',request.reason,'metadata',request.metadata,'createdAt',request.created_at
    ) order by request.created_at)
      from public.student_identity_link_requests request
      left join public.students student on student.id=request.student_id
      left join public.schools school on school.id=request.school_id
      where request.status='pending'),'[]'::jsonb),
    'mergeRequests',coalesce((select jsonb_agg(jsonb_build_object(
      'id',request.id,'survivorStudentId',request.survivor_student_id,
      'survivorName',survivor.display_name,'duplicateStudentId',request.duplicate_student_id,
      'duplicateName',duplicate.display_name,'reason',request.reason,'preview',request.preview,
      'createdAt',request.created_at
    ) order by request.created_at)
      from public.student_identity_merge_requests request
      join public.students survivor on survivor.id=request.survivor_student_id
      join public.students duplicate on duplicate.id=request.duplicate_student_id
      where request.status='pending'),'[]'::jsonb),
    'retiredIdentities',coalesce((select jsonb_agg(jsonb_build_object('studentId',id,'displayName',display_name,'mergedInto',merged_into_student_id,'mergedAt',merged_at)) from public.students where identity_status='merged'),'[]'::jsonb),
    'recentTransfers',coalesce((select jsonb_agg(jsonb_build_object(
      'id',event.id,'studentId',event.student_id,'studentName',student.display_name,
      'fromSchoolId',event.from_school_id,'fromSchoolName',from_school.name,
      'toSchoolId',event.to_school_id,'toSchoolName',to_school.name,
      'reason',event.reason,'createdAt',event.created_at
    ) order by event.created_at desc)
      from (select * from public.student_school_transfer_events order by created_at desc limit 50) event
      join public.students student on student.id=event.student_id
      left join public.schools from_school on from_school.id=event.from_school_id
      join public.schools to_school on to_school.id=event.to_school_id),'[]'::jsonb)
  );
end;
$$;

create or replace function public.preview_school_student_link(
  p_school_id uuid,
  p_explorer_code text
)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  v_student public.students%rowtype;
  v_code text := public.normalise_explorer_code(p_explorer_code);
begin
  if auth.uid() is null or not public.can_manage_school(p_school_id) then
    raise exception 'School access denied' using errcode = '42501';
  end if;

  select student.* into v_student
  from public.student_explorer_codes explorer
  join public.students student on student.id = explorer.student_id
  where explorer.code_normalised = v_code
    and explorer.status = 'active'
    and student.archived_at is null
    and coalesce(student.identity_status, 'active') = 'active';

  if v_student.id is null then
    raise exception 'That Explorer Code could not be verified.' using errcode = 'P0001';
  end if;

  insert into public.student_identity_link_requests(
    request_type, student_id, requested_by, school_id, status, metadata
  ) values (
    'school_link', v_student.id, auth.uid(), p_school_id, 'pending',
    jsonb_build_object('method', 'explorer_code_preview')
  );

  return jsonb_build_object(
    'studentId', v_student.id,
    'firstName', coalesce(nullif(v_student.first_name, ''), split_part(v_student.display_name, ' ', 1)),
    'lastInitial', case when nullif(v_student.last_name, '') is null then null else left(v_student.last_name, 1) || '.' end,
    'yearLevel', coalesce(v_student.school_year_level, v_student.year_level),
    'alreadyAtSchool', v_student.school_id = p_school_id,
    'hasHomeAccess', exists(
      select 1 from public.student_access_entitlements entitlement
      where entitlement.student_id = v_student.id
        and entitlement.access_source = 'home'
        and entitlement.status = 'active'
    )
  );
end;
$$;

create or replace function public.link_existing_student_to_school(
  p_school_id uuid,
  p_student_id uuid,
  p_school_year_level text,
  p_class_id uuid default null,
  p_reason text default 'Linked existing Level Up Learning identity'
)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  v_student public.students%rowtype;
  v_previous_school_id uuid;
  v_academic_year_id uuid;
  v_class public.classes%rowtype;
  v_enrolment_id uuid;
  v_explorer_code text;
begin
  if auth.uid() is null or not public.can_manage_school(p_school_id) then
    raise exception 'School access denied' using errcode = '42501';
  end if;
  if p_school_year_level not in ('Prep','Year 1','Year 2','Year 3','Year 4','Year 5','Year 6') then
    raise exception 'A valid school year level is required';
  end if;

  select * into v_student from public.students
  where id = p_student_id and archived_at is null
    and coalesce(identity_status, 'active') = 'active'
  for update;
  if v_student.id is null then raise exception 'Student identity unavailable'; end if;
  v_previous_school_id := v_student.school_id;

  select id into v_academic_year_id from public.academic_years
  where school_id = p_school_id
  order by (calendar_year = extract(year from current_date)::integer) desc, calendar_year desc
  limit 1;
  if v_academic_year_id is null then raise exception 'School academic year unavailable'; end if;

  if p_class_id is not null then
    select * into v_class from public.classes
    where id = p_class_id and school_id = p_school_id and academic_year_id = v_academic_year_id;
    if v_class.id is null then raise exception 'Class is not available for this school year'; end if;
  end if;

  update public.student_school_memberships set
    status = 'ended', ended_at = now()
  where student_id = p_student_id and status = 'active' and school_id <> p_school_id;
  insert into public.student_school_memberships(
    student_id, school_id, academic_year_id, status, link_method, created_by
  ) values (
    p_student_id, p_school_id, v_academic_year_id, 'active', 'explorer_code', auth.uid()
  ) on conflict (student_id) where status = 'active' do update set
    school_id = excluded.school_id,
    academic_year_id = excluded.academic_year_id,
    link_method = excluded.link_method,
    created_by = excluded.created_by;

  update public.class_enrollments set
    status = 'inactive', ended_at = now(), is_primary = false, updated_at = now()
  where student_id = p_student_id and status = 'active' and ended_at is null
    and school_id is distinct from p_school_id;

  if p_class_id is not null then
    update public.class_enrollments set is_primary = false, updated_at = now()
    where student_id = p_student_id and academic_year_id = v_academic_year_id
      and status = 'active' and ended_at is null;
    insert into public.class_enrollments(
      student_id, class_id, school_id, academic_year_id, status, ended_at,
      is_primary, created_by, updated_at
    ) values (
      p_student_id, p_class_id, p_school_id, v_academic_year_id, 'active', null,
      true, auth.uid(), now()
    ) on conflict (student_id, class_id) do update set
      school_id = excluded.school_id,
      academic_year_id = excluded.academic_year_id,
      status = 'active', ended_at = null, is_primary = true, updated_at = now();
    select id into v_enrolment_id from public.class_enrollments
    where student_id = p_student_id and class_id = p_class_id;
  end if;

  if v_previous_school_id is not null and v_previous_school_id <> p_school_id then
    update public.student_access_entitlements set
      status = 'expired', ends_at = coalesce(ends_at, now()), updated_by = auth.uid(), updated_at = now()
    where student_id = p_student_id and access_source = 'school'
      and school_id = v_previous_school_id and status = 'active';
  end if;
  insert into public.student_access_entitlements(
    student_id, access_source, school_id, academic_year_id, status,
    billing_status, starts_at, source_enrolment_id, notes, created_by, updated_by
  ) values (
    p_student_id, 'school', p_school_id, v_academic_year_id, 'active',
    'free', now(), v_enrolment_id, 'Existing identity linked to school', auth.uid(), auth.uid()
  ) on conflict (student_id, school_id, academic_year_id) where access_source = 'school' do update set
    status = 'active', ends_at = null, source_enrolment_id = excluded.source_enrolment_id,
    updated_by = auth.uid(), updated_at = now();

  update public.students set
    school_id = p_school_id,
    class_id = p_class_id,
    school_year_level = p_school_year_level,
    year_level = p_school_year_level
  where id = p_student_id;

  if v_previous_school_id is distinct from p_school_id then
    insert into public.student_school_transfer_events(
      student_id, from_school_id, to_school_id, requested_by, reason
    ) values (p_student_id, v_previous_school_id, p_school_id, auth.uid(), nullif(trim(p_reason), ''));
  end if;
  update public.student_identity_link_requests set
    status = 'approved', reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now()
  where id = (
    select id from public.student_identity_link_requests
    where request_type = 'school_link' and student_id = p_student_id
      and school_id = p_school_id and requested_by = auth.uid() and status = 'pending'
    order by created_at desc limit 1
  );
  insert into public.student_identity_audit_events(
    actor_user_id, action, student_id, school_id, before_state, after_state, reason
  ) values (
    auth.uid(), case when v_previous_school_id is null then 'home_student_linked_to_school' else 'student_transferred_school' end,
    p_student_id, p_school_id,
    jsonb_build_object('schoolId', v_previous_school_id),
    jsonb_build_object('schoolId', p_school_id, 'classId', p_class_id, 'academicYearId', v_academic_year_id),
    nullif(trim(p_reason), '')
  );
  perform public.write_school_audit(
    p_school_id, 'existing_student_linked', 'student', p_student_id::text,
    jsonb_build_object('schoolId', v_previous_school_id),
    jsonb_build_object('schoolId', p_school_id, 'classId', p_class_id),
    jsonb_build_object('reason', p_reason)
  );
  select code into v_explorer_code from public.student_explorer_codes
  where student_id = p_student_id and status = 'active' limit 1;
  return jsonb_build_object(
    'studentId', p_student_id, 'explorerCode', v_explorer_code,
    'schoolId', p_school_id, 'classId', p_class_id, 'transferred', v_previous_school_id is distinct from p_school_id
  );
end;
$$;

create or replace function public.preview_school_student_creation(
  p_school_id uuid,
  p_first_name text,
  p_last_name text,
  p_school_year_level text
)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare v_candidates jsonb; v_request_id uuid;
begin
  if auth.uid() is null or not public.can_manage_school(p_school_id) then
    raise exception 'School access denied' using errcode = '42501';
  end if;
  if nullif(trim(p_first_name), '') is null or nullif(trim(p_last_name), '') is null then
    return jsonb_build_object('potentialDuplicate', false, 'candidates', '[]'::jsonb);
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'studentId', student.id,
    'firstName', coalesce(nullif(student.first_name, ''), split_part(student.display_name, ' ', 1)),
    'lastInitial', left(coalesce(nullif(student.last_name, ''), split_part(student.display_name, ' ', 2)), 1) || '.',
    'yearLevel', coalesce(student.school_year_level, student.year_level),
    'schoolName', school.name,
    'hasHomeAccess', exists(select 1 from public.student_access_entitlements entitlement
      where entitlement.student_id = student.id and entitlement.access_source = 'home' and entitlement.status = 'active')
  ) order by student.created_at), '[]'::jsonb)
  into v_candidates
  from public.students student
  left join public.schools school on school.id = student.school_id
  where student.archived_at is null
    and coalesce(student.identity_status, 'active') = 'active'
    and lower(regexp_replace(coalesce(nullif(student.first_name, ''), split_part(student.display_name, ' ', 1)), '[^a-z0-9]', '', 'g'))
      = lower(regexp_replace(trim(p_first_name), '[^a-z0-9]', '', 'g'))
    and lower(regexp_replace(coalesce(nullif(student.last_name, ''), split_part(student.display_name, ' ', 2)), '[^a-z0-9]', '', 'g'))
      = lower(regexp_replace(trim(p_last_name), '[^a-z0-9]', '', 'g'));

  if jsonb_array_length(v_candidates) > 0 then
    insert into public.student_identity_link_requests(
      request_type, requested_by, school_id, status, reason, metadata
    ) values (
      'duplicate_review', auth.uid(), p_school_id, 'pending',
      'Potential duplicate detected before creating a school student',
      jsonb_build_object('firstName', trim(p_first_name), 'lastName', trim(p_last_name),
        'yearLevel', p_school_year_level, 'candidateIds',
        (select jsonb_agg(candidate->>'studentId') from jsonb_array_elements(v_candidates) candidate))
    ) returning id into v_request_id;
  end if;

  return jsonb_build_object(
    'potentialDuplicate', jsonb_array_length(v_candidates) > 0,
    'requestId', v_request_id,
    'candidates', v_candidates
  );
end;
$$;

create or replace function public.request_student_identity_merge(
  p_survivor_student_id uuid,
  p_duplicate_student_id uuid,
  p_reason text
)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare v_preview jsonb; v_request_id uuid;
begin
  if not public.is_platform_owner() then
    raise exception 'Platform owner access required' using errcode = '42501';
  end if;
  if p_survivor_student_id = p_duplicate_student_id then raise exception 'Choose two different identities'; end if;
  if nullif(trim(p_reason), '') is null then raise exception 'A merge reason is required'; end if;
  if not exists(select 1 from public.students where id = p_survivor_student_id and identity_status = 'active')
    or not exists(select 1 from public.students where id = p_duplicate_student_id and identity_status = 'active') then
    raise exception 'Both identities must be active';
  end if;

  select jsonb_build_object(
    'survivor', (select jsonb_build_object('studentId',id,'displayName',display_name,'schoolId',school_id,
      'yearLevel',coalesce(school_year_level,year_level)) from public.students where id=p_survivor_student_id),
    'duplicate', (select jsonb_build_object('studentId',id,'displayName',display_name,'schoolId',school_id,
      'yearLevel',coalesce(school_year_level,year_level)) from public.students where id=p_duplicate_student_id),
    'lessonAttempts', (select count(*) from public.student_lesson_attempts where student_id in (p_survivor_student_id,p_duplicate_student_id)),
    'weeklyQuizzes', (select count(*) from public.student_weekly_quiz_attempts where student_id in (p_survivor_student_id,p_duplicate_student_id)),
    'assessments', (select count(*) from public.student_realm_assessments where student_id in (p_survivor_student_id,p_duplicate_student_id)),
    'parentLinks', (select count(*) from public.parent_student_links where student_id in (p_survivor_student_id,p_duplicate_student_id) and status='active'),
    'schoolMemberships', (select count(*) from public.student_school_memberships where student_id in (p_survivor_student_id,p_duplicate_student_id)),
    'homeEntitlements', (select count(*) from public.student_access_entitlements where student_id in (p_survivor_student_id,p_duplicate_student_id) and access_source='home'),
    'gems', (select count(distinct gem_id) from public.student_gems where student_id in (p_survivor_student_id,p_duplicate_student_id)),
    'realmies', (select count(distinct realmie_id) from public.student_realmies where student_id in (p_survivor_student_id,p_duplicate_student_id)),
    'warning', 'Approving retires the duplicate identity. Educational records and unique rewards move to the survivor.'
  ) into v_preview;

  insert into public.student_identity_merge_requests(
    survivor_student_id, duplicate_student_id, requested_by, reason, preview
  ) values (p_survivor_student_id,p_duplicate_student_id,auth.uid(),trim(p_reason),v_preview)
  returning id into v_request_id;
  return jsonb_build_object('requestId',v_request_id,'preview',v_preview,'status','pending');
end;
$$;

create or replace function public.approve_school_student_creation_override(
  p_school_id uuid,
  p_request_id uuid,
  p_reason text
)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare v_request public.student_identity_link_requests%rowtype;
begin
  if auth.uid() is null or not public.can_manage_school(p_school_id) then
    raise exception 'School access denied' using errcode = '42501';
  end if;
  if nullif(trim(p_reason), '') is null then raise exception 'A reason is required'; end if;
  select * into v_request from public.student_identity_link_requests
  where id=p_request_id and school_id=p_school_id and request_type='duplicate_review'
  for update;
  if v_request.id is null or v_request.status <> 'pending' or v_request.requested_by <> auth.uid() then
    raise exception 'Duplicate review confirmation is unavailable';
  end if;
  update public.student_identity_link_requests set
    status='approved', reviewed_by=auth.uid(), reviewed_at=now(), updated_at=now(),
    reason=coalesce(reason,'') || E'\nDecision: ' || trim(p_reason)
  where id=p_request_id;
  insert into public.student_identity_audit_events(
    actor_user_id,action,school_id,before_state,after_state,reason
  ) values (
    auth.uid(),'separate_student_creation_approved',p_school_id,
    jsonb_build_object('requestId',p_request_id,'status','pending','metadata',v_request.metadata),
    jsonb_build_object('requestId',p_request_id,'status','approved'),trim(p_reason)
  );
  return jsonb_build_object('requestId',p_request_id,'status','approved');
end;
$$;

create or replace function public.resolve_student_identity_merge(
  p_request_id uuid,
  p_approve boolean,
  p_reason text
)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  v_request public.student_identity_merge_requests%rowtype;
  v_survivor public.students%rowtype;
  v_duplicate public.students%rowtype;
  v_survivor_wallet public.student_economy_wallets%rowtype;
  v_duplicate_wallet public.student_economy_wallets%rowtype;
begin
  if not public.is_platform_owner() then
    raise exception 'Platform owner access required' using errcode = '42501';
  end if;
  if nullif(trim(p_reason), '') is null then raise exception 'A review reason is required'; end if;
  select * into v_request from public.student_identity_merge_requests where id=p_request_id for update;
  if v_request.id is null or v_request.status <> 'pending' then raise exception 'Merge request is unavailable'; end if;
  if not p_approve then
    update public.student_identity_merge_requests set status='rejected',reviewed_by=auth.uid(),reviewed_at=now(),
      reason=v_request.reason || E'\nReview: ' || trim(p_reason) where id=p_request_id;
    insert into public.student_identity_audit_events(actor_user_id,action,student_id,related_student_id,before_state,reason)
    values(auth.uid(),'identity_merge_rejected',v_request.survivor_student_id,v_request.duplicate_student_id,v_request.preview,trim(p_reason));
    return jsonb_build_object('status','rejected','requestId',p_request_id);
  end if;

  select * into v_survivor from public.students where id=v_request.survivor_student_id for update;
  select * into v_duplicate from public.students where id=v_request.duplicate_student_id for update;
  if v_survivor.identity_status <> 'active' or v_duplicate.identity_status <> 'active' then
    raise exception 'Both identities must still be active';
  end if;

  -- Preserve immutable learning evidence by re-associating attempts without changing snapshots.
  update public.student_lesson_attempts set student_id=v_survivor.id where student_id=v_duplicate.id;
  update public.student_weekly_quiz_attempts set student_id=v_survivor.id where student_id=v_duplicate.id;
  update public.student_realm_assessments set student_id=v_survivor.id where student_id=v_duplicate.id;

  update public.student_realm_progress survivor_progress set
    current_week=greatest(survivor_progress.current_week,duplicate_progress.current_week),
    placement_complete=survivor_progress.placement_complete or duplicate_progress.placement_complete,
    pretest_score=greatest(survivor_progress.pretest_score,duplicate_progress.pretest_score),
    posttest_score=greatest(survivor_progress.posttest_score,duplicate_progress.posttest_score),
    pretest_completed_at=greatest(survivor_progress.pretest_completed_at,duplicate_progress.pretest_completed_at),
    posttest_completed_at=greatest(survivor_progress.posttest_completed_at,duplicate_progress.posttest_completed_at),
    required_weeks=(select coalesce(jsonb_agg(distinct week order by week),'[]'::jsonb) from jsonb_array_elements(survivor_progress.required_weeks||duplicate_progress.required_weeks) week),
    optional_weeks=(select coalesce(jsonb_agg(distinct week order by week),'[]'::jsonb) from jsonb_array_elements(survivor_progress.optional_weeks||duplicate_progress.optional_weeks) week),
    unlocked_legends=(select coalesce(jsonb_agg(distinct legend order by legend),'[]'::jsonb) from jsonb_array_elements(survivor_progress.unlocked_legends||duplicate_progress.unlocked_legends) legend),
    updated_at=now()
  from public.student_realm_progress duplicate_progress
  where survivor_progress.student_id=v_survivor.id and duplicate_progress.student_id=v_duplicate.id
    and survivor_progress.realm_id=duplicate_progress.realm_id and survivor_progress.working_level=duplicate_progress.working_level;
  update public.student_realm_progress duplicate_progress set student_id=v_survivor.id
  where duplicate_progress.student_id=v_duplicate.id and not exists(
    select 1 from public.student_realm_progress survivor_progress where survivor_progress.student_id=v_survivor.id
      and survivor_progress.realm_id=duplicate_progress.realm_id and survivor_progress.working_level=duplicate_progress.working_level
  );
  update public.student_realm_progress set is_current=false where student_id=v_duplicate.id;

  insert into public.parent_student_links(parent_user_id,student_id,relationship,status,link_method,approved_at,approved_by,updated_at)
  select parent_user_id,v_survivor.id,relationship,status,link_method,approved_at,approved_by,now()
  from public.parent_student_links where student_id=v_duplicate.id and status='active'
  on conflict(parent_user_id,student_id) do update set status='active',ended_at=null,updated_at=now();
  update public.parent_student_links set status='ended',ended_at=now(),updated_at=now() where student_id=v_duplicate.id and status='active';

  insert into public.student_gems(student_id,gem_id,award_event_key,earned_at,source_type,source_id,metadata)
  select v_survivor.id,gem_id,award_event_key,earned_at,source_type,source_id,metadata from public.student_gems where student_id=v_duplicate.id
  on conflict(student_id,gem_id) do nothing;
  insert into public.gem_award_events(student_id,gem_id,event_key,trigger_type,trigger_id,created_at)
  select v_survivor.id,gem_id,event_key,trigger_type,trigger_id,created_at
  from public.gem_award_events where student_id=v_duplicate.id
  on conflict(student_id,gem_id,event_key) do nothing;
  delete from public.gem_award_events where student_id=v_duplicate.id;
  insert into public.student_gem_display(student_id,favourite_gem_id,updated_at)
  select v_survivor.id,favourite_gem_id,updated_at from public.student_gem_display
  where student_id=v_duplicate.id
  on conflict(student_id) do nothing;
  insert into public.student_inventory(student_id,item_key,acquired_at,acquisition_type)
  select v_survivor.id,item_key,acquired_at,acquisition_type from public.student_inventory where student_id=v_duplicate.id
  on conflict(student_id,item_key) do nothing;
  insert into public.student_realmies(student_id,realmie_id,earned_at,source_type,source_key,source_payload,created_at)
  select v_survivor.id,realmie_id,earned_at,source_type,source_key,source_payload,created_at from public.student_realmies where student_id=v_duplicate.id
  on conflict(student_id,realmie_id) do nothing;
  insert into public.realmie_unlock_receipts(
    student_id,realmie_id,source_type,source_key,idempotency_key,canonical_realm_id,
    canonical_working_level,canonical_assessment_id,context,is_backfill,created_at
  ) select v_survivor.id,realmie_id,source_type,source_key,idempotency_key,canonical_realm_id,
    canonical_working_level,canonical_assessment_id,context,is_backfill,created_at
    from public.realmie_unlock_receipts where student_id=v_duplicate.id
  on conflict do nothing;
  delete from public.realmie_unlock_receipts where student_id=v_duplicate.id;
  insert into public.student_realmie_favourites(student_id,realmie_id,created_at)
  select v_survivor.id,realmie_id,created_at from public.student_realmie_favourites
  where student_id=v_duplicate.id on conflict do nothing;
  insert into public.student_realmie_display_slots(student_id,slot_number,realmie_id,updated_at)
  select v_survivor.id,slot_number,realmie_id,updated_at from public.student_realmie_display_slots
  where student_id=v_duplicate.id on conflict do nothing;
  insert into public.student_realmie_backfill_state(
    student_id,unseen_backfill_realmie_count,latest_backfill_at,acknowledged_at,updated_at
  ) select v_survivor.id,unseen_backfill_realmie_count,latest_backfill_at,acknowledged_at,updated_at
    from public.student_realmie_backfill_state where student_id=v_duplicate.id
  on conflict(student_id) do update set
    unseen_backfill_realmie_count=greatest(
      public.student_realmie_backfill_state.unseen_backfill_realmie_count,
      excluded.unseen_backfill_realmie_count
    ),
    latest_backfill_at=greatest(public.student_realmie_backfill_state.latest_backfill_at,excluded.latest_backfill_at),
    updated_at=now();
  insert into public.student_equipped_items(student_id,slot,item_key,equipped_at)
  select v_survivor.id,slot,item_key,equipped_at from public.student_equipped_items
  where student_id=v_duplicate.id on conflict(student_id,slot) do nothing;
  insert into public.student_avatar_base(student_id,base,updated_at)
  select v_survivor.id,base,updated_at from public.student_avatar_base
  where student_id=v_duplicate.id on conflict(student_id) do nothing;
  insert into public.student_economy_transactions(student_id,transaction_type,xp_delta,essence_delta,source_type,source_key,item_key,metadata,created_at)
  select v_survivor.id,transaction_type,xp_delta,essence_delta,source_type,source_key,item_key,metadata,created_at
  from public.student_economy_transactions where student_id=v_duplicate.id
  on conflict(student_id,source_type,source_key) do nothing;
  select * into v_survivor_wallet from public.student_economy_wallets where student_id=v_survivor.id;
  select * into v_duplicate_wallet from public.student_economy_wallets where student_id=v_duplicate.id;
  insert into public.student_economy_wallets(student_id,xp_earned,xp_spent,essence,updated_at)
  values(v_survivor.id,
    greatest(coalesce(v_survivor_wallet.xp_earned,0),coalesce(v_duplicate_wallet.xp_earned,0),
      coalesce((select sum(greatest(xp_delta,0)) from public.student_economy_transactions where student_id=v_survivor.id),0)),
    least(coalesce(v_survivor_wallet.xp_spent,0),greatest(coalesce(v_survivor_wallet.xp_earned,0),coalesce(v_duplicate_wallet.xp_earned,0))),
    greatest(coalesce(v_survivor_wallet.essence,0),coalesce(v_duplicate_wallet.essence,0)),now())
  on conflict(student_id) do update set xp_earned=excluded.xp_earned,xp_spent=least(public.student_economy_wallets.xp_spent,excluded.xp_earned),
    essence=excluded.essence,updated_at=now();

  -- Preserve access and school history. Existing survivor relationships win conflicts.
  update public.student_access_entitlements duplicate_home set status='revoked',ends_at=coalesce(ends_at,now()),updated_at=now()
  where duplicate_home.student_id=v_duplicate.id and duplicate_home.access_source='home'
    and exists(select 1 from public.student_access_entitlements survivor_home where survivor_home.student_id=v_survivor.id and survivor_home.access_source='home');
  update public.student_access_entitlements set student_id=v_survivor.id where student_id=v_duplicate.id and not (
    access_source='home' and exists(select 1 from public.student_access_entitlements survivor_home where survivor_home.student_id=v_survivor.id and survivor_home.access_source='home'))
    and not (access_source='school' and exists(select 1 from public.student_access_entitlements survivor_school
      where survivor_school.student_id=v_survivor.id and survivor_school.access_source='school'
        and survivor_school.school_id=student_access_entitlements.school_id
        and survivor_school.academic_year_id=student_access_entitlements.academic_year_id));
  update public.student_school_memberships set status='ended',ended_at=coalesce(ended_at,now())
    where student_id=v_duplicate.id and status='active' and exists(select 1 from public.student_school_memberships where student_id=v_survivor.id and status='active');
  update public.student_school_memberships set student_id=v_survivor.id where student_id=v_duplicate.id;
  insert into public.class_enrollments(student_id,class_id,enrolled_at,ended_at,status,school_id,academic_year_id,is_primary,created_by,updated_at)
  select v_survivor.id,class_id,enrolled_at,ended_at,status,school_id,academic_year_id,false,created_by,now()
  from public.class_enrollments where student_id=v_duplicate.id
  on conflict(student_id,class_id) do nothing;
  delete from public.class_enrollments where student_id=v_duplicate.id;

  perform public.ensure_student_explorer_code_internal(v_survivor.id, auth.uid());
  update public.student_explorer_codes duplicate_code set
    status='revoked',revoked_at=now(),revoked_by=auth.uid(),
    revocation_reason='Identity merged into canonical student',
    replacement_code_id=(select survivor_code.id from public.student_explorer_codes survivor_code
      where survivor_code.student_id=v_survivor.id and survivor_code.status='active' limit 1)
  where duplicate_code.student_id=v_duplicate.id and duplicate_code.status='active';
  update public.students set identity_status='merged',merged_into_student_id=v_survivor.id,merged_at=now(),merged_by=auth.uid(),
    archived_at=coalesce(archived_at,now()),class_id=null where id=v_duplicate.id;
  update public.student_identity_merge_requests set status='approved',reviewed_by=auth.uid(),reviewed_at=now(),
    reason=v_request.reason || E'\nReview: ' || trim(p_reason) where id=p_request_id;
  insert into public.student_identity_audit_events(actor_user_id,action,student_id,related_student_id,before_state,after_state,reason)
  values(auth.uid(),'identity_merge_approved',v_survivor.id,v_duplicate.id,v_request.preview,
    jsonb_build_object('survivorStudentId',v_survivor.id,'retiredStudentId',v_duplicate.id),trim(p_reason));
  return jsonb_build_object('status','approved','requestId',p_request_id,'survivorStudentId',v_survivor.id,'retiredStudentId',v_duplicate.id);
end;
$$;

grant execute on function public.preview_parent_child_link(text) to authenticated;
grant execute on function public.confirm_parent_child_link(text,text) to authenticated;
grant execute on function public.activate_free_home_access(uuid) to authenticated;
grant execute on function public.get_parent_home_snapshot() to authenticated;
grant execute on function public.get_parent_child_realm_snapshot(uuid,text) to authenticated;
grant execute on function public.get_platform_identity_centre() to authenticated;
grant execute on function public.preview_school_student_link(uuid,text) to authenticated;
grant execute on function public.link_existing_student_to_school(uuid,uuid,text,uuid,text) to authenticated;
grant execute on function public.preview_school_student_creation(uuid,text,text,text) to authenticated;
grant execute on function public.approve_school_student_creation_override(uuid,uuid,text) to authenticated;
grant execute on function public.request_student_identity_merge(uuid,uuid,text) to authenticated;
grant execute on function public.resolve_student_identity_merge(uuid,boolean,text) to authenticated;

commit;
