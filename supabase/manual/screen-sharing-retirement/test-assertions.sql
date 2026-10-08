-- LOCAL DISPOSABLE DATABASE ONLY; after test-fixture.sql and prepare.sql.
set role authenticated;
set test.teacher = 'allowed';
set test.topic = 'live-class-11111111-1111-1111-1111-111111111111';
do $$ begin
  if (select count(*) from realtime.messages) <> 1 then raise exception 'Allowed class cannot receive'; end if;
  begin
    insert into realtime.messages values (2, 'broadcast');
    raise exception 'Publishing unexpectedly allowed';
  exception when insufficient_privilege then null; end;
end $$;
set test.topic = 'live-class-22222222-2222-2222-2222-222222222222';
do $$ begin if exists(select from realtime.messages) then raise exception 'Wrong class readable'; end if; end $$;
set test.topic = 'live-class-not-a-uuid';
do $$ begin if exists(select from realtime.messages) then raise exception 'Malformed topic readable'; end if; end $$;
set test.topic = 'screen-synthetic-student';
do $$ begin
  if exists(select from realtime.messages) then raise exception 'Retired screen readable'; end if;
  begin
    insert into realtime.messages values (3, 'broadcast');
    raise exception 'Screen publishing unexpectedly allowed';
  exception when insufficient_privilege then null; end;
end $$;
set test.topic = 'unrelated-public-topic';
do $$ begin if exists(select from realtime.messages) then raise exception 'Broad legacy policy bypass'; end if; end $$;
set test.topic = 'live-class-11111111-1111-1111-1111-111111111111';
set test.teacher = 'revoked';
do $$ begin if exists(select from realtime.messages) then raise exception 'Revoked teacher readable'; end if; end $$;
set role anon;
set test.teacher = 'allowed';
do $$ begin
  if exists(select from realtime.messages) then raise exception 'Anon can read live class'; end if;
  begin
    insert into realtime.messages values (4, 'broadcast');
    raise exception 'Anon publishing unexpectedly allowed';
  exception when insufficient_privilege then null; end;
end $$;
set test.topic = 'screen-synthetic-student';
do $$ begin if exists(select from realtime.messages) then raise exception 'Anon screen readable'; end if; end $$;
reset role;
select 'PASS: private-topic row policies deny screens, publishing, wrong-class, revoked and anonymous reads even with a broad legacy policy; allowed class reads survive' as result;
