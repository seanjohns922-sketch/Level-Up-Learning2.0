-- Synthetic student and session: caller must roll back this entire transaction.
do $$
declare sid uuid:=gen_random_uuid(); cid uuid; school uuid; other uuid;
 token text:=encode(extensions.gen_random_bytes(32),'hex'); t timestamptz:=now()-interval '2 minutes'; data jsonb; rejected boolean;
begin
 select id,class_id,school_id into other,cid,school from students where class_id is not null and archived_at is null limit 1;
 insert into students(id,class_id,school_id,display_name,first_name,last_name,year_level,school_year_level,has_seen_intro)
 values(sid,cid,school,'Live presence audit','Live','audit','Year 7','Year 7',true);
 insert into student_access_sessions(student_id,token_hash,expires_at) values(sid,encode(extensions.digest(token,'sha256'),'hex'),now()+interval '15 minutes');
 perform set_config('request.jwt.claims','{}',true);
 perform set_config('request.headers',jsonb_build_object('x-student-session',token)::text,true);
 set local role anon;
 perform public.upsert_live_student_activity_secure(sid,cid,jsonb_build_object('current_level','Year 4','current_lesson','y4-w1-l1','last_active_at',t));
 perform public.touch_live_student_presence_secure(sid,cid);
 -- A delayed Year 7 event must still replace Year 4 after a newer heartbeat.
 perform public.upsert_live_student_activity_secure(sid,cid,jsonb_build_object('current_level','Year 7','current_lesson','y7-w1-l1','last_active_at',t+interval '1 minute','questions_answered',12,'correct_count',10));
 data:=public.get_live_student_activity_secure(sid,cid);
 if data->>'current_level'<>'Year 7' or (data->>'questions_answered')::int<>12 then raise exception 'Heartbeat blocked Level 7 activity';end if;
 if (data->>'last_active_at')::timestamptz < now()-interval '10 seconds' then raise exception 'Activity lost recent presence';end if;
 perform public.upsert_live_student_activity_secure(sid,cid,jsonb_build_object('current_level','Year 4','last_active_at',t));
 data:=public.get_live_student_activity_secure(sid,cid);
 if data->>'current_level'<>'Year 7' then raise exception 'Stale event replaced Level 7';end if;
 rejected:=false;
 begin perform public.touch_live_student_presence_secure(other,cid);exception when others then rejected:=true;end;
 if not rejected then raise exception 'Cross-student presence accepted';end if;
 perform set_config('request.headers','{}',true);
 rejected:=false;
 begin perform public.upsert_live_student_activity_secure(sid,cid,'{}');exception when others then rejected:=true;end;
 if not rejected then raise exception 'Missing session accepted';end if;
 reset role;
 raise notice 'Presence/activity ordering and student access tests passed';
end $$;
