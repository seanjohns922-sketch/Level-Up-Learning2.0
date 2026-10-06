-- Run inside a rollback-only transaction. No real student's diagnostic changes.
do $$
declare sid uuid:=gen_random_uuid(); cid uuid; school uuid; teacher uuid; sitting uuid:=gen_random_uuid();
 token text:=encode(extensions.gen_random_bytes(32),'hex'); strand text; realm text;
 followup_score integer:=coalesce(nullif(current_setting('test.followup_score',true),''),'6')::integer;
 ids6 jsonb; ids7 jsonb; probes jsonb; result jsonb; rejected boolean; n integer;
begin
 select s.class_id,s.school_id,p.placement_assigned_by into strict cid,school,teacher
 from students s join student_realm_placement p on p.student_id=s.id where s.class_id is not null and p.placement_assigned_by is not null limit 1;
 insert into students(id,class_id,school_id,display_name,first_name,last_name,year_level,school_year_level,has_seen_intro)
 values(sid,cid,school,'Diagnostic rollback audit','Diagnostic','audit','Year 6','Year 6',true);
 insert into student_access_sessions(student_id,token_hash,expires_at) values(sid,encode(extensions.digest(token,'sha256'),'hex'),now()+interval '15 minutes');
 insert into whole_math_diagnostic_school_sessions(class_id,checkpoint,academic_year,opened_by,closes_at)
 values(cid,'start',extract(year from current_date)::int,teacher,now()+interval '15 minutes');
 insert into whole_math_diagnostic_sittings(id,student_id,class_id,checkpoint,initiated_by) values(sitting,sid,cid,'start',teacher);
 foreach strand in array array['number','measurement','space','algebra','statistics','probability'] loop
  realm:=case strand when 'algebra' then 'pattern' when 'probability' then 'chance' else strand end;
  insert into student_realm_progress(student_id,class_id,realm_id,program_key,school_year_level,working_level,is_current,status,current_week,assigned_week,placement_complete)
  values(sid,cid,realm,public.realm_program_key('Year 6',realm),'Year 6','Year 6',true,'ASSIGNED_PROGRAM',1,1,true);
  insert into whole_math_diagnostic_strand_results(sitting_id,student_id,strand,realm_id,status,starting_level) values(sitting,sid,strand,realm,'pending','Year 6');
 end loop;
 perform set_config('request.jwt.claims','{}',true);
 perform set_config('request.headers',jsonb_build_object('x-student-session',token)::text,true);
 foreach strand in array array['number','measurement','space','algebra','statistics','probability'] loop
  realm:=case strand when 'algebra' then 'pattern' when 'probability' then 'chance' else strand end;
  select jsonb_agg('audit-y6-'||x) into ids6 from generate_series(1,20) x;
  select jsonb_agg('audit-y7-'||x) into ids7 from generate_series(1,30) x;
  probes:=jsonb_build_array(jsonb_build_object('level','Year 6','score',17,'total',20,'questionIds',ids6));
  set local role anon;
  -- Exactly 85% must require the next level, not finish at Level 6.
  rejected:=false;
  begin perform public.complete_whole_math_diagnostic_strand(sid,sitting,strand,probes);exception when others then rejected:=true;end;
  if not rejected then raise exception 'Stopped at mastered Level 6 for %',strand;end if;
  perform public.save_whole_math_diagnostic_progress(sid,sitting,strand,'Year 7','{}',probes,0);
  probes:=probes||jsonb_build_array(jsonb_build_object('level','Year 7','score',followup_score,'total',30,'questionIds',ids7));
  result:=public.complete_whole_math_diagnostic_strand(sid,sitting,strand,probes);
  reset role;
  if followup_score < 6 then
   if result->>'recommended_level'<>'Year 6' or (result->>'placement_applied')::boolean then raise exception 'Below 20 percent incorrectly promoted %',strand;end if;
   if not exists(select 1 from student_realm_progress where student_id=sid and realm_id=realm and working_level='Year 6' and is_current) then raise exception 'Lost existing Level 6 programme';end if;
  else
   if result->>'recommended_level'<>'Year 7' or not (result->>'placement_applied')::boolean then raise exception 'Level 7 placement failed %: %',strand,result;end if;
   n:=public.realm_program_week_count(realm,'Year 7');
   if not exists(select 1 from student_realm_progress where student_id=sid and realm_id=realm and working_level='Year 7' and is_current and placement_complete and jsonb_array_length(required_weeks)=n) then raise exception 'Wrong programme weeks %',realm;end if;
   if not exists(select 1 from student_realm_placement where student_id=sid and realm_id=realm and assigned_start_level='Year 7') then raise exception 'Missing expedition placement %',realm;end if;
   if not public.realm_week_is_playable(sid,realm,'Year 7',public.realm_program_key('Year 7',realm),1) or public.realm_week_is_playable(sid,realm,'Year 7',public.realm_program_key('Year 7',realm),2) then raise exception 'Incorrect cavern week access %',realm;end if;
   set local role anon;
   if not exists(select 1 from public.get_student_expedition_placements_secure(sid) where realm_id=realm and assigned_start_level='Year 7') then raise exception 'Student cannot read expedition placement';end if;
   reset role;
   perform set_config('request.jwt.claims',jsonb_build_object('sub',teacher,'role','authenticated')::text,true);
   set local role authenticated;
   if not exists(select 1 from public.get_class_realm_progress_compat(cid,realm,'Year 7') where student_id=sid and assigned_week=1) then raise exception 'Teacher cannot see earned Level 7 placement';end if;
   reset role;
   perform set_config('request.jwt.claims','{}',true);
  end if;
 end loop;
 set local role anon;
 rejected:=false;
 begin perform public.complete_whole_math_diagnostic_strand(gen_random_uuid(),sitting,'number','[]');exception when others then rejected:=true;end;
 if not rejected then raise exception 'Cross-student diagnostic accepted';end if;
 perform set_config('request.headers','{}',true);
 rejected:=false;
 begin perform public.complete_whole_math_diagnostic_strand(sid,sitting,'number','[]');exception when others then rejected:=true;end;
 if not rejected then raise exception 'Missing session accepted';end if;
 reset role;
 raise notice 'Six realms: Level 6 mastery -> Level 7 assessment -> live placement and correct locked cave weeks passed';
end $$;
