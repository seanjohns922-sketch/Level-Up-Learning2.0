-- Run only in an empty disposable PostgreSQL database. All records are synthetic.
\set ON_ERROR_STOP on
begin;
create role authenticated;
create schema auth;
create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('test.user', true), '')::uuid $$;
create function public.can_manage_school(uuid) returns boolean language sql as $$ select $1 = '00000000-0000-0000-0000-000000000001'::uuid $$;
create table schools(id uuid primary key, name text);
create table students(id uuid primary key default gen_random_uuid(), first_name text, last_name text, display_name text, school_year_level text, year_level text, school_id uuid, archived_at timestamptz, identity_status text, created_at timestamptz default now());
create table student_access_entitlements(student_id uuid, access_source text, status text);
create table student_identity_link_requests(id uuid default gen_random_uuid(), request_type text, requested_by uuid, school_id uuid, status text, reason text, metadata jsonb);
\ir ../../migrations/20261028090000_fix_student_name_matching.sql
revoke all on function public.preview_school_student_creation(uuid,text,text,text) from public;
grant usage on schema public, auth to authenticated;
grant execute on function public.preview_school_student_creation(uuid,text,text,text) to authenticated;
insert into schools values ('00000000-0000-0000-0000-000000000001', 'Test School'), ('00000000-0000-0000-0000-000000000002', 'Test School');
insert into students(first_name,last_name,school_id) values
 ('Jack','Smith','00000000-0000-0000-0000-000000000001'),
 ('ALICE','JONES','00000000-0000-0000-0000-000000000002'),
 ('Anne-Marie','O’Neil','00000000-0000-0000-0000-000000000001'),
 ('Élodie','Durand','00000000-0000-0000-0000-000000000001'),
 ('---','...','00000000-0000-0000-0000-000000000001');
insert into students(display_name,school_id) values ('Legacy Child','00000000-0000-0000-0000-000000000001');
insert into students(first_name,last_name,archived_at) values ('Archived','Child',now());
insert into students(first_name,last_name,identity_status) values ('Merged','Child','merged');
set local role authenticated;
select set_config('test.user','00000000-0000-0000-0000-000000000003',true);
do $$
declare r jsonb; school uuid := '00000000-0000-0000-0000-000000000001';
begin
 r := public.preview_school_student_creation(school,'Mack','Smith','4');
 assert not (r->>'potentialDuplicate')::boolean, 'Different capital initial must not match';
 r := public.preview_school_student_creation(school,'BOB','BROWN','4');
 assert not (r->>'potentialDuplicate')::boolean, 'Unrelated uppercase names must not match';
 r := public.preview_school_student_creation(school,' JACK ','SMITH','4');
 assert jsonb_array_length(r->'candidates') = 1 and (r->'candidates'->0->>'sameSchool')::boolean, 'Case and whitespace match in same school';
 r := public.preview_school_student_creation(school,'alice','jones','4');
 assert jsonb_array_length(r->'candidates') = 1 and not (r->'candidates'->0->>'sameSchool')::boolean, 'Cross-school match retained; same school name is not same school ID';
 r := public.preview_school_student_creation(school,'Anne Marie','ONeil','4');
 assert jsonb_array_length(r->'candidates') = 1, 'Punctuation normalization';
 r := public.preview_school_student_creation(school,'ÉLODIE','DURAND','4');
 assert jsonb_array_length(r->'candidates') = 1, 'International case normalization';
 r := public.preview_school_student_creation(school,'Lodie','Durand','4');
 assert not (r->>'potentialDuplicate')::boolean, 'Accented initial must not disappear';
 r := public.preview_school_student_creation(school,'Legacy','Child','4');
 assert jsonb_array_length(r->'candidates') = 1, 'Display-name fallback';
 r := public.preview_school_student_creation(school,'Archived','Child','4');
 assert not (r->>'potentialDuplicate')::boolean, 'Archived excluded';
 r := public.preview_school_student_creation(school,'Merged','Child','4');
 assert not (r->>'potentialDuplicate')::boolean, 'Merged excluded';
 r := public.preview_school_student_creation(school,'---','...','4');
 assert not (r->>'potentialDuplicate')::boolean, 'Empty normalized names must not match';
 r := public.preview_school_student_creation(school,'','Smith','4');
 assert not (r->>'potentialDuplicate')::boolean, 'Blank names';
 begin
  perform public.preview_school_student_creation('00000000-0000-0000-0000-000000000002','Jack','Smith','4');
  raise exception 'Expected school access denial';
 exception when insufficient_privilege then null;
 end;
 perform set_config('test.user','',true);
 begin
  perform public.preview_school_student_creation(school,'Jack','Smith','4');
  raise exception 'Expected missing user denial';
 exception when insufficient_privilege then null;
 end;
end $$;
reset role;
do $$ begin
 assert (select count(*) = 5 from student_identity_link_requests), 'Only genuine possible matches create review requests';
 assert not exists(select 1 from student_identity_link_requests where status <> 'pending' or request_type <> 'duplicate_review' or jsonb_array_length(metadata->'candidateIds') <> 1), 'Review metadata preserved';
end $$;
rollback;
\echo 'Student-name matching regression checks passed (including authenticated access guards).'
