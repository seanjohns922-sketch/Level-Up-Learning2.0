begin;

-- PA4 safety hardening. Ambiguous identity state must be reviewed explicitly;
-- it must never be combined by an automatic winner/union rule.
create or replace function public.get_student_identity_merge_conflicts(
  p_survivor_student_id uuid,
  p_duplicate_student_id uuid
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with domains(code, label, survivor_has_state, duplicate_has_state) as (
    values
      ('educational_progress', 'Learning, placement or assessment history',
        exists(select 1 from public.student_realm_progress where student_id=p_survivor_student_id)
          or exists(select 1 from public.student_lesson_attempts where student_id=p_survivor_student_id)
          or exists(select 1 from public.student_weekly_quiz_attempts where student_id=p_survivor_student_id)
          or exists(select 1 from public.student_realm_assessments where student_id=p_survivor_student_id)
          or exists(select 1 from public.student_progress_overrides where student_id=p_survivor_student_id),
        exists(select 1 from public.student_realm_progress where student_id=p_duplicate_student_id)
          or exists(select 1 from public.student_lesson_attempts where student_id=p_duplicate_student_id)
          or exists(select 1 from public.student_weekly_quiz_attempts where student_id=p_duplicate_student_id)
          or exists(select 1 from public.student_realm_assessments where student_id=p_duplicate_student_id)
          or exists(select 1 from public.student_progress_overrides where student_id=p_duplicate_student_id)),
      ('economy', 'XP, essence or economy transaction history',
        exists(select 1 from public.student_economy_transactions where student_id=p_survivor_student_id)
          or exists(select 1 from public.student_economy_wallets where student_id=p_survivor_student_id and (xp_earned<>0 or xp_spent<>0 or essence<>0)),
        exists(select 1 from public.student_economy_transactions where student_id=p_duplicate_student_id)
          or exists(select 1 from public.student_economy_wallets where student_id=p_duplicate_student_id and (xp_earned<>0 or xp_spent<>0 or essence<>0))),
      ('rewards', 'Gems, cards, Realmies, inventory or avatar state',
        exists(select 1 from public.student_gems where student_id=p_survivor_student_id)
          or exists(select 1 from public.student_inventory where student_id=p_survivor_student_id)
          or exists(select 1 from public.student_realmies where student_id=p_survivor_student_id)
          or exists(select 1 from public.student_equipped_items where student_id=p_survivor_student_id)
          or exists(select 1 from public.student_avatar_base where student_id=p_survivor_student_id),
        exists(select 1 from public.student_gems where student_id=p_duplicate_student_id)
          or exists(select 1 from public.student_inventory where student_id=p_duplicate_student_id)
          or exists(select 1 from public.student_realmies where student_id=p_duplicate_student_id)
          or exists(select 1 from public.student_equipped_items where student_id=p_duplicate_student_id)
          or exists(select 1 from public.student_avatar_base where student_id=p_duplicate_student_id)),
      ('parent_links', 'Active parent links',
        exists(select 1 from public.parent_student_links where student_id=p_survivor_student_id and status='active'),
        exists(select 1 from public.parent_student_links where student_id=p_duplicate_student_id and status='active')),
      ('home_entitlements', 'Home access or billing entitlements',
        exists(select 1 from public.student_access_entitlements where student_id=p_survivor_student_id and access_source='home'),
        exists(select 1 from public.student_access_entitlements where student_id=p_duplicate_student_id and access_source='home')),
      ('school_entitlements', 'School access entitlement history',
        exists(select 1 from public.student_access_entitlements where student_id=p_survivor_student_id and access_source='school'),
        exists(select 1 from public.student_access_entitlements where student_id=p_duplicate_student_id and access_source='school')),
      ('school_memberships', 'School membership history',
        exists(select 1 from public.student_school_memberships where student_id=p_survivor_student_id),
        exists(select 1 from public.student_school_memberships where student_id=p_duplicate_student_id)),
      ('class_enrolments', 'Class enrolment history',
        exists(select 1 from public.class_enrollments where student_id=p_survivor_student_id),
        exists(select 1 from public.class_enrollments where student_id=p_duplicate_student_id))
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'code', code,
    'label', label,
    'detail', 'Both identities contain canonical state in this domain. A Platform Owner must resolve it before merging.'
  ) order by code) filter (where survivor_has_state and duplicate_has_state), '[]'::jsonb)
  from domains;
$$;

revoke all on function public.get_student_identity_merge_conflicts(uuid,uuid) from public, anon, authenticated;

create or replace function public.request_student_identity_merge(
  p_survivor_student_id uuid,
  p_duplicate_student_id uuid,
  p_reason text
)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare v_preview jsonb; v_request_id uuid; v_conflicts jsonb;
begin
  if not public.is_platform_owner() then raise exception 'Platform owner access required' using errcode='42501'; end if;
  if p_survivor_student_id=p_duplicate_student_id then raise exception 'Choose two different identities'; end if;
  if nullif(trim(p_reason),'') is null then raise exception 'A merge reason is required'; end if;
  if not exists(select 1 from public.students where id=p_survivor_student_id and archived_at is null and identity_status='active')
    or not exists(select 1 from public.students where id=p_duplicate_student_id and archived_at is null and identity_status='active') then
    raise exception 'Both identities must be active';
  end if;
  v_conflicts := public.get_student_identity_merge_conflicts(p_survivor_student_id,p_duplicate_student_id);
  v_preview := jsonb_build_object(
    'survivor',(select jsonb_build_object('studentId',id,'displayName',display_name,'schoolId',school_id,'yearLevel',coalesce(school_year_level,year_level)) from public.students where id=p_survivor_student_id),
    'duplicate',(select jsonb_build_object('studentId',id,'displayName',display_name,'schoolId',school_id,'yearLevel',coalesce(school_year_level,year_level)) from public.students where id=p_duplicate_student_id),
    'mergeable',jsonb_array_length(v_conflicts)=0,
    'conflicts',v_conflicts,
    'warning',case when jsonb_array_length(v_conflicts)=0
      then 'No protected domain is populated on both identities. Approval will retire the duplicate and preserve its one-sided state.'
      else 'Merge blocked. Resolve every named conflict before creating a new merge request.' end
  );
  insert into public.student_identity_merge_requests(survivor_student_id,duplicate_student_id,requested_by,reason,preview)
  values(p_survivor_student_id,p_duplicate_student_id,auth.uid(),trim(p_reason),v_preview) returning id into v_request_id;
  return jsonb_build_object('requestId',v_request_id,'preview',v_preview,'status','pending');
end;
$$;

-- Keep the original movement implementation private and put a fail-closed gate
-- in front of it. The advisory lock prevents the state changing between review
-- and execution.
do $$
begin
  if to_regprocedure('public.resolve_student_identity_merge_pa4_internal(uuid,boolean,text)') is null then
    if to_regprocedure('public.resolve_student_identity_merge(uuid,boolean,text)') is null then
      raise exception 'PA4 merge implementation is missing';
    end if;
    alter function public.resolve_student_identity_merge(uuid,boolean,text)
      rename to resolve_student_identity_merge_pa4_internal;
  end if;
end;
$$;
revoke all on function public.resolve_student_identity_merge_pa4_internal(uuid,boolean,text) from public, anon, authenticated;

create or replace function public.resolve_student_identity_merge(
  p_request_id uuid,
  p_approve boolean,
  p_reason text
)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare v_request public.student_identity_merge_requests%rowtype; v_conflicts jsonb; v_result jsonb;
begin
  if not public.is_platform_owner() then raise exception 'Platform owner access required' using errcode='42501'; end if;
  if nullif(trim(p_reason),'') is null then raise exception 'A review reason is required'; end if;
  select * into v_request from public.student_identity_merge_requests where id=p_request_id for update;
  if v_request.id is null or v_request.status<>'pending' then raise exception 'Merge request is unavailable'; end if;
  if not p_approve then
    return public.resolve_student_identity_merge_pa4_internal(p_request_id,false,p_reason);
  end if;
  perform pg_advisory_xact_lock(hashtextextended(least(v_request.survivor_student_id::text,v_request.duplicate_student_id::text),0));
  perform pg_advisory_xact_lock(hashtextextended(greatest(v_request.survivor_student_id::text,v_request.duplicate_student_id::text),0));
  v_conflicts := public.get_student_identity_merge_conflicts(v_request.survivor_student_id,v_request.duplicate_student_id);
  if jsonb_array_length(v_conflicts)>0 then
    raise exception 'Merge blocked by unresolved identity conflicts: %',
      (select string_agg(value->>'label',', ') from jsonb_array_elements(v_conflicts)) using errcode='P0001';
  end if;
  v_result := public.resolve_student_identity_merge_pa4_internal(p_request_id,true,p_reason);
  update public.student_progress_overrides set student_id=v_request.survivor_student_id
    where student_id=v_request.duplicate_student_id;
  update public.student_access_sessions set revoked_at=coalesce(revoked_at,now())
    where student_id=v_request.duplicate_student_id;
  update public.student_access_credentials set revoked_at=coalesce(revoked_at,now())
    where student_id=v_request.duplicate_student_id;
  delete from public.student_economy_transactions where student_id=v_request.duplicate_student_id;
  delete from public.student_economy_wallets where student_id=v_request.duplicate_student_id;
  return v_result || jsonb_build_object('conflicts','[]'::jsonb,'safetyPolicy','one_sided_domains_only');
end;
$$;

create or replace function public.can_access_student(target_student_id uuid)
returns boolean language plpgsql volatile security definer set search_path=public as $$
declare supplied_token text:=public.request_student_session_token(); matched_session_id uuid;
begin
  if not exists(select 1 from public.students where id=target_student_id and archived_at is null and coalesce(identity_status,'active')='active') then
    return false;
  end if;
  if exists(select 1 from public.students s where s.id=target_student_id and (
      s.user_id=auth.uid() or public.teacher_owns_class(s.class_id) or exists(select 1 from public.parent_student_links psl
        where psl.student_id=s.id and psl.parent_user_id=auth.uid() and psl.status='active'))) then return true; end if;
  if supplied_token is null then return false; end if;
  select sas.id into matched_session_id from public.student_access_sessions sas
    where sas.student_id=target_student_id and sas.token_hash=encode(extensions.digest(supplied_token,'sha256'),'hex')
      and sas.revoked_at is null and sas.expires_at>now() limit 1;
  if matched_session_id is null then return false; end if;
  update public.student_access_sessions set last_used_at=now() where id=matched_session_id and last_used_at<now()-interval '5 minutes';
  return true;
end;
$$;
revoke all on function public.can_access_student(uuid) from public,anon,authenticated;

create or replace function public.preview_parent_child_link(p_explorer_code text)
returns jsonb language plpgsql volatile security definer set search_path=public as $$
declare
  v_student public.students%rowtype;
  v_code text:=public.normalise_explorer_code(p_explorer_code);
  v_attempts integer;
begin
  perform public.assert_parent_role();
  select count(*) into v_attempts from public.parent_link_attempts
  where parent_user_id=auth.uid() and attempted_at>now()-interval '15 minutes';
  if v_attempts>=8 then
    insert into public.parent_link_attempts(parent_user_id,code_fingerprint,outcome)
    values(auth.uid(),encode(extensions.digest(v_code,'sha256'),'hex'),'throttled');
    return jsonb_build_object('matched',false,'status','throttled','message','The code could not be verified. Try again later.');
  end if;
  select student.* into v_student
  from public.student_explorer_codes code
  join public.students student on student.id=code.student_id
  where code.code_normalised=v_code and code.status='active'
    and student.archived_at is null and coalesce(student.identity_status,'active')='active';
  insert into public.parent_link_attempts(parent_user_id,code_fingerprint,outcome)
  values(auth.uid(),encode(extensions.digest(v_code,'sha256'),'hex'),case when v_student.id is null then 'not_matched' else 'matched' end);
  if v_student.id is null then
    return jsonb_build_object('matched',false,'status','not_matched','message','The code could not be verified.');
  end if;
  return jsonb_build_object(
    'matched',true,
    'studentId',v_student.id,
    'firstName',coalesce(nullif(v_student.first_name,''),split_part(v_student.display_name,' ',1)),
    'lastInitial',case when nullif(v_student.last_name,'') is null then null else left(v_student.last_name,1) end,
    'yearLevel',coalesce(v_student.school_year_level,v_student.year_level),
    'schoolName',(select school.name from public.schools school where school.id=v_student.school_id),
    'alreadyLinked',exists(select 1 from public.parent_student_links link
      where link.parent_user_id=auth.uid() and link.student_id=v_student.id and link.status='active')
  );
end;
$$;

do $$
begin
  if to_regprocedure('public.confirm_parent_child_link(text,text)') is not null then
    revoke execute on function public.confirm_parent_child_link(text,text) from authenticated;
  end if;
end;
$$;
drop function if exists public.confirm_parent_child_link(text,text);
alter table public.parent_link_attempts drop constraint if exists parent_link_attempts_outcome_check;
alter table public.parent_link_attempts add constraint parent_link_attempts_outcome_check
  check (outcome in ('matched','not_matched','linked','throttled','pin_not_matched'));
create or replace function public.confirm_parent_child_link(
  p_explorer_code text,
  p_student_pin text,
  p_relationship text default 'guardian'
)
returns jsonb language plpgsql volatile security definer set search_path=public as $$
declare v_preview jsonb; v_student_id uuid; v_link_id uuid; v_pin text:=trim(coalesce(p_student_pin,''));
begin
  v_preview:=public.preview_parent_child_link(p_explorer_code);
  v_student_id:=(v_preview->>'studentId')::uuid;
  if v_pin!~'^[0-9]{4}$' or not exists(
    select 1 from public.students student where student.id=v_student_id and (
      student.pin=v_pin or exists(select 1 from public.student_access_credentials credential
        where credential.student_id=student.id and credential.credential_type='pin'
          and credential.credential_secret=v_pin and credential.revoked_at is null
          and (credential.expires_at is null or credential.expires_at>now())))
  ) then
    insert into public.parent_link_attempts(parent_user_id,code_fingerprint,outcome)
    values(auth.uid(),encode(extensions.digest(public.normalise_explorer_code(p_explorer_code),'sha256'),'hex'),'pin_not_matched');
    return jsonb_build_object(
      'linked',false,
      'status','not_matched',
      'message','The child details could not be verified.'
    );
  end if;
  insert into public.parent_student_links(parent_user_id,student_id,relationship,status,link_method,approved_at,approved_by,ended_at,updated_at)
  values(auth.uid(),v_student_id,coalesce(nullif(trim(p_relationship),''),'guardian'),'active','explorer_code_and_pin',now(),auth.uid(),null,now())
  on conflict(parent_user_id,student_id) do update set relationship=excluded.relationship,status='active',link_method='explorer_code_and_pin',
    approved_at=now(),approved_by=auth.uid(),ended_at=null,updated_at=now() returning id into v_link_id;
  insert into public.parent_link_attempts(parent_user_id,code_fingerprint,outcome)
  values(auth.uid(),encode(extensions.digest(public.normalise_explorer_code(p_explorer_code),'sha256'),'hex'),'linked');
  insert into public.student_identity_audit_events(actor_user_id,action,student_id,after_state)
  values(auth.uid(),'parent_linked',v_student_id,jsonb_build_object('linkId',v_link_id,'relationship',p_relationship,'method','explorer_code_and_pin'));
  return v_preview||jsonb_build_object('linked',true,'linkId',v_link_id);
end;
$$;

-- Attribute activity to the school/class that owned the child when the event
-- occurred, not only to the child's current school after a transfer.
create or replace function public.student_belonged_to_school_at(
  p_student_id uuid,
  p_school_id uuid,
  p_occurred_at timestamptz,
  p_class_id uuid default null
)
returns boolean language sql stable security definer set search_path=public as $$
  select
    exists(select 1 from public.classes class where class.id=p_class_id and class.school_id=p_school_id)
    or exists(select 1 from public.class_enrollments enrolment join public.classes class on class.id=enrolment.class_id
      where enrolment.student_id=p_student_id and class.school_id=p_school_id
        and enrolment.enrolled_at<=p_occurred_at and (enrolment.ended_at is null or enrolment.ended_at>=p_occurred_at))
    or exists(select 1 from public.student_school_memberships membership
      where membership.student_id=p_student_id and membership.school_id=p_school_id
        and membership.starts_at<=p_occurred_at and (membership.ended_at is null or membership.ended_at>=p_occurred_at));
$$;
revoke all on function public.student_belonged_to_school_at(uuid,uuid,timestamptz,uuid) from public,anon,authenticated;

do $$
begin
  if to_regprocedure('public.get_platform_admin_school_detail_pa4_internal(uuid)') is null then
    if to_regprocedure('public.get_platform_admin_school_detail(uuid)') is null then
      raise exception 'PA4 school detail implementation is missing';
    end if;
    alter function public.get_platform_admin_school_detail(uuid)
      rename to get_platform_admin_school_detail_pa4_internal;
  end if;
end;
$$;
revoke all on function public.get_platform_admin_school_detail_pa4_internal(uuid) from public,anon,authenticated;

create or replace function public.get_platform_admin_school_detail(p_school_id uuid)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare
  v_result jsonb;
  v_activity jsonb;
  v_today_start timestamptz := date_trunc('day', timezone('Australia/Melbourne', now())) at time zone 'Australia/Melbourne';
  v_week_start timestamptz := date_trunc('week', timezone('Australia/Melbourne', now())) at time zone 'Australia/Melbourne';
begin
  if not public.is_platform_owner() then raise exception 'Platform owner access required' using errcode='42501'; end if;
  v_result:=public.get_platform_admin_school_detail_pa4_internal(p_school_id);
  select jsonb_build_object(
    'activeToday',count(distinct lesson.student_id) filter(where lesson.completed_at>=v_today_start),
    'activeThisWeek',count(distinct lesson.student_id) filter(where lesson.completed_at>=v_week_start),
    'lessonsThisWeek',count(*) filter(where lesson.completed_at>=v_week_start),
    'quizzesThisWeek',(select count(*) from public.student_weekly_quiz_attempts quiz
      where quiz.completed_at>=v_week_start
        and public.student_belonged_to_school_at(quiz.student_id,p_school_id,quiz.completed_at,quiz.class_id)),
    'assessmentsThisWeek',(select count(*) from public.student_realm_assessments assessment
      where assessment.completed_at>=v_week_start
        and public.student_belonged_to_school_at(assessment.student_id,p_school_id,assessment.completed_at,assessment.class_id)),
    'lastActive',max(lesson.completed_at)
  ) into v_activity
  from public.student_lesson_attempts lesson
  where public.student_belonged_to_school_at(lesson.student_id,p_school_id,lesson.completed_at,lesson.class_id);
  return jsonb_set(v_result,'{activity}',coalesce(v_activity,'{}'::jsonb),true);
end;
$$;

grant execute on function public.request_student_identity_merge(uuid,uuid,text) to authenticated;
grant execute on function public.resolve_student_identity_merge(uuid,boolean,text) to authenticated;
grant execute on function public.preview_parent_child_link(text) to authenticated;
grant execute on function public.confirm_parent_child_link(text,text,text) to authenticated;
grant execute on function public.get_platform_admin_school_detail(uuid) to authenticated;

commit;
