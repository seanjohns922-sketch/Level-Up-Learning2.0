-- Synthetic fixtures only. Always rolls back.
begin;
set local statement_timeout='30s';
set local lock_timeout='5s';
create function pg_temp.check_true(ok boolean,label text) returns void language plpgsql as $$begin if ok is distinct from true then raise exception 'FAIL: %',label; end if; raise notice 'PASS: %',label; end$$;
-- All identities and activity below are synthetic, uncommitted and rolled back.
create temporary table verify_ids as select gen_random_uuid() parent_id;
insert into auth.users(id,email,aud,role,raw_user_meta_data)
select parent_id,'chance-verify-'||parent_id||'@example.invalid','authenticated','authenticated','{"role":"parent"}'::jsonb from verify_ids;
insert into public.user_profiles(user_id,email,display_name,status)
select parent_id,'chance-verify-'||parent_id||'@example.invalid','Synthetic Chance Hollow Verification','active' from verify_ids
on conflict(user_id) do update set status='active';
grant select on verify_ids to authenticated,anon;
do $$begin perform set_config('request.jwt.claim.sub',(select parent_id::text from verify_ids),true); perform set_config('request.jwt.claims',jsonb_build_object('sub',(select parent_id from verify_ids),'user_metadata',jsonb_build_object('role','parent'))::text,true);end$$;
set local role authenticated;
create temporary table verify_student as select public.create_home_student_for_parent('Synthetic','Chance Hollow Verification','Prep','Prep','2468') result;
grant select on verify_student to anon;
do $$begin perform set_config('request.headers',jsonb_build_object('x-student-session',(select session_token from public.home_student_login_lookup((select result->>'username' from verify_student),'2468') limit 1))::text,true); perform set_config('request.jwt.claim.sub','',true); perform set_config('request.jwt.claims','{}',true);end$$;
set local role anon;

reset role;
create temporary table verify_class as select gen_random_uuid() id;
insert into public.classes(id,name,code) select id,'Synthetic release check','REL-'||left(id::text,12) from verify_class;
update public.students set class_id=(select id from verify_class) where id=(select (result->>'studentId')::uuid from verify_student);
create temporary table verify_sitting as select gen_random_uuid() id;
grant select on verify_sitting to anon;
insert into public.whole_math_diagnostic_sittings(id,student_id,class_id,checkpoint)
select v.id,(s.result->>'studentId')::uuid,c.id,'start' from verify_sitting v,verify_student s,verify_class c;
insert into public.whole_math_diagnostic_school_sessions(class_id,checkpoint,academic_year,opened_by,closes_at)
select c.id,'start',extract(year from now())::integer,i.parent_id,now()+interval '1 hour' from verify_class c,verify_ids i;
insert into public.whole_math_diagnostic_strand_results(sitting_id,student_id,strand,realm_id,status,starting_level,placement_protected)
select v.id,(s.result->>'studentId')::uuid,r,case when r='algebra' then 'pattern' when r='probability' then 'chance' else r end,'pending','Year 6',true from verify_sitting v,verify_student s,unnest(array['number','measurement','space','statistics','algebra','probability']) r;
update public.whole_math_diagnostic_strand_results set starting_level='Year 6' where sitting_id=(select id from verify_sitting);
set local role anon;
select pg_temp.check_true((select chance_release_version=1 and pattern_release_version=1 and statistics_release_version=1 and space_release_version=1 and measurement_release_version=1 and number_maximum_level=8 and access_open from public.get_pending_whole_math_diagnostic_chance_full((select (result->>'studentId')::uuid from verify_student))), 'Anon student login returns all released banks and an open session');
do $$declare r text; probes jsonb; output jsonb; sid uuid:=(select (result->>'studentId')::uuid from verify_student); sitting uuid:=(select id from verify_sitting);begin
 for r in select unnest(array['number','measurement','space','statistics','algebra','probability']) loop
  perform public.save_whole_math_diagnostic_progress(sid,sitting,r,'Year 8','{"sample":"saved"}'::jsonb,'[]'::jsonb,29);
  select jsonb_agg(jsonb_build_object('level','Year '||n,'score',case when n=8 then 18 when n=7 then 30 else 20 end,'total',case when n>=7 then 30 else 20 end,'questionIds',(select jsonb_agg(r||'-'||n||'-'||q) from generate_series(1,case when n>=7 then 30 else 20 end) q),'curriculumCodes','[]'::jsonb) order by n) into probes from generate_series(6,8) n;
  output:=public.complete_whole_math_diagnostic_strand(sid,sitting,r,probes);
  perform pg_temp.check_true((output->>'measured_level')::numeric>7,r||' student completion accepts 20/30/30 probes through Level 8');
 end loop;
end$$;
-- Reject missing and cross-student session headers under the actual anon role.
do $$declare headers text:=current_setting('request.headers',true); sid uuid:=(select (result->>'studentId')::uuid from verify_student); denied boolean:=false;begin
 perform set_config('request.headers','{}',true);
 begin perform public.get_pending_whole_math_diagnostic_chance_full(sid); exception when insufficient_privilege then denied:=true; end;
 perform pg_temp.check_true(denied,'Missing student session rejected');
 denied:=false;begin perform public.complete_chance_extension_assessment(sid,'pretest',gen_random_uuid(),'{}'::jsonb); exception when insufficient_privilege then denied:=true;end;
 perform pg_temp.check_true(denied,'Extension rejects missing student session');
 perform set_config('request.headers',headers,true);denied:=false;
 begin perform public.get_pending_whole_math_diagnostic_chance_full(gen_random_uuid()); exception when insufficient_privilege then denied:=true; end;
 perform pg_temp.check_true(denied,'Cross-student session rejected');
 denied:=false;begin perform public.complete_chance_extension_assessment(gen_random_uuid(),'pretest',gen_random_uuid(),'{}'::jsonb); exception when insufficient_privilege then denied:=true;end;
 perform pg_temp.check_true(denied,'Extension rejects cross-student access');
end$$;
reset role;

-- New cycles use the release; older cycles keep their pinned bank.
create temporary table legacy_cycle as select gen_random_uuid() id;
insert into public.whole_math_diagnostic_sittings(id,student_id,class_id,checkpoint,academic_year)
select l.id,(s.result->>'studentId')::uuid,c.id,'start',extract(year from now())::integer-1 from legacy_cycle l,verify_student s,verify_class c;
update public.whole_math_diagnostic_sittings set chance_release_version=0 where id=(select id from legacy_cycle);
insert into public.whole_math_diagnostic_sittings(student_id,class_id,checkpoint,academic_year)
select (s.result->>'studentId')::uuid,c.id,'mid',extract(year from now())::integer-1 from verify_student s,verify_class c;
select pg_temp.check_true((select bool_and(chance_release_version=0) from public.whole_math_diagnostic_sittings where student_id=(select (result->>'studentId')::uuid from verify_student) and academic_year=extract(year from now())::integer-1),'Existing academic-year bank remains pinned');

-- Primary-level pre/post evidence uses the existing student-authorised save path.
set local role anon;
do $$declare sid uuid:=(select (result->>'studentId')::uuid from verify_student); cid uuid; n integer; form text; attempt jsonb; completion uuid;begin
 select class_id into cid from public.get_student_runtime_context_secure(sid) limit 1;
 for n in 3..6 loop
  foreach form in array array['pretest','posttest'] loop
   select jsonb_build_object('correct_count',12,'total_questions',20,'score_percent',60,'question_results',jsonb_agg(jsonb_build_object('question_id','y'||n||'-chance-'||form||'-'||lpad(q::text,2,'0')||'-v1','question_number',q,'correct',q<=12,'student_answer',jsonb_build_object('choice','option-0','values','[]'::jsonb,'touched',true)))) into attempt from generate_series(1,20) q;
   completion:=gen_random_uuid();
   perform pg_temp.check_true(public.complete_realm_assessment(sid,cid,'chance','year'||n||'-chance','Year 6','Year '||n,form,completion,attempt,'{"status":"ASSIGNED_PROGRAM","placement_complete":true,"current_week":1,"assigned_week":1,"required_weeks":[1,2,3,4,5,6]}'::jsonb),'Chance Hollow Level '||n||' '||form||' saves through student session');
  end loop;
 end loop;
end$$;
reset role;

-- Extension attempts save their evidence without moving the student into nonexistent weekly programs.
update public.student_realm_progress set is_current=false where student_id=(select (result->>'studentId')::uuid from verify_student) and realm_id='chance';
insert into public.student_realm_progress(student_id,class_id,realm_id,program_key,school_year_level,working_level,is_current,status)
select (s.result->>'studentId')::uuid,c.id,'chance','year6-chance','Year 6','Year 6',true,'ASSIGNED_PROGRAM' from verify_student s,verify_class c
on conflict(student_id,realm_id,working_level) do update set is_current=true;
set local role anon;
do $$declare sid uuid:=(select (result->>'studentId')::uuid from verify_student); n integer; form text; attempt jsonb; completion uuid;begin
 for n in 7..8 loop
  foreach form in array array['pretest','posttest'] loop
   select jsonb_build_object('working_level','Year '||n,'total_questions',30,'correct_count',18,'question_results',jsonb_agg(jsonb_build_object('question_id','y'||n||'-chance-'||form||'-'||lpad(q::text,2,'0')||'-v1','question_number',q,'correct',q<=18,'student_answer',jsonb_build_object('selected',jsonb_build_array('o1'))))) into attempt from generate_series(1,30) q;
   completion:=gen_random_uuid();
   perform pg_temp.check_true(public.complete_chance_extension_assessment(sid,form,completion,attempt),'Chance Hollow Level '||n||' '||form||' saves through student session');
   perform pg_temp.check_true(not public.complete_chance_extension_assessment(sid,form,completion,attempt),'Extension duplicate completion is idempotent');
  end loop;
  perform pg_temp.check_true((select count(*)=2 from public.get_student_realm_assessments_secure(sid,'chance','Year '||n)),'Extension history returns pre and post for Level '||n);
 end loop;
 perform pg_temp.check_true((select working_level='Year 6' from public.get_student_realm_progress_compat_secure(sid,'chance') where is_current),'Extension leaves weekly placement unchanged');

end$$;
reset role;

select pg_temp.check_true((select checkpoint_level>7 and official_level>7 from public.student_live_maths_progression where student_id=(select (result->>'studentId')::uuid from verify_student) and realm_id='chance'),'Chance tracker retains Level 7–8 diagnostic results');
rollback;
