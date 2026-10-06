-- Run in a transaction (the audit runner always rolls back). Creates only a temporary
-- synthetic student. All saving RPCs run as anon with a valid student-session header.
do $$
declare
 sid uuid := gen_random_uuid(); cid uuid; school uuid; teacher uuid;
 token text := encode(extensions.gen_random_bytes(32),'hex');
 realm text; n integer; w integer; l integer; key uuid; ok boolean;
 weeks jsonb; row_count integer; actual integer; snapshot_count integer;
 legacy integer; rejected boolean;
begin
 select s.class_id,s.school_id,p.placement_assigned_by into strict cid,school,teacher
 from public.students s join public.student_realm_placement p on p.student_id=s.id and p.realm_id='number'
 where s.class_id is not null and p.placement_assigned_by is not null
 order by s.id limit 1;
 insert into public.students(id,class_id,school_id,display_name,first_name,last_name,year_level,school_year_level,has_seen_intro)
 values(sid,cid,school,'Level 7 rollback audit','Level 7','rollback audit','Year 7','Year 7',true);
 insert into public.student_access_sessions(student_id,token_hash,expires_at)
 values(sid,encode(extensions.digest(token,'sha256'),'hex'),now()+interval '15 minutes');
 perform set_config('request.jwt.claims','{}',true);
 perform set_config('request.headers',jsonb_build_object('x-student-session',token)::text,true);
 foreach realm in array array['number','measurement','space','pattern','statistics','chance'] loop
  n:=case when realm in ('number','measurement','pattern') then 12 when realm in ('space','statistics') then 10 else 8 end;
  legacy:=case when realm='number' then 12 when realm in ('measurement','space','pattern') then 8 else 6 end;
  if public.realm_program_week_count(realm,'Year 7')<>n or public.realm_program_week_count(realm,'Year 6')<>legacy or public.realm_program_week_count(realm,'Prep')<>legacy then raise exception 'Week count mismatch %',realm;end if;
  select jsonb_agg(x order by x) into weeks from generate_series(1,n) x;
  insert into public.student_realm_progress(student_id,class_id,realm_id,program_key,school_year_level,working_level,is_current,status,current_week,assigned_week,placement_complete,required_weeks,optional_weeks)
  values(sid,cid,realm,public.realm_program_key('Year 7',realm),'Year 7','Year 7',true,'ASSIGNED_PROGRAM',1,1,true,weeks,'[]');
  -- A low pre-test must assign the complete Level 7 programme, not legacy lengths.
  set local role anon;
  perform public.complete_realm_assessment(sid,cid,realm,public.realm_program_key('Year 7',realm),'Year 7','Year 7','pretest',gen_random_uuid(),'{"score_percent":40,"correct_count":12,"total_questions":30,"passed":false}',jsonb_build_object('status','ASSIGNED_PROGRAM','placement_complete',true));
  reset role;
  if (select required_weeks from public.student_realm_progress where student_id=sid and realm_id=realm and is_current)<>weeks then raise exception 'Pre-test length mismatch %',realm;end if;
  -- Future weeks and out-of-order lessons cannot save even when called directly.
  rejected:=false;set local role anon;
  begin
   perform public.complete_realm_lesson(sid,cid,realm,public.realm_program_key('Year 7',realm),'Year 7','Year 7',2,1,'audit-locked',gen_random_uuid(),'{"completed":true,"questionsAnswered":5,"correctAnswers":5}',0);
  exception when others then rejected:=true;end;
  reset role;if not rejected then raise exception 'Locked week accepted %',realm;end if;
  for w in 1..n loop
   if not public.realm_week_is_playable(sid,realm,'Year 7',public.realm_program_key('Year 7',realm),w) then raise exception 'Expected week % open for %',w,realm;end if;
   rejected:=false;set local role anon;
   begin
    perform public.complete_realm_quiz(sid,cid,realm,public.realm_program_key('Year 7',realm),'Year 7','Year 7',w,'audit-quiz',gen_random_uuid(),'{"score":15,"total":15,"percent":100,"passed":true}',0);
   exception when others then rejected:=true;end;
   reset role;if not rejected then raise exception 'Quiz before lessons accepted % week %',realm,w;end if;
   for l in 1..3 loop
    key:=gen_random_uuid();set local role anon;
    ok:=public.complete_realm_lesson(sid,cid,realm,public.realm_program_key('Year 7',realm),'Year 7','Year 7',w,l,format('audit-%s-w%s-l%s',realm,w,l),key,'{"completed":true,"questionsAnswered":5,"correctAnswers":4,"accuracy":80}',0);
    if not ok then raise exception 'First lesson completion rejected';end if;
    ok:=public.complete_realm_lesson(sid,cid,realm,public.realm_program_key('Year 7',realm),'Year 7','Year 7',w,l,format('audit-%s-w%s-l%s',realm,w,l),key,'{"completed":true,"questionsAnswered":5,"correctAnswers":4,"accuracy":80}',0);
    if ok then raise exception 'Duplicate completion rewarded';end if;
    reset role;
   end loop;
   if w<n then
    set local role anon;
    perform public.complete_realm_quiz(sid,cid,realm,public.realm_program_key('Year 7',realm),'Year 7','Year 7',w,'audit-quiz',gen_random_uuid(),'{"score":11,"total":15,"percent":73,"passed":false}',0);
    reset role;
    if public.realm_week_is_playable(sid,realm,'Year 7',public.realm_program_key('Year 7',realm),w+1) then raise exception 'Failed quiz unlocked next week';end if;
    set local role anon;
    perform public.complete_realm_quiz(sid,cid,realm,public.realm_program_key('Year 7',realm),'Year 7','Year 7',w,'audit-quiz',gen_random_uuid(),'{"score":12,"total":15,"percent":80,"passed":true}',0);
    reset role;
    select assigned_week into actual from public.student_realm_progress where student_id=sid and realm_id=realm and working_level='Year 7';
    if actual<>w+1 then raise exception 'Assignment failed % week % got %',realm,w,actual;end if;
   end if;
  end loop;
  select count(*) into row_count from public.student_lesson_attempts where student_id=sid and realm_id=realm and working_level='Year 7';
  if row_count<>n*3 then raise exception 'Lesson persistence count mismatch %',realm;end if;
  select count(*) into row_count from public.student_weekly_quiz_attempts where student_id=sid and realm_id=realm and working_level='Year 7';
  if row_count<>(n-1)*2 then raise exception 'Quiz persistence count mismatch %',realm;end if;
  if not exists(select 1 from public.student_live_maths_progression where student_id=sid and realm_id=realm and current_working_level='Year 7') then raise exception 'Teacher live progress missing %',realm;end if;
  -- Restore the student snapshot under the real student role.
  set local role anon;
  select count(*) into snapshot_count from public.get_student_realm_progress_compat_secure(sid,realm) where working_level='Year 7';
  reset role;if snapshot_count<>1 then raise exception 'Student reload failed %',realm;end if;
  -- The same teacher-facing snapshot must expose the current programme.
  perform set_config('request.jwt.claims',jsonb_build_object('sub',teacher,'role','authenticated')::text,true);
  set local role authenticated;
  select count(*) into snapshot_count from public.get_class_realm_progress_compat(cid,realm,'Year 7') where student_id=sid and assigned_week=n;
  reset role;perform set_config('request.jwt.claims','{}',true);
  if snapshot_count<>1 then raise exception 'Teacher snapshot failed %',realm;end if;
  set local role anon;
  perform public.complete_realm_assessment(sid,cid,realm,public.realm_program_key('Year 7',realm),'Year 7','Year 7','posttest',gen_random_uuid(),'{"score_percent":85,"correct_count":17,"total_questions":20,"passed":true}',jsonb_build_object('status','PASSED','placement_complete',true,'posttest_score',85,'required_weeks',weeks));
  reset role;
  if not exists(select 1 from public.student_realm_assessments where student_id=sid and realm_id=realm and working_level='Year 7' and assessment_type='posttest' and score_percent=85) then raise exception 'Post-test not saved %',realm;end if;
  -- Teacher advancement must work beyond the old six/eight-week boundary.
  update public.student_realm_progress set status='ASSIGNED_PROGRAM',current_week=n-1,assigned_week=n-1 where student_id=sid and realm_id=realm and is_current;
  perform set_config('request.jwt.claims',jsonb_build_object('sub',teacher,'role','authenticated')::text,true);
  set local role authenticated;
  perform public.teacher_advance_student_week(sid,realm,'Year 7',n-1,'technical_issue','Release regression audit');
  reset role;perform set_config('request.jwt.claims','{}',true);
  if (select assigned_week from public.student_realm_progress where student_id=sid and realm_id=realm and is_current)<>n then raise exception 'Teacher final-week advance failed %',realm;end if;
  raise notice 'PASS %: % weeks, all lessons, fail/pass quiz gates, replay safety, student reload, teacher snapshot, final post-test',realm,n;
 end loop;
end $$;
