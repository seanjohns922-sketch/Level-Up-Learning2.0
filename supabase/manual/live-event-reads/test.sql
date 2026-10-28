-- Appended after the migration inside a local-only rollback transaction.
select set_config('test.class_id', :'class_id', true);
select set_config('test.student_id', :'student_id', true);
select set_config('test.other_student_id', :'other_student_id', true);
insert into public.schools(id,name,school_code,status)
values ('00000000-0000-0000-0000-000000009001','Synthetic unrelated school','EVTEST01','active');
insert into public.classes(id,name,code,class_code,school_id,teacher_id,status) values
('00000000-0000-0000-0000-000000009002','Synthetic unrelated class','EVTEST02','EVTEST02','00000000-0000-0000-0000-000000009001',:'teacher_id','active'),
('00000000-0000-0000-0000-000000009003','Synthetic legacy class','EVTEST03','EVTEST03',null,:'teacher_id','active');
insert into public.live_activity_events(student_id,class_id,event_type,created_at,payload)
select case when n%2=0 then :'student_id'::uuid else :'other_student_id'::uuid end,
       :'class_id', case when n%3=0 then 'answer_correct' else 'question_loaded' end,
       '2026-01-01'::timestamptz+n*interval '1 second', jsonb_build_object('synthetic',true,'sequence',n)
from generate_series(1,5000)n;
insert into public.live_activity_events(student_id,class_id,event_type,payload) values
(:'student_id','00000000-0000-0000-0000-000000009002','question_loaded','{"synthetic":true}'),
(:'student_id','00000000-0000-0000-0000-000000009003','question_loaded','{"synthetic":true}');

create function pg_temp.assert_event_access(class_id uuid, allowed boolean) returns void
language plpgsql security invoker as $$
declare direct_rows jsonb; rpc_rows jsonb;
begin
  select coalesce(jsonb_agg(to_jsonb(e) order by e.id),'[]') into direct_rows
  from public.live_activity_events e where e.class_id=assert_event_access.class_id;
  if allowed then
    select coalesce(jsonb_agg(to_jsonb(e) order by e.id),'[]') into rpc_rows
    from public.get_live_class_events_secure(class_id) e;
    assert rpc_rows=direct_rows, 'RPC must return exactly the same authorized events';
    assert jsonb_array_length(rpc_rows)>0, 'Allowed fixture must have evidence';
  else
    assert jsonb_array_length(direct_rows)=0, 'Direct RLS must deny the fixture';
    begin
      perform * from public.get_live_class_events_secure(class_id);
      raise exception 'Expected RPC access denial';
    exception when insufficient_privilege then null;
    end;
  end if;
end $$;

set local role authenticated;
select set_config('request.jwt.claim.sub', :'teacher_id', true);
select pg_temp.assert_event_access(:'class_id',true);
select pg_temp.assert_event_access('00000000-0000-0000-0000-000000009002',false);
select pg_temp.assert_event_access('00000000-0000-0000-0000-000000009003',true);
do $$
declare original_ids uuid[]; optimized_ids uuid[]; c uuid:=current_setting('test.class_id')::uuid; s uuid:=current_setting('test.student_id')::uuid;
begin
 select array_agg(id order by created_at desc) into original_ids from
 (select id,created_at from public.live_activity_events where class_id=c and student_id=s order by created_at desc limit 15)e;
 select array_agg(id order by created_at desc) into optimized_ids from public.get_live_class_events_secure(c,array[s],null,true,15);
 assert original_ids=optimized_ids, 'Latest 15 timeline ordering/filter parity';
 select array_agg(id order by created_at) into original_ids from
 (select id,created_at from public.live_activity_events where class_id=c and student_id=s and event_type='answer_correct' order by created_at limit 1000)e;
 select array_agg(id order by created_at) into optimized_ids from
 (select id,created_at from public.get_live_class_events_secure(c,array[s],array['answer_correct']) order by created_at limit 1000)e;
 assert original_ids=optimized_ids, 'Dashboard ordering/filter and outer-cap parity';
 assert (select count(*)=0 from public.get_live_class_events_secure(c,'{}'::uuid[])), 'Empty student list cannot mean all students';
 assert (select count(*)=0 from public.get_live_class_events_secure(c,null,'{}'::text[])), 'Empty event list cannot mean all events';
 assert (select count(*)=0 from public.get_live_class_events_secure(c,null,null,false,0)), 'Zero limit';
 begin
  perform * from public.get_live_class_events_secure(c,null,null,false,-1);
  raise exception 'Expected negative limit rejection';
 exception when invalid_parameter_value then null; end;
end $$;
reset role;
-- Support staff retain access only through their existing active class assignment.
update public.school_memberships set role='support_staff' where school_id=:'school_id' and user_id=:'teacher_id';
set local role authenticated;
select pg_temp.assert_event_access(:'class_id',true);
reset role;
update public.class_staff_memberships set status='inactive' where class_id=:'class_id' and user_id=:'teacher_id';
set local role authenticated;
select pg_temp.assert_event_access(:'class_id',false);
reset role;
update public.school_memberships set role='principal' where school_id=:'school_id' and user_id=:'teacher_id';
set local role authenticated;
select pg_temp.assert_event_access(:'class_id',true);
reset role;
update public.school_memberships set role='school_admin' where school_id=:'school_id' and user_id=:'teacher_id';
set local role authenticated;
select pg_temp.assert_event_access(:'class_id',true);
reset role;
update public.school_memberships set status='inactive' where school_id=:'school_id' and user_id=:'teacher_id';
set local role authenticated;
select pg_temp.assert_event_access(:'class_id',false);
reset role;
insert into public.platform_roles(user_id,role,status) values(:'teacher_id','platform_admin','active');
set local role authenticated;
select pg_temp.assert_event_access('00000000-0000-0000-0000-000000009002',true);
select set_config('request.jwt.claim.sub','',true);
do $$ begin
 begin
  perform * from public.get_live_class_events_secure(current_setting('test.class_id')::uuid);
  raise exception 'Expected missing user denial';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$ begin
 assert not has_function_privilege('anon','public.get_live_class_events_secure(uuid,uuid[],text[],boolean,integer)','execute'), 'Anon must have no execute grant';
end $$;
